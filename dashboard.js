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

let activityChart; // Define chart variables
let nutritionChart;

// Load data
function loadData() {
    const activities = JSON.parse(localStorage.getItem('activities')) || [];
    const meals = JSON.parse(localStorage.getItem('meals')) || [];

    // Overview
    const totalSteps = activities.reduce((sum, activity) => sum + activity.steps, 0);
    const totalCaloriesBurned = activities.reduce((sum, activity) => sum + activity.caloriesBurned, 0);
    const totalActiveMinutes = activities.reduce((sum, activity) => sum + activity.activeMinutes, 0);

    document.getElementById('totalSteps').textContent = totalSteps;
    document.getElementById('totalCaloriesBurned').textContent = totalCaloriesBurned;
    document.getElementById('totalActiveMinutes').textContent = totalActiveMinutes;

    // Chart data
    const activityLabels = activities.map(activity => new Date(activity.date).toLocaleDateString());
    const activitySteps = activities.map(activity => activity.steps);
    const activityCalories = activities.map(activity => activity.caloriesBurned);
    const activityMinutes = activities.map(activity => activity.activeMinutes);

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
                    },
                    {
                        label: 'Calories Burned',
                        data: activityCalories,
                        backgroundColor: '#f44336',
                    },
                    {
                        label: 'Active Minutes',
                        data: activityMinutes,
                        backgroundColor: '#2196f3',
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function (tooltipItem) {
                                return tooltipItem.dataset.label + ': ' + tooltipItem.raw;
                            }
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
            <button class="btn edit-btn" onclick="editActivity(${index})">Edit</button>
            <button class="btn delete-btn" onclick="deleteActivity(${index})">Delete</button>
        `;
        activitiesList.appendChild(activityItem);
    });
}

function editActivity(index) {
    const activities = JSON.parse(localStorage.getItem('activities')) || [];
    const activity = activities[index];

    // Pre-fill the form with the existing data
    stepsInput.value = activity.steps;
    caloriesBurnedInput.value = activity.caloriesBurned;
    activeMinutesInput.value = activity.activeMinutes;

    // Update the form submission to handle editing
    activityForm.onsubmit = function (e) {
        e.preventDefault();
        const steps = parseInt(stepsInput.value);
        const caloriesBurned = parseInt(caloriesBurnedInput.value);
        const activeMinutes = parseInt(activeMinutesInput.value);

        activities[index] = { steps, caloriesBurned, activeMinutes, date: new Date().toISOString() };
        localStorage.setItem('activities', JSON.stringify(activities));
        activityForm.reset();
        loadData();  // Refresh the UI and charts
        manageActivitiesPopup.style.display = 'none';  // Close the popup
    };
}

function deleteActivity(index) {
    let activities = JSON.parse(localStorage.getItem('activities')) || [];
    activities.splice(index, 1);
    localStorage.setItem('activities', JSON.stringify(activities));
    loadData();  // Refresh the UI and charts
}

// Load data initially
loadData();
