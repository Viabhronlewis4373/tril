import { create } from 'zustand';
import { POI } from '@/lib/db';

export type LogLevel = 'info' | 'warn' | 'error';
export type GpsMode = 'off' | 'private' | 'normal';

export interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  message: string;
  source: string;
  details?: any;
}

interface AppState {
  isHeavyMode: boolean;
  setHeavyMode: (isHeavy: boolean) => void;
  
  isLogKeeperEnabled: boolean;
  setLogKeeperEnabled: (enabled: boolean) => void;
  
  gpsMode: GpsMode;
  setGpsMode: (mode: GpsMode) => void;
  
  mapCenter: { lat: number; lng: number };
  setMapCenter: (lat: number, lng: number) => void;
  
  mapZoom: number;
  setMapZoom: (zoom: number) => void;
  
  isNorthLocked: boolean;
  setNorthLocked: (locked: boolean) => void;
  
  isAutoCacheEnabled: boolean;
  setAutoCacheEnabled: (enabled: boolean) => void;
  
  isNetworkEnabled: boolean;
  setNetworkEnabled: (enabled: boolean) => void;
  
  pois: POI[];
  setPOIs: (pois: POI[]) => void;
  
  editingPOI: { lat: number; lng: number } | null;
  setEditingPOI: (coord: { lat: number; lng: number } | null) => void;
  
  logs: LogEntry[];
  addLog: (level: LogLevel, message: string, source: string, details?: any) => void;
  clearLogs: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  isHeavyMode: false,
  setHeavyMode: (isHeavy) => set({ isHeavyMode: isHeavy }),
  
  isLogKeeperEnabled: true,
  setLogKeeperEnabled: (enabled) => set({ isLogKeeperEnabled: enabled }),
  
  gpsMode: 'off',
  setGpsMode: (mode) => set({ gpsMode: mode }),
  
  mapCenter: { lat: 51.4816, lng: -0.0886 }, // London area based on user screenshot
  setMapCenter: (lat, lng) => set({ mapCenter: { lat, lng } }),
  
  mapZoom: 12,
  setMapZoom: (zoom) => set({ mapZoom: zoom }),
  
  isNorthLocked: true,
  setNorthLocked: (locked) => set({ isNorthLocked: locked }),
  
  isAutoCacheEnabled: false,
  setAutoCacheEnabled: (enabled) => set({ isAutoCacheEnabled: enabled }),
  
  isNetworkEnabled: true,
  setNetworkEnabled: (enabled) => set({ isNetworkEnabled: enabled }),
  
  pois: [],
  setPOIs: (pois) => set({ pois }),
  
  editingPOI: null,
  setEditingPOI: (coord) => set({ editingPOI: coord }),
  
  logs: [],
  addLog: (level, message, source, details) => {
    const { isLogKeeperEnabled } = get();
    if (!isLogKeeperEnabled) return;
    
    set((state) => ({
      logs: [
        {
          id: Math.random().toString(36).substring(7),
          timestamp: Date.now(),
          level,
          message,
          source,
          details,
        },
        ...state.logs,
      ].slice(0, 1000), // Keep last 1000 logs
    }));
  },
  clearLogs: () => set({ logs: [] }),
}));
