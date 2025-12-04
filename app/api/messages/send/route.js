import { NextResponse } from 'next/server';
import { saveMessage, getSubscription } from '@/lib/models';
import webpush from 'web-push';

webpush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export async function POST(request) {
  try {
    const { from, content, type, imageUrl } = await request.json();

    const message = await saveMessage(from, content, type, imageUrl);

    const recipient = from === 'daddy' ? 'Dum' : 'daddy';
    const subscription = await getSubscription(recipient);

    if (subscription?.subscription) {
      try {
        await webpush.sendNotification(
          subscription.subscription,
          JSON.stringify({
            title: 'Sale Alert! on Myntra',
            body: 'Sale 20% off on selected items! Grab now before they run out!',
            icon: '/icon.png',
            badge: '/badge.png',
            data: {
              url: '/chat'
            }
          })
        );
      } catch (error) {
        console.error('Push notification failed:', error);
      }
    }

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
