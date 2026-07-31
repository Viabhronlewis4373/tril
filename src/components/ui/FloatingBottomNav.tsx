import { Settings, Wrench, Compass, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';

export function FloatingBottomNav() {
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const { isNorthLocked, setNorthLocked } = useAppStore();

  return (
    <>
      {/* Tools Menu Popup */}
      {isToolsOpen && (
        <div className="absolute bottom-20 left-4 w-60 bg-white/95 backdrop-blur-2xl rounded-2xl p-4 shadow-2xl border border-white/50 z-30 pointer-events-auto">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tools</span>
            <button onClick={() => setIsToolsOpen(false)} className="p-1.5 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors">
              <X className="w-3 h-3" />
            </button>
          </div>
          
          <div className="flex flex-col gap-1 mt-3">
            <div className="py-4 text-center text-xs text-slate-400 italic">
              Tools will be added later
            </div>
          </div>
        </div>
      )}

      {/* Main Bottom Nav */}
      <div className="absolute bottom-6 left-4 z-20 pointer-events-auto flex">
        <div className="bg-white/95 backdrop-blur-2xl rounded-full shadow-2xl border border-white/60 p-1.5 flex items-center gap-1">
          <button className="p-2 text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => setIsToolsOpen(!isToolsOpen)} 
            className="p-2 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-transform active:scale-95"
          >
            <Wrench className="w-5 h-5" />
          </button>

          <button 
            onClick={() => setNorthLocked(!isNorthLocked)}
            className={cn(
              "p-2 rounded-full transition-colors relative",
              isNorthLocked 
                ? "bg-blue-100 text-blue-700 hover:bg-blue-200" 
                : "text-slate-700 hover:bg-slate-100"
            )}
            title={isNorthLocked ? "Unlock North" : "Lock North Up"}
          >
            <Compass className="w-5 h-5" />
            {isNorthLocked && (
              <div className="absolute bottom-1.5 right-1.5 w-2 h-2 bg-blue-500 border-2 border-white rounded-full shadow-sm"></div>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
