import { NextResponse } from 'next/server';
import { getMessages } from '@/lib/models';

export async function GET() {
  try {
    const messages = await getMessages();

    return NextResponse.json({
      success: true,
      messages: messages.map(msg => ({
        ...msg,
        _id: msg._id.toString()
      }))
    });
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
