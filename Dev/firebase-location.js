// DOM Elements for Location
const userList = document.getElementById('user-list');
const refreshUsersButton = document.getElementById('refresh-users');
const distanceRange = document.getElementById('distance-range');
const rangeValue = document.getElementById('range-value');

let userLocation = null;
let nearbyUsers = [];
let maxDistance = distanceRange.value;

// Get and update user location
async function getUserLocation() {
    return new Promise((resolve) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    userLocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };

                    // Update user location in database
                    if (currentUser) {
                        try {
                            await db.collection('users').doc(currentUser.uid).update({
                                location: userLocation,
                                lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
                                isOnline: true
                            });
                        } catch (error) {
                            console.error("Error updating user location:", error);
                        }
                    }

                    resolve(userLocation);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    // Use a default location
                    userLocation = { latitude: 0, longitude: 0 };
                    resolve(userLocation);
                }
            );
        } else {
            console.error("Geolocation is not supported by this browser.");
            userLocation = { latitude: 0, longitude: 0 };
            resolve(userLocation);
        }
    });
}

// Calculate distance between two coordinates in km
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    return R * c; // Distance in km
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

// Load nearby users based on distance
async function loadNearbyUsers() {
    if (!userLocation) {
        console.error("User location not available");
        return;
    }

    showLoading();
    
    try {
        // Get all users
        const usersSnapshot = await db.collection('users').get();
        const users = [];
        
        usersSnapshot.forEach(doc => {
            // Skip current user
            if (doc.id === currentUser.uid) return;
            
            const userData = doc.data();
            if (!userData.location) return; // Skip users without location data

            // Calculate distance
            const distance = calculateDistance(
                userLocation.latitude, 
                userLocation.longitude,
                userData.location.latitude, 
                userData.location.longitude
            );

            // Only include users within the set range
            if (distance <= maxDistance) {
                users.push({
                    id: doc.id,
                    name: userData.name || userData.email || "Unknown User",
                    distance: distance.toFixed(2),
                    isOnline: userData.isOnline || false,
                    lastSeen: userData.lastSeen ? userData.lastSeen.toDate().toLocaleString() : "Unknown"
                });
            }
        });

        // Sort by distance
        nearbyUsers = users.sort((a, b) => a.distance - b.distance);

        // Update UI
        renderUserList();

    } catch (error) {
        console.error("Error loading nearby users:", error);
    } finally {
        hideLoading();
    }
}

// Render the user list in the sidebar
function renderUserList() {
    userList.innerHTML = '';

    if (nearbyUsers.length === 0) {
        const noUsers = document.createElement('div');
        noUsers.style.padding = '1rem';
        noUsers.style.color = 'var(--gray)';
        noUsers.style.textAlign = 'center';
        noUsers.textContent = 'No users found nearby. Try increasing the range.';
        userList.appendChild(noUsers);
        return;
    }

    nearbyUsers.forEach(user => {
        const userItem = document.createElement('div');
        userItem.classList.add('user-item');
        userItem.innerHTML = `
            <p><strong>${user.name}</strong></p>
            <p>Distance: ${user.distance} km</p>
            <p>Status: ${user.isOnline ? "Online" : `Last seen: ${user.lastSeen}`}</p>
        `;
        userList.appendChild(userItem);
    });
}

// Event listeners
refreshUsersButton.addEventListener('click', loadNearbyUsers);
distanceRange.addEventListener('input', (event) => {
    maxDistance = event.target.value;
    rangeValue.textContent = `${maxDistance} km`;
    loadNearbyUsers();
});

// Initial load
getUserLocation().then(loadNearbyUsers);
