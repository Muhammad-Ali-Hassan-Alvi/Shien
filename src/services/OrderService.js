import connectDB from "@/app/lib/config/db";
import Order from "@/app/lib/model/Order";
import Product from "@/app/lib/model/Product";
import mongoose from "mongoose";

export class OrderService {
    static async createOrder(userId, orderData) {
        await connectDB();

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const { items, shippingInfo, paymentMethod } = orderData;
            let totalAmount = 0;
            const finalItems = [];

            for (const item of items) {
                // Find product with locking is complex in Mongoose without 'for update', 
                // but atomic update checks work well.
                const product = await Product.findOne({ _id: item.product }).session(session);

                if (!product) {
                    throw new Error(`Product ${item.product} not found`);
                }

                // Check Stock for Variant
                const variantIndex = product.variants.findIndex(
                    v => v.color === item.variant.color && v.size === item.variant.size
                );

                if (variantIndex === -1) {
                    throw new Error(`Variant ${item.variant.size}/${item.variant.color} not found for ${product.name}`);
                }

                const variant = product.variants[variantIndex];
                if (variant.stock < item.quantity) {
                    throw new Error(`Insufficient stock for ${product.name} (${variant.size}/${variant.color})`);
                }

                // Reduce Stock
                product.variants[variantIndex].stock -= item.quantity;
                // Use markModified if needed, but array mutation usually detected
                // Safer to use $inc via updateOne if concurrency is super high, but save() in transaction is okay here
                await product.save({ session });

                // Calculate Price
                const price = product.pricing.salePrice;
                totalAmount += price * item.quantity;

                finalItems.push({
                    product: product._id,
                    name: product.name,
                    image: product.images[0],
                    price: price,
                    quantity: item.quantity,
                    variant: item.variant
                });
            }

            // Create Order
            const [order] = await Order.create([{
                user: userId,
                items: finalItems,
                shippingInfo,
                paymentMethod,
                totalAmount,
                status: 'Pending'
            }], { session });

            await session.commitTransaction();
            return order;

        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }
}
