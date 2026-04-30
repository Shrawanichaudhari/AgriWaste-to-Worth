// Dashboard Module
// =======================

// Mock dashboard data
const dashboardData = {
    earnings: 245000,
    wasteTraded: 342,
    transactions: 28,
    carbonCredits: 15.6,
    
    revenueData: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        values: [45000, 58000, 62000, 80000]
    },
    
    wasteDistribution: {
        labels: ['Rice Husk', 'Wheat Straw', 'Bagasse', 'Cotton Stalks', 'Other'],
        values: [35, 25, 20, 12, 8]
    },
    
    recentTransactions: [
        { id: 'TXN001', buyer: 'Green Energy Ltd', item: 'Rice Husk', amount: 82500, quantity: 15, date: new Date('2024-03-10'), status: 'completed' },
        { id: 'TXN002', buyer: 'EcoFuel Industries', item: 'Wheat Straw', amount: 42000, quantity: 10, date: new Date('2024-03-08'), status: 'completed' },
        { id: 'TXN003', buyer: 'Biomass Power Co', item: 'Sugarcane Bagasse', amount: 57000, quantity: 15, date: new Date('2024-03-05'), status: 'completed' },
        { id: 'TXN004', buyer: 'Sustainable Energy', item: 'Corn Stover', amount: 32000, quantity: 10, date: new Date('2024-03-03'), status: 'pending' },
        { id: 'TXN005', buyer: 'Bio-Gen Systems', item: 'Rice Straw', amount: 38000, quantity: 10, date: new Date('2024-03-01'), status: 'completed' }
    ],
    
    activeListings: [
        { id: 'L021', name: 'Premium Rice Husk', quantity: 50, price: 5500, views: 234, inquiries: 12 },
        { id: 'L022', name: 'Wheat Straw Bundle', quantity: 75, price: 4200, views: 189, inquiries: 8 },
        { id: 'L023', name: 'Organic Bagasse', quantity: 100, price: 3800, views: 156, inquiries: 5 }
    ]
};

let revenueChart, wasteChart;
let seasonalityChartDash;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    loadDashboardData();
    applyRoleLocalization();
    initializeCharts();
    displayStats();
    displayTransactions();
    displayListings();
    displayImpactMetrics();
    setupDateRange();
    setupSeasonalityDash();
    setupRoleWidgets();
});

function loadDashboardData() {
    // Try to load real transactions from localStorage
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    
    if (transactions.length > 0) {
        // Calculate real stats from transactions
        dashboardData.transactions = transactions.length;
        dashboardData.earnings = transactions.reduce((sum, t) => sum + t.total, 0);
        
        // Update recent transactions
        dashboardData.recentTransactions = transactions.slice(0, 5).map(t => ({
            id: t.id,
            buyer: 'Customer',
            item: t.items.map(i => i.name).join(', '),
            amount: t.total,
            quantity: t.items.reduce((sum, i) => sum + i.quantity, 0),
            date: new Date(t.date),
            status: t.status
        }));
    }
}

function displayStats() {
    // Update user name
    if (AppState.currentUser) {
        document.getElementById('userName').textContent = AppState.currentUser.name;
    }
    
    // Values vary slightly by role context, but base is same
    const type = (AppState.currentUser?.userType || 'farmer').toLowerCase();
    
    document.getElementById('totalEarnings').textContent = (type === 'transporter' || type === 'farmer' || type === 'aggregator') ? '₹' + dashboardData.earnings.toLocaleString() : '₹' + (dashboardData.earnings * 0.8).toLocaleString(); // Mock expenditure
    document.getElementById('wasteTraded').textContent = type === 'processor' ? (dashboardData.wasteTraded * 1.5) + ' tons' : dashboardData.wasteTraded + ' tons';
    document.getElementById('totalTransactions').textContent = dashboardData.transactions;
    document.getElementById('carbonCredits').textContent = type === 'transporter' ? '1250 miles' : dashboardData.carbonCredits + ' tons';
}

