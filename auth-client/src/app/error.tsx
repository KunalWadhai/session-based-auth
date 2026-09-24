"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h2 className="text-xl font-semibold">
        Something went wrong
      </h2>

      <button
        onClick={() => reset()}
        className="rounded-xl bg-white px-5 py-2 text-sm text-black"
      >
        Try again
      </button>
    </div>
  );
}
