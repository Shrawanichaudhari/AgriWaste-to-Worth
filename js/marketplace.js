// Marketplace Module
// =======================

// Mock data for listings
const mockListings = [
    { id: 'L001', name: 'Rice Husk', category: 'husk', price: 5500, quantity: 150, location: 'Punjab', seller: 'Farmer Singh', rating: 4.5, date: new Date('2024-01-15'), moisture: '10-12%', quality: 5 },
    { id: 'L002', name: 'Wheat Straw', category: 'straw', price: 4200, quantity: 200, location: 'Haryana', seller: 'Kumar Farms', rating: 4.8, date: new Date('2024-01-20'), moisture: '12-15%', quality: 4 },
    { id: 'L003', name: 'Sugarcane Bagasse', category: 'bagasse', price: 3800, quantity: 300, location: 'Uttar Pradesh', seller: 'Sugar Mill Co', rating: 4.2, date: new Date('2024-01-18'), moisture: '40-50%', quality: 4 },
    { id: 'L004', name: 'Cotton Stalks', category: 'crop-residue', price: 2500, quantity: 180, location: 'Maharashtra', seller: 'Cotton Growers', rating: 4.0, date: new Date('2024-01-22'), moisture: '15-18%', quality: 3 },
    { id: 'L005', name: 'Corn Stover', category: 'crop-residue', price: 3200, quantity: 220, location: 'Karnataka', seller: 'Maize Producers', rating: 4.6, date: new Date('2024-01-25'), moisture: '10-15%', quality: 5 },
    { id: 'L006', name: 'Peanut Shells', category: 'husk', price: 4800, quantity: 120, location: 'Tamil Nadu', seller: 'Peanut Co-op', rating: 4.4, date: new Date('2024-01-28'), moisture: '8-10%', quality: 4 },
    { id: 'L007', name: 'Coconut Coir', category: 'husk', price: 6200, quantity: 90, location: 'Tamil Nadu', seller: 'Coastal Farms', rating: 4.7, date: new Date('2024-02-01'), moisture: '12-14%', quality: 5 },
    { id: 'L008', name: 'Mustard Stalk', category: 'straw', price: 3500, quantity: 160, location: 'Punjab', seller: 'Green Fields', rating: 4.3, date: new Date('2024-02-03'), moisture: '14-16%', quality: 4 },
    { id: 'L009', name: 'Barley Straw', category: 'straw', price: 3900, quantity: 140, location: 'Haryana', seller: 'Barley Growers', rating: 4.1, date: new Date('2024-02-05'), moisture: '12-14%', quality: 3 },
    { id: 'L010', name: 'Soybean Residue', category: 'crop-residue', price: 3100, quantity: 190, location: 'Maharashtra', seller: 'Soy Producers', rating: 4.5, date: new Date('2024-02-08'), moisture: '10-12%', quality: 4 },
    { id: 'L011', name: 'Jute Stick', category: 'crop-residue', price: 2800, quantity: 210, location: 'West Bengal', seller: 'Jute Farmers', rating: 4.2, date: new Date('2024-02-10'), moisture: '16-18%', quality: 3 },
    { id: 'L012', name: 'Sunflower Stalks', category: 'crop-residue', price: 3300, quantity: 130, location: 'Karnataka', seller: 'Sunflower Co', rating: 4.6, date: new Date('2024-02-12'), moisture: '12-15%', quality: 5 },
    { id: 'L013', name: 'Coffee Husk', category: 'husk', price: 5800, quantity: 80, location: 'Karnataka', seller: 'Coffee Estates', rating: 4.8, date: new Date('2024-02-15'), moisture: '10-11%', quality: 5 },
    { id: 'L014', name: 'Tea Waste', category: 'other', price: 4500, quantity: 110, location: 'Assam', seller: 'Tea Gardens', rating: 4.4, date: new Date('2024-02-17'), moisture: '50-60%', quality: 4 },
    { id: 'L015', name: 'Banana Fiber', category: 'other', price: 7200, quantity: 70, location: 'Kerala', seller: 'Banana Cooperative', rating: 4.9, date: new Date('2024-02-20'), moisture: '8-10%', quality: 5 },
    { id: 'L016', name: 'Bamboo Waste', category: 'other', price: 4100, quantity: 250, location: 'Assam', seller: 'Bamboo Industries', rating: 4.3, date: new Date('2024-02-22'), moisture: '15-20%', quality: 4 },
    { id: 'L017', name: 'Palm Fronds', category: 'other', price: 3700, quantity: 180, location: 'Andhra Pradesh', seller: 'Palm Growers', rating: 4.1, date: new Date('2024-02-25'), moisture: '18-22%', quality: 3 },
    { id: 'L018', name: 'Cattle Dung', category: 'livestock', price: 1500, quantity: 500, location: 'Uttar Pradesh', seller: 'Dairy Farm', rating: 4.0, date: new Date('2024-02-27'), moisture: '80-85%', quality: 3 },
    { id: 'L019', name: 'Poultry Litter', category: 'livestock', price: 2200, quantity: 400, location: 'Andhra Pradesh', seller: 'Poultry Farms', rating: 4.2, date: new Date('2024-03-01'), moisture: '25-30%', quality: 4 },
    { id: 'L020', name: 'Rice Straw', category: 'straw', price: 3800, quantity: 280, location: 'Punjab', seller: 'Rice Cooperative', rating: 4.7, date: new Date('2024-03-03'), moisture: '12-14%', quality: 5 }
];

