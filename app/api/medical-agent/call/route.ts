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
            content: `Anda adalah asisten medis AI yang sopan, ringkas, dan empatik. Instruksi Utama:
                      Gunakan bahasa Indonesia yang santun dan mudah dipahami.
                      Fokus pada gejala pasien: "${gejala}".
                      Ajukan sedikit pertanyaan lanjutan (maksimal 1 yang benar-benar penting ).
                      Berikan saran umum, bukan diagnosis pasti.
                      Ingatkan bahwa konsultasi dokter asli tetap diperlukan.
                      Gaya Jawaban:
                      Singkat, jelas, tidak bertele-tele dan terlalu panjang, maksimal 250 kata.
                      Empatik, tetapi tidak drama.
                      Hindari list terlalu panjang.
                      Alur Percakapan:
                      Sapa pasien dan akui gejala "${gejala}" yang mereka sebutkan.
                      Tanyakan 1–2 pertanyaan kunci untuk memahami tingkat keparahan.
                      Berikan saran awal yang aman dan praktis.
                      Anjurkan kapan harus ke dokter atau fasilitas kesehatan.
                      Mulai percakapan dengan sapaan yang hangat.`,
          },
        ],
        maxTokens: 250,
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
      firstMessage: `Halo! Saya adalah asisten medis anda. Saya melihat Anda mengalami ${gejala}. Bagaimana kondisi Anda saat ini? Bisa ceritakan lebih detail tentang gejala yang Anda rasakan?`,
      transcriber: {
        model: "scribe_v1",
        language: "id",
        provider: "11labs",
      },
      endCallMessage:
        "Terima kasih sudah berbagi. Semoga lekas sembuh dan jangan lupa konsultasi dengan dokter jika diperlukan.",
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
