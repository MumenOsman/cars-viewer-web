const API_BASE_URL = "/api";
let allCars = [];
let compareList = JSON.parse(localStorage.getItem('compareList') || '[]');

document.addEventListener("DOMContentLoaded", () => {
    // Robust path detection
    const path = window.location.pathname.replace(/\/$/, ""); // Remove trailing slash

    // Global: Initial badge update
    updateCompareBadge();

    if (path === "" || path === "/" || path === "/index.html") {
        fetchCars();
        initSearch();
    } else if (path === "/details" || path === "/details.html") {
        const urlParams = new URLSearchParams(window.location.search);
        const carId = urlParams.get('id');
        if (carId) {
            loadDetailsPage(carId);
        } else {
            showError("detail-container", "Car ID is missing.");
        }
    } else if (path === "/compare" || path === "/compare.html") {
        loadComparePage();
    }
});

function initSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') filterCars();
        });
    }
}

function showError(containerId, message) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `<div style="text-align:center; padding: 2rem; color: #ef4444;">
            <p>${message}</p>
            <a href="/" style="color: var(--accent); text-decoration: underline;">Back to Home</a>
        </div>`;
    }
}

// fetchCars retrieves the list of cars from the backend
async function fetchCars() {
    const listContainer = document.getElementById("car-list");
    try {
        const response = await fetch(`${API_BASE_URL}/cars`);
        if (!response.ok) throw new Error("Failed to fetch cars");

        allCars = await response.json();
        renderCars(allCars);
    } catch (error) {
        console.error("Error fetching cars:", error);
        showError("car-list", "Error loading cars. Please try again later.");
    }
}

// renderCars displays the cars in the DOM
function renderCars(cars) {
    const listContainer = document.getElementById("car-list");
    if (!listContainer) return;

    listContainer.innerHTML = "";
    if (cars.length === 0) {
        listContainer.innerHTML = `<p style="text-align:center; grid-column: 1/-1; padding: 2rem;">No matching cars found.</p>`;
        return;
    }

    cars.forEach(car => {
        const isCompared = compareList.includes(parseInt(car.id));
        const card = document.createElement("div");
        card.className = "car-card";
        card.style.position = "relative";

        const imageSrc = car.image || "https://via.placeholder.com/400x300/1e293b/94a3b8?text=No+Image";

        card.innerHTML = `
            <div class="compare-checkbox-container" onclick="event.stopPropagation()">
                <input type="checkbox" id="compare-${car.id}" ${isCompared ? 'checked' : ''} onchange="toggleCompare(${car.id})">
                <label for="compare-${car.id}">Compare</label>
            </div>
            <div onclick="window.location.href = '/details?id=${car.id}'">
                <img src="${imageSrc}" alt="${car.name}" class="card-image" onerror="this.src='https://via.placeholder.com/400x300/1e293b/94a3b8?text=Error'">
                <div class="card-content">
                    <h3 class="card-title">${car.name}</h3>
                    <div class="card-meta">
                        <span class="tag">${car.year}</span>
                        <span>Category: ${car.categoryId}</span>
                    </div>
                </div>
            </div>
        `;
        listContainer.appendChild(card);
    });
}

function toggleCompare(id) {
    id = parseInt(id);
    const index = compareList.indexOf(id);
    if (index === -1) {
        if (compareList.length >= 4) {
            alert("Limit: 4 cars for comparison.");
            const chk = document.getElementById(`compare-${id}`);
            if (chk) chk.checked = false;
            return;
        }
        compareList.push(id);
    } else {
        compareList.splice(index, 1);
    }
    localStorage.setItem('compareList', JSON.stringify(compareList));
    updateCompareBadge();
}

