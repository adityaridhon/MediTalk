"use client";

import React, { useState } from "react";
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

interface LoginDialogProps {
  children: React.ReactNode;
}

const LoginDialog = ({ children }: LoginDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      await signIn("google", {
        callbackUrl: "/",
      });
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
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
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                Masuk...
              </>
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
