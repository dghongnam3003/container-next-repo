import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisterData {
  username: string;
  password: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface AuthToken {
  userId: string;
  username: string;
  exp: number;
  iat: number;
}

// In-memory storage for demo purposes
// In production, use a proper database like PostgreSQL, MongoDB, etc.
const users: Map<string, User> = new Map();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const SALT_ROUNDS = 12;

// Password validation
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Username validation
export function validateUsername(username: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (username.length < 3) {
    errors.push('Username must be at least 3 characters long');
  }
  
  if (username.length > 20) {
    errors.push('Username must be no more than 20 characters long');
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.push('Username can only contain letters, numbers, and underscores');
  }
  
  if (userExists(username)) {
    errors.push('Username is already taken');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Check if user exists
export function userExists(username: string): boolean {
  return Array.from(users.values()).some(user => user.username === username);
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Create user
export async function createUser(registerData: RegisterData): Promise<User> {
  const { username, password } = registerData;
  
  // Validate username
  const usernameValidation = validateUsername(username);
  if (!usernameValidation.isValid) {
    throw new Error(`Username validation failed: ${usernameValidation.errors.join(', ')}`);
  }
  
  // Validate password
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
  }
  
  const passwordHash = await hashPassword(password);
  const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date();
  
  const user: User = {
    id: userId,
    username,
    passwordHash,
    createdAt: now,
    updatedAt: now
  };
  
  users.set(userId, user);
  return user;
}

// Get user by username
export function getUserByUsername(username: string): User | null {
  return Array.from(users.values()).find(user => user.username === username) || null;
}

// Get user by ID
export function getUserById(id: string): User | null {
  return users.get(id) || null;
}

// Authenticate user
export async function authenticateUser(loginData: LoginData): Promise<User | null> {
  const { username, password } = loginData;
  
  const user = getUserByUsername(username);
  if (!user) {
    return null;
  }
  
  const isPasswordValid = await verifyPassword(password, user.passwordHash);
  return isPasswordValid ? user : null;
}

// Generate JWT token
export function generateToken(user: User): string {
  const payload = {
    userId: user.id,
    username: user.username
  };
  
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d' // Token expires in 7 days
  });
}

// Verify JWT token
export function verifyToken(token: string): AuthToken | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthToken;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// Get user from token
export function getUserFromToken(token: string): User | null {
  const decoded = verifyToken(token);
  if (!decoded) {
    return null;
  }
  
  return getUserById(decoded.userId);
}