import React, { useState } from 'react';
import {
  Mountain,
  Waves,
  Wind,
  Clock,
  Route,
  Home,
  ShieldAlert,
  Droplets,
  Building2,
  Sliders,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Layers,
  Check,
  Edit3,
  SlidersHorizontal,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { MapLayerItem, LayerAdjustments, LocationItem } from '../../types/navigation';

interface LayersPanelProps {
  layers: MapLayerItem[];
  adjustments: LayerAdjustments;
  locations: LocationItem[];
  onToggleLayer: (id: string) => void;
  onChangeOpacity: (id: string, opacity: number) => void;
  onUpdateAdjustments: (updated: Partial<LayerAdjustments>) => void;
  onSelectLocationForEdit: (location: LocationItem) => void;
  onToggleAll: (enable: boolean) => void;
}

const LAYER_ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  terrain: Mountain,
  'flood-depth': Waves,
  velocity: Wind,
  'arrival-time': Clock,
  roads: Route,
  settlements: Home,
  'critical-infra': ShieldAlert,
  river: Droplets,
  dam: Building2,
};

export const LayersPanel: React.FC<LayersPanelProps> = ({
  layers,
  adjustments,
  locations,
  onToggleLayer,
  onChangeOpacity,
  onUpdateAdjustments,
  onSelectLocationForEdit,
  onToggleAll,
}) => {
  // Currently expanded layer for detailed adjustments
  const [expandedLayerId, setExpandedLayerId] = useState<string | null>('roads');

  const activeCount = layers.filter((l) => l.enabled).length;

  const toggleLayerExpanded = (layerId: string) => {
    setExpandedLayerId((prev) => (prev === layerId ? null : layerId));
  };

  return (
    <div id="subpanel-layers" className="flex flex-col h-full bg-[#0d131f] select-none">
      {/* Header */}
      <div className="p-3.5 border-b border-[#1e293b] flex items-center justify-between shrink-0 bg-[#0a0f18]/80 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-semibold tracking-wider text-slate-100 uppercase">
              Map Layers & Styles
            </h2>
            <span className="px-1.5 py-0.5 text-[8.5px] font-mono rounded bg-slate-800 text-cyan-300 border border-slate-700">
              {activeCount}/{layers.length} ON
            </span>
          </div>
          <p className="text-[10.5px] text-slate-400 mt-0.5">
            Click any layer to customize visibility, styling, and filters
          </p>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="px-3 py-1.5 bg-[#090d16] border-b border-[#1a2333] flex items-center justify-between text-[9.5px] font-mono">
        <span className="text-slate-400 tracking-wider">ALL LAYERS</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="btn-enable-all-layers"
            onClick={() => onToggleAll(true)}
            className="text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
          >
            Show All
          </button>
          <span className="text-slate-600">•</span>
          <button
            type="button"
            id="btn-disable-all-layers"
            onClick={() => onToggleAll(false)}
            className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            Hide All
          </button>
        </div>
      </div>

      {/* Layer List */}
      <div className="flex-1 overflow-y-auto px-2.5 py-2.5 space-y-2 text-xs">
        {layers.map((layer) => {
          const IconComponent = LAYER_ICONS[layer.id] || Layers;
          const isExpanded = expandedLayerId === layer.id;

          return (
            <div
              key={layer.id}
              id={`layer-card-${layer.id}`}
              className={`rounded border transition-all duration-150 ${
                layer.enabled
                  ? 'bg-[#111827] border-[#1e293b]'
                  : 'bg-[#090d15]/80 border-[#161f2e] opacity-75'
              }`}
            >
              {/* Row Header (Clicking anywhere opens adjustment options) */}
              <div
                className="p-2 flex items-center justify-between gap-2 cursor-pointer hover:bg-slate-800/40 transition-colors"
                onClick={() => toggleLayerExpanded(layer.id)}
              >
                {/* Icon and Name */}
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div
                    className={`w-6 h-6 rounded flex items-center justify-center shrink-0 border ${
                      layer.enabled
                        ? 'bg-slate-800/80 border-slate-700 text-slate-200'
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                    style={{
                      borderColor: layer.enabled ? `${layer.color}40` : undefined,
                    }}
                  >
                    <IconComponent
                      className="w-3.5 h-3.5"
                      style={{ color: layer.enabled ? layer.color : '#64748b' }}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-xs font-medium truncate ${
                          layer.enabled ? 'text-slate-200' : 'text-slate-400'
                        }`}
                      >
                        {layer.name}
                      </span>
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{
                          backgroundColor: layer.color,
                          boxShadow: layer.enabled ? `0 0 5px ${layer.color}80` : 'none',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Right controls: opacity badge, tune chevron, and toggle */}
                <div
                  className="flex items-center gap-1.5 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-[9px] font-mono text-slate-400 w-7 text-right">
                    {layer.opacity}%
                  </span>

                  {/* Tune options toggle chevron */}
                  <button
                    type="button"
                    title={isExpanded ? 'Collapse options' : 'Adjust layer properties'}
                    onClick={() => toggleLayerExpanded(layer.id)}
                    className={`p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors cursor-pointer ${
                      isExpanded ? 'bg-cyan-950/60 text-cyan-300' : ''
                    }`}
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5" />
                    ) : (
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* Visibility On/Off switch */}
                  <button
                    type="button"
                    id={`toggle-layer-${layer.id}`}
                    title={layer.enabled ? 'Hide Layer' : 'Show Layer'}
                    onClick={() => onToggleLayer(layer.id)}
                    className={`relative w-8 h-4 rounded-full transition-colors cursor-pointer flex items-center p-0.5 ${
                      layer.enabled ? 'bg-cyan-600' : 'bg-slate-800 border border-slate-700'
                    }`}
                  >
                    <span
                      className={`w-3 h-3 rounded-full bg-white transition-transform ${
                        layer.enabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Expanded Layer Adjustment Options */}
              {isExpanded && (
                <div className="px-3 pb-3 pt-1 border-t border-[#1e293b]/70 bg-[#0a0f19]/90 space-y-2.5">
                  {/* Common: Opacity Slider */}
                  <div>
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-1">
                      <span>LAYER OPACITY</span>
                      <span className="text-cyan-400 font-semibold">{layer.opacity}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      step={5}
                      value={layer.opacity}
                      onChange={(e) =>
                        onChangeOpacity(layer.id, parseInt(e.target.value, 10))
                      }
                      className="w-full accent-cyan-400 h-1 bg-slate-800 rounded cursor-pointer"
                    />
                  </div>

                  {/* ================= ROADS ADJUSTMENTS ================= */}
                  {layer.id === 'roads' && (
                    <div className="space-y-2.5 pt-1">
                      {/* Road Category / Importance */}
                      <div>
                        <div className="text-[10px] font-mono text-slate-400 mb-1">
                          CATEGORY FILTER
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-[10.5px]">
                          {[
                            { id: 'all', label: 'All Roads' },
                            { id: 'arterials', label: 'Hwy 101 Arterial' },
                            { id: 'evacuation', label: 'Evacuation Routes' },
                            { id: 'local', label: 'Local Streets' },
                          ].map((cat) => (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() =>
                                onUpdateAdjustments({
                                  roadsCategory: cat.id as any,
                                })
                              }
                              className={`px-2 py-1 rounded border text-left truncate transition-colors cursor-pointer ${
                                adjustments.roadsCategory === cat.id
                                  ? 'bg-cyan-950/80 text-cyan-200 border-cyan-500 font-semibold'
                                  : 'bg-[#0e1422] text-slate-400 border-slate-800 hover:text-slate-200'
                              }`}
                            >
                              {cat.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Road Appearance */}
                      <div>
                        <div className="text-[10px] font-mono text-slate-400 mb-1">
                          APPEARANCE STYLE
                        </div>
                        <div className="grid grid-cols-3 gap-1 text-[10px]">
                          {[
                            { id: 'asphalt', label: 'Asphalt' },
                            { id: 'contrast', label: 'High-Contrast' },
                            { id: 'evacuation', label: 'Evac Corridor' },
                          ].map((app) => (
                            <button
                              key={app.id}
                              type="button"
                              onClick={() =>
                                onUpdateAdjustments({
                                  roadsAppearance: app.id as any,
                                })
                              }
                              className={`py-1 rounded border text-center transition-colors cursor-pointer ${
                                adjustments.roadsAppearance === app.id
                                  ? 'bg-amber-950/80 text-amber-200 border-amber-500 font-semibold'
                                  : 'bg-[#0e1422] text-slate-400 border-slate-800 hover:text-slate-200'
                              }`}
                            >
                              {app.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Road Width */}
                      <div>
                        <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                          <span>WIDTH SCALE</span>
                          <span className="text-cyan-400 font-semibold">
                            {adjustments.roadsWidthScale}x
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0.8}
                          max={1.6}
                          step={0.1}
                          value={adjustments.roadsWidthScale}
                          onChange={(e) =>
                            onUpdateAdjustments({
                              roadsWidthScale: parseFloat(e.target.value),
                            })
                          }
                          className="w-full accent-cyan-400 h-1 bg-slate-800 rounded cursor-pointer"
                        />
                      </div>
                    </div>
                  )}

                  {/* ================= SETTLEMENTS ADJUSTMENTS ================= */}
                  {layer.id === 'settlements' && (
                    <div className="space-y-2.5 pt-1">
                      {/* Population Filter */}
                      <div>
                        <div className="text-[10px] font-mono text-slate-400 mb-1">
                          MIN POPULATION THRESHOLD
                        </div>
                        <div className="grid grid-cols-3 gap-1 text-[10px]">
                          {[
                            { val: 0, label: 'All Sizes' },
                            { val: 500, label: '> 500' },
                            { val: 2000, label: '> 2,000' },
                          ].map((p) => (
                            <button
                              key={p.val}
                              type="button"
                              onClick={() =>
                                onUpdateAdjustments({
                                  settlementsMinPop: p.val,
                                })
                              }
                              className={`py-1 rounded border text-center transition-colors cursor-pointer ${
                                adjustments.settlementsMinPop === p.val
                                  ? 'bg-cyan-950/80 text-cyan-200 border-cyan-500 font-semibold'
                                  : 'bg-[#0e1422] text-slate-400 border-slate-800 hover:text-slate-200'
                              }`}
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Footprint / Size Scale */}
                      <div>
                        <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                          <span>BUILDING SCALE</span>
                          <span className="text-cyan-400 font-semibold">
                            {adjustments.settlementsScale}x
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0.6}
                          max={1.4}
                          step={0.1}
                          value={adjustments.settlementsScale}
                          onChange={(e) =>
                            onUpdateAdjustments({
                              settlementsScale: parseFloat(e.target.value),
                            })
                          }
                          className="w-full accent-cyan-400 h-1 bg-slate-800 rounded cursor-pointer"
                        />
                      </div>

                      {/* Select & Edit Settlement Locations */}
                      <div className="pt-1 border-t border-slate-800/80">
                        <div className="text-[10px] font-mono text-slate-400 mb-1.5 flex items-center justify-between">
                          <span>SELECT & EDIT LOCATION</span>
                          <span className="text-cyan-400">Click to Edit</span>
                        </div>
                        <div className="space-y-1">
                          {locations
                            .filter((loc) => loc.category === 'settlement')
                            .map((loc) => (
                              <button
                                key={loc.id}
                                type="button"
                                onClick={() => onSelectLocationForEdit(loc)}
                                className="w-full px-2 py-1.5 rounded bg-[#0d1320] border border-slate-800 hover:border-cyan-500/60 hover:bg-slate-800/60 flex items-center justify-between transition-colors text-left group cursor-pointer"
                              >
                                <div className="truncate pr-2">
                                  <div className="text-[11px] font-medium text-slate-200 group-hover:text-cyan-300 truncate">
                                    {loc.name}
                                  </div>
                                  <div className="text-[9px] font-mono text-slate-400">
                                    Pop: {loc.population.toLocaleString()} • Risk: {loc.riskLevel}
                                  </div>
                                </div>
                                <Edit3 className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 shrink-0" />
                              </button>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ================= CRITICAL INFRASTRUCTURE ================= */}
                  {layer.id === 'critical-infra' && (
                    <div className="space-y-2.5 pt-1">
                      {/* Facility Type Filter */}
                      <div>
                        <div className="text-[10px] font-mono text-slate-400 mb-1">
                          FACILITY TYPES
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-[10px]">
                          {[
                            { id: 'hospital', label: 'Hospitals / Clinics' },
                            { id: 'power', label: 'Power & Hydro' },
                            { id: 'bridge', label: 'Bridges & Viaducts' },
                            { id: 'dam', label: 'Dam Structure' },
                          ].map((f) => {
                            const isChecked = adjustments.infraFilterTypes.includes(
                              f.id as any
                            );
                            return (
                              <button
                                key={f.id}
                                type="button"
                                onClick={() => {
                                  const cur = adjustments.infraFilterTypes;
                                  const updated = isChecked
                                    ? cur.filter((x) => x !== f.id)
                                    : [...cur, f.id as any];
                                  onUpdateAdjustments({
                                    infraFilterTypes: updated,
                                  });
                                }}
                                className={`px-2 py-1 rounded border text-left flex items-center justify-between transition-colors cursor-pointer ${
                                  isChecked
                                    ? 'bg-cyan-950/80 text-cyan-200 border-cyan-500 font-medium'
                                    : 'bg-[#0e1422] text-slate-500 border-slate-800'
                                }`}
                              >
                                <span className="truncate">{f.label}</span>
                                {isChecked && (
                                  <Check className="w-3 h-3 text-cyan-400 shrink-0 ml-1" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Select & Edit Infrastructure Facilities */}
                      <div className="pt-1 border-t border-slate-800/80">
                        <div className="text-[10px] font-mono text-slate-400 mb-1.5 flex items-center justify-between">
                          <span>SELECT & EDIT FACILITY</span>
                          <span className="text-cyan-400">Click to Edit</span>
                        </div>
                        <div className="space-y-1">
                          {locations
                            .filter((loc) => loc.category === 'infrastructure')
                            .map((loc) => (
                              <button
                                key={loc.id}
                                type="button"
                                onClick={() => onSelectLocationForEdit(loc)}
                                className="w-full px-2 py-1.5 rounded bg-[#0d1320] border border-slate-800 hover:border-amber-500/60 hover:bg-slate-800/60 flex items-center justify-between transition-colors text-left group cursor-pointer"
                              >
                                <div className="truncate pr-2">
                                  <div className="text-[11px] font-medium text-slate-200 group-hover:text-amber-300 truncate">
                                    {loc.name}
                                  </div>
                                  <div className="text-[9px] font-mono text-slate-400">
                                    {loc.type.toUpperCase()} • Arrival: {loc.arrivalMinutes}m
                                  </div>
                                </div>
                                <Edit3 className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 shrink-0" />
                              </button>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ================= RIVER ADJUSTMENTS ================= */}
                  {layer.id === 'river' && (
                    <div className="space-y-2.5 pt-1">
                      {/* Flow Speed */}
                      <div>
                        <div className="text-[10px] font-mono text-slate-400 mb-1">
                          FLOW VELOCITY
                        </div>
                        <div className="grid grid-cols-3 gap-1 text-[10px]">
                          {[
                            { id: 'calm', label: 'Calm' },
                            { id: 'moderate', label: 'Moderate' },
                            { id: 'rapid', label: 'Rapid' },
                          ].map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() =>
                                onUpdateAdjustments({
                                  riverFlowSpeed: s.id as any,
                                })
                              }
                              className={`py-1 rounded border text-center transition-colors cursor-pointer ${
                                adjustments.riverFlowSpeed === s.id
                                  ? 'bg-cyan-950/80 text-cyan-200 border-cyan-500 font-semibold'
                                  : 'bg-[#0e1422] text-slate-400 border-slate-800 hover:text-slate-200'
                              }`}
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Water Color Tone */}
                      <div>
                        <div className="text-[10px] font-mono text-slate-400 mb-1">
                          WATER TINT & DEPTH
                        </div>
                        <div className="grid grid-cols-3 gap-1 text-[10px]">
                          {[
                            { id: 'alpine', label: 'Alpine Blue' },
                            { id: 'glacial', label: 'Glacial Cyan' },
                            { id: 'sediment', label: 'Sediment Teal' },
                          ].map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() =>
                                onUpdateAdjustments({
                                  riverColorTone: t.id as any,
                                })
                              }
                              className={`py-1 rounded border text-center transition-colors cursor-pointer ${
                                adjustments.riverColorTone === t.id
                                  ? 'bg-sky-950/80 text-sky-200 border-sky-500 font-semibold'
                                  : 'bg-[#0e1422] text-slate-400 border-slate-800 hover:text-slate-200'
                              }`}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ================= TERRAIN ADJUSTMENTS ================= */}
                  {layer.id === 'terrain' && (
                    <div className="space-y-2.5 pt-1">
                      {/* Hillshade Intensity */}
                      <div>
                        <div className="text-[10px] font-mono text-slate-400 mb-1">
                          HILLSHADE CONTRAST
                        </div>
                        <div className="grid grid-cols-3 gap-1 text-[10px]">
                          {[
                            { id: 'soft', label: 'Soft Natural' },
                            { id: 'medium', label: 'Medium' },
                            { id: 'crisp', label: 'Crisp Topo' },
                          ].map((h) => (
                            <button
                              key={h.id}
                              type="button"
                              onClick={() =>
                                onUpdateAdjustments({
                                  terrainHillshade: h.id as any,
                                })
                              }
                              className={`py-1 rounded border text-center transition-colors cursor-pointer ${
                                adjustments.terrainHillshade === h.id
                                  ? 'bg-cyan-950/80 text-cyan-200 border-cyan-500 font-semibold'
                                  : 'bg-[#0e1422] text-slate-400 border-slate-800 hover:text-slate-200'
                              }`}
                            >
                              {h.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Contour Lines Interval */}
                      <div>
                        <div className="text-[10px] font-mono text-slate-400 mb-1">
                          ELEVATION CONTOURS
                        </div>
                        <div className="grid grid-cols-4 gap-1 text-[10px]">
                          {[
                            { id: 'none', label: 'Off' },
                            { id: '10m', label: '10m' },
                            { id: '25m', label: '25m' },
                            { id: '50m', label: '50m' },
                          ].map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() =>
                                onUpdateAdjustments({
                                  terrainContours: c.id as any,
                                })
                              }
                              className={`py-1 rounded border text-center transition-colors cursor-pointer ${
                                adjustments.terrainContours === c.id
                                  ? 'bg-slate-700 text-slate-100 border-slate-500 font-semibold'
                                  : 'bg-[#0e1422] text-slate-400 border-slate-800 hover:text-slate-200'
                              }`}
                            >
                              {c.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ================= FLOOD DEPTH / VELOCITY ================= */}
                  {(layer.id === 'flood-depth' ||
                    layer.id === 'velocity' ||
                    layer.id === 'arrival-time') && (
                    <div className="space-y-2.5 pt-1">
                      {/* Hazard Threshold */}
                      <div>
                        <div className="text-[10px] font-mono text-slate-400 mb-1">
                          DEPTH CUTOFF THRESHOLD
                        </div>
                        <div className="grid grid-cols-4 gap-1 text-[10px]">
                          {[
                            { val: 0.1, label: '> 0.1m' },
                            { val: 0.5, label: '> 0.5m' },
                            { val: 1.0, label: '> 1.0m' },
                            { val: 2.0, label: '> 2.0m' },
                          ].map((th) => (
                            <button
                              key={th.val}
                              type="button"
                              onClick={() =>
                                onUpdateAdjustments({
                                  floodMinDepth: th.val,
                                })
                              }
                              className={`py-1 rounded border text-center transition-colors cursor-pointer ${
                                adjustments.floodMinDepth === th.val
                                  ? 'bg-cyan-950/80 text-cyan-200 border-cyan-500 font-semibold'
                                  : 'bg-[#0e1422] text-slate-400 border-slate-800 hover:text-slate-200'
                              }`}
                            >
                              {th.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Color Ramp Scheme */}
                      <div>
                        <div className="text-[10px] font-mono text-slate-400 mb-1">
                          HAZARD COLORMAP
                        </div>
                        <div className="grid grid-cols-3 gap-1 text-[10px]">
                          {[
                            { id: 'hazard', label: 'Hydro Hazard' },
                            { id: 'spectral', label: 'Spectral' },
                            { id: 'depth', label: 'Pure Depth' },
                          ].map((cmap) => (
                            <button
                              key={cmap.id}
                              type="button"
                              onClick={() =>
                                onUpdateAdjustments({
                                  floodColormap: cmap.id as any,
                                })
                              }
                              className={`py-1 rounded border text-center transition-colors cursor-pointer ${
                                adjustments.floodColormap === cmap.id
                                  ? 'bg-cyan-950/80 text-cyan-200 border-cyan-500 font-semibold'
                                  : 'bg-[#0e1422] text-slate-400 border-slate-800 hover:text-slate-200'
                              }`}
                            >
                              {cmap.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
