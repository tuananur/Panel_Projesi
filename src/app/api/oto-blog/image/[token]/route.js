import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(_req, { params }) {
  const { token } = await params;
  if (!token) return new NextResponse('Not found', { status: 404 });

  const image = await prisma.otoBlogTempImage.findUnique({ where: { token } });
  if (!image) return new NextResponse('Not found', { status: 404 });

  return new NextResponse(Buffer.from(image.data), {
    status: 200,
    headers: {
      'Content-Type': image.mimeType || 'image/png',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
