import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { decrypt, encrypt } from "@/lib/encryption";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// POST untuk generate report
export async function POST(request: NextRequest) {
  try {
    const groqApiKey = process.env.GROQ_API_KEY;

    if (!groqApiKey) {
      console.error("GROQ_API_KEY not configured");
      return NextResponse.json(
        {
          success: false,
          error: "Groq API key not configured",
          details: "Please check environment variables",
        },
        { status: 500 }
      );
    }

    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized - Please login first",
        },
        { status: 401 }
      );
    }

    let requestBody;
    try {
      requestBody = await request.json();
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body",
        },
        { status: 400 }
      );
    }

    const { consultationId } = requestBody;

    if (!consultationId) {
      return NextResponse.json(
        {
          success: false,
          error: "consultationId is required",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    const consultation = await prisma.consultation.findFirst({
      where: {
        id: consultationId,
        createdBy: user.id,
      },
    });

    if (!consultation) {
      return NextResponse.json(
        {
          success: false,
          error: "Consultation not found or access denied",
        },
        { status: 404 }
      );
    }

    const decryptedConversation = consultation.conversation
      ? decrypt(consultation.conversation)
      : null;

    // Type guard untuk memastikan decryptedConversation adalah array
    if (
      !decryptedConversation ||
      !Array.isArray(decryptedConversation) ||
      decryptedConversation.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "No conversation found to generate report",
        },
        { status: 400 }
      );
    }

    const conversation = decryptedConversation as Array<{
      role: "assistant" | "user";
      content: string;
      timestamp: string;
    }>;

    const conversationText = conversation
      .map(
        (msg) =>
          `${msg.role === "user" ? "Pasien" : "AI Medis"}: ${msg.content}`
      )
      .join("\n");

    console.log(
      "Conversation sample:",
      conversationText.substring(0, 300) + "..."
    );

    // Prompt generate report
    const prompt = `Anda adalah dokter profesional yang ahli dalam menganalisis percakapan konsultasi medis. 
Buatlah laporan konsultasi medis berdasarkan percakapan antara pasien dan AI medis.

Format laporan harus dalam JSON dengan struktur berikut:
{
  "ringkasan_gejala": "ringkasan singkat gejala yang dialami pasien",
  "keluhan_utama": "keluhan utama pasien",
  "gejala_tambahan": ["daftar", "gejala", "tambahan"],
  "durasi_gejala": "berapa lama gejala dialami",
  "tingkat_keparahan": "ringan/sedang/berat",
  "faktor_pemicu": "faktor yang memicu atau memperburuk gejala",
  "riwayat_pengobatan": "pengobatan yang sudah dicoba",
  "rekomendasi": {
    "tindakan_segera": "apa yang harus dilakukan segera",
    "perawatan_rumah": "perawatan yang bisa dilakukan di rumah",
    "kapan_ke_dokter": "kapan harus konsultasi ke dokter",
    "spesialis_yang_disarankan": "spesialis yang disarankan jika ada"
  },
  "catatan_penting": "catatan penting atau hal yang perlu diperhatikan",
  "tingkat_urgensi": "rendah/sedang/tinggi - seberapa urgent kondisi ini"
}

PENTING: 
- Jawab HANYA dalam format JSON yang valid
- Jangan tambahkan penjelasan di luar JSON
- Gunakan bahasa Indonesia yang profesional
- Berdasarkan percakapan yang diberikan

Gejala awal yang dilaporkan: ${consultation.gejala}

Percakapan konsultasi:
${conversationText}

Buatlah laporan medis dalam format JSON sesuai instruksi.`;

    let reportContent;
    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "Anda adalah dokter profesional yang ahli dalam menganalisis percakapan konsultasi medis. Selalu berikan response dalam format JSON yang valid.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0.3,
        max_tokens: 2000,
        top_p: 1,
        stream: false,
      });

      reportContent = chatCompletion.choices[0]?.message?.content;
    } catch (groqError) {
      console.error("Groq API error:", groqError);
      return NextResponse.json(
        {
          success: false,
          error: "AI service temporarily unavailable",
          details:
            groqError instanceof Error ? groqError.message : "Unknown AI error",
        },
        { status: 503 }
      );
    }

    if (!reportContent) {
      return NextResponse.json(
        {
          success: false,
          error: "Empty response from Groq AI",
        },
        { status: 500 }
      );
    }

    let cleanedContent = reportContent.trim();

    if (cleanedContent.startsWith("```json")) {
      cleanedContent = cleanedContent
        .replace(/^```json\s*/, "")
        .replace(/\s*```$/, "");
    } else if (cleanedContent.startsWith("```")) {
      cleanedContent = cleanedContent
        .replace(/^```\s*/, "")
        .replace(/\s*```$/, "");
    }

    let report;
    try {
      report = JSON.parse(cleanedContent);
    } catch (parseError) {
      const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          console.log("Trying to parse extracted JSON...");
          report = JSON.parse(jsonMatch[0]);
        } catch (secondParseError) {
          console.error("Second parse error:", secondParseError);

          report = {
            ringkasan_gejala: consultation.gejala,
            keluhan_utama: consultation.gejala,
            gejala_tambahan: [],
            durasi_gejala: "Tidak diketahui",
            tingkat_keparahan: "sedang",
            faktor_pemicu: "Tidak diketahui",
            riwayat_pengobatan: "Tidak diketahui",
            rekomendasi: {
              tindakan_segera:
                "Konsultasi dengan dokter untuk evaluasi lebih lanjut",
              perawatan_rumah: "Istirahat yang cukup dan minum air putih",
              kapan_ke_dokter:
                "Jika gejala memburuk atau tidak membaik dalam 24 jam",
              spesialis_yang_disarankan: "Dokter umum",
            },
            tingkat_urgensi: "sedang",
            catatan_penting:
              "Laporan dibuat dengan data terbatas. Konsultasi dokter untuk evaluasi lengkap.",
          };
        }
      } else {
        report = {
          ringkasan_gejala: consultation.gejala,
          keluhan_utama: consultation.gejala,
          gejala_tambahan: [],
          durasi_gejala: "Tidak diketahui",
          tingkat_keparahan: "tidak diketahui",
          faktor_pemicu: "Tidak diketahui",
          riwayat_pengobatan: "Tidak diketahui",
          rekomendasi: {
            tindakan_segera: "Konsultasi dengan dokter untuk evaluasi",
            perawatan_rumah: "Istirahat dan monitor gejala",
            kapan_ke_dokter: "Segera untuk evaluasi lebih lanjut",
            spesialis_yang_disarankan: "Dokter umum",
          },
          tingkat_urgensi: "sedang",
          catatan_penting:
            "Laporan gagal dibuat otomatis. Segera konsultasi dokter.",
        };
      }
    }

    console.log("Final report keys:", Object.keys(report));

    const requiredFields = [
      "ringkasan_gejala",
      "keluhan_utama",
      "tingkat_keparahan",
      "rekomendasi",
    ];
    for (const field of requiredFields) {
      if (!report[field]) {
        console.warn(`Missing required field: ${field}, setting default value`);
        if (field === "rekomendasi") {
          report[field] = {
            tindakan_segera: "Konsultasi dengan dokter",
            perawatan_rumah: "Istirahat yang cukup",
            kapan_ke_dokter: "Jika gejala memburuk",
            spesialis_yang_disarankan: "Dokter umum",
          };
        } else {
          report[field] = "Tidak tersedia";
        }
      }
    }

    const finalReport = {
      ...report,
      metadata: {
        generated_at: new Date().toISOString(),
        consultation_id: consultationId,
        conversation_length: conversation.length,
        duration_minutes:
          Math.round(
            (new Date(
              conversation[conversation.length - 1]?.timestamp
            ).getTime() -
              new Date(conversation[0]?.timestamp).getTime()) /
              (1000 * 60)
          ) || 0,
        ai_model: "llama-3.1-8b-instant",
        generated_by: "Groq AI",
      },
    };

    const encryptedReport = encrypt(finalReport);

    // Save ke db dan update status ke COMPLETE
    try {
      const updatedConsultation = await prisma.consultation.update({
        where: { id: consultationId },
        data: {
          report: encryptedReport,
          status: "COMPLETE",
        },
      });

      return NextResponse.json({
        success: true,
        message: "Report generated successfully using Groq AI",
        data: {
          report: finalReport,
          consultationId: updatedConsultation.id,
          status: updatedConsultation.status,
        },
      });
    } catch (dbError) {
      console.error("Database save error:", dbError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to save report to database",
          details:
            dbError instanceof Error
              ? dbError.message
              : "Unknown database error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error type:", error?.constructor?.name);
    console.error(
      "Error message:",
      error instanceof Error ? error.message : error
    );
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack"
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unexpected server error",
        details: error instanceof Error ? error.stack : String(error),
      },
      { status: 500 }
    );
  }
}
