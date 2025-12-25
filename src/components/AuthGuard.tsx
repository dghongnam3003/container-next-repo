"use client";

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import AuthForm from './AuthForm';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className=\"min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center\">\n        <div className=\"text-center\">\n          <div className=\"animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4\"></div>\n          <p className=\"text-gray-600\">Loading...</p>\n        </div>\n      </div>\n    );\n  }\n\n  if (!isAuthenticated) {\n    return (\n      fallback || (\n        <div className=\"min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4\">\n          <div className=\"w-full max-w-md\">\n            <div className=\"text-center mb-8\">\n              <h1 className=\"text-4xl font-bold text-gray-900 mb-2\">Gems.fun</h1>\n              <p className=\"text-gray-600\">Secure Trading Platform</p>\n            </div>\n            <AuthForm />\n          </div>\n        </div>\n      )\n    );\n  }\n\n  return (\n    <>\n      {children}\n    </>\n  );\n}