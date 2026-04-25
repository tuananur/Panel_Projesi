import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const existingAdmin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await prisma.user.create({
        data: {
          username: 'admin',
          password: hashedPassword,
          role: 'ADMIN',
        },
      });
      return NextResponse.json({ success: true, message: 'Admin user created successfully! You can now log in.' });
    } else {
      return NextResponse.json({ success: true, message: 'Admin user already exists.' });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
