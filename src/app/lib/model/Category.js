import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        slug: {
            type: String,
            unique: true,
            lowercase: true,
        },
        parent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            default: null,
            index: true,
        },
        order: {
            type: Number,
            default: 0,
        },
        showInNav: {
            type: Boolean,
            default: true,
        },
        /** Top-level "line" tabs in navbar (e.g. Woman, Man, Fragrances). Root categories only. */
        isLine: {
            type: Boolean,
            default: false,
        },
        image: String,
        description: String,
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

export default mongoose.models.Category || mongoose.model("Category", CategorySchema);
