export type WeatherIconName =
    | 'sunny'
    | 'moon'
    | 'partly-sunny'
    | 'cloudy-night'
    | 'cloudy'
    | 'rainy'
    | 'thunderstorm'
    | 'snow';

export interface WeatherDescription {
    label: string;
    icon: WeatherIconName;
}

export function describeWeather(code: number, isDay = true): WeatherDescription {
    if (code === 0) {
        return { label: 'Clear sky', icon: isDay ? 'sunny' : 'moon' };
    }
    if (code === 1) {
        return { label: 'Mainly clear', icon: isDay ? 'sunny' : 'moon' };
    }
    if (code === 2) {
        return { label: 'Partly cloudy', icon: isDay ? 'partly-sunny' : 'cloudy-night' };
    }
    if (code === 3) {
        return { label: 'Overcast', icon: 'cloudy' };
    }
    if (code === 45 || code === 48) {
        return { label: 'Fog', icon: 'cloudy' };
    }
    if (code >= 51 && code <= 57) {
        return { label: 'Drizzle', icon: 'rainy' };
    }
    if (code >= 61 && code <= 65) {
        return { label: 'Rain', icon: 'rainy' };
    }
    if (code === 66 || code === 67) {
        return { label: 'Freezing rain', icon: 'rainy' };
    }
    if (code >= 71 && code <= 77) {
        return { label: 'Snow', icon: 'snow' };
    }
    if (code >= 80 && code <= 82) {
        return { label: 'Rain showers', icon: 'rainy' };
    }
    if (code === 85 || code === 86) {
        return { label: 'Snow showers', icon: 'snow' };
    }
    if (code === 95) {
        return { label: 'Thunderstorm', icon: 'thunderstorm' };
    }
    if (code === 96 || code === 99) {
        return { label: 'Thunderstorm with hail', icon: 'thunderstorm' };
    }
    return { label: 'Unknown', icon: 'cloudy' };
}

/** ใช้กับฟีเจอร์เตือนฝนของงาน outdoor */
export const isRainCode = (code: number): boolean =>
    (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || (code >= 95 && code <= 99);