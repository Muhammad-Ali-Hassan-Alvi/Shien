import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        /** Snapshot when product is deleted — for admin display. */
        productName: {
            type: String,
            default: "",
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            required: true
        },
        images: {
            type: [String],
            default: []
        },
        status: {
            type: String,
            enum: ["Pending", "Approved", "Rejected"],
            default: "Pending" // Require approval? Or default Approved. Let's say Pending for moderation.
        }
    },
    { timestamps: true }
);

export default mongoose.models.Review || mongoose.model("Review", ReviewSchema);
