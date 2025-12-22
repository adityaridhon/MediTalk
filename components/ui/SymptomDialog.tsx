"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { FaUserDoctor, FaSpinner } from "react-icons/fa6";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface CreateConsultationDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateConsultationDialog: React.FC<
  CreateConsultationDialogProps
> = ({ isOpen, onClose }) => {
  const [gejala, setGejala] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [warning, setWarning] = useState("");
  const [hasEmoji, setHasEmoji] = useState(false);
  const router = useRouter();

  const MIN_CHARS = 10;
  const MAX_CHARS = 250;

  // Fungsi untuk mendeteksi emoji
  const containsEmoji = (text: string) => {
    const emojiRegex =
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}]/u;
    return emojiRegex.test(text);
  };

  // Fungsi untuk membersihkan emoji
  const removeEmoji = (text: string) => {
    return text.replace(
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}]/gu,
      ""
    );
  };

  const sanitizeInput = (text: string) => {
    let cleaned = removeEmoji(text);

    cleaned = cleaned.replace(
      /[^a-zA-Z0-9\s.,!?;:()\-áéíóúàèìòùâêîôûäëïöüñÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÄËÏÖÜÑ]/g,
      ""
    );

    cleaned = cleaned.replace(/\s+/g, " ");

    return cleaned.trim();
  };

  // Real-time validation pake useefek
  useEffect(() => {
    const trimmedText = gejala.trim();
    setCharCount(trimmedText.length);

    setWarning("");
    setHasEmoji(false);

    // Check emoji
    if (containsEmoji(gejala)) {
      setHasEmoji(true);
      setWarning("Emoji akan dihapus secara otomatis saat memproses.");
    }

    // Check panjang karakter
    if (trimmedText.length > 0 && trimmedText.length < MIN_CHARS) {
      setWarning(`Minimal ${MIN_CHARS} karakter diperlukan.`);
    } else if (trimmedText.length > MAX_CHARS) {
      setWarning(
        `Maksimal ${MAX_CHARS} karakter. Anda melebihi ${
          trimmedText.length - MAX_CHARS
        } karakter.`
      );
    }

    // Check hanya spasi
    if (gejala.length > 0 && trimmedText.length === 0) {
      setWarning("Gejala tidak boleh hanya berisi spasi.");
    }
  }, [gejala]);

  const handleSubmit = async () => {
    const trimmedText = gejala.trim();

    // Validasi kosong
    if (trimmedText.length === 0) {
      alert("Gejala tidak boleh kosong");
      return;
    }

    // Validasi minimum
    if (trimmedText.length < MIN_CHARS) {
      alert(`Minimal ${MIN_CHARS} karakter diperlukan`);
      return;
    }

    // Validasi maksimum
    if (trimmedText.length > MAX_CHARS) {
      alert(`Maksimal ${MAX_CHARS} karakter`);
      return;
    }

    setIsLoading(true);

    try {
      const cleanedGejala = sanitizeInput(gejala);

      if (cleanedGejala.length < MIN_CHARS) {
        alert(
          "Setelah pembersihan, gejala terlalu pendek. Mohon masukkan deskripsi yang lebih detail."
        );
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/consultation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gejala: cleanedGejala,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal membuat konsultasi");
      }

      if (result.success && result.data?.id) {
        setGejala("");
        onClose();

        router.push(`/consultation/medical-agent/${result.data.id}`);
      } else {
        throw new Error("Response tidak valid");
      }
    } catch (error) {
      console.error("Error creating consultation:", error);
      alert(
        `Error: ${
          error instanceof Error ? error.message : "Gagal membuat konsultasi"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setGejala("");
      setWarning("");
      setCharCount(0);
      setHasEmoji(false);
      onClose();
    }
  };

  const getProgressColor = () => {
    if (charCount < MIN_CHARS) return "bg-red-500";
    if (charCount > MAX_CHARS) return "bg-red-500";
    if (charCount > MAX_CHARS * 0.9) return "bg-yellow-500";
    return "bg-green-500";
  };

  const isValid =
    charCount >= MIN_CHARS &&
    charCount <= MAX_CHARS &&
    gejala.trim().length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <FaUserDoctor className="text-primary" />
              Konsultasi Baru
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Info */}
          <div className="">
            <p className="text-sm text-black">
              Ceritakan gejala atau keluhan yang Anda alami untuk memulai
              konsultasi dengan AI medis.
            </p>
          </div>

          {/* Form */}
          <div className="space-y-2">
            <Label htmlFor="gejala">
              Gejala yang Anda Alami <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="gejala"
              placeholder="Contoh: Saya mengalami sakit kepala sejak 2 hari yang lalu, disertai dengan demam dan mual..."
              value={gejala}
              onChange={(e) => setGejala(e.target.value)}
              disabled={isLoading}
              rows={4}
              className="resize-none"
            />

            {/* Character Counter & Progress Bar */}
            <div className="flex items-center justify-between text-xs">
              <span
                className={`${
                  charCount > MAX_CHARS
                    ? "text-red-500 font-semibold"
                    : "text-gray-500"
                }`}
              >
                {charCount} / {MAX_CHARS} karakter
              </span>

              {/* Progress Bar */}
              <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${getProgressColor()}`}
                  style={{
                    width: `${Math.min((charCount / MAX_CHARS) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Warning Alert */}
            {warning && (
              <div
                className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
                  charCount > MAX_CHARS || charCount < MIN_CHARS
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-blue-50 text-blue-700 border border-blue-200"
                }`}
              >
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{warning}</span>
              </div>
            )}

            {/* Success State */}
            {isValid && !hasEmoji && (
              <div className="flex items-start gap-2 p-3 rounded-lg text-sm bg-green-50 text-green-700 border border-green-200">
                <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Input valid! Siap untuk konsultasi.</span>
              </div>
            )}

            <p className="text-xs text-gray-500">
              Minimal {MIN_CHARS} karakter. Emoji dan karakter khusus akan
              dihapus otomatis.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !isValid}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <FaSpinner className="mr-2 h-4 w-4 animate-spin" />
                  Membuat...
                </>
              ) : (
                "Mulai Konsultasi"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
