import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        slug: {
            type: String,
            unique: true,
            index: true,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
            index: true,
        },
        pricing: {
            baseCost: {
                type: Number,
                required: true,
                default: 0
            }, // The anchor for all calculations
            originalPrice: {
                type: Number,
                default: 0
            }, // The inflated "Fake" Price e.g. 5000 (Crossed out)
            salePrice: {
                type: Number,
                required: true,
                default: 0
            },     // The actual selling price e.g. 3500
            discountLabel: {
                type: String,
                default: ""
            }, // "30% OFF"
        },
        variants: [
            {
                color: String,
                size: String, // S, M, L, XL
                stock: {
                    type: Number,
                    default: 0,
                },
            },
        ],
        images: {
            type: [String],
            default: [],
        },
        isDirtyPriced: {
            type: Boolean,
            default: false
        },
        isFlashSale: {
            type: Boolean,
            default: false
        },
        isArchived: {
            type: Boolean,
            default: false,
            index: true
        },
        averageRating: {
            type: Number,
            default: 0,
            index: true
        }
    },
    { timestamps: true }
);

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
