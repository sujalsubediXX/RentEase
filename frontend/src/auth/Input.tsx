import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  id,
  type,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";

  return (
    <div className="mb-4">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>

      <div className="relative">
        {/* Left Icon */}
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}

        {/* Input */}
        <input
          id={id}
          type={isPassword ? (showPassword ? "text" : "password") : type}
          className={`
            w-full px-4 py-2 rounded-lg border transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            ${icon ? "pl-10" : ""}
            ${isPassword ? "pr-10" : ""}
            ${
              error
                ? "border-red-500 bg-red-50"
                : "border-gray-300 hover:border-gray-400"
            }
          `}
          {...props}
        />

        {/* Eye Icon */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
          >
           {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>

      {error && (
        <p className="mt-1 text-xs text-red-500 animate-pulse">{error}</p>
      )}
    </div>
  );
};