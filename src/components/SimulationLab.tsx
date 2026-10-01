import { useState } from 'react';
import { 
  Play, 
  RotateCcw, 
  ShieldAlert, 
  ShieldCheck, 
  Wifi, 
  Radio, 
  Terminal, 
  ArrowRight, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  Flame,
  Zap,
  MapPin,
  Layers,
  Smartphone
} from 'lucide-react';
import { Language, translations } from '../utils/translations';
import { DetectedAccessPoint, ConnectedClient, WifiProfile } from '../types/cyber';

interface SimulationLabProps {
  lang: Language;
  homeProfile: WifiProfile;
  onInjectEvilTwin: () => void;
  onInjectHackerClient: () => void;
  onTriggerFleetFailover: () => void;
  onResetSimulation: () => void;
  onAddLog: (type: any, severity: any, title: string, details: string, meta?: any) => void;
}

export function SimulationLab({
  lang,
  homeProfile,
  onInjectEvilTwin,
  onInjectHackerClient,
  onTriggerFleetFailover,
  onResetSimulation,
  onAddLog
}: SimulationLabProps) {
  const t = translations[lang];

  const [activeScenario, setActiveScenario] = useState<number | null>(null);
  const [scenarioStep, setScenarioStep] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const runScenario1 = async () => {
    setIsRunning(true);
    setActiveScenario(1);
    setScenarioStep(1);
    await new Promise(r => setTimeout(r, 600));

    setScenarioStep(2);
    await new Promise(r => setTimeout(r, 700));

    setScenarioStep(3);
    await new Promise(r => setTimeout(r, 800));

    setScenarioStep(4);
    await new Promise(r => setTimeout(r, 700));

    setScenarioStep(5);
    setIsRunning(false);
    onAddLog(
      'CRYPTO_CHALLENGE',
      'success',
      'Scenario 1: Genuine Home Handshake Validated',
      'BSSID E4:5F:01:3B:9A:88 verified. Ed25519 signature valid. Network interface opened for encrypted traffic.'
    );
  };

  const runScenario2 = async () => {
    setIsRunning(true);
    setActiveScenario(2);
    setScenarioStep(1);
    onInjectEvilTwin();
    await new Promise(r => setTimeout(r, 700));

    setScenarioStep(2);
    await new Promise(r => setTimeout(r, 800));

    setScenarioStep(3);
    await new Promise(r => setTimeout(r, 900));

    setScenarioStep(4);
    await new Promise(r => setTimeout(r, 800));

    setScenarioStep(5);
    setIsRunning(false);
    onAddLog(
      'EVIL_TWIN_ALERT',
      'critical',
      'Scenario 2: Evil Twin Cloned Hotspot Attack Intercepted',
      'Attacker with Alfa card broadcasted cloned SSID with -35 dBm signal. BSSID mismatch detected. Auto-connect aborted, wlan0 isolated.'
    );
  };

  const runScenario3 = async () => {
    setIsRunning(true);
    setActiveScenario(3);
    setScenarioStep(1);
    onInjectHackerClient();
    await new Promise(r => setTimeout(r, 800));

    setScenarioStep(2);
    await new Promise(r => setTimeout(r, 800));

    setScenarioStep(3);
    await new Promise(r => setTimeout(r, 900));

    setScenarioStep(4);
    setIsRunning(false);
    onAddLog(
      'HACKER_DETECTED',
      'critical',
      'Scenario 3: Hacker Deauth Storm Caught by Sentinel',
      'Device 00:C0:CA:98:FA:01 flooded 300+ deauth frames. Router firmware triggered alert for instant 1-click ban.'
    );
  };

  const runScenario4 = async () => {
    // Dual-SSID Swarm Failover
    setIsRunning(true);
    setActiveScenario(4);
    setScenarioStep(1);
    onInjectEvilTwin();
    await new Promise(r => setTimeout(r, 700));

    setScenarioStep(2);
    await new Promise(r => setTimeout(r, 800));

    setScenarioStep(3);
    onTriggerFleetFailover();
    await new Promise(r => setTimeout(r, 900));

    setScenarioStep(4);
    await new Promise(r => setTimeout(r, 800));

    setScenarioStep(5);
    setIsRunning(false);
    onAddLog(
      'FLEET_MIGRATED',
      'success',
      'Scenario 4: Swarm Failover Executed Successfully',
      'Evil Twin attacked Primary SSID. Router Sentinel fired Secondary Failover SSID and migrated all registered agent devices together!'
    );
  };

  return (
    <div className="space-y-6">
      {/* Simulation Lab Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                <Zap className="w-3.5 h-3.5" />
                {lang === 'ur' ? 'Evil Twin Attack Defense Sandbox' : 'Live Attack & Defense Sandbox'}
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-400">Dual-SSID &amp; Multi-Agent Swarm</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {t.simTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
              {t.simSubtitle}
            </p>
          </div>

          <button
            onClick={onResetSimulation}
            className="px-3.5 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors border border-slate-700 flex items-center gap-2 cursor-pointer shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{lang === 'ur' ? 'Lab Ko Reset Karein' : 'Reset Sandbox State'}</span>
          </button>
        </div>
      </div>

      {/* 4 Real-Life Interactive Scenario Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Scenario 1: Genuine Home Handshake */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
          activeScenario === 1 ? 'bg-slate-900 border-cyan-500 shadow-md ring-1 ring-cyan-500/30' : 'bg-slate-900/80 border-slate-800'
        }`}>
          <div>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-2.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
              {lang === 'ur' ? 'Scenario 01' : 'Scenario 01'}
            </div>
            <h2 className="text-sm font-bold text-white mt-1">
              {t.scenario1Title}
            </h2>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              {t.scenario1Desc}
            </p>
          </div>

          <div className="pt-4 mt-3 border-t border-slate-800">
            <button
              onClick={runScenario1}
              disabled={isRunning}
              className="w-full py-2 px-3 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>{lang === 'ur' ? 'Handshake Test' : 'Run Handshake'}</span>
            </button>
          </div>
        </div>

        {/* Scenario 2: Evil Twin Cloned Hotspot */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
          activeScenario === 2 ? 'bg-slate-900 border-amber-500 shadow-md ring-1 ring-amber-500/30' : 'bg-slate-900/80 border-slate-800'
        }`}>
          <div>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-2.5">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
              {lang === 'ur' ? 'Scenario 02' : 'Scenario 02'}
            </div>
            <h2 className="text-sm font-bold text-white mt-1">
              {t.scenario2Title}
            </h2>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              {t.scenario2Desc}
            </p>
          </div>

          <div className="pt-4 mt-3 border-t border-slate-800">
            <button
              onClick={runScenario2}
              disabled={isRunning}
              className="w-full py-2 px-3 text-xs font-semibold bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Flame className="w-3 h-3 fill-current" />
              <span>{lang === 'ur' ? 'Evil Twin Hamla' : 'Test Evil Twin'}</span>
            </button>
          </div>
        </div>

        {/* Scenario 3: Hacker Client Infiltration */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
          activeScenario === 3 ? 'bg-slate-900 border-red-500 shadow-md ring-1 ring-red-500/30' : 'bg-slate-900/80 border-slate-800'
        }`}>
          <div>
            <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mb-2.5">
              <Terminal className="w-4 h-4" />
            </div>
            <div className="text-[11px] font-semibold text-red-400 uppercase tracking-wider">
              {lang === 'ur' ? 'Scenario 03' : 'Scenario 03'}
            </div>
            <h2 className="text-sm font-bold text-white mt-1">
              {t.scenario3Title}
            </h2>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              {t.scenario3Desc}
            </p>
          </div>

          <div className="pt-4 mt-3 border-t border-slate-800">
            <button
              onClick={runScenario3}
              disabled={isRunning}
              className="w-full py-2 px-3 text-xs font-semibold bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>{lang === 'ur' ? 'Hacker Deauth Test' : 'Test Hacker Probe'}</span>
            </button>
          </div>
        </div>

        {/* Scenario 4: Dual-SSID Swarm Failover (USER REQUEST!) */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
          activeScenario === 4 ? 'bg-slate-900 border-cyan-400 shadow-lg ring-1 ring-cyan-400/40' : 'bg-slate-900/80 border-cyan-800/60'
        }`}>
          <div>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-2.5">
              <Layers className="w-4 h-4" />
            </div>
            <div className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">
              {lang === 'ur' ? 'Scenario 04 (Special)' : 'Scenario 04 (Special)'}
            </div>
            <h2 className="text-sm font-bold text-white mt-1">
              {t.scenario4Title}
            </h2>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              {t.scenario4Desc}
            </p>
          </div>

          <div className="pt-4 mt-3 border-t border-slate-800">
            <button
              onClick={runScenario4}
              disabled={isRunning}
              className="w-full py-2 px-3 text-xs font-semibold bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-slate-950 font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Zap className="w-3 h-3 fill-current" />
              <span>{lang === 'ur' ? 'Sary Agents Shift Karein' : 'Swarm Failover All'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Visual Execution Pipeline (5-Step Execution) */}
      {activeScenario && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                {lang === 'ur' ? 'Live Execution Logic (Dual-SSID & Swarm Failover)' : 'Live 5-Step Execution Logic (Dual-SSID & Swarm Failover)'}
              </div>
              <h2 className="text-base font-bold text-white mt-0.5">
                {activeScenario === 1 && 'Authentic Router Verification in Progress'}
                {activeScenario === 2 && 'Evil Twin Interception & Auto-Disconnect in Progress'}
                {activeScenario === 3 && 'Router Sentinel Hacker Anomaly Analysis in Progress'}
                {activeScenario === 4 && 'Dual-SSID Failover: All 4 Registered Agents Migrating to Secondary Vault'}
              </h2>
            </div>
            {isRunning && (
              <span className="text-xs px-2.5 py-1 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded animate-pulse font-mono">
                SWARM ORCHESTRATION IN PROGRESS...
              </span>
            )}
          </div>

          {/* Steps Display */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {/* Step 1 */}
            <div className={`p-3.5 rounded-lg border text-xs transition-all ${
              scenarioStep >= 1
                ? 'bg-slate-950 border-cyan-500/80 text-white'
                : 'bg-slate-950/40 border-slate-800/60 text-slate-500'
            }`}>
              <div className="font-mono text-cyan-400 font-bold text-sm">01</div>
              <div className="font-semibold mt-1">Network Select</div>
              <div className="text-[11px] text-slate-400 mt-1">
                Target SSID: "{homeProfile.ssid}" detected in spectrum.
              </div>
            </div>

            {/* Step 2 */}
            <div className={`p-3.5 rounded-lg border text-xs transition-all ${
              scenarioStep >= 2
                ? 'bg-slate-950 border-cyan-500/80 text-white'
                : 'bg-slate-950/40 border-slate-800/60 text-slate-500'
            }`}>
              <div className="font-mono text-cyan-400 font-bold text-sm">02</div>
              <div className="font-semibold mt-1">Agent Scan</div>
              <div className="text-[11px] text-slate-400 mt-1">
                {activeScenario === 2 || activeScenario === 4
                  ? 'MISMATCH: Rogue BSSID detected! Cloned AP spotted.'
                  : 'BSSID, Gateway IP & Channel matches profile.'}
              </div>
            </div>

            {/* Step 3 */}
            <div className={`p-3.5 rounded-lg border text-xs transition-all ${
              scenarioStep >= 3
                ? 'bg-slate-950 border-cyan-500/80 text-white'
                : 'bg-slate-950/40 border-slate-800/60 text-slate-500'
            }`}>
              <div className="font-mono text-cyan-400 font-bold text-sm">03</div>
              <div className="font-semibold mt-1">
                {activeScenario === 4 ? 'Secondary SSID Fired' : 'Crypto Challenge'}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {activeScenario === 4
                  ? 'Router Sentinel activated "Home_Fiber_SECURE_VAULT".'
                  : 'Transmitted 256-bit cryptographic nonce to AP link-local daemon.'}
              </div>
            </div>

            {/* Step 4 */}
            <div className={`p-3.5 rounded-lg border text-xs transition-all ${
              scenarioStep >= 4
                ? activeScenario === 2
                  ? 'bg-red-950/40 border-red-600 text-red-200'
                  : 'bg-slate-950 border-cyan-500/80 text-white'
                : 'bg-slate-950/40 border-slate-800/60 text-slate-500'
            }`}>
              <div className="font-mono text-cyan-400 font-bold text-sm">04</div>
              <div className="font-semibold mt-1">
                {activeScenario === 4 ? 'Swarm Handshake' : activeScenario === 2 ? 'Invalid Signature' : 'Valid Signature'}
              </div>
              <div className="text-[11px] mt-1">
                {activeScenario === 4
                  ? 'All agents mutual token validated on Secondary Vault.'
                  : activeScenario === 2
                  ? 'Signature rejected: Rogue hotspot lacks private key.'
                  : 'Ed25519 digital signature verified successfully.'}
              </div>
            </div>

            {/* Step 5 */}
            <div className={`p-3.5 rounded-lg border text-xs transition-all ${
              scenarioStep >= 5
                ? activeScenario === 2
                  ? 'bg-red-900/60 border-red-500 text-white shadow-sm'
                  : 'bg-emerald-900/60 border-emerald-500 text-white shadow-sm'
                : 'bg-slate-950/40 border-slate-800/60 text-slate-500'
            }`}>
              <div className="font-mono text-cyan-400 font-bold text-sm">05</div>
              <div className="font-semibold mt-1">
                {activeScenario === 4
                  ? 'All 4 Agents Secured Together'
                  : activeScenario === 2
                  ? 'Auto-Disconnect & Isolate'
                  : 'Allow Normal Internet'}
              </div>
              <div className="text-[11px] mt-1">
                {activeScenario === 4
                  ? 'Swarm successfully relocated to Secondary Vault SSID!'
                  : activeScenario === 2
                  ? 'Connection aborted. Network interface quarantined.'
                  : 'Protected tunnel established.'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
