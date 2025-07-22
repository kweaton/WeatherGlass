import React, {useState, useEffect} from "react";
import './Weather.css';
import search_icon from '../assets/search.png';
import sun_icon from '../assets/sun.png';
import rain_icon from '../assets/rain.png';
import humidity_icon from '../assets/humidity.png';
import wind_icon from '../assets/wind.png';
import snow_icon from '../assets/snow.png';
import cloudy_icon from '../assets/pcloudy.png';
function Weather(){

    const apiKey = process.env.REACT_APP_WEATHER_KEY;
    const [cityName, setCityName] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [weatherData, setWeatherData] = useState(false);
    const[debouncedQuery, setDebouncedQuery] = useState(cityName);
    const[loading, setLoading] = useState(false);

    function handleCity(e){
        setCityName(e.target.value);
    }
    function getWindDirection(degree) {
  if (degree >= 340 || degree < 20) return "N";
  if (degree >= 20 && degree < 60) return "NE";
  if (degree >= 60 && degree < 120) return "E";
  if (degree >= 120 && degree < 160) return "SE";
  if (degree >= 160 && degree < 200) return "S";
  if (degree >= 200 && degree < 240) return "SW";
  if (degree >= 240 && degree < 290) return "W";
  if (degree >= 290 && degree < 340) return "NW";
  return "";
    }

    const allIcons = {
        "01d": sun_icon,
        "01n": sun_icon,
        "02d": cloudy_icon,
        "02n": cloudy_icon,
        "03d": cloudy_icon,
        "03n": cloudy_icon,
        "04d": cloudy_icon,
        "04n": cloudy_icon,
        "09d": rain_icon,
        "09n": rain_icon,
        "10d": rain_icon,
        "10n": rain_icon,
        "13d": snow_icon,
        "13n": snow_icon
    }

    const search = async(city) =>{
        if(city === "")
        {
            alert("Enter city name");
            return;
        }
        setLoading(true);
        try {
            setSuggestions([]);
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`;
            const response = await fetch(url);
            const data = await response.json();

            if(!response.ok){
                alert(data.message);
                return;
            }
            console.log(data);

            const furl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=imperial&appid=${apiKey}`;
            const res = await fetch(furl);
            const fdata = await res.json();

            if(!res.ok){
                alert(data.message);
                return;
            }
            const forecasts = [fdata.list[3], fdata.list[11], fdata.list[19], fdata.list[27], fdata.list[35]]
            console.log(forecasts);
            const icon = allIcons[data.weather[0].icon] || sun_icon;
            const windData = data.wind.deg;
            console.log(windData);
            const windD = getWindDirection(windData);
            setWeatherData({
                humidity: data.main.humidity,
                windSpeed: data.wind.speed,
                temperature: Math.floor(data.main.temp),
                location: data.name,
                icon: icon,
                forecastList: forecasts,
                windDirection: windD
            })
        } catch (error) {
            setWeatherData(false);
            console.error("Error fetching data");
        }
        setLoading(false);
    }

    useEffect(() =>{
        search("Shidler");
    }, []);

    useEffect(() =>{
     const timeout = setTimeout(() => setDebouncedQuery(cityName), 500);
     return() => clearTimeout(timeout);
    }, [cityName]);

    useEffect(() =>{
        if(debouncedQuery.length < 2){
            setSuggestions([]);
            return;
        }

      fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${debouncedQuery}&limit=5&appid=${apiKey}`)
      .then(res => res.json())
      .then(data => setSuggestions(data))
      .catch((err) => console.error(err));
    }, [debouncedQuery]);
    
    const handleSelect = (city) =>{
        setCityName(city.name + ", " + city.state + ", " + city.country);
    }

    
    return(
        <div className="weather">
            <div className="searchBar">
                <input type="text" placeholder="Search" value={cityName} onChange={handleCity} onKeyDown={(e) => e.key ==='Enter' && search(cityName)}/>
                <img src={search_icon} alt="search icon" onClick={() => search(cityName)}/>
            </div>
            {suggestions.length > 0 && (
                <ul className="suggestions">
                    {suggestions.map((city, index) => (
                        <li
                        key={index}
                        className="suggestionItem"
                        onClick={() => handleSelect(city)}>
                            {city.name}, {city.state ? city.state +', ' : ''}{city.country}
                        </li>
                    ))}
                </ul>
            )}
            {loading && <div className="loader"></div>}
            {weatherData? <>
            <img src={weatherData.icon} alt="sun" className="weatherIcon" />
            <p className="temp">{weatherData.temperature}°</p>
            <p className="location">{weatherData.location}</p>
            <div className="scrollbar">
                {weatherData.forecastList.map((day, index) => (
                    
                    <div className="forecastDay" key={index}>
                        <p>{new Date(day.dt_txt).toLocaleDateString('en-US', {weekday: 'long'})}</p>
                        <img src={allIcons[day.weather[0].icon]} className="forecastImg"/>
                        <p>{Math.floor(day.main.temp)}</p>
                    </div>
                ))}
            </div>
            <div className="weatherData">
                <div className="col">
                    <img src={humidity_icon} alt="" />
                    <div>
                        <p>{weatherData.humidity}%</p>
                        <span>Humidity</span>
                    </div>
                </div>
                <div className="col">
                    <img src={wind_icon} alt="" />
                    <div>
                        <p>{weatherData.windSpeed} {weatherData.windDirection}</p>
                        <span>Wind Speed</span>
                    </div>
                </div>
            </div></>: <></>}
            
        </div>
    )
}

export default Weather;