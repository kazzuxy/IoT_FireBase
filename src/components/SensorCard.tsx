import React, { useState, useEffect } from 'react';
import { useIoT } from '../context/IoTContext';
import { Thermometer, Droplets, Cpu, Wifi, WifiOff } from 'lucide-react';

export const SensorCard: React.FC = () => {
  const { sensorData, deviceData } = useIoT();
  const [timestampStr, setTimestampStr] = useState<string>('00:00:00 WIB');

  // Format real-time clock timestamp or show empty state if lastUpdate not available
  useEffect(() => {
    if (!sensorData.lastUpdate) {
      setTimestampStr('--:--:--');
      return;
    }
    const dateVal = new Date(sensorData.lastUpdate);
    const timePart = dateVal.toTimeString().split(' ')[0];
    setTimestampStr(`${timePart} WIB`);
  }, [sensorData.lastUpdate]);

  // Safe percentage constraints for tracking bars
  const tempPercent = typeof sensorData.temperature === 'number' ? Math.min(100, Math.max(5, ((sensorData.temperature - 10) / 35) * 100)) : 0;
  const humPercent = typeof sensorData.humidity === 'number' ? Math.min(100, Math.max(5, sensorData.humidity)) : 0;

  return (
    <div className="grid gap-6 w-full" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }} id="realtime-sensor-metrics">
      {/* 1. Temperature Widget */}
      <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 flex flex-col justify-between shadow-sm min-w-0 overflow-hidden" id="temp-widget">
        <div className="flex justify-between items-start mb-2 gap-2 min-w-0">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">Suhu</p>
          <Thermometer className="h-5 w-5 text-orange-400 shrink-0" />
        </div>
        <div className="flex items-baseline gap-1 min-w-0 overflow-hidden">
          <span className="text-3xl sm:text-4xl font-light text-white tracking-tight truncate leading-none">
            {typeof sensorData.temperature === 'number' ? sensorData.temperature.toFixed(1) : '--'}
          </span>
          {typeof sensorData.temperature === 'number' && <span className="text-lg sm:text-xl text-slate-500 font-medium shrink-0">°C</span>}
        </div>
        <div className="mt-4 h-1 w-full bg-slate-800 rounded-full overflow-hidden shrink-0">
          <div 
            className="h-full bg-orange-500 transition-all duration-500" 
            style={{ width: `${tempPercent}%` }}
          />
        </div>
      </div>

      {/* 2. Humidity Widget */}
      <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 flex flex-col justify-between shadow-sm min-w-0 overflow-hidden" id="hum-widget">
        <div className="flex justify-between items-start mb-2 gap-2 min-w-0">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">Kelembapan</p>
          <Droplets className="h-5 w-5 text-cyan-400 shrink-0" />
        </div>
        <div className="flex items-baseline gap-1 min-w-0 overflow-hidden">
          <span className="text-3xl sm:text-4xl font-light text-white tracking-tight truncate leading-none">
            {typeof sensorData.humidity === 'number' ? sensorData.humidity.toFixed(0) : '--'}
          </span>
          {typeof sensorData.humidity === 'number' && <span className="text-lg sm:text-xl text-slate-500 font-medium shrink-0">%</span>}
        </div>
        <div className="mt-4 h-1 w-full bg-slate-800 rounded-full overflow-hidden shrink-0">
          <div 
            className="h-full bg-cyan-500 transition-all duration-500" 
            style={{ width: `${humPercent}%` }}
          />
        </div>
      </div>

      {/* 3. Last Update Widget or Device State Widget */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-between gap-3 min-w-0 overflow-hidden" id="last-update-status-panel">
        <div className="flex items-center justify-between border-b border-slate-800/50 pb-2.5 gap-2 min-w-0">
          <span className="text-xs text-slate-400 font-semibold truncate">Status ESP32</span>
          <div className="flex items-center gap-1.5 shrink-0 min-w-0">
            <span className={`h-2 w-2 rounded-full block shrink-0 ${
              deviceData.status === 'online' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-rose-500'
            }`} />
            <span className={`text-[10px] font-mono tracking-wider font-bold truncate ${
              deviceData.status === 'online' ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {deviceData.status.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between py-1 gap-2 min-w-0">
          <span className="text-xs text-slate-400 truncate">Pembaruan</span>
          <span className="text-xs font-mono text-cyan-500 uppercase tracking-tighter font-semibold truncate">
            {timestampStr}
          </span>
        </div>
      </div>
    </div>
  );
};
