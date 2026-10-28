export interface ZoneTelemetry {
  soilMoisture: number; // percentage (0-100)
  soilMoistureDepth: {
    shallow10cm: number;
    root30cm: number;
    deep60cm: number;
  };
  soilTemp: number; // Celsius
  ambientTemp: number; // Celsius
  humidity: number; // percentage
  nitrogen: number; // mg/kg (PPM)
  phosphorus: number; // mg/kg
  potassium: number; // mg/kg
  ph: number; // 0 - 14
  solarRadiation: number; // W/m²
  vpd: number; // Vapor Pressure Deficit (kPa)
  leafWetness: number; // 0 - 15 index
  waterReservoirLevel: number; // percentage
  batteryLevel: number; // gateway battery %
  flowRateLpm: number; // Liters per minute
  lastUpdated: string;
}

export interface FarmZone {
  id: string;
  name: string;
  crop: string;
  variety: string;
  areaAcres: number;
  plantingDate: string;
  growthStage: 'Germination' | 'Vegetative' | 'Flowering / Tasseling' | 'Fruiting / Ripening' | 'Harvest Ready';
  healthScore: number; // 0 - 100
  ndviIndex: number; // 0.0 - 1.0 (Normalized Difference Vegetation Index)
  irrigationStatus: 'idle' | 'active' | 'scheduled';
  valveOpen: boolean;
  autoMode: boolean;
  telemetry: ZoneTelemetry;
}

export interface FarmAlert {
  id: string;
  zoneId: string;
  zoneName: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: string;
  acknowledged: boolean;
  automatedActionTaken?: string;
  triggerMetric?: string;
  triggerValue?: string;
}

export interface DiseaseDiagnosis {
  conditionName: string;
  scientificName: string;
  healthStatus: 'Healthy' | 'Infected' | 'Deficient' | 'Stressed';
  confidenceScore: number;
  severityLevel: 'None' | 'Mild' | 'Moderate' | 'Severe';
  affectedSurfacePercentage: number;
  pathogenType: string;
  visualSymptoms: string[];
  microclimateCorrelation: string;
  immediateRemediation: string[];
  organicTreatment: string;
  chemicalTreatment: string;
  preventativeProtocol: string[];
  irrigationAdvice: string;
}

export interface WeatherCondition {
  label: string;
  icon: string;
  temp: number;
  humidity: number;
  description: string;
  rainChance: number;
  windSpeedKmh: number;
}
