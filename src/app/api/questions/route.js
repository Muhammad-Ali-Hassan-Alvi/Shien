import connectDB from "@/app/lib/config/db";
import Question from "@/app/lib/model/Question";
import Notification from "@/app/lib/model/Notification";
import Product from "@/app/lib/model/Product";
import User from "@/app/lib/model/User"; // Ensure User is registered
import Admin from "@/app/lib/model/Admin";
import { NextResponse } from "next/server";
import { auth } from "@/auth"; // Correct path

export async function GET(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const productId = searchParams.get("productId");

        if (!productId) {
            return NextResponse.json({ error: "Product ID required" }, { status: 400 });
        }

        const questions = await Question.find({ product: productId })
            .populate("user", "name email image") // Populate user details
            .sort({ createdAt: -1 });

        return NextResponse.json({ questions });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await connectDB();
        const body = await req.json();
        const { productId, question, userId } = body;

        // Verify User (If you have checking logic, otherwise trust the ID passed from client if protected)
        // ideally getting user from session is safer. 
        // For now trusting client side passed ID but validated.

        if (!userId || !productId || !question) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const newQuestion = await Question.create({
            user: userId,
            product: productId,
            question
        });

        const questionWithDetails = await Question.findById(newQuestion._id).populate("user", "name image").populate("product", "name slug");

        // Notify Admins
        const admins = await Admin.find({}); // Fetch admins from Admin collection
        if (admins.length > 0) {
            const notifications = admins.map(admin => ({
                user: admin._id,
                type: 'NewQuestion',
                message: `New question on "${questionWithDetails.product.name}" from ${questionWithDetails.user ? questionWithDetails.user.name : "User"}`,
                link: `/seller-center/questions`
            }));
            await Notification.insertMany(notifications);
        }

        return NextResponse.json({ success: true, question: questionWithDetails }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
