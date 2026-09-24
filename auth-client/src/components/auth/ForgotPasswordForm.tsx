"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import GlassCard from "@/components/ui/GlassCard";

import {
  forgotPasswordSchema,
  ForgotPasswordFormValues,
} from "@/lib/validations/auth.schema";

import { authApi } from "@/api/calls/auth/auth";
import { getApiErrorMessage } from "@/utils/validation";

export default function ForgotPasswordForm() {
  const [serverError, setServerError] =
    useState("");

  const [success, setSuccess] =
    useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(
      forgotPasswordSchema,
    ),
  });

  async function onSubmit(
    data: ForgotPasswordFormValues,
  ) {
    setServerError("");

    try {
      await authApi.forgotPassword(
        data.email,
      );

      setSuccess(true);
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
          Forgot password?
        </h1>

        <p className="mt-2 text-sm text-muted">
          Enter your email and we&apos;ll send you
          a reset link.
        </p>
      </div>

      {success ? (
        <div className="space-y-5">
          <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-400">
            If an account exists with this
            email, a password reset link has
            been sent.
          </div>

          <Link
            href="/login"
            className="block text-center text-sm hover:underline"
          >
            Back to login
          </Link>
        </div>
      ) : (
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

          {serverError && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              {serverError}
            </div>
          )}

          <Button
            type="submit"
            loading={isSubmitting}
          >
            Send reset link
          </Button>

          <Link
            href="/login"
            className="block text-center text-sm text-muted hover:text-foreground"
          >
            Back to login
          </Link>
        </form>
      )}
    </GlassCard>
  );
}