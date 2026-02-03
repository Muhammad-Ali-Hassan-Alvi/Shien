import { z } from "zod";

export const ProductInputSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    category: z.string().min(1, "Category is required"),
    pricing: z.object({
        baseCost: z.coerce.number().min(0),
        originalPrice: z.coerce.number().min(0).optional(),
        salePrice: z.coerce.number().min(0),
        markup: z.coerce.number().min(0).optional(), // For automated calculation
        discountPercentage: z.coerce.number().min(0).max(100).optional(),
    }),
    variants: z.array(
        z.object({
            color: z.string(),
            size: z.string(),
            stock: z.coerce.number().min(0),
        })
    ),
    images: z.array(z.string().url()).optional(),
    isFlashSale: z.boolean().optional(),
});

export const OrderInputSchema = z.object({
    items: z.array(
        z.object({
            product: z.string(),
            quantity: z.number().min(1),
            variant: z.object({
                color: z.string(),
                size: z.string(),
            }),
        })
    ).min(1, "Order must have at least one item"),
    shippingInfo: z.object({
        fullName: z.string().min(2),
        phone: z.string().regex(/^03\d{9}$/, "Invalid Pakistani Phone Number (03XXXXXXXXX)"),
        address: z.string().min(5),
        city: z.string().min(2),
    }),
    paymentMethod: z.enum(["COD"]),
});
