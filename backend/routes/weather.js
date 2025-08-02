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
    console.log('=== DEBUG INFO ===');
    console.log('City requested:', city);
    console.log('API Key exists:', !!apiKey);
    console.log('API Key length:', apiKey?.length || 0);
    console.log('API Key preview:', apiKey ? `${apiKey.substring(0, 8)}...` : 'Not found');

    if (!apiKey) {
      return res.status(500).json({ error: 'Weather API key not configured' });
    }

    const apiUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&aqi=no`;
    console.log('API URL (key hidden):', apiUrl.replace(apiKey, 'HIDDEN_KEY'));

    const response = await axios.get(apiUrl);
    
    // DETAILED RESPONSE LOGGING
    console.log('=== API RESPONSE DEBUG ===');
    console.log('Status:', response.status);
    console.log('Full response data:', JSON.stringify(response.data, null, 2));
    console.log('Location object:', response.data.location);
    console.log('Current object:', response.data.current);
    console.log('Condition object:', response.data.current?.condition);
    console.log('Temperature value:', response.data.current?.temp_c);
    console.log('Description value:', response.data.current?.condition?.text);
    
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

    console.log('=== PROCESSED DATA ===');
    console.log('Final weather data:', weatherData);
    console.log('Weather API success for:', city);
    res.json(weatherData);

  } catch (error) {
    console.error('=== ERROR DEBUG ===');
    console.error('Error message:', error.message);
    console.error('Error response status:', error.response?.status);
    console.error('Error response data:', error.response?.data);
    console.error('Full error:', error);
    
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
    console.log('=== FORECAST DEBUG ===');
    console.log('Forecast requested for city:', city);
    console.log('Days requested:', days);
    console.log('API Key exists:', !!apiKey);

    if (!apiKey) {
      return res.status(500).json({ error: 'Weather API key not configured' });
    }

    const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=${days}&aqi=no&alerts=no`;
    console.log('Forecast API URL (key hidden):', apiUrl.replace(apiKey, 'HIDDEN_KEY'));

    const response = await axios.get(apiUrl);
    
    console.log('=== FORECAST RESPONSE DEBUG ===');
    console.log('Forecast response status:', response.status);
    console.log('Forecast data structure:', JSON.stringify(response.data, null, 2));
    
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

    console.log('=== PROCESSED FORECAST DATA ===');
    console.log('Final forecast data:', forecastData);
    console.log('Weather Forecast API success for:', city);
    
    res.json({
      city: response.data.location?.name || 'Unknown',
      country: response.data.location?.country || 'Unknown',
      forecast: forecastData
    });
  } catch (error) {
    console.error('=== FORECAST ERROR DEBUG ===');
    console.error('Forecast error message:', error.message);
    console.error('Forecast error response status:', error.response?.status);
    console.error('Forecast error response data:', error.response?.data);
    
    if (error.response?.status === 400) {
      res.status(404).json({ error: 'City not found' });
    } else if (error.response?.status === 401) {
      res.status(401).json({ error: 'Invalid API key' });
    } else {
      res.status(500).json({ error: 'Failed to fetch weather data' });
    }
  }
});

// Add debug endpoint to check environment variables
router.get('/debug', (req, res) => {
  res.json({
    hasApiKey: !!process.env.WEATHER_API_KEY,
    keyLength: process.env.WEATHER_API_KEY?.length || 0,
    keyPreview: process.env.WEATHER_API_KEY ? `${process.env.WEATHER_API_KEY.substring(0, 8)}...` : 'Not found',
    envVars: Object.keys(process.env).filter(key => key.includes('API') || key.includes('WEATHER')),
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
