import { Shield, Radio, ShieldAlert, Terminal, FileText, Globe, Smartphone, Download, HelpCircle, Laptop, Lock, Server } from 'lucide-react';
import { Language, translations } from '../utils/translations';

interface HeaderProps {
  currentTab: 'python_web' | 'agent' | 'firmware' | 'router_login' | 'dual' | 'windows_py' | 'lab' | 'code' | 'logs';
  setCurrentTab: (tab: 'python_web' | 'agent' | 'firmware' | 'router_login' | 'dual' | 'windows_py' | 'lab' | 'code' | 'logs') => void;
  lang: Language;
  setLang: (lang: Language) => void;
  onQuickSimulate: () => void;
  onOpenPythonModal: () => void;
  onOpenApkModal: () => void;
  onOpenExeModal: () => void;
  onOpenGuideModal: () => void;
}

export function Header({ currentTab, setCurrentTab, lang, setLang, onQuickSimulate, onOpenPythonModal, onOpenApkModal, onOpenExeModal, onOpenGuideModal }: HeaderProps) {
  const t = translations[lang];

  return (
    <header className="border-b border-slate-800 bg-slate-950/95 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single text wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Shield className="w-4 h-4" />
          </div>
          <button
            onClick={() => setCurrentTab('agent')}
            className="text-left group cursor-pointer"
          >
            <div className="text-base font-bold tracking-tight text-white group-hover:text-cyan-400 transition-colors">
              B4DCYBER DEFENSE
            </div>
            <div className="text-[11px] text-slate-400">
              Zero-Trust Wi-Fi Framework
            </div>
          </button>
        </div>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          <button
            onClick={() => setCurrentTab('python_web')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors flex items-center gap-1.5 ${
              currentTab === 'python_web'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t.navPythonWeb}</span>
          </button>

          <button
            onClick={() => setCurrentTab('agent')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              currentTab === 'agent'
                ? 'bg-slate-800 text-cyan-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{t.navAgent}</span>
          </button>

          <button
            onClick={() => setCurrentTab('firmware')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              currentTab === 'firmware'
                ? 'bg-slate-800 text-cyan-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{t.navFirmware}</span>
          </button>

          <button
            onClick={() => setCurrentTab('router_login')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              currentTab === 'router_login'
                ? 'bg-slate-800 text-cyan-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>{t.navRouterLogin}</span>
          </button>

          <button
            onClick={() => setCurrentTab('dual')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              currentTab === 'dual'
                ? 'bg-slate-800 text-cyan-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{t.navDualSsid}</span>
          </button>

          <button
            onClick={() => setCurrentTab('windows_py')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              currentTab === 'windows_py'
                ? 'bg-slate-800 text-cyan-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>{t.navWindowsPy}</span>
          </button>

          <button
            onClick={() => setCurrentTab('lab')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              currentTab === 'lab'
                ? 'bg-slate-800 text-cyan-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{t.navLab}</span>
          </button>

          <button
            onClick={() => setCurrentTab('code')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              currentTab === 'code'
                ? 'bg-slate-800 text-cyan-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>{t.navCode}</span>
          </button>

          <button
            onClick={() => setCurrentTab('logs')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              currentTab === 'logs'
                ? 'bg-slate-800 text-cyan-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{t.navLogs}</span>
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions & Language Toggle */}
        <div className="flex items-center gap-2.5">
          {/* Language Toggle */}
          <div className="flex items-center p-0.5 bg-slate-900 border border-slate-800 rounded-md">
            <button
              onClick={() => setLang('en')}
              className={`px-2 py-1 text-[11px] font-medium rounded transition-colors ${
                lang === 'en' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('ur')}
              className={`px-2 py-1 text-[11px] font-medium rounded transition-colors ${
                lang === 'ur' ? 'bg-cyan-950 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              اردو / Roman
            </button>
          </div>

          {/* Guide / Help Button */}
          <button
            onClick={onOpenGuideModal}
            className="px-2.5 py-1.5 text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 hover:text-white rounded-md transition-colors whitespace-nowrap border border-slate-800 flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="How to Use Manual"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>{lang === 'ur' ? 'رہنمائی (Guide)' : 'Guide'}</span>
          </button>

          {/* Download Python Web App Button */}
          <button
            onClick={onOpenPythonModal}
            className="px-3 py-1.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors whitespace-nowrap shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-950" />
            <span>Python Web App (.py)</span>
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
            className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-850 hover:bg-slate-800 hover:text-white rounded-md transition-colors whitespace-nowrap border border-slate-700 flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Smartphone className="w-3.5 h-3.5 text-slate-400" />
            <span>Android APK</span>
          </button>

          <button
            onClick={onQuickSimulate}
            className="px-3 py-1.5 text-xs font-medium text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors whitespace-nowrap shadow-sm font-semibold"
          >
            {lang === 'ur' ? 'Hamla Test Karein' : 'Simulate Evil Twin'}
          </button>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="flex lg:hidden overflow-x-auto border-t border-slate-900 px-4 py-2 gap-2 bg-slate-950">
        <button
          onClick={() => setCurrentTab('python_web')}
          className={`px-3 py-1 text-xs whitespace-nowrap rounded font-bold ${currentTab === 'python_web' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-300'}`}
        >
          {t.navPythonWeb}
        </button>
        <button
          onClick={() => setCurrentTab('agent')}
          className={`px-3 py-1 text-xs whitespace-nowrap rounded ${currentTab === 'agent' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400'}`}
        >
          {t.navAgent}
        </button>
        <button
          onClick={() => setCurrentTab('firmware')}
          className={`px-3 py-1 text-xs whitespace-nowrap rounded ${currentTab === 'firmware' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400'}`}
        >
          {t.navFirmware}
        </button>
        <button
          onClick={() => setCurrentTab('router_login')}
          className={`px-3 py-1 text-xs whitespace-nowrap rounded ${currentTab === 'router_login' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400'}`}
        >
          {t.navRouterLogin}
        </button>
        <button
          onClick={() => setCurrentTab('dual')}
          className={`px-3 py-1 text-xs whitespace-nowrap rounded ${currentTab === 'dual' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400'}`}
        >
          {t.navDualSsid}
        </button>
        <button
          onClick={() => setCurrentTab('windows_py')}
          className={`px-3 py-1 text-xs whitespace-nowrap rounded ${currentTab === 'windows_py' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400'}`}
        >
          {t.navWindowsPy}
        </button>
        <button
          onClick={() => setCurrentTab('lab')}
          className={`px-3 py-1 text-xs whitespace-nowrap rounded ${currentTab === 'lab' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400'}`}
        >
          {t.navLab}
        </button>
        <button
          onClick={() => setCurrentTab('code')}
          className={`px-3 py-1 text-xs whitespace-nowrap rounded ${currentTab === 'code' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400'}`}
        >
          {t.navCode}
        </button>
        <button
          onClick={() => setCurrentTab('logs')}
          className={`px-3 py-1 text-xs whitespace-nowrap rounded ${currentTab === 'logs' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400'}`}
        >
          {t.navLogs}
        </button>
      </div>
    </header>
  );
}
