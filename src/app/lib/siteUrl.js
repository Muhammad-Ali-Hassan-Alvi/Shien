/**
 * Canonical app URL for auth redirects, emails, sitemap, etc.
 * On Vercel, prefers the deployment host over localhost values copied from .env.example.
 */
function stripTrailingSlash(url) {
    return String(url || "").replace(/\/$/, "");
}

function isLocalhost(url) {
    return /localhost|127\.0\.0\.1/i.test(String(url || ""));
}

function isLocalDev() {
    return (
        process.env.npm_lifecycle_event === "dev" ||
        process.env.NODE_ENV === "development"
    );
}

export function getAppBaseUrl() {
    const candidates = [
        process.env.NEXT_PUBLIC_APP_URL,
        process.env.NEXT_PUBLIC_SITE_URL,
        process.env.AUTH_URL,
        process.env.NEXTAUTH_URL,
        process.env.SITE_URL,
    ];

    if (isLocalDev()) {
        for (const value of candidates) {
            if (value && isLocalhost(value)) {
                return stripTrailingSlash(value);
            }
        }
        const port = process.env.PORT || "3000";
        return `http://localhost:${port}`;
    }

    for (const value of candidates) {
        if (value && !isLocalhost(value)) {
            return stripTrailingSlash(value);
        }
    }

    if (process.env.VERCEL_URL) {
        return stripTrailingSlash(`https://${process.env.VERCEL_URL}`);
    }

    for (const value of candidates) {
        if (value) return stripTrailingSlash(value);
    }

    return "http://localhost:3000";
}

/** Safe internal path only — blocks open redirects like //evil.com */
export function safeCallbackPath(path, fallback = "/") {
    const raw = String(path || "").trim();
    if (!raw.startsWith("/") || raw.startsWith("//")) return fallback;
    return raw;
}
