import connectDB from "@/app/lib/config/db";
import Question from "@/app/lib/model/Question";
import Notification from "@/app/lib/model/Notification";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        await connectDB();

        // Fetch questions where reply is either pending or all
        // Usually admin wants to see all, sorted by unanswered first
        const questions = await Question.find({})
            .populate("user", "name email image")
            .populate("product", "name slug images") // Populate product details to show which product
            .sort({ isReplied: 1, createdAt: -1 }); // Unreplied first

        return NextResponse.json({ questions });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        await connectDB();
        const { id, reply } = await req.json();

        if (!id || !reply) {
            return NextResponse.json({ error: "ID and Reply required" }, { status: 400 });
        }

        const updatedQuestion = await Question.findByIdAndUpdate(
            id,
            {
                reply,
                repliedAt: new Date(),
                isReplied: true
            },
            { new: true }
        ).populate("product", "name slug");

        if (!updatedQuestion) {
            return NextResponse.json({ error: "Question not found" }, { status: 404 });
        }

        // Notify User
        if (updatedQuestion.user) {
            await Notification.create({
                user: updatedQuestion.user,
                type: "QuestionReply",
                message: `Admin replied on "${updatedQuestion.product?.name || 'Product'}"`,
                link: `/product/${updatedQuestion.product?.slug || '#'}#qna-${updatedQuestion._id}`
            });
        }

        return NextResponse.json({ success: true, question: updatedQuestion });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
