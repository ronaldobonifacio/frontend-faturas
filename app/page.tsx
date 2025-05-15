'use client';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { GoogleLogo, SpinnerGap } from '@phosphor-icons/react';

export default function LoginPage() {
  const { user, login } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (user) {
      setIsRedirecting(true);
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await login();
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
    }
  };

  if (isRedirecting) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <div className="relative w-full max-w-md px-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 sm:p-10 transition-all transform hover:shadow-2xl">
          <div className="mb-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Bem-vindo ao FinanceFlow</h1>
            <p className="text-gray-500 dark:text-gray-400">Gerencie suas finanças de forma inteligente</p>
          </div>

          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-medium transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <SpinnerGap className="animate-spin h-6 w-6" />
            ) : (
              <>
                <GoogleLogo className="w-6 h-6" />
                <span>Continuar com Google</span>
              </>
            )}
          </button>

          <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>Ao continuar, você concorda com nossos</p>
            <div className="mt-1 flex justify-center gap-2">
              <a href="#" className="hover:text-blue-500 transition-colors">Termos de uso</a>
              <span>•</span>
              <a href="#" className="hover:text-blue-500 transition-colors">Política de privacidade</a>
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 -bottom-10 flex justify-center">
          <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-lg text-sm text-gray-600 dark:text-gray-400">
            Seu dinheiro sob controle 💼
          </div>
        </div>
      </div>
    </div>
  );
}