import { Plus, Minus, Wifi, WifiOff, Crosshair, RefreshCw, Database } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore, GpsMode } from '@/store/useAppStore';

export function RightControls() {
  const { 
    mapZoom, setMapZoom, 
    gpsMode, setGpsMode,
    isNetworkEnabled, setNetworkEnabled,
    isAutoCacheEnabled, setAutoCacheEnabled
  } = useAppStore();

  const cycleGps = () => {
    const modes: GpsMode[] = ['off', 'private', 'normal'];
    const next = modes[(modes.indexOf(gpsMode) + 1) % modes.length];
    setGpsMode(next);
  };

  const IconButton = ({ icon: Icon, onClick, isActive, className }: { icon: any, onClick?: () => void, isActive?: boolean, className?: string }) => (
    <button 
      onClick={onClick}
      className={cn(
        "w-10 h-10 flex items-center justify-center rounded-[14px] backdrop-blur-xl border shadow-lg transition-all active:scale-95",
        isActive 
          ? "bg-[#2d312c]/95 text-emerald-400 border-emerald-500/30" 
          : "bg-[#2d312c]/80 text-[#b4b9a9] border-[#4a4b45]/50 hover:bg-[#3d413c]",
        className
      )}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  return (
    <div className="absolute right-4 bottom-6 z-20 flex flex-col gap-2 pointer-events-auto">
      <IconButton 
        icon={Database} 
        isActive={isAutoCacheEnabled}
        onClick={() => setAutoCacheEnabled(!isAutoCacheEnabled)}
      />
      <IconButton 
        icon={isNetworkEnabled ? Wifi : WifiOff} 
        isActive={isNetworkEnabled}
        onClick={() => setNetworkEnabled(!isNetworkEnabled)} 
      />
      <IconButton 
        icon={Crosshair} 
        isActive={gpsMode !== 'off'}
        onClick={cycleGps} 
      />
      <div className="flex flex-col bg-[#2d312c]/80 backdrop-blur-xl rounded-[14px] border border-[#4a4b45]/50 shadow-lg overflow-hidden">
        <button 
          onClick={() => setMapZoom(Math.min(mapZoom + 1, 22))}
          className="w-10 h-10 flex items-center justify-center text-[#b4b9a9] hover:bg-[#3d413c] transition-colors active:bg-[#4d514c]"
        >
          <Plus className="w-4 h-4" />
        </button>
        <div className="w-6 h-px bg-[#4a4b45]/50 mx-auto"></div>
        <button 
          onClick={() => setMapZoom(Math.max(mapZoom - 1, 0))}
          className="w-10 h-10 flex items-center justify-center text-[#b4b9a9] hover:bg-[#3d413c] transition-colors active:bg-[#4d514c]"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
