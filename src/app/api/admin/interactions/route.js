import connectDB from "@/app/lib/config/db";
import Review from "@/app/lib/model/Review";
import Question from "@/app/lib/model/Question";
import Contact from "@/app/lib/model/Contact";
import Product from "@/app/lib/model/Product";
import { createUserNotification } from "@/lib/notificationService";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type");

        let data = [];

        if (type === "reviews") {
            data = await Review.find()
                .populate("user", "name email")
                .populate("product", "name images slug")
                .sort({ createdAt: -1 });
        } else if (type === "questions") {
            data = await Question.find()
                .populate("user", "name email")
                .populate("product", "name images slug")
                .sort({ createdAt: -1 });
        } else if (type === "contact") {
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

        if (type === "questions") {
            const { id, reply } = body;
            const q = await Question.findByIdAndUpdate(
                id,
                {
                    reply,
                    isReplied: true,
                    repliedAt: new Date(),
                },
                { new: true }
            ).populate("product", "name slug");

            if (q?.user) {
                const productName = q.product?.name || "your product";
                const slug = q.product?.slug;
                await createUserNotification({
                    userId: q.user,
                    type: "QuestionReply",
                    message: `Admin answered your question on "${productName}"`,
                    link: slug ? `/product/${slug}#qna-${q._id}` : "/products",
                });
            }
            return NextResponse.json({ success: true, data: q });
        }

        if (type === "reviews") {
            const { id, status } = body;
            const r = await Review.findByIdAndUpdate(id, { status }, { new: true }).populate(
                "product",
                "name slug"
            );

            if (r?.user && (status === "Approved" || status === "Rejected")) {
                const productName = r.product?.name || "your product";
                const slug = r.product?.slug;
                const approved = status === "Approved";
                await createUserNotification({
                    userId: r.user,
                    type: approved ? "ReviewApproved" : "ReviewRejected",
                    message: approved
                        ? `Your review on "${productName}" is now live`
                        : `Your review on "${productName}" was not approved`,
                    link: slug ? `/product/${slug}#reviews` : "/products",
                });

                if (approved) {
                    const stats = await Review.aggregate([
                        { $match: { product: r.product._id, status: "Approved" } },
                        {
                            $group: {
                                _id: "$product",
                                avg: { $avg: "$rating" },
                                count: { $sum: 1 },
                            },
                        },
                    ]);
                    if (stats.length > 0) {
                        await Product.findByIdAndUpdate(r.product._id, {
                            averageRating: stats[0].avg,
                            reviewCount: stats[0].count,
                        });
                    }
                }
            }
            return NextResponse.json({ success: true, data: r });
        }

        if (type === "contact") {
            const { id, status } = body;
            const c = await Contact.findByIdAndUpdate(id, { status }, { new: true });
            return NextResponse.json({ success: true, data: c });
        }

        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
