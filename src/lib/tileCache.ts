import { saveTile, getTile } from './db';

// Convert lat/lng to tile x/y
const lon2tile = (lon: number, zoom: number) => (Math.floor((lon + 180) / 360 * Math.pow(2, zoom)));
const lat2tile = (lat: number, zoom: number) => (Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom)));

export const cacheVisibleTiles = async (
  bounds: { _sw: { lat: number, lng: number }, _ne: { lat: number, lng: number } },
  zoom: number,
  addLog: (level: any, msg: string, src: string) => void
) => {
  const z = Math.floor(zoom);
  const minX = lon2tile(bounds._sw.lng, z);
  const maxX = lon2tile(bounds._ne.lng, z);
  const minY = lat2tile(bounds._ne.lat, z); // NE lat is higher, so smaller Y
  const maxY = lat2tile(bounds._sw.lat, z);

  const tilesToFetch: { url: string; z: number; x: number; y: number }[] = [];

  // Generate satellite URLs (we could do both satellite and labels)
  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      const satUrl = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`;
      const labelUrl = `https://basemaps.cartocdn.com/rastertiles/voyager_only_labels/${z}/${x}/${y}.png`;
      tilesToFetch.push({ url: satUrl, z, x, y });
      tilesToFetch.push({ url: labelUrl, z, x, y });
    }
  }

  let newCached = 0;

  for (const tile of tilesToFetch) {
    const existing = await getTile(tile.url);
    if (!existing) {
      try {
        const res = await fetch(tile.url);
        if (res.ok) {
          const blob = await res.blob();
          await saveTile(tile.url, blob, tile.z, tile.x, tile.y);
          newCached++;
        }
      } catch (err) {
        // network error, probably offline
      }
    }
  }

  if (newCached > 0) {
    addLog('info', `Auto-Cached ${newCached} new tiles for Z${z}`, 'AutoCache');
  }
};
