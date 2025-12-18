import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const { userId, subscription } = await req.json();

  await prisma.user.update({
    where: { id: userId.toString() },
    data: { pushSubscription: subscription }
  });

  return NextResponse.json({ success: true });
}