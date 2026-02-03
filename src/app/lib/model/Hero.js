import mongoose from "mongoose";

const HeroSchema = new mongoose.Schema(
    {
        image: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        subtitle: {
            type: String,
        },
        cta: {
            type: String,
            default: "Shop Now",
        },
        link: {
            type: String,
            default: "/#shop",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        order: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);

export default mongoose.models.Hero || mongoose.model("Hero", HeroSchema);
