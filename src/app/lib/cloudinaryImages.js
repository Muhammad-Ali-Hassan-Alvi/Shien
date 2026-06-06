import { v2 as cloudinary } from "cloudinary";

function cloudConfig() {
    return {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY || process.env.API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET || process.env.API_SECRET,
    };
}

function ensureConfigured() {
    const cfg = cloudConfig();
    if (!cfg.cloud_name || !cfg.api_key || !cfg.api_secret) {
        return false;
    }
    cloudinary.config(cfg);
    return true;
}

function getCloudName() {
    return cloudConfig().cloud_name;
}

export function isOwnCloudinaryUrl(url) {
    if (typeof url !== "string" || !url.includes("res.cloudinary.com")) {
        return false;
    }
    const cloudName = getCloudName();
    if (!cloudName) return true;
    return url.includes(`res.cloudinary.com/${cloudName}/`);
}

/** Extract public_id from a Cloudinary delivery URL (supports optional transforms + version). */
export function publicIdFromCloudinaryUrl(url) {
    if (!isOwnCloudinaryUrl(url)) return null;

    const uploadMarker = "/upload/";
    const uploadIndex = url.indexOf(uploadMarker);
    if (uploadIndex === -1) return null;

    const path = url.slice(uploadIndex + uploadMarker.length).split("?")[0];
    const segments = path.split("/").filter(Boolean);
    if (segments.length === 0) return null;

    let start = 0;
    while (start < segments.length) {
        const segment = segments[start];
        if (/^v\d+$/.test(segment)) {
            start += 1;
            continue;
        }
        if (segment.includes(",") || /^[a-z]{1,3}_/i.test(segment)) {
            start += 1;
            continue;
        }
        break;
    }

    const publicIdWithExt = segments.slice(start).join("/");
    if (!publicIdWithExt) return null;

    const dot = publicIdWithExt.lastIndexOf(".");
    if (dot > publicIdWithExt.lastIndexOf("/")) {
        return publicIdWithExt.slice(0, dot);
    }
    return publicIdWithExt;
}

async function deleteCloudinaryImage(publicId) {
    if (!publicId) return false;
    if (!ensureConfigured()) {
        console.warn("Cloudinary delete skipped: credentials not configured");
        return false;
    }

    try {
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: "image",
            invalidate: true,
        });
        return result.result === "ok" || result.result === "not found";
    } catch (error) {
        console.error("Cloudinary delete failed:", publicId, error);
        return false;
    }
}

/** Delete all Cloudinary images referenced on a product document. */
export async function deleteProductCloudinaryImages(product) {
    const images = product?.images;
    if (!Array.isArray(images) || images.length === 0) {
        return { attempted: 0, deleted: 0, skipped: 0 };
    }

    const uniqueUrls = [...new Set(images.filter(Boolean))];
    let deleted = 0;
    let skipped = 0;

    for (const url of uniqueUrls) {
        const publicId = publicIdFromCloudinaryUrl(url);
        if (!publicId) {
            skipped += 1;
            continue;
        }
        const ok = await deleteCloudinaryImage(publicId);
        if (ok) deleted += 1;
        else skipped += 1;
    }

    return { attempted: uniqueUrls.length, deleted, skipped };
}
