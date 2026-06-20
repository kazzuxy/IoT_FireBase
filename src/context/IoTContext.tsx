import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  signInWithEmailAndPassword as fbSignIn, 
  signInAnonymously,
  signOut as fbSignOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  ref, 
  onValue, 
  set, 
  update,
  push,
  serverTimestamp
} from 'firebase/database';
import { auth, db, getActiveConfig } from '../firebase';
import { 
  SensorData, 
  RelayData, 
  ModeData, 
  DeviceData, 
  SystemLog, 
  SensorHistoryItem, 
  FirebaseConnectionConfig, 
  LightModeType
} from '../types';

interface IoTContextProps {
  isAuthenticated: boolean;
  isDemoUser: boolean;
  currentUserEmail: string | null;
  isLoadingAuth: boolean;
  firebaseError: string | null;
  sensorData: SensorData;
  relayData: RelayData;
  modeData: ModeData;
  deviceData: DeviceData;
  systemLogs: SystemLog[];
  sensorHistory: SensorHistoryItem[];
  addLog: (message: string, type: SystemLog['type']) => void;
  clearLogs: () => void;
  login: (email: string, password: string) => Promise<void>;
  loginDemo: () => Promise<void>;
  logout: () => Promise<void>;
  resetDemoData: () => Promise<void>;
  updateRelay: (relayId: 'relay1' | 'relay2' | 'relay3' | 'relay4', value: boolean, source?: 'web' | 'voice') => Promise<void>;
  setAllRelays: (value: boolean, source?: 'web' | 'voice') => Promise<void>;
  setLightMode: (mode: LightModeType, source?: 'web' | 'voice') => Promise<void>;
  updateFirebaseConfig: (config: FirebaseConnectionConfig) => void;
  resetFirebaseConfig: () => void;
  currentConfig: FirebaseConnectionConfig;
}

const IoTContext = createContext<IoTContextProps | undefined>(undefined);

