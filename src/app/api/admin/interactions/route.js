import connectDB from "@/app/lib/config/db";
import Review from "@/app/lib/model/Review";
import Question from "@/app/lib/model/Question";
import Contact from "@/app/lib/model/Contact";
import Notification from "@/app/lib/model/Notification";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type");

        let data = [];

        if (type === 'reviews') {
            data = await Review.find().populate('user', 'name email').populate('product', 'name images').sort({ createdAt: -1 });
        } else if (type === 'questions') {
            data = await Question.find().populate('user', 'name email').populate('product', 'name images').sort({ createdAt: -1 });
        } else if (type === 'contact') {
            data = await Contact.find().sort({ createdAt: -1 });
        }

        return NextResponse.json({ data });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type");
        const body = await req.json();

        if (type === 'questions') {
            // Reply to Question
            const { id, reply } = body;
            const q = await Question.findByIdAndUpdate(id, {
                reply,
                isReplied: true,
                repliedAt: new Date()
            }, { new: true });

            // Create Notification
            if (q) {
                await Notification.create({
                    user: q.user,
                    type: 'QuestionReply',
                    message: `Admin replied to your question on ${q.product ? 'product' : 'item'}.`,
                    link: `/product/view?id=${q.product}` // Simplified
                });
            }
            return NextResponse.json({ success: true, data: q });
        }

        if (type === 'reviews') {
            // Approve/Reject
            const { id, status } = body;
            const r = await Review.findByIdAndUpdate(id, { status }, { new: true });
            return NextResponse.json({ success: true, data: r });
        }

        if (type === 'contact') {
            // Mark Read/Replied
            const { id, status } = body;
            const c = await Contact.findByIdAndUpdate(id, { status }, { new: true });
            return NextResponse.json({ success: true, data: c });
        }

        return NextResponse.json({ error: "Invalid type" }, { status: 400 });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
