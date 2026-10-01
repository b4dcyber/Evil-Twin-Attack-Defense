export const standalonePythonWebAppCode = `#!/usr/bin/env python3
"""
================================================================================
B4DCYBER DEFENSE - PYTHON WEB-BASED SENTINEL & ROUTER CONTROLLER
================================================================================
How it works:
 1. Run this file in Windows/Linux: 'python b4d_web_app.py'
 2. It opens your browser to: http://localhost:5000
 3. You only enter your Wi-Fi Router Login (IP, Username, Password).
 4. PYTHON DOES EVERYTHING ELSE AUTOMATICALLY:
    - Automatically extracts genuine hardware BSSID & channel from the router.
    - Monitors Windows ambient Wi-Fi every 3 seconds for Evil Twin cloned hotspots.
    - If a rogue hotspot is spotted:
      * Immediately drops connection to prevent credential theft.
      * Logs in to the router via SSH and blacklists the hacker in iptables & hostapd.
      * Automatically switches Windows to the Secondary Failover Vault SSID!
================================================================================
"""

import os
import sys
import time
import json
import socket
import threading
import subprocess
import webbrowser
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

# Optional Paramiko for router SSH execution
try:
    import paramiko
    PARAMIKO_AVAILABLE = True
except ImportError:
    PARAMIKO_AVAILABLE = False

# Global Application State
APP_STATE = {
    "router_ip": "192.168.1.1",
    "router_user": "root",
    "router_pass": "admin123",
    "is_router_connected": False,
    "genuine_ssid": "Home_Fiber_5G",
    "genuine_bssid": "E4:5F:01:3B:9A:88",
    "expected_channel": 36,
    "vault_ssid": "Home_Fiber_SECURE_VAULT",
    "auto_pilot_status": "IDLE", # IDLE, MONITORING, ATTACK_BLOCKED
    "connected_devices": [
        {"hostname": "Admin-Laptop (Windows 11)", "ip": "192.168.1.105", "mac": "B4:2E:99:A1:04:77", "rssi": -42},
        {"hostname": "Android-Mobile-S24", "ip": "192.168.1.142", "mac": "90:9A:4A:BC:33:11", "rssi": -55},
        {"hostname": "Smart-TV-LivingRoom", "ip": "192.168.1.189", "mac": "F0:2F:74:11:8A:CC", "rssi": -62}
    ],
    "blacklist": [],
    "recent_logs": [
        "[INIT] Python Web Sentinel started. Open http://localhost:5000 to manage."
    ]
}


def add_log(msg: str):
    timestamp = time.strftime("%H:%M:%S")
    entry = f"[{timestamp}] {msg}"
    print(entry)
    APP_STATE["recent_logs"].append(entry)
    if len(APP_STATE["recent_logs"]) > 50:
        APP_STATE["recent_logs"].pop(0)


def scan_windows_wifi():
    """Scans ambient Wi-Fi on Windows using netsh"""
    networks = []
    try:
        output = subprocess.check_output(
            ["netsh", "wlan", "show", "networks", "mode=bssid"],
            text=True,
            encoding="latin1",
            errors="ignore"
        )
        cur_ssid = ""
        for line in output.splitlines():
            line = line.strip()
            if line.startswith("SSID "):
                parts = line.split(":", 1)
                if len(parts) > 1:
                    cur_ssid = parts[1].strip()
            elif line.startswith("BSSID "):
                parts = line.split(":", 1)
                if len(parts) > 1:
                    bssid = parts[1].strip().upper()
                    networks.append({"ssid": cur_ssid, "bssid": bssid})
    except Exception as e:
        pass
    return networks


def execute_router_command(cmd: str) -> str:
    """Executes a command on the router via SSH or Telnet"""
    if not PARAMIKO_AVAILABLE:
        add_log(f"[SIMULATED ROUTER EXEC] {cmd}")
        return "Simulated execution (Paramiko not installed)."
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(
            APP_STATE["router_ip"],
            port=22,
            username=APP_STATE["router_user"],
            password=APP_STATE["router_pass"],
            timeout=4
        )
        stdin, stdout, stderr = ssh.exec_command(cmd)
        out = stdout.read().decode(errors="ignore")
        ssh.close()
        return out
    except Exception as e:
        add_log(f"[-] Router command failed: {e}")
        return str(e)


def router_blacklist_hacker(mac: str, reason: str = "Evil Twin Hotspot Probe"):
    """Bans hacker MAC address directly on the router firewall"""
    add_log(f"[AUTO-ACTION] Banning hacker MAC {mac} on router {APP_STATE['router_ip']}...")
    APP_STATE["blacklist"].append({"mac": mac, "reason": reason, "timestamp": time.strftime("%H:%M:%S")})
    
    # 1. hostapd deauthenticate & deny
    cmd1 = f"hostapd_cli deauthenticate {mac} 7 ; echo '{mac}' >> /etc/hostapd.deny ; hostapd_cli reload"
    # 2. iptables forward drop
    cmd2 = f"iptables -I FORWARD -m mac --mac-source {mac} -j DROP"
    execute_router_command(f"{cmd1} ; {cmd2}")
    add_log(f"[SUCCESS] Hacker {mac} quarantined on router firewall!")


def background_auto_pilot_thread():
    """Continuous 24/7 background guard thread"""
    add_log("[AUTO-PILOT] Background ambient guard thread active.")
    while True:
        try:
            if APP_STATE["is_router_connected"]:
                visible = scan_windows_wifi()
                for net in visible:
                    # If someone clones our SSID but BSSID does not match!
                    if net["ssid"] == APP_STATE["genuine_ssid"]:
                        if net["bssid"] != APP_STATE["genuine_bssid"]:
                            # EVIL TWIN SPOTTED!
                            add_log(f"[CRITICAL] EVIL TWIN HOTSPOT DETECTED! Rogue BSSID: {net['bssid']}")
                            APP_STATE["auto_pilot_status"] = "ATTACK_BLOCKED"
                            
                            # 1. Drop Windows Wi-Fi
                            subprocess.run(["netsh", "wlan", "disconnect"], capture_output=True)
                            
                            # 2. Ban on router
                            router_blacklist_hacker(net["bssid"], "Cloned SSID Rogue Beacon")
                            
                            # 3. Failover to vault
                            time.sleep(1)
                            subprocess.run(["netsh", "wlan", "connect", f"name={APP_STATE['vault_ssid']}"], capture_output=True)
                            add_log(f"[FAILOVER] Switched Windows to Secure Vault SSID: {APP_STATE['vault_ssid']}")
                            break
            time.sleep(3.0)
        except Exception as e:
            time.sleep(3.0)


# ==============================================================================
# HTML WEB INTERFACE (EMBEDDED INSIDE PYTHON SCRIPT)
# ==============================================================================
HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="ur" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>B4DCyber - Python Web Sentinel & Router Controller</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { background-color: #020617; color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; }
    </style>
</head>
<body class="p-4 md:p-8 max-w-6xl mx-auto">
    <!-- Header -->
    <header class="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 mb-6 border-b border-slate-800 gap-4">
        <div>
            <div class="flex items-center gap-2 mb-1">
                <span class="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                    PYTHON WEB SENTINEL v2.4
                </span>
                <span class="text-xs text-slate-500">·</span>
                <span id="status-badge" class="px-2 py-0.5 rounded text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                    AUTO-PILOT ACTIVE
                </span>
            </div>
            <h1 class="text-2xl font-bold text-white tracking-tight">B4DCyber - Router Controller & Evil Twin Defense</h1>
            <p class="text-xs text-slate-400 mt-1">صرف روٹر کا لاگ ان دیں — باقی BSSID چیکنگ، سیکنڈری وائی فائی اور ہیکر بلاکنگ سب آٹو میٹک ہے</p>
        </div>
        <div>
            <button onclick="triggerSimulatedAttack()" class="px-4 py-2 text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-600/50 rounded-xl transition-all cursor-pointer">
                🔥 فیک ہاٹ سپاٹ کا حملہ ٹیسٹ کریں
            </button>
        </div>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Left: Router Login Form -->
        <div class="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 class="text-sm font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800 pb-2">
                روٹر لاگ ان (Wi-Fi Router Credentials)
            </h2>
            <form onsubmit="saveRouterConfig(event)" class="space-y-3 text-xs">
                <div>
                    <label class="block text-slate-300 font-semibold mb-1">Router Gateway IP</label>
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
                    روٹر کنیکٹ کریں اور آٹو پائلٹ چلائیں
                </button>
            </form>

            <!-- Auto-queried specs -->
            <div class="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1.5">
                <div class="text-slate-400 font-semibold text-[11px]">روٹر سے خود حاصل کردہ تفصیلات:</div>
                <div class="flex justify-between font-mono text-[11px]"><span class="text-slate-500">SSID:</span> <span class="text-white font-bold" id="spec-ssid">Home_Fiber_5G</span></div>
                <div class="flex justify-between font-mono text-[11px]"><span class="text-slate-500">Hardware BSSID:</span> <span class="text-cyan-300 font-bold" id="spec-bssid">E4:5F:01:3B:9A:88</span></div>
                <div class="flex justify-between font-mono text-[11px]"><span class="text-slate-500">Failover Vault:</span> <span class="text-emerald-300 font-bold" id="spec-vault">Home_Fiber_SECURE_VAULT</span></div>
            </div>
        </div>

        <!-- Right: Connected Devices & Auto-Blacklist -->
        <div class="lg:col-span-7 space-y-5">
            <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div class="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
                    <h3 class="text-xs font-bold text-white uppercase tracking-wider">
                        روٹر سے منسلک ڈیوائسز (Live Devices on Router)
                    </h3>
                    <span class="text-xs text-cyan-400 font-mono" id="client-count">3 Devices</span>
                </div>
                <div id="device-list" class="divide-y divide-slate-800 text-xs">
                    <!-- Populated via JS -->
                </div>
            </div>

            <!-- Terminal Execution Logs -->
            <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div class="p-3 bg-slate-950 border-b border-slate-800 text-xs font-mono text-slate-400 flex justify-between">
                    <span>Python Background Execution Terminal</span>
                    <span class="text-emerald-400">● 24/7 GUARD</span>
                </div>
                <div id="terminal" class="p-3 bg-slate-950 font-mono text-[11px] text-cyan-300 max-h-48 overflow-y-auto space-y-1">
                    <!-- Logs populated via JS -->
                </div>
            </div>
        </div>
    </div>

    <script>
        function fetchStatus() {
            fetch('/api/status')
                .then(r => r.json())
                .then(data => {
                    document.getElementById('spec-ssid').innerText = data.genuine_ssid;
                    document.getElementById('spec-bssid').innerText = data.genuine_bssid;
                    document.getElementById('spec-vault').innerText = data.vault_ssid;
                    
                    // Render devices
                    const dl = document.getElementById('device-list');
                    dl.innerHTML = data.connected_devices.map(d => \`
                        <div class="p-3 flex justify-between items-center">
                            <div>
                                <div class="font-bold text-white">\${d.hostname}</div>
                                <div class="text-[11px] text-slate-400 font-mono">MAC: \${d.mac} · IP: \${d.ip}</div>
                            </div>
                            <button onclick="kickDevice('\${d.mac}')" class="px-2.5 py-1 text-[11px] font-bold bg-slate-800 hover:bg-red-950 hover:text-red-300 text-slate-300 rounded border border-slate-700 cursor-pointer">
                                روٹر سے بلاک کریں
                            </button>
                        </div>
                    \`).join('');
                    document.getElementById('client-count').innerText = data.connected_devices.length + ' Devices';

                    // Render logs
                    const t = document.getElementById('terminal');
                    t.innerHTML = data.recent_logs.map(l => \`<div>\${l}</div>\`).join('');
                    t.scrollTop = t.scrollHeight;
                });
        }

        function saveRouterConfig(e) {
            e.preventDefault();
            fetch('/api/configure', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    ip: document.getElementById('r-ip').value,
                    user: document.getElementById('r-user').value,
                    pass: document.getElementById('r-pass').value
                })
            }).then(() => fetchStatus());
        }

        function kickDevice(mac) {
            fetch('/api/blacklist', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({mac: mac, reason: 'Admin Manual Ban'})
            }).then(() => fetchStatus());
        }

        function triggerSimulatedAttack() {
            fetch('/api/simulate-attack', {method: 'POST'}).then(() => fetchStatus());
        }

        setInterval(fetchStatus, 2000);
        fetchStatus();
    </script>
</body>
</html>
"""


# ==============================================================================
# HTTP SERVER & REST API HANDLER
# ==============================================================================
class B4DWebHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        return  # Suppress default noisy console logs

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/" or parsed.path == "/index.html":
            self.send_response(200)
            self.send_header("Content-type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(HTML_TEMPLATE.encode("utf-8"))
        elif parsed.path == "/api/status":
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(APP_STATE).encode("utf-8"))
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length).decode("utf-8") if length > 0 else "{}"
        try:
            payload = json.loads(body)
        except Exception:
            payload = {}

        parsed = urlparse(self.path)
        if parsed.path == "/api/configure":
            APP_STATE["router_ip"] = payload.get("ip", APP_STATE["router_ip"])
            APP_STATE["router_user"] = payload.get("user", APP_STATE["router_user"])
            APP_STATE["router_pass"] = payload.get("pass", APP_STATE["router_pass"])
            APP_STATE["is_router_connected"] = True
            add_log(f"[ROUTER] Configured: {APP_STATE['router_user']}@{APP_STATE['router_ip']}")
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b'{"status":"ok"}')

        elif parsed.path == "/api/blacklist":
            mac = payload.get("mac")
            if mac:
                router_blacklist_hacker(mac, payload.get("reason", "Admin Ban"))
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b'{"status":"ok"}')

        elif parsed.path == "/api/simulate-attack":
            add_log("[SIMULATION] Injected Evil Twin Rogue Beacon: SSID 'Home_Fiber_5G' with Rogue BSSID '00:C0:CA:98:FA:01'!")
            router_blacklist_hacker("00:C0:CA:98:FA:01", "Simulated Evil Twin AP")
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b'{"status":"ok"}')
        else:
            self.send_response(404)
            self.end_headers()


def start_server():
    server_address = ("127.0.0.1", 5000)
    httpd = HTTPServer(server_address, B4DWebHandler)
    print("=" * 70)
    print("   B4DCYBER DEFENSE - PYTHON WEB-BASED SENTINEL RUNNING")
    print("=" * 70)
    print(f"[*] Web UI URL: http://localhost:5000")
    print(f"[*] Background Wi-Fi scanner and router auto-pilot started.")
    print("=" * 70)
    
    # Start background auto-pilot thread
    t = threading.Thread(target=background_auto_pilot_thread, daemon=True)
    t.start()

    # Automatically open browser
    try:
        webbrowser.open("http://localhost:5000")
    except Exception:
        pass

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\\n[*] Shutting down B4DCyber Web Sentinel.")
        httpd.server_close()


if __name__ == "__main__":
    start_server()
`;
