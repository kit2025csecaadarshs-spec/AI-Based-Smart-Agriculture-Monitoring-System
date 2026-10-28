import React, { useState } from 'react';
import { FarmAlert } from '../types/agriculture';
import {
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle2,
  Check,
  Zap,
} from 'lucide-react';

interface AlertsLogProps {
  alerts: FarmAlert[];
  onAcknowledgeAlert: (alertId: string) => void;
  onClearAllResolved: () => void;
}

export const AlertsLog: React.FC<AlertsLogProps> = ({
  alerts,
  onAcknowledgeAlert,
  onClearAllResolved,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  const filteredAlerts = alerts.filter((alert) => {
    if (filterSeverity === 'all') return true;
    return alert.severity === filterSeverity;
  });

  const getSeverityBadge = (severity: FarmAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return {
          icon: <AlertOctagon className="w-4 h-4 text-rose-600" />,
          label: 'Critical Deficit',
          border: 'border-rose-200 bg-rose-50 text-rose-800',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
          label: 'Agronomic Warning',
          border: 'border-amber-200 bg-amber-50 text-amber-800',
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-4 h-4 text-sky-600" />,
          label: 'Telemetry Advisory',
          border: 'border-sky-200 bg-sky-50 text-sky-800',
        };
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-emerald-700 font-mono mb-1 font-semibold">
            <span>AUTOMATED TELEMETRY PROBER</span>
            <span aria-hidden="true">·</span>
            <span>Edge Gateway Rule Engine</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Smart Alert Center & Automated Interventions
          </h2>
        </div>

        {/* Filters and Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setFilterSeverity('all')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                filterSeverity === 'all'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({alerts.length})
            </button>
            <button
              onClick={() => setFilterSeverity('critical')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                filterSeverity === 'critical'
                  ? 'bg-rose-600 text-white font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Critical
            </button>
            <button
              onClick={() => setFilterSeverity('warning')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                filterSeverity === 'warning'
                  ? 'bg-amber-500 text-white font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Warnings
            </button>
          </div>

          <button
            onClick={onClearAllResolved}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer shadow-2xs"
          >
            Clear Resolved
          </button>
        </div>
      </div>

      {filteredAlerts.length === 0 ? (
        <div className="p-8 text-center rounded-xl bg-slate-50/50 border border-slate-200 text-slate-500 text-xs">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
          <div className="font-bold text-slate-900">No active alerts matching criteria</div>
          <div>All monitored sensor parcels are operating within nominal agronomic thresholds.</div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => {
            const badge = getSeverityBadge(alert.severity);
            return (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border transition-all ${
                  alert.acknowledged
                    ? 'bg-slate-50/40 border-slate-200/60 opacity-60'
                    : 'bg-white border-slate-200 shadow-2xs'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">{badge.icon}</div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.border}`}>
                          {badge.label}
                        </span>
                        <span className="text-xs font-bold text-slate-900">
                          {alert.zoneName}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          · {alert.timestamp}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 tracking-tight mb-1">
                        {alert.title}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                        {alert.description}
                      </p>

                      {alert.automatedActionTaken && (
                        <div className="mt-2.5 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-2">
                          <Zap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>
                            <strong>Automated AI Mitigation:</strong> {alert.automatedActionTaken}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                    {alert.acknowledged ? (
                      <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        Acknowledged
                      </span>
                    ) : (
                      <button
                        onClick={() => onAcknowledgeAlert(alert.id)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer shadow-2xs"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
