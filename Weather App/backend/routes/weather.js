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
    
    // SAFE property access with fallbacks
    const weatherData = {
      city: response.data.location?.name || 'Unknown',
      country: response.data.location?.country || 'Unknown',
      region: response.data.location?.region || '',
      temperature: Math.round(response.data.current?.temp_c || 0),
      description: response.data.current?.condition?.text || 'Unknown',
      humidity: response.data.current?.humidity || 0,
      windSpeed: response.data.current?.wind_kph || 0,
      icon: response.data.current?.condition?.icon || '',
      feelsLike: Math.round(response.data.current?.feelslike_c || 0),
      visibility: response.data.current?.vis_km || 0,
      pressure: response.data.current?.pressure_mb || 0,
      uvIndex: response.data.current?.uv || 0,
      cloudCover: response.data.current?.cloud || 0
    };

    console.log('Weather API success for:', city);
    res.json(weatherData);
  } catch (error) {
    console.error('WeatherAPI Error:', error.message);
    
    if (error.response?.status === 400) {
      res.status(404).json({ error: 'City not found' });
    } else if (error.response?.status === 401) {
      res.status(401).json({ error: 'Invalid API key' });
    } else if (error.response?.status === 403) {
      res.status(403).json({ error: 'API quota exceeded' });
    } else {
      res.status(500).json({ error: 'Failed to fetch weather data' });
    }
  }
});

// Get extended forecast 
router.get('/forecast', async (req, res) => {
  try {
    const { city, days = 7 } = req.query;
    
    if (!city) {
      return res.status(400).json({ error: 'City parameter is required' });
    }

    const apiKey = process.env.WEATHER_API_KEY;
    const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=${days}&aqi=no&alerts=no`;

    const response = await axios.get(apiUrl);
    
    // SAFE processing of forecast data
    const forecastData = response.data.forecast?.forecastday?.map(day => ({
      date: day.date || 'Unknown',
      maxTemp: Math.round(day.day?.maxtemp_c || 0),
      minTemp: Math.round(day.day?.mintemp_c || 0),
      description: day.day?.condition?.text || 'Unknown',
      icon: day.day?.condition?.icon || '',
      chanceOfRain: day.day?.daily_chance_of_rain || 0,
      humidity: day.day?.avghumidity || 0,
      windSpeed: day.day?.maxwind_kph || 0
    })) || [];

    console.log('Weather Forecast API success for:', city);
    res.json({
      city: response.data.location?.name || 'Unknown',
      country: response.data.location?.country || 'Unknown',
      forecast: forecastData
    });
  } catch (error) {
    console.error('WeatherAPI Forecast Error:', error.message);
    
    if (error.response?.status === 400) {
      res.status(404).json({ error: 'City not found' });
    } else if (error.response?.status === 401) {
      res.status(401).json({ error: 'Invalid API key' });
    } else {
      res.status(500).json({ error: 'Failed to fetch weather data' });
    }
  }
});

module.exports = router;
