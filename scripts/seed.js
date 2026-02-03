
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import Product from "../src/app/lib/model/Product.js";

// Load env vars
dotenv.config({ path: ".env.local" });

const MONGO_URI = process.env.MONGODB_URL;

if (!MONGO_URI) {
    console.error("❌ MONGODB_URL not found in .env.local");
    process.exit(1);
}

const CATEGORIES = ["Lawn 2024", "Festive", "Pret", "Winter"];
const IMAGES = [
    "https://res.cloudinary.com/demo/image/upload/v1652366604/docs/demo_image1.jpg",
    "https://res.cloudinary.com/demo/image/upload/v1652366604/docs/demo_image2.jpg",
    "https://res.cloudinary.com/demo/image/upload/v1652366604/docs/demo_image3.jpg"
];

async function seed() {
    try {
        console.log("🔌 Connecting to DB...");
        await mongoose.connect(MONGO_URI);

        console.log("🧹 Clearing Products...");
        await Product.deleteMany({});

        console.log("🌱 Seeding 20 Products...");
        const products = [];

        for (let i = 1; i <= 20; i++) {
            const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
            const baseCost = Math.floor(Math.random() * (3000 - 1000) + 1000); // 1000-3000
            const markup = 50; // 50%
            const discount = 20; // 20%

            // Dirty Trick Math
            const originalPrice = Math.round(baseCost * (1 + markup / 100));
            const salePrice = Math.round(originalPrice * (1 - discount / 100));

            products.push({
                name: `${category} Premium Suit Vol-${i}`,
                slug: `suit-vol-${i}-${Date.now()}`,
                category: category,
                description: "High quality premium fabric with intricate embroidery.",
                pricing: {
                    baseCost,
                    originalPrice,
                    salePrice,
                    discountLabel: `${discount}% OFF`
                },
                variants: [
                    { color: "Red", size: "S", stock: 10 },
                    { color: "Blue", size: "M", stock: 15 }
                ],
                images: [IMAGES[Math.floor(Math.random() * IMAGES.length)]],
                isDirtyPriced: true
            });
        }

        await Product.insertMany(products);
        console.log("✅ Seeding Complete!");
        process.exit(0);

    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
}

seed();
