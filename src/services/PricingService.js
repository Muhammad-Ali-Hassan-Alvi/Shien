export class PricingService {
    /**
     * Calculates the final "Dirty" pricing details.
     * Logic:
     * 1. Calculate Target Sale Price = Base Cost + (Base Cost * Markup %)
     * 2. Calculate Fake Original Price = Target Sale Price / (1 - Discount %)
     * 3. Round everything to nearest whole number (or 10/100 for psychological pricing)
     */
    static calculateDirtyPrice(baseCost, markupPercentage = 30, discountPercentage = 20) {
        const base = Number(baseCost);
        const markup = Number(markupPercentage) / 100;
        const discount = Number(discountPercentage) / 100;

        // 1. Target Safe Sale Price (Net Profit integrated)
        let rawSalePrice = base + (base * markup);

        // Round to nearest 50 or 100 for cleaner pricing (e.g. 1450, 1500)
        // For this example, nearest 10
        const salePrice = Math.ceil(rawSalePrice / 10) * 10;

        // 2. Fake Original Price (The value crossed out)
        // SalePrice = Original * (1 - discount)
        // Original = SalePrice / (1 - discount)
        let rawOriginalPrice = salePrice / (1 - discount);

        const originalPrice = Math.ceil(rawOriginalPrice / 10) * 10;

        return {
            baseCost: base,
            salePrice: salePrice,
            originalPrice: originalPrice,
            markupPercentage: markupPercentage,
            discountPercentage: discountPercentage,
            discountLabel: `-${discountPercentage}%`
        };
    }

    static formatCurrency(amount) {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0
        }).format(amount);
    }
}
