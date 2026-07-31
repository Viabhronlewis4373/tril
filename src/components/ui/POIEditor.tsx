import { useState } from 'react';
import { POI, savePOI } from '@/lib/db';
import { useAppStore } from '@/store/useAppStore';
import { X } from 'lucide-react';

export function POIEditor({ lat, lng, onClose }: { lat: number, lng: number, onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [isStandout, setIsStandout] = useState(false);
  const { pois, setPOIs, addLog } = useAppStore();

  const handleSave = async () => {
    if (!title.trim()) return;
    const newPOI: POI = {
      id: Math.random().toString(36).substring(7),
      lat,
      lng,
      title,
      description: desc,
      isStandout,
      timestamp: Date.now()
    };
    
    await savePOI(newPOI);
    setPOIs([...pois, newPOI]);
    addLog('info', `Added POI: ${title}`, 'POI');
    onClose();
  };

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-slate-800/90 backdrop-blur-xl border border-slate-600 p-4 rounded-2xl w-72 text-white shadow-2xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-sm tracking-widest uppercase">New POI</h3>
        <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded-full"><X className="w-4 h-4" /></button>
      </div>
      
      <div className="flex flex-col gap-3">
        <input 
          type="text" 
          placeholder="TITLE" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)}
          className="bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 uppercase font-mono"
        />
        <textarea 
          placeholder="DESCRIPTION" 
          value={desc} 
          onChange={(e) => setDesc(e.target.value)}
          className="bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 font-mono resize-none h-20"
        />
        
        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider cursor-pointer">
          <input 
            type="checkbox" 
            checked={isStandout} 
            onChange={(e) => setIsStandout(e.target.checked)}
            className="w-4 h-4 accent-blue-500"
          />
          Standout (Visible at all altitudes)
        </label>
        
        <button 
          onClick={handleSave}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-widest py-2 rounded-lg mt-2 transition-colors"
        >
          Save Marker
        </button>
      </div>
    </div>
  );
}
