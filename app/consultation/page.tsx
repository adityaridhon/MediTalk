"use client";

import React, { useState, useEffect } from "react";
import { TiArrowLeft } from "react-icons/ti";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  FaHistory,
  FaStethoscope,
  FaCalendarAlt,
  FaClock,
  FaChartBar,
  FaComments,
  FaUser,
} from "react-icons/fa";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Consultation {
  id: string;
  gejala: string;
  conversation: any[];
  report: any;
  createdBy: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

const ConsultationPage = () => {
  const [gejala, setGejala] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const router = useRouter();
  const { data: session, status } = useSession();

  // Pagination
  const totalPages = Math.ceil(consultations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentConsultations = consultations.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1);
  };

  useEffect(() => {
    const fetchConsultations = async () => {
      if (session?.user) {
        try {
          const response = await fetch("/api/consultation");
          if (response.ok) {
            const result = await response.json();
            setConsultations(result.data || []);
            setCurrentPage(1);
          } else {
            console.error("Failed to fetch consultations:", response.status);
          }
        } catch (error) {
          console.error("Error fetching consultations:", error);
        } finally {
          setLoading(false);
        }
      } else if (status !== "loading") {
        setLoading(false);
      }
    };

    fetchConsultations();
  }, [session, status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (gejala.trim()) {
      try {
        const response = await fetch("/api/consultation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            gejala: gejala.trim(),
          }),
        });

        if (response.ok) {
          const result = await response.json();
          const consultationId = result.data.id;

          // Redirect ke medical-agent dengan ID
          router.push(`/consultation/medical-agent/${consultationId}`);
          setIsOpen(false);
        } else {
          const error = await response.json();
          console.error("Error creating consultation:", error);
          if (error.error === "Unauthorized - Please login first") {
            alert("Silakan login terlebih dahulu untuk membuat konsultasi.");
          } else {
            alert("Gagal membuat konsultasi. Silakan coba lagi.");
          }
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Terjadi kesalahan. Silakan coba lagi.");
      }
    }
  };

  // Loading
  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="md:mx-auto mx-10 my-6 md:px-6 md:pb-8 bg-white rounded-2xl shadow-md max-w-6xl min-h-[92vh]">
      {/* Navigation */}
      <div className="flex justify-between items-center gap-4 p-5 border-b border-b-gray-200 mb-6">
        <Link href={"/"}>
          <Button variant={"ghost"}>
            <TiArrowLeft className="size-5" /> Kembali
          </Button>
        </Link>
        <h1 className="font-bold text-2xl text-primary">Konsultasi</h1>
      </div>

      {/* Conditional Content */}
      {consultations.length > 0 ? (
        // History
        <div className="px-5">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <FaHistory className="text-primary size-6" />
              <h2 className="text-xl font-semibold">Riwayat Konsultasi</h2>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Tampilkan:</span>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={handleItemsPerPageChange}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="15">15</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-gray-600">per halaman</span>
              </div>

              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button>Konsultasi Baru</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Mulai Konsultasi Baru</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label
                        htmlFor="gejala"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Ceritakan gejala yang Anda rasakan
                      </label>
                      <textarea
                        id="gejala"
                        value={gejala}
                        onChange={(e) => setGejala(e.target.value)}
                        placeholder="Masukkan gejala yang Anda rasakan..."
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        rows={4}
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsOpen(false)}
                      >
                        Batal
                      </Button>
                      <Button type="submit">Mulai Konsultasi</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Statsitk */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <FaChartBar className="text-blue-500 size-5" />
                  <div>
                    <p className="text-sm text-gray-600">Total Konsultasi</p>
                    <p className="text-2xl font-bold">{consultations.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="text-purple-500 size-5" />
                  <div>
                    <p className="text-sm text-gray-600">Bulan Ini</p>
                    <p className="text-2xl font-bold">
                      {
                        consultations.filter((c) => {
                          const consultDate = new Date(c.createdAt);
                          const now = new Date();
                          return (
                            consultDate.getMonth() === now.getMonth() &&
                            consultDate.getFullYear() === now.getFullYear()
                          );
                        }).length
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <FaClock className="text-orange-500 size-5" />
                  <div>
                    <p className="text-sm text-gray-600">Konsultasi Terakhir</p>
                    <p className="text-2xl font-bold">
                      {consultations.length > 0
                        ? new Date(
                            consultations[0].createdAt
                          ).toLocaleDateString("id-ID")
                        : "Belum ada"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabel riwayat */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FaHistory className="text-primary size-5" />
                Riwayat Konsultasi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">No</TableHead>
                    <TableHead>Gejala</TableHead>
                    <TableHead className="w-32">Tanggal</TableHead>
                    <TableHead className="w-32">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentConsultations.map((consultation, index) => (
                    <TableRow key={consultation.id}>
                      <TableCell className="font-medium">
                        {startIndex + index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="truncate" title={consultation.gejala}>
                            {consultation.gejala}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>
                            {new Date(
                              consultation.createdAt
                            ).toLocaleDateString("id-ID")}
                          </p>
                          <p className="text-gray-500">
                            {new Date(
                              consultation.createdAt
                            ).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            router.push(
                              `/consultation/detail/${consultation.id}`
                            )
                          }
                        >
                          Detail
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Pagination  */}
          {totalPages > 1 && (
            <div className="mt-6 space-y-4">
              <div className="text-center text-sm text-gray-600">
                Menampilkan {startIndex + 1}-
                {Math.min(endIndex, consultations.length)} dari{" "}
                {consultations.length} konsultasi
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        handlePageChange(Math.max(1, currentPage - 1))
                      }
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {/* First page */}
                  {currentPage > 2 && (
                    <>
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => handlePageChange(1)}
                          className="cursor-pointer"
                        >
                          1
                        </PaginationLink>
                      </PaginationItem>
                      {currentPage > 3 && <PaginationEllipsis />}
                    </>
                  )}

                  {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage <= 2) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 1) {
                      pageNum = totalPages - 2 + i;
                    } else {
                      pageNum = currentPage - 1 + i;
                    }

                    if (pageNum <= totalPages && pageNum >= 1) {
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            onClick={() => handlePageChange(pageNum)}
                            isActive={currentPage === pageNum}
                            className="cursor-pointer"
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                    return null;
                  })}

                  {currentPage < totalPages - 1 && (
                    <>
                      {currentPage < totalPages - 2 && <PaginationEllipsis />}
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => handlePageChange(totalPages)}
                          className="cursor-pointer"
                        >
                          {totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    </>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        handlePageChange(Math.min(totalPages, currentPage + 1))
                      }
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-col justify-center items-center">
          <Image
            src="/assets/consult.svg"
            alt="Consultation"
            width={300}
            height={300}
            className="mx-auto mt-8"
          />
          <h1 className="font-bold text-2xl text-center my-3">
            Konsultasikan gejalamu sekarang!
          </h1>
          <div className="text-center">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button>Mulai Konsultasi</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Tambah Konsultasi</DialogTitle>
                  <DialogDescription>
                    Berikan kami beberapa informasi tentang gejala yang kamu
                    alami.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4">
                    <div className="grid gap-3">
                      <Label htmlFor="gejala">Gejala</Label>
                      <Textarea
                        id="gejala"
                        placeholder="Ketik gejala yang kamu alami di sini...."
                        className="resize-none h-[100px]"
                        value={gejala}
                        onChange={(e) => setGejala(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter className="mt-4">
                    <DialogClose asChild>
                      <Button variant="outline" type="button">
                        Batal
                      </Button>
                    </DialogClose>
                    <Button type="submit" disabled={!gejala.trim()}>
                      Lanjut
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}
    </section>
  );
};

export default ConsultationPage;
