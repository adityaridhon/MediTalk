// Types untuk Consultation Update
export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ConsultationReport {
  summary: string;
  symptoms: string[];
  possibleConditions: string[];
  recommendations: string[];
  urgencyLevel: "low" | "medium" | "high";
  followUpRequired: boolean;
  generatedAt: string;
}

// Helper function untuk mengupdate konsultasi
export async function updateConsultation(
  consultationId: string,
  conversation: Message[],
  report?: ConsultationReport
) {
  try {
    const response = await fetch(`/api/consultation/${consultationId}/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        conversation,
        report,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to update consultation");
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error updating consultation:", error);
    throw error;
  }
}

// Helper function untuk generate report dari LLM menggunakan Google AI Studio
export async function generateMedicalReport(
  consultationId: string,
  gejala: string,
  conversation: Message[]
): Promise<ConsultationReport> {
  try {
    const response = await fetch(
      `/api/consultation/${consultationId}/generate-report`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gejala,
          conversation,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to generate medical report");
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error generating medical report:", error);

    // Fallback report jika API gagal
    return {
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
  }
}

// Example usage dalam medical-agent page:
/*
// Ketika konsultasi selesai (misalnya user klik "Selesai" atau setelah X pesan)
const handleEndConsultation = async () => {
  try {
    // Generate report dari LLM
    const report = await generateMedicalReport(gejala, messages);
    
    // Update konsultasi dengan conversation dan report
    await updateConsultation(consultationId, messages, report);
    
    // Redirect ke detail page
    router.push(`/consultation/detail/${consultationId}`);
  } catch (error) {
    console.error('Error ending consultation:', error);
    // Handle error
  }
};
*/
