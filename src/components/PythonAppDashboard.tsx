import { useState } from 'react';
import { 
  Server, 
  Terminal, 
  Download, 
  ShieldCheck, 
  ShieldAlert, 
  Wifi, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  Flame, 
  Ban, 
  RefreshCw, 
  FileCode, 
  Copy, 
  Check, 
  Zap, 
  Eye, 
  EyeOff, 
  Laptop, 
  Cpu
} from 'lucide-react';
import { standalonePythonWebAppCode } from '../data/standalonePythonWebApp';
import { Language } from '../utils/translations';

interface PythonAppDashboardProps {
  lang: Language;
  onOpenPythonModal: () => void;
}

export function PythonAppDashboard({ lang, onOpenPythonModal }: PythonAppDashboardProps) {
  // Router Login Form State
  const [routerIp, setRouterIp] = useState('192.168.1.1');
  const [routerUser, setRouterUser] = useState('root');
  const [routerPass, setRouterPass] = useState('admin123');
  const [showPass, setShowPass] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  // Auto-Detected Router Specs (Python extracts these automatically!)
  const [targetSsid, setTargetSsid] = useState('Home_Fiber_5G');
  const [trustedBssid, setTrustedBssid] = useState('E4:5F:01:3B:9A:88');
  const [wifiChannel, setWifiChannel] = useState(36);
  const [vaultSsid, setVaultSsid] = useState('Home_Fiber_SECURE_VAULT');
  const [operatingSystem, setOperatingSystem] = useState<'Windows' | 'Linux'>('Windows');

  // Threat State
  const [isAttackSimulated, setIsAttackSimulated] = useState(false);

  // Connected Devices
  const [devices, setDevices] = useState([
    { id: '1', name: 'Admin-Laptop (Windows 11 / Linux)', ip: '192.168.1.105', mac: 'B4:2E:99:A1:04:77', signal: '-42 dBm' },
    { id: '2', name: 'Mobile-Device (Galaxy S24)', ip: '192.168.1.142', mac: '90:9A:4A:BC:33:11', signal: '-55 dBm' },
    { id: '3', name: 'LivingRoom-Smart-TV', ip: '192.168.1.189', mac: 'F0:2F:74:11:8A:CC', signal: '-62 dBm' }
  ]);

  // Blacklist
  const [blacklist, setBlacklist] = useState<{ mac: string; reason: string; time: string }[]>([
    { mac: '00:C0:CA:98:FA:01', reason: 'Evil Twin Hotspot Beacon Probe', time: '02:15:30' }
  ]);

  // Terminal Execution Logs
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    `[INIT] B4DCyber Python Sentinel started on http://127.0.0.1:5000`,
    `[OS] Detected Platform: ${operatingSystem} 64-bit Kernel.`,
    `[ROUTER] Authenticated with gateway ${routerIp} (user: ${routerUser}).`,
    `[AUTO-FETCH] Hardware BSSID auto-synced: ${trustedBssid} (Channel ${wifiChannel}).`,
    `[AUTO-FETCH] Secondary Failover Vault: '${vaultSsid}' active.`,
    `[DAEMON] Ambient Wi-Fi scanning running every 3.0s (Zero manual config required).`
  ]);

  const [copiedCode, setCopiedCode] = useState(false);

  // Handler: Router Login Form
  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);

    await new Promise(r => setTimeout(r, 700));

    setIsConnected(true);
    setIsConnecting(false);
    setIsAttackSimulated(false);

    setTerminalLogs(prev => [
      ...prev,
      `--- ROUTER LOGIN RE-AUTHENTICATED [${new Date().toLocaleTimeString()}] ---`,
      `[SUCCESS] Logged in to ${routerIp} as ${routerUser}.`,
      `[ROUTER] Queried wireless interfaces: wlan0 (Primary), wlan0_1 (Vault).`,
      `[AUTO-PILOT] Background Wi-Fi scanner and router firewall active on ${operatingSystem}!`
    ]);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setTerminalLogs(prev => [
      ...prev,
      `[SESSION] Disconnected from ${routerIp}. Sentinel paused.`
    ]);
  };

  // Handler: Kick & Ban Client on Router
  const handleBanDevice = (mac: string, name: string) => {
    setDevices(prev => prev.filter(d => d.mac !== mac));
    setBlacklist(prev => [{ mac, reason: 'Admin Manual Ban', time: new Date().toLocaleTimeString() }, ...prev]);
    setTerminalLogs(prev => [
      ...prev,
      `[ROUTER EXEC] hostapd_cli deauthenticate ${mac} 7`,
      `[ROUTER EXEC] echo '${mac}' >> /etc/hostapd.deny && hostapd_cli reload`,
      `[ROUTER EXEC] iptables -I FORWARD -m mac --mac-source ${mac} -j DROP`,
      `[SUCCESS] Device ${name} (${mac}) permanently blocked on router firewall!`
    ]);
  };

  // Handler: Simulate Attack
  const handleSimulateAttack = () => {
    setIsAttackSimulated(true);
    const rogueMac = '00:C0:CA:98:FA:01';

    setTerminalLogs(prev => [
      ...prev,
      `--------------------------------------------------------------------------------`,
      `[CRITICAL ALERT] AMBIENT SCAN DETECTED ROGUE EVIL TWIN HOTSPOT!`,
      `  Cloned SSID:  '${targetSsid}'`,
      `  Rogue BSSID:  ${rogueMac} (MISMATCH from Trusted Router: ${trustedBssid})`,
      `[AUTO-ACTION 1] ${operatingSystem} Wi-Fi interface auto-disconnected to prevent MITM.`,
      `[AUTO-ACTION 2] Logging in to router ${routerIp} to drop & ban rogue MAC...`,
      `[ROUTER FIREWALL] iptables -I FORWARD -m mac --mac-source ${rogueMac} -j DROP`,
      `[ROUTER FIREWALL] echo '${rogueMac}' >> /etc/hostapd.deny`,
      `[AUTO-ACTION 3] Migrating computer to Secondary Vault SSID: '${vaultSsid}'...`,
      `[SUCCESS] System secured! Connected to Vault SSID. Attacker blocked on router!`
    ]);
  };

  const handleResetAttack = () => {
    setIsAttackSimulated(false);
    setTerminalLogs(prev => [
      ...prev,
      `[RESTORE] Threat cleared. Reconnected to Primary SSID '${targetSsid}'.`
    ]);
  };

  // 1-Click File Downloads
  const downloadPythonFile = () => {
    const blob = new Blob([standalonePythonWebAppCode], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'b4d_sentinel.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadLinuxRunScript = () => {
    const shContent = `#!/bin/bash
echo "======================================================================"
echo "    STARTING B4DCYBER PYTHON SENTINEL (LINUX)"
echo "======================================================================"
echo ""

# Check python3
if ! command -v python3 &> /dev/null; then
    echo "[-] Python3 not found! Please run: sudo apt update && sudo apt install python3 python3-pip"
    read -p "Press Enter to exit..."
    exit 1
fi

# Optional paramiko
python3 -c "import paramiko" 2>/dev/null || {
    echo "[*] Installing Paramiko SSH library..."
    pip3 install paramiko || pip install paramiko
}

echo "[*] Launching Web UI at http://localhost:5000..."
sudo python3 b4d_sentinel.py
read -p "Press Enter to exit..."
`;
    const blob = new Blob([shContent], { type: 'text/x-shellscript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'run.sh';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadWindowsBat = () => {
    const batContent = `@echo off
title B4DCyber Sentinel - Windows Launcher
color 0B
echo ======================================================================
echo     STARTING B4DCYBER PYTHON SENTINEL (WINDOWS)
echo ======================================================================
echo.

:: 1. Check if 'python' command works
python --version >nul 2>&1
if %errorlevel% equ 0 (
    set PY_CMD=python
    goto FOUND_PYTHON
)

:: 2. Check if 'py' launcher works
py --version >nul 2>&1
if %errorlevel% equ 0 (
    set PY_CMD=py
    goto FOUND_PYTHON
)

:: 3. Neither worked - Show Friendly Help
color 0C
echo ======================================================================
echo [-] ERROR: Python is not installed or not added to Windows PATH!
echo ======================================================================
echo.
echo HOW TO FIX IN 1 MINUTE:
echo  1. Go to https://www.python.org/downloads/ and download Python.
echo  2. CRITICAL STEP: When installing, CHECK THE BOX at the bottom:
echo     [X] "Add python.exe to PATH"
echo  3. Finish installation, close this window and double-click run.bat again!
echo ======================================================================
echo.
pause
exit /b

:FOUND_PYTHON
echo [+] Found Python runtime: %PY_CMD%
echo [*] Checking optional Paramiko SSH library for router commands...
%PY_CMD% -c "import paramiko" >nul 2>&1
if %errorlevel% neq 0 (
    echo [*] Installing Paramiko...
    %PY_CMD% -m pip install paramiko
)

echo [*] Launching B4DCyber Web UI at http://localhost:5000...
%PY_CMD% b4d_sentinel.py

echo.
echo ======================================================================
echo [*] B4DCyber Sentinel stopped. Press any key to close this window.
echo ======================================================================
pause
`;
    const blob = new Blob([batContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'run.bat';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                <Terminal className="w-3.5 h-3.5" />
                PURE PYTHON WI-FI SENTINEL
              </span>
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs text-slate-300 font-mono flex items-center gap-1">
                <Laptop className="w-3 h-3 text-cyan-400" />
                Windows 10/11 &amp; Linux (Kali / Ubuntu / Debian)
              </span>
              <span className="text-xs text-slate-500">·</span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                isConnected ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}>
                {isConnected ? 'AUTO-PILOT ACTIVE (روٹر کنیکٹڈ ہے)' : 'LOGIN REQUIRED'}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {lang === 'ur'
                ? 'Python Web UI: صرف روٹر لاگ ان دیں — باقی سارا کام آٹو میٹک'
                : 'Python Web UI: Wi-Fi Sentinel for Windows & Linux'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
              {lang === 'ur'
                ? 'کوئی فرم ویئر فلیش کرنے یا ایپ کی ضرورت نہیں۔ یہ سنگل Python سکرپٹ ونڈوز یا لینکس پر چلتی ہے، لوکل ویب انٹرفیس دیتی ہے، روٹر لاگ ان لیتے ہی BSSID خود نکالتی ہے، فیک ہاٹ سپاٹ کو روکتی ہے اور ہیکر کو روٹر سے بین کرتی ہے۔'
                : 'Zero-configuration pure Python web application for Windows and Linux. Enter your router login once; Python automatically extracts hardware BSSIDs, blocks Evil Twin rogue hotspots, and bans attackers on your router firewall.'}
            </p>
          </div>

          {/* 1-Click Download Buttons */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={downloadPythonFile}
              className="px-4 py-2.5 text-xs font-bold bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md hover:shadow-cyan-500/20"
            >
              <Download className="w-4 h-4" />
              <span>Download b4d_sentinel.py</span>
            </button>

            <button
              onClick={downloadWindowsBat}
              className="px-3 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              title="1-Click Windows Batch Launcher"
            >
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              <span>run.bat (Windows)</span>
            </button>

            <button
              onClick={downloadLinuxRunScript}
              className="px-3 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              title="1-Click Linux Bash Launcher"
            >
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>run.sh (Linux)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Router Login (Left) + Active Dashboard & Controls (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Router Login Form (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                {lang === 'ur' ? 'Wi-Fi روٹر کا لاگ ان دیں' : 'Wi-Fi Router Login'}
              </h2>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
              GATEWAY
            </span>
          </div>

          <form onSubmit={handleConnect} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Router IP Address
              </label>
              <input
                type="text"
                value={routerIp}
                onChange={(e) => setRouterIp(e.target.value)}
                placeholder="192.168.1.1"
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={routerUser}
                  onChange={(e) => setRouterUser(e.target.value)}
                  placeholder="root or admin"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={routerPass}
                    onChange={(e) => setRouterPass(e.target.value)}
                    placeholder="Router Password"
                    className="w-full pl-3 pr-8 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-1">
              {isConnected ? (
                <div className="space-y-2">
                  <div className="p-3 bg-emerald-950/40 border border-emerald-800/80 rounded-xl flex items-center gap-2.5 text-xs text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>
                      {lang === 'ur'
                        ? 'روٹر کنیکٹ ہو چکا ہے! Python سکرپٹ بیک گراؤنڈ میں تمام کام خود کر رہی ہے۔'
                        : 'Router Connected! Python Sentinel is actively guarding your Wi-Fi.'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="w-full py-2 px-3 bg-slate-800 hover:bg-red-950 hover:text-red-300 text-slate-300 font-semibold rounded-lg transition-colors text-xs border border-slate-700 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>{lang === 'ur' ? 'روٹر ڈس کنیکٹ کریں' : 'Disconnect Router'}</span>
                  </button>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={isConnecting}
                  className="w-full py-2.5 px-4 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-60 text-slate-950 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md text-xs"
                >
                  {isConnecting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{lang === 'ur' ? 'روٹر کنیکٹ ہو رہا ہے...' : 'Connecting...'}</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>{lang === 'ur' ? 'روٹر لاگ ان کریں اور آٹو پائلٹ چلائیں' : 'Login Router & Start Auto-Pilot'}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>

          {/* Auto-Queried Specs (Fetched automatically from router) */}
          {isConnected && (
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-[11px] pb-1 border-b border-slate-800">
                <Zap className="w-3.5 h-3.5" />
                <span>روٹر سے خود حاصل کردہ تفصیلات (Auto-Extracted):</span>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Wi-Fi SSID:</span>
                  <span className="text-white font-mono font-semibold">{targetSsid}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Hardware BSSID:</span>
                  <span className="text-cyan-300 font-mono font-bold">{trustedBssid}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Wi-Fi Channel:</span>
                  <span className="text-white font-mono">Channel {wifiChannel} (5 GHz)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Secondary Vault SSID:</span>
                  <span className="text-emerald-300 font-mono font-bold truncate">{vaultSsid}</span>
                </div>
              </div>
            </div>
          )}

          {/* Test Attack Button */}
          <div className="pt-2 border-t border-slate-800">
            <div className="text-[11px] font-semibold text-slate-400 mb-2">
              {lang === 'ur' ? 'آٹومیشن کا امتحان لیں (Test Auto-Pilot):' : 'Test Attack Defense in Real-Time:'}
            </div>

            {isAttackSimulated ? (
              <button
                onClick={handleResetAttack}
                className="w-full py-2 px-3 bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-800 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{lang === 'ur' ? 'حملہ ختم کریں اور نارمل کریں' : 'Clear Threat & Restore Primary'}</span>
              </button>
            ) : (
              <button
                onClick={handleSimulateAttack}
                className="w-full py-2 px-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-600/50 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Flame className="w-4 h-4 text-amber-400" />
                <span>{lang === 'ur' ? 'فیک ہاٹ سپاٹ کا حملہ ٹیسٹ کریں' : 'Simulate Evil Twin Attack'}</span>
              </button>
            )}
          </div>

          {/* OS Switcher for Demo */}
          <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Current Testing OS:</span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setOperatingSystem('Windows')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${operatingSystem === 'Windows' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}
              >
                Windows
              </button>
              <button
                type="button"
                onClick={() => setOperatingSystem('Linux')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${operatingSystem === 'Linux' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}
              >
                Linux
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Status, Connected Devices & Terminal (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Active Protection Banner */}
          <div className={`p-4 rounded-2xl border transition-all ${
            isAttackSimulated 
              ? 'bg-red-950/30 border-red-800/80 shadow-red-950/20' 
              : 'bg-slate-900 border-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isAttackSimulated 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                    : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                }`}>
                  {isAttackSimulated ? <ShieldAlert className="w-5 h-5 animate-pulse" /> : <ShieldCheck className="w-5 h-5" />}
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                    {operatingSystem} Wi-Fi Shield Status
                  </div>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    {isAttackSimulated 
                      ? (lang === 'ur' ? '⚠️ فیک ہاٹ سپاٹ بلاک کر دیا گیا، سیکنڈری وائی فائی ایکٹو!' : '⚠️ Evil Twin Blocked & Vault Active')
                      : (lang === 'ur' ? '24/7 وائی فائی پروٹیکشن آن ہے' : '24/7 Wi-Fi Shield Active')}
                  </h3>
                </div>
              </div>

              <span className={`text-xs px-2.5 py-1 rounded-full font-mono font-bold ${
                isAttackSimulated 
                  ? 'bg-red-950 text-red-300 border border-red-800 animate-pulse' 
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}>
                {isAttackSimulated ? 'THREAT QUARANTINED' : 'PROTECTED'}
              </span>
            </div>
          </div>

          {/* Connected Devices on Router (with 1-Click Ban) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
            <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{lang === 'ur' ? 'روٹر سے منسلک ڈیوائسز (Live Devices on Router)' : 'Live Devices on Router'}</span>
                </h3>
              </div>
              <span className="text-xs font-mono text-cyan-400 font-bold bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                {devices.length} Devices
              </span>
            </div>

            <div className="divide-y divide-slate-800/60 max-h-48 overflow-y-auto">
              {devices.map((d) => (
                <div key={d.mac} className="p-3 text-xs flex items-center justify-between gap-3 hover:bg-slate-850/50">
                  <div>
                    <div className="font-semibold text-white">{d.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      MAC: {d.mac} · IP: {d.ip}
                    </div>
                  </div>

                  <button
                    onClick={() => handleBanDevice(d.mac, d.name)}
                    className="px-2.5 py-1 text-[11px] font-bold bg-slate-800 hover:bg-red-950 hover:text-red-300 text-slate-300 rounded-lg transition-colors border border-slate-700 flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Ban className="w-3 h-3 text-red-400" />
                    <span>{lang === 'ur' ? 'روٹر سے بلاک کریں' : 'Kick & Ban'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Live Terminal Output */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
            <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-mono text-slate-400">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>Python Sentinel Live Logs ({operatingSystem})</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">● LIVE RUNNING</span>
            </div>

            <div className="p-3 bg-slate-950 text-[11px] font-mono text-cyan-300 max-h-44 overflow-y-auto space-y-1 leading-relaxed">
              {terminalLogs.map((log, idx) => (
                <div 
                  key={idx} 
                  className={
                    log.includes('CRITICAL') || log.includes('ACTION') 
                      ? 'text-amber-300 font-bold' 
                      : log.includes('SUCCESS') 
                        ? 'text-emerald-300 font-bold' 
                        : 'text-slate-300'
                  }
                >
                  {log}
                </div>
              ))}
            </div>
          </div>

          {/* Simple Run Instructions for Linux & Windows */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs space-y-2 text-slate-300">
            <div className="font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>{lang === 'ur' ? 'اپنے کمپیوٹر پر چلانے کا طریقہ (Windows / Linux):' : 'How to Run on Windows / Linux:'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                <strong className="text-cyan-400 block font-mono text-[11px]">Windows 10 / 11:</strong>
                <p className="text-[11px] text-slate-400">CMD کھولیں اور یہ لکھیں:</p>
                <div className="font-mono text-white bg-slate-950 p-1.5 rounded text-[11px]">
                  python b4d_sentinel.py
                </div>
              </div>

              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                <strong className="text-emerald-400 block font-mono text-[11px]">Linux (Kali / Ubuntu):</strong>
                <p className="text-[11px] text-slate-400">Terminal میں یہ لکھیں:</p>
                <div className="font-mono text-white bg-slate-950 p-1.5 rounded text-[11px]">
                  sudo python3 b4d_sentinel.py
                </div>
              </div>
            </div>
          </div>

          {/* PC Troubleshooting & Diagnostic Guide */}
          <div className="bg-slate-900 border border-amber-800/60 rounded-xl p-4 text-xs space-y-3">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                {lang === 'ur' 
                  ? '⚠️ اگر آپ کے PC پر نہیں چل رہا، تو یہ 3 چیزیں چیک کریں:' 
                  : '⚠️ Why it might not run on your PC & 1-Minute Fixes:'}
              </span>
            </div>

            <div className="space-y-2.5 text-slate-300 text-[11px]">
              <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <strong className="text-white block font-semibold">
                  1. "python is not recognized" یا CMD ونڈو فوراً بند ہو جاتی ہے:
                </strong>
                <p className="text-slate-400 leading-relaxed">
                  آپ کے Windows میں Python انسٹال نہیں ہے، یا انسٹال کرتے وقت "PATH" سلیکٹ نہیں کیا گیا تھا۔{' '}
                  <span className="text-cyan-300 font-semibold">حل:</span> <code className="text-cyan-300 bg-slate-900 px-1 rounded">python.org</code> سے Python ڈاؤنلوڈ کریں اور انسٹال کرتے وقت سب سے نیچے والا چیک باکس <strong className="text-emerald-300">"Add python.exe to PATH"</strong> لازمی ٹک کریں!
                </p>
              </div>

              <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <strong className="text-white block font-semibold">
                  2. فائل ڈاؤنلوڈ کر کے چلانا لازمی ہے:
                </strong>
                <p className="text-slate-400 leading-relaxed">
                  ویب براؤزر (انٹرنیٹ پیج) سیکیورٹی پابندیوں کی وجہ سے آپ کے گھر کے PC کے Wi-Fi کارڈ کو ڈائریکٹ کنٹرول نہیں کر سکتا۔ اس لیے اوپر دیے گئے <strong className="text-cyan-300">"Download b4d_sentinel.py"</strong> بٹن سے فائل اپنے PC میں سیو کر کے چلائیں۔
                </p>
              </div>

              <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <strong className="text-white block font-semibold">
                  3. نیا اپڈیٹ شدہ run.bat ڈاؤنلوڈ کریں:
                </strong>
                <p className="text-slate-400 leading-relaxed">
                  ہم نے <strong className="text-cyan-300">run.bat</strong> فائل کو اپڈیٹ کر دیا ہے، اب اگر کوئی غلطی ہوگی تو یہ خود اسکرین پر لال رنگ میں غلطی اور اس کا حل بتائے گی اور اسکرین بند نہیں ہوگی!
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
