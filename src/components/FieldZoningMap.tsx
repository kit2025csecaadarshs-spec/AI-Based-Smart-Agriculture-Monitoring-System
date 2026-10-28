import React, { useState } from 'react';
import { SATELLITE_IMAGE_PATH } from '../data/mockFarmData';
import { FarmZone } from '../types/agriculture';
import { Compass, Navigation, Layers, Radio, Droplets } from 'lucide-react';

interface FieldZoningMapProps {
  zones: FarmZone[];
  selectedZoneId: string;
  onSelectZone: (zoneId: string) => void;
}

export const FieldZoningMap: React.FC<FieldZoningMapProps> = ({
  zones,
  selectedZoneId,
  onSelectZone,
}) => {
  const [showNdviOverlay, setShowNdviOverlay] = useState(true);
  const [droneFlightActive, setDroneFlightActive] = useState(false);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-emerald-700 font-mono mb-1 font-semibold">
            <span>SATELLITE & UAV AERIAL TELEMETRY</span>
            <span aria-hidden="true">·</span>
            <span>Sentinel-2 Multispectral + Drone Mesh</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Field Parcel Zoning & NDVI Canopy Analysis
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNdviOverlay(!showNdviOverlay)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
              showNdviOverlay
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{showNdviOverlay ? 'NDVI Overlay Active' : 'True Color Aerial'}</span>
          </button>

          <button
            onClick={() => setDroneFlightActive(!droneFlightActive)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
              droneFlightActive
                ? 'bg-cyan-50 border-cyan-300 text-cyan-800'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Navigation className={`w-3.5 h-3.5 ${droneFlightActive ? 'animate-spin text-cyan-600' : ''}`} />
            <span>{droneFlightActive ? 'Drone Patrolling' : 'Simulate UAV Patrol'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Map Canvas */}
        <div className="lg:col-span-8 relative aspect-16/10 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs">
          <img
            src={SATELLITE_IMAGE_PATH}
            alt="Multispectral satellite map of agricultural plots"
            className={`w-full h-full object-cover transition-all duration-700 ${
              showNdviOverlay ? 'saturate-125 contrast-110' : 'filter-none'
            }`}
            referrerPolicy="no-referrer"
          />

          {/* Interactive Parcels Hotspots */}
          <div className="absolute inset-0 p-4 grid grid-cols-2 grid-rows-2 gap-4">
            {zones.map((zone) => {
              const isSelected = zone.id === selectedZoneId;
              return (
                <div
                  key={zone.id}
                  onClick={() => onSelectZone(zone.id)}
                  className={`relative rounded-xl border-2 transition-all p-3 flex flex-col justify-between cursor-pointer group backdrop-blur-[2px] ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-950/30 shadow-lg ring-2 ring-emerald-400/40'
                      : 'border-white/40 bg-black/25 hover:border-white/80 hover:bg-black/35'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-bold text-white bg-black/75 px-2 py-0.5 rounded backdrop-blur-md">
                      {zone.name.split(' - ')[0]}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-emerald-300 bg-black/75 px-2 py-0.5 rounded backdrop-blur-md">
                      NDVI {zone.ndviIndex.toFixed(2)}
                    </span>
                  </div>

                  {zone.valveOpen && (
                    <div className="self-center flex items-center gap-1.5 text-xs font-bold text-sky-900 bg-sky-100/90 px-2.5 py-1 rounded-full border border-sky-400 shadow-sm animate-pulse">
                      <Droplets className="w-3.5 h-3.5 text-sky-600" />
                      <span>Sprinkler Active</span>
                    </div>
                  )}

                  <div className="flex items-end justify-between text-xs text-white bg-black/75 p-2 rounded backdrop-blur-md">
                    <div>
                      <div className="font-semibold">{zone.crop}</div>
                      <div className="text-[10px] text-slate-300">{zone.areaAcres} Acres</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-300">Moisture</div>
                      <div className="font-mono font-bold text-emerald-400 tabular-nums">
                        {zone.telemetry.soilMoisture.toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {droneFlightActive && (
            <div className="absolute top-4 right-4 z-20 bg-white/95 backdrop-blur-md border border-cyan-300 p-2.5 rounded-xl text-xs text-slate-800 flex items-center gap-2.5 shadow-md">
              <Navigation className="w-4 h-4 text-cyan-600 animate-pulse" />
              <div>
                <div className="font-bold text-cyan-800">UAV Ag-Scout #01 Active</div>
                <div className="text-[10px] text-slate-500 font-mono">Alt: 45m · Speed: 18 km/h · Waypoint 3/8</div>
              </div>
            </div>
          )}

          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-1.5 rounded-lg border border-slate-200 text-slate-600 flex items-center gap-1 text-[10px] font-mono shadow-xs">
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            <span>N 38° 22' 14" W 122° 28' 04"</span>
          </div>
        </div>

        {/* Legend & Zoning Breakdown */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/90 space-y-3 shadow-2xs">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Multispectral NDVI Legend
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Normalized Difference Vegetation Index calculates canopy chlorophyll absorption vs near-infrared reflectance to isolate crop stress before visible leaf symptoms appear.
            </p>

            <div className="space-y-2 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-700">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  0.80 - 1.00 (Vigorous Canopy)
                </span>
                <span className="font-mono text-emerald-700 font-bold">Optimal</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-700">
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  0.50 - 0.79 (Moderate Biomass)
                </span>
                <span className="font-mono text-amber-700 font-bold">Scout Needed</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-700">
                  <span className="w-3 h-3 rounded-full bg-rose-500" />
                  0.10 - 0.49 (Soil / High Stress)
                </span>
                <span className="font-mono text-rose-700 font-bold">Critical</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/90 text-xs shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-cyan-600" />
                <span>Autonomous Flight Grid</span>
              </span>
              <span className="text-[11px] text-cyan-700 font-mono font-semibold">RTK-GPS (1.2cm)</span>
            </div>
            <p className="text-[11px] text-slate-600 mb-3">
              Daily autonomous thermal & multispectral survey scans 340 acres in 42 minutes, uploading orthomosaics straight to the diagnostic pipeline.
            </p>
            <div className="flex justify-between text-[11px] text-slate-700 pt-2 border-t border-slate-200">
              <span>Next scheduled overflight:</span>
              <span className="font-mono text-emerald-700 font-bold">16:30 Today</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
