import React, { useRef } from 'react';
import { X, Printer, CheckCircle2, AlertTriangle, ShieldCheck, Sprout } from 'lucide-react';
import { usePlant } from '../../context/PlantContext';
import { useAuth } from '../../context/AuthContext';

export default function ExportReportModal({ isOpen, onClose }) {
  const { selectedPlant, plants } = usePlant();
  const { user } = useAuth();
  const reportRef = useRef(null);

  if (!isOpen) return null;

  const plant = selectedPlant || plants[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800">
        {/* Action Header */}
        <div className="print:hidden px-6 py-4 bg-[#0B241B] text-white flex items-center justify-between border-b border-[#164433]">
          <div>
            <h3 className="font-display font-bold text-base text-white">AgroVision AI — Plant Health & Growth Report</h3>
            <p className="text-xs text-emerald-300">Printable farm record for your records</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-[#B7E46A] text-[#0B241B] rounded-lg hover:bg-[#a5d852] transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-emerald-300 hover:text-white rounded-lg hover:bg-[#123B2A] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Content */}
        <div ref={reportRef} className="p-8 space-y-6 print:p-0">
          {/* Header Banner */}
          <div className="flex items-start justify-between pb-4 border-b-2 border-[#123B2A]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#0B241B] flex items-center justify-center text-[#B7E46A]">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-display text-[#0B241B] tracking-tight">AgroVision AI</h2>
                <p className="text-xs text-slate-500 font-medium">Plant Growth Stage & Crop Health Intelligence</p>
                <p className="text-[11px] text-emerald-700 font-semibold">{user?.farmName || 'Green Valley Farm'}</p>
              </div>
            </div>
            <div className="text-right text-xs">
              <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-bold text-[11px]">
                ID: {plant.id}
              </span>
              <p className="text-slate-500 mt-1">Date: {new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
              <p className="text-slate-500">Farmer: {user?.name || 'Ramesh Kumar'}</p>
            </div>
          </div>

          {/* Plant Metadata Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <p className="text-slate-500 font-medium">Specimen Name</p>
              <p className="font-bold text-slate-900 mt-0.5">{plant.name}</p>
            </div>
            <div>
              <p className="text-slate-500 font-medium">Crop & Variety</p>
              <p className="font-bold text-slate-900 mt-0.5">{plant.cropType} ({plant.variety || 'Commercial'})</p>
            </div>
            <div>
              <p className="text-slate-500 font-medium">Field Location</p>
              <p className="font-bold text-slate-900 mt-0.5 truncate">{plant.location}</p>
            </div>
            <div>
              <p className="text-slate-500 font-medium">Days After Planting</p>
              <p className="font-bold text-slate-900 mt-0.5 font-mono">{plant.daysAfterPlanting} Days</p>
            </div>
          </div>

          {/* Key Findings Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
              <span className="text-[11px] font-semibold text-emerald-800">Current Growth Stage</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-lg font-bold text-emerald-950 font-display">{plant.currentStage}</span>
                <span className="text-xs font-mono font-semibold text-emerald-700">({plant.confidence}%)</span>
              </div>
              <p className="text-[11px] text-emerald-800/80 mt-1">Stage {plant.stageIndex} of 6</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-600">Health Condition</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-lg font-bold text-slate-900 font-display">{plant.healthScore}/100</span>
                <span className="text-xs font-semibold text-emerald-600">{plant.healthStatus}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Normal foliage development</p>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
              <span className="text-[11px] font-semibold text-amber-800">Next Predicted Stage</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-lg font-bold text-amber-950 font-display">{plant.estimatedNextMilestone.stage}</span>
                <span className="text-xs font-mono text-amber-700">~{plant.estimatedNextMilestone.daysRemaining} days</span>
              </div>
              <p className="text-[11px] text-amber-800/80 mt-1">Target Date: {plant.estimatedNextMilestone.estimatedDate}</p>
            </div>
          </div>

          {/* Health & Environmental Assessment */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Crop Health & Weather Context</h4>
            <div className="p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p><strong>Health Overview:</strong> Foliage is vibrant and actively advancing. Ensure adequate regular watering and check lower leaves periodically.</p>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p><strong>Weather Tip:</strong> Watch for high humidity periods after rain; ensure excess standing water drains within a few hours to protect roots.</p>
              </div>
            </div>
          </div>

          {/* Farm Care Tips */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Recommended Next Steps</h4>
            <ul className="text-xs space-y-2 text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16A36A] shrink-0 mt-0.5" />
                <span>Maintain uniform soil moisture; avoid excessive overhead spraying during flowering.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16A36A] shrink-0 mt-0.5" />
                <span>Inspect drainage furrows ahead of forecasted rains to prevent waterlogging.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16A36A] shrink-0 mt-0.5" />
                <span>Take a fresh photo next week to verify milestone progression.</span>
              </li>
            </ul>
          </div>

          {/* Footer signature line */}
          <div className="pt-6 border-t border-slate-200 flex items-end justify-between text-xs">
            <div>
              <p className="font-semibold text-slate-900">AgroVision AI Farm Monitoring</p>
              <p className="text-[11px] text-slate-500">Field Health Record</p>
            </div>
            <div className="text-right">
              <div className="font-medium text-slate-700 text-sm border-b border-slate-300 pb-1 px-4">
                {user?.name || 'Ramesh Kumar'}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Farm Owner / Grower</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
