"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ConsultationDetailModal } from "@/components/ui/DetailConsultation";
import { CreateConsultationDialog } from "@/components/ui/SymptomDialog";
import Image from "next/image";
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
import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/ui/page-header";
import { useConsultations } from "@/hooks/useConsultations";

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

  return (
    <>
      <section className="mx-2 md:mx-0 min-h-[92vh]">
        <PageHeader
          title="Riwayat Konsultasi"
          subtitle="Kelola dan lihat riwayat konsultasi Anda dengan AI medis"
          backHref="/"
          backLabel="Kembali"
        />

        <div className="pt-20 max-w-6xl mx-auto px-4 mb-12">
          {loading || status === "loading" ? (
            <>
              {/* Statistics Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[1, 2, 3].map((i) => (
                  <Card
                    key={i}
                    className="bg-gradient-to-br from-gray-50 to-gray-100"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-10 w-16 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Section Title Skeleton */}
              <div className="mb-6 flex flex-col md:flex-row justify-between md:items-center">
                <div className="flex-1">
                  <Skeleton className="h-8 w-64 mb-2" />
                  <Skeleton className="h-4 w-80" />
                </div>
                <Skeleton className="h-10 w-full md:w-40 mt-4 md:mt-0" />
              </div>

              {/* Cards Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="border border-gray-100">
                    <div className="px-6 pb-4 border-b border-gray-300">
                      <Skeleton className="h-6 w-40 mb-2" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-16 w-full rounded-full" />
                      </div>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-3 w-16 mb-1" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-7 w-24 rounded-full" />
                        <Skeleton className="h-7 w-32 rounded-full" />
                      </div>
                    </CardContent>
                    <div className="px-5 pt-2 border-t border-gray-100">
                      <Skeleton className="h-9 w-full" />
                    </div>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Statistics Cards */}
              {!error && consultations.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                          <p className="text-xs text-blue-600">
                            Sepanjang waktu
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

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
              <div className="mb-6 flex flex-col md:flex-row justify-between md:items-center">
                <div>
                  <h2 className="text-start font-bold text-2xl text-gray-800 mb-1">
                    Riwayat Konsultasi
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Kelola dan pantau perkembangan konsultasi Anda
                  </p>
                </div>
                <Button
                  className="w-full md:w-auto mt-4 md:mt-0"
                  onClick={handleCreateConsultation}
                >
                  <FaPlus className="h-4 w-4" />
                  Konsultasi Baru
                </Button>
              </div>

              {/* Error or Empty State */}
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
                    <div className="p-4 mx-auto mb-6 flex items-center justify-center">
                      <Image
                        src="/assets/consult.svg"
                        alt="No Consultations"
                        width={200}
                        height={200}
                      />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                      Belum Ada Konsultasi
                    </h2>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      Mulai konsultasi pertama Anda dengan AI medis kami untuk
                      mendapatkan panduan kesehatan yang akurat
                    </p>
                    <Button onClick={handleCreateConsultation} size="lg">
                      <FaPlus className="mr-2 h-5 w-5" />
                      Mulai Konsultasi Pertama
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedData.items.map((consultation: any) => (
                      <Card
                        key={consultation.id}
                        className="group border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden bg-white"
                      >
                        <div className="px-6 pb-4 border-b border-gray-300 flex justify-between items-start">
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

                        <CardContent className="">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="px-4 py-2 bg-secondary rounded-full flex items-center justify-center gap-4">
                              <FaStethoscope className="text-primary h-5 w-5" />
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
                        {currentPage > 3 && (
                          <>
                            <Button
                              variant={
                                1 === currentPage ? "default" : "outline"
                              }
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
            </>
          )}
        </div>
      </section>

      <ConsultationDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedConsultation(null);
        }}
        consultation={selectedConsultation}
      />

      <CreateConsultationDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
      />
    </>
  );
};

export default ConsultationPage;
