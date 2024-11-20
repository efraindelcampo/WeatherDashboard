const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

const API_KEY = "0946c1c99daa825be0df3ab6838f71d2";

const createWeatherCard = (weatherItem) => {
  if (index === 0) {
    return `<div class="details">
            <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
            <h4>Temp: ${weatherItem.main.temp}°</h4>
            <h4>Wind: ${weatherItem.wind.speed}mph</h4>
            <h4>Humiidty: ${weatherItem.main.humidity}%</h4>
            </div>`;
  } else {
    return `<li class="card">
      <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
      <h4>Temp: ${weatherItem.main.temp}°</h4>
      <h4>Wind: ${weatherItem.wind.speed}mph</h4>
      <h4>Humiidty: ${weatherItem.main.humidity}%</h4>
      </li>`;
  }
};

const getWeatherDetails = (cityName, lat, lon) => {
  const WEATHER_API_URL = `http://api.openweathermap.org/data/2.5/forecast/daily?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
  fetch(WEATHER_API_URL)
    .then((res) => res.json())
    .then((data) => {
      const uniqueForcastDays = [];
      const fiveDayForecast = data.list.filter((forecast) => {
        const forecastDate = new Date(forecast.dt_txt).getDate();
        if (!uniqueForcastDays.includes(forecastDate)) {
          return uniqueForcastDays.push(forecastDate);
        }
      });

      cityInput.value = "";
      currentWeatherDiv.innerHTML = "";
      weatherCardsDiv.innerHTML = "";

      console.log(fiveDayForecast);
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

  const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (!cityName) return;
    const GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    fetch(GEOCODING_API_URL)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        if (!data.length) return alert(`No coordiantes found for city!`);
        const { name, lat, lon } = data[0];
        getWeatherDetails(name, lat, lon);
      })
      .catch(() => {
        alert("Error occured");
      });
  };
};

searchButton.addEventListener("click", getCityCoordinates);
