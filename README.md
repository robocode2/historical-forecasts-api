# Historical Weather Forecast API

## Introduction

This API is a Node.js project developed with Loopback4 for retrieving historical weather forecasts in CSV format. This is a private API, accessible only through a custom VPN setup.

This file provides instructions on accessing and using the API with the required custom VPN.  

---

## Using the API with local VPN

### Accessing the API

To access the API, you must connect via a custom VPN server. Follow the steps below:

1. **Install WireGuard Locally**  
   - Visit [WireGuard Install Page](https://www.wireguard.com/install/) to download the appropriate version for your system.
   - Install the stable GUI from [GitHub - WireGuard GUI](https://github.com/leon3s/wireguard-gui). Ensure all dependencies are installed.

2. **Set Up VPN Configuration**  
   - **Add Profile** in WireGuard:
     - Copy the VPN configuration into the “Content” area and save. Example configuration:
       ```plaintext
       [Interface]
       Address = 10.189.184.3/32
       PrivateKey = eLDjrm7IlfDKV76FNUaVFpruPUgZlcNiw4F/G6KoNVg=
       DNS = 67.207.67.2, 67.207.67.3

       [Peer]
       PublicKey = Z7f6XLuj5vdDpCHIzDSJL3I2DU+eGK7uYbn60K5bm1E=
       PresharedKey = GaSXP7Woqin+IE0QeMgMmcpb6hsdBgI4igxBgtCo4aM=
       Endpoint = 134.209.252.251:51820
       AllowedIPs = 0.0.0.0/0,::/0
       PersistentKeepalive = 25
       ```
   - **Connect**: Open WireGuard and connect using the saved profile. If prompted, enter your system password to authenticate. Now you can request data.

### Requesting Data

The following endpoints are available to query different data sets:

#### General Endpoints

- `/cities`: Returns a list of cities with forecast data.
- `/countries`: Returns a list of countries with forecasted cities.
- `/sources`: Provides a list of sources from which forecasts are collected.
- `/collection-dates`: Lists available data collection dates. Forecasts are available up to 14 days from each collection date.

#### Forecasts Endpoint

Use the `/forecasts` endpoint with a combination of parameters to retrieve the required forecast data:

- **By City**: `/forecasts?city=city1Name,city2Name,city3Name`
  - Example: `/forecasts?city=Tokyo,Berlin,Los Angeles`
- **By Country**: `/forecasts?country=countryName`
  - Example: `/forecasts?country=United States`
- **By Source**: `/forecasts?source=sourceName`
  - Example: `/forecasts?source=Meteoblue`
- **By Date Range**: `/forecasts?city=cityName&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
  - Example: `/forecasts?city=Tokyo,Berlin&startDate=2024-09-20&endDate=2024-09-27`

#### Data Format

The data is grouped by source and city, with the following columns typically included:

| Column                | Description                                       |
|-----------------------|---------------------------------------------------|
| `source`              | Source of the forecast (e.g., weather.com)        |
| `city`                | City name (e.g., Tokyo)                           |
| `country`             | Country of the city (e.g., Japan)                 |
| `state`               | State or province, if applicable                  |
| `collection_date`     | Date when data was collected in UTC format        |
| `forecasted_day`      | Date of the forecasted day in UTC format          |
| `temp_high`           | Highest temperature of the day (in Celsius)       |
| `temp_low`            | Lowest temperature of the day (in Celsius)        |
| `wind_speed`          | Wind speed (in km/h)                              |
| `humidity`            | Humidity percentage                               |
| `precipitation_chance`| Chance of precipitation (in %)                    |
| `precipitation_amount`| Amount of precipitation (in mm)                   |
| `weather_condition`   | General weather condition (e.g., Clear, Rainy)    |


#### Making Requests
   Once running, the VPN is running. You can make requests through Postman. Example:

   ```bash
   http://159.89.22.50:3000/forecasts?city=Tokyo,Berlin,Tofo&startDate=2024-10-22&endDate=2024-10-25
   ```

   
#### Example Data Format

The data is typically returned in the following CSV format:

```plaintext
source,city,country,state,collection_date,forecasted_day,temp_high,temp_low,wind_speed,humidity,precipitation_chance,precipitation_amount,weather_condition

TimeAndDate,Berlin,Germany,,Tue Oct 08 2024 10:21:41 GMT+0000 (Coordinated Universal Time),Tue Oct 22 2024 10:21:41 GMT+0000 (Coordinated Universal Time),60,10,10,57,4,, "Cloudy. "
```


## Local Setup

1. **Clone the Repository**  
   Clone the project repository to your local environment:

   ```bash
   git clone git@github.com:robocode2/capstone-api.git
   cd API-LB4
   ```

2. **Environment Setup**

   Make sure the following components are installed and configured:

- **Postgres**: Provided by Ubuntu.
- **Node.js**: Version 18.
- **NPM**
- **Docker**


3. **Install Dependencies**

   Run the following command to install required dependencies:

   ```bash
   npm install
   ```

4. **Install WireGuard**  
   - Visit [WireGuard Install Page](https://www.wireguard.com/install/) to download the appropriate version for your system.
   - Install the stable GUI from [GitHub - WireGuard GUI](https://github.com/leon3s/wireguard-gui). Ensure all dependencies are installed.

5. **Set Up VPN Configuration**  
   - **Add Profile** in WireGuard:
     - Copy the VPN configuration into the “Content” area and save. Example configuration:
       ```plaintext
       [Interface]
       Address = 10.189.184.3/32
       PrivateKey = eLDjrm7IlfDKV76FNUaVFpruPUgZlcNiw4F/G6KoNVg=
       DNS = 67.207.67.2, 67.207.67.3

       [Peer]
       PublicKey = Z7f6XLuj5vdDpCHIzDSJL3I2DU+eGK7uYbn60K5bm1E=
       PresharedKey = GaSXP7Woqin+IE0QeMgMmcpb6hsdBgI4igxBgtCo4aM=
       Endpoint = 134.209.252.251:51820
       AllowedIPs = 0.0.0.0/0,::/0
       PersistentKeepalive = 25
       ```
   - **Connect**: Open WireGuard and connect using the saved profile. If prompted, enter your system password to authenticate.

6. **Start the server with:**

   ```bash
   npm start
   ```
   Once the API is running locally, you can launch requests using a tool like Postman. Example request :

   ```bash
   http://[::1]:4008/forecasts?city=Tokyo,Berlin,Tofo&startDate=2024-10-22&endDate=2024-10-25   
   ```
   For further information on request parameters and queries, refer to "Using the Public API" document. 


### Alternative Setup Using Docker

Using the Docker image could provide a smoother setup. You can follow these steps:

1. **Download and Run the Docker Image**  
   Pull and run the Docker image to start the application locally:

   ```bash
   docker pull rabiab/historical_forecasts_api:v1
   docker run -p 3000:3000 rabiab/historical_forecasts_api:v1
   ```

2. **Start VPN Connection**  
   Activate your VPN connection. Refer to the instructions above.

3. **Access the API**
   Once running, the API is accessible. You can make requests through Postman. Example:

   ```bash
   http://127.0.0.1:3000/forecasts?city=Tokyo,Berlin,Tofo&startDate=2024-10-01&endDate=2024-10-07
   ```

### Running Tests

To run tests in the project, follow these steps:

1. **Install Docker**  
   Ensure Docker is installed on your system.

2. **Login to Docker**

   ```bash
   docker login
   ```

3. **Add Docker User to Group**
   If necessary, add the Docker user to the group to avoid permission issues. Reboot if permission denied issues persist.

   ```bash
   sudo usermod -aG docker $(whoami)
   sudo reboot
   ```

4. **Build and Run Tests**
   Run the following command to build the project and execute tests:

   ```bash
   npm run build && npm run test
   ```

   The testing setup will automatically set up the test database "testforecastsdb" and seed the test data.
