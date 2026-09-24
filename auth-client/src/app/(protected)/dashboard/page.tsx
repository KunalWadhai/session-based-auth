"use client";

import GlassCard from "@/components/ui/GlassCard";
import { useUser } from "@/hooks/useUser";

export default function DashboardPage() {
  const { user } = useUser();

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm text-muted">
          Dashboard
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Welcome, {user?.username}
        </h1>

        <p className="mt-2 text-sm text-muted">
          You are successfully authenticated.
        </p>
      </section>

      <div className="grid gap-5 md:grid-cols-3">
        <GlassCard>
          <p className="text-sm text-muted">
            Account
          </p>

          <p className="mt-2 text-xl font-medium">
            Active
          </p>
        </GlassCard>

        <GlassCard>
          <p className="text-sm text-muted">
            Role
          </p>

          <p className="mt-2 text-xl font-medium capitalize">
            {user?.role}
          </p>
        </GlassCard>

        <GlassCard>
          <p className="text-sm text-muted">
            Email
          </p>

          <p className="mt-2 truncate text-sm font-medium">
            {user?.email}
          </p>
        </GlassCard>
      </div>
    </div>
  );
}