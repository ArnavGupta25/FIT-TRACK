// Check if user is logged in
if (sessionStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'login.html';
}

// DOM Elements
const userGreeting = document.getElementById('userGreeting');
const activityForm = document.getElementById('activityForm');
const nutritionForm = document.getElementById('nutritionForm');
const stepsInput = document.getElementById('steps');
const caloriesBurnedInput = document.getElementById('caloriesBurned');
const activeMinutesInput = document.getElementById('activeMinutes');
const mealNameInput = document.getElementById('mealName');
const caloriesInput = document.getElementById('calories');
const mealList = document.getElementById('mealList');
const manageActivitiesBtn = document.getElementById('manageActivitiesBtn');
const manageActivitiesPopup = document.getElementById('manageActivitiesPopup');
const closePopupBtn = document.getElementById('closePopupBtn');
const activitiesList = document.getElementById('activitiesList');
const activityChartCtx = document.getElementById('activityChart').getContext('2d');
const nutritionChartCtx = document.getElementById('nutritionChart').getContext('2d');
const overviewSelect = document.getElementById('overviewSelect');
const overviewPeriod = document.getElementById('overviewPeriod');
const overviewMetricTitle = document.getElementById('overviewMetricTitle');
const overviewMetricValue = document.getElementById('overviewMetricValue');

let activityChart;
let nutritionChart;

