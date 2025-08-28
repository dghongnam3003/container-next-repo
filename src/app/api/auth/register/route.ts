import { NextRequest, NextResponse } from 'next/server';

interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

interface User {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
}

const users: User[] = [];

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password: string): boolean {
  return password.length >= 8 && 
         /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password);
}

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();
    const { fullName, email, password } = body;

    if (!fullName?.trim()) {
      return NextResponse.json(
        { message: 'Full name is required' },
        { status: 400 }
      );
    }

    if (!email || !validateEmail(email)) {
      return NextResponse.json(
        { message: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    if (!password || !validatePassword(password)) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters with uppercase, lowercase, and number' },
        { status: 400 }
      );
    }

    const existingUser = users.find(user => user.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return NextResponse.json(
        { message: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      fullName: fullName.trim(),
      email: email.toLowerCase(),
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);

    const { id, fullName: name, email: userEmail, createdAt } = newUser;
    
    return NextResponse.json(
      { 
        message: 'Account created successfully',
        user: { id, fullName: name, email: userEmail, createdAt }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}