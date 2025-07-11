const currentUserEmail = document.querySelector('meta[name="user-email"]')?.getAttribute('content') || '';

// Initialize page
document.addEventListener('DOMContentLoaded', async function() {
    feather.replace();
    // Stats are already loaded from server-side model, only load recipes dynamically
    await loadMyRecipes();
});

async function loadMyStats() {
    // Only refresh stats if needed (e.g., after an action that might change them)
    // The initial stats are already loaded from the server-side model
    try {
        const response = await fetch(`/Profile/GetUserStats?userEmail=${encodeURIComponent(currentUserEmail)}`);
        const stats = await response.json();
        
        console.log('My stats refreshed:', stats);
        
        // Update the counts in the UI only if they changed
        const recipeCountElement = document.getElementById('myRecipeCount');
        const followingCountElement = document.getElementById('myFollowingCount');
        const followerCountElement = document.getElementById('myFollowerCount');
        
        if (recipeCountElement && stats.recipes !== undefined) {
            recipeCountElement.textContent = stats.recipes;
        }
        if (followingCountElement && stats.following !== undefined) {
            followingCountElement.textContent = stats.following;
        }
        if (followerCountElement && stats.followers !== undefined) {
            followerCountElement.textContent = stats.followers;
        }
    } catch (error) {
        console.error('Error refreshing stats:', error);
        // Keep the server-rendered values if there's an error
    }
}

// Function to refresh stats after actions (like following/unfollowing)
async function refreshStats() {
    await loadMyStats();
}

async function loadMyRecipes() {
    try {
        const response = await fetch(`/Profile/GetUserRecipes?userEmail=${encodeURIComponent(currentUserEmail)}`);
        const result = await response.json();
        
        console.log('My recipes loaded:', result);
        
        // Debug each recipe's calories
        if (result.success && result.recipes) {
            result.recipes.forEach((recipe, index) => {
                console.log(`Recipe ${index + 1}: ${recipe.name}`);
                console.log(`  - All property names:`, Object.keys(recipe));
                console.log(`  - Calories (capital C): "${recipe.Calories}" (type: ${typeof recipe.Calories})`);
                console.log(`  - calories (lowercase c): "${recipe.calories}" (type: ${typeof recipe.calories})`);
                console.log(`  - Total Time: "${recipe.totalTime}" (type: ${typeof recipe.totalTime})`);
                console.log(`  - Full recipe object:`, recipe);
            });
        }
        
        const recipesContainer = document.getElementById('recipesContainer');
        
        if (result.success && result.recipes && result.recipes.length > 0) {
            // Clear container (remove sample card)
            recipesContainer.innerHTML = '';
            
            // Create recipe cards
            result.recipes.forEach(recipe => {
                const recipeCard = createMyRecipeCard(recipe);
                recipesContainer.appendChild(recipeCard);
            });
        } else {
            // Keep the sample card or show no recipes message
            console.log('No recipes found, keeping sample card');
        }
        
        // Re-initialize feather icons
        feather.replace();
    } catch (error) {
        console.error('Error loading my recipes:', error);
        // Keep the sample card on error
        feather.replace();
    }
}

