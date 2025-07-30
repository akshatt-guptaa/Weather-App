const express = require('express');
const cors = require('cors');
require('dotenv').config();

const weatherRoutes = require('./routes/weather');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', weatherRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Weather App Backend is running!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
