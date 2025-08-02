const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000; // Render uses dynamic PORT

// Validate environment variables
if (!process.env.WEATHER_API_KEY) {
  console.error('❌ Error: WEATHER_API_KEY environment variable is missing');
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const weatherRoutes = require('./routes/weather');
app.use('/api', weatherRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'Weather App Backend is running!',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Start server - Listen on all interfaces for Render
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});
