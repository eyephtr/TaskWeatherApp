export interface GeoLocation {
    name: string;
    latitude: number;
    longitude: number;
}

export interface CurrentWeather {
    temperature: number; 
    apparentTemperature: number; 
    humidity: number; 
    windSpeed: number; 
    precipitation: number; 
    weatherCode: number; 
    isDay: boolean;
}

export interface DailyForecast {
    date: string; 
    weatherCode: number;
    tempMax: number;
    tempMin: number;
    precipitationSum: number; 
    precipitationProbability: number; 
}

export interface WeatherResult {
    location: GeoLocation;
    current: CurrentWeather;
    daily: DailyForecast[];
}

/** ผลลัพธ์จาก API พร้อมเวลาที่ดึงมา (ใช้ตัดสินอายุของ cache) */
export interface WeatherData extends WeatherResult {
    fetchedAt: number; 
}