import connectDB from "@/app/lib/config/db";
import Order from "@/app/lib/model/Order";
import Product from "@/app/lib/model/Product";
import mongoose from "mongoose";
import { notifyAllAdmins } from "@/lib/notificationService";
import { resolveVariantForOrder } from "@/app/lib/productUtils";

const LOW_STOCK = 3;

async function checkLowStockAfterOrder(product, variant) {
    if (variant.stock > 0 && variant.stock <= LOW_STOCK) {
        await notifyAllAdmins({
            type: "LowStock",
            message: `Low stock after order: "${product.name}" (${variant.size}/${variant.color}: ${variant.stock} left)`,
            link: `/seller-center/products/edit/${product._id}`,
        });
    } else if (variant.stock === 0) {
        await notifyAllAdmins({
            type: "OutOfStock",
            message: `"${product.name}" variant ${variant.size}/${variant.color} is out of stock`,
            link: `/seller-center/products/edit/${product._id}`,
        });
    }
}

export class OrderService {
    static async createOrder(userId, orderData) {
        await connectDB();

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const { items, shippingInfo, paymentMethod } = orderData;
            let totalAmount = 0;
            const finalItems = [];

            const stockAlerts = [];

            for (const item of items) {
                // Find product with locking is complex in Mongoose without 'for update', 
                // but atomic update checks work well.
                const product = await Product.findOne({ _id: item.product }).session(session);

                if (!product) {
                    throw new Error(`Product ${item.product} not found`);
                }

                // Match variant flexibly — cart may have stale color/size labels (e.g. Mixed vs Default)
                const { index: variantIndex, variant, resolved } = resolveVariantForOrder(
                    product.variants,
                    item.variant
                );

                if (variantIndex === -1 || !variant) {
                    throw new Error(`No variants available for ${product.name}`);
                }
                if (variant.stock < item.quantity) {
                    throw new Error(`Insufficient stock for ${product.name} (${variant.size}/${variant.color})`);
                }

                // Reduce Stock
                product.variants[variantIndex].stock -= item.quantity;
                await product.save({ session });

                const updatedVariant = product.variants[variantIndex];
                stockAlerts.push({ product, variant: { ...updatedVariant } });

                // Calculate Price
                const price = product.pricing.salePrice;
                totalAmount += price * item.quantity;

                finalItems.push({
                    product: product._id,
                    name: product.name,
                    slug: product.slug,
                    image: product.images?.[0] || "",
                    price: price,
                    quantity: item.quantity,
                    variant: {
                        color: resolved.color,
                        size: resolved.size,
                    },
                });
            }

            const isOnline = paymentMethod === "GOPAYFAST";

            const [order] = await Order.create([{
                ...(userId ? { user: userId } : {}),
                items: finalItems,
                shippingInfo,
                paymentMethod,
                paymentStatus: isOnline ? "pending" : "paid",
                totalAmount,
                status: "Pending",
            }], { session });

            if (isOnline) {
                order.payfastBasketId = String(order._id);
                await order.save({ session });
            }

            await session.commitTransaction();

            for (const { product, variant } of stockAlerts) {
                try {
                    await checkLowStockAfterOrder(product, variant);
                } catch (e) {
                    console.error("Low stock alert failed:", e);
                }
            }

            return order;

        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }
}
