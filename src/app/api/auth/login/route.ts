import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, generateToken, type LoginData } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body: LoginData = await request.json();
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

    // Authenticate user
    const user = await authenticateUser({
      username: trimmedUsername,
      password: trimmedPassword
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid credentials',
          details: 'Username or password is incorrect'
        },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken(user);

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          username: user.username,
          createdAt: user.createdAt
        },
        token
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    
    return NextResponse.json(
      {
        success: false,
        error: 'Login failed',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Method not allowed',
      details: 'Only POST requests are supported for login'
    },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Method not allowed',
      details: 'Only POST requests are supported for login'
    },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Method not allowed',
      details: 'Only POST requests are supported for login'
    },
    { status: 405 }
  );
}