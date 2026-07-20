const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');

const weatherCodes = {
    0: { desc: 'Klar', icon: '☀️' },
    1: { desc: 'Teilweise bewölkt', icon: '⛅' },
    2: { desc: 'Bewölkt', icon: '☁️' },
    3: { desc: 'Bedeckt', icon: '☁️' },
    45: { desc: 'Nebel', icon: '🌫️' },
    51: { desc: 'Leichter Nieselregen', icon: '🌧️' },
    61: { desc: 'Leichter Regen', icon: '🌧️' },
    80: { desc: 'Regenschauer', icon: '🌦️' },
    95: { desc: 'Gewitter', icon: '⛈️' }
};

function getWeatherInfo(code) {
    return weatherCodes[code] || { desc: 'Bewölkt', icon: '☁️' };
}

async function getWeatherByCoords(lat, lon, cityLabel) {
    document.getElementById('loader').classList.remove('hidden');
    document.getElementById('error').textContent = '';
    try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`);
        const data = await res.json();

        const current = data.current;
        const info = getWeatherInfo(current.weather_code);

        document.getElementById('cityName').textContent = cityLabel;
        document.getElementById('temp').textContent = Math.round(current.temperature_2m) + '°';
        document.getElementById('weatherIcon').textContent = info.icon;
        document.getElementById('description').textContent = info.desc;
        document.getElementById('humidity').textContent = current.relative_humidity_2m;
        document.getElementById('wind').textContent = current.wind_speed_10m;

        // 5-day forecast
        const forecastDiv = document.getElementById('forecast');
        forecastDiv.innerHTML = '';
        for(let i=0; i<5; i++){
            const dayInfo = getWeatherInfo(data.daily.weather_code[i]);
            forecastDiv.innerHTML += `
                <div>
                    <div>${i==0 ? 'Heute' : 'Tag ' + (i+1)}</div>
                    <div style="font-size:24px">${dayInfo.icon}</div>
                    <div>${Math.round(data.daily.temperature_2m_max[i])}° / ${Math.round(data.daily.temperature_2m_min[i])}°</div>
                </div>
            `;
        }
        document.getElementById('weatherResult').classList.remove('hidden');
    } catch(e) {
        document.getElementById('error').textContent = 'Etwas ist schiefgelaufen, bitte versuche es erneut';
    }
    document.getElementById('loader').classList.add('hidden');
}

async function searchCity() {
    const city = cityInput.value.trim();
    if(!city) return;
    try {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`);
        const data = await res.json();
        if(!data.results) throw new Error();
        const loc = data.results[0];
        getWeatherByCoords(loc.latitude, loc.longitude, `${loc.name}, ${loc.country}`);
    } catch {
        document.getElementById('error').textContent = 'Stadt nicht gefunden, versuche einen deutschen oder englischen Namen wie Berlin';
    }
}

searchBtn.addEventListener('click', searchCity);
cityInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') searchCity(); });

locationBtn.addEventListener('click', () => {
    navigator.geolocation.getCurrentPosition(pos => {
        getWeatherByCoords(pos.coords.latitude, pos.coords.longitude, 'موقعك الحالي');
    }, () => {
        document.getElementById('error').textContent = 'Aktiviere GPS in deinem Browser';
    });
});

// Standardmäßig Berlin laden
getWeatherByCoords(52.52, 13.405, 'Berlin, Deutschland');