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

    const allIcons = {
        "01d": sun_icon,
        "01n": sun_icon,
        "02d": cloudy_icon,
        "02n": cloudy_icon,
        "03d": cloudy_icon,
        "03n": cloudy_icon,
        "04d": rain_icon,
        "04n": rain_icon,
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
            const icon = allIcons[data.weather[0].icon] || sun_icon;
            setWeatherData({
                humidity: data.main.humidity,
                windSpeed: data.wind.speed,
                temperature: Math.floor(data.main.temp),
                location: data.name,
                icon: icon
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
        setCityName(city.name);
        search(city.name);
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
                        <p>{weatherData.windSpeed}</p>
                        <span>Wind Speed</span>
                    </div>
                </div>
            </div></>: <></>}
            
        </div>
    )
}

export default Weather;