const WEATHER_API_KEY = 'f742860f196a4718bbb43759253107';
const WEATHER_API_BASE = 'https://api.weatherapi.com/v1';

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
    const url = `${WEATHER_API_BASE}/forecast.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(city)}&days=7&aqi=no&alerts=no`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('City not found');
    return response.json();
}

// Display functions
function displayWeather(data) {
    document.getElementById('cityName').textContent = `${data.location.name}, ${data.location.country}`;
    document.getElementById('temp').textContent = `${Math.round(data.current.temp_c)}°C`;
    document.getElementById('description').textContent = data.current.condition.text;
    document.getElementById('weatherIcon').src = `https:${data.current.condition.icon}`;
    document.getElementById('humidity').textContent = `${data.current.humidity}%`;
    document.getElementById('windSpeed').textContent = `${data.current.wind_kph} km/h`;
    document.getElementById('pressure').textContent = `${data.current.pressure_mb} hPa`;
    document.getElementById('visibility').textContent = `${data.current.vis_km} km`;
    document.getElementById('feelsLike').textContent = `Feels like ${Math.round(data.current.feelslike_c)}°C`;
    document.getElementById('uvIndex').textContent = data.current.uv !== undefined ? data.current.uv : '--';

    // Sunrise/Sunset from today's forecast
    const astro = data.forecast.forecastday[0].astro;
    document.getElementById('sunrise').textContent = astro.sunrise || '--:--';
    document.getElementById('sunset').textContent = astro.sunset || '--:--';

    updateCurrentDate();
}

function displayForecast(data) {
    const container = document.getElementById('forecastCards');
    container.innerHTML = data.forecast.forecastday.map((f, i) => `
        <div class="relative flex flex-col items-center p-4 bg-white bg-opacity-10 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-200 border-t-4 ${i === 0 ? 'border-blue-400' : 'border-pink-300'}">
            <div class="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-400 to-pink-300 rounded-full px-3 py-1 text-xs font-bold text-white shadow">
                ${new Date(f.date).toLocaleDateString('en-US', {weekday: 'short'})}
            </div>
            <img src="https:${f.day.condition.icon}" alt="${f.day.condition.text}" class="w-12 h-12 mx-auto mb-2 mt-4 rounded-full bg-white/30 p-1">
            <div class="text-white font-bold text-lg mb-1">${Math.round(f.day.maxtemp_c)}° / ${Math.round(f.day.mintemp_c)}°</div>
            <div class="text-white text-xs mb-1 capitalize">${f.day.condition.text}</div>
            <div class="flex flex-col gap-1 text-xs text-white opacity-80 mb-1">
                <span>💧 ${f.day.avghumidity}% Humidity</span>
                <span>💨 ${f.day.maxwind_kph} km/h Wind</span>
                <span>🔆 UV: ${f.day.uv !== undefined ? f.day.uv : '--'}</span>
                <span>🌅 ${f.astro.sunrise}</span>
                <span>🌇 ${f.astro.sunset}</span>
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
        
        const data = await fetchWeather(city);
        displayWeather(data);
        displayForecast(data);
        
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
                    const url = `${WEATHER_API_BASE}/forecast.json?key=${WEATHER_API_KEY}&q=${latitude},${longitude}&days=7&aqi=no&alerts=no`;
                    const res = await fetch(url);
                    const data = await res.json();
                    if (!res.ok || data.error) {
                        throw new Error(data.error?.message || 'Location weather not found');
                    }
                    displayWeather(data);
                    displayForecast(data);
                } catch (error) {
                    showError(error.message || 'Unable to get weather for your location');
                } finally {
                    hideLoading();
                }
            },
            () => {
                hideLoading();
                showError('Location access denied');
            }
        );
    } else {
        showError('Geolocation is not supported by your browser');
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

// Optionally, load a default city on page load
// getWeather('allahabad');
