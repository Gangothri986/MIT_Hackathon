import React, { useState } from 'react';
import {
  CloudSun,
  Droplets,
  Thermometer,
  Wind,
  Sun,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart,
} from 'recharts';
import {
  CURRENT_WEATHER_DATA,
  FORECAST_7_DAYS,
  HOURLY_TEMPERATURE_DATA,
  weatherService,
} from '../services/weatherService';

export default function WeatherIntelligence() {
  const [selectedCrop, setSelectedCrop] = useState('Tomato');
  const outlook = weatherService.calculateGrowthOutlook(selectedCrop, 'Flowering');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <span className="text-xs font-semibold text-emerald-800 tracking-wide uppercase">
            Agro-Meteorological Station
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 tracking-tight">
            Weather Intelligence & Microclimate
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Live environmental sensor feed for the agricultural region. Evaluates atmospheric stress vectors on active crop plots.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-slate-600 font-medium">Telemetry Online</span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-500 font-mono">10m sync</span>
        </div>
      </div>

      {/* Current Real-Time Sensor Telemetry Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Ambient Temp</span>
            <Thermometer className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-display text-slate-900 tabular-nums">
            {CURRENT_WEATHER_DATA.temperature}°C
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Min: 20.8° · Max: 32.6°</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Relative Humidity</span>
            <Droplets className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-display text-blue-700 tabular-nums">
            {CURRENT_WEATHER_DATA.humidity}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">High fungal threshold</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Soil Moisture (15cm)</span>
            <Droplets className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="mt-2 text-2xl font-bold font-display text-emerald-700 tabular-nums">
            {CURRENT_WEATHER_DATA.soilMoisture}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Volumetric Water Content</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Solar Radiation</span>
            <Sun className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-display text-slate-900 tabular-nums">
            {CURRENT_WEATHER_DATA.solarRadiation}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">W/m² · UV: 7.2</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Wind Speed</span>
            <Wind className="w-4 h-4 text-slate-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-display text-slate-900 tabular-nums">
            {CURRENT_WEATHER_DATA.windSpeed}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">km/h · WSW Breeze</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Evapotranspiration</span>
            <CloudSun className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-display text-purple-700 tabular-nums">
            {CURRENT_WEATHER_DATA.evapotranspiration}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">mm / day reference</p>
        </div>
      </div>

      {/* 7-Day Forecast & Daily GDD Accumulation Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="font-display font-bold text-sm text-slate-900">
              7-Day Meteorological Forecast & Thermal GDD Yield
            </h3>
            <p className="text-xs text-slate-500">
              Simulated temperature variations, rainfall probability, and daily Growing Degree Days
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-800 font-medium">
              <span className="w-3 h-0.5 bg-emerald-600 inline-block" /> Max Temp (°C)
            </span>
            <span className="flex items-center gap-1.5 text-blue-600 font-medium">
              <span className="w-2.5 h-2.5 bg-blue-500/50 inline-block rounded-xs" /> Rainfall (mm)
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={FORECAST_7_DAYS}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis yAxisId="temp" tick={{ fontSize: 11, fill: '#64748b' }} unit="°C" domain={[15, 40]} />
              <YAxis yAxisId="rain" orientation="right" tick={{ fontSize: 11, fill: '#64748b' }} unit="mm" domain={[0, 40]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0B241B', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
              />
              <Bar yAxisId="rain" dataKey="rainMm" fill="#93c5fd" radius={[4, 4, 0, 0]} name="Rainfall (mm)" />
              <Line yAxisId="temp" type="monotone" dataKey="tempMax" stroke="#16A36A" strokeWidth={2.5} name="Max Temp (°C)" />
              <Line yAxisId="temp" type="monotone" dataKey="tempMin" stroke="#64748b" strokeWidth={1.5} strokeDasharray="3 3" name="Min Temp (°C)" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* 7-Day Forecast Cards Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-2">
          {FORECAST_7_DAYS.map((f, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border text-center text-xs space-y-1 transition-all ${
                f.rainMm > 15
                  ? 'bg-blue-50/80 border-blue-200'
                  : 'bg-slate-50/50 border-slate-200/80'
              }`}
            >
              <span className="font-bold text-slate-800 block text-xs">{f.day}</span>
              <span className="text-[10px] text-slate-400 block">{f.date}</span>
              <div className="text-sm font-bold text-slate-900 font-mono tabular-nums my-1">
                {f.tempMax}° / {f.tempMin}°
              </div>
              <span className="text-[10px] text-slate-500 block truncate">{f.condition}</span>
              <span className="text-[10px] text-blue-700 font-mono block">
                {f.rainMm > 0 ? `${f.rainMm} mm` : 'Dry'}
              </span>
              <span className="text-[9px] text-emerald-800 font-mono font-medium block">
                +{f.gddDaily} GDD
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Weather-Based Recommendations Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-700" />
          <div>
            <h3 className="font-display font-bold text-sm text-slate-900">
              Weather-Driven Agronomic Directives
            </h3>
            <p className="text-xs text-slate-500">
              Personalized interventions for {selectedCrop} based on current forecast
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {outlook.weatherRecommendations.map((rec) => (
            <div
              key={rec.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    rec.priority === 'High'
                      ? 'bg-red-100 text-red-800'
                      : rec.priority === 'Medium'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {rec.priority} Priority
                </span>
                <span className="text-[11px] text-slate-500">{rec.category}</span>
              </div>

              <h4 className="font-bold text-slate-900 text-xs">{rec.title}</h4>
              <p className="text-slate-600 text-[11px] leading-relaxed">{rec.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
