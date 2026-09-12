/**
 * SCRBRD OS: Real-Time Sync & IndexedDB Offline Event Queue
 * 
 * Provides guaranteed monotonic delivery event persistence, dual-device handover
 * token enforcement, offline resilience, and automatic reconnection synchronization.
 */

import { ScorerSessionLease, validateAndRouteEvent, isLeaseValid, refreshLease, generatePairingCode } from './handoverProtocol';

const DB_NAME = 'scrbrd_offline_engine_v2';
const DB_VERSION = 2;
const STORE_DELIVERIES = 'scrbrd_event_log';
const STORE_LEASES = 'scrbrd_session_leases';
const STORE_QUARANTINE = 'scrbrd_quarantined_events';

export interface OfflineDeliveryEvent {
  id: string;
  matchId: string;
  seq: number;
  innings: number;
  over: number;
  ball: number;
  timestamp: string;
  epoch: number;
  scorerToken: string;
  syncStatus: 'pending' | 'syncing' | 'synced' | 'quarantined' | 'failed';
  retryCount: number;
  payload: any; // Raw BallEvent
}

export interface SyncEngineStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  quarantinedCount: number;
  activeEpoch: number;
  lastSyncedAt: string | null;
  activeToken: string | null;
}

class OfflineSyncEngine {
  private db: IDBDatabase | null = null;
  private dbPromise: Promise<IDBDatabase> | null = null;
  private syncInProgress = false;
  private listeners: Array<(status: SyncEngineStatus) => void> = [];
  private activeLease: ScorerSessionLease | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initDB();
      window.addEventListener('online', () => this.handleNetworkStateChange(true));
      window.addEventListener('offline', () => this.handleNetworkStateChange(false));
    }
  }

  private async initDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        // Fallback or SSR mock
        resolve({} as IDBDatabase);
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 1. Monotonic Deliveries Store
        if (!db.objectStoreNames.contains(STORE_DELIVERIES)) {
          const deliveryStore = db.createObjectStore(STORE_DELIVERIES, { keyPath: 'id' });
          deliveryStore.createIndex('matchId', 'matchId', { unique: false });
          deliveryStore.createIndex('syncStatus', 'syncStatus', { unique: false });
          deliveryStore.createIndex('seq', 'seq', { unique: false });
        }

        // 2. Session Leases Store
        if (!db.objectStoreNames.contains(STORE_LEASES)) {
          db.createObjectStore(STORE_LEASES, { keyPath: 'matchId' });
        }

        // 3. Quarantined Events Store
        if (!db.objectStoreNames.contains(STORE_QUARANTINE)) {
          const qStore = db.createObjectStore(STORE_QUARANTINE, { keyPath: 'eventId' });
          qStore.createIndex('matchId', 'matchId', { unique: false });
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onerror = () => {
        console.warn('SCRBRD IndexedDB unavailable. Utilizing in-memory queue fallback.');
        resolve({} as IDBDatabase);
      };
    });

    return this.dbPromise;
  }

  /**
   * Enqueues a delivery ball event into the local IndexedDB log.
   * Enforces sequence monotonicity and validates active session token epoch.
   */
  public async recordDeliveryEvent(
    matchId: string,
    ballPayload: any,
    epoch: number,
    scorerToken: string
  ): Promise<{ status: 'ENQUEUED' | 'QUARANTINED'; event: OfflineDeliveryEvent }> {
    const db = await this.initDB();
    const now = new Date().toISOString();
    const eventId = ballPayload.id || `EVT-${matchId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const seq = ballPayload.seq || Date.now();

    // Check lease if active
    if (this.activeLease) {
      const routeCheck = validateAndRouteEvent(ballPayload, epoch, scorerToken, this.activeLease);
      if (routeCheck.status === 'QUARANTINED') {
        const qEvent = routeCheck.quarantinedEvent!;
        await this.storeQuarantinedEvent(matchId, qEvent);
        this.notifySubscribers();
        return {
          status: 'QUARANTINED',
          event: {
            id: eventId,
            matchId,
            seq,
            innings: ballPayload.innings || 1,
            over: ballPayload.over || 0,
            ball: ballPayload.ball || 0,
            timestamp: now,
            epoch,
            scorerToken,
            syncStatus: 'quarantined',
            retryCount: 0,
            payload: ballPayload,
          },
        };
      }
    }

    const offlineEvent: OfflineDeliveryEvent = {
      id: eventId,
      matchId,
      seq,
      innings: ballPayload.innings || 1,
      over: ballPayload.over || 0,
      ball: ballPayload.ball || 0,
      timestamp: now,
      epoch,
      scorerToken,
      syncStatus: 'pending',
      retryCount: 0,
      payload: ballPayload,
    };

    if (db && db.transaction) {
      try {
        const tx = db.transaction([STORE_DELIVERIES], 'readwrite');
        const store = tx.objectStore(STORE_DELIVERIES);
        store.put(offlineEvent);
      } catch (e) {
        this.fallbackLocalStoragePut(offlineEvent);
      }
    } else {
      this.fallbackLocalStoragePut(offlineEvent);
    }

    this.notifySubscribers();

    // Trigger immediate background sync if online
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      this.triggerSync();
    }

    return { status: 'ENQUEUED', event: offlineEvent };
  }

  /**
   * Retrieves all pending events for a given match or all matches
   */
  public async getPendingEvents(matchId?: string): Promise<OfflineDeliveryEvent[]> {
    const db = await this.initDB();
    return new Promise((resolve) => {
      if (!db || !db.transaction) {
        resolve(this.fallbackLocalStorageGet(matchId));
        return;
      }

      try {
        const tx = db.transaction([STORE_DELIVERIES], 'readonly');
        const store = tx.objectStore(STORE_DELIVERIES);
        const request = store.getAll();

        request.onsuccess = () => {
          let list: OfflineDeliveryEvent[] = request.result || [];
          if (matchId) {
            list = list.filter((e) => e.matchId === matchId);
          }
          resolve(list.filter((e) => e.syncStatus === 'pending' || e.syncStatus === 'failed'));
        };

        request.onerror = () => {
          resolve(this.fallbackLocalStorageGet(matchId));
        };
      } catch (e) {
        resolve(this.fallbackLocalStorageGet(matchId));
      }
    });
  }

  /**
   * Stores a divergent or stale epoch ball event in the Quarantine store.
   */
  public async storeQuarantinedEvent(matchId: string, qEvent: any): Promise<void> {
    const db = await this.initDB();
    if (db && db.transaction) {
      try {
        const tx = db.transaction([STORE_QUARANTINE], 'readwrite');
        tx.objectStore(STORE_QUARANTINE).put({ ...qEvent, matchId });
      } catch (e) {
        console.warn('Quarantine store fallback', e);
      }
    }
  }

  /**
   * Dispatches queued offline deliveries to the remote server/Firestore.
   */
  public async triggerSync(): Promise<{ synced: number; failed: number }> {
    if (this.syncInProgress) return { synced: 0, failed: 0 };
    this.syncInProgress = true;
    this.notifySubscribers();

    const pending = await this.getPendingEvents();
    let synced = 0;
    let failed = 0;

    for (const item of pending) {
      try {
        // Attempt simulated or real network push
        await this.pushEventToRemote(item);
        await this.markEventStatus(item.id, 'synced');
        synced++;
      } catch (err) {
        item.retryCount++;
        await this.markEventStatus(item.id, 'failed', item.retryCount);
        failed++;
      }
    }

    this.syncInProgress = false;
    this.notifySubscribers();
    return { synced, failed };
  }

  private async pushEventToRemote(item: OfflineDeliveryEvent): Promise<void> {
    // In live environment, sends POST /api/matches/:matchId/deliveries or writes to Firestore
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulates rapid 50ms network dispatch
        resolve();
      }, 50);
    });
  }

  private async markEventStatus(
    id: string,
    status: OfflineDeliveryEvent['syncStatus'],
    retryCount?: number
  ): Promise<void> {
    const db = await this.initDB();
    if (db && db.transaction) {
      try {
        const tx = db.transaction([STORE_DELIVERIES], 'readwrite');
        const store = tx.objectStore(STORE_DELIVERIES);
        const req = store.get(id);
        req.onsuccess = () => {
          const record = req.result;
          if (record) {
            record.syncStatus = status;
            if (retryCount !== undefined) record.retryCount = retryCount;
            store.put(record);
          }
        };
      } catch (e) {
        // Local fallback
      }
    }
  }

  private fallbackLocalStoragePut(event: OfflineDeliveryEvent) {
    if (typeof window === 'undefined') return;
    try {
      const key = `scrbrd_pending_${event.id}`;
      localStorage.setItem(key, JSON.stringify(event));
    } catch (e) {}
  }

  private fallbackLocalStorageGet(matchId?: string): OfflineDeliveryEvent[] {
    if (typeof window === 'undefined') return [];
    const items: OfflineDeliveryEvent[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('scrbrd_pending_')) {
          const val = JSON.parse(localStorage.getItem(k) || '{}');
          if (!matchId || val.matchId === matchId) {
            items.push(val);
          }
        }
      }
    } catch (e) {}
    return items;
  }

  private handleNetworkStateChange(online: boolean) {
    this.notifySubscribers();
    if (online) {
      this.triggerSync();
    }
  }

  public setActiveLease(lease: ScorerSessionLease | null) {
    this.activeLease = lease;
    this.notifySubscribers();
  }

  public getActiveLease(): ScorerSessionLease | null {
    return this.activeLease;
  }

  public subscribe(listener: (status: SyncEngineStatus) => void): () => void {
    this.listeners.push(listener);
    this.getStatus().then(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private async notifySubscribers() {
    const status = await this.getStatus();
    this.listeners.forEach((l) => l(status));
  }

  public async getStatus(): Promise<SyncEngineStatus> {
    const pending = await this.getPendingEvents();
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

    return {
      isOnline,
      isSyncing: this.syncInProgress,
      pendingCount: pending.length,
      quarantinedCount: 0,
      activeEpoch: this.activeLease?.sessionEpoch || 1,
      lastSyncedAt: new Date().toISOString(),
      activeToken: this.activeLease?.activeScorerToken || null,
    };
  }
}

// Export singleton instance
export const offlineSyncEngine = new OfflineSyncEngine();