function createMyRecipeCard(recipe) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'position-relative card-hover';
    
    // Debug logging
    console.log('Creating recipe card for:', recipe.name);
    console.log('Recipe object keys:', Object.keys(recipe));
    console.log('Calories value (capital C):', recipe.Calories);
    console.log('calories value (lowercase c):', recipe.calories);
    
    // Try both cases
    const caloriesValue = recipe.Calories || recipe.calories || '420';

    cardDiv.innerHTML = `
        <img src="${recipe.image || '/img/sampleimg.jpg'}" class="img-fluid" alt="${recipe.name}">
        <div class="overlay">
            <button class="delete-btn position-absolute" 
                style="top: 10px; right: 10px; width: 32px; height: 32px; padding: 0; z-index: 10;"
                title="Delete Recipe"
                onclick="event.stopPropagation(); deleteMyRecipe(${recipe.id})">
                <i data-feather="trash-2" style="width: 16px; height: 16px;"></i>
            </button>
            <h5>${recipe.name}</h5>
            <div class="details gap-5">
                <span>${recipe.calories || '420'} cal</span>
                <span>${recipe.totalTime || '45'} mins</span>
            </div>
        </div>
        
        <img src="${recipe.image || '/img/sampleimg.jpg'}" class="img-fluid" alt="${recipe.name}">
        <div class="overlay">
            <button class="delete-btn position-absolute" 
                style="top: 10px; right: 10px; width: 32px; height: 32px; padding: 0; z-index: 10;"
                title="Delete Recipe"
                onclick="event.stopPropagation(); deleteMyRecipe(${recipe.id})">
                <i data-feather="trash-2" style="width: 16px; height: 16px;"></i>
            </button>
            <h5>${recipe.name}</h5>
            <div class="details gap-5">
                <span>${recipe.calories || '420'} cal</span>
                <span>${recipe.totalTime || '45'} mins</span>
            </div>
        </div>
        
    `;

    // Navigate to recipe view on card click
    cardDiv.addEventListener('click', function () {
        window.location.href = `/Recipe/View/${recipe.id}`;
    });

    feather.replace();

    feather.replace();
    return cardDiv;
}


