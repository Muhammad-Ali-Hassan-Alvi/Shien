
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import User from "../src/app/lib/model/User.js";

dotenv.config({ path: ".env.local" });

const MONGO_URI = process.env.MONGODB_URL;

async function debugAdmin() {
    if (!MONGO_URI) { console.error("No Mongo URI"); process.exit(1); }

    try {
        await mongoose.connect(MONGO_URI);
        // Find user by email 'admin@admin.com' (as seen in screenshot logic from user comments)
        // or just find ANY user and print keys.
        const admin = await User.findOne({ email: "admin@admin.com" });

        if (admin) {
            console.log("Found Admin via Mongoose:");
            console.log(admin);
            console.log("Role Field:", admin.role);
            console.log("UserType Field:", admin.get('userType')); // Check for hidden fields
        } else {
            console.log("Admin not found via Schema. searching raw...");
            // This might fail if schema is strict.
        }

        // Let's also check raw collection content using mongoose.connection
        const rawUser = await mongoose.connection.collection('users').findOne({ email: "admin@admin.com" });
        console.log("\nRAW DATABASE RECORD:");
        console.log(rawUser);

        process.exit(0);
    } catch (e) { console.error(e); process.exit(1); }
}

debugAdmin();
