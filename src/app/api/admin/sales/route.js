import connectDB from "@/app/lib/config/db";
import Product from "@/app/lib/model/Product";
import Sale from "@/app/lib/model/Sale";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        await connectDB();
        const sales = await Sale.find().sort({ createdAt: -1 });
        return NextResponse.json({ sales });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await connectDB();
        const { action, targetType, targetValue, percentage, increasePercentage, label } = await req.json();

        let saleDoc = null;
        let count = 0;

        const query = {};
        if (targetType === 'category') query.category = targetValue;

        // 1. Smart Sale (Increase + Discount)
        if (action === "apply_smart_sale") {
            const products = await Product.find(query);

            const increaseMult = 1 + (Number(increasePercentage) / 100);
            const discountMult = 1 - (Number(percentage) / 100);

            for (const p of products) {
                // 1. Inflate Original Price
                const newOriginal = Math.round(p.pricing.originalPrice * increaseMult);
                // 2. Calculate Sale Price from New Original
                const newSale = Math.round(newOriginal * discountMult);

                p.pricing.originalPrice = newOriginal;
                p.pricing.salePrice = newSale;
                p.pricing.discountLabel = label || `FLAT ${percentage}% OFF`;

                await p.save();
                count++;
            }

            // Create Sale Record
            saleDoc = await Sale.create({
                name: `Campaign: ${label || 'Smart Sale'} (${targetValue || 'All'})`,
                actionType: action,
                targetType,
                targetValue,
                discountPercentage: Number(percentage),
                increasePercentage: Number(increasePercentage),
                label,
                affectedProductCount: count,
                isActive: true
            });
        }

        else if (action === "apply_sale") {
            const products = await Product.find(query);
            for (const p of products) {
                const discount = Number(percentage) / 100;
                const newSalePrice = Math.round(p.pricing.originalPrice * (1 - discount));

                p.pricing.salePrice = newSalePrice;
                p.pricing.discountLabel = label || `FLAT ${percentage}% OFF`;

                await p.save();
                count++;
            }

            saleDoc = await Sale.create({
                name: `Discount: ${percentage}% Off (${targetValue || 'All'})`,
                actionType: action,
                targetType,
                targetValue,
                discountPercentage: Number(percentage),
                label,
                affectedProductCount: count,
                isActive: true
            });
        }

        else if (action === "adjust_price") {
            const multiplier = 1 + (Number(percentage) / 100);
            await Product.updateMany(query, {
                $mul: {
                    "pricing.originalPrice": multiplier,
                    "pricing.salePrice": multiplier
                }
            });

            saleDoc = await Sale.create({
                name: `Price Adjustment: ${percentage}% (${targetValue || 'All'})`,
                actionType: action,
                targetType,
                targetValue,
                increasePercentage: Number(percentage),
                affectedProductCount: await Product.countDocuments(query),
                isActive: true
            });
        }

        else if (action === "reset_prices") {
            // Removes discount: Set SalePrice = OriginalPrice, Remove Label
            const result = await Product.updateMany(query, [
                {
                    $set: {
                        "pricing.salePrice": "$pricing.originalPrice",
                        "pricing.discountLabel": null
                    }
                }
            ]);

            saleDoc = await Sale.create({
                name: `Reset: Removed Discounts (${targetValue || 'All'})`,
                actionType: action,
                targetType,
                targetValue,
                affectedProductCount: result.modifiedCount,
                isActive: false
            });
        }

        return NextResponse.json({ success: true, message: `Action successful`, sale: saleDoc });

    } catch (error) {
        console.error("Sales API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        await connectDB();
        const { id, isActive } = await req.json();

        const sale = await Sale.findById(id);
        if (!sale) return NextResponse.json({ error: "Sale not found" }, { status: 404 });

        const query = {};
        if (sale.targetType === 'category') query.category = sale.targetValue;

        const products = await Product.find(query);

        // If Deactivating (Pausing)
        if (!isActive) {
            for (const p of products) {
                p.pricing.salePrice = p.pricing.originalPrice;
                p.pricing.discountLabel = null;
                await p.save();
            }
        }

        // If Activating (Resuming)
        else {
            const discountMult = 1 - (sale.discountPercentage / 100);
            for (const p of products) {
                const orig = p.pricing.originalPrice;
                const newSale = Math.round(orig * discountMult);

                p.pricing.salePrice = newSale;
                p.pricing.discountLabel = sale.label;
                await p.save();
            }
        }

        sale.isActive = isActive;
        await sale.save();

        return NextResponse.json({ success: true, sale });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
