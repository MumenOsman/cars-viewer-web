package api

// Car represents the data structure for a car model.
type Car struct {
	ID             int    `json:"id"`
	Name           string `json:"name"`
	ManufacturerID int    `json:"manufacturerId"`
	CategoryID     int    `json:"categoryId"`
	Year           int    `json:"year"`
	Image          string `json:"image"`
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
	BaseURL string
	// TODO: Add any other necessary fields (e.g., HTTP client)
}

// NewClient creates a new API client.
func NewClient(baseURL string) *Client {
	// TODO: Initialize and return a new Client
	return &Client{
		BaseURL: baseURL,
	}
}

// FetchCars retrieves a list of cars from the API.
func (c *Client) FetchCars() ([]Car, error) {
	// TODO: Implement the logic to fetch cars from the API
	// 1. Construct the URL
	// 2. Make the HTTP GET request
	// 3. Decode the response body into a slice of Car structs
	// 4. Return the result
	panic("FetchCars not implemented")
}

// FetchCarDetails retrieves detailed information for a specific car by ID.
func (c *Client) FetchCarDetails(id string) (CarDetails, error) {
	// TODO: Implement the logic to fetch car details
	// 1. Construct the URL with the car ID
	// 2. Make the HTTP GET request
	// 3. Decode the response body into a CarDetails struct
	// 4. Return the result
	panic("FetchCarDetails not implemented")
}
