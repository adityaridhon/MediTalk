import { useRef, useEffect, useState } from "react";
import { Mic, Volume2, User, Phone, FileText } from "lucide-react";
import { IoIosArrowRoundBack } from "react-icons/io";
import type { TranscriptMessage } from "@/hooks/useVapi";
import Image from "next/image";
import { Button } from "./button";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";

interface MedicalAgentChatProps {
  // VAPI Integration Props
  isCallActive: boolean;
  connectionStatus: string;
  transcriptMessages: TranscriptMessage[];
  isMuted: boolean;
  callHasEnded: boolean;
  isGeneratingReport: boolean;

  // Actions
  onStartCall: () => void;
  onEndCall: () => void;
  onToggleMute: () => void;

  // Optional Props
  doctorName?: string;
  doctorImage?: string;
  doctorSpecialty?: string;
  userName?: string;
  userImage?: string | null;
}

export function MedicalAgentChat({
  isCallActive,
  connectionStatus,
  transcriptMessages,
  isMuted,
  callHasEnded,
  isGeneratingReport,
  onStartCall,
  onEndCall,
  onToggleMute,
  doctorName = "Dr. Medi",
  doctorImage = "/assets/dokter/dr.1.png",
  doctorSpecialty = "Asisten Medis AI",
  userName = "Anda",
  userImage = null,
}: MedicalAgentChatProps) {
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const [showReportDialog, setShowReportDialog] = useState(false);

  const scrollToBottom = () => {
    transcriptEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [transcriptMessages]);

  useEffect(() => {
    if (callHasEnded && isGeneratingReport) {
      setShowReportDialog(true);
    }
  }, [callHasEnded, isGeneratingReport]);

  const formatTimestamp = (timestamp: string | number) => {
    if (!timestamp) return "";

    try {
      const date =
        typeof timestamp === "number"
          ? new Date(timestamp)
          : new Date(timestamp);

      if (isNaN(date.getTime())) {
        return "";
      }

      return date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Makassar",
      });
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return "";
    }
  };

  const isAgentSpeaking =
    connectionStatus.toLowerCase().includes("berbicara") ||
    connectionStatus.toLowerCase().includes("speaking");

  const isUserSpeaking = isCallActive && !isAgentSpeaking && !isMuted;

  return (
    <div className="flex flex-col h-screen w-full max-w-full mx-auto bg-white">
      <header className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between gap-2 px-3 py-3 sm:gap-3 sm:px-4 sm:py-3 md:gap-4 md:px-6 md:py-4">
          <Link href="/consultation">
            <Button variant="outline" size="icon-lg" className="flex-shrink-0">
              <IoIosArrowRoundBack className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex-1 min-w-0 text-right">
              <h1 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-gray-900 truncate">
                {doctorName}
              </h1>
              <div className="flex items-center justify-end gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                <div
                  className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                    isCallActive ? "bg-green-500 animate-pulse" : "bg-gray-400"
                  }`}
                ></div>
                <span
                  className={`text-xs sm:text-sm ${
                    isCallActive
                      ? "text-green-700 font-medium"
                      : "text-gray-500"
                  }`}
                >
                  {isCallActive ? "Konsultasi Aktif" : "Siap Konsultasi"}
                </span>
              </div>
            </div>
            <div className="relative flex-shrink-0">
              <Image
                src={doctorImage}
                alt={doctorName}
                width={100}
                height={100}
                className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full object-cover border-2 sm:border-3 md:border-4 border-primary shadow-lg"
              />
              <div
                className={`absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 rounded-full border-2 border-white shadow ${
                  isCallActive ? "bg-green-500 animate-pulse" : "bg-gray-400"
                }`}
              ></div>
            </div>
          </div>
        </div>
      </header>

      {/* Status Bar */}
      {isCallActive && (isAgentSpeaking || isUserSpeaking) && (
        <div className="bg-gradient-to-r from-primar/5 to-primary/60 text-white px-3 py-2 sm:px-4 sm:py-2.5 md:px-6 md:py-3">
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 md:gap-3">
            {isUserSpeaking && (
              <>
                <div className="flex gap-0.5 sm:gap-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-0.5 sm:w-1 bg-white rounded-full animate-pulse"
                      style={{
                        height: `${[12, 16, 14, 20, 12][i]}px`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    ></div>
                  ))}
                </div>
                <span className="text-xs sm:text-sm md:text-base font-medium">
                  Anda sedang berbicara...
                </span>
              </>
            )}
            {isAgentSpeaking && (
              <>
                <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 animate-pulse" />
                <span className="text-xs sm:text-sm md:text-base font-medium">
                  {doctorName} sedang berbicara...
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Connection Status */}
      {connectionStatus && (
        <div className="bg-primary/5 border-b border-primary/70 px-3 py-1.5 sm:px-4 sm:py-2">
          <p className="text-xs sm:text-sm text-primary text-center font-medium">
            {connectionStatus}
          </p>
        </div>
      )}

      {/* Transcript */}
      <div className="flex-1 overflow-y-auto bg-gray-50 px-2 py-3 sm:px-3 sm:py-4 md:px-4 md:py-6">
        <div className="max-w-full sm:max-w-2xl md:max-w-3xl mx-auto space-y-3 sm:space-y-4 md:space-y-6">
          {/* Empty state */}
          {transcriptMessages.length === 0 && (
            <div className="text-center py-8 sm:py-12 md:py-16 px-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-3 sm:mb-4 rounded-full bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center">
                <Mic className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-primary" />
              </div>
              <p className="text-sm sm:text-base md:text-lg font-medium text-gray-600 mb-1 sm:mb-2">
                Belum ada percakapan
              </p>
              <p className="text-xs sm:text-sm text-gray-500 max-w-xs mx-auto">
                Tekan tombol mikrofon untuk memulai konsultasi
              </p>
            </div>
          )}

          {/* Messages */}
          {transcriptMessages.map((entry, index) => (
            <div
              key={`${entry.timestamp}-${index}`}
              className={`flex gap-2 sm:gap-3 md:gap-4 ${
                entry.speaker === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                {entry.speaker === "assistant" ? (
                  <Image
                    src={doctorImage}
                    alt={doctorName}
                    width={48}
                    height={48}
                    className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full object-cover border-2 border-primary shadow-lg"
                  />
                ) : userImage ? (
                  <Image
                    src={userImage}
                    alt={userName}
                    width={48}
                    height={48}
                    className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full object-cover border-2 border-blue-500 shadow-lg"
                  />
                ) : (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white" />
                  </div>
                )}
              </div>

              {/* bubble */}
              <div
                className={`flex-1 min-w-0 ${
                  entry.speaker === "user" ? "text-right" : "text-left"
                }`}
              >
                {/*  name */}
                <div
                  className={`flex items-center gap-1.5 mb-0.5 sm:mb-1 ${
                    entry.speaker === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <span className="text-xs sm:text-sm text-gray-500 font-medium">
                    {entry.speaker === "user" ? userName : doctorName}
                  </span>
                </div>

                {/*  content */}
                <div
                  className={`inline-block max-w-[90%] sm:max-w-[85%] md:max-w-[80%] rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 md:px-4 md:py-3 shadow-sm ${
                    entry.speaker === "user"
                      ? "bg-white border border-gray-200 text-gray-900"
                      : "bg-primary text-white"
                  }`}
                >
                  <p className="text-xs sm:text-sm md:text-base leading-relaxed break-words">
                    {entry.content}
                  </p>
                </div>

                {/* Timestamp */}
                <span className="text-xs text-gray-400 mt-0.5 sm:mt-1 inline-block">
                  {formatTimestamp(entry.timestamp)}
                </span>
              </div>
            </div>
          ))}

          <div ref={transcriptEndRef} />
        </div>
      </div>

      {/* Voice Control */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-6 ">
        <div className="max-w-full sm:max-w-2xl md:max-w-3xl mx-auto">
          <div className="flex flex-col items-center gap-2.5 sm:gap-3 md:gap-4">
            {!isCallActive ? (
              // Start call btn
              <Button
                onClick={onStartCall}
                size="icon-lg"
                className="w-14 h-14 sm:w-16 sm:h-16 md:w-16 md:h-16 rounded-full"
                title={
                  callHasEnded ? "Konsultasi telah selesai" : "Mulai konsultasi"
                }
                disabled={callHasEnded}
              >
                <Phone className="size-6 md:size-6.5" />
              </Button>
            ) : (
              <div className="flex items-center gap-2.5 sm:gap-3 md:gap-4">
                {/* Mute/Unmute Button */}
                <Button
                  onClick={onToggleMute}
                  size="icon-lg"
                  variant={isMuted ? "secondary" : "default"}
                  className={`w-14 h-14 sm:w-16 sm:h-16 md:w-16 md:h-16 rounded-full ${
                    isMuted
                      ? "bg-gray-400 hover:bg-gray-500"
                      : "bg-primary/50 hover:bg-primary/60"
                  }`}
                  title={isMuted ? "Nyalakan mikrofon" : "Matikan mikrofon"}
                >
                  <Mic
                    className={`size-6 md:size-6.5 ${
                      isMuted ? "opacity-50" : ""
                    }`}
                  />
                  {isMuted && (
                    <div className="absolute w-0.5 h-6 bg-white rotate-45"></div>
                  )}
                </Button>

                {/* End Call Button */}
                <Button
                  onClick={onEndCall}
                  size="icon-lg"
                  variant={"destructive"}
                  className="w-14 h-14 sm:w-16 sm:h-16 md:w-16 md:h-16 rounded-full"
                  title="Akhiri konsultasi"
                >
                  <Phone className="size-6 md:size-6.5" />
                </Button>
              </div>
            )}

            {/* Control label */}
            <div className="text-center px-3 sm:px-4">
              <p className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-gray-900 mb-1">
                {!isCallActive
                  ? callHasEnded
                    ? "Konsultasi Selesai"
                    : "Mulai Konsultasi"
                  : "Konsultasi Aktif"}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
                {!isCallActive
                  ? callHasEnded
                    ? "Konsultasi telah berakhir. Laporan sedang digenerate."
                    : "Tekan tombol untuk memulai konsultasi suara dengan AI medis"
                  : isMuted
                  ? "Mikrofon dimatikan. Tekan untuk mengaktifkan kembali"
                  : "Konsultasi sedang berlangsung. Bicara dengan jelas"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Konsultasi Selesai
            </DialogTitle>
            <DialogDescription className="text-left pt-2">
              Terima kasih telah menggunakan layanan konsultasi kami. Sistem
              sedang menggenerate laporan medis berdasarkan percakapan Anda.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-center py-4">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-sm text-gray-600">
                Memproses laporan medis...
              </p>
            </div>
          </div>

          <DialogFooter className="sm:justify-center">
            <Link href="/consultation" className="w-full sm:w-auto">
              <Button type="button" className="w-full">
                Lihat Riwayat Konsultasi
              </Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
