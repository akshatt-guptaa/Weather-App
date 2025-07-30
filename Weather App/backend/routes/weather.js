const express = require('express');
const axios = require('axios');
const router = express.Router();

// Get current weather
router.get('/weather', async (req, res) => {
  try {
    const { city } = req.query;
    
    if (!city) {
      return res.status(400).json({ error: 'City parameter is required' });
    }

    const apiKey = process.env.WEATHER_API_KEY;
    const apiUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&aqi=no`;

    const response = await axios.get(apiUrl);
    
    // Include ALL weather data 
    const weatherData = {
      city: response.data.location.name,
      country: response.data.location.country,
      region: response.data.location.region,
      temperature: Math.round(response.data.current.temp_c),
      description: response.data.current.condition.text,
      humidity: response.data.current.humidity,
      windSpeed: response.data.current.wind_kph,
      icon: response.data.current.condition.icon,
      feelsLike: Math.round(response.data.current.feelslike_c),
      visibility: response.data.current.vis_km,
      pressure: response.data.current.pressure_mb,
      uvIndex: response.data.current.uv,
      cloudCover: response.data.current.cloud
    };

    res.json(weatherData);
  } catch (error) {
    console.error('WeatherAPI Error:', error.message);
    
    if (error.response?.status === 400) {
      res.status(404).json({ error: 'City not found' });
    } else {
      res.status(500).json({ error: 'Failed to fetch weather data' });
    }
  }
});

// Get extended forecast 
router.get('/forecast', async (req, res) => {
  try {
    const { city, days = 7 } = req.query; // Default to 7 days
    
    if (!city) {
      return res.status(400).json({ error: 'City parameter is required' });
    }

    const apiKey = process.env.WEATHER_API_KEY;
    const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=${days}&aqi=no&alerts=no`;

    const response = await axios.get(apiUrl);
    
    // Process forecast data for more days
    const forecastData = response.data.forecast.forecastday.map(day => ({
      date: day.date,
      maxTemp: Math.round(day.day.maxtemp_c),
      minTemp: Math.round(day.day.mintemp_c),
      description: day.day.condition.text,
      icon: day.day.condition.icon,
      chanceOfRain: day.day.daily_chance_of_rain,
      humidity: day.day.avghumidity,
      windSpeed: day.day.maxwind_kph
    }));

    res.json({
      city: response.data.location.name,
      country: response.data.location.country,
      forecast: forecastData
    });
  } catch (error) {
    console.error('WeatherAPI Forecast Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch forecast data' });
  }
});

module.exports = router;
