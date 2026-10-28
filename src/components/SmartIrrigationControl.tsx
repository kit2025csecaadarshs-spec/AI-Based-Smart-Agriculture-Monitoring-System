import React, { useState } from 'react';
import { FarmZone } from '../types/agriculture';
import { Droplets, Power, ShieldCheck, Clock, Zap, Check } from 'lucide-react';

interface SmartIrrigationControlProps {
  zone: FarmZone;
  onToggleValve: (zoneId: string) => void;
  onToggleAutoMode: (zoneId: string) => void;
  onUpdateFlowRate: (zoneId: string, rate: number) => void;
}

export const SmartIrrigationControl: React.FC<SmartIrrigationControlProps> = ({
  zone,
  onToggleValve,
  onToggleAutoMode,
  onUpdateFlowRate,
}) => {
  const [fertigationActive, setFertigationActive] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('05:30 AM');
  const [scheduledDuration, setScheduledDuration] = useState('45 min');
  const [savedNotification, setSavedNotification] = useState(false);

  const handleSaveSchedule = () => {
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2500);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-700 font-mono mb-1 font-semibold">
            <span>ACTUATOR CONTROLLER</span>
            <span aria-hidden="true">·</span>
            <span>Subsurface Drip & Micro-Sprinkler</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Precision Irrigation & Fertigation — {zone.name}
          </h2>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
          <button
            onClick={() => {
              if (!zone.autoMode) onToggleAutoMode(zone.id);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              zone.autoMode
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 inline mr-1" />
            AI Closed-Loop
          </button>
          <button
            onClick={() => {
              if (zone.autoMode) onToggleAutoMode(zone.id);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              !zone.autoMode
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Manual Override
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Valve Control Card */}
        <div className="p-5 rounded-xl bg-slate-50/70 border border-slate-200/90 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Primary Solenoid Valve #1
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                  zone.valveOpen
                    ? 'bg-sky-50 border-sky-300 text-sky-800'
                    : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}
              >
                {zone.valveOpen ? 'VALVE OPEN (FLOWING)' : 'VALVE CLOSED (IDLE)'}
              </span>
            </div>

            <div className="text-center py-4">
              <button
                onClick={() => onToggleValve(zone.id)}
                className={`w-28 h-28 mx-auto rounded-full flex flex-col items-center justify-center transition-all cursor-pointer shadow-md ${
                  zone.valveOpen
                    ? 'bg-gradient-to-b from-sky-400 to-sky-600 text-white shadow-sky-500/25 scale-105 ring-4 ring-sky-300/40'
                    : 'bg-white hover:bg-slate-50 text-slate-700 shadow-slate-200 border-2 border-slate-300'
                }`}
              >
                <Power className="w-8 h-8 mb-1" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {zone.valveOpen ? 'Stop Flow' : 'Start Flow'}
                </span>
              </button>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Emitters Delivery Flow Rate:</span>
                <span className="font-mono font-bold text-slate-900 tabular-nums">
                  {zone.valveOpen ? `${zone.telemetry.flowRateLpm || 68} L/min` : '0 L/min'}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Mainline Operating Pressure:</span>
                <span className="font-mono text-slate-800 font-semibold tabular-nums">
                  {zone.valveOpen ? '2.8 Bar (Nominal)' : '0.0 Bar'}
                </span>
              </div>
            </div>
          </div>

          {zone.valveOpen && (
            <div className="mt-4 p-2.5 rounded-lg bg-sky-50 border border-sky-200 text-[11px] text-sky-800 flex items-center gap-2">
              <Droplets className="w-4 h-4 text-sky-600 shrink-0" />
              <span>Moisture replenishing active. Target: 45%. Auto-shutoff in 32 min.</span>
            </div>
          )}
        </div>

        {/* Smart Fertigation & Flow Adjustment */}
        <div className="p-5 rounded-xl bg-slate-50/70 border border-slate-200/90 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Fertigation Venturi Injector
              </span>
              <button
                onClick={() => setFertigationActive(!fertigationActive)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer border ${
                  fertigationActive
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {fertigationActive ? 'Pump Active' : 'Pump Inactive'}
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Injects water-soluble macro-nutrients (NPK 19-19-19 + micro-chelates) proportionally into the drip emitters.
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 font-medium">Drip Delivery Flow Rate</span>
                <span className="font-mono font-bold text-sky-700 tabular-nums">
                  {zone.telemetry.flowRateLpm || 68} L/min
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="120"
                value={zone.telemetry.flowRateLpm || 68}
                onChange={(e) => onUpdateFlowRate(zone.id, parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>10 L/min (Micro)</span>
                <span>65 L/min (Standard)</span>
                <span>120 L/min (Max)</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Concentration Ratio:</span>
                <span className="font-mono text-emerald-700 font-bold">1:100 (10 ppm N)</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Reservoir Tank Level:</span>
                <span className="font-mono text-slate-900 font-bold tabular-nums">{zone.telemetry.waterReservoirLevel}% (8,200 L)</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-200/80">
            Evapotranspiration rate (ETc): 4.2 mm/day
          </div>
        </div>

        {/* AI Auto-Scheduler */}
        <div className="p-5 rounded-xl bg-slate-50/70 border border-slate-200/90 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Scheduled Window
              </span>
              <Clock className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <label className="text-[11px] text-slate-600 font-medium block mb-1">Optimal Start Time (Dawn Avoidance)</label>
                <input
                  type="text"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 font-medium block mb-1">Target Cycle Duration</label>
                <input
                  type="text"
                  value={scheduledDuration}
                  onChange={(e) => setScheduledDuration(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                onClick={handleSaveSchedule}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                {savedNotification ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Schedule Saved</span>
                  </>
                ) : (
                  <span>Update Irrigation Schedule</span>
                )}
              </button>
            </div>

            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold mb-1">
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                <span>AI Evaporation Reduction</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Night and pre-dawn drip irrigation avoids peak wind and high VPD, conserving 26.4% water while maintaining 100% crop turgor.
              </p>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-200/80">
            Next automated cycle: Tomorrow at {scheduledTime}
          </div>
        </div>
      </div>
    </div>
  );
};
