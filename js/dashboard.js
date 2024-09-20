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
const overviewPeriod = document.getElementById('overviewPeriod');
const manageMealsBtn = document.getElementById('manageMealsBtn');
const manageMealsPopup = document.getElementById('manageMealsPopup');
const closeMealsPopupBtn = document.getElementById('closeMealsPopupBtn');
const mealsList = document.getElementById('mealsList');


let activityChart;
let nutritionChart;

let currentDateIndex = 0;
let dateKeys = [];

// Check if user is logged in
if (sessionStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'login.html';
}

function loadData() {
    const activities = JSON.parse(localStorage.getItem('activities')) || [];
    const meals = JSON.parse(localStorage.getItem('meals')) || [];
    const userEmail = sessionStorage.getItem('userEmail');

    userGreeting.textContent = `Welcome, ${userEmail}!`;

    const updatedMeals = meals.map(meal => {
        if (!meal.date) {
            meal.date = new Date().toISOString();
        }
        return meal;
    });
    localStorage.setItem('meals', JSON.stringify(updatedMeals));

    // Update overview
    updateOverview();

    // Process and update activity data
    const processedActivityData = processActivityData(activities);
    updateActivityChart(processedActivityData);

    // Update nutrition data
    updateNutritionChart(updatedMeals);

    // Populate meal list
    populateMealsList();
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

    const isSmallScreen = window.innerWidth < 480;

    activityChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.dates,
            datasets: [
                {
                    label: 'Steps',
                    data: data.steps,
                    backgroundColor: 'rgba(76, 175, 80, 0.7)',
                    borderColor: 'rgba(76, 175, 80, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Calories Burned',
                    data: data.calories,
                    backgroundColor: 'rgba(255, 111, 97, 0.7)',
                    borderColor: 'rgba(255, 111, 97, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Active Minutes',
                    data: data.activeMinutes,
                    backgroundColor: 'rgba(255, 183, 77, 0.7)',
                    borderColor: 'rgba(255, 183, 77, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    stacked: false,
                    title: {
                        display: !isSmallScreen,
                        text: 'Date'
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45,
                        autoSkip: true,
                        maxTicksLimit: isSmallScreen ? 5 : 8,
                        callback: function(value, index, values) {
                            const date = new Date(this.getLabelForValue(value));
                            if (isNaN(date)) {
                                return value;
                            }
                            const options = isSmallScreen 
                                ? { month: 'short', day: 'numeric' }
                                : { month: 'short', day: 'numeric', year: '2-digit' };
                            return date.toLocaleDateString(undefined, options);
                        }
                    }
                },
                y: {
                    stacked: false,
                    title: {
                        display: !isSmallScreen,
                        text: 'Value'
                    },
                    ticks: {
                        maxTicksLimit: isSmallScreen ? 5 : 8,
                        callback: function(value, index, values) {
                            return value.toLocaleString();
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: !isSmallScreen
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += context.parsed.y.toLocaleString();
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}

function updateNutritionChart(meals) {
    const nutritionChartContainer = document.getElementById('nutritionChartContainer');
    nutritionChartContainer.innerHTML = `
        <div class="chart-navigation">
            <button id="prevDay">Previous Day</button>
            <span id="currentDate"></span>
            <button id="nextDay">Next Day</button>
        </div>
        <canvas id="nutritionChart"></canvas>
    `;

    const mealsByDay = processMealDataByDay(meals);
    dateKeys = Object.keys(mealsByDay).sort((a, b) => new Date(b) - new Date(a));
    currentDateIndex = 0;

    const ctx = document.getElementById('nutritionChart').getContext('2d');

    function updateChart() {
        const currentDate = dateKeys[currentDateIndex];
        const dayMeals = mealsByDay[currentDate];

        if (nutritionChart) {
            nutritionChart.destroy();
        }

        nutritionChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: dayMeals.map(meal => meal.name),
                datasets: [{
                    data: dayMeals.map(meal => meal.calories),
                    backgroundColor: ['#ffb74d', '#ff6f61', '#f48fb1', '#81c784', '#64b5f6'],
                }]
            },
            options: {
                responsive: true,
                maintainmaintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: `Calorie Distribution for ${currentDate}`
                    }
                }
            }
        });

        document.getElementById('currentDate').textContent = currentDate;
    }

    document.getElementById('prevDay').addEventListener('click', () => {
        if (currentDateIndex < dateKeys.length - 1) {
            currentDateIndex++;
            updateChart();
        }
    });

    document.getElementById('nextDay').addEventListener('click', () => {
        if (currentDateIndex > 0) {
            currentDateIndex--;
            updateChart();
        }
    });

    updateChart();
}

function processMealDataByDay(meals) {
    const mealsByDay = {};
    meals.forEach(meal => {
        const date = new Date(meal.date).toLocaleDateString();
        if (!mealsByDay[date]) {
            mealsByDay[date] = [];
        }
        mealsByDay[date].push(meal);
    });
    return mealsByDay;
}

function populateMealsList() {
    const meals = JSON.parse(localStorage.getItem('meals')) || [];
    mealsList.innerHTML = '';

    meals.forEach((meal, index) => {
        const mealItem = document.createElement('li');
        mealItem.innerHTML = `
            <span>${new Date(meal.date).toLocaleDateString()} - ${meal.name} - ${meal.calories} Calories</span>
            <div class="btn-group">
                <button class="btn edit-btn" onclick="openEditMealPopup(${index})">Edit</button>
                <button class="btn delete-btn" onclick="deleteMeal(${index})">Delete</button>
            </div>
        `;
        mealsList.appendChild(mealItem);
    });
}

function updateOverview() {
    const activities = JSON.parse(localStorage.getItem('activities')) || [];
    const period = overviewPeriod.value;
    
    const filteredActivities = filterActivitiesByPeriod(activities, period);
    const totalStats = calculateTotalStats(filteredActivities);

    document.getElementById('totalSteps').textContent = totalStats.steps.toLocaleString();
    document.getElementById('totalCalories').textContent = totalStats.calories.toLocaleString();
    document.getElementById('totalActiveMinutes').textContent = totalStats.activeMinutes.toLocaleString();
}

function filterActivitiesByPeriod(activities, period) {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    switch (period) {
        case 'today':
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

function calculateTotalStats(activities) {
    return activities.reduce((total, activity) => {
        total.steps += activity.steps;
        total.calories += activity.caloriesBurned;
        total.activeMinutes += activity.activeMinutes;
        return total;
    }, { steps: 0, calories: 0, activeMinutes: 0 });
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
    meals.push({ name: mealName, calories, date: new Date().toISOString() });
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

manageMealsBtn.addEventListener('click', () => {
    manageMealsPopup.style.display = 'flex';
    populateMealsList();
});

closeMealsPopupBtn.addEventListener('click', () => {
    manageMealsPopup.style.display = 'none';
});

overviewPeriod.addEventListener('change', updateOverview);

window.addEventListener('resize', function() {
    const isSmallScreen = window.innerWidth < 480;
    if (activityChart) {
        activityChart.options.scales.x.ticks.maxTicksLimit = isSmallScreen ? 5 : 8;
        activityChart.options.scales.y.ticks.maxTicksLimit = isSmallScreen ? 5 : 8;
        activityChart.options.plugins.legend.display = !isSmallScreen;
        activityChart.options.scales.x.title.display = !isSmallScreen;
        activityChart.options.scales.y.title.display = !isSmallScreen;
        activityChart.update();
    }
});

document.getElementById('logoutBtn').addEventListener('click', function() {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('userEmail');
    window.location.href = 'index.html';
});

// Helper functions
function openEditMealPopup(index) {
    const meals = JSON.parse(localStorage.getItem('meals')) || [];
    const meal = meals[index];

    if (!meal) {
        console.error('Meal not found');
        return;
    }

    const editPopup = document.createElement('div');
    editPopup.className = 'popup';
    editPopup.id = 'editMealPopup';
    editPopup.innerHTML = `
        <div class="popup-content">
            <h3>Edit Meal</h3>
            <form id="editMealForm">
                <input type="text" id="editMealName" value="${meal.name}" required>
                <input type="number" id="editMealCalories" value="${meal.calories}" required>
                <button type="submit" class="btn">Save Changes</button>
                <button type="button" class="btn" onclick="closeEditMealPopup()">Cancel</button>
            </form>
        </div>
    `;

    document.body.appendChild(editPopup);
    editPopup.style.display = 'flex';

    const editMealForm = document.getElementById('editMealForm');
    editMealForm.onsubmit = function (e) {
        e.preventDefault();
        const name = document.getElementById('editMealName').value;
        const calories = parseInt(document.getElementById('editMealCalories').value);

        meals[index] = { ...meals[index], name, calories };
        localStorage.setItem('meals', JSON.stringify(meals));
        loadData();
        populateMealsList();
        closeEditMealPopup();
    };
}

function closeEditMealPopup() {
    const editPopup = document.getElementById('editMealPopup');
    if (editPopup) {
        editPopup.remove();
    }
}

function deleteMeal(index) {
    let meals = JSON.parse(localStorage.getItem('meals')) || [];
    meals.splice(index, 1);
    localStorage.setItem('meals', JSON.stringify(meals));
    loadData();
    populateMealsList();
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

    if (!activity) {
        console.error('Activity not found');
        return;
    }

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

document.getElementById('logoutBtn').addEventListener('click', function() {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('userEmail');
    window.location.href = 'index.html';
});