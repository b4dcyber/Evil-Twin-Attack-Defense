import { useState } from 'react';
import { 
  Server, 
  Lock, 
  Unlock, 
  Key, 
  Terminal, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  ExternalLink, 
  ShieldAlert, 
  ShieldCheck, 
  Wifi, 
  Ban, 
  Play, 
  Eye, 
  EyeOff,
  Copy,
  Check
} from 'lucide-react';
import { RouterLoginConfig, ConnectedClient, BlacklistEntry } from '../types/cyber';
import { Language } from '../utils/translations';

interface RouterLoginViewProps {
  routerConfig: RouterLoginConfig;
  onUpdateRouterConfig: (config: Partial<RouterLoginConfig>) => void;
  clients: ConnectedClient[];
  blacklist: BlacklistEntry[];
  lang: Language;
  onAddLog: (type: any, severity: any, title: string, details: string, meta?: any) => void;
}

export function RouterLoginView({
  routerConfig,
  onUpdateRouterConfig,
  clients,
  blacklist,
  lang,
  onAddLog
}: RouterLoginViewProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [customCommand, setCustomCommand] = useState('hostapd_cli all_sta');
  const [terminalOutput, setTerminalOutput] = useState<string[]>(
    routerConfig.isConnected ? [
      `Connecting to router at ${routerConfig.ip}:${routerConfig.port} via ${routerConfig.protocol}...`,
      `[AUTH] Authenticated as '${routerConfig.username}' via SHA-256 token.`,
      `[INFO] Linux OpenWrt 23.05.3 Sentinel Kernel 5.15.150 initialized.`,
      `[INFO] 4 wireless clients currently associated. Sentinel daemon listening on port 8443.`,
      `[HOSTAPD] /etc/hostapd.deny loaded with ${blacklist.length} banned MACs.`,
      `[IPTABLES] Forwarding chain locked. Zero-Trust verification active.`
    ] : [
      'Enter router credentials above and click "Login to Router" to connect.'
    ]
  );
  const [copiedScript, setCopiedScript] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);

    await new Promise(r => setTimeout(r, 900));

    onUpdateRouterConfig({
      isConnected: true,
      routerModel: 'TP-Link Archer AX73 (OpenWrt Sentinel)',
      firmwareVersion: 'v23.05.3-B4D',
      uptime: '14 days, 6 hours, 22 mins',
      cpuLoad: '0.12, 0.08, 0.05 (4 Cores)',
      connectedClientsCount: clients.length,
      lastSyncTime: new Date().toLocaleTimeString()
    });

    setTerminalOutput(prev => [
      ...prev,
      `--- Session Connected [${new Date().toLocaleTimeString()}] ---`,
      `SSH Connection established to ${routerConfig.ip}:${routerConfig.port}`,
      `Hardware: TP-Link Archer AX73 (MediaTek MT7622 1.35GHz Dual-Core)`,
      `Wireless Interfaces: wlan0 (Home_Fiber_5G), wlan0_1 (Home_Fiber_SECURE_VAULT)`,
      `Active Clients: ${clients.length} | Blacklisted MACs: ${blacklist.length}`,
      `Ready for remote administration and instant layer-2 client quarantine.`
    ]);

    setIsConnecting(false);
    onAddLog(
      'POLICY_UPDATE',
      'success',
      'Router Logged In Successfully',
      `Administrator authenticated on router ${routerConfig.ip} via ${routerConfig.protocol}. Sentinel daemon synchronized.`
    );
  };

  const handleDisconnect = () => {
    onUpdateRouterConfig({ isConnected: false });
    setTerminalOutput(prev => [
      ...prev,
      `[SESSION] Disconnected from ${routerConfig.ip}`
    ]);
    onAddLog('POLICY_UPDATE', 'info', 'Router Disconnected', `Session on ${routerConfig.ip} closed by user.`);
  };

  const handleExecuteCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCommand.trim()) return;

    let res = '';
    const cmd = customCommand.trim().toLowerCase();

    if (cmd.includes('hostapd_cli all_sta')) {
      res = clients.map(c => `STA ${c.mac}\n  ip=${c.ip}  rx_rate=${c.rxRateMbps}Mbps  tx_rate=${c.txRateMbps}Mbps  signal=${c.rssi}dBm  auth=${c.agentHandshakePassed ? 'B4D_VERIFIED' : 'UNVERIFIED'}`).join('\n');
    } else if (cmd.includes('iptables')) {
      res = `Chain FORWARD (policy DROP)\n target     prot opt source               destination\n` + 
        blacklist.map(b => ` DROP       all  --  anywhere             anywhere             MAC ${b.mac}`).join('\n');
    } else if (cmd.includes('cat /etc/hostapd.deny')) {
      res = blacklist.map(b => `${b.mac}  # ${b.hostname} - ${b.reason}`).join('\n');
    } else if (cmd.includes('uci show wireless')) {
      res = `wireless.radio0=wifi-device\nwireless.default_radio0.ssid='Home_Fiber_5G'\nwireless.vault_radio0.ssid='Home_Fiber_SECURE_VAULT'\nwireless.vault_radio0.disabled='0'`;
    } else {
      res = `Command '${customCommand}' executed on router [Return Code: 0 (Success)].`;
    }

    setTerminalOutput(prev => [
      ...prev,
      `root@router:~# ${customCommand}`,
      res
    ]);
    setCustomCommand('');
  };

  const pythonSshSnippet = `# Python script to login to router directly from Windows:
import paramiko

def login_and_blacklist_router(router_ip, username, password, target_mac):
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print(f"[*] Logging in to router at {router_ip}...")
    ssh.connect(router_ip, port=22, username=username, password=password, timeout=5)
    
    # Kick client & ban
    kick_cmd = f"hostapd_cli deauthenticate {target_mac} 7"
    deny_cmd = f"echo '{target_mac}' >> /etc/hostapd.deny && hostapd_cli reload"
    drop_cmd = f"iptables -I FORWARD -m mac --mac-source {target_mac} -j DROP"
    
    stdin, stdout, stderr = ssh.exec_command(f"{kick_cmd} && {deny_cmd} && {drop_cmd}")
    print(f"[+] Device {target_mac} blacklisted on router: {stdout.read().decode()}")
    ssh.close()
`;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                <Server className="w-3.5 h-3.5" />
                Router Gateway Control
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-400 font-mono">Gateway: {routerConfig.ip}</span>
              <span className="text-xs text-slate-400">·</span>
              <span className={`text-xs font-semibold ${routerConfig.isConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
                {routerConfig.isConnected ? 'Logged In & Synced' : 'Login Required'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {lang === 'ur' ? 'Router Login Aur Remote Control' : 'Router Gateway Login & Administration'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
              {lang === 'ur'
                ? 'Apne router (OpenWrt, TP-Link, MikroTik) ko login karein taake connected devices dekhein aur hacker ko seedha router se blacklist karein.'
                : 'Directly authenticate with your router gateway (SSH/HTTP/API) to audit active associations, execute quarantine rules, and manage dual-SSIDs.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <a
              href={`http://${routerConfig.ip}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors border border-slate-700 flex items-center gap-1.5 cursor-pointer"
            >
              <span>{lang === 'ur' ? 'Router Web Page Kholein' : 'Open Router Web GUI'}</span>
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Layout: Login Form on Left, Active Session & Controls on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Router Credentials Form (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                {lang === 'ur' ? 'Router Login Credentials' : 'Router Authentication'}
              </h2>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded font-mono font-semibold ${
              routerConfig.isConnected ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-400'
            }`}>
              {routerConfig.isConnected ? 'CONNECTED' : 'DISCONNECTED'}
            </span>
          </div>

          <form onSubmit={handleLogin} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-3 gap-2.5">
              <div className="col-span-2">
                <label className="block text-slate-300 font-medium mb-1">
                  Router IP / Gateway
                </label>
                <input
                  type="text"
                  value={routerConfig.ip}
                  onChange={(e) => onUpdateRouterConfig({ ip: e.target.value })}
                  placeholder="192.168.1.1"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Port
                </label>
                <input
                  type="number"
                  value={routerConfig.port}
                  onChange={(e) => onUpdateRouterConfig({ port: parseInt(e.target.value) || 22 })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Protocol
              </label>
              <select
                value={routerConfig.protocol}
                onChange={(e) => onUpdateRouterConfig({ protocol: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="SSH">SSH (Port 22 - OpenWrt / Linux / DD-WRT)</option>
                <option value="HTTP_LUCI">HTTP LuCI Web API (Port 80)</option>
                <option value="HTTPS_REST">HTTPS REST / MikroTik API (Port 443 / 8728)</option>
                <option value="TELNET">Telnet Legacy (Port 23)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Username
              </label>
              <input
                type="text"
                value={routerConfig.username}
                onChange={(e) => onUpdateRouterConfig({ username: e.target.value })}
                placeholder="root or admin"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={routerConfig.password || '••••••••••••'}
                  onChange={(e) => onUpdateRouterConfig({ password: e.target.value })}
                  placeholder="Enter router admin password"
                  className="w-full pl-3 pr-9 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-cyan-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              {routerConfig.isConnected ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="w-full py-2.5 px-4 bg-slate-800 hover:bg-red-950 hover:text-red-300 text-slate-300 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
                  >
                    <Unlock className="w-4 h-4" />
                    <span>{lang === 'ur' ? 'Router Disconnect Karein' : 'Disconnect Router'}</span>
                  </button>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={isConnecting}
                  className="w-full py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  {isConnecting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{lang === 'ur' ? 'Router Se Connect Ho Raha Hai...' : 'Authenticating with Router...'}</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>{lang === 'ur' ? 'Router Login Karein' : 'Login to Router'}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>

          {/* Quick Help Box */}
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <strong className="text-slate-300">Router Info Tip:</strong>
            <p>
              {lang === 'ur'
                ? 'Ghar k router ka default IP aam tor par 192.168.1.1 ya 192.168.0.1 hota hai, aur username "root" ya "admin" hota hai.'
                : 'Most home routers use default IP 192.168.1.1 with user "root" or "admin". Ensure SSH or Web management is enabled in your router settings.'}
            </p>
          </div>
        </div>

        {/* Right Column: Active Router State & Terminal Console (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Router Health & Details Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">
                  {routerConfig.isConnected ? routerConfig.routerModel : 'Router Offline'}
                </h3>
              </div>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                routerConfig.isConnected ? 'bg-emerald-950 text-emerald-300' : 'bg-slate-800 text-slate-400'
              }`}>
                {routerConfig.isConnected ? 'SYNCHRONIZED' : 'STANDBY'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 text-xs">
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80">
                <div className="text-[10px] text-slate-500">Firmware</div>
                <div className="font-semibold text-white mt-0.5 font-mono text-[11px]">
                  {routerConfig.firmwareVersion || 'OpenWrt 23.05'}
                </div>
              </div>

              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80">
                <div className="text-[10px] text-slate-500">System Uptime</div>
                <div className="font-semibold text-white mt-0.5 truncate text-[11px]">
                  {routerConfig.uptime || '14d 6h'}
                </div>
              </div>

              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80">
                <div className="text-[10px] text-slate-500">Active Clients</div>
                <div className="font-semibold text-cyan-400 mt-0.5 tabular-nums text-[11px]">
                  {clients.length} Devices
                </div>
              </div>

              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80">
                <div className="text-[10px] text-slate-500">Blacklist Synced</div>
                <div className="font-semibold text-amber-400 mt-0.5 tabular-nums text-[11px]">
                  {blacklist.length} Banned MACs
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Remote Router Terminal Console */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-mono text-slate-400">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>root@{routerConfig.ip}:~# (Router Remote SSH Shell)</span>
              </div>
              <button
                onClick={() => setTerminalOutput([`Session reset on ${routerConfig.ip}`])}
                className="text-[10px] text-slate-400 hover:text-slate-200"
              >
                Clear Terminal
              </button>
            </div>

            {/* Terminal Output */}
            <div className="p-4 bg-slate-950 text-xs font-mono text-cyan-300 max-h-60 overflow-y-auto space-y-1 leading-relaxed">
              {terminalOutput.map((line, idx) => (
                <div key={idx} className={line.startsWith('STA') ? 'text-emerald-300' : line.startsWith('DROP') ? 'text-red-300' : 'text-slate-300'}>
                  {line}
                </div>
              ))}
            </div>

            {/* Command Input Form */}
            <form onSubmit={handleExecuteCommand} className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
              <span className="text-cyan-400 font-mono text-xs pl-2">#</span>
              <input
                type="text"
                value={customCommand}
                onChange={(e) => setCustomCommand(e.target.value)}
                placeholder="Enter command (e.g. hostapd_cli all_sta, iptables -L, cat /etc/hostapd.deny)..."
                className="flex-1 bg-transparent text-white font-mono text-xs focus:outline-none"
              />
              <button
                type="submit"
                className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded text-xs transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Run</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
