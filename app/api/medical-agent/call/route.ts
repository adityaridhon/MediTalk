import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { gejala, phone } = await request.json();

    const vapiApiKey = process.env.VAPI_API_KEY!;

    const assistantConfig = {
      model: {
        provider: "groq",
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: `Anda adalah asisten medis AI MediTalk. Aturan WAJIB:

BATASAN TOPIK:
- HANYA jawab pertanyaan medis/kesehatan
- Jika ditanya di luar medis (politik, hiburan, matematika, dll), jawab: "Maaf, saya hanya bisa membantu konsultasi kesehatan. Ada keluhan medis yang bisa saya bantu?"
- Jika dipaksa bertanya non-medis, ulangi pesan yang sama dengan tegas

BATASAN JAWABAN:
- Maksimal 100 kata per respon
- 1-2 kalimat saja jika bisa
- Tanya maksimal 1 pertanyaan lanjutan yang krusial
- Langsung to the point, tidak bertele-tele

FOKUS GEJALA: "${gejala}"

ALUR SINGKAT:
1. Akui gejala pasien
2. Tanya 1 hal penting (jika perlu)
3. Beri saran praktis 2-3 poin
4. Sarankan ke dokter jika serius

GAYA:
- Bahasa Indonesia santun tapi ringkas
- Empatik tanpa drama
- Hindari list panjang
- Tidak mendiagnosis pasti

Mulai dengan sapaan hangat dan singkat.`,
          },
        ],
        maxTokens: 150,
        temperature: 0.7,
      },
      functions: [
        {
          name: "endCall",
          description: "Mengakhiri panggilan ketika percakapan sudah selesai",
          parameters: {
            type: "object",
            properties: {
              reason: {
                type: "string",
                description: "Alasan mengakhiri panggilan",
              },
              finalMessage: {
                type: "string",
                description: "Pesan terakhir sebelum mengakhiri panggilan",
              },
            },
            required: ["reason"],
          },
        },
      ],
      voice: {
        model: "eleven_turbo_v2_5",
        provider: "11labs",
        voiceId: "SCDJ1Fy4al0KS1awS6H9",
      },
      firstMessage: `Halo! Saya asisten medis MediTalk. Anda mengalami ${gejala}. Bisa ceritakan kondisinya sekarang?`,
      transcriber: {
        model: "scribe_v1",
        language: "id",
        provider: "11labs",
      },
      endCallMessage:
        "Terima kasih. Semoga lekas sembuh dan segera konsultasi dokter jika perlu.",
      recordingEnabled: true,
      silenceTimeoutSeconds: 420,
      maxDurationSeconds: 600,
    };

    const vapiResponse = await fetch("https://api.vapi.ai/assistant", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${vapiApiKey}`,
      },
      body: JSON.stringify(assistantConfig),
    });

    if (!vapiResponse.ok) {
      const errorText = await vapiResponse.text();
      console.error("Vapi API Error:", errorText);
      throw new Error(`Vapi API error: ${vapiResponse.status}`);
    }

    const assistant = await vapiResponse.json();
    console.log("Assistant created:", assistant);

    return NextResponse.json({
      success: true,
      data: {
        assistantId: assistant.id,
        assistant: assistant,
        message: "Medical assistant created successfully",
      },
    });
  } catch (error) {
    console.error("Error creating medical agent:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create medical agent",
      },
      { status: 500 }
    );
  }
}
