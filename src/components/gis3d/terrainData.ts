import * as THREE from 'three';
import { LocationItem } from '../../types/navigation';

export type POI = LocationItem;

// Coordinate conventions:
// Z axis represents upstream (negative Z) to downstream (positive Z).
// X axis represents valley cross-section (negative X = West ridge, positive X = East ridge).
// Y axis represents elevation (meters above datum).

// Centerline of the river valley (sinusoidal meandering canyon)
export function getRiverCenterlineX(z: number): number {
  return (
    Math.sin(z * 0.024) * 16.5 +
    Math.sin(z * 0.055) * 7.2 +
    (z > 35 ? Math.sin(z * 0.016) * 13.0 : 0)
  );
}

// Terrain elevation function with realistic carved river bed and natural alluvial benches
export function getTerrainElevation(x: number, z: number): number {
  const riverX = getRiverCenterlineX(z);
  const distToRiver = Math.abs(x - riverX);

  // Multi-frequency fractal mountain noise
  const ridgeNoise =
    Math.sin(x * 0.038 + 1.2) * Math.cos(z * 0.028) * 20.0 +
    Math.sin(x * 0.082) * Math.sin(z * 0.075) * 8.5 +
    Math.cos(x * 0.018 + z * 0.012) * 14.0 +
    Math.sin(x * 0.16 + z * 0.14) * 2.2;

  let baseElevation = 0;

  if (z < -55) {
    // Upstream reservoir lake basin & gorge
    const distFromDam = Math.abs(z - (-55));
    const basinFloor = 86 + distFromDam * 0.07;
    const canyonSteepness = 0.038;
    const canyonRise = Math.pow(distToRiver * canyonSteepness, 2.3) * 48;
    baseElevation = basinFloor + canyonRise + Math.max(0, ridgeNoise * 0.65);
  } else if (z >= -55 && z < -35) {
    // Narrow dam gorge outlet: dramatic vertical canyon walls
    const valleyFloor = 72 - (z - (-55)) * 0.42;
    const gorgeSteepness = 0.048;
    const gorgeRise = Math.pow(distToRiver * gorgeSteepness, 2.5) * 65;
    baseElevation = valleyFloor + gorgeRise + Math.max(0, ridgeNoise * 0.45);
  } else {
    // Downstream river valley: gradually widens and slopes down
    const valleyProgress = (z - (-35)) / 220; // 0 to 1
    const valleyFloor = 64 - valleyProgress * 28; // drops from 64m to 36m

    // Valley canyon width broadens downstream
    const widthFactor = 0.024 - valleyProgress * 0.011;
    const canyonRise = Math.pow(distToRiver * widthFactor, 2.05) * (46 - valleyProgress * 14);

    // Natural alluvial river terraces (flat benches where towns sit)
    const terrace =
      Math.sin(distToRiver * 0.09) * 2.2 * Math.exp(-distToRiver * 0.03);
    baseElevation = valleyFloor + canyonRise + terrace + ridgeNoise * 0.55;
  }

  // Naturally carve the river bed channel directly into the terrain
  // This ensures the water sits flush in the river channel without floating
  if (z >= -55) {
    const channelHalfWidth = 6.0 + (z > 40 ? (z - 40) * 0.025 : 0);
    if (distToRiver < channelHalfWidth) {
      const riverDepth = (1 - Math.pow(distToRiver / channelHalfWidth, 2)) * 2.8;
      baseElevation -= riverDepth;
    }
  }

  return Math.max(24, baseElevation);
}

// Building cluster placements with settlement linking
export interface BuildingData {
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  rotation: number;
  type: 'residential' | 'commercial' | 'industrial' | 'civic';
  settlementId: string;
}

export function generateSettlementBuildings(): BuildingData[] {
  const buildings: BuildingData[] = [];

  // 1. Pinecrest Hydro Plant Cluster (z ~ -42)
  buildings.push(
    {
      x: 13,
      z: -43,
      width: 7,
      depth: 13,
      height: 7,
      rotation: 0.1,
      type: 'industrial',
      settlementId: 'poi-hydro',
    },
    {
      x: 21,
      z: -40,
      width: 6,
      depth: 8,
      height: 4.5,
      rotation: -0.1,
      type: 'industrial',
      settlementId: 'poi-hydro',
    },
    {
      x: 18,
      z: -47,
      width: 4.5,
      depth: 5,
      height: 3.5,
      rotation: 0.05,
      type: 'industrial',
      settlementId: 'poi-hydro',
    }
  );

  // 2. Upper Valley Homesteads (z: -5 to 15, x: -35 to -15) - 20 buildings
  for (let i = 0; i < 20; i++) {
    const angle = i * 0.68;
    const r = 4.5 + (i % 5) * 3.8;
    const cx = -26 + Math.cos(angle) * r;
    const cz = 5 + Math.sin(angle) * r;
    buildings.push({
      x: cx,
      z: cz,
      width: 2.2 + (i % 3) * 0.7,
      depth: 2.6 + ((i + 1) % 3) * 0.7,
      height: 2.2 + (i % 2) * 1.3,
      rotation: (i * 0.42) % Math.PI,
      type: 'residential',
      settlementId: 'poi-upper-settlement',
    });
  }

  // 3. West Valley Substation perimeter (z ~ 38, x ~ -32)
  buildings.push(
    {
      x: -32,
      z: 38,
      width: 8,
      depth: 11,
      height: 3.8,
      rotation: 0.05,
      type: 'industrial',
      settlementId: 'poi-substation',
    },
    {
      x: -27,
      z: 42,
      width: 4.5,
      depth: 5.5,
      height: 2.8,
      rotation: 0,
      type: 'industrial',
      settlementId: 'poi-substation',
    }
  );

  // 4. Riverside Community (z: 60 to 95, x: 12 to 42) - 48 buildings
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 8; col++) {
      const bx = 15 + col * 4.1 + Math.sin(row + col) * 1.2;
      const bz = 64 + row * 4.8 + Math.cos(col) * 1.1;
      const isHospital = row === 4 && col === 5;
      const isCivic = row === 3 && col === 3;
      const isCommercial = row === 2 || col === 2;

      buildings.push({
        x: bx,
        z: bz,
        width: isHospital ? 8.5 : isCivic ? 6.5 : 2.5 + (col % 2) * 0.9,
        depth: isHospital ? 9.5 : isCivic ? 6.5 : 2.8 + (row % 2) * 0.8,
        height: isHospital ? 7.8 : isCivic ? 5.8 : 2.5 + ((row + col) % 3) * 1.5,
        rotation: row * 0.12 + col * 0.07,
        type: isHospital ? 'civic' : isCivic ? 'civic' : isCommercial ? 'commercial' : 'residential',
        settlementId: isHospital ? 'poi-hospital' : 'poi-riverside-town',
      });
    }
  }

  // 5. Lower Confluence Township (z: 130 to 165, x: -35 to 8) - 52 buildings
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 8; col++) {
      const bx = -33 + col * 5.0 + Math.sin(row * 0.8) * 1.0;
      const bz = 132 + row * 4.5 + Math.cos(col * 0.7) * 0.9;
      const isInd = col < 2;
      const isComm = row > 4 && col >= 2 && col <= 5;

      buildings.push({
        x: bx,
        z: bz,
        width: 3.1 + (col % 3) * 0.9,
        depth: 3.3 + (row % 2) * 1.0,
        height: 3.0 + ((row * 2 + col) % 4) * 1.7,
        rotation: 0.08 * (row - col),
        type: isInd ? 'industrial' : isComm ? 'commercial' : 'residential',
        settlementId: 'poi-lower-town',
      });
    }
  }

  return buildings;
}

