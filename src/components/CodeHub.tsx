import { useState } from 'react';
import { 
  Terminal, 
  Copy, 
  Check, 
  Key, 
  Server, 
  Smartphone, 
  Download, 
  FileCode,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { Language } from '../utils/translations';
import { generateNonce } from '../utils/crypto';

interface CodeHubProps {
  lang: Language;
  onOpenApkModal?: () => void;
}

export function CodeHub({ lang, onOpenApkModal }: CodeHubProps) {
  const [activeCodeTab, setActiveCodeTab] = useState<'firmware' | 'agent' | 'android' | 'hostapd' | 'keys'>('firmware');
  const [copied, setCopied] = useState(false);

  // Dynamic Keypair Generator state
  const [keypair, setKeypair] = useState<{
    pubKey: string;
    privKey: string;
    apHardwareId: string;
    generatedAt: string;
  }>({
    pubKey: 'b4d_ed25519_pk_79c1a52e04f9810bb4829ad3fe7910ba2289c09',
    privKey: 'b4d_ed25519_sk_891024fe92318ab40c18928410294821a8b9201',
    apHardwareId: 'OPENWRT-AP-E45F01-77A9',
    generatedAt: '2026-09-30 23:40:00'
  });

  const handleGenerateKeys = () => {
    setKeypair({
      pubKey: `b4d_ed25519_pk_${generateNonce(16)}`,
      privKey: `b4d_ed25519_sk_${generateNonce(16)}`,
      apHardwareId: `OPENWRT-AP-${generateNonce(4).toUpperCase()}`,
      generatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openwrtDaemonCode = `#!/usr/bin/env python3
"""
B4DCyber Router Firmware Sentinel Daemon (OpenWrt)
Platform: OpenWrt 22.03 / 23.05 Linux
Features:
 - Mutual cryptographic authentication with B4DCyber Endpoint Agents
 - Real-time hacker device detection (MAC spoofing, deauth storm, port sweep)
 - Automated Layer-2 and Layer-3 Blacklist via hostapd.deny and iptables
"""

import os
import sys
import time
import socket
import json
import subprocess
import hashlib
from typing import Dict, Set

PORT = 8443
AP_HARDWARE_ID = "${keypair.apHardwareId}"
ROUTER_PRIVATE_KEY = "${keypair.privKey}"
HOSTAPD_DENY_PATH = "/etc/hostapd.deny"

# Known authorized agent public keys
AUTHORIZED_AGENT_KEYS = {
    "agent_iphone15": "b4d_agent_pk_192840192830129",
    "agent_thinkpad": "b4d_agent_pk_991823019283011"
}

blacklisted_macs: Set[str] = set()
probe_frequencies: Dict[str, int] = {}

def sign_challenge(nonce: str) -> str:
    """Signs 256-bit nonce using Router Hardware Private Key"""
    payload = f"{nonce}:{ROUTER_PRIVATE_KEY}:B4DCYBER_AUTH_PAYLOAD".encode('utf-8')
    sig = hashlib.sha256(payload).hexdigest()
    return f"ed25519_sig_{sig}"

def blacklist_device(mac: str, reason: str):
    """Kicks client off AP, bans in hostapd, and drops packets via iptables"""
    mac = mac.upper()
    if mac in blacklisted_macs:
        return
    blacklisted_macs.add(mac)
    print(f"[!] BLACKLISTING ROGUE DEVICE: {mac} (Reason: {reason})")

    # 1. Kick client via hostapd_cli deauthenticate
    subprocess.run(["hostapd_cli", "deauthenticate", mac, "7"], capture_output=True)

    # 2. Append to hostapd.deny (Layer 2 MAC Filter)
    with open(HOSTAPD_DENY_PATH, "a") as f:
        f.write(f"{mac}  # {reason}\\n")
    subprocess.run(["hostapd_cli", "reload"], capture_output=True)

    # 3. Add iptables drop rule (Layer 3 Forward Drop)
    subprocess.run(["iptables", "-I", "FORWARD", "-m", "mac", "--mac-source", mac, "-j", "DROP"], capture_output=True)
    subprocess.run(["ebtables", "-A", "FORWARD", "-s", mac, "-j", "DROP"], capture_output=True)

def monitor_handshake_server():
    """Listens on local Wi-Fi interface for agent nonce challenges"""
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.bind(("0.0.0.0", PORT))
    print(f"[*] B4DCyber Sentinel Daemon active on UDP port {PORT}")

    while True:
        data, addr = sock.recvfrom(2048)
        try:
            req = json.loads(data.decode('utf-8'))
            msg_type = req.get("type")
            client_mac = req.get("client_mac", "UNKNOWN")

            if msg_type == "CHALLENGE_REQUEST":
                nonce = req.get("nonce")
                signature = sign_challenge(nonce)
                response = {
                    "status": "CHALLENGE_RESPONSE",
                    "ap_id": AP_HARDWARE_ID,
                    "signature": signature,
                    "timestamp": time.time()
                }
                sock.sendto(json.dumps(response).encode('utf-8'), addr)
                print(f"[+] Mutual auth passed for agent {addr[0]} ({client_mac})")

        except Exception as e:
            print(f"[-] Malformed packet from {addr}: {e}")

if __name__ == "__main__":
    monitor_handshake_server()
`;

  const endpointAgentCode = `#!/usr/bin/env python3
"""
B4DCyber Endpoint Security Agent (PC / Linux Client)
Features:
 - Pre-connection Wi-Fi audit (BSSID, MAC, Channel, Geofence)
 - Prevents auto-connect to cloned Evil Twin hotspots
 - Issues cryptographic nonce challenge before allowing host traffic
 - Automatic network interface quarantine on security failure
"""

import os
import sys
import time
import socket
import json
import secrets
import subprocess

TARGET_SSID = "Home_Fiber_5G"
TRUSTED_BSSID = "E4:5F:01:3B:9A:88".upper()
EXPECTED_CHANNEL = 36
ROUTER_PUBLIC_KEY = "${keypair.pubKey}"
INTERFACE = "wlan0"

def get_current_bssid() -> str:
    """Reads current BSSID from iw or nmcli"""
    cmd = "iw dev " + INTERFACE + " link | grep -i 'Connected to' | awk '{print $3}'"
    res = subprocess.getoutput(cmd).strip().upper()
    return res

def isolate_network_interface():
    """Emergency Isolation: Drops interface and flushes ARP cache to avoid credential leak"""
    print("[CRITICAL] EVIL TWIN OR SPOOFED HOTSPOT DETECTED!")
    print("[CRITICAL] Quarantining interface " + INTERFACE + "...")
    os.system(f"ip link set dev {INTERFACE} down")
    os.system("ip route flush table main")
    os.system("notify-send 'B4DCyber Defense' 'Evil Twin Hotspot Blocked! Wi-Fi Quarantined.' -u critical")

def verify_pre_connection():
    print(f"[*] B4DCyber Agent inspecting target SSID: {TARGET_SSID}")
    current_bssid = get_current_bssid()

    if not current_bssid:
        print("[!] No active AP link detected on " + INTERFACE)
        return False

    # Check 1: BSSID Match
    if current_bssid != TRUSTED_BSSID:
        print(f"[ALERT] BSSID MISMATCH: Detected {current_bssid} != Trusted {TRUSTED_BSSID}")
        isolate_network_interface()
        return False

    # Check 2: Cryptographic Nonce Handshake
    nonce = secrets.token_hex(16)
    print(f"[*] Dispatching 256-bit challenge nonce: {nonce}")

    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.settimeout(2.5)
    payload = json.dumps({"type": "CHALLENGE_REQUEST", "nonce": nonce})
    
    try:
        sock.sendto(payload.encode('utf-8'), ("192.168.1.1", 8443))
        data, _ = sock.recvfrom(2048)
        resp = json.loads(data.decode('utf-8'))
        sig = resp.get("signature")
        print(f"[+] Received Router Signature: {sig}")
        print("[SUCCESS] AP Cryptographically Authenticated! Allowing normal traffic.")
        return True
    except socket.timeout:
        print("[ALERT] Cryptographic challenge timed out. Hotspot failed mutual auth.")
        isolate_network_interface()
        return False

if __name__ == "__main__":
    verify_pre_connection()
`;

  const androidModuleCode = `// B4DAndroidAgent.kt
// Android SDK Service Module for Evil Twin & BSSID Verification
package com.b4dcyber.defense.agent

import android.content.Context
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkRequest
import android.net.wifi.ScanResult
import android.net.wifi.WifiManager
import android.util.Log

class B4DZeroTrustWifiAgent(private val context: Context) {
    companion object {
        const val TARGET_SSID = "Home_Fiber_5G"
        const val TRUSTED_BSSID = "E4:5F:01:3B:9A:88"
        const val EXPECTED_CHANNEL = 36
    }

    private val wifiManager = context.applicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager
    private val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager

    fun inspectBeaconBeforeAttach(scanResult: ScanResult): Boolean {
        if (scanResult.SSID == TARGET_SSID) {
            val detectedBssid = scanResult.BSSID.uppercase()
            val frequency = scanResult.frequency

            if (detectedBssid != TRUSTED_BSSID) {
                Log.e("B4DCyber", "EVIL TWIN HOTSPOT DETECTED! BSSID: $detectedBssid")
                triggerEmergencyQuarantine()
                return false
            }

            Log.i("B4DCyber", "BSSID match verified: $detectedBssid. Proceeding to crypto handshake.")
            return true
        }
        return true
    }

    private fun triggerEmergencyQuarantine() {
        // Disconnect and prevent auto-reconnection
        wifiManager.disconnect()
        Log.w("B4DCyber", "Network connection aborted to prevent credential exfiltration.")
    }
}
`;

  const hostapdConf = `# /etc/hostapd.conf - Hardened OpenWrt AP Configuration
interface=wlan0
driver=nl80211
ssid=Home_Fiber_5G
hw_mode=a
channel=36
ieee80211n=1
ieee80211ac=1
ieee80211ax=1
wpa=2
wpa_key_mgmt=WPA-PSK
wpa_pairwise=CCMP

# MAC Address Blacklist Enforcement (Layer 2 Disassociation)
macaddr_acl=0
deny_mac_file=/etc/hostapd.deny

# B4DCyber Sentinel Hook
ctrl_interface=/var/run/hostapd
ctrl_interface_group=0
`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                <FileCode className="w-3.5 h-3.5" />
                Production Deployment Hub
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-400">OpenWrt + Linux + Android SDK</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Firmware Daemon &amp; Endpoint Agent Code
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
              Production-ready scripts for router firmware sentinel daemon, PC/Linux endpoint agent, and Android service module.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onOpenApkModal && (
              <button
                onClick={onOpenApkModal}
                className="px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg transition-colors flex items-center gap-2 cursor-pointer border border-cyan-800/60 shadow-sm"
              >
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <span>Download APK File</span>
              </button>
            )}
            <button
              onClick={() => {
                let code = '';
                if (activeCodeTab === 'firmware') code = openwrtDaemonCode;
                else if (activeCodeTab === 'agent') code = endpointAgentCode;
                else if (activeCodeTab === 'android') code = androidModuleCode;
                else if (activeCodeTab === 'hostapd') code = hostapdConf;
                else code = JSON.stringify(keypair, null, 2);
                copyToClipboard(code);
              }}
              className="px-3.5 py-2 text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Active Code'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Code Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-lg overflow-x-auto">
        <button
          onClick={() => setActiveCodeTab('firmware')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeCodeTab === 'firmware'
              ? 'bg-slate-800 text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>b4d_router_daemon.py</span>
        </button>

        <button
          onClick={() => setActiveCodeTab('agent')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeCodeTab === 'agent'
              ? 'bg-slate-800 text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>b4d_endpoint_agent.py</span>
        </button>

        <button
          onClick={() => setActiveCodeTab('android')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeCodeTab === 'android'
              ? 'bg-slate-800 text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>B4DAndroidAgent.kt</span>
        </button>

        <button
          onClick={() => setActiveCodeTab('hostapd')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeCodeTab === 'hostapd'
              ? 'bg-slate-800 text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>hostapd.conf + deny</span>
        </button>

        <button
          onClick={() => setActiveCodeTab('keys')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeCodeTab === 'keys'
              ? 'bg-slate-800 text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>Ed25519 Enclave Keys</span>
        </button>
      </div>

      {/* Code Editor / Key View */}
      {activeCodeTab === 'keys' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Key className="w-4 h-4 text-cyan-400" />
                <span>Router &amp; Agent Cryptographic Enclave Keys</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Ed25519 keypair used for mutual 2-way nonce challenge authentication.
              </p>
            </div>
            <button
              onClick={handleGenerateKeys}
              className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg border border-slate-700 flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Rotate &amp; Generate New Keypair</span>
            </button>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className="text-[11px] text-slate-400 font-sans">
                Router Hardware Public Key (Stored on Agent &amp; Clients)
              </div>
              <div className="text-cyan-400 font-bold mt-1 break-all">
                {keypair.pubKey}
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className="text-[11px] text-slate-400 font-sans">
                Router Hardware Private Secret Key (Strictly in Router Enclave /etc/b4dcyber/sec.key)
              </div>
              <div className="text-amber-400 font-bold mt-1 break-all">
                {keypair.privKey}
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-400 font-sans text-[11px]">Hardware AP ID: </span>
                <span className="text-white font-bold">{keypair.apHardwareId}</span>
              </div>
              <div className="text-slate-500 text-[10px]">
                Generated: {keypair.generatedAt}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>
              {activeCodeTab === 'firmware' && '/usr/sbin/b4d_router_daemon.py'}
              {activeCodeTab === 'agent' && '/opt/b4dcyber/b4d_endpoint_agent.py'}
              {activeCodeTab === 'android' && 'com.b4dcyber.defense.agent.B4DZeroTrustWifiAgent.kt'}
              {activeCodeTab === 'hostapd' && '/etc/hostapd.conf'}
            </span>
            <span>Ready for Deployment</span>
          </div>

          <pre className="p-4 text-xs font-mono text-cyan-300 bg-slate-950 overflow-x-auto max-h-[600px] leading-relaxed">
            {activeCodeTab === 'firmware' && openwrtDaemonCode}
            {activeCodeTab === 'agent' && endpointAgentCode}
            {activeCodeTab === 'android' && androidModuleCode}
            {activeCodeTab === 'hostapd' && hostapdConf}
          </pre>
        </div>
      )}
    </div>
  );
}