// State for marketplace
let currentPage = 1;
const itemsPerPage = 12;
let filteredListings = [...mockListings];
let currentFilters = {
    search: '',
    categories: [],
    minPrice: null,
    maxPrice: null,
    quantity: 0,
    location: '',
    quality: null
};
let currentSort = 'recommended';

// Initialize marketplace
document.addEventListener('DOMContentLoaded', function() {
    // Load saved listings from localStorage or use mock data
    loadListings();
    
    // Initialize filters
    initializeFilters();
    
    // Initialize sorting
    initializeSorting();
    
    // Initialize add listing modal
    initializeAddListing();
    
    // Initialize view toggle
    initializeViewToggle();
    
    // Display listings
    displayListings();

    // Role-based UI: hide Add Listing for buyer/transporter/ngo unless seller roles
    const addListingBtn = document.getElementById('addListingBtn');
    const user = window.AppState?.currentUser;
    const sellerRoles = ['farmer','aggregator','processor','admin'];
    if (addListingBtn) {
        if (!user || !sellerRoles.includes(user.userType)) {
            addListingBtn.style.display = 'none';
        }
    }

    // Geotagging handler
    document.getElementById('geoLocateBtn')?.addEventListener('click', useMyLocation);
});

async function useMyLocation() {
    const statusEl = document.getElementById('geoStatus');
    if (!navigator.geolocation) {
        statusEl.textContent = 'Geolocation not supported by this browser.';
        return;
    }
    statusEl.textContent = 'Fetching location...';
    navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        document.getElementById('wasteLat').value = latitude;
        document.getElementById('wasteLon').value = longitude;
        try {
            const place = await reverseGeocode(latitude, longitude);
            document.getElementById('wasteLocation').value = place || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            statusEl.textContent = 'Location detected';
            updateWeather(latitude, longitude);
        } catch (e) {
            document.getElementById('wasteLocation').value = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            statusEl.textContent = 'Location detected (reverse geocode failed)';
            updateWeather(latitude, longitude);
        }
    }, (err) => {
        statusEl.textContent = 'Location permission denied or unavailable';
    }, { enableHighAccuracy: true, timeout: 10000 });
}

async function reverseGeocode(lat, lon) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error('Reverse geocode failed');
    const data = await res.json();
    return data?.display_name || '';
}

async function loadListings() {
    // Prefer cached
    const savedListings = localStorage.getItem('marketplaceListings');
    if (savedListings) {
        filteredListings = JSON.parse(savedListings);
        return;
    }
    // Try building from CSVs in /data
    try {
        const coreText = await fetch('data/Agricultural_Waste_Core_Dataset.csv').then(r => r.ok ? r.text() : null);
        const priceText = await fetch('data/Market_Price_History_India.csv').then(r => r.ok ? r.text() : null);
        if (coreText) {
            const core = parseCSV(coreText);
            const prices = priceText ? parseCSV(priceText) : [];
            const avgByType = aggregateAvgPrice(prices);
            const regions = ['Punjab','Haryana','Uttar Pradesh','Maharashtra','Karnataka','Tamil Nadu'];
            const gen = [];
            let i = 1;
            core.slice(0, 120).forEach(row => {
                const key = (row.name||row.type||row.waste_name||'').toString();
                if (!key) return;
                const id = 'L' + String(Date.now() + i++);
                const category = (row.category||row.group||'other').toString().toLowerCase();
                const typeKey = key.trim().toLowerCase().replace(/\s+/g,'-');
                const base = avgByType[typeKey]?.avg || toInt(row.avg_price) || 4000;
                const price = Math.round(base * (0.9 + Math.random()*0.2));
                const quantity = Math.floor(50 + Math.random()*300);
                const location = regions[Math.floor(Math.random()*regions.length)];
                gen.push({
                    id,
                    name: key,
                    category,
                    price,
                    quantity,
                    location,
                    seller: row.source || 'Verified Supplier',
                    rating: 4 + Math.random(),
                    date: new Date(),
                    moisture: row.moisture || '12-15%',
                    quality: 3 + Math.floor(Math.random()*3)
                });
            });
            if (gen.length > 0) {
                filteredListings = gen;
                localStorage.setItem('marketplaceListings', JSON.stringify(gen));
                return;
            }
        }
    } catch(e) {
        console.warn('Failed to load CSV listings, using mock', e);
    }
    // Fallback to mock
    filteredListings = [...mockListings];
    localStorage.setItem('marketplaceListings', JSON.stringify(mockListings));
}

