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
import { Language } from '../utils/translations';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export function UserGuideModal({ isOpen, onClose, lang }: UserGuideModalProps) {
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
              {lang === 'ur' ? 'System Ko Use Karne Ka Mukammal Tareeqa' : 'How to Use B4DCyber Defense System'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Step-by-step operational guide for Router Setup, Mobile APK Agent, and Evil Twin Defense.
            </p>
          </div>
        </div>

        {/* Section 1: Dashboard Simulator Walkthrough */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="text-sm font-bold text-cyan-300 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center text-xs font-mono">1</span>
            <span>{lang === 'ur' ? 'Is Dashboard Mein Live Test Kaise Karein?' : 'How to Test in This Live Dashboard:'}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300 pt-1">
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Simulate Evil Twin Attack</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Top bar par <strong>"Hamla Test Karein"</strong> button dabayein. Attacker ek fake hotspot chalaye ga jiska BSSID alag hoga. Agent foran auto-connect block kar dega!
              </p>
            </div>

            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Dual-SSID Fleet Migration</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                <strong>"Dual-SSID"</strong> tab mein ja kar <strong>"Emergency Failover"</strong> dabayein. Dekhein kaise aapke phone, laptop, aur tablet ek sath dusre secret vault Wi-Fi par shift hote hain.
              </p>
            </div>

            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <Ban className="w-4 h-4 text-red-400" />
                <span>Hacker Device Blacklisting</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                <strong>"Router Sentinel"</strong> tab mein connected devices ki list dekhein. Jo Kali Linux attacker deauth bhej raha hai use <strong>"Quick Blacklist"</strong> se 1-click par router se kick karein.
              </p>
            </div>

            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Download APK for Phone</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Top bar par <strong>"Download APK"</strong> dabayein aur <strong>B4DCyber-Endpoint-Agent-v2.4.apk</strong> download karke apne Android phone par install karein.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Real-World Deployment Steps */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="text-sm font-bold text-emerald-300 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center text-xs font-mono">2</span>
            <span>{lang === 'ur' ? 'Real Life (Asli Zindagi) Mein Setup Kaise Hoga?' : 'Real-Life Deployment Workflow:'}</span>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            {/* Step A */}
            <div className="flex items-start gap-3 p-3 bg-slate-900 rounded-lg border border-slate-800">
              <Server className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-white">Step A: Router Par Firmware Sentinel Setup</div>
                <div className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                  Apne router (OpenWrt, MikroTik, TP-Link ya Linux) par <strong>"Firmware &amp; Daemon Code"</strong> tab se script copy karein. Router par 2 SSIDs banayein: ek aam <code>Home_Fiber_5G</code> aur dusra secret <code>Home_Fiber_SECURE_VAULT</code>.
                </div>
              </div>
            </div>

            {/* Step B */}
            <div className="flex items-start gap-3 p-3 bg-slate-900 rounded-lg border border-slate-800">
              <Smartphone className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-white">Step B: Mobile Phone Par APK Install</div>
                <div className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                  APK ko Android phone par install karein aur Location permission dein. App background service start kare gi aur apke router ki public key ko register kar legi.
                </div>
              </div>
            </div>

            {/* Step C */}
            <div className="flex items-start gap-3 p-3 bg-slate-900 rounded-lg border border-slate-800">
              <Lock className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-white">Step C: 24/7 Automatic Protection (Khud-Ba-Khud Hifazat)</div>
                <div className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                  Ab aapko kuch nahi karna! Jaise hi aap Wi-Fi range mein jayenge, phone pehle <strong>BSSID, MAC aur 256-bit crypto challenge</strong> check karega. Agar genuine hoga toh connect hoga. Agar koi fake hotspot hoga toh phone connection block karke turant secret vault Wi-Fi par shift ho jayega!
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
            {lang === 'ur' ? 'Samajh Aa Gaya (Close)' : 'Got It'}
          </button>
        </div>
      </div>
    </div>
  );
}
