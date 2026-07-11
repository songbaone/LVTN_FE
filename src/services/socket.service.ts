import { io, Socket } from "socket.io-client";

type Role = "customer" | "admin";

class SocketService {
  private socket: Socket | null = null;
  private baseURL: string = "http://localhost:3000";

  connect(role: Role): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(this.baseURL, {
      auth: (cb: (auth: { token: string | null }) => void) => {
        const token =
          role === "admin"
            ? localStorage.getItem("AccessTokenAdmin")
            : localStorage.getItem("AccessToken");
        cb({ token });
      },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      transports: ["websocket", "polling"],
    });

    this.socket.on("connect", () => {
      console.log(`[Socket.IO] Connected as ${role}`);
    });

    this.socket.on("disconnect", (reason: string) => {
      console.log(`[Socket.IO] Disconnected: ${reason}`);
    });

    this.socket.on("connect_error", (error: Error) => {
      console.error("[Socket.IO] Connection error:", error.message);
    });

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  joinRoom(roomId: string | number): void {
    this.socket?.emit("chat:join-room", { roomId: String(roomId) });
  }

  leaveRoom(roomId: string | number): void {
    this.socket?.emit("chat:leave-room", { roomId: String(roomId) });
  }

  joinAdmin(): void {
    this.socket?.emit("chat:join-admin");
  }

  leaveAdmin(): void {
    this.socket?.emit("chat:leave-admin");
  }

  on(event: string, handler: (...args: any[]) => void): void {
    this.socket?.on(event, handler);
  }

  off(event: string, handler?: (...args: any[]) => void): void {
    if (handler) {
      this.socket?.off(event, handler);
    } else {
      this.socket?.off(event);
    }
  }

  emit(event: string, data: unknown): void {
    this.socket?.emit(event, data);
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const socketService = new SocketService();