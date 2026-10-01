import { 
  WifiProfile, 
  DetectedAccessPoint, 
  ConnectedClient, 
  BlacklistEntry, 
  AuditLog, 
  AgentFleetDevice,
  DualSsidConfig 
} from '../types/cyber';

export const initialDualSsidConfig: DualSsidConfig = {
  primarySsid: 'Home_Fiber_5G',
  primaryBssid: 'E4:5F:01:3B:9A:88',
  primaryChannel: 36,
  primaryBand: '5 GHz',
  primaryStatus: 'HEALTHY',

  secondarySsid: 'Home_Fiber_SECURE_VAULT',
  secondaryBssid: 'E4:5F:01:3B:9A:8A',
  secondaryChannel: 44,
  secondaryBand: '5 GHz',
  secondaryStatus: 'STANDBY_DORMANT',
  secondaryPassphraseHash: 'b4d_sha256_vault_key_e8172901ba',
  autoActivateOnAttack: true
};

export const initialHomeProfile: WifiProfile = {
  id: 'profile_home_primary',
  ssid: 'Home_Fiber_5G',
  trustedBssid: 'E4:5F:01:3B:9A:88',
  expectedChannel: 36,
  expectedFrequency: '5 GHz',
  expectedGatewayIp: '192.168.1.1',
  expectedGatewayMac: 'E4:5F:01:3B:9A:89',
  routerPublicKey: 'b4d_ed25519_pk_79c1a52e04f9810bb4829ad3fe7910ba',
  geofence: {
    lat: 24.8607,
    lng: 67.0011,
    radiusMeters: 75,
    locationName: 'Home Defense Zone (Safe Geofence)'
  },
  securityType: 'B4D-ZeroTrust',
  autoConnectBlocked: true,
  dualSsid: initialDualSsidConfig
};

export const initialFleetDevices: AgentFleetDevice[] = [
  {
    id: 'fleet_1',
    name: 'iPhone 15 Pro (Personal Agent)',
    deviceType: 'MOBILE_PHONE',
    mac: 'F0:99:BF:41:22:90',
    currentConnectedSsid: 'Home_Fiber_5G',
    failoverStatus: 'SYNCED_PRIMARY',
    lastHandshake: 'Just now'
  },
  {
    id: 'fleet_2',
    name: 'ThinkPad X1 Carbon (Work Agent)',
    deviceType: 'LAPTOP',
    mac: 'FC:FB:FB:11:82:3C',
    currentConnectedSsid: 'Home_Fiber_5G',
    failoverStatus: 'SYNCED_PRIMARY',
    lastHandshake: '1m ago'
  },
  {
    id: 'fleet_3',
    name: 'iPad Pro M4 (Tablet Agent)',
    deviceType: 'TABLET',
    mac: 'AC:BC:32:19:80:44',
    currentConnectedSsid: 'Home_Fiber_5G',
    failoverStatus: 'SYNCED_PRIMARY',
    lastHandshake: '3m ago'
  },
  {
    id: 'fleet_4',
    name: 'Linux Security Workstation',
    deviceType: 'WORKSTATION',
    mac: '1C:69:7A:91:00:23',
    currentConnectedSsid: 'Home_Fiber_5G',
    failoverStatus: 'SYNCED_PRIMARY',
    lastHandshake: '45s ago'
  }
];

