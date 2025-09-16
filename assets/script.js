// --- DOM Element Selectors ---
// Selects the text input field where the user types a city name.
const cityInput = document.querySelector(".city-input");
// Selects the div that will display the autocomplete city suggestions.
const autocompleteResultsDiv = document.querySelector("#autocomplete-results");
// Selects the main container for the weather details, initially hidden.
const weatherDetails = document.querySelector(".weather-details");
// Selects the div that will display the current day's weather.
const currentWeatherDiv = document.querySelector(".current-weather");
// Selects the <ul> element that will hold the forecast cards.
const weatherCardsDiv = document.querySelector(".weather-cards");
// Selects the container for the 5-day forecast section, initially hidden.
const daysForecastDiv = document.querySelector(".days-forecast");
const loadingSpinner = document.querySelector(".loading-spinner");

// --- Helper Functions ---
// Converts a temperature from Fahrenheit to Celsius.
const fahrenheitToCelsius = (fahrenheit) => {
  return ((fahrenheit - 32) * 5) / 9;
};
// Capitalizes the first letter of a given string.
const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

// Process forecast data
const processForecastData = (list) => {
  const dailyMinMaxTemps = {};
  list.forEach((forecast) => {
    const date = forecast.dt_txt.split(" ")[0];
    dailyMinMaxTemps[date] = dailyMinMaxTemps[date] || { min: Infinity, max: -Infinity };
    dailyMinMaxTemps[date].min = Math.min(dailyMinMaxTemps[date].min, forecast.main.temp_min);
    dailyMinMaxTemps[date].max = Math.max(dailyMinMaxTemps[date].max, forecast.main.temp_max);
  });

  return Object.keys(dailyMinMaxTemps).map((date) => {
    return {
      date: date,
      minMax: dailyMinMaxTemps[date],
      weather: list.find(
        (f) => f.dt_txt.startsWith(date) && f.dt_txt.includes("12:00:00")
      ) || list.find((f) => f.dt_txt.startsWith(date)),
    };
  }).slice(0, 4);
};

// --- Global Variables ---
// Tracks the currently highlighted suggestion in the autocomplete list for keyboard navigation.
let activeSuggestionIndex = -1;
// Stores the API key for OpenWeatherMap.
const API_KEY = "0946c1c99daa825be0df3ab6838f71d2";

// Returns a weather emoji based on the weather condition ID from the API.
const getWeatherIcon = (conditionId) => {
  switch (true) {
    case conditionId >= 200 && conditionId <= 232:
      return "⛈️"; // Thunderstorm
    case conditionId >= 300 && conditionId <= 321:
      return "🌦️"; // Drizzle
    case conditionId >= 500 && conditionId <= 531:
      return "🌧️"; // Rain
    case conditionId >= 600 && conditionId <= 622:
      return "❄️"; // Snow
    case conditionId >= 701 && conditionId <= 781:
      return "🌫️"; // Atmosphere (fog, mist, etc.)
    case conditionId === 800:
      return "☀️"; // Clear
    case conditionId >= 801 && conditionId <= 804:
      return "☁️"; // Clouds
    default:
      return "❓"; // Default case
  }
};

// Creates and returns the HTML string for the main current weather card.
const createCurrentWeatherCard = (
  locationName,
  currentWeather,
  todayMinMax
) => {
  // Use destructuring to easily access nested properties from the API response.
  const { dt, main, wind, weather } = currentWeather;
  const { temp, humidity } = main;
  const { speed } = wind;
  const [{ id, description }] = weather; // Destructures the first item in the weather array.

  const date = new Date(dt * 1000); // Convert timestamp to milliseconds.
  const formattedDate = date.toLocaleDateString("en-US"); // Format date as MM/DD/YYYY.
  const icon = getWeatherIcon(id); // Get the appropriate weather icon.
  const formattedDesc = capitalizeFirstLetter(description); // Capitalize the description.
  const currentTempC = fahrenheitToCelsius(temp).toFixed(0); // Convert and format temperatures.
  const highTempC = fahrenheitToCelsius(todayMinMax.max).toFixed(0);
  const lowTempC = fahrenheitToCelsius(todayMinMax.min).toFixed(0);

  // Return the complete HTML structure as a template literal string.
  return `<div class="current-weather">
                <h2>${locationName}</h2>
                <h2>${formattedDate}</h2>
                <h6>${formattedDesc}</h6>
                <span style="font-size: 2rem">${icon}</span>
                <h6>${temp.toFixed(0)}°F / ${currentTempC}°C</h6>
                <h6>High: ${todayMinMax.max.toFixed(0)}°F / ${highTempC}°C</h6>
                <h6>Low: ${todayMinMax.min.toFixed(0)}°F / ${lowTempC}°C</h6>
                <h6>Wind: ${speed.toFixed(0)} mph</h6>
                <h6>Humidity: ${humidity}%</h6>
            </div>`;
};

// Creates and returns the HTML string for a single 5-day forecast card.
const createForecastCard = (cityName, weatherItem, dailyMinMax) => {
  // Destructure the weatherItem object for cleaner property access.
  const { dt, weather, wind, main } = weatherItem;
  const [{ id, description }] = weather;
  const { speed } = wind;
  const { humidity } = main;

  const date = new Date(dt * 1000); // Convert timestamp to date.
  const weekday = date.toLocaleDateString("en-US"); // Format date.
  const icon = getWeatherIcon(id); // Get weather icon.
  const avgTempF = ((dailyMinMax.max + dailyMinMax.min) / 2).toFixed(0); // Calculate average temp.

  // Use the global helper functions for formatting and conversion.
  const formattedDesc = capitalizeFirstLetter(description);
  const avgTempC = fahrenheitToCelsius(avgTempF).toFixed(0);
  const highTempC = fahrenheitToCelsius(dailyMinMax.max).toFixed(0);
  const lowTempC = fahrenheitToCelsius(dailyMinMax.min).toFixed(0);

  // Return the complete HTML for the list item card.
  return `<li class="card">
                <h3>${cityName}</h3>
                <h3>${weekday}</h3>
                <span style="font-size: 2rem;">${icon}</span>
                <h6>${formattedDesc}</h6>
                <h6>Avg: ${avgTempF}°F / ${avgTempC}°C</h6> 
                <h6>High: ${dailyMinMax.max.toFixed(0)}°F / ${highTempC}°C</h6>
                <h6>Low: ${dailyMinMax.min.toFixed(0)}°F / ${lowTempC}°C</h6>
                <h6>Wind: ${speed.toFixed(0)} mph</h6>
                <h6>Humidity: ${humidity}%</h6>
            </li>`;
};

// Fetches weather data from the API and updates the DOM.
const getWeatherDetails = (cityName, lat, lon, state, country) => {
  autocompleteResultsDiv.innerHTML = ""; // Clear autocomplete suggestions.
  cityInput.value = [cityName, state].filter(Boolean).join(", "); // Update input field to show selected city.

  // API URLs for current weather and 5-day forecast.
  const CURRENT_WEATHER_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`;
  const FORECAST_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`;

  // Fetch both current and forecast weather data concurrently.
  loadingSpinner.classList.add("show-loading");

  Promise.all([fetch(CURRENT_WEATHER_URL), fetch(FORECAST_URL)])
    .then((responses) => Promise.all(responses.map((res) => res.json())))
    .then(([currentWeather, forecastData]) => {
      loadingSpinner.classList.remove("show-loading");

      const dailyData = processForecastData(forecastData.list);

      // Clear previous weather data from the UI.
      cityInput.value = "";
      currentWeatherDiv.innerHTML = "";
      weatherCardsDiv.innerHTML = "";
      // Make the weather details sections visible.
      weatherDetails.style.display = "block";
      daysForecastDiv.style.display = "block";

      // Format the full location name for display.
      const fullLocationName = [cityName, state, country]
        .filter(Boolean)
        .join(", ");

      // Create and display the main current weather card.
      currentWeatherDiv.innerHTML = createCurrentWeatherCard(
        fullLocationName,
        currentWeather,
        dailyData[0].minMax
      );

      // Create and display the forecast cards for the next 4 days.
      dailyData.forEach((day) => {
        weatherCardsDiv.insertAdjacentHTML(
          "beforeend",
          createForecastCard(cityName, day.weather, day.minMax)
        );
      });
    })
    .catch(() => {
      loadingSpinner.classList.remove("show-loading");
       // Handle errors during the API fetch.
      alert("An error occurred while fetching the weather data!");
    });
};

// Clears the autocomplete suggestions from the UI.
const clearSuggestions = () => {
  autocompleteResultsDiv.innerHTML = "";
};

// Displays the city suggestions in the dropdown.
const displaySuggestions = (data) => {
  clearSuggestions();
  activeSuggestionIndex = -1; // Reset active suggestion index.

  // Use a Set to filter out duplicate city/state/country combinations.
  const seen = new Set();
  const uniqueCities = data.filter((city) => {
    const identifier = [city.name, city.state, city.country]
      .filter(Boolean)
      .join(", ");
    if (seen.has(identifier)) {
      return false; // If we've seen this city, filter it out.
    } else {
      seen.add(identifier); // Otherwise, add it to our set and keep it.
      return true;
    }
  });

  // Create a div for each unique city suggestion.
  uniqueCities.forEach((city) => {
    const suggestionItem = document.createElement("div");
    suggestionItem.classList.add("autocomplete-item");
    suggestionItem.textContent = [city.name, city.state, city.country]
      .filter(Boolean)
      .join(", ");

    // Add a click event listener to fetch weather when a suggestion is chosen.
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

// Fetches city suggestions from the Geocoding API based on user input.
const getCitySuggestions = (query) => {
  // Don't search if the query is too short.
  if (query.length < 3) {
    clearSuggestions();
    return;
  }
  // API URL for geocoding (finding lat/lon from city name).
  const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`;

  fetch(GEOCODING_API_URL)
    .then((res) => res.json())
    .then((data) => {
      // If the API returns any cities, display them. Otherwise, clear suggestions.
      if (data.length) {
        displaySuggestions(data);
      } else {
        clearSuggestions();
      }
    })
    .catch(() => {
      // Log errors and clear suggestions if the fetch fails.
      console.error("Error fetching city suggestions.");
      clearSuggestions();
    });
};

// --- Debounce and Event Listeners ---

// A higher-order function that limits how often another function can be called.
// This prevents excessive API calls while the user is typing.
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId); // Reset the timer on each call.
    // Set a new timer. The function will only run after the user stops typing for `delay` milliseconds.
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

// Create a debounced version of our city suggestion fetcher.
const debouncedGetCitySuggestions = debounce(getCitySuggestions, 300);

// Updates the visual styling for the currently active (keyboard-selected) suggestion.
const updateActiveSuggestion = (items) => {
  // Remove the active class from all items first.
  items.forEach((item) => item.classList.remove("autocomplete-active"));

  // Add the active class to the currently selected item, if one exists.
  if (activeSuggestionIndex > -1) {
    items[activeSuggestionIndex].classList.add("autocomplete-active");
  }
};

// Listen for keyboard events on the city input field.
cityInput.addEventListener("keydown", (e) => {
  const items = autocompleteResultsDiv.querySelectorAll(".autocomplete-item");
  if (!items.length) return; // Do nothing if there are no suggestions.

  if (e.key === "ArrowDown") {
    // Handle "ArrowDown": move selection down.
    activeSuggestionIndex++;
    if (activeSuggestionIndex >= items.length) {
      activeSuggestionIndex = 0; // Wrap around to the top.
    }
    updateActiveSuggestion(items);
  } else if (e.key === "ArrowUp") {
    // Handle "ArrowUp": move selection up.
    activeSuggestionIndex--;
    if (activeSuggestionIndex < 0) {
      activeSuggestionIndex = items.length - 1; // Wrap around to the bottom.
    }
    updateActiveSuggestion(items);
  } else if (e.key === "Enter") {
    // Handle "Enter": trigger a click on the active suggestion.
    e.preventDefault(); // Prevent form submission.
    if (activeSuggestionIndex > -1) {
      items[activeSuggestionIndex].click();
    }
  }
});

// Listen for the 'input' event, which fires every time the user types.
cityInput.addEventListener("input", (e) => {
  // Call the debounced function to fetch suggestions.
  debouncedGetCitySuggestions(e.target.value);
});

// Add a global click listener to the whole document.
document.addEventListener("click", (e) => {
  // If the user clicks anywhere outside the search container, close the suggestions dropdown.
  if (!e.target.closest(".search-container")) {
    clearSuggestions();
  }
});
