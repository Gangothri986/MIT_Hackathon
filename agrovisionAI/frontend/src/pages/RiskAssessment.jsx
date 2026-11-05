import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Thermometer,
  Droplets,
  CloudRain,
  Flame,
  Wind,
  Layers,
  Sparkles,
} from 'lucide-react';
import { weatherService } from '../services/weatherService';

export default function RiskAssessment() {
  const [selectedCrop, setSelectedCrop] = useState('Tomato');
  const [selectedStage, setSelectedStage] = useState('Flowering');

  const risks = weatherService.calculateEnvironmentalRisks(selectedCrop, selectedStage);

  const getLevelBadge = (level) => {
    switch (level) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Moderate':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  const getProgressColor = (level) => {
    switch (level) {
      case 'Critical':
        return 'bg-red-600';
      case 'High':
        return 'bg-orange-500';
      case 'Moderate':
        return 'bg-amber-500';
      default:
        return 'bg-emerald-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <span className="text-xs font-semibold text-emerald-800 tracking-wide uppercase">
            Biosecurity & Agro-Climate Threat Engine
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 tracking-tight">
            Environmental Risk Assessment
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Multi-factor biological risk modeling cross-referencing forecasted temperatures, precipitation spikes, and relative humidity against cultivar phenological vulnerability.
          </p>
        </div>

        {/* Dynamic Controls for Evaluation */}
        <div className="flex flex-wrap items-center gap-2 self-start">
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-xl shadow-2xs focus:outline-none"
          >
            <option value="Tomato">Crop: Tomato</option>
            <option value="Chilli">Crop: Chilli</option>
            <option value="Paddy">Crop: Paddy</option>
          </select>

          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-xl shadow-2xs focus:outline-none"
          >
            <option value="Seedling">Stage: Seedling</option>
            <option value="Vegetative Growth">Stage: Vegetative</option>
            <option value="Bud Formation">Stage: Bud Formation</option>
            <option value="Flowering">Stage: Flowering</option>
            <option value="Fruit Formation">Stage: Fruit Formation</option>
            <option value="Maturity">Stage: Maturity</option>
          </select>
        </div>
      </div>

      {/* Aggregate Biosecurity Threat Banner */}
      <div className="p-5 rounded-2xl bg-[#0B241B] text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border border-[#164433] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 text-red-400 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-base text-white">
                Fungal Proliferation Vector Elevated (82/100)
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                Critical Alert
              </span>
            </div>
            <p className="text-xs text-emerald-200/80 mt-0.5">
              Target crop {selectedCrop} in {selectedStage} stage has high vulnerability to weekend continuous leaf wetness.
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-xs text-emerald-300 block font-mono">Location Context</span>
          <span className="text-xs font-bold text-white">Local Agricultural Region</span>
        </div>
      </div>

      {/* 5 Distinct Environmental Risks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {risks.map((risk) => (
          <div
            key={risk.id}
            className={`p-6 rounded-2xl border bg-white shadow-2xs space-y-4 transition-all hover:shadow-xs`}
          >
            {/* Title & Score */}
            <div className="flex items-center justify-between">
              <div>
                <span
                  className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border ${getLevelBadge(
                    risk.level
                  )}`}
                >
                  {risk.level} Risk
                </span>
                <h3 className="text-base font-bold font-display text-slate-900 mt-1.5">{risk.title}</h3>
              </div>

              <div className="text-right">
                <span className="text-2xl font-extrabold font-display font-mono tabular-nums text-slate-900">
                  {risk.score}
                  <span className="text-xs font-normal text-slate-400">/100</span>
                </span>
              </div>
            </div>

            {/* Risk Score Progress Bar */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${getProgressColor(risk.level)} transition-all duration-500`}
                style={{ width: `${risk.score}%` }}
              />
            </div>

            {/* Contributing Factors */}
            <div className="space-y-1.5 text-xs">
              <p className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                Contributing Weather Factors:
              </p>
              <ul className="space-y-1 text-slate-600">
                {risk.factors.map((factor, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-slate-400 mt-0.5">•</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Scientific Explanation */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs text-slate-700 leading-relaxed">
              <strong>Agro-Biological Impact:</strong> {risk.explanation}
            </div>

            {/* Recommended Action */}
            <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/80 text-xs text-emerald-950 leading-relaxed">
              <strong>Recommended Mitigation:</strong> {risk.recommendation}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
