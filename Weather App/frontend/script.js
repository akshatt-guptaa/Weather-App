const API_BASE_URL = 'https://weather-app-backend-lpl6.onrender.com/api';

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
    document.getElementById('pressure').textContent = `${data.pressure} hPa`;
    document.getElementById('visibility').textContent = `${data.visibility} km`;
    document.getElementById('feelsLike').textContent = `Feels like ${data.feelsLike}°C`;
    document.getElementById('uvIndex').textContent = data.uvIndex !== undefined ? data.uvIndex : '--';

    // Add sunrise/sunset
    document.getElementById('sunrise').textContent = data.sunrise ? formatTime(data.sunrise) : '--:--';
    document.getElementById('sunset').textContent = data.sunset ? formatTime(data.sunset) : '--:--';

    updateCurrentDate();
}

function displayForecast(data) {
    const container = document.getElementById('forecastCards');
    container.innerHTML = data.forecast.map((f, i) => `
        <div class="relative flex flex-col items-center p-4 bg-white bg-opacity-10 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-200 border-t-4 ${i === 0 ? 'border-blue-400' : 'border-pink-300'}">
            <div class="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-400 to-pink-300 rounded-full px-3 py-1 text-xs font-bold text-white shadow">${new Date(f.date).toLocaleDateString('en-US', {weekday: 'short'})}</div>
            <img src="https:${f.icon}" alt="${f.description}" class="w-12 h-12 mx-auto mb-2 mt-4">
            <div class="text-white font-bold text-lg mb-1">${f.maxTemp}° / ${f.minTemp}°</div>
            <div class="text-white text-xs mb-1 capitalize">${f.description}</div>
            <div class="flex flex-col gap-1 text-xs text-white opacity-80 mb-1">
                <span>💧 ${f.humidity}%</span>
                <span>💨 ${f.windSpeed}km/h</span>
                <span>🔆 UV: ${f.uvIndex !== undefined ? f.uvIndex : '--'}</span>
            </div>
        </div>
    `).join('');
}

function updateCurrentDate() {
    const now = new Date();
    document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', {
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
    });
}

function showLoading() {
    elements.loading.classList.remove('hidden');
}

function hideLoading() {
    elements.loading.classList.add('hidden');
}

function showError(message) {
    elements.errorMessage.querySelector('p').textContent = message;
    elements.errorMessage.classList.remove('hidden');
    setTimeout(() => {
        elements.errorMessage.classList.add('hidden');
    }, 5000);
}

async function getWeather(city) {
    try {
        showLoading();
        elements.errorMessage.classList.add('hidden');
        
        const [weather, forecast] = await Promise.all([
            fetchWeather(city),
            fetchForecast(city).catch(() => null)
        ]);
        
        displayWeather(weather);
        if (forecast) displayForecast(forecast);
        
    } catch (error) {
        console.error('Weather fetch error:', error);
        showError(error.message);
    } finally {
        hideLoading();
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

elements.locationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        showLoading();
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const response = await fetch(`${API_BASE_URL}/weather?lat=${latitude}&lon=${longitude}`);
                    const weather = await response.json();
                    displayWeather(weather);
                } catch (error) {
                    showError('Unable to get location weather');
                } finally {
                    hideLoading();
                }
            },
            () => {
                hideLoading();
                showError('Location access denied');
            }
        );
    }
});

// Theme toggle
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
});

// On load, set theme from localStorage
if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-mode');
}

// Initialize
getWeather('allahabad');

// Helper to format time 
function formatTime(value) {
    
    let date;
    if (typeof value === 'string' && !isNaN(Date.parse(value))) {
        date = new Date(value);
    } else if (typeof value === 'number' && value > 1e12) {
        date = new Date(value); // ms
    } else if (typeof value === 'number') {
        date = new Date(value * 1000); // s
    } else {
        return '--:--';
    }
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
