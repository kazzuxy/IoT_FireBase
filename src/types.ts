export type DeviceStatus = 'online' | 'offline';
export type LightModeType = 'NORMAL' | 'KIRI_KANAN' | 'STROBO';

export interface SensorData {
  temperature?: number | null;
  humidity?: number | null;
  lastUpdate?: string | number | null;
}

export interface RelayData {
  relay1: boolean;
  relay2: boolean;
  relay3: boolean;
  relay4: boolean;
}

export interface ModeData {
  name: LightModeType;
  active: boolean;
}

export interface DeviceData {
  status: DeviceStatus;
  ipAddress: string;
  lastSeen: string | number;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'voice';
}

export interface SensorHistoryItem {
  time: string;
  temperature: number;
  humidity: number;
}

export interface FirebaseConnectionConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}
