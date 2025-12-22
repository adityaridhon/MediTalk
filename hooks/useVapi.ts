import { useState, useEffect, useRef, useCallback } from "react";
import Vapi from "@vapi-ai/web";
import { useRouter } from "next/navigation";

interface UseVapiProps {
  consultationId: string;
  gejala: string;
}

export interface TranscriptMessage {
  id: number;
  speaker: "assistant" | "user";
  content: string;
  timestamp: string;
  isVisible: boolean;
}

interface ConversationMessage {
  role: "assistant" | "user";
  content: string;
  timestamp: string;
}

export const useVapi = ({ consultationId, gejala }: UseVapiProps) => {
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Tidak Terhubung");
  const [transcriptMessages, setTranscriptMessages] = useState<
    TranscriptMessage[]
  >([]);
  const [conversationMessages, setConversationMessages] = useState<
    ConversationMessage[]
  >([]);
  const conversationMessagesRef = useRef<ConversationMessage[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [assistantSpeaking, setAssistantSpeaking] = useState(false);
  const [isCreatingAssistant, setIsCreatingAssistant] = useState(false);
  const [callHasEnded, setCallHasEnded] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const router = useRouter();

  // Initialize Vapi
  useEffect(() => {
    const initVapi = async () => {
      try {
        if (!window.RTCPeerConnection) {
          console.error("WebRTC not supported in this browser");
          setConnectionStatus("Error - Browser tidak mendukung WebRTC");
          return;
        }

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          console.error("getUserMedia not supported");
          setConnectionStatus("Error - Akses mikropon tidak didukung");
          return;
        }

        const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_API_KEY!;
        const vapiInstance = new Vapi(publicKey);
        setVapi(vapiInstance);

        vapiInstance.on("call-start", () => {
          setIsCallActive(true);
          setCallHasEnded(false);
          setConnectionStatus("Terhubung - Voice Call Aktif");
        });

        vapiInstance.on("call-end", async () => {
          setIsCallActive(false);
          setAssistantSpeaking(false);
          setCallHasEnded(true);
          setIsGeneratingReport(true);
          setConnectionStatus(
            "Tidak Terhubung - Menyimpan hasil konsultasi..."
          );
          await saveConsultationData();
        });

        vapiInstance.on("message", (message: any) => {
          if (message.type === "transcript" && message.transcript) {
            setLastActivity(Date.now());

            const timestamp = new Date().toISOString();

            const speaker: "assistant" | "user" =
              message.role === "assistant" ? "assistant" : "user";

            const newMessage: TranscriptMessage = {
              id: Date.now() + Math.random(),
              speaker,
              content: message.transcript || "",
              timestamp,
              isVisible: true,
            };

            setTranscriptMessages((prev) => [...prev, newMessage]);

            const conversationMessage: ConversationMessage = {
              role: speaker,
              content: message.transcript || "",
              timestamp,
            };

            setConversationMessages((prev) => {
              const updated = [...prev, conversationMessage];
              conversationMessagesRef.current = updated;
              return updated;
            });

            if (speaker === "assistant") {
              setAssistantSpeaking(true);
              setTimeout(() => setAssistantSpeaking(false), 3000);
            }
          }
        });

        vapiInstance.on("error", (error: any) => {
          console.error("Vapi error:", error);
          let errorMessage = "Connection failed";

          if (error && typeof error === "object" && "message" in error) {
            errorMessage = error.message as string;
          } else if (typeof error === "string") {
            errorMessage = error;
          }

          if (errorMessage.includes("timeout")) {
            errorMessage = "Connection timeout - Coba lagi";
          } else if (
            errorMessage.includes("permission") ||
            errorMessage.includes("NotAllowedError")
          ) {
            errorMessage = "Akses mikropon ditolak";
          } else if (errorMessage.includes("network")) {
            errorMessage = "Masalah jaringan";
          }

          setConnectionStatus(`Error - ${errorMessage}`);
          setIsCallActive(false);
          setAssistantSpeaking(false);
          setIsCreatingAssistant(false);
        });

        setConnectionStatus("Siap untuk memulai konsultasi");
      } catch (error) {
        console.error("Error initializing Vapi:", error);
        setConnectionStatus("Error - Gagal inisialisasi Vapi");
      }
    };

    if (typeof window !== "undefined") {
      initVapi();
    }

    return () => {
      if (vapi) {
        try {
          vapi.stop();
        } catch (error) {
          console.error("Error stopping Vapi:", error);
        }
      }
    };
  }, []);

  const saveConsultationData = useCallback(async () => {
    try {
      const currentConversation = conversationMessagesRef.current;

      if (currentConversation.length > 0) {
        setConnectionStatus("Menyimpan percakapan...");

        const saveResponse = await fetch("/api/consultation/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            consultationId,
            conversation: currentConversation,
          }),
        });

        const saveResult = await saveResponse.json();

        if (!saveResponse.ok) {
          console.error("Failed to save conversation:", saveResult);
          throw new Error(saveResult.error || "Gagal menyimpan percakapan");
        }

        setConnectionStatus("Membuat laporan konsultasi...");
        setIsGeneratingReport(true);

        try {
          const reportResponse = await fetch(
            "/api/consultation/generate-report",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ consultationId }),
            }
          );

          let reportResult;
          try {
            const responseText = await reportResponse.text();

            if (responseText) {
              reportResult = JSON.parse(responseText);
            } else {
              throw new Error("Empty response from server");
            }
          } catch (parseError) {
            console.error("Failed to parse response:", parseError);
            throw new Error("Invalid response format from server");
          }

          if (!reportResponse.ok) {
            console.error("Failed to generate report:", reportResult);

            const errorMsg =
              reportResult?.error || reportResult?.details || "Unknown error";
            setConnectionStatus(
              `Konsultasi selesai - Laporan gagal: ${errorMsg}`
            );

            setTimeout(() => {
              router.push(`/consultation`);
            }, 5000);
          } else {
            console.log("Report generated successfully");
            setIsGeneratingReport(false);

            setTimeout(() => {
              router.push(`/consultation`);
            }, 3000);
          }
        } catch (reportError: unknown) {
          console.error("Report generation error:", reportError);
          setIsGeneratingReport(false);

          const errorMessage =
            reportError instanceof Error
              ? reportError.message
              : typeof reportError === "string"
              ? reportError
              : "Unknown error occurred";

          setConnectionStatus(`Konsultasi selesai - Error: ${errorMessage}`);

          setTimeout(() => {
            router.push(`/consultation`);
          }, 4000);
        }
      } else {
        setConnectionStatus("Konsultasi berakhir - Tidak ada percakapan");
        setIsGeneratingReport(false);
        setTimeout(() => {
          router.push(`/consultation`);
        }, 2000);
      }
    } catch (error: unknown) {
      console.error("Error in saveConsultationData:", error);
      setIsGeneratingReport(false);

      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === "string"
          ? error
          : "Unknown error occurred";

      setConnectionStatus(`Error: ${errorMessage}`);

      setTimeout(() => {
        router.push(`/consultation`);
      }, 4000);
    }
  }, [consultationId, router]);

  const requestMicrophoneAccess = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (error) {
      console.error("Microphone access denied:", error);
      alert("Silakan izinkan akses mikropon untuk memulai konsultasi suara.");
      return false;
    }
  }, []);

  const startConsultation = useCallback(async () => {
    if (!vapi) {
      alert("Sistem belum siap. Silakan refresh halaman dan coba lagi.");
      return;
    }

    if (!gejala || gejala.trim() === "") {
      alert("Gejala belum diisi. Silakan isi gejala terlebih dahulu.");
      return;
    }

    try {
      setIsCreatingAssistant(true);
      setConnectionStatus("Meminta akses mikropon...");

      const micPermission = await requestMicrophoneAccess();
      if (!micPermission) {
        setIsCreatingAssistant(false);
        setConnectionStatus("Error - Akses mikropon diperlukan");
        return;
      }

      setConnectionStatus("Membuat assistant medis untuk gejala Anda...");

      const response = await fetch("/api/medical-agent/call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gejala: gejala,
          phone: "+62000000000",
        }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await response.text();
        console.error("Non-JSON response:", textResponse);
        throw new Error("Server error - silakan coba lagi");
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Gagal membuat assistant medis");
      }

      setConnectionStatus("Menghubungkan ke assistant medis...");

      await vapi.start(result.data.assistantId);

      setIsCreatingAssistant(false);
    } catch (error) {
      console.error("Error starting consultation:", error);

      let errorMessage = "Gagal memulai konsultasi";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      setConnectionStatus(`Error - ${errorMessage}`);
      setIsCreatingAssistant(false);
      alert(`Error: ${errorMessage}`);
    }
  }, [vapi, gejala, requestMicrophoneAccess]);

  const stopConsultation = useCallback(async () => {
    try {
      if (vapi && isCallActive) {
        vapi.stop();
      }
      setIsCallActive(false);
      setAssistantSpeaking(false);
      setConnectionStatus("Tidak Terhubung - Menyimpan hasil konsultasi...");

      await saveConsultationData();
    } catch (error) {
      console.error("Error stopping consultation:", error);
      setConnectionStatus("Konsultasi dihentikan - Gagal menyimpan");
      setTimeout(() => {
        router.push(`/consultation`);
      }, 3000);
    }
  }, [vapi, isCallActive, saveConsultationData, router]);

  const toggleMute = useCallback(() => {
    if (vapi && isCallActive) {
      const newMutedState = !isMuted;
      vapi.setMuted(newMutedState);
      setIsMuted(newMutedState);
    }
  }, [vapi, isCallActive, isMuted]);

  return {
    vapi,
    isCallActive,
    connectionStatus,
    transcriptMessages,
    conversationMessages,
    isMuted,
    lastActivity,
    assistantSpeaking,
    isCreatingAssistant,
    callHasEnded,
    isGeneratingReport,
    startConsultation,
    stopConsultation,
    toggleMute,
  };
};
