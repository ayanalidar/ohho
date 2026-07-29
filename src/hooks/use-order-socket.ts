"use client";

import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

const WS_URL = "/?XTransformPort=3003";

type OrderUpdate = {
  orderId: string;
  status: string;
  progress: number;
};

/**
 * useOrderSocket — subscribes to real-time order updates via the order-sync WS service.
 * Pass an orderId to track a specific order, or null to just listen for admin/kitchen events.
 */
export function useOrderSocket(orderId: string | null) {
  const [lastUpdate, setLastUpdate] = useState<OrderUpdate | null>(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(WS_URL, { path: "/", transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      if (orderId) socket.emit("join:order", orderId);
    });
    socket.on("disconnect", () => setConnected(false));
    socket.on("order:updated", (payload: OrderUpdate) => {
      setLastUpdate(payload);
    });

    return () => {
      socket.disconnect();
    };
  }, [orderId]);

  return { lastUpdate, connected };
}

/**
 * useKitchenSocket — subscribes to the kitchen room for the live kitchen pipeline.
 * Returns the latest order:created / order:updated events.
 */
export function useKitchenSocket() {
  const [events, setEvents] = useState<{ type: "created" | "updated"; payload: any; at: number }[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io(WS_URL, { path: "/", transports: ["websocket"] });
    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join:kitchen");
    });
    socket.on("disconnect", () => setConnected(false));
    socket.on("order:created", (payload: any) => {
      setEvents((e) => [...e, { type: "created", payload, at: Date.now() }].slice(-50));
    });
    socket.on("order:updated", (payload: any) => {
      setEvents((e) => [...e, { type: "updated", payload, at: Date.now() }].slice(-50));
    });
    return () => socket.disconnect();
  }, []);

  return { events, connected };
}