// Function to delete a recipe
async function deleteMyRecipe(recipeId) {
    console.log('Profile.js: Delete meal log requested for ID:', recipeId);

    if (!confirm('Are you sure you want to delete this recipe?')) {
        console.log('Profile.js: Delete cancelled by user');
        return;
    }

    try {
        console.log('Profile.js: Sending delete request to API');
        const response = await fetch(`/Profile/DeleteRecipe/${recipeId}`, {
            method: 'DELETE'
        });

        console.log('Profile.js: Delete API response status:', response.status);

        const result = await response.json();
        console.log('Profile.js: Delete API response data:', result);

        if (result.success) {
            console.log('Profile.js: Recipe deleted successfully, updating UI');

            showNotification('Recipe deleted successfully!', 'success');
            await loadMyRecipes();
        } else {
            console.error('Profile.js: Delete API returned error:', result.message);
            showNotification(result.message || 'Failed to delete recipe', 'error');
        }
    } catch (error) {
        console.error('Profile.js: Error deleting recipe:', error);
        showNotification('Error deleting recipe. Please try again.', 'error');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}


// Function to delete a recipe
async function deleteMyRecipe(recipeId) {
    console.log('Profile.js: Delete meal log requested for ID:', recipeId);

    if (!confirm('Are you sure you want to delete this recipe?')) {
        console.log('Profile.js: Delete cancelled by user');
        return;
    }

    try {
        console.log('Profile.js: Sending delete request to API');
        const response = await fetch(`/Profile/DeleteRecipe/${recipeId}`, {
            method: 'DELETE'
        });

        console.log('Profile.js: Delete API response status:', response.status);

        const result = await response.json();
        console.log('Profile.js: Delete API response data:', result);

        if (result.success) {
            console.log('Profile.js: Recipe deleted successfully, updating UI');

            showNotification('Recipe deleted successfully!', 'success');
            await loadMyRecipes();
        } else {
            console.error('Profile.js: Delete API returned error:', result.message);
            showNotification(result.message || 'Failed to delete recipe', 'error');
        }
    } catch (error) {
        console.error('Profile.js: Error deleting recipe:', error);
        showNotification('Error deleting recipe. Please try again.', 'error');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

// Show followers modal
async function showFollowersModal() {
    const modal = new bootstrap.Modal(document.getElementById('followersModal'));
    modal.show();
    
    // Load followers data
    await loadFollowers();
}

// Show following modal
async function showFollowingModal() {
    const modal = new bootstrap.Modal(document.getElementById('followingModal'));
    modal.show();
    
    // Load following data
    await loadFollowing();
}

// Load followers list
async function loadFollowers() {
    const container = document.getElementById('followersContainer');
    
    try {
        const response = await fetch(`/Profile/GetUserFollowers?userEmail=${encodeURIComponent(currentUserEmail)}`);
        const result = await response.json();
        
        console.log('Followers API response:', result);
        
        if (result.success && result.followers && result.followers.length > 0) {
            container.innerHTML = '';
            
            result.followers.forEach(follower => {
                console.log('Processing follower:', follower);
                const userCard = createUserCard(follower, 'follower');
                container.appendChild(userCard);
            });
        } else {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i data-feather="users" style="width: 64px; height: 64px;" class="text-muted mb-3"></i>
                    <h5 class="text-muted">No followers yet</h5>
                    <p class="text-muted">You don't have any followers yet.</p>
                </div>
            `;
        }
        
        feather.replace();

    } catch (error) {
        console.error('Error loading followers:', error);
        container.innerHTML = `
            <div class="text-center py-5">
                <i data-feather="alert-circle" style="width: 64px; height: 64px;" class="text-danger mb-3"></i>
                <h5 class="text-muted">Error loading followers</h5>
                <p class="text-muted">Unable to load followers at this time.</p>
            </div>
        `;
        feather.replace();
    }
}

// Load following list
async function loadFollowing() {
    const container = document.getElementById('followingContainer');
    
    try {
        const response = await fetch(`/Profile/GetUserFollowing?userEmail=${encodeURIComponent(currentUserEmail)}`);
        const result = await response.json();
        
        console.log('Following API response:', result);
        
        if (result.success && result.following && result.following.length > 0) {
            container.innerHTML = '';
            
            result.following.forEach(user => {
                console.log('Processing following user:', user);
                const userCard = createUserCard(user, 'following');
                container.appendChild(userCard);
            });
        } else {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i data-feather="user-plus" style="width: 64px; height: 64px;" class="text-muted mb-3"></i>
                    <h5 class="text-muted">Not following anyone</h5>
                    <p class="text-muted">You're not following anyone yet.</p>
                </div>
            `;
        }
        
        feather.replace();
    } catch (error) {
        console.error('Error loading following:', error);
        container.innerHTML = `
            <div class="text-center py-5">
                <i data-feather="alert-circle" style="width: 64px; height: 64px;" class="text-danger mb-3"></i>
                <h5 class="text-muted">Error loading following</h5>
                <p class="text-muted">Unable to load following at this time.</p>
            </div>
        `;
        feather.replace();
    }
}

function createUserCard(user, type) {
    const card = document.createElement('div');
    card.className = 'border-bottom p-3 user-card';
    
    // Debug logging to check user data
    console.log('Creating user card for:', user);
    console.log('Profile image URL:', user.profileImage);
    
    card.innerHTML = `
        <div class="d-flex align-items-center">
            <img src="${user.profileImage || '/img/image.png'}" 
                 alt="${user.name || 'User'}" 
                 class="rounded-circle me-3" 
                 style="width: 50px; height: 50px; object-fit: cover;"
                 onerror="this.src='/img/image.png';">
            <div class="flex-grow-1">
                <h6 class="mb-1 fw-bold">${user.name || 'Unknown User'}</h6>
                <p class="text-muted mb-1 small">@${user.email || user.userName || 'unknown'}</p>
                ${user.bio ? `<p class="text-muted mb-0 small">${user.bio.length > 60 ? user.bio.substring(0, 60) + '...' : user.bio}</p>` : ''}
            </div>
            <div class="ms-3">
                <a href="/Profile/ProfileOthers?email=${encodeURIComponent(user.email || user.userName || '')}" 
                   class="btn btn-outline-primary btn-sm">
                    <i data-feather="eye" style="width: 14px; height: 14px;" class="me-1"></i>
                    View Profile
                </a>
            </div>
        </div>
    `;
    
    // Add hover effects
    card.addEventListener('mouseenter', function() {
        this.style.backgroundColor = '#f8f9fa';
        this.style.cursor = 'pointer';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.backgroundColor = '';
        this.style.cursor = '';
    });
    
    // Add click to view profile
    card.addEventListener('click', function(e) {
        // Don't trigger if clicking on the button
        if (!e.target.closest('.btn')) {
            window.location.href = `/Profile/ProfileOthers?email=${encodeURIComponent(user.email)}`;
        }
    });
    
    return card;
}