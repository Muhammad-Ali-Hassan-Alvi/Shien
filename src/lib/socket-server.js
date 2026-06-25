/** @type {import('socket.io').Server | null} */
let ioInstance = null;

export function setIO(io) {
    ioInstance = io;
    globalThis.__shienSocketIO = io;
}

export function getIO() {
    return ioInstance || globalThis.__shienSocketIO || null;
}

export function attachSocketHandlers(io) {
    io.on("connection", (socket) => {
        const userId = socket.handshake.auth?.userId;
        const role = socket.handshake.auth?.role;
        const guestSessionId = socket.handshake.auth?.guestSessionId;

        if (userId) {
            socket.join(`user:${userId}`);
        }
        if (guestSessionId) {
            socket.join(`guest:${guestSessionId}`);
        }
        if (role === "admin") {
            socket.join("admin");
        }

        socket.on("join:product", (productId) => {
            if (productId) socket.join(`product:${productId}`);
        });

        socket.on("leave:product", (productId) => {
            if (productId) socket.leave(`product:${productId}`);
        });

        socket.on("join:chat", (ticketId) => {
            if (ticketId) socket.join(`chat:${ticketId}`);
        });

        socket.on("leave:chat", (ticketId) => {
            if (ticketId) socket.leave(`chat:${ticketId}`);
        });
    });
}

function serializeDoc(doc) {
    if (!doc) return doc;
    const obj = doc?.toObject ? doc.toObject() : { ...doc };
    return JSON.parse(
        JSON.stringify(obj, (_, v) => (v?.buffer ? String(v) : v))
    );
}

export function emitNotificationToUser(userId, notification) {
    const io = getIO();
    if (!io || !userId) return false;
    io.to(`user:${userId}`).emit("notification", notification);
    return true;
}

export function emitNotificationsRefresh(userId) {
    const io = getIO();
    if (!io || !userId) return false;
    io.to(`user:${userId}`).emit("notifications:refresh");
    return true;
}

export function emitToAdmins(event, payload) {
    const io = getIO();
    if (!io) return false;
    io.to("admin").emit(event, payload);
    return true;
}

export function emitQuestionCreated(question) {
    const io = getIO();
    if (!io || !question) return false;
    const payload = serializeDoc(question);
    io.to("admin").emit("question:new", payload);
    if (question.product) {
        const productId = String(question.product._id || question.product);
        io.to(`product:${productId}`).emit("question:new", payload);
    }
    return true;
}

export function emitQuestionUpdated(question) {
    const io = getIO();
    if (!io || !question) return false;
    const payload = serializeDoc(question);
    io.to("admin").emit("question:updated", payload);
    if (question.product) {
        const productId = String(question.product._id || question.product);
        io.to(`product:${productId}`).emit("question:updated", payload);
    }
    return true;
}

export function emitChatMessage(ticketId, message) {
    const io = getIO();
    if (!io || !ticketId || !message) return false;
    const payload = { ticketId: String(ticketId), message };
    io.to(`chat:${ticketId}`).emit("chat:message", payload);
    io.to("admin").emit("chat:message", payload);
    return true;
}

export function emitChatListUpdate(meta) {
    const io = getIO();
    if (!io) return false;
    io.to("admin").emit("chat:list-update", meta);
    return true;
}
