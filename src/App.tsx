/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Routes, Route } from 'react-router-dom';
import { LogKeeper } from '@/components/LogKeeper';
import { Map } from '@/components/Map';
import { FloatingBottomNav } from '@/components/ui/FloatingBottomNav';
import { TopHUD } from '@/components/ui/TopHUD';
import { LogKeeperFAB } from '@/components/ui/LogKeeperFAB';
import { RightControls } from '@/components/ui/RightControls';
import { POIEditor } from '@/components/ui/POIEditor';
import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';

function MapView() {
  const { addLog, isNetworkEnabled, editingPOI, setEditingPOI } = useAppStore();
  
  useEffect(() => {
    addLog('info', 'Map view initialized', 'MapView');
    
    // Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        addLog('info', 'Service Worker registered', 'System');
      }).catch((error) => {
        addLog('error', 'Service Worker registration failed', 'System', error);
      });
    }
  }, []);

  // Sync network state to SW
  useEffect(() => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SET_NETWORK_STATUS',
        enabled: isNetworkEnabled
      });
      addLog('info', `Internet Kill Switch: ${isNetworkEnabled ? 'Network Enabled' : 'Network Disabled (Offline)'}`, 'System');
    }
  }, [isNetworkEnabled]);

  return (
    <div className="absolute inset-0 overflow-hidden font-sans text-slate-900">
      <Map />
      
      {/* UI Overlay */}
      <TopHUD />
      <LogKeeperFAB />
      <FloatingBottomNav />
      <RightControls />
      
      {editingPOI && (
        <POIEditor 
          lat={editingPOI.lat} 
          lng={editingPOI.lng} 
          onClose={() => setEditingPOI(null)} 
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MapView />} />
      <Route path="/logs" element={<LogKeeper />} />
    </Routes>
  );
}