function parseCSV(text){
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (lines.length === 0) return [];
    const headers = lines[0].split(',').map(h => h.trim().replace(/\"/g,''));
    const rows = [];
    for (let i=1;i<lines.length;i++){
        const cols = splitCSVLine(lines[i]);
        const obj = {};
        headers.forEach((h,idx)=> obj[h.replace(/[^a-zA-Z0-9_\- ]/g,'').toLowerCase().replace(/\s+/g,'_')] = (cols[idx]||'').replace(/^\"|\"$/g,''));
        rows.push(obj);
    }
    return rows;
}

function splitCSVLine(line){
    const out=[]; let cur=''; let inQ=false;
    for (let i=0;i<line.length;i++){
        const c=line[i];
        if (c==='"') { inQ=!inQ; continue; }
        if (c===',' && !inQ){ out.push(cur); cur=''; continue; }
        cur+=c;
    }
    out.push(cur);
    return out.map(s=>s.trim());
}

function aggregateAvgPrice(rows){
    const acc={};
    rows.forEach(r=>{
        const type=(r.waste_type||r.type||r.name||'').toString().trim().toLowerCase().replace(/\s+/g,'-');
        const price=toInt(r.price||r.avg_price||r.rate);
        if (!type || !price) return;
        acc[type] = acc[type] || { sum:0, n:0 };
        acc[type].sum += price; acc[type].n += 1;
    });
    const out={};
    Object.keys(acc).forEach(k=> out[k]={ avg: Math.round(acc[k].sum/acc[k].n) });
    return out;
}

function toInt(v){ const n = parseInt((v||'').toString().replace(/[^0-9]/g,'')); return isNaN(n)?0:n; }

function initializeFilters() {
    // Search
    const searchInput = document.getElementById('searchInput');
    searchInput?.addEventListener('input', (e) => {
        currentFilters.search = e.target.value.toLowerCase();
        applyFilters();
    });
    
    // Category checkboxes
    const categoryFilters = document.querySelectorAll('.category-filter');
    categoryFilters.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            currentFilters.categories = Array.from(categoryFilters)
                .filter(cb => cb.checked)
                .map(cb => cb.value);
            applyFilters();
        });
    });
    
    // Price range
    document.getElementById('minPrice')?.addEventListener('change', (e) => {
        currentFilters.minPrice = e.target.value ? parseInt(e.target.value) : null;
        applyFilters();
    });
    
    document.getElementById('maxPrice')?.addEventListener('change', (e) => {
        currentFilters.maxPrice = e.target.value ? parseInt(e.target.value) : null;
        applyFilters();
    });
    
    // Quantity slider
    const quantityRange = document.getElementById('quantityRange');
    quantityRange?.addEventListener('input', (e) => {
        currentFilters.quantity = parseInt(e.target.value);
        document.getElementById('quantityValue').textContent = e.target.value;
        applyFilters();
    });
    
    // Location
    document.getElementById('locationFilter')?.addEventListener('change', (e) => {
        currentFilters.location = e.target.value;
        applyFilters();
        updateWeatherByRegion(e.target.value);
    });
    
    // Quality rating
    const qualityRadios = document.querySelectorAll('input[name="quality"]');
    qualityRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            currentFilters.quality = e.target.value ? parseInt(e.target.value) : null;
            applyFilters();
        });
    });
    
    // Clear filters
    document.getElementById('clearFilters')?.addEventListener('click', clearFilters);
    
    // Apply filters button
    document.getElementById('applyFilters')?.addEventListener('click', applyFilters);
}

