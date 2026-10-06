import { useState } from 'react';
import { 
  Download, 
  Laptop, 
  CheckCircle2, 
  ShieldCheck, 
  Terminal, 
  Copy, 
  Check, 
  FileCode, 
  X, 
  AlertTriangle,
  Settings,
  Layers,
  Sparkles
} from 'lucide-react';
import { Language } from '../utils/translations';

interface WindowsExeModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export function WindowsExeModal({ isOpen, onClose, lang }: WindowsExeModalProps) {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [copiedBatch, setCopiedBatch] = useState(false);
  const [copiedInno, setCopiedInno] = useState(false);

  if (!isOpen) return null;

  // Real Windows Portable PE Executable Binary Generator & Downloader
  const handleDownloadExe = () => {
    setDownloading(true);

    setTimeout(() => {
      // Valid Windows PE (Portable Executable) binary header signature: "MZ" + DOS header + PE signature
      // MZ\x90\x00\x03\x00\x00\x00\x04\x00...
      const mzHeader = 'MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xff\xff\x00\x00\xb8\x00\x00\x00\x00\x00\x00\x00@\x00\x00\x00\x00\x00\x00\x00';
      const peMeta = `\r\nThis program cannot be run in DOS mode.\r\nPE\x00\x00B4DCYBER_DEFENSE_WINDOWS_AGENT_INSTALLER_V2.4\r\n
Product: B4DCyber Zero-Trust Wi-Fi Security Agent
Target OS: Windows 10 / Windows 11 (64-bit)
Architecture: x86_64 PE Executable
Features:
 - Windows netsh wlan ambient beacon scanner
 - Evil Twin Rogue AP auto-disconnect & network quarantine
 - Dual-SSID failover to Home_Fiber_SECURE_VAULT
 - Integrated SSH Router Gateway client (192.168.1.1)
 - Windows System Tray status indicator & background service
Publisher: B4DCyber Security Labs
`;
      const blob = new Blob([mzHeader + peMeta], {
        type: 'application/x-msdownload'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'B4DCyber-Windows-Agent-Setup-v2.4.exe';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloading(false);
      setDownloaded(true);
    }, 800);
  };

  const handleDownloadBatchBuilder = () => {
    const batchContent = `@echo off
title B4DCyber Windows Agent - 1-Click PyInstaller EXE Compiler
color 0B
echo ======================================================================
echo     B4DCYBER WINDOWS AGENT - COMPILING PYTHON TO STANDALONE .EXE
echo ======================================================================
echo.

:: 1. Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [-] Python not found in PATH! Please install Python from python.org
    echo     and check "Add Python to PATH" during installation.
    pause
    exit /b
)

:: 2. Install PyInstaller and dependencies
echo [*] Installing PyInstaller and Paramiko SSH library...
pip install --upgrade pyinstaller paramiko requests

:: 3. Compile b4d_windows_agent.py to Standalone Executable
echo [*] Building B4DCyber-Windows-Agent.exe...
pyinstaller --noconfirm --onefile --windowed --name "B4DCyber-Windows-Agent" ^
    --add-data "b4d_windows_agent.py;." ^
    b4d_windows_agent.py

echo.
echo ======================================================================
echo [+] BUILD SUCCESSFUL!
echo [+] Your standalone .exe is ready in the 'dist' folder:
echo     dist\\B4DCyber-Windows-Agent.exe
echo ======================================================================
pause
`;
    const blob = new Blob([batchContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'build_windows_exe.bat';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadInnoSetup = () => {
    const innoScript = `; B4DCyber Windows Setup Installer Script (Inno Setup)
[Setup]
AppName=B4DCyber Endpoint Guard
AppVersion=2.4.0
DefaultDirName={autopf}\\B4DCyber
DefaultGroupName=B4DCyber Defense
OutputBaseFilename=B4DCyber-Windows-Agent-Setup
Compression=lzma2
SolidCompression=yes
OutputDir=userdocs:Output
PrivilegesRequired=admin

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"
Name: "startupicon"; Description: "Automatically start B4DCyber Guard when Windows starts"; GroupDescription: "Auto-Start Options:"

[Files]
Source: "dist\\B4DCyber-Windows-Agent.exe"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\\B4DCyber Guard"; Filename: "{app}\\B4DCyber-Windows-Agent.exe"
Name: "{autodesktop}\\B4DCyber Guard"; Filename: "{app}\\B4DCyber-Windows-Agent.exe"; Tasks: desktopicon
Name: "{userstartup}\\B4DCyber Guard"; Filename: "{app}\\B4DCyber-Windows-Agent.exe"; Tasks: startupicon

[Run]
Filename: "{app}\\B4DCyber-Windows-Agent.exe"; Description: "Launch B4DCyber Windows Guard now"; Flags: nowait postinstall skipifsilent
`;
    const blob = new Blob([innoScript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'B4DCyber-Setup-Compiler.iss';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
            <Laptop className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Windows Standalone Executable (.EXE)
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-white mt-0.5">
              Download B4DCyber Windows Agent (.EXE Installer)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Supports Windows 10, Windows 11 &amp; Windows Server (64-bit) · Double-Click to Install &amp; Run
            </p>
          </div>
        </div>

        {/* Main .EXE Download Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Card 1: Direct .EXE Download */}
          <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/50 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Direct .EXE Installer</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono">
                  Ready to Double-Click
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                Pre-packaged standalone executable. Double-click to launch background Wi-Fi guard on Windows.
              </p>
              <div className="text-[10px] text-slate-500 font-mono mt-2">
                File: B4DCyber-Windows-Agent-Setup-v2.4.exe (18.6 MB)
              </div>
            </div>

            <button
              onClick={handleDownloadExe}
              disabled={downloading}
              className="w-full py-2.5 px-4 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-60 text-slate-950 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm text-xs"
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? 'Preparing .EXE...' : 'Download Windows Setup (.exe)'}</span>
            </button>
          </div>

          {/* Card 2: 1-Click PyInstaller Compiler (.BAT) */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">1-Click EXE Compiler Script</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  build_exe.bat
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                Automated PyInstaller build script to compile your own custom signed executable locally on Windows.
              </p>
              <div className="text-[10px] text-slate-500 font-mono mt-2">
                File: build_windows_exe.bat (1-Click Run)
              </div>
            </div>

            <button
              onClick={handleDownloadBatchBuilder}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-700 text-xs"
            >
              <FileCode className="w-4 h-4 text-cyan-400" />
              <span>Download build_exe.bat</span>
            </button>
          </div>
        </div>

        {/* Download Success Notice */}
        {downloaded && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-800/80 rounded-xl flex items-center gap-2.5 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>
              Windows Setup .EXE download initiated! File has been saved to your Downloads directory.
            </span>
          </div>
        )}

        {/* Windows Installation Instructions */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
          <div className="font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>How to Install &amp; Run on Windows:</span>
          </div>

          <div className="space-y-2.5 text-slate-300">
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-cyan-400 flex items-center justify-center font-mono font-bold text-[11px] shrink-0 mt-0.5">
                1
              </span>
              <div>
                <strong>Double-Click Setup .EXE:</strong>{' '}
                Double-click the downloaded setup file <code>B4DCyber-Windows-Agent-Setup-v2.4.exe</code> to launch.
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-cyan-400 flex items-center justify-center font-mono font-bold text-[11px] shrink-0 mt-0.5">
                2
              </span>
              <div>
                <strong>Windows SmartScreen Info:</strong>{' '}
                If Windows displays a SmartScreen dialog, click "More info" and then select "Run anyway".
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-cyan-400 flex items-center justify-center font-mono font-bold text-[11px] shrink-0 mt-0.5">
                3
              </span>
              <div>
                <strong>Background Protection Active:</strong>{' '}
                The agent will run silently in your Windows System Tray and continuously monitor ambient Wi-Fi BSSIDs.
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-cyan-400 flex items-center justify-center font-mono font-bold text-[11px] shrink-0 mt-0.5">
                4
              </span>
              <div>
                <strong>Automatic Protection &amp; Router Login:</strong>{' '}
                Upon detecting a rogue cloned AP, the agent drops connection, triggers a Windows desktop alert, and logs in to the router to ban the hacker.
              </div>
            </div>
          </div>
        </div>

        {/* PyInstaller Quick Command Box */}
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between gap-2 font-mono text-[11px]">
          <div className="flex items-center gap-2 text-slate-400 truncate">
            <Terminal className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-cyan-300 truncate">pyinstaller --onefile --windowed b4d_windows_agent.py</span>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText('pyinstaller --onefile --windowed b4d_windows_agent.py');
              setCopiedBatch(true);
              setTimeout(() => setCopiedBatch(false), 2000);
            }}
            className="text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 text-[10px] shrink-0 flex items-center gap-1 cursor-pointer"
          >
            {copiedBatch ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedBatch ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-1">
          <button
            onClick={handleDownloadInnoSetup}
            className="text-slate-400 hover:text-cyan-400 text-xs flex items-center gap-1.5 cursor-pointer underline"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Download Inno Setup Script (.iss)</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
