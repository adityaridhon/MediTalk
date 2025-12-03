"use client";

// import ui, icon, komponen
import React, { useEffect, useRef } from "react";
import { TiArrowLeft } from "react-icons/ti";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaUserDoctor, FaHeadset, FaStop } from "react-icons/fa6";
import { IoMdCall } from "react-icons/io";
import { ImConnection } from "react-icons/im";
import { BsRobot } from "react-icons/bs";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { PiSpinnerGapBold } from "react-icons/pi";

// Import hooks(logic)
import { useConsultation } from "@/hooks/useConsultations";
import { useVapi } from "@/hooks/useVapi";
import { useTimer } from "@/hooks/useTimer";

const MedicalAgentPage = () => {
  const params = useParams();
  const consultationId = params.id as string;
  const { data: session, status } = useSession();
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const { consultation, loading, error } = useConsultation(consultationId);
  const {
    vapi,
    isCallActive,
    connectionStatus,
    transcriptMessages,
    isMuted,
    isCreatingAssistant,
    startConsultation,
    stopConsultation,
    toggleMute,
  } = useVapi({
    consultationId,
    gejala: consultation?.gejala || "",
  });
  const timer = useTimer(isCallActive);

  const [isConsultationStarted, setIsConsultationStarted] =
    React.useState(false);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcriptMessages]);

  useEffect(() => {
    setIsConsultationStarted(isCallActive);
  }, [isCallActive]);

  if (loading || status === "loading") {
    return (
      <section className="bg-white min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Animated Orb Loader */}
          <div className="relative">
            <div className="h-14 w-14 rounded-full bg-primary/20 animate-ping absolute inset-0"></div>
            <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center shadow-inner">
              <PiSpinnerGapBold className="animate-spin text-white h-6 w-6" />
            </div>
          </div>

          {/* Text */}
          <p className="text-gray-600 text-sm font-medium">
            Membuat halaman konsultasi
            <span className="animate-pulse">...</span>
          </p>

          {/* Subtle Subtitle */}
          <p className="text-gray-400 text-xs">Mohon tunggu sebentar</p>
        </div>
      </section>
    );
  }

  if (error || !consultation) {
    return (
      <section className="md:mx-auto mx-10 my-8 md:px-4 bg-white rounded-2xl shadow-md max-w-7xl min-h-[92vh]">
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-500 text-2xl">⚠️</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {error || "Konsultasi tidak ditemukan"}
              </h2>
              <p className="text-gray-600 mb-4">
                {error === "Konsultasi tidak ditemukan"
                  ? "ID konsultasi yang Anda cari tidak ada dalam sistem."
                  : error === "Tidak memiliki akses ke konsultasi ini"
                  ? "Anda tidak memiliki izin untuk mengakses konsultasi ini."
                  : "Terjadi kesalahan saat memuat data konsultasi."}
              </p>
            </div>
            <div className="space-x-2">
              <Link href="/consultation">
                <Button>Kembali ke Konsultasi</Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Coba Lagi
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="md:mx-auto min-h-[92vh] py-10">
      {/* Navigation */}
      <div className="bg-gradient-to-l from-primary/100 to-primary/80 px-10 mb-6">
        <div className="flex items-center justify-between gap-4 fixed top-0 left-0 right-0 z-10 bg-gradient-to-l from-primary/100 to-primary/80 px-10 py-5 shadow-md">
          <Link href="/consultation">
            <Button
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border-white/20"
              variant="outline"
            >
              <TiArrowLeft className="h-4 w-4" />
              Kembali
            </Button>
          </Link>
          <div className="text-white text-right">
            <h1 className="font-bold text-2xl mb-1">Konsultasi Medis</h1>
            <p className="text-blue-100 text-sm">
              ID Konsultasi: {consultation.id}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-14 space-y-6">
        {/* Instructions */}
        <div className="w-full max-w-6xl bg-secondary/40 border-l-4 border-secondary p-4 rounded-r-lg mx-auto">
          <h4 className="font-medium text-blue-800 mb-2">
            Cara Memulai Konsultasi:
          </h4>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. Pastikan mikropon Anda berfungsi</li>
            <li>2. Klik tombol "Mulai Konsultasi Voice"</li>
            <li>3. Izinkan akses mikropon saat diminta</li>
            <li>4. Tunggu AI assistant menyapa Anda</li>
            <li>5. Mulai berbicara tentang gejala Anda</li>
          </ol>
        </div>

        <div className="border-t border-gray-400 max-w-6xl mx-auto"></div>

        {/* Consultation Card */}
        <div className="wrap max-w-6xl mx-auto space-y-6">
          <div className="flex justify-between px-3">
            <div className="flex items-center gap-3 border py-1 px-3 rounded-lg text-gray-500">
              <FaHeadset />
              <h2 className="text-gray-500 text-sm">{timer}</h2>
            </div>
            <div
              className={`flex items-center gap-3 border py-1 px-3 rounded-lg ${
                (connectionStatus.includes("Terhubung") &&
                  !connectionStatus.includes("Tidak Terhubung")) ||
                connectionStatus.includes("Berlangsung") ||
                connectionStatus.includes("Aktif")
                  ? "text-green-600"
                  : connectionStatus.includes("Error")
                  ? "text-red-600"
                  : connectionStatus.includes("Membuat") ||
                    connectionStatus.includes("Menghubungkan")
                  ? "text-orange-600"
                  : "text-gray-600"
              }`}
            >
              <ImConnection />
              <h2 className="text-sm">{connectionStatus}</h2>
            </div>
          </div>
          {!isConsultationStarted ? (
            // Pre-consultation layout
            <div className="flex flex-col items-center space-y-6">
              {/* Status Creation */}
              {isCreatingAssistant && (
                <div className="w-full bg-orange-50 border-orange-500 p-4 rounded-r-lg">
                  <div className="flex items-center gap-3">
                    <BsRobot className="text-orange-600 text-xl animate-pulse" />
                    <div>
                      <h4 className="font-medium text-orange-800">
                        Membuat Assistant Medis
                      </h4>
                      <p className="text-sm text-orange-600">
                        Sedang menyiapkan assistant AI khusus untuk gejala
                        Anda...
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col md:flex-row justify-center mx-auto space-x-6 gap-10">
                <div className="dokter border rounded-xl p-4 shadow-sm md:w-[28rem] w-[20rem]">
                  <div className="text-center py-8">
                    <div className="img flex justify-center rounded-full">
                      <Image
                        src={"/assets/dokter/dr.1.png"}
                        alt="AI Medical Assistant"
                        width={130}
                        height={130}
                        className="object-cover rounded-full"
                      />
                    </div>
                    <h1 className="font-bold text-2xl mt-3">Agen AI Medis</h1>
                    <p className="text-gray-600 mt-2">
                      Assistant AI akan dibuat khusus untuk gejala Anda
                    </p>
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
                      {session?.user?.name || "Pasien"}
                    </h1>
                    <p className="text-gray-600 mt-2">
                      Siap memulai konsultasi dengan AI
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Active consultation layout (sama seperti sebelumnya)
            <div className="consultation-layout">
              <div className="flex justify-center items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">
                  Konsultasi Berlangsung
                </h3>
              </div>

              <div className="flex flex-col lg:flex-row gap-6">
                {/* AI Assistant Section */}
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
                        <div className="animate-pulse text-green-600">●</div>
                        <span>AI Medis: Mendengarkan...</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* User Section */}
                <div className="user-section flex-1 border rounded-xl p-4 shadow-sm">
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
                        <div className="animate-pulse text-blue-600">●</div>
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

          {/* Control Buttons */}
          <div className="flex justify-center pb-4">
            {!isConsultationStarted ? (
              <Button
                onClick={startConsultation}
                className="mx-auto"
                disabled={!vapi || isCreatingAssistant || !consultation?.gejala}
                size="lg"
              >
                {isCreatingAssistant ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Membuat Assistant...
                  </>
                ) : (
                  <>
                    <IoMdCall className="mr-2" />
                    Mulai Konsultasi Voice
                  </>
                )}
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
                      <FaStop className="mr-2" /> Akhiri Konsultasi
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
        </div>
      </div>
    </section>
  );
};

export default MedicalAgentPage;