function clearFilters() {
    // Reset filter state
    currentFilters = {
        search: '',
        categories: [],
        minPrice: null,
        maxPrice: null,
        quantity: 0,
        location: '',
        quality: null
    };
    
    // Reset UI
    document.getElementById('searchInput').value = '';
    document.querySelectorAll('.category-filter').forEach(cb => cb.checked = false);
    document.getElementById('minPrice').value = '';
    document.getElementById('maxPrice').value = '';
    document.getElementById('quantityRange').value = 0;
    document.getElementById('quantityValue').textContent = '0';
    document.getElementById('locationFilter').value = '';
    document.querySelectorAll('input[name="quality"]').forEach(r => r.checked = false);
    
    applyFilters();
}

function applyFilters() {
    // Start with all listings
    let listings = [...mockListings];
    
    // Search filter
    if (currentFilters.search) {
        listings = listings.filter(listing =>
            listing.name.toLowerCase().includes(currentFilters.search) ||
            listing.seller.toLowerCase().includes(currentFilters.search) ||
            listing.location.toLowerCase().includes(currentFilters.search)
        );
    }
    
    // Category filter
    if (currentFilters.categories.length > 0) {
        listings = listings.filter(listing =>
            currentFilters.categories.includes(listing.category)
        );
    }
    
    // Price range filter
    if (currentFilters.minPrice !== null) {
        listings = listings.filter(listing => listing.price >= currentFilters.minPrice);
    }
    if (currentFilters.maxPrice !== null) {
        listings = listings.filter(listing => listing.price <= currentFilters.maxPrice);
    }
    
    // Quantity filter
    if (currentFilters.quantity > 0) {
        listings = listings.filter(listing => listing.quantity >= currentFilters.quantity);
    }
    
    // Location filter
    if (currentFilters.location) {
        listings = listings.filter(listing =>
            listing.location.toLowerCase().includes(currentFilters.location.toLowerCase())
        );
    }
    
    // Quality filter
    if (currentFilters.quality !== null) {
        listings = listings.filter(listing => listing.quality >= currentFilters.quality);
    }
    
    filteredListings = listings;
    currentPage = 1;
    applySorting();
    displayListings();
}

function initializeSorting() {
    document.getElementById('sortBy')?.addEventListener('change', (e) => {
        currentSort = e.target.value;
        applySorting();
        displayListings();
    });
}

function applySorting() {
    switch(currentSort) {
        case 'price-low':
            filteredListings.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredListings.sort((a, b) => b.price - a.price);
            break;
        case 'quantity':
            filteredListings.sort((a, b) => b.quantity - a.quantity);
            break;
        case 'newest':
            filteredListings.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case 'rating':
            filteredListings.sort((a, b) => b.rating - a.rating);
            break;
        case 'recommended':
        default:
            // AI-based recommendation (simulated by mixing rating and freshness)
            filteredListings.sort((a, b) => {
                const scoreA = (a.rating * 0.6) + (new Date(a.date).getTime() / 1000000000);
                const scoreB = (b.rating * 0.6) + (new Date(b.date).getTime() / 1000000000);
                return scoreB - scoreA;
            });
    }
}

function displayListings() {
    const container = document.getElementById('listingsContainer');
    const resultsCount = document.getElementById('resultsCount');
    
    if (!container) return;
    
    // Update results count
    if (resultsCount) {
        resultsCount.textContent = filteredListings.length;
    }
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageListings = filteredListings.slice(startIndex, endIndex);
    
    // Clear container
    container.innerHTML = '';
    
    // Check if no results
    if (pageListings.length === 0) {
        container.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding:3rem;"><h3>No listings found</h3><p>Try adjusting your filters</p></div>';
        return;
    }
    
    // Display listings
    pageListings.forEach(listing => {
        const card = createListingCard(listing);
        container.innerHTML += card;
    });
    
    // Update pagination
    updatePagination();
}

