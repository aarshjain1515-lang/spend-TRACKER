// Chart.js Configuration and Management
let categoryChart, budgetChart, trendChart;

// Initialize all charts
function initializeCharts() {
    createCategoryChart();
    createBudgetChart();
    createTrendChart();
}

// Update all charts with new data
function updateCharts() {
    updateCategoryChart();
    updateBudgetChart();
    updateTrendChart();
}

// Category Breakdown Pie Chart
function createCategoryChart() {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;

    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    'rgba(0, 245, 255, 0.8)',      // Cyan
                    'rgba(255, 0, 110, 0.8)',      // Pink
                    'rgba(255, 190, 11, 0.8)',     // Yellow
                    'rgba(131, 56, 236, 0.8)',     // Purple
                    'rgba(6, 255, 165, 0.8)',      // Green
                    'rgba(255, 99, 132, 0.8)',     // Red
                ],
                borderColor: 'rgba(26, 11, 46, 1)',
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#B8B8FF',
                        font: {
                            size: 12,
                            family: 'Inter'
                        },
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(26, 11, 46, 0.9)',
                    titleColor: '#00F5FF',
                    bodyColor: '#FFFFFF',
                    borderColor: '#00F5FF',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function (context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ₹${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Budget vs Spending Bar Chart
function createBudgetChart() {
    const ctx = document.getElementById('budgetChart');
    if (!ctx) return;

    budgetChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Budget', 'Spent', 'Remaining'],
            datasets: [{
                label: 'Amount (₹)',
                data: [0, 0, 0],
                backgroundColor: [
                    'rgba(6, 255, 165, 0.6)',      // Green for budget
                    'rgba(255, 0, 110, 0.6)',      // Pink for spent
                    'rgba(0, 245, 255, 0.6)'       // Cyan for remaining
                ],
                borderColor: [
                    'rgba(6, 255, 165, 1)',
                    'rgba(255, 0, 110, 1)',
                    'rgba(0, 245, 255, 1)'
                ],
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#B8B8FF',
                        callback: function (value) {
                            return '₹' + value;
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#B8B8FF'
                    },
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(26, 11, 46, 0.9)',
                    titleColor: '#00F5FF',
                    bodyColor: '#FFFFFF',
                    borderColor: '#00F5FF',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function (context) {
                            return '₹' + context.parsed.y;
                        }
                    }
                }
            }
        }
    });
}

// Spending Trend Line Chart
function createTrendChart() {
    const ctx = document.getElementById('trendChart');
    if (!ctx) return;

    trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Daily Spending',
                data: [],
                borderColor: 'rgba(0, 245, 255, 1)',
                backgroundColor: 'rgba(0, 245, 255, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: 'rgba(255, 0, 110, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#B8B8FF',
                        callback: function (value) {
                            return '₹' + value;
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#B8B8FF'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#B8B8FF',
                        font: {
                            size: 12,
                            family: 'Inter'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(26, 11, 46, 0.9)',
                    titleColor: '#00F5FF',
                    bodyColor: '#FFFFFF',
                    borderColor: '#00F5FF',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function (context) {
                            return 'Spent: ₹' + context.parsed.y;
                        }
                    }
                }
            }
        }
    });
}

// Update Category Chart with expense data
function updateCategoryChart() {
    if (!categoryChart || !state.expenses.length) return;

    // Group expenses by category
    const categoryTotals = {};
    state.expenses.forEach(expense => {
        const category = expense.category || 'Other';
        categoryTotals[category] = (categoryTotals[category] || 0) + Number(expense.amount);
    });

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);

    categoryChart.data.labels = labels;
    categoryChart.data.datasets[0].data = data;
    categoryChart.update();
}

// Update Budget Chart
function updateBudgetChart() {
    if (!budgetChart) return;

    const budget = state.monthlyBudget || 0;
    const spent = state.expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const remaining = Math.max(0, budget - spent);

    budgetChart.data.datasets[0].data = [budget, spent, remaining];
    budgetChart.update();
}

// Update Trend Chart with last 7 days
function updateTrendChart() {
    if (!trendChart) return;

    // Get last 7 days
    const days = [];
    const amounts = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        // Format label as "Mon 1"
        const label = date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
        days.push(label);

        // Calculate total for this day
        const dayTotal = state.expenses
            .filter(exp => exp.date === dateStr)
            .reduce((sum, exp) => sum + Number(exp.amount), 0);
        amounts.push(dayTotal);
    }

    trendChart.data.labels = days;
    trendChart.data.datasets[0].data = amounts;
    trendChart.update();
}
