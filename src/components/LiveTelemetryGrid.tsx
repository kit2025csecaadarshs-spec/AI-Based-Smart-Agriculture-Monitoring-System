import React, { useState } from 'react';
import { FarmZone } from '../types/agriculture';
import {
  Droplets,
  Thermometer,
  Wind,
  Gauge,
  Layers,
  Sliders,
} from 'lucide-react';

interface LiveTelemetryGridProps {
  zone: FarmZone;
  onUpdateTelemetry: (newTelemetry: Partial<FarmZone['telemetry']>) => void;
}

export const LiveTelemetryGrid: React.FC<LiveTelemetryGridProps> = ({
  zone,
  onUpdateTelemetry,
}) => {
  const [showCalibration, setShowCalibration] = useState(false);
  const t = zone.telemetry;

  const getMoistureStatus = (val: number) => {
    if (val < 25) return { label: 'Wilting Deficit', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' };
    if (val > 65) return { label: 'Waterlogged', color: 'text-sky-700', bg: 'bg-sky-50 border-sky-200' };
    return { label: 'Optimal Field Capacity', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' };
  };

  const getVpdStatus = (vpd: number) => {
    if (vpd < 0.5) return { label: 'Low (Spore Risk)', color: 'text-amber-700' };
    if (vpd > 2.0) return { label: 'High (Stomatal Stress)', color: 'text-rose-700' };
    return { label: 'Nominal Transpiration', color: 'text-emerald-700' };
  };

  const getFoliarRisk = (wetness: number, humidity: number) => {
    if (wetness > 4.0 || (humidity > 80 && wetness > 2.0)) {
      return { level: 'High Sporulation Risk', color: 'text-rose-700', badge: 'bg-rose-50 border-rose-200' };
    }
    if (wetness > 2.0 || humidity > 70) {
      return { level: 'Moderate Risk', color: 'text-amber-700', badge: 'bg-amber-50 border-amber-200' };
    }
    return { level: 'Low Fungal Hazard', color: 'text-emerald-700', badge: 'bg-emerald-50 border-emerald-200' };
  };

  const moistureStatus = getMoistureStatus(t.soilMoisture);
  const vpdStatus = getVpdStatus(t.vpd);
  const foliarRisk = getFoliarRisk(t.leafWetness, t.humidity);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-emerald-700 font-mono mb-1 font-semibold">
            <span>NODE TELEMETRY #{zone.id.toUpperCase()}</span>
            <span aria-hidden="true">·</span>
            <span>Gateway Online</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-500">Updated: {t.lastUpdated}</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Live Soil & Micro-Climate Telemetry — {zone.name}
          </h2>
        </div>

        <button
          onClick={() => setShowCalibration(!showCalibration)}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
        >
          <Sliders className="w-3.5 h-3.5 text-emerald-600" />
          <span>{showCalibration ? 'Hide Sensor Sliders' : 'Manual Sensor Sliders'}</span>
        </button>
      </div>

      {/* Manual Sensor Calibration Sliders */}
      {showCalibration && (
        <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-emerald-200 shadow-inner">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-emerald-600" />
              Live Sensor Simulator (Move sliders to trigger alerts & automations)
            </span>
            <span className="text-[11px] text-slate-500">Values update instantly</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <div className="flex justify-between text-xs mb-1 font-medium">
                <span className="text-slate-700">Soil Moisture (%)</span>
                <span className="font-mono text-emerald-700 font-bold tabular-nums">
                  {t.soilMoisture.toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                value={t.soilMoisture}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onUpdateTelemetry({
                    soilMoisture: val,
                    soilMoistureDepth: {
                      shallow10cm: Math.max(5, val - 4),
                      root30cm: val,
                      deep60cm: Math.min(95, val + 5),
                    },
                  });
                }}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>10% (Wilting)</span>
                <span>25% (Warning)</span>
                <span>50% (Ideal)</span>
                <span>90% (Flooded)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-medium">
                <span className="text-slate-700">Ambient Temperature (°C)</span>
                <span className="font-mono text-amber-700 font-bold tabular-nums">
                  {t.ambientTemp.toFixed(1)}°C
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="45"
                step="0.5"
                value={t.ambientTemp}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  const vpdCalc = Number((0.61078 * Math.exp((17.27 * val) / (val + 237.3)) * (1 - t.humidity / 100)).toFixed(2));
                  onUpdateTelemetry({ ambientTemp: val, vpd: vpdCalc });
                }}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>5°C (Frost)</span>
                <span>24°C (Nominal)</span>
                <span>38°C (Extreme Heat)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-medium">
                <span className="text-slate-700">Relative Humidity (%)</span>
                <span className="font-mono text-sky-700 font-bold tabular-nums">
                  {t.humidity.toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="98"
                value={t.humidity}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  const vpdCalc = Number((0.61078 * Math.exp((17.27 * t.ambientTemp) / (t.ambientTemp + 237.3)) * (1 - val / 100)).toFixed(2));
                  onUpdateTelemetry({
                    humidity: val,
                    leafWetness: val > 80 ? Number((t.leafWetness + 0.8).toFixed(1)) : Math.max(0.2, Number((t.leafWetness - 0.4).toFixed(1))),
                    vpd: vpdCalc,
                  });
                }}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>20% (Dry Air)</span>
                <span>60% (Optimal)</span>
                <span>95% (High Spore Risk)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Telemetry Sensor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Soil Moisture */}
        <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/90 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-600 font-semibold flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-sky-600" />
                Soil Moisture (Root Zone)
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${moistureStatus.bg} ${moistureStatus.color}`}>
                {moistureStatus.label}
              </span>
            </div>

            <div className="flex items-baseline gap-2 my-2">
              <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
                {t.soilMoisture.toFixed(1)}
              </span>
              <span className="text-sm text-slate-500 font-medium">% VWC</span>
            </div>

            <div className="space-y-1.5 mt-3 pt-3 border-t border-slate-200/80 text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">10 cm Surface</span>
                <span className="font-mono text-slate-800 font-semibold tabular-nums">{t.soilMoistureDepth.shallow10cm.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-sky-400 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, t.soilMoistureDepth.shallow10cm)}%` }} />
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">30 cm Core Root</span>
                <span className="font-mono text-sky-700 font-bold tabular-nums">{t.soilMoistureDepth.root30cm.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-sky-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, t.soilMoistureDepth.root30cm)}%` }} />
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">60 cm Subsoil</span>
                <span className="font-mono text-slate-800 font-semibold tabular-nums">{t.soilMoistureDepth.deep60cm.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-sky-600 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, t.soilMoistureDepth.deep60cm)}%` }} />
              </div>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-200/80">
            Optimal range: 30% - 55% VWC
          </div>
        </div>

        {/* Card 2: Temperature */}
        <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/90 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-600 font-semibold flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                Thermal Micro-Climate
              </span>
              <span className="text-[11px] font-mono font-medium text-slate-500">
                Δ {(t.ambientTemp - t.soilTemp).toFixed(1)}°C
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 my-2">
              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <div className="text-[11px] text-slate-500">Ambient Air</div>
                <div className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
                  {t.ambientTemp.toFixed(1)}°C
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">{(t.ambientTemp * 1.8 + 32).toFixed(1)}°F</div>
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <div className="text-[11px] text-slate-500">Soil @ 15cm</div>
                <div className="text-2xl font-extrabold text-amber-600 font-mono tabular-nums">
                  {t.soilTemp.toFixed(1)}°C
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">{(t.soilTemp * 1.8 + 32).toFixed(1)}°F</div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-1 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Growing Degree Days:</span>
                <span className="font-mono text-slate-800 font-semibold">1,420 GDD</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Root Metabolic Activity:</span>
                <span className="font-mono text-emerald-700 font-bold">Active</span>
              </div>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-200/80">
            Soil target for root growth: 18°C - 24°C
          </div>
        </div>

        {/* Card 3: Humidity & VPD */}
        <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/90 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-600 font-semibold flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5 text-sky-600" />
                Humidity & Vapor Pressure Deficit
              </span>
              <span className={`text-[10px] font-bold ${vpdStatus.color}`}>
                {vpdStatus.label}
              </span>
            </div>

            <div className="flex items-baseline gap-2 my-2">
              <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
                {t.humidity.toFixed(0)}
              </span>
              <span className="text-sm text-slate-500 font-medium">% RH</span>
            </div>

            <div className="p-2.5 rounded-lg bg-white border border-slate-200 mt-2 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">VPD (Transpiration):</span>
                <span className="font-mono text-slate-900 font-bold tabular-nums">{t.vpd.toFixed(2)} kPa</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden flex">
                <div className="bg-sky-400 h-full w-[25%]" title="Low (<0.8 kPa)" />
                <div className="bg-emerald-500 h-full w-[45%]" title="Target (0.8 - 1.6 kPa)" />
                <div className="bg-rose-400 h-full w-[30%]" title="High (>1.6 kPa)" />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Low</span>
                <span className="text-emerald-700 font-bold">Optimal Window</span>
                <span>Stress</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-200/80">
            Target VPD: 0.85 – 1.45 kPa
          </div>
        </div>

        {/* Card 4: Leaf Wetness */}
        <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/90 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-600 font-semibold flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-purple-600" />
                Leaf Wetness & Infection Risk
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${foliarRisk.badge} ${foliarRisk.color}`}>
                {foliarRisk.level}
              </span>
            </div>

            <div className="flex items-baseline gap-2 my-2">
              <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
                {t.leafWetness.toFixed(1)}
              </span>
              <span className="text-sm text-slate-500 font-medium">/ 15 index</span>
            </div>

            <div className="space-y-1.5 mt-3 pt-3 border-t border-slate-200/80 text-xs">
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Fungal Germination Window:</span>
                <span className="font-mono text-slate-800 font-medium">
                  {t.leafWetness > 3.0 ? 'High (>5h wet)' : 'Minimal (<2h wet)'}
                </span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Solar Irradiance:</span>
                <span className="font-mono text-amber-600 font-semibold tabular-nums">{t.solarRadiation} W/m²</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Battery / Signal:</span>
                <span className="font-mono text-emerald-700 font-semibold tabular-nums">{t.batteryLevel}% · -64 dBm</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-200/80">
            Foliar drying accelerated above 500 W/m²
          </div>
        </div>
      </div>

      {/* Row 2: NPK and pH Health */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-200">
        <div className="md:col-span-2 p-4 rounded-xl bg-slate-50/70 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              Soil N-P-K Macronutrients (mg/kg dry soil)
            </span>
            <span className="text-[11px] text-slate-500">Ion-selective optical probe</span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 font-medium">Nitrogen (N)</span>
                <span className="font-mono font-bold text-slate-900 tabular-nums">{t.nitrogen} mg/kg</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    t.nitrogen < 45 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, (t.nitrogen / 80) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Low (&lt;40)</span>
                <span>Target: 50-70</span>
                <span>High (&gt;80)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 font-medium">Phosphorus (P)</span>
                <span className="font-mono font-bold text-slate-900 tabular-nums">{t.phosphorus} mg/kg</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (t.phosphorus / 60) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Low (&lt;20)</span>
                <span>Target: 30-50</span>
                <span>High (&gt;60)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 font-medium">Potassium (K)</span>
                <span className="font-mono font-bold text-slate-900 tabular-nums">{t.potassium} mg/kg</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-sky-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (t.potassium / 280) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Low (&lt;120)</span>
                <span>Target: 160-240</span>
                <span>High (&gt;260)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/90 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-900">Soil pH Bio-Availability</span>
              <span className="text-[11px] font-mono font-bold text-emerald-700">
                {t.ph >= 6.0 && t.ph <= 7.0 ? 'Optimal (Slightly Acidic)' : 'Correction Needed'}
              </span>
            </div>

            <div className="flex items-baseline gap-2 my-2">
              <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
                {t.ph.toFixed(1)}
              </span>
              <span className="text-xs text-slate-500 font-medium">pH Scale (0-14)</span>
            </div>

            <div className="w-full bg-gradient-to-r from-rose-400 via-emerald-400 to-indigo-400 h-2 rounded-full mt-2 relative">
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-slate-900 border-2 border-white rounded-full shadow transition-all duration-500"
                style={{ left: `calc(${((t.ph - 4) / 6) * 100}% - 7px)` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 mt-1.5">
              <span>pH 4.0 Acidic</span>
              <span className="text-emerald-700 font-bold">6.5 Neutral</span>
              <span>pH 10.0 Alkaline</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-200/80">
            Nutrient uptake efficiency for {zone.crop}: 96%
          </div>
        </div>
      </div>
    </div>
  );
};