function getListingImageHtml(listing) {
    // If the listing has an uploaded image, use it
    if (listing.image) {
        return `<img src="${listing.image}" style="width:100%;height:100%;object-fit:cover;border-radius:8px 8px 0 0;" alt="${listing.name}">`;
    }
    
    // Otherwise check fallback map by matching keywords
    let matchedImg = null;
    if (window.CROP_IMAGE_MAP) {
        const searchStr = (listing.name + " " + listing.category).toLowerCase();
        for (const [key, paths] of Object.entries(window.CROP_IMAGE_MAP)) {
            if (searchStr.includes(key.toLowerCase()) && paths && paths.length > 0) {
                // Pick deterministically based on listing ID so it doesn't flicker
                const num = parseInt(listing.id.replace(/\D/g, '') || '0') || Math.floor(Math.random() * 100);
                matchedImg = paths[num % paths.length];
                break;
            }
        }
        // Fallbacks
        if (!matchedImg && searchStr.includes('straw') && window.CROP_IMAGE_MAP['wheat']?.length > 0) {
            const paths = window.CROP_IMAGE_MAP['wheat'];
            const num = parseInt(listing.id.replace(/\D/g, '') || '0') || Math.floor(Math.random() * 100);
            matchedImg = paths[num % paths.length];
        }
        if (!matchedImg && searchStr.includes('bagasse') && window.CROP_IMAGE_MAP['sugarcane']?.length > 0) {
            const paths = window.CROP_IMAGE_MAP['sugarcane'];
            const num = parseInt(listing.id.replace(/\D/g, '') || '0') || Math.floor(Math.random() * 100);
            matchedImg = paths[num % paths.length];
        }
    }
    
    if (matchedImg) {
        return `<img src="${matchedImg}" style="width:100%;height:100%;object-fit:cover;border-radius:8px 8px 0 0;" alt="${listing.name}">`;
    }
    
    return `<i class="fas fa-${getCategoryIcon(listing.category)}"></i>`;
}

function createListingCard(listing) {
    const stars = '⭐'.repeat(Math.round(listing.rating));
    
    return `
        <div class="listing-card">
            <div class="listing-image" style="padding:0; display:flex; align-items:center; justify-content:center; overflow:hidden;">
                ${getListingImageHtml(listing)}
            </div>
            <div class="listing-content">
                <span class="listing-category">${formatCategory(listing.category)}</span>
                <h3 class="listing-title">${listing.name}</h3>
                <p class="listing-location">
                    <i class="fas fa-map-marker-alt"></i> ${listing.location}
                </p>
                <div class="listing-details">
                    <div class="detail-item">
                        <span>Available</span>
                        <strong>${listing.quantity} tons</strong>
                    </div>
                    <div class="detail-item">
                        <span>Quality</span>
                        <strong>${stars}</strong>
                    </div>
                </div>
                <div class="listing-footer">
                    <div class="listing-price">
                        ₹${listing.price.toLocaleString()}
                        <small>/ton</small>
                    </div>
                    <button class="btn-add-cart" onclick="addListingToCart('${listing.id}')">
                        <i class="fas fa-cart-plus"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function getCategoryIcon(category) {
    const icons = {
        'husk': 'seedling',
        'straw': 'wheat-awn',
        'bagasse': 'leaf',
        'crop-residue': 'tractor',
        'livestock': 'cow',
        'other': 'recycle'
    };
    return icons[category] || 'recycle';
}

function formatCategory(category) {
    return category.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

function addListingToCart(listingId) {
    const listing = filteredListings.find(l => l.id === listingId);
    if (listing) {
        addToCart({
            id: listing.id,
            name: listing.name,
            price: listing.price,
            seller: listing.seller
        });
    } else {
        console.warn('Listing not found for ID:', listingId);
    }
}

function updatePagination() {
    const totalPages = Math.ceil(filteredListings.length / itemsPerPage);
    const pageNumbers = document.getElementById('pageNumbers');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    
    if (!pageNumbers) return;
    
    // Clear page numbers
    pageNumbers.innerHTML = '';
    
    // Add page numbers
    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('div');
        pageBtn.className = `page-number ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => {
            currentPage = i;
            displayListings();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        pageNumbers.appendChild(pageBtn);
    }
    
    // Update prev/next buttons
    if (prevBtn) {
        prevBtn.disabled = currentPage === 1;
        prevBtn.onclick = () => {
            if (currentPage > 1) {
                currentPage--;
                displayListings();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        };
    }
    
    if (nextBtn) {
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.onclick = () => {
            if (currentPage < totalPages) {
                currentPage++;
                displayListings();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        };
    }
}

function initializeViewToggle() {
    const viewBtns = document.querySelectorAll('.view-btn');
    const container = document.getElementById('listingsContainer');
    
    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            viewBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const view = btn.dataset.view;
            if (view === 'list') {
                container?.classList.add('listings-list');
            } else {
                container?.classList.remove('listings-list');
            }
        });
    });
}

function initializeAddListing() {
    const addListingBtn = document.getElementById('addListingBtn');
    const addListingModal = document.getElementById('addListingModal');
    const addListingForm = document.getElementById('addListingForm');
    const cancelBtn = document.getElementById('cancelListing');
    
    addListingBtn?.addEventListener('click', () => {
        if (!AppState.currentUser) {
            showNotification('Please login to add a listing', 'error');
            return;
        }
        addListingModal?.classList.add('active');
    });
    
    cancelBtn?.addEventListener('click', () => {
        addListingModal?.classList.remove('active');
        addListingForm?.reset();
    });
    
    addListingForm?.addEventListener('submit', handleAddListing);
    
    // AI price suggestion
    document.getElementById('wasteType')?.addEventListener('input', suggestPrice);
    document.getElementById('wasteCategory')?.addEventListener('change', suggestPrice);
}

function suggestPrice() {
    const wasteType = document.getElementById('wasteType')?.value.toLowerCase();
    const category = document.getElementById('wasteCategory')?.value;
    
    if (!wasteType && !category) return;
    
    // Simulate AI price prediction based on category
    const basePrices = {
        'husk': 5500,
        'straw': 4000,
        'bagasse': 3800,
        'crop-residue': 3000,
        'livestock': 2000,
        'other': 4000
    };
    
    const basePrice = basePrices[category] || 4000;
    const randomVariation = (Math.random() - 0.5) * 1000;
    const suggestedPrice = Math.round(basePrice + randomVariation);
    
    document.getElementById('aiPriceSuggestion').textContent = suggestedPrice.toLocaleString();
}

async function handleAddListing(e) {
    e.preventDefault();
    
    let base64Image = null;
    const fileInput = document.getElementById('wasteImages');
    if (fileInput && fileInput.files && fileInput.files[0]) {
        base64Image = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(fileInput.files[0]);
        });
    }
    
    const newListing = {
        id: 'L' + Date.now(),
        name: document.getElementById('wasteType').value,
        category: document.getElementById('wasteCategory').value,
        price: parseInt(document.getElementById('wastePrice').value),
        quantity: parseFloat(document.getElementById('wasteQuantity').value),
        location: document.getElementById('wasteLocation').value,
        lat: document.getElementById('wasteLat').value || null,
        lon: document.getElementById('wasteLon').value || null,
        seller: AppState.currentUser.name,
        rating: 4.0,
        date: new Date(),
        moisture: 'TBD',
        quality: 4,
        description: document.getElementById('wasteDescription').value,
        image: base64Image
    };
    
    // Add to mock data
    mockListings.unshift(newListing);
    
    // Save to localStorage
    localStorage.setItem('marketplaceListings', JSON.stringify(mockListings));
    
    // Close modal
    document.getElementById('addListingModal')?.classList.remove('active');
    document.getElementById('addListingForm')?.reset();
    
    // Refresh display
    applyFilters();
    
    showNotification('Listing added successfully!', 'success');
    addNotification('New Listing', 'Your listing for ' + newListing.name + ' is now live', 'success');
}

// Weather helpers
function updateWeatherByRegion(region) {
    if (!region) {
        const el = document.getElementById('weatherData');
        if (el) el.innerHTML = '';
        return;
    }
    const coordsMap = {
        'punjab': { lat: 31.15, lon: 75.34 },
        'haryana': { lat: 29.06, lon: 76.08 },
        'uttar-pradesh': { lat: 26.85, lon: 80.91 },
        'maharashtra': { lat: 19.75, lon: 75.71 },
        'karnataka': { lat: 15.32, lon: 75.71 },
        'tamil-nadu': { lat: 11.12, lon: 78.65 }
    };
    const coords = coordsMap[region];
    if (coords) updateWeather(coords.lat, coords.lon);
}

async function updateWeather(lat, lon) {
    const panel = document.getElementById('weatherData');
    if (!panel) return;
    panel.innerHTML = 'Loading weather...';
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&current=temperature_2m,precipitation,wind_speed_10m`;
        const res = await fetch(url);
        const data = await res.json();
        const c = data.current || {};
        panel.innerHTML = `
            <div>Temp: <strong>${c.temperature_2m ?? '-'}°C</strong></div>
            <div>Precipitation: <strong>${c.precipitation ?? '-'} mm</strong></div>
            <div>Wind: <strong>${c.wind_speed_10m ?? '-'} km/h</strong></div>
        `;
    } catch (e) {
        panel.innerHTML = 'Unable to fetch weather.';
    }
}

// Export functions
window.addListingToCart = addListingToCart;
