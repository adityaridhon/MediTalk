"use client";

import React, { useEffect, useState, useRef } from "react";
import Vapi from "@vapi-ai/web";
import { TiArrowLeft } from "react-icons/ti";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FaUserDoctor,
  FaHeadset,
  FaStop,
  FaMicrophone,
  FaMicrophoneSlash,
} from "react-icons/fa6";
import { IoMdCall } from "react-icons/io";
import { ImConnection } from "react-icons/im";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import {
  updateConsultation,
  generateMedicalReport,
  Message,
} from "@/lib/consultation-helpers";

interface Consultation {
  id: string;
  gejala: string;
  conversation: any[];
  report: any;
  createdBy: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

const MedicalAgentPage = () => {
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConsultationStarted, setIsConsultationStarted] = useState(false);
  const [transcriptMessages, setTranscriptMessages] = useState<
    Array<{
      id: number;
      speaker: "assistant" | "user";
      content: string;
      timestamp: string;
      isVisible: boolean;
    }>
  >([]);
  const [conversationMessages, setConversationMessages] = useState<Message[]>(
    []
  );
  const conversationMessagesRef = useRef<Message[]>([]);
  const [isCallActive, setIsCallActive] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Tidak Terhubung");
  const [timer, setTimer] = useState("00:00");
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const params = useParams();
  const consultationId = params.id as string;
  const { data: session, status } = useSession();
  const router = useRouter();

  // Initialize Vapi
  useEffect(() => {
    const initVapi = async () => {
      try {
        // Check WebRTC support first
        if (!window.RTCPeerConnection) {
          console.error("WebRTC not supported in this browser");
          setConnectionStatus("Error - Browser tidak mendukung WebRTC");
          alert(
            "Browser Anda tidak mendukung WebRTC. Silakan gunakan Chrome, Firefox, atau Safari terbaru."
          );
          return;
        }

        console.log("Environment check passed, initializing Vapi...");

        // Use hardcoded API key directly (sesuai dokumentasi)
        const apiKey = "b2c71cbb-957c-4d3c-a48a-28f38ffe3c4a";
        console.log(
          "Initializing Vapi with API key:",
          apiKey.substring(0, 8) + "..."
        );

        const vapiInstance = new Vapi(apiKey);
        setVapi(vapiInstance);
        console.log("Vapi instance created successfully");

        // Event listeners (sesuai dokumentasi)
        vapiInstance.on("call-start", () => {
          console.log("Call started");
          setIsCallActive(true);
          setConnectionStatus("Terhubung - Voice Call Aktif");
        });

        vapiInstance.on("call-end", async () => {
          console.log("Call ended");
          setIsCallActive(false);
          setConnectionStatus(
            "Tidak Terhubung - Menyimpan hasil konsultasi..."
          );

          // Save conversation and generate report when call ends
          try {
            const currentConversation = conversationMessagesRef.current;
            if (currentConversation.length > 0) {
              console.log("Saving conversation and generating report...");

              // Generate medical report
              const report = await generateMedicalReport(
                consultationId,
                consultation?.gejala || "",
                currentConversation
              );

              // Update consultation with conversation and report
              await updateConsultation(
                consultationId,
                currentConversation,
                report
              );

              console.log("Consultation saved successfully");
              setConnectionStatus("Konsultasi selesai - Hasil tersimpan");

              // Redirect to detail page to view the report
              setTimeout(() => {
                router.push(`/consultation/detail/${consultationId}`);
              }, 2000);
            } else {
              setConnectionStatus("Konsultasi berakhir - Tidak ada percakapan");
            }
          } catch (error) {
            console.error("Error saving consultation:", error);
            setConnectionStatus("Konsultasi berakhir - Gagal menyimpan");
          }
        });

        vapiInstance.on("message", (message) => {
          console.log("Vapi message received:", message);

          if (message.type === "transcript") {
            console.log(`${message.role}: ${message.transcript}`);

            const timestamp = new Date().toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            });

            const newMessage = {
              id: Date.now(),
              speaker: message.role as "assistant" | "user",
              content: message.transcript,
              timestamp,
              isVisible: true,
            };

            setTranscriptMessages((prev) => [...prev, newMessage]);

            // Also save to conversation messages for database storage
            const conversationMessage: Message = {
              role: message.role === "assistant" ? "assistant" : "user",
              content: message.transcript,
              timestamp: new Date().toISOString(),
            };

            setConversationMessages((prev) => {
              const updated = [...prev, conversationMessage];
              conversationMessagesRef.current = updated;
              return updated;
            });
          }
        });

        vapiInstance.on("error", (error) => {
          console.error("Vapi error:", error);

          // Simple error handling
          let errorMessage = "Connection failed";
          if (error) {
            errorMessage = String(error);
          }

          setConnectionStatus(`Error - ${errorMessage}`);
          console.log("Setting error status:", errorMessage);
        });

        console.log("Vapi initialized successfully");
        setConnectionStatus("Vapi Siap - Klik untuk memulai");
      } catch (error) {
        console.error("Error initializing Vapi:", error);
        setConnectionStatus("Error - Gagal inisialisasi Vapi");

        if (error && error.toString().includes("WebRTC")) {
          alert(
            "Browser Anda tidak mendukung WebRTC. Silakan gunakan Chrome, Firefox, atau Safari terbaru."
          );
        }
      }
    };

