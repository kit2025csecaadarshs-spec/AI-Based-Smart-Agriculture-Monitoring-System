import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroOverview } from './components/HeroOverview';
import { FarmThreeScene } from './components/FarmThreeScene';
import { ZoneSelector } from './components/ZoneSelector';
import { LiveTelemetryGrid } from './components/LiveTelemetryGrid';
import { SmartIrrigationControl } from './components/SmartIrrigationControl';
import { CropDiseaseDiagnostic } from './components/CropDiseaseDiagnostic';
import { AgronomistCopilot } from './components/AgronomistCopilot';
import { FieldZoningMap } from './components/FieldZoningMap';
import { TelemetryCharts } from './components/TelemetryCharts';
import { AlertsLog } from './components/AlertsLog';
import { INITIAL_ZONES, INITIAL_ALERTS } from './data/mockFarmData';
import { FarmZone, FarmAlert } from './types/agriculture';
import { Sprout } from 'lucide-react';

export default function App() {
  const [zones, setZones] = useState<FarmZone[]>(INITIAL_ZONES);
  const [selectedZoneId, setSelectedZoneId] = useState<string>('zone-b');
  const [alerts, setAlerts] = useState<FarmAlert[]>(INITIAL_ALERTS);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [scenario, setScenario] = useState<'nominal' | 'heatwave' | 'rainstorm' | 'drought'>('nominal');
  const [isSimulating, setIsSimulating] = useState<boolean>(true);

  // Active Zone reference
  const activeZone = zones.find((z) => z.id === selectedZoneId) || zones[0];

  // Aggregated KPI numbers
  const totalAcres = zones.reduce((acc, z) => acc + z.areaAcres, 0);
  const averageHealth = zones.reduce((acc, z) => acc + z.healthScore, 0) / zones.length;
  const activeValvesCount = zones.filter((z) => z.valveOpen).length;
  const unreadAlertsCount = alerts.filter((a) => !a.acknowledged).length;

  // Real-time IoT Telemetry Simulation Pulse (every 3 seconds)
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setZones((prevZones) =>
        prevZones.map((zone) => {
          let moistureDelta = 0;
          let newFlow = zone.telemetry.flowRateLpm;
          let isValveOpen = zone.valveOpen;

          // If valve is open, soil moisture replenishes
          if (isValveOpen) {
            moistureDelta = 0.5 + Math.random() * 0.4;
            newFlow = Math.round(65 + Math.random() * 6);
          } else {
            moistureDelta = -(0.1 + Math.random() * 0.15);
            newFlow = 0;
          }

          const newMoisture = Math.min(95, Math.max(12, zone.telemetry.soilMoisture + moistureDelta));

          // Auto-irrigation closed-loop trigger
          if (zone.autoMode) {
            if (newMoisture < 22 && !isValveOpen) {
              isValveOpen = true;
              newFlow = 68;
            } else if (newMoisture > 52 && isValveOpen) {
              isValveOpen = false;
              newFlow = 0;
            }
          }

          const tempJitter = (Math.random() - 0.5) * 0.2;
          const humidityJitter = (Math.random() - 0.5) * 0.6;
          const newAmbient = Math.round((zone.telemetry.ambientTemp + tempJitter) * 10) / 10;
          const newHumidity = Math.min(98, Math.max(20, Math.round(zone.telemetry.humidity + humidityJitter)));

          return {
            ...zone,
            valveOpen: isValveOpen,
            telemetry: {
              ...zone.telemetry,
              soilMoisture: Number(newMoisture.toFixed(1)),
              soilMoistureDepth: {
                shallow10cm: Number(Math.max(8, newMoisture - 4).toFixed(1)),
                root30cm: Number(newMoisture.toFixed(1)),
                deep60cm: Number(Math.min(95, newMoisture + 6).toFixed(1)),
              },
              ambientTemp: newAmbient,
              humidity: newHumidity,
              flowRateLpm: newFlow,
              lastUpdated: 'Just now',
            },
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [isSimulating]);

  // Scenario Simulator Handler
  const handleSelectScenario = (newScenario: 'nominal' | 'heatwave' | 'rainstorm' | 'drought') => {
    setScenario(newScenario);

    setZones((prev) =>
      prev.map((zone) => {
        const copy = { ...zone, telemetry: { ...zone.telemetry } };
        if (newScenario === 'nominal') {
          copy.telemetry.ambientTemp = 24.5;
          copy.telemetry.soilMoisture = 38.0;
          copy.telemetry.humidity = 55;
          copy.telemetry.leafWetness = 1.0;
          copy.telemetry.vpd = 1.35;
        } else if (newScenario === 'heatwave') {
          copy.telemetry.ambientTemp = 36.2;
          copy.telemetry.soilMoisture = 22.0;
          copy.telemetry.humidity = 30;
          copy.telemetry.leafWetness = 0.2;
          copy.telemetry.vpd = 2.65;
        } else if (newScenario === 'rainstorm') {
          copy.telemetry.ambientTemp = 18.0;
          copy.telemetry.soilMoisture = 76.0;
          copy.telemetry.humidity = 92;
          copy.telemetry.leafWetness = 7.5;
          copy.telemetry.vpd = 0.35;
        } else if (newScenario === 'drought') {
          copy.telemetry.ambientTemp = 33.5;
          copy.telemetry.soilMoisture = 17.5;
          copy.telemetry.humidity = 26;
          copy.telemetry.leafWetness = 0.1;
          copy.telemetry.vpd = 2.45;
        }
        return copy;
      })
    );

    if (newScenario === 'heatwave' || newScenario === 'drought') {
      const newAlert: FarmAlert = {
        id: `alert-${Date.now()}`,
        zoneId: activeZone.id,
        zoneName: activeZone.name,
        severity: 'critical',
        title: `${newScenario === 'heatwave' ? 'Heatwave Extreme VPD' : 'Severe Drought Depletion'} Simulated`,
        description: `Ambient stress conditions simulated across farm parcels. Soil moisture threshold breached.`,
        timestamp: 'Just now',
        acknowledged: false,
        automatedActionTaken: 'Autonomous smart irrigation valves queued for rapid root-zone rehydration.',
      };
      setAlerts((prev) => [newAlert, ...prev]);
    } else if (newScenario === 'rainstorm') {
      const newAlert: FarmAlert = {
        id: `alert-${Date.now()}`,
        zoneId: 'zone-c',
        zoneName: 'Zone C - Hydroponic Greenhouse',
        severity: 'warning',
        title: 'Foliar Saturation & Spore Infection Hazard',
        description: 'Simulated precipitation caused leaf wetness spike to 7.5. Automated dehumidification vents initiated.',
        timestamp: 'Just now',
        acknowledged: false,
        automatedActionTaken: 'Greenhouse louvers and circulation fans activated.',
      };
      setAlerts((prev) => [newAlert, ...prev]);
    }
  };

  const handleUpdateTelemetry = (partial: Partial<FarmZone['telemetry']>) => {
    setZones((prev) =>
      prev.map((zone) => {
        if (zone.id === selectedZoneId) {
          return {
            ...zone,
            telemetry: { ...zone.telemetry, ...partial },
          };
        }
        return zone;
      })
    );
  };

  const handleToggleValve = (zoneId: string) => {
    setZones((prev) =>
      prev.map((zone) => {
        if (zone.id === zoneId) {
          const nextState = !zone.valveOpen;
          return {
            ...zone,
            valveOpen: nextState,
            telemetry: {
              ...zone.telemetry,
              flowRateLpm: nextState ? 68 : 0,
            },
          };
        }
        return zone;
      })
    );
  };

  const handleToggleAutoMode = (zoneId: string) => {
    setZones((prev) =>
      prev.map((zone) => {
        if (zone.id === zoneId) {
          return { ...zone, autoMode: !zone.autoMode };
        }
        return zone;
      })
    );
  };

  const handleUpdateFlowRate = (zoneId: string, rate: number) => {
    setZones((prev) =>
      prev.map((zone) => {
        if (zone.id === zoneId) {
          return {
            ...zone,
            telemetry: { ...zone.telemetry, flowRateLpm: rate },
          };
        }
        return zone;
      })
    );
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a))
    );
  };

  const handleClearAllResolved = () => {
    setAlerts((prev) => prev.filter((a) => !a.acknowledged));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Universal Top Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadAlertsCount={unreadAlertsCount}
        onOpenDiagnosticModal={() => setActiveTab('diagnostics')}
      />

      {/* Main Content Workspace Container (1440px desktop baseline) */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Farm Hero Overview & Scenario Simulator */}
        <HeroOverview
          scenario={scenario}
          onSelectScenario={handleSelectScenario}
          isSimulating={isSimulating}
          onToggleSimulating={() => setIsSimulating(!isSimulating)}
          totalAcres={totalAcres}
          averageHealth={averageHealth}
          activeValvesCount={activeValvesCount}
          totalValvesCount={zones.length}
        />

        {/* Interactive 3D Three.js Farm Digital Twin Centerpiece */}
        <FarmThreeScene
          zones={zones}
          selectedZoneId={selectedZoneId}
          onSelectZone={setSelectedZoneId}
          isIrrigating={activeZone.valveOpen}
          onToggleIrrigation={handleToggleValve}
        />

        {/* Tab-driven or Complete Layout */}
        {activeTab === 'overview' && (
          <>
            <ZoneSelector
              zones={zones}
              selectedZoneId={selectedZoneId}
              onSelectZone={setSelectedZoneId}
            />
            <LiveTelemetryGrid
              zone={activeZone}
              onUpdateTelemetry={handleUpdateTelemetry}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <FieldZoningMap
                zones={zones}
                selectedZoneId={selectedZoneId}
                onSelectZone={setSelectedZoneId}
              />
              <SmartIrrigationControl
                zone={activeZone}
                onToggleValve={handleToggleValve}
                onToggleAutoMode={handleToggleAutoMode}
                onUpdateFlowRate={handleUpdateFlowRate}
              />
            </div>
            <CropDiseaseDiagnostic activeZone={activeZone} />
            <AgronomistCopilot activeZone={activeZone} />
            <TelemetryCharts zone={activeZone} />
            <AlertsLog
              alerts={alerts}
              onAcknowledgeAlert={handleAcknowledgeAlert}
              onClearAllResolved={handleClearAllResolved}
            />
          </>
        )}

        {activeTab === 'zones' && (
          <>
            <ZoneSelector
              zones={zones}
              selectedZoneId={selectedZoneId}
              onSelectZone={setSelectedZoneId}
            />
            <FieldZoningMap
              zones={zones}
              selectedZoneId={selectedZoneId}
              onSelectZone={setSelectedZoneId}
            />
            <LiveTelemetryGrid
              zone={activeZone}
              onUpdateTelemetry={handleUpdateTelemetry}
            />
          </>
        )}

        {activeTab === 'diagnostics' && (
          <>
            <ZoneSelector
              zones={zones}
              selectedZoneId={selectedZoneId}
              onSelectZone={setSelectedZoneId}
            />
            <CropDiseaseDiagnostic activeZone={activeZone} />
            <AgronomistCopilot activeZone={activeZone} />
          </>
        )}

        {activeTab === 'irrigation' && (
          <>
            <ZoneSelector
              zones={zones}
              selectedZoneId={selectedZoneId}
              onSelectZone={setSelectedZoneId}
            />
            <SmartIrrigationControl
              zone={activeZone}
              onToggleValve={handleToggleValve}
              onToggleAutoMode={handleToggleAutoMode}
              onUpdateFlowRate={handleUpdateFlowRate}
            />
            <TelemetryCharts zone={activeZone} />
          </>
        )}

        {activeTab === 'copilot' && (
          <>
            <ZoneSelector
              zones={zones}
              selectedZoneId={selectedZoneId}
              onSelectZone={setSelectedZoneId}
            />
            <AgronomistCopilot activeZone={activeZone} />
          </>
        )}

        {activeTab === 'alerts' && (
          <AlertsLog
            alerts={alerts}
            onAcknowledgeAlert={handleAcknowledgeAlert}
            onClearAllResolved={handleClearAllResolved}
          />
        )}
      </main>

      {/* Clean Light Editorial Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 px-6 text-xs text-slate-500 shadow-2xs">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-slate-900">AgriSense AI</span>
            <span>· Smart Agriculture Telemetry & 3D Digital Twin</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Three.js WebGL Twin</span>
            <span>·</span>
            <span>Gemini 3.8 Flash Diagnostics</span>
            <span>·</span>
            <span>ISO 11783-ISOBUS Compliant</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
