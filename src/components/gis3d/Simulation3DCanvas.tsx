import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { buildSimulationScene, SceneHandles } from './sceneBuilder';
import { MapOverlayControls } from './MapOverlayControls';
import { POI } from './terrainData';
import { ScenarioData, MapLayerItem, AnalyticsMetric, AppSettings, LayerAdjustments, LocationItem } from '../../types/navigation';

interface Simulation3DCanvasProps {
  scenario: ScenarioData;
  layers: MapLayerItem[];
  activeMetric: AnalyticsMetric;
  settings: AppSettings;
  simulationStatus: 'idle' | 'running' | 'completed';
  simProgress: number;
  adjustments: LayerAdjustments;
  locations: LocationItem[];
  onSelectLocation?: (loc: LocationItem) => void;
  onEditLocation?: (loc: LocationItem) => void;
}

export const Simulation3DCanvas: React.FC<Simulation3DCanvasProps> = ({
  scenario,
  layers,
  activeMetric,
  settings,
  simulationStatus,
  simProgress,
  adjustments,
  locations,
  onSelectLocation,
  onEditLocation,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Scene and Renderer references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const handlesRef = useRef<SceneHandles | null>(null);

  // Camera navigation state
  const [is3D, setIs3D] = useState(true);
  const targetCamPos = useRef(new THREE.Vector3(0, 160, 180));
  const targetLookAt = useRef(new THREE.Vector3(0, 55, 35));
  const currentLookAt = useRef(new THREE.Vector3(0, 55, 35));

  // Mouse interaction state
  const isDragging = useRef(false);
  const dragButton = useRef(0); // 0 = left (rotate), 2 = right (pan)
  const lastMousePos = useRef({ x: 0, y: 0 });
  const cameraSpherical = useRef({ radius: 210, theta: 0, phi: 0.9 });

  // Simulation playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [simulationTimeHours, setSimulationTimeHours] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);

  const maxTimeHours = scenario.simulationDuration || 24;

  // Sync simulation progress when "Run Simulation" is triggered from sidebar
  useEffect(() => {
    if (simulationStatus === 'running' || simulationStatus === 'completed') {
      const targetTime = (simProgress / 100) * maxTimeHours;
      setSimulationTimeHours(targetTime);
      if (simulationStatus === 'running' && !isPlaying) {
        setIsPlaying(true);
      }
    }
  }, [simulationStatus, simProgress, maxTimeHours]);

  // Update 3D flood mesh whenever simulationTimeHours or activeMetric changes
  useEffect(() => {
    if (handlesRef.current) {
      const progress = Math.min(1.0, Math.max(0.0, simulationTimeHours / maxTimeHours));
      handlesRef.current.updateFlood(progress, activeMetric);
    }
  }, [simulationTimeHours, maxTimeHours, activeMetric]);

  // Sync layer toggles
  useEffect(() => {
    if (handlesRef.current) {
      handlesRef.current.updateLayers(layers);
    }
  }, [layers]);

  // Sync scenario inputs
  useEffect(() => {
    if (handlesRef.current) {
      handlesRef.current.updateScenario(scenario);
    }
  }, [scenario]);

  // Sync settings
  useEffect(() => {
    if (handlesRef.current) {
      handlesRef.current.updateSettings(settings);
    }
  }, [settings]);

  // Sync layer adjustments
  useEffect(() => {
    if (handlesRef.current) {
      handlesRef.current.updateAdjustments(adjustments);
    }
  }, [adjustments]);

  // Sync edited geographic locations / facilities
  useEffect(() => {
    if (handlesRef.current) {
      handlesRef.current.updateLocations(locations);
    }
  }, [locations]);

  // Handle 2D / 3D Mode Toggle
  const handleToggle2D3D = () => {
    const nextIs3D = !is3D;
    setIs3D(nextIs3D);

    if (nextIs3D) {
      // Transition to 3D perspective
      targetLookAt.current.set(0, 55, 35);
      cameraSpherical.current = { radius: 210, theta: 0, phi: 0.9 };
    } else {
      // Transition to 2D Plan View (Top down)
      targetLookAt.current.set(0, 45, 50);
      cameraSpherical.current = { radius: 260, theta: 0, phi: 0.05 };
    }
  };

  // Camera Zoom Controls
  const handleZoomIn = () => {
    cameraSpherical.current.radius = Math.max(50, cameraSpherical.current.radius - 35);
  };

  const handleZoomOut = () => {
    cameraSpherical.current.radius = Math.min(420, cameraSpherical.current.radius + 35);
  };

  // Reset Camera to Default North View
  const handleResetCamera = () => {
    if (is3D) {
      targetLookAt.current.set(0, 55, 35);
      cameraSpherical.current = { radius: 210, theta: 0, phi: 0.9 };
    } else {
      targetLookAt.current.set(0, 45, 50);
      cameraSpherical.current = { radius: 260, theta: 0, phi: 0.05 };
    }
  };

  // Focus directly on Dam Structure
  const handleFocusDam = () => {
    targetLookAt.current.set(0, 110, -55);
    cameraSpherical.current = { radius: 100, theta: 0.2, phi: 1.1 };
  };

  // Focus on Advancing Wave Front
  const handleFocusWaveFront = () => {
    const progress = simulationTimeHours / maxTimeHours;
    const frontZ = -55 + progress * 230;
    targetLookAt.current.set(0, 52, frontZ);
    cameraSpherical.current = { radius: 130, theta: 0.1, phi: 0.95 };
  };

  // Playback loop
  useEffect(() => {
    if (!isPlaying) return;

    let lastTime = performance.now();
    const interval = setInterval(() => {
      const now = performance.now();
      const deltaSec = (now - lastTime) / 1000;
      lastTime = now;

      setSimulationTimeHours((prev) => {
        const next = prev + deltaSec * 0.45 * playbackSpeed;
        if (next >= maxTimeHours) {
          setIsPlaying(false);
          return maxTimeHours;
        }
        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, maxTimeHours]);

  // Initialize Three.js WebGL Scene
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080c14);
    scene.fog = new THREE.FogExp2(0x080c14, 0.0022);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(48, width / height, 1, 1200);
    camera.position.set(0, 160, 180);
    cameraRef.current = camera;

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    rendererRef.current = renderer;

    // Build scene geometries
    const handles = buildSimulationScene(
      scene,
      scenario,
      layers,
      settings,
      adjustments,
      locations
    );
    handlesRef.current = handles;

    // Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        if (w > 0 && h > 0 && cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = w / h;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    // Animation Render Loop
    let animationFrameId: number;
    const renderLoop = (time: number) => {
      animationFrameId = requestAnimationFrame(renderLoop);

      // Compute camera position from spherical coordinates relative to lookAt target
      const s = cameraSpherical.current;
      const x = s.radius * Math.sin(s.phi) * Math.sin(s.theta);
      const y = s.radius * Math.cos(s.phi);
      const z = s.radius * Math.sin(s.phi) * Math.cos(s.theta);

      targetCamPos.current.set(
        targetLookAt.current.x + x,
        Math.max(30, targetLookAt.current.y + y),
        targetLookAt.current.z + z
      );

      // Smooth camera interpolation
      camera.position.lerp(targetCamPos.current, 0.1);
      currentLookAt.current.lerp(targetLookAt.current, 0.1);
      camera.lookAt(currentLookAt.current);

      // Animate particles & markers
      handles.animate(time);

      renderer.render(scene, camera);
    };
    renderLoop(0);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, []);

  // Mouse & Touch Interaction Handlers (Orbit, Pan, Zoom)
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragButton.current = e.button;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;

    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    lastMousePos.current = { x: e.clientX, y: e.clientY };

    if (dragButton.current === 0) {
      // Left click: Orbit / Rotate
      cameraSpherical.current.theta -= dx * 0.006;
      cameraSpherical.current.phi = Math.max(
        0.05,
        Math.min(Math.PI / 2 - 0.05, cameraSpherical.current.phi - dy * 0.006)
      );
    } else if (dragButton.current === 2 || dragButton.current === 1) {
      // Right/Middle click: Pan
      const panSpeed = cameraSpherical.current.radius * 0.0018;
      const cosTheta = Math.cos(cameraSpherical.current.theta);
      const sinTheta = Math.sin(cameraSpherical.current.theta);

      targetLookAt.current.x -= (dx * cosTheta + dy * sinTheta) * panSpeed;
      targetLookAt.current.z += (dx * sinTheta - dy * cosTheta) * panSpeed;
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    cameraSpherical.current.radius = Math.max(
      45,
      Math.min(420, cameraSpherical.current.radius + e.deltaY * 0.15)
    );
  };

  // Click on Canvas: Raycast for POIs
  const handleClick = (e: React.MouseEvent) => {
    if (!canvasRef.current || !cameraRef.current || !sceneRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

    const markersGroup = sceneRef.current.getObjectByName('markers-group');
    if (markersGroup) {
      const intersects = raycaster.intersectObjects(markersGroup.children, true);
      if (intersects.length > 0) {
        let current: THREE.Object3D | null = intersects[0].object;
        while (current && !current.userData.poi && current.parent) {
          current = current.parent;
        }
        if (current && current.userData.poi) {
          const poi = current.userData.poi as POI;
          setSelectedPOI(poi);
          const matched = locations.find((l) => l.id === poi.id) || (poi as LocationItem);
          onSelectLocation?.(matched);
          return;
        }
      }
    }
  };

  return (
    <div
      ref={containerRef}
      id="simulation-3d-viewport"
      className="relative flex-1 h-full w-full overflow-hidden select-none bg-[#080c14] cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onClick={handleClick}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* 3D WebGL Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Floating HUD & Map Controls Overlay */}
      <MapOverlayControls
        is3D={is3D}
        onToggle2D3D={handleToggle2D3D}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetCamera={handleResetCamera}
        onFocusDam={handleFocusDam}
        onFocusWaveFront={handleFocusWaveFront}
        simulationTimeHours={simulationTimeHours}
        maxTimeHours={maxTimeHours}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying((p) => !p)}
        onSeekTime={(t) => {
          setSimulationTimeHours(t);
        }}
        playbackSpeed={playbackSpeed}
        onChangeSpeed={setPlaybackSpeed}
        selectedPOI={selectedPOI}
        onClosePOI={() => setSelectedPOI(null)}
        onEditPOI={(poi) => {
          const matched = locations.find((l) => l.id === poi.id) || (poi as LocationItem);
          onEditLocation?.(matched);
        }}
        scenario={scenario}
        activeMetric={activeMetric}
      />
    </div>
  );
};
