import React, { useEffect, useMemo, useState } from 'react';
import {
  CloudSun,
  Droplets,
  Thermometer,
  Wind,
  Sun,
  ShieldAlert,
  Sprout,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  CalendarDays,
  Leaf,
  CloudRain,
  Gauge,
} from 'lucide-react';

import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  Line,
  ReferenceArea,
} from 'recharts';

// Backend URL. You can override this in frontend/.env using VITE_API_URL.
const API_BASE =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const STAGES = [
  'Seedling',
  'Budding',
  'Flowering',
  'Fruiting',
  'Mature',
];

const CROP_PROFILES = {
  Tomato: {
    minTemp: 18,
    maxTemp: 30,
    idealHumidity: 65,
    soilThreshold: 25,
    waterFactor: 1.0,
    stageDays: [25, 25, 30, 35, 20],
    baseTemp: 10,
  },
  Chilli: {
    minTemp: 20,
    maxTemp: 32,
    idealHumidity: 65,
    soilThreshold: 22,
    waterFactor: 0.9,
    stageDays: [30, 30, 35, 40, 20],
    baseTemp: 10,
  },
  Paddy: {
    minTemp: 22,
    maxTemp: 32,
    idealHumidity: 80,
    soilThreshold: 30,
    waterFactor: 1.3,
    stageDays: [25, 35, 30, 30, 25],
    baseTemp: 10,
  },
  Wheat: {
    minTemp: 12,
    maxTemp: 25,
    idealHumidity: 60,
    soilThreshold: 20,
    waterFactor: 0.8,
    stageDays: [20, 35, 30, 25, 20],
    baseTemp: 5,
  },
  Cotton: {
    minTemp: 21,
    maxTemp: 32,
    idealHumidity: 60,
    soilThreshold: 22,
    waterFactor: 0.9,
    stageDays: [25, 35, 30, 45, 25],
    baseTemp: 15,
  },
};

const STAGE_WATER_FACTORS = {
  Seedling: 0.65,
  Budding: 0.9,
  Flowering: 1.0,
  Fruiting: 1.1,
  Mature: 0.7,
};

const numberOrNull = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const average = (values) => {
  const valid = values.filter((v) => Number.isFinite(v));
  if (!valid.length) return null;
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
};

const getRiskLevel = (score) => {
  if (score >= 70) return 'High';
  if (score >= 40) return 'Moderate';
  return 'Low';
};

const getRiskColor = (level) => {
  if (level === 'High') return 'text-red-700 bg-red-50 border-red-200';
  if (level === 'Moderate')
    return 'text-amber-700 bg-amber-50 border-amber-200';
  return 'text-emerald-700 bg-emerald-50 border-emerald-200';
};

const formatDate = (dateString) => {
  if (!dateString) return '--';
  const date = new Date(`${dateString}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? dateString
    : date.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });
};
const FARM_LOCATIONS = [
  {
    name: 'Mysuru, Karnataka',
    latitude: 12.2958,
    longitude: 76.6394,
  },
  {
    name: 'Bengaluru, Karnataka',
    latitude: 12.9716,
    longitude: 77.5946,
  },
  {
    name: 'Mandya, Karnataka',
    latitude: 12.5225,
    longitude: 76.8970,
  },
  {
    name: 'Hassan, Karnataka',
    latitude: 13.0033,
    longitude: 76.1004,
  },
  {
    name: 'Mangaluru, Karnataka',
    latitude: 12.9141,
    longitude: 74.8560,
  },
];

export default function WeatherIntelligence() {
  const [selectedCrop, setSelectedCrop] = useState('Tomato');
  const [currentStage, setCurrentStage] = useState('Seedling');
  const [targetStage, setTargetStage] = useState('Flowering');
const [selectedLocation, setSelectedLocation] = useState(
  FARM_LOCATIONS[0]
);
const [locationQuery, setLocationQuery] = useState('');
const [locationResults, setLocationResults] = useState([]);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const crop = CROP_PROFILES[selectedCrop];
  const searchLocations = async () => {
  if (!locationQuery.trim()) return;

  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationQuery)}&count=10&language=en&format=json`
    );

    const data = await response.json();

    setLocationResults(data.results || []);
  } catch (error) {
    console.error('Location search failed:', error);
  }
};
const selectLocation = (place) => {
    setSelectedLocation({
      name: `${place.name}, ${place.admin1 || ''}, ${place.country}`,
      latitude: place.latitude,
      longitude: place.longitude,
    });

    setLocationResults([]);
    setLocationQuery('');
  };
  // Fetch live weather data from the backend.
  const loadWeather = async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
  latitude: String(selectedLocation.latitude),
  longitude: String(selectedLocation.longitude),
  location: selectedLocation.name,
});

const [currentResponse, forecastResponse] = await Promise.all([
  fetch(`${API_BASE}/weather/current?${params}`),
  fetch(`${API_BASE}/weather/forecast?${params}`),
]);

      if (!currentResponse.ok || !forecastResponse.ok) {
        throw new Error(
          'Could not fetch weather data. Check whether the backend is running.'
        );
      }

      const currentJson = await currentResponse.json();
      const forecastJson = await forecastResponse.json();

      // Supports either a direct object/array or { data: ... } response.
      const currentData = currentJson.data || currentJson;
      const forecastData = forecastJson.data || forecastJson.forecast || forecastJson;

      if (!Array.isArray(forecastData)) {
        throw new Error('Forecast response is not a valid 7-day list.');
      }

      setCurrentWeather(currentData);
      setForecast(forecastData);
    } catch (err) {
      setError(err.message || 'Unable to load weather information.');
    } finally {
      setLoading(false);
    }
  };
useEffect(() => {
  loadWeather();

  const interval = setInterval(
    loadWeather,
    10 * 60 * 1000
  );

  return () => clearInterval(interval);
}, [selectedLocation]);

  const chartData = useMemo(
    () =>
      forecast.map((item, index) => ({
        ...item,
        day: item.day || formatDate(item.date) || `Day ${index + 1}`,
        tempMax: numberOrNull(item.tempMax ?? item.temperatureMax),
        tempMin: numberOrNull(item.tempMin ?? item.temperatureMin),
        rainMm: numberOrNull(item.rainMm ?? item.precipitation ?? 0) ?? 0,
        rainChance:
          numberOrNull(item.rainChance ?? item.precipitationProbability) ?? 0,
        gddDaily: numberOrNull(item.gddDaily) ?? 0,
      })),
    [forecast]
  );

  const temperature = numberOrNull(currentWeather?.temperature);
  const humidity = numberOrNull(currentWeather?.humidity);
  const rainfall = numberOrNull(currentWeather?.rainfall);
  const rainfallProbability = numberOrNull(currentWeather?.rainfallProb);
  const windSpeed = numberOrNull(currentWeather?.windSpeed);
  const soilMoisture = numberOrNull(currentWeather?.soilMoisture);
  const solarRadiation = numberOrNull(currentWeather?.solarRadiation);
  const evapotranspiration = numberOrNull(
    currentWeather?.evapotranspiration
  );

  const averageMaxTemp = average(chartData.map((d) => d.tempMax));
  const averageMinTemp = average(chartData.map((d) => d.tempMin));
  const totalForecastRain = chartData.reduce(
    (sum, day) => sum + (day.rainMm || 0),
    0
  );

  // Estimate days to reach the selected target stage.
  // This is a planning estimate, not a trained crop-growth prediction model.
  const growthEstimate = useMemo(() => {
    const currentIndex = STAGES.indexOf(currentStage);
    const targetIndex = STAGES.indexOf(targetStage);

    if (targetIndex <= currentIndex) {
      return {
        days: 0,
        message:
          targetIndex === currentIndex
            ? 'The crop is already at the selected target stage.'
            : 'The selected target stage comes before the current stage.',
      };
    }

    let baseDays = 0;
    for (let i = currentIndex; i < targetIndex; i += 1) {
      baseDays += crop.stageDays[i];
    }

    let suitability = 1;

    if (
      temperature !== null &&
      (temperature < crop.minTemp || temperature > crop.maxTemp)
    ) {
      suitability -= 0.12;
    }

    if (humidity !== null && humidity > 85) {
      suitability -= 0.08;
    }

    if (totalForecastRain > 60) {
      suitability -= 0.05;
    }

    suitability = Math.max(0.65, Math.min(1, suitability));

    const estimatedDays = Math.ceil(baseDays / suitability);

    return {
      days: estimatedDays,
      message:
        'Estimated using typical stage durations with a basic weather adjustment. Actual crop development also depends on variety, soil, nutrients and farm conditions.',
    };
  }, [
    currentStage,
    targetStage,
    crop,
    temperature,
    humidity,
    totalForecastRain,
  ]);

  // Environmental risk analysis based on current weather and forecast.
  const risks = useMemo(() => {
    const maxTemp = averageMaxTemp ?? temperature;
    const minTemp = averageMinTemp ?? temperature;

    const heatScore =
      maxTemp === null
        ? 0
        : Math.min(100, Math.max(0, (maxTemp - crop.maxTemp) * 12));

    const coldScore =
      minTemp === null
        ? 0
        : Math.min(100, Math.max(0, (crop.minTemp - minTemp) * 12));

    const humidityScore =
      humidity === null
        ? 0
        : Math.min(100, Math.max(0, (humidity - 75) * 4));

    const rainScore = Math.min(
      100,
      Math.max(
        totalForecastRain > 50 ? 60 : 0,
        totalForecastRain * 1.2
      )
    );

    const soilScore =
      soilMoisture === null
        ? 0
        : soilMoisture < crop.soilThreshold
        ? Math.min(100, (crop.soilThreshold - soilMoisture) * 5)
        : soilMoisture > 45
        ? Math.min(100, (soilMoisture - 45) * 5)
        : 0;

    const windScore =
      windSpeed === null
        ? 0
        : Math.min(100, Math.max(0, (windSpeed - 25) * 4));

    const diseaseScore =
      humidity === null
        ? 0
        : Math.min(
            100,
            Math.max(
              0,
              (humidity - 70) * 3 +
                (totalForecastRain > 20 ? 20 : 0)
            )
          );

    return [
      {
        name: 'High Temperature Stress',
        score: Math.round(heatScore),
        detail:
          maxTemp === null
            ? 'Temperature forecast unavailable.'
            : `Forecast maximum: ${maxTemp.toFixed(1)}°C. Crop range: ${crop.minTemp}–${crop.maxTemp}°C.`,
        action: 'Irrigate during cooler hours and consider temporary shade if heat stress persists.',
      },
      {
        name: 'Low Temperature Stress',
        score: Math.round(coldScore),
        detail:
          minTemp === null
            ? 'Temperature forecast unavailable.'
            : `Forecast minimum: ${minTemp.toFixed(1)}°C. Crop minimum: ${crop.minTemp}°C.`,
        action: 'Monitor sensitive plants and protect them if temperatures fall below the crop range.',
      },
      {
        name: 'Excess Rainfall',
        score: Math.round(rainScore),
        detail: `Expected rainfall over 7 days: ${totalForecastRain.toFixed(1)} mm.`,
        action: 'Check field drainage and avoid unnecessary irrigation before expected rainfall.',
      },
      {
        name: 'Humidity / Disease Favourability',
        score: Math.round(diseaseScore),
        detail:
          humidity === null
            ? 'Humidity data unavailable.'
            : `Current relative humidity: ${humidity.toFixed(0)}%. High humidity with rain can favour fungal diseases.`,
        action: 'Monitor leaves for disease symptoms, improve airflow and avoid overhead irrigation.',
      },
      {
        name: 'Soil Moisture Stress',
        score: Math.round(soilScore),
        detail:
          soilMoisture === null
            ? 'Soil moisture is unavailable from the weather response.'
            : `Estimated soil moisture: ${soilMoisture.toFixed(1)}%.`,
        action:
          soilMoisture === null
            ? 'Use a field soil-moisture sensor or manual soil check before irrigation.'
            : soilMoisture < crop.soilThreshold
            ? 'Soil moisture is below the configured crop threshold. Check the field and plan irrigation.'
            : 'Continue monitoring soil moisture and avoid waterlogging.',
      },
      {
        name: 'High Wind Risk',
        score: Math.round(windScore),
        detail:
          windSpeed === null
            ? 'Wind speed unavailable.'
            : `Current wind speed: ${windSpeed.toFixed(1)} km/h.`,
        action: 'Inspect plant support and avoid spraying pesticides during strong winds.',
      },
    ];
  }, [
    averageMaxTemp,
    averageMinTemp,
    temperature,
    humidity,
    totalForecastRain,
    soilMoisture,
    windSpeed,
    crop,
  ]);

  // Irrigation planning: ET0 x crop factor, adjusted by growth stage.
  const irrigation = useMemo(() => {
    const stageFactor = STAGE_WATER_FACTORS[currentStage] || 1;
    const et0 = evapotranspiration ?? 4;
    const estimatedDailyNeed =
      et0 * crop.waterFactor * stageFactor;

    const rainExpected = chartData.some(
      (day) => day.rainMm >= 5 || day.rainChance >= 60
    );

    const soilIsDry =
      soilMoisture !== null && soilMoisture < crop.soilThreshold;

    let status = 'Monitor soil moisture';
    let recommendation =
      'Check soil moisture before irrigating. Avoid watering if the root zone is already moist.';

    if (rainExpected && !soilIsDry) {
      status = 'Irrigation can be postponed';
      recommendation =
        'Rain is expected in the forecast. Recheck soil moisture after rainfall before irrigating.';
    } else if (soilIsDry) {
      status = 'Irrigation may be needed';
      recommendation =
        'The available soil-moisture estimate is below the selected crop threshold. Verify in the field and irrigate if the root zone is dry.';
    } else if (rainExpected && soilIsDry) {
      status = 'Check field before irrigating';
      recommendation =
        'Soil moisture appears low, but rain is forecast. Check the field and avoid over-irrigation.';
    } else if (soilMoisture === null) {
      status = 'Soil check required';
      recommendation =
        'No soil-moisture value is available. Check the soil manually or use a sensor before deciding to irrigate.';
    }

    // 1 mm of water over 1 acre is approximately 4,047 litres.
    const estimatedLitresPerAcre = Math.round(
      estimatedDailyNeed * 4047
    );

    return {
      status,
      recommendation,
      dailyNeedMm: estimatedDailyNeed,
      litresPerAcre: estimatedLitresPerAcre,
      rainExpected,
      soilIsDry,
    };
  }, [
    chartData,
    evapotranspiration,
    crop,
    currentStage,
    soilMoisture,
  ]);

  const overallRisk = Math.max(...risks.map((risk) => risk.score));
  const highRiskCount = risks.filter(
    (risk) => getRiskLevel(risk.score) === 'High'
  ).length;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
            AgroVision AI · Farm Decision Support
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Weather, Growth & Irrigation Intelligence
          </h1>
          <p className="text-sm text-slate-500 mt-2 max-w-3xl">
            Weather-driven crop monitoring, growth-stage estimation,
            irrigation planning and environmental risk assessment in one place.
          </p>
        </div>

        <button
          onClick={loadWeather}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Weather
        </button>
      </div>
      {/* Farm Location Selection */}
