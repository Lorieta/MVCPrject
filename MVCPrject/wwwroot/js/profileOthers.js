let isFollowing = false;
let profileUserId = '';
let profileUserEmail = '';
let currentUserEmail = '';

// Initialize variables from meta tags
function initializeVariables() {
    profileUserId = document.querySelector('meta[name="profile-user-id"]')?.getAttribute('content') || '';
    profileUserEmail = document.querySelector('meta[name="profile-user-email"]')?.getAttribute('content') || '';
    currentUserEmail = document.querySelector('meta[name="current-user-email"]')?.getAttribute('content') || '';
    
    // Debug logging
    console.log('Profile User Email:', profileUserEmail);
    console.log('Current User Email:', currentUserEmail);
    console.log('User is authenticated:', document.querySelector('meta[name="user-authenticated"]')?.getAttribute('content') === 'true');
}

// Initialize follow status when page loads
document.addEventListener('DOMContentLoaded', async function() {
    initializeVariables();
    feather.replace();
    await checkFollowStatus();
    await loadUserStats();
    await loadUserRecipes();
    
    // Initialize Bootstrap tabs
    const triggerTabList = [].slice.call(document.querySelectorAll('#profileTabs button'));
    triggerTabList.forEach(function (triggerEl) {
        const tabTrigger = new bootstrap.Tab(triggerEl);
        triggerEl.addEventListener('click', function (event) {
            event.preventDefault();
            tabTrigger.show();
        });
    });
});

async function checkFollowStatus() {
    try {
        console.log('Checking follow status for:', profileUserEmail);
        const response = await fetch(`/Profile/IsFollowing?followeeEmail=${encodeURIComponent(profileUserEmail)}`);
        const result = await response.json();
        console.log('Follow status result:', result);
        isFollowing = result.isFollowing;
        updateFollowButton();
    } catch (error) {
        console.error('Error checking follow status:', error);
        // Default to not following if there's an error
        isFollowing = false;
        updateFollowButton();
    }
}

async function loadUserStats() {
    try {
        const response = await fetch(`/Profile/GetUserStats?userEmail=${encodeURIComponent(profileUserEmail)}`);
        const stats = await response.json();
        
        console.log('User stats loaded:', stats);
        
        // Update the counts in the UI
        document.getElementById('recipeCount').textContent = stats.recipes;
        document.getElementById('followingCount').textContent = stats.following;
        document.getElementById('followerCount').textContent = stats.followers;
    } catch (error) {
        console.error('Error loading user stats:', error);
        // Keep default values if there's an error
    }
}

async function loadUserRecipes() {
    try {
        const response = await fetch(`/Profile/GetUserRecipes?userEmail=${encodeURIComponent(profileUserEmail)}`);
        const result = await response.json();
        
        console.log('User recipes loaded:', result);
        
        const recipesContainer = document.getElementById('recipesContainer');
        
        if (result.success && result.recipes && result.recipes.length > 0) {
            // Clear loading spinner
            recipesContainer.innerHTML = '';
            
            // Create recipe cards
            result.recipes.forEach(recipe => {
                const recipeCard = createRecipeCard(recipe);
                recipesContainer.appendChild(recipeCard);
            });
        } else {
            // Show no recipes message
            recipesContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i data-feather="book-open" style="width: 64px; height: 64px;" class="text-muted mb-3"></i>
                    <h4 class="text-muted">No recipes yet</h4>
                    <p class="text-muted">This user hasn't shared any recipes yet.</p>
                </div>
            `;
            feather.replace();
        }
    } catch (error) {
        console.error('Error loading user recipes:', error);
        const recipesContainer = document.getElementById('recipesContainer');
        recipesContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <i data-feather="alert-circle" style="width: 64px; height: 64px;" class="text-danger mb-3"></i>
                <h4 class="text-muted">Error loading recipes</h4>
                <p class="text-muted">Unable to load recipes at this time.</p>
            </div>
        `;
        feather.replace();
    }
}

function createRecipeCard(recipe) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card-hover';
    
    // Try both cases for calories
    const caloriesValue = recipe.Calories || recipe.calories || '420';
    
    cardDiv.innerHTML = `
        <img src="${recipe.image || '/img/default-recipe.jpg'}" class="img-fluid" alt="${recipe.name}">
        <div class="overlay">
            <h5>${recipe.name}</h5>
            <div class="details gap-5">
                <span>${caloriesValue} cal</span>
                <span>${recipe.totalTime || '45'} mins</span>
            </div>
        </div>
    `;
    
    // Add click event to navigate to recipe view
    cardDiv.addEventListener('click', function() {
        window.location.href = `/Recipe/View/${recipe.id}`;
    });
    
    return cardDiv;
}

async function toggleFollow() {
    const followBtn = document.getElementById('followBtn');
    const followText = document.getElementById('followText');
    
    // Disable button during request
    followBtn.disabled = true;
    followText.textContent = isFollowing ? 'Unfollowing...' : 'Following...';
    
    try {
        console.log('toggleFollow called - currentUserEmail:', currentUserEmail);
        console.log('toggleFollow called - profileUserEmail:', profileUserEmail);
        
        if (!currentUserEmail || currentUserEmail === '') {
            showToast('Please log in to follow users', 'error');
            console.error('Current user email is empty or null');
            return;
        }
        
        if (!profileUserEmail || profileUserEmail === '') {
            showToast('Profile user email not found', 'error');
            console.error('Profile user email is empty or null');
            return;
        }
        
        const endpoint = isFollowing ? '/Profile/UnFollow' : '/Profile/Follow';
        console.log('Making request to:', endpoint);
        console.log('Request body:', {
            followerEmail: currentUserEmail,
            followeeEmail: profileUserEmail
        });
        
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                followerEmail: currentUserEmail,
                followeeEmail: profileUserEmail
            })
        });
        
        const result = await response.json();
        console.log('Response:', result);
        
        if (result.success) {
            isFollowing = !isFollowing;
            updateFollowButton();
            
            // Reload user stats to reflect the change
            await loadUserStats();
            
            showToast(isFollowing ? 'Successfully followed user!' : 'Successfully unfollowed user!', 'success');
        } else {
            console.error('Follow/Unfollow failed:', result.message);
            showToast(result.message || 'Failed to update follow status', 'error');
        }
    } catch (error) {
        console.error('Error toggling follow:', error);
        showToast('An error occurred. Please try again.', 'error');
    } finally {
        followBtn.disabled = false;
    }
}

