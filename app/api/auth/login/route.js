import { NextResponse } from 'next/server';
import { USERS } from '@/lib/models';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    const user = USERS[username];

    if (!user || user.password !== password) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      username: user.username
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
