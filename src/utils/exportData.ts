import { ScenarioData, LocationItem } from '../types/navigation';

export function downloadHydrographCSV(scenario: ScenarioData) {
  // Generate realistic hydrograph time-series data based on breach parameters
  const rows = [
    ['Time_hr', 'Discharge_m3s', 'Reservoir_Storage_Mm3', 'Water_Elevation_m', 'Toe_Velocity_ms'],
  ];

  const peakTime = scenario.breachFormationTime * 1.05;
  const peakFlow = 18450 * (scenario.breachWidth / 85.0);
  const baseFlow = 250;
  const initialVol = scenario.reservoirVolume;

  for (let t = 0; t <= 24; t += 0.5) {
    let q = baseFlow;
    if (t < scenario.breachFormationTime * 0.2) {
      q = baseFlow + (t / (scenario.breachFormationTime * 0.2)) * 800;
    } else if (t <= peakTime) {
      const frac = (t - scenario.breachFormationTime * 0.2) / (peakTime - scenario.breachFormationTime * 0.2);
      q = 1050 + (peakFlow - 1050) * Math.sin((frac * Math.PI) / 2);
    } else {
      const decay = Math.exp(-(t - peakTime) / 4.5);
      q = baseFlow + (peakFlow - baseFlow) * decay;
    }

    const volRemaining = Math.max(initialVol * 0.15, initialVol - (t / 24) * (initialVol * 0.85));
    const waterElev = scenario.reservoirLevel - (1 - volRemaining / initialVol) * (scenario.damHeight * 0.75);
    const toeVel = Math.min(17.5, Math.sqrt(2 * 9.81 * Math.max(1, waterElev - 80)) * 0.55);

    rows.push([
      t.toFixed(1),
      Math.round(q).toString(),
      volRemaining.toFixed(2),
      waterElev.toFixed(2),
      toeVel.toFixed(2),
    ]);
  }

  const csvContent = rows.map((e) => e.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Hydrograph_TimeSeries_${scenario.dam.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadLocationsGeoJSON(locations: LocationItem[], scenario: ScenarioData) {
  const geojson = {
    type: 'FeatureCollection',
    metadata: {
      title: 'Dam Breach Critical Impact Audit & Inundation Boundary',
      simulationId: 'SIM-2026-09A',
      scenario: scenario.name,
      dam: scenario.dam,
      timestamp: new Date().toISOString(),
      crs: 'EPSG:4326',
    },
    features: locations.map((loc) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        // approximate geographic coordinates from sector
        coordinates: [
          -104.9903 + (loc.x / 1000) * 0.05,
          39.7392 - (loc.z / 1000) * 0.05,
          loc.elevation,
        ],
      },
      properties: {
        id: loc.id,
        name: loc.name,
        type: loc.type,
        population: loc.population,
        riskLevel: loc.riskLevel,
        evacuationStatus: loc.evacuationStatus,
        distanceFromDamKm: loc.distanceFromDamKm,
        floodArrivalMinutes: loc.arrivalMinutes,
        structuralDetails: loc.details,
      },
    })),
  };

  const jsonStr = JSON.stringify(geojson, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/geo+json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `GIS_Impact_Vectors_${scenario.dam.replace(/[^a-zA-Z0-9]/g, '_')}.geojson`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
