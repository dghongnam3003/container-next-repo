"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthState, LoginCredentials, RegisterCredentials } from '@/types/auth';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simple in-memory user storage (in production, use a real database)
const USERS_KEY = 'gemsfun_users';
const CURRENT_USER_KEY = 'gemsfun_current_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  // Initialize auth state from localStorage
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUserData = localStorage.getItem(CURRENT_USER_KEY);
        if (currentUserData) {
          const user = JSON.parse(currentUserData);
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false
          });
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false
          });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    };

    checkAuth();
  }, []);

  const getStoredUsers = (): User[] => {
    try {
      const usersData = localStorage.getItem(USERS_KEY);
      return usersData ? JSON.parse(usersData) : [];
    } catch {
      return [];
    }
  };

  const saveUsers = (users: User[]) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  };

  const login = async (credentials: LoginCredentials): Promise<void> => {
    const { email, password } = credentials;
    
    // Simple validation
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const users = getStoredUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
      throw new Error('User not found. Please register first.');
    }

    // In a real app, you'd hash and compare passwords
    // For demo purposes, we'll store passwords in plain text (NOT recommended for production)
    const storedPassword = localStorage.getItem(`password_${user.id}`);
    if (storedPassword !== password) {
      throw new Error('Invalid password');
    }

    // Store current user session
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    
    setAuthState({
      user,
      isAuthenticated: true,
      isLoading: false
    });
  };

  const register = async (credentials: RegisterCredentials): Promise<void> => {
    const { username, email, password, confirmPassword } = credentials;

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      throw new Error('All fields are required');
    }

    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Please enter a valid email address');
    }

    const users = getStoredUsers();
    
    // Check if user already exists
    const existingUser = users.find(u => u.email === email || u.username === username);
    if (existingUser) {
      throw new Error('User with this email or username already exists');
    }

    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      email,
      username,
      createdAt: new Date().toISOString()
    };

    // Store user data
    users.push(newUser);
    saveUsers(users);
    
    // Store password separately (in production, use proper hashing)
    localStorage.setItem(`password_${newUser.id}`, password);
    
    // Auto-login after registration
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    
    setAuthState({
      user: newUser,
      isAuthenticated: true,
      isLoading: false
    });
  };

  const logout = () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
  };

  const contextValue: AuthContextType = {
    ...authState,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}