import { NextResponse } from 'next/server';
import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:test@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(request: Request) {
  try {
    const { subscription } = await request.json();

    if (!subscription) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 400 });
    }

    const payload = JSON.stringify({
      title: 'МЕГА-КАБАН 🐗',
      body: 'ХРЮ! Кабан проснулся и ждет тебя!',
    });

    await webpush.sendNotification(subscription, payload);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Push Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}