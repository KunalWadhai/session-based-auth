import { ButtonHTMLAttributes } from "react";

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export default function Button({
  children,
  loading = false,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        w-full
        rounded-xl
        bg-white
        px-4
        py-3
        text-sm
        font-medium
        text-black
        transition
        hover:bg-white/90
        disabled:cursor-not-allowed
        disabled:opacity-50
        dark:bg-white
        dark:text-black
        ${className}
      `}
      {...props}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}