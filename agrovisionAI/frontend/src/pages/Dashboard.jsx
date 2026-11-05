import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sprout,
  ScanEye,
  Activity,
  CloudSun,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronRight,
  Droplets,
  Thermometer,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { usePlant } from '../context/PlantContext';
import { useAuth } from '../context/AuthContext';
import { CURRENT_WEATHER_DATA } from '../services/weatherService';
import { IMAGES } from '../assets/images';

const STAGE_DISTRIBUTION = [
  { name: 'Seedling', count: 18, color: '#94a3b8' },
  { name: 'Vegetative', count: 42, color: '#16A36A' },
  { name: 'Bud Formation', count: 26, color: '#B7E46A' },
  { name: 'Flowering', count: 32, color: '#F59E0B' },
  { name: 'Fruit Set', count: 19, color: '#EC4899' },
  { name: 'Harvest Ready', count: 5, color: '#8B5CF6' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { plants } = usePlant();
  const { user } = useAuth();
  const getPlantImage = (plant) => {
  // Use an uploaded image if it has a valid URL
  if (
    plant.imageUrl &&
    !plant.imageUrl.startsWith('/frontend/src/assets/images/')
  ) {
    return plant.imageUrl;
  }

  // Fallback to the correct crop image
  switch (plant.cropType) {
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

  const totalPlants = 142;
  const healthyPlants = 125;
  const attentionPlants = 14;
  const diseasesDetected = 3;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <span className="text-xs font-semibold text-emerald-800 tracking-wide uppercase">
            {user?.farmName || 'Green Valley Farm'} · Farm Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 tracking-tight">
            Good morning, {user?.name ? user.name.split(' ')[0] : 'Ramesh'}! Let's grow smarter.
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/analysis')}
            className="flex items-center gap-2 px-4 py-2 bg-[#123B2A] hover:bg-[#16A36A] text-white text-xs font-semibold rounded-xl transition-all shadow-sm active:scale-95 whitespace-nowrap"
          >
            <ScanEye className="w-4 h-4 text-[#B7E46A]" />
            <span>Analyse New Plant</span>
          </button>
        </div>
      </div>

      {/* Hero Section Banner */}
      <div className="relative rounded-2xl bg-[#0B241B] text-white overflow-hidden p-6 sm:p-8 border border-emerald-900/60 shadow-sm">
        <img
          src={IMAGES.hero}
          alt="Smart Agriculture Field"
          className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B241B] via-[#0B241B]/90 to-transparent" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-900/80 border border-emerald-700/80 text-[11px] font-medium text-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-[#B7E46A]" />
            <span>AI Plant Growth Stage & Disease Predictor</span>
          </div>

          <h2 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold text-white tracking-tight leading-snug">
            Understand your plants today. Predict their growth tomorrow.
          </h2>

          <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed max-w-xl">
            Continuously analyze plant photos and local weather to track growth milestones, catch leaf diseases early, and optimize your harvest timing.
          </p>

          {/* Quick Action Navigation Grid */}
          <div className="pt-2 flex flex-wrap gap-2.5">
            <button
              onClick={() => navigate('/analysis')}
              className="px-3.5 py-2 text-xs font-semibold bg-[#B7E46A] hover:bg-[#a5d852] text-[#0B241B] rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
            >
              <ScanEye className="w-4 h-4" />
              <span>Analyse New Plant</span>
            </button>
            <button
              onClick={() => navigate('/predictions')}
              className="px-3.5 py-2 text-xs font-medium bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-sm transition-colors flex items-center gap-1.5"
            >
              <TrendingUp className="w-4 h-4 text-emerald-300" />
              <span>View Growth Predictions</span>
            </button>
            <button
              onClick={() => navigate('/risk-assessment')}
              className="px-3.5 py-2 text-xs font-medium bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-sm transition-colors flex items-center gap-1.5"
            >
              <ShieldAlert className="w-4 h-4 text-amber-300" />
              <span>Check Weather Risks</span>
            </button>
            <button
              onClick={() => navigate('/history')}
              className="px-3.5 py-2 text-xs font-medium bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-sm transition-colors flex items-center gap-1.5"
            >
              <Clock className="w-4 h-4 text-emerald-300" />
              <span>View Plant History</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => navigate('/plants')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium">Total Monitored Plants</span>
            <Sprout className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-display text-slate-900 tabular-nums">{totalPlants}</span>
            <span className="text-xs text-emerald-700 font-semibold font-mono">+12 this wk</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Tomato · Chilli · Paddy plots</div>
        </div>

        <div
          onClick={() => navigate('/plants')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium">Healthy Crops</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-display text-emerald-700 tabular-nums">{healthyPlants}</span>
            <span className="text-xs text-slate-500 font-mono font-medium">(88%)</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Good foliage & vigor</div>
        </div>

        <div
          onClick={() => navigate('/plants')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium">Requiring Attention</span>
            <AlertTriangle className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-display text-amber-700 tabular-nums">{attentionPlants}</span>
            <span className="text-xs text-amber-600 font-mono">Moisture check</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Water stress or wilt risk</div>
        </div>

        <div
          onClick={() => navigate('/disease')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-red-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium">Diseases Detected</span>
            <Activity className="w-4 h-4 text-red-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-display text-red-700 tabular-nums">{diseasesDetected}</span>
            <span className="text-xs text-red-600 font-mono font-medium">Blight & Curl</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Treatment steps available</div>
        </div>
      </div>

      {/* Middle Grid: Growth Stage Distribution & Weather Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Growth Stage Distribution Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-sm text-slate-900 tracking-tight">Current Growth-Stage Distribution</h3>
              <p className="text-xs text-slate-500">Breakdown of stages across your farm beds</p>
            </div>
            <button
              onClick={() => navigate('/predictions')}
              className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
            >
              <span>Forecasts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            {/* Donut Chart */}
            <div className="sm:col-span-6 h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={STAGE_DISTRIBUTION}
                    dataKey="count"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {STAGE_DISTRIBUTION.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B241B', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    itemStyle={{ color: '#B7E46A' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Stage Legend and Counts */}
            <div className="sm:col-span-6 space-y-2 text-xs">
              {STAGE_DISTRIBUTION.map((s) => (
                <div key={s.name} className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-slate-700 font-medium">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-slate-900 tabular-nums">{s.count}</span>
                    <span className="text-[11px] text-slate-400">({Math.round((s.count / totalPlants) * 100)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Weather Summary Card (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-white to-emerald-50/40 p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CloudSun className="w-5 h-5 text-emerald-600" />
                <h3 className="font-display font-bold text-sm text-slate-900 tracking-tight">Weather Intelligence</h3>
              </div>
              <span className="text-[11px] font-mono text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded">
                Local Weather
              </span>
            </div>

            <div className="flex items-baseline justify-between mt-4">
              <div>
                <span className="text-3xl font-display font-extrabold text-slate-900 tabular-nums">
                  {CURRENT_WEATHER_DATA.temperature}°C
                </span>
                <p className="text-xs text-slate-500 mt-0.5">Partly Sunny · Feels like 31.2°C</p>
              </div>
              <div className="text-right text-xs space-y-0.5">
                <p className="text-slate-600">Daily: <strong className="font-mono tabular-nums">{CURRENT_WEATHER_DATA.tempMin}° - {CURRENT_WEATHER_DATA.tempMax}°C</strong></p>
                <p className="text-emerald-700 font-semibold font-mono">Thermal rate: 16.5 GDD/day</p>
              </div>
            </div>

            {/* Weather Metrics Strip */}
            <div className="grid grid-cols-3 gap-2.5 mt-5 p-3 rounded-xl bg-white border border-slate-200/80 text-center text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block">Humidity</span>
                <span className="font-bold text-slate-800 font-mono tabular-nums">{CURRENT_WEATHER_DATA.humidity}%</span>
              </div>
              <div className="border-x border-slate-100">
                <span className="text-slate-400 text-[10px] block">Soil Moisture</span>
                <span className="font-bold text-emerald-700 font-mono tabular-nums">{CURRENT_WEATHER_DATA.soilMoisture}%</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Solar PAR</span>
                <span className="font-bold text-slate-800 font-mono tabular-nums">{CURRENT_WEATHER_DATA.solarRadiation} W/m²</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
            <span className="text-[11px] text-amber-800 font-medium">⚠️ Weekend rain predicted (28mm)</span>
            <button
              onClick={() => navigate('/weather')}
              className="text-emerald-700 font-semibold hover:underline flex items-center gap-1"
            >
              <span>7-Day Outlook</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Activity & Upcoming Predicted Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Plant Monitoring Activity (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-sm text-slate-900 tracking-tight">Recent Plant Scans</h3>
              <p className="text-xs text-slate-500">Latest stage classifications and plant health</p>
            </div>
            <button
              onClick={() => navigate('/plants')}
              className="text-xs font-semibold text-emerald-700 hover:underline"
            >
              View All Plants
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {plants.slice(0, 4).map((plant) => (
              <div
                key={plant.id}
                onClick={() => navigate('/plants')}
                className="py-3 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-lg transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
  src={getPlantImage(plant)}
  alt={plant.name}
  className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0"
/>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-slate-900 truncate">{plant.name}</p>
                      <span className="text-[10px] font-mono text-slate-500 px-1.5 py-0.2 rounded bg-slate-100">
                        {plant.id}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span>{plant.cropType}</span>
                      <span>·</span>
                      <span className="text-emerald-800 font-semibold">{plant.currentStage}</span>
                      <span>·</span>
                      <span className="font-mono tabular-nums">{plant.confidence}% conf</span>
                    </div>
                  </div>
                </div>

                <div className="text-right text-xs shrink-0">
                  <span
                    className={`font-semibold text-[11px] px-2 py-0.5 rounded-full ${
                      plant.healthStatus === 'Healthy'
                        ? 'bg-emerald-100 text-emerald-800'
                        : plant.healthStatus === 'Diseased'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {plant.healthStatus}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">{plant.lastAnalysedDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Predicted Growth Milestones (5 cols) */}
        
{/* Upcoming Predicted Growth Milestones (5 cols) */}
<div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
  <div className="flex items-center justify-between">
    <div>
      <h3 className="font-display font-bold text-sm text-slate-900 tracking-tight">
        Upcoming Harvest Milestones
      </h3>
      <p className="text-xs text-slate-500">Predicted crop stage transitions</p>
    </div>
    <button
      onClick={() => navigate('/predictions')}
      className="text-xs font-semibold text-emerald-700 hover:underline"
    >
      Timeline
    </button>
  </div>

  <div className="space-y-3">
    {plants.slice(0, 3).map((plant) => {
      const milestone = plant.estimatedNextMilestone;

      return (
        <div
          key={plant.id}
          className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2 text-xs"
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 truncate">
              {plant.name}
            </span>

            <span className="text-emerald-700 font-semibold text-[11px] font-mono">
              {milestone?.daysRemaining != null
                ? `~${milestone.daysRemaining} days remaining`
                : 'Forecast unavailable'}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-600">
            <span>
              Current: <strong>{plant.currentStage || 'Unknown'}</strong>
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            <span>
              Next:{' '}
              <strong className="text-emerald-800">
                {milestone?.stage || 'Not predicted'}
              </strong>
            </span>
          </div>

          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full"
              style={{
                width: `${Math.min(
                  100,
                  Math.max(
                    0,
                    Math.round(
                      ((plant.gddAccumulated || 0) /
                        (plant.gddTargetMaturity || 1400)) *
                        100
                    )
                  )
                )}%`,
              }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>
              Accum GDD: {plant.gddAccumulated ?? 'N/A'} °C-d
            </span>
            <span>
              Target Date: {milestone?.estimatedDate || 'N/A'}
            </span>
          </div>
        </div>
      );
    })}

    {plants.length === 0 && (
      <p className="text-xs text-slate-500 text-center py-6">
        No plants monitored yet. Analyse a plant to get started.
      </p>
    )}
  </div>
</div>

      </div>
    </div>
  );
}
