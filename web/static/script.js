const API_BASE_URL = "/api";
let allCars = [];
let compareList = JSON.parse(localStorage.getItem('compareList') || '[]');
let currentDetailCarId = null;

document.addEventListener("DOMContentLoaded", () => {
    // Robust path detection
    const path = window.location.pathname.replace(/\/$/, ""); // Remove trailing slash

    // Global: Initial badge update
    updateCompareBadge();
    initTheme();

    if (path === "" || path === "/" || path === "/index.html") {
        // Reset comparison list on new showroom visit
        compareList = [];
        localStorage.removeItem('compareList');
        updateCompareBadge();

        fetchCars();
        initSearch();
    } else if (path === "/details" || path === "/details.html") {
        // Reset comparison list on details page visit
        compareList = [];
        localStorage.removeItem('compareList');
        updateCompareBadge();

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
        searchInput.addEventListener('input', filterCars);
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
            </div>
            <div onclick="window.location.href = '/details?id=${car.id}'">
                <img src="${imageSrc}" alt="${car.name}" class="card-image" onerror="this.src='https://via.placeholder.com/400x300/1e293b/94a3b8?text=Error'">
                <div class="card-content">
                    <h3 class="card-title">${car.name}</h3>
                    <div class="card-meta">
                        <span class="tag">${car.year}</span>
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

        // Auto-add current viewed car if on details page and not already in list
        if (currentDetailCarId && !compareList.includes(currentDetailCarId) && currentDetailCarId !== id) {
            if (compareList.length < 3) { // Ensure space for both
                compareList.push(currentDetailCarId);
            }
        }

        compareList.push(id);
    } else {
        compareList.splice(index, 1);
    }
    localStorage.setItem('compareList', JSON.stringify(compareList));
    updateCompareBadge();

    // Refresh comparison page if currently viewing it
    if (window.location.pathname.includes('/compare')) {
        loadComparePage(true);
    }
}

function updateCompareBadge() {
    let badge = document.getElementById('compare-badge');
    const path = window.location.pathname.replace(/\/$/, "");

    // Show badge on home page and details page
    const shouldShow = (path === "" || path === "/" || path === "/index.html" || path === "/details" || path === "/details.html");

    if (!badge && shouldShow) {
        badge = document.createElement('div');
        badge.id = 'compare-badge';
        badge.className = 'compare-badge';
        badge.onclick = () => window.location.href = '/compare';
        document.body.appendChild(badge);
    }

    if (badge) {
        if (compareList.length > 0 && shouldShow) {
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
        currentDetailCarId = parseInt(id);
        const response = await fetch(`${API_BASE_URL}/cars/${id}`);
        if (!response.ok) throw new Error("Not found");
        const car = await response.json();
        renderDetailsOnPage(car);
        loadRecommendations(car);
    } catch (e) {
        showError("detail-container", "Car details could not be loaded.");
    }
}

const manufacturers = {
    "Toyota": { country: "Japan", founded: 1937 },
    "Honda": { country: "Japan", founded: 1946 },
    "Ford": { country: "USA", founded: 1903 },
    "Chevrolet": { country: "USA", founded: 1911 },
    "Tesla": { country: "USA", founded: 2003 },
    "BMW": { country: "Germany", founded: 1916 },
    "Mercedes-Benz": { country: "Germany", founded: 1926 },
    "Audi": { country: "Germany", founded: 1909 },
    "Porsche": { country: "Germany", founded: 1931 },
    "Volkswagen": { country: "Germany", founded: 1937 },
    "Nissan": { country: "Japan", founded: 1933 },
    "Hyundai": { country: "South Korea", founded: 1967 },
    "Kia": { country: "South Korea", founded: 1944 },
    "Ferrari": { country: "Italy", founded: 1939 },
    "Lamborghini": { country: "Italy", founded: 1963 }
};

const categoryMap = {
    1: "SUV",
    2: "Sedan",
    3: "Coupe",
    4: "Truck",
    5: "Hatchback",
    6: "Convertible",
    7: "Wagon",
    8: "Electric",
    9: "Luxury",
    10: "Sports"
};

function toggleFilters() {
    const panel = document.getElementById('filter-panel');
    if (panel) {
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        if (panel.style.display === 'block') {
            populateManufacturerFilter();
        }
    }
}

function populateManufacturerFilter() {
    const select = document.getElementById('filter-manufacturer');
    if (!select || select.options.length > 1) return; // Already populated

    const sortedBrands = Object.keys(manufacturers).sort();
    sortedBrands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand;
        select.appendChild(option);
    });
}

