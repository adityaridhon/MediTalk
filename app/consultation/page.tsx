"use client";

import React, { useState } from "react";
import { TiArrowLeft } from "react-icons/ti";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
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
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

const ConsultationPage = () => {
  const [gejala, setGejala] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gejala.trim()) {
      const encodedGejala = encodeURIComponent(gejala);
      router.push(`/consultation/medical-agent?gejala=${encodedGejala}`);
    }
  };

  return (
    <section className="md:mx-auto mx-10 mt-6 md:px-4 bg-white rounded-2xl shadow-md max-w-7xl h-[92vh]">
      {/* Navigasion */}
      <div className="flex justify-between items-center gap-4 p-5 border-b border-b-gray-200 mb-10">
        <Link href={"/"}>
          <Button variant={"ghost"}>
            <TiArrowLeft className="size-5" /> Kembali
          </Button>
        </Link>
        <h1 className="font-bold text-2xl text-primary">Konsultasi</h1>
      </div>

      {/* Dialog */}
      <div className="flex-col justify-center items-center ">
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
    </section>
  );
};

export default ConsultationPage;
