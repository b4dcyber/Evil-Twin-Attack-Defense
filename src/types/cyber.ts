export interface RouterLoginConfig {
  ip: string;
  port: number;
  protocol: 'SSH' | 'HTTP_LUCI' | 'HTTPS_REST' | 'TELNET';
  username: string;
  password?: string;
  isConnected: boolean;
  routerModel?: string;
  firmwareVersion?: string;
  uptime?: string;
  cpuLoad?: string;
  connectedClientsCount?: number;
  lastSyncTime?: string;
}

export type RouterBrand = 'OPENWRT' | 'MIKROTIK' | 'TPLINK' | 'DDWRT' | 'UBIQUITI' | 'UNIVERSAL_LINUX';

export interface DualSsidConfig {
  primarySsid: string;
  primaryBssid: string;
  primaryChannel: number;
  primaryBand: '2.4 GHz' | '5 GHz' | '6 GHz';
  primaryStatus: 'HEALTHY' | 'UNDER_ATTACK' | 'COMPROMISED_EVIL_TWIN';

  secondarySsid: string;
  secondaryBssid: string;
  secondaryChannel: number;
  secondaryBand: '2.4 GHz' | '5 GHz' | '6 GHz';
  secondaryStatus: 'STANDBY_DORMANT' | 'ACTIVE_FAILOVER' | 'BROADCASTING';
  secondaryPassphraseHash: string;
  autoActivateOnAttack: boolean;
}

export interface AgentFleetDevice {
  id: string;
  name: string;
  deviceType: 'MOBILE_PHONE' | 'LAPTOP' | 'TABLET' | 'WORKSTATION' | 'IOT_DEVICE';
  mac: string;
  currentConnectedSsid: string;
  failoverStatus: 'SYNCED_PRIMARY' | 'MIGRATING' | 'SECURED_ON_SECONDARY' | 'ISOLATED';
  lastHandshake: string;
}

export interface WifiProfile {
  id: string;
  ssid: string;
  trustedBssid: string;
  expectedChannel: number;
  expectedFrequency: '2.4 GHz' | '5 GHz' | '6 GHz';
  expectedGatewayIp: string;
  expectedGatewayMac: string;
  routerPublicKey: string;
  geofence: {
    lat: number;
    lng: number;
    radiusMeters: number;
    locationName: string;
  };
  securityType: 'WPA3-SAE' | 'WPA2-Enterprise' | 'WPA2-PSK' | 'B4D-ZeroTrust';
  autoConnectBlocked: boolean;
  dualSsid: DualSsidConfig;
}

export interface DetectedAccessPoint {
  id: string;
  ssid: string;
  bssid: string;
  mac: string;
  channel: number;
  frequency: '2.4 GHz' | '5 GHz' | '6 GHz';
  rssi: number;
  gatewayIp: string;
  gatewayMac: string;
  isEvilTwin: boolean;
  evilTwinReason?: string;
  distanceFromGeofenceMeters: number;
  cryptoSignatureStatus: 'unverified' | 'valid' | 'invalid_key' | 'missing_signature' | 'timeout';
  routerPublicKeyReported?: string;
  connected: boolean;
  isolationActive: boolean;
  isFailoverSsid?: boolean;
}

export interface ConnectedClient {
  id: string;
  mac: string;
  ip: string;
  hostname: string;
  vendor: string;
  connectionTime: string;
  rxRateMbps: number;
  txRateMbps: number;
  rssi: number;
  agentHandshakePassed: boolean;
  macRandomized: boolean;
  trustScore: number;
  threatStatus: 'SAFE' | 'SUSPICIOUS' | 'ROGUE_HACKER';
  threatReason?: string;
  packetAnomalyCount: number;
  deauthFrameCount: number;
  activeSsid: string;
}

export interface BlacklistEntry {
  id: string;
  mac: string;
  hostname: string;
  ip?: string;
  reason: string;
  timestamp: string;
  source: 'MANUAL_ADMIN' | 'AUTO_FIRMWARE_SENTINEL' | 'FAILED_AGENT_HANDSHAKE' | 'DEAUTH_FLOOD_DETECTED' | 'DUAL_SSID_EVIL_TWIN_TRIPWIRE';
  iptablesRule: string;
  hostapdAction: 'DEAUTHENTICATED_AND_BANNED';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  type: 'AGENT_SCAN' | 'CRYPTO_CHALLENGE' | 'EVIL_TWIN_ALERT' | 'HACKER_DETECTED' | 'BLACKLIST_APPLIED' | 'ISOLATION_TRIGGERED' | 'POLICY_UPDATE' | 'DUAL_SSID_FAILOVER' | 'FLEET_MIGRATED';
  severity: 'info' | 'warning' | 'critical' | 'success';
  title: string;
  details: string;
  mac?: string;
  bssid?: string;
}