function applyFilters() {
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : "";

    const manufacturer = document.getElementById('filter-manufacturer').value;
    const yearMin = parseInt(document.getElementById('filter-year-min').value) || 0;
    const yearMax = parseInt(document.getElementById('filter-year-max').value) || 9999;
    const category = document.getElementById('filter-category').value;

    const filtered = allCars.filter(car => {
        // Text Match
        const matchesSearch = car.name.toLowerCase().includes(searchTerm) ||
            (categoryMap[car.categoryId] || "").toLowerCase().includes(searchTerm);

        // Manufacturer Match
        const matchesManufacturer = !manufacturer || car.name.includes(manufacturer);

        // Year Match
        const carYear = parseInt(car.year);
        const matchesYear = carYear >= yearMin && carYear <= yearMax;

        // Category Match
        const carCategoryName = categoryMap[car.categoryId] || "";
        const matchesCategory = !category ||
            carCategoryName.toLowerCase() === category.toLowerCase();

        return matchesSearch && matchesManufacturer && matchesYear && matchesCategory;
    });

    renderCars(filtered);
}

function resetFilters() {
    document.getElementById('filter-manufacturer').value = "";
    document.getElementById('filter-year-min').value = "";
    document.getElementById('filter-year-max').value = "";
    document.getElementById('filter-category').value = "";
    if (document.getElementById('search-input')) document.getElementById('search-input').value = "";

    renderCars(allCars);
}

function filterCars() {
    // Redirect simple search to applyFilters for consistency
    applyFilters();
}

