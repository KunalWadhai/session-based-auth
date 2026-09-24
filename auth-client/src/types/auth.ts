import { User } from "./user"

export interface AuthResposne {
    user: User,
    message: string
}

export interface LoginRequest {
    email: string,
    password: string
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;

  data: {
    accessToken: string;
    user: User;
  };
}

export interface RefreshResponse {
  success: boolean;
  message: string;

  data: {
    accessToken: string;
  };
}

export interface MeResponse {
  success: boolean;
  data: {
    user: User;
  };
}

export interface GenericAuthResponse {
  success: boolean;
  message: string;
}