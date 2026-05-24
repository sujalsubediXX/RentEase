import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Login } from '../components/auth/Login';
import { Register } from '../components/auth/Register';
import { useAuth } from '../hooks/useAuth';

// Make sure this is exported as default or named export
export const Auth: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const { login, register, isLoading, error, isAuthenticated } = useAuth();

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-3xl font-bold">R</span>
              </div>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              RentEase
            </h1>
            <p className="text-gray-600 mt-2">Rent Anything, Anytime, Anywhere</p>
          </div>

          <div className="w-full max-w-md">
            {mode === 'login' ? (
              <Login
                onLogin={login}
                isLoading={isLoading}
                error={error}
                onSwitchToRegister={() => setMode('register')}
              />
            ) : (
              <Register
                onRegister={register}
                isLoading={isLoading}
                error={error}
                onSwitchToLogin={() => setMode('login')}
              />
            )}
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800">Secure Payments</h3>
              <p className="text-sm text-gray-600">Safe and encrypted transactions</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800">KYC Verified</h3>
              <p className="text-sm text-gray-600">Verified users & products</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800">24/7 Support</h3>
              <p className="text-sm text-gray-600">Dedicated customer support</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Also add a default export for compatibility
export default Auth;