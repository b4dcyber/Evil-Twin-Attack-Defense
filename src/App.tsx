import { useState } from 'react';
import { Header } from './components/Header';
import { AgentView } from './components/AgentView';
import { FirmwareView } from './components/FirmwareView';
import { DualSsidView } from './components/DualSsidView';
import { SimulationLab } from './components/SimulationLab';
import { CodeHub } from './components/CodeHub';
import { AuditLogs } from './components/AuditLogs';
import { ApkDownloadModal } from './components/ApkDownloadModal';
import { UserGuideModal } from './components/UserGuideModal';
import { WindowsExeModal } from './components/WindowsExeModal';
import { RouterLoginView } from './components/RouterLoginView';
import { WindowsPythonView } from './components/WindowsPythonView';
import { 
  initialHomeProfile, 
  initialDetectedAPs, 
  initialClients, 
  initialBlacklist, 
  initialAuditLogs,
  initialFleetDevices,
  initialDualSsidConfig
} from './data/mockData';
import { 
  DetectedAccessPoint, 
  ConnectedClient, 
  BlacklistEntry, 
  AuditLog, 
  AgentFleetDevice, 
  DualSsidConfig,
  RouterLoginConfig 
} from './types/cyber';
import { Language } from './utils/translations';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'agent' | 'firmware' | 'router_login' | 'dual' | 'windows_py' | 'lab' | 'code' | 'logs'>('windows_py');
  const [lang, setLang] = useState<Language>('ur'); // Default to Urdu/Roman Urdu per user prompt

  const [homeProfile, setHomeProfile] = useState(initialHomeProfile);
  const [dualConfig, setDualConfig] = useState<DualSsidConfig>(initialDualSsidConfig);
  const [fleetDevices, setFleetDevices] = useState<AgentFleetDevice[]>(initialFleetDevices);
  const [detectedAPs, setDetectedAPs] = useState<DetectedAccessPoint[]>(initialDetectedAPs);
  const [clients, setClients] = useState<ConnectedClient[]>(initialClients);
  const [blacklist, setBlacklist] = useState<BlacklistEntry[]>(initialBlacklist);
  const [logs, setLogs] = useState<AuditLog[]>(initialAuditLogs);
  const [isScanning, setIsScanning] = useState(false);
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);
  const [isExeModalOpen, setIsExeModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  const [routerConfig, setRouterConfig] = useState<RouterLoginConfig>({
    ip: '192.168.1.1',
    port: 22,
    protocol: 'SSH',
    username: 'root',
    password: '',
    isConnected: true,
    routerModel: 'TP-Link Archer AX73 (OpenWrt Sentinel)',
    firmwareVersion: 'v23.05.3-B4D',
    uptime: '14 days, 6 hours',
    cpuLoad: '0.12, 0.08, 0.05',
    connectedClientsCount: initialClients.length,
    lastSyncTime: 'Just now'
  });

  const addLog = (
    type: AuditLog['type'],
    severity: AuditLog['severity'],
    title: string,
    details: string,
    meta?: { mac?: string; bssid?: string }
  ) => {
    const newLog: AuditLog = {
      id: `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toTimeString().split(' ')[0],
      type,
      severity,
      title,
      details,
      mac: meta?.mac,
      bssid: meta?.bssid
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setDetectedAPs(prev =>
        prev.map(ap => ({
          ...ap,
          rssi: ap.isEvilTwin 
            ? Math.floor(-32 - Math.random() * 6)
            : Math.floor(-50 - Math.random() * 8)
        }))
      );
      setIsScanning(false);
      addLog(
        'AGENT_SCAN',
        'info',
        'Wi-Fi Spectrum Scan Refreshed',
        `Scanned ${detectedAPs.length} APs. Checked Primary "${dualConfig.primarySsid}" and Secondary Vault "${dualConfig.secondarySsid}".`
      );
    }, 700);
  };

  const handleToggleIsolation = (apId: string) => {
    setDetectedAPs(prev =>
      prev.map(ap => {
        if (ap.id === apId) {
          const newState = !ap.isolationActive;
          addLog(
            'ISOLATION_TRIGGERED',
            newState ? 'critical' : 'info',
            newState ? 'Network Interface Quarantined' : 'Interface Isolation Removed',
            `wlan0 interface state changed for AP ${ap.ssid} (${ap.bssid}).`,
            { bssid: ap.bssid }
          );
          return { ...ap, isolationActive: newState };
        }
        return ap;
      })
    );
  };

  // Swarm failover: Move ALL registered agents simultaneously to Secondary Secure Vault SSID!
  const handleTriggerFleetFailover = () => {
    // 1. Update Dual SSID status
    setDualConfig(prev => ({
      ...prev,
      primaryStatus: 'COMPROMISED_EVIL_TWIN',
      secondaryStatus: 'ACTIVE_FAILOVER'
    }));

    // 2. Migrate all registered agent devices
    setFleetDevices(prev =>
      prev.map(dev => ({
        ...dev,
        currentConnectedSsid: dualConfig.secondarySsid,
        failoverStatus: 'SECURED_ON_SECONDARY',
        lastHandshake: 'Just now (Failover Swarm)'
      }))
    );

    // 3. Shift authorized clients on router
    setClients(prev =>
      prev.map(c => {
        if (c.threatStatus === 'SAFE') {
          return { ...c, activeSsid: dualConfig.secondarySsid };
        }
        return c;
      })
    );

    // 4. Update detected APs view
    setDetectedAPs(prev =>
      prev.map(ap => {
        if (ap.ssid === dualConfig.secondarySsid) {
          return { ...ap, connected: true };
        }
        if (ap.ssid === dualConfig.primarySsid && !ap.isEvilTwin) {
          return { ...ap, connected: false };
        }
        return ap;
      })
    );

    addLog(
      'DUAL_SSID_FAILOVER',
      'warning',
      'Dual-SSID Tripwire Engaged: Primary Compromised',
      `Evil Twin detected on ${dualConfig.primarySsid}. Router Sentinel activated Secondary Vault ${dualConfig.secondarySsid}.`
    );

    addLog(
      'FLEET_MIGRATED',
      'success',
      'Multi-Agent Swarm Relocation Complete',
      `All ${fleetDevices.length} registered agent devices migrated to ${dualConfig.secondarySsid} safely.`
    );
  };

  const handleRestoreFleetToPrimary = () => {
    setDualConfig(prev => ({
      ...prev,
      primaryStatus: 'HEALTHY',
      secondaryStatus: 'STANDBY_DORMANT'
    }));

    setFleetDevices(prev =>
      prev.map(dev => ({
        ...dev,
        currentConnectedSsid: dualConfig.primarySsid,
        failoverStatus: 'SYNCED_PRIMARY',
        lastHandshake: 'Just now'
      }))
    );

    setClients(prev =>
      prev.map(c => {
        if (c.threatStatus === 'SAFE') {
          return { ...c, activeSsid: dualConfig.primarySsid };
        }
        return c;
      })
    );

    setDetectedAPs(prev =>
      prev.map(ap => {
        if (ap.ssid === dualConfig.primarySsid && !ap.isEvilTwin) {
          return { ...ap, connected: true };
        }
        if (ap.ssid === dualConfig.secondarySsid) {
          return { ...ap, connected: false };
        }
        return ap;
      })
    );

    addLog(
      'POLICY_UPDATE',
      'info',
      'Fleet Restored to Primary SSID',
      `All agents moved back to ${dualConfig.primarySsid} after threat neutralization.`
    );
  };

  const handleBlacklistClient = (client: ConnectedClient, reason?: string) => {
    const finalReason = reason || client.threatReason || 'Unauthorized device deauthenticated by administrator';
    setClients(prev => prev.filter(c => c.id !== client.id));

    const newEntry: BlacklistEntry = {
      id: `bl_${Date.now()}`,
      mac: client.mac,
      hostname: client.hostname,
      ip: client.ip,
      reason: finalReason,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      source: client.threatStatus === 'ROGUE_HACKER' ? 'AUTO_FIRMWARE_SENTINEL' : 'MANUAL_ADMIN',
      iptablesRule: `iptables -I FORWARD -m mac --mac-source ${client.mac} -j DROP`,
      hostapdAction: 'DEAUTHENTICATED_AND_BANNED'
    };

    setBlacklist(prev => [newEntry, ...prev]);

    addLog(
      'BLACKLIST_APPLIED',
      'critical',
      `Client Blacklisted: ${client.mac}`,
      `Device "${client.hostname}" kicked from AP. Added to hostapd.deny and injected iptables drop rule.`,
      { mac: client.mac }
    );
  };

  const handleManualBlacklist = (mac: string, hostname: string, reason: string) => {
    setClients(prev => prev.filter(c => c.mac.toUpperCase() !== mac.toUpperCase()));

    const newEntry: BlacklistEntry = {
      id: `bl_${Date.now()}`,
      mac,
      hostname,
      reason,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      source: 'MANUAL_ADMIN',
      iptablesRule: `iptables -I FORWARD -m mac --mac-source ${mac} -j DROP`,
      hostapdAction: 'DEAUTHENTICATED_AND_BANNED'
    };

    setBlacklist(prev => [newEntry, ...prev]);

    addLog(
      'BLACKLIST_APPLIED',
      'critical',
      `Manual Blacklist: ${mac}`,
      `MAC address ${mac} banned from router AP radio and iptables firewall.`,
      { mac }
    );
  };

  const handleUnban = (mac: string) => {
    setBlacklist(prev => prev.filter(item => item.mac !== mac));
    addLog(
      'POLICY_UPDATE',
      'info',
      `MAC Removed from Blacklist: ${mac}`,
      `Removed ${mac} from hostapd.deny. Packet forward restriction lifted.`,
      { mac }
    );
  };

  const handleInjectEvilTwin = () => {
    const evilTwinExists = detectedAPs.some(ap => ap.isEvilTwin);
    if (!evilTwinExists) {
      const rogueAp: DetectedAccessPoint = {
        id: `ap_evil_${Date.now()}`,
        ssid: dualConfig.primarySsid,
        bssid: '00:C0:CA:77:21:99',
        mac: '00:C0:CA:77:21:99',
        channel: 6,
        frequency: '2.4 GHz',
        rssi: -34,
        gatewayIp: '10.0.0.1',
        gatewayMac: '00:C0:CA:77:21:98',
        isEvilTwin: true,
        evilTwinReason: 'BSSID Mismatch + Missing Ed25519 signature + Frequency drift',
        distanceFromGeofenceMeters: 380,
        cryptoSignatureStatus: 'missing_signature',
        connected: false,
        isolationActive: true
      };
      setDetectedAPs(prev => [rogueAp, ...prev]);
    }
  };

  const handleInjectHackerClient = () => {
    const hackerExists = clients.some(c => c.threatStatus === 'ROGUE_HACKER');
    if (!hackerExists) {
      const hacker: ConnectedClient = {
        id: `client_hacker_${Date.now()}`,
        mac: '00:C0:CA:98:FA:01',
        ip: '192.168.1.199',
        hostname: 'kali-rolling-infiltrator',
        vendor: 'Alfa Network (Attacker Wi-Fi Card / Kali)',
        connectionTime: 'Just now',
        rxRateMbps: 54,
        txRateMbps: 300,
        rssi: -40,
        agentHandshakePassed: false,
        macRandomized: true,
        trustScore: 11,
        threatStatus: 'ROGUE_HACKER',
        threatReason: 'Active 802.11 Deauth frame storm & unauthorized ARP sniffing detected.',
        packetAnomalyCount: 89,
        deauthFrameCount: 312,
        activeSsid: dualConfig.primarySsid
      };
      setClients(prev => [hacker, ...prev]);
    }
  };

  const handleResetSimulation = () => {
    setDetectedAPs(initialDetectedAPs);
    setClients(initialClients);
    setBlacklist(initialBlacklist);
    setDualConfig(initialDualSsidConfig);
    setFleetDevices(initialFleetDevices);
    addLog('POLICY_UPDATE', 'info', 'Sandbox Reset', 'Simulated state restored to baseline environment.');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top 3-Zone Navigation Bar */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        lang={lang}
        setLang={setLang}
        onQuickSimulate={() => {
          handleInjectEvilTwin();
          setCurrentTab('dual');
        }}
        onOpenApkModal={() => setIsApkModalOpen(true)}
        onOpenExeModal={() => setIsExeModalOpen(true)}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'agent' && (
          <AgentView
            detectedAPs={detectedAPs}
            homeProfile={homeProfile}
            lang={lang}
            onScan={handleScan}
            isScanning={isScanning}
            onToggleIsolation={handleToggleIsolation}
            onTriggerFleetFailover={handleTriggerFleetFailover}
            onOpenApkModal={() => setIsApkModalOpen(true)}
            onAddLog={addLog}
          />
        )}

        {currentTab === 'firmware' && (
          <FirmwareView
            clients={clients}
            blacklist={blacklist}
            lang={lang}
            onBlacklistClient={handleBlacklistClient}
            onManualBlacklist={handleManualBlacklist}
            onUnban={handleUnban}
            onAddLog={addLog}
          />
        )}

        {currentTab === 'router_login' && (
          <RouterLoginView
            routerConfig={routerConfig}
            onUpdateRouterConfig={(cfg) => setRouterConfig(prev => ({ ...prev, ...cfg }))}
            clients={clients}
            blacklist={blacklist}
            lang={lang}
            onAddLog={addLog}
          />
        )}

        {currentTab === 'dual' && (
          <DualSsidView
            dualConfig={dualConfig}
            fleetDevices={fleetDevices}
            lang={lang}
            onTriggerFleetFailover={handleTriggerFleetFailover}
            onRestoreFleetToPrimary={handleRestoreFleetToPrimary}
          />
        )}

        {currentTab === 'windows_py' && (
          <WindowsPythonView
            lang={lang}
            onOpenExeModal={() => setIsExeModalOpen(true)}
          />
        )}

        {currentTab === 'lab' && (
          <SimulationLab
            lang={lang}
            homeProfile={homeProfile}
            onInjectEvilTwin={handleInjectEvilTwin}
            onInjectHackerClient={handleInjectHackerClient}
            onTriggerFleetFailover={handleTriggerFleetFailover}
            onResetSimulation={handleResetSimulation}
            onAddLog={addLog}
          />
        )}

        {currentTab === 'code' && (
          <CodeHub 
            lang={lang} 
            onOpenApkModal={() => setIsApkModalOpen(true)}
          />
        )}

        {currentTab === 'logs' && (
          <AuditLogs
            logs={logs}
            lang={lang}
            onClearLogs={() => setLogs([])}
          />
        )}
      </main>

      {/* Android APK Download & Installation Modal */}
      <ApkDownloadModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
        lang={lang}
      />

      {/* Windows EXE Installer Modal */}
      <WindowsExeModal
        isOpen={isExeModalOpen}
        onClose={() => setIsExeModalOpen(false)}
        lang={lang}
      />

      {/* User Guide & Operational Manual Modal */}
      <UserGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        lang={lang}
      />

      {/* Clean Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-semibold text-slate-300">B4DCYBER DEFENSE</span> · Dual-SSID Zero-Trust Wi-Fi &amp; Universal Router Sentinel
          </div>
          <div>
            Universal Compatibility (OpenWrt, MikroTik, TP-Link, DD-WRT, UniFi) · Multi-Agent Swarm Failover
          </div>
        </div>
      </footer>
    </div>
  );
}
