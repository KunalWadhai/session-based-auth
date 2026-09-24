// components/providers/AuthProvider.tsx

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { authApi } from "@/api/calls/auth/auth";
import { authStore } from "@/store/auth";
import { User } from "@/types/user";

interface AuthContextValue {
  user: User | null;
  loading: boolean;

  loginUser: (
    accessToken: string,
    user: User,
  ) => void;

  logoutUser: () => void;

  refreshUser: () => Promise<void>;
}

const AuthContext =
  createContext<AuthContextValue | null>(
    null,
  );

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  async function initializeAuth() {
    try {
      /*
       * Access token is intentionally
       * stored only in memory.
       *
       * Therefore after browser refresh:
       *
       * accessToken === null
       *
       * We use the refreshToken cookie
       * to get a new accessToken.
       */
      const refreshResponse =
        await authApi.refresh();

      const accessToken =
        refreshResponse.data.accessToken;

      authStore.setAccessToken(
        accessToken,
      );

      /*
       * Now accessToken exists,
       * so /auth/me will send:
       *
       * Authorization: Bearer <token>
       */
      const meResponse =
        await authApi.me();

      setUser(meResponse.data.user);
    } catch {
      authStore.clearAccessToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function refreshUser() {
    try {
      const response =
        await authApi.me();

      setUser(response.data.user);
    } catch {
      setUser(null);
    }
  }

  function loginUser(
    accessToken: string,
    user: User,
  ) {
    authStore.setAccessToken(
      accessToken,
    );

    setUser(user);
  }

  function logoutUser() {
    authStore.clearAccessToken();
    setUser(null);
  }

  useEffect(() => {
    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginUser,
        logoutUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuthContext must be used inside AuthProvider",
    );
  }

  return context;
}