"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import { useUser } from "@/hooks/useUser";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const { user, loading } =
    useUser();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-6xl px-6 py-10">
        {children}
      </main>
    </>
  );
}