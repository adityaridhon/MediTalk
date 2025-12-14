"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FaGoogle } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

interface LoginDialogProps {
  children: React.ReactNode;
}

const LoginDialog = ({ children }: LoginDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Listen for custom event to open dialog
    const handleOpenDialog = (event: CustomEvent) => {
      setIsOpen(true);
      setRedirectPath(event.detail?.redirectPath || null);
    };

    window.addEventListener("openLoginDialog" as any, handleOpenDialog);

    return () => {
      window.removeEventListener("openLoginDialog" as any, handleOpenDialog);
    };
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      await signIn("google", {
        callbackUrl: redirectPath || "/consultation",
      });
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      {/* Isi popupp */}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-primary">
            Login ke MediTalk
          </DialogTitle>
          <DialogDescription className="text-center text-gray-500">
            Masuk untuk memulai konsultasi kesehatan dengan AI
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-4">
          <Button
            onClick={handleGoogleLogin}
            variant="outline"
            className="w-full flex items-center justify-center gap-2 hover:bg-gray-50"
            disabled={isLoading}
          >
            {isLoading ? (
              <>Masuk...</>
            ) : (
              <>
                <FaGoogle className="text-blue-500" />
                Login dengan Google
              </>
            )}
          </Button>
        </div>

        <div className="text-center text-xs text-gray-500 mt-4">
          Dengan login, Anda menyetujui Syarat & Ketentuan kami
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
