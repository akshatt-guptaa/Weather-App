const API_BASE_URL = 'https://weather-app-backend-mu.vercel.app/';

// DOM elements
const elements = {
    cityInput: document.getElementById('cityInput'),
    searchBtn: document.getElementById('searchBtn'),
    locationBtn: document.getElementById('locationBtn'),
    weatherCard: document.getElementById('weatherCard'),
    loading: document.getElementById('loading'),
    errorMessage: document.getElementById('errorMessage')
};

// API calls
async function fetchWeather(city) {
    const response = await fetch(`${API_BASE_URL}/weather?city=${encodeURIComponent(city)}`);
    if (!response.ok) throw new Error((await response.json()).error);
    return response.json();
}

async function fetchForecast(city) {
    const response = await fetch(`${API_BASE_URL}/forecast?city=${encodeURIComponent(city)}`);
    if (!response.ok) throw new Error('Forecast unavailable');
    return response.json();
}

// Display functions
function displayWeather(data) {
    document.getElementById('cityName').textContent = `${data.city}, ${data.country}`;
    document.getElementById('temp').textContent = `${data.temperature}°C`;
    document.getElementById('description').textContent = data.description;
    document.getElementById('weatherIcon').src = `https:${data.icon}`;
    document.getElementById('humidity').textContent = `${data.humidity}%`;
    document.getElementById('windSpeed').textContent = `${data.windSpeed} km/h`;
    elements.weatherCard.style.display = 'block';
}

function displayForecast(data) {
    const container = document.getElementById('forecastCards');
    container.innerHTML = data.forecast.map(f => `
        <div class="forecast-card">
            <div>${new Date(f.date).toLocaleDateString('en-US', {weekday: 'short'})}</div>
            <img src="https:${f.icon}" alt="${f.description}">
            <div>${f.maxTemp}°/${f.minTemp}°</div>
        </div>
    `).join('');
}

// Main function
async function getWeather(city) {
    try {
        elements.loading.style.display = 'block';
        elements.errorMessage.style.display = 'none';
        
        const [weather, forecast] = await Promise.all([
            fetchWeather(city),
            fetchForecast(city).catch(() => null) // Don't fail if forecast fails
        ]);
        
        displayWeather(weather);
        if (forecast) displayForecast(forecast);
        
    } catch (error) {
        document.getElementById('errorMessage').querySelector('p').textContent = error.message;
        elements.errorMessage.style.display = 'block';
    } finally {
        elements.loading.style.display = 'none';
    }
}

// Event listeners
elements.searchBtn.addEventListener('click', () => {
    const city = elements.cityInput.value.trim();
    if (city) {
        getWeather(city);
        elements.cityInput.value = '';
    }
});

elements.cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') elements.searchBtn.click();
});

// Load default weather
getWeather('Allahabad');
