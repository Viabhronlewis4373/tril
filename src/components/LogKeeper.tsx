import { useState, useMemo } from 'react';
import { ArrowLeft, Copy, Download, Trash2, Shield, ShieldOff, Terminal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore, LogLevel } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

type TimeFilter = '1h' | '6h' | '12h' | '24h' | 'all';

export function LogKeeper() {
  const navigate = useNavigate();
  const { logs, isLogKeeperEnabled, setLogKeeperEnabled, clearLogs } = useAppStore();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [levelFilter, setLevelFilter] = useState<LogLevel | 'all'>('all');

  const filteredLogs = useMemo(() => {
    const now = Date.now();
    return logs.filter((log) => {
      // Time filter
      if (timeFilter !== 'all') {
        const hours = parseInt(timeFilter.replace('h', ''));
        const ms = hours * 60 * 60 * 1000;
        if (now - log.timestamp > ms) return false;
      }
      
      // Level filter
      if (levelFilter !== 'all' && log.level !== levelFilter) return false;
      
      return true;
    });
  }, [logs, timeFilter, levelFilter]);

  const handleCopy = () => {
    const text = filteredLogs.map(l => `[${new Date(l.timestamp).toISOString()}] [${l.level.toUpperCase()}] ${l.source}: ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
  };

  const handleDownload = () => {
    const text = filteredLogs.map(l => `[${new Date(l.timestamp).toISOString()}] [${l.level.toUpperCase()}] ${l.source}: ${l.message}\n${l.details ? JSON.stringify(l.details, null, 2) : ''}`).join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stealthmap-logs-${new Date().toISOString()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-mono flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 p-4">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')}
              className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-emerald-500" />
              Log Keeper
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLogKeeperEnabled(!isLogKeeperEnabled)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors border",
                isLogKeeperEnabled 
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" 
                  : "bg-red-500/10 text-red-400 border-red-500/30"
              )}
            >
              {isLogKeeperEnabled ? <Shield className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
              {isLogKeeperEnabled ? 'LOGGING ACTIVE' : 'LOGGING PAUSED'}
            </button>
            <div className="h-6 w-px bg-slate-800 mx-2"></div>
            <button onClick={handleCopy} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors" title="Copy to Clipboard">
              <Copy className="w-5 h-5" />
            </button>
            <button onClick={handleDownload} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors" title="Download Logs">
              <Download className="w-5 h-5" />
            </button>
            <button onClick={clearLogs} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-950 rounded-lg transition-colors" title="Clear Logs">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center max-w-5xl mx-auto mt-4 pt-4 border-t border-slate-800/50">
          <div className="flex gap-2 bg-slate-900 p-1 rounded-lg border border-slate-800">
            {(['all', '1h', '6h', '12h', '24h'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTimeFilter(t)}
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-semibold transition-all",
                  timeFilter === t ? "bg-slate-700 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
                )}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>
          
          <div className="flex gap-2 bg-slate-900 p-1 rounded-lg border border-slate-800">
            {(['all', 'info', 'warn', 'error'] as const).map(l => (
              <button
                key={l}
                onClick={() => setLevelFilter(l)}
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-semibold transition-all capitalize",
                  levelFilter === l ? (
                    l === 'error' ? 'bg-red-900/50 text-red-400' :
                    l === 'warn' ? 'bg-amber-900/50 text-amber-400' :
                    l === 'info' ? 'bg-blue-900/50 text-blue-400' :
                    'bg-slate-700 text-white'
                  ) : "text-slate-500 hover:text-slate-300"
                )}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Log List */}
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-5xl mx-auto flex flex-col gap-2">
          {filteredLogs.length === 0 ? (
            <div className="text-center text-slate-600 py-12 flex flex-col items-center gap-4">
              <Terminal className="w-12 h-12 opacity-20" />
              <p>No logs found for current filters.</p>
            </div>
          ) : (
            filteredLogs.map(log => (
              <div 
                key={log.id} 
                className={cn(
                  "p-3 rounded-lg border text-sm flex gap-4",
                  log.level === 'error' ? 'bg-red-950/20 border-red-900/30' :
                  log.level === 'warn' ? 'bg-amber-950/20 border-amber-900/30' :
                  'bg-slate-900/50 border-slate-800'
                )}
              >
                <div className="text-slate-500 shrink-0 w-24">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 })}
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <div className="flex items-start gap-2">
                    <span className={cn(
                      "text-[10px] uppercase font-bold px-1.5 py-0.5 rounded shrink-0",
                      log.level === 'error' ? 'bg-red-900/50 text-red-400' :
                      log.level === 'warn' ? 'bg-amber-900/50 text-amber-400' :
                      'bg-blue-900/50 text-blue-400'
                    )}>
                      {log.level}
                    </span>
                    <span className="text-emerald-400 shrink-0">[{log.source}]</span>
                    <span className={cn(
                      log.level === 'error' ? 'text-red-200' :
                      log.level === 'warn' ? 'text-amber-200' :
                      'text-slate-300'
                    )}>
                      {log.message}
                    </span>
                  </div>
                  {log.details && (
                    <pre className="mt-2 p-2 bg-slate-950 rounded text-xs text-slate-400 overflow-x-auto border border-slate-800/50">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
