import React, { createContext, useContext, ReactNode } from "react";
import { useWebSocket } from "./useWebSocket";

interface WebSocketContextValue {
    rate: number | null;
    isConnected: boolean;
    error: string | null;
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

export const WebSocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { rate, isConnected, error } = useWebSocket();

    return (
        <WebSocketContext.Provider value={{ rate, isConnected, error }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocketContext = (): WebSocketContextValue => {
    const ctx = useContext(WebSocketContext);
    if (!ctx) {
        throw new Error("useWebSocketContext must be used within WebSocketProvider");
    }
    return ctx;
};
