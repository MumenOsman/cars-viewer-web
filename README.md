# Cars Viewer

A web application to showcase information about different car models, built with Go and vanilla HTML/JS.

## Project Overview
This project demonstrates:
- **Backend**: A Go server handling API requests and serving static files.
- **Frontend**: A modern, dark-themed responsive UI with glassmorphism effects.
- **Resilience**: Robust error handling with mock data fallback when external APIs are unavailable.

## Setup and Implementation Details

- **Backend**: Implemented in `backend/api/api.go` and `main.go`. It attempts to fetch from a remote API, but safely falls back to local mock data if the API is down.
- **Frontend**: 
    - `web/index.html`: Semantic HTML5 structure.
    - `web/static/style.css`: Custom CSS variables, Grid/Flexbox layout, and Dark Mode.
    - `web/static/script.js`: DOM manipulation, Fetch API integration, and Client-side filtering.

## How to Run

1.  **Prerequisites**: Ensure you have Go installed on your machine.
2.  **Run the Server**:
    ```bash
    go run .
    ```
    The server will start at `http://localhost:8080`.

3.  **View the App**: Open your browser and navigate to `http://localhost:8080`.

## Features
- **Car Listing**: Browse a grid of available cars.
- **Search**: Filter cars by name using the search bar.
- **Details View**: Click on any car to view detailed specifications (Engine, Horsepower, etc.) in a modal.
- **Responsive Design**: Works beautifully on desktop and mobile.