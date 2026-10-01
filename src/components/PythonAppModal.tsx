import { useState } from 'react';
import { 
  Download, 
  Terminal, 
  Copy, 
  Check, 
  CheckCircle2, 
  FileCode, 
  X, 
  Sparkles, 
  Laptop, 
  Server,
  Play
} from 'lucide-react';
import { standalonePythonWebAppCode } from '../data/standalonePythonWebApp';
import { Language } from '../utils/translations';

interface PythonAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export function PythonAppModal({ isOpen, onClose, lang }: PythonAppModalProps) {
  const [downloaded, setDownloaded] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const handleDownloadPython = () => {
    const blob = new Blob([standalonePythonWebAppCode], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'b4d_sentinel.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloaded(true);
  };

  const handleDownloadBat = () => {
    const batContent = `@echo off
title B4DCyber Sentinel - Windows Launcher
color 0B
echo ======================================================================
echo     STARTING B4DCYBER PYTHON SENTINEL (WINDOWS)
echo ======================================================================
echo.

python --version >nul 2>&1
if %errorlevel% equ 0 (
    set PY_CMD=python
    goto FOUND_PY
)

py --version >nul 2>&1
if %errorlevel% equ 0 (
    set PY_CMD=py
    goto FOUND_PY
)

color 0C
echo ======================================================================
echo [-] ERROR: Python is not installed or not added to Windows PATH!
echo ======================================================================
echo.
echo HOW TO FIX IN 1 MINUTE:
echo  1. Download Python from https://www.python.org/downloads/
echo  2. CRITICAL: Check the box "Add python.exe to PATH" during installation.
echo  3. After install, double-click run.bat again!
echo ======================================================================
echo.
pause
exit /b

:FOUND_PY
echo [+] Python found: %PY_CMD%
%PY_CMD% -c "import paramiko" >nul 2>&1
if %errorlevel% neq 0 (
    echo [*] Installing Paramiko SSH library...
    %PY_CMD% -m pip install paramiko
)

echo [*] Launching Web UI at http://localhost:5000...
%PY_CMD% b4d_sentinel.py

echo.
pause
`;
    const blob = new Blob([batContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'run_web.bat';
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
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Standalone Python Web Application
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-white mt-0.5">
              {lang === 'ur'
                ? 'b4d_web_app.py (مکمل Python ویب ایپ)'
                : 'Download Standalone Python Web App'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Single-File Python Script with Built-in Web UI (http://localhost:5000) &amp; Automated Router Login
            </p>
          </div>
        </div>

        {/* Action Cards: Download .py and run.bat */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Card 1: Download .py */}
          <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/50 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">b4d_web_app.py</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono">
                  Python Script
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                {lang === 'ur'
                  ? 'سنگل فائل سکرپٹ۔ اسے چلائیں، یہ خود براؤزر میں Web UI کھولے گی اور روٹر لاگ ان لینے کے بعد تمام کام آٹو میٹک کرے گی۔'
                  : 'Standalone single-file script. Runs local web server on port 5000, handles router login, and blocks fake hotspots.'}
              </p>
            </div>

            <button
              onClick={handleDownloadPython}
              className="w-full py-2.5 px-4 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm text-xs"
            >
              <Download className="w-4 h-4" />
              <span>{lang === 'ur' ? 'Download b4d_web_app.py' : 'Download Python Script (.py)'}</span>
            </button>
          </div>

          {/* Card 2: Download run_web.bat */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">run_web.bat</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  1-Click Windows Launcher
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                {lang === 'ur'
                  ? 'ونڈوز پر ڈبل کلک کرنے والی فائل۔ یہ خود سکرپٹ رن کر کے براؤزر کھول دیتی ہے۔'
                  : '1-click Windows batch launcher. Double-click to start Python and launch the web interface.'}
              </p>
            </div>

            <button
              onClick={handleDownloadBat}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-700 text-xs"
            >
              <Play className="w-4 h-4 text-cyan-400 fill-current" />
              <span>{lang === 'ur' ? 'Download run_web.bat' : 'Download run_web.bat'}</span>
            </button>
          </div>
        </div>

        {/* Download Success Notice */}
        {downloaded && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-800/80 rounded-xl flex items-center gap-2.5 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>
              {lang === 'ur'
                ? 'b4d_web_app.py ڈاؤنلوڈ ہو چکی ہے! اپنے ٹرمینل میں python b4d_web_app.py چلائیں۔'
                : 'b4d_web_app.py download started! Run python b4d_web_app.py to launch.'}
            </span>
          </div>
        )}

        {/* Simple Step-by-Step Run Instructions */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2.5 text-xs text-slate-300">
          <div className="font-bold text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-cyan-400" />
            <span>{lang === 'ur' ? 'استعمال کا طریقہ (صرف 2 منٹ):' : 'How to Run (2 Simple Steps):'}</span>
          </div>

          <div className="space-y-2 pl-1">
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-mono font-bold text-[11px] shrink-0">1</span>
              <div>
                <strong>{lang === 'ur' ? 'سکرپٹ چلائیں:' : 'Run the Script:'}</strong>{' '}
                Command Prompt (CMD) میں <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded font-mono">python b4d_web_app.py</code> لکھیں (یا <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded font-mono">run_web.bat</code> پر ڈبل کلک کریں)۔
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-mono font-bold text-[11px] shrink-0">2</span>
              <div>
                <strong>{lang === 'ur' ? 'ویب پیج پر روٹر لاگ ان دیں:' : 'Enter Router Credentials in Web UI:'}</strong>{' '}
                براؤزر میں <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded font-mono">http://localhost:5000</code> کھلے گا۔ وہاں اپنے Wi-Fi روٹر کا IP اور پاس ورڈ دیں — باقی سارا کام (BSSID پکڑنا، سیکنڈری وائی فائی اور ہیکر بین کرنا) Python خود بخود کرے گا!
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-1">
          <button
            onClick={() => {
              navigator.clipboard.writeText(standalonePythonWebAppCode);
              setCopiedCode(true);
              setTimeout(() => setCopiedCode(false), 2000);
            }}
            className="text-slate-400 hover:text-cyan-300 text-xs flex items-center gap-1.5 cursor-pointer underline"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? 'Source Copied!' : 'Copy Python Source Code'}</span>
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
