const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all origins
app.use(cors());
app.use(express.json());

// Import your routes
const weatherRoutes = require('./routes/weather');
app.use('/api', weatherRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Weather App Backend is running on Vercel!' });
});

// Export the Express app for Vercel
module.exports = app;

// Only start server in development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
