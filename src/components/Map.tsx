import { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import { useAppStore } from '@/store/useAppStore';
import { getTile, getPOIs, POI } from '@/lib/db';
import { cacheVisibleTiles } from '@/lib/tileCache';

export function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const userMarker = useRef<maplibregl.Marker | null>(null);
  const poiMarkers = useRef<Record<string, maplibregl.Marker>>({});
  
  const { 
    gpsMode, 
    mapCenter, 
    mapZoom,
    setMapCenter, 
    setMapZoom, 
    addLog,
    isHeavyMode,
    isNorthLocked,
    isAutoCacheEnabled,
    isNetworkEnabled,
    pois,
    setPOIs,
    setEditingPOI
  } = useAppStore();

  // Load POIs on mount
  useEffect(() => {
    getPOIs().then((loadedPOIs) => {
      setPOIs(loadedPOIs);
    });
  }, [setPOIs]);

  // Handle POI rendering
  useEffect(() => {
    if (!map.current) return;

    // Remove deleted POIs
    Object.keys(poiMarkers.current).forEach(id => {
      if (!pois.find(p => p.id === id)) {
        poiMarkers.current[id].remove();
        delete poiMarkers.current[id];
      }
    });

    // Add or update POIs
    pois.forEach(poi => {
      if (!poiMarkers.current[poi.id]) {
        const el = document.createElement('div');
        el.className = 'w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-md cursor-pointer transition-transform hover:scale-125';
        
        const popup = new maplibregl.Popup({ offset: 15, closeButton: false, className: 'poi-popup' })
          .setHTML(`<div class="font-sans px-2 py-1"><div class="font-bold text-xs uppercase tracking-wider text-slate-800">${poi.title}</div>${poi.description ? `<div class="text-[10px] text-slate-600 mt-1">${poi.description}</div>` : ''}</div>`);
        
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([poi.lng, poi.lat])
          .setPopup(popup)
          .addTo(map.current!);
          
        poiMarkers.current[poi.id] = marker;
      }
    });
    
    // Update visibility based on zoom and standout
    const updateVisibility = () => {
      const currentZoom = map.current?.getZoom() || 0;
      pois.forEach(poi => {
        const marker = poiMarkers.current[poi.id];
        if (marker) {
          const el = marker.getElement();
          // Hide non-standout POIs if zoom is less than 13
          if (!poi.isStandout && currentZoom < 13) {
            el.style.display = 'none';
          } else {
            el.style.display = 'block';
          }
        }
      });
    };
    
    updateVisibility();
    
    map.current.on('zoom', updateVisibility);
    return () => {
      if (map.current) {
        map.current.off('zoom', updateVisibility);
      }
    };
  }, [pois]);

  // Handle North Lock
  useEffect(() => {
    if (!map.current) return;
    
    if (isNorthLocked) {
      map.current.resetNorth({ duration: 500 });
      map.current.dragRotate.disable();
      map.current.touchZoomRotate.disableRotation();
    } else {
      map.current.dragRotate.enable();
      map.current.touchZoomRotate.enableRotation();
    }
  }, [isNorthLocked]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainer.current) return;
    
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      transformRequest: (url, resourceType) => {
        if (resourceType === 'Tile' && (url.includes('arcgisonline.com') || url.includes('cartocdn.com'))) {
          // Check IndexedDB cache or network status
          return {
            url,
            // @ts-ignore
            async fetch(input, init) {
              try {
                const cached = await getTile(url);
                if (cached) {
                  return new Response(cached.data);
                }
              } catch (e) {
                // Ignore DB error
              }
              
              // MapLibre's built-in fetch relies on browser, but we can do it directly:
              if (!useAppStore.getState().isNetworkEnabled) {
                return new Response(null, { status: 503, statusText: 'Offline' });
              }
              return fetch(input, init);
            }
          };
        }
        return { url };
      },
      style: {
        version: 8,
        sources: {
          'satellite': {
            type: 'raster',
            tiles: [
              'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            ],
            tileSize: 256
          },
          'labels': {
            type: 'raster',
            tiles: [
              'https://basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png'
            ],
            tileSize: 256
          }
        },
        layers: [
          {
            id: 'satellite-layer',
            type: 'raster',
            source: 'satellite',
            minzoom: 0,
            maxzoom: 22
          },
          {
            id: 'labels-layer',
            type: 'raster',
            source: 'labels',
            minzoom: 0,
            maxzoom: 22
          }
        ]
      },
      center: [mapCenter.lng, mapCenter.lat],
      zoom: mapZoom,
      attributionControl: false,
    });

    map.current.on('moveend', () => {
      if (!map.current) return;
      const center = map.current.getCenter();
      const zoom = map.current.getZoom();
      const bounds = map.current.getBounds();
      
      setMapCenter(center.lat, center.lng);
      setMapZoom(zoom);
      
      if (useAppStore.getState().isAutoCacheEnabled && useAppStore.getState().isNetworkEnabled) {
        cacheVisibleTiles(bounds, zoom, addLog);
      }
    });

    map.current.on('load', () => {
      addLog('info', 'MapLibre GL initialized with hybrid view', 'Map');
    });

    const resizeObserver = new ResizeObserver(() => {
      map.current?.resize();
    });
    resizeObserver.observe(mapContainer.current);

    const handleContextMenu = (e: maplibregl.MapMouseEvent) => {
      setEditingPOI({ lat: e.lngLat.lat, lng: e.lngLat.lng });
    };
    
    map.current.on('contextmenu', handleContextMenu);

    return () => {
      resizeObserver.disconnect();
      map.current?.off('contextmenu', handleContextMenu);
      map.current?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle GPS Tri-State logic
  useEffect(() => {
    if (gpsMode === 'off') {
        if (userMarker.current) {
            userMarker.current.remove();
            userMarker.current = null;
        }
        addLog('info', 'GPS tracking disabled', 'Map');
        return;
    }

    const isHighAccuracy = gpsMode === 'normal';
    addLog('info', `Starting GPS tracking (Mode: ${gpsMode})`, 'Map', { enableHighAccuracy: isHighAccuracy });

    if (!navigator.geolocation) {
      addLog('error', 'Geolocation is not supported by this browser.', 'Map');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
         const { latitude, longitude } = pos.coords;
         
         if (!userMarker.current && map.current) {
             const el = document.createElement('div');
             el.className = 'w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-[0_0_10px_rgba(16,185,129,0.7)]';
             
             // In Heavy mode, maybe add a pulse or accuracy ring, but keep it simple for now
             if (isHeavyMode) {
                const pulse = document.createElement('div');
                pulse.className = 'absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-75';
                el.appendChild(pulse);
             }

             userMarker.current = new maplibregl.Marker({ element: el })
                 .setLngLat([longitude, latitude])
                 .addTo(map.current);
         } else if (userMarker.current) {
             userMarker.current.setLngLat([longitude, latitude]);
         }
         
         // Optionally pan to location on first fix if map is off-center, 
         // but manual panning usually preferred in this kind of app unless there's a "lock" button.
      },
      (err) => {
         addLog('error', `GPS Error: ${err.message}`, 'Map', { code: err.code });
      },
      {
         enableHighAccuracy: isHighAccuracy,
         maximumAge: 10000,
         timeout: 5000
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gpsMode, isHeavyMode]);

  return (
    <div className="absolute inset-0 bg-slate-900">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}
