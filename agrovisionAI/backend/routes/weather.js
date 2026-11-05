
import express from 'express';

const router = express.Router();

// Mysuru coordinates (can be changed using .env)
const FARM_LATITUDE = Number(process.env.FARM_LATITUDE || 12.2958);
const FARM_LONGITUDE = Number(process.env.FARM_LONGITUDE || 76.6394);

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';
function getCoordinates(req, res) {
  const latitude = Number(req.query.latitude ?? FARM_LATITUDE);
  const longitude = Number(req.query.longitude ?? FARM_LONGITUDE);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    res.status(400).json({
      message: 'Invalid latitude or longitude',
    });

    return null;
  }

  return { latitude, longitude };
}
const weatherDescriptions = {
  0: 'Clear Sky',
  1: 'Mainly Clear',
  2: 'Partly Cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing Rime Fog',
  51: 'Light Drizzle',
  53: 'Moderate Drizzle',
  55: 'Dense Drizzle',
  61: 'Slight Rain',
  63: 'Moderate Rain',
  65: 'Heavy Rain',
  71: 'Slight Snow',
  73: 'Moderate Snow',
  75: 'Heavy Snow',
  80: 'Rain Showers',
  81: 'Moderate Rain Showers',
  82: 'Violent Rain Showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with Hail',
  99: 'Severe Thunderstorm with Hail',
};

function getWeatherDescription(code) {
  return weatherDescriptions[code] || 'Variable Conditions';
}

function getCurrentHourIndex(times) {
  const now = Date.now();

  if (!times || !times.length) return 0;

  let closestIndex = 0;
  let smallestDifference = Infinity;

  times.forEach((time, index) => {
    const difference = Math.abs(new Date(time).getTime() - now);

    if (difference < smallestDifference) {
      smallestDifference = difference;
      closestIndex = index;
    }
  });

  return closestIndex;
}

async function fetchOpenMeteo(latitude, longitude) {
  const params = new URLSearchParams({
    latitude: String(latitude),
longitude: String(longitude),
    timezone: 'auto',
    forecast_days: '7',

    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'precipitation',
      'weather_code',
      'wind_speed_10m',
      'wind_direction_10m',
      'shortwave_radiation',
      'uv_index',
    ].join(','),

    hourly: [
      'relative_humidity_2m',
      'shortwave_radiation',
      'soil_moisture_0_to_7cm',
      'soil_temperature_0cm',
    ].join(','),

    daily: [
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_sum',
      'precipitation_probability_max',
      'weather_code',
      'et0_fao_evapotranspiration',
      'shortwave_radiation_sum',
    ].join(','),
  });

  const url = `${OPEN_METEO_URL}?${params}`;

console.log('Open-Meteo request:', url);

let response;

for (let attempt = 0; attempt < 3; attempt++) {
  response = await fetch(url);

  if (response.ok) {
    break;
  }

  const errorBody = await response.text();

  console.error(
    `Open-Meteo attempt ${attempt + 1} failed:`,
    response.status,
    errorBody
  );

  if (
    ![429, 500, 502, 503, 504].includes(response.status) ||
    attempt === 2
  ) {
    throw new Error(
      `Open-Meteo API error: ${response.status}`
    );
  }

  await new Promise((resolve) =>
    setTimeout(resolve, 1000 * (attempt + 1))
  );
}

return response.json();
}

// GET /api/weather/current
router.get('/current', async (req, res) => {
  try {
   const coordinates = getCoordinates(req, res);
if (!coordinates) return;

const data = await fetchOpenMeteo(
  coordinates.latitude,
  coordinates.longitude
);

    const current = data.current;
    const daily = data.daily;
    const hourly = data.hourly;

    const hourIndex = getCurrentHourIndex(hourly.time);

    const currentWeather = {
      location:
  typeof req.query.location === 'string'
    ? req.query.location
    : 'Selected Farm Location',

      lastUpdated: current.time,

      temperature: current.temperature_2m,

      apparentTemp: current.apparent_temperature,

      tempMin: daily.temperature_2m_min[0],

      tempMax: daily.temperature_2m_max[0],

      humidity: current.relative_humidity_2m,

      rainfall: current.precipitation,

      rainfallProb: daily.precipitation_probability_max[0],

      solarRadiation: current.shortwave_radiation,

      uvIndex: current.uv_index,

      windSpeed: current.wind_speed_10m,

      windDirection: current.wind_direction_10m,

      soilMoisture:
        hourly.soil_moisture_0_to_7cm?.[hourIndex] != null
          ? hourly.soil_moisture_0_to_7cm[hourIndex] * 100
          : null,

      soilTemperature:
        hourly.soil_temperature_0cm?.[hourIndex] ?? null,

      evapotranspiration:
        daily.et0_fao_evapotranspiration[0],
    };

    res.json(currentWeather);

  } catch (error) {
    console.error('Current weather error:', error.message);

    res.status(500).json({
      message: 'Unable to retrieve current weather from Open-Meteo',
      error: error.message,
    });
  }
});

// GET /api/weather/forecast
router.get('/forecast', async (req, res) => {
  try {
   const coordinates = getCoordinates(req, res);
if (!coordinates) return;

const data = await fetchOpenMeteo(
  coordinates.latitude,
  coordinates.longitude
);

    const daily = data.daily;

    const forecast = daily.time.map((date, index) => {
      const maxTemp = daily.temperature_2m_max[index];
      const minTemp = daily.temperature_2m_min[index];

      const meanTemp = (maxTemp + minTemp) / 2;

      // General Growing Degree Days.
      // Crop-specific base temperatures will be applied
      // in the irrigation and growth prediction calculations.
      const gddDaily = Math.max(0, meanTemp - 10);

      const weatherCode = daily.weather_code[index];

      return {
        day: new Date(`${date}T12:00:00`).toLocaleDateString(
          'en-US',
          { weekday: 'short' }
        ),

        date,

        tempMax: maxTemp,

        tempMin: minTemp,

        humidity: null,

        rainMm: daily.precipitation_sum[index],

        rainChance:
          daily.precipitation_probability_max[index],

        gddDaily: Number(gddDaily.toFixed(1)),

        condition: getWeatherDescription(weatherCode),

        solar:
          daily.shortwave_radiation_sum[index],

        evapotranspiration:
          daily.et0_fao_evapotranspiration[index],

        weatherCode,
      };
    });

    res.json(forecast);

  } catch (error) {
    console.error('Forecast error:', error.message);

    res.status(500).json({
      message: 'Unable to retrieve weather forecast from Open-Meteo',
      error: error.message,
    });
  }
});

export default router;
