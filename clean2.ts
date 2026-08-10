import prisma from './src/lib/prisma';
async function main() {
  await prisma.couponSent.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  console.log('Cleaned db and variants');
}
main();
