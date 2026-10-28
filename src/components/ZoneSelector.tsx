import React from 'react';
import { FarmZone } from '../types/agriculture';
import { Droplet, AlertTriangle, Apple, Wheat, Trees, Flower2 } from 'lucide-react';

interface ZoneSelectorProps {
  zones: FarmZone[];
  selectedZoneId: string;
  onSelectZone: (zoneId: string) => void;
}

export const ZoneSelector: React.FC<ZoneSelectorProps> = ({
  zones,
  selectedZoneId,
  onSelectZone,
}) => {
  const getCropIcon = (crop: string) => {
    if (crop.toLowerCase().includes('apple')) return <Apple className="w-4 h-4 text-rose-500" />;
    if (crop.toLowerCase().includes('corn') || crop.toLowerCase().includes('maize'))
      return <Wheat className="w-4 h-4 text-amber-500" />;
    if (crop.toLowerCase().includes('tomato')) return <Flower2 className="w-4 h-4 text-emerald-600" />;
    return <Trees className="w-4 h-4 text-purple-500" />;
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-slate-900 tracking-tight">
          Field Parcels & Micro-Climate Zones
        </h2>
        <span className="text-xs text-slate-500">
          Select a parcel to inspect localized IoT telemetry & irrigation valves
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {zones.map((zone) => {
          const isSelected = zone.id === selectedZoneId;
          const isMoistureLow = zone.telemetry.soilMoisture < 25;
          const isMoistureHigh = zone.telemetry.soilMoisture > 75;

          return (
            <button
              key={zone.id}
              onClick={() => onSelectZone(zone.id)}
              className={`text-left p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'bg-white border-emerald-500 shadow-md shadow-emerald-500/10 ring-2 ring-emerald-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 shadow-2xs'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80">
                    {getCropIcon(zone.crop)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">{zone.name}</h3>
                    <div className="text-xs text-slate-500">{zone.crop}</div>
                  </div>
                </div>

                {zone.valveOpen ? (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-sky-800 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full">
                    <Droplet className="w-3 h-3 text-sky-600" />
                    Drip ON
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    Idle
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
                <div>
                  <div className="text-slate-500 text-[11px]">Soil Moisture</div>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900 tabular-nums">
                    <span className={isMoistureLow ? 'text-rose-600' : isMoistureHigh ? 'text-sky-600' : 'text-emerald-700'}>
                      {zone.telemetry.soilMoisture.toFixed(1)}%
                    </span>
                    {isMoistureLow && <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />}
                  </div>
                </div>

                <div>
                  <div className="text-slate-500 text-[11px]">Health / NDVI</div>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900 tabular-nums">
                    <span>{zone.healthScore}%</span>
                    <span className="text-[10px] text-slate-500">({zone.ndviIndex.toFixed(2)})</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2.5">
                <span>{zone.areaAcres} Acres</span>
                <span className="truncate max-w-[120px] text-slate-700 font-medium">{zone.growthStage}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