<div className="mb-6">
  <h2 className="text-lg font-semibold mb-2">
    Select Farm Location
  </h2>

  <div className="flex gap-2">
    <input
      type="text"
      value={locationQuery}
      onChange={(e) => setLocationQuery(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') searchLocations();
      }}
      placeholder="Search any city or town..."
      className="border rounded-lg p-2 flex-1"
    />

    <button
      onClick={searchLocations}
      className="bg-green-600 text-white px-4 rounded-lg"
    >
      Search
    </button>
  </div>

  {locationResults.length > 0 && (
    <div className="border rounded-lg mt-2">
      {locationResults.map((place) => (
        <button
          key={`${place.id}-${place.latitude}`}
          onClick={() => selectLocation(place)}
          className="block w-full text-left p-3 hover:bg-gray-100"
        >
          {place.name}, {place.admin1 || ''}, {place.country}
        </button>
      ))}
    </div>
  )}

  <p className="mt-2 text-sm text-gray-500">
    Current location: {selectedLocation.name}
  </p>
</div>

      {/* Crop and stage selection */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Sprout className="w-5 h-5 text-emerald-700" />
          <h2 className="font-bold text-slate-900">Crop Configuration</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              Select Crop
            </label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-600"
            >
              {Object.keys(CROP_PROFILES).map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              Current Growth Stage
            </label>
            <select
              value={currentStage}
              onChange={(e) => setCurrentStage(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-600"
            >
              {STAGES.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              Target Growth Stage
            </label>
            <select
              value={targetStage}
              onChange={(e) => setTargetStage(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-600"
            >
              {STAGES.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-900">
          Ideal temperature range for {selectedCrop}:{' '}
          <strong>
            {crop.minTemp}°C – {crop.maxTemp}°C
          </strong>
          {' · '}
          Soil-moisture planning threshold:{' '}
          <strong>{crop.soilThreshold}%</strong>
        </div>
      </section>

      {/* Loading and error states */}
      {loading && !currentWeather && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
          Loading current weather and 7-day forecast...
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-semibold">Weather data could not be loaded</p>
            <p className="mt-1">{error}</p>
            <p className="mt-1 text-xs">
              Check that the backend is running and that the weather endpoints
              are available at /api/weather/current and /api/weather/forecast.
            </p>
          </div>
        </div>
      )}

      {/* Current weather */}
      {currentWeather && (
        <>
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-slate-900">
                Current Weather Conditions
              </h2>
              <span className="text-xs text-emerald-700 font-medium">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />
                Live API data
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
              {[
                {
                  label: 'Temperature',
                  value: temperature === null ? '--' : `${temperature.toFixed(1)}°C`,
                  icon: Thermometer,
                  color: 'text-orange-600',
                },
                {
                  label: 'Humidity',
                  value: humidity === null ? '--' : `${humidity.toFixed(0)}%`,
                  icon: Droplets,
                  color: 'text-blue-600',
                },
                {
                  label: 'Soil Moisture',
                  value: soilMoisture === null ? 'Unavailable' : `${soilMoisture.toFixed(1)}%`,
                  icon: Gauge,
                  color: 'text-emerald-700',
                },
                {
                  label: 'Wind Speed',
                  value: windSpeed === null ? '--' : `${windSpeed.toFixed(1)} km/h`,
                  icon: Wind,
                  color: 'text-slate-600',
                },
                {
                  label: 'Rainfall',
                  value: rainfall === null ? '--' : `${rainfall.toFixed(1)} mm`,
                  icon: CloudRain,
                  color: 'text-blue-700',
                },
                {
                  label: 'Evapotranspiration',
                  value: evapotranspiration === null ? '--' : `${evapotranspiration.toFixed(1)} mm`,
                  icon: Sun,
                  color: 'text-amber-600',
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        {item.label}
                      </span>
                      <Icon className={`w-4 h-4 ${item.color}`} />
                    </div>
                    <p className="mt-3 text-xl font-bold text-slate-900">
                      {item.value}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Temperature comparison */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-900 mb-2">
              Crop Temperature Suitability
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Current temperature compared with the configured ideal range for{' '}
              {selectedCrop}.
            </p>

            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-slate-500">Current temperature</span>
              <strong>
                {temperature === null ? '--' : `${temperature.toFixed(1)}°C`}
              </strong>
            </div>

            <div className="relative h-4 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="absolute h-full bg-emerald-200"
                style={{
                  left: `${(crop.minTemp / 45) * 100}%`,
                  width: `${((crop.maxTemp - crop.minTemp) / 45) * 100}%`,
                }}
              />
              {temperature !== null && (
                <div
                  className="absolute top-0 h-full w-1 bg-slate-900"
                  style={{
                    left: `${Math.min(100, Math.max(0, (temperature / 45) * 100))}%`,
                  }}
                />
              )}
            </div>

            <div className="mt-2 flex justify-between text-xs text-slate-500">
              <span>0°C</span>
              <span>
                Ideal: {crop.minTemp}°C – {crop.maxTemp}°C
              </span>
              <span>45°C</span>
            </div>

            <p className="mt-3 text-sm font-medium">
              {temperature === null
                ? 'Temperature information is unavailable.'
                : temperature >= crop.minTemp && temperature <= crop.maxTemp
                ? 'Current temperature is within the configured ideal range.'
                : 'Current temperature is outside the configured ideal range. Monitor the crop for stress.'}
            </p>
          </section>
        </>
      )}

      {/* Seven-day forecast */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="font-bold text-slate-900">
            7-Day Weather Forecast
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            X-axis: forecast day · Left Y-axis: temperature (°C) · Right
            Y-axis: rainfall (mm)
          </p>
        </div>

        {chartData.length > 0 ? (
          <>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartData}
                  margin={{ top: 10, right: 12, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11 }}
                    interval={0}
                  />
                  <YAxis
                    yAxisId="temperature"
                    domain={['auto', 'auto']}
                    tick={{ fontSize: 11 }}
                    unit="°C"
                    label={{
                      value: 'Temperature (°C)',
                      angle: -90,
                      position: 'insideLeft',
                      style: { fontSize: 11 },
                    }}
                  />
                  <YAxis
                    yAxisId="rain"
                    orientation="right"
                    tick={{ fontSize: 11 }}
                    unit=" mm"
                    label={{
                      value: 'Rainfall (mm)',
                      angle: 90,
                      position: 'insideRight',
                      style: { fontSize: 11 },
                    }}
                  />
                  <Tooltip />
                  <Legend />
                  <Bar
                    yAxisId="rain"
                    dataKey="rainMm"
                    name="Rainfall (mm)"
                    fill="#93c5fd"
                    radius={[4, 4, 0, 0]}
                  />
                  <Line
                    yAxisId="temperature"
                    type="monotone"
                    dataKey="tempMax"
                    name="Maximum temperature (°C)"
                    stroke="#e87936"
                    strokeWidth={2.5}
                    connectNulls
                  />
                  <Line
                    yAxisId="temperature"
                    type="monotone"
                    dataKey="tempMin"
                    name="Minimum temperature (°C)"
                    stroke="#2563eb"
                    strokeWidth={2}
                    connectNulls
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mt-4">
              {chartData.map((day, index) => (
                <div
                  key={`${day.date || day.day}-${index}`}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center"
                >
                  <p className="text-xs font-bold text-slate-800">
                    {day.day}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {formatDate(day.date)}
                  </p>
                  <p className="text-sm font-bold text-slate-900 mt-2">
                    {day.tempMax ?? '--'}° / {day.tempMin ?? '--'}°
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    {day.rainMm.toFixed(1)} mm rain
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Rain chance: {day.rainChance}%
                  </p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-sm text-slate-500 py-10 text-center">
            {loading ? 'Loading forecast...' : 'No forecast data available.'}
          </p>
        )}
      </section>

      {/* Growth stage prediction */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="w-5 h-5 text-emerald-700" />
          <h2 className="font-bold text-slate-900">
            Growth Stage Estimation
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Current stage</p>
            <p className="text-lg font-bold text-slate-900 mt-1">
              {currentStage}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Target stage</p>
            <p className="text-lg font-bold text-slate-900 mt-1">
              {targetStage}
            </p>
          </div>
          <div className="rounded-xl bg-emerald-50 p-4">
            <p className="text-xs text-emerald-700">Estimated time</p>
            <p className="text-2xl font-extrabold text-emerald-800 mt-1">
              {growthEstimate.days === 0
                ? 'Already reached'
                : `${growthEstimate.days} days`}
            </p>
          </div>
        </div>

        <p className="text-xs leading-relaxed text-slate-500 mt-3">
          {growthEstimate.message}
        </p>
      </section>

      {/* Smart irrigation */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Droplets className="w-5 h-5 text-blue-600" />
          <h2 className="font-bold text-slate-900">
            Smart Irrigation Recommendation
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-xl bg-blue-50 p-4">
            <p className="text-xs text-blue-700">Estimated daily water need</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">
              {irrigation.dailyNeedMm.toFixed(1)} mm
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Approximate crop water demand
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">
              Approximate water per acre
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {irrigation.litresPerAcre.toLocaleString('en-IN')} L
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Estimated daily requirement, not a measured application volume
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">7-day expected rainfall</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {totalForecastRain.toFixed(1)} mm
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Based on weather forecast
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center gap-2">
            {irrigation.rainExpected ? (
              <CloudRain className="w-5 h-5 text-blue-700" />
            ) : (
              <Droplets className="w-5 h-5 text-blue-700" />
            )}
            <p className="font-bold text-blue-900">{irrigation.status}</p>
          </div>
          <p className="text-sm text-blue-900 mt-2">
            {irrigation.recommendation}
          </p>
        </div>

        <p className="text-xs text-slate-500 mt-3">
          Water demand is approximated from reference evapotranspiration,
          crop factor and selected growth stage. Actual irrigation depends on
          soil type, field area, irrigation method and measured root-zone
          moisture.
        </p>
      </section>

      {/* Environmental risk assessment */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-600" />
            <h2 className="font-bold text-slate-900">
              Environmental Risk Assessment
            </h2>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              getRiskLevel(overallRisk) === 'High'
                ? 'bg-red-100 text-red-700'
                : getRiskLevel(overallRisk) === 'Moderate'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {getRiskLevel(overallRisk)} · Highest risk score {overallRisk}/100
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {risks.map((risk) => {
            const level = getRiskLevel(risk.score);

            return (
              <div
                key={risk.name}
                className="rounded-xl border border-slate-200 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {risk.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {risk.detail}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold ${getRiskColor(
                      level
                    )}`}
                  >
                    {level}
                  </span>
                </div>

                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Risk score</span>
                    <strong>{risk.score}/100</strong>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        level === 'High'
                          ? 'bg-red-500'
                          : level === 'Moderate'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${risk.score}%` }}
                    />
                  </div>
                </div>

                <div className="mt-3 flex items-start gap-2 text-xs text-slate-600">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <p>{risk.action}</p>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-slate-500 mt-4">
          Risk scores are rule-based indicators derived from the available
          weather values and configured crop thresholds. They are not
          laboratory disease diagnoses or outputs from a trained risk model.
        </p>
      </section>

      {/* Footer */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-start gap-2">
          <Leaf className="w-5 h-5 text-emerald-700 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-slate-800">
              AgroVision AI Decision Support
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Recommendations are estimates based on available weather data.
              Farmers should verify soil conditions and local field conditions
              before taking irrigation or crop-protection decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}