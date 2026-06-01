"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { io } from "socket.io-client";

const SocketContext = createContext({
    socket: null,
    connected: false,
});

export function SocketProvider({ children }) {
    const { data: session, status } = useSession();
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        if (status !== "authenticated" || !session?.user?.id) {
            setSocket((prev) => {
                prev?.disconnect();
                return null;
            });
            setConnected(false);
            return;
        }

        const s = io({
            path: "/api/socket",
            auth: {
                userId: session.user.id,
                role: session.user.role || "user",
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
    }, [status, session?.user?.id, session?.user?.role]);

    const value = useMemo(() => ({ socket, connected }), [socket, connected]);

    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
    return useContext(SocketContext);
}