function renderDetailsOnPage(car) {
    const detailContainer = document.getElementById("detail-container");
    const imageSrc = car.image || "https://via.placeholder.com/800x600/1e293b/94a3b8?text=No+Image";

    // Determine manufacturer
    let manufacturerName = "Unknown";
    let manufacturerInfo = { country: "Unknown", founded: "Unknown" };

    for (const brand in manufacturers) {
        if (car.name.includes(brand)) {
            manufacturerName = brand;
            manufacturerInfo = manufacturers[brand];
            break;
        }
    }

    const categoryName = categoryMap[car.categoryId] || "Unknown";

    detailContainer.innerHTML = `
        <div class="details-grid" style="grid-template-columns: 1.5fr 1fr; margin-top: 2rem; gap: 3rem; align-items: start;">
            <img src="${imageSrc}" alt="${car.name}" class="details-image" style="box-shadow: var(--shadow-lg);">
            <div class="details-info">
                <h1 style="font-size: 3rem; margin-bottom: 0.5rem; margin-top: 0;">${car.name}</h1>
                <p style="color: var(--accent); font-size: 1.5rem; font-weight: 600; margin-bottom: 2rem;">${car.year}</p>

                <ul class="spec-list" style="margin-top: 0;">
                    <li><span class="spec-label">Category</span><span class="spec-value">${categoryName}</span></li>
                    <li><span class="spec-label">Engine</span><span class="spec-value">${car.specifications.engine}</span></li>
                    <li><span class="spec-label">Horsepower</span><span class="spec-value">${car.specifications.horsepower} HP</span></li>
                    <li><span class="spec-label">Transmission</span><span class="spec-value">${car.specifications.transmission}</span></li>
                    <li><span class="spec-label">Drivetrain</span><span class="spec-value">${car.specifications.drivetrain}</span></li>
                </ul>

                <div style="background: var(--card-bg); padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem; border: 1px solid var(--border-color);">
                    <h3 style="margin-top: 0; margin-bottom: 1rem; color: var(--accent);">Manufacturer Info</h3>
                    <ul style="list-style: none; padding: 0; margin: 0;">
                        <li style="margin-bottom: 0.5rem;"><strong>Name:</strong> ${manufacturerName}</li>
                        <li style="margin-bottom: 0.5rem;"><strong>Country:</strong> ${manufacturerInfo.country}</li>
                        <li><strong>Founded:</strong> ${manufacturerInfo.founded}</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
}

async function loadComparePage(shouldScroll = false) {
    const container = document.getElementById('compare-container');
    if (compareList.length === 0) {
        container.innerHTML = `< div style = "text-align:center; padding: 4rem 0;" >
            <p style="font-size: 1.2rem; margin-bottom: 2rem;">No cars selected for comparison.</p>
            <a href="/" class="tag" style="padding: 1rem 2rem; font-size: 1rem; text-decoration: none;">Return to Showroom</a>
        </div > `;
        return;
    }

    try {
        // Optimized: Fetch all cars and filter locally
        const response = await fetch(`${API_BASE_URL}/cars`);
        const all = await response.json();
        allCars = all; // Update global allCars

        // Render comparison table
        const selected = all.filter(c => compareList.includes(parseInt(c.id)));
        renderCompareTable(selected);

        // Render "Add More Cars" section (initially filtered or all)
        filterAddCars(); // Use filter logic to render

        if (shouldScroll) {
            container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    } catch (error) {
        showError("compare-container", "Error loading comparison.");
    }
}

function filterAddCars() {
    const input = document.getElementById("add-cars-search");
    if (!input || !allCars.length) return; // Wait for cars to load

    const query = input.value.toLowerCase();
    const available = allCars.filter(c => !compareList.includes(parseInt(c.id)));
    const filtered = available.filter(car => car.name.toLowerCase().includes(query));

    renderAddCarsSection(filtered);
}

function renderAddCarsSection(cars) {
    const container = document.getElementById("add-cars-grid");
    if (!container) return;

    container.innerHTML = "";
    if (cars.length === 0) {
        container.innerHTML = "<p style='color: var(--text-secondary); width: 100%; text-align: center;'>All available cars are currently being compared.</p>";
        return;
    }

    cars.forEach(car => {
        const card = document.createElement("div");
        card.className = "car-card";
        card.innerHTML = `
            <img src="${car.image || 'https://via.placeholder.com/400x300/1e293b/94a3b8?text=No+Image'}" alt="${car.name}" class="card-image" onerror="this.src='https://via.placeholder.com/400x300/1e293b/94a3b8?text=Error'">
            <div class="card-content">
                <h3 class="card-title">${car.name}</h3>
                <div class="card-meta"><span class="tag">${car.year}</span></div>
                <button onclick="toggleCompare(${car.id})" style="margin-top: 1rem; width: 100%; padding: 0.5rem; background: var(--accent); color: white; border: none; border-radius: 6px; cursor: pointer;">Add to Compare</button>
            </div>
        `;
        // Navigate on card click, but prevent propogation on button
        card.onclick = (e) => {
            if (e.target.tagName !== 'BUTTON') window.location.href = `/details?id=${car.id}`;
        };
        container.appendChild(card);
    });
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
                        <div onclick="window.location.href='/details?id=${car.id}'" style="cursor: pointer;" title="View Details">
                            <img src="${car.image}" alt="${car.name}" class="compare-car-img" onerror="this.src='https://via.placeholder.com/400x300/1e293b/94a3b8?text=Error'">
                            <div class="compare-car-name">${car.name}</div>
                        </div>
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
                ${cars.map(car => `<td>${car.specifications.horsepower} HP</td>`).join('')}
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

        // 1. Recommendations Logic
        let recommended = list.filter(c => c.categoryId === currentCar.categoryId && c.id !== currentCar.id).slice(0, 3);
        if (recommended.length === 0) {
            recommended = list.filter(c => c.id !== currentCar.id).slice(0, 3);
        }
        renderCarsToContainer(recommended, recContainer);

        // 2. All Other Cars Logic
        const otherContainer = document.getElementById("all-other-cars-list");
        if (otherContainer) {
            // Exclude current car AND recommended cars from "Other" list
            const recommendedIds = recommended.map(c => c.id);
            const others = list.filter(c => c.id !== currentCar.id && !recommendedIds.includes(c.id));

            if (others.length === 0) {
                otherContainer.innerHTML = "<p>No other cars available.</p>";
            } else {
                renderCarsToContainer(others, otherContainer);
            }
        }

    } catch (e) {
        if (recContainer) recContainer.innerHTML = "<p>Recommendations unavailable.</p>";
    }
}

function renderCarsToContainer(cars, container) {
    container.innerHTML = "";
    cars.forEach(car => {
        const isCompared = compareList.includes(parseInt(car.id));
        const card = document.createElement("div");
        card.className = "car-card";
        card.style.position = "relative";
        card.innerHTML = `
            <div class="compare-checkbox-container" onclick="event.stopPropagation()">
                <input type="checkbox" id="compare-${car.id}" ${isCompared ? 'checked' : ''} onchange="toggleCompare(${car.id})">
            </div>
            <div onclick="window.location.href = '/details?id=${car.id}'">
                <img src="${car.image || 'https://via.placeholder.com/400x300/1e293b/94a3b8?text=No+Image'}" alt="${car.name}" class="card-image" onerror="this.src='https://via.placeholder.com/400x300/1e293b/94a3b8?text=Error'">
                <div class="card-content">
                    <h3 class="card-title">${car.name}</h3>
                    <div class="card-meta"><span class="tag">${car.year}</span></div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function filterCars() {
    const query = document.getElementById("search-input").value.toLowerCase();
    const filtered = allCars.filter(car => car.name.toLowerCase().includes(query));
    renderCars(filtered);
}

// Theme Handling
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icons = document.querySelectorAll('.theme-icon');
    icons.forEach(icon => {
        if (theme === 'light') {
            // Moon icon for dark mode switch
            icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
        } else {
            // Sun icon for light mode switch
            icon.innerHTML = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
        }
    });
}
