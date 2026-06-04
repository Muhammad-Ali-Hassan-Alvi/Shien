/** Tailwind classes for order status badges. */
export function getOrderStatusColor(status) {
    switch (status) {
        case "Pending":
            return "bg-yellow-100 text-yellow-800";
        case "Confirmed":
            return "bg-blue-100 text-blue-800";
        case "Dispatched":
            return "bg-purple-100 text-purple-800";
        case "Delivered":
            return "bg-green-100 text-green-800";
        case "Cancelled":
            return "bg-red-100 text-red-800";
        case "Returned":
            return "bg-orange-100 text-orange-800";
        default:
            return "bg-gray-100 text-gray-800";
    }
}

export const ORDER_STATUS_STEPS = ["Pending", "Confirmed", "Dispatched", "Delivered"];

/** Serialize a lean Mongo order doc for client components. */
export function serializeOrder(order) {
    if (!order) return null;
    return {
        ...order,
        _id: order._id.toString(),
        user: order.user?.toString?.() ?? String(order.user),
        items: (order.items || []).map((item) => ({
            ...item,
            _id: item._id ? item._id.toString() : undefined,
            product: item.product ? item.product.toString() : undefined,
        })),
    };
}