export const IoTProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isDemoUser, setIsDemoUser] = useState<boolean>(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  
  // Realtime States initialized to empty / offline defaults as requested
  const [sensorData, setSensorData] = useState<SensorData>({
    temperature: null,
    humidity: null,
    lastUpdate: null
  });
  
  const [relayData, setRelayData] = useState<RelayData>({
    relay1: false,
    relay2: false,
    relay3: false,
    relay4: false
  });
  
  const [modeData, setModeData] = useState<ModeData>({
    name: 'NORMAL',
    active: false
  });
  
  const [deviceData, setDeviceData] = useState<DeviceData>({
    status: 'offline', // default as requested
    ipAddress: '--', // default as requested
    lastSeen: 0
  });
  
  // Storage config
  const [currentConfig, setCurrentConfig] = useState<FirebaseConnectionConfig>(getActiveConfig());
  
  // Realtime Log history
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  
  // Realtime chart sensor history
  const [sensorHistory, setSensorHistory] = useState<SensorHistoryItem[]>([]);

  // Helper to resolve node paths for regular users vs demo users
  const getPath = useCallback((nodeName: string) => {
    if (isDemoUser && auth?.currentUser?.uid) {
      return `demo/${auth.currentUser.uid}/${nodeName}`;
    }
    return nodeName;
  }, [isDemoUser]);

  // Logger manual menggunakan push dan set pada Firebase Realtime Database
  const addLog = useCallback((message: string, type: SystemLog['type'] = 'info') => {
    if (db) {
      const logsPath = isDemoUser && auth?.currentUser?.uid ? `demo/${auth.currentUser.uid}/logs` : 'logs';
      const newLogRef = push(ref(db, logsPath));
      set(newLogRef, {
        message,
        source: type === 'voice' ? 'voice' : 'web',
        timestamp: serverTimestamp()
      }).catch(err => console.error(err));
    } else {
      const newLog: SystemLog = {
        id: Date.now().toString(36),
        timestamp: new Date().toISOString(),
        message,
        type
      };
      setSystemLogs(prev => [newLog, ...prev].slice(0, 50));
    }
  }, [isDemoUser]);

  // Adds a remote log activity to the Realtime Database logs node
  const logActivity = useCallback(async (message: string, source: string = 'web') => {
    if (db) {
      try {
        const logsPath = isDemoUser && auth?.currentUser?.uid ? `demo/${auth.currentUser.uid}/logs` : 'logs';
        const newLogRef = push(ref(db, logsPath));
        await set(newLogRef, {
          message,
          source,
          timestamp: serverTimestamp()
        });
      } catch (e) {
        console.error("Gagal mengirim log ke DB:", e);
      }
    }
  }, [isDemoUser]);

  const clearLogs = useCallback(async () => {
    if (db) {
      try {
        const logsPath = isDemoUser && auth?.currentUser?.uid ? `demo/${auth.currentUser.uid}/logs` : 'logs';
        await set(ref(db, logsPath), null);
        await logActivity("Log sistem dikosongkan.");
      } catch (e: any) {
        console.error(e);
      }
    } else {
      setSystemLogs([]);
    }
  }, [isDemoUser, logActivity]);

  // Auth state observer
  useEffect(() => {
    if (!auth) {
      setFirebaseError("Koneksi Firebase/Auth belum terkonfigurasi. Silakan klik ikon menu Settings di pojok kanan atas untuk mengisi Firebase Config.");
      setIsLoadingAuth(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const isDemo = !!user.isAnonymous;
        setIsDemoUser(isDemo);
        setIsAuthenticated(true);
        setCurrentUserEmail(isDemo ? "Akun Demo" : user.email);
        logActivity(`Sesi pengguna ${isDemo ? "Demo" : user.email} diverifikasi`, 'web');
      } else {
        setIsAuthenticated(false);
        setIsDemoUser(false);
        setCurrentUserEmail(null);
      }
      setIsLoadingAuth(false);
    }, (error) => {
      console.error("Auth observer error:", error);
      setFirebaseError(`Auth error: ${error.message}`);
      setIsLoadingAuth(false);
    });
    return unsubscribe;
  }, [logActivity]);

  // Record sensor history item from live RTDB telemetry reactively
  useEffect(() => {
    if (typeof sensorData.temperature !== 'number' || typeof sensorData.humidity !== 'number') {
      return;
    }

    const timeStr = new Date(sensorData.lastUpdate || Date.now()).toTimeString().split(' ')[0].substring(0, 5);
    setSensorHistory(prev => {
      // Jangan simpan nilai duplikat waktu berturut-turut untuk estetika grafik
      if (prev.length > 0 && prev[prev.length - 1].time === timeStr) {
        return prev;
      }
      const nextHist = [...prev];
      if (nextHist.length >= 15) {
        nextHist.shift();
      }
      nextHist.push({
        time: timeStr,
        temperature: sensorData.temperature as number,
        humidity: sensorData.humidity as number
      });
      return nextHist;
    });
  }, [sensorData.temperature, sensorData.humidity, sensorData.lastUpdate]);

  // Reset states to default values when not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setSensorData({
        temperature: null,
        humidity: null,
        lastUpdate: null
      });
      setRelayData({
        relay1: false,
        relay2: false,
        relay3: false,
        relay4: false
      });
      setModeData({
        name: 'NORMAL',
        active: false
      });
      setDeviceData({
        status: 'offline',
        ipAddress: '--',
        lastSeen: 0
      });
      setSystemLogs([]);
      setSensorHistory([]);
    }
  }, [isAuthenticated]);

  // Subscribe to Real Realtime Database Nodes using onValue
  useEffect(() => {
    if (!db || !isAuthenticated) {
      return;
    }

    setFirebaseError(null);

    // 1. Subscribe to sensor node
    const sensorRef = ref(db, getPath('sensor'));
    const unsubSensor = onValue(sensorRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        setSensorData({
          temperature: typeof val.temperature === 'number' ? val.temperature : null,
          humidity: typeof val.humidity === 'number' ? val.humidity : null,
          lastUpdate: val.lastUpdate || null
        });
      } else {
        if (isDemoUser && auth?.currentUser?.uid) {
          const uid = auth.currentUser.uid;
          set(ref(db, `demo/${uid}`), {
            sensor: {
              temperature: 27.5,
              humidity: 70,
              lastUpdate: serverTimestamp()
            },
            relay: {
              relay1: false,
              relay2: false,
              relay3: false,
              relay4: false
            },
            mode: {
              name: "NORMAL",
              active: false
            },
            device: {
              status: "demo",
              ipAddress: "--",
              lastSeen: serverTimestamp()
            }
          }).catch(err => console.error("Initial demo setup failure:", err));
        } else {
          setSensorData({
            temperature: null,
            humidity: null,
            lastUpdate: null
          });
        }
      }
    }, (err) => {
      console.error("Sensor subscribe error:", err);
      setFirebaseError(`Koneksi Realtime Database gagal: ${err.message}`);
    });

    // 2. Subscribe to relay node
    const relayRef = ref(db, getPath('relay'));
    const unsubRelay = onValue(relayRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        setRelayData({
          relay1: !!val.relay1,
          relay2: !!val.relay2,
          relay3: !!val.relay3,
          relay4: !!val.relay4
        });
      } else {
        setRelayData({
          relay1: false,
          relay2: false,
          relay3: false,
          relay4: false
        });
      }
    }, (err) => {
      console.error("Relay subscribe error:", err);
    });

    // 3. Subscribe to mode node
    const modeRef = ref(db, getPath('mode'));
    const unsubMode = onValue(modeRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        setModeData({
          name: val.name || 'NORMAL',
          active: !!val.active
        });
      } else {
        setModeData({
          name: 'NORMAL',
          active: false
        });
      }
    }, (err) => {
      console.error("Mode subscribe error:", err);
    });

    // 4. Subscribe to device node
    const deviceRef = ref(db, getPath('device'));
    const unsubDevice = onValue(deviceRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        setDeviceData({
          status: val.status || 'offline',
          ipAddress: val.ipAddress || '--',
          lastSeen: val.lastSeen || 0
        });
      } else {
        setDeviceData({
          status: 'offline',
          ipAddress: '--',
          lastSeen: 0
        });
      }
    }, (err) => {
      console.error("Device subscribe error:", err);
    });

    // 5. Subscribe to logs node matching the requested hierarchy logs/idLog/[message, source, timestamp]
    const logsRef = ref(db, getPath('logs'));
    const unsubLogs = onValue(logsRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        const parsedLogs = Object.entries(val).map(([key, item]: [string, any]) => {
          let dateObj = new Date();
          if (typeof item.timestamp === 'number') {
            dateObj = new Date(item.timestamp);
          } else if (item.timestamp) {
            dateObj = new Date(item.timestamp);
          }
          return {
            id: key,
            timestamp: dateObj.toISOString(),
            message: item.message || '',
            type: item.source === 'web' ? 'success' : (item.source === 'voice' ? 'voice' : 'info') as any
          };
        });
        parsedLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setSystemLogs(parsedLogs.slice(0, 50));
      } else {
        setSystemLogs([]);
      }
    }, (err) => {
      console.error("Logs subscribe error:", err);
    });

    return () => {
      unsubSensor();
      unsubRelay();
      unsubMode();
      unsubDevice();
      unsubLogs();
    };
  }, [isAuthenticated, isDemoUser, getPath]);



  // Auth Actions
  const login = async (email: string, password: string) => {
    if (!auth) throw new Error("Koneksi Firebase Auth tidak terinisialisasi. Silakan simpan Firebase Config terlebih dahulu.");
    try {
      await fbSignIn(auth, email, password);
    } catch (err: any) {
      let IndonesianErrMsg = err.message;
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
        IndonesianErrMsg = 'Kata sandi atau email salah.';
      } else if (err.code === 'auth/invalid-email') {
        IndonesianErrMsg = 'Format email tidak valid.';
      }
      throw new Error(IndonesianErrMsg);
    }
  };

  const loginDemo = async () => {
    if (!auth) throw new Error("Koneksi Firebase Auth tidak terinisialisasi. Silakan simpan Firebase Config terlebih dahulu.");
    try {
      await signInAnonymously(auth);
    } catch (err: any) {
      console.error("Gagal login demo:", err);
      throw new Error(`Gagal menyiapkan akun demo: ${err.message}`);
    }
  };

  const logout = async () => {
    if (!auth) return;
    try {
      await fbSignOut(auth);
      setIsAuthenticated(false);
      setIsDemoUser(false);
      setCurrentUserEmail(null);
    } catch (err: any) {
      console.error(err);
    }
  };

  const resetDemoData = async () => {
    if (!db || !isDemoUser || !auth?.currentUser?.uid) return;
    const uid = auth.currentUser.uid;
    try {
      await set(ref(db, `demo/${uid}`), {
        sensor: {
          temperature: 27.5,
          humidity: 70,
          lastUpdate: serverTimestamp()
        },
        relay: {
          relay1: false,
          relay2: false,
          relay3: false,
          relay4: false
        },
        mode: {
          name: "NORMAL",
          active: false
        },
        device: {
          status: "demo",
          ipAddress: "--",
          lastSeen: serverTimestamp()
        },
        logs: null
      });
      addLog("Data demo berhasil di-reset ke kondisi awal.", "info");
    } catch (err) {
      console.error("Gagal meriset data demo:", err);
    }
  };

  // Relay Controls mapping to relay/relay1-4 and adding activity to logs node
  const updateRelay = async (relayId: 'relay1' | 'relay2' | 'relay3' | 'relay4', value: boolean, source: 'web' | 'voice' = 'web') => {
    const lampNames = {
      relay1: 'Relay 1 (Lampu Teras)',
      relay2: 'Relay 2 (Lampu Tengah)',
      relay3: 'Relay 3 (Lampu Kamar)',
      relay4: 'Relay 4 (Lampu Belakang)'
    };
    
    // Stop modes if running prior to changing relays
    if (modeData.active) {
      await setLightMode('NORMAL', source);
    }

    const valueStr = value ? 'ON' : 'OFF';

    if (db) {
      try {
        await set(ref(db, getPath(`relay/${relayId}`)), value);
        await logActivity(`Perintah: mengubah ${lampNames[relayId]} menjadi ${valueStr}`, source);
      } catch (e: any) {
        console.error(e);
      }
    }
  };

  // Turn all relays ON/OFF
  const setAllRelays = async (value: boolean, source: 'web' | 'voice' = 'web') => {
    if (modeData.active) {
      await setLightMode('NORMAL', source);
    }

    const stateStr = value ? 'ON' : 'OFF';
    const nextRelays = {
      relay1: value,
      relay2: value,
      relay3: value,
      relay4: value
    };

    if (db) {
      try {
        await update(ref(db, getPath('relay')), nextRelays);
        await logActivity(`Perintah: mengubah semua relay menjadi ${stateStr}`, source);
      } catch (e: any) {
        console.error(e);
      }
    }
  };

  // Light Mode management with modes writing to Realtime Database mode/name and mode/active
  const setLightMode = async (mode: LightModeType, source: 'web' | 'voice' = 'web') => {
    const isActive = mode !== 'NORMAL';
    const nextModeState = {
      name: mode,
      active: isActive
    };

    if (db) {
      try {
        await update(ref(db, getPath('mode')), nextModeState);
        // Clean relays if normalized
        if (mode === 'NORMAL') {
          await update(ref(db, getPath('relay')), {
            relay1: false,
            relay2: false,
            relay3: false,
            relay4: false
          });
          await logActivity(`Perintah: menonaktifkan efek lampu (NORMAL)`, source);
        } else {
          await logActivity(`Perintah: mengaktifkan efek lampu ${mode}`, source);
        }
      } catch (e: any) {
        console.error(e);
      }
    }
  };

  const updateFirebaseConfig = (config: FirebaseConnectionConfig) => {
    try {
      localStorage.setItem('firebase_iot_config', JSON.stringify(config));
      setCurrentConfig(config);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (e) {
      console.error(e);
    }
  };

  const resetFirebaseConfig = () => {
    localStorage.removeItem('firebase_iot_config');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <IoTContext.Provider value={{
      isAuthenticated,
      isDemoUser,
      currentUserEmail,
      isLoadingAuth,
      firebaseError,
      sensorData,
      relayData,
      modeData,
      deviceData,
      systemLogs,
      sensorHistory,
      addLog,
      clearLogs,
      login,
      loginDemo,
      logout,
      resetDemoData,
      updateRelay,
      setAllRelays,
      setLightMode,
      updateFirebaseConfig,
      resetFirebaseConfig,
      currentConfig
    }}>
      {children}
    </IoTContext.Provider>
  );
};

export const useIoT = () => {
  const context = useContext(IoTContext);
  if (context === undefined) {
    throw new Error('useIoT harus dijalankan di dalam IoTProvider');
  }
  return context;
};
