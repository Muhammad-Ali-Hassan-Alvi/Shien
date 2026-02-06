import mongoose from "mongoose";
import * as dotenv from "dotenv";
import Admin from "../src/app/lib/model/Admin.js"; // Direct path to new model
import bcrypt from "bcryptjs";

// Load env vars
dotenv.config({ path: ".env.local" });

const MONGO_URI = process.env.MONGODB_URL;

if (!MONGO_URI) {
    console.error("❌ MONGODB_URL not found in .env.local");
    process.exit(1);
}

const ADMIN_EMAIL = "admin@shein.pk";
const ADMIN_PASS = "admin123";

async function createAdmin() {
    try {
        console.log("🔌 Connecting to DB...");
        await mongoose.connect(MONGO_URI);

        console.log(`Checking for existing admin: ${ADMIN_EMAIL}...`);
        const existingAdmin = await Admin.findOne({ email: ADMIN_EMAIL });

        if (existingAdmin) {
            console.log("⚠️ Admin already exists.");
            existingAdmin.role = 'admin';
            existingAdmin.isSuperAdmin = true;
            await existingAdmin.save();
            console.log("✅ Updated existing admin role/status.");
        } else {
            console.log("Creating new SUPER ADMIN...");
            const hashedPassword = await bcrypt.hash(ADMIN_PASS, 10);

            await Admin.create({
                name: "Super Admin",
                email: ADMIN_EMAIL,
                password: hashedPassword,
                role: "admin",
                isSuperAdmin: true,
            });
            console.log("✅ Super Admin Created Successfully!");
        }

        console.log("\n=================================");
        console.log("🔑 LOGIN CREDENTIALS:");
        console.log(`📧 Email:    ${ADMIN_EMAIL}`);
        console.log(`🔑 Password: ${ADMIN_PASS}`);
        console.log("=================================\n");

        process.exit(0);

    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
}

createAdmin();
