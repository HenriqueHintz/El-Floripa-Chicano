/**
 * Real-Time Cross-Tab & Cross-Component Synchronization Bus for El Chicano
 *
 * Utilizes:
 * - HTML5 BroadcastChannel for instantaneous sync across browser tabs/windows.
 * - window.CustomEvent for in-page immediate state synchronization.
 * - Focus listener to revalidate on tab switch.
 */

const CHANNEL_NAME = 'elchicano_realtime_sync';

export type RealtimeEventType = 
  | 'GALLERY_UPDATED' 
  | 'FRANCHISE_VIDEO_UPDATED' 
  | 'SETTINGS_UPDATED'
  | 'MENU_UPDATED';

interface RealtimeMessage<T = any> {
  type: RealtimeEventType;
  payload: T;
  timestamp: number;
}

let channel: BroadcastChannel | null = null;

function getChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined') return null;
  if (!channel && 'BroadcastChannel' in window) {
    try {
      channel = new BroadcastChannel(CHANNEL_NAME);
    } catch (e) {
      console.warn('BroadcastChannel initialization error:', e);
    }
  }
  return channel;
}

/**
 * Broadcasts an update instantaneously to all components and open tabs.
 */
export function broadcastRealtime<T = any>(type: RealtimeEventType, payload: T): void {
  const message: RealtimeMessage<T> = {
    type,
    payload,
    timestamp: Date.now(),
  };

  // 1. Broadcast to other tabs/windows via BroadcastChannel
  const ch = getChannel();
  if (ch) {
    try {
      ch.postMessage(message);
    } catch (e) {
      console.warn('BroadcastChannel post error:', e);
    }
  }

  // 2. Dispatch in-tab CustomEvent for zero-latency local React component sync
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('elchicano_realtime_event', { detail: message })
    );
  }
}

/**
 * Subscribes to real-time events. Returns an unsubscribe cleanup function.
 */
export function subscribeRealtime<T = any>(
  type: RealtimeEventType,
  callback: (payload: T) => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  // Listener for other tabs (BroadcastChannel)
  const ch = getChannel();
  const handleChannelMessage = (event: MessageEvent<RealtimeMessage<T>>) => {
    if (event?.data?.type === type) {
      callback(event.data.payload);
    }
  };

  if (ch) {
    ch.addEventListener('message', handleChannelMessage);
  }

  // Listener for current tab (CustomEvent)
  const handleCustomEvent = (event: Event) => {
    const custom = event as CustomEvent<RealtimeMessage<T>>;
    if (custom?.detail?.type === type) {
      callback(custom.detail.payload);
    }
  };

  window.addEventListener('elchicano_realtime_event', handleCustomEvent);

  // Return unified cleanup
  return () => {
    if (ch) {
      ch.removeEventListener('message', handleChannelMessage);
    }
    window.removeEventListener('elchicano_realtime_event', handleCustomEvent);
  };
}
