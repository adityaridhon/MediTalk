import Navbar from "@/components/section/NavbarSection";
import HeroSection from "@/components/section/HeroSection";
import AboutSection from "@/components/section/AboutSection";
import TutorialSection from "@/components/section/TutorialSection";
import FAQSection from "@/components/section/FAQSection";
import Footer from "@/components/section/FooterSection";

export default function Home() {
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
