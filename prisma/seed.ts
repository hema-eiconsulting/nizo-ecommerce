import { Gender, Category, Size } from '@prisma/client';
import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  const products = [
    {
      name: "Vintage Denim Jacket",
      description: "A classic oversized denim jacket with a vintage wash. Perfect for layering.",
      price: 3499,
      gender: Gender.UNISEX,
      category: Category.JACKETS,
      images: ["https://res.cloudinary.com/da9uevskm/image/upload/v1712750000/savana-demo/jacket-1.jpg"],
      colors: ["Indigo", "Black"],
      sizes: ["XS", "S", "M", "L", "XL", "XXL"]
    },
    {
      name: "Minimalist Linen Shirt",
      description: "Breathable pure linen shirt with a relaxed fit. Ideal for summer heat.",
      price: 1999,
      gender: Gender.MEN,
      category: Category.SHIRTS,
      images: ["https://res.cloudinary.com/da9uevskm/image/upload/v1712750000/savana-demo/shirt-1.jpg"],
      colors: ["Beige", "White", "Sage"],
      sizes: ["S", "M", "L", "XL"]
    },
    {
      name: "Flowy Floral Midi Dress",
      description: "Lightweight midi dress with a delicate floral print and pleated details.",
      price: 2499,
      gender: Gender.WOMEN,
      category: Category.DRESSES,
      images: ["https://res.cloudinary.com/da9uevskm/image/upload/v1712750000/savana-demo/dress-1.jpg"],
      colors: ["Yellow", "Blue"],
      sizes: ["XS", "S", "M", "L"]
    },
    {
      name: "Tailored Slim Trousers",
      description: "Professional tailored trousers with a slim fit and structured waistband.",
      price: 2199,
      gender: Gender.UNISEX,
      category: Category.TROUSERS,
      images: ["https://res.cloudinary.com/da9uevskm/image/upload/v1712750000/savana-demo/trousers-1.jpg"],
      colors: ["Charcoal", "Navy"],
      sizes: ["S", "M", "L", "XL", "XXL"]
    },
    {
      name: "Signature Oversized Tee",
      description: "Heavyweight cotton tee with a drop shoulder and streetwear silhouette.",
      price: 999,
      gender: Gender.MEN,
      category: Category.TOPS,
      images: ["https://res.cloudinary.com/da9uevskm/image/upload/v1712750000/savana-demo/tee-1.jpg"],
      colors: ["Black", "White", "Olive"],
      sizes: ["M", "L", "XL", "XXL"]
    },
    {
      name: "Cropped Ribbed Knit",
      description: "Soft ribbed knit top with a cropped length and square neckline.",
      price: 1299,
      gender: Gender.WOMEN,
      category: Category.TOPS,
      images: ["https://res.cloudinary.com/da9uevskm/image/upload/v1712750000/savana-demo/knit-1.jpg"],
      colors: ["Rust", "Cream"],
      sizes: ["XS", "S", "M"]
    }
  ];

  console.log("Start seeding...");

  for (const p of products) {
    const { sizes, ...rest } = p;
    const product = await prisma.product.create({
      data: {
        ...rest,
        sizes: {
          create: sizes.map(s => ({
            size: s as Size,
            stock: Math.floor(Math.random() * 20) + 1
          }))
        }
      }
    });
    console.log(`Created product with id: ${product.id}`);
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
