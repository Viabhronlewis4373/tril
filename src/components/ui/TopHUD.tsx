import { Compass, Database, Signal, Map as MapIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore, GpsMode } from '@/store/useAppStore';
import { useState, useEffect } from 'react';
import { getCachedTilesCount } from '@/lib/db';

export function TopHUD() {
  const { isHeavyMode, setHeavyMode, mapCenter, mapZoom, gpsMode, setGpsMode } = useAppStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const [tileCount, setTileCount] = useState(0);

  useEffect(() => {
    // Check tile count every 2 seconds
    const interval = setInterval(async () => {
      try {
        const count = await getCachedTilesCount();
        setTileCount(count);
      } catch (e) { }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const cycleGps = () => {
    const modes: GpsMode[] = ['off', 'private', 'normal'];
    const next = modes[(modes.indexOf(gpsMode) + 1) % modes.length];
    setGpsMode(next);
  };

  const formatCoord = (val: number, isLat: boolean) => {
    const dir = val >= 0 ? (isLat ? 'N' : 'S') : (isLat ? 'E' : 'W');
    const absVal = Math.abs(val);
    const deg = Math.floor(absVal);
    const min = Math.floor((absVal - deg) * 60);
    const sec = ((absVal - deg - min / 60) * 3600).toFixed(2);
    return `${deg}° ${min}' ${sec}" ${dir}`;
  };

  const scale = Math.round(156543.03392 * Math.cos(mapCenter.lat * Math.PI / 180) / Math.pow(2, mapZoom));

  return (
    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none w-full max-w-[220px]">
      <div className="bg-white/80 backdrop-blur-2xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/60 text-slate-800 pointer-events-auto overflow-hidden transition-all duration-300">
        
        {/* Header - Always visible */}
        <div 
          className="px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-white/40"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <Compass className="w-3.5 h-3.5 text-slate-700" />
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">MAP CENTER</span>
              {!isExpanded && (
                <span className="text-[10px] font-mono font-medium text-slate-700 mt-0.5">
                  {mapCenter.lat.toFixed(4)}, {mapCenter.lng.toFixed(4)}
                </span>
              )}
            </div>
          </div>
          <button className="p-1 rounded-full bg-slate-100 text-slate-500">
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Collapsible Content */}
        <div className={cn(
          "px-3 transition-all duration-300 ease-in-out origin-top",
          isExpanded ? "max-h-[300px] pb-3 opacity-100" : "max-h-0 opacity-0 pb-0"
        )}>
          {/* Tile Status Row */}
          <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/50">
            <div className="flex items-center gap-1.5 text-[8px] font-bold text-slate-500 uppercase tracking-[0.2em]">
              <span className="flex items-center gap-1 text-blue-600"><Database className="w-2.5 h-2.5" /> {tileCount.toLocaleString()} TILES</span>
              <span className="text-slate-300">|</span>
              <span>SIGNAL TRAP</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2 mb-1 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
            <button 
              onClick={cycleGps}
              className="flex items-center gap-1 text-[8px] hover:text-slate-800 transition-colors"
            >
              <Signal className="w-3 h-3 text-blue-500" />
              {gpsMode === 'normal' ? 'NORMAL' : gpsMode === 'private' ? 'PRIVATE' : 'UNSPECIFIED'}
              <span className={cn(
                "w-1 h-1 rounded-full ml-0.5", 
                gpsMode === 'normal' ? "bg-emerald-500 animate-pulse" : 
                gpsMode === 'private' ? "bg-emerald-500" : 
                "bg-slate-400"
              )}></span>
            </button>
          </div>
          
          {/* Coordinates */}
          <div className="flex flex-col gap-0 mb-2">
            <div className="text-base font-mono tracking-tight font-medium text-slate-800 leading-tight">
              {formatCoord(mapCenter.lat, true)}
            </div>
            <div className="text-base font-mono tracking-tight font-medium text-slate-800 leading-tight">
              {formatCoord(mapCenter.lng, false)}
            </div>
          </div>
          
          {/* Scale & Zoom Line */}
          <div className="flex items-center justify-between text-[9px] text-slate-600 font-mono font-medium">
            <span className="flex items-center gap-1">
              <MapIcon className="w-2.5 h-2.5 text-slate-800" />
              1:{scale.toLocaleString()}
            </span>
            <div className="flex-1 mx-2 relative flex items-center h-3">
              <div className="h-[2px] w-full bg-slate-800/20 rounded-full relative">
                 <div 
                   className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-2 bg-slate-800 rounded-sm shadow-sm" 
                   style={{ left: `${Math.min(100, (mapZoom/22)*100)}%` }}
                 ></div>
              </div>
            </div>
            <span>{Math.round(mapZoom)}/20</span>
          </div>
        </div>
      </div>
      
      {/* Modes toggle button (moved from right side to below the HUD) */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <button 
          onClick={() => setHeavyMode(!isHeavyMode)}
          className={cn(
            "px-3 py-1.5 rounded-xl text-[9px] font-bold shadow-lg backdrop-blur-xl transition-all border uppercase tracking-wider",
            isHeavyMode 
              ? "bg-[#2d312c]/95 text-[#b4b9a9] border-[#4a4b45]/50" 
              : "bg-white/80 text-slate-600 border-white/60 hover:bg-white"
          )}
        >
          {isHeavyMode ? 'Heavy Mode' : 'Light Mode'}
        </button>
      </div>
    </div>
  );
}
