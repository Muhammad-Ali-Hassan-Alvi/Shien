/** Build /products URL with query params for category, search, or sort. */
export function productsLink({ category, search, sort } = {}) {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (search) params.set("search", search);
    if (sort) params.set("sort", sort);
    const qs = params.toString();
    return qs ? `/products?${qs}` : "/products";
}