    // Only initialize if running in browser and WebRTC is supported
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

  // Fetch consultation data
  useEffect(() => {
    const fetchConsultation = async () => {
      try {
        const response = await fetch(`/api/consultation/${consultationId}`);
        if (response.ok) {
          const result = await response.json();
          setConsultation(result.data);
        } else {
          console.error("Failed to fetch consultation");
        }
      } catch (error) {
        console.error("Error fetching consultation:", error);
      } finally {
        setLoading(false);
      }
    };

    if (consultationId) {
      fetchConsultation();
    }
  }, [consultationId]);

  // Auto scroll to latest message
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcriptMessages]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isConsultationStarted) {
      let seconds = 0;
      interval = setInterval(() => {
        seconds++;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        setTimer(
          `${mins.toString().padStart(2, "0")}:${secs
            .toString()
            .padStart(2, "0")}`
        );
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isConsultationStarted]);

  const startConsultation = async () => {
    if (!vapi) {
      alert("Vapi belum siap. Silakan refresh halaman dan coba lagi.");
      return;
    }

    try {
      setIsConsultationStarted(true);
      setConnectionStatus("Menghubungkan...");
      setTranscriptMessages([]);

      console.log("Requesting microphone permission...");

      // Start voice conversation (sesuai dokumentasi)
      const assistantId = "a48642b1-f25e-4cda-8e10-89fed5366113";
      console.log("Starting Vapi call with assistant ID:", assistantId);

      vapi.start(assistantId);
      console.log("Vapi call started successfully");
    } catch (error) {
      console.error("Error starting Vapi call:", error);
      setConnectionStatus("Gagal terhubung - Coba lagi");
      alert("Gagal memulai konsultasi. Coba lagi.");
      setIsConsultationStarted(false);
    }
  };

  const stopConsultation = async () => {
    if (vapi && isCallActive) {
      vapi.stop();
    }
    setIsCallActive(false);
    setConnectionStatus("Tidak Terhubung - Menyimpan hasil konsultasi...");

    // Save conversation and generate report
    try {
      if (conversationMessages.length > 0) {
        console.log("Saving conversation and generating report...");

        // Generate medical report
        const report = await generateMedicalReport(
          consultationId,
          consultation?.gejala || "",
          conversationMessages
        );

        // Update consultation with conversation and report
        await updateConsultation(consultationId, conversationMessages, report);

        console.log("Consultation saved successfully");
        setConnectionStatus("Konsultasi selesai - Hasil tersimpan");

        // Redirect to detail page to view the report
        router.push(`/consultation/detail/${consultationId}`);
      } else {
        setConnectionStatus("Konsultasi dihentikan - Tidak ada percakapan");
      }
    } catch (error) {
      console.error("Error saving consultation:", error);
      setConnectionStatus("Konsultasi dihentikan - Gagal menyimpan");
    }
  };

  const toggleMute = () => {
    if (vapi && isCallActive) {
      if (isMuted) {
        vapi.setMuted(false);
      } else {
        vapi.setMuted(true);
      }
      setIsMuted(!isMuted);
    }
  };

  if (loading || status === "loading") {
    return (
      <section className="md:mx-auto mx-10 my-8 md:px-4 bg-white rounded-2xl shadow-md max-w-7xl min-h-[92vh]">
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </section>
    );
  }

  if (!consultation) {
    return (
      <section className="md:mx-auto mx-10 my-8 md:px-4 bg-white rounded-2xl shadow-md max-w-7xl min-h-[92vh]">
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-600 mb-2">
              Konsultasi tidak ditemukan
            </h2>
            <Link href="/consultation">
              <Button>Kembali ke Konsultasi</Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="md:mx-auto mx-10 my-8 md:px-4 bg-white rounded-2xl shadow-md max-w-7xl min-h-[92vh]">
      {/* Navigation */}
      <div className="flex justify-between items-center gap-4 p-5 border-b border-b-gray-200 mb-2">
        <Link href={"/consultation"}>
          <Button variant={"ghost"}>
            <TiArrowLeft className="size-5" /> Kembali
          </Button>
        </Link>
        <div className="text-center">
          <h1 className="font-bold text-2xl text-primary">Agen AI</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FaUserDoctor /> Gejala yang Anda Alami
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
              <p className="text-gray-800 leading-relaxed">
                {consultation.gejala}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section konsul */}
        <Card>
          <CardHeader>
            <div className="flex justify-between px-3">
              <div className="flex items-center gap-3 border py-1 px-3 rounded-lg text-gray-500">
                <FaHeadset />
                <h2 className="text-gray-500 text-sm">{timer}</h2>
              </div>
              <div
                className={`flex items-center gap-3 border py-1 px-3 rounded-lg ${
                  (connectionStatus.includes("Terhubung") &&
                    !connectionStatus.includes("Tidak Terhubung")) ||
                  connectionStatus.includes("Berlangsung")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                <ImConnection />
                <h2 className="text-sm">{connectionStatus}</h2>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!isConsultationStarted ? (
              <div className="flex flex-col md:flex-row justify-center mx-auto space-x-6 gap-10">
                <div className="dokter border rounded-xl p-4 shadow-sm md:w-[28rem] w-[20rem]">
                  <div className="text-center py-8">
                    <div className="img flex justify-center rounded-full">
                      <Image
                        src={"/assets/dokter/dr.1.png"}
                        alt="Ini dokter"
                        width={130}
                        height={130}
                        className="object-cover rounded-full"
                      />
                    </div>
                    <h1 className="font-bold text-2xl mt-3">Agen AI Medis</h1>
                  </div>
                </div>
                <div className="user border rounded-xl p-4 shadow-sm md:w-[28rem] w-[20rem]">
                  <div className="text-center py-8">
                    <div className="img flex justify-center rounded-full">
                      {session?.user?.image ? (
                        <Image
                          src={session.user.image}
                          alt={session.user.name || "User"}
                          width={130}
                          height={130}
                          className="object-cover rounded-full"
                        />
                      ) : (
                        <div className="w-32 h-32 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-gray-500 text-4xl">
                            {session?.user?.name?.charAt(0).toUpperCase() ||
                              "U"}
                          </span>
                        </div>
                      )}
                    </div>
                    <h1 className="font-bold text-2xl mt-3">
                      {session?.user?.name || "Nama User"}
                    </h1>
                  </div>
                </div>
              </div>
            ) : (
              // Layout konsul
              <div className="consultation-layout">
                {/* Header */}
                <div className="flex justify-center items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Konsultasi Berlangsung
                  </h3>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="dokter-section flex-1 border rounded-xl p-4 shadow-sm">
                    <div className="text-center py-6 border-b mb-4">
                      <div className="img flex justify-center rounded-full">
                        <Image
                          src={"/assets/dokter/dr.1.png"}
                          alt="Dr AI"
                          width={100}
                          height={100}
                          className="object-cover rounded-full"
                        />
                      </div>
                      <h1 className="font-bold text-xl mt-3">Agen AI Medis</h1>
                      <p className="mt-1 text-gray-600 text-sm">
                        Asisten Medis AI
                      </p>
                    </div>

                    {/* AI Assistant Messages */}
                    <div className="dokter-messages space-y-3 max-h-80 overflow-y-auto">
                      {transcriptMessages
                        .filter((msg) => msg.speaker === "assistant")
                        .slice(-3)
                        .map((message) => (
                          <div
                            key={message.id}
                            className="animate-fade-in bg-green-50 border-l-4 border-green-500 p-3 rounded-r-lg"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs text-green-600 font-medium">
                                {message.timestamp}
                              </span>
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed">
                              {message.content}
                            </p>
                          </div>
                        ))}

                      {isCallActive && (
                        <div className="flex items-center gap-2 text-green-600 text-sm p-2">
                          <div
                            className={`animate-pulse ${
                              isCallActive ? "text-green-600" : "text-gray-400"
                            }`}
                          >
                            ●
                          </div>
                          <span>
                            AI Medis:{" "}
                            {isCallActive ? "Mendengarkan..." : "Offline"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="user-section flex-1 border rounded-xl p-4 shadow-sm">
                    {/* User Profile */}
                    <div className="text-center py-6 border-b mb-4">
                      <div className="img flex justify-center rounded-full">
                        {session?.user?.image ? (
                          <Image
                            src={session.user.image}
                            alt={session.user.name || "User"}
                            width={100}
                            height={100}
                            className="object-cover rounded-full"
                          />
                        ) : (
                          <div className="w-25 h-25 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-gray-500 text-3xl">
                              {session?.user?.name?.charAt(0).toUpperCase() ||
                                "U"}
                            </span>
                          </div>
                        )}
                      </div>
                      <h1 className="font-bold text-xl mt-3">
                        {session?.user?.name || "Pasien"}
                      </h1>
                      <p className="mt-1 text-gray-600 text-sm">
                        {consultation.gejala
                          ? `Gejala: ${consultation.gejala}`
                          : "Pasien"}
                      </p>
                    </div>

                    {/* User Messages */}
                    <div className="user-messages space-y-3 max-h-80 overflow-y-auto">
                      {transcriptMessages
                        .filter((msg) => msg.speaker === "user")
                        .slice(-3)
                        .map((message) => (
                          <div
                            key={message.id}
                            className="animate-fade-in bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-lg"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs text-blue-600 font-medium">
                                {message.timestamp}
                              </span>
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed">
                              {message.content}
                            </p>
                          </div>
                        ))}

                      {isCallActive && (
                        <div className="flex items-center gap-2 text-blue-600 text-sm p-2">
                          <div
                            className={`animate-pulse ${
                              isCallActive ? "text-blue-600" : "text-gray-400"
                            }`}
                          >
                            ●
                          </div>
                          <span>
                            {session?.user?.name || "Anda"}:{" "}
                            {isMuted ? "Muted" : "Berbicara..."}
                          </span>
                        </div>
                      )}
                    </div>
                    <div ref={transcriptEndRef} />
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          {/* Tombol Control */}
          <div className="flex justify-center pb-4">
            {!isConsultationStarted ? (
              <Button
                onClick={startConsultation}
                className="mx-auto"
                disabled={!vapi}
              >
                <IoMdCall className="mr-2" />{" "}
                {vapi ? "Mulai Konsultasi Voice" : "Loading Vapi..."}
              </Button>
            ) : (
              <div className="flex gap-2">
                {isCallActive ? (
                  <>
                    <Button
                      onClick={toggleMute}
                      variant={isMuted ? "destructive" : "outline"}
                      className="mx-auto"
                    >
                      {isMuted ? "🔇 Unmute" : "🔊 Mute"}
                    </Button>
                    <Button
                      onClick={stopConsultation}
                      variant="destructive"
                      className="mx-auto"
                    >
                      <FaStop className="mr-2" /> Akhiri Call
                    </Button>
                  </>
                ) : (
                  <Button onClick={startConsultation} className="mx-auto">
                    <IoMdCall className="mr-2" /> Mulai Ulang
                  </Button>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>
    </section>
  );
};

export default MedicalAgentPage;
