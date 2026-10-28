import React, { useState } from 'react';
import { HISTORICAL_HOURLY_DATA } from '../data/mockFarmData';
import { FarmZone } from '../types/agriculture';
import { Download, Droplets, Thermometer } from 'lucide-react';

interface TelemetryChartsProps {
  zone: FarmZone;
}

export const TelemetryCharts: React.FC<TelemetryChartsProps> = ({ zone }) => {
  const [metricView, setMetricView] = useState<'moisture' | 'tempHumidity'>('moisture');
  const [downloadNotification, setDownloadNotification] = useState<string | null>(null);

  const exportCSV = () => {
    const headers = 'Hour,SoilMoisture(%),Temperature(C),Humidity(%),IrrigationValveActive\n';
    const rows = HISTORICAL_HOURLY_DATA.map(
      (d) => `${d.hour},${d.moisture},${d.temp},${d.humidity},${d.valve ? 'YES' : 'NO'}`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${zone.id}_telemetry_log_24h.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadNotification('CSV Telemetry Log exported successfully!');
    setTimeout(() => setDownloadNotification(null), 3000);
  };

  const exportJSON = () => {
    const payload = {
      zoneId: zone.id,
      zoneName: zone.name,
      crop: zone.crop,
      exportTimestamp: new Date().toISOString(),
      historicalData: HISTORICAL_HOURLY_DATA,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${zone.id}_telemetry_log_24h.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadNotification('JSON Telemetry Log exported successfully!');
    setTimeout(() => setDownloadNotification(null), 3000);
  };

  // SVG Chart math
  const width = 800;
  const height = 240;
  const padding = { top: 20, right: 30, bottom: 35, left: 45 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Compute moisture points
  const maxMoisture = 60;
  const minMoisture = 15;
  const pointsMoisture = HISTORICAL_HOURLY_DATA.map((d, index) => {
    const x = padding.left + (index / (HISTORICAL_HOURLY_DATA.length - 1)) * graphWidth;
    const y =
      padding.top +
      graphHeight -
      ((d.moisture - minMoisture) / (maxMoisture - minMoisture)) * graphHeight;
    return { x, y, ...d };
  });

  const pathD = pointsMoisture.reduce(
    (acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`,
    ''
  );
  const areaD = `${pathD} L ${pointsMoisture[pointsMoisture.length - 1].x} ${
    padding.top + graphHeight
  } L ${pointsMoisture[0].x} ${padding.top + graphHeight} Z`;

  // Compute Temp & Humidity points
  const maxTemp = 35;
  const minTemp = 10;
  const pointsTemp = HISTORICAL_HOURLY_DATA.map((d, index) => {
    const x = padding.left + (index / (HISTORICAL_HOURLY_DATA.length - 1)) * graphWidth;
    const y =
      padding.top + graphHeight - ((d.temp - minTemp) / (maxTemp - minTemp)) * graphHeight;
    return { x, y, ...d };
  });
  const tempPath = pointsTemp.reduce(
    (acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`,
    ''
  );

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-emerald-700 font-mono mb-1 font-semibold">
            <span>24-HOUR TIME SERIES ANALYSIS</span>
            <span aria-hidden="true">·</span>
            <span>Sampling Interval: 120 min</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Historical Telemetry & Irrigation Cycles
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Chart View Switcher */}
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setMetricView('moisture')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                metricView === 'moisture'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Droplets className="w-3.5 h-3.5 inline mr-1" />
              Soil Moisture vs Valve
            </button>
            <button
              onClick={() => setMetricView('tempHumidity')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                metricView === 'tempHumidity'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Thermometer className="w-3.5 h-3.5 inline mr-1" />
              Temp & Humidity
            </button>
          </div>

          {/* Export Actions */}
          <button
            onClick={exportCSV}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Download CSV log"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
          <button
            onClick={exportJSON}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Download JSON log"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {downloadNotification && (
        <div className="mb-4 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
          {downloadNotification}
        </div>
      )}

      {/* SVG Responsive Chart Viewport on Light Canvas */}
      <div className="w-full overflow-x-auto bg-slate-50/50 p-2 rounded-xl border border-slate-100">
        <div className="min-w-[650px]">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
            <defs>
              <linearGradient id="moistureGradientLight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
              const y = padding.top + pct * graphHeight;
              const val =
                metricView === 'moisture'
                  ? (maxMoisture - pct * (maxMoisture - minMoisture)).toFixed(0) + '%'
                  : (maxTemp - pct * (maxTemp - minTemp)).toFixed(0) + '°C';
              return (
                <g key={i}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={width - padding.right}
                    y2={y}
                    stroke="#e2e8f0"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 4}
                    textAnchor="end"
                    fill="#94a3b8"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* X-axis labels */}
            {pointsMoisture.map((pt, i) => (
              <text
                key={i}
                x={pt.x}
                y={height - 10}
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="10"
                fontFamily="monospace"
              >
                {pt.hour}
              </text>
            ))}

            {metricView === 'moisture' ? (
              <>
                <path d={areaD} fill="url(#moistureGradientLight)" />
                <path
                  d={pathD}
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {pointsMoisture.map((pt, i) => (
                  <g key={i}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={pt.valve ? 6 : 3.5}
                      fill={pt.valve ? '#059669' : '#0284c7'}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    {pt.valve && (
                      <g>
                        <rect
                          x={pt.x - 30}
                          y={pt.y - 25}
                          width="60"
                          height="16"
                          rx="4"
                          fill="#ffffff"
                          stroke="#059669"
                          strokeWidth="1.5"
                          filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.05))"
                        />
                        <text
                          x={pt.x}
                          y={pt.y - 14}
                          textAnchor="middle"
                          fill="#059669"
                          fontSize="9"
                          fontWeight="bold"
                        >
                          Drip 68L/m
                        </text>
                      </g>
                    )}
                  </g>
                ))}
              </>
            ) : (
              <>
                <path
                  d={tempPath}
                  fill="none"
                  stroke="#d97706"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {pointsTemp.map((pt, i) => (
                  <circle
                    key={i}
                    cx={pt.x}
                    cy={pt.y}
                    r="4"
                    fill="#d97706"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                ))}
              </>
            )}
          </svg>
        </div>
      </div>

      {/* Chart Footer Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-200 text-xs">
        <div>
          <span className="text-slate-500">24h Mean Moisture:</span>
          <div className="font-mono font-bold text-sky-700 tabular-nums">33.5% VWC</div>
        </div>
        <div>
          <span className="text-slate-500">24h Peak Thermal:</span>
          <div className="font-mono font-bold text-amber-700 tabular-nums">29.8°C @ 14:00</div>
        </div>
        <div>
          <span className="text-slate-500">Automated Irrigation Cycles:</span>
          <div className="font-mono font-bold text-emerald-700 tabular-nums">2 Cycles (85 min total)</div>
        </div>
        <div>
          <span className="text-slate-500">Nighttime Moisture Retention:</span>
          <div className="font-mono font-bold text-slate-900 tabular-nums">98.2% Nominal</div>
        </div>
      </div>
    </div>
  );
};
