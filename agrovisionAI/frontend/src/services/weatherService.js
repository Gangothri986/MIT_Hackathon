import { apiClient, isDemoMode } from './api';

export const CURRENT_WEATHER_DATA = {
  location: 'Local Farm Weather Station',
  lastUpdated: '10 mins ago',
  temperature: 29.4, // °C
  apparentTemp: 31.2,
  tempMin: 20.8,
  tempMax: 32.6,
  humidity: 68, // %
  rainfall: 0.0, // mm (last 24h)
  rainfallProb: 15, // %
  solarRadiation: 840, // W/m²
  uvIndex: 7.2,
  windSpeed: 11.4, // km/h
  windDirection: 'WSW',
  soilMoisture: 32, // %
  soilTemperature: 24.8, // °C
  evapotranspiration: 4.8, // mm/day
};

export const FORECAST_7_DAYS = [
  { day: 'Wed', date: 'Nov 04', tempMax: 32, tempMin: 21, humidity: 68, rainMm: 0, rainChance: 10, gddDaily: 16.5, condition: 'Partly Sunny', solar: 840 },
  { day: 'Thu', date: 'Nov 05', tempMax: 33, tempMin: 22, humidity: 72, rainMm: 2, rainChance: 30, gddDaily: 17.5, condition: 'Scattered Clouds', solar: 810 },
  { day: 'Fri', date: 'Nov 06', tempMax: 34, tempMin: 23, humidity: 79, rainMm: 12, rainChance: 65, gddDaily: 18.5, condition: 'Thunder Showers', solar: 680 },
  { day: 'Sat', date: 'Nov 07', tempMax: 30, tempMin: 21, humidity: 84, rainMm: 28, rainChance: 85, gddDaily: 15.5, condition: 'Heavy Rain', solar: 520 },
  { day: 'Sun', date: 'Nov 08', tempMax: 29, tempMin: 20, humidity: 82, rainMm: 8, rainChance: 50, gddDaily: 14.5, condition: 'Overcast & Drizzle', solar: 610 },
  { day: 'Mon', date: 'Nov 09', tempMax: 31, tempMin: 20, humidity: 71, rainMm: 0, rainChance: 15, gddDaily: 15.5, condition: 'Clear Sky', solar: 870 },
  { day: 'Tue', date: 'Nov 10', tempMax: 32, tempMin: 21, humidity: 66, rainMm: 0, rainChance: 10, gddDaily: 16.5, condition: 'Sunny', solar: 890 },
];

export const HOURLY_TEMPERATURE_DATA = [
  { time: '06:00', temp: 21.2, humidity: 88, soilMoist: 33 },
  { time: '09:00', temp: 25.4, humidity: 76, soilMoist: 32 },
  { time: '12:00', temp: 31.8, humidity: 62, soilMoist: 31 },
  { time: '15:00', temp: 32.6, humidity: 58, soilMoist: 29 },
  { time: '18:00', temp: 27.5, humidity: 72, soilMoist: 30 },
  { time: '21:00', temp: 24.1, humidity: 81, soilMoist: 31 },
  { time: '00:00', temp: 22.3, humidity: 85, soilMoist: 32 },
];

