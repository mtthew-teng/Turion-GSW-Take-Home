# Spacecraft Telemetry Monitoring System
This project is a complete telemetry monitoring system for spacecraft, featuring real-time data visualization, anomaly detection, and historical data analysis.
## System Overview
The system consists of three main components:

Backend - Go-based server that receives and processes telemetry packets over UDP, stores data in PostgreSQL, and provides a REST API and WebSocket for real-time updates.
Frontend - React application with a modern UI that displays telemetry data in real-time, provides visualizations, and allows for historical data analysis.
Generator - Simulates a spacecraft by generating CCSDS formatted telemetry packets and sending them to the backend via UDP.

## How to Run the Application

### Prerequisites
* Docker
* Docker Compose

### Running with Docker Compose
The easiest way to run the entire system is using Docker Compose:

```
docker compose up
```

This will start the following services:

* Frontend (accessible at http://localhost:5173)
* Backend (API at http://localhost:3000, UDP on port 8089)
* PostgreSQL Database
* Telemetry Generator

### Manual Setup

#### Database
* Create a database in Postgres with a name of your choice
* You do not need to create the datatable as it will be created for you
* Put an .env file in the backend directory with your database credentials

The following steps will need to be run in separate terminals.

#### Backend

```
cd backend
go mod download
# Make sure PostgreSQL is running and accessible
# You may need to modify the database configuration in internal/config/config.go
# or set environment variables (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME)
go run cmd/server/main.go
```

#### Frontend

```
cd frontend
npm install
# By default, the frontend expects the API at http://localhost:3000
# If you've changed the backend port, update the API_URL in src/services/telemetryService.js
npm run dev
```

#### Generator

```
cd generator
go mod download
# You'll need to modify the connection address in cmd/generator/main.go:
# Change "backend:8089" to "localhost:8089" in the net.Dial() function call
go run cmd/generator/main.go
```

## Requirements

### Part 0: Packet Generator
I used the provided code for this part. You will find it located in ./generator/cmd/generator/main.go. None of the code is changed aside from the part connecting to the UDP port for Dockerization.

### Part 1: Telemetry Ingestion Service

For this part, I created a UDP server in Go that listens for incoming telemetry packets. The server processes CCSDS-formatted packets according to the provided structure, and validates telemetry values against defined ranges. The implementation uses goroutines to handle packet processing concurrently, which is efficient for high-volume telemetry streams.

Key features:

* UDP listener on port 8089
* Binary decoding of CCSDS packet format
* Anomaly detection with threshold validation:

    * Temperature: 20.0°C to 30.0°C (normal), >35.0°C (anomaly)
    * Battery: 70-100% (normal), <40% (anomaly)
    * Altitude: 500-550km (normal), <400km (anomaly)
    * Signal Strength: -60 to -40dB (normal), <-80dB (anomaly)


* Persistence to PostgreSQL database
* Real-time broadcasting of telemetry data and anomalies via WebSocket

The code for this can be found in backend/internal/telemetry/.

### Part 2: Telemetry API Service
I implemented a REST API using the Fiber web framework for Go. The API provides endpoints for querying historical telemetry data with time range filtering, aggregating metrics, and retrieving current satellite status. Originally I had another endpoint /api/v1/telemetry/:count which I used to populate the graphs and tables with an initial set of data, but I realized this could be done by fetching one page using the paginated endpoint for the table instead.

API Endpoints:

* GET /api/v1/telemetry - Query historical telemetry with time range filters
* GET /api/v1/telemetry/current - Get the latest telemetry values
* GET /api/v1/telemetry/anomalies - Get anomalies with time range filters
* GET /api/v1/telemetry/aggregate - Get min, max, and average values over a time period
* GET /api/v1/telemetry/paginated - Get paginated telemetry data with optional filtering

The code for this part is in backend/internal/api/.

### Part 3: Frontend Implementation
I created a React-based telemetry dashboard that provides:

* Real-time updates showing the most recent telemetry values
* Historical data visualization through charts and tables
* Anomaly notifications using toast messages
* Filtering capabilities for data analysis

The frontend connects to the backend API for historical data and uses WebSockets for real-time updates. The UI is responsive and built with Tailwind CSS. 

Some Features:
* First page of telemetry table updates in realtime unless page is changed or filter is opened.
* Filtering for aggregated statistics card and telemetry table.
* User inputtable page number to allow page jumping

Frontend Tools and Libraries:

* React - Used as the main frontend framework
* Vite - For fast development and optimized builds
* Tailwind CSS - For responsive and utility-first styling
* React Router - For client-side routing between dashboard views
* Recharts - For creating interactive and responsive charts to visualize telemetry data
* React Icons - Provides icon components used throughout the interface (FiFilter, FaTemperatureHalf, FaSignal, etc.)
* React Toastify - For displaying real-time anomaly notifications
* Axios - For making HTTP requests to the backend API
* WebSocket API - For real-time data streaming
* Design inspiration - https://www.youtube.com/watch?v=8fhDE5Tj6RI
* Pagination bar - https://tailwindcss.com/plus/ui-blocks/application-ui/navigation/pagination

The code for the frontend is in the frontend/ directory.

### Part 4: What I Would Implement if I Had More Time

* Table and Graph pages with more and better features for visualization and user interactivity
* Dark mode
* Notification inbox for toast notification messages
* General code organization (e.g. separating the websocket and api handling in the frontend)

