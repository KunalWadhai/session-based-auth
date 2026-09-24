import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .email("Enter a valid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name is too long"),

    email: z
      .string()
      .email("Enter a valid email address"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters"),

    confirmPassword: z
      .string(),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    },
  );

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email("Enter a valid email address"),
});

export type LoginFormValues =
  z.infer<typeof loginSchema>;

export type RegisterFormValues =
  z.infer<typeof registerSchema>;

export type ForgotPasswordFormValues =
  z.infer<typeof forgotPasswordSchema>;