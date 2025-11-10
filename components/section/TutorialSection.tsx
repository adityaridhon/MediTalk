import React from "react";
import VideoPopup from "@/components/ui/video-popup";

const TutorialSection = () => {
  return (
    <section
      className="flex flex-col justify-center items-center max-w-5xl mx-auto my-20 px-4"
      id="panduan-faq"
    >
      <h1 className="text-3xl md:text-4xl font-bold text-center ">
        Panduan <span className="text-primary">penggunaan</span>
      </h1>
      <p className="text-center mt-4 mb-8">
        Ikuti panduan video dibawah ini untuk mempelajari cara berkonsultasi
        dengan agen AI kami secara efektif.
      </p>
      <div className="max-w-sm md:max-w-2xl">
        <VideoPopup />
      </div>
    </section>
  );
};

export default TutorialSection;
