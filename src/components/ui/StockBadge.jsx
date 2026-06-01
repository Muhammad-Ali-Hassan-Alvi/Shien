import { getProductTotalStock, isProductInStock } from "@/app/lib/productStock";

export default function StockBadge({ product, size = "sm", showCount = false }) {
    const inStock = isProductInStock(product);
    const totalStock = getProductTotalStock(product);

    const sizeClasses =
        size === "xs"
            ? "text-[10px] px-1.5 py-0.5"
            : "text-xs px-2 py-0.5";

    if (inStock) {
        return (
            <span
                className={`inline-flex items-center font-bold uppercase tracking-wide rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}
            >
                In Stock
                {showCount && totalStock <= 10 && (
                    <span className="normal-case font-semibold ml-1">({totalStock} left)</span>
                )}
            </span>
        );
    }

    return (
        <span
            className={`inline-flex items-center font-bold uppercase tracking-wide rounded-full bg-red-50 text-red-600 border border-red-200 ${sizeClasses}`}
        >
            Out of Stock
        </span>
    );
}
