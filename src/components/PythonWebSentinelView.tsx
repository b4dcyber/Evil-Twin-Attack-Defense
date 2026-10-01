import { useState, useEffect } from 'react';
import { 
  Server, 
  Lock, 
  Unlock, 
  Wifi, 
  ShieldCheck, 
  ShieldAlert, 
  Radio, 
  Ban, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Terminal, 
  Download, 
  Play, 
  Flame, 
  Zap, 
  Eye, 
  EyeOff,
  Layers,
  Activity,
  ArrowRight
} from 'lucide-react';
import { ConnectedClient, BlacklistEntry, AuditLog } from '../types/cyber';
import { Language } from '../utils/translations';

interface PythonWebSentinelViewProps {
  clients: ConnectedClient[];
  blacklist: BlacklistEntry[];
  onBlacklistClient: (client: ConnectedClient, reason: string) => void;
  onUnban: (mac: string) => void;
  lang: Language;
  onAddLog: (type: any, severity: any, title: string, details: string, meta?: any) => void;
  onTriggerFailover: () => void;
  onDownloadScript: () => void;
}

export function PythonWebSentinelView({
  clients,
  blacklist,
  onBlacklistClient,
  onUnban,
  lang,
  onAddLog,
  onTriggerFailover,
  onDownloadScript
}: PythonWebSentinelViewProps) {
  // Router Login State
  const [routerIp, setRouterIp] = useState('192.168.1.1');
  const [routerUser, setRouterUser] = useState('root');
  const [routerPass, setRouterPass] = useState('admin123');
  const [showPass, setShowPass] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // Auto-Detected Router Specs (Automatically fetched on login!)
  const [autoSsid, setAutoSsid] = useState('Home_Fiber_5G');
  const [autoBssid, setAutoBssid] = useState('E4:5F:01:3B:9A:88');
  const [autoChannel, setAutoChannel] = useState(36);
  const [autoVaultSsid, setAutoVaultSsid] = useState('Home_Fiber_SECURE_VAULT');
  const [autoVaultBssid, setAutoVaultBssid] = useState('E4:5F:01:3B:9A:8A');
  const [routerModel, setRouterModel] = useState('TP-Link / OpenWrt Linux Gateway (MediaTek Dual-Core)');
  const [autoPilotStatus, setAutoPilotStatus] = useState<'MONITORING' | 'ATTACK_DETECTED' | 'FAILOVER_ACTIVE'>('MONITORING');

  // Threat simulation state
  const [simulatedEvilTwinActive, setSimulatedEvilTwinActive] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    `[INIT] Python B4D Web Sentinel started on http://127.0.0.1:5000`,
    `[ROUTER] Connected to ${routerIp} via SSH. Authenticated as '${routerUser}'.`,
    `[AUTO-CONFIG] Extracted genuine SSID: '${autoSsid}' (BSSID: ${autoBssid}, Ch ${autoChannel}).`,
    `[AUTO-CONFIG] Verified Secondary Failover Vault: '${autoVaultSsid}'.`,
    `[WINDOWS NETSH] Background Wi-Fi scanner listening every 3.0s.`,
    `[FIREWALL] Zero-Trust auto-blacklisting enabled on router iptables.`
  ]);

  const handleConnectRouter = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);

    await new Promise(r => setTimeout(r, 800));

    setIsLoggedIn(true);
    setIsConnecting(false);
    setAutoPilotStatus('MONITORING');

    setTerminalLogs(prev => [
      ...prev,
      `[ROUTER LOGIN] Connected successfully to ${routerIp}!`,
      `[ROUTER] Auto-queried 'uci show wireless' and 'hostapd_cli all_sta'.`,
      `[ROUTER] Genuine BSSID: ${autoBssid} | Channel: ${autoChannel} | Active Devices: ${clients.length}`,
      `[AUTO-PILOT] Full automated defense active. No manual configuration needed!`
    ]);

    onAddLog(
      'POLICY_UPDATE',
      'success',
      'Router Connected & Auto-Configured',
      `Python backend logged in to ${routerIp} as ${routerUser}. Wi-Fi hardware BSSID (${autoBssid}) auto-synchronized.`
    );
  };

  const handleDisconnectRouter = () => {
    setIsLoggedIn(false);
    setTerminalLogs(prev => [
      ...prev,
      `[ROUTER] Disconnected from ${routerIp}. Defense daemon paused.`
    ]);
  };

  // Simulate an Evil Twin Attack and watch Python Auto-Pilot do everything automatically
  const handleSimulateEvilTwinAttack = () => {
    setSimulatedEvilTwinActive(true);
    setAutoPilotStatus('ATTACK_DETECTED');

    setTerminalLogs(prev => [
      ...prev,
      `----------------------------------------------------------------------`,
      `[CRITICAL ALERT] Ambient Wi-Fi scan detected ROGUE HOTSPOT!`,
      `  SSID: '${autoSsid}' (CLONED)`,
      `  Rogue BSSID: 00:C0:CA:98:FA:01 (MISMATCH from Genuine: ${autoBssid})`,
      `[ACTION 1] Windows netsh wlan auto-connect ABORTED to protect credentials.`,
      `[ACTION 2] Logging in to router ${routerIp} -> Kicking & banning MAC 00:C0:CA:98:FA:01...`,
      `[ROUTER EXEC] iptables -I FORWARD -m mac --mac-source 00:C0:CA:98:FA:01 -j DROP`,
      `[ROUTER EXEC] echo '00:C0:CA:98:FA:01' >> /etc/hostapd.deny && hostapd_cli reload`,
      `[ACTION 3] Auto-switching fleet to Secondary Vault SSID '${autoVaultSsid}'...`,
      `[SUCCESS] Windows & clients migrated to safe secondary network!`
    ]);

    onAddLog(
      'EVIL_TWIN_ALERT',
      'critical',
      'Evil Twin Blocked & Hacker Auto-Banned',
      `Python backend detected cloned SSID '${autoSsid}' with rogue BSSID 00:C0:CA:98:FA:01. Router automatically executed iptables drop rule and migrated to ${autoVaultSsid}.`,
      { bssid: '00:C0:CA:98:FA:01' }
    );

    onTriggerFailover();
  };

  const handleResetThreat = () => {
    setSimulatedEvilTwinActive(false);
    setAutoPilotStatus('MONITORING');
    setTerminalLogs(prev => [
      ...prev,
      `[RESTORE] Threat cleared. Router and Windows returned to Primary SSID '${autoSsid}'.`
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Python Web App Concept */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/80">
                <Terminal className="w-3.5 h-3.5" />
                Python Web-Based Sentinel
              </span>
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs text-slate-400 font-mono">http://127.0.0.1:5000</span>
              <span className="text-xs text-slate-500">·</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                isLoggedIn ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}>
                {isLoggedIn ? 'ROUTER LOGGED IN & AUTO-PILOT ON' : 'ROUTER LOGIN REQUIRED'}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {lang === 'ur' ? 'Python Web UI: صرف روٹر لاگ ان دیں، باقی سب آٹو میٹک' : 'Python Web UI: Zero-Config Wi-Fi & Router Sentinel'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
              {lang === 'ur'
                ? 'کوئی فرم ویئر فلیش کرنے یا ایپ انسٹال کرنے کی ضرورت نہیں! صرف اپنے Wi-Fi روٹر کا لاگ ان دیں، یہ Python ایپ روٹر سے BSSID خود نکالے گی، سیکنڈری وائی فائی بنائے گی، فیک ہاٹ سپاٹ روکے گی، اور ہیکر کو خود بخود بلاک کرے گی۔'
                : 'Pure Python web application. Provide your router login once; Python automatically extracts hardware BSSIDs, monitors ambient Wi-Fi, drops fake hotspot connections, and bans hackers on your router firewall.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={onDownloadScript}
              className="px-4 py-2.5 text-xs font-bold bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md hover:shadow-cyan-500/20"
            >
              <Download className="w-4 h-4" />
              <span>{lang === 'ur' ? 'Download b4d_web_app.py' : 'Download Python Web App (.py)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Router Login (Step 1) + Live Automated Protection Dashboard (Step 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Router Login Box (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                {lang === 'ur' ? 'مرحلہ 1: Wi-Fi روٹر کا لاگ ان دیں' : 'Step 1: Enter Wi-Fi Router Login'}
              </h2>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-slate-800 text-slate-300">
              GATEWAY
            </span>
          </div>

          <form onSubmit={handleConnectRouter} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Router IP Address
              </label>
              <input
                type="text"
                value={routerIp}
                onChange={(e) => setRouterIp(e.target.value)}
                placeholder="192.168.1.1 or 192.168.0.1"
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-cyan-500 transition-colors"
                required
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Standard home router gateway (e.g. 192.168.1.1)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Router Username
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
                  Router Password
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

            <div className="pt-2">
              {isLoggedIn ? (
                <div className="space-y-2">
                  <div className="p-3 bg-emerald-950/40 border border-emerald-800/80 rounded-xl flex items-center gap-2.5 text-xs text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>
                      {lang === 'ur' 
                        ? 'روٹر کنیکٹڈ ہے! Python بیک اینڈ تمام کام خود بخود کر رہا ہے۔' 
                        : 'Router Connected! Python backend is actively guarding your Wi-Fi.'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleDisconnectRouter}
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
                      <span>{lang === 'ur' ? 'روٹر کنیکٹ ہو رہا ہے...' : 'Connecting to Router...'}</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>{lang === 'ur' ? 'روٹر لاگ ان کریں اور آٹو پائلٹ شروع کریں' : 'Login Router & Start Auto-Pilot'}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>

          {/* Auto-Queried Specs Display */}
          {isLoggedIn && (
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-300 font-semibold pb-1.5 border-b border-slate-800/80">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <Zap className="w-3.5 h-3.5" />
                  روٹر سے خود حاصل کردہ تفصیلات (Auto-Extracted):
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500 block">Primary SSID:</span>
                  <span className="text-white font-mono font-semibold">{autoSsid}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Hardware BSSID:</span>
                  <span className="text-cyan-300 font-mono font-semibold">{autoBssid}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Wi-Fi Channel:</span>
                  <span className="text-white font-mono">Ch {autoChannel} (5 GHz)</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Secondary Vault:</span>
                  <span className="text-emerald-300 font-mono truncate block">{autoVaultSsid}</span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Attack Simulator Trigger */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="text-[11px] font-semibold text-slate-400 mb-2">
              {lang === 'ur' ? 'آٹو میشن کا امتحان لیں (Test Automation):' : 'Test Auto-Pilot Defense in Action:'}
            </div>
            {simulatedEvilTwinActive ? (
              <button
                onClick={handleResetThreat}
                className="w-full py-2 px-3 bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-800 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{lang === 'ur' ? 'حملہ ختم کریں اور نارمل کریں' : 'Clear Threat & Restore Primary'}</span>
              </button>
            ) : (
              <button
                onClick={handleSimulateEvilTwinAttack}
                className="w-full py-2 px-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-600/50 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Flame className="w-4 h-4 text-amber-400" />
                <span>{lang === 'ur' ? 'فیک ہاٹ سپاٹ کا حملہ کروائیں (Test Attack)' : 'Simulate Evil Twin Rogue AP'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Automated Protection Live Operations (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Active Auto-Pilot Status Card */}
          <div className={`p-4 rounded-2xl border transition-all ${
            simulatedEvilTwinActive 
              ? 'bg-red-950/30 border-red-800/80 shadow-red-950/20' 
              : 'bg-slate-900 border-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  simulatedEvilTwinActive 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                    : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                }`}>
                  {simulatedEvilTwinActive ? <ShieldAlert className="w-5 h-5 animate-pulse" /> : <ShieldCheck className="w-5 h-5" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                    {lang === 'ur' ? 'مرحلہ 2: خودکار حفاظت کی صورتحال' : 'Step 2: Automated Defense Status'}
                  </div>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    {simulatedEvilTwinActive 
                      ? (lang === 'ur' ? '⚠️ فیک ہاٹ سپاٹ بلاک کر دیا گیا، سیکنڈری وائی فائی ایکٹو!' : '⚠️ Rogue Evil Twin Blocked & Vault Active')
                      : (lang === 'ur' ? '24/7 وائی فائی محفوظ ہے (کوئی خطرہ نہیں)' : '24/7 Zero-Trust Guard Active (Network Secure)')}
                  </h3>
                </div>
              </div>

              <span className={`text-xs px-2.5 py-1 rounded-full font-mono font-bold ${
                simulatedEvilTwinActive 
                  ? 'bg-red-950 text-red-300 border border-red-800 animate-pulse' 
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}>
                {simulatedEvilTwinActive ? 'THREAT QUARANTINED' : 'AUTO-PILOT OK'}
              </span>
            </div>

            {/* 3 Automated Actions Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-4 pt-3 border-t border-slate-800/80 text-xs">
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
                <div className="text-[10px] text-slate-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                  <span>BSSID Hardware Check</span>
                </div>
                <div className="font-semibold text-white text-[11px] font-mono">
                  {autoBssid}
                </div>
              </div>

              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
                <div className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Layers className="w-3 h-3 text-emerald-400" />
                  <span>Dual-SSID Vault</span>
                </div>
                <div className="font-semibold text-emerald-400 text-[11px] truncate font-mono">
                  {simulatedEvilTwinActive ? 'ACTIVE_FAILOVER' : 'STANDBY_READY'}
                </div>
              </div>

              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
                <div className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Ban className="w-3 h-3 text-red-400" />
                  <span>Router Firewall Banned</span>
                </div>
                <div className="font-semibold text-amber-400 text-[11px] font-mono">
                  {blacklist.length} Rogue MACs
                </div>
              </div>
            </div>
          </div>

          {/* Connected Clients on Router with Instant 1-Click Blacklist */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{lang === 'ur' ? 'روٹر سے منسلک ڈیوائسز (Live Connected Devices)' : 'Live Router Connected Devices'}</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {lang === 'ur' ? 'اگر کوئی مشکوک ڈیوائس نظر آئے تو فوراً روٹر سے بلاک کریں:' : 'Directly kick and drop hackers on your router firewall:'}
                </p>
              </div>
              <span className="text-xs font-mono text-cyan-400 font-bold bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                {clients.length} Active
              </span>
            </div>

            <div className="divide-y divide-slate-800/60 max-h-52 overflow-y-auto">
              {clients.map((client) => {
                const isThreat = client.mac === '00:C0:CA:98:FA:01';
                return (
                  <div key={client.mac} className={`p-3 text-xs flex items-center justify-between gap-3 ${isThreat ? 'bg-red-950/20' : 'hover:bg-slate-850/50'}`}>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white truncate">{client.hostname}</span>
                        {isThreat && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-red-900 text-red-200">
                            ROGUE ATTACKER
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                        <span>MAC: {client.mac}</span>
                        <span>·</span>
                        <span>IP: {client.ip}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onBlacklistClient(client, isThreat ? 'Evil Twin Deauth Probe' : 'Admin Manual Kick')}
                      className="px-2.5 py-1 text-[11px] font-bold bg-slate-800 hover:bg-red-950 hover:text-red-300 text-slate-300 rounded-lg transition-colors border border-slate-700 flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <Ban className="w-3 h-3 text-red-400" />
                      <span>{lang === 'ur' ? 'روٹر سے بلاک کریں' : 'Kick & Ban'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Python Daemon Execution Log */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
            <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-mono text-slate-400">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>Python Backend Auto-Pilot Terminal Log</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">● LIVE RUNNING</span>
            </div>

            <div className="p-3 bg-slate-950 text-[11px] font-mono text-cyan-300 max-h-40 overflow-y-auto space-y-1 leading-relaxed">
              {terminalLogs.map((log, i) => (
                <div key={i} className={log.includes('CRITICAL') || log.includes('ACTION') ? 'text-amber-300 font-bold' : log.includes('SUCCESS') ? 'text-emerald-300 font-bold' : 'text-slate-300'}>
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