function applyRoleLocalization() {
    const user = window.AppState?.currentUser;
    const type = user ? (user.userType || 'farmer').toLowerCase() : 'farmer';
    
    // Label helpers
    const setText = (id, str) => { const el=document.getElementById(id); if(el) el.textContent=str; };
    const setIcon = (id, cls) => { const el=document.getElementById(id); if(el) el.className=cls; };
    const setColor = (id, cls) => { 
        const elContainer = document.getElementById(id)?.closest('.stat-icon'); 
        if(elContainer) elContainer.className = 'stat-icon ' + cls; 
    };

    if (type === 'transporter') {
        setText('labelStat1', 'Freight Earnings'); setColor('totalEarnings', 'blue');
        setText('labelStat2', 'Deliveries Completed'); setColor('wasteTraded', 'green');
        setText('labelStat3', 'Active Routes'); setColor('totalTransactions', 'orange');
        setText('labelStat4', 'Fleet Distance Logs'); setColor('carbonCredits', 'purple');
        
        setText('titleChart1', 'Delivery Volume');
        setText('titleChart2', 'Cargo Types Transported');
        setText('titleChart3', 'Route Density');
        
        setText('textGrid1', 'Recent Deliveries'); setIcon('iconGrid1', 'fas fa-truck');
        setText('textGrid2', 'Available Freight Orders'); setIcon('iconGrid2', 'fas fa-box-open');
        setText('textGrid3', 'Fleet Efficiency'); setIcon('iconGrid3', 'fas fa-gas-pump');
        setText('textGrid4', 'Routing Insights'); setIcon('iconGrid4', 'fas fa-map-marked-alt');
        
        const insights = document.getElementById('insightsList');
        if (insights) insights.innerHTML = `
            <div class="insight-item"><i class="fas fa-route"></i><p><strong>Route Optimization:</strong> Combine pickups from Farm A and Farm B today to save 12km.</p></div>
            <div class="insight-item"><i class="fas fa-gas-pump"></i><p><strong>Fuel Savings:</strong> Latest route pattern saved 8% fuel compared to last month.</p></div>
            <div class="insight-item"><i class="fas fa-truck-fast"></i><p><strong>Demand Spike:</strong> 5 new orders pending in Ludhiana region.</p></div>
        `;
        
    } else if (type === 'buyer') {
        setText('labelStat1', 'Total Raw Material Spent'); setColor('totalEarnings', 'orange');
        setText('labelStat2', 'Volume Procured'); setColor('wasteTraded', 'purple');
        setText('labelStat3', 'Purchase Orders'); setColor('totalTransactions', 'blue');
        setText('labelStat4', 'Carbon Savings Claimed'); setColor('carbonCredits', 'green');
        
        setText('titleChart1', 'Procurement Expenditure');
        setText('titleChart2', 'Input Materials Breakdown');
        setText('titleChart3', 'Material Price Trends');
        
        setText('textGrid1', 'Recent Purchases'); setIcon('iconGrid1', 'fas fa-shopping-basket');
        setText('textGrid2', 'Active Watchlist'); setIcon('iconGrid2', 'fas fa-eye');
        setText('textGrid3', 'Sustainability Footprint'); setIcon('iconGrid3', 'fas fa-leaf');
        setText('textGrid4', 'Procurement Insights'); setIcon('iconGrid4', 'fas fa-chart-pie');
        
        const insights = document.getElementById('insightsList');
        if (insights) insights.innerHTML = `
            <div class="insight-item"><i class="fas fa-arrow-trend-down"></i><p><strong>Price Drop Expected:</strong> Wheat straw supply is high; wait 2 days for optimal purchasing.</p></div>
            <div class="insight-item"><i class="fas fa-check-circle"></i><p><strong>Quality Alert:</strong> Recent batch from Supplier XYZ showed excellent moisture levels.</p></div>
            <div class="insight-item"><i class="fas fa-industry"></i><p><strong>Inventory Low:</strong> Bagasse stocks dropping below 20%. Consider Auto-Buy trigger.</p></div>
        `;
        
    } else if (type === 'ngo' || type === 'regulator') {
        setText('labelStat1', 'Total Subsidies Disbursed'); setColor('totalEarnings', 'blue');
        setText('labelStat2', 'Farms Monitored'); setColor('wasteTraded', 'purple');
        setText('labelStat3', 'Certification Requests'); setColor('totalTransactions', 'orange');
        setText('labelStat4', 'Carbon Offsets Verified'); setColor('carbonCredits', 'green');
        
        setText('titleChart1', 'Regional Adoption Rate');
        setText('titleChart2', 'Burning Incidents Prevented');
        setText('titleChart3', 'Carbon Credits Issued');
        
        setText('textGrid1', 'Certification Queue'); setIcon('iconGrid1', 'fas fa-stamp');
        setText('textGrid2', 'Active Subsidy Programs'); setIcon('iconGrid2', 'fas fa-hand-holding-usd');
        setText('textGrid3', 'Regional Impact Analytics'); setIcon('iconGrid3', 'fas fa-globe-asia');
        setText('textGrid4', 'Regulatory AI Alerts'); setIcon('iconGrid4', 'fas fa-satellite-dish');
        
        const insights = document.getElementById('insightsList');
        if (insights) insights.innerHTML = `
            <div class="insight-item"><i class="fas fa-fire" style="color:#e74c3c;"></i><p><strong>Satellite Thermal Alert:</strong> Anomalies detected in Karnal sector. High risk of stubble burning. <a href="#">Dispatch SMS</a></p></div>
            <div class="insight-item"><i class="fas fa-chart-line"></i><p><strong>Impact Trend:</strong> 15% increase in biomass sales directly correlated to new machinery subsidy rollout.</p></div>
            <div class="insight-item"><i class="fas fa-exclamation-triangle" style="color:#f39c12;"></i><p><strong>Compliance Warning:</strong> 4 processors missed mandatory moisture reporting deadline.</p></div>
        `;
        
    } else if (type === 'processor' || type === 'admin') {
        setText('labelStat1', 'Revenue Returned'); setColor('totalEarnings', 'green');
        setText('labelStat2', 'Total Yield Output'); setColor('wasteTraded', 'blue');
        setText('labelStat3', 'Active Processing Batches'); setColor('totalTransactions', 'orange');
        setText('labelStat4', 'Energy Efficiency Offset'); setColor('carbonCredits', 'purple');
        
        setText('titleChart1', 'Processing Revenue');
        setText('titleChart2', 'Output Commodities');
        setText('titleChart3', 'Output Price Index');
        
        setText('textGrid1', 'Recent Batch Shipments'); setIcon('iconGrid1', 'fas fa-pallet');
        setText('textGrid2', 'Inventory Needs'); setIcon('iconGrid2', 'fas fa-clipboard-list');
        setText('textGrid3', 'Factory Emissions Offset'); setIcon('iconGrid3', 'fas fa-industry');
        setText('textGrid4', 'Operational AI Insights'); setIcon('iconGrid4', 'fas fa-cogs');
        
        const insights = document.getElementById('insightsList');
        if (insights) insights.innerHTML = `
            <div class="insight-item"><i class="fas fa-bolt"></i><p><strong>Energy Optimizer:</strong> Running Crusher #2 during off-peak hours saved 15% energy.</p></div>
            <div class="insight-item"><i class="fas fa-wrench"></i><p><strong>Maintenance Prediction:</strong> Pelletizer 1 bearing vibration detected. Inspect within 50 hours.</p></div>
            <div class="insight-item"><i class="fas fa-flask"></i><p><strong>Yield Boost:</strong> Adding 5% more moisture pre-compression can raise output by 2%.</p></div>
        `;
    }
    // Farmer/Aggregator natively uses default HTML
}

function initializeCharts() {
    // Revenue Chart
    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx) {
        revenueChart = new Chart(revenueCtx, {
            type: 'line',
            data: {
                labels: dashboardData.revenueData.labels,
                datasets: [{
                    label: 'Revenue (₹)',
                    data: dashboardData.revenueData.values,
                    borderColor: '#2ecc71',
                    backgroundColor: 'rgba(46, 204, 113, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#2ecc71',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return '₹' + context.parsed.y.toLocaleString();
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '₹' + (value/1000) + 'K';
                            }
                        },
                        grid: {
                            color: 'rgba(0,0,0,0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }
    
    // Waste Distribution Chart
    const wasteCtx = document.getElementById('wasteDistChart');
    if (wasteCtx) {
        wasteChart = new Chart(wasteCtx, {
            type: 'doughnut',
            data: {
                labels: dashboardData.wasteDistribution.labels,
                datasets: [{
                    data: dashboardData.wasteDistribution.values,
                    backgroundColor: [
                        '#2ecc71',
                        '#3498db',
                        '#f39c12',
                        '#e74c3c',
                        '#9b59b6'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.parsed + '%';
                            }
                        }
                    }
                }
            }
        });
    }
}

function setupSeasonalityDash(){
    const select = document.getElementById('seasonalityType');
    if (!select) return;
    
    // Fallback dictionary for Dashboard context
    const dashboardWasteInfo = {
        'rice-husk': 5500,
        'wheat-straw': 4200,
        'sugarcane-bagasse': 3800
    };

    const render = () => {
        const key = select.value;
        const basePrice = dashboardWasteInfo[key] || 4000;
        
        const series = [];
        const date = new Date();
        date.setDate(1); 
        
        for (let i = 11; i >= 0; i--) {
            const d = new Date(date);
            d.setMonth(date.getMonth() - i);
            const seasonalFactor = Math.sin((d.getMonth() / 11) * Math.PI * 2 + (key.charCodeAt(0))) * 0.12; 
            const noise = (Math.random() * 0.06) - 0.03; 
            
            series.push({
                label: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`,
                price: Math.round(basePrice * (1 + seasonalFactor + noise))
            });
        }

        const labels = series.map(s => s.label);
        const data = series.map(s => s.price);
        
        const ctx = document.getElementById('seasonalityChartDash');
        if (!ctx) return;
        if (seasonalityChartDash) seasonalityChartDash.destroy();
        
        seasonalityChartDash = new Chart(ctx, { 
            type:'line', 
            data:{ 
                labels, 
                datasets:[{ 
                    label:'Price (₹/ton)', 
                    data, 
                    borderColor:'#3498db', 
                    backgroundColor:'rgba(52,152,219,0.1)', 
                    fill:true, 
                    tension:0.35 
                }] 
            }, 
            options:{ 
                responsive:true, 
                maintainAspectRatio:false, 
                plugins:{ legend:{ display:false } },
                scales: {
                    y: {
                        beginAtZero: false,
                        title: { display: true, text: '₹ / ton' }
                    }
                }
            } 
        });
    };
    select.addEventListener('change', render);
    render();
}

function setupRoleWidgets(){
    const user = window.AppState?.currentUser;
    const type = user ? (user.userType||'').toLowerCase() : 'farmer';
    const farmer = document.getElementById('farmerWidget');
    const buyer = document.getElementById('buyerWidget');
    const processor = document.getElementById('processorWidget');
    const transporter = document.getElementById('transporterWidget');
    const ngo = document.getElementById('ngoWidget');
    
    if (farmer) farmer.style.display = 'none';
    if (buyer) buyer.style.display = 'none';
    if (processor) processor.style.display = 'none';
    if (transporter) transporter.style.display = 'none';
    if (ngo) ngo.style.display = 'none';
    
    if (type==='transporter') {
        if (transporter) transporter.style.display = '';
    } else if (type==='ngo' || type==='regulator') {
        if (ngo) ngo.style.display = '';
    } else if (type==='farmer' || type==='aggregator') {
        if (farmer) farmer.style.display = '';
        const tips = document.getElementById('farmerTips');
        if (tips) tips.innerHTML = `
            <div class="insight-item"><i class="fas fa-calendar" style="color:#f39c12"></i><p>Best time to sell wheat straw is next 2 weeks (seasonality)</p></div>
            <div class="insight-item"><i class="fas fa-location-dot" style="color:#e74c3c"></i><p>Nearby demand increased in Punjab</p></div>
            <div class="insight-item"><i class="fas fa-cloud-sun" style="color:#3498db"></i><p>Weather alert: Protect drying stalks from incoming rain tomorrow.</p></div>
        `;
    } else if (type==='buyer' || type==='ngo') {
        if (buyer) buyer.style.display = '';
        const watchlist = document.getElementById('buyerWatchlist');
        if (watchlist) watchlist.innerHTML = `
            <div class="insight-item"><i class="fas fa-bell" style="color:#9b59b6"></i><p>Watch rice husk in Haryana: price dip expected</p></div>
            <div class="insight-item"><i class="fas fa-chart-line" style="color:#2ecc71"></i><p>Cotton stalks volume is up 40% vs last month.</p></div>
            <div class="insight-item"><i class="fas fa-file-contract" style="color:#34495e"></i><p>3 active supply alerts match your preferred items.</p></div>
        `;
    } else {
        if (processor) processor.style.display = '';
        const kpis = document.getElementById('processorKPIs');
        if (kpis) kpis.innerHTML = `
            <div class="insight-item"><i class="fas fa-industry" style="color:#34495e"></i><p>Capacity Utilization: 78%</p></div>
            <div class="insight-item"><i class="fas fa-recycle" style="color:#2ecc71"></i><p>Conversion Yield: 92%</p></div>
            <div class="insight-item"><i class="fas fa-bolt" style="color:#f1c40f"></i><p>Energy Consumed: 4.2 MWh today</p></div>
        `;
    }
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

function toInt(v){ const n = parseInt((v||'').toString().replace(/[^0-9]/g,'')); return isNaN(n)?0:n; }

function displayTransactions() {
    const container = document.getElementById('transactionsList');
    if (!container) return;
    
    // Create role-specific mock strings
    const userType = (window.AppState?.currentUser?.userType || 'farmer').toLowerCase();
    let txnItems = dashboardData.recentTransactions;
    
    if (userType === 'transporter') {
        txnItems = [
            { id: 'DEL-01', item: 'Route: Ludhiana -> Karnal', buyer: 'Fuel Used: 42L', amount: 8500, quantity: 15, date: new Date('2024-03-10'), status: 'completed' },
            { id: 'DEL-02', item: 'Route: Amritsar -> Panipat', buyer: 'Fuel Used: 65L', amount: 12000, quantity: 20, date: new Date('2024-03-08'), status: 'completed' },
            { id: 'DEL-03', item: 'Route: Jalandhar -> Sonipat', buyer: 'In Transit', amount: 9500, quantity: 12, date: new Date(), status: 'pending' },
        ];
    } else if (userType === 'processor' || userType === 'admin') {
        txnItems = [
            { id: 'BATCH-401', item: 'Bio-Pellets Yield', buyer: 'Energy Value: 18MJ/kg', amount: 145000, quantity: 45, date: new Date('2024-03-10'), status: 'completed' },
            { id: 'BATCH-402', item: 'Compost Yield', buyer: 'Nitrogen Rich', amount: 92000, quantity: 60, date: new Date('2024-03-07'), status: 'completed' },
        ];
    } else if (userType === 'ngo' || userType === 'regulator') {
        txnItems = [
            { id: 'CERT-992', item: 'Farm Sustainability Audit', buyer: 'Requested by: Farm Gurdev', amount: 0, quantity: 15, date: new Date(), status: 'pending' },
            { id: 'CERT-991', item: 'Carbon Offset Grant', buyer: 'Awarded to: BioFuels Ltd', amount: 500000, quantity: 400, date: new Date('2024-03-05'), status: 'completed' },
        ];
    }
    
    if (txnItems.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:#999;padding:2rem;">No items yet</p>';
        return;
    }
    
    container.innerHTML = txnItems.map(t => `
        <div class="transaction-item">
            <div>
                <strong>${t.item}</strong>
                <small style="display:block;color:#666;">${t.buyer} • ${t.quantity} tons</small>
                <small style="color:#999;">${t.date.toLocaleDateString()}</small>
            </div>
            <div style="text-align:right;">
                <strong style="color:#2ecc71;">₹${t.amount.toLocaleString()}</strong>
                <span class="badge" style="display:block;margin-top:5px;background:${t.status === 'completed' ? '#27ae60' : t.status==='in_escrow' ? '#8e44ad' : '#f39c12'};color:white;padding:2px 8px;border-radius:12px;font-size:0.75rem;">
                    ${t.status}
                </span>
            </div>
        </div>
    `).join('');

    // Order actions for escrow
    const ordersActions = document.getElementById('ordersActions');
    if (ordersActions) {
        const open = (JSON.parse(localStorage.getItem('transactions')) || []).filter(t => t.status === 'in_escrow');
        if (open.length === 0) {
            ordersActions.innerHTML = '';
        } else {
            ordersActions.innerHTML = open.map(t => `
                <div class="insight-item">
                    <i class="fas fa-vault"></i>
                    <p><strong>${t.id}</strong> in escrow • ${t.items.length} items
                    <br/>
                    <button class="btn-text" onclick="window.markDelivered('${t.id}')">Action Order</button>
                    </p>
                </div>
            `).join('');
        }
    }
}

function displayListings() {
    const container = document.getElementById('activeListings');
    if (!container) return;
    
    const userType = (window.AppState?.currentUser?.userType || 'farmer').toLowerCase();
    let displayItems = dashboardData.activeListings;
    let priceLabel = '/ton';
    let editLabel = 'Edit';
    
    if (userType === 'transporter') {
        displayItems = [
            { id: 'FR-01', name: 'Pickup Request: Karnal', quantity: 18, price: 6000, views: 'Ready', inquiries: 'Requires flatbed' },
            { id: 'FR-02', name: 'Pickup Request: Patiala', quantity: 25, price: 9000, views: 'Scheduled', inquiries: 'Requires 2 trucks' }
        ];
        priceLabel = ' Freight';
        editLabel = 'Accept';
    } else if (userType === 'buyer' || userType === 'ngo') {
        displayItems = [
            { id: 'RQ-01', name: 'Wanted: Wheat Straw', quantity: 100, price: 4000, views: 'Urgent', inquiries: '3 offers' },
            { id: 'RQ-02', name: 'Wanted: Rice Husk', quantity: 50, price: 5500, views: 'Standard', inquiries: 'No offers' }
        ];
        editLabel = 'Manage';
    } else if (userType === 'processor' || userType === 'admin') {
        displayItems = [
            { id: 'INV-A', name: 'Silo A: Bagasse', quantity: 120, price: 3800, views: 'Quality: A', inquiries: 'Target Yield 88%' },
            { id: 'INV-B', name: 'Silo B: Mixed Straw', quantity: 80, price: 4100, views: 'Quality: B', inquiries: 'Pre-sorting needed' }
        ];
        priceLabel = ' Value';
        editLabel = 'Process';
    } else if (userType === 'ngo' || userType === 'regulator') {
        displayItems = [
            { id: 'SUB-12', name: 'Machinery Subsidy (Baler)', quantity: 10, price: 50000, views: 'Fund: 40%', inquiries: '12 Applications' },
            { id: 'SUB-13', name: 'Transport Logistics Grant', quantity: 5, price: 15000, views: 'Fund: 80%', inquiries: '4 Applications' }
        ];
        priceLabel = ' Grant';
        editLabel = 'Review';
    }
    
    if (displayItems.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:#999;padding:2rem;">No active items</p>';
        return;
    }
    
    container.innerHTML = displayItems.map(l => `
        <div class="listing-item">
            <div>
                <strong>${l.name}</strong>
                <small style="display:block;color:#666;">${l.quantity} tons</small>
                <small style="color:#999;">${l.views} • ${l.inquiries}</small>
            </div>
            <div style="text-align:right;">
                <strong style="color:#2ecc71;">₹${l.price.toLocaleString()}${priceLabel}</strong>
                <div style="margin-top:5px;">
                    <button class="btn-text" style="font-size:0.85rem;padding:0;">${editLabel}</button>
                </div>
            </div>
        </div>
    `).join('');
}

function displayImpactMetrics() {
    // Calculate environmental impact
    const co2Prevented = (dashboardData.wasteTraded * 2.5).toFixed(1);
    const treesPlanted = Math.round(parseFloat(co2Prevented) * 1000 / 21);
    const sustainScore = Math.min(100, Math.round((dashboardData.wasteTraded / 500) * 100));
    
    document.getElementById('co2Prevented').textContent = co2Prevented + ' tons';
    document.getElementById('treesPlanted').textContent = treesPlanted.toLocaleString();
    document.getElementById('sustainScore').textContent = sustainScore + '/100';
    
    // Update progress bar
    document.getElementById('progressFill').style.width = sustainScore + '%';
    document.getElementById('progressText').textContent = sustainScore + '% Complete';
    
    // Update delivery circle (SVG circle animation)
    const deliveryRate = 98;
    const circle = document.getElementById('deliveryCircle');
    if (circle) {
        const circumference = 2 * Math.PI * 32; // r=32 from HTML
        const offset = circumference - (deliveryRate / 100) * circumference;
        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = offset;
    }
}

function setupDateRange() {
    const dateRange = document.getElementById('dateRange');
    dateRange?.addEventListener('change', (e) => {
        const days = parseInt(e.target.value);
        // In a real app, this would fetch data for the selected range
        showNotification(`Loading data for last ${days} days...`, 'info');
        
        // Simulate data update
        setTimeout(() => {
            // Update charts with new data
            updateChartData(days);
            showNotification('Data updated successfully', 'success');
        }, 500);
    });
}

function updateChartData(days) {
    // Generate sample data based on selected range
    const weeks = Math.ceil(days / 7);
    const newLabels = Array.from({ length: weeks }, (_, i) => `Week ${i + 1}`);
    const newValues = Array.from({ length: weeks }, () => Math.floor(Math.random() * 50000) + 30000);
    
    // Update revenue chart
    if (revenueChart) {
        revenueChart.data.labels = newLabels;
        revenueChart.data.datasets[0].data = newValues;
        revenueChart.update('active');
    }
}

// Chart controls
const chartBtns = document.querySelectorAll('.chart-btn');
chartBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        chartBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const chartType = btn.dataset.chart;
        
        if (chartType === 'volume' && revenueChart) {
            // Switch to volume data
            revenueChart.data.datasets[0].label = 'Volume (tons)';
            revenueChart.data.datasets[0].data = [120, 145, 168, 190];
            revenueChart.data.datasets[0].borderColor = '#3498db';
            revenueChart.data.datasets[0].backgroundColor = 'rgba(52, 152, 219, 0.1)';
            revenueChart.options.scales.y.ticks.callback = function(value) {
                return value + ' tons';
            };
            revenueChart.update();
        } else if (chartType === 'revenue' && revenueChart) {
            // Switch back to revenue data
            revenueChart.data.datasets[0].label = 'Revenue (₹)';
            revenueChart.data.datasets[0].data = dashboardData.revenueData.values;
            revenueChart.data.datasets[0].borderColor = '#2ecc71';
            revenueChart.data.datasets[0].backgroundColor = 'rgba(46, 204, 113, 0.1)';
            revenueChart.options.scales.y.ticks.callback = function(value) {
                return '₹' + (value/1000) + 'K';
            };
            revenueChart.update();
        }
    });
});

// Export data functionality
document.querySelector('.dashboard-actions .btn-outline')?.addEventListener('click', () => {
    exportDashboardData();
});

function exportDashboardData() {
    const data = {
        summary: {
            earnings: dashboardData.earnings,
            wasteTraded: dashboardData.wasteTraded,
            transactions: dashboardData.transactions,
            carbonCredits: dashboardData.carbonCredits
        },
        transactions: dashboardData.recentTransactions,
        listings: dashboardData.activeListings,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-data-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Dashboard data exported successfully!', 'success');
}

// Escrow actions
window.markDelivered = function(txId){
    let txs = JSON.parse(localStorage.getItem('transactions')||'[]');
    const tx = txs.find(t => t.id === txId);
    if (!tx) return;
    tx.status = 'completed';
    localStorage.setItem('transactions', JSON.stringify(txs));
    addNotification('Order Completed', `${txId} marked delivered and released from escrow`, 'success');
    // Prompt rating
    const rating = prompt('Rate this order (1-5 stars):', '5');
    if (rating) {
        const ratings = JSON.parse(localStorage.getItem('ratings')||'[]');
        ratings.unshift({ id: 'R'+Date.now(), txId, rating: Math.max(1, Math.min(5, parseInt(rating))), date: new Date() });
        localStorage.setItem('ratings', JSON.stringify(ratings));
    }
    displayTransactions();
};

window.raiseDispute = function(txId){
    const reason = prompt('Describe the issue to open a dispute:');
    if (!reason) return;
    const disputes = JSON.parse(localStorage.getItem('disputes')||'[]');
    disputes.unshift({ id: 'D'+Date.now(), txId, reason, status:'open', date:new Date() });
    localStorage.setItem('disputes', JSON.stringify(disputes));
    addNotification('Dispute Opened', `Dispute for ${txId} opened`, 'error');
    displayTransactions();
};

// Add some dynamic updates (simulate real-time)
setInterval(() => {
    // Randomly update view counts for active listings
    dashboardData.activeListings.forEach(listing => {
        if (Math.random() > 0.7) {
            listing.views += Math.floor(Math.random() * 5) + 1;
        }
    });
    displayListings();
}, 30000); // Update every 30 seconds
