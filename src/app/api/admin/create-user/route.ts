import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Only SUPERADMIN can create users
  const adminUser = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (adminUser?.role !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'Forbidden - requires SUPERADMIN role' }, { status: 403 });
  }

  const { name, email, password, role } = await req.json();

  if (!email || !password || password.length < 8) {
    return NextResponse.json({ error: 'Email dan password minimal 8 karakter diperlukan' }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      role: role || 'RESTAURANT',
      // @ts-ignore
      passwordHash,
    }
  });

  return NextResponse.json({ success: true, userId: user.id });
}
