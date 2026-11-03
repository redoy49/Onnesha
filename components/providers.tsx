"use client";

import React from "react";
import { ToastProvider } from "@/components/toast";
import { AuthProvider } from "@/components/auth-context";
import { ThemeProvider } from "@/components/theme-context";
import { AdminLoginModal } from "@/components/admin-login-modal";
import { PaletteModal } from "@/components/palette-modal";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <ThemeProvider>
          {children}
          <AdminLoginModal />
          <PaletteModal />
        </ThemeProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
