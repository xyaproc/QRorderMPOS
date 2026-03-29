import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare const globalThis: {
  prismaV5Global: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaV5Global ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaV5Global = prisma
