// lib/api/client.ts

import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

import { authStore } from "@/store/auth";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL;

export const apiClient = axios.create({
  baseURL: API_URL,

  /*
   * Very important.
   *
   * This allows the browser to send the
   * refreshToken HttpOnly cookie to Express.
   */
  withCredentials: true,

  headers: {
    "Content-Type": "application/json",
  },
});

/*
 * Attach access token to every request.
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken =
      authStore.getAccessToken();

    if (accessToken) {
      config.headers.Authorization =
        `Bearer ${accessToken}`;
    }

    return config;
  },
);

/*
 * Prevent multiple refresh requests
 * when several APIs return 401 simultaneously.
 */
let isRefreshing = false;

let refreshSubscribers: Array<
  (token: string) => void
> = [];

function subscribeToTokenRefresh(
  callback: (token: string) => void,
) {
  refreshSubscribers.push(callback);
}

function notifySubscribers(
  token: string,
) {
  refreshSubscribers.forEach(
    (callback) => callback(token),
  );

  refreshSubscribers = [];
}

function clearSubscribers() {
  refreshSubscribers = [];
}

/*
 * Response interceptor.
 *
 * If accessToken expires:
 *
 * API → 401
 *      ↓
 * /auth/refresh
 *      ↓
 * new accessToken
 *      ↓
 * retry original request
 */
apiClient.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest =
      error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

    /*
     * Don't refresh if:
     *
     * 1. request isn't 401
     * 2. request has already been retried
     * 3. request itself is /auth/refresh
     */
    if (
      error.response?.status !== 401 ||
      originalRequest?._retry ||
      originalRequest?.url?.includes(
        "/auth/refresh-token",
      )
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    /*
     * Another request is already
     * refreshing the token.
     */
    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeToTokenRefresh(
          (newAccessToken) => {
            originalRequest.headers.Authorization =
              `Bearer ${newAccessToken}`;

            resolve(
              apiClient(originalRequest),
            );
          },
        );
      });
    }

    isRefreshing = true;

    try {
      /*
       * Browser automatically sends
       * refreshToken cookie because
       * withCredentials = true.
       */
      const response =
        await axios.get(
          `${API_URL}/auth/refresh-token`,
          {
            withCredentials: true,
          },
        );

      const newAccessToken =
        response.data.data.accessToken;

      /*
       * Store new token in memory.
       */
      authStore.setAccessToken(
        newAccessToken,
      );

      /*
       * Resolve requests that were waiting
       * for the refresh.
       */
      notifySubscribers(
        newAccessToken,
      );

      /*
       * Retry original request.
       */
      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;

      return apiClient(originalRequest);
    } catch (refreshError) {
      /*
       * Refresh token is invalid/expired.
       */
      authStore.clearAccessToken();

      clearSubscribers();

      return Promise.reject(
        refreshError,
      );
    } finally {
      isRefreshing = false;
    }
  },
);