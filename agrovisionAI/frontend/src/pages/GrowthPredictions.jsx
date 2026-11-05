import React, { useState } from 'react';
import {
  TrendingUp,
  Calendar,
  Sparkles,
  Info,
  CheckCircle2,
  Clock,
  ArrowRight,
  SunMedium,
  Thermometer,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { usePlant } from '../context/PlantContext';
import { CROP_GDD_CONFIG } from '../services/predictionService';

const GDD_PROJECTION_DATA = [
  { day: 'DAP 40', actualGDD: 540, projectedGDD: 540, thresholdFlowering: 650 },
  { day: 'DAP 45', actualGDD: 620, projectedGDD: 620, thresholdFlowering: 650 },
  { day: 'DAP 50 (Today)', actualGDD: 680, projectedGDD: 680, thresholdFlowering: 650 },
  { day: 'DAP 55', actualGDD: null, projectedGDD: 765, thresholdFlowering: 650 },
  { day: 'DAP 60', actualGDD: null, projectedGDD: 850, thresholdFlowering: 650 },
  { day: 'DAP 65', actualGDD: null, projectedGDD: 935, thresholdFlowering: 650 },
  { day: 'DAP 70 (Fruit)', actualGDD: null, projectedGDD: 1020, thresholdFlowering: 650 },
  { day: 'DAP 85 (Maturity)', actualGDD: null, projectedGDD: 1350, thresholdFlowering: 650 },
];

export default function GrowthPredictions() {
  const { plants, selectedPlant, setSelectedPlant } = usePlant();
  const currentPlant = selectedPlant || plants[0];
  const [selectedCrop, setSelectedCrop] = useState(currentPlant?.cropType || 'Tomato');

  const cropConfig = CROP_GDD_CONFIG[selectedCrop] || CROP_GDD_CONFIG.Tomato;

  const milestones = [
    {
      title: 'Vegetative Canopy Closure',
      date: '2026-10-18',
      gdd: 400,
      status: 'Confirmed Biological Event',
      isEstimate: false,
      completed: true,
      description: 'Secondary suckers emerged; leaf area index reached 2.4.',
    },
    {
      title: 'Anthesis / Flowering Peak',
      date: '2026-11-04',
      gdd: 680,
      status: 'Current Active Stage',
      isEstimate: false,
      completed: true,
      description: 'Active pollinator visits, flower trusses open on branches 3 & 4.',
    },
    {
      title: 'Fruit Formation (Set Initiation)',
      date: '2026-11-14',
      gdd: 1100,
      status: 'Biophysical AI Prediction',
      isEstimate: true,
      completed: false,
      description: 'Ovary swelling expected following thermal accumulation of +420 GDD.',
    },
    {
      title: 'First Commercial Harvest / Maturity',
      date: '2026-12-10',
      gdd: 1400,
      status: 'Biophysical AI Prediction',
      isEstimate: true,
      completed: false,
      description: 'Sugar synthesis and final ripening estimated based on standard seasonal heat units.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <span className="text-xs font-semibold text-emerald-800 tracking-wide uppercase">
            Thermal Phenology & GDD Engine
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 tracking-tight">
            Developmental Milestone Predictions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Biophysical growth outlooks calculated using accumulated Growing Degree Days (GDD) and 7-day microclimatic temperature forecasts.
          </p>
        </div>

        {/* Crop Selector Tab */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl shadow-2xs self-start">
          {['Tomato', 'Chilli', 'Paddy'].map((crop) => (
            <button
              key={crop}
              onClick={() => setSelectedCrop(crop)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                selectedCrop === crop
                  ? 'bg-[#123B2A] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {crop}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Metric Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Growth Favourability Score</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-display text-emerald-700 tabular-nums">78/100</span>
            <span className="text-xs text-emerald-600 font-semibold">Favourable</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Slight drag from weekend rain forecast</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Accumulated GDD (to date)</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-display text-slate-900 font-mono tabular-nums">680</span>
            <span className="text-xs text-slate-500">°C-days</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Base Temp ({cropConfig.baseTemp}°C) threshold</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Next Estimated Milestone</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-lg font-bold font-display text-slate-900 truncate">Fruit Formation</span>
          </div>
          <p className="text-[11px] text-emerald-700 font-semibold font-mono mt-1">~10 days (Nov 14, 2026)</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Est. Final Harvest Window</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-lg font-bold font-display text-slate-900 truncate">Dec 08 - Dec 14</span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono mt-1">~1400 GDD Cumulative Target</p>
        </div>
      </div>

      {/* Main GDD Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="font-display font-bold text-sm text-slate-900">
              Thermal Heat Accumulation & Phenology Trajectory
            </h3>
            <p className="text-xs text-slate-500">
              Historical accumulated GDD curve vs AI future biophysical projection for {selectedCrop}
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <span className="w-3 h-0.5 bg-emerald-600 inline-block" /> Actual Recorded
            </span>
            <span className="flex items-center gap-1.5 text-amber-600 font-medium">
              <span className="w-3 h-0.5 bg-amber-500 border-dashed inline-block" /> AI Projection
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={GDD_PROJECTION_DATA}>
              <defs>
                <linearGradient id="actualGddGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16A36A" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#16A36A" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="projectedGddGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit=" °C-d" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0B241B', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
              />
              <Area
                type="monotone"
                dataKey="actualGDD"
                stroke="#16A36A"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#actualGddGrad)"
                name="Actual Recorded GDD"
              />
              <Area
                type="monotone"
                dataKey="projectedGDD"
                stroke="#F59E0B"
                strokeWidth={2}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#projectedGddGrad)"
                name="Projected GDD"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Future Growth Timeline: Confirmed vs Estimated */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-sm text-slate-900">
              Phenological Developmental Timeline
            </h3>
            <p className="text-xs text-slate-500">
              Clear distinction between confirmed biological ground truth and forward AI estimations
            </p>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Agricultural Subzone Model</span>
        </div>

        <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-200 space-y-6 my-4">
          {milestones.map((ms, idx) => (
            <div key={idx} className="relative group">
              {/* Dot indicator */}
              <div
                className={`absolute -left-[31px] sm:-left-[39px] top-1 w-5 h-5 rounded-full border-2 bg-white flex items-center justify-center transition-transform group-hover:scale-125 ${
                  ms.completed
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-amber-500 text-amber-500'
                }`}
              >
                {ms.completed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
              </div>

              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-1 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <h4 className="font-bold text-slate-900 text-sm">{ms.title}</h4>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                        ms.isEstimate
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {ms.status}
                    </span>
                    <span className="font-mono font-semibold text-slate-700">{ms.date}</span>
                  </div>
                </div>

                <p className="text-slate-600 leading-relaxed text-[11px]">{ms.description}</p>
                <div className="text-[10px] text-slate-400 font-mono pt-1">
                  Accumulation Threshold: {ms.gdd} °C-days
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
