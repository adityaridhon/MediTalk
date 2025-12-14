import React from "react";
import FaqAccordion from "@/components/ui/faq-accordion";

const FAQSection = () => {
  return (
    <section className="flex flex-col pb-14 mx-20 md:mx-0" id="faq">
      <h1 className="text-3xl md:text-4xl font-bold text-center italic">
        Frequently Asked <span className="text-primary">Questions</span>
      </h1>
      <p className="text-center mt-4 mb-8">
        Pertanyaan yang sering kami terima
      </p>
      <div>
        <FaqAccordion />
      </div>
    </section>
  );
};

export default FAQSection;
