import React, { useState } from 'react';
import { useIoT } from '../context/IoTContext';
import { Terminal, Trash2, Search } from 'lucide-react';

export const LogHistory: React.FC = () => {
  const { systemLogs, clearLogs } = useIoT();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');

  // Filter and search
  const filteredLogs = systemLogs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.timestamp.includes(searchTerm);
    const matchesType = filterType === 'all' || log.type === filterType;
    return matchesSearch && matchesType;
  });

  const getLogSpanStyle = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-emerald-400 font-medium';
      case 'warning':
        return 'text-amber-400 font-medium';
      case 'error':
        return 'text-red-400 font-medium';
      case 'voice':
        return 'text-cyan-400 font-medium';
      default:
        return 'text-indigo-400 font-medium';
    }
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 flex flex-col h-full overflow-hidden" id="system-logs-widget">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-200">Aktivitas Sistem</h3>
        <div className="flex gap-2 items-center">
          {/* Subtle search/filter row */}
          <div className="relative">
            <Search className="absolute left-2 top-1.5 h-3 w-3 text-slate-500" />
            <input
              type="text"
              placeholder="Cari..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950 text-slate-200 pl-7 pr-2 py-1 rounded-md text-[10px] w-24 border border-slate-850 focus:outline-none focus:border-cyan-500/50"
              id="input-search-logs"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-950 text-slate-400 text-[10px] py-1 px-1.5 rounded-md border border-slate-850 focus:outline-none cursor-pointer outline-none capitalize"
            id="select-filter-log-type"
          >
            <option value="all">Semua</option>
            <option value="success">Sukses</option>
            <option value="voice">Suara</option>
            <option value="info">Info</option>
            <option value="warning">Suhu</option>
          </select>
          
          <button
            onClick={clearLogs}
            className="p-1 rounded-md text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent transition-all"
            id="btn-clear-logs"
            title="Hapus semua log"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* High Density Terminal Display */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1" id="terminal-console">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log) => {
            // Extrapolate subject and action to render like the design template:
            // "User menyalakan Relay 1 (Voice Control)"
            // "System mode diubah ke NORMAL"
            const timePrefix = log.timestamp.substring(11, 16) || '12:00';
            
            // Format message to highlight source appropriately
            let userLabel = 'System';
            let formattedMessage = log.message;
            if (log.message.includes('Perintah:')) {
              userLabel = 'User';
              formattedMessage = log.message.replace('Perintah:', '').trim();
            } else if (log.message.startsWith('Relay')) {
              userLabel = 'System';
            } else if (log.message.toLowerCase().includes('berhasil') || log.message.toLowerCase().includes('terhubung')) {
              userLabel = 'ESP32';
            }

            return (
              <div key={log.id} className="flex gap-3 text-xs leading-relaxed border-b border-slate-850 pb-2 last:border-none last:pb-0">
                <span className="text-slate-500 font-mono shrink-0">{timePrefix}</span>
                <p className="text-slate-300">
                  <span className={`${getLogSpanStyle(log.type)} mr-1.5`}>{userLabel}</span>
                  {formattedMessage}
                </p>
              </div>
            );
          })
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-1 py-8">
            <Terminal className="h-6 w-6 text-slate-700 stroke-1" />
            <p className="text-[11px]">Belum ada aktivitas</p>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-800">
        <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
          <span>v2.4.0-stable</span>
          <span className="italic">Database: Firebase Realtime Database</span>
        </div>
      </div>
    </div>
  );
};
