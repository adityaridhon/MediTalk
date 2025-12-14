import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IoIosArrowRoundBack } from "react-icons/io";
import { TiArrowLeft } from "react-icons/ti";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  iconVariant?: "arrow" | "round";
  className?: string;
}

export const PageHeader = ({
  title,
  subtitle,
  backHref = "/",
  backLabel = "Kembali",
  iconVariant = "round",
  className = "",
}: PageHeaderProps) => {
  const BackIcon = iconVariant === "round" ? IoIosArrowRoundBack : TiArrowLeft;

  return (
    <div
      className={`bg-gradient-to-l from-primary/100 to-primary/80 mb-6 ${className}`}
    >
      <div className="flex items-center justify-between gap-4 fixed top-0 left-0 right-0 z-10 bg-primary md:px-10 px-6 py-4 shadow-md">
        <Link href={backHref}>
          <Button
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border-white/20"
            variant="outline"
          >
            <BackIcon className="h-4 w-4" />
            {backLabel}
          </Button>
        </Link>
        <div className="text-white text-right">
          <h1 className="font-bold text-xl md:text-2xl mb-1">{title}</h1>
          {subtitle && (
            <p className="text-blue-100 text-xs md:text-sm md:block hidden">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
