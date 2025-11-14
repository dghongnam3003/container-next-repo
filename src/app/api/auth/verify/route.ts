import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'No token provided',
          details: 'Authorization header with Bearer token is required'
        },
        { status: 401 }
      );
    }

    // Verify token and get user
    const user = getUserFromToken(token);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid token',
          details: 'Token is invalid, expired, or user not found'
        },
        { status: 401 }
      );
    }

    // Return user data
    return NextResponse.json({
      success: true,
      message: 'Token is valid',
      data: {
        user: {
          id: user.id,
          username: user.username,
          createdAt: user.createdAt
        }
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Token verification error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Token verification failed',
        details: 'An error occurred while verifying the token'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'No token provided',
          details: 'Token field is required in request body'
        },
        { status: 400 }
      );
    }

    // Verify token and get user
    const user = getUserFromToken(token);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid token',
          details: 'Token is invalid, expired, or user not found'
        },
        { status: 401 }
      );
    }

    // Return user data
    return NextResponse.json({
      success: true,
      message: 'Token is valid',
      data: {
        user: {
          id: user.id,
          username: user.username,
          createdAt: user.createdAt
        }
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Token verification error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Token verification failed',
        details: 'An error occurred while verifying the token'
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function PUT() {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Method not allowed',
      details: 'Only GET and POST requests are supported for token verification'
    },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Method not allowed',
      details: 'Only GET and POST requests are supported for token verification'
    },
    { status: 405 }
  );
}