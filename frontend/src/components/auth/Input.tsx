import React from 'react';

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
  ...props
}) => {
  return (
    <div className="mb-4">
      <label 
        htmlFor={id} 
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={id}
          className={`
            w-full px-4 py-2 rounded-lg border transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            ${icon ? 'pl-10' : ''}
            ${error 
              ? 'border-red-500 bg-red-50' 
              : 'border-gray-300 hover:border-gray-400'
            }
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-500 animate-pulse">
          {error}
        </p>
      )}
    </div>
  );
};