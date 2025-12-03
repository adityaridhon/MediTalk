"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { FaUserDoctor, FaSpinner } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";

interface CreateConsultationDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateConsultationDialog: React.FC<CreateConsultationDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const [gejala, setGejala] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!gejala.trim()) {
      alert("Silakan isi gejala yang Anda alami");
      return;
    }

    setIsLoading(true);

    try {
      
      const response = await fetch('/api/consultation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gejala: gejala.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal membuat konsultasi');
      }

      if (result.success && result.data?.id) {
        
        setGejala("");
        onClose();
        
        router.push(`/consultation/medical-agent/${result.data.id}`);
      } else {
        throw new Error('Response tidak valid');
      }

    } catch (error) {
      console.error("Error creating consultation:", error);
      alert(`Error: ${error instanceof Error ? error.message : 'Gagal membuat konsultasi'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setGejala("");
      onClose();
    }
  };

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
              Ceritakan gejala atau keluhan yang Anda alami untuk memulai konsultasi dengan AI medis.
            </p>
          </div>

          {/* Form */}
          <div className="space-y-2">
            <Label htmlFor="gejala">Gejala yang Anda Alami <span className="text-red-500">*</span></Label>
            <Textarea
              id="gejala"
              placeholder="Contoh: Saya mengalami sakit kepala sejak 2 hari yang lalu, disertai dengan demam dan mual..."
              value={gejala}
              onChange={(e) => setGejala(e.target.value)}
              disabled={isLoading}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              Jelaskan gejala selengkap mungkin untuk konsultasi yang lebih akurat.
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
              disabled={isLoading || !gejala.trim()}
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