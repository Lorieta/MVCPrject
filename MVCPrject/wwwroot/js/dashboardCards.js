
// Function to initialize dashboard nutrition cards on page load
async function initializeDashboardNutritionCards() {
    try {
        console.log('🍽️ Dashboard: Initializing nutrition cards on page load - VERSION 2024-FIXED');
        
        // Check if container exists first
        const container = document.getElementById("dashboard-cards");
        if (!container) {
            console.error('🍽️ Dashboard: Container "dashboard-cards" not found! Check your HTML.');
            return;
        }
        
        // Try to get current values from database first
        const response = await fetch('/Nutrition/GetNutritionSummary');
        const result = await response.json();
        
        // Debug: Log the full API response to help identify UserID issues
        console.log('🍽️ Dashboard: Full API response:', result);
        
        let nutritionData;
        
        if (result.success && result.data) {
            // Found data in database - use it
            console.log('🍽️ Dashboard: Found current values in database:', result.data);
            if (result.debug) {
                console.log('🍽️ Dashboard: Debug info:', result.debug);
            }
            
            nutritionData = [
                { 
                    label: 'Calories', 
                    value: result.data.calories || 0, 
                    percent: 70 // Keep original static percent
                },
                { 
                    label: 'Protein', 
                    value: result.data.proteins || 0, 
                    percent: 50 // Keep original static percent
                },
                { 
                    label: 'Fats', 
                    value: result.data.fats || 0, 
                    percent: 20 // Keep original static percent
                },
                { 
                    label: 'Carbohydrates', 
                    value: result.data.carbs || 0, 
                    percent: 90 // Keep original static percent
                }
            ];
            
            console.log('🍽️ Dashboard: Using database values for nutrition cards');
        } else {
            // No data in database - show default/placeholder values
            console.log('🍽️ Dashboard: No data in database, showing default values');
            console.log('🍽️ Dashboard: API result details:', result);
            if (result.debug) {
                console.log('🍽️ Dashboard: Debug info:', result.debug);
            }
            
            nutritionData = [
                { label: 'Calories', value: 0, percent: 70 },
                { label: 'Protein', value: 0, percent: 50 },
                { label: 'Fats', value: 0, percent: 20 },
                { label: 'Carbohydrates', value: 0, percent: 90 }
            ];
        }
        
        // Clear existing cards
        container.innerHTML = '';
        
        // Create cards with the data
        nutritionData.forEach(item => {
            const col = document.createElement("div");
            col.className = "col-6 col-md-3";
            
            col.innerHTML = `
                <div class="rounded shadow-sm py-3 px-3 text-center" style="background-color: #C2CCFFAB;">
                    <div class="fw-bold fs-4">${item.value}</div>
                    <div class="text-muted">${item.label}</div>
                    <div class="progress" style="height: 10px; border-radius: 1rem; background-color: white;">
                        <div class="progress-bar" role="progressbar"
                            style="width: ${item.percent}%; background-color: #2C358A; border-radius: 1rem;">
                        </div>
                    </div>
                </div>
            `;
            
            container.appendChild(col);
        });
        
        console.log('🍽️ Dashboard: Nutrition cards initialized successfully');
        
    } catch (error) {
        console.error('🍽️ Dashboard: Error initializing nutrition cards:', error);
        
        // Check if container exists before fallback
        const container = document.getElementById("dashboard-cards");
        if (!container) {
            console.error('🍽️ Dashboard: Container "dashboard-cards" not found! Check your HTML.');
            return;
        }
        
        // Fallback to default values on error
        const nutritionData = [
            { label: 'Calories', value: 0, percent: 70 },
            { label: 'Protein', value: 0, percent: 50 },
            { label: 'Fats', value: 0, percent: 20 },
            { label: 'Carbohydrates', value: 0, percent: 90 }
        ];
        
        container.innerHTML = '';
        
        nutritionData.forEach(item => {
            const col = document.createElement("div");
            col.className = "col-6 col-md-3";
            
            col.innerHTML = `
                <div class="rounded shadow-sm py-3 px-3 text-center" style="background-color: #C2CCFFAB;">
                    <div class="fw-bold fs-4">${item.value}</div>
                    <div class="text-muted">${item.label}</div>
                    <div class="progress" style="height: 10px; border-radius: 1rem; background-color: white;">
                        <div class="progress-bar" role="progressbar"
                            style="width: ${item.percent}%; background-color: #2C358A; border-radius: 1rem;">
                        </div>
                    </div>
                </div>
            `;
            
            container.appendChild(col);
        });
        
        console.log('🍽️ Dashboard: Nutrition cards initialized with default values (error fallback)');
    }
}

