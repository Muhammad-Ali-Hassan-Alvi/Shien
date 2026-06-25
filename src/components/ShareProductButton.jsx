"use client";

import { useEffect, useState } from "react";
import { Share2, Link2, Check, X, Copy } from "lucide-react";
import { toast } from "react-hot-toast";

import { resolveSiteUrls } from "@/app/lib/siteUrl";

export function getProductShareUrl(slug) {
    if (!slug) return "";
    if (typeof window !== "undefined") {
        return `${resolveSiteUrls(window.location.href).siteUrl}/product/${slug}`;
    }
    const base = resolveSiteUrls().siteUrl;
    return base ? `${base}/product/${slug}` : `/product/${slug}`;
}

async function copyToClipboard(text) {
    if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return;
    }
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
}

function ShareProductModal({ isOpen, onClose, product, shareUrl }) {
    const [copied, setCopied] = useState(false);
    const [canNativeShare, setCanNativeShare] = useState(false);

    useEffect(() => {
        setCanNativeShare(typeof navigator !== "undefined" && !!navigator.share);
    }, []);

    useEffect(() => {
        if (!isOpen) {
            setCopied(false);
            return;
        }
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    if (!isOpen || !product) return null;

    const title = product.name || "iMART Product";
    const shareText = `Check out ${title} on iMART`;

    const handleCopy = async () => {
        try {
            await copyToClipboard(shareUrl);
            setCopied(true);
            toast.success("Link copied!");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Could not copy link");
        }
    };

    const handleNativeShare = async () => {
        try {
            await navigator.share({
                title,
                text: shareText,
                url: shareUrl,
            });
            onClose();
        } catch (err) {
            if (err?.name !== "AbortError") {
                toast.error("Share cancelled or unavailable");
            }
        }
    };

    const socialLinks = [
        {
            label: "WhatsApp",
            href: `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`,
            className: "bg-[#25D366] hover:bg-[#1fb855]",
        },
        {
            label: "Facebook",
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
            className: "bg-[#1877F2] hover:bg-[#166fe5]",
        },
        {
            label: "X",
            href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
            className: "bg-black hover:bg-gray-800",
        },
    ];

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={onClose}
            role="presentation"
        >
            <div
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="share-product-title"
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <Share2 size={20} className="text-indigo-600" />
                        </div>
                        <div>
                            <h3 id="share-product-title" className="text-lg font-bold text-gray-900">
                                Share product
                            </h3>
                            <p className="text-xs text-gray-500 line-clamp-1">{title}</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                            Product link
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                readOnly
                                value={shareUrl}
                                className="flex-1 min-w-0 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                                onFocus={(e) => e.target.select()}
                            />
                            <button
                                type="button"
                                onClick={handleCopy}
                                className="shrink-0 px-4 py-2.5 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors flex items-center gap-1.5"
                            >
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                                {copied ? "Copied" : "Copy"}
                            </button>
                        </div>
                    </div>

                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                            Share via
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                            {socialLinks.map((item) => (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`py-2.5 rounded-xl text-white text-xs font-bold text-center transition-colors ${item.className}`}
                                >
                                    {item.label}
                                </a>
                            ))}
                        </div>
                    </div>

                    {canNativeShare && (
                        <button
                            type="button"
                            onClick={handleNativeShare}
                            className="w-full py-3 border border-gray-200 rounded-xl font-bold text-sm text-gray-800 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                        >
                            <Share2 size={18} />
                            More sharing options
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ShareProductButton({
    product,
    variant = "icon",
    className = "",
}) {
    const [modalOpen, setModalOpen] = useState(false);
    const [shareUrl, setShareUrl] = useState("");

    const openModal = (e) => {
        e?.preventDefault?.();
        e?.stopPropagation?.();

        const url = getProductShareUrl(product?.slug);
        if (!url) {
            toast.error("Cannot share this product");
            return;
        }
        setShareUrl(url);
        setModalOpen(true);
    };

    const triggerClass =
        variant === "button"
            ? `border border-gray-300 py-3 px-4 rounded-full font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 ${className}`
            : variant === "pill"
              ? `inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-indigo-600 transition-colors ${className}`
              : `p-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-gray-700 hover:bg-white hover:text-indigo-600 transition-all duration-300 hover:scale-110 active:scale-95 z-10 ${className}`;

    const label =
        variant === "button" ? (
            <>
                <Share2 size={18} /> Share
            </>
        ) : variant === "pill" ? (
            <>
                <Link2 size={14} /> Share
            </>
        ) : (
            <Share2 size={18} />
        );

    return (
        <>
            <button
                type="button"
                onClick={openModal}
                aria-label="Share product"
                className={triggerClass}
            >
                {label}
            </button>

            <ShareProductModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                product={product}
                shareUrl={shareUrl}
            />
        </>
    );
}
