import React, { useState } from 'react';
import { useIoT } from '../context/IoTContext';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';

export const SensorCharts: React.FC = () => {
  const { sensorHistory } = useIoT();
  const [activeTab, setActiveTab] = useState<'both' | 'temp' | 'hum'>('both');

  // Custom styling for the charts index tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg shadow-xl font-mono text-[10px]">
          <p className="text-slate-500 font-bold mb-1 border-b border-slate-800 pb-1">Time: {label}</p>
          {payload.map((pld: any) => (
            <div key={pld.dataKey} className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: pld.color }} />
              <span className="text-slate-400 capitalize">{pld.name === 'temperature' ? 'Suhu' : 'Kelembapan'}:</span>
              <span className="font-bold text-slate-100">
                {pld.value} {pld.name === 'temperature' ? '°C' : '%'}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 flex flex-col h-full relative" id="sensor-history-widget">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-slate-200">History Grafik Sensor</h3>
        <div className="flex gap-4 items-center">
          {/* Mini Legends matching High Density Design */}
          <div className="flex gap-3 text-[10px] text-slate-400 select-none">
            <span 
              onClick={() => setActiveTab(activeTab === 'temp' ? 'both' : 'temp')} 
              className={`flex items-center cursor-pointer transition-opacity ${activeTab === 'hum' ? 'opacity-30' : 'opacity-100'}`}
            >
              <span className="w-2.5 h-2.5 bg-orange-500 rounded-full mr-1.5 inline-block"></span>
              Temperature
            </span>
            <span 
              onClick={() => setActiveTab(activeTab === 'hum' ? 'both' : 'hum')} 
              className={`flex items-center cursor-pointer transition-opacity ${activeTab === 'temp' ? 'opacity-30' : 'opacity-100'}`}
            >
              <span className="w-2.5 h-2.5 bg-cyan-500 rounded-full mr-1.5 inline-block"></span>
              Humidity
            </span>
          </div>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="flex-1 w-full min-h-[160px] font-mono">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={sensorHistory}
            margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#f97316" stopOpacity={0.0}/>
              </linearGradient>
              <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
            
            <XAxis 
              dataKey="time" 
              stroke="#475569" 
              fontSize={9} 
              tickLine={false} 
              axisLine={false}
            />
            
            <YAxis 
              stroke="#475569" 
              fontSize={9} 
              tickLine={false} 
              axisLine={false}
              domain={['auto', 'auto']}
            />
            
            <Tooltip content={<CustomTooltip />} />

            {(activeTab === 'both' || activeTab === 'temp') && (
              <Area 
                name="temperature"
                type="monotone" 
                dataKey="temperature" 
                stroke="#f97316" 
                strokeWidth={2.5}
                fillOpacity={1} 
                fill="url(#colorTemp)" 
              />
            )}

            {(activeTab === 'both' || activeTab === 'hum') && (
              <Area 
                name="humidity"
                type="monotone" 
                dataKey="humidity" 
                stroke="#06b6d4" 
                strokeWidth={2.5}
                fillOpacity={1} 
                fill="url(#colorHum)" 
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {sensorHistory.length === 0 && (
        <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center text-slate-400 text-xs rounded-xl">
          Menunggu data sensor
        </div>
      )}
    </div>
  );
};
