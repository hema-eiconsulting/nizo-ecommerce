import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany();
  let updated = 0;
  for (const product of products) {
    if (product.category === 'TROUSERS' as any) {
      await prisma.product.update({
        where: { id: product.id },
        data: { category: 'PANTS' }
      });
      updated++;
    }
  }
  console.log(`Updated ${updated} products from TROUSERS to PANTS.`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