function updateFollowButton() {
    const followBtn = document.getElementById('followBtn');
    const followText = document.getElementById('followText');
    
    console.log('Updating follow button. isFollowing:', isFollowing);
    console.log('Follow button element:', followBtn);
    
    if (!followBtn || !followText) {
        console.error('Follow button elements not found');
        return;
    }
    
    // Enable the button once we have the follow status
    followBtn.disabled = false;
    
    if (isFollowing) {
        followBtn.className = 'btn btn-outline-danger';
        followText.innerHTML = '<i data-feather="user-minus" class="me-2"></i>Unfollow';
        console.log('Set button to Unfollow state');
    } else {
        followBtn.className = 'btn btn-custom-red';
        followText.innerHTML = '<i data-feather="user-plus" class="me-2"></i>Follow';
        console.log('Set button to Follow state');
    }
    
    // Re-initialize feather icons for the new icons
    feather.replace();
}

// Show followers modal
async function showFollowersModal() {
    const modal = new bootstrap.Modal(document.getElementById('followersModal'));
    const container = document.getElementById('followersContainer');
    
    // Show loading state
    container.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-success" role="status">
                <span class="visually-hidden">Loading followers...</span>
            </div>
            <p class="text-muted mt-3">Loading followers...</p>
        </div>
    `;
    
    modal.show();
    
    try {
        const response = await fetch(`/Profile/GetUserFollowers?userEmail=${encodeURIComponent(profileUserEmail)}`);
        const result = await response.json();
        
        if (result.success && result.followers && result.followers.length > 0) {
            container.innerHTML = result.followers.map(follower => `
                <div class="d-flex align-items-center p-3 border-bottom">
                    <img src="/img/image.png" class="rounded-circle me-3" width="50" height="50" alt="${follower.name}">
                    <div class="flex-grow-1">
                        <h6 class="mb-1 fw-bold">${follower.name}</h6>
                        <small class="text-muted">@${follower.email}</small>
                    </div>
                    <a href="/Profile/ProfileOthers?email=${encodeURIComponent(follower.email)}" class="btn btn-outline-primary btn-sm">
                        View Profile
                    </a>
                </div>
            `).join('');
        } else {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i data-feather="users" style="width: 64px; height: 64px;" class="text-muted mb-3"></i>
                    <h4 class="text-muted">No followers yet</h4>
                    <p class="text-muted">This user doesn't have any followers yet.</p>
                </div>
            `;
            feather.replace();
        }
    } catch (error) {
        console.error('Error loading followers:', error);
        container.innerHTML = `
            <div class="text-center py-5">
                <i data-feather="alert-circle" style="width: 64px; height: 64px;" class="text-danger mb-3"></i>
                <h4 class="text-muted">Error loading followers</h4>
                <p class="text-muted">Unable to load followers at this time.</p>
            </div>
        `;
        feather.replace();
    }
}

// Show following modal
async function showFollowingModal() {
    const modal = new bootstrap.Modal(document.getElementById('followingModal'));
    const container = document.getElementById('followingContainer');
    
    // Show loading state
    container.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-info" role="status">
                <span class="visually-hidden">Loading following...</span>
            </div>
            <p class="text-muted mt-3">Loading following...</p>
        </div>
    `;
    
    modal.show();
    
    try {
        const response = await fetch(`/Profile/GetUserFollowing?userEmail=${encodeURIComponent(profileUserEmail)}`);
        const result = await response.json();
        
        if (result.success && result.following && result.following.length > 0) {
            container.innerHTML = result.following.map(following => `
                <div class="d-flex align-items-center p-3 border-bottom">
                    <img src="/img/image.png" class="rounded-circle me-3" width="50" height="50" alt="${following.name}">
                    <div class="flex-grow-1">
                        <h6 class="mb-1 fw-bold">${following.name}</h6>
                        <small class="text-muted">@${following.email}</small>
                    </div>
                    <a href="/Profile/ProfileOthers?email=${encodeURIComponent(following.email)}" class="btn btn-outline-primary btn-sm">
                        View Profile
                    </a>
                </div>
            `).join('');
        } else {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i data-feather="user-plus" style="width: 64px; height: 64px;" class="text-muted mb-3"></i>
                    <h4 class="text-muted">Not following anyone yet</h4>
                    <p class="text-muted">This user isn't following anyone yet.</p>
                </div>
            `;
            feather.replace();
        }
    } catch (error) {
        console.error('Error loading following:', error);
        container.innerHTML = `
            <div class="text-center py-5">
                <i data-feather="alert-circle" style="width: 64px; height: 64px;" class="text-danger mb-3"></i>
                <h4 class="text-muted">Error loading following</h4>
                <p class="text-muted">Unable to load following at this time.</p>
            </div>
        `;
        feather.replace();
    }
}

function showToast(message, type) {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `alert alert-${type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'danger'} position-fixed`;
    toast.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px; opacity: 0.9;';
    toast.textContent = message;
    
    // Add to page
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}