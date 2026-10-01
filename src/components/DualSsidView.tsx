import { useState } from 'react';
import { 
  Wifi, 
  ShieldAlert, 
  ShieldCheck, 
  ArrowRight, 
  RotateCcw, 
  Smartphone, 
  Laptop, 
  Tablet, 
  Server, 
  Zap, 
  Lock, 
  Radio, 
  CheckCircle2, 
  Layers,
  Copy,
  Check
} from 'lucide-react';
import { DualSsidConfig, AgentFleetDevice, RouterBrand } from '../types/cyber';
import { Language, translations } from '../utils/translations';

interface DualSsidViewProps {
  dualConfig: DualSsidConfig;
  fleetDevices: AgentFleetDevice[];
  lang: Language;
  onTriggerFleetFailover: () => void;
  onRestoreFleetToPrimary: () => void;
}

export function DualSsidView({
  dualConfig,
  fleetDevices,
  lang,
  onTriggerFleetFailover,
  onRestoreFleetToPrimary
}: DualSsidViewProps) {
  const t = translations[lang];

  const [selectedRouter, setSelectedRouter] = useState<RouterBrand>('OPENWRT');
  const [copiedCode, setCopiedCode] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);

  const handleMigrateClick = () => {
    setIsMigrating(true);
    onTriggerFleetFailover();
    setTimeout(() => {
      setIsMigrating(false);
    }, 1200);
  };

  const getRouterScript = (brand: RouterBrand) => {
    switch (brand) {
      case 'OPENWRT':
        return `# OpenWrt Dual-SSID & Sentinel Configuration
uci set wireless.default_radio0=wifi-iface
uci set wireless.default_radio0.device='radio0'
uci set wireless.default_radio0.network='lan'
uci set wireless.default_radio0.mode='ap'
uci set wireless.default_radio0.ssid='${dualConfig.primarySsid}'
uci set wireless.default_radio0.encryption='sae'

# Secondary Emergency Failover Vault (Agent-Only)
uci set wireless.vault_radio0=wifi-iface
uci set wireless.vault_radio0.device='radio0'
uci set wireless.vault_radio0.network='lan'
uci set wireless.vault_radio0.mode='ap'
uci set wireless.vault_radio0.ssid='${dualConfig.secondarySsid}'
uci set wireless.vault_radio0.encryption='sae'
uci set wireless.vault_radio0.disabled='0'
uci commit wireless && wifi reload`;

      case 'MIKROTIK':
        return `# MikroTik RouterOS Dual-SSID Script
/interface wireless
set [ find default-name=wlan1 ] ssid="${dualConfig.primarySsid}" band=5ghz-a/n/ac disabled=no

# Create Secondary Virtual AP (VAP) for Emergency Agent Swarm
add master-interface=wlan1 name=wlan2-secure-vault ssid="${dualConfig.secondarySsid}" \\
    security-profile=b4d-vault-profile disabled=no

/system script
add name="b4d-trigger-failover" source="
  :log warning \\"B4DCyber: Evil Twin Detected! Broadcasting Vault SSID...\\";
  /interface wireless enable wlan2-secure-vault;
"`;

      case 'TPLINK':
        return `# TP-Link (Archer / Omada / OpenWrt / DD-WRT) Multi-SSID Config
# Enable Multi-SSID 2 (VLAN 20 / Secondary Secure Vault)
nvram set wl0_vifs="wl0.1"
nvram set wl0.1_ssid="${dualConfig.secondarySsid}"
nvram set wl0.1_closed="0"
nvram set wl0.1_wpa_psk="b4d_vault_secret_token_19283"
nvram commit
service restart_wireless`;

      case 'DDWRT':
        return `# DD-WRT Virtual AP (VAP) Dual-SSID Setup
wl0_vifs=wl0.1
wl0.1_ssid=${dualConfig.secondarySsid}
wl0.1_security_mode=wpa2_personal
wl0.1_crypto=aes
startservice wireless`;

      case 'UBIQUITI':
        return `# Ubiquiti UniFi CLI / Controller API Profile
unifi-ap-ctrl wlan-create \\
  --name "Primary-Net" --ssid "${dualConfig.primarySsid}" --vlan 1
unifi-ap-ctrl wlan-create \\
  --name "Failover-Vault" --ssid "${dualConfig.secondarySsid}" --vlan 10 \\
  --hide-ssid false --fast-roam true`;

      case 'UNIVERSAL_LINUX':
      default:
        return `# Universal Linux AP (Raspberry Pi / Debian / Ubuntu hostapd)
# /etc/hostapd/hostapd.conf
interface=wlan0
ssid=${dualConfig.primarySsid}
channel=36
hw_mode=a

# Secondary Multi-BSSID Interface for Agent Failover Swarm
bss=wlan0_0
ssid=${dualConfig.secondarySsid}
wpa=2
wpa_key_mgmt=WPA-PSK`;
    }
  };

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const isFailoverActive = dualConfig.secondaryStatus === 'ACTIVE_FAILOVER' || dualConfig.secondaryStatus === 'BROADCASTING';
  const allMigrated = fleetDevices.every(d => d.failoverStatus === 'SECURED_ON_SECONDARY');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                <Layers className="w-3.5 h-3.5" />
                {lang === 'ur' ? 'Dual-SSID & Agent Swarm Failover' : 'Dual-SSID Tripwire & Fleet Failover'}
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-400 font-mono">Compatible with ANY Router</span>
              <span className="text-xs text-slate-400">·</span>
              <span className={`text-xs font-semibold ${isFailoverActive ? 'text-amber-400' : 'text-emerald-400'}`}>
                {isFailoverActive ? 'Secondary Vault Active (Failover)' : 'Primary SSID Active'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {t.dualSsidTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
              {t.dualSsidSub}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {allMigrated ? (
              <button
                onClick={onRestoreFleetToPrimary}
                className="px-3.5 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors border border-slate-700 flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t.restorePrimaryBtn}</span>
              </button>
            ) : (
              <button
                onClick={handleMigrateClick}
                disabled={isMigrating}
                className="px-3.5 py-2 text-xs font-semibold bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>{isMigrating ? 'Migrating All Agents...' : t.triggerFailoverBtn}</span>
              </button>
            )}
          </div>
        </div>

        {/* Dual-SSID Status Visual Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 pt-4 border-t border-slate-800/80">
          {/* Primary SSID Card */}
          <div className={`p-4 rounded-xl border transition-all ${
            dualConfig.primaryStatus === 'COMPROMISED_EVIL_TWIN'
              ? 'bg-red-950/20 border-red-800/80'
              : 'bg-slate-950 border-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {t.primarySsidLabel}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                dualConfig.primaryStatus === 'COMPROMISED_EVIL_TWIN'
                  ? 'bg-red-950 text-red-300 border border-red-800'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}>
                {dualConfig.primaryStatus}
              </span>
            </div>

            <div className="text-base font-bold text-white mt-1.5 flex items-center gap-2">
              <Wifi className="w-4 h-4 text-cyan-400" />
              <span>{dualConfig.primarySsid}</span>
            </div>

            <div className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-2">
              <span>BSSID: {dualConfig.primaryBssid}</span>
              <span>·</span>
              <span>Ch: {dualConfig.primaryChannel} ({dualConfig.primaryBand})</span>
            </div>

            <div className="text-[11px] text-slate-400 mt-2">
              {dualConfig.primaryStatus === 'COMPROMISED_EVIL_TWIN'
                ? (lang === 'ur' ? 'Khatra: Is SSID par Evil Twin attack ho gaya hai. Agents yahan se nikal chukay hain.' : 'Threat: Rogue hotspot detected cloning this SSID. Traffic shifted to secondary.')
                : (lang === 'ur' ? 'Aam halat mein tamam devices is par connect rehti hain.' : 'Standard operational SSID for day-to-day devices.')}
            </div>
          </div>

          {/* Secondary Emergency Failover Vault SSID Card */}
          <div className={`p-4 rounded-xl border transition-all ${
            isFailoverActive
              ? 'bg-emerald-950/20 border-emerald-500 shadow-md ring-1 ring-emerald-500/20'
              : 'bg-slate-950 border-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                {t.secondarySsidLabel}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                isFailoverActive
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 animate-pulse'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {dualConfig.secondaryStatus}
              </span>
            </div>

            <div className="text-base font-bold text-white mt-1.5 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>{dualConfig.secondarySsid}</span>
            </div>

            <div className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-2">
              <span>BSSID: {dualConfig.secondaryBssid}</span>
              <span>·</span>
              <span>Ch: {dualConfig.secondaryChannel} ({dualConfig.secondaryBand})</span>
            </div>

            <div className="text-[11px] text-slate-300 mt-2">
              {isFailoverActive
                ? (lang === 'ur' ? 'ACTIVE: Tamam agents mehfooz tareeqay se is secret vault par chal rahay hain.' : 'ACTIVE: Swarm failover active. All authenticated agents connected securely.')
                : (lang === 'ur' ? 'Agent ko iska pehle se pata hai. Attack ke waqt foran active hoga.' : 'Pre-shared cryptographic token stored in endpoint agents. Instant auto-connect upon attack.')}
            </div>
          </div>
        </div>
      </div>

      {/* Fleet Swarm Status: All User Devices Migrated Together */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              {t.fleetStatusTitle} ({fleetDevices.length})
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {lang === 'ur' ? 'Multi-Agent Swarm Orchestration' : 'Multi-Agent Swarm Orchestration'}
          </span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {fleetDevices.map((device) => {
            let icon = <Smartphone className="w-4 h-4 text-cyan-400" />;
            if (device.deviceType === 'LAPTOP') icon = <Laptop className="w-4 h-4 text-cyan-400" />;
            else if (device.deviceType === 'TABLET') icon = <Tablet className="w-4 h-4 text-cyan-400" />;
            else if (device.deviceType === 'WORKSTATION') icon = <Server className="w-4 h-4 text-cyan-400" />;

            const isSecuredOnSecondary = device.failoverStatus === 'SECURED_ON_SECONDARY';

            return (
              <div key={device.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                    {icon}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>{device.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">({device.deviceType})</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      MAC: {device.mac} · Last Sync: {device.lastHandshake}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs font-semibold text-white flex items-center gap-1.5 justify-end">
                      <Wifi className={`w-3.5 h-3.5 ${isSecuredOnSecondary ? 'text-emerald-400' : 'text-cyan-400'}`} />
                      <span>{device.currentConnectedSsid}</span>
                    </div>
                    <div className="text-[10px] font-mono mt-0.5">
                      {isSecuredOnSecondary ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1 justify-end">
                          <CheckCircle2 className="w-3 h-3" /> SECURED ON VAULT
                        </span>
                      ) : (
                        <span className="text-slate-400">SYNCED PRIMARY</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {allMigrated && (
          <div className="p-3 bg-emerald-950/40 border-t border-emerald-800 text-xs text-emerald-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              {t.migratedSuccess}
            </span>
            <button
              onClick={onRestoreFleetToPrimary}
              className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded cursor-pointer"
            >
              {t.restorePrimaryBtn}
            </button>
          </div>
        )}
      </div>

      {/* Universal Router Compatibility Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              <span>Universal Router Setup (Har Router Se Connect Ho Jaye)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === 'ur'
                ? 'Apke paas koi bhi router ho (TP-Link, MikroTik, OpenWrt, DD-WRT, Ubiquiti, ya standard Linux/Raspberry Pi), ye Dual-SSID config foran apply ho jati hai.'
                : 'Zero-lockin universal framework. One-command dual-SSID activation for all major enterprise and consumer router platforms.'}
            </p>
          </div>

          <button
            onClick={() => copyCode(getRouterScript(selectedRouter))}
            className="px-3 py-1.5 text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? 'Copied Script!' : 'Copy Router Config'}</span>
          </button>
        </div>

        {/* Router Brand Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-lg overflow-x-auto">
          {(['OPENWRT', 'MIKROTIK', 'TPLINK', 'DDWRT', 'UBIQUITI', 'UNIVERSAL_LINUX'] as RouterBrand[]).map((brand) => (
            <button
              key={brand}
              onClick={() => setSelectedRouter(brand)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer transition-colors ${
                selectedRouter === brand
                  ? 'bg-slate-800 text-cyan-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {brand === 'OPENWRT' && 'OpenWrt / LEDE'}
              {brand === 'MIKROTIK' && 'MikroTik RouterOS'}
              {brand === 'TPLINK' && 'TP-Link (Archer / Omada)'}
              {brand === 'DDWRT' && 'DD-WRT / Tomato'}
              {brand === 'UBIQUITI' && 'Ubiquiti UniFi'}
              {brand === 'UNIVERSAL_LINUX' && 'Universal Linux / Pi'}
            </button>
          ))}
        </div>

        {/* Router Script Code Block */}
        <pre className="p-4 text-xs font-mono text-cyan-300 bg-slate-950 rounded-lg overflow-x-auto border border-slate-800 leading-relaxed max-h-72">
          {getRouterScript(selectedRouter)}
        </pre>
      </div>
    </div>
  );
}
