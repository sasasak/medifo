'use client'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

interface InputProps {
  id: string
  type: string
  label: string
  placeholder?: string
}

export default function Input({ id, type, label, placeholder }: InputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  return (
    <div className="flex flex-col gap-2 p-2">
      <label htmlFor={id} className="text-text-base w-full text-sm">
        {label}
      </label>
      <div className="relative w-full">
        <input
          id={id}
          type={isPassword && showPassword ? 'text' : type}
          placeholder={placeholder}
          className="text-text-hint border-card-border rounded-card focus:ring-border-focus h-14 w-full border px-3 py-2 pr-12 font-medium outline-none focus:ring-1"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="text-text-hint absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer"
            aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
    </div>
  )
}
