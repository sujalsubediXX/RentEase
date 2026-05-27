import React, { useState } from 'react';
import { Input } from './Input';
import { validateRegisterForm } from '../../utils/validation';
import type{ RegisterData, UserRole } from '../../types/auth.types';

interface RegisterProps {
  onRegister: (data: RegisterData) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  onSwitchToLogin: () => void;
}

export const Register: React.FC<RegisterProps> = ({
  onRegister,
  isLoading,
  error,
  onSwitchToLogin,
}) => {
  const [formData, setFormData] = useState<RegisterData>({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    role: 'renter',
    address: '',
  });
  
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { isValid, errors } = validateRegisterForm(formData);
    setValidationErrors(errors);
    
    if (isValid) {
      try {
        await onRegister(formData);
      } catch (err) {
        // Error is already handled in the hook
        console.error('Registration failed:', err);
      }
    }
  };

  // Format error message to be user-friendly
  const getDisplayError = () => {
    if (!error) return null;
    
    // Check for common error types
    if (error.includes('404') || error.includes('Failed to fetch')) {
      return 'Unable to connect to server. Please ensure the backend is running. Using demo mode...';
    }
    
    if (error.includes('already exists')) {
      return 'An account with this email already exists. Please login instead.';
    }
    
    return error;
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
          <p className="text-gray-600">Join RentEase today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="fullName"
            name="fullName"
            type="text"
            label="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            error={validationErrors.fullName}
            placeholder="John Doe"
            icon={
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          />

          <Input
            id="email"
            name="email"
            type="email"
            label="Email Address"
            value={formData.email}
            onChange={handleChange}
            error={validationErrors.email}
            placeholder="you@example.com"
            icon={
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            }
          />

          <Input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            label="Phone Number"
            value={formData.phoneNumber}
            onChange={handleChange}
            error={validationErrors.phoneNumber}
            placeholder="98XXXXXXXX"
            icon={
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            }
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              I want to
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, role: 'renter' }))}
                className={`py-2 px-4 rounded-lg border transition-all ${
                  formData.role === 'renter'
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-gray-300 text-gray-700 hover:border-blue-300'
                }`}
              >
                Rent Items
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, role: 'owner' }))}
                className={`py-2 px-4 rounded-lg border transition-all ${
                  formData.role === 'owner'
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-gray-300 text-gray-700 hover:border-blue-300'
                }`}
              >
                List Items
              </button>
            </div>
          </div>

          <Input
            id="address"
            name="address"
            type="text"
            label="Address"
            value={formData.address}
            onChange={handleChange}
            error={validationErrors.address}
            placeholder="Kathmandu, Nepal"
            icon={
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          />

          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            label="Password"
            value={formData.password}
            onChange={handleChange}
            error={validationErrors.password}
            placeholder="Create a strong password"
            icon={
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            }
          />

          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            label="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={validationErrors.confirmPassword}
            placeholder="Confirm your password"
          />

          {getDisplayError() && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {getDisplayError()}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`
              w-full bg-linear-to-r from-blue-600 to-blue-700 text-white py-2.5 rounded-lg
              font-semibold transition-all duration-200 transform
              ${isLoading 
                ? 'opacity-70 cursor-not-allowed' 
                : 'hover:from-blue-700 hover:to-blue-800 hover:shadow-lg hover:-translate-y-0.5'
              }
            `}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Creating account...
              </div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            Sign in
          </button>
        </p>

        <p className="mt-4 text-xs text-gray-500 text-center">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};