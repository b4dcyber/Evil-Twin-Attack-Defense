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

export const initialFleetDevices: AgentFleetDevice[] = [];

export const initialDetectedAPs: DetectedAccessPoint[] = [];

export const initialClients: ConnectedClient[] = [];

export const initialBlacklist: BlacklistEntry[] = [];

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
