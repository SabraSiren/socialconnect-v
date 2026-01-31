import { useState, useEffect, useCallback, useRef } from 'react';


interface RateData {
    rate: number | null;
    currency: string;
}

type WebSocketEvent = 'connected' | 'disconnected' | 'usd_rate' | 'error';
type WebSocketData = RateData | Event | null;
type SubscriberCallback = (event: WebSocketEvent, data: WebSocketData) => void;

interface UseWebSocketReturn {
    rate: number | null;
    currency: string;
    isConnected: boolean;
    error: string | null;
    
    connect: () => void;
    disconnect: () => void;
    subscribe: (callback: SubscriberCallback) => () => void;
    
    // Сырые данные
    rawData: RateData;
}

interface WebSocketMessage {
    rate: number;
    currency?: string;
}

const isWebSocketMessage = (value: unknown): value is WebSocketMessage => {
    if (typeof value !== 'object' || value === null) return false;
    const obj = value as Record<string, unknown>;

    if (typeof obj.rate !== 'number') return false;

    if ('currency' in obj && obj.currency !== undefined && typeof obj.currency !== 'string') {
        return false;
    }

    return true;
};

// WebSocket коды закрытия, при которых не стоит переподключаться
const NON_RECONNECT_CLOSE_CODES: number[] = [1002, 1003, 1007, 1008, 1015];

const shouldReconnect = (closeCode: number): boolean => {
    return !NON_RECONNECT_CLOSE_CODES.includes(closeCode);
};

const getWebSocketUrl = (): string => {
    return import.meta.env.VITE_WS_URL ?? '';
};

export const useWebSocket = (url?: string): UseWebSocketReturn => {
    const effectiveUrl = url ?? getWebSocketUrl();
    const socketRef = useRef<WebSocket | null>(null); // хранит объект WebSocket
    const subscribersRef = useRef<Set<SubscriberCallback>>(new Set()); // хранит Set функций-подписчиков
    const reconnectAttemptsRef = useRef<number>(0); 
    const isManualDisconnectRef = useRef<boolean>(false); 
    const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null); 

    const maxReconnectAttempts = 5;
    const reconnectDelay = 1000;

    const [rateData, setRateData] = useState<RateData>({
        rate: null,      
        currency: 'USD',     
    });
    const [isConnected, setIsConnected] = useState<boolean>(false); 
    const [error, setError] = useState<string | null>(null); 


    const notifySubscribers = useCallback((event: WebSocketEvent, data: WebSocketData) => {
        subscribersRef.current.forEach(callback => {
            try {
                callback(event, data);
            } catch (err) {
                console.error('Error in callback:', err);
            }
        });
    }, []); // Пустой массив зависимостей - функция создается один раз


    const connect = useCallback(() => {
        if (!effectiveUrl) return;
        if (socketRef.current) {
            return;
        }
        isManualDisconnectRef.current = false;
        
        try {
            socketRef.current = new WebSocket(effectiveUrl);
            
            socketRef.current.onopen = () => {
                console.log('WebSocket connected');
                setIsConnected(true);             
                reconnectAttemptsRef.current = 0; 
                setError(null);                  
                notifySubscribers('connected', null); // уведомляем подписчиков
            };

            socketRef.current.onmessage = (event: MessageEvent) => {
                try {
                    const raw = event.data;
                    if (typeof raw !== 'string') return;

                    const parsed: unknown = JSON.parse(raw);
                    if (!isWebSocketMessage(parsed)) return;

                    const newRateData: RateData = {
                        rate: parsed.rate,
                        currency: parsed.currency ?? 'USD',
                    };
                    setRateData(newRateData);
                    setError(null);
                    notifySubscribers('usd_rate', newRateData);
                } catch (parseError) {
                    console.error('Error parsing message:', parseError);
                }
            };

            socketRef.current.onclose = (event: CloseEvent) => {
                console.log(`WebSocket disconnected. Code: ${event.code}, Reason: ${event.reason || 'none'}`);
                setIsConnected(false);          
                socketRef.current = null;    
                notifySubscribers('disconnected', null); 

                if (isManualDisconnectRef.current) {
                    return;
                }

                if (!shouldReconnect(event.code)) {
                    console.log(`WebSocket close code ${event.code} indicates permanent error. Not reconnecting.`);
                    setError(`Connection closed with code ${event.code}. Reconnection not recommended.`);
                    return;
                }

                if (reconnectAttemptsRef.current < maxReconnectAttempts) {
                    reconnectAttemptsRef.current++;
                    const delay = reconnectDelay * reconnectAttemptsRef.current;
                    console.log(`Reconnecting... Attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts} in ${delay}ms`);
                    
                    reconnectTimeoutRef.current = setTimeout(() => {
                        connect(); // рекурсивно вызываем подключение
                    }, delay);
                } else {
                    console.log('Max reconnection attempts reached. Stopping reconnection.');
                    setError('Max reconnection attempts reached. Please refresh the page.');
                }
            };

            socketRef.current.onerror = (wsError: Event) => {
                console.error('WebSocket error:', wsError);
                setError('Connection error');
                notifySubscribers('error', wsError);
            };

        } catch (error) {
            const message = error instanceof Error ? error.message : 'Connection error';
            console.error('Failed to create WebSocket:', error);
            setError(message);
        }
    }, [effectiveUrl, notifySubscribers]);


    const disconnect = useCallback(() => {
        isManualDisconnectRef.current = true;
        
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        if (socketRef.current) {
            socketRef.current.close(); 
            socketRef.current = null;  
        }
        setIsConnected(false);      
        subscribersRef.current.clear(); 
        reconnectAttemptsRef.current = 0; 
    }, []); // Нет зависимостей - стабильная функция

    // Функция подписки на события
    const subscribe = useCallback((callback: SubscriberCallback) => {
        subscribersRef.current.add(callback);

        return () => subscribersRef.current.delete(callback); // Возвращаем функцию для отписки
    }, []); // Нет зависимостей



    useEffect(() => {
        connect();

        return () => {
            disconnect();
        };
    }, [connect, disconnect]); 


    return {
        rate: rateData.rate,
        currency: rateData.currency,
        isConnected,
        error,

        connect,
        disconnect,
        subscribe,

        rawData: rateData // Весь объект данных
    };
};
