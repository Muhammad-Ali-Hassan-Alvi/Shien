const STORAGE_KEY = "imart_chat_session";
const GUEST_NAME_KEY = "imart_chat_guest_name";
const GUEST_EMAIL_KEY = "imart_chat_guest_email";

function randomId() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `guest-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function getOrCreateChatSessionId() {
    if (typeof window === "undefined") return "";
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
        id = randomId();
        localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
}

export function getStoredGuestProfile() {
    if (typeof window === "undefined") {
        return { name: "", email: "" };
    }
    return {
        name: localStorage.getItem(GUEST_NAME_KEY) || "",
        email: localStorage.getItem(GUEST_EMAIL_KEY) || "",
    };
}

export function saveGuestProfile(name, email) {
    if (typeof window === "undefined") return;
    localStorage.setItem(GUEST_NAME_KEY, name);
    localStorage.setItem(GUEST_EMAIL_KEY, email);
}

export function chatApiHeaders() {
    return {
        "Content-Type": "application/json",
        "X-Chat-Session": getOrCreateChatSessionId(),
    };
}
