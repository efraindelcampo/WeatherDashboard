// DOM Element Selectors
const cityInput = document.querySelector(".city-input");
const autocompleteResultsDiv = document.querySelector("#autocomplete-results");
const weatherDetails = document.querySelector(".weather-details");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");
const daysForecastDiv = document.querySelector(".days-forecast");
let activeSuggestionIndex = -1;

const API_KEY = "0946c1c99daa825be0df3ab6838f71d2";

const getWeatherIcon = (conditionId) => {
  switch (true) {
    case conditionId >= 200 && conditionId <= 232:
      return "⛈️";
    case conditionId >= 300 && conditionId <= 321:
      return "🌦️";
    case conditionId >= 500 && conditionId <= 531:
      return "🌧️";
    case conditionId >= 600 && conditionId <= 622:
      return "❄️";
    case conditionId >= 701 && conditionId <= 781:
      return "🌫️";
    case conditionId === 800:
      return "☀️";
    case conditionId >= 801 && conditionId <= 804:
      return "☁️";
    default:
      return "❓";
  }
};

const createCurrentWeatherCard = (
  locationName,
  currentWeather,
  todayMinMax
) => {
  const date = new Date(currentWeather.dt * 1000);
  const formattedDate = date.toLocaleDateString("en-US");
  const icon = getWeatherIcon(currentWeather.weather[0].id);
  const description = currentWeather.weather[0].description;
  const formattedDesc =
    description.charAt(0).toUpperCase() + description.slice(1);
  const fahrenheitToCelsius = (fahrenheit) => {
    return ((fahrenheit - 32) * 5) / 9;
  };
  const currentTempC = fahrenheitToCelsius(currentWeather.main.temp).toFixed(0);
  const highTempC = fahrenheitToCelsius(todayMinMax.max).toFixed(0);
  const lowTempC = fahrenheitToCelsius(todayMinMax.min).toFixed(0);

  return `<div class="current-weather">
                <h2>${locationName}</h2>
                <h2>${formattedDate}</h2>
                <h6>${formattedDesc}</h6>
                <span style="font-size: 2rem">${icon}</span>
                <h6>${currentWeather.main.temp.toFixed(
                  0
                )}°F / ${currentTempC}°C</h6>
                <h6>High: ${todayMinMax.max.toFixed(0)}°F / ${highTempC}°C</h6>
                <h6>Low: ${todayMinMax.min.toFixed(0)}°F / ${lowTempC}°C</h6>
                <h6>Wind: ${currentWeather.wind.speed.toFixed(0)} mph</h6>
                <h6>Humidity: ${currentWeather.main.humidity}%</h6>
            </div>`;
};

const createForecastCard = (cityName, weatherItem, dailyMinMax) => {
  const date = new Date(weatherItem.dt * 1000);
  const weekday = date.toLocaleDateString("en-US");
  const icon = getWeatherIcon(weatherItem.weather[0].id);
  const description = weatherItem.weather[0].description;
  const avgTempF = ((dailyMinMax.max + dailyMinMax.min) / 2).toFixed(0);
  const windSpeed = weatherItem.wind.speed.toFixed(0);
  const humidity = weatherItem.main.humidity;
  const formattedDesc =
    description.charAt(0).toUpperCase() + description.slice(1);
  const fahrenheitToCelsius = (fahrenheit) => {
    return ((fahrenheit - 32) * 5) / 9;
  };
  const avgTempC = fahrenheitToCelsius(avgTempF).toFixed(0);
  const highTempC = fahrenheitToCelsius(dailyMinMax.max).toFixed(0);
  const lowTempC = fahrenheitToCelsius(dailyMinMax.min).toFixed(0);

  return `<li class="card">
                <h3>${cityName}</h3>
                <h3>${weekday}</h3>
                <span style="font-size: 2rem;">${icon}</span>
                <h6>${formattedDesc}</h6>
                <h6>Avg: ${avgTempF}°F / ${avgTempC}°C</h6> 
                <h6>High: ${dailyMinMax.max.toFixed(0)}°F / ${highTempC}°C</h6>
                <h6>Low: ${dailyMinMax.min.toFixed(0)}°F / ${lowTempC}°C</h6>
                <h6>Wind: ${windSpeed} mph</h6>
                <h6>Humidity: ${humidity}%</h6>
            </li>`;
};

const getWeatherDetails = (cityName, lat, lon, state, country) => {
  autocompleteResultsDiv.innerHTML = "";
  cityInput.value = [cityName, state].filter(Boolean).join(", ");

  const CURRENT_WEATHER_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`;
  const FORECAST_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`;

  Promise.all([fetch(CURRENT_WEATHER_URL), fetch(FORECAST_URL)])
    .then((responses) => Promise.all(responses.map((res) => res.json())))
    .then(([currentWeather, forecastData]) => {
      const dailyMinMaxTemps = {};
      forecastData.list.forEach((forecast) => {
        const date = forecast.dt_txt.split(" ")[0];
        if (!dailyMinMaxTemps[date]) {
          dailyMinMaxTemps[date] = {
            min: forecast.main.temp_min,
            max: forecast.main.temp_max,
          };
        } else {
          dailyMinMaxTemps[date].min = Math.min(
            dailyMinMaxTemps[date].min,
            forecast.main.temp_min
          );
          dailyMinMaxTemps[date].max = Math.max(
            dailyMinMaxTemps[date].max,
            forecast.main.temp_max
          );
        }
      });

      const dailyData = Object.keys(dailyMinMaxTemps)
        .map((date) => {
          return {
            date: date,
            minMax: dailyMinMaxTemps[date],
            weather:
              forecastData.list.find(
                (f) =>
                  f.dt_txt.startsWith(date) && f.dt_txt.includes("12:00:00")
              ) || forecastData.list.find((f) => f.dt_txt.startsWith(date)),
          };
        })
        .slice(0, 5);

      // Clear previous data and display the new cards
      cityInput.value = "";
      currentWeatherDiv.innerHTML = "";
      weatherCardsDiv.innerHTML = "";
      weatherDetails.style.display = "block";
      daysForecastDiv.style.display = "block";

      const fullLocationName = [cityName, state, country]
        .filter(Boolean)
        .join(", ");

      // Display the main current weather card
      currentWeatherDiv.innerHTML = createCurrentWeatherCard(
        fullLocationName,
        currentWeather,
        dailyData[0].minMax
      );

      // Display the next 4-day forecast cards
      dailyData.slice(1).forEach((day) => {
        weatherCardsDiv.insertAdjacentHTML(
          "beforeend",
          createForecastCard(cityName, day.weather, day.minMax)
        );
      });
    })
    .catch(() => {
      alert("An error occurred while fetching the weather data!");
    });
};

// Clears the autocomplete suggestions
const clearSuggestions = () => {
  autocompleteResultsDiv.innerHTML = "";
};

// Displays the city suggestions in the dropdown
const displaySuggestions = (data) => {
  clearSuggestions();
  activeSuggestionIndex = -1;
  data.forEach((city) => {
    const suggestionItem = document.createElement("div");
    suggestionItem.classList.add("autocomplete-item");
    suggestionItem.textContent = [city.name, city.state, city.country]
      .filter(Boolean)
      .join(", ");

    suggestionItem.addEventListener("click", () => {
      getWeatherDetails(
        city.name,
        city.lat,
        city.lon,
        city.state,
        city.country
      );
    });

    autocompleteResultsDiv.appendChild(suggestionItem);
  });
};

// Fetches city suggestions from the API
const getCitySuggestions = (query) => {
  if (query.length < 3) {
    // Don't search for less than 3 characters
    clearSuggestions();
    return;
  }
  const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`;

  fetch(GEOCODING_API_URL)
    .then((res) => res.json())
    .then((data) => {
      if (data.length) {
        displaySuggestions(data);
      } else {
        clearSuggestions();
      }
    })
    .catch(() => {
      console.error("Error fetching city suggestions.");
      clearSuggestions();
    });
};

// Debounce function: delays execution of a function
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

// Create a debounced version of our API call function
const debouncedGetCitySuggestions = debounce(getCitySuggestions, 300);

const updateActiveSuggestion = (items) => {
  items.forEach((item) => item.classList.remove("autocomplete-active"));

  if (activeSuggestionIndex > -1) {
    items[activeSuggestionIndex].classList.add("autocomplete-active");
  }
};

cityInput.addEventListener("keydown", (e) => {
  const items = autocompleteResultsDiv.querySelectorAll(".autocomplete-item");
  if (!items.length) return;

  if (e.key === "ArrowDown") {
    activeSuggestionIndex++;
    if (activeSuggestionIndex >= items.length) {
      activeSuggestionIndex = 0;
    }
    updateActiveSuggestion(items);
  } else if (e.key === "ArrowUp") {
    activeSuggestionIndex--;
    if (activeSuggestionIndex < 0) {
      activeSuggestionIndex = items.length - 1;
    }
    updateActiveSuggestion(items);
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (activeSuggestionIndex > -1) {
      items[activeSuggestionIndex].click();
    }
  }
});

// Listen for input in the city search box
cityInput.addEventListener("input", (e) => {
  debouncedGetCitySuggestions(e.target.value);
});

// Close dropdown if user clicks elsewhere on the page
document.addEventListener("click", (e) => {
  if (!e.target.closest(".search-container")) {
    clearSuggestions();
  }
});
