/**
 * Resolve site / app / auth URLs from the incoming request URL (or env fallback).
 * Local dev → localhost; production domain → .env.production values; Vercel → deployment host.
 */

function stripTrailingSlash(url) {
    return String(url || "").replace(/\/$/, "");
}

function isLocalhostHost(hostname) {
    return /^(localhost|127\.0\.0\.1|\[::1\])$/i.test(String(hostname || ""));
}

function isLocalhostUrl(url) {
    try {
        return isLocalhostHost(new URL(url).hostname);
    } catch {
        return /localhost|127\.0\.0\.1/i.test(String(url || ""));
    }
}

function isLocalDevRuntime() {
    return (
        process.env.npm_lifecycle_event === "dev" ||
        process.env.NODE_ENV === "development"
    );
}

function readEnvUrls() {
    return [
        process.env.NEXT_PUBLIC_APP_URL,
        process.env.NEXT_PUBLIC_SITE_URL,
        process.env.AUTH_URL,
        process.env.NEXTAUTH_URL,
        process.env.SITE_URL,
    ]
        .filter(Boolean)
        .map(stripTrailingSlash);
}

function getEnvLocalUrl() {
    const match = readEnvUrls().find(isLocalhostUrl);
    if (match) return match;

    const port = process.env.PORT || "3000";
    return `http://localhost:${port}`;
}

function getEnvProductionUrl() {
    const match = readEnvUrls().find((url) => !isLocalhostUrl(url));
    if (match) return match;

    if (process.env.VERCEL_URL) {
        return stripTrailingSlash(`https://${process.env.VERCEL_URL}`);
    }

    return "https://islamabadmart.com";
}

function normalizeHostname(hostname) {
    return String(hostname || "")
        .toLowerCase()
        .replace(/^www\./, "");
}

function hostMatchesUrl(hostname, url) {
    try {
        return normalizeHostname(new URL(url).hostname) === normalizeHostname(hostname);
    } catch {
        return false;
    }
}

function parseUrlSource(source) {
    if (!source) return null;

    if (typeof source === "string") {
        const raw = source.trim();
        if (!raw) return null;
        if (/^https?:\/\//i.test(raw)) return new URL(raw);
        return new URL(`http://${raw}`);
    }

    if (typeof URL !== "undefined" && source instanceof URL) {
        return source;
    }

    if (source.headers && typeof source.headers.get === "function") {
        const host =
            source.headers.get("x-forwarded-host") ||
            source.headers.get("host");
        if (!host) return null;

        const proto =
            source.headers.get("x-forwarded-proto") ||
            (isLocalhostHost(host.split(":")[0]) ? "http" : "https");

        return new URL(`${proto}://${host}`);
    }

    if (source.url && typeof source.url === "string") {
        return new URL(source.url);
    }

    if (source.host) {
        const proto = source.protocol || (isLocalhostHost(source.host) ? "http" : "https");
        return new URL(`${proto}://${source.host}`);
    }

    return null;
}

function detectProfile(parsed) {
    const hostname = parsed.hostname;
    const productionUrl = getEnvProductionUrl();

    if (isLocalhostHost(hostname)) return "local";

    if (hostname.endsWith(".vercel.app")) return "vercel";

    if (hostMatchesUrl(hostname, productionUrl)) return "production";

    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) return "deployment";

    return "custom";
}

function buildBaseUrl(profile, parsed) {
    switch (profile) {
        case "local": {
            const port = parsed.port || process.env.PORT || "3000";
            const envLocal = getEnvLocalUrl();
            if (isLocalhostUrl(envLocal)) {
                try {
                    const envPort = new URL(envLocal).port;
                    if (!parsed.port && envPort) {
                        return stripTrailingSlash(envLocal);
                    }
                } catch {
                    // ignore
                }
            }
            return stripTrailingSlash(`http://${parsed.hostname}:${port}`);
        }

        case "vercel":
            return stripTrailingSlash(`https://${parsed.host}`);

        case "production":
            return getEnvProductionUrl();

        case "deployment": {
            const proto = parsed.protocol.replace(":", "") || "http";
            return stripTrailingSlash(`${proto}://${parsed.host}`);
        }

        case "custom":
        default: {
            const proto = parsed.protocol.replace(":", "") || "https";
            return stripTrailingSlash(`${proto}://${parsed.host}`);
        }
    }
}

/**
 * Resolve canonical URLs from a request URL, headers, or env (when source is omitted).
 *
 * @param {string|URL|Request|{ headers: Headers }|{ url: string }|{ host: string }|undefined} source
 * @returns {{
 *   profile: 'local' | 'vercel' | 'production' | 'deployment' | 'custom' | 'env',
 *   host: string,
 *   siteUrl: string,
 *   appUrl: string,
 *   authUrl: string,
 *   nextAuthUrl: string,
 *   isLocal: boolean,
 *   isProduction: boolean,
 * }}
 */
export function resolveSiteUrls(source) {
    const parsed = parseUrlSource(source);

    if (!parsed) {
        const profile = isLocalDevRuntime() ? "local" : "env";
        const baseUrl = profile === "local" ? getEnvLocalUrl() : getEnvProductionUrl();

        return {
            profile,
            host: new URL(baseUrl).host,
            siteUrl: baseUrl,
            appUrl: baseUrl,
            authUrl: baseUrl,
            nextAuthUrl: baseUrl,
            isLocal: profile === "local",
            isProduction: profile !== "local",
        };
    }

    const profile = detectProfile(parsed);
    const baseUrl = buildBaseUrl(profile, parsed);

    return {
        profile,
        host: parsed.host,
        siteUrl: baseUrl,
        appUrl: baseUrl,
        authUrl: baseUrl,
        nextAuthUrl: baseUrl,
        isLocal: profile === "local",
        isProduction: profile === "production" || profile === "deployment",
    };
}

/** @param {Request|{ headers: Headers }} request */
export function resolveSiteUrlsFromRequest(request) {
    return resolveSiteUrls(request);
}

/** @param {Headers} headers */
export function resolveSiteUrlsFromHeaders(headers) {
    return resolveSiteUrls({ headers });
}

/** Canonical app base URL — optional request-aware source. */
export function getAppBaseUrl(source) {
    return resolveSiteUrls(source).appUrl;
}

/** Safe internal path only — blocks open redirects like //evil.com */
export function safeCallbackPath(path, fallback = "/") {
    const raw = String(path || "").trim();
    if (!raw.startsWith("/") || raw.startsWith("//")) return fallback;
    return raw;
}
