# Conceptual Documentation

## API Architecture

This API is built using the LoopBack framework, based on Node.js, providing a structured way to expose endpoints for retrieving historical weather forecast data. The weather data is collected from multiple sources and stored in an external PostgreSQL database. The database credentials are saved within the Docker image, ensuring secure deployment without needing external configuration.

### Key components include:

1. **LoopBack:** Manages routing, validation, and error handling.
2. **Docker:** Containerizes the application for ease of deployment and consistency across environments.
3. **PostgreSQL**: Database for storing historical weather data.
4. **WireGuard**: VPN software for API access.

### Error Handling

#### Common errors include:

1. **404 Not Found:** If a city or source does not exist in the database.
2. **400 Bad Request:** If the request parameters are malformed (e.g., missing required parameters).

### Security

This API is secured through the use of a custom VPN setup, which restricts access to invited users only. Without a VPN connection, all API endpoints are inaccessible. This provides an extra layer of security, ensuring that sensitive weather data is not exposed to unauthorized users.
Use Cases

## Potential use cases for this API include:

1. **Weather Forecast Analytics:** Users can analyze historical weather forecasts with actual weather.
2. **Weather Forecast Errors:**  The data provided helps to gain insights into errors. 
3. **AI Forecasting Applications:**  The data can be used to build or enhance predictive weather models.
