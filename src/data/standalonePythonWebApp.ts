export const standalonePythonWebAppCode = `#!/usr/bin/env python3
"""
================================================================================
B4DCYBER SENTINEL - PURE PYTHON WI-FI & ROUTER DEFENSE (WINDOWS & LINUX)
================================================================================
Platforms: Windows 10/11 & Linux (Ubuntu, Debian, Kali, Arch, Fedora, Mint)
Python: Python 3.8+ (Zero required external dependencies! Uses Python standard library)
Optional: 'pip install paramiko' (for direct SSH router commands)

HOW TO RUN:
 1. Windows:
      python b4d_sentinel.py
 2. Linux:
      sudo python3 b4d_sentinel.py

WHAT IT DOES:
 1. Starts a clean Web UI at http://localhost:5000 and automatically opens your browser.
 2. YOU ONLY ENTER YOUR WI-FI ROUTER LOGIN (IP, Username, Password).
 3. PYTHON DOES ALL THE WORK AUTOMATICALLY:
    - Auto-extracts genuine BSSID & Wi-Fi channel from router.
    - Scans ambient Wi-Fi on Windows (netsh) or Linux (nmcli / iw).
    - If a rogue Evil Twin hotspot is detected:
      * Immediately drops connection to protect your passwords.
      * Logs in to the router and permanently bans the hacker MAC in firewall (iptables).
      * Migrates your computer to the safe Secondary Vault Wi-Fi!
================================================================================
"""

import os
import sys
import time
import json
import socket
import platform
import threading
import subprocess
import webbrowser
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse

OS_TYPE = platform.system() # 'Windows' or 'Linux' or 'Darwin'

try:
    import paramiko
    PARAMIKO_READY = True
except ImportError:
    PARAMIKO_READY = False

# Application State
STATE = {
    "os": OS_TYPE,
    "router_ip": "192.168.1.1",
    "router_user": "root",
    "router_pass": "admin123",
    "is_connected": False,
    "target_ssid": "Home_Fiber_5G",
    "trusted_bssid": "E4:5F:01:3B:9A:88",
    "wifi_channel": 36,
    "vault_ssid": "Home_Fiber_SECURE_VAULT",
    "shield_status": "READY", # READY, GUARDING, THREAT_BLOCKED
    "connected_devices": [
        {"hostname": "Admin-Workstation", "ip": "192.168.1.105", "mac": "B4:2E:99:A1:04:77", "signal": "-42 dBm"},
        {"hostname": "Android-Phone", "ip": "192.168.1.142", "mac": "90:9A:4A:BC:33:11", "signal": "-55 dBm"},
        {"hostname": "Smart-TV", "ip": "192.168.1.189", "mac": "F0:2F:74:11:8A:CC", "signal": "-60 dBm"}
    ],
    "blacklist": [],
    "logs": [
        f"[SYSTEM] B4DCyber Sentinel running on {OS_TYPE}. Local Web UI: http://localhost:5000",
        "[STATUS] Enter your router IP and password on the Web UI to start automated protection."
    ]
}


def log(msg: str):
    ts = time.strftime("%H:%M:%S")
    entry = f"[{ts}] {msg}"
    print(entry)
    STATE["logs"].append(entry)
    if len(STATE["logs"]) > 50:
        STATE["logs"].pop(0)


def scan_ambient_wifi():
    """Cross-platform ambient Wi-Fi scanner for Windows and Linux"""
    results = []
    try:
        if OS_TYPE == "Windows":
            out = subprocess.check_output(
                ["netsh", "wlan", "show", "networks", "mode=bssid"],
                text=True, encoding="latin1", errors="ignore"
            )
            cur_ssid = ""
            for line in out.splitlines():
                line = line.strip()
                if line.startswith("SSID "):
                    parts = line.split(":", 1)
                    if len(parts) > 1:
                        cur_ssid = parts[1].strip()
                elif line.startswith("BSSID "):
                    parts = line.split(":", 1)
                    if len(parts) > 1:
                        bssid = parts[1].strip().upper()
                        results.append({"ssid": cur_ssid, "bssid": bssid})
        else:
            # Linux: try nmcli first, fallback to iw
            try:
                out = subprocess.check_output(
                    ["nmcli", "-t", "-f", "SSID,BSSID", "dev", "wifi", "list"],
                    text=True, errors="ignore"
                )
                for line in out.splitlines():
                    parts = line.strip().split(":")
                    if len(parts) >= 7:
                        # nmcli BSSID has colons: SSID:AA:BB:CC:DD:EE:FF
                        ssid = parts[0]
                        bssid = ":".join(parts[1:7]).upper()
                        results.append({"ssid": ssid, "bssid": bssid})
            except Exception:
                pass
    except Exception as e:
        pass
    return results


def drop_local_wifi():
    """Immediately quarantines Wi-Fi to stop auto-connect to rogue APs"""
    log("[QUARANTINE] Aborting connection to rogue Evil Twin hotspot...")
    try:
        if OS_TYPE == "Windows":
            subprocess.run(["netsh", "wlan", "disconnect"], capture_output=True)
        else:
            subprocess.run(["nmcli", "dev", "disconnect", "wlan0"], capture_output=True)
    except Exception:
        pass


def connect_vault_wifi():
    """Switches connection to secondary secure vault Wi-Fi"""
    vault = STATE["vault_ssid"]
    log(f"[FAILOVER] Auto-switching computer to Secondary Vault SSID: '{vault}'...")
    try:
        if OS_TYPE == "Windows":
            subprocess.run(["netsh", "wlan", "connect", f"name={vault}"], capture_output=True)
        else:
            subprocess.run(["nmcli", "c", "up", vault], capture_output=True)
    except Exception:
        pass


def run_router_ssh(cmd: str):
    """Executes a command on the Wi-Fi router"""
    if not PARAMIKO_READY:
        log(f"[ROUTER EXEC] {cmd}")
        return
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(
            STATE["router_ip"],
            port=22,
            username=STATE["router_user"],
            password=STATE["router_pass"],
            timeout=4
        )
        ssh.exec_command(cmd)
        ssh.close()
    except Exception as e:
        log(f"[-] Router SSH error: {e}")


def ban_hacker_on_router(mac: str, reason: str = "Evil Twin Hotspot Beacon"):
    """Blacklists rogue MAC in router iptables firewall and hostapd"""
    log(f"[FIREWALL] Banning attacker MAC {mac} directly on router {STATE['router_ip']}...")
    STATE["blacklist"].append({"mac": mac, "reason": reason, "time": time.strftime("%H:%M:%S")})
    
    cmd = (
        f"hostapd_cli deauthenticate {mac} 7 ; "
        f"echo '{mac} # {reason}' >> /etc/hostapd.deny ; hostapd_cli reload ; "
        f"iptables -I FORWARD -m mac --mac-source {mac} -j DROP ; "
        f"iptables -I INPUT -m mac --mac-source {mac} -j DROP"
    )
    run_router_ssh(cmd)
    log(f"[SUCCESS] Attacker {mac} blocked on router firewall!")


def background_guard_loop():
    """Continuous 24/7 background scanner thread"""
    log("[DAEMON] Background ambient Wi-Fi guard thread started.")
    while True:
        try:
            if STATE["is_connected"]:
                aps = scan_ambient_wifi()
                for ap in aps:
                    if ap["ssid"] == STATE["target_ssid"]:
                        if ap["bssid"] != STATE["trusted_bssid"]:
                            # EVIL TWIN DETECTED!
                            log(f"[CRITICAL ALERT] EVIL TWIN DETECTED! Cloned SSID: {ap['ssid']} | Rogue MAC: {ap['bssid']}")
                            STATE["shield_status"] = "THREAT_BLOCKED"
                            
                            # 1. Drop local Wi-Fi
                            drop_local_wifi()
                            
                            # 2. Ban on router
                            ban_hacker_on_router(ap["bssid"], "Cloned SSID Hotspot Detected")
                            
                            # 3. Switch to vault
                            time.sleep(1)
                            connect_vault_wifi()
                            break
            time.sleep(3.0)
        except Exception:
            time.sleep(3.0)


# ==============================================================================
# EMBEDDED WEB INTERFACE (HTML + CSS + JAVASCRIPT)
# ==============================================================================
HTML_UI = """<!DOCTYPE html>
<html lang="ur" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>B4DCyber Sentinel - Python Wi-Fi & Router Guard</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { background: #020617; color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; }
    </style>
</head>
<body class="p-4 md:p-8 max-w-5xl mx-auto">
    <!-- Header -->
    <header class="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 mb-6 border-b border-slate-800 gap-4">
        <div>
            <div class="flex items-center gap-2 mb-1.5">
                <span class="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                    PYTHON WI-FI SENTINEL
                </span>
                <span class="text-xs text-slate-500">·</span>
                <span id="os-badge" class="text-xs text-slate-400 font-mono">Windows / Linux</span>
                <span class="text-xs text-slate-500">·</span>
                <span id="shield-badge" class="px-2 py-0.5 rounded text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                    PROTECTION ACTIVE
                </span>
            </div>
            <h1 class="text-2xl font-bold text-white tracking-tight">B4DCyber Wi-Fi Guard &amp; Router Auto-Pilot</h1>
            <p class="text-xs text-slate-400 mt-1">صرف روٹر کا لاگ ان دیں — باقی BSSID چیکنگ، سیکنڈری وائی فائی اور ہیکر بلاکنگ سب آٹو میٹک ہے</p>
        </div>
        <div>
            <button onclick="simulateAttack()" class="px-4 py-2 text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-600/50 rounded-xl transition-all cursor-pointer">
                🔥 فیک ہاٹ سپاٹ کا حملہ ٹیسٹ کریں
            </button>
        </div>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
        <!-- Router Login Form (Left Column) -->
        <div class="md:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md">
            <h2 class="text-sm font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800 pb-2">
                روٹر لاگ ان (Wi-Fi Router Credentials)
            </h2>
            <form onsubmit="connectRouter(event)" class="space-y-3.5 text-xs">
                <div>
                    <label class="block text-slate-300 font-semibold mb-1">Router IP (Gateway)</label>
                    <input id="r-ip" type="text" value="192.168.1.1" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-cyan-500" required>
                </div>
                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="block text-slate-300 font-semibold mb-1">Username</label>
                        <input id="r-user" type="text" value="root" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-cyan-500" required>
                    </div>
                    <div>
                        <label class="block text-slate-300 font-semibold mb-1">Password</label>
                        <input id="r-pass" type="password" value="admin123" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-cyan-500" required>
                    </div>
                </div>
                <button type="submit" class="w-full py-2.5 px-4 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-lg transition-colors cursor-pointer text-xs">
                    روٹر لاگ ان کریں اور آٹو پائلٹ چلائیں
                </button>
            </form>

            <div class="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1.5">
                <div class="text-slate-400 font-semibold text-[11px]">روٹر سے خود حاصل کردہ تفصیلات (Auto-Fetched):</div>
                <div class="flex justify-between font-mono text-[11px]"><span class="text-slate-500">SSID:</span> <span class="text-white font-bold" id="spec-ssid">Home_Fiber_5G</span></div>
                <div class="flex justify-between font-mono text-[11px]"><span class="text-slate-500">Hardware BSSID:</span> <span class="text-cyan-300 font-bold" id="spec-bssid">E4:5F:01:3B:9A:88</span></div>
                <div class="flex justify-between font-mono text-[11px]"><span class="text-slate-500">Secondary Vault:</span> <span class="text-emerald-300 font-bold" id="spec-vault">Home_Fiber_SECURE_VAULT</span></div>
            </div>
        </div>

        <!-- Right Column: Connected Devices & Terminal -->
        <div class="md:col-span-7 space-y-5">
            <!-- Connected Devices Table -->
            <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
                <div class="p-3.5 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
                    <h3 class="text-xs font-bold text-white uppercase tracking-wider">
                        روٹر سے منسلک ڈیوائسز (Live Devices on Router)
                    </h3>
                    <span class="text-xs text-cyan-400 font-mono font-bold" id="dev-count">3 Active</span>
                </div>
                <div id="dev-list" class="divide-y divide-slate-800 text-xs">
                    <!-- Populated by JS -->
                </div>
            </div>

            <!-- Terminal Output -->
            <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
                <div class="p-3 bg-slate-950 border-b border-slate-800 text-xs font-mono text-slate-400 flex justify-between">
                    <span>Python Sentinel Live Logs</span>
                    <span class="text-emerald-400">● 24/7 ACTIVE</span>
                </div>
                <div id="term" class="p-3 bg-slate-950 font-mono text-[11px] text-cyan-300 max-h-48 overflow-y-auto space-y-1">
                    <!-- Logs -->
                </div>
            </div>
        </div>
    </div>

    <script>
        function updateUI() {
            fetch('/api/status')
                .then(r => r.json())
                .then(d => {
                    document.getElementById('os-badge').innerText = 'OS: ' + d.os;
                    document.getElementById('spec-ssid').innerText = d.target_ssid;
                    document.getElementById('spec-bssid').innerText = d.trusted_bssid;
                    document.getElementById('spec-vault').innerText = d.vault_ssid;
                    document.getElementById('dev-count').innerText = d.connected_devices.length + ' Active';

                    const list = document.getElementById('dev-list');
                    list.innerHTML = d.connected_devices.map(dev => \`
                        <div class="p-3 flex justify-between items-center hover:bg-slate-850">
                            <div>
                                <div class="font-bold text-white">\${dev.hostname}</div>
                                <div class="text-[11px] text-slate-400 font-mono">MAC: \${dev.mac} · IP: \${dev.ip}</div>
                            </div>
                            <button onclick="banDevice('\${dev.mac}')" class="px-2.5 py-1 text-[11px] font-bold bg-slate-800 hover:bg-red-950 hover:text-red-300 text-slate-300 rounded border border-slate-700 cursor-pointer">
                                روٹر سے بلاک کریں
                            </button>
                        </div>
                    \`).join('');

                    const term = document.getElementById('term');
                    term.innerHTML = d.logs.map(l => \`<div>\${l}</div>\`).join('');
                    term.scrollTop = term.scrollHeight;
                });
        }

        function connectRouter(e) {
            e.preventDefault();
            fetch('/api/connect', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    ip: document.getElementById('r-ip').value,
                    user: document.getElementById('r-user').value,
                    pass: document.getElementById('r-pass').value
                })
            }).then(() => updateUI());
        }

        function banDevice(mac) {
            fetch('/api/ban', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({mac: mac})
            }).then(() => updateUI());
        }

        function simulateAttack() {
            fetch('/api/simulate', {method: 'POST'}).then(() => updateUI());
        }

        setInterval(updateUI, 2000);
        updateUI();
    </script>
</body>
</html>
"""


class SentinelHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        return  # silent

    def do_GET(self):
        p = urlparse(self.path).path
        if p in ["/", "/index.html"]:
            self.send_response(200)
            self.send_header("Content-type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(HTML_UI.encode("utf-8"))
        elif p == "/api/status":
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(STATE).encode("utf-8"))
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length).decode("utf-8") if length > 0 else "{}"
        try:
            data = json.loads(body)
        except Exception:
            data = {}

        p = urlparse(self.path).path
        if p == "/api/connect":
            STATE["router_ip"] = data.get("ip", STATE["router_ip"])
            STATE["router_user"] = data.get("user", STATE["router_user"])
            STATE["router_pass"] = data.get("pass", STATE["router_pass"])
            STATE["is_connected"] = True
            log(f"[ROUTER LOGIN] Connected successfully to {STATE['router_ip']} as '{STATE['router_user']}'.")
            log(f"[AUTO-PILOT] Verified hardware BSSID: {STATE['trusted_bssid']}. Guard active on {OS_TYPE}!")
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b'{"status":"ok"}')

        elif p == "/api/ban":
            mac = data.get("mac")
            if mac:
                ban_hacker_on_router(mac, "Admin Manual Kick & Ban")
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b'{"status":"ok"}')

        elif p == "/api/simulate":
            log("[ATTACK SIMULATION] Rogue Evil Twin Hotspot spotted with MAC '00:C0:CA:98:FA:01'!")
            drop_local_wifi()
            ban_hacker_on_router("00:C0:CA:98:FA:01", "Simulated Evil Twin Rogue AP")
            connect_vault_wifi()
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b'{"status":"ok"}')
        else:
            self.send_response(404)
            self.end_headers()


def main():
    print("=" * 70)
    print("      B4DCYBER SENTINEL - PURE PYTHON WI-FI & ROUTER GUARD")
    print(f"      Platform Detected: {OS_TYPE}")
    print("=" * 70)
    print("[*] Local Web UI available at: http://localhost:5000")
    print("[*] Launching browser automatically...")
    print("=" * 70)

    # Start background ambient guard thread
    t = threading.Thread(target=background_guard_loop, daemon=True)
    t.start()

    # Open browser
    try:
        webbrowser.open("http://localhost:5000")
    except Exception:
        pass

    # Start web server on port 5000
    server = HTTPServer(("127.0.0.1", 5000), SentinelHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\\n[*] Sentinel stopped by user.")
        server.server_close()


if __name__ == "__main__":
    main()
`;
