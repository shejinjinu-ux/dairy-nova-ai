import React, { createContext, useContext, useState, useEffect } from 'react';
import { OfflineQueueItem } from '../types';
import { getStoredItem, setStoredItem, delay } from '../services/api/apiHelper';

interface OfflineContextType {
  isOffline: boolean;
  toggleOfflineMode: () => void;
  pendingQueue: OfflineQueueItem[];
  addToQueue: (type: OfflineQueueItem['type'], payload: any) => void;
  syncNow: () => Promise<void>;
  isSyncing: boolean;
  lastSyncTime: string;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOffline, setIsOffline] = useState<boolean>(() => {
    return getStoredItem<boolean>('offline_mode_active', false);
  });

  const [pendingQueue, setPendingQueue] = useState<OfflineQueueItem[]>(() => {
    return getStoredItem<OfflineQueueItem[]>('offline_queue', []);
  });

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => {
    return getStoredItem<string>('last_sync_time', 'Just now');
  });

  const toggleOfflineMode = () => {
    setIsOffline((prev) => {
      const next = !prev;
      setStoredItem('offline_mode_active', next);
      return next;
    });
  };

  const addToQueue = (type: OfflineQueueItem['type'], payload: any) => {
    const newItem: OfflineQueueItem = {
      id: `queue-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      payload,
      queuedAt: new Date().toISOString(),
      status: 'pending',
    };
    const updated = [newItem, ...pendingQueue];
    setPendingQueue(updated);
    setStoredItem('offline_queue', updated);
  };

  const syncNow = async () => {
    if (pendingQueue.length === 0 && !isOffline) {
      setIsSyncing(true);
      await delay(800);
      setIsSyncing(false);
      setLastSyncTime('Just now');
      setStoredItem('last_sync_time', 'Just now');
      return;
    }

    setIsSyncing(true);
    await delay(1500); // realistic sync simulation
    setPendingQueue([]);
    setStoredItem('offline_queue', []);
    setIsOffline(false);
    setStoredItem('offline_mode_active', false);
    setIsSyncing(false);
    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    setLastSyncTime(`Today at ${timeStr}`);
    setStoredItem('last_sync_time', `Today at ${timeStr}`);
  };

  const value: OfflineContextType = {
    isOffline,
    toggleOfflineMode,
    pendingQueue,
    addToQueue,
    syncNow,
    isSyncing,
    lastSyncTime,
  };

  return <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>;
};

export const useOffline = (): OfflineContextType => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};
