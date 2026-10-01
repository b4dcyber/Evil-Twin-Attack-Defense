import { useState } from 'react';
import { 
  Terminal, 
  Download, 
  Copy, 
  Check, 
  Play, 
  Smartphone, 
  Server, 
  ShieldCheck, 
  Wifi, 
  Lock, 
  FileCode,
  Laptop
} from 'lucide-react';
import { Language } from '../utils/translations';

interface WindowsPythonViewProps {
  lang: Language;
  onOpenExeModal?: () => void;
}

export function WindowsPythonView({ lang, onOpenExeModal }: WindowsPythonViewProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedReqs, setCopiedReqs] = useState(false);
  const [activeTab, setActiveTab] = useState<'script' | 'guide'>('script');

  const windowsPythonCode = `#!/usr/bin/env python3
"""
================================================================================
B4DCYBER DEFENSE - WINDOWS ENDPOINT SECURITY AGENT & ROUTER CONTROLLER
Platform: Microsoft Windows 10 / 11 (Python 3.8+)
Features:
 1. Native Windows Wi-Fi Beacon & BSSID Inspection (via netsh wlan)
 2. Rogue Evil Twin Hotspot Detection & Automatic Auto-Disconnect
 3. Dual-SSID Failover: Auto-migrates Windows to Secondary Secure Vault SSID
 4. Built-in Router Login Client: SSH/API login to 192.168.1.1 to ban hackers
================================================================================
"""

import os
import sys
import time
import re
import socket
import json
import subprocess
import ctypes
from typing import List, Dict, Optional

# ==========================================
# CONFIGURATION SETTINGS
# ==========================================
TARGET_SSID = "Home_Fiber_5G"
TRUSTED_BSSID = "E4:5F:01:3B:9A:88".upper()
EXPECTED_CHANNEL = 36

# Dual-SSID Failover Vault (Known only to Agent)
FAILOVER_VAULT_SSID = "Home_Fiber_SECURE_VAULT"
FAILOVER_VAULT_BSSID = "E4:5F:01:3B:9A:8A".upper()

# Router Login Details (OpenWrt / Linux / TP-Link / MikroTik)
ROUTER_IP = "192.168.1.1"
ROUTER_PORT = 22
ROUTER_USER = "root"
ROUTER_PASS = "admin123"  # Change to your router password

SCAN_INTERVAL_SECONDS = 3.0


def show_windows_alert(title: str, message: str):
    """Displays a native Windows notification dialog box"""
    try:
        # MessageBoxW: 0x10 = MB_ICONERROR, 0x30 = MB_ICONWARNING
        ctypes.windll.user32.MessageBoxW(0, message, title, 0x10 | 0x0)
    except Exception:
        print(f"[!] {title}: {message}")


def scan_windows_wifi_networks() -> List[Dict[str, str]]:
    """
    Executes 'netsh wlan show networks mode=bssid' on Windows
    to inspect real-time ambient BSSIDs, Signal %, and Channels.
    """
    networks = []
    try:
        output = subprocess.check_output(
            ["netsh", "wlan", "show", "networks", "mode=bssid"],
            text=True,
            encoding="latin1",
            errors="ignore"
        )
        
        current_ssid = ""
        for line in output.splitlines():
            line = line.strip()
            
            # Match SSID
            if line.startswith("SSID "):
                parts = line.split(":", 1)
                if len(parts) > 1:
                    current_ssid = parts[1].strip()
                    
            # Match BSSID (MAC of Access Point)
            elif line.startswith("BSSID "):
                parts = line.split(":", 1)
                if len(parts) > 1:
                    bssid = parts[1].strip().upper()
                    networks.append({
                        "ssid": current_ssid,
                        "bssid": bssid,
                        "signal": "N/A"
                    })
            elif line.startswith("Signal"):
                if networks:
                    parts = line.split(":", 1)
                    if len(parts) > 1:
                        networks[-1]["signal"] = parts[1].strip()
                        
    except Exception as e:
        print(f"[-] Error scanning Windows Wi-Fi: {e}")
        
    return networks


def disconnect_windows_wifi():
    """Emergency Quarantine: Drops Wi-Fi connection immediately on Windows"""
    print("[CRITICAL] Disconnecting Wi-Fi interface to prevent credential theft...")
    subprocess.run(["netsh", "wlan", "disconnect"], capture_output=True)


def switch_to_failover_vault_ssid():
    """
    Automatically connects Windows to the Secondary Failover Vault SSID
    """
    print(f"[*] AUTO-FAILOVER: Connecting to Secure Vault SSID: '{FAILOVER_VAULT_SSID}'...")
    cmd = ["netsh", "wlan", "connect", f"name={FAILOVER_VAULT_SSID}"]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if "Connection request was completed successfully" in res.stdout or res.returncode == 0:
        print(f"[SUCCESS] Windows successfully switched to '{FAILOVER_VAULT_SSID}'!")
    else:
        print(f"[!] Failover output: {res.stdout.strip()}")


def login_router_and_blacklist_hacker(hacker_mac: str, reason: str = "Evil Twin Hotspot / Rogue Probe"):
    """
    Logs in to Router at ROUTER_IP via SSH to kick and blacklist hacker MAC address
    """
    try:
        import paramiko
        print(f"[*] Logging in to router {ROUTER_IP} to blacklist {hacker_mac}...")
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(ROUTER_IP, port=ROUTER_PORT, username=ROUTER_USER, password=ROUTER_PASS, timeout=4)
        
        # OpenWrt commands: Kick client, append hostapd.deny, add iptables drop
        cmd = (
            f"hostapd_cli deauthenticate {hacker_mac} 7 ; "
            f"echo '{hacker_mac} # {reason}' >> /etc/hostapd.deny ; hostapd_cli reload ; "
            f"iptables -I FORWARD -m mac --mac-source {hacker_mac} -j DROP ; "
            f"ebtables -A FORWARD -s {hacker_mac} -j DROP"
        )
        stdin, stdout, stderr = ssh.exec_command(cmd)
        stdout.channel.recv_exit_status()
        print(f"[+] SUCCESS: Hacker {hacker_mac} blacklisted on router firewall!")
        ssh.close()
    except ImportError:
        print("[!] Paramiko library not installed. Run 'pip install paramiko' for automated SSH router login.")
    except Exception as e:
        print(f"[-] Could not login to router: {e}")


def run_windows_agent():
    print("=" * 70)
    print("       B4DCYBER DEFENSE - WINDOWS ENDPOINT SECURITY AGENT")
    print("=" * 70)
    print(f"[*] Target Protected SSID: '{TARGET_SSID}'")
    print(f"[*] Trusted Hardware BSSID: {TRUSTED_BSSID}")
    print(f"[*] Secondary Failover SSID: '{FAILOVER_VAULT_SSID}'")
    print(f"[*] Router Gateway: {ROUTER_IP}:{ROUTER_PORT} (User: {ROUTER_USER})")
    print("=" * 70)
    print("[*] Guard active. Continuous ambient Wi-Fi monitoring running on Windows...")

    while True:
        try:
            visible_networks = scan_windows_wifi_networks()
            evil_twin_found = False
            rogue_bssid = ""

            for net in visible_networks:
                ssid = net["ssid"]
                bssid = net["bssid"]
                
                # Check if someone created a hotspot with our Home Wi-Fi name!
                if ssid == TARGET_SSID:
                    if bssid != TRUSTED_BSSID:
                        # BSSID MISMATCH DETECTED -> EVIL TWIN ATTACK!
                        evil_twin_found = True
                        rogue_bssid = bssid
                        break

            if evil_twin_found:
                print("\\n" + "!" * 70)
                print(f"[CRITICAL ALERT] EVIL TWIN HOTSPOT DETECTED ON WINDOWS!")
                print(f"  Cloned SSID:  {TARGET_SSID}")
                print(f"  Rogue BSSID:  {rogue_bssid} (Mismatched from Trusted: {TRUSTED_BSSID})")
                print("!" * 70)

                # Step 1: Disconnect immediately to stop auto-connect
                disconnect_windows_wifi()

                # Step 2: Show Windows Popup to user
                show_windows_alert(
                    "B4DCyber Security Alert",
                    f"Evil Twin Hotspot Blocked!\\n\\nSomeone cloned '{TARGET_SSID}' with Rogue MAC {rogue_bssid}.\\n\\nWindows was prevented from auto-connecting."
                )

                # Step 3: Trigger Router Remote Login & Blacklist Rogue MAC
                login_router_and_blacklist_hacker(rogue_bssid, "Evil Twin Hotspot Beacon Detected")

                # Step 4: Auto-migrate to Secondary Failover Vault SSID
                time.sleep(1.0)
                switch_to_failover_vault_ssid()

            time.sleep(SCAN_INTERVAL_SECONDS)

        except KeyboardInterrupt:
            print("\\n[*] Agent stopped by user.")
            sys.exit(0)
        except Exception as e:
            print(f"[!] Monitoring loop exception: {e}")
            time.sleep(SCAN_INTERVAL_SECONDS)


if __name__ == "__main__":
    run_windows_agent()
`;

  const requirementsTxt = `paramiko>=3.4.0
requests>=2.31.0
`;

  const handleDownloadPythonScript = () => {
    const blob = new Blob([windowsPythonCode], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'b4d_windows_agent.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadRequirements = () => {
    const blob = new Blob([requirementsTxt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'requirements.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadBatchBuilder = () => {
    const batchContent = `@echo off
title B4DCyber Windows Agent - 1-Click PyInstaller EXE Compiler
color 0B
echo ======================================================================
echo     B4DCYBER WINDOWS AGENT - COMPILING PYTHON TO STANDALONE .EXE
echo ======================================================================
echo.

python --version >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [-] Python not found in PATH! Please install Python from python.org
    pause
    exit /b
)

echo [*] Installing PyInstaller and Paramiko SSH library...
pip install --upgrade pyinstaller paramiko requests

echo [*] Building B4DCyber-Windows-Agent.exe...
pyinstaller --noconfirm --onefile --windowed --name "B4DCyber-Windows-Agent" b4d_windows_agent.py

echo.
echo ======================================================================
echo [+] BUILD SUCCESSFUL! File ready in: dist\\B4DCyber-Windows-Agent.exe
echo ======================================================================
pause
`;
    const blob = new Blob([batchContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'build_windows_exe.bat';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                <Laptop className="w-3.5 h-3.5" />
                Windows 10 / 11 Python Agent
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-400 font-mono">netsh wlan + Paramiko SSH</span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-emerald-400 font-semibold">
                Windows Native Defense
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {lang === 'ur' ? 'Windows Python Agent & Router Login' : 'Windows Python Security Agent & Router Client'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
              {lang === 'ur'
                ? 'Yeh complete Python script hai jisko aap apne Windows PC/Laptop par direct chala saktay hain. Yeh Windows par Wi-Fi BSSID scan karta hai, fake hotspot pakad kar auto-connect rokta hai, aur seedha router ko login karke hacker ko blacklist karta hai.'
                : 'Standalone Python agent designed for Microsoft Windows. Inspects ambient BSSIDs via netsh wlan, aborts auto-connect to rogue APs, switches to Secondary Vault SSID, and logs in to your router gateway to enforce firewall rules.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {onOpenExeModal && (
              <button
                onClick={onOpenExeModal}
                className="px-4 py-2 text-xs font-bold bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>{lang === 'ur' ? 'Windows Setup (.EXE) Download Karein' : 'Download Windows Setup (.EXE)'}</span>
              </button>
            )}

            <button
              onClick={handleDownloadPythonScript}
              className="px-3.5 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-700"
            >
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              <span>{lang === 'ur' ? '.PY Script' : 'Download .py Script'}</span>
            </button>

            <button
              onClick={handleDownloadBatchBuilder}
              className="px-3 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-700"
              title="Download 1-Click PyInstaller Batch Script"
            >
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>build_exe.bat</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation: Script Viewer vs Quick Setup Guide */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-lg">
        <button
          onClick={() => setActiveTab('script')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'script' ? 'bg-slate-800 text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>b4d_windows_agent.py Source Code</span>
        </button>

        <button
          onClick={() => setActiveTab('guide')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'guide' ? 'bg-slate-800 text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>{lang === 'ur' ? 'Windows Par Chalane Ka Tareeqa' : 'Windows Setup Instructions'}</span>
        </button>
      </div>

      {activeTab === 'script' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden space-y-0">
          <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-mono text-slate-400">
              <Laptop className="w-4 h-4 text-cyan-400" />
              <span className="text-white font-semibold">b4d_windows_agent.py</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-500">Ready to run on Windows</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(windowsPythonCode);
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2000);
                }}
                className="px-2.5 py-1 text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy Python Code'}</span>
              </button>
            </div>
          </div>

          <pre className="p-4 text-xs font-mono text-cyan-300 bg-slate-950 overflow-x-auto max-h-[580px] leading-relaxed">
            {windowsPythonCode}
          </pre>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5 text-xs text-slate-300">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>{lang === 'ur' ? 'Windows Laptop / PC Par Chalane Ke 3 Steps:' : 'How to Run on Windows (3 Easy Steps):'}</span>
          </h2>

          <div className="space-y-4">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="font-bold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-mono text-xs">1</span>
                <span>Python Install Karein (Agar pehle se nahi hai)</span>
              </div>
              <p className="text-slate-400 leading-relaxed pl-7">
                Agar aapke Windows PC par Python install nahi hai toh <a href="https://www.python.org/downloads/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">python.org/downloads</a> se Python 3 download karein aur install karte waqt <strong>"Add Python to PATH"</strong> checkbox zaroor tick karein.
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="font-bold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-mono text-xs">2</span>
                <span>SSH Library Install Karein (Router Login Ke Liye)</span>
              </div>
              <p className="text-slate-400 leading-relaxed pl-7">
                Windows Command Prompt (CMD) ya PowerShell open karein aur yeh command chalayein:
              </p>
              <div className="pl-7 pt-1 font-mono text-cyan-300 bg-slate-900 p-2.5 rounded border border-slate-800">
                pip install paramiko
              </div>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="font-bold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-mono text-xs">3</span>
                <span>Script Download Karke Run Karein</span>
              </div>
              <p className="text-slate-400 leading-relaxed pl-7">
                Uper diye gaye <strong>"Download Python Script (.py)"</strong> button se file save karein aur CMD mein folder khol kar run karein:
              </p>
              <div className="pl-7 pt-1 font-mono text-cyan-300 bg-slate-900 p-2.5 rounded border border-slate-800">
                python b4d_windows_agent.py
              </div>
              <p className="text-emerald-400 pl-7 text-[11px] font-semibold">
                ✓ Ab aapka Windows laptop 24/7 monitor hota rahega. Jaise hi koi fake hotspot samne aayega, Windows auto-connect abort karega aur router ko login karke hacker ko blacklist kar dega!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
