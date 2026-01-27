package main

import (
	"log"
	"net/http"
	"path/filepath"
)

func main() {
	// Define the port to listen on
	port := ":8080"

	// TODO: Initialize the API client
	// client := api.NewClient("https://cars-api-url.com")

	// Helper to serve static files
	fs := http.FileServer(http.Dir(filepath.Join("web", "static")))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	// Route Handlers
	http.HandleFunc("/", handleIndex)
	http.HandleFunc("/api/cars", handleGetCars)
	http.HandleFunc("/api/cars/", handleGetCarDetails)

	log.Printf("Server starting on http://localhost%s", port)
	// Start the server
	if err := http.ListenAndServe(port, nil); err != nil {
		log.Fatal(err)
	}
}

func handleIndex(w http.ResponseWriter, r *http.Request) {
	// TODO: Serve the index.html file
	// hint: use http.ServeFile
	// filepath.Join("web", "index.html")
}

func handleGetCars(w http.ResponseWriter, r *http.Request) {
	// TODO:
	// 1. Call the API client to fetch cars
	// 2. Handle errors (e.g., return http.StatusInternalServerError)
	// 3. Encode the result as JSON and write to response
}

func handleGetCarDetails(w http.ResponseWriter, r *http.Request) {
	// TODO:
	// 1. Extract the car ID from the URL path
	// 2. Call the API client to fetch car details
	// 3. Handle errors
	// 4. Encode the result as JSON and write to response
}
