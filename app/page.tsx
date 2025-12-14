"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/section/NavbarSection";
import HeroSection from "@/components/section/HeroSection";
import AboutSection from "@/components/section/AboutSection";
import TutorialSection from "@/components/section/TutorialSection";
import FAQSection from "@/components/section/FAQSection";
import Footer from "@/components/section/FooterSection";

function HomeContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const shouldLogin = searchParams.get("login");
    const redirectPath = searchParams.get("redirect");

    if (shouldLogin === "true") {
      window.dispatchEvent(
        new CustomEvent("openLoginDialog", {
          detail: { redirectPath },
        })
      );
      const url = new URL(window.location.href);
      url.searchParams.delete("login");
      url.searchParams.delete("redirect");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams]);

  return (
    <>
      <Navbar />
      <HeroSection />
      <AboutSection />
      <TutorialSection />
      <FAQSection />
      <Footer />
    </>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
