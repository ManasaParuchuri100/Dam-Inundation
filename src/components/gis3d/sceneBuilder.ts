import * as THREE from 'three';
import {
  getRiverCenterlineX,
  getTerrainElevation,
  generateSettlementBuildings,
  generateValleyTrees,
  generateRoadSegments,
  BuildingData,
} from './terrainData';
import {
  ScenarioData,
  MapLayerItem,
  AnalyticsMetric,
  AppSettings,
  LayerAdjustments,
  LocationItem,
} from '../../types/navigation';

export interface SceneHandles {
  terrainMesh: THREE.Mesh;
  damGroup: THREE.Group;
  reservoirWaterMesh: THREE.Mesh;
  riverMesh: THREE.Mesh;
  floodWaterMesh: THREE.Mesh;
  floodWaveFrontMesh: THREE.Mesh;
  roadsGroup: THREE.Group;
  buildingsGroup: THREE.Group;
  treesGroup: THREE.Group;
  markersGroup: THREE.Group;
  contourLinesGroup: THREE.Group;
  flowParticlesGroup: THREE.Points;
  updateFlood: (progress: number, metric: AnalyticsMetric) => void;
  updateLayers: (layers: MapLayerItem[]) => void;
  updateScenario: (scenario: ScenarioData) => void;
  updateSettings: (settings: AppSettings) => void;
  updateAdjustments: (adjustments: LayerAdjustments) => void;
  updateLocations: (locations: LocationItem[]) => void;
  animate: (time: number) => void;
}

export function buildSimulationScene(
  scene: THREE.Scene,
  initialScenario: ScenarioData,
  initialLayers: MapLayerItem[],
  initialSettings: AppSettings,
  initialAdjustments: LayerAdjustments,
  initialLocations: LocationItem[]
): SceneHandles {
  // Clear any existing elements
  while (scene.children.length > 0) {
    scene.remove(scene.children[0]);
  }

  // 1. Technical GIS Lighting (Balanced, non-glaring, realistic daylight)
  const ambientLight = new THREE.AmbientLight(0xdde5ee, 1.15);
  scene.add(ambientLight);

  // Directional sun light positioned at high ridge angle to cast natural relief
  const sunLight = new THREE.DirectionalLight(0xfffaed, 1.6);
  sunLight.position.set(55, 110, -45);
  sunLight.castShadow = false;
  scene.add(sunLight);

  // Cool sky fill light to illuminate valley shadows realistically
  const fillLight = new THREE.DirectionalLight(0x60a5fa, 0.45);
  fillLight.position.set(-70, 65, 75);
  scene.add(fillLight);

  // 2. High-Fidelity Topographic Terrain Mesh
  const terrainWidth = 160;
  const terrainLength = 250;
  const segmentsX = 150;
  const segmentsZ = 190;

  const terrainGeom = new THREE.PlaneGeometry(
    terrainWidth,
    terrainLength,
    segmentsX,
    segmentsZ
  );
  terrainGeom.rotateX(-Math.PI / 2);

  const posAttr = terrainGeom.attributes.position;
  const colors: number[] = [];
  const colorHelper = new THREE.Color();

  // Offset origin so z goes from approx -70 (reservoir) to +180 (downstream)
  const zOffset = 55;

  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const rawZ = posAttr.getZ(i);
    const worldZ = rawZ + zOffset;
    posAttr.setZ(i, worldZ);

    const elev = getTerrainElevation(x, worldZ);
    posAttr.setY(i, elev);

    const riverX = getRiverCenterlineX(worldZ);
    const distToRiver = Math.abs(x - riverX);

    // Natural geographic coloring (hypsometric + geomorphology)
    if (worldZ < -55 && elev < 98) {
      // Submerged reservoir gorge bed: dark drowned shale
      colorHelper.setRGB(0.07, 0.12, 0.18);
    } else if (distToRiver < 7.5 && worldZ >= -55) {
      // River gravel bar / shoreline sand & sediment
      colorHelper.setRGB(0.18, 0.22, 0.19);
    } else if (elev < 52) {
      // Low alluvial floodplain: rich silt & grass
      colorHelper.setRGB(0.14, 0.24, 0.18);
    } else if (elev < 82) {
      // Alluvial river terraces and conifer forest belts
      colorHelper.setRGB(0.16, 0.27, 0.21);
    } else if (elev < 118) {
      // Exposed canyon basalt rock & scree slopes
      colorHelper.setRGB(0.24, 0.27, 0.29);
    } else {
      // High alpine ridges & granite peaks
      colorHelper.setRGB(0.34, 0.37, 0.40);
    }

    // Subtle elevation contour tinting every 25m
    const contourPhase = (elev % 25.0);
    if (contourPhase < 0.8) {
      colorHelper.multiplyScalar(0.85); // dark subtle contour band
    }

    colors.push(colorHelper.r, colorHelper.g, colorHelper.b);
  }

  terrainGeom.setAttribute(
    'color',
    new THREE.Float32BufferAttribute(colors, 3)
  );
  terrainGeom.computeVertexNormals();

  const terrainMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.82,
    metalness: 0.08,
    flatShading: true,
  });

  const terrainMesh = new THREE.Mesh(terrainGeom, terrainMat);
  terrainMesh.name = 'terrain';
  scene.add(terrainMesh);

  // 3. Reservoir Water Surface (Upstream of Dam)
  const reservoirGeom = new THREE.PlaneGeometry(84, 52, 28, 28);
  reservoirGeom.rotateX(-Math.PI / 2);
  const reservoirMat = new THREE.MeshPhysicalMaterial({
    color: 0x0284c7,
    transparent: true,
    opacity: 0.88,
    roughness: 0.12,
    metalness: 0.15,
    transmission: 0.25,
    ior: 1.33,
  });
  const reservoirWaterMesh = new THREE.Mesh(reservoirGeom, reservoirMat);
  reservoirWaterMesh.position.set(0, initialScenario.reservoirLevel, -80);
  reservoirWaterMesh.name = 'reservoir-water';
  scene.add(reservoirWaterMesh);

  // 4. Dam Structure (Curved Concrete Arch Dam at z = -55)
  const damGroup = new THREE.Group();
  damGroup.name = 'dam-structure';

  const damCrestElev = initialScenario.maxReservoirLevel; // e.g. 152m
  const damBaseElev = 70;
  const damHeight = damCrestElev - damBaseElev;
  const damWidth = 66;

  // Main concrete dam body (arched canyon plug)
  const damGeom = new THREE.BoxGeometry(damWidth, damHeight, 13);
  const damMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.65,
    metalness: 0.15,
  });
  const damBody = new THREE.Mesh(damGeom, damMat);
  damBody.position.set(0, damBaseElev + damHeight / 2, -55);
  damGroup.add(damBody);

  // Dam crest roadway with parapet walls
  const crestRoadGeom = new THREE.BoxGeometry(damWidth + 6, 2.2, 7.5);
  const crestRoadMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.9,
  });
  const crestRoad = new THREE.Mesh(crestRoadGeom, crestRoadMat);
  crestRoad.position.set(0, damCrestElev + 1.1, -55);
  damGroup.add(crestRoad);

  // Parapet railings
  const parapetGeom = new THREE.BoxGeometry(damWidth + 6, 1.2, 0.4);
  const parapetMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.5 });
  const parapet1 = new THREE.Mesh(parapetGeom, parapetMat);
  parapet1.position.set(0, damCrestElev + 2.4, -55 - 3.4);
  damGroup.add(parapet1);
  const parapet2 = new THREE.Mesh(parapetGeom, parapetMat);
  parapet2.position.set(0, damCrestElev + 2.4, -55 + 3.4);
  damGroup.add(parapet2);

  // Concrete spillway chute on downstream face
  const spillwayGeom = new THREE.BoxGeometry(24, 7, 13.5);
  const spillwayMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    roughness: 0.55,
  });
  const spillway = new THREE.Mesh(spillwayGeom, spillwayMat);
  spillway.position.set(0, damCrestElev - 3.5, -55);
  damGroup.add(spillway);

  // Intake Tower structure upstream
  const towerGeom = new THREE.BoxGeometry(6, damHeight + 6, 6);
  const tower = new THREE.Mesh(towerGeom, damMat);
  tower.position.set(-14, damBaseElev + damHeight / 2 + 3, -64);
  damGroup.add(tower);

  // Breach notch (visual cutout indicator when failure is triggered)
  const breachNotchGeom = new THREE.BoxGeometry(20, 16, 15);
  const breachNotchMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.95,
  });
  const breachNotch = new THREE.Mesh(breachNotchGeom, breachNotchMat);
  breachNotch.position.set(0, damCrestElev - 8, -55);
  breachNotch.visible = false;
  damGroup.add(breachNotch);

  // Plunge pool basin at dam foot
  const plungePoolGeom = new THREE.CylinderGeometry(16, 14, 3, 16);
  const plungePoolMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
  const plungePool = new THREE.Mesh(plungePoolGeom, plungePoolMat);
  plungePool.position.set(0, 68, -48);
  damGroup.add(plungePool);

  scene.add(damGroup);

  // 5. Baseline River Mesh (Conforms to carved riverbed channel)
  const riverCurvePoints: THREE.Vector3[] = [];
  for (let z = -55; z <= 175; z += 4) {
    const rx = getRiverCenterlineX(z);
    // Sit cleanly in the carved riverbed
    const ry = getTerrainElevation(rx, z) + 0.35;
    riverCurvePoints.push(new THREE.Vector3(rx, ry, z));
  }
  const riverCurve = new THREE.CatmullRomCurve3(riverCurvePoints);
  const riverGeom = new THREE.TubeGeometry(riverCurve, 140, 3.2, 8, false);
  const riverMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.18,
    metalness: 0.25,
    transparent: true,
    opacity: 0.9,
  });
  const riverMesh = new THREE.Mesh(riverGeom, riverMat);
  riverMesh.name = 'river';
  scene.add(riverMesh);

  // 6. Dynamic Flood Water Surface Mesh (Expands down the valley)
  const floodSegmentsZ = 130;
  const floodSegmentsX = 44;
  const floodGeom = new THREE.PlaneGeometry(64, 240, floodSegmentsX, floodSegmentsZ);
  floodGeom.rotateX(-Math.PI / 2);

  const floodMat = new THREE.MeshPhysicalMaterial({
    color: 0x06b6d4,
    transparent: true,
    opacity: 0.84,
    roughness: 0.08,
    metalness: 0.12,
    transmission: 0.22,
    ior: 1.33,
  });
  const floodWaterMesh = new THREE.Mesh(floodGeom, floodMat);
  floodWaterMesh.position.set(0, 48, 60);
  floodWaterMesh.name = 'flood-water';
  scene.add(floodWaterMesh);

  // Advancing Flood Wave Front (Foam crest)
  const waveFrontGeom = new THREE.CylinderGeometry(2.8, 4.4, 1.4, 16);
  waveFrontGeom.rotateZ(Math.PI / 2);
  const waveFrontMat = new THREE.MeshStandardMaterial({
    color: 0xf0f9ff,
    roughness: 0.35,
    transparent: true,
    opacity: 0.92,
  });
  const floodWaveFrontMesh = new THREE.Mesh(waveFrontGeom, waveFrontMat);
  floodWaveFrontMesh.name = 'flood-front';
  floodWaveFrontMesh.visible = false;
  scene.add(floodWaveFrontMesh);

  // 7. Multi-category Roads Network & Bridges
  const roadsGroup = new THREE.Group();
  roadsGroup.name = 'roads-group';

  const roadSegments = generateRoadSegments();
  const roadMeshes: { id: string; category: string; mesh: THREE.Mesh }[] = [];

  for (const seg of roadSegments) {
    const pts = seg.points.map((p) => new THREE.Vector3(p.x, p.y, p.z));
    const curve = new THREE.CatmullRomCurve3(pts);
    const geom = new THREE.TubeGeometry(curve, 90, seg.width * 0.5, 4, false);
    const mat = new THREE.MeshStandardMaterial({
      color: seg.category === 'evacuation' ? 0xf59e0b : 0x475569,
      roughness: 0.85,
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.name = seg.id;
    mesh.userData = { category: seg.category, baseWidth: seg.width };
    roadsGroup.add(mesh);
    roadMeshes.push({ id: seg.id, category: seg.category, mesh });
  }

  // Bridge 1: Gorge Access Bridge at z = -20
  const b1RiverX = getRiverCenterlineX(-20);
  const b1Y = getTerrainElevation(b1RiverX, -20) + 4.2;
  const bridge1Geom = new THREE.BoxGeometry(26, 1.8, 4.5);
  const bridgeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.5 });
  const bridge1 = new THREE.Mesh(bridge1Geom, bridgeMat);
  bridge1.position.set(b1RiverX, b1Y, -20);
  bridge1.userData = { category: 'arterials' };
  roadsGroup.add(bridge1);

  // Bridge 2: Hwy 101 Viaduct at z = 110
  const b2RiverX = getRiverCenterlineX(110);
  const b2Y = getTerrainElevation(b2RiverX, 110) + 5.2;
  const bridge2Geom = new THREE.BoxGeometry(34, 2.2, 6.5);
  const bridge2 = new THREE.Mesh(bridge2Geom, bridgeMat);
  bridge2.position.set(b2RiverX, b2Y, 110);
  bridge2.userData = { category: 'arterials' };
  roadsGroup.add(bridge2);

  // Viaduct Piers
  for (const bx of [b2RiverX - 9, b2RiverX + 9]) {
    const pierGeom = new THREE.CylinderGeometry(1.4, 1.8, 9, 8);
    const pier = new THREE.Mesh(pierGeom, bridgeMat);
    pier.position.set(bx, b2Y - 4.5, 110);
    roadsGroup.add(pier);
  }

  scene.add(roadsGroup);

  // 8. Procedural Valley Conifer Trees (Natural Geographic Realism)
  const treesGroup = new THREE.Group();
  treesGroup.name = 'trees-group';

  const valleyTrees = generateValleyTrees();
  const treeTrunkGeom = new THREE.CylinderGeometry(0.2, 0.35, 2.5, 5);
  const treeTrunkMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.9 });
  const treeFoliageGeom = new THREE.ConeGeometry(1.6, 5.0, 6);
  const treeFoliageMat = new THREE.MeshStandardMaterial({ color: 0x132e1b, roughness: 0.85 });

  for (const t of valleyTrees) {
    const treeGroup = new THREE.Group();
    const trunk = new THREE.Mesh(treeTrunkGeom, treeTrunkMat);
    trunk.position.y = 1.25;
    const foliage = new THREE.Mesh(treeFoliageGeom, treeFoliageMat);
    foliage.position.y = 4.2;

    treeGroup.add(trunk);
    treeGroup.add(foliage);
    treeGroup.position.set(t.x, t.elevation, t.z);
    treeGroup.scale.set(t.scale, t.scale, t.scale);
    treesGroup.add(treeGroup);
  }
  scene.add(treesGroup);

  // 9. 3D Settlement Buildings with Settlement Linking
  const buildingsGroup = new THREE.Group();
  buildingsGroup.name = 'buildings-group';

  const buildingsData = generateSettlementBuildings();
  const resMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.8 });
  const commMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.7 });
  const indMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.65 });
  const hospMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5 });

  for (const b of buildingsData) {
    const elev = getTerrainElevation(b.x, b.z);
    const bGeom = new THREE.BoxGeometry(b.width, b.height, b.depth);
    let mat = resMat;
    if (b.type === 'commercial') mat = commMat;
    if (b.type === 'industrial') mat = indMat;
    if (b.type === 'civic') mat = hospMat;

    const bMesh = new THREE.Mesh(bGeom, mat);
    bMesh.position.set(b.x, elev + b.height / 2, b.z);
    bMesh.rotation.y = b.rotation;
    bMesh.userData = {
      type: b.type,
      settlementId: b.settlementId,
      baseHeight: b.height,
      baseY: elev,
    };
    buildingsGroup.add(bMesh);
  }
  scene.add(buildingsGroup);

  // 10. POI Location Markers (Interactive 3D Pins with live risk badge)
  const markersGroup = new THREE.Group();
  markersGroup.name = 'markers-group';

  const rebuildMarkers = (locations: LocationItem[]) => {
    // Clear old markers
    while (markersGroup.children.length > 0) {
      markersGroup.remove(markersGroup.children[0]);
    }

    for (const loc of locations) {
      const elev = getTerrainElevation(loc.x, loc.z);
      const poiItem = new THREE.Group();
      poiItem.name = `marker-${loc.id}`;

      // Slender vertical stem
      const stemGeom = new THREE.CylinderGeometry(0.2, 0.2, 10, 8);
      const stemMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const stem = new THREE.Mesh(stemGeom, stemMat);
      stem.position.set(loc.x, elev + 5, loc.z);
      poiItem.add(stem);

      // Diamond octahedron head color-coded by risk level
      const headGeom = new THREE.OctahedronGeometry(1.8);
      let headColor = 0x10b981; // low - green
      if (loc.riskLevel === 'critical') headColor = 0xef4444; // critical - red
      else if (loc.riskLevel === 'high') headColor = 0xf97316; // high - orange
      else if (loc.riskLevel === 'moderate') headColor = 0xf59e0b; // moderate - amber

      const headMat = new THREE.MeshStandardMaterial({
        color: headColor,
        roughness: 0.25,
        metalness: 0.8,
      });
      const head = new THREE.Mesh(headGeom, headMat);
      head.position.set(loc.x, elev + 10.5, loc.z);
      head.userData = { poi: loc, locId: loc.id };
      poiItem.add(head);

      // Warning pulse halo ring for critical / high risk
      if (loc.riskLevel === 'critical' || loc.riskLevel === 'high') {
        const ringGeom = new THREE.RingGeometry(2.0, 2.6, 16);
        ringGeom.rotateX(-Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({
          color: headColor,
          transparent: true,
          opacity: 0.7,
          side: THREE.DoubleSide,
        });
        const ring = new THREE.Mesh(ringGeom, ringMat);
        ring.position.set(loc.x, elev + 10.5, loc.z);
        poiItem.add(ring);
      }

      markersGroup.add(poiItem);
    }
  };

  rebuildMarkers(initialLocations);
  scene.add(markersGroup);

  // 11. Flow Velocity Vector Particles
  const particleCount = 220;
  const particleGeom = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    const z = -50 + Math.random() * 215;
    const rx = getRiverCenterlineX(z) + (Math.random() - 0.5) * 6.5;
    const ry = getTerrainElevation(rx, z) + 1.2;
    particlePositions[i * 3] = rx;
    particlePositions[i * 3 + 1] = ry;
    particlePositions[i * 3 + 2] = z;
  }
  particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0x38bdf8,
    size: 2.0,
    transparent: true,
    opacity: 0.85,
  });
  const flowParticlesGroup = new THREE.Points(particleGeom, particleMat);
  flowParticlesGroup.name = 'velocity-particles';
  scene.add(flowParticlesGroup);

  // 12. Elevation Contour Lines Group
  const contourLinesGroup = new THREE.Group();
  contourLinesGroup.name = 'contours-group';
  for (const cElev of [50, 75, 100, 125]) {
    const cPoints: THREE.Vector3[] = [];
    for (let angle = 0; angle <= Math.PI * 2; angle += 0.18) {
      const radius = 62 - (cElev - 50) * 0.42;
      const cx = Math.cos(angle) * radius;
      const cz = Math.sin(angle) * radius + 40;
      cPoints.push(new THREE.Vector3(cx, cElev + 0.25, cz));
    }
    const cGeom = new THREE.BufferGeometry().setFromPoints(cPoints);
    const cMat = new THREE.LineBasicMaterial({
      color: 0x475569,
      transparent: true,
      opacity: 0.45,
    });
    const cLine = new THREE.Line(cGeom, cMat);
    contourLinesGroup.add(cLine);
  }
  scene.add(contourLinesGroup);

  // --- Handlers ---

  const updateFlood = (progress: number, metric: AnalyticsMetric) => {
    const frontZ = -55 + progress * 230;

    const fPos = floodWaterMesh.geometry.attributes.position;
    for (let i = 0; i < fPos.count; i++) {
      const x = fPos.getX(i);
      const rawZ = fPos.getZ(i);
      const worldZ = rawZ + 60;

      if (worldZ > frontZ) {
        fPos.setY(i, 10);
      } else {
        const riverX = getRiverCenterlineX(worldZ);
        const distFromCenter = Math.abs(x - riverX);

        const maxSpread = 13 + progress * 26;
        if (distFromCenter > maxSpread) {
          fPos.setY(i, 10);
        } else {
          const valleyFloor = getTerrainElevation(riverX, worldZ);
          const distFromDam = Math.max(0, worldZ - (-55));
          const depthNearDam = 14 * (1 - progress * 0.28);
          const floodDepth = Math.max(1.8, depthNearDam * Math.exp(-distFromDam * 0.011));

          const waterElevation = valleyFloor + floodDepth;
          fPos.setY(i, waterElevation);
        }
      }
    }
    fPos.needsUpdate = true;
    floodWaterMesh.geometry.computeVertexNormals();

    if (progress > 0.02 && progress < 0.99) {
      floodWaveFrontMesh.visible = true;
      const frontRiverX = getRiverCenterlineX(frontZ);
      const frontElev = getTerrainElevation(frontRiverX, frontZ) + 2.5;
      floodWaveFrontMesh.position.set(frontRiverX, frontElev, frontZ);
      floodWaveFrontMesh.scale.set(12 + progress * 12, 1, 3.2);
    } else {
      floodWaveFrontMesh.visible = false;
    }

    const mat = floodWaterMesh.material as THREE.MeshPhysicalMaterial;
    if (metric === 'velocity') {
      mat.color.setHex(0x06b6d4); // Cyan hydrodynamic velocity
      mat.opacity = 0.88;
    } else if (metric === 'arrival') {
      mat.color.setHex(0xf59e0b); // Amber isochrone
      mat.opacity = 0.85;
    } else {
      // Flood Depth
      mat.color.setHex(0x0284c7); // Deep azure depth
      mat.opacity = 0.84;
    }
  };

  const updateLayers = (layers: MapLayerItem[]) => {
    for (const l of layers) {
      const isVisible = l.enabled;
      const opacity = l.opacity / 100;

      if (l.id === 'terrain') {
        terrainMesh.visible = isVisible;
        (terrainMesh.material as THREE.MeshStandardMaterial).opacity = opacity;
      } else if (l.id === 'flood-depth') {
        floodWaterMesh.visible = isVisible;
        (floodWaterMesh.material as THREE.MeshPhysicalMaterial).opacity = opacity * 0.85;
      } else if (l.id === 'velocity') {
        flowParticlesGroup.visible = isVisible;
      } else if (l.id === 'arrival-time') {
        contourLinesGroup.visible = isVisible;
      } else if (l.id === 'roads') {
        roadsGroup.visible = isVisible;
      } else if (l.id === 'settlements') {
        buildingsGroup.visible = isVisible;
        treesGroup.visible = isVisible;
      } else if (l.id === 'critical-infra') {
        markersGroup.visible = isVisible;
      } else if (l.id === 'river') {
        riverMesh.visible = isVisible;
        (riverMesh.material as THREE.MeshStandardMaterial).opacity = opacity * 0.9;
      } else if (l.id === 'dam') {
        damGroup.visible = isVisible;
      }
    }
  };

  const updateAdjustments = (adj: LayerAdjustments) => {
    // 1. Roads Adjustments
    for (const r of roadsGroup.children) {
      const mesh = r as THREE.Mesh;
      const cat = mesh.userData?.category;
      let visible = true;
      if (adj.roadsCategory === 'arterials' && cat !== 'arterials') visible = false;
      if (adj.roadsCategory === 'evacuation' && cat !== 'evacuation') visible = false;
      if (adj.roadsCategory === 'local' && cat !== 'local') visible = false;

      mesh.visible = visible;

      // Road Appearance
      if (mesh.material && (mesh.material as THREE.MeshStandardMaterial).color) {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (adj.roadsAppearance === 'asphalt') {
          mat.color.setHex(cat === 'evacuation' ? 0xd97706 : 0x475569);
        } else if (adj.roadsAppearance === 'contrast') {
          mat.color.setHex(cat === 'evacuation' ? 0xf59e0b : 0xe2e8f0);
        } else {
          // evacuation highlighted
          mat.color.setHex(cat === 'evacuation' ? 0x06b6d4 : 0x334155);
        }
      }

      // Width scale
      const baseW = mesh.userData?.baseWidth || 1.8;
      mesh.scale.set(adj.roadsWidthScale, 1, adj.roadsWidthScale);
    }

    // 2. Settlements Adjustments
    for (const b of buildingsGroup.children) {
      const mesh = b as THREE.Mesh;
      const bType = mesh.userData?.type;
      let visible = true;
      if (adj.settlementsZone !== 'all' && bType !== adj.settlementsZone) {
        visible = false;
      }
      mesh.visible = visible;
      mesh.scale.set(
        adj.settlementsScale,
        adj.settlementsScale,
        adj.settlementsScale
      );
    }

    // 3. River Adjustments
    const riverM = riverMesh.material as THREE.MeshStandardMaterial;
    if (adj.riverColorTone === 'alpine') {
      riverM.color.setHex(0x0284c7); // deep alpine blue
    } else if (adj.riverColorTone === 'glacial') {
      riverM.color.setHex(0x06b6d4); // clear glacial cyan
    } else {
      riverM.color.setHex(0x0f766e); // sediment teal green
    }

    // 4. Critical Infra Filter
    for (const m of markersGroup.children) {
      const mGroup = m as THREE.Group;
      const head = mGroup.children[1] as THREE.Mesh;
      if (head?.userData?.poi) {
        const poi = head.userData.poi as LocationItem;
        let show = true;
        if (poi.category === 'infrastructure') {
          show = adj.infraFilterTypes.includes(poi.type as any);
        }
        mGroup.visible = show;
      }
    }

    // 5. Terrain Contour Interval
    contourLinesGroup.visible = adj.terrainContours !== 'none';
  };

  const updateLocations = (locations: LocationItem[]) => {
    rebuildMarkers(locations);
  };

  const updateScenario = (scenario: ScenarioData) => {
    reservoirWaterMesh.position.y = scenario.reservoirLevel;
    if (scenario.breachWidth > 20) {
      breachNotch.visible = true;
      breachNotch.scale.x = scenario.breachWidth / 20;
    } else {
      breachNotch.visible = false;
    }
  };

  const updateSettings = (settings: AppSettings) => {
    const mat = terrainMesh.material as THREE.MeshStandardMaterial;
    if (settings.mapStyle === 'satellite') {
      mat.roughness = 0.9;
      mat.metalness = 0.05;
      ambientLight.color.setHex(0xd4e4f7);
    } else if (settings.mapStyle === 'dark-slate') {
      mat.roughness = 0.8;
      mat.metalness = 0.2;
      ambientLight.color.setHex(0xa0b0c4);
    } else if (settings.mapStyle === 'topo') {
      mat.roughness = 0.6;
      mat.metalness = 0.1;
      ambientLight.color.setHex(0xffffff);
    } else {
      mat.roughness = 0.7;
      mat.metalness = 0.3;
      ambientLight.color.setHex(0x94a3b8);
    }

    contourLinesGroup.visible = settings.terrainVisibility;
  };

  const animate = (time: number) => {
    // Flow velocity particles animation down the river
    const pPos = flowParticlesGroup.geometry.attributes.position;
    for (let i = 0; i < particleCount; i++) {
      let z = pPos.getZ(i) + 0.38;
      if (z > 175) {
        z = -50;
      }
      pPos.setZ(i, z);
      const rx = getRiverCenterlineX(z);
      pPos.setX(i, rx + Math.sin(i + time * 0.002) * 1.5);
      pPos.setY(i, getTerrainElevation(rx, z) + 1.2);
    }
    pPos.needsUpdate = true;

    // Pulsing/floating markers
    for (let i = 0; i < markersGroup.children.length; i++) {
      const mGroup = markersGroup.children[i] as THREE.Group;
      if (mGroup.children[1]) {
        mGroup.children[1].rotation.y = time * 0.0012 + i;
      }
      // Pulse ring scale
      if (mGroup.children[2]) {
        const s = 1.0 + Math.sin(time * 0.004 + i) * 0.25;
        mGroup.children[2].scale.set(s, s, s);
      }
    }
  };

  // Initial updates
  updateFlood(0, 'depth');
  updateLayers(initialLayers);
  updateScenario(initialScenario);
  updateSettings(initialSettings);
  updateAdjustments(initialAdjustments);

  return {
    terrainMesh,
    damGroup,
    reservoirWaterMesh,
    riverMesh,
    floodWaterMesh,
    floodWaveFrontMesh,
    roadsGroup,
    buildingsGroup,
    treesGroup,
    markersGroup,
    contourLinesGroup,
    flowParticlesGroup,
    updateFlood,
    updateLayers,
    updateScenario,
    updateSettings,
    updateAdjustments,
    updateLocations,
    animate,
  };
}