function updateCompareBadge() {
    let badge = document.getElementById('compare-badge');
    const path = window.location.pathname.replace(/\/$/, "");

    // Only show badge on home page
    const isHome = (path === "" || path === "/" || path === "/index.html");

    if (!badge && isHome) {
        badge = document.createElement('div');
        badge.id = 'compare-badge';
        badge.className = 'compare-badge';
        badge.onclick = () => window.location.href = '/compare';
        document.body.appendChild(badge);
    }

    if (badge) {
        if (compareList.length > 0 && isHome) {
            badge.classList.remove('hidden');
            badge.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>
                Compare (${compareList.length})
            `;
        } else {
            badge.classList.add('hidden');
        }
    }
}

async function loadDetailsPage(id) {
    const detailContainer = document.getElementById("detail-container");
    if (!detailContainer) return;

    detailContainer.innerHTML = '<div class="loading-spinner"></div>';
    try {
        const response = await fetch(`${API_BASE_URL}/cars/${id}`);
        if (!response.ok) throw new Error("Not found");
        const car = await response.json();
        renderDetailsOnPage(car);
        loadRecommendations(car);
    } catch (e) {
        showError("detail-container", "Car details could not be loaded.");
    }
}

function renderDetailsOnPage(car) {
    const detailContainer = document.getElementById("detail-container");
    const imageSrc = car.image || "https://via.placeholder.com/800x600/1e293b/94a3b8?text=No+Image";

    detailContainer.innerHTML = `
        <div class="details-grid" style="grid-template-columns: 1.5fr 1fr; margin-top: 2rem; gap: 3rem;">
            <img src="${imageSrc}" alt="${car.name}" class="details-image" style="box-shadow: var(--shadow-lg);">
            <div class="details-info">
                <h1 style="font-size: 3rem; margin-bottom: 0.5rem;">${car.name}</h1>
                <p style="color: var(--accent); font-size: 1.5rem; font-weight: 600; margin-bottom: 2rem;">${car.year}</p>
                
                <h3 style="border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; margin-bottom: 1rem;">Specifications</h3>
                <ul class="spec-list">
                    <li><span class="spec-label">Engine</span><span class="spec-value">${car.specifications.engine}</span></li>
                    <li><span class="spec-label">Horsepower</span><span class="spec-value">${car.specifications.horsepower} HP</span></li>
                    <li><span class="spec-label">Transmission</span><span class="spec-value">${car.specifications.transmission}</span></li>
                    <li><span class="spec-label">Drivetrain</span><span class="spec-value">${car.specifications.drivetrain}</span></li>
                </ul>
            </div>
        </div>
    `;
}

async function loadComparePage() {
    const container = document.getElementById('compare-container');
    if (compareList.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding: 4rem 0;">
            <p style="font-size: 1.2rem; margin-bottom: 2rem;">No cars selected for comparison.</p>
            <a href="/" class="tag" style="padding: 1rem 2rem; font-size: 1rem; text-decoration: none;">Return to Showroom</a>
        </div>`;
        return;
    }

    try {
        // Optimized: Fetch all cars and filter locally
        const response = await fetch(`${API_BASE_URL}/cars`);
        const all = await response.json();
        const selected = all.filter(c => compareList.includes(parseInt(c.id)));

        // Final sanity check: fetch details for selected to get specs if list API doesn't have them
        // Actually, my backend API for /cars includes all details currently.
        renderCompareTable(selected);
    } catch (error) {
        showError("compare-container", "Error loading comparison.");
    }
}

function renderCompareTable(cars) {
    const container = document.getElementById('compare-container');
    const maxHorsepower = Math.max(...cars.map(c => c.specifications.horsepower || 0));

    let tableHtml = `
        <div style="display: flex; justify-content: flex-end; margin-bottom: 1rem;">
            <button class="compare-remove" onclick="clearAllCompare()" style="text-decoration: none; background: #ef4444; color: white; padding: 0.5rem 1rem; border-radius: 6px;">Clear All</button>
        </div>
        <table class="compare-table">
        <thead>
            <tr>
                <th>Features</th>
                ${cars.map(car => `
                    <th class="compare-col-header">
                        <img src="${car.image}" alt="${car.name}" class="compare-car-img" onerror="this.src='https://via.placeholder.com/400x300/1e293b/94a3b8?text=Error'">
                        <div class="compare-car-name">${car.name}</div>
                        <button class="compare-remove" onclick="removeFromCompare(${car.id})">Remove</button>
                    </th>
                `).join('')}
            </tr>
        </thead>
        <tbody>
            <tr><th>Year</th>${cars.map(car => `<td>${car.year}</td>`).join('')}</tr>
            <tr><th>Engine</th>${cars.map(car => `<td>${car.specifications.engine}</td>`).join('')}</tr>
            <tr>
                <th>Horsepower</th>
                ${cars.map(car => {
        const isBest = car.specifications.horsepower === maxHorsepower && maxHorsepower > 0;
        return `<td class="${isBest ? 'spec-highlight' : ''}">${car.specifications.horsepower} HP ${isBest ? '🏆' : ''}</td>`;
    }).join('')}
            </tr>
            <tr><th>Transmission</th>${cars.map(car => `<td>${car.specifications.transmission}</td>`).join('')}</tr>
            <tr><th>Drivetrain</th>${cars.map(car => `<td>${car.specifications.drivetrain}</td>`).join('')}</tr>
        </tbody>
    </table>`;

    container.innerHTML = tableHtml;
}

function removeFromCompare(id) {
    compareList = compareList.filter(carId => carId !== parseInt(id));
    localStorage.setItem('compareList', JSON.stringify(compareList));
    loadComparePage();
}

function clearAllCompare() {
    compareList = [];
    localStorage.removeItem('compareList');
    loadComparePage();
}

async function loadRecommendations(currentCar) {
    const recContainer = document.getElementById("recommendations-list");
    if (!recContainer) return;
    try {
        const response = await fetch(`${API_BASE_URL}/cars`);
        const list = await response.json();
        const recommended = list.filter(c => c.categoryId === currentCar.categoryId && c.id !== currentCar.id).slice(0, 3);

        if (recommended.length === 0) {
            renderCarsToContainer(list.filter(c => c.id !== currentCar.id).slice(0, 3), recContainer);
        } else {
            renderCarsToContainer(recommended, recContainer);
        }
    } catch (e) {
        recContainer.innerHTML = "<p>Recommendations unavailable.</p>";
    }
}

function renderCarsToContainer(cars, container) {
    container.innerHTML = "";
    cars.forEach(car => {
        const card = document.createElement("div");
        card.className = "car-card";
        card.innerHTML = `
            <img src="${car.image}" alt="${car.name}" class="card-image">
            <div class="card-content">
                <h3 class="card-title">${car.name}</h3>
                <div class="card-meta"><span class="tag">${car.year}</span></div>
            </div>
        `;
        card.onclick = () => window.location.href = `/details?id=${car.id}`;
        container.appendChild(card);
    });
}

function filterCars() {
    const query = document.getElementById("search-input").value.toLowerCase();
    const filtered = allCars.filter(car => car.name.toLowerCase().includes(query));
    renderCars(filtered);
}
