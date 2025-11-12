"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { FaUserDoctor } from "react-icons/fa6";
import LoginDialog from "@/components/ui/LoginDialog";
import { useSession } from "next-auth/react";
import Link from "next/link";

const HeroSection = () => {
  const { data: session } = useSession();

  const scrollToAbout = () => {
    const element = document.getElementById("tentang-kami");
    if (element) {
      const navbar = document.querySelector(".sticky");
      const navbarHeight = navbar
        ? navbar.getBoundingClientRect().height + 40
        : 120;
      const elementPosition = element.offsetTop;
      const offsetPosition = elementPosition - navbarHeight;

      window.scrollTo({
        behavior: "smooth",
        top: Math.max(0, offsetPosition),
      });
    }
  };

  return (
    <section id="beranda">
      <div className="hero-section flex flex-col-reverse md:flex-row items-center justify-center gap-10 my-20">
        <div className="caption max-w-xl text-center md:text-left space-y-4">
          <div className="inline-flex items-center justify-center bg-gradient-to-br from-primary to-primary/50 rounded-full px-4 py-1.5 hover:shadow-lg transition-transform duration-300">
            <h3 className="text-white text-md flex items-center">
              Selamat datang di Meditalk{" "}
              <FaUserDoctor className="inline-block ml-1 mb-0.5" />
            </h3>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold --font-title">
            Kesehatanmu, Prioritas Kami
          </h1>

          <p className="text-gray-600">
            Kami memberikan solusi praktis untuk anda yang ingin berkonsultasi
            mengenai gejala medis dengan bantuan agen AI yang kami miliki. Jaga
            kesehatan anda dengan berkonsultasi dengan kami!
          </p>

          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            {!session ? (
              <LoginDialog>
                <Button>Mulai sekarang</Button>
              </LoginDialog>
            ) : (
              <Link href="/consultation">
                <Button>Mulai Konsultasi</Button>
              </Link>
            )}
            <Button variant="outline" onClick={scrollToAbout}>
              Lihat selengkapnya
            </Button>
          </div>
        </div>

        <div className="image">
          <Image
            src="/assets/hero.svg"
            alt="Hero Image"
            width={400}
            height={400}
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
