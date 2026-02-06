import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        type: {
            type: String,
            required: true // 'QuestionReply', 'OrderUpdate', 'FabricUpdate'
        },
        message: {
            type: String,
            required: true
        },
        link: {
            type: String, // e.g., /product/slug#qna
        },
        isRead: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

export default mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);
