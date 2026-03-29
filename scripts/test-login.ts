import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'admin@namacafe.app' }
  });
  console.log("User found:", !!user);
  if (!user) return;
  
  console.log("Password hash:", user.passwordHash);
  const isValid = await bcrypt.compare('password123', user.passwordHash!);
  console.log("Is valid:", isValid);
}

main().finally(() => prisma.$disconnect());
