import { useState, useEffect, useRef } from 'react';

export const useWebSocket = (url: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(url);

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onclose = () => {
      setIsConnected(false);
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        wsRef.current = new WebSocket(url);
      }, 3000);
    };

    wsRef.current = ws;
    return () => {
      ws.close();
    };
  }, [url]);

  return wsRef.current;
}; 