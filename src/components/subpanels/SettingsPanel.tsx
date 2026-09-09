import React, { useState } from 'react';
import {
  Settings,
  Map,
  Eye,
  Sliders,
  Scale,
  RotateCcw,
  Check,
  CheckCircle2,
  Cpu,
  Globe,
  SlidersHorizontal,
  AlertCircle,
} from 'lucide-react';
import { AppSettings } from '../../types/navigation';

interface SettingsPanelProps {
  settings: AppSettings;
  onChange: (updated: Partial<AppSettings>) => void;
  onResetApp: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onChange,
  onResetApp,
}) => {
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const triggerReset = () => {
    onResetApp();
    setConfirmResetOpen(false);
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 2500);
  };

  return (
    <div id="subpanel-settings" className="flex flex-col h-full bg-[#0d131f]">
      {/* Header */}
      <div className="p-4 border-b border-[#1e293b] flex items-center justify-between shrink-0 bg-[#0a0f18]/80 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold tracking-wide text-slate-100 uppercase">
              Settings
            </h2>
            <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-slate-800 text-slate-300 border border-slate-700 uppercase">
              Environment
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Configure map basemaps, rendering engine, and unit conventions
          </p>
        </div>

        {resetSuccess && (
          <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800 animate-fade-in">
            <Check className="w-3 h-3" /> Reset Complete
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-4 text-xs text-slate-300">
        {/* Map Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-1.5">
              <Map className="w-3 h-3" />
              Map Basemap & Terrain
            </span>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">
              Basemap Style
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'dark-slate', label: 'Dark Slate GIS' },
                { id: 'satellite', label: 'High-Res Satellite' },
                { id: 'topo', label: 'USGS Topographic' },
                { id: 'vector', label: 'Minimalist Vector' },
              ].map((style) => (
                <button
                  key={style.id}
                  type="button"
                  id={`map-style-${style.id}`}
                  onClick={() => onChange({ mapStyle: style.id as any })}
                  className={`p-2 rounded text-left border text-[11px] transition-colors ${
                    settings.mapStyle === style.id
                      ? 'bg-cyan-950 border-cyan-500 text-cyan-200'
                      : 'bg-[#111827] border-[#1e293b] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <label className="flex items-center justify-between p-2 rounded bg-[#111827] border border-[#1e293b] cursor-pointer">
              <span className="text-[11px] text-slate-300">Geographic Labels</span>
              <input
                id="toggle-map-labels"
                type="checkbox"
                checked={settings.showLabels}
                onChange={(e) => onChange({ showLabels: e.target.checked })}
                className="accent-cyan-500 w-4 h-4 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded bg-[#111827] border border-[#1e293b] cursor-pointer">
              <span className="text-[11px] text-slate-300">Terrain Hillshade & Slope</span>
              <input
                id="toggle-terrain-visibility"
                type="checkbox"
                checked={settings.terrainVisibility}
                onChange={(e) => onChange({ terrainVisibility: e.target.checked })}
                className="accent-cyan-500 w-4 h-4 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Visualization Section */}
        <div className="space-y-3 pt-2 border-t border-[#1a2333]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-1.5">
              <Sliders className="w-3 h-3" />
              Visualization Engine
            </span>
          </div>

          {/* Animation Speed */}
          <div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span>Playback / Simulation Speed</span>
              <span className="font-mono text-cyan-300">{settings.animationSpeed}x</span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {[0.5, 1.0, 2.0, 5.0].map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => onChange({ animationSpeed: spd })}
                  className={`py-1 rounded text-[10px] font-mono border ${
                    settings.animationSpeed === spd
                      ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                      : 'bg-[#111827] border-[#1e293b] text-slate-400'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          {/* Water Opacity */}
          <div className="space-y-1.5 bg-[#111827] p-2.5 rounded border border-[#1e293b]">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-300">Water Surface Opacity</span>
              <span className="font-mono text-cyan-300">{settings.waterOpacity}%</span>
            </div>
            <input
              id="slider-water-opacity"
              type="range"
              min="20"
              max="100"
              step="5"
              value={settings.waterOpacity}
              onChange={(e) => onChange({ waterOpacity: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
            />
          </div>

          {/* Quality */}
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">
              Visualization Fidelity
            </label>
            <div className="grid grid-cols-3 gap-1">
              {[
                { id: 'performance', label: 'Speed (30fps)' },
                { id: 'balanced', label: 'Balanced' },
                { id: 'ultra', label: 'Ultra (60fps)' },
              ].map((q) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => onChange({ visualizationQuality: q.id as any })}
                  className={`py-1.5 rounded text-[10px] border font-medium ${
                    settings.visualizationQuality === q.id
                      ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                      : 'bg-[#111827] border-[#1e293b] text-slate-400'
                  }`}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Units Section */}
        <div className="space-y-2.5 pt-2 border-t border-[#1a2333]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-1.5">
              <Scale className="w-3 h-3" />
              Measurement Units
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              id="unit-metric"
              onClick={() => onChange({ unitSystem: 'metric' })}
              className={`p-2.5 rounded border text-left flex flex-col ${
                settings.unitSystem === 'metric'
                  ? 'bg-cyan-950 border-cyan-500 text-cyan-200'
                  : 'bg-[#111827] border-[#1e293b] text-slate-400'
              }`}
            >
              <span className="font-semibold text-xs">Metric (SI)</span>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                m, m³/s, km/h, km²
              </span>
            </button>

            <button
              type="button"
              id="unit-imperial"
              onClick={() => onChange({ unitSystem: 'imperial' })}
              className={`p-2.5 rounded border text-left flex flex-col ${
                settings.unitSystem === 'imperial'
                  ? 'bg-cyan-950 border-cyan-500 text-cyan-200'
                  : 'bg-[#111827] border-[#1e293b] text-slate-400'
              }`}
            >
              <span className="font-semibold text-xs">Imperial (US)</span>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                ft, cfs (ft³/s), mph, sq mi
              </span>
            </button>
          </div>
        </div>

        {/* Application Preferences Section */}
        <div className="space-y-2.5 pt-2 border-t border-[#1a2333]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-1.5">
              <Cpu className="w-3 h-3" />
              Application Preferences
            </span>
          </div>

          <div className="space-y-2">
            <label className="flex items-center justify-between p-2 rounded bg-[#111827] border border-[#1e293b] cursor-pointer">
              <span className="text-[11px] text-slate-300">Auto-save scenario adjustments</span>
              <input
                type="checkbox"
                checked={settings.autoSave}
                onChange={(e) => onChange({ autoSave: e.target.checked })}
                className="accent-cyan-500 w-4 h-4 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded bg-[#111827] border border-[#1e293b] cursor-pointer">
              <span className="text-[11px] text-slate-300">High-Contrast GIS mode</span>
              <input
                type="checkbox"
                checked={settings.highContrast}
                onChange={(e) => onChange({ highContrast: e.target.checked })}
                className="accent-cyan-500 w-4 h-4 cursor-pointer"
              />
            </label>

            <div className="p-2 rounded bg-[#090d16] border border-[#1a2333] text-[10px] font-mono text-slate-400 flex justify-between items-center">
              <span>Coordinate Reference System</span>
              <span className="text-slate-300">EPSG:32612</span>
            </div>
          </div>
        </div>

        {/* Reset Application Section */}
        <div className="pt-2 border-t border-[#1a2333]">
          {confirmResetOpen ? (
            <div className="bg-red-950/40 border border-red-800/80 p-3 rounded space-y-2">
              <div className="flex items-center gap-1.5 text-red-300 font-semibold text-[11px]">
                <AlertCircle className="w-3.5 h-3.5" />
                Reset entire workstation to factory defaults?
              </div>
              <p className="text-[10px] text-red-200/80 leading-relaxed">
                All custom scenario modifications, layer visibilities, and display settings will be restored.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  id="btn-confirm-reset-app"
                  onClick={triggerReset}
                  className="flex-1 py-1.5 px-2.5 rounded bg-red-600 hover:bg-red-500 text-white font-medium text-[11px] cursor-pointer"
                >
                  Yes, Reset Everything
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmResetOpen(false)}
                  className="py-1.5 px-2.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 text-[11px] cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              id="btn-open-reset-app-confirm"
              type="button"
              onClick={() => setConfirmResetOpen(true)}
              className="w-full py-2 px-3 rounded text-[11px] text-red-400/90 hover:text-red-300 hover:bg-red-950/30 border border-red-900/40 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Application Preferences</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
