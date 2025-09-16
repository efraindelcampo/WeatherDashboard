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
// Selects the div that will display the loading spinner.
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
  // Initialize an empty object to store daily min and max temperatures
  const dailyMinMaxTemps = {};
  // Iterate over each forecast entry in the list
  list.forEach((forecast) => {
    // Extract the date part (YYYY-MM-DD) from the forecast's timestamp
    const date = forecast.dt_txt.split(" ")[0];
    // If the date is not yet a key in the dailyMinMaxTemps object, initialize it
    dailyMinMaxTemps[date] = dailyMinMaxTemps[date] || { min: Infinity, max: -Infinity };
    // Update the minimum temperature for the current date
    dailyMinMaxTemps[date].min = Math.min(dailyMinMaxTemps[date].min, forecast.main.temp_min);
    // Update the maximum temperature for the current date
    dailyMinMaxTemps[date].max = Math.max(dailyMinMaxTemps[date].max, forecast.main.temp_max);
  });

  // Convert the dailyMinMaxTemps object into an array of daily summary objects
  return Object.keys(dailyMinMaxTemps).map((date) => {
    // Return a new object for each date
    return {
      // Set the date
      date: date,
      // Set the min and max temperatures for that day
      minMax: dailyMinMaxTemps[date],
      // Find a representative weather entry for the day
      weather: list.find(
        // First, try to find the forecast for noon (12:00:00) on that date
        (f) => f.dt_txt.startsWith(date) && f.dt_txt.includes("12:00:00")
      ) || list.find((f) => f.dt_txt.startsWith(date)), // If noon is not found, get the first forecast entry for the day
    };
  // Limit the result to the first four days
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

  loadingSpinner.classList.add("show-loading");
  
// This function gets the weather details for a specific city.
const getWeatherDetails = (cityName, lat, lon, state, country) => {
  // Clear any previous autocomplete suggestions from the UI.
  autocompleteResultsDiv.innerHTML = "";
  // Update the city input field with the selected city and state.
  cityInput.value = [cityName, state].filter(Boolean).join(", ");

  // Define the URL for fetching current weather data from the API.
  const CURRENT_WEATHER_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`;
  // Define the URL for fetching the 5-day forecast data from the API.
  const FORECAST_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`;

  // Display a loading spinner to provide user feedback.
  loadingSpinner.classList.add("show-loading");
  
  // Use Promise.all to fetch both current weather and forecast data at the same time for efficiency.
  Promise.all([fetch(CURRENT_WEATHER_URL), fetch(FORECAST_URL)])
    // Once both fetches are complete, parse the JSON data from each response.
    .then((responses) => Promise.all(responses.map((res) => res.json())))
    // Process the JSON data from both API calls.
    .then(([currentWeather, forecastData]) => {
      // Hide the loading spinner after the data is received.
      loadingSpinner.classList.remove("show-loading");

      // Process the forecast list to get daily min/max temperatures and a representative weather entry for each day.
      const dailyData = processForecastData(forecastData.list);

      // Clear the city input and any previously displayed weather data.
      cityInput.value = "";
      currentWeatherDiv.innerHTML = "";
      weatherCardsDiv.innerHTML = "";
      // Make the weather details sections visible to the user.
      weatherDetails.style.display = "block";
      daysForecastDiv.style.display = "block";

      // Create a formatted string for the full location name.
      const fullLocationName = [cityName, state, country]
        .filter(Boolean)
        .join(", ");

      // Generate and insert the HTML for the current weather card into the UI.
      currentWeatherDiv.innerHTML = createCurrentWeatherCard(
        fullLocationName,
        currentWeather,
        dailyData[0].minMax
      );

      // Iterate through the processed daily forecast data.
      dailyData.forEach((day) => {
        // Generate and append the HTML for each forecast card to the UI.
        weatherCardsDiv.insertAdjacentHTML(
          "beforeend",
          createForecastCard(cityName, day.weather, day.minMax)
        );
      });
    })
    // Catch any errors that might occur during the fetch operations.
    .catch(() => {
      // Hide the loading spinner in case of an error.
      loadingSpinner.classList.remove("show-loading");
      // Display an alert to the user notifying them of the error.
      alert("An error occurred while fetching the weather data!");
    });
};

// Clears the autocomplete suggestions from the UI.
const clearSuggestions = () => {
  autocompleteResultsDiv.innerHTML = "";
};

// This function displays a list of city suggestions for the user.
const displaySuggestions = (data) => {
  // Clear any existing suggestions from the previous search.
  clearSuggestions();
  // Reset the index of the currently active (highlighted) suggestion.
  activeSuggestionIndex = -1;

  // Use a Set to track and remove duplicate city entries.
  const seen = new Set();
  // Filter the incoming data to keep only unique city suggestions.
  const uniqueCities = data.filter((city) => {
    // Create a unique identifier string for each city (e.g., "New York, NY, US").
    const identifier = [city.name, city.state, city.country]
      .filter(Boolean)
      .join(", ");
    // Check if this identifier has already been seen.
    if (seen.has(identifier)) {
      // If it's a duplicate, return false to filter it out.
      return false;
    } else {
      // If it's a new city, add its identifier to the set.
      seen.add(identifier);
      // Return true to keep this city in the uniqueCities array.
      return true;
    }
  });

  // Iterate over each unique city to create a suggestion item for it.
  uniqueCities.forEach((city) => {
    // Create a new div element for the suggestion item.
    const suggestionItem = document.createElement("div");
    // Add the "autocomplete-item" class for styling.
    suggestionItem.classList.add("autocomplete-item");
    // Set the text content of the suggestion item to the formatted city name.
    suggestionItem.textContent = [city.name, city.state, city.country]
      .filter(Boolean)
      .join(", ");

    // Add a click event listener to the suggestion item.
    suggestionItem.addEventListener("click", () => {
      // When clicked, call the getWeatherDetails function with the city's data.
      getWeatherDetails(
        city.name,
        city.lat,
        city.lon,
        city.state,
        city.country
      );
    });

    // Append the newly created suggestion item to the autocomplete results container.
    autocompleteResultsDiv.appendChild(suggestionItem);
  });
};

// This function fetches city suggestions based on a user's input query.
const getCitySuggestions = (query) => {
  // Check if the input query is too short (less than 3 characters).
  if (query.length < 3) {
    // If it is, clear any existing suggestions.
    clearSuggestions();
    // Exit the function.
    return;
  }
  // Construct the API URL for the OpenWeatherMap geocoding service.
  const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`;

  // Start a fetch request to the geocoding API.
  fetch(GEOCODING_API_URL)
    // When the response is received, parse it as JSON.
    .then((res) => res.json())
    // Process the JSON data received from the API.
    .then((data) => {
      // Check if the data array contains any city results.
      if (data.length) {
        // If there are results, call displaySuggestions to show them to the user.
        displaySuggestions(data);
      } else {
        // If no results are found, clear any existing suggestions.
        clearSuggestions();
      }
    })
    // Catch any errors that occur during the fetch operation.
    .catch(() => {
      // Log an error message to the console for debugging purposes.
      console.error("Error fetching city suggestions.");
      // Clear suggestions from the UI in case of an error.
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
})};
