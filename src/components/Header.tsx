import { Shield, Radio, ShieldAlert, Terminal, FileText, Smartphone, Download, HelpCircle, Laptop, Server } from 'lucide-react';
import { translations } from '../utils/translations';

interface HeaderProps {
  currentTab: 'router_login' | 'dual' | 'firmware' | 'agent' | 'windows_py' | 'lab' | 'code' | 'logs';
  setCurrentTab: (tab: 'router_login' | 'dual' | 'firmware' | 'agent' | 'windows_py' | 'lab' | 'code' | 'logs') => void;
  onQuickSimulate: () => void;
  onOpenApkModal: () => void;
  onOpenExeModal: () => void;
  onOpenGuideModal: () => void;
}

export function Header({ 
  currentTab, 
  setCurrentTab, 
  onQuickSimulate, 
  onOpenApkModal, 
  onOpenExeModal, 
  onOpenGuideModal 
}: HeaderProps) {
  const t = translations.en;

  return (
    <header className="border-b border-slate-800 bg-slate-950/95 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Shield className="w-4 h-4" />
          </div>
          <button
            onClick={() => setCurrentTab('router_login')}
            className="text-left group cursor-pointer"
          >
            <div className="text-base font-bold tracking-tight text-white group-hover:text-cyan-400 transition-colors">
              B4DCYBER SENTINEL
            </div>
            <div className="text-[11px] text-slate-400">
              Zero-Trust Wi-Fi Security &amp; Router Controller
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          <button
            onClick={() => setCurrentTab('router_login')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'router_login'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Router Login</span>
          </button>

          <button
            onClick={() => setCurrentTab('dual')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'dual'
                ? 'bg-slate-800 text-cyan-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{t.navDualSsid}</span>
          </button>

          <button
            onClick={() => setCurrentTab('firmware')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'firmware'
                ? 'bg-slate-800 text-cyan-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Router Sentinel</span>
          </button>

          <button
            onClick={() => setCurrentTab('agent')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'agent'
                ? 'bg-slate-800 text-cyan-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{t.navAgent}</span>
          </button>

          <button
            onClick={() => setCurrentTab('lab')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'lab'
                ? 'bg-slate-800 text-cyan-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{t.navLab}</span>
          </button>

          <button
            onClick={() => setCurrentTab('logs')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'logs'
                ? 'bg-slate-800 text-cyan-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{t.navLogs}</span>
          </button>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2.5">
          {/* Guide / Help Button */}
          <button
            onClick={onOpenGuideModal}
            className="px-2.5 py-1.5 text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 hover:text-white rounded-md transition-colors whitespace-nowrap border border-slate-800 flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="User Guide & Manual"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>User Guide</span>
          </button>

          {/* Download Windows EXE Button */}
          <button
            onClick={onOpenExeModal}
            className="px-2.5 py-1.5 text-xs font-semibold text-cyan-300 bg-slate-900 hover:bg-slate-800 hover:text-white rounded-md transition-colors whitespace-nowrap border border-slate-800 flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Laptop className="w-3.5 h-3.5 text-cyan-400" />
            <span>Windows .EXE</span>
          </button>

          {/* Download APK Button */}
          <button
            onClick={onOpenApkModal}
            className="px-2.5 py-1.5 text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 hover:text-white rounded-md transition-colors whitespace-nowrap border border-slate-800 flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Smartphone className="w-3.5 h-3.5 text-slate-400" />
            <span>Android APK</span>
          </button>

          <button
            onClick={onQuickSimulate}
            className="px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors whitespace-nowrap shadow-sm cursor-pointer"
          >
            Simulate Evil Twin
          </button>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="flex lg:hidden overflow-x-auto border-t border-slate-900 px-4 py-2 gap-2 bg-slate-950">
        <button
          onClick={() => setCurrentTab('router_login')}
          className={`px-3 py-1 text-xs whitespace-nowrap rounded font-semibold ${
            currentTab === 'router_login' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400'
          }`}
        >
          Router Login
        </button>
        <button
          onClick={() => setCurrentTab('dual')}
          className={`px-3 py-1 text-xs whitespace-nowrap rounded ${
            currentTab === 'dual' ? 'bg-slate-800 text-cyan-400 font-semibold' : 'text-slate-400'
          }`}
        >
          {t.navDualSsid}
        </button>
        <button
          onClick={() => setCurrentTab('firmware')}
          className={`px-3 py-1 text-xs whitespace-nowrap rounded ${
            currentTab === 'firmware' ? 'bg-slate-800 text-cyan-400 font-semibold' : 'text-slate-400'
          }`}
        >
          Router Sentinel
        </button>
        <button
          onClick={() => setCurrentTab('agent')}
          className={`px-3 py-1 text-xs whitespace-nowrap rounded ${
            currentTab === 'agent' ? 'bg-slate-800 text-cyan-400 font-semibold' : 'text-slate-400'
          }`}
        >
          {t.navAgent}
        </button>
        <button
          onClick={() => setCurrentTab('lab')}
          className={`px-3 py-1 text-xs whitespace-nowrap rounded ${
            currentTab === 'lab' ? 'bg-slate-800 text-cyan-400 font-semibold' : 'text-slate-400'
          }`}
        >
          {t.navLab}
        </button>
        <button
          onClick={() => setCurrentTab('logs')}
          className={`px-3 py-1 text-xs whitespace-nowrap rounded ${
            currentTab === 'logs' ? 'bg-slate-800 text-cyan-400 font-semibold' : 'text-slate-400'
          }`}
        >
          {t.navLogs}
        </button>
      </div>
    </header>
  );
}
