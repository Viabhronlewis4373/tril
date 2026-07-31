import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface POI {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description?: string;
  isStandout: boolean;
  timestamp: number;
}

interface StealthMapDB extends DBSchema {
  tiles: {
    key: string;
    value: {
      url: string;
      data: Blob;
      timestamp: number;
      z: number;
      x: number;
      y: number;
    };
  };
  pois: {
    key: string;
    value: POI;
  };
}

let dbPromise: Promise<IDBPDatabase<StealthMapDB>> | null = null;

export const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<StealthMapDB>('stealth-map-db', 2, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          db.createObjectStore('tiles', { keyPath: 'url' });
        }
        if (oldVersion < 2) {
          db.createObjectStore('pois', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
};

export const saveTile = async (url: string, data: Blob, z: number, x: number, y: number) => {
  const db = await initDB();
  await db.put('tiles', {
    url,
    data,
    timestamp: Date.now(),
    z,
    x,
    y
  });
};

export const getTile = async (url: string) => {
  const db = await initDB();
  return db.get('tiles', url);
};

export const getCachedTilesCount = async () => {
  const db = await initDB();
  return db.count('tiles');
};

export const clearCache = async () => {
  const db = await initDB();
  await db.clear('tiles');
};

export const savePOI = async (poi: POI) => {
  const db = await initDB();
  await db.put('pois', poi);
};

export const getPOIs = async (): Promise<POI[]> => {
  const db = await initDB();
  return db.getAll('pois');
};

export const deletePOI = async (id: string) => {
  const db = await initDB();
  await db.delete('pois', id);
};
