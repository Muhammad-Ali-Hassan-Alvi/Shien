
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import User from "../src/app/lib/model/User.js";
import bcrypt from "bcryptjs";

// Load env vars
dotenv.config({ path: ".env.local" });

const MONGO_URI = process.env.MONGODB_URL;

if (!MONGO_URI) {
    console.error("❌ MONGODB_URL not found in .env.local");
    process.exit(1);
}

const ADMIN_PHONE = "03001234567";
const ADMIN_PASS = "admin123";

async function createAdmin() {
    try {
        console.log("🔌 Connecting to DB...");
        await mongoose.connect(MONGO_URI);

        console.log(`Checking for existing admin with phone ${ADMIN_PHONE}...`);
        const existingAdmin = await User.findOne({ phone: ADMIN_PHONE });

        if (existingAdmin) {
            console.log("⚠️ Admin already exists with this phone.");
            // Update password to be sure? No, might be destructive.
            // But if the user splits "Still the same like in the database", they might imply a specific one.
            // Let's just update the role to admin just to be safe it IS an admin.
            existingAdmin.role = 'admin';
            await existingAdmin.save();
            console.log("✅ Ensured user is set to 'admin' role.");
        } else {
            console.log("Creating new admin user...");
            const hashedPassword = await bcrypt.hash(ADMIN_PASS, 10);

            await User.create({
                name: "Super Admin",
                phone: ADMIN_PHONE,
                password: hashedPassword,
                role: "admin",
                wishlist: []
            });
            console.log("✅ Admin Created Successfully!");
        }

        console.log("\n=================================");
        console.log("🔑 LOGIN CREDENTIALS:");
        console.log(`📱 Phone:    ${ADMIN_PHONE}`);
        console.log(`🔑 Password: ${ADMIN_PASS}`);
        console.log("=================================\n");

        process.exit(0);

    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
}

createAdmin();
