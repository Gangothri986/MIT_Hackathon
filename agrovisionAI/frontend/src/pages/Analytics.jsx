import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Activity,
  Calendar,
  CloudRain,
  ShieldCheck,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const TIMELINE_DATA_30D = [
  { date: 'Oct 05', vegetative: 15, flowering: 5, fruit: 2, avgHealth: 94, gddAccum: 120 },
  { date: 'Oct 12', vegetative: 28, flowering: 12, fruit: 6, avgHealth: 92, gddAccum: 235 },
  { date: 'Oct 19', vegetative: 38, flowering: 20, fruit: 10, avgHealth: 90, gddAccum: 360 },
  { date: 'Oct 26', vegetative: 42, flowering: 26, fruit: 14, avgHealth: 88, gddAccum: 490 },
  { date: 'Nov 02', vegetative: 42, flowering: 32, fruit: 19, avgHealth: 89, gddAccum: 680 },
];

const DISEASE_STATS = [
  { pathogen: 'Early Blight (Alternaria)', detections: 6, resolved: 4, active: 2, color: '#EF4444' },
  { pathogen: 'Chilli Leaf Curl (ChiLCV)', detections: 4, resolved: 3, active: 1, color: '#F97316' },
  { pathogen: 'Rice Blast (Magnaporthe)', detections: 3, resolved: 3, active: 0, color: '#EAB308' },
  { pathogen: 'Bacterial Spot (Xanthomonas)', detections: 1, resolved: 1, active: 0, color: '#8B5CF6' },
];

const WEATHER_VS_GROWTH = [
  { week: 'Wk 1', tempAvg: 28.5, rainTotal: 5, growthRate: 88 },
  { week: 'Wk 2', tempAvg: 29.1, rainTotal: 12, growthRate: 94 },
  { week: 'Wk 3', tempAvg: 30.2, rainTotal: 0, growthRate: 91 },
  { week: 'Wk 4', tempAvg: 31.5, rainTotal: 8, growthRate: 86 },
  { week: 'Wk 5 (Current)', tempAvg: 32.0, rainTotal: 28, growthRate: 78 },
];

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('30d');

  return (
    <div className="space-y-6">
      {/* Header & Date Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <span className="text-xs font-semibold text-emerald-800 tracking-wide uppercase">
            Data Intelligence & Longitudinal Phenology
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 tracking-tight">
            AI Insights & Agri-Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Correlating phenological growth stage transition curves against seasonal heat accumulation and pathogen outbreaks.
          </p>
        </div>

        {/* Date Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl shadow-2xs self-start">
          {['7d', '30d', '90d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                timeRange === range
                  ? 'bg-[#123B2A] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Chart: Growth Progression Over Time */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="font-display font-bold text-sm text-slate-900">
              Phenological Stage Progression & Population Dynamic
            </h3>
            <p className="text-xs text-slate-500">
              Tracking population shift from vegetative biomass into flowering and fruit development
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <span className="w-2.5 h-2.5 bg-emerald-600 inline-block rounded-xs" /> Vegetative
            </span>
            <span className="flex items-center gap-1.5 text-amber-600 font-medium">
              <span className="w-2.5 h-2.5 bg-amber-500 inline-block rounded-xs" /> Flowering
            </span>
            <span className="flex items-center gap-1.5 text-pink-600 font-medium">
              <span className="w-2.5 h-2.5 bg-pink-500 inline-block rounded-xs" /> Fruit Set
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={TIMELINE_DATA_30D}>
              <defs>
                <linearGradient id="vegGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16A36A" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#16A36A" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="flowerGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="fruitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EC4899" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#EC4899" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit=" plants" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0B241B', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="vegetative" stroke="#16A36A" strokeWidth={2} fillOpacity={1} fill="url(#vegGrad)" />
              <Area type="monotone" dataKey="flowering" stroke="#F59E0B" strokeWidth={2} fillOpacity={1} fill="url(#flowerGrad)" />
              <Area type="monotone" dataKey="fruit" stroke="#EC4899" strokeWidth={2} fillOpacity={1} fill="url(#fruitGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Dual Grid: Disease Incidences & Weather vs Growth Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Disease Detections Bar Chart (6 cols) */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h3 className="font-display font-bold text-sm text-slate-900">
              Pathogen Outbreak Statistics
            </h3>
            <p className="text-xs text-slate-500">
              Diagnosed disease incidents vs resolved treatment interventions
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DISEASE_STATS} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis dataKey="pathogen" type="category" width={140} tick={{ fontSize: 10, fill: '#334155' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B241B', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="detections" fill="#EF4444" radius={[0, 4, 4, 0]} name="Total Detections" />
                <Bar dataKey="resolved" fill="#16A36A" radius={[0, 4, 4, 0]} name="Resolved" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weather vs Growth Comparison (6 cols) */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h3 className="font-display font-bold text-sm text-slate-900">
              Weather vs Growth Favourability Index
            </h3>
            <p className="text-xs text-slate-500">
              Correlation between weekly rainfall / temperature and biological expansion rate
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={WEATHER_VS_GROWTH}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#64748b' }} domain={[60, 100]} unit="%" />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#64748b' }} unit="mm" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B241B', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Line yAxisId="left" type="monotone" dataKey="growthRate" stroke="#16A36A" strokeWidth={2.5} name="Growth Favourability (%)" />
                <Line yAxisId="right" type="monotone" dataKey="rainTotal" stroke="#3B82F6" strokeWidth={2} name="Weekly Rain (mm)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
