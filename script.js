// API Configuration
const API_KEY = 'YOUR_API_KEY_HERE'; // Get free key from openweathermap.org
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const loadingSpinner = document.getElementById('loadingSpinner');
const errorMessage = document.getElementById('errorMessage');
const weatherInfo = document.getElementById('weatherInfo');
const welcomeMessage = document.getElementById('welcomeMessage');

// Event Listeners
searchBtn.addEventListener('click', handleSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});

// Handle Search
async function handleSearch() {
    const city = searchInput.value.trim();
    
    if (!city) {
        showError('অনুগ্রহ করে একটি শহরের নাম লিখুন (Please enter a city name)');
        return;
    }

    if (API_KEY === 'YOUR_API_KEY_HERE') {
        showError('⚠️ API কী সেট করা হয়নি (API Key not configured). openweathermap.org থেকে একটি ফ্রি কী নিন এবং script.js তে যোগ করুন।');
        return;
    }

    await fetchWeather(city);
}

// Fetch Weather Data
async function fetchWeather(city) {
    try {
        showLoading(true);
        hideError();
        hideWeatherInfo();

        const response = await fetch(
            `${API_URL}?q=${city}&appid=${API_KEY}&units=metric&lang=bn`
        );

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('শহর পাওয়া যায়নি (City not found)');
            } else if (response.status === 401) {
                throw new Error('API কী অবৈধ (Invalid API Key)');
            }
            throw new Error('আবহাওয়ার তথ্য পাওয়া যায়নি (Failed to fetch weather)');
        }

        const data = await response.json();
        displayWeather(data);
        hideWelcomeMessage();

    } catch (error) {
        showError(error.message);
    } finally {
        showLoading(false);
    }
}

// Display Weather Data
function displayWeather(data) {
    const {
        name,
        sys,
        main,
        weather,
        wind,
        visibility,
    } = data;

    // City and Date
    document.getElementById('cityName').textContent = `${name}, ${sys.country}`;
    document.getElementById('dateTime').textContent = new Date().toLocaleDateString('bn-BD', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Current Weather
    document.getElementById('temp').textContent = Math.round(main.temp);
    document.getElementById('description').textContent = weather[0].description;
    
    // Weather Icon
    const iconCode = weather[0].icon;
    document.getElementById('weatherIcon').src = 
        `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

    // Weather Details
    document.getElementById('feelsLike').textContent = 
        `${Math.round(main.feels_like)}°C`;
    
    document.getElementById('humidity').textContent = 
        `${main.humidity}%`;
    
    document.getElementById('pressure').textContent = 
        `${main.pressure} hPa`;
    
    document.getElementById('windSpeed').textContent = 
        `${(wind.speed * 3.6).toFixed(1)} km/h`;
    
    document.getElementById('visibility').textContent = 
        `${(visibility / 1000).toFixed(1)} km`;

    // UV Index (requires separate API call)
    fetchUVIndex(data.coord.lat, data.coord.lon);

    showWeatherInfo();
}

// Fetch UV Index
async function fetchUVIndex(lat, lon) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${API_KEY}`
        );

        if (response.ok) {
            const data = await response.json();
            document.getElementById('uvIndex').textContent = data.value.toFixed(1);
        }
    } catch (error) {
        console.error('UV Index fetch error:', error);
        document.getElementById('uvIndex').textContent = 'N/A';
    }
}

// UI Helper Functions
function showLoading(show) {
    if (show) {
        loadingSpinner.classList.remove('hidden');
    } else {
        loadingSpinner.classList.add('hidden');
    }
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
}

function hideError() {
    errorMessage.classList.add('hidden');
}

function showWeatherInfo() {
    weatherInfo.classList.remove('hidden');
}

function hideWeatherInfo() {
    weatherInfo.classList.add('hidden');
}

function hideWelcomeMessage() {
    welcomeMessage.classList.add('hidden');
}

// Geolocation Support (Optional)
function getWeatherByLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    showLoading(true);
                    const response = await fetch(
                        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=bn`
                    );
                    if (response.ok) {
                        const data = await response.json();
                        displayWeather(data);
                        hideWelcomeMessage();
                    }
                } catch (error) {
                    console.error('Geolocation error:', error);
                } finally {
                    showLoading(false);
                }
            },
            (error) => {
                console.error('Geolocation not available:', error);
            }
        );
    }
}

// Initialize with geolocation on load (optional)
// Uncomment to enable automatic location detection
// window.addEventListener('load', getWeatherByLocation);
