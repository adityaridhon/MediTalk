import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ConsultationReport {
  summary: string;
  symptoms: string[];
  possibleConditions: string[];
  recommendations: string[];
  urgencyLevel: "low" | "medium" | "high";
  followUpRequired: boolean;
  generatedAt: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: consultationId } = await params;
    const body = await request.json();
    const {
      gejala,
      conversation,
    }: { gejala: string; conversation: Message[] } = body;

    const ai = new GoogleGenAI({
      apiKey: process.env.GOOGLE_AI_API_KEY || "",
    });

    const conversationText = conversation
      .map((msg) => `${msg.role === "user" ? "Pasien" : "AI"}: ${msg.content}`)
      .join("\n");

    const prompt = `
Sebagai AI dokter profesional, analisis gejala dan percakapan konsultasi berikut untuk membuat laporan medis yang komprehensif:

GEJALA AWAL:
${gejala}

PERCAKAPAN KONSULTASI:
${conversationText}

Berikan analisis dalam format JSON yang tepat dengan struktur berikut:
{
  "summary": "Ringkasan kondisi pasien berdasarkan analisis lengkap",
  "symptoms": ["daftar gejala yang teridentifikasi"],
  "possibleConditions": ["kemungkinan diagnosis atau kondisi medis"],
  "recommendations": ["rekomendasi tindakan atau pengobatan"],
  "urgencyLevel": "low/medium/high",
  "followUpRequired": true/false
}

Pastikan analisis berdasarkan informasi medis yang akurat dan responsif terhadap gejala yang disebutkan. Berikan hanya respons JSON tanpa teks tambahan.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const responseText = response.text?.trim() || "";

    // Parse JSON response
    let parsedReport;
    try {
      // Remove potential markdown code blocks
      const cleanedResponse = responseText
        .replace(/```json\n?|```\n?/g, "")
        .trim();
      parsedReport = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      console.log("Raw AI response:", responseText);

      // Fallback dengan data default jika parsing gagal
      parsedReport = {
        summary:
          "Laporan tidak dapat dihasilkan otomatis. Silakan konsultasi dengan dokter untuk evaluasi lebih lanjut.",
        symptoms: ["Gejala memerlukan evaluasi medis lebih lanjut"],
        possibleConditions: ["Memerlukan pemeriksaan medis profesional"],
        recommendations: [
          "Konsultasi dengan dokter",
          "Pantau gejala",
          "Cari pertolongan medis jika gejala memburuk",
        ],
        urgencyLevel: "medium",
        followUpRequired: true,
      };
    }

    const finalReport: ConsultationReport = {
      ...parsedReport,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: finalReport,
    });
  } catch (error) {
    console.error("Error generating medical report:", error);

    // Fallback report jika AI gagal
    const fallbackReport: ConsultationReport = {
      summary:
        "Laporan medis tidak dapat dihasilkan saat ini. Silakan konsultasi dengan dokter untuk evaluasi gejala Anda.",
      symptoms: ["Evaluasi gejala diperlukan"],
      possibleConditions: ["Memerlukan pemeriksaan medis"],
      recommendations: [
        "Konsultasi dengan dokter terdekat",
        "Pantau perkembangan gejala",
        "Jaga istirahat dan hidrasi",
        "Cari pertolongan medis jika kondisi memburuk",
      ],
      urgencyLevel: "medium",
      followUpRequired: true,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: fallbackReport,
    });
  }
}
