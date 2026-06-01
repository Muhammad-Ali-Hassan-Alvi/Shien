export function getProductTotalStock(product) {
    if (!product?.variants?.length) return 0;
    return product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
}

export function isProductInStock(product) {
    return getProductTotalStock(product) > 0;
}
