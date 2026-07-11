import { useEffect, useRef, useCallback, useState } from "react";
import { socketService } from "../services/socket.service";

type Role = "customer" | "admin";

interface UseSocketOptions {
  role: Role;
  roomId: string | number | null;
  onNewMessage?: (data: any) => void;
  onRoomCreated?: (data: any) => void;
  onRoomAssigned?: (data: any) => void;
  onRoomClosed?: (data: any) => void;
}

export function useSocket(options: UseSocketOptions) {
  const { role, roomId, onNewMessage, onRoomCreated, onRoomAssigned, onRoomClosed } = options;
  const [isConnected, setIsConnected] = useState(false);
  const prevRoomIdRef = useRef<string | number | null>(null);
  const handlersRef = useRef({ onNewMessage, onRoomCreated, onRoomAssigned, onRoomClosed });

  // Keep handlers ref fresh without re-triggering effects
  handlersRef.current = { onNewMessage, onRoomCreated, onRoomAssigned, onRoomClosed };

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    const socket = socketService.connect(role);

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    // If already connected, set state immediately
    if (socket.connected) {
      setIsConnected(true);
    }

    // If admin, join admin channel
    if (role === "admin") {
      socketService.joinAdmin();
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);

      if (role === "admin") {
        socketService.leaveAdmin();
      }

      socketService.disconnect();
      setIsConnected(false);
    };
  }, [role]);

  // Re-join admin channel on reconnect
  useEffect(() => {
    if (!isConnected) return;
    if (role === "admin") {
      socketService.joinAdmin();
    }
  }, [isConnected, role]);

  // Handle room join/leave when roomId changes
  useEffect(() => {
    const prev = prevRoomIdRef.current;

    if (prev !== null && prev !== roomId) {
      socketService.leaveRoom(prev);
    }

    if (roomId !== null) {
      socketService.joinRoom(roomId);
    }

    prevRoomIdRef.current = roomId;

    return () => {
      // Cleanup: leave room if component unmounts while in a room
      if (roomId !== null) {
        socketService.leaveRoom(roomId);
      }
    };
  }, [roomId]);

  // Re-join current room on reconnect
  useEffect(() => {
    if (!isConnected || roomId === null) return;
    socketService.joinRoom(roomId);
  }, [isConnected, roomId]);

  // Subscribe to socket events
  useEffect(() => {
    const handleNewMessage = (data: any) => {
      handlersRef.current.onNewMessage?.(data);
    };

    const handleRoomCreated = (data: any) => {
      handlersRef.current.onRoomCreated?.(data);
    };

    const handleRoomAssigned = (data: any) => {
      handlersRef.current.onRoomAssigned?.(data);
    };

    const handleRoomClosed = (data: any) => {
      handlersRef.current.onRoomClosed?.(data);
    };

    socketService.on("chat:new-message", handleNewMessage);
    socketService.on("chat:room-created", handleRoomCreated);
    socketService.on("chat:room-assigned", handleRoomAssigned);
    socketService.on("chat:room-closed", handleRoomClosed);

    return () => {
      socketService.off("chat:new-message", handleNewMessage);
      socketService.off("chat:room-created", handleRoomCreated);
      socketService.off("chat:room-assigned", handleRoomAssigned);
      socketService.off("chat:room-closed", handleRoomClosed);
    };
  }, []);

  return { isConnected };
}