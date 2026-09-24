// lib/api/auth.api.ts

import { apiClient } from "../../lib/client";

import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  MeResponse,
  GenericAuthResponse,
  RefreshResponse,
} from "@/types/auth";

export const authApi = {
  async login(payload: LoginRequest) {
    const response =
      await apiClient.post<LoginResponse>(
        "/auth/login",
        payload,
      );

    return response.data;
  },

  async register(payload: RegisterRequest) {
    const response =
      await apiClient.post<GenericAuthResponse>(
        "/auth/register",
        payload,
      );

    return response.data;
  },

  async logout() {
    const response =
      await apiClient.get<GenericAuthResponse>(
        "/auth/logout",
      );

    return response.data;
  },

  async me() {
    const response =
      await apiClient.get<MeResponse>(
        "/auth/me",
      );

    return response.data;
  },

  async refresh() {
    const response =
      await apiClient.get<RefreshResponse>(
        "/auth/refresh-token",
      );

    return response.data;
  },

  async forgotPassword(email: string) {
    const response =
      await apiClient.post<GenericAuthResponse>(
        "/auth/forgot-password",
        { email },
      );

    return response.data;
  },
};