import connectDB from "@/app/lib/config/db";
import Product from "@/app/lib/model/Product";
import Sale from "@/app/lib/model/Sale";
import User from "@/app/lib/model/User";
import Notification from "@/app/lib/model/Notification";
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
        const { action, targetType, targetValue, percentage, increasePercentage, label, description, startDate, endDate } = await req.json();

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
                description,
                startDate,
                endDate,
                actionType: action,
                targetType,
                targetValue,
                discountPercentage: Number(percentage),
                increasePercentage: Number(increasePercentage),
                label,
                affectedProductCount: count,
                isActive: true
            });

            // Notify All Users
            const users = await User.find({}, '_id');
            if (users.length > 0) {
                const notes = users.map(u => ({
                    user: u._id,
                    type: "Sale",
                    message: `SALE ALERT! ${label || `FLAT ${percentage}% OFF`} on ${targetValue || 'everything'}!`,
                    link: "/", // Or a specific sales page
                    isRead: false
                }));
                await Notification.insertMany(notes);
            }
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
                description,
                startDate,
                endDate,
                actionType: action,
                targetType,
                targetValue,
                discountPercentage: Number(percentage),
                label,
                affectedProductCount: count,
                isActive: true
            });

            // Notify All Users
            const users = await User.find({}, '_id');
            if (users.length > 0) {
                const notes = users.map(u => ({
                    user: u._id,
                    type: "Sale",
                    message: `SALE ALERT! ${label || `FLAT ${percentage}% OFF`} on ${targetValue || 'everything'}!`,
                    link: "/", // Or a specific sales page
                    isRead: false
                }));
                await Notification.insertMany(notes);
            }
        }

        // ... (Other legacy actions if needed, or keep them)
        else if (action === "reset_prices") {
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
        const { id, isActive, ...updates } = await req.json();

        const sale = await Sale.findById(id);
        if (!sale) return NextResponse.json({ error: "Sale not found" }, { status: 404 });

        const query = {};
        if (sale.targetType === 'category') query.category = sale.targetValue;

        // Toggle Status Logic
        if (isActive !== undefined) {
            const products = await Product.find(query);
            if (!isActive) { // Pausing
                for (const p of products) {
                    p.pricing.salePrice = p.pricing.originalPrice;
                    p.pricing.discountLabel = null;
                    await p.save();
                }
            } else { // Resuming
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
        }

        // Edit Fields Logic (Description, dates, PERCENTAGE, or TARGET changes)
        if (updates) {
            if (updates.description !== undefined) sale.description = updates.description;
            if (updates.startDate !== undefined) sale.startDate = updates.startDate;
            if (updates.endDate !== undefined) sale.endDate = updates.endDate;

            // Handle Target Change (Categories)
            if (updates.targetValue && updates.targetValue !== sale.targetValue) {
                // 1. Reset OLD Target Products (Remove Discount)
                const oldQuery = {};
                if (sale.targetType === 'category') oldQuery.category = sale.targetValue;

                await Product.updateMany(oldQuery, [
                    {
                        $set: {
                            "pricing.salePrice": "$pricing.originalPrice",
                            "pricing.discountLabel": null
                        }
                    }
                ]);

                // 2. Update Sale Object with NEW Target
                sale.targetValue = updates.targetValue;
                sale.targetType = updates.targetValue === 'all' ? 'all' : 'category';
                sale.name = sale.name.replace(/\(.*\)/, `(${sale.targetValue || 'All'})`); // Update name target part

                // 3. Apply Sale to NEW Target Products (if active)
                if (sale.isActive) {
                    const newQuery = {};
                    if (sale.targetType === 'category') newQuery.category = sale.targetValue;

                    const newDiscount = updates.discountPercentage !== undefined ? Number(updates.discountPercentage) : sale.discountPercentage;
                    const newLabel = updates.label !== undefined ? updates.label : sale.label;

                    const products = await Product.find(newQuery);
                    const discountMult = 1 - (newDiscount / 100);

                    // Note: If it was a Smart Sale (Inflation), we are NOT applying new inflation here to avoid double inflation if products were already inflated.
                    // We simply apply the discount to their CURRENT originalPrice. 
                    // This assumes the user manages "Base Prices" separately if they want to move inflation around.

                    for (const p of products) {
                        const orig = p.pricing.originalPrice;
                        const newSale = Math.round(orig * discountMult);
                        p.pricing.salePrice = newSale;
                        p.pricing.discountLabel = newLabel;
                        await p.save();
                    }

                    // Update Affected Count
                    sale.affectedProductCount = products.length;
                }
            }

            // If discount/label changed AND sale is active (and we didn't just swp targets which handled this)
            // Only run this if we DIDN'T just swap targets (because swapping targets already applied the new discount/label)
            else if ((updates.discountPercentage !== undefined || updates.label !== undefined) && sale.isActive) {
                const newDiscount = updates.discountPercentage !== undefined ? Number(updates.discountPercentage) : sale.discountPercentage;
                const newLabel = updates.label !== undefined ? updates.label : sale.label;

                const query = {};
                if (sale.targetType === 'category') query.category = sale.targetValue;

                const products = await Product.find(query);
                const discountMult = 1 - (newDiscount / 100);

                for (const p of products) {
                    const orig = p.pricing.originalPrice;
                    const newSale = Math.round(orig * discountMult);
                    p.pricing.salePrice = newSale;
                    p.pricing.discountLabel = newLabel;
                    await p.save();
                }
            }

            if (updates.discountPercentage !== undefined) sale.discountPercentage = Number(updates.discountPercentage);
            if (updates.label !== undefined) sale.label = updates.label;
        }

        await sale.save();
        return NextResponse.json({ success: true, sale });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
