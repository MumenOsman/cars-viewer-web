package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"time"
)

// Car represents the data structure for a car model.
type Car struct {
	ID             int            `json:"id"`
	Name           string         `json:"name"`
	ManufacturerID int            `json:"manufacturerId"`
	CategoryID     int            `json:"categoryId"`
	Year           int            `json:"year"`
	Specifications Specifications `json:"specifications"`
	Image          string         `json:"image"`
}

// CarDetails represents detailed specifications for a specific car.
type Specifications struct {
	Engine       string `json:"engine"`
	Horsepower   int    `json:"horsepower"`
	Transmission string `json:"transmission"`
	Drivetrain   string `json:"drivetrain"`
}

type CarDetails struct {
	ID             int            `json:"id"`
	Name           string         `json:"name"`
	ManufacturerID int            `json:"manufacturerId"`
	CategoryID     int            `json:"categoryId"`
	Year           int            `json:"year"`
	Specifications Specifications `json:"specifications"`
	Image          string         `json:"image"`
}

// Client handles interactions with the Cars API.
type Client struct {
	BaseURL    string
	HTTPClient *http.Client
}

// NewClient creates a new API client.
func NewClient(baseURL string) *Client {
	return &Client{
		BaseURL: baseURL,
		HTTPClient: &http.Client{
			Timeout: 500 * time.Millisecond,
		},
	}
}

// FetchCars retrieves a list of cars from the API.
func (c *Client) FetchCars() ([]Car, error) {
	url := fmt.Sprintf("%s/cars", c.BaseURL)
	resp, err := c.HTTPClient.Get(url)

	// Fallback to local data if request fails or status is not OK
	if err != nil || (resp != nil && resp.StatusCode != http.StatusOK) {
		if resp != nil {
			resp.Body.Close()
		}
		return c.fetchLocalCars()
	}
	defer resp.Body.Close()

	var cars []Car
	if err := json.NewDecoder(resp.Body).Decode(&cars); err != nil {
		return nil, fmt.Errorf("failed to decode cars response: %w", err)
	}

	return cars, nil
}

// FetchCarDetails retrieves detailed information for a specific car by ID.
func (c *Client) FetchCarDetails(id string) (CarDetails, error) {
	url := fmt.Sprintf("%s/cars/%s", c.BaseURL, id)
	resp, err := c.HTTPClient.Get(url)

	// Fallback to local data
	if err != nil || (resp != nil && resp.StatusCode != http.StatusOK) {
		if resp != nil {
			resp.Body.Close()
		}
		return c.fetchLocalCarDetails(id)
	}
	defer resp.Body.Close()

	var details CarDetails
	if err := json.NewDecoder(resp.Body).Decode(&details); err != nil {
		return CarDetails{}, fmt.Errorf("failed to decode car details response: %w", err)
	}

	return details, nil
}

// Internal structures for parsing data.json
type localData struct {
	CarModels []localCarModel `json:"carModels"`
}

type localCarModel struct {
	ID             int            `json:"id"`
	Name           string         `json:"name"`
	ManufacturerID int            `json:"manufacturerId"`
	CategoryID     int            `json:"categoryId"`
	Year           int            `json:"year"`
	Specifications Specifications `json:"specifications"`
	Image          string         `json:"image"`
}

func (c *Client) loadLocalData() (*localData, error) {
	// Path to api/data.json - assuming running from project root
	file, err := os.ReadFile(filepath.Join("api", "data.json"))
	if err != nil {
		return nil, err
	}

	var data localData
	if err := json.Unmarshal(file, &data); err != nil {
		return nil, err
	}
	return &data, nil
}

func (c *Client) fetchLocalCars() ([]Car, error) {
	data, err := c.loadLocalData()
	if err != nil {
		return nil, fmt.Errorf("failed to load local data: %w", err)
	}

	var cars []Car
	for _, m := range data.CarModels {
		cars = append(cars, Car{
			ID:             m.ID,
			Name:           m.Name,
			ManufacturerID: m.ManufacturerID,
			CategoryID:     m.CategoryID,
			Year:           m.Year,
			Specifications: m.Specifications,
			Image:          "/img/" + m.Image, // Prepend /img/ for static serving
		})
	}
	return cars, nil
}

func (c *Client) fetchLocalCarDetails(idStr string) (CarDetails, error) {
	data, err := c.loadLocalData()
	if err != nil {
		return CarDetails{}, fmt.Errorf("failed to load local data: %w", err)
	}

	id := 0
	fmt.Sscanf(idStr, "%d", &id)

	for _, m := range data.CarModels {
		if m.ID == id {
			return CarDetails{
				ID:             m.ID,
				Name:           m.Name,
				ManufacturerID: m.ManufacturerID,
				CategoryID:     m.CategoryID,
				Year:           m.Year,
				Specifications: m.Specifications,
				Image:          "/img/" + m.Image,
			}, nil
		}
	}
	return CarDetails{}, fmt.Errorf("car not found in local data")
}
