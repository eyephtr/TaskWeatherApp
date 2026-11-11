import { createWeatherStore } from './weatherStore';
import { createWeatherCache } from '../storage/weatherCache';
import { appStorage } from '../storage/appStorage';
import { fetchWeather } from '../services/weatherApi';

export const useWeatherStore = createWeatherStore({
    fetchWeather: (location, signal) => fetchWeather(location, { signal }),
    cache: createWeatherCache(appStorage),
});