import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-6xl font-bold">
        404
      </h1>

      <p className="mt-3 text-muted">
        Page not found.
      </p>

      <Link
        href="/dashboard"
        className="mt-6 rounded-xl bg-white px-5 py-2 text-sm text-black"
      >
        Go home
      </Link>
    </div>
  );
}