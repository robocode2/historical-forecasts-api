# Historical Weather Forecast API

## Overview

This API allows users to retrieve historical weather forecast data for various cities, collected from different weather sources starting in September 2024. The data is available in both text and CSV formats. It includes detailed weather information, such as temperatures, humidity, wind speed, and precipitation chances, making it useful for weather analytics and forecasting applications.

This is a **closed API**, accessible by personal invitation only, and requires a VPN connection for security.

This Readme file provides instructions to run the API locally. To use the deployed version, see the User Manual in Procedural Instructions. 
---

## Technologies Used

- **Node.js**: Backend framework.
- **LoopBack**: Framework for building the API.
- **Docker**: Used for containerizing the application and environment.
- **WireGuard**: VPN software for securing API access.

> **Note**: The API does not include a database. The deployed database credentials are stored within the Docker image.


# Local Development : 

## Installation Instructions

### 1. Clone the repository

```bash
git clone https://github.com/robocode2/historical-weather-forecasts-api.git
cd historical-weather-forecasts-api
```


### 2. Install dependencies

```bash
npm install
```

### 3. Start the API

Once the dependencies are installed, start the API server with:

```bash
npm start
```

### 4. Running Tests

For this you will need to create a local PostgreSQL instance and connect it to the API. 
(or can I make docker set everything up?)

Tests can be run with 

 ```bash
    npm run build && npm run test
