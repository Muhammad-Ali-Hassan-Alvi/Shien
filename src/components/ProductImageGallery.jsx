"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";

export default function ProductImageGallery({
    images,
    productName,
    initialIndex = 0,
    open,
    onClose,
}) {
    const [activeIndex, setActiveIndex] = useState(initialIndex);
    const [zoomEnabled, setZoomEnabled] = useState(false);
    const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

    useEffect(() => {
        if (open) {
            setActiveIndex(initialIndex);
            setZoomEnabled(false);
        }
    }, [open, initialIndex]);

    useEffect(() => {
        if (!open || typeof document === "undefined") return;

        const scrollY = window.scrollY;
        document.body.style.position = "fixed";
        document.body.style.top = `-${scrollY}px`;
        document.body.style.left = "0";
        document.body.style.right = "0";
        document.body.style.width = "100%";

        return () => {
            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.left = "";
            document.body.style.right = "";
            document.body.style.width = "";
            window.scrollTo(0, scrollY);
        };
    }, [open]);

    const goPrev = useCallback(() => {
        setActiveIndex((i) => (i <= 0 ? images.length - 1 : i - 1));
        setZoomEnabled(false);
    }, [images.length]);

    const goNext = useCallback(() => {
        setActiveIndex((i) => (i >= images.length - 1 ? 0 : i + 1));
        setZoomEnabled(false);
    }, [images.length]);

    useEffect(() => {
        if (!open) return;

        const onKeyDown = (e) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowLeft") goPrev();
            if (e.key === "ArrowRight") goNext();
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open, onClose, goPrev, goNext]);

    const handleMainMouseMove = (e) => {
        if (!zoomEnabled) return;
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        setZoomPos({
            x: ((e.clientX - left) / width) * 100,
            y: ((e.clientY - top) / height) * 100,
        });
    };

    if (!open || images.length === 0 || typeof document === "undefined") return null;

    const activeImage = images[activeIndex];

    return createPortal(
        <div
            className="fixed inset-0 z-[250] flex flex-col bg-black/95"
            role="dialog"
            aria-modal="true"
            aria-label={`${productName} image gallery`}
        >
            <div className="absolute top-0 right-0 z-10 flex items-center gap-2 p-4">
                <button
                    type="button"
                    onClick={() => setZoomEnabled((z) => !z)}
                    className={`p-2 rounded-full transition-colors ${
                        zoomEnabled ? "bg-white text-black" : "text-white hover:bg-white/10"
                    }`}
                    aria-label={zoomEnabled ? "Disable zoom" : "Enable zoom"}
                >
                    <ZoomIn size={22} />
                </button>
                <button
                    type="button"
                    onClick={onClose}
                    className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
                    aria-label="Close gallery"
                >
                    <X size={24} />
                </button>
            </div>

            <div className="relative flex-1 flex items-center justify-center px-4 pt-14 pb-4 min-h-0">
                {images.length > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={goPrev}
                            className="absolute left-2 md:left-6 z-10 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                            aria-label="Previous image"
                        >
                            <ChevronLeft size={32} />
                        </button>
                        <button
                            type="button"
                            onClick={goNext}
                            className="absolute right-2 md:right-6 z-10 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                            aria-label="Next image"
                        >
                            <ChevronRight size={32} />
                        </button>
                    </>
                )}

                <div
                    className={`relative w-full max-w-3xl h-full max-h-[calc(100vh-140px)] ${
                        zoomEnabled ? "cursor-crosshair overflow-hidden" : ""
                    }`}
                    onMouseMove={handleMainMouseMove}
                    onClick={() => zoomEnabled && setZoomEnabled(false)}
                >
                    {zoomEnabled ? (
                        <div
                            className="w-full h-full bg-no-repeat"
                            style={{
                                backgroundImage: `url(${activeImage})`,
                                backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                                backgroundSize: "200%",
                            }}
                        />
                    ) : (
                        <Image
                            src={activeImage}
                            alt={`${productName} — view ${activeIndex + 1}`}
                            fill
                            className="object-contain"
                            sizes="100vw"
                            priority
                        />
                    )}
                </div>
            </div>

            {images.length > 1 && (
                <div className="shrink-0 px-4 pb-6 pt-2">
                    <div className="flex justify-center gap-2 overflow-x-auto max-w-full mx-auto">
                        {images.map((img, idx) => (
                            <button
                                key={`${img}-${idx}`}
                                type="button"
                                onClick={() => {
                                    setActiveIndex(idx);
                                    setZoomEnabled(false);
                                }}
                                className={`relative shrink-0 w-16 h-20 sm:w-20 sm:h-24 overflow-hidden border-2 transition-all ${
                                    idx === activeIndex
                                        ? "border-white opacity-100"
                                        : "border-transparent opacity-50 hover:opacity-80"
                                }`}
                                aria-label={`View image ${idx + 1}`}
                                aria-current={idx === activeIndex ? "true" : undefined}
                            >
                                <Image
                                    src={img}
                                    alt=""
                                    fill
                                    className="object-cover"
                                    sizes="80px"
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>,
        document.body
    );
}
