import { PrismaClient } from './src/generated/prisma/client';
const prisma = new PrismaClient();
async function main() {
  await prisma.couponSent.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  console.log('Cleaned old test records');
}
main();
