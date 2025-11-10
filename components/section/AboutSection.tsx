import React from "react";
import Image from "next/image";
import { AiFillSafetyCertificate, AiOutlineHistory } from "react-icons/ai";
import { MdOutlineTranscribe } from "react-icons/md";

const cardAbout = [
  {
    icon: <AiFillSafetyCertificate size={25} />,

    name: "PRIVASI",
    desc: "Data kamu terenskripsi dan hanya kamu yang bisa mengaksesnya.",
  },
  {
    icon: <AiOutlineHistory size={25} />,
    name: "RINGKASAN",
    desc: "Kamu dapat melihat ringkasan konsultasi yang sudah kamu lakukan.",
  },
  {
    icon: <MdOutlineTranscribe size={25} />,
    name: "TRANSKRIP",
    desc: "Kamu dapat melihat transkrip konsultasimu dengan agen kami.",
  },
];

const AboutSection = () => {
  return (
    <section
      className="flex justify-center items-center gap-10 max-w-6xl mx-auto my-20 flex-col md:flex-row"
      id="tentang-kami"
    >
      <div className="img">
        <Image
          src="/assets/consult.svg"
          alt="About Us"
          //   layout="responsive"
          width={1000}
          height={1200}
        />
      </div>
      <div className="capt">
        <div className="text space-y-4">
          <h1 className="text-4xl font-bold text-primary">
            Kami hadir untuk kesehatanmu!
          </h1>
          <p>
            Kami menyediakan layanan konsultasi kesehatan yang mudah diakses dan
            terpercaya. Kami siap membantu keluhan yang kamu rasakan dan
            memberikan solusi awal untuk membantumu.{" "}
            <strong>Jangan ragu, jangan malu! </strong>
            Data kamu kami simpan dengan aman dan rahasia.
          </p>
        </div>
        <div className="card-wrap grid grid-cols-1 md:grid-cols-3 place-items-center mx-auto mt-2 gap-6 ">
          {cardAbout.map((c, i) => (
            <div
              key={i}
              className="relative bg-white p-5 rounded-lg mt-8 md:w-52 md:h-36 w-80 text-center shadow-sm transition-all duration-300 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[10px_10px_0_#22c55e]"
            >
              {/* Icon */}
              <div className="absolute left-1/2 -top-6 transform -translate-x-1/2 bg-primary/10 border-2 border-primary text-primary rounded-full p-3">
                {c.icon}
              </div>
              {/* Text content */}
              <h1 className="mt-5 font-semibold text-lg">{c.name}</h1>
              <p className="text-sm md:text-xs text-gray-600 mt-1">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
