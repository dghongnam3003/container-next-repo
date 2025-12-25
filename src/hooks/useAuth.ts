"use client";

import { useState, useEffect, createContext, useContext } from 'react';
import { User, AuthState, LoginCredentials, RegisterCredentials } from '@/types/auth';

// Simple hash function for demo purposes (in production, use proper server-side hashing)
const simpleHash = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Auth context
const AuthContext = createContext<{
  authState: AuthState;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (credentials: RegisterCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
} | null>(null);

// Storage keys
const STORAGE_KEYS = {
  USERS: 'gemsfun_users',
  CURRENT_USER: 'gemsfun_current_user',
};

// Get users from localStorage
const getStoredUsers = (): User[] => {
  if (typeof window === 'undefined') return [];
  try {
    const users = localStorage.getItem(STORAGE_KEYS.USERS);
    return users ? JSON.parse(users) : [];
  } catch {
    return [];
  }
};

// Save users to localStorage
const saveUsers = (users: User[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

// Get current user from localStorage
const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  try {
    const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

// Save current user to localStorage
const saveCurrentUser = (user: User | null) => {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};

// Get user credentials from localStorage (for demo purposes)
const getUserCredentials = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};
  try {
    const creds = localStorage.getItem('gemsfun_credentials');
    return creds ? JSON.parse(creds) : {};
  } catch {
    return {};
  }
};

// Save user credentials to localStorage (for demo purposes)
const saveUserCredentials = (username: string, hashedPassword: string) => {
  if (typeof window === 'undefined') return;
  const credentials = getUserCredentials();
  credentials[username] = hashedPassword;
  localStorage.setItem('gemsfun_credentials', JSON.stringify(credentials));
};

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Initialize auth state on mount
  useEffect(() => {
    const currentUser = getCurrentUser();
    setAuthState({
      user: currentUser,
      isAuthenticated: !!currentUser,
      isLoading: false,
    });
  }, []);

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      const { username, password } = credentials;
      
      // Validate input
      if (!username || !password) {
        return { success: false, error: 'Username and password are required' };
      }

      // Check if user exists
      const users = getStoredUsers();
      const user = users.find(u => u.username === username);
      
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Verify password
      const storedCredentials = getUserCredentials();
      const hashedPassword = await simpleHash(password);
      
      if (storedCredentials[username] !== hashedPassword) {
        return { success: false, error: 'Invalid password' };
      }

      // Login successful
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      
      saveCurrentUser(user);
      return { success: true };
      
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const register = async (credentials: RegisterCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      const { username, email, password, confirmPassword } = credentials;
      
      // Validate input
      if (!username || !email || !password || !confirmPassword) {
        return { success: false, error: 'All fields are required' };
      }

      if (password !== confirmPassword) {
        return { success: false, error: 'Passwords do not match' };
      }

      if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters' };
      }

      // Email validation
      const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
      if (!emailRegex.test(email)) {
        return { success: false, error: 'Invalid email format' };
      }

      // Check if user already exists
      const users = getStoredUsers();
      const existingUser = users.find(u => u.username === username || u.email === email);
      
      if (existingUser) {
        return { success: false, error: 'Username or email already exists' };
      }

      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        username,
        email,
        createdAt: new Date().toISOString(),
      };

      // Save user and credentials
      const updatedUsers = [...users, newUser];
      saveUsers(updatedUsers);
      
      const hashedPassword = await simpleHash(password);
      saveUserCredentials(username, hashedPassword);

      // Auto-login after registration
      setAuthState({
        user: newUser,
        isAuthenticated: true,
        isLoading: false,
      });
      
      saveCurrentUser(newUser);
      return { success: true };
      
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  };

  const logout = () => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    saveCurrentUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    if (!authState.user) return;

    const updatedUser = { ...authState.user, ...updates };
    
    // Update in users list
    const users = getStoredUsers();
    const userIndex = users.findIndex(u => u.id === authState.user!.id);
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      saveUsers(users);
    }

    // Update current user
    setAuthState({
      ...authState,
      user: updatedUser,
    });
    saveCurrentUser(updatedUser);
  };

  return {
    authState,
    login,
    register,
    logout,
    updateUser,
  };
};

// Auth context provider component will be created separately
export { AuthContext };