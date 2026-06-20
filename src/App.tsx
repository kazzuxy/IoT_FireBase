import { useState, useEffect } from 'react';
import { IoTProvider, useIoT } from './context/IoTContext';
import { SensorCard } from './components/SensorCard';
import { RelayControls } from './components/RelayControls';
import { SensorCharts } from './components/SensorCharts';
import { VoiceController } from './components/VoiceController';
import { LogHistory } from './components/LogHistory';
import { LoginView } from './components/LoginView';
import { SettingsModal } from './components/SettingsModal';
import { 
  Menu, X, LogOut, Cpu, Settings, Terminal, ShieldAlert,
  LayoutDashboard, CheckCircle, Wifi
} from 'lucide-react';

function DashboardShell() {
  const { 
    isAuthenticated, 
    isDemoUser,
    currentUserEmail, 
    deviceData, 
    logout, 
    resetDemoData,
    isLoadingAuth,
    firebaseError
  } = useIoT();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Monitor screen width to auto-collapse sidebar on smaller layouts
  useEffect(() => {
    const checkMobileWidth = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarCollapsed(true);
      } else {
        setIsSidebarCollapsed(false);
      }
    };
    checkMobileWidth();
    window.addEventListener('resize', checkMobileWidth);
    return () => window.removeEventListener('resize', checkMobileWidth);
  }, []);

  // Handle body scroll locking when mobile sidebar is open
  useEffect(() => {
    if (isMobile && isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, isMobileMenuOpen]);

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-sans">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-sm font-semibold tracking-wide text-slate-300">Menghubungkan ke IoT Core...</span>
      </div>
    );
  }

  // Auth Guard
  if (!isAuthenticated) {
    return <LoginView />;
  }

  const showLabels = isMobile ? isMobileMenuOpen : !isSidebarCollapsed;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-950 font-sans text-slate-200" id="app-shell">
      {/* Backdrop for Mobile Sidebar Drawer */}
      {isMobile && isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/55 md:hidden"
          style={{ zIndex: 1100, background: 'rgba(0, 0, 0, 0.55)' }}
          id="mobile-sidebar-backdrop"
        />
      )}

      {/* SIDEBAR */}
      <aside 
        className={`sidebar flex flex-col justify-between bg-slate-900 border-r border-slate-800 shrink-0 ${
          isMobile
            ? isMobileMenuOpen ? 'open mobile-open' : ''
            : `h-screen sticky top-0 transition-all duration-300 ${isSidebarCollapsed ? 'collapsed w-20' : 'w-64'}`
        }`}
        id="app-sidebar"
      >
        <div className="flex flex-col">
          {/* Logo Section */}
          <div className="flex h-16 items-center px-6 border-b border-slate-800 justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="h-8 w-8 rounded bg-cyan-500 flex items-center justify-center shrink-0">
                <Cpu className="h-4 w-4 text-slate-900 animate-pulse" />
              </div>
              {showLabels && (
                <span className="brand-text font-bold tracking-tight text-slate-100 uppercase animate-fade-in text-sm select-none">
                  FIREBASE IoT
                </span>
              )}
            </div>

            {/* mobile close trigger */}
            {isMobile && (
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer p-0.5"
                id="btn-close-mobile-sidebar"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          {/* Sidebar Nav Items */}
          <nav className="space-y-1 p-4">
            <button
              onClick={() => {
                if (isMobile) {
                  setIsMobileMenuOpen(false);
                }
              }}
              className="w-full rounded bg-slate-800 px-3 py-2 text-sm font-medium text-cyan-400 flex items-center border-none text-left cursor-pointer"
              id="sidebar-nav-dashboard"
            >
              <div className="w-1 h-4 bg-cyan-400 rounded-full mr-3 shrink-0"></div>
              {showLabels && <span className="menu-label">Dashboard</span>}
            </button>

            <button
              onClick={() => {
                setIsSettingsOpen(true);
                if (isMobile) {
                  setIsMobileMenuOpen(false);
                }
              }}
              className="w-full px-3 py-2 text-sm font-medium text-slate-400 hover:text-slate-100 cursor-pointer flex items-center border-none bg-transparent text-left"
              id="sidebar-nav-settings"
            >
              <div className="w-1 h-4 bg-transparent mr-3 shrink-0"></div>
              {showLabels && <span className="menu-label">Settings</span>}
            </button>
          </nav>
        </div>

        {/* Dynamic Device Status block matched inside Sidebar */}
        <div className="mt-auto flex flex-col">
          {showLabels && (
            <div className="device-status-text m-4 rounded-lg bg-slate-950 p-4 border border-slate-800 animate-fade-in">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Device Status</span>
                <span className={`flex h-2 w-2 rounded-full ${
                  deviceData.status === 'online' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-rose-500'
                }`} />
              </div>
              
              <div className="text-xs font-mono">
                <div className="flex justify-between mb-1">
                  <span className="text-slate-500">Name:</span>
                  <span className="text-slate-300 truncate max-w-[100px]">ESP32</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">IP:</span>
                  <span className="text-slate-300">{deviceData.ipAddress || '--'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Logout Trigger Button */}
          <button 
            onClick={() => {
              logout();
              if (isMobile) {
                setIsMobileMenuOpen(false);
              }
            }}
            className="w-full flex items-center p-4 border-t border-slate-800 text-slate-400 hover:text-red-400 text-sm font-medium bg-transparent cursor-pointer mt-auto"
            id="btn-sidebar-logout"
          >
            <LogOut className="h-4 w-4 mr-3 shrink-0 text-red-500" />
            {showLabels && <span className="logout-text">Logout</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT BAR */}
      <main className="main-content flex-1 flex flex-col bg-slate-950 overflow-hidden">
        
        {/* TOPBAR */}
        <header className="flex h-16 items-center justify-between px-6 border-b border-slate-900 bg-slate-900/50 backdrop-blur shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            {/* Mobile Sidebar toggle burguer */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-slate-400 hover:text-slate-200 p-1.5 focus:outline-none cursor-pointer"
              id="btn-open-mobile-sidebar"
              aria-label="Buka atau tutup menu"
              aria-expanded={isMobileMenuOpen}
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Desktop Collapse Trigger */}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden md:block text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 p-1.5 rounded cursor-pointer"
              id="sidebar-toggle-desktop"
            >
              <Menu className="h-4.5 w-4.5" />
            </button>

            <h2 className="text-base sm:text-lg font-semibold text-white">Control Dashboard</h2>
            {isDemoUser && (
              <span className="bg-amber-500 text-slate-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full select-none animate-pulse shrink-0">
                MODE DEMO
              </span>
            )}
            
            <div className="h-6 w-[1px] bg-slate-800 hidden xs:block"></div>
            
            {/* Active voice controller status badge */}
            <div className="hidden sm:flex items-center px-3 py-1 bg-cyan-950/30 border border-cyan-800/50 rounded-full">
              <div className="animate-pulse h-2 w-2 rounded-full bg-cyan-400 mr-2"></div>
              <span className="text-xs text-cyan-200 font-medium">Voice Control Active: "Sebutkan perintah..."</span>
            </div>
          </div>

          {/* User information layout */}
          <div className="flex items-center gap-4">
            <div className="text-right hidden xs:block">
              <p className="text-sm font-medium text-white">{isDemoUser ? 'User Demo' : 'Admin IoT'}</p>
              <p className="text-[10px] text-slate-500 max-w-[150px] truncate">{currentUserEmail}</p>
            </div>
            
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="h-10 w-10 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 border-2 border-slate-800 hover:brightness-110 flex items-center justify-center text-xs font-bold text-white shadow-inner"
              title="Konfigurasi Firebase"
              id="btn-quick-settings"
            >
              {currentUserEmail ? currentUserEmail.substring(0, 2).toUpperCase() : 'AD'}
            </button>
          </div>
        </header>

        {/* Scrollable Layout Grid of the Dashboard */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto w-full max-w-7xl mx-auto">
          
          {firebaseError && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-xs flex items-center gap-3 animate-pulse" id="firebase-connection-error-banner">
              <ShieldAlert className="h-5 w-5 text-rose-500 shrink-0" />
              <div>
                <span className="font-bold block mb-0.5">Galat Koneksi Firebase:</span>
                <p className="text-slate-400">{firebaseError}</p>
              </div>
            </div>
          )}

          {isDemoUser && (
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-4 rounded-xl text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-amber-500/2" id="demo-mode-alert-banner">
              <div className="flex items-center gap-3">
                <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0" />
                <div>
                  <span className="font-bold block mb-0.5 uppercase tracking-wide">Mode Demo Aktif</span>
                  <p className="text-slate-300 font-medium">Anda sedang menggunakan akun demo. Perubahan tidak memengaruhi perangkat IoT fisik.</p>
                </div>
              </div>
              <button
                onClick={resetDemoData}
                type="button"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors border-none cursor-pointer tracking-wider shrink-0"
                id="btn-reset-demo-data"
              >
                Reset Data Demo
              </button>
            </div>
          )}
          
          {/* Top Section: Sensor Card (Statistics) */}
          <div className="w-full">
            <SensorCard />
          </div>
          
          <div className="grid grid-cols-12 gap-6 items-start">
            
            {/* GRAPH PLOT SECTION */}
            <div className="col-span-12 xl:col-span-8 h-full min-h-[300px]">
              <SensorCharts />
            </div>

            {/* VOICE CONTROLLER COLUMN */}
            <div className="col-span-12 md:col-span-6 xl:col-span-4 flex flex-col gap-4">
              <VoiceController />
            </div>

            {/* CONTROLS */}
            <div className="col-span-12 md:col-span-6 xl:col-span-7 bg-slate-900 rounded-xl border border-slate-800 p-6">
              <RelayControls />
            </div>

            {/* ACTIVITY LOGS */}
            <div className="col-span-12 md:col-span-12 xl:col-span-5">
              <LogHistory />
            </div>

          </div>
        </div>
      </main>

      {/* Settings credentials editor modal drawer */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <IoTProvider>
      <DashboardApp />
    </IoTProvider>
  );
}

// Wrapper component inside IoTProvider context
function DashboardApp() {
  const { isAuthenticated, isLoadingAuth } = useIoT();

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-sans text-slate-100">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-sm font-semibold tracking-wide text-slate-300 animate-pulse">Menghubungkan ke IoT Core...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return <DashboardShell />;
}
