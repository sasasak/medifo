"use client";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface InputProps {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
}

export default function Input({ id, type, label, placeholder }: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  return (
    <div className="flex flex-col gap-2 p-2">
      <label htmlFor={id} className="text-text-base text-sm w-full">
        {label}
      </label>
      <div className="relative w-full">
        <input
          id={id}
          type={isPassword && showPassword ? "text" : type}
          placeholder={placeholder}
          className="text-text-hint w-full border border-card-muted rounded-card h-14 px-3 py-2 pr-12 outline-none focus:ring-1 focus:ring-border-focus"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-hint cursor-pointer"
            aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
    </div>
  );
}
