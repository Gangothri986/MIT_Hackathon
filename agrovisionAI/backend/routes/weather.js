import express from 'express';

const router = express.Router();

const CURRENT_WEATHER = {
  location: 'Local Farm Weather Station',
  lastUpdated: '10 mins ago',
  temperature: 29.4,
  apparentTemp: 31.2,
  tempMin: 20.8,
  tempMax: 32.6,
  humidity: 68,
  rainfall: 0.0,
  rainfallProb: 15,
  solarRadiation: 840,
  uvIndex: 7.2,
  windSpeed: 11.4,
  soilMoisture: 32,
  soilTemperature: 24.8,
  evapotranspiration: 4.8,
};

const FORECAST_7_DAYS = [
  { day: 'Wed', date: 'Nov 04', tempMax: 32, tempMin: 21, humidity: 68, rainMm: 0, rainChance: 10, gddDaily: 16.5, condition: 'Partly Sunny', solar: 840 },
  { day: 'Thu', date: 'Nov 05', tempMax: 33, tempMin: 22, humidity: 72, rainMm: 2, rainChance: 30, gddDaily: 17.5, condition: 'Scattered Clouds', solar: 810 },
  { day: 'Fri', date: 'Nov 06', tempMax: 34, tempMin: 23, humidity: 79, rainMm: 12, rainChance: 65, gddDaily: 18.5, condition: 'Thunder Showers', solar: 680 },
  { day: 'Sat', date: 'Nov 07', tempMax: 30, tempMin: 21, humidity: 84, rainMm: 28, rainChance: 85, gddDaily: 15.5, condition: 'Heavy Rain', solar: 520 },
  { day: 'Sun', date: 'Nov 08', tempMax: 29, tempMin: 20, humidity: 82, rainMm: 8, rainChance: 50, gddDaily: 14.5, condition: 'Overcast & Drizzle', solar: 610 },
  { day: 'Mon', date: 'Nov 09', tempMax: 31, tempMin: 20, humidity: 71, rainMm: 0, rainChance: 15, gddDaily: 15.5, condition: 'Clear Sky', solar: 870 },
  { day: 'Tue', date: 'Nov 10', tempMax: 32, tempMin: 21, humidity: 66, rainMm: 0, rainChance: 10, gddDaily: 16.5, condition: 'Sunny', solar: 890 },
];

router.get('/current', (req, res) => {
  res.json(CURRENT_WEATHER);
});

router.get('/forecast', (req, res) => {
  res.json(FORECAST_7_DAYS);
});

export default router;
