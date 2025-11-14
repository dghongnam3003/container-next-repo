import { NextRequest, NextResponse } from 'next/server';
import { createUser, generateToken, type RegisterData } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body: RegisterData = await request.json();
    const { username, password } = body;

    // Validate required fields
    if (!username || !password) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Username and password are required',
          details: 'Both username and password fields must be provided'
        },
        { status: 400 }
      );
    }

    // Trim whitespace
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Username and password cannot be empty',
          details: 'Please provide valid username and password'
        },
        { status: 400 }
      );
    }

    // Create user
    const user = await createUser({
      username: trimmedUsername,
      password: trimmedPassword
    });

    // Generate JWT token
    const token = generateToken(user);

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          username: user.username,
          createdAt: user.createdAt
        },
        token
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    
    return NextResponse.json(
      {
        success: false,
        error: 'Registration failed',
        details: errorMessage
      },
      { status: 400 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Method not allowed',
      details: 'Only POST requests are supported for registration'
    },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Method not allowed',
      details: 'Only POST requests are supported for registration'
    },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Method not allowed',
      details: 'Only POST requests are supported for registration'
    },
    { status: 405 }
  );
}