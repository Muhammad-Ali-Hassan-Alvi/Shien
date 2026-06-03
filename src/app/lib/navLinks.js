/** Build /products URL with query params for category, search, sort, price, or discount. */
export function productsLink({ category, search, sort, minPrice, maxPrice, minDiscount, maxDiscount } = {}) {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (search) params.set("search", search);
    if (sort) params.set("sort", sort);
    if (minPrice != null && minPrice !== "") params.set("minPrice", String(minPrice));
    if (maxPrice != null && maxPrice !== "") params.set("maxPrice", String(maxPrice));
    if (minDiscount != null && minDiscount !== "") params.set("minDiscount", String(minDiscount));
    if (maxDiscount != null && maxDiscount !== "") params.set("maxDiscount", String(maxDiscount));
    const qs = params.toString();
    return qs ? `/products?${qs}` : "/products";
}
