"use client";

import React, { useEffect, useState, useRef } from "react";
import { TiArrowLeft } from "react-icons/ti";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaUserDoctor, FaHeadset, FaMicrophone, FaStop } from "react-icons/fa6";
import { IoMdCall, IoMdSend } from "react-icons/io";
import { ImConnection } from "react-icons/im";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";

const MedicalAgentPage = () => {
  const [gejala, setGejala] = useState("");
  const [isConsultationStarted, setIsConsultationStarted] = useState(false);
  const [transcriptMessages, setTranscriptMessages] = useState<
    Array<{
      id: number;
      speaker: "Dr. AI Assistant" | string;
      content: string;
      timestamp: string;
      isVisible: boolean;
    }>
  >([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isConversationActive, setIsConversationActive] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Tidak Terhubung");
  const [timer, setTimer] = useState("00:00");
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  useEffect(() => {
    const gejalaDariURL = searchParams.get("gejala");
    if (gejalaDariURL) {
      setGejala(decodeURIComponent(gejalaDariURL));
    }
  }, [searchParams]);

  // Transkrip percakapan untuk simulasi
  const conversationScript = [
    {
      id: 1,
      speaker: "Dr. AI Assistant",
      content: `Halo ${
        session?.user?.name || "Pasien"
      }, selamat pagi. Saya Dr. AI, asisten medis yang akan membantu konsultasi Anda hari ini.`,
      timestamp: "10:00",
      isVisible: false,
    },
    {
      id: 2,
      speaker: session?.user?.name || "Pasien",
      content:
        "Pagi dok, terima kasih. Saya memang sedang ada keluhan kesehatan.",
      timestamp: "10:00",
      isVisible: false,
    },
    {
      id: 3,
      speaker: "Dr. AI Assistant",
      content: `Baik, saya sudah melihat gejala yang Anda laporkan: "${
        gejala || "gejala yang disampaikan"
      }". Bisakah Anda ceritakan lebih detail kapan gejala ini mulai muncul?`,
      timestamp: "10:01",
      isVisible: false,
    },
    {
      id: 4,
      speaker: session?.user?.name || "Pasien",
      content:
        "Gejala ini sudah saya rasakan sekitar 3-4 hari yang lalu dok. Awalnya ringan, tapi sekarang semakin mengganggu aktivitas.",
      timestamp: "10:01",
      isVisible: false,
    },
    {
      id: 5,
      speaker: "Dr. AI Assistant",
      content:
        "Saya mengerti. Apakah ada gejala tambahan yang menyertai? Misalnya demam, mual, atau gejala lainnya?",
      timestamp: "10:02",
      isVisible: false,
    },
    {
      id: 6,
      speaker: session?.user?.name || "Pasien",
      content:
        "Iya dok, saya juga merasa lemas dan nafsu makan menurun. Terkadang juga sedikit pusing.",
      timestamp: "10:02",
      isVisible: false,
    },
    {
      id: 7,
      speaker: "Dr. AI Assistant",
      content:
        "Terima kasih informasinya. Berdasarkan gejala yang Anda sampaikan, saya akan memberikan beberapa saran awal...",
      timestamp: "10:03",
      isVisible: false,
    },
    {
      id: 8,
      speaker: session?.user?.name || "Pasien",
      content: "Baik dok, saya mendengarkan.",
      timestamp: "10:03",
      isVisible: false,
    },
    {
      id: 9,
      speaker: "Dr. AI Assistant",
      content:
        "Pertama, pastikan Anda cukup istirahat dan minum air putih yang cukup. Kedua, hindari makanan yang terlalu pedas atau berlemak.",
      timestamp: "10:04",
      isVisible: false,
    },
    {
      id: 10,
      speaker: session?.user?.name || "Pasien",
      content: "Apakah perlu minum obat dok? Atau ada pantangan khusus?",
      timestamp: "10:04",
      isVisible: false,
    },
    {
      id: 11,
      speaker: "Dr. AI Assistant",
      content:
        "Untuk sementara, Anda bisa minum obat pereda nyeri ringan jika diperlukan. Namun jika gejala berlanjut lebih dari seminggu, sebaiknya konsultasi ke dokter secara langsung.",
      timestamp: "10:05",
      isVisible: false,
    },
    {
      id: 12,
      speaker: session?.user?.name || "Pasien",
      content:
        "Baik dok, terima kasih atas sarannya. Apakah ada yang perlu saya perhatikan khusus?",
      timestamp: "10:05",
      isVisible: false,
    },
    {
      id: 13,
      speaker: "Dr. AI Assistant",
      content:
        "Pantau suhu tubuh Anda. Jika demam tinggi (>38.5°C), segera ke fasilitas kesehatan terdekat. Semoga lekas sembuh!",
      timestamp: "10:06",
      isVisible: false,
    },
  ];

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcriptMessages]);

  // Simulasi percakapan otomatis
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (
      isConversationActive &&
      currentMessageIndex < conversationScript.length
    ) {
      interval = setTimeout(() => {
        const currentMessage = conversationScript[currentMessageIndex];
        setTranscriptMessages((prev) => [
          ...prev,
          { ...currentMessage, isVisible: true },
        ]);
        setCurrentMessageIndex((prev) => prev + 1);
      }, 850 + Math.random() * 100);
    } else if (
      currentMessageIndex >= conversationScript.length &&
      isConversationActive
    ) {
      setIsConversationActive(false);
      setConnectionStatus("Tidak Terhubung - Konsultasi Selesai");
    }

    return () => clearTimeout(interval);
  }, [isConversationActive, currentMessageIndex, conversationScript]);

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

  const startConsultation = () => {
    setIsConsultationStarted(true);
    setConnectionStatus("Terhubung - Konsultasi Berlangsung");
    setIsConversationActive(true);
    setCurrentMessageIndex(0);
    setTranscriptMessages([]);

    setTimeout(() => {
      const firstMessage = conversationScript[0];
      setTranscriptMessages([{ ...firstMessage, isVisible: true }]);
      setCurrentMessageIndex(1);
    }, 2000);
  };

  const stopConsultation = () => {
    setIsConversationActive(false);
    setConnectionStatus("Tidak Terhubung - Konsultasi Dihentikan");
  };

  const restartConsultation = () => {
    setCurrentMessageIndex(0);
    setTranscriptMessages([]);
    setIsConversationActive(true);
    setConnectionStatus("Terhubung - Konsultasi Berlangsung");

    setTimeout(() => {
      const firstMessage = conversationScript[0];
      setTranscriptMessages([{ ...firstMessage, isVisible: true }]);
      setCurrentMessageIndex(1);
    }, 1000);
  };

  if (status === "loading") {
    return (
      <section className="md:mx-auto mx-10 my-8 md:px-4 bg-white rounded-2xl shadow-md max-w-7xl min-h-[92vh]">
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
        <h1 className="font-bold text-2xl text-primary">Agen AI</h1>
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
                {gejala || "Tidak ada gejala yang diinput"}
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
              // Tampilan sebelum konsultasi dimulai
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
                    <h1 className="font-bold text-2xl mt-3">
                      Dr. AI Assistant
                    </h1>
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
                      <h1 className="font-bold text-xl mt-3">
                        Dr. AI Assistant
                      </h1>
                      <p className="mt-1 text-gray-600 text-sm">
                        Asisten Medis AI
                      </p>
                    </div>

                    {/* Dokter Messages */}
                    <div className="dokter-messages space-y-3 max-h-80 overflow-y-auto">
                      {transcriptMessages
                        .filter((msg) => msg.speaker === "Dr. AI Assistant")
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

                      {isConversationActive &&
                        transcriptMessages.filter(
                          (msg) => msg.speaker === "Dr. AI Assistant"
                        ).length <
                          conversationScript.filter(
                            (msg) => msg.speaker === "Dr. AI Assistant"
                          ).length && (
                          <div className="flex items-center gap-2 text-green-600 text-sm p-2">
                            <div className="animate-pulse">●</div>
                            <span>Dr. AI sedang merespons...</span>
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
                        {gejala ? `Gejala: ${gejala}` : "Pasien"}
                      </p>
                    </div>

                    {/* User Messages */}
                    <div className="user-messages space-y-3 max-h-80 overflow-y-auto">
                      {transcriptMessages
                        .filter((msg) => msg.speaker !== "Dr. AI Assistant")
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

                      {isConversationActive &&
                        transcriptMessages.filter(
                          (msg) => msg.speaker !== "Dr. AI Assistant"
                        ).length <
                          conversationScript.filter(
                            (msg) => msg.speaker !== "Dr. AI Assistant"
                          ).length && (
                          <div className="flex items-center gap-2 text-blue-600 text-sm p-2">
                            <div className="animate-pulse">●</div>
                            <span>
                              {session?.user?.name || "Pasien"} sedang
                              merespons...
                            </span>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          {/* Tombol Control */}
          <div className="flex justify-center pb-4">
            {!isConsultationStarted ? (
              <Button onClick={startConsultation} className="mx-auto">
                <IoMdCall className="mr-2" /> Mulai Konsultasi
              </Button>
            ) : (
              <div className="flex gap-2">
                {isConversationActive ? (
                  <Button
                    onClick={stopConsultation}
                    variant="destructive"
                    className="mx-auto"
                  >
                    <FaStop className="mr-2" /> Hentikan Konsultasi
                  </Button>
                ) : (
                  <Button onClick={restartConsultation} className="mx-auto">
                    Ulang Konsultasi
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
