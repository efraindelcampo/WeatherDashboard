// // DOM Element Selectors
// const cityInput = document.querySelector(".city-input");
// const searchButton = document.querySelector(".search-btn");
// const currentWeatherDiv = document.querySelector(".current-weather");
// const weatherCardsDiv = document.querySelector(".weather-cards");
// const forecastDiv = document.querySelector(".days-forecast");

// const API_KEY = "0946c1c99daa825be0df3ab6838f71d2";

// const getWeatherIcon = (conditionId) => {
//   switch (true) {
//     case conditionId >= 200 && conditionId <= 232:
//       return "⛈️"; // Group 2xx: Thunderstorm
//     case conditionId >= 300 && conditionId <= 321:
//       return "🌦️"; // Group 3xx: Drizzle
//     case conditionId >= 500 && conditionId <= 531:
//       return "🌧️"; // Group 5xx: Rain
//     case conditionId >= 600 && conditionId <= 622:
//       return "❄️"; // Group 6xx: Snow
//     case conditionId >= 701 && conditionId <= 781:
//       return "🌫️"; // Group 7xx: Atmosphere
//     case conditionId === 800:
//       return "☀️"; // Group 800: Clear
//     case conditionId === 801:
//       return "🌤️"; // Group 80x: Clouds (few)
//     case conditionId >= 802 && conditionId <= 804:
//       return "☁️"; // Group 80x: Clouds (scattered, broken, overcast)
//   }
// };

// const createWeatherCard = (locationName, weatherItem, index) => {
//   const date = new Date(weatherItem.dt_txt);
//   const formattedDate = date.toLocaleDateString("en-US");
//   const weatherId = weatherItem.weather[0].id;
//   const iconName = getWeatherIcon(weatherId);
//   const description = weatherItem.weather[0].description;

//   if (index === 0) {
//     // Main weather card for today
//     return `<div class="current-weather">
//             <h2>${locationName}<br>${formattedDate}</h2>
//             <span class="material-symbols-outlined" style="font-size: 3rem;">${iconName}</span>
//             <h4>${description}</h4>
//             <h4>Temp: ${(
//               (weatherItem.main.feels_like - 273.15) * 1.8 +
//               32
//             ).toFixed(1)}°F / ${(weatherItem.main.feels_like - 273.15).toFixed(
//       1
//     )}°C</h4>
//             <h4>Highs: ${(
//               (weatherItem.main.temp_max - 273.15) * 1.8 +
//               32
//             ).toFixed(1)}°F / ${(weatherItem.main.temp_max - 273.15).toFixed(
//       1
//     )}°C</h4>
//             <h4>Lows: ${(
//               (weatherItem.main.temp_min - 273.15) * 1.8 +
//               32
//             ).toFixed(1)}°F / ${(weatherItem.main.temp_min - 273.15).toFixed(
//       1
//     )}°C</h4>
//             <h4>Wind: ${weatherItem.wind.speed}mph</h4>
//             <h4>Humidty: ${weatherItem.main.humidity}%</h4>
//             </div>`;
//   } else {
//     return `<li class="card">
//             <h3>${locationName} ${formattedDate}</h3>
//             <span class="material-symbols-outlined" style="font-size: 3rem;">${iconName}</span>
//             <h4>${description}</h4>
//             <h4>Highs: ${(
//               (weatherItem.main.temp_max - 273.15) * 1.8 +
//               32
//             ).toFixed(1)}°F / ${(weatherItem.main.temp_max - 273.15).toFixed(
//       1
//     )}°C</h4>
//             <h4>Lows: ${(
//               (weatherItem.main.temp_min - 273.15) * 1.8 +
//               32
//             ).toFixed(1)}°F / ${(weatherItem.main.temp_min - 273.15).toFixed(
//       1
//     )}°C</h4>
//             <h4>Wind: ${weatherItem.wind.speed}mph</h4>
//             <h4>Humidty: ${weatherItem.main.humidity}%</h4>
//             </li>`;
//   }
// };

// const getWeatherDetails = (cityName, lat, lon, state, country) => {
//   const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
//   fetch(WEATHER_API_URL)
//     .then((res) => res.json())
//     .then((data) => {
//       const uniqueForecastDays = [];
//       const fiveDayForecast = data.list
//         .filter((forecast) => {
//           const forecastDate = new Date(forecast.dt_txt).getDate();
//           if (!uniqueForecastDays.includes(forecastDate)) {
//             uniqueForecastDays.push(forecastDate); // Add the date to our tracking array
//             return true; // Return true to keep this item
//           }
//           return false; // Return false to discard duplicates
//         })
//         .slice(0, 5); // Use .slice(0, 5) to get only the first 5 unique days

//       // Clear previous weather data
//       cityInput.value = "";
//       currentWeatherDiv.innerHTML = "";
//       weatherCardsDiv.innerHTML = "";

//       // Make the forecast section visible
//       forecastDiv.style.display = "block";

//       // Create and display weather cards
//       fiveDayForecast.forEach((weatherItem, index) => {
//         let locationName = cityName; // Default to just the city name

//         // Conditionally build the location string for the main card
//         if (index === 0) {
//           const locationParts = [cityName, state, country];
//           locationName = locationParts.filter((part) => part).join(", ");
//         }
//         if (index === 0) {
//           currentWeatherDiv.insertAdjacentHTML(
//             "beforeend",
//             createWeatherCard(locationName, weatherItem, index)
//           );
//         } else {
//           weatherCardsDiv.insertAdjacentHTML(
//             "beforeend",
//             createWeatherCard(cityName, weatherItem, index)
//           );
//         }
//       });
//     })
//     .catch(() => {
//       alert("Error occured");
//     });
// };

// const getCityCoordinates = () => {
//   const cityName = cityInput.value.trim();
//   if (!cityName) return;
//   const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

//   fetch(GEOCODING_API_URL)
//     .then((res) => res.json())
//     .then((data) => {
//       if (!data.length) return alert(`No coordinates found for city!`);
//       const { name, lat, lon, state, country } = data[0];
//       getWeatherDetails(name, lat, lon, state, country);
//     })
//     .catch(() => {
//       alert("Error occured");
//     });
// };

// searchButton.addEventListener("click", getCityCoordinates);
// cityInput.addEventListener(
//   "keyup",
//   (e) => e.key === "Enter" && getCityCoordinates()
// );


// DOM Element Selectors
const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");
const daysForecastDiv = document.querySelector(".days-forecast"); 

// Use your actual API Key
const API_KEY = "0946c1c99daa825be0df3ab6838f71d2";

// Gets weather icon based on OpenWeather condition ID
const getWeatherIcon = (conditionId) => {
    switch (true) {
        case conditionId >= 200 && conditionId <= 232: return "⛈️";
        case conditionId >= 300 && conditionId <= 321: return "🌦️";
        case conditionId >= 500 && conditionId <= 531: return "🌧️";
        case conditionId >= 600 && conditionId <= 622: return "❄️";
        case conditionId >= 701 && conditionId <= 781: return "🌫️";
        case conditionId === 800: return "☀️";
        case conditionId >= 801 && conditionId <= 804: return "☁️";
        default: return "❓";
    }
};

// Creates the main weather card using data from both APIs
const createCurrentWeatherCard = (locationName, currentWeather, todayMinMax) => {
    const date = new Date(currentWeather.dt * 1000);
    const formattedDate = date.toLocaleDateString("en-US");
    const icon = getWeatherIcon(currentWeather.weather[0].id);
    const description = currentWeather.weather[0].description;
    const formattedDesc = description.charAt(0).toUpperCase() + description.slice(1);

    return `<div class="current-weather">
                <h2>${locationName}</h2>
                <h2>${formattedDate}</h2>
                <h6>${formattedDesc}</h6>
                <span style="font-size: 2rem">${icon}</span>
                <h6>${currentWeather.main.temp.toFixed(0)}°F</h6>
                <h6>High: ${todayMinMax.max.toFixed(0)}°F</h6>
                <h6>Low: ${todayMinMax.min.toFixed(0)}°F</h6>
                <h6>Wind: ${currentWeather.wind.speed.toFixed(0)} mph</h6>
                <h6>Humidity: ${currentWeather.main.humidity}%</h6>
            </div>`;
};

