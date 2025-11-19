"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { RiMenuFill, RiCloseFill } from "react-icons/ri";
import AuthButton from "@/components/ui/AuthButton";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const navbar = document.querySelector(".sticky");
      const navbarHeight = navbar
        ? navbar.getBoundingClientRect().height + 50
        : 120;
      const elementPosition = element.offsetTop;
      const offsetPosition = elementPosition - navbarHeight;

      window.scrollTo({
        behavior: "smooth",
        top: Math.max(0, offsetPosition),
      });
    }
    setIsMenuOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    setIsMenuOpen(false);
  };

  return (
    <div className="sticky top-6 w-full mx-auto z-50">
      <div
        className={`wrap mt-6 py-4.5 px-8 mx-6 md:px-12 bg-white m-2 md:m-6 shadow-md ${
          isMenuOpen ? "rounded-2xl" : "rounded-2xl"
        } md:rounded-full`}
      >
        <div className="navbar flex justify-between items-center">
          {/* Logo */}
          <Link href={"/"} className="logo flex items-center gap-4">
            <Image src="/assets/logo.png" alt="Logo" width={40} height={40} />
            <button
              onClick={scrollToTop}
              className="text-primary font-bold text-2xl hover:text-primary/80 transition-colors cursor-pointer"
            >
              MediTalk
            </button>
          </Link>

          {/* Desktop Menu */}
          <div className="menu hidden md:block">
            <ul className="flex items-center gap-4 text-primary font-semibold">
              <li>
                <button
                  className="px-4 py-2 rounded-md hover:bg-primary hover:text-white transition-all duration-150 cursor-pointer"
                  onClick={() => scrollToSection("beranda")}
                >
                  Beranda
                </button>
              </li>
              <li>
                <button
                  className="px-4 py-2 rounded-md hover:bg-primary hover:text-white transition-all duration-150 cursor-pointer"
                  onClick={() => scrollToSection("tentang-kami")}
                >
                  Tentang kami
                </button>
              </li>
              <li>
                <button
                  className="px-4 py-2 rounded-md hover:bg-primary hover:text-white transition-all duration-150 cursor-pointer"
                  onClick={() => scrollToSection("panduan")}
                >
                  Panduan Pengguna
                </button>
              </li>
              <li>
                <button
                  className="px-4 py-2 rounded-md hover:bg-primary hover:text-white transition-all duration-150 cursor-pointer"
                  onClick={() => scrollToSection("faq")}
                >
                  FAQ
                </button>
              </li>
              <li>
                <AuthButton />
              </li>
            </ul>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-primary p-2 rounded-lg  transition-colors"
            >
              {isMenuOpen ? (
                <RiCloseFill className="w-6 h-6" />
              ) : (
                <RiMenuFill className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-white">
            <ul className="flex flex-col gap-2 text-primary font-semibold">
              <li>
                <button
                  className="block w-full text-left px-4 py-3 rounded-md hover:bg-primary hover:text-white transition-all duration-150 cursor-pointer"
                  onClick={() => scrollToSection("beranda")}
                >
                  Beranda
                </button>
              </li>
              <li>
                <button
                  className="block w-full text-left px-4 py-3 rounded-md hover:bg-primary hover:text-white transition-all duration-150 cursor-pointer"
                  onClick={() => scrollToSection("tentang-kami")}
                >
                  Tentang kami
                </button>
              </li>
              <li>
                <button
                  className="block w-full text-left px-4 py-3 rounded-md hover:bg-primary hover:text-white transition-all duration-150 cursor-pointer"
                  onClick={() => scrollToSection("panduan")}
                >
                  Panduan Pengguna
                </button>
              </li>
              <li>
                <button
                  className="block w-full text-left px-4 py-3 rounded-md hover:bg-primary hover:text-white transition-all duration-150 cursor-pointer"
                  onClick={() => scrollToSection("faq")}
                >
                  FAQ
                </button>
              </li>
              <li className="px-4 py-3">
                <AuthButton isMobile={true} onMenuClose={toggleMenu} />
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
