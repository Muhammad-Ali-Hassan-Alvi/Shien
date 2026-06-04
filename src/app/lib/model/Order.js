import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                },
                name: String,
                slug: String,
                image: String,
                price: Number,
                quantity: Number,
                variant: {
                    color: String,
                    size: String,
                },
            },
        ],
        shippingInfo: {
            fullName: { type: String, required: true },
            email: { type: String, required: true },
            phone: { type: String, required: true },
            address: { type: String, required: true },
            city: { type: String, required: true }, // Verified against JSON list in frontend/backend
            nearestLandmark: String,
        },
        paymentMethod: {
            type: String,
            default: "COD",
            enum: ["COD", "GOPAYFAST"],
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed"],
            default: "pending",
        },
        payfastBasketId: { type: String },
        payfastMerchantTxnId: { type: String },
        status: {
            type: String,
            enum: [
                "Pending",
                "Confirmed",
                "Dispatched",
                "Delivered",
                "Cancelled",
                "Returned",
            ],
            default: "Pending",
        },
        totalAmount: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