// Procedural Vegetation: Pine and Conifer trees along valley slopes and riverbanks
export interface TreeData {
  x: number;
  z: number;
  scale: number;
  elevation: number;
}

export function generateValleyTrees(): TreeData[] {
  const trees: TreeData[] = [];

  // Clusters of trees along riverbanks and hillside slopes
  for (let i = 0; i < 180; i++) {
    const z = -45 + (i / 180) * 215;
    const riverX = getRiverCenterlineX(z);

    // Lateral offset: bank trees and terrace grove trees
    const side = (i % 2 === 0 ? 1 : -1);
    const bankDist = 8 + ((i * 17) % 28);
    const x = riverX + side * bankDist + (Math.sin(i * 1.3) * 4);

    const elev = getTerrainElevation(x, z);
    // Only plant trees where slope is moderate and elevation is suitable (not underwater lake or high peak)
    if (elev > 30 && elev < 105) {
      trees.push({
        x,
        z,
        scale: 0.7 + ((i % 5) * 0.15),
        elevation: elev,
      });
    }
  }

  return trees;
}

// Multi-category Road Network
export interface RoadSegment {
  id: string;
  category: 'arterials' | 'evacuation' | 'local';
  name: string;
  points: { x: number; z: number; y: number }[];
  width: number;
}

export function generateRoadSegments(): RoadSegment[] {
  const segments: RoadSegment[] = [];

  // 1. State Highway 101 Arterial (Primary Evacuation Corridor on East Side)
  const hwyPoints: { x: number; z: number; y: number }[] = [];
  for (let z = -50; z <= 170; z += 4) {
    const rx = getRiverCenterlineX(z) + 18 + Math.sin(z * 0.038) * 3.5;
    // Highway sits on flat terrace with smooth grade
    const ry = getTerrainElevation(rx, z) + 0.35;
    hwyPoints.push({ x: rx, z, y: ry });
  }
  segments.push({
    id: 'road-hwy101',
    category: 'arterials',
    name: 'State Highway 101 Arterial',
    points: hwyPoints,
    width: 2.2,
  });

  // 2. West Valley Mountain Road (Connecting Dam, Hydro, Homesteads & Substation)
  const westPoints: { x: number; z: number; y: number }[] = [];
  for (let z = -55; z <= 55; z += 4) {
    const rx = getRiverCenterlineX(z) - 16 - Math.sin(z * 0.04) * 4;
    const ry = getTerrainElevation(rx, z) + 0.35;
    westPoints.push({ x: rx, z, y: ry });
  }
  segments.push({
    id: 'road-west-valley',
    category: 'evacuation',
    name: 'West Valley Evacuation Route',
    points: westPoints,
    width: 1.6,
  });

  // 3. Riverside Community Loop (Local Roads)
  const localPoints: { x: number; z: number; y: number }[] = [];
  for (let z = 60; z <= 100; z += 4) {
    const rx = 28 + Math.cos(z * 0.1) * 6;
    const ry = getTerrainElevation(rx, z) + 0.35;
    localPoints.push({ x: rx, z, y: ry });
  }
  segments.push({
    id: 'road-riverside-local',
    category: 'local',
    name: 'Riverside Municipal Streets',
    points: localPoints,
    width: 1.3,
  });

  // 4. Lower Township Industrial Spine
  const lowerPoints: { x: number; z: number; y: number }[] = [];
  for (let z = 125; z <= 165; z += 4) {
    const rx = -18 + Math.sin(z * 0.08) * 5;
    const ry = getTerrainElevation(rx, z) + 0.35;
    lowerPoints.push({ x: rx, z, y: ry });
  }
  segments.push({
    id: 'road-lower-spine',
    category: 'local',
    name: 'Lower Township Connector',
    points: lowerPoints,
    width: 1.4,
  });

  return segments;
}

