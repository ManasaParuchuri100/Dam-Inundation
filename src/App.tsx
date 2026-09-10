import React, { useState, useEffect, useRef } from 'react';
import {
  NavTabId,
  ScenarioData,
  MapLayerItem,
  AnalyticsMetric,
  AppSettings,
  LayerAdjustments,
  LocationItem,
} from './types/navigation';
import {
  DEFAULT_SCENARIO,
  INITIAL_MAP_LAYERS,
  INITIAL_SETTINGS,
  DEFAULT_LAYER_ADJUSTMENTS,
  INITIAL_LOCATIONS,
} from './data/defaults';
import { MainRail } from './components/MainRail';
import { ScenarioPanel } from './components/subpanels/ScenarioPanel';
import { AnalyticsPanel } from './components/subpanels/AnalyticsPanel';
import { LayersPanel } from './components/subpanels/LayersPanel';
import { ReportPanel } from './components/subpanels/ReportPanel';
import { SettingsPanel } from './components/subpanels/SettingsPanel';
import { Simulation3DCanvas } from './components/gis3d/Simulation3DCanvas';
import { LocationPropertyModal } from './components/modals/LocationPropertyModal';

export default function App() {
  // Navigation State - Scenario tab is open by default as requested
  const [activeTab, setActiveTab] = useState<NavTabId>('scenario');
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(true);

  // Scenario Model State
  const [scenario, setScenario] = useState<ScenarioData>(DEFAULT_SCENARIO);

  // Map Layers State
  const [layers, setLayers] = useState<MapLayerItem[]>(INITIAL_MAP_LAYERS);

  // Layer granular adjustments (Roads, settlements, river, terrain, flood)
  const [adjustments, setAdjustments] = useState<LayerAdjustments>(DEFAULT_LAYER_ADJUSTMENTS);

  // Settlements & Infrastructure geographic locations
  const [locations, setLocations] = useState<LocationItem[]>(INITIAL_LOCATIONS);

  // Location Property Editor Modal State
  const [editingLocation, setEditingLocation] = useState<LocationItem | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Analytics Metric State
  const [selectedMetric, setSelectedMetric] = useState<AnalyticsMetric>('overview');

  // Application Settings State
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);

  // Simulation Execution State
  const [simulationStatus, setSimulationStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const [simProgress, setSimProgress] = useState<number>(0);
  const simIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Handle Tab Click Interaction
  const handleSelectTab = (tab: NavTabId) => {
    if (activeTab === tab) {
      // Clicking the currently active tab toggles/collapses the sub-panel
      setIsPanelOpen((prev) => !prev);
    } else {
      // Clicking a different tab selects it and ensures the sub-panel is open
      setActiveTab(tab);
      setIsPanelOpen(true);
    }
  };

  // Toggle Sub-Panel via arrow button
  const handleTogglePanel = () => {
    setIsPanelOpen((prev) => !prev);
  };

  // Scenario Update Handlers
  const handleScenarioChange = (updated: Partial<ScenarioData>) => {
    setScenario((prev) => ({ ...prev, ...updated }));
  };

  const handleResetScenario = () => {
    setScenario({ ...DEFAULT_SCENARIO });
    setSimulationStatus('idle');
    setSimProgress(0);
  };

  // Run Simulation Handler with realistic hydrodynamic progress stages
  const handleRunSimulation = () => {
    if (simulationStatus === 'running') return;

    setSimulationStatus('running');
    setSimProgress(0);

    let progress = 0;
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
    }

    simIntervalRef.current = setInterval(() => {
      progress += Math.floor(Math.random() * 8) + 5;
      if (progress >= 100) {
        progress = 100;
        setSimProgress(100);
        setSimulationStatus('completed');
        if (simIntervalRef.current) {
          clearInterval(simIntervalRef.current);
        }
      } else {
        setSimProgress(progress);
      }
    }, 180);
  };

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current);
      }
    };
  }, []);

  // Layer Update Handlers
  const handleToggleLayer = (id: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, enabled: !l.enabled } : l))
    );
  };

  const handleChangeLayerOpacity = (id: string, opacity: number) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, opacity } : l))
    );
  };

  const handleToggleAllLayers = (enable: boolean) => {
    setLayers((prev) => prev.map((l) => ({ ...l, enabled: enable })));
  };

  // Adjustments & Location editing handlers
  const handleUpdateAdjustments = (updated: Partial<LayerAdjustments>) => {
    setAdjustments((prev) => ({ ...prev, ...updated }));
  };

  const handleOpenEditLocation = (location: LocationItem) => {
    setEditingLocation(location);
    setIsLocationModalOpen(true);
  };

  const handleSaveLocation = (updated: LocationItem) => {
    setLocations((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
  };

  const handleResetLocation = (id: string) => {
    const original = INITIAL_LOCATIONS.find((l) => l.id === id);
    if (original) {
      setLocations((prev) =>
        prev.map((l) => (l.id === id ? { ...original } : l))
      );
      setEditingLocation({ ...original });
    }
  };

  // Settings Update Handlers
  const handleSettingsChange = (updated: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updated }));
  };

  const handleResetApp = () => {
    setScenario({ ...DEFAULT_SCENARIO });
    setLayers([...INITIAL_MAP_LAYERS]);
    setAdjustments({ ...DEFAULT_LAYER_ADJUSTMENTS });
    setLocations([...INITIAL_LOCATIONS]);
    setSettings({ ...INITIAL_SETTINGS });
    setSelectedMetric('overview');
    setSimulationStatus('idle');
    setSimProgress(0);
  };

  return (
    <div className="flex h-screen w-screen bg-[#070b12] text-slate-200 overflow-hidden font-sans select-none">
      {/* 1. Main Navigation Rail (Far left, fixed narrow width 60px) */}
      <MainRail
        activeTab={activeTab}
        isOpen={isPanelOpen}
        onSelectTab={handleSelectTab}
        onTogglePanel={handleTogglePanel}
        simulationStatus={simulationStatus}
        simProgress={simProgress}
      />

      {/* 2. Sub-Navigation Panel (Immediately beside rail, smoothly expandable, compact width) */}
      <div
        id="sub-navigation-container"
        className={`transition-all duration-300 ease-in-out overflow-hidden shrink-0 border-r border-[#1e293b] flex flex-col z-20 bg-[#0d131f] ${
          isPanelOpen ? 'w-[300px] sm:w-[320px]' : 'w-0 border-r-0'
        }`}
      >
        {/* Inner container with fixed width to prevent content reflow during animation */}
        <div className="w-[300px] sm:w-[320px] h-full flex flex-col overflow-hidden">
          {activeTab === 'scenario' && (
            <ScenarioPanel
              scenario={scenario}
              onChange={handleScenarioChange}
              onReset={handleResetScenario}
              onRunSimulation={handleRunSimulation}
              simulationStatus={simulationStatus}
              simProgress={simProgress}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsPanel
              selectedMetric={selectedMetric}
              onSelectMetric={setSelectedMetric}
              simulationStatus={simulationStatus}
            />
          )}

          {activeTab === 'layers' && (
            <LayersPanel
              layers={layers}
              adjustments={adjustments}
              locations={locations}
              onToggleLayer={handleToggleLayer}
              onChangeOpacity={handleChangeLayerOpacity}
              onUpdateAdjustments={handleUpdateAdjustments}
              onSelectLocationForEdit={handleOpenEditLocation}
              onToggleAll={handleToggleAllLayers}
            />
          )}

          {activeTab === 'report' && (
            <ReportPanel
              scenario={scenario}
              simulationStatus={simulationStatus}
              locations={locations}
              settings={settings}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPanel
              settings={settings}
              onChange={handleSettingsChange}
              onResetApp={handleResetApp}
            />
          )}
        </div>
      </div>

      {/* 3. Main 3D GIS Visualization Viewport (The main focus of the application) */}
      <Simulation3DCanvas
        scenario={scenario}
        layers={layers}
        activeMetric={selectedMetric}
        settings={settings}
        simulationStatus={simulationStatus}
        simProgress={simProgress}
        adjustments={adjustments}
        locations={locations}
        onSelectLocation={(loc) => {
          // Optional: also highlight or prepare location
        }}
        onEditLocation={handleOpenEditLocation}
      />

      {/* 4. Location Property Editor Modal */}
      <LocationPropertyModal
        location={editingLocation}
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSave={handleSaveLocation}
        onReset={handleResetLocation}
      />
    </div>
  );
}

