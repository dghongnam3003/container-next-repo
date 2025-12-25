"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    checkAuthSession();
  }, []);

  const checkAuthSession = () => {
    try {
      const storedUser = localStorage.getItem('auth_user');
      const sessionExpiry = localStorage.getItem('auth_session_expiry');
      
      if (storedUser && sessionExpiry) {
        const expiryDate = new Date(sessionExpiry);
        const now = new Date();
        
        if (now < expiryDate) {
          setUser(JSON.parse(storedUser));
        } else {
          // Session expired
          localStorage.removeItem('auth_user');
          localStorage.removeItem('auth_session_expiry');
        }
      }
    } catch (error) {
      console.error('Error checking auth session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Get users from localStorage
      const usersData = localStorage.getItem('users_db');
      const users = usersData ? JSON.parse(usersData) : [];
      
      // Find user by email
      const foundUser = users.find((u: any) => u.email === email);
      
      if (!foundUser) {
        alert('User not found. Please register first.');
        return false;
      }
      
      // Simple password check (in production, use proper hashing)
      if (foundUser.password !== password) {
        alert('Invalid password');
        return false;
      }
      
      // Create user session
      const userSession: User = {
        id: foundUser.id,
        email: foundUser.email,
        username: foundUser.username,
        createdAt: foundUser.createdAt
      };
      
      // Set session expiry to 24 hours from now
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 24);
      
      localStorage.setItem('auth_user', JSON.stringify(userSession));
      localStorage.setItem('auth_session_expiry', expiryDate.toISOString());
      
      setUser(userSession);
      return true;
      
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
      return false;
    }
  };

  const register = async (email: string, username: string, password: string): Promise<boolean> => {
    try {
      // Get existing users
      const usersData = localStorage.getItem('users_db');
      const users = usersData ? JSON.parse(usersData) : [];
      
      // Check if user already exists
      const existingUser = users.find((u: any) => u.email === email || u.username === username);
      if (existingUser) {
        alert('User with this email or username already exists');
        return false;
      }
      
      // Create new user
      const newUser = {
        id: crypto.randomUUID(),
        email,
        username,
        password, // In production, hash this password
        createdAt: new Date().toISOString()
      };
      
      // Save to localStorage
      users.push(newUser);
      localStorage.setItem('users_db', JSON.stringify(users));
      
      // Auto login after successful registration
      return await login(email, password);
      
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_session_expiry');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}