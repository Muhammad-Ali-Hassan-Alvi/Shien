"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { io } from "socket.io-client";
import { getOrCreateChatSessionId } from "@/lib/liveChatSession";

const SocketContext = createContext({
    socket: null,
    connected: false,
    chatSessionId: "",
});

export function SocketProvider({ children }) {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    const [chatSessionId, setChatSessionId] = useState("");

    useEffect(() => {
        setChatSessionId(getOrCreateChatSessionId());
    }, []);

    useEffect(() => {
        if (status === "loading") return;

        const userId = session?.user?.id;
        const guestSessionId = getOrCreateChatSessionId();
        const onSellerCenter = pathname?.startsWith("/seller-center");
        const isAdminSocket =
            session?.user?.role === "admin" ||
            session?.user?.collection === "admin" ||
            onSellerCenter;

        if (!userId && !guestSessionId) {
            return;
        }

        const s = io({
            path: "/api/socket",
            auth: {
                userId: userId || undefined,
                role: isAdminSocket ? "admin" : session?.user?.role || "user",
                guestSessionId: userId ? undefined : guestSessionId,
            },
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
        });

        setSocket(s);

        s.on("connect", () => setConnected(true));
        s.on("disconnect", () => setConnected(false));
        s.on("connect_error", () => setConnected(false));

        return () => {
            s.disconnect();
            setSocket(null);
            setConnected(false);
        };
    }, [status, session?.user?.id, session?.user?.role, session?.user?.collection, pathname]);

    const value = useMemo(
        () => ({ socket, connected, chatSessionId }),
        [socket, connected, chatSessionId]
    );

    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
    return useContext(SocketContext);
}
