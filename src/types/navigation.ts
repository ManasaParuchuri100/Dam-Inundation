export type NavTabId = 'scenario' | 'analytics' | 'layers' | 'report' | 'settings';

export interface ScenarioData {
  name: string;
  dam: string;
  location: string;
  // Dam Parameters
  reservoirLevel: number; // in meters (e.g. 148.5)
  maxReservoirLevel: number; // in meters (e.g. 152.0)
  damHeight: number; // in meters (e.g. 68.0)
  reservoirVolume: number; // in million m³ (e.g. 142.5)
  // Breach Parameters
  breachWidth: number; // in meters (e.g. 85.0)
  breachFormationTime: number; // in hours (e.g. 1.2)
  breachType: 'overtopping' | 'piping' | 'structural';
  breachShape: 'trapezoidal' | 'parabolic' | 'rectangular';
  // Simulation
  simulationDuration: number; // in hours (e.g. 24)
  timeStep: string; // e.g. "1.0s (Adaptive CFL ≤ 0.8)"
}

export interface MapLayerItem {
  id: string;
  name: string;
  category: 'hydraulics' | 'basemap' | 'infrastructure';
  description: string;
  enabled: boolean;
  opacity: number;
  color: string;
}

export type AnalyticsMetric =
  | 'overview'
  | 'depth'
  | 'velocity'
  | 'arrival'
  | 'inundation'
  | 'timeseries';

export interface AppSettings {
  mapStyle: 'satellite' | 'dark-slate' | 'topo' | 'vector';
  showLabels: boolean;
  terrainVisibility: boolean;
  animationSpeed: number;
  waterOpacity: number;
  visualizationQuality: 'performance' | 'balanced' | 'ultra';
  unitSystem: 'metric' | 'imperial';
  autoSave: boolean;
  highContrast: boolean;
  crs: string;
}

export interface LayerAdjustments {
  // Roads
  roadsCategory: 'all' | 'arterials' | 'evacuation' | 'local';
  roadsAppearance: 'asphalt' | 'contrast' | 'evacuation';
  roadsWidthScale: number; // 0.8 to 1.6

  // Settlements
  settlementsMinPop: number; // 0, 500, 2000
  settlementsScale: number; // 0.6 to 1.4
  settlementsShowLabels: boolean;
  settlementsZone: 'all' | 'residential' | 'commercial' | 'industrial';

  // Critical Infrastructure
  infraFilterTypes: ('hospital' | 'power' | 'bridge' | 'dam')[];
  infraShowBeacons: boolean;

  // River
  riverFlowSpeed: 'calm' | 'moderate' | 'rapid';
  riverColorTone: 'alpine' | 'glacial' | 'sediment';

  // Terrain
  terrainIntensity: number; // 0.8 to 1.5
  terrainContours: 'none' | '10m' | '25m' | '50m';
  terrainHillshade: 'soft' | 'medium' | 'crisp';

  // Flood layers
  floodMinDepth: number; // 0, 0.5, 1.0, 2.0
  floodColormap: 'hazard' | 'spectral' | 'depth';
}

export interface LocationItem {
  id: string;
  name: string;
  type: 'settlement' | 'hospital' | 'power' | 'bridge' | 'dam' | 'gauge';
  category: 'settlement' | 'infrastructure';
  population: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  evacuationStatus: 'sheltering' | 'in-progress' | 'completed' | 'alert';
  x: number;
  z: number;
  elevation: number;
  distanceFromDamKm: number;
  arrivalMinutes: number;
  details: string;
}

