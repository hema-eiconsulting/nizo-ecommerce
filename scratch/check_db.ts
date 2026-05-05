
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

async function main() {
  const connectionString = "postgres://e52611cbaa6d94292f9a63ef8107b749256b76d74a21806c3c7fd24f7cf94935:sk_2Y1tWk0AnfVZnLOmzpBkZ@db.prisma.io:5432/postgres?sslmode=require";
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const products = await prisma.product.findMany({
      include: { sizes: true }
    });
    console.log("PRODUCTS_IN_DB:", JSON.stringify(products, null, 2));
  } catch (error) {
    console.error("ERROR:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
