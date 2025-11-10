import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Faqdata = [
  {
    value: "item-1",
    question: "Apakah layanan ini gratis?",
    answer:
      "Ya, layanan dasar konsultasi dengan AI voice agent dapat digunakan secara gratis. Namun, fitur premium seperti agen AI dengan bahasa lain akan tersedia di versi berbayar.",
  },
  {
    value: "item-2",
    question: "Apakah AI bisa menggantikan dokter?",
    answer:
      "Tidak. AI hanya memberikan saran awal berdasarkan informasi yang Anda berikan. Untuk diagnosis dan pengobatan yang akurat, Anda tetap harus berkonsultasi dengan tenaga medis profesional.",
  },
  {
    value: "item-3",
    question: "Perangkat apa saja yang bisa digunakan?",
    answer:
      "Website ini dapat diakses melalui desktop maupun mobile browser dengan dukungan perangkat suara (microphone, speaker). ",
  },
];

const Faq = () => {
  return (
    <div className="max-w-3xl mx-auto bg-gray-50/10 rounded-2xl shadow p-6 md:p-10">
      <Accordion type="single" collapsible className="space-y-4">
        {Faqdata.map((faq) => (
          <AccordionItem key={faq.value} value={faq.value}>
            <AccordionTrigger className="text-lg font-semibold">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-gray-600">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default Faq;
