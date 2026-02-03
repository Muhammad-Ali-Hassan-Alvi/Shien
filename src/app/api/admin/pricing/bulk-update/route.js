import connectDB from "@/app/lib/config/db";
import Product from "@/app/lib/model/Product";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        await connectDB();
        const { category, markupPercentage, discountPercentage } = await req.json();

        if (!category || typeof markupPercentage !== 'number' || typeof discountPercentage !== 'number') {
            return NextResponse.json(
                { error: "Missing required fields: category, markupPercentage, discountPercentage" },
                { status: 400 }
            );
        }

        // 1. Find products in the category
        // Ensure baseCost is present and greater than 0 to avoid zero-price issues
        const products = await Product.find({
            category,
            "pricing.baseCost": { $gt: 0 }
        });

        if (products.length === 0) {
            return NextResponse.json(
                { message: "No products found in this category with valid baseCost." },
                { status: 404 }
            );
        }

        let updatedCount = 0;

        // 2. Apply "Dirty Pricing" Algorithm
        const bulkOperations = products.map((product) => {
            const baseCost = product.pricing.baseCost;

            // FORMULA: 
            // Original (Fake) = Base * (1 + Markup)
            // Sale (Real) = Original * (1 - Discount)

            const newOriginalPrice = Math.round(baseCost * (1 + markupPercentage / 100));
            const newSalePrice = Math.round(newOriginalPrice * (1 - discountPercentage / 100));
            const discountLabel = `${discountPercentage}% OFF`;

            // Safety Check: Ensure we never sell below baseCost (Optional, but good for business)
            // if (newSalePrice < baseCost) { ... } -> For now, we assume Admin knows what they are doing.

            updatedCount++;

            return {
                updateOne: {
                    filter: { _id: product._id },
                    update: {
                        $set: {
                            "pricing.originalPrice": newOriginalPrice,
                            "pricing.salePrice": newSalePrice,
                            "pricing.discountLabel": discountLabel,
                            "isDirtyPriced": true
                        }
                    }
                }
            };
        });

        if (bulkOperations.length > 0) {
            await Product.bulkWrite(bulkOperations);
        }

        return NextResponse.json({
            success: true,
            message: `Updated ${updatedCount} products in ${category}`,
            details: {
                markup: `${markupPercentage}%`,
                discount: `${discountPercentage}%`
            }
        });

    } catch (error) {
        console.error("Pricing Engine Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
