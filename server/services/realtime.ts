import { Response } from 'express';

class RealtimeManager {
  private clients: Map<string, Set<Response>> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startHeartbeat();
  }

  public addClient(userId: string, res: Response): void {
    if (!this.clients.has(userId)) {
      this.clients.set(userId, new Set());
    }
    const userClients = this.clients.get(userId)!;
    userClients.add(res);

    res.on('close', () => {
      this.removeClient(userId, res);
    });
  }

  public removeClient(userId: string, res: Response): void {
    const userClients = this.clients.get(userId);
    if (userClients) {
      userClients.delete(res);
      if (userClients.size === 0) {
        this.clients.delete(userId);
      }
    }
  }

  public isUserOnline(userId: string): boolean {
    const userClients = this.clients.get(userId);
    return !!userClients && userClients.size > 0;
  }

  public getOnlineUserIds(): string[] {
    return Array.from(this.clients.keys());
  }

  public sendToUser(userId: string, event: string, data: any): void {
    const userClients = this.clients.get(userId);
    if (!userClients || userClients.size === 0) {
      return;
    }

    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const client of userClients) {
      try {
        client.write(payload);
      } catch (err) {
        console.error(`Error sending SSE to user ${userId}:`, err);
      }
    }
  }

  public broadcast(event: string, data: any, excludeUserId?: string): void {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const [userId, userClients] of this.clients.entries()) {
      if (excludeUserId && userId === excludeUserId) continue;
      for (const client of userClients) {
        try {
          client.write(payload);
        } catch (err) {
          console.error(`Error broadcasting SSE to user ${userId}:`, err);
        }
      }
    }
  }

  private startHeartbeat(): void {
    // Keep connection alive across proxies and firewalls
    this.heartbeatInterval = setInterval(() => {
      for (const userClients of this.clients.values()) {
        for (const client of userClients) {
          try {
            client.write(':keepalive\n\n');
          } catch {
            // Socket closed, will be cleaned up by close event
          }
        }
      }
    }, 20000);
  }
}

export const realtimeManager = new RealtimeManager();
