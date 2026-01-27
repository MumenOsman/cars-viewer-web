// TODO: API configuration
const API_BASE_URL = "/api";

document.addEventListener("DOMContentLoaded", () => {
    fetchCars();
});

// fetchCars retrieves the list of cars from the backend
async function fetchCars() {
    try {
        // TODO: call fetch on /api/cars
        // const response = await fetch(`${API_BASE_URL}/cars`);
        // const cars = await response.json();
        // renderCars(cars);
        console.log("fetchCars called");
    } catch (error) {
        console.error("Error fetching cars:", error);
    }
}

// renderCars displays the cars in the DOM
function renderCars(cars) {
    const container = document.getElementById("car-list");
    container.innerHTML = ""; // Clear existing content

    // TODO: Loop through cars and create HTML elements for each
    // cars.forEach(car => {
    //     const card = document.createElement("div");
    //     card.className = "car-card";
    //     card.innerHTML = `<h3>${car.make} ${car.model}</h3>`;
    //     card.onclick = () => showCarDetails(car.id);
    //     container.appendChild(card);
    // });
}

// showCarDetails fetches and displays details for a specific car
async function showCarDetails(id) {
    try {
        // TODO: Fetch details from /api/cars/:id
        // const response = await fetch(`${API_BASE_URL}/cars/${id}`);
        // const details = await response.json();

        // TODO: Populate the modal with details
        // document.getElementById("detail-model").innerText = details.model;
        // document.getElementById("detail-content").innerText = JSON.stringify(details, null, 2);

        // Show modal
        document.getElementById("car-details").classList.remove("hidden");
    } catch (error) {
        console.error("Error fetching car details:", error);
    }
}

// filterCars filters the car list based on user input
function filterCars() {
    const query = document.getElementById("search-input").value.toLowerCase();
    // TODO: Implement client-side or server-side filtering
    console.log("Filtering for:", query);
}

// closeDetails hides the details modal
function closeDetails() {
    document.getElementById("car-details").classList.add("hidden");
}
