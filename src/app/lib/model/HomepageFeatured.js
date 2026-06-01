import mongoose from "mongoose";

const HomepageFeaturedSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            default: "main",
            unique: true,
        },
        flashSaleProducts: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
            },
        ],
        hotDropProducts: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
            },
        ],
        flashSaleEndsAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

export default mongoose.models.HomepageFeatured ||
    mongoose.model("HomepageFeatured", HomepageFeaturedSchema);
