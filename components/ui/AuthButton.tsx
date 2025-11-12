"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import LoginDialog from "./LoginDialog";

interface AuthButtonProps {
  isMobile?: boolean;
  onMenuClose?: () => void;
}

export default function AuthButton({
  isMobile = false,
  onMenuClose,
}: AuthButtonProps) {
  const { data: session, status } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
    setIsDropdownOpen(false);
    if (onMenuClose) onMenuClose();
  };

  const handleConsultation = () => {
    setIsDropdownOpen(false);
    if (onMenuClose) onMenuClose();
  };

  if (status === "loading") {
    return (
      <Button disabled className={isMobile ? "w-full" : ""}>
        Login
      </Button>
    );
  }

  if (!session) {
    return (
      <LoginDialog>
        <Button className={isMobile ? "w-full" : ""}>Login</Button>
      </LoginDialog>
    );
  }

  // Mobile version - simple buttons
  if (isMobile) {
    return (
      <div className="flex flex-col gap-2 w-full">
        <Link href="/consultation" onClick={handleConsultation}>
          <Button className="w-full bg-primary hover:bg-primary/90">
            💬 Konsultasi
          </Button>
        </Link>
        <Button variant="outline" onClick={handleSignOut} className="w-full">
          🚪 Logout
        </Button>
      </div>
    );
  }

  // Desktop version - dropdown
  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2"
      >
        <span>👤</span>
        <span className="hidden sm:inline">
          {session.user?.name?.split(" ")[0] || "User"}
        </span>
        <span
          className={`transition-transform ${
            isDropdownOpen ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </Button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-50">
          <div className="px-4 py-2 border-b">
            <p className="text-sm font-medium text-gray-900">
              {session.user?.name}
            </p>
            <p className="text-xs text-gray-500">{session.user?.email}</p>
          </div>

          <div className="py-1">
            <Link
              href="/consultation"
              onClick={handleConsultation}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Konsultasi
            </Link>

            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
