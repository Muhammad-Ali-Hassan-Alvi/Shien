import mongoose from "mongoose";

const SaleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    actionType: {
        type: String, // 'apply_sale', 'apply_smart_sale', 'adjust_price'
        required: true,
    },
    targetType: {
        type: String, // 'category', 'all'
        required: true
    },
    targetValue: {
        type: String, // Category Name or empty
        default: ""
    },
    discountPercentage: {
        type: Number,
        default: 0
    },
    increasePercentage: {
        type: Number,
        default: 0
    },
    label: {
        type: String, // e.g., "FLAT 50% OFF"
    },
    isActive: {
        type: Boolean,
        default: true
    },
    affectedProductCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

export default mongoose.models.Sale || mongoose.model("Sale", SaleSchema);
