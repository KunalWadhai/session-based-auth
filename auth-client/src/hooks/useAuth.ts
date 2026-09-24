// hooks/useAuth.ts

"use client";

import { useRouter } from "next/navigation";

import { authApi } from "@/api/calls/auth/auth";
import { authStore } from "@/store/auth";

import {
  useAuthContext,
} from "@/components/providers/AuthProvider";

export function useAuth() {
  const router = useRouter();

  const {
    user,
    loading,
    loginUser,
    logoutUser,
    refreshUser,
  } = useAuthContext();

  async function login(credentials: {
    email: string;
    password: string;
  }) {
    const response =
      await authApi.login(credentials);

    const {
      accessToken,
      user,
    } = response.data;

    /*
     * Access token lives only in memory.
     */
    loginUser(
      accessToken,
      user,
    );

    router.push("/dashboard");
    router.refresh();

    return response;
  }

  async function register(data: {
    username: string;
    email: string;
    password: string;
  }) {
    const response =
      await authApi.register(data);

    router.push("/login");

    return response;
  }

  async function logout() {
    try {
      await authApi.logout();
    } finally {
      /*
       * Remove access token from memory.
       */
      authStore.clearAccessToken();

      logoutUser();

      router.replace("/login");
      router.refresh();
    }
  }

  return {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
  };
}