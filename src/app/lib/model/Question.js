import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        question: {
            type: String,
            required: true
        },
        reply: {
            type: String, // Admin's reply
            default: null
        },
        repliedAt: {
            type: Date
        },
        isReplied: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

export default mongoose.models.Question || mongoose.model("Question", QuestionSchema);
