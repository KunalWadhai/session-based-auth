import {
  InputHTMLAttributes,
} from "react";

interface InputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({
  label,
  error,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm text-muted">
          {label}
        </label>
      )}

      <input
        className={`
          w-full
          rounded-xl
          border
          border-white/10
          bg-black/20
          px-4
          py-3
          text-sm
          outline-none
          transition
          placeholder:text-muted
          focus:border-white/30
          focus:bg-black/30
          dark:bg-white/[0.03]
          ${className}
        `}
        {...props}
      />

      {error && (
        <p className="text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}