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
  const [currentTab, setCurrentTab] = useState<'router_login' | 'dual' | 'firmware' | 'agent' | 'windows_py' | 'lab' | 'code' | 'logs'>('router_login');
  const lang: Language = 'en';

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
    isConnected: false,
    routerModel: 'Awaiting Router Authentication...',
    firmwareVersion: '',
    uptime: '',
    cpuLoad: '',
    connectedClientsCount: 0,
    lastSyncTime: 'Never',
    routerMac: '',
    primarySsid: '',
    primaryBssid: '',
    channel: 36,
    frequencyBand: '5 GHz',
    macHashSha256: '',
    ttlsIdentity: '',
    ttlsInnerAuth: 'EAP-MSCHAPv2',
    ttlsCertificateFingerprint: '',
    agentCustomizedBuildReady: false
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
      setDetectedAPs(prev => {
        if (prev.length === 0) {
          return [
            {
              id: 'ap_genuine',
              ssid: homeProfile.ssid,
              bssid: homeProfile.trustedBssid,
              mac: homeProfile.trustedBssid,
              channel: homeProfile.expectedChannel,
              frequency: homeProfile.expectedFrequency,
              rssi: Math.floor(-48 - Math.random() * 6),
              gatewayIp: homeProfile.expectedGatewayIp,
              gatewayMac: homeProfile.expectedGatewayMac,
              isEvilTwin: false,
              distanceFromGeofenceMeters: 12,
              cryptoSignatureStatus: 'valid',
              routerPublicKeyReported: homeProfile.routerPublicKey,
              connected: true,
              isolationActive: false
            },
            {
              id: 'ap_secondary_vault',
              ssid: homeProfile.dualSsid.secondarySsid,
              bssid: homeProfile.dualSsid.secondaryBssid,
              mac: homeProfile.dualSsid.secondaryBssid,
              channel: homeProfile.dualSsid.secondaryChannel,
              frequency: homeProfile.dualSsid.secondaryBand,
              rssi: Math.floor(-52 - Math.random() * 5),
              gatewayIp: homeProfile.expectedGatewayIp,
              gatewayMac: homeProfile.expectedGatewayMac,
              isEvilTwin: false,
              distanceFromGeofenceMeters: 12,
              cryptoSignatureStatus: 'valid',
              routerPublicKeyReported: homeProfile.routerPublicKey,
              connected: false,
              isolationActive: false,
              isFailoverSsid: true
            },
            {
              id: 'ap_neighbor',
              ssid: 'PTCL_Fiber_Secure',
              bssid: '74:DA:38:12:44:B0',
              mac: '74:DA:38:12:44:B0',
              channel: 1,
              frequency: '2.4 GHz',
              rssi: -78,
              gatewayIp: '192.168.10.1',
              gatewayMac: '74:DA:38:12:44:B1',
              isEvilTwin: false,
              distanceFromGeofenceMeters: 35,
              cryptoSignatureStatus: 'unverified',
              connected: false,
              isolationActive: false
            }
          ];
        }

        return prev.map(ap => ({
          ...ap,
          rssi: ap.isEvilTwin 
            ? Math.floor(-32 - Math.random() * 6)
            : Math.floor(-50 - Math.random() * 8)
        }));
      });

      setIsScanning(false);
      addLog('AGENT_SCAN', 'info', 'Ambient Spectrum Scan Completed', 'Discovered active BSSIDs on 2.4/5GHz spectrum.');
    }, 900);
  };

  const handleToggleIsolation = (apId: string) => {
    setDetectedAPs(prev =>
      prev.map(ap => {
        if (ap.id === apId) {
          const newState = !ap.isolationActive;
          addLog(
            'ISOLATION_TRIGGERED',
            newState ? 'warning' : 'info',
            newState ? 'Interface Quarantined' : 'Interface Unlocked',
            `Access Point ${ap.ssid} (${ap.bssid}) network interface quarantine toggled to ${newState ? 'LOCKED' : 'PERMITTED'}.`,
            { bssid: ap.bssid }
          );
          return { ...ap, isolationActive: newState };
        }
        return ap;
      })
    );
  };

  const handleBlacklistClient = (client: ConnectedClient, reason?: string) => {
    const defaultReason = reason || 'Manual Administrator Revocation (Rogue probe detected)';
    
    // Add to blacklist
    const newEntry: BlacklistEntry = {
      id: `bl_${Date.now()}`,
      mac: client.mac,
      hostname: client.hostname,
      ip: client.ip,
      timestamp: new Date().toLocaleTimeString(),
      reason: defaultReason,
      source: 'AUTO_FIRMWARE_SENTINEL',
      iptablesRule: `iptables -I FORWARD -m mac --mac-source ${client.mac} -j DROP`,
      hostapdAction: 'DEAUTHENTICATED_AND_BANNED'
    };

    setBlacklist(prev => [newEntry, ...prev]);
    // Remove client from active list
    setClients(prev => prev.filter(c => c.mac !== client.mac));

    addLog(
      'BLACKLIST_APPLIED',
      'critical',
      `Client Blacklisted: ${client.hostname}`,
      `Layer-2 access blocked for MAC ${client.mac}. Injected DROP rule to hostapd.deny and router firewall forwarding chain.`,
      { mac: client.mac }
    );
  };

  const handleManualBlacklist = (mac: string, hostname: string, reason: string) => {
    const newEntry: BlacklistEntry = {
      id: `bl_${Date.now()}`,
      mac,
      hostname,
      timestamp: new Date().toLocaleTimeString(),
      reason,
      source: 'MANUAL_ADMIN',
      iptablesRule: `iptables -I FORWARD -m mac --mac-source ${mac} -j DROP`,
      hostapdAction: 'DEAUTHENTICATED_AND_BANNED'
    };

    setBlacklist(prev => [newEntry, ...prev]);
    setClients(prev => prev.filter(c => c.mac.toUpperCase() !== mac.toUpperCase()));

    addLog(
      'BLACKLIST_APPLIED',
      'warning',
      `Manual MAC Blacklist Added: ${mac}`,
      `Administrator blacklisted MAC ${mac} (${hostname}) with reason: "${reason}".`,
      { mac }
    );
  };

  const handleUnban = (mac: string) => {
    setBlacklist(prev => prev.filter(b => b.mac !== mac));
    addLog(
      'POLICY_UPDATE',
      'info',
      `MAC Removed from Blacklist: ${mac}`,
      `Layer-2 access restored for ${mac}. Purged from hostapd.deny and firewall quarantine tables.`,
      { mac }
    );
  };

  // Swarm Failover Trigger
  const handleTriggerFleetFailover = () => {
    setDualConfig(prev => ({
      ...prev,
      primaryStatus: 'COMPROMISED_EVIL_TWIN',
      secondaryStatus: 'ACTIVE_FAILOVER'
    }));

    setFleetDevices(prev =>
      prev.map(device => ({
        ...device,
        currentConnectedSsid: 'Home_Fiber_SECURE_VAULT',
        failoverStatus: 'SECURED_ON_SECONDARY',
        lastHandshake: 'Just now'
      }))
    );

    addLog(
      'FLEET_MIGRATED',
      'critical',
      'Emergency Swarm Failover Initiated',
      'Primary SSID marked COMPROMISED. Secondary Vault SSID fired. All 4 registered fleet agents migrated safely to secure vault.'
    );
  };

  const handleRestoreFleetToPrimary = () => {
    setDualConfig(prev => ({
      ...prev,
      primaryStatus: 'HEALTHY',
      secondaryStatus: 'STANDBY_DORMANT'
    }));

    setFleetDevices(prev =>
      prev.map(device => ({
        ...device,
        currentConnectedSsid: 'Home_Fiber_5G',
        failoverStatus: 'SYNCED_PRIMARY',
        lastHandshake: 'Just now'
      }))
    );

    addLog(
      'POLICY_UPDATE',
      'success',
      'Fleet Restored to Primary SSID',
      'Threat cleared. All agent devices migrated back to Primary Home_Fiber_5G operational channel.'
    );
  };

  // Attack Injection Handlers for Simulation Lab
  const handleInjectEvilTwin = () => {
    const existing = detectedAPs.find(ap => ap.isEvilTwin);
    if (!existing) {
      const rogueAp: DetectedAccessPoint = {
        id: `rogue_${Date.now()}`,
        ssid: homeProfile.ssid,
        bssid: '00:C0:CA:98:FA:01', // Alfa wireless card OUI
        mac: '00:C0:CA:98:FA:01',
        channel: 6, // Channel mismatch
        frequency: '2.4 GHz',
        rssi: -34, // Elevated signal to trap auto-connect
        gatewayIp: '192.168.1.1',
        gatewayMac: '00:C0:CA:98:FA:01',
        isEvilTwin: true,
        evilTwinReason: 'BSSID Mismatch & Channel Drift (Expected Ch 36 5GHz, Found Ch 6 2.4GHz). Ed25519 signature missing.',
        cryptoSignatureStatus: 'missing_signature',
        connected: false,
        isolationActive: true,
        distanceFromGeofenceMeters: 0
      };
      setDetectedAPs(prev => [rogueAp, ...prev]);
    }
  };

  const handleInjectHackerClient = () => {
    const hackerMac = '00:C0:CA:98:FA:01';
    const exists = clients.some(c => c.mac === hackerMac);
    if (!exists) {
      const newHacker: ConnectedClient = {
        id: `hacker_${Date.now()}`,
        hostname: 'Kali-Linux-Attacker',
        vendor: 'Alfa Network (Realtek RTL8812AU)',
        ip: '192.168.1.189',
        mac: hackerMac,
        connectionTime: '1 min ago',
        rxRateMbps: 48.2,
        txRateMbps: 12.4,
        rssi: -35,
        agentHandshakePassed: false,
        macRandomized: false,
        trustScore: 8,
        threatStatus: 'ROGUE_HACKER',
        threatReason: 'Deauthentication frame flood detected (142 pkts/sec)',
        packetAnomalyCount: 142,
        deauthFrameCount: 142,
        activeSsid: 'Home_Fiber_5G'
      };
      setClients(prev => [newHacker, ...prev]);
    }
  };

  const handleResetSimulation = () => {
    setDetectedAPs(initialDetectedAPs);
    setClients(initialClients);
    setDualConfig(initialDualSsidConfig);
    setFleetDevices(initialFleetDevices);
    addLog('POLICY_UPDATE', 'info', 'Sandbox Reset', 'Simulated state restored to baseline environment.');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation Bar */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
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
        {currentTab === 'router_login' && (
          <RouterLoginView
            routerConfig={routerConfig}
            onUpdateRouterConfig={(cfg) => setRouterConfig(prev => ({ ...prev, ...cfg }))}
            clients={clients}
            onSetClients={(newClients) => setClients(newClients)}
            blacklist={blacklist}
            onBlacklistClient={handleBlacklistClient}
            lang={lang}
            onAddLog={addLog}
            onOpenApkModal={() => setIsApkModalOpen(true)}
            onSetFleetDevices={(devices) => setFleetDevices(devices)}
            homeProfile={homeProfile}
            onUpdateHomeProfile={(p) => setHomeProfile(prev => ({ ...prev, ...p }))}
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

      {/* Android APK Download Modal */}
      <ApkDownloadModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
        lang={lang}
        routerConfig={routerConfig}
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
