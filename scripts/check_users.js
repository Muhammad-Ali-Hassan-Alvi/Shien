
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import User from "../src/app/lib/model/User.js";

// Load env vars
dotenv.config({ path: ".env.local" });

const MONGO_URI = process.env.MONGODB_URL;

if (!MONGO_URI) {
    console.error("❌ MONGODB_URL not found in .env.local");
    process.exit(1);
}

async function checkUsers() {
    try {
        console.log("🔌 Connecting to DB...");
        await mongoose.connect(MONGO_URI);

        console.log("🔍 Fetching all users...");
        const allUsers = await User.find({});

        console.log(`ℹ️ User Count: ${allUsers.length}`);

        allUsers.forEach(u => {
            console.log(JSON.stringify(u.toJSON(), null, 2));
        });

        const admin = allUsers.find(u => u.role === 'admin');
        if (admin) {
            console.log("\n✅ ADMIN FOUND:");
            console.log(`Phone: ${admin.phone}`);
            // Password hash is not useful to print, but confirming existence is key.
        } else {
            console.log("\n❌ No admin user found.");

            // Create a temporary admin if none exists
            const adminUser0 = new User({
                name: "Admin User",
                phone: "03001234567",
                password: "$2a$10$vI8aWB.3/..3..3..3..3..3", // Need a valid hash or create one using bcrypt
                role: "admin"
            });
            // I won't create one yet, I want to see what's there.
        }

        process.exit(0);

    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
}

checkUsers();