// Function to refresh dashboard cards after updates
async function refreshDashboardNutritionCards() {
    await initializeDashboardNutritionCards();
}

// Wait for DOM to be ready before initializing
document.addEventListener('DOMContentLoaded', function() {
    console.log('🍽️ Dashboard: DOM loaded, waiting for container...');
    
    // Double-check that container exists
    const container = document.getElementById("dashboard-cards");
    if (container) {
        console.log('🍽️ Dashboard: Container found, initializing cards');
        initializeDashboardNutritionCards();
    } else {
        console.log('🍽️ Dashboard: Container not found, waiting...');
        // Wait a bit more and try again
        setTimeout(() => {
            initializeDashboardNutritionCards();
        }, 500);
    }
});

// Alternative fallback - use window load event
window.addEventListener('load', function() {
    console.log('🍽️ Dashboard: Window loaded');
    
    // Only initialize if not already done
    const container = document.getElementById("dashboard-cards");
    if (container && container.children.length === 0) {
        console.log('🍽️ Dashboard: Cards not loaded yet, initializing...');
        initializeDashboardNutritionCards();
    }
});

document.addEventListener("DOMContentLoaded", function () {
    console.log('🍽️ Dashboard: Suggested cards section - VERSION 2024-FIXED');
    const suggestions = [
        {
            title: "Mediterranean Quinoa Bowl",
            description: "A protein-packed dish featuring nutty quinoa, roasted vegetables, and feta cheese, drizzled with tangy lemon-herb dressing. Perfect for meal prep!"
        },
        {
            title: "Classic Chicken Parmesan",
            description: "Crispy breaded chicken cutlets topped with marinara sauce and melted mozzarella. Serve with pasta for an Italian comfort food favorite."
        },
        {
            title: "Thai Coconut Curry Soup",
            description: "A fragrant soup with coconut milk, lemongrass, and your choice of protein. Customize with your favorite vegetables for a warming meal."
        },
        {
            title: "Honey Garlic Salmon",
            description: "Quick pan-seared salmon glazed with a sweet and savory honey garlic sauce. Pairs perfectly with steamed vegetables and rice."
        }
    ];

    const container = document.getElementById("suggested-cards");
    
    // Add defensive check to prevent appendChild error
    if (!container) {
        console.error('🍽️ Dashboard: Container "suggested-cards" not found! Check your HTML.');
        return;
    }

    suggestions.forEach(item => {
        const col = document.createElement("div");
        col.className = "col-12 col-md-3";

        col.innerHTML = `
            <div class="card h-100 shadow-sm">
                <div class="position-absolute bg-danger text-white px-2 py-1 rounded-pill small"
                    style="top:8px; left:8px;">AI-Curated</div>
                <div style="background:#e1e1e1;height:110px;" class="rounded-top"></div>
                <div class="card-body">
                    <div class="fw-bold">${item.title}</div>
                    <p class="card-text small text-muted">${item.description}</p>
                </div>
            </div>
        `;

        container.appendChild(col);
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const tips = [
        {
            title: "Knife Care",
            description: "Never put good knives in the dishwasher. Hand wash and dry immediately to maintain the edge and prevent damage.",
            icon: "knife"
        },
        {
            title: "Revive Greens",
            description: "Revive wilted greens by soaking them in ice water for 10 minutes before using.",
            icon: "vegetable"
        },
        {
            title: "Seasoning Heights",
            description: "Season from a height when cooking for more even distribution of salt and spices.",
            icon: "salt"
        },
        {
            title: "Pan Temperature",
            description: "Test if a pan is hot enough by sprinkling a few drops of water—they should dance and sizzle.",
            icon: "pan"
        }
    ];

    const container = document.getElementById("cooking-tips");
    
    // Add defensive check to prevent appendChild error
    if (!container) {
        console.error('🍽️ Dashboard: Container "cooking-tips" not found! Check your HTML.');
        return;
    }

    tips.forEach(tip => {
        const col = document.createElement("div");
        col.className = "col-12 col-md-3";

        col.innerHTML = `
            <div class="card shadow-sm rounded-2 h-100">
                <div class="d-flex align-items-center">
                    <div class="me-3 d-flex align-items-center justify-content-center "
                        style="width:100px;height:100px;background-color:#D9D9D9;">
                        <img src="/img/${tip.icon}.png" alt="${tip.title}" style="width: 40px; height: 40px;"></img>
                    </div>
                    <div class="flex-grow-1">
                        <div class="fw-bold text-dark">${tip.title}</div>
                    </div>
                </div>
                <div class="mt-2 small text-muted p-3">
                    ${tip.description}
                </div>
            </div>
        `;

        container.appendChild(col);
    });
});

if (typeof feather !== 'undefined') {
    feather.replace();
}
