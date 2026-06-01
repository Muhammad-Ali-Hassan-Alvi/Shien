import connectDB from "@/app/lib/config/db";
import Question from "@/app/lib/model/Question";
import { notifyAllAdmins } from "@/lib/notificationService";
import { emitQuestionCreated } from "@/lib/socket-server";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const productId = searchParams.get("productId");

        if (!productId) {
            return NextResponse.json({ error: "Product ID required" }, { status: 400 });
        }

        const questions = await Question.find({ product: productId })
            .populate("user", "name email image")
            .sort({ createdAt: -1 });

        return NextResponse.json({ questions });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await connectDB();
        const session = await auth();
        const body = await req.json();
        const { productId, question, userId: bodyUserId } = body;

        const userId = session?.user?.id || bodyUserId;

        if (!userId || !productId || !question) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const newQuestion = await Question.create({
            user: userId,
            product: productId,
            question,
        });

        const questionWithDetails = await Question.findById(newQuestion._id)
            .populate("user", "name image")
            .populate("product", "name slug");

        const userName = questionWithDetails.user?.name || session?.user?.name || "Customer";
        const productName = questionWithDetails.product?.name || "a product";

        await notifyAllAdmins({
            type: "NewQuestion",
            message: `New Q&A on "${productName}" from ${userName}`,
            link: "/seller-center/questions",
        });

        emitQuestionCreated(questionWithDetails);

        return NextResponse.json({ success: true, question: questionWithDetails }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
