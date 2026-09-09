import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Users,
  AlertTriangle,
  Building2,
  Check,
  Shield,
  Activity,
  Sliders,
  RotateCcw,
} from 'lucide-react';
import { LocationItem } from '../../types/navigation';

interface LocationPropertyModalProps {
  location: LocationItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: LocationItem) => void;
  onReset: (id: string) => void;
}

export const LocationPropertyModal: React.FC<LocationPropertyModalProps> = ({
  location,
  isOpen,
  onClose,
  onSave,
  onReset,
}) => {
  const [formData, setFormData] = useState<LocationItem | null>(null);
  const [hasSaved, setHasSaved] = useState(false);

  useEffect(() => {
    if (location) {
      setFormData({ ...location });
      setHasSaved(false);
    }
  }, [location]);

  if (!isOpen || !formData) return null;

  const handleFieldChange = (field: keyof LocationItem, value: any) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : null));
    setHasSaved(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      onSave(formData);
      setHasSaved(true);
      setTimeout(() => {
        setHasSaved(false);
        onClose();
      }, 700);
    }
  };

  return (
    <div
      id="location-property-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        id="location-property-modal-dialog"
        className="w-full max-w-md bg-[#0f172a] border border-[#1e293b] rounded-xl shadow-2xl overflow-hidden flex flex-col text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#1e293b] flex items-center justify-between bg-[#0b1120]">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                formData.riskLevel === 'critical'
                  ? 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
                  : formData.riskLevel === 'high'
                  ? 'bg-orange-950/80 text-orange-400 border border-orange-800/60'
                  : formData.riskLevel === 'moderate'
                  ? 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                  : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
              }`}
            >
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">
                Edit Geographic Feature
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                ID: {formData.id} • {formData.category.toUpperCase()}
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-close-location-modal"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4 text-xs overflow-y-auto max-h-[75vh]">
          {/* Location Name */}
          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              Feature Name
            </label>
            <input
              type="text"
              id="input-location-name"
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              className="w-full px-3 py-2 rounded bg-[#090d16] border border-[#1e293b] text-slate-100 font-sans focus:outline-none focus:border-cyan-500 text-xs"
              required
            />
          </div>

          {/* Type and Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Feature Type
              </label>
              <select
                id="select-location-type"
                value={formData.type}
                onChange={(e) => handleFieldChange('type', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded bg-[#090d16] border border-[#1e293b] text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
              >
                <option value="settlement">Settlement / Town</option>
                <option value="hospital">Hospital / Clinic</option>
                <option value="power">Power / Hydro Substation</option>
                <option value="bridge">Bridge / Viaduct</option>
                <option value="dam">Dam Structure</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Category
              </label>
              <select
                id="select-location-category"
                value={formData.category}
                onChange={(e) => handleFieldChange('category', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded bg-[#090d16] border border-[#1e293b] text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
              >
                <option value="settlement">Settlement Zone</option>
                <option value="infrastructure">Critical Infrastructure</option>
              </select>
            </div>
          </div>

          {/* Population Size */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-medium text-slate-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span>Exposed Population</span>
              </label>
              <span className="font-mono text-cyan-300 font-semibold">
                {formData.population.toLocaleString()} residents
              </span>
            </div>
            <input
              type="range"
              id="slider-location-population"
              min={0}
              max={25000}
              step={25}
              value={formData.population}
              onChange={(e) => handleFieldChange('population', parseInt(e.target.value, 10))}
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[9px] font-mono text-slate-400 mt-1">
              <span>0 (Uninhabited)</span>
              <span>10,000</span>
              <span>25,000</span>
            </div>
          </div>

          {/* Risk Level Selector */}
          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Hydraulic Risk Assessment</span>
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['low', 'moderate', 'high', 'critical'] as const).map((level) => {
                const isSelected = formData.riskLevel === level;
                return (
                  <button
                    key={level}
                    type="button"
                    id={`btn-risk-${level}`}
                    onClick={() => handleFieldChange('riskLevel', level)}
                    className={`py-1.5 rounded border text-[10px] font-mono font-medium uppercase tracking-wider transition-all cursor-pointer ${
                      isSelected
                        ? level === 'critical'
                          ? 'bg-rose-950 text-rose-300 border-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]'
                          : level === 'high'
                          ? 'bg-orange-950 text-orange-300 border-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.3)]'
                          : level === 'moderate'
                          ? 'bg-amber-950 text-amber-300 border-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                          : 'bg-emerald-950 text-emerald-300 border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                        : 'bg-[#090d16] text-slate-400 border-[#1e293b] hover:text-slate-200'
                    }`}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Evacuation Status */}
          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>Civil Defense Action</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'sheltering', label: 'Shelter in Place' },
                { id: 'in-progress', label: 'Evacuation in Progress' },
                { id: 'completed', label: 'Evacuated / Cleared' },
                { id: 'alert', label: 'Under Immediate Warning' },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => handleFieldChange('evacuationStatus', st.id)}
                  className={`px-2.5 py-1.5 rounded border text-left text-[11px] transition-all cursor-pointer flex items-center justify-between ${
                    formData.evacuationStatus === st.id
                      ? 'bg-cyan-950/60 text-cyan-200 border-cyan-500/60 font-medium'
                      : 'bg-[#090d16] text-slate-400 border-[#1e293b] hover:text-slate-200'
                  }`}
                >
                  <span>{st.label}</span>
                  {formData.evacuationStatus === st.id && (
                    <Check className="w-3 h-3 text-cyan-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Geographic Telemetry */}
          <div className="p-2.5 rounded bg-[#090d16] border border-[#1a2333] grid grid-cols-3 gap-2 text-[10px] font-mono">
            <div>
              <div className="text-slate-400">ELEVATION</div>
              <div className="text-slate-200 font-semibold">{formData.elevation}m MSL</div>
            </div>
            <div>
              <div className="text-slate-400">DIST FROM DAM</div>
              <div className="text-slate-200 font-semibold">{formData.distanceFromDamKm} km</div>
            </div>
            <div>
              <div className="text-slate-400">WAVE ARRIVAL</div>
              <div className="text-amber-400 font-semibold">{formData.arrivalMinutes} min</div>
            </div>
          </div>

          {/* Operational Notes / Details */}
          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              Field Observations & Hydrodynamic Details
            </label>
            <textarea
              id="textarea-location-details"
              rows={2}
              value={formData.details}
              onChange={(e) => handleFieldChange('details', e.target.value)}
              className="w-full px-3 py-1.5 rounded bg-[#090d16] border border-[#1e293b] text-slate-200 focus:outline-none focus:border-cyan-500 font-sans text-xs"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-between gap-3 border-t border-[#1e293b]">
            <button
              type="button"
              onClick={() => onReset(formData.id)}
              className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Default</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 rounded transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="btn-save-location-props"
                className="px-4 py-1.5 text-xs font-semibold rounded bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1.5 shadow-md shadow-cyan-900/40 transition-all cursor-pointer"
              >
                {hasSaved ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Apply Changes</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
