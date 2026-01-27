# Cars Viewer

A web application to showcase information about different car models, built with Go and vanilla HTML/JS.

## Project Overview
This project is a learning exercise designed to teach:
- Interacting with external APIs.
- Building a Go backend server.
- creating a dynamic frontend with HTML/CSS/JS.

## Setup and Installation

1.  **Prerequisites**: Ensure you have Go installed on your machine.
2.  **Clone/Download**: Get the project source code.
3.  **Dependencies**: Run `go mod tidy` to download necessary Go modules.

## Usage Guide

1.  **Backend Implementation**:
    - Open `backend/api/api.go` and implement the `FetchCars` and `FetchCarDetails` methods.
    - Open `main.go` and complete the `handleGetCars` and `handleGetCarDetails` handlers.

2.  **Frontend Implementation**:
    - Update `web/index.html` to add necessary UI elements.
    - Edit `web/static/script.js` to fetch data from your backend and render it on the page.

3.  **Run the Server**:
    ```bash
    go run main.go
    ```
    The server will start at `http://localhost:8080`.

4.  **View the App**: Open your browser and navigate to `http://localhost:8080`.

## Bonus Challenges
- Implement search/filtering.
- Add a "Compare" feature.
- Improve the design with CSS.
 