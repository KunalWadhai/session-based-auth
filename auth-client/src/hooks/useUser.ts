  // hooks/useUser.ts

"use client";

import { useAuthContext } from "@/components/providers/AuthProvider";

export function useUser() {
  const {
    user,
    loading,
  } = useAuthContext();

  return {
    user,
    loading,
    isAuthenticated:
      Boolean(user),
  };
}