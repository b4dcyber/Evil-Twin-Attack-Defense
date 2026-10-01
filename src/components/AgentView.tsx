import { useState } from 'react';
import { 
  Wifi, 
  WifiOff, 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Radio, 
  MapPin, 
  Cpu, 
  RefreshCw, 
  AlertTriangle,
  ArrowRight,
  Fingerprint,
  CheckCircle2,
  XCircle,
  Smartphone
} from 'lucide-react';
import { DetectedAccessPoint, WifiProfile } from '../types/cyber';
import { Language, translations } from '../utils/translations';
import { generateNonce, simulateEd25519Sign } from '../utils/crypto';

interface AgentViewProps {
  detectedAPs: DetectedAccessPoint[];
  homeProfile: WifiProfile;
  lang: Language;
  onScan: () => void;
  isScanning: boolean;
  onToggleIsolation: (apId: string) => void;
  onTriggerFleetFailover?: () => void;
  onOpenApkModal?: () => void;
  onAddLog: (type: any, severity: any, title: string, details: string, meta?: any) => void;
}

export function AgentView({
  detectedAPs,
  homeProfile,
  lang,
  onScan,
  isScanning,
  onToggleIsolation,
  onTriggerFleetFailover,
  onOpenApkModal,
  onAddLog
}: AgentViewProps) {
  const t = translations[lang];

  // Interactive challenge inspection state
  const [selectedAp, setSelectedAp] = useState<DetectedAccessPoint>(
    detectedAPs.find(ap => ap.isEvilTwin) || detectedAPs[0]
  );
  const [challenging, setChallenging] = useState(false);
  const [challengeResult, setChallengeResult] = useState<{
    nonce: string;
    signature?: string;
    passed: boolean;
    reason: string;
  } | null>(null);

  const handleRunChallenge = async (ap: DetectedAccessPoint) => {
    setChallenging(true);
    setChallengeResult(null);

    const nonce = generateNonce(16);
    await new Promise(r => setTimeout(r, 700));

    if (ap.isEvilTwin) {
      setChallengeResult({
        nonce,
        signature: 'INVALID_AUTH_ERROR: AP rejected or failed Ed25519 signature.',
        passed: false,
        reason: lang === 'ur'
          ? 'Fake hotspot k pas router ki secret key nahi hai! Signature verification mukammal fail ho gaya.'
          : 'Rogue AP failed to provide a valid Ed25519 cryptographic signature. Network interface isolated.'
      });
      onAddLog(
        'CRYPTO_CHALLENGE',
        'critical',
        'Cryptographic Nonce Challenge Failed',
        `AP ${ap.ssid} (BSSID ${ap.bssid}) failed to sign nonce ${nonce.slice(0, 12)}... Interface auto-isolated.`,
        { bssid: ap.bssid }
      );
    } else {
      const validSig = await simulateEd25519Sign(nonce, 'secret_router_ed25519_key_production');
      setChallengeResult({
        nonce,
        signature: validSig,
        passed: true,
        reason: lang === 'ur'
          ? 'Asli router ne sahi Ed25519 signature bhej di! Agent ne connection verify krli.'
          : 'Mutual cryptographic verification passed! Genuine router Ed25519 signature verified.'
      });
      onAddLog(
        'CRYPTO_CHALLENGE',
        'success',
        'Mutual Cryptographic Handshake Verified',
        `AP ${ap.ssid} (BSSID ${ap.bssid}) authenticated via 256-bit challenge. Safe internet access granted.`,
        { bssid: ap.bssid }
      );
    }
    setChallenging(false);
  };

  const evilTwinCount = detectedAPs.filter(ap => ap.isEvilTwin).length;
  const isCurrentlyProtected = detectedAPs.some(ap => ap.isEvilTwin && ap.isolationActive);

  return (
    <div className="space-y-6">
      {/* Top Banner / Agent State */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                <Fingerprint className="w-3.5 h-3.5" />
                B4DCyber Endpoint Guard v2.4
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-400 font-mono">wlan0: Managed</span>
              <span className="text-xs text-slate-400">·</span>
              <span className={`text-xs font-semibold ${isCurrentlyProtected ? 'text-amber-400' : 'text-emerald-400'}`}>
                {isCurrentlyProtected
                  ? (lang === 'ur' ? 'Auto-Disconnect Active (Suraksha Chalu)' : 'Auto-Disconnect Engaged')
                  : (lang === 'ur' ? 'Secure Home Network Connected' : 'Secured & Synchronized')}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {t.agentTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
              {t.agentSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {onOpenApkModal && (
              <button
                onClick={onOpenApkModal}
                className="px-3.5 py-2 text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>{lang === 'ur' ? 'Android APK Download Karein' : 'Download Android APK'}</span>
              </button>
            )}
            <button
              onClick={onScan}
              disabled={isScanning}
              className="px-3.5 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors flex items-center gap-2 border border-slate-700 disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-cyan-400' : ''}`} />
              <span>{isScanning ? t.scanning : t.scanNow}</span>
            </button>
          </div>
        </div>

        {/* Security Parameters Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800/80">
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
            <div className="text-[11px] text-slate-400 font-medium">
              {lang === 'ur' ? 'Trusted Home SSID' : 'Target Home SSID'}
            </div>
            <div className="text-sm font-semibold text-white mt-0.5 flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5 text-cyan-400" />
              <span>{homeProfile.ssid}</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">
              BSSID: {homeProfile.trustedBssid}
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
            <div className="text-[11px] text-slate-400 font-medium">
              {lang === 'ur' ? 'Expected Channel & Band' : 'Radio Profile'}
            </div>
            <div className="text-sm font-semibold text-white mt-0.5">
              Ch {homeProfile.expectedChannel} · {homeProfile.expectedFrequency}
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">
              Gateway: {homeProfile.expectedGatewayIp}
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
            <div className="text-[11px] text-slate-400 font-medium">
              {lang === 'ur' ? 'Physical Geofence' : 'Home Geofence'}
            </div>
            <div className="text-sm font-semibold text-white mt-0.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>{homeProfile.geofence.radiusMeters}m Zone</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">
              {homeProfile.geofence.lat.toFixed(4)}, {homeProfile.geofence.lng.toFixed(4)}
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
            <div className="text-[11px] text-slate-400 font-medium">
              {lang === 'ur' ? 'Evil Twin Guard Status' : 'Threat Interception'}
            </div>
            <div className="text-sm font-semibold mt-0.5 flex items-center gap-1.5 text-amber-400">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{evilTwinCount} Rogue APs Blocked</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Zero-Trust Verification Active
            </div>
          </div>
        </div>
      </div>

      {/* Critical Alert if Evil Twin Detected */}
      {evilTwinCount > 0 && (
        <div className="p-4 bg-amber-950/40 border border-amber-500/40 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-amber-300 flex items-center gap-2">
                <span>{t.evilTwinDetected}</span>
                <span className="text-xs px-2 py-0.5 bg-amber-900/60 text-amber-200 rounded font-mono">
                  SSID Spoof: "{homeProfile.ssid}"
                </span>
              </div>
              <p className="text-xs text-amber-200/80 mt-1">
                {lang === 'ur'
                  ? 'Kisi ne apke ghar ke Wi-Fi ke naam se fake hotspot banaya hai! Hamare agent ne BSSID aur MAC mismatch detect kar k auto-connect foran rok diya hai aur network interface ko isolate kar diya hai.'
                  : 'An attacker has broadcasted an unauthorized rogue hotspot cloning your home Wi-Fi name with elevated transmit power. Pre-connection inspection aborted auto-connect to protect credentials and private traffic.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onTriggerFleetFailover && (
              <button
                onClick={onTriggerFleetFailover}
                className="px-3 py-1.5 text-xs font-semibold bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-lg transition-colors whitespace-nowrap cursor-pointer shrink-0 shadow-sm"
              >
                {lang === 'ur' ? 'Secondary SSID Par Shift Karein' : 'Failover All to Vault SSID'}
              </button>
            )}
            <button
              onClick={() => {
                const rogue = detectedAPs.find(ap => ap.isEvilTwin);
                if (rogue) setSelectedAp(rogue);
              }}
              className="px-3 py-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-colors whitespace-nowrap cursor-pointer shrink-0"
            >
              {lang === 'ur' ? 'Forensic Jaiza' : 'Inspect Threat'}
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Ambient Spectrum Scan on Left, Pre-Connection Crypto Sandbox on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Detected AP List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                {t.ambientScan}
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              {detectedAPs.length} {lang === 'ur' ? 'Networks Dastiyab' : 'APs Visible'}
            </span>
          </div>

          <div className="space-y-3">
            {detectedAPs.map((ap) => {
              const isSelected = selectedAp.id === ap.id;
              return (
                <div
                  key={ap.id}
                  onClick={() => setSelectedAp(ap)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    ap.isEvilTwin
                      ? isSelected
                        ? 'bg-amber-950/30 border-amber-500 shadow-sm'
                        : 'bg-slate-900/90 border-amber-900/60 hover:border-amber-700/80'
                      : isSelected
                      ? 'bg-slate-900 border-cyan-500 shadow-sm'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          ap.isEvilTwin
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : ap.connected
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {ap.isEvilTwin ? (
                          <ShieldAlert className="w-5 h-5" />
                        ) : ap.connected ? (
                          <Wifi className="w-5 h-5" />
                        ) : (
                          <Radio className="w-5 h-5" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-white">
                            {ap.ssid}
                          </span>
                          {ap.isEvilTwin && (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-red-950 text-red-300 border border-red-800/80 rounded">
                              ROGUE EVIL TWIN
                            </span>
                          )}
                          {ap.connected && (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/80 rounded">
                              SECURE ATTACHED
                            </span>
                          )}
                          {ap.isolationActive && (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800/80 rounded">
                              QUARANTINED
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-1.5 font-mono">
                          <span>BSSID: <span className={ap.isEvilTwin ? 'text-red-400 font-bold' : 'text-slate-300'}>{ap.bssid}</span></span>
                          <span>·</span>
                          <span>Ch: <span className={ap.channel !== homeProfile.expectedChannel && ap.ssid === homeProfile.ssid ? 'text-amber-400 font-bold' : 'text-slate-300'}>{ap.channel}</span> ({ap.frequency})</span>
                          <span>·</span>
                          <span>RSSI: <span className="tabular-nums font-semibold">{ap.rssi} dBm</span></span>
                        </div>

                        {ap.isEvilTwin && ap.evilTwinReason && (
                          <div className="mt-2 text-xs text-red-300/90 bg-red-950/40 p-2 rounded border border-red-900/40">
                            <strong>{lang === 'ur' ? 'Khatray Ki Wajah:' : 'Threat Vector:'}</strong> {ap.evilTwinReason}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleIsolation(ap.id);
                        }}
                        className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors flex items-center gap-1 cursor-pointer ${
                          ap.isolationActive
                            ? 'bg-amber-900/60 hover:bg-amber-800 text-amber-200 border border-amber-700/60'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {ap.isolationActive ? (
                          <>
                            <Lock className="w-3 h-3 text-amber-400" />
                            <span>{lang === 'ur' ? 'Quarantine Active' : 'Quarantine Active'}</span>
                          </>
                        ) : (
                          <>
                            <Unlock className="w-3 h-3 text-slate-400" />
                            <span>{lang === 'ur' ? 'Quarantine Lagayein' : 'Isolate Interface'}</span>
                          </>
                        )}
                      </button>

                      <span className="text-[11px] text-slate-500">
                        {ap.distanceFromGeofenceMeters === 0
                          ? 'In Geofence'
                          : `${ap.distanceFromGeofenceMeters}m from safe point`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Pre-Connection Verification Sandbox (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-2">
            <Fingerprint className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              {lang === 'ur' ? 'Pre-Connection Crypto Jaiza' : 'Pre-Connection Verification Sandbox'}
            </h2>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <div className="text-xs text-slate-400">Target Access Point</div>
                <div className="text-base font-bold text-white mt-0.5">
                  {selectedAp.ssid}
                </div>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded font-mono font-semibold ${
                selectedAp.isEvilTwin 
                  ? 'bg-red-950 text-red-300 border border-red-800' 
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}>
                {selectedAp.isEvilTwin ? 'ROGUE AP' : 'AUTHENTIC AP'}
              </span>
            </div>

            {/* 5-Step Execution Inspection Flow (Slide 6 from Proposal) */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-300">
                {lang === 'ur' ? '5-Step Zero-Trust Wi-Fi Flow:' : '5-Step Zero-Trust Wi-Fi Flow:'}
              </div>

              {/* Step 1 */}
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-start gap-2.5 text-xs">
                <span className="text-cyan-400 font-mono font-bold">01</span>
                <div>
                  <div className="font-semibold text-white">Network Beacon Inspection</div>
                  <div className="text-slate-400 text-[11px]">
                    SSID: "{selectedAp.ssid}" · RSSI: {selectedAp.rssi} dBm
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-start gap-2.5 text-xs">
                <span className="text-cyan-400 font-mono font-bold">02</span>
                <div className="flex-1">
                  <div className="font-semibold text-white flex items-center justify-between">
                    <span>BSSID, MAC &amp; Channel Audit</span>
                    {selectedAp.bssid === homeProfile.trustedBssid ? (
                      <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                        <CheckCircle2 className="w-3 h-3" /> Match
                      </span>
                    ) : (
                      <span className="text-red-400 flex items-center gap-1 text-[11px]">
                        <XCircle className="w-3 h-3" /> Mismatch
                      </span>
                    )}
                  </div>
                  <div className="text-slate-400 text-[11px] font-mono mt-0.5">
                    Target: {selectedAp.bssid} vs Trusted: {homeProfile.trustedBssid}
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-start gap-2.5 text-xs">
                <span className="text-cyan-400 font-mono font-bold">03</span>
                <div className="flex-1">
                  <div className="font-semibold text-white">Cryptographic Challenge (Nonce)</div>
                  <div className="text-slate-400 text-[11px]">
                    256-bit ephemeral nonce challenge generated by endpoint agent.
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-start gap-2.5 text-xs">
                <span className="text-cyan-400 font-mono font-bold">04</span>
                <div className="flex-1">
                  <div className="font-semibold text-white flex items-center justify-between">
                    <span>Ed25519 Signature Verification</span>
                    {!selectedAp.isEvilTwin ? (
                      <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                        <CheckCircle2 className="w-3 h-3" /> Valid
                      </span>
                    ) : (
                      <span className="text-red-400 flex items-center gap-1 text-[11px]">
                        <XCircle className="w-3 h-3" /> Rejected
                      </span>
                    )}
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    Router firmware daemon signs nonce using private key stored in hardware enclave.
                  </div>
                </div>
              </div>

              {/* Step 5 */}
              <div className={`p-2.5 rounded-lg border flex items-start gap-2.5 text-xs ${
                selectedAp.isEvilTwin 
                  ? 'bg-red-950/40 border-red-800 text-red-200' 
                  : 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
              }`}>
                <span className="font-mono font-bold">05</span>
                <div>
                  <div className="font-semibold">
                    {selectedAp.isEvilTwin ? 'DEFENSE ACTION: Interface Quarantined' : 'DEFENSE ACTION: Full Access Granted'}
                  </div>
                  <div className="text-[11px] opacity-80 mt-0.5">
                    {selectedAp.isEvilTwin
                      ? 'Auto-connect aborted. Network interface isolated to prevent MITM credentials leak.'
                      : 'Cryptographic proof validated. Safe to route internet traffic.'}
                  </div>
                </div>
              </div>
            </div>

            {/* Run Challenge Test Button */}
            <div className="pt-2">
              <button
                onClick={() => handleRunChallenge(selectedAp)}
                disabled={challenging}
                className="w-full py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer text-xs"
              >
                {challenging ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{lang === 'ur' ? 'Handshake Challenge Bheja Ja Raha Hai...' : 'Exchanging Cryptographic Nonce...'}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>{lang === 'ur' ? 'Challenge Test Karein' : 'Execute Nonce Challenge Test'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Challenge Execution Output */}
            {challengeResult && (
              <div className={`p-3 rounded-lg border text-xs font-mono space-y-1.5 ${
                challengeResult.passed
                  ? 'bg-emerald-950/30 border-emerald-800 text-emerald-300'
                  : 'bg-red-950/30 border-red-800 text-red-300'
              }`}>
                <div className="flex items-center justify-between font-bold">
                  <span>NONCE: {challengeResult.nonce}</span>
                  <span>{challengeResult.passed ? 'PASSED [200 OK]' : 'ABORTED [403 FORBIDDEN]'}</span>
                </div>
                {challengeResult.signature && (
                  <div className="text-[10px] break-all opacity-85">
                    PAYLOAD: {challengeResult.signature}
                  </div>
                )}
                <div className="text-[11px] pt-1 font-sans text-slate-200">
                  {challengeResult.reason}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
