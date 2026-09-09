import { Theme } from "./types";

export interface GoogleWeatherData {
  location: string;
  coordinates: { lat: number; lng: number };
  tempC: number;
  feelsLikeC: number;
  condition: "sunny" | "partly_cloudy" | "overcast" | "rain_showers" | "thunderstorm" | "clear";
  conditionLabel: string;
  humidityPct: number;
  windSpeedKmH: number;
  windDirection: string;
  uvIndex: number;
  precipProbPct: number;
  dewPointC: number;
  airPressureHpa: number;
  visibilityKm: number;
  pitchImpactAdvice: string;
  dewFactor: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  hourlyForecast: {
    time: string;
    tempC: number;
    rainProbPct: number;
    icon: string;
    condition: string;
    windKmH: number;
  }[];
}

const VENUE_WEATHER_DATABASE: Record<string, GoogleWeatherData> = {
  "Bowden's Field": {
    location: "Westville, eThekwini (Bowden's Field Oval)",
    coordinates: { lat: -29.8311, lng: 30.9283 },
    tempC: 26,
    feelsLikeC: 28,
    condition: "sunny",
    conditionLabel: "☀️ Clear Skies & Gentle Coastal Breeze",
    humidityPct: 62,
    windSpeedKmH: 14,
    windDirection: "SE (140°)",
    uvIndex: 8,
    precipProbPct: 5,
    dewPointC: 18,
    airPressureHpa: 1014,
    visibilityKm: 10,
    pitchImpactAdvice: "Dry pitch conditions expected until 15:30. Early coastal moisture will assist seamers for first 6 overs; low dew factor in 2nd innings.",
    dewFactor: "LOW",
    hourlyForecast: [
      { time: "09:00", tempC: 22, rainProbPct: 5, icon: "☀️", condition: "Clear", windKmH: 10 },
      { time: "11:00", tempC: 25, rainProbPct: 5, icon: "☀️", condition: "Sunny", windKmH: 12 },
      { time: "13:00", tempC: 27, rainProbPct: 10, icon: "☀️", condition: "Sunny", windKmH: 15 },
      { time: "15:00", tempC: 26, rainProbPct: 10, icon: "⛅", condition: "Partly Cloudy", windKmH: 14 },
      { time: "17:00", tempC: 23, rainProbPct: 15, icon: "🌤️", condition: "Mild", windKmH: 11 },
    ],
  },
  "Nets 1-3": {
    location: "Westville High Nets Training Facility",
    coordinates: { lat: -29.8315, lng: 30.9288 },
    tempC: 23,
    feelsLikeC: 24,
    condition: "partly_cloudy",
    conditionLabel: "⛅ Mild & Moderate Cloud Cover",
    humidityPct: 58,
    windSpeedKmH: 10,
    windDirection: "E (90°)",
    uvIndex: 6,
    precipProbPct: 15,
    dewPointC: 15,
    airPressureHpa: 1016,
    visibilityKm: 10,
    pitchImpactAdvice: "Excellent net practice weather. Synthetic pitch bounce will remain consistent with stable temperature.",
    dewFactor: "LOW",
    hourlyForecast: [
      { time: "14:30", tempC: 23, rainProbPct: 15, icon: "⛅", condition: "Partly Cloudy", windKmH: 10 },
      { time: "15:30", tempC: 23, rainProbPct: 15, icon: "⛅", condition: "Partly Cloudy", windKmH: 11 },
      { time: "16:30", tempC: 22, rainProbPct: 20, icon: "🌥️", condition: "Overcast", windKmH: 9 },
    ],
  },
  "Roy Couzens Oval": {
    location: "Roy Couzens Oval, Westville",
    coordinates: { lat: -29.8305, lng: 30.9275 },
    tempC: 25,
    feelsLikeC: 26,
    condition: "sunny",
    conditionLabel: "☀️ Crisp Sunny Morning",
    humidityPct: 55,
    windSpeedKmH: 12,
    windDirection: "ESE (120°)",
    uvIndex: 7,
    precipProbPct: 0,
    dewPointC: 16,
    airPressureHpa: 1015,
    visibilityKm: 10,
    pitchImpactAdvice: "Firm, dry track. Winning the toss and batting first recommended to set target in clear weather.",
    dewFactor: "LOW",
    hourlyForecast: [
      { time: "10:00", tempC: 23, rainProbPct: 0, icon: "☀️", condition: "Sunny", windKmH: 10 },
      { time: "12:00", tempC: 26, rainProbPct: 0, icon: "☀️", condition: "Sunny", windKmH: 12 },
      { time: "14:00", tempC: 25, rainProbPct: 5, icon: "☀️", condition: "Sunny", windKmH: 13 },
    ],
  },
  "The Memorial Ground, Durban": {
    location: "DHS Memorial Ground, Musgrave, Durban",
    coordinates: { lat: -29.8490, lng: 31.0020 },
    tempC: 28,
    feelsLikeC: 31,
    condition: "sunny",
    conditionLabel: "☀️ Warm & Humid Coastal Conditions",
    humidityPct: 75,
    windSpeedKmH: 18,
    windDirection: "S (180°)",
    uvIndex: 9,
    precipProbPct: 10,
    dewPointC: 21,
    airPressureHpa: 1012,
    visibilityKm: 10,
    pitchImpactAdvice: "High coastal humidity may soften seam early. High dew probability if match extends past 16:30 — spinner ball grip affected.",
    dewFactor: "HIGH",
    hourlyForecast: [
      { time: "09:00", tempC: 25, rainProbPct: 10, icon: "☀️", condition: "Warm", windKmH: 14 },
      { time: "12:00", tempC: 28, rainProbPct: 10, icon: "☀️", condition: "Humid", windKmH: 18 },
      { time: "15:00", tempC: 27, rainProbPct: 20, icon: "⛅", condition: "Partly Cloudy", windKmH: 16 },
    ],
  },
  "Meadow's Oval, Balgowan": {
    location: "Michaelhouse Meadow's Oval, KZN Midlands",
    coordinates: { lat: -29.3850, lng: 30.0520 },
    tempC: 20,
    feelsLikeC: 20,
    condition: "partly_cloudy",
    conditionLabel: "⛅ Crisp Midlands Air & Light Breeze",
    humidityPct: 52,
    windSpeedKmH: 15,
    windDirection: "NW (315°)",
    uvIndex: 6,
    precipProbPct: 20,
    dewPointC: 11,
    airPressureHpa: 1022,
    visibilityKm: 10,
    pitchImpactAdvice: "High altitude & cool ambient temperature will encourage seam movement off the deck. Excellent bowling morning.",
    dewFactor: "MODERATE",
    hourlyForecast: [
      { time: "09:00", tempC: 17, rainProbPct: 10, icon: "🌤️", condition: "Cool", windKmH: 12 },
      { time: "12:00", tempC: 21, rainProbPct: 15, icon: "⛅", condition: "Mild", windKmH: 15 },
      { time: "15:00", tempC: 19, rainProbPct: 25, icon: "🌥️", condition: "Overcast", windKmH: 16 },
    ],
  },
};

export function fetchGoogleWeather(venue: string): GoogleWeatherData {
  const match = Object.keys(VENUE_WEATHER_DATABASE).find(k => venue.toLowerCase().includes(k.toLowerCase())) || "Bowden's Field";
  return VENUE_WEATHER_DATABASE[match] || VENUE_WEATHER_DATABASE["Bowden's Field"];
}
