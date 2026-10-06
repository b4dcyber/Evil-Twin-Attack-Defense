import { 
  HelpCircle, 
  X, 
  ShieldCheck, 
  Smartphone, 
  Server, 
  Flame, 
  Ban, 
  Layers, 
  CheckCircle2, 
  ArrowRight,
  Wifi,
  Lock
} from 'lucide-react';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserGuideModal({ isOpen, onClose }: UserGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 space-y-6 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 font-mono">
              B4DCyber Operational Manual
            </span>
            <h2 className="text-xl font-bold text-white mt-0.5">
              How to Use B4DCyber Defense System
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Step-by-step operational guide for Router Setup, Client Agents, and Evil Twin Defense.
            </p>
          </div>
        </div>

        {/* Section 1: Dashboard Simulator Walkthrough */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="text-sm font-bold text-cyan-300 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center text-xs font-mono">1</span>
            <span>How to Test in This Live Dashboard:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300 pt-1">
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Simulate Evil Twin Attack</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Click <strong>"Simulate Evil Twin"</strong> in the top header. An attacker launches a fake cloned hotspot with a mismatched BSSID. The agent immediately halts auto-connection.
              </p>
            </div>

            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Dual-SSID Fleet Migration</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Navigate to the <strong>"Dual-SSID"</strong> tab and click <strong>"Emergency Failover"</strong>. Observe all connected devices seamlessly migrate to the secondary secure vault network.
              </p>
            </div>

            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <Ban className="w-4 h-4 text-red-400" />
                <span>Hacker Device Blacklisting</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Open the <strong>"Router Sentinel"</strong> tab to view connected clients. When an unauthorized attacker floods probe packets, kick them via 1-click router firewall ban.
              </p>
            </div>

            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Download Client Agents</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Use the top header buttons to download <strong>Windows .EXE</strong> or <strong>Android APK</strong> agents for continuous background protection.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Real-World Deployment Steps */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="text-sm font-bold text-emerald-300 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center text-xs font-mono">2</span>
            <span>Real-Life Deployment Workflow:</span>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            {/* Step A */}
            <div className="flex items-start gap-3 p-3 bg-slate-900 rounded-lg border border-slate-800">
              <Server className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-white">Step A: Router Authentication &amp; Dual-SSID Setup</div>
                <div className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                  Log in to your router gateway (OpenWrt, MikroTik, TP-Link, DD-WRT, or Linux AP). Configure two SSIDs: your standard <code>Home_Fiber_5G</code> and an emergency vault <code>Home_Fiber_SECURE_VAULT</code>.
                </div>
              </div>
            </div>

            {/* Step B */}
            <div className="flex items-start gap-3 p-3 bg-slate-900 rounded-lg border border-slate-800">
              <Smartphone className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-white">Step B: Endpoint Agent Installation</div>
                <div className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                  Run the Windows agent or Android APK. The agent monitors ambient beacons and binds to the authentic BSSID and cryptographic fingerprint of your router.
                </div>
              </div>
            </div>

            {/* Step C */}
            <div className="flex items-start gap-3 p-3 bg-slate-900 rounded-lg border border-slate-800">
              <Lock className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-white">Step C: 24/7 Automated Protection</div>
                <div className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                  Before any connection completes, the endpoint inspects hardware BSSID, frequency channel, and cryptographic nonce. If a rogue Evil Twin is detected, it blocks association and migrates to the vault SSID.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg transition-colors cursor-pointer font-bold"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
