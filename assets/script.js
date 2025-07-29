const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");
const forecastDiv = document.querySelector(".days-forecast");

const API_KEY = "0946c1c99daa825be0df3ab6838f71d2";

const getWeatherIcon = (conditionId) => {
  switch (true) {
    case conditionId >= 200 && conditionId <= 232:
      return "⛈️"; // Group 2xx: Thunderstorm
    case conditionId >= 300 && conditionId <= 321:
      return "🌦️"; // Group 3xx: Drizzle
    case conditionId >= 500 && conditionId <= 531:
      return "🌧️"; // Group 5xx: Rain
    case conditionId >= 600 && conditionId <= 622:
      return "❄️"; // Group 6xx: Snow
    case conditionId >= 701 && conditionId <= 781:
      return "🌫️"; // Group 7xx: Atmosphere
    case conditionId === 800:
      return "☀️"; // Group 800: Clear
    case conditionId === 801:
      return "🌤️"; // Group 80x: Clouds (few)
    case conditionId >= 802 && conditionId <= 804:
      return "☁️"; // Group 80x: Clouds (scattered, broken, overcast)
    default:
      return "device_thermostat"; // Default case
  }
};

const createWeatherCard = (cityName, weatherItem, index) => {
  const date = new Date(weatherItem.dt_txt);
  const formattedDate = date.toLocaleDateString("en-US");
  const tempInFahrenheit = (weatherItem.main.temp - 273.15) * 1.8 + 32;
  const weatherId = weatherItem.weather[0].id;
  const iconName = getWeatherIcon(weatherId);
  const description = weatherItem.weather[0].description;

  if (index === 0) {
    // Main weather card for today
    return `<div class="current-weather">
            <h2>${cityName} (${formattedDate})</h2>
            <h4>Temp: ${tempInFahrenheit.toFixed(1)}°F</h4>
            <h4>Wind: ${weatherItem.wind.speed}mph</h4>
            <h4>Humidty: ${weatherItem.main.humidity}%</h4>
            <span class="material-symbols-outlined" style="font-size: 3rem;">${iconName}</span>
            <h4>${description}</h4>
            </div>`;
  } else {
    return `<li class="card">
            <h3>(${formattedDate})</h3>
            <h4>Temp: ${tempInFahrenheit.toFixed(1)}°F</h4>
            <h4>Wind: ${weatherItem.wind.speed}mph</h4>
            <h4>Humidty: ${weatherItem.main.humidity}%</h4>
            <span class="material-symbols-outlined" style="font-size: 3rem;">${iconName}</span>
            <h4>${description}</h4>
            </li>`;
  }
};

const getWeatherDetails = (cityName, lat, lon) => {
  const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
  fetch(WEATHER_API_URL)
    .then((res) => res.json())
    .then((data) => {
      const uniqueForecastDays = [];
      const fiveDayForecast = data.list
        .filter((forecast) => {
          const forecastDate = new Date(forecast.dt_txt).getDate();
          if (!uniqueForecastDays.includes(forecastDate)) {
            uniqueForecastDays.push(forecastDate); // Add the date to our tracking array
            return true; // Return true to keep this item
          }
          return false; // Return false to discard duplicates
        })
        .slice(0, 5); // Use .slice(0, 5) to get only the first 5 unique days

      // Clear previous weather data
      cityInput.value = "";
      currentWeatherDiv.innerHTML = "";
      weatherCardsDiv.innerHTML = "";

      // ✅ Make the forecast section visible
      forecastDiv.style.display = "block";

      // Create and display weather cards
      fiveDayForecast.forEach((weatherItem, index) => {
        if (index === 0) {
          currentWeatherDiv.insertAdjacentHTML(
            "beforeend",
            createWeatherCard(cityName, weatherItem, index)
          );
        } else {
          weatherCardsDiv.insertAdjacentHTML(
            "beforeend",
            createWeatherCard(cityName, weatherItem, index)
          );
        }
      });
    })
    .catch(() => {
      alert("Error occured");
    });
};

const getCityCoordinates = () => {
  const cityName = cityInput.value.trim();
  if (!cityName) return;
  const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

  fetch(GEOCODING_API_URL)
    .then((res) => res.json())
    .then((data) => {
      if (!data.length) return alert(`No coordinates found for city!`);
      const { name, lat, lon } = data[0];
      getWeatherDetails(name, lat, lon);
    })
    .catch(() => {
      alert("Error occured");
    });
};

searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener(
  "keyup",
  (e) => e.key === "Enter" && getCityCoordinates()
);
