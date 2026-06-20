import React, { useState } from 'react';
import { useIoT } from '../context/IoTContext';
import { Mail, Lock, LogIn, Cpu, Eye, EyeOff, Settings, AlertCircle } from 'lucide-react';
import { SettingsModal } from './SettingsModal';

export const LoginView: React.FC = () => {
  const { login, loginDemo } = useIoT();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDemoLoading, setIsDemoLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Email dan Kata Sandi wajib diisi.');
      return;
    }

    setIsLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err: any) {
      setError(err?.message || 'Gagal login. Silakan periksa kembali kredensial Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setIsDemoLoading(true);
    try {
      await loginDemo();
    } catch (err: any) {
      setError(err?.message || 'Gagal menyiapkan akun demo. Silakan periksa koneksi atau konfigurasi Firebase Anda.');
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans" id="login-view-container">
      {/* Dynamic Grid Background/Glow Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.07),transparent_50%)]" />
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-emerald-500/5 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-cyan-700/5 blur-[120px]" />

      <div className="w-full max-w-md z-10">
        {/* App Logo/Branding */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-400 mb-3 shadow-lg shadow-emerald-500/5">
            <Cpu className="h-8 w-8 animate-pulse" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            Firebase IoT Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xs capitalize">
            Sistem kontrol & monitoring node ESP32 secara real-time
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500" />

          <h2 className="text-lg font-bold text-slate-100 mb-1">Masuk ke Sistem</h2>
          <p className="text-xs text-slate-400 mb-6">Silakan masuk menggunakan kredensial Anda</p>

          {error && (
            <div className="mb-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-xl text-xs flex items-start gap-2 max-w-full">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
              <span className="font-semibold leading-normal">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Alamat Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan email"
                  className="w-full bg-slate-950 border border-slate-800 focus:outline-none focus:border-emerald-500/50 py-2.5 pl-10 pr-4 text-slate-200 text-xs rounded-xl transition-all"
                  id="login-email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Kata Sandi</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  className="w-full bg-slate-950 border border-slate-800 focus:outline-none focus:border-emerald-500/50 py-2.5 pl-10 pr-10 text-slate-200 text-xs rounded-xl transition-all"
                  id="login-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 cursor-pointer p-0.5 rounded"
                  id="btn-login-show-password"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading || isDemoLoading}
              className="w-full mt-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-700 text-slate-950 font-black py-2.5 rounded-xl text-xs sm:text-sm tracking-wide shadow-lg shadow-emerald-500/10 border-none transition-all flex items-center justify-center gap-2 cursor-pointer"
              id="btn-login-submit"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <LogIn className="h-4.5 w-4.5" />
                  <span>Masuk Aplikasi</span>
                </>
              )}
            </button>

            {/* Demo Button */}
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={isLoading || isDemoLoading}
              className="w-full bg-slate-850 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 disabled:bg-slate-900 border border-emerald-500/20 hover:border-emerald-500/40 font-extrabold py-2.5 rounded-xl text-xs sm:text-sm tracking-wide shadow-lg hover:shadow-emerald-500/5 transition-all flex items-center justify-center gap-2 cursor-pointer"
              id="btn-login-demo"
            >
              {isDemoLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  <span>Menyiapkan akun demo...</span>
                </>
              ) : (
                <>
                  <Cpu className="h-4.5 w-4.5 animate-pulse" />
                  <span>Coba Akun Demo</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Settings Access */}
          <div className="mt-4 flex items-center justify-center">
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="text-xs text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5 p-1.5 hover:bg-slate-800/50 rounded-lg cursor-pointer"
              id="btn-open-settings-login"
            >
              <Settings className="h-4 w-4" />
              <span>Ganti Konfigurasi Firebase</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[10px] text-slate-600 mt-8 font-mono select-none">
          Firebase IoT Control Dashboard &copy; 2026. Made with Tailwind & React.
        </p>
      </div>

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};
