import React from 'react';
import { HERO_IMAGE_PATH } from '../data/mockFarmData';
import { CloudRain, Sun, Flame, Wind, Droplets, Activity, RefreshCw } from 'lucide-react';

interface HeroOverviewProps {
  scenario: string;
  onSelectScenario: (scenario: 'nominal' | 'heatwave' | 'rainstorm' | 'drought') => void;
  isSimulating: boolean;
  onToggleSimulating: () => void;
  totalAcres: number;
  averageHealth: number;
  activeValvesCount: number;
  totalValvesCount: number;
}

export const HeroOverview: React.FC<HeroOverviewProps> = ({
  scenario,
  onSelectScenario,
  isSimulating,
  onToggleSimulating,
  totalAcres,
  averageHealth,
  activeValvesCount,
  totalValvesCount,
}) => {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs mb-8">
      {/* Background Photography with Light Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src={HERO_IMAGE_PATH}
          alt="Aerial view of precision agriculture farm"
          className="w-full h-full object-cover object-center opacity-30 saturate-125"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/70" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 px-6 sm:px-8 pt-8 pb-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-200">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold mb-2 tracking-wide">
              <span>Telemetry Mesh v2.8</span>
              <span aria-hidden="true">·</span>
              <span>Gemini 3.8 Flash Diagnostics</span>
              <span aria-hidden="true">·</span>
              <span>Autonomous Closed-Loop Drip</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mb-2 text-balance">
              Smart Agriculture Monitoring System
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed max-w-xl">
              Real-time multi-depth soil moisture profiling, solar radiance telemetry, microclimate disease risk modeling, and precision closed-loop drip fertigation.
            </p>
          </div>

          {/* Interactive Simulation Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="bg-white p-1.5 rounded-xl border border-slate-200 flex items-center gap-1 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-2">
                Scenario:
              </span>
              <button
                onClick={() => onSelectScenario('nominal')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  scenario === 'nominal'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="Standard sun and balanced soil moisture"
              >
                <Sun className="w-3.5 h-3.5 inline mr-1" />
                Nominal
              </button>
              <button
                onClick={() => onSelectScenario('heatwave')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  scenario === 'heatwave'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="Spike temperature to 35°C and reduce moisture"
              >
                <Flame className="w-3.5 h-3.5 inline mr-1" />
                Heatwave
              </button>
              <button
                onClick={() => onSelectScenario('rainstorm')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  scenario === 'rainstorm'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="High precipitation and leaf wetness spike"
              >
                <CloudRain className="w-3.5 h-3.5 inline mr-1" />
                Rainstorm
              </button>
              <button
                onClick={() => onSelectScenario('drought')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  scenario === 'drought'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="Simulate severe moisture drop below wilting threshold"
              >
                <Wind className="w-3.5 h-3.5 inline mr-1" />
                Drought Stress
              </button>
            </div>

            <button
              onClick={onToggleSimulating}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors whitespace-nowrap cursor-pointer shadow-xs ${
                isSimulating
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Activity className={`w-3.5 h-3.5 ${isSimulating ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>{isSimulating ? 'Live IoT Stream (3s)' : 'IoT Stream Paused'}</span>
            </button>
          </div>
        </div>

        {/* 4-Column KPI Metric Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-5">
          <div className="bg-slate-50/80 border border-slate-200/90 rounded-xl p-3.5 shadow-2xs">
            <div className="text-xs text-slate-500 mb-1">Managed Land</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">{totalAcres}</span>
              <span className="text-xs text-slate-500">Acres</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">4 Continuous Parcels</div>
          </div>

          <div className="bg-slate-50/80 border border-slate-200/90 rounded-xl p-3.5 shadow-2xs">
            <div className="text-xs text-slate-500 mb-1">Mean Crop Health Index</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-emerald-700 font-mono tabular-nums">
                {averageHealth.toFixed(1)}%
              </span>
              <span className="text-xs text-emerald-700 font-medium">NDVI 0.84</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Multispectral Canopy Scan</div>
          </div>

          <div className="bg-slate-50/80 border border-slate-200/90 rounded-xl p-3.5 shadow-2xs">
            <div className="text-xs text-slate-500 mb-1">Smart Actuators</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                {activeValvesCount} <span className="text-slate-400 text-lg">/ {totalValvesCount}</span>
              </span>
              <span className="text-xs text-cyan-700 font-medium">Active Drip</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Autonomous Closed-Loop</div>
          </div>

          <div className="bg-slate-50/80 border border-slate-200/90 rounded-xl p-3.5 shadow-2xs">
            <div className="text-xs text-slate-500 mb-1">Water Conservation</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-emerald-700 font-mono tabular-nums">38,400</span>
              <span className="text-xs text-emerald-700 font-medium">L / Day</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">-26.4% vs Unmanaged Timers</div>
          </div>
        </div>
      </div>
    </section>
  );
};
