"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import GlassCard from "@/components/ui/GlassCard";

import {
  registerSchema,
  RegisterFormValues,
} from "@/lib/validations/auth.schema";

import { useAuth } from "@/hooks/useAuth";
import { getApiErrorMessage } from "@/utils/validation";

export default function RegisterForm() {
  const { register: registerUser } =
    useAuth();

  const [serverError, setServerError] =
    useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(
    data: RegisterFormValues,
  ) {
    setServerError("");

    try {
      await registerUser({
        username: data.name,
        email: data.email,
        password: data.password,
      });
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
          Create account
        </h1>

        <p className="mt-2 text-sm text-muted">
          Start building your account.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
      >
        <Input
          label="Name"
          placeholder="John Doe"
          {...register("name")}
          error={errors.name?.message}
        />

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

        <Input
          label="Confirm password"
          type="password"
          placeholder="••••••••"
          {...register("confirmPassword")}
          error={
            errors.confirmPassword?.message
          }
        />

        {serverError && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
            {serverError}
          </div>
        )}

        <Button
          type="submit"
          loading={isSubmitting}
        >
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-foreground hover:underline"
        >
          Sign in
        </Link>
      </p>
    </GlassCard>
  );
}