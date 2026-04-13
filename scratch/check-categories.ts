import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const counts = await prisma.product.groupBy({
    by: ['category'],
    _count: {
      id: true
    }
  });
  console.log("Current Category Counts:");
  console.table(counts);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
