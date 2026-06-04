"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useCartStore } from "@/store/useCartStore";
import { useUIStore } from "@/store/useUIStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { Star, Truck, ShieldCheck, RefreshCcw, Heart, ChevronRight, Plus, Minus } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { productsLink } from "@/app/lib/navLinks";
import ProductCard from "./ProductCard";
import ProductReviews from "./ProductReviews";
import ProductQA from "./ProductQA";
import ShareProductButton from "./ShareProductButton";
import { DEFAULT_VARIANT_SETTINGS } from "@/app/lib/categoryUtils";
import { findMatchingVariant } from "@/app/lib/productUtils";

export default function ProductView({ product, relatedProducts = [], variantConfig = DEFAULT_VARIANT_SETTINGS }) {
    const { addItem } = useCartStore();
    const { openCart } = useUIStore();
    const { toggleWishlist, isInWishlist } = useWishlistStore();

    const initialVariant = findMatchingVariant(product.variants, {
        color: product.variants?.[0]?.color,
        size: product.variants?.[0]?.size,
    });

    const [selectedVariant, setSelectedVariant] = useState(initialVariant);
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState(0);
    const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
    const [showZoom, setShowZoom] = useState(false);
    const [zoomPanel, setZoomPanel] = useState({ top: 0, left: 0, width: 420, height: 560 });
    const hoveredCellRef = useRef(null);

    const images = product.images?.length > 0 ? product.images : [];

    const supportsSizes = variantConfig.supportsSizes !== false;
    const supportsColors = variantConfig.supportsColors !== false;
    const sizeOptions =
        variantConfig.sizeOptions?.length > 0
            ? variantConfig.sizeOptions
            : DEFAULT_VARIANT_SETTINGS.sizeOptions;

    const reviewCount = product.reviewCount || 0;
    const averageRating = product.averageRating || 0;

    const maxStock = Math.max(0, selectedVariant?.stock ?? 0);
    const inStock = maxStock > 0;

    useEffect(() => {
        setQuantity(1);
    }, [selectedVariant.color, selectedVariant.size]);

    useEffect(() => {
        const base = product.variants?.[0] || {};
        const next = findMatchingVariant(product.variants, {
            color: supportsColors ? base.color || "Default" : "Default",
            size: supportsSizes ? base.size || sizeOptions[0] : "One Size",
        });
        setSelectedVariant(next);
    }, [product._id, supportsSizes, supportsColors, sizeOptions.join(",")]);

    const pickVariant = (partial) => {
        setSelectedVariant(
            findMatchingVariant(product.variants, {
                color: partial.color ?? selectedVariant.color,
                size: partial.size ?? selectedVariant.size,
            })
        );
    };

    const handleWishlist = () => {
        toggleWishlist(product);
    };

    const wishlisted = isInWishlist(product._id);

    useEffect(() => {
        if (quantity > maxStock) setQuantity(maxStock);
    }, [maxStock, quantity]);

    const handleAddToCart = () => {
        if (!inStock) {
            toast.error("This item is out of stock");
            return;
        }
        addItem(product, selectedVariant, quantity);
        openCart();
    };

    const decreaseQty = () => setQuantity((q) => Math.max(1, q - 1));
    const increaseQty = () => setQuantity((q) => Math.min(maxStock, q + 1));

    const handleQtyInput = (e) => {
        const val = parseInt(e.target.value, 10);
        if (Number.isNaN(val) || val < 1) {
            setQuantity(1);
        } else {
            setQuantity(Math.min(maxStock, val));
        }
    };

    const { salePrice, originalPrice } = product.pricing;
    const discountPercent = originalPrice > salePrice ? Math.round(((originalPrice - salePrice) / originalPrice) * 100) : 0;

    const categoryLabel = product.category || "Products";

    const updateZoomPanelPosition = useCallback((el) => {
        if (!el || typeof window === "undefined") return;
        const rect = el.getBoundingClientRect();
        const gridEl = el.closest("[data-product-image-grid]");
        const gridRect = gridEl?.getBoundingClientRect() ?? rect;
        const panelWidth = Math.min(420, window.innerWidth * 0.32);
        const panelHeight = rect.height;
        const gap = 12;
        const margin = 16;

        // Sit in the gap between the image grid and product details
        let left = gridRect.right + gap;
        if (left + panelWidth > window.innerWidth - margin) {
            left = gridRect.left - panelWidth - gap;
        }

        // Match vertical position of the hovered image
        let top = rect.top;
        if (top + panelHeight > window.innerHeight - margin) {
            top = window.innerHeight - panelHeight - margin;
        }
        top = Math.max(margin, top);

        setZoomPanel({ top, left, width: panelWidth, height: panelHeight });
    }, []);

    const handleMouseMove = (e) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setZoomPos({ x, y });
        updateZoomPanelPosition(e.currentTarget);
    };

    const handleImageEnter = (idx, e) => {
        hoveredCellRef.current = e.currentTarget;
        setActiveImage(idx);
        setShowZoom(true);
        updateZoomPanelPosition(e.currentTarget);
    };

    const handleImageLeave = () => {
        hoveredCellRef.current = null;
        setShowZoom(false);
    };

    useEffect(() => {
        if (!showZoom) return;

        const reposition = () => {
            if (hoveredCellRef.current) {
                updateZoomPanelPosition(hoveredCellRef.current);
            }
        };

        window.addEventListener("scroll", reposition, true);
        window.addEventListener("resize", reposition);
        return () => {
            window.removeEventListener("scroll", reposition, true);
            window.removeEventListener("resize", reposition);
        };
    }, [showZoom, updateZoomPanelPosition]);

    return (
        <div className="min-h-screen text-gray-800 pb-20">

            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs text-gray-500 py-4 px-4 md:px-8 max-w-[1600px] mx-auto">
                <Link href="/" className="hover:text-black">Home</Link> <ChevronRight size={12} />
                <Link href={productsLink({ category: product.category })} className="hover:text-black">{categoryLabel}</Link> <ChevronRight size={12} />
                <span className="text-black font-semibold truncate">{product.name}</span>
            </div>

            <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-12 relative">

                {/* Image grid — 2 columns (Sapphire-style) + hover zoom */}
                <div className="w-full lg:w-[58%] lg:max-w-[720px] shrink-0">
                    {images.length > 0 ? (
                        <div className="grid grid-cols-2 gap-1 sm:gap-1.5" data-product-image-grid>
                            {images.map((img, idx) => (
                                <div
                                    key={`${img}-${idx}`}
                                    className={`relative aspect-[3/4] bg-gray-100 overflow-hidden lg:cursor-crosshair ${
                                        images.length === 1 ? "col-span-2 max-w-md mx-auto w-full" : ""
                                    }`}
                                    onMouseEnter={(e) => handleImageEnter(idx, e)}
                                    onMouseLeave={handleImageLeave}
                                    onMouseMove={handleMouseMove}
                                >
                                    <Image
                                        src={img}
                                        alt={`${product.name} — view ${idx + 1}`}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 1024px) 50vw, 360px"
                                        priority={idx < 2}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="aspect-[3/4] max-w-md bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                            No image available
                        </div>
                    )}
                </div>

                {/* Product details — sticky on desktop */}
                <div className="w-full lg:flex-1 lg:max-w-md">
                    <div className="lg:sticky lg:top-24">

                        {/* Title & Badge */}
                        <div className="mb-6 border-b border-gray-100 pb-6">
                            <h1 className="text-xl md:text-2xl font-playfair font-medium text-gray-900 leading-snug mb-3 uppercase tracking-wide">
                                {product.name}
                            </h1>
                            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-3">
                                <span className="text-xl font-bold text-gray-900">
                                    Rs. {salePrice.toLocaleString()}
                                </span>
                                {originalPrice > salePrice && (
                                    <>
                                        <span className="text-gray-400 line-through text-base">
                                            Rs. {originalPrice.toLocaleString()}
                                        </span>
                                        {discountPercent > 0 && (
                                            <span className="text-[#FA6338] text-sm font-bold">
                                                -{discountPercent}%
                                            </span>
                                        )}
                                    </>
                                )}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
                                <ShareProductButton product={product} variant="pill" />
                                <div className="flex items-center gap-1 text-[#FFB800]">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <Star
                                            key={i}
                                            size={12}
                                            fill={i <= Math.round(averageRating) ? "currentColor" : "none"}
                                            className={i <= Math.round(averageRating) ? "" : "text-gray-300"}
                                        />
                                    ))}
                                    <span className="text-gray-600 ml-1">
                                        {averageRating > 0 ? averageRating.toFixed(1) : "No ratings"} ({reviewCount} Reviews)
                                    </span>
                                </div>
                            </div>
                        </div>

                        {product.description && (
                            <div className="mb-6 text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                                {product.description}
                            </div>
                        )}

                        {/* Interactive Elements (Colors/Sizes) */}
                        <div className="space-y-6 mb-8">
                            {/* Color */}
                            {supportsColors &&
                                product.variants?.length > 1 &&
                                product.variants.some(
                                    (v) => v.color && !["Default", "Mixed"].includes(v.color)
                                ) && (
                            <div>
                                <span className="text-sm font-bold block mb-2">Color: {selectedVariant.color || 'Default'}</span>
                                <div className="flex gap-2">
                                    {product.variants?.map((v, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => pickVariant({ color: v.color })}
                                            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${selectedVariant.color === v.color ? 'border-black scale-110' : 'border-transparent hover:border-gray-300'}`}
                                            title={v.color}
                                        >
                                            <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                                                <Image src={images[i % images.length] || images[0]} width={32} height={32} className="object-cover w-full h-full" alt="color" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            )}

                            {/* Size */}
                            {supportsSizes && sizeOptions.length > 0 && (
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-bold">Size: {selectedVariant.size || sizeOptions[0]}</span>
                                    <Link href="/size-guide" className="text-xs underline text-gray-500 hover:text-black">
                                        Size Guide
                                    </Link>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {sizeOptions.map(size => (
                                        <button
                                            key={size}
                                            type="button"
                                            onClick={() => pickVariant({ size })}
                                            className={`px-4 py-2 border rounded-lg text-sm transition-all ${selectedVariant.size === size ? 'border-black bg-black text-white shadow-lg' : 'border-gray-200 hover:border-black'}`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            )}

                            {/* Quantity */}
                            <div>
                                <span className="text-sm font-bold block mb-2">Quantity</span>
                                <div className="flex items-center gap-4">
                                    <div className="inline-flex items-center border border-gray-200 rounded-full overflow-hidden bg-white shadow-sm">
                                        <button
                                            type="button"
                                            onClick={decreaseQty}
                                            disabled={quantity <= 1}
                                            className="w-11 h-11 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                            aria-label="Decrease quantity"
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <input
                                            type="number"
                                            min={1}
                                            max={maxStock}
                                            value={quantity}
                                            onChange={handleQtyInput}
                                            className="w-14 h-11 text-center text-sm font-bold border-x border-gray-200 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            aria-label="Quantity"
                                        />
                                        <button
                                            type="button"
                                            onClick={increaseQty}
                                            disabled={quantity >= maxStock}
                                            className="w-11 h-11 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                            aria-label="Increase quantity"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                    {inStock && (
                                        <span className="text-xs text-gray-500">
                                            {maxStock} available
                                        </span>
                                    )}
                                    {!inStock && (
                                        <span className="text-xs text-red-500 font-semibold">Out of stock</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3 mb-8">
                            <button
                                onClick={handleAddToCart}
                                disabled={!inStock}
                                className="w-full bg-black text-white py-4 rounded-none font-bold text-sm uppercase tracking-widest hover:bg-gray-900 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                <ShoppingBag size={18} /> {inStock ? "Add to Cart" : "Out of Stock"}
                            </button>
                            <button
                                type="button"
                                onClick={handleWishlist}
                                className={`w-full border py-3 rounded-full font-bold transition-colors flex items-center justify-center gap-2 ${
                                    wishlisted
                                        ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                                        : "border-gray-300 hover:bg-gray-50"
                                }`}
                            >
                                <Heart size={18} fill={wishlisted ? "currentColor" : "none"} /> {wishlisted ? "In Wishlist" : "Add to Wishlist"}
                            </button>
                            <ShareProductButton product={product} variant="button" className="w-full" />
                        </div>

                        {/* Service Badges */}
                        <div className="grid grid-cols-3 gap-2 text-[10px] text-gray-500 text-center bg-gray-50 p-3 rounded-lg">
                            <div className="flex flex-col items-center gap-1">
                                <Truck size={16} className="text-gray-900" /> <span>Free Shipping over Rs. 5,000</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <ShieldCheck size={16} className="text-gray-900" /> <span>Secure Payment</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <RefreshCcw size={16} className="text-gray-900" /> <span>Free Returns</span>
                            </div>
                        </div>

                    </div>
                </div>

            </div>

            <ProductReviews productId={product._id} />

            <ProductQA product={product} />

            {relatedProducts.length > 0 && (
                <div className="max-w-[1600px] mx-auto px-4 md:px-8 mt-24">
                    <h2 className="text-2xl font-playfair font-bold mb-8">You Might Also Like</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                        {relatedProducts.map((p) => (
                            <ProductCard key={p._id} product={p} />
                        ))}
                    </div>
                </div>
            )}

            {showZoom && images.length > 0 && typeof document !== "undefined" &&
                createPortal(
                    <div
                        className="hidden lg:block fixed z-[100] bg-white border border-gray-200 shadow-2xl overflow-hidden pointer-events-none"
                        style={{
                            top: zoomPanel.top,
                            left: zoomPanel.left,
                            width: zoomPanel.width,
                            height: zoomPanel.height,
                            backgroundImage: `url(${images[activeImage]})`,
                            backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                            backgroundSize: "200%",
                            backgroundRepeat: "no-repeat",
                        }}
                    >
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            Zoom View
                        </div>
                    </div>,
                    document.body
                )
            }

        </div>
    );
}

function ShoppingBag({ size, className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
    )
}
