import { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Cpu, 
  Ban, 
  Trash2, 
  AlertTriangle, 
  Terminal, 
  Users, 
  Server, 
  Plus, 
  Check, 
  Activity,
  Layers,
  Radio,
  FileCode
} from 'lucide-react';
import { ConnectedClient, BlacklistEntry } from '../types/cyber';
import { Language, translations } from '../utils/translations';
import { formatMac } from '../utils/crypto';

interface FirmwareViewProps {
  clients: ConnectedClient[];
  blacklist: BlacklistEntry[];
  lang: Language;
  onBlacklistClient: (client: ConnectedClient, reason?: string) => void;
  onManualBlacklist: (mac: string, hostname: string, reason: string) => void;
  onUnban: (mac: string) => void;
  onAddLog: (type: any, severity: any, title: string, details: string, meta?: any) => void;
}

export function FirmwareView({
  clients,
  blacklist,
  lang,
  onBlacklistClient,
  onManualBlacklist,
  onUnban,
  onAddLog
}: FirmwareViewProps) {
  const t = translations[lang];

  // Manual blacklist form state
  const [manualMac, setManualMac] = useState('');
  const [manualHostname, setManualHostname] = useState('');
  const [manualReason, setManualReason] = useState('Unauthorized probe & failed agent verification');
  const [formError, setFormError] = useState('');
  const [activeModalCode, setActiveModalCode] = useState<'iptables' | 'hostapd' | null>(null);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    const formatted = formatMac(manualMac.trim());

    if (!macRegex.test(formatted)) {
      setFormError(
        lang === 'ur'
          ? 'MAC address ka format ghalat hai! Sahi format: 00:C0:CA:98:FA:01'
          : 'Invalid MAC address format. Example: 00:C0:CA:98:FA:01'
      );
      return;
    }

    if (blacklist.some(b => b.mac.toUpperCase() === formatted)) {
      setFormError(
        lang === 'ur'
          ? 'Yeh MAC pehle se blacklist mein mojood hai.'
          : 'This MAC address is already blacklisted.'
      );
      return;
    }

    onManualBlacklist(formatted, manualHostname || 'Rogue-Device', manualReason);
    setManualMac('');
    setManualHostname('');
    setFormError('');
  };

  const hackerClients = clients.filter(c => c.threatStatus === 'ROGUE_HACKER');

  return (
    <div className="space-y-6">
      {/* Firmware Status Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                <Server className="w-3.5 h-3.5" />
                Universal Router Sentinel (OpenWrt / MikroTik / TP-Link / DD-WRT)
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-400 font-mono">Dual-SSID Ready</span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-emerald-400 font-semibold">
                {lang === 'ur' ? 'Firmware Active & Listening' : 'Mutual Auth Daemon Active'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {t.firmwareTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
              {t.firmwareSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveModalCode('hostapd')}
              className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors border border-slate-700 flex items-center gap-1.5 cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              <span>hostapd.deny ({blacklist.length})</span>
            </button>
            <button
              onClick={() => setActiveModalCode('iptables')}
              className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors border border-slate-700 flex items-center gap-1.5 cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>iptables Rules</span>
            </button>
          </div>
        </div>

        {/* Firmware Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800/80">
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
            <div className="text-[11px] text-slate-400 font-medium">
              {lang === 'ur' ? 'Connected Devices' : 'Active Associated Clients'}
            </div>
            <div className="text-lg font-bold text-white mt-0.5 tabular-nums flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>{clients.length} Clients</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              {clients.filter(c => c.agentHandshakePassed).length} Verified by Agent
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
            <div className="text-[11px] text-slate-400 font-medium">
              {lang === 'ur' ? 'Hacker & Rogue Probes' : 'Rogue Hacker Detections'}
            </div>
            <div className={`text-lg font-bold mt-0.5 tabular-nums flex items-center gap-2 ${
              hackerClients.length > 0 ? 'text-red-400' : 'text-emerald-400'
            }`}>
              <ShieldAlert className="w-4 h-4" />
              <span>{hackerClients.length} Critical</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Deauth attack / MAC spoofer
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
            <div className="text-[11px] text-slate-400 font-medium">
              {lang === 'ur' ? 'Blacklisted Devices' : 'Blacklist Quarantine'}
            </div>
            <div className="text-lg font-bold text-amber-400 mt-0.5 tabular-nums flex items-center gap-2">
              <Ban className="w-4 h-4" />
              <span>{blacklist.length} Banned MACs</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Layer-2 + Layer-3 Dropped
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
            <div className="text-[11px] text-slate-400 font-medium">
              {lang === 'ur' ? 'Ed25519 Router Keypair' : 'AP Hardware Signature'}
            </div>
            <div className="text-xs font-mono font-bold text-cyan-400 mt-1 truncate">
              b4d_ed25519_pk_79c1...
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Cryptographic Enclave Ready
            </div>
          </div>
        </div>
      </div>

      {/* Critical Hacker Alert Banner if any hacker connected */}
      {hackerClients.length > 0 && (
        <div className="p-4 bg-red-950/40 border border-red-500/50 rounded-xl space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-red-300 font-bold text-sm">
              <ShieldAlert className="w-5 h-5 text-red-400" />
              <span>{lang === 'ur' ? 'HACKER DEVICE DETECT HO GAYI HAI!' : 'ROGUE HACKER DEVICE ATTACHED TO AP!'}</span>
            </div>
            <span className="text-xs text-red-400 font-mono">
              Action Required: Immediate Blacklist
            </span>
          </div>
          <p className="text-xs text-red-200/80">
            {lang === 'ur'
              ? 'Router firmware sentinel ne suspicious device pakad li hai jo deauth frames bhej rahi hai aur jiska agent handshake fail hai. Niche diye gaye button se foran blacklist karein taake router se kick out ho jaye.'
              : 'The OpenWrt sentinel detected unauthorized packet injection and high-rate 802.11 deauth frames from an unverified client. Immediate MAC ban and packet drop recommended.'}
          </p>
        </div>
      )}

      {/* Connected Clients Inspection Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              {t.connectedDevices} ({clients.length})
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            {lang === 'ur' ? 'Live Router Association Table' : 'Live Router Association Table'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold text-slate-400 tracking-wider">
                <th className="py-3 px-4">DEVICE &amp; IP</th>
                <th className="py-3 px-4">MAC &amp; VENDOR</th>
                <th className="py-3 px-4">AGENT HANDSHAKE</th>
                <th className="py-3 px-4">PACKET ANOMALY</th>
                <th className="py-3 px-4">TRUST SCORE</th>
                <th className="py-3 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {clients.map((client) => {
                const isHacker = client.threatStatus === 'ROGUE_HACKER';
                return (
                  <tr
                    key={client.id}
                    className={`transition-colors ${
                      isHacker
                        ? 'bg-red-950/20 hover:bg-red-950/30'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Device & IP */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <span>{client.hostname}</span>
                        {isHacker && (
                          <span className="px-1.5 py-0.2 text-[9px] bg-red-900 text-red-200 rounded font-bold">
                            ATTACKER
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {client.ip} · {client.connectionTime} · <span className="text-cyan-400 font-sans font-medium">{client.activeSsid || 'Home_Fiber_5G'}</span>
                      </div>
                    </td>

                    {/* MAC & Vendor */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className={`font-semibold ${isHacker ? 'text-red-400' : 'text-slate-300'}`}>
                        {client.mac}
                      </div>
                      <div className="text-[11px] text-slate-400 font-sans mt-0.5 truncate max-w-[200px]">
                        {client.vendor}
                        {client.macRandomized && (
                          <span className="ml-1 text-[10px] text-amber-400">(Randomized MAC)</span>
                        )}
                      </div>
                    </td>

                    {/* Agent Handshake */}
                    <td className="py-3.5 px-4">
                      {client.agentHandshakePassed ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-medium text-xs">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>{lang === 'ur' ? 'Verified Pass' : 'Cryptographically Verified'}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-400 font-medium text-xs">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>{lang === 'ur' ? 'No Handshake (Rogue)' : 'Unverified / No Agent'}</span>
                        </span>
                      )}
                    </td>

                    {/* Packet Anomaly */}
                    <td className="py-3.5 px-4 font-mono">
                      {client.deauthFrameCount > 0 ? (
                        <div className="text-red-400 font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{client.deauthFrameCount} Deauth Floods</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">0 anomalies</span>
                      )}
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        RX {client.rxRateMbps} Mbps / TX {client.txRateMbps} Mbps
                      </div>
                    </td>

                    {/* Trust Score */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              client.trustScore > 75
                                ? 'bg-emerald-400'
                                : client.trustScore > 40
                                ? 'bg-amber-400'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${client.trustScore}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs tabular-nums text-slate-300 font-semibold">
                          {client.trustScore}%
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {client.threatStatus}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onBlacklistClient(client)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
                          isHacker
                            ? 'bg-red-600 hover:bg-red-500 text-white shadow-sm'
                            : 'bg-slate-800 hover:bg-red-950 hover:text-red-300 text-slate-300 border border-slate-700'
                        }`}
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>{t.quickBan}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unauthorized Device Blacklist Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Blacklist Table (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ban className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                {t.blacklistManager} ({blacklist.length})
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              hostapd.deny + iptables DROP
            </span>
          </div>

          {blacklist.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No blacklisted devices currently. All unauthorized clients will appear here.
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {blacklist.map((item) => (
                <div key={item.id} className="p-4 flex items-start justify-between gap-3 hover:bg-slate-800/30 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-red-400">
                        {item.mac}
                      </span>
                      <span className="text-xs font-medium text-slate-300">
                        ({item.hostname})
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded">
                        {item.source}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 mt-1">
                      {item.reason}
                    </div>

                    <div className="text-[10px] font-mono text-cyan-400/80 bg-slate-950 px-2 py-1 rounded mt-2 border border-slate-800 inline-block">
                      {item.iptablesRule}
                    </div>
                  </div>

                  <button
                    onClick={() => onUnban(item.mac)}
                    className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-red-300 hover:bg-red-950/40 rounded transition-colors border border-slate-800 flex items-center gap-1 cursor-pointer shrink-0"
                    title={t.unban}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t.unban}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Manual Blacklist Entry Form (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Plus className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              {lang === 'ur' ? 'Device Ko Manually Blacklist Karein' : 'Manual MAC Blacklist Entry'}
            </h2>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                {lang === 'ur' ? 'Hacker / Device Ka MAC Address' : 'Target MAC Address'}
              </label>
              <input
                type="text"
                value={manualMac}
                onChange={(e) => setManualMac(e.target.value)}
                placeholder="e.g. 00:C0:CA:98:FA:01"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                {lang === 'ur' ? 'Device Ka Naam (Optional)' : 'Device Identifier / Hostname'}
              </label>
              <input
                type="text"
                value={manualHostname}
                onChange={(e) => setManualHostname(e.target.value)}
                placeholder="e.g. Rogue-Kali-Attacker"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                {lang === 'ur' ? 'Blacklist Karne Ki Wajah' : 'Threat Reason'}
              </label>
              <select
                value={manualReason}
                onChange={(e) => setManualReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="Active 802.11 Deauthentication storm injector">
                  Active 802.11 Deauth Storm Injector
                </option>
                <option value="Unauthorized probe & failed agent verification">
                  Unauthorized probe &amp; failed agent handshake
                </option>
                <option value="MAC Address spoofing & ARP poisoning attempt">
                  MAC Address spoofing &amp; ARP poisoning attempt
                </option>
                <option value="Port sweeping and unauthorized network probing">
                  Port sweeping &amp; internal subnet scanning
                </option>
                <option value="Untrusted unknown guest device">
                  Untrusted unknown guest device
                </option>
              </select>
            </div>

            {formError && (
              <div className="p-2.5 bg-red-950/60 border border-red-800 text-red-300 rounded text-[11px]">
                {formError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm text-xs"
            >
              <Ban className="w-4 h-4" />
              <span>{lang === 'ur' ? 'Foran Blacklist & Block Karein' : 'Apply Layer-2 & Layer-3 Ban'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Code Export Modal / Preview */}
      {activeModalCode && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>
                  {activeModalCode === 'hostapd' ? 'OpenWrt hostapd.deny Configuration' : 'Firewall iptables Script'}
                </span>
              </div>
              <button
                onClick={() => setActiveModalCode(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800"
              >
                Close
              </button>
            </div>

            <pre className="p-3 bg-slate-950 rounded-lg text-xs font-mono text-cyan-300 overflow-x-auto border border-slate-800 max-h-80">
              {activeModalCode === 'hostapd' ? (
                `# /etc/hostapd.deny - OpenWrt MAC Filtering Rule
# Generated by B4DCyber Firmware Sentinel Daemon
${blacklist.map(b => `${b.mac}  # ${b.hostname} - ${b.reason}`).join('\n')}
`
              ) : (
                `#!/bin/sh
# /etc/firewall.user - Real-time Packet Drop Rules
# Generated by B4DCyber Firmware Sentinel Daemon
${blacklist.map(b => b.iptablesRule).join('\n')}
${blacklist.map(b => `ebtables -A FORWARD -s ${b.mac} -j DROP`).join('\n')}
`
              )}
            </pre>

            <div className="flex justify-end">
              <button
                onClick={() => setActiveModalCode(null)}
                className="px-4 py-2 text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
