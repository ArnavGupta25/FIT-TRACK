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
const overviewSelect = document.getElementById('overviewSelect');
const overviewPeriod = document.getElementById('overviewPeriod');
const overviewMetricTitle = document.getElementById('overviewMetricTitle');
const overviewMetricValue = document.getElementById('overviewMetricValue');

let activityChart;
let nutritionChart;

// Check if user is logged in
if (sessionStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'login.html';
}

function loadData() {
    const activities = JSON.parse(localStorage.getItem('activities')) || [];
    const meals = JSON.parse(localStorage.getItem('meals')) || [];
    const userEmail = sessionStorage.getItem('userEmail');

    userGreeting.textContent = `Welcome, ${userEmail}!`;

    // Update overview
    updateOverview();

    // Process and update activity data
    const processedActivityData = processActivityData(activities);
    updateActivityChart(processedActivityData);

    // Update nutrition data
    updateNutritionChart(meals);

    // Populate meal list
    populateMealList(meals);
}

function processActivityData(activities) {
    // Sort activities by date
    activities.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Group activities by date
    const groupedActivities = activities.reduce((acc, activity) => {
        const date = new Date(activity.date).toLocaleDateString();
        if (!acc[date]) {
            acc[date] = { steps: 0, caloriesBurned: 0, activeMinutes: 0 };
        }
        acc[date].steps += activity.steps;
        acc[date].caloriesBurned += activity.caloriesBurned;
        acc[date].activeMinutes += activity.activeMinutes;
        return acc;
    }, {});

    // Convert grouped data to arrays for charting
    const dates = Object.keys(groupedActivities);
    const steps = dates.map(date => groupedActivities[date].steps);
    const calories = dates.map(date => groupedActivities[date].caloriesBurned);
    const activeMinutes = dates.map(date => groupedActivities[date].activeMinutes);

    return { dates, steps, calories, activeMinutes };
}

function updateActivityChart(data) {
    const ctx = document.getElementById('activityChart').getContext('2d');

    if (activityChart) {
        activityChart.destroy();
    }

    activityChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.dates,
            datasets: [
                {
                    label: 'Steps',
                    data: data.steps,
                    borderColor: '#4caf50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    yAxisID: 'y-steps',
                },
                {
                    label: 'Calories Burned',
                    data: data.calories,
                    borderColor: '#ff6f61',
                    backgroundColor: 'rgba(255, 111, 97, 0.1)',
                    yAxisID: 'y-calories',
                },
                {
                    label: 'Active Minutes',
                    data: data.activeMinutes,
                    borderColor: '#ffb74d',
                    backgroundColor: 'rgba(255, 183, 77, 0.1)',
                    yAxisID: 'y-minutes',
                }
            ]
        },
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            stacked: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                'y-steps': {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Steps'
                    }
                },
                'y-calories': {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: {
                        drawOnChartArea: false,
                    },
                    title: {
                        display: true,
                        text: 'Calories Burned'
                    }
                },
                'y-minutes': {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: {
                        drawOnChartArea: false,
                    },
                    title: {
                        display: true,
                        text: 'Active Minutes'
                    }
                },
            }
        }
    });
}

function updateNutritionChart(meals) {
    const ctx = document.getElementById('nutritionChart').getContext('2d');

    if (nutritionChart) {
        nutritionChart.destroy();
    }

    nutritionChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: meals.map(meal => meal.name),
            datasets: [{
                data: meals.map(meal => meal.calories),
                backgroundColor: ['#ffb74d', '#ff6f61', '#f48fb1', '#81c784', '#64b5f6'],
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Calorie Distribution by Meal'
                }
            }
        }
    });
}

function populateMealList(meals) {
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

// Event Listeners
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

manageActivitiesBtn.addEventListener('click', () => {
    manageActivitiesPopup.style.display = 'flex';
    populateActivitiesList();
});

closePopupBtn.addEventListener('click', () => {
    manageActivitiesPopup.style.display = 'none';
});

overviewSelect.addEventListener('change', updateOverview);
overviewPeriod.addEventListener('change', updateOverview);

document.getElementById('logoutBtn').addEventListener('click', function() {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('userEmail');
    window.location.href = 'index.html';
});

// Helper functions
function deleteMeal(name) {
    let meals = JSON.parse(localStorage.getItem('meals')) || [];
    meals = meals.filter(meal => meal.name !== name);
    localStorage.setItem('meals', JSON.stringify(meals));
    loadData();  // Refresh the UI and charts
}

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

// Initial load
loadData();