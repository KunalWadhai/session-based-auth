"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import GlassCard from "@/components/ui/GlassCard";

import {
  loginSchema,
  LoginFormValues,
} from "@/lib/validations/auth.schema";

import { useAuth } from "@/hooks/useAuth";
import { getApiErrorMessage } from "@/utils/validation";

export default function LoginForm() {
  const { login } = useAuth();

  const [serverError, setServerError] =
    useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(
    data: LoginFormValues,
  ) {
    setServerError("");

    try {
      await login(data);
    } catch (error) {
      setServerError(
        getApiErrorMessage(error),
      );
    }
  }

  return (
    <GlassCard>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">
          Welcome back
        </h1>

        <p className="mt-2 text-sm text-muted">
          Sign in to continue to your account.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
      >
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          {...register("email")}
          error={errors.email?.message}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          {...register("password")}
          error={errors.password?.message}
        />

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-xs text-muted hover:text-foreground"
          >
            Forgot password?
          </Link>
        </div>

        {serverError && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
            {serverError}
          </div>
        )}

        <Button
          type="submit"
          loading={isSubmitting}
        >
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Don not have an account?{" "}
        <Link
          href="/register"
          className="text-foreground hover:underline"
        >
          Create one
        </Link>
      </p>
    </GlassCard>
  );
}