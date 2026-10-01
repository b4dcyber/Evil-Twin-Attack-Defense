import { useState } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Trash2, 
  Download, 
  AlertCircle, 
  CheckCircle2, 
  AlertTriangle,
  Info
} from 'lucide-react';
import { AuditLog } from '../types/cyber';
import { Language } from '../utils/translations';

interface AuditLogsProps {
  logs: AuditLog[];
  lang: Language;
  onClearLogs: () => void;
}

export function AuditLogs({ logs, lang, onClearLogs }: AuditLogsProps) {
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredLogs = logs.filter(log => {
    if (filterSeverity !== 'all' && log.severity !== filterSeverity) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        log.title.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        (log.mac && log.mac.toLowerCase().includes(q)) ||
        (log.bssid && log.bssid.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const exportLogsAsJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `b4dcyber_audit_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                <FileText className="w-3.5 h-3.5" />
                Forensic Audit Trail
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-400 font-mono">Live Wi-Fi Security Events</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {lang === 'ur' ? 'Security Audit & Forensic Logs' : 'Forensic Security Event Stream'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
              {lang === 'ur'
                ? 'Har BSSID scan, crypto challenge, Evil Twin interception aur blacklist action ka complete forensic record.'
                : 'Immutable audit trail capturing all 802.11 beacon scans, nonce challenges, rogue AP drops, and blacklist enforcement.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={exportLogsAsJson}
              className="px-3.5 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors border border-slate-700 flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={onClearLogs}
              className="px-3.5 py-2 text-xs font-medium bg-slate-800 hover:bg-red-950 hover:text-red-300 text-slate-400 rounded-lg transition-colors border border-slate-700 flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search MAC, BSSID, title, details..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg self-stretch md:self-auto overflow-x-auto">
          {['all', 'critical', 'warning', 'success', 'info'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1 text-xs font-medium rounded capitalize whitespace-nowrap cursor-pointer transition-colors ${
                filterSeverity === sev
                  ? 'bg-slate-800 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table / List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No audit records match the current filter.
          </div>
        ) : (
          filteredLogs.map((log) => {
            let icon = <Info className="w-4 h-4 text-blue-400" />;
            let badgeBg = 'bg-blue-950 text-blue-300 border-blue-800';

            if (log.severity === 'critical') {
              icon = <AlertCircle className="w-4 h-4 text-red-400" />;
              badgeBg = 'bg-red-950 text-red-300 border-red-800';
            } else if (log.severity === 'warning') {
              icon = <AlertTriangle className="w-4 h-4 text-amber-400" />;
              badgeBg = 'bg-amber-950 text-amber-300 border-amber-800';
            } else if (log.severity === 'success') {
              icon = <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
              badgeBg = 'bg-emerald-950 text-emerald-300 border-emerald-800';
            }

            return (
              <div key={log.id} className="p-4 flex items-start gap-3.5 hover:bg-slate-800/30 transition-colors">
                <div className="mt-0.5 shrink-0">
                  {icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-white">
                      {log.title}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded border font-mono ${badgeBg}`}>
                      {log.type}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono ml-auto">
                      {log.timestamp}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {log.details}
                  </p>

                  {(log.mac || log.bssid) && (
                    <div className="mt-2 flex items-center gap-2 font-mono text-[11px]">
                      {log.mac && (
                        <span className="px-2 py-0.5 bg-slate-950 rounded border border-slate-800 text-slate-400">
                          MAC: <span className="text-red-400 font-semibold">{log.mac}</span>
                        </span>
                      )}
                      {log.bssid && (
                        <span className="px-2 py-0.5 bg-slate-950 rounded border border-slate-800 text-slate-400">
                          BSSID: <span className="text-cyan-400 font-semibold">{log.bssid}</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
