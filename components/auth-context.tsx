"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "./toast";

export type UserRole = "admin" | "reader";

interface AuthContextType {
  role: UserRole;
  isAdmin: boolean;
  adminToken: string;
  loginAsAdmin: (password?: string) => boolean;
  logout: () => void;
  isAdminModalOpen: boolean;
  openAdminModal: () => void;
  closeAdminModal: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEFAULT_ADMIN_SECRETS = ["onnesha@admin2026", "onnesha2026"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>("reader");
  const [adminToken, setAdminToken] = useState<string>("");
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    // Check if previously logged in as admin
    const savedRole = localStorage.getItem("onnesha-user-role");
    const savedToken = localStorage.getItem("onnesha-admin-token") || "";
    if (savedRole === "admin") {
      setRole("admin");
      setAdminToken(savedToken || process.env.NEXT_PUBLIC_ADMIN_SECRET || "onnesha@admin2026");
    } else {
      setRole("reader");
      setAdminToken("");
    }
  }, []);

  const loginAsAdmin = (password?: string): boolean => {
    if (!password || !password.trim()) {
      showToast("Admin secret key is required.");
      return false;
    }

    const inputClean = password.trim();
    const envSecret = process.env.NEXT_PUBLIC_ADMIN_SECRET;
    const allowed = envSecret ? [envSecret, ...DEFAULT_ADMIN_SECRETS] : DEFAULT_ADMIN_SECRETS;

    if (allowed.includes(inputClean)) {
      setRole("admin");
      setAdminToken(inputClean);
      localStorage.setItem("onnesha-user-role", "admin");
      localStorage.setItem("onnesha-admin-token", inputClean);
      setIsAdminModalOpen(false);
      showToast("Signed in as Admin. Full AI Studio unlocked!");
      return true;
    }

    showToast("Invalid admin secret. Access denied.");
    return false;
  };

  const logout = () => {
    setRole("reader");
    setAdminToken("");
    localStorage.setItem("onnesha-user-role", "reader");
    localStorage.removeItem("onnesha-admin-token");
    showToast("Switched to Reader Mode. You have read-only access.");
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        isAdmin: role === "admin",
        adminToken,
        loginAsAdmin,
        logout,
        isAdminModalOpen,
        openAdminModal: () => setIsAdminModalOpen(true),
        closeAdminModal: () => setIsAdminModalOpen(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
