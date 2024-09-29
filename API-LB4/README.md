# Historical Weather Forecast API

This API serves to retrieve historical weather forecast data in text or CSV format. The data includes forecasts for different cities, from different sources, from September 2024 on. This is a closed API server made with the intention of being accessible by personal invitation only.

---

## User Manual

### Accessing the API
To access the API, connect to the custom VPN server.

1. **Request the VPN configuration file** from me or Frank (the supervisor of this project).
2. **Import the file** into an open VPN software like WireGuard.

3. **Connect with WireGuard**:
   - Install WireGuard. [https://www.wireguard.com/install/](https://www.wireguard.com/install/)
   - Click **Add Profile**.
   - Copy the VPN configuration into Content and save.
   - Connect.

   It may request you to enter your PC/Account’s password, if a password is set.

4. **Check your IP** under [WhatsMyIPAddress.com](https://www.whatsmyipaddress.com/). It should begin with **134**.

---

### Requesting Data

Get an idea of the available data using the general endpoints.

#### General Endpoints:

- `/cities`: Returns a list of cities for which forecasts exist.
- `/countries`: Returns a list of countries for which forecasts exist for cities.
- `/sources`: Returns a list of sources from which forecasts are collected.

Use query parameters to retrieve the data needed.

#### Forecasts:

Must be used with a combination of the following parameters:

- `/forecasts?city=city1Name, city2Name, city3Name` (cities must be separated by commas).
- `/forecasts?country=countryName`: Returns all forecasts saved for cities of that country.
- `/forecasts?source=sourceName`: Returns all forecasts collected from that source.
- `/forecasts?city=cityName&startDate=2024-09-20&endDate=2024-09-27 `: You can specify a date range that will return the forecasts collected for that date range. 
. Start & end dates can be used in separation or combination. Dates are formatted as `YYYY-MM-DD`.

Example multi-parameter request: `/forecasts?city=Tokyo,Berlin,Los Angeles&source=TheWeatherChannel&startDate=2024-09-20&endDate=2024-09-27`
Returns forecasts for `Tokyo, Berlin, Los Angeles` from source `TheWeatherChannel` for the date range `2024-09-20` to `2024-09-27`.



#### Data Format

The retrieved data is grouped by source and city and includes most, if not all, of the following columns:

```yaml
source:         # Source of the forecast (e.g., weather.com)
city:           # Name of the city (e.g., Tokyo)
country:        # Country of the city (e.g., Japan)
state:          # State or province, if applicable
day:            # Day of the forecast (e.g., Monday)
date:           # Date of the forecast (YYYY-MM-DD)
temp_high:      # Highest temperature of the day (in Celsius)
temp_low:       # Lowest temperature of the day (in Celsius)
wind_speed:     # Wind speed (in km/h)
humidity:       # Humidity percentage
precipitation_chance: # Chance of precipitation (in percentage)
precipitation_amount: # Amount of precipitation (in millimeters)
weather_condition:    # General weather condition (e.g., Clear, Rainy)
   ```

### Tests 

Tests can be run with 

 ```bash
    npm run build && npm run test
