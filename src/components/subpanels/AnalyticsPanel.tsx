import React, { useState } from 'react';
import {
  BarChart3,
  Waves,
  Wind,
  Clock,
  Map,
  LineChart,
  Activity,
  Check,
  Filter,
  Info,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { AnalyticsMetric } from '../../types/navigation';

interface AnalyticsPanelProps {
  selectedMetric: AnalyticsMetric;
  onSelectMetric: (metric: AnalyticsMetric) => void;
  simulationStatus: 'idle' | 'running' | 'completed';
}

interface MetricItem {
  id: AnalyticsMetric;
  label: string;
  tag: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  highlightValue: string;
}

const METRIC_ITEMS: MetricItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    tag: 'KPIs',
    icon: Activity,
    description: 'Overall hydro-hazard indicators, peak flow rates & envelope stats',
    highlightValue: 'Peak: 18,450 m³/s',
  },
  {
    id: 'depth',
    label: 'Flood Depth',
    tag: 'h_max',
    icon: Waves,
    description: 'Peak water depth grid with hazard severity categorization',
    highlightValue: 'Max: 14.2 m',
  },
  {
    id: 'velocity',
    label: 'Flow Velocity',
    tag: 'v_max',
    icon: Wind,
    description: 'Hydrodynamic vector flow field and hydrodynamic force (v × d)',
    highlightValue: 'Max: 16.8 m/s',
  },
  {
    id: 'arrival',
    label: 'Arrival Time',
    tag: 't_arr',
    icon: Clock,
    description: 'First wave arrival front and critical evacuation lead intervals',
    highlightValue: 'Lead: 48 min',
  },
  {
    id: 'inundation',
    label: 'Inundation Extent',
    tag: 'Polygon',
    icon: Map,
    description: 'Maximum dry/wet flood boundary vs regulatory floodplains',
    highlightValue: 'Area: 42.6 km²',
  },
  {
    id: 'timeseries',
    label: 'Time Series',
    tag: 'Gauge',
    icon: LineChart,
    description: 'Discrete hydrograph tracking points along river downstream reach',
    highlightValue: '4 Stations',
  },
];

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({
  selectedMetric,
  onSelectMetric,
  simulationStatus,
}) => {
  // Analytical sub-controls state
  const [depthThreshold, setDepthThreshold] = useState('all');
  const [velocityFilter, setVelocityFilter] = useState('all');
  const [selectedGauge, setSelectedGauge] = useState('G-01');
  const [colorRamp, setColorRamp] = useState('turbo');

  return (
    <div id="subpanel-analytics" className="flex flex-col h-full bg-[#0d131f]">
      {/* Header */}
      <div className="p-4 border-b border-[#1e293b] flex items-center justify-between shrink-0 bg-[#0a0f18]/80 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold tracking-wide text-slate-100 uppercase">
              Flood Analytics
            </h2>
            <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-blue-950 text-blue-300 border border-blue-800/60 uppercase">
              Post-Process
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Select hydraulic analytic metrics and inspection parameters
          </p>
        </div>
      </div>

      {/* Selectable Sub-Items List */}
      <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-4 text-xs text-slate-300">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Select Analytic Metric
            </span>
            <span className="text-[10px] font-mono text-cyan-400">
              {simulationStatus === 'completed' ? 'Dataset Ready' : 'Model Standby'}
            </span>
          </div>

          <div className="space-y-1.5">
            {METRIC_ITEMS.map((item) => {
              const Icon = item.icon;
              const isSelected = selectedMetric === item.id;

              return (
                <button
                  key={item.id}
                  id={`analytics-item-${item.id}`}
                  onClick={() => onSelectMetric(item.id)}
                  className={`w-full text-left p-2.5 rounded transition-all duration-150 border flex flex-col gap-1 cursor-pointer group ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500/60 shadow-sm shadow-cyan-950/40'
                      : 'bg-[#111827]/70 border-[#1e293b] hover:border-slate-600 hover:bg-slate-800/40 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded flex items-center justify-center ${
                          isSelected
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                            : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span
                        className={`font-medium ${
                          isSelected ? 'text-cyan-200 font-semibold' : 'text-slate-200'
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-slate-400">
                        {item.highlightValue}
                      </span>
                      {isSelected ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#06b6d4]" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400" />
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 pl-8 leading-relaxed">
                    {item.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Sub-Item Detail & Filter Controls */}
        <div className="pt-3 border-t border-[#1e293b] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400/90 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-sm bg-cyan-400" />
              Active Metric Configuration
            </span>
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              {selectedMetric}
            </span>
          </div>

          {selectedMetric === 'overview' && (
            <div className="bg-[#111827] p-3 rounded border border-[#1e293b] space-y-2.5">
              <div className="text-[11px] text-slate-300">
                Key Hydraulic Impact Indicators
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-[#0b0f17] p-2 rounded border border-[#1a2333]">
                  <div className="text-[10px] text-slate-400">Peak Breach Flow</div>
                  <div className="text-sm font-mono text-cyan-300 font-semibold mt-0.5">18,450 m³/s</div>
                </div>
                <div className="bg-[#0b0f17] p-2 rounded border border-[#1a2333]">
                  <div className="text-[10px] text-slate-400">Flood Inundation</div>
                  <div className="text-sm font-mono text-cyan-300 font-semibold mt-0.5">42.6 km²</div>
                </div>
                <div className="bg-[#0b0f17] p-2 rounded border border-[#1a2333]">
                  <div className="text-[10px] text-slate-400">Max River Depth</div>
                  <div className="text-sm font-mono text-cyan-300 font-semibold mt-0.5">14.2 m</div>
                </div>
                <div className="bg-[#0b0f17] p-2 rounded border border-[#1a2333]">
                  <div className="text-[10px] text-slate-400">Lead Time to Town</div>
                  <div className="text-sm font-mono text-amber-300 font-semibold mt-0.5">1h 12m</div>
                </div>
              </div>
            </div>
          )}

          {selectedMetric === 'depth' && (
            <div className="bg-[#111827] p-3 rounded border border-[#1e293b] space-y-3">
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">
                  Depth Classification Band
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: 'all', label: 'All Depths' },
                    { id: 'hazard', label: '> 1.0m (Hazard)' },
                    { id: 'extreme', label: '> 3.0m (Extreme)' },
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      type="button"
                      onClick={() => setDepthThreshold(btn.id)}
                      className={`py-1 px-1.5 rounded text-[10px] border font-medium ${
                        depthThreshold === btn.id
                          ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                          : 'bg-[#0b0f17] border-[#1e293b] text-slate-400'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Depth Palette Legend */}
              <div className="space-y-1">
                <div className="text-[10px] text-slate-400 flex justify-between">
                  <span>Depth Scale (m)</span>
                  <span className="font-mono">0.1m — 14.2m</span>
                </div>
                <div className="h-2 rounded bg-gradient-to-r from-sky-300 via-blue-600 via-amber-500 to-red-600" />
                <div className="flex justify-between text-[9px] font-mono text-slate-500">
                  <span>0m</span>
                  <span>2m</span>
                  <span>5m</span>
                  <span>10m+</span>
                </div>
              </div>
            </div>
          )}

          {selectedMetric === 'velocity' && (
            <div className="bg-[#111827] p-3 rounded border border-[#1e293b] space-y-3">
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">
                  Hydrodynamic Hazard Threshold (v × d)
                </label>
                <div className="space-y-1">
                  <label className="flex items-center gap-2 p-1.5 rounded bg-[#0b0f17] border border-[#1e293b] cursor-pointer">
                    <input type="checkbox" defaultChecked className="accent-cyan-500" />
                    <span className="text-[11px] text-slate-300">
                      v × d &gt; 0.6 m²/s (Vehicle Instability)
                    </span>
                  </label>
                  <label className="flex items-center gap-2 p-1.5 rounded bg-[#0b0f17] border border-[#1e293b] cursor-pointer">
                    <input type="checkbox" defaultChecked className="accent-cyan-500" />
                    <span className="text-[11px] text-slate-300">
                      v × d &gt; 1.5 m²/s (Structural Failure Risk)
                    </span>
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] text-slate-400 flex justify-between">
                  <span>Velocity Range</span>
                  <span className="font-mono">0.0 — 16.8 m/s</span>
                </div>
                <div className="h-2 rounded bg-gradient-to-r from-teal-400 via-cyan-500 to-indigo-600" />
              </div>
            </div>
          )}

          {selectedMetric === 'arrival' && (
            <div className="bg-[#111827] p-3 rounded border border-[#1e293b] space-y-2">
              <label className="text-[11px] text-slate-300 block">
                Isochrone Lead Time Intervals
              </label>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between p-1.5 bg-[#0b0f17] rounded border border-[#1e293b]">
                  <span className="text-slate-300">Dam Crest / Toe</span>
                  <span className="font-mono text-cyan-400">+4 min</span>
                </div>
                <div className="flex justify-between p-1.5 bg-[#0b0f17] rounded border border-[#1e293b]">
                  <span className="text-slate-300">Lower Valley Substation</span>
                  <span className="font-mono text-cyan-400">+34 min</span>
                </div>
                <div className="flex justify-between p-1.5 bg-[#0b0f17] rounded border border-[#1e293b]">
                  <span className="text-slate-300">Riverside Community</span>
                  <span className="font-mono text-amber-400">+1 hr 12 min</span>
                </div>
                <div className="flex justify-between p-1.5 bg-[#0b0f17] rounded border border-[#1e293b]">
                  <span className="text-slate-300">Highway 101 Crossing</span>
                  <span className="font-mono text-amber-400">+2 hr 45 min</span>
                </div>
              </div>
            </div>
          )}

          {selectedMetric === 'inundation' && (
            <div className="bg-[#111827] p-3 rounded border border-[#1e293b] space-y-2.5">
              <label className="text-[11px] text-slate-300 block">
                Comparison Overlay
              </label>
              <div className="space-y-1.5 text-[11px]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="inun-mode" defaultChecked className="accent-cyan-500" />
                  <span className="text-slate-300">Maximum Breached Envelope</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="inun-mode" className="accent-cyan-500" />
                  <span className="text-slate-300">Overlay 100-Year Regulatory FEMA Zone</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="inun-mode" className="accent-cyan-500" />
                  <span className="text-slate-300">Historic 1994 High-Water Mark</span>
                </label>
              </div>
            </div>
          )}

          {selectedMetric === 'timeseries' && (
            <div className="bg-[#111827] p-3 rounded border border-[#1e293b] space-y-2.5">
              <label className="text-[11px] text-slate-300 block">
                Hydrograph Gauge Stations
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'G-01', label: 'Dam Breach (G-01)' },
                  { id: 'G-02', label: 'Hydro Plant (G-02)' },
                  { id: 'G-03', label: 'Valley Bridge (G-03)' },
                  { id: 'G-04', label: 'Confluence (G-04)' },
                ].map((station) => (
                  <button
                    key={station.id}
                    type="button"
                    onClick={() => setSelectedGauge(station.id)}
                    className={`p-1.5 rounded text-[10px] text-left border ${
                      selectedGauge === station.id
                        ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                        : 'bg-[#0b0f17] border-[#1e293b] text-slate-400'
                    }`}
                  >
                    {station.label}
                  </button>
                ))}
              </div>
              <div className="text-[10px] font-mono text-slate-400 bg-[#0b0f17] p-2 rounded border border-[#1e293b]">
                Selected: <span className="text-cyan-300">{selectedGauge}</span> | 24-hr hydrograph tracked
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
