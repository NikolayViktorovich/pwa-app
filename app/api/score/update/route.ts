import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:example@yourdomain.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: Request) {
  const { userId, score, username } = await req.json();

  try {
    const currentLeader = await prisma.user.findFirst({
      orderBy: { bestScore: 'desc' },
    });

    const user = await prisma.user.upsert({
      where: { id: userId.toString() },
      update: { bestScore: { set: score > 0 ? score : undefined } },
      create: { id: userId.toString(), bestScore: score },
    });
    if (currentLeader && currentLeader.id !== userId.toString() && score > currentLeader.bestScore) {
      if (currentLeader.pushSubscription) {
        const payload = JSON.stringify({
          title: "🐗 ТЕБЯ ОБОШЛИ!",
          body: `${username || 'Кто-то'} набрал ${score} и побил твой рекорд! Вернись в игру.`,
          data: { url: "/" }
        });

        await webpush.sendNotification(currentLeader.pushSubscription as any, payload);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Score update failed" }, { status: 500 });
  }
}