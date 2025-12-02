"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { TiArrowLeft } from "react-icons/ti";
import {
  FaStethoscope,
  FaClipboardList,
  FaCalendarAlt,
  FaClock,
  FaComments,
  FaFileAlt,
} from "react-icons/fa";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

interface ConsultationReport {
  summary: string;
  symptoms: string[];
  possibleConditions: string[];
  recommendations: string[];
  urgencyLevel: "low" | "medium" | "high";
  followUpRequired: boolean;
  generatedAt: string;
}

interface Consultation {
  id: string;
  gejala: string;
  conversation: Message[];
  report: ConsultationReport | null;
  createdBy: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface ConsultationDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ConsultationDetailPage({
  params,
}: ConsultationDetailPageProps) {
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    const fetchConsultation = async () => {
      try {
        const { id } = await params;
        const response = await fetch(`/api/consultation/${id}`);

        if (response.ok) {
          const result = await response.json();
          console.log("Consultation data:", result.data);
          console.log("Conversation type:", typeof result.data.conversation);
          console.log("Conversation value:", result.data.conversation);
          setConsultation(result.data);
        } else {
          setError("Konsultasi tidak ditemukan atau akses ditolak");
        }
      } catch (error) {
        console.error("Error fetching consultation:", error);
        setError("Terjadi kesalahan saat memuat konsultasi");
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchConsultation();
    }
  }, [params, session]);

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getUrgencyText = (level: string) => {
    switch (level) {
      case "high":
        return "Tinggi";
      case "medium":
        return "Sedang";
      case "low":
        return "Rendah";
      default:
        return "Tidak diketahui";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat detail konsultasi...</p>
        </div>
      </div>
    );
  }

  if (error || !consultation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Error</h2>
            <p className="text-gray-600 mb-6">
              {error || "Konsultasi tidak ditemukan"}
            </p>
            <Link href="/consultation">
              <Button>Kembali ke Riwayat</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <Link href="/consultation">
              <Button variant="ghost" className="flex items-center gap-2">
                <TiArrowLeft className="size-5" />
                Kembali ke Riwayat
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <FaFileAlt className="text-primary size-5" />
              <h1 className="text-2xl font-bold text-gray-800">
                Detail Konsultasi
              </h1>
            </div>
          </div>

          {/* Consultation Info */}
          <div className="flex justify-center items-center gap-10">
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="text-blue-500 size-4" />
              <div>
                <p className="text-sm text-gray-600">Tanggal</p>
                <p className="font-medium">
                  {new Date(consultation.createdAt).toLocaleDateString("id-ID")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FaClock className="text-green-500 size-4" />
              <div>
                <p className="text-sm text-gray-600">Waktu</p>
                <p className="font-medium">
                  {new Date(consultation.createdAt).toLocaleTimeString(
                    "id-ID",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Gejala Awal */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FaStethoscope className="text-primary size-5" />
              Gejala Awal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 bg-blue-50 p-4 rounded-md text-lg">
              {consultation.gejala}
            </p>
          </CardContent>
        </Card>

        <div className="max-w-4xl mx-auto">
          {/* Medical Report */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FaClipboardList className="text-green-500 size-5" />
                Laporan Medis AI
              </CardTitle>
            </CardHeader>
            <CardContent>
              {consultation.report ? (
                <div className="space-y-6">
                  {/* Summary */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">
                      Ringkasan
                    </h3>
                    <p className="text-gray-600 bg-blue-50 p-3 rounded-md">
                      {consultation.report.summary}
                    </p>
                  </div>

                  {/* Urgency Level */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">
                      Tingkat Urgensi
                    </h3>
                    <Badge
                      className={`${getUrgencyColor(
                        consultation.report.urgencyLevel
                      )} border`}
                    >
                      {getUrgencyText(consultation.report.urgencyLevel)}
                    </Badge>
                  </div>

                  {/* Symptoms */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">
                      Gejala yang Teridentifikasi
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {consultation.report.symptoms &&
                      Array.isArray(consultation.report.symptoms) ? (
                        consultation.report.symptoms.map((symptom, index) => (
                          <Badge key={index} variant="outline">
                            {symptom}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">
                          Tidak ada gejala yang teridentifikasi
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Possible Conditions */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">
                      Kemungkinan Kondisi
                    </h3>
                    <ul className="space-y-1">
                      {consultation.report.possibleConditions &&
                      Array.isArray(consultation.report.possibleConditions) ? (
                        consultation.report.possibleConditions.map(
                          (condition, index) => (
                            <li
                              key={index}
                              className="text-gray-600 flex items-center gap-2"
                            >
                              <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                              {condition}
                            </li>
                          )
                        )
                      ) : (
                        <p className="text-gray-500 text-sm">
                          Tidak ada kondisi yang teridentifikasi
                        </p>
                      )}
                    </ul>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">
                      Rekomendasi
                    </h3>
                    <ul className="space-y-1">
                      {consultation.report.recommendations &&
                      Array.isArray(consultation.report.recommendations) ? (
                        consultation.report.recommendations.map(
                          (recommendation, index) => (
                            <li
                              key={index}
                              className="text-gray-600 flex items-center gap-2"
                            >
                              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                              {recommendation}
                            </li>
                          )
                        )
                      ) : (
                        <p className="text-gray-500 text-sm">
                          Tidak ada rekomendasi tersedia
                        </p>
                      )}
                    </ul>
                  </div>

                  {/* Follow-up */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">
                      Tindak Lanjut
                    </h3>
                    <Badge
                      variant={
                        consultation.report.followUpRequired
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {consultation.report.followUpRequired
                        ? "Diperlukan Konsultasi Lanjutan"
                        : "Tidak Diperlukan Tindak Lanjut"}
                    </Badge>
                  </div>

                  {/* Generated At */}
                  <div className="pt-4 border-t">
                    <p className="text-xs text-gray-500">
                      Laporan dibuat:{" "}
                      {new Date(consultation.report.generatedAt).toLocaleString(
                        "id-ID"
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  <FaClipboardList className="size-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">
                    Laporan Belum Tersedia
                  </h3>
                  <p className="text-sm">
                    Laporan medis akan dibuat setelah konsultasi selesai
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
