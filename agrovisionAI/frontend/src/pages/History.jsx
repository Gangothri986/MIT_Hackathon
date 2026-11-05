import React, { useState } from 'react';
import {
  History as HistoryIcon,
  Columns2,
  Calendar,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Sliders,
  Clock,
  Layers,
} from 'lucide-react';
import { usePlant } from '../context/PlantContext';
import { IMAGES } from '../assets/images';

export default function History() {
  const { plants, selectedPlant, setSelectedPlant } = usePlant();
  const [currentPlantId, setCurrentPlantId] = useState(selectedPlant?.id || plants[0]?.id);
  const [compareSliderPos, setCompareSliderPos] = useState(50);
  const [comparisonMode, setComparisonMode] = useState('split'); // 'split' or 'slider'

  const activePlant = plants.find((p) => p.id === currentPlantId) || plants[0];
  const getHistoryImage = (imageUrl, cropType) => {
  // Reject previously saved incorrect paths
  if (
    imageUrl &&
    !imageUrl.startsWith('/frontend/src/assets/images/')
  ) {
    return imageUrl;
  }

  // Use crop-specific fallback
  switch (cropType) {
    case 'Tomato':
      return IMAGES.tomatoFlowering;

    case 'Chilli':
      return IMAGES.chilliVegetative;

    case 'Paddy':
      return IMAGES.paddyField;

    default:
      return IMAGES.hero;
  }
};

  // Select two dates to compare
  const historyList = activePlant?.history || [];
  const beforeEntry = historyList[0] || {
    date: activePlant.plantedDate,
    stage: 'Seedling / Early Vegetative',
    healthScore: 95,
    imageUrl: IMAGES.chilliVegetative,
  };
  const afterEntry = historyList[historyList.length - 1] || {
    date: activePlant.lastAnalysedDate,
    stage: activePlant.currentStage,
    healthScore: activePlant.healthScore,
    imageUrl: activePlant.imageUrl,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <span className="text-xs font-semibold text-emerald-800 tracking-wide uppercase">
            Continuous Longitudinal Tracking
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 tracking-tight">
            Continuous Plant Monitoring & Growth Journey
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Track phenological transitions over weeks. Compare photographic evidence from initial nursery transplant to present anthesis and fruit formation.
          </p>
        </div>

        {/* Plant Selector Dropdown */}
        <div className="self-start">
          <select
            value={currentPlantId}
            onChange={(e) => setCurrentPlantId(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-2xs text-xs font-bold text-slate-900 focus:outline-none"
          >
            {plants.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Before & After Image Comparison Widget */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Columns2 className="w-5 h-5 text-emerald-700" />
            <div>
              <h3 className="font-display font-bold text-sm text-slate-900">
                Visual Growth Comparison (Before vs Current)
              </h3>
              <p className="text-xs text-slate-500">
                Evaluating morphological development between {beforeEntry.date} and {afterEntry.date}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setComparisonMode('split')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                comparisonMode === 'split' ? 'bg-[#123B2A] text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              Side-by-Side
            </button>
            <button
              onClick={() => setComparisonMode('slider')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                comparisonMode === 'slider' ? 'bg-[#123B2A] text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              Interactive Overlay Slider
            </button>
          </div>
        </div>

        {comparisonMode === 'split' ? (
          /* Side by Side Mode */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Before Card */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Baseline Scan: {beforeEntry.date}</span>
                <span className="font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                  {beforeEntry.stage}
                </span>
              </div>
              <div className="relative aspect-4/3 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                <img
                  src={getHistoryImage(beforeEntry.imageUrl, activePlant?.cropType)}
                  alt="Baseline specimen"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/70 text-white text-[10px] font-mono">
                  Initial Scan (Day 1)
                </div>
              </div>
              <p className="text-[11px] text-slate-500">{beforeEntry.note}</p>
            </div>

            {/* After Card */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">Current Scan: {afterEntry.date}</span>
                <span className="font-mono text-[#0B241B] bg-[#B7E46A] px-2 py-0.5 rounded text-[10px] font-bold">
                  {afterEntry.stage}
                </span>
              </div>
              <div className="relative aspect-4/3 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                <img
                  src={getHistoryImage(afterEntry.imageUrl, activePlant?.cropType)}
                  alt="Current specimen"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/70 text-white text-[10px] font-mono">
                  Current (Day {activePlant.daysAfterPlanting})
                </div>
              </div>
              <p className="text-[11px] text-slate-500">{afterEntry.note}</p>
            </div>
          </div>
        ) : (
          /* Interactive Comparison Slider Mode */
          <div className="space-y-3">
            <div className="relative aspect-16/9 sm:aspect-21/9 rounded-xl overflow-hidden border border-slate-300 select-none">
              {/* After image (underneath) */}
              <img
                src={afterEntry.imageUrl || IMAGES.tomatoFlowering}
                alt="Current image"
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Before image (clipped) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${compareSliderPos}%` }}
              >
                <img
                  src={getHistoryImage(beforeEntry.imageUrl, activePlant?.cropType)}
                  alt="Before image"
                  className="absolute inset-0 w-full h-full object-cover max-w-none"
                  style={{ width: '100%', height: '100%' }}
                />
              </div>

              {/* Slider divider line */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] cursor-ew-resize flex items-center justify-center pointer-events-none"
                style={{ left: `${compareSliderPos}%` }}
              >
                <div className="w-8 h-8 rounded-full bg-[#123B2A] text-[#B7E46A] border-2 border-white flex items-center justify-center text-xs shadow-md">
                  ⇄
                </div>
              </div>

              {/* Badges on overlay */}
              <div className="absolute top-3 left-3 px-2 py-1 rounded bg-black/70 text-white text-[10px] font-mono pointer-events-none">
                Before: {beforeEntry.date}
              </div>
              <div className="absolute top-3 right-3 px-2 py-1 rounded bg-black/70 text-white text-[10px] font-mono pointer-events-none">
                After: {afterEntry.date}
              </div>
            </div>

            {/* Slider control input */}
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold text-slate-500">Initial State</span>
              <input
                type="range"
                min="5"
                max="95"
                value={compareSliderPos}
                onChange={(e) => setCompareSliderPos(Number(e.target.value))}
                className="flex-1 accent-emerald-600"
              />
              <span className="text-[11px] font-bold text-slate-500">Current State</span>
            </div>
          </div>
        )}
      </div>

      {/* Plant Journey Chronological Timeline */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-sm text-slate-900">
              Phenological Progression Record: {activePlant.name}
            </h3>
            <p className="text-xs text-slate-500">
              All validated stage transitions and diagnostic notes logged for {activePlant.id}
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            {activePlant.daysAfterPlanting} Days in Field
          </span>
        </div>

        <div className="relative pl-6 sm:pl-8 border-l-2 border-emerald-600/30 space-y-6 my-4">
          {historyList.map((entry, idx) => (
            <div key={idx} className="relative group">
              <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-5 h-5 rounded-full border-2 border-emerald-600 bg-white flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>

              <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-1.5 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <span className="font-bold text-slate-900 text-sm font-display">
                    {entry.stage}
                  </span>
                  <span className="font-mono text-slate-500 text-[11px]">{entry.date}</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">{entry.note}</p>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono pt-1">
                  <span>Health Score: <strong>{entry.healthScore}/100</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
