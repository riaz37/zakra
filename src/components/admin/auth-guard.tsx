"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { getAccessToken } from "@/api/axios";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const fetchUser = useAuthStore((s) => s.fetchUser);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = getAccessToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    if (!isAuthenticated) {
      void fetchUser();
    }
  }, [isAuthenticated, fetchUser, router]);

  return <>{children}</>;
}
