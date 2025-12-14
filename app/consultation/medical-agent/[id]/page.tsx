"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { MedicalAgentChat } from "@/components/ui/MedicalAgentChat";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { useConsultation } from "@/hooks/useConsultations";
import { useVapi } from "@/hooks/useVapi";

const MedicalAgentPage = () => {
  const params = useParams();
  const router = useRouter();
  const consultationId = params.id as string;
  const { data: session, status } = useSession();

  const { consultation, loading, error } = useConsultation(consultationId);
  const {
    vapi,
    isCallActive,
    connectionStatus,
    transcriptMessages,
    isMuted,
    isCreatingAssistant,
    callHasEnded,
    isGeneratingReport,
    startConsultation,
    stopConsultation,
    toggleMute,
  } = useVapi({
    consultationId,
    gejala: consultation?.gejala || "",
  });

  // Redirect auth
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/?login=true&redirect=/consultation");
    }
  }, [status, router]);

  if (loading || status === "loading") {
    return (
      <div className="flex flex-col h-screen w-full max-w-full mx-auto bg-white">
        <header className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between gap-2 px-3 py-3 sm:gap-3 sm:px-4 sm:py-3 md:gap-4 md:px-6 md:py-4">
            <Skeleton className="h-10 w-10 rounded-md flex-shrink-0" />
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex-1 min-w-0 text-right space-y-2">
                <Skeleton className="h-5 w-32 ml-auto" />
                <Skeleton className="h-4 w-24 ml-auto" />
              </div>
              <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 rounded-full flex-shrink-0" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-gray-50 px-2 py-3 sm:px-3 sm:py-4 md:px-4 md:py-6">
          <div className="max-w-full sm:max-w-2xl md:max-w-3xl mx-auto space-y-3 sm:space-y-4 md:space-y-6">
            <div className="text-center mb-3 sm:mb-4 md:mb-6 px-2">
              <Skeleton className="h-6 w-48 mx-auto mb-2" />
              <Skeleton className="h-4 w-64 mx-auto" />
            </div>

            <div className="text-center py-8 sm:py-12 md:py-16 px-4">
              <Skeleton className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full mx-auto mb-3 sm:mb-4" />
              <Skeleton className="h-5 w-48 mx-auto mb-1 sm:mb-2" />
              <Skeleton className="h-4 w-64 mx-auto" />
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-6">
          <div className="max-w-full sm:max-w-2xl md:max-w-3xl mx-auto">
            <div className="flex flex-col items-center gap-2.5 sm:gap-3 md:gap-4">
              <Skeleton className="h-14 w-14 sm:h-16 sm:w-16 md:h-16 md:w-16 rounded-full" />
              <div className="text-center px-3 sm:px-4 space-y-2">
                <Skeleton className="h-5 w-32 mx-auto" />
                <Skeleton className="h-4 w-80 mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Gagal Memuat Konsultasi
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => router.push("/consultation")}>
            Kembali ke Riwayat
          </Button>
        </div>
      </div>
    );
  }

  // No consultation
  if (!consultation) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-yellow-600 text-2xl">📋</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Konsultasi Tidak Ditemukan
          </h2>
          <p className="text-gray-600 mb-6">
            Konsultasi dengan ID tersebut tidak ditemukan atau Anda tidak
            memiliki akses.
          </p>
          <Button onClick={() => router.push("/consultation")}>
            Kembali ke Riwayat
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main  */}
      <MedicalAgentChat
        isCallActive={isCallActive}
        connectionStatus={connectionStatus}
        transcriptMessages={transcriptMessages}
        isMuted={isMuted}
        callHasEnded={callHasEnded}
        isGeneratingReport={isGeneratingReport}
        onStartCall={startConsultation}
        onEndCall={stopConsultation}
        onToggleMute={toggleMute}
        doctorName="Dr. MediTalk"
        doctorSpecialty="AI Medical Assistant"
        userName={session?.user?.name || "Anda"}
        userImage={session?.user?.image || null}
      />
    </>
  );
};

export default MedicalAgentPage;