export const weatherService = {
  async getCurrentWeather() {
    if (isDemoMode()) {
      await new Promise((resolve) => setTimeout(resolve, 150));
      return CURRENT_WEATHER_DATA;
    }
    const res = await apiClient.get('/weather/current');
    return res.data;
  },

  async getForecast() {
    if (isDemoMode()) {
      await new Promise((resolve) => setTimeout(resolve, 150));
      return FORECAST_7_DAYS;
    }
    const res = await apiClient.get('/weather/forecast');
    return res.data;
  },

  calculateEnvironmentalRisks(cropType = 'Tomato', currentStage = 'Flowering') {
    return [
      {
        id: 'heat_stress',
        title: 'Heat Stress Risk',
        score: 42,
        level: 'Moderate',
        factors: ['Projected peak temperature 34°C on Friday', 'Solar irradiance peaking at 890 W/m²'],
        explanation: `${cropType} pollen viability may decrease if ambient daytime temperatures exceed 33°C during ${currentStage}. High heat can cause blossom drop.`,
        recommendation: 'Ensure adequate irrigation and consider light misting or shade netting during midday peaks.',
      },
      {
        id: 'water_stress',
        title: 'Water Stress / Drought Risk',
        score: 22,
        level: 'Low',
        factors: ['Soil moisture steady at 32%', 'Rainfall forecasted over the weekend'],
        explanation: 'Adequate soil moisture in root zone. Upcoming rainfall will replenish moisture levels.',
        recommendation: 'Pause drip lines ahead of heavy showers to prevent waterlogging.',
      },
      {
        id: 'excess_rainfall',
        title: 'Excess Rainfall Risk',
        score: 68,
        level: 'High',
        factors: ['Predicted 28mm intense localized rainfall on Saturday', 'High runoff in open furrows'],
        explanation: 'Sudden heavy downpour can lead to pooling in low spots and wash away loose fertilizers.',
        recommendation: 'Inspect field trenches and clear furrows to ensure excess water drains quickly.',
      },
      {
        id: 'humidity_disease',
        title: 'Humidity-Related Disease Risk',
        score: 82,
        level: 'Critical',
        factors: ['Extended leaf wetness (>8 hours predicted)', 'Relative humidity reaching 84%', 'Warm nighttime temperatures'],
        explanation: 'High moisture and wet leaves create ideal conditions for foliar fungal diseases like Early Blight.',
        recommendation: 'Apply preventive organic bio-fungicide or protective spray before the rains begin.',
      },
      {
        id: 'growth_conditions',
        title: 'Unfavourable Growth Conditions',
        score: 36,
        level: 'Moderate',
        factors: ['Overcast weather over the weekend reduces sunlight'],
        explanation: 'Intermittent clouds temporarily slow photosynthetic activity for a day or two.',
        recommendation: 'Maintain standard nutrition; normal growth resumes once sunny skies return.',
      },
    ];
  },

  calculateGrowthOutlook(cropType = 'Tomato', currentStage = 'Flowering') {
    const totalGdd7Days = FORECAST_7_DAYS.reduce((acc, curr) => acc + curr.gddDaily, 0);

    return {
      growthFavourabilityScore: 78,
      outlookStatus: 'Favourable with Precaution for Rainy Days',
      gdd7DaysAccumulation: totalGdd7Days,
      phenologicalProjections: [
        {
          milestone: 'Flowering Peak',
          estimatedDate: '2026-11-08',
          status: 'Active Now',
          isEstimate: false,
          gddRequired: 720,
          currentGdd: 680,
        },
        {
          milestone: 'Fruit Formation (Set)',
          estimatedDate: '2026-11-14',
          status: 'Projected',
          isEstimate: true,
          gddRequired: 1100,
          currentGdd: 680,
        },
        {
          milestone: 'First Harvest / Maturity',
          estimatedDate: '2026-12-10',
          status: 'Estimated',
          isEstimate: true,
          gddRequired: 1400,
          currentGdd: 680,
        },
      ],
      weatherRecommendations: [
        {
          id: 'WR-01',
          priority: 'High',
          category: 'Disease Mitigation',
          title: 'Apply Pre-Rain Protective Spray',
          desc: 'High humidity (>82%) and weekend rain can trigger fungal spores. Spray protective spray before rain.',
        },
        {
          id: 'WR-02',
          priority: 'Medium',
          category: 'Water Management',
          title: 'Pause Irrigation Before Heavy Rain',
          desc: 'With rain forecasted, save water and power by pausing routine irrigation.',
        },
        {
          id: 'WR-03',
          priority: 'Low',
          category: 'Plant Care',
          title: 'Clear Drainage Ditches',
          desc: 'Ensure water flows easily away from plant roots to keep them healthy.',
        },
      ],
    };
  },
};
