"use client";

import GlassCard from "@/components/ui/GlassCard";
import { useUser } from "@/hooks/useUser";

export default function ProfilePage() {
  const { user } = useUser();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold">
        Profile
      </h1>

      <GlassCard className="space-y-5">
        <div>
          <p className="text-xs text-muted">
            Name
          </p>

          <p className="mt-1">
            {user?.username}
          </p>
        </div>

        <div>
          <p className="text-xs text-muted">
            Email
          </p>

          <p className="mt-1">
            {user?.email}
          </p>
        </div>

        <div>
          <p className="text-xs text-muted">
            Role
          </p>

          <p className="mt-1 capitalize">
            {user?.role}
          </p>
        </div>
      </GlassCard>
    </div>
  );
}