import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcrypt";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function createAdmin() {
  const email = "admin@niza.com";
  const password = "password123";
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        role: "ADMIN"
      },
      create: {
        email,
        name: "Super Admin",
        password: hashedPassword,
        role: "ADMIN"
      }
    });

    console.log("-----------------------------------------");
    console.log("ADMIN ACCOUNT READY");
    console.log("Email: " + email);
    console.log("Password: " + password);
    console.log("-----------------------------------------");
    console.log("Log in at: http://localhost:3000/login");
  } catch (error) {
    console.error("Error creating admin:", error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

createAdmin();
