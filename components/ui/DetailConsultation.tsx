"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FaUserDoctor, FaClipboardCheck, FaClock } from "react-icons/fa6";
import { FaHome, FaExclamationTriangle } from "react-icons/fa";

interface Consultation {
  id: string;
  gejala: string;
  conversation: any[];
  report: any;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface ConsultationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  consultation: Consultation | null;
}

export const ConsultationDetailModal: React.FC<
  ConsultationDetailModalProps
> = ({ isOpen, onClose, consultation }) => {
  if (!consultation) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getUrgencyColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case "tinggi":
        return "bg-red-500";
      case "sedang":
        return "bg-yellow-500";
      case "rendah":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "berat":
        return "bg-red-100 text-red-800";
      case "sedang":
        return "bg-yellow-100 text-yellow-800";
      case "ringan":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <FaUserDoctor className="text-primary" />
              Detail Konsultasi
            </DialogTitle>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informasi Konsultasi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="font-medium text-gray-600">Tanggal:</span>
                  <p className="text-gray-800">
                    {formatDate(consultation.createdAt)}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Pasien:</span>
                  <p className="text-gray-800">{consultation.user.name}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">
                    Gejala Awal:
                  </span>
                  <p className="text-gray-800">{consultation.gejala}</p>
                </div>
              </CardContent>
            </Card>

            {/* Report */}
            {consultation.report ? (
              <div className="space-y-4">
                {/* Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FaClipboardCheck className="text-green-600" />
                      Laporan Konsultasi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium text-gray-600">
                          Keluhan Utama:
                        </span>
                        <p className="text-gray-800 mt-1">
                          {consultation.report.keluhan_utama}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">
                          Tingkat Keparahan:
                        </span>
                        <div className="mt-1">
                          <Badge
                            className={getSeverityColor(
                              consultation.report.tingkat_keparahan
                            )}
                          >
                            {consultation.report.tingkat_keparahan}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div>
                      <span className="font-medium text-gray-600">
                        Ringkasan Gejala:
                      </span>
                      <p className="text-gray-800 mt-1">
                        {consultation.report.ringkasan_gejala}
                      </p>
                    </div>

                    {consultation.report.gejala_tambahan &&
                      consultation.report.gejala_tambahan.length > 0 && (
                        <div>
                          <span className="font-medium text-gray-600">
                            Gejala Tambahan:
                          </span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {consultation.report.gejala_tambahan.map(
                              (gejala: string, index: number) => (
                                <Badge key={index} variant="outline">
                                  {gejala}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {consultation.report.durasi_gejala && (
                      <div>
                        <span className="font-medium text-gray-600">
                          Durasi Gejala:
                        </span>
                        <p className="text-gray-800 mt-1 flex items-center gap-2">
                          <FaClock className="text-gray-500" />
                          {consultation.report.durasi_gejala}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recommendations */}
                {consultation.report.rekomendasi && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FaHome className="text-blue-600" />
                        Rekomendasi
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {consultation.report.rekomendasi.tindakan_segera && (
                        <div>
                          <span className="font-medium text-red-600">
                            Tindakan Segera:
                          </span>
                          <p className="text-gray-800 mt-1">
                            {consultation.report.rekomendasi.tindakan_segera}
                          </p>
                        </div>
                      )}

                      {consultation.report.rekomendasi.perawatan_rumah && (
                        <div>
                          <span className="font-medium text-green-600">
                            Perawatan di Rumah:
                          </span>
                          <p className="text-gray-800 mt-1">
                            {consultation.report.rekomendasi.perawatan_rumah}
                          </p>
                        </div>
                      )}

                      {consultation.report.rekomendasi.kapan_ke_dokter && (
                        <div>
                          <span className="font-medium text-orange-600">
                            Kapan ke Dokter:
                          </span>
                          <p className="text-gray-800 mt-1">
                            {consultation.report.rekomendasi.kapan_ke_dokter}
                          </p>
                        </div>
                      )}

                      {consultation.report.rekomendasi
                        .spesialis_yang_disarankan && (
                        <div>
                          <span className="font-medium text-purple-600">
                            Spesialis Disarankan:
                          </span>
                          <p className="text-gray-800 mt-1">
                            {
                              consultation.report.rekomendasi
                                .spesialis_yang_disarankan
                            }
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Important Notes & Urgency */}
                <div className="grid md:grid-cols-2 gap-4">
                  {consultation.report.catatan_penting && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <FaExclamationTriangle className="text-yellow-600" />
                          Catatan Penting
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-800">
                          {consultation.report.catatan_penting}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Tingkat Urgensi</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full ${getUrgencyColor(
                            consultation.report.tingkat_urgensi
                          )}`}
                        ></div>
                        <span className="font-medium capitalize">
                          {consultation.report.tingkat_urgensi}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Metadata */}
                {consultation.report.metadata && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm text-gray-600">
                        Informasi Laporan
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-gray-500 space-y-1">
                      <p>
                        Dibuat:{" "}
                        {formatDate(consultation.report.metadata.generated_at)}
                      </p>
                      <p>
                        Durasi Konsultasi:{" "}
                        {consultation.report.metadata.duration_minutes} menit
                      </p>
                      <p>
                        Laporan ini dibuat dengan bantuan:{" "}
                        {consultation.report.metadata.ai_model}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <FaClipboardCheck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Laporan Belum Tersedia
                  </h3>
                  <p className="text-gray-600">
                    Laporan konsultasi belum dibuat atau gagal dibuat.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
