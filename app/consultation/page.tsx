"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConsultationDetailModal } from "@/components/ui/DetailConsultation";
import { CreateConsultationDialog } from "@/components/ui/SymptomDialog";
import Link from "next/link";
import {
  FaPlus,
  FaEye,
  FaRegClock,
  FaUser,
  FaClipboardCheck,
  FaChevronLeft,
  FaCalendar,
  FaChevronRight,
  FaStethoscope,
} from "react-icons/fa6";
import { PiSpinnerGapBold } from "react-icons/pi";
import { useSession } from "next-auth/react";
import { useConsultations } from "@/hooks/useConsultations";
import { IoIosArrowRoundBack } from "react-icons/io";

const ConsultationPage = () => {
  const { data: session, status } = useSession();
  const { consultations, loading, error } = useConsultations();
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const handleViewDetail = (consultation: any) => {
    setSelectedConsultation(consultation);
    setIsDetailModalOpen(true);
  };

  const handleCreateConsultation = () => {
    setIsCreateDialogOpen(true);
  };

  const statistics = useMemo(() => {
    const totalConsultations = consultations.length;
    const completedConsultations = consultations.filter((c) => c.report).length;
    const inProgressConsultations = consultations.filter(
      (c) => c.conversation && c.conversation.length > 0 && !c.report
    ).length;
    const draftConsultations = consultations.filter(
      (c) => !c.conversation || c.conversation.length === 0
    ).length;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonthConsultations = consultations.filter((c) => {
      const createdDate = new Date(c.createdAt);
      return (
        createdDate.getMonth() === currentMonth &&
        createdDate.getFullYear() === currentYear
      );
    }).length;

    return {
      total: totalConsultations,
      completed: completedConsultations,
      inProgress: inProgressConsultations,
      draft: draftConsultations,
      thisMonth: thisMonthConsultations,
      completionRate:
        totalConsultations > 0
          ? Math.round((completedConsultations / totalConsultations) * 100)
          : 0,
    };
  }, [consultations]);

  // Pagination logic
  const paginatedData = useMemo(() => {
    const totalItems = consultations.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = consultations.slice(startIndex, endIndex);

    return {
      items: currentItems,
      totalPages,
      totalItems,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1,
      startIndex: startIndex + 1,
      endIndex: Math.min(endIndex, totalItems),
    };
  }, [consultations, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (consultation: any) => {
    if (consultation.report) {
      return <Badge className="bg-green-100 text-green-800">Selesai</Badge>;
    } else if (
      consultation.conversation &&
      consultation.conversation.length > 0
    ) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800">Perlu Review</Badge>
      );
    } else {
      return <Badge variant="secondary">Draft</Badge>;
    }
  };

  if (loading || status === "loading") {
    return (
      <section className=" bg-white min-h-screen flex items-center justify-center">
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
            Memuat riwayat konsultasi
            <span className="animate-pulse">...</span>
          </p>

          {/* Subtle Subtitle */}
          <p className="text-gray-400 text-xs">Mohon tunggu sebentar</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="md:mx-auto min-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-l from-primary/100 to-primary/80 px-10 mb-6">
          <div className="flex items-center justify-between gap-4 fixed top-0 left-0 right-0 z-10 bg-gradient-to-l from-primary/100 to-primary/80 px-10 py-5 shadow-md">
            <Link href="/">
              <Button
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border-white/20"
                variant="outline"
              >
                <IoIosArrowRoundBack className="h-4 w-4" />
                Kembali
              </Button>
            </Link>
            <div className="text-white text-right">
              <h1 className="font-bold text-2xl mb-1">Riwayat Konsultasi</h1>
              <p className="text-blue-100 text-sm">
                Kelola dan lihat riwayat konsultasi Anda dengan AI medis
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-28 max-w-6xl mx-auto px-4 mb-12">
          {/* Statistics Cards */}
          {!loading && !error && consultations.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Total Konsultasi */}
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-blue-500 rounded-lg">
                          <FaClipboardCheck className="h-5 w-5 text-white" />
                        </div>
                        <p className="text-sm font-semibold text-blue-700">
                          Total Konsultasi
                        </p>
                      </div>
                      <p className="text-3xl font-bold text-blue-900 mb-1">
                        {statistics.total}
                      </p>
                      <p className="text-xs text-blue-600">Sepanjang waktu</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Konsultasi Selesai */}
              <Card className="bg-gradient-to-br from-green-50 to-green-100 hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-green-500 rounded-lg">
                          <FaClipboardCheck className="h-5 w-5 text-white" />
                        </div>
                        <p className="text-sm font-semibold text-green-700">
                          Selesai
                        </p>
                      </div>
                      <p className="text-3xl font-bold text-green-900 mb-1">
                        {statistics.completed}
                      </p>
                      <p className="text-xs text-green-600">
                        {statistics.completionRate}% completion rate
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bulan Ini */}
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-purple-500 rounded-lg">
                          <FaCalendar className="h-5 w-5 text-white" />
                        </div>
                        <p className="text-sm font-semibold text-purple-700">
                          Bulan Ini
                        </p>
                      </div>
                      <p className="text-3xl font-bold text-purple-900 mb-1">
                        {statistics.thisMonth}
                      </p>
                      <p className="text-xs text-purple-600">
                        {new Date().toLocaleDateString("id-ID", {
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Section Title */}
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="font-bold text-2xl text-gray-800 mb-1">
                Riwayat Konsultasi
              </h2>
              <p className="text-gray-600 text-sm">
                Kelola dan pantau perkembangan konsultasi Anda
              </p>
            </div>
            <Button
              className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
              onClick={handleCreateConsultation}
            >
              <FaPlus className="h-4 w-4" />
              Konsultasi Baru
            </Button>
          </div>

          {/* Error message */}
          {error ? (
            <div className="text-center py-12">
              <div className="mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-500 text-2xl">⚠️</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Gagal Memuat Data
                </h2>
                <p className="text-gray-600 mb-4">{error}</p>
              </div>
              <Button onClick={() => window.location.reload()}>
                Coba Lagi
              </Button>
            </div>
          ) : consultations.length === 0 ? (
            <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300">
              <CardContent className="text-center py-16">
                <div className="p-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <FaClipboardCheck className="h-12 w-12 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Belum Ada Konsultasi
                </h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Mulai konsultasi pertama Anda dengan AI medis kami untuk
                  mendapatkan panduan kesehatan yang akurat
                </p>
                <Button
                  onClick={handleCreateConsultation}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                >
                  <FaPlus className="mr-2 h-5 w-5" />
                  Mulai Konsultasi Pertama
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Pagination Info */}
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-600">
                  Menampilkan {paginatedData.startIndex}-
                  {paginatedData.endIndex} dari {paginatedData.totalItems}{" "}
                  konsultasi
                </p>
                <div className="text-sm text-gray-500">
                  Halaman {currentPage} dari {paginatedData.totalPages}
                </div>
              </div>

              {/* Consultation Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedData.items.map((consultation: any) => (
                  <Card
                    key={consultation.id}
                    className="group border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden bg-white"
                  >
                    {/* HEADER */}
                    <div className="px-6 pb-4 border-b border-gray-300  flex justify-between items-start">
                      <div>
                        <h2 className="text-xl font-semibold text-primary tracking-tight">
                          Konsultasi #{consultation.id.slice(-8)}
                        </h2>
                        <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                          <FaRegClock className="h-4 w-4" />
                          <span>{formatDate(consultation.createdAt)}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        {getStatusBadge(consultation)}
                      </div>
                    </div>

                    {/* CONTENT */}
                    <CardContent className="">
                      {/* Patient Info */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="px-4 py-2 bg-secondary rounded-full flex items-center justify-center gap-4">
                          <FaStethoscope className="text-primary h-5 w-5" />{" "}
                          <h2 className="font-semibold">
                            {consultation.gejala}
                          </h2>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <FaUser className="text-primary h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Pasien</p>
                          <p className="font-medium text-gray-800">
                            {consultation.user.name}
                          </p>
                        </div>
                      </div>

                      {/* BADGES */}
                      <div className="flex flex-wrap gap-2">
                        {consultation.conversation?.length > 0 && (
                          <span className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                            {consultation.conversation.length} Pesan
                          </span>
                        )}

                        {consultation.report && (
                          <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            Laporan Tersedia
                          </span>
                        )}
                      </div>
                    </CardContent>

                    {/* cta */}
                    <div className="px-5 pt-2 flex justify-center w-full gap-2 border-t border-gray-100">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetail(consultation)}
                        className="flex items-center gap-2 w-full"
                      >
                        <FaEye className="h-4 w-4" />
                        Detail
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Pagination Controls */}
              {paginatedData.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!paginatedData.hasPrev}
                    className="flex items-center gap-1"
                  >
                    <FaChevronLeft className="h-3 w-3" />
                    Previous
                  </Button>

                  <div className="flex gap-1">
                    {/* First page */}
                    {currentPage > 3 && (
                      <>
                        <Button
                          variant={1 === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(1)}
                        >
                          1
                        </Button>
                        {currentPage > 4 && (
                          <span className="flex items-center px-2 text-gray-500">
                            ...
                          </span>
                        )}
                      </>
                    )}

                    {/* Current page range */}
                    {Array.from(
                      { length: Math.min(5, paginatedData.totalPages) },
                      (_, i) => {
                        const pageNumber = Math.max(1, currentPage - 2) + i;
                        if (pageNumber <= paginatedData.totalPages) {
                          return (
                            <Button
                              key={pageNumber}
                              variant={
                                pageNumber === currentPage
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() => handlePageChange(pageNumber)}
                            >
                              {pageNumber}
                            </Button>
                          );
                        }
                        return null;
                      }
                    ).filter(Boolean)}

                    {/* Last page */}
                    {currentPage < paginatedData.totalPages - 2 && (
                      <>
                        {currentPage < paginatedData.totalPages - 3 && (
                          <span className="flex items-center px-2 text-gray-500">
                            ...
                          </span>
                        )}
                        <Button
                          variant={
                            paginatedData.totalPages === currentPage
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() =>
                            handlePageChange(paginatedData.totalPages)
                          }
                        >
                          {paginatedData.totalPages}
                        </Button>
                      </>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!paginatedData.hasNext}
                    className="flex items-center gap-1"
                  >
                    Next
                    <FaChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Detail Modal */}
      <ConsultationDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedConsultation(null);
        }}
        consultation={selectedConsultation}
      />

      {/* Create Consultation Dialog */}
      <CreateConsultationDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
      />
    </>
  );
};

export default ConsultationPage;
