import { api } from './api';
import { BattleInvite, NotificationItem } from '../types';

export type RealtimeEventType =
  | 'NEW_BATTLE_INVITE'
  | 'INVITE_ACCEPTED'
  | 'INVITE_DECLINED'
  | 'sync'
  | 'connected';

export interface RealtimeEventPayload {
  type: RealtimeEventType;
  invite?: BattleInvite;
  notification?: NotificationItem;
  acceptedBy?: { id: string; username: string; profileImage: string };
  declinedBy?: { id: string; username: string };
  battleId?: string;
  battleCode?: string;
  unreadCount?: number;
  pendingInvitesCount?: number;
  pendingInvites?: BattleInvite[];
}

type RealtimeListener = (payload: RealtimeEventPayload) => void;

class RealtimeNotificationService {
  private eventSource: EventSource | null = null;
  private listeners: Set<RealtimeListener> = new Set();
  private reconnectTimer: NodeJS.Timeout | null = null;
  private activeToken: string | null = null;
  private audioCtx: AudioContext | null = null;

  public connect(): void {
    const token = api.getToken();
    if (!token) {
      this.disconnect();
      return;
    }

    if (this.eventSource && this.activeToken === token) {
      return; // Already connected with valid token
    }

    this.disconnect();
    this.activeToken = token;

    try {
      const url = `/api/notifications/stream?token=${encodeURIComponent(token)}`;
      this.eventSource = new EventSource(url);

      this.eventSource.addEventListener('connected', (e: MessageEvent) => {
        // Connected successfully
      });

      this.eventSource.addEventListener('sync', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          this.notifyListeners({
            type: 'sync',
            ...data,
          });
        } catch (err) {
          console.error('Error parsing sync event:', err);
        }
      });

      this.eventSource.addEventListener('NEW_BATTLE_INVITE', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          this.playChime();
          this.notifyListeners({
            type: 'NEW_BATTLE_INVITE',
            ...data,
          });
        } catch (err) {
          console.error('Error parsing NEW_BATTLE_INVITE event:', err);
        }
      });

      this.eventSource.addEventListener('INVITE_ACCEPTED', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          this.playVictoryChime();
          this.notifyListeners({
            type: 'INVITE_ACCEPTED',
            ...data,
          });
        } catch (err) {
          console.error('Error parsing INVITE_ACCEPTED event:', err);
        }
      });

      this.eventSource.addEventListener('INVITE_DECLINED', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          this.notifyListeners({
            type: 'INVITE_DECLINED',
            ...data,
          });
        } catch (err) {
          console.error('Error parsing INVITE_DECLINED event:', err);
        }
      });

      this.eventSource.onerror = () => {
        // Reconnect after 4s
        if (this.eventSource) {
          this.eventSource.close();
          this.eventSource = null;
        }
        if (!this.reconnectTimer) {
          this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.connect();
          }, 4000);
        }
      };
    } catch (err) {
      console.error('Failed to initialize EventSource:', err);
    }
  }

  public disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.activeToken = null;
  }

  public subscribe(listener: RealtimeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(payload: RealtimeEventPayload): void {
    for (const listener of this.listeners) {
      try {
        listener(payload);
      } catch (err) {
        console.error('Error executing realtime listener:', err);
      }
    }
  }

  // Synthesized audio chime for incoming challenge using Web Audio API
  private playChime(): void {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.audioCtx) {
        this.audioCtx = new AudioCtx();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, this.audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, this.audioCtx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.4);
    } catch {
      // Audio autoplay policy safe fallback
    }
  }

  private playVictoryChime(): void {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.audioCtx) {
        this.audioCtx = new AudioCtx();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, this.audioCtx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, this.audioCtx.currentTime + 0.1); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, this.audioCtx.currentTime + 0.25); // G5

      gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.45);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.45);
    } catch {
      // Audio autoplay policy safe fallback
    }
  }
}

export const realtimeNotificationService = new RealtimeNotificationService();