// Creates the smaller 4-day forecast cards
const createForecastCard = (cityName, weatherItem, dailyMinMax) => {
    const date = new Date(weatherItem.dt * 1000);
    const weekday = date.toLocaleDateString("en-US");
    const icon = getWeatherIcon(weatherItem.weather[0].id);
    const description = weatherItem.weather[0].description;
    const avgTemp = ((dailyMinMax.max + dailyMinMax.min) / 2).toFixed(0);
    const windSpeed = weatherItem.wind.speed.toFixed(0);
    const humidity = weatherItem.main.humidity;
    const formattedDesc = description.charAt(0).toUpperCase() + description.slice(1);

    return `<li class="card">
                <h3>${cityName}</h3>
                <h3>${weekday}</h3>
                <span style="font-size: 2rem;">${icon}</span>
                <h6>${formattedDesc}</h6>
                <h6>Avg: ${avgTemp}°F</h6> 
                <h6>High: ${dailyMinMax.max.toFixed(0)}°F</h6>
                <h6>Low: ${dailyMinMax.min.toFixed(0)}°F</h6>
                <h6>Wind: ${windSpeed} mph</h6>
                <h6>Humidity: ${humidity}%</h6>
            </li>`;
};

// Fetches and displays all weather data
const getWeatherDetails = (cityName, lat, lon, state, country) => {
    const CURRENT_WEATHER_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`;
    const FORECAST_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`;

    Promise.all([fetch(CURRENT_WEATHER_URL), fetch(FORECAST_URL)])
        .then(responses => Promise.all(responses.map(res => res.json())))
        .then(([currentWeather, forecastData]) => {
            // Calculate daily highs and lows from forecast data
            const dailyMinMaxTemps = {};
            forecastData.list.forEach(forecast => {
                const date = forecast.dt_txt.split(" ")[0];
                if (!dailyMinMaxTemps[date]) {
                    dailyMinMaxTemps[date] = { min: forecast.main.temp_min, max: forecast.main.temp_max };
                } else {
                    dailyMinMaxTemps[date].min = Math.min(dailyMinMaxTemps[date].min, forecast.main.temp_min);
                    dailyMinMaxTemps[date].max = Math.max(dailyMinMaxTemps[date].max, forecast.main.temp_max);
                }
            });

            // Combine all daily data into one clean array
            const dailyData = Object.keys(dailyMinMaxTemps).map(date => {
                return {
                    date: date,
                    minMax: dailyMinMaxTemps[date],
                    weather: forecastData.list.find(f => f.dt_txt.startsWith(date) && f.dt_txt.includes("12:00:00")) || forecastData.list.find(f => f.dt_txt.startsWith(date))
                };
            }).slice(0, 5);

            // Clear previous data and display the new cards
            cityInput.value = "";
            currentWeatherDiv.innerHTML = "";
            weatherCardsDiv.innerHTML = "";
            daysForecastDiv.style.display = "block";
            
            const fullLocationName = [cityName, state, country].filter(Boolean).join(", ");

            // Display the main current weather card
            currentWeatherDiv.innerHTML = createCurrentWeatherCard(fullLocationName, currentWeather, dailyData[0].minMax);
            
            // Display the next 4-day forecast cards
            dailyData.slice(1).forEach(day => {
                weatherCardsDiv.insertAdjacentHTML("beforeend", createForecastCard(cityName, day.weather, day.minMax));
            });
        })
        .catch(() => {
            alert("An error occurred while fetching the weather data!");
        });
};

// Gets city coordinates from user input
const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (!cityName) return;
    const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    fetch(GEOCODING_API_URL)
        .then(res => res.json())
        .then(data => {
            if (!data.length) return alert(`No coordinates found for ${cityName}`);
            const { name, lat, lon, state, country } = data[0];
            getWeatherDetails(name, lat, lon, state, country);
        })
        .catch(() => {
            alert("An error occurred while fetching the coordinates!");
        });
};

searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", (e) => e.key === "Enter" && getCityCoordinates());