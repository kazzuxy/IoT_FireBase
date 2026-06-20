import React from 'react';
import { useIoT } from '../context/IoTContext';
import { Lightbulb, Sparkles } from 'lucide-react';

export const RelayControls: React.FC = () => {
  const { relayData, modeData, updateRelay, setAllRelays, setLightMode } = useIoT();

  const relays = [
    { id: 'relay1' as const, num: 1, title: 'Relay 1', name: 'Lampu Teras', active: relayData.relay1 },
    { id: 'relay2' as const, num: 2, title: 'Relay 2', name: 'Lampu Tengah', active: relayData.relay2 },
    { id: 'relay3' as const, num: 3, title: 'Relay 3', name: 'Lampu Kamar', active: relayData.relay3 },
    { id: 'relay4' as const, num: 4, title: 'Relay 4', name: 'Lampu Belakang', active: relayData.relay4 }
  ];

  const handleToggle = (id: 'relay1' | 'relay2' | 'relay3' | 'relay4', active: boolean) => {
    if (modeData.id !== 'NORMAL' && modeData.active) {
      // If a lighting variation is active, do not block but suggest stopping it or stop it automatically so user has responsive feedback
      setLightMode('NORMAL');
    }
    updateRelay(id, active);
  };

  return (
    <div className="flex flex-col h-full justify-between" id="relay-controls-section">
      {/* Upper Relay Control Panel Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-200">Relay Control Panel</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setAllRelays(true)}
              className="px-3 py-1 bg-emerald-600/20 text-emerald-400 border border-emerald-600/50 rounded-lg text-[10px] font-bold hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer"
              id="btn-all-relays-on"
            >
              NYALAKAN SEMUA
            </button>
            <button
              onClick={() => setAllRelays(false)}
              className="px-3 py-1 bg-red-600/20 text-red-400 border border-red-600/50 rounded-lg text-[10px] font-bold hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
              id="btn-all-relays-off"
            >
              MATIKAN SEMUA
            </button>
          </div>
        </div>

        {/* 4 Cards Grid - Flex/Grid Arrangement matching High Density Design exactly */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {relays.map((relay) => (
            <div
              key={relay.id}
              onClick={() => handleToggle(relay.id, !relay.active)}
              className={`p-4 rounded-xl cursor-pointer transition-all select-none duration-200 ${
                relay.active
                  ? 'bg-slate-950 border border-cyan-500/30 ring-1 ring-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.05)]'
                  : 'bg-slate-950 border border-slate-800 hover:border-slate-700'
              }`}
              id={`relay-card-${relay.id}`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className={`p-2 rounded-lg transition-colors ${
                  relay.active ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-500'
                }`}>
                  <Lightbulb className="h-5 w-5" />
                </div>
                <span className={`text-[10px] font-bold uppercase ${
                  relay.active ? 'text-cyan-400' : 'text-slate-600'
                }`}>
                  {relay.active ? 'ON' : 'OFF'}
                </span>
              </div>

              <p className={`text-xs font-medium transition-colors ${
                relay.active ? 'text-slate-200' : 'text-slate-400'
              }`}>{relay.title}</p>
              <p className="text-[9px] text-slate-500 mb-4 truncate">{relay.name}</p>

              {/* Slider switch visual element */}
              <div className={`h-6 w-12 rounded-full relative p-1 transition-colors duration-200 ${
                relay.active ? 'bg-cyan-600' : 'bg-slate-800'
              }`}>
                <div className={`h-4 w-4 bg-white rounded-full transition-all duration-200 ${
                  relay.active ? 'ml-auto' : 'ml-0'
                }`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lighting Animation / Effects panel matched exactly list structure of design */}
      <div className="mt-6 p-4 bg-slate-950 rounded-xl border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <Sparkles className="h-3.5 w-3.5 text-slate-400 animate-pulse" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Light Effects</span>
          </div>
          <div className="flex gap-2 flex-1">
            <button
              onClick={() => setLightMode('KIRI_KANAN')}
              className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all border cursor-pointer ${
                modeData.name === 'KIRI_KANAN' && modeData.active
                  ? 'bg-violet-600/20 text-violet-400 border-violet-500 shadow-lg shadow-violet-600/10'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              KIRI KANAN
            </button>
            <button
              onClick={() => setLightMode('STROBO')}
              className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all border cursor-pointer ${
                modeData.name === 'STROBO' && modeData.active
                  ? 'bg-purple-600/20 text-purple-400 border-purple-500 shadow-lg shadow-purple-600/10'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              STROBO
            </button>
            <button
              onClick={() => setLightMode('NORMAL')}
              className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                modeData.name === 'NORMAL' || !modeData.active
                  ? 'bg-slate-800/80 text-slate-400 border border-slate-700'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
              }`}
            >
              NORMAL / STOP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