function loadData() {
    const activities = JSON.parse(localStorage.getItem('activities')) || [];
    const meals = JSON.parse(localStorage.getItem('meals')) || [];
    const userEmail = sessionStorage.getItem('userEmail');

    userGreeting.textContent = `Welcome, ${userEmail}!`;

    // Update overview
    updateOverview();

    // Chart data
    const activityLabels = activities.map(activity => new Date(activity.date).toLocaleDateString());
    const activitySteps = activities.map(activity => activity.steps);

    // Destroy existing chart if it exists
    if (activityChart) {
        activityChart.destroy();
    }

    // Initialize Activity Chart
    try {
        activityChart = new Chart(activityChartCtx, {
            type: 'bar',
            data: {
                labels: activityLabels,
                datasets: [
                    {
                        label: 'Steps',
                        data: activitySteps,
                        backgroundColor: '#4caf50',
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function (tooltipItem) {
                                return 'Steps: ' + tooltipItem.raw;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Steps'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error initializing activity chart:', error);
    }

    // Destroy existing nutrition chart if it exists
    if (nutritionChart) {
        nutritionChart.destroy();
    }

    // Initialize Nutrition Chart
    try {
        nutritionChart = new Chart(nutritionChartCtx, {
            type: 'pie',
            data: {
                labels: meals.map(meal => meal.name),
                datasets: [{
                    data: meals.map(meal => meal.calories),
                    backgroundColor: ['#ffb74d', '#ff6f61', '#f48fb1', '#81c784'],
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error initializing nutrition chart:', error);
    }

    // Meal list
    mealList.innerHTML = meals.map(meal => `
        <div class="meal-item">
            <span>${meal.name} - ${meal.calories} Calories</span>
            <button onclick="deleteMeal('${meal.name}')">Delete</button>
        </div>
    `).join('');
}

function updateOverview() {
    const activities = JSON.parse(localStorage.getItem('activities')) || [];
    const metric = overviewSelect.value;
    const period = overviewPeriod.value;
    
    let filteredActivities = filterActivitiesByPeriod(activities, period);
    let totalValue = calculateTotalForMetric(filteredActivities, metric);

    overviewMetricTitle.textContent = getMetricTitle(metric);
    overviewMetricValue.textContent = totalValue;
}

function filterActivitiesByPeriod(activities, period) {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    switch (period) {
        case 'day':
            return activities.filter(activity => new Date(activity.date) >= startOfDay);
        case 'week':
            return activities.filter(activity => new Date(activity.date) >= startOfWeek);
        case 'month':
            return activities.filter(activity => new Date(activity.date) >= startOfMonth);
        case 'all':
        default:
            return activities;
    }
}

function calculateTotalForMetric(activities, metric) {
    return activities.reduce((sum, activity) => sum + activity[getMetricKey(metric)], 0);
}

function getMetricKey(metric) {
    switch (metric) {
        case 'steps': return 'steps';
        case 'calories': return 'caloriesBurned';
        case 'active': return 'activeMinutes';
        default: return 'steps';
    }
}

function getMetricTitle(metric) {
    switch (metric) {
        case 'steps': return 'Steps';
        case 'calories': return 'Calories Burned';
        case 'active': return 'Active Minutes';
        default: return 'Steps';
    }
}

// Add activity
activityForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const steps = parseInt(stepsInput.value);
    const caloriesBurned = parseInt(caloriesBurnedInput.value);
    const activeMinutes = parseInt(activeMinutesInput.value);
    const activities = JSON.parse(localStorage.getItem('activities')) || [];
    activities.push({ steps, caloriesBurned, activeMinutes, date: new Date().toISOString() });
    localStorage.setItem('activities', JSON.stringify(activities));
    activityForm.reset();
    loadData();  // Refresh the UI and charts
});

// Add meal
nutritionForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const mealName = mealNameInput.value;
    const calories = parseInt(caloriesInput.value);
    const meals = JSON.parse(localStorage.getItem('meals')) || [];
    meals.push({ name: mealName, calories });
    localStorage.setItem('meals', JSON.stringify(meals));
    nutritionForm.reset();
    loadData();  // Refresh the UI and charts
});

// Delete meal
function deleteMeal(name) {
    let meals = JSON.parse(localStorage.getItem('meals')) || [];
    meals = meals.filter(meal => meal.name !== name);
    localStorage.setItem('meals', JSON.stringify(meals));
    loadData();  // Refresh the UI and charts
}

// Show the popup
manageActivitiesBtn.addEventListener('click', () => {
    manageActivitiesPopup.style.display = 'flex';
    populateActivitiesList();
});

// Close the popup
closePopupBtn.addEventListener('click', () => {
    manageActivitiesPopup.style.display = 'none';
});

function populateActivitiesList() {
    const activities = JSON.parse(localStorage.getItem('activities')) || [];
    activitiesList.innerHTML = '';

    activities.forEach((activity, index) => {
        const activityItem = document.createElement('li');
        activityItem.innerHTML = `
            <span>${new Date(activity.date).toLocaleDateString()} - Steps: ${activity.steps}, Calories: ${activity.caloriesBurned}, Active Minutes: ${activity.activeMinutes}</span>
            <div class="btn-group">
                <button class="btn edit-btn" onclick="openEditPopup(${index})">Edit</button>
                <button class="btn delete-btn" onclick="deleteActivity(${index})">Delete</button>
            </div>
        `;
        activitiesList.appendChild(activityItem);
    });
}

function openEditPopup(index) {
    const activities = JSON.parse(localStorage.getItem('activities')) || [];
    const activity = activities[index];

    const editPopup = document.createElement('div');
    editPopup.className = 'popup';
    editPopup.id = 'editActivityPopup';
    editPopup.innerHTML = `
        <div class="popup-content">
            <h3>Edit Activity</h3>
            <form id="editActivityForm">
                <input type="number" id="editSteps" value="${activity.steps}" required>
                <input type="number" id="editCaloriesBurned" value="${activity.caloriesBurned}" required>
                <input type="number" id="editActiveMinutes" value="${activity.activeMinutes}" required>
                <button type="submit" class="btn">Save Changes</button>
                <button type="button" class="btn" onclick="closeEditPopup()">Cancel</button>
            </form>
        </div>
    `;

    document.body.appendChild(editPopup);
    editPopup.style.display = 'flex';

    const editActivityForm = document.getElementById('editActivityForm');
    editActivityForm.onsubmit = function (e) {
        e.preventDefault();
        const steps = parseInt(document.getElementById('editSteps').value);
        const caloriesBurned = parseInt(document.getElementById('editCaloriesBurned').value);
        const activeMinutes = parseInt(document.getElementById('editActiveMinutes').value);

        activities[index] = { ...activities[index], steps, caloriesBurned, activeMinutes };
        localStorage.setItem('activities', JSON.stringify(activities));
        loadData();
        populateActivitiesList();
        closeEditPopup();
    };
}

function closeEditPopup() {
    const editPopup = document.getElementById('editActivityPopup');
    if (editPopup) {
        editPopup.remove();
    }
}

function deleteActivity(index) {
    let activities = JSON.parse(localStorage.getItem('activities')) || [];
    activities.splice(index, 1);
    localStorage.setItem('activities', JSON.stringify(activities));
    loadData();
    populateActivitiesList();
}

// Event listeners for overview controls
overviewSelect.addEventListener('change', updateOverview);
overviewPeriod.addEventListener('change', updateOverview);

// Load data initially
loadData();

document.getElementById('logoutBtn').addEventListener('click', function() {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('userEmail');
    window.location.href = 'index.html';
});