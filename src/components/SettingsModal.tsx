import React, { useState } from 'react';
import { useIoT } from '../context/IoTContext';
import { Settings, X, RefreshCw, Key, Database, Cpu, Globe, Info } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { currentConfig, updateFirebaseConfig, resetFirebaseConfig } = useIoT();
  
  const [apiKey, setApiKey] = useState<string>(currentConfig.apiKey || '');
  const [databaseURL, setDatabaseURL] = useState<string>(currentConfig.databaseURL || '');
  const [authDomain, setAuthDomain] = useState<string>(currentConfig.authDomain || '');
  const [projectId, setProjectId] = useState<string>(currentConfig.projectId || '');
  const [storageBucket, setStorageBucket] = useState<string>(currentConfig.storageBucket || '');
  const [messagingSenderId, setMessagingSenderId] = useState<string>(currentConfig.messagingSenderId || '');
  const [appId, setAppId] = useState<string>(currentConfig.appId || '');

  const [saving, setSaving] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!apiKey.trim()) {
      setValidationError('API Key Firebase wajib diisi.');
      return;
    }
    if (!databaseURL.trim()) {
      setValidationError('Realtime Database URL wajib diisi.');
      return;
    }
    if (!databaseURL.startsWith('https://')) {
      setValidationError('Database URL harus berupa protokol HTTPS aman.');
      return;
    }
    if (!projectId.trim()) {
      setValidationError('Project ID Firebase wajib diisi.');
      return;
    }

    setSaving(true);
    updateFirebaseConfig({
      apiKey: apiKey.trim(),
      databaseURL: databaseURL.trim(),
      authDomain: authDomain.trim() || `${projectId.trim()}.firebaseapp.com`,
      projectId: projectId.trim(),
      storageBucket: storageBucket.trim() || `${projectId.trim()}.appspot.com`,
      messagingSenderId: messagingSenderId.trim(),
      appId: appId.trim()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fade-in" id="settings-modal bg">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-emerald-400" />
            <h3 className="font-semibold text-slate-100 text-base">Konfigurasi Firebase SDK</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 hover:bg-slate-800 p-1 rounded-lg cursor-pointer transition-colors"
            id="btn-close-settings-modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1">
          {/* Instructions Box */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-start gap-2.5 text-xs">
            <Info className="h-5 w-5 text-teal-400 shrink-0 mt-0.5" />
            <div className="text-slate-400 leading-relaxed">
              <span className="font-bold text-slate-200">Menghubungkan Alat Firebase Asli:</span>
              <p className="mt-1">
                Masukkan kredensial modular Firebase milik Anda. Aplikasi ini menggunakan <span className="text-slate-200 font-bold">Authentication (Email & Password)</span> serta <span className="text-slate-200 font-bold">Realtime Database</span> untuk mensinkronkan sensor dsb. secara langsung.
              </p>
              <p className="mt-1 font-semibold text-emerald-400">
                • Status Aktif: {currentConfig.apiKey === 'ISI_API_KEY' ? 'BELUM TERKONFIGURASI' : 'TERKONEKSI KE DATABASE ANDA'}
              </p>
            </div>
          </div>

          {validationError && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs font-semibold font-mono">
              Galat: {validationError}
            </div>
          )}

          {/* Real Input Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Database className="h-3.5 w-3.5 text-amber-500" />
                Firebase Realtime Database URL <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={databaseURL}
                onChange={(e) => setDatabaseURL(e.target.value)}
                placeholder="https://your-project-default-rtdb.firebaseio.com"
                className="w-full bg-slate-950 border border-slate-800 focus:outline-none focus:border-emerald-500/50 py-2 px-3 text-slate-200 text-xs rounded-xl font-mono"
                id="cfg-database-url"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Key className="h-3.5 w-3.5 text-emerald-500" />
                API Key <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                required
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSyA1..."
                className="w-full bg-slate-950 border border-slate-800 focus:outline-none focus:border-emerald-500/50 py-2 px-3 text-slate-200 text-xs rounded-xl font-mono"
                id="cfg-api-key"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Cpu className="h-3.5 w-3.5 text-blue-500" />
                Project ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                placeholder="your-project-id"
                className="w-full bg-slate-950 border border-slate-800 focus:outline-none focus:border-emerald-500/50 py-2 px-3 text-slate-200 text-xs rounded-xl font-mono"
                id="cfg-project-id"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Globe className="h-3.5 w-3.5 text-teal-400" />
                Auth Domain
              </label>
              <input
                type="text"
                value={authDomain}
                onChange={(e) => setAuthDomain(e.target.value)}
                placeholder="your-project-id.firebaseapp.com"
                className="w-full bg-slate-950 border border-slate-800 focus:outline-none focus:border-emerald-500/50 py-2 px-3 text-slate-200 text-xs rounded-xl font-mono"
                id="cfg-auth-domain"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">App ID</label>
              <input
                type="text"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                placeholder="1:123456789012:web:abcdef"
                className="w-full bg-slate-950 border border-slate-800 focus:outline-none focus:border-emerald-500/50 py-2 px-3 text-slate-200 text-xs rounded-xl font-mono"
                id="cfg-app-id"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Messaging Sender ID</label>
              <input
                type="text"
                value={messagingSenderId}
                onChange={(e) => setMessagingSenderId(e.target.value)}
                placeholder="123456789012"
                className="w-full bg-slate-950 border border-slate-800 focus:outline-none focus:border-emerald-500/50 py-2 px-3 text-slate-200 text-xs rounded-xl font-mono"
                id="cfg-sender-id"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Storage Bucket</label>
              <input
                type="text"
                value={storageBucket}
                onChange={(e) => setStorageBucket(e.target.value)}
                placeholder="your-project-id.appspot.com"
                className="w-full bg-slate-950 border border-slate-800 focus:outline-none focus:border-emerald-500/50 py-2 px-3 text-slate-200 text-xs rounded-xl font-mono"
                id="cfg-storage-bucket"
              />
            </div>
          </div>

          {/* Controls Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
            {/* Reset button */}
            <button
              type="button"
              onClick={() => {
                if (confirm('Konfigurasi akan dikosongkan ke status awal. Aplikasi akan dimuat ulang. Lanjutkan?')) {
                  resetFirebaseConfig();
                }
              }}
              className="w-full sm:w-auto text-center px-4 py-2 border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
              id="btn-reset-to-sim"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reset Konfigurasi
            </button>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              {/* Secondary Close */}
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial text-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                id="btn-cancel-settings"
              >
                Batal
              </button>

              {/* Main Save */}
              <button
                type="submit"
                disabled={saving}
                className="flex-1 sm:flex-initial text-center px-5 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-700 text-slate-950 font-extrabold rounded-xl text-xs shadow-md transition-all cursor-pointer"
                id="btn-apply-settings"
              >
                {saving ? 'Menyimpan...' : 'Terapkan & Reload'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
