package main

import (
	"cars/backend/api"
	"encoding/json"
	"log"
	"net/http"
	"path/filepath"
	"strings"
)

var client *api.Client

func main() {
	// Define the port to listen on
	port := ":8080"

	// TODO: Initialize the API client
	// Using a placeholder URL. Update this with the real API URL when available.
	client = api.NewClient("https://private-anon-001099e03d-carsapi1.apiary-mock.com")

	// Helper to serve static files
	fs := http.FileServer(http.Dir(filepath.Join("web", "static")))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	// Serve images from api/img
	imgFs := http.FileServer(http.Dir(filepath.Join("api", "img")))
	http.Handle("/img/", http.StripPrefix("/img/", imgFs))

	// Route Handlers
	http.HandleFunc("/", handleIndex)
	http.HandleFunc("/details", handleDetails)
	http.HandleFunc("/compare", handleCompare)
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
	http.ServeFile(w, r, filepath.Join("web", "index.html"))
}

func handleDetails(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, filepath.Join("web", "details.html"))
}

func handleCompare(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, filepath.Join("web", "compare.html"))
}

func handleGetCars(w http.ResponseWriter, r *http.Request) {
	// TODO:
	// 1. Call the API client to fetch cars
	cars, err := client.FetchCars()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// 2. Handle errors (e.g., return http.StatusInternalServerError)
	// (Handled above)

	// 3. Encode the result as JSON and write to response
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(cars); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func handleGetCarDetails(w http.ResponseWriter, r *http.Request) {
	// TODO:
	// 1. Extract the car ID from the URL path
	id := strings.TrimPrefix(r.URL.Path, "/api/cars/")

	// 2. Call the API client to fetch car details
	details, err := client.FetchCarDetails(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// 3. Handle errors
	// (Handled above)

	// 4. Encode the result as JSON and write to response
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(details); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}
