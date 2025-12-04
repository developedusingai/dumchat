import { NextResponse } from 'next/server';
import { saveSubscription } from '@/lib/models';

export async function POST(request) {
  try {
    const { username, subscription } = await request.json();

    await saveSubscription(username, subscription);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json(
      { error: 'Subscription failed' },
      { status: 500 }
    );
  }
}