export const initialDetectedAPs: DetectedAccessPoint[] = [
  {
    id: 'ap_genuine',
    ssid: 'Home_Fiber_5G',
    bssid: 'E4:5F:01:3B:9A:88',
    mac: 'E4:5F:01:3B:9A:88',
    channel: 36,
    frequency: '5 GHz',
    rssi: -54,
    gatewayIp: '192.168.1.1',
    gatewayMac: 'E4:5F:01:3B:9A:89',
    isEvilTwin: false,
    distanceFromGeofenceMeters: 12,
    cryptoSignatureStatus: 'valid',
    routerPublicKeyReported: 'b4d_ed25519_pk_79c1a52e04f9810bb4829ad3fe7910ba',
    connected: true,
    isolationActive: false
  },
  {
    id: 'ap_secondary_vault',
    ssid: 'Home_Fiber_SECURE_VAULT',
    bssid: 'E4:5F:01:3B:9A:8A',
    mac: 'E4:5F:01:3B:9A:8A',
    channel: 44,
    frequency: '5 GHz',
    rssi: -55,
    gatewayIp: '192.168.1.1',
    gatewayMac: 'E4:5F:01:3B:9A:89',
    isEvilTwin: false,
    distanceFromGeofenceMeters: 12,
    cryptoSignatureStatus: 'valid',
    routerPublicKeyReported: 'b4d_ed25519_pk_79c1a52e04f9810bb4829ad3fe7910ba',
    connected: false,
    isolationActive: false,
    isFailoverSsid: true
  },
  {
    id: 'ap_evil_twin',
    ssid: 'Home_Fiber_5G', // CLONED SSID!
    bssid: '00:C0:CA:77:21:99', // Rogue Alfa Wi-Fi Card!
    mac: '00:C0:CA:77:21:99',
    channel: 6, // Channel mismatch!
    frequency: '2.4 GHz',
    rssi: -35, // High power to force auto-connect!
    gatewayIp: '10.0.0.1',
    gatewayMac: '00:C0:CA:77:21:98',
    isEvilTwin: true,
    evilTwinReason: 'BSSID mismatch + Invalid Ed25519 signature + Frequency drift (2.4GHz rogue AP impersonating 5GHz Home Router)',
    distanceFromGeofenceMeters: 450,
    cryptoSignatureStatus: 'missing_signature',
    connected: false,
    isolationActive: true
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

export const initialClients: ConnectedClient[] = [
  {
    id: 'client_1',
    mac: 'F0:99:BF:41:22:90',
    ip: '192.168.1.104',
    hostname: 'iPhone-15-Pro-B4D',
    vendor: 'Apple Inc.',
    connectionTime: '1h 24m ago',
    rxRateMbps: 866,
    txRateMbps: 780,
    rssi: -45,
    agentHandshakePassed: true,
    macRandomized: false,
    trustScore: 98,
    threatStatus: 'SAFE',
    packetAnomalyCount: 0,
    deauthFrameCount: 0,
    activeSsid: 'Home_Fiber_5G'
  },
  {
    id: 'client_2',
    mac: 'FC:FB:FB:11:82:3C',
    ip: '192.168.1.108',
    hostname: 'ThinkPad-Security-Lab',
    vendor: 'Intel Corporate',
    connectionTime: '3h 10m ago',
    rxRateMbps: 1201,
    txRateMbps: 1050,
    rssi: -49,
    agentHandshakePassed: true,
    macRandomized: false,
    trustScore: 95,
    threatStatus: 'SAFE',
    packetAnomalyCount: 0,
    deauthFrameCount: 0,
    activeSsid: 'Home_Fiber_5G'
  },
  {
    id: 'client_3',
    mac: '38:F9:D3:87:66:10',
    ip: '192.168.1.112',
    hostname: 'Samsung-Smart-TV',
    vendor: 'Samsung Electronics',
    connectionTime: '6h 45m ago',
    rxRateMbps: 144,
    txRateMbps: 72,
    rssi: -62,
    agentHandshakePassed: false,
    macRandomized: false,
    trustScore: 82,
    threatStatus: 'SAFE',
    threatReason: 'IoT Device without Endpoint Agent (whitelisted by MAC policy)',
    packetAnomalyCount: 0,
    deauthFrameCount: 0,
    activeSsid: 'Home_Fiber_5G'
  },
  {
    id: 'client_hacker',
    mac: '00:C0:CA:98:FA:01',
    ip: '192.168.1.199',
    hostname: 'kali-rolling-infiltrator',
    vendor: 'Alfa Network (Attacker Wi-Fi Card / Kali)',
    connectionTime: '4m ago',
    rxRateMbps: 54,
    txRateMbps: 300,
    rssi: -40,
    agentHandshakePassed: false,
    macRandomized: true,
    trustScore: 11,
    threatStatus: 'ROGUE_HACKER',
    threatReason: 'Active Wi-Fi Deauth Attack & ARP Poisoning detected. Missing cryptographic agent handshake.',
    packetAnomalyCount: 89,
    deauthFrameCount: 312,
    activeSsid: 'Home_Fiber_5G'
  }
];

export const initialBlacklist: BlacklistEntry[] = [
  {
    id: 'bl_1',
    mac: 'DE:AD:BE:EF:66:33',
    hostname: 'WiFi-Pineapple-Mark7',
    ip: '192.168.1.250',
    reason: 'Active Karma broadcast & beacon injection attack',
    timestamp: '2026-09-30 22:15:00',
    source: 'AUTO_FIRMWARE_SENTINEL',
    iptablesRule: 'iptables -I FORWARD -m mac --mac-source DE:AD:BE:EF:66:33 -j DROP',
    hostapdAction: 'DEAUTHENTICATED_AND_BANNED'
  },
  {
    id: 'bl_2',
    mac: '02:1A:11:4F:9C:20',
    hostname: 'Rogue-Hotspot-Spoofer',
    reason: 'Repeated authorization timeouts and BSSID collision flood',
    timestamp: '2026-09-30 21:04:12',
    source: 'FAILED_AGENT_HANDSHAKE',
    iptablesRule: 'iptables -I FORWARD -m mac --mac-source 02:1A:11:4F:9C:20 -j DROP',
    hostapdAction: 'DEAUTHENTICATED_AND_BANNED'
  }
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'log_1',
    timestamp: '23:40:12',
    type: 'AGENT_SCAN',
    severity: 'info',
    title: 'Wi-Fi Spectrum Scan Completed',
    details: 'Discovered Primary SSID "Home_Fiber_5G" and Standby Vault SSID "Home_Fiber_SECURE_VAULT".'
  },
  {
    id: 'log_2',
    timestamp: '23:41:05',
    type: 'EVIL_TWIN_ALERT',
    severity: 'critical',
    title: 'Evil Twin Hotspot Intercepted',
    details: 'Hotspot with SSID "Home_Fiber_5G" detected on BSSID 00:C0:CA:77:21:99 (Alfa Network). Auto-connect blocked.',
    bssid: '00:C0:CA:77:21:99'
  },
  {
    id: 'log_3',
    timestamp: '23:41:06',
    type: 'DUAL_SSID_FAILOVER',
    severity: 'warning',
    title: 'Dual-SSID Tripwire Activated',
    details: 'Primary SSID under attack. Router Sentinel triggered Secondary Failover SSID "Home_Fiber_SECURE_VAULT".'
  },
  {
    id: 'log_4',
    timestamp: '23:41:08',
    type: 'FLEET_MIGRATED',
    severity: 'success',
    title: 'All 4 Registered Agents Migrated Together',
    details: 'Swarm failover completed: iPhone 15 Pro, ThinkPad X1, iPad Pro, and Linux Workstation shifted to Secondary Vault.'
  }
];
