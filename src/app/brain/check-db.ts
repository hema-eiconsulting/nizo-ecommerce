import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.address.count();
  console.log(`Total addresses: ${count}`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
