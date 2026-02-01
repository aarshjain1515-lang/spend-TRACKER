
// State Management
const state = {
    expenses: [],
    view: 'daily', // daily, weekly, monthly
    user: null,
    monthlyBudget: 0
};

// Category Config
const categories = {
    'Food': { icon: '<i class="fa-solid fa-utensils"></i>', color: '#ef4444' }, // Red
    'Travel': { icon: '<i class="fa-solid fa-plane"></i>', color: '#3b82f6' },   // Blue
    'Entertainment': { icon: '<i class="fa-solid fa-gamepad"></i>', color: '#8b5cf6' }, // Purple
    'Grocery': { icon: '<i class="fa-solid fa-basket-shopping"></i>', color: '#10b981' }, // Green
    'Other': { icon: '<i class="fa-solid fa-bolt"></i>', color: '#f59e0b' } // Orange
};

const elements = {
    budgetDisplay: document.getElementById('total-balance'),
    expenseList: document.querySelector('#expense-list'),
    historyList: document.getElementById('history-list'),

    // Modals
    addModal: document.getElementById('expense-modal'),
    addForm: document.getElementById('expense-form'),
    profileModal: document.getElementById('profile-modal'),
    profileForm: document.getElementById('profile-form')
};

// === Initialization ===
document.addEventListener('DOMContentLoaded', async () => {
    await ensureUser();

    if (!state.user) {
        // === OFFLINE / GUEST MODE (Fix for Loop) ===
        console.log("⚠️ No active session. Enabling Guest Mode.");
        state.user = {
            id: 'guest_user_id',
            email: 'guest@spendz.app',
            user_metadata: { full_name: 'Guest User' }
        };
    }

    console.log("✅ Logged in as:", state.user.id);

    // Load data and setup
    await loadExpenses();
    await loadProfile();
    updateHeaderProfile(); // Update header with user info
    setupEventListeners();
    renderExpenses();
    updateBalance();
    initializeCharts(); // Initialize all charts
});

// === Helper: Ensure Auth ===
async function ensureUser() {
    if (state.user) return true;

    // Check if we have a valid session (works with anonymous auth)
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        state.user = session.user;
        return true;
    }

    // No session = not logged in
    return false;
}

// === Data Operations (Supabase) ===

async function loadExpenses() {
    if (!state.user) return; // Guard
    try {
        const { data, error } = await supabase
            .from('expenses')
            .select('*')
            .order('date', { ascending: false });

        if (error) throw error;

        state.expenses = data || [];
        renderExpenses();
        renderHistory();
        updateBalance();
        if (typeof updateCharts === 'function') updateCharts();
    } catch (err) {
        console.error('Error loading expenses:', err.message);
    }
}

async function handleAddExpense(e) {
    e.preventDefault();

    // CRITICAL FIX: Ensure user exists before insert
    if (!state.user) {
        const success = await ensureUser();
        if (!success) {
            alert("Connection lost. Please refresh the page to log in again.");
            return;
        }
    }

    const submitBtn = elements.addForm.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Adding...';

    const amount = parseFloat(document.getElementById('expense-amount').value);
    const category = document.getElementById('expense-category').value;
    const date = document.getElementById('expense-date').value || new Date().toISOString();
    const title = document.getElementById('expense-title').value || category;

    try {
        const { data, error } = await supabase
            .from('expenses')
            .insert([{
                user_id: state.user.id,
                amount,
                category,
                date,
                title
            }])
            .select();

        if (error) throw error;

        // Update UI locally immediately
        state.expenses.unshift(data[0]);
        renderExpenses();
        renderHistory();
        updateBalance();
        if (typeof updateCharts === 'function') updateCharts();
        closeModal('expense-modal');
        elements.addForm.reset();

    } catch (err) {
        alert('Failed to add expense: ' + err.message);
    } finally {
        submitBtn.textContent = 'Add Expense';
    }
}

async function deleteExpense(id) {
    if (!confirm('Delete this expense?')) return;

    try {
        const { error } = await supabase
            .from('expenses')
            .delete()
            .eq('id', id);

        if (error) throw error;

        // Update state
        state.expenses = state.expenses.filter(e => e.id !== id);
        renderExpenses();
        renderHistory();
        updateBalance();
        if (typeof updateCharts === 'function') updateCharts();

    } catch (err) {
        alert('Error deleting: ' + err.message);
    }
}

// === Profile Operations ===

async function loadProfile() {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', state.user.id)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // Ignore Not Found

        if (data) {
            // Populate Form
            document.getElementById('profile-email').value = state.user.email;
            document.getElementById('profile-name').value = data.full_name || '';
            document.getElementById('profile-phone').value = data.phone || '';
            document.getElementById('profile-college').value = data.college || '';
            document.getElementById('profile-bio').value = data.bio || '';

            // Store budget in state
            state.monthlyBudget = data.monthly_budget || 0;

            // Update budget display
            if (data.monthly_budget) {
                document.getElementById('monthly-limit').textContent = `₹${data.monthly_budget}`;
                document.getElementById('weekly-limit').textContent = `₹${Math.round(data.monthly_budget / 4)}`;
                document.getElementById('daily-limit').textContent = `₹${Math.round(data.monthly_budget / 30)}`;
            }

            // Update Avatar
            if (data.avatar_url) {
                updateAvatarUI(data.avatar_url);
            }
        } else {
            document.getElementById('profile-email').value = state.user.email;
            state.monthlyBudget = 0;
        }

    } catch (err) {
        console.error('Error loading profile:', err.message);

    }
}

// Update header with user info
function updateHeaderProfile() {
    if (!state.user) return;

    const headerUserName = document.getElementById('headerUserName');
    const headerUserEmail = document.getElementById('headerUserEmail');
    const headerAvatar = document.getElementById('headerAvatar');

    if (headerUserEmail) {
        headerUserEmail.textContent = state.user.email || 'user@example.com';
    }

    // Try to get name from profile or use email username
    const displayName = state.user.user_metadata?.full_name ||
        state.user.email?.split('@')[0] ||
        'User';

    if (headerUserName) {
        headerUserName.textContent = displayName.charAt(0).toUpperCase() + displayName.slice(1);
    }

    // Update avatar with first letter
    if (headerAvatar) {
        const firstLetter = displayName.charAt(0).toUpperCase();
        headerAvatar.innerHTML = `<span style="font-size: 1.3rem; font-weight: 700;">${firstLetter}</span>`;
    }
}

async function handleSaveProfile(e) {
    e.preventDefault();
    const btn = elements.profileForm.querySelector('button[type="submit"]');
    btn.textContent = 'Saving...';

    const updates = {
        id: state.user.id,
        email: state.user.email,
        full_name: document.getElementById('profile-name').value,
        phone: document.getElementById('profile-phone').value,
        college: document.getElementById('profile-college').value,
        bio: document.getElementById('profile-bio').value,
        updated_at: new Date()
    };

    try {
        const { error } = await supabase
            .from('profiles')
            .upsert(updates);

        if (error) throw error;

        btn.textContent = 'Saved Successfully';
        btn.style.background = '#10b981';
        setTimeout(() => {
            btn.textContent = 'Save Profile';
            btn.style.background = '';
            closeModal('profile-modal');
        }, 1000);

    } catch (err) {
        alert('Error saving profile: ' + err.message);
        btn.textContent = 'Save Profile';
    }
}

async function handleImageUpload(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];

        const reader = new FileReader();
        reader.onload = async function (e) {
            const base64 = e.target.result;

            // Save to Profile immediately
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: state.user.id,
                    avatar_url: base64
                });

            if (!error) {
                updateAvatarUI(base64);
            }
        }
        reader.readAsDataURL(file);
    }
}

// === UI Helpers ===
function updateAvatarUI(src) {
    const preview = document.getElementById('profile-pic-preview');
    if (preview) preview.innerHTML = `<img src="${src}" style="width:100%; height:100%; object-fit:cover;">`;

    const headerIcon = document.querySelector('.profile-icon');
    if (headerIcon) headerIcon.innerHTML = `<img src="${src}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
}

function generateExpenseHTML(exp) {
    const cat = categories[exp.category] || categories['Other'];
    const dateStr = new Date(exp.date).toLocaleDateString();

    return `
    <div class="expense-item">
        <div class="expense-icon" style="background:${cat.color}20; color:${cat.color}">
            ${cat.icon}
        </div>
        <div class="expense-info">
            <span class="expense-title">${exp.title}</span>
            <span class="expense-date">${dateStr} • ${exp.category}</span>
        </div>
        <div class="expense-amount">-₹${exp.amount}</div>
        <button onclick="deleteExpense('${exp.id}')" style="margin-left:10px; border:none; background:none; color:#666; cursor:pointer;">
            <i class="fa-solid fa-trash"></i>
        </button>
    </div>
    `;
}

function renderExpenses() {
    elements.expenseList.innerHTML = '';

    // Filter logic
    let displayData = [...state.expenses];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (state.view === 'daily') {
        displayData = displayData.filter(e => {
            const d = new Date(e.date);
            d.setHours(0, 0, 0, 0);
            return d.getTime() === today.getTime();
        });
    } else if (state.view === 'weekly') {
        const lastWeek = new Date(today);
        lastWeek.setDate(today.getDate() - 7);
        displayData = displayData.filter(e => new Date(e.date) >= lastWeek);
    } else if (state.view === 'monthly') {
        const currentMonth = today.getMonth();
        displayData = displayData.filter(e => new Date(e.date).getMonth() === currentMonth);
    }

    if (displayData.length === 0) {
        const viewText = state.view.charAt(0).toUpperCase() + state.view.slice(1);
        elements.expenseList.innerHTML = `<div style="text-align:center; padding:20px; color:#666;">No ${viewText} expenses found</div>`;
    } else {
        displayData.forEach(exp => {
            elements.expenseList.insertAdjacentHTML('beforeend', generateExpenseHTML(exp));
        });
    }
}

function renderHistory() {
    if (!elements.historyList) return;
    elements.historyList.innerHTML = '';

    if (state.expenses.length === 0) {
        elements.historyList.innerHTML = `<div style="text-align:center; padding:20px; color:#666;">No history found</div>`;
        return;
    }

    state.expenses.forEach(exp => {
        elements.historyList.insertAdjacentHTML('beforeend', generateExpenseHTML(exp));
    });
}

function updateBalance() {
    if (!elements.budgetDisplay) return;
    const totalSpent = state.expenses.reduce((sum, item) => sum + Number(item.amount), 0);
    const budget = state.monthlyBudget || 0;
    const remaining = budget - totalSpent;
    elements.budgetDisplay.innerText = remaining;
}

// === Global Helper Functions ===
window.openModal = (id) => document.getElementById(id).classList.add('active');
window.closeModal = (id) => document.getElementById(id).classList.remove('active');
window.openProfileModal = () => { loadProfile(); openModal('profile-modal'); };
window.openExpenseModal = () => openModal('expense-modal');
window.openBudgetModal = () => openModal('budget-modal');

window.switchView = (view) => {
    state.view = view;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    renderExpenses();
};

window.logout = async () => {
    // 1. Clear Local Flags
    localStorage.removeItem('spendzLoggedIn');
    localStorage.removeItem('spendzUserEmail');
    localStorage.removeItem('spendzUserName');

    // 2. Clear Supabase Session
    await supabase.auth.signOut();

    // 3. Force Redirect to Index
    window.location.replace('index.html');
};

// === Event Setup ===
function setupEventListeners() {
    if (elements.addForm) elements.addForm.addEventListener('submit', handleAddExpense);
    if (elements.profileForm) elements.profileForm.addEventListener('submit', handleSaveProfile);

    // Budget form handler
    const budgetForm = document.getElementById('budget-form');
    if (budgetForm) {
        budgetForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const monthlyBudget = parseFloat(document.getElementById('monthly-budget-input').value);

            if (!state.user) return;

            try {
                const { error } = await supabase
                    .from('profiles')
                    .update({ monthly_budget: monthlyBudget })
                    .eq('id', state.user.id);

                if (error) throw error;

                // Update state
                state.monthlyBudget = monthlyBudget;

                // Update UI
                document.getElementById('monthly-limit').textContent = `₹${monthlyBudget}`;
                document.getElementById('weekly-limit').textContent = `₹${Math.round(monthlyBudget / 4)}`;
                document.getElementById('daily-limit').textContent = `₹${Math.round(monthlyBudget / 30)}`;

                closeModal('budget-modal');
                updateBalance();
                if (typeof updateCharts === 'function') updateCharts();
                alert('✅ Budget updated successfully!');
            } catch (err) {
                console.error('Error updating budget:', err);
                alert('Failed to update budget: ' + err.message);
            }
        });
    }
}

// === Dashboard Tab Switching ===
window.switchDashboardTab = (viewId, event) => {
    if (event) event.preventDefault();

    // 1. Update Views
    document.querySelectorAll('.dashboard-view').forEach(el => el.style.display = 'none');
    const targetView = document.getElementById(`view-${viewId}`);
    if (targetView) targetView.style.display = 'block';

    // 2. Update Nav Links
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    // Find the link that was clicked or corresponds to viewId
    if (event) {
        event.currentTarget.classList.add('active');
    }

    // 3. Special Case: Analytics (Resize charts)
    if (viewId === 'analytics') {
        if (typeof updateCharts === 'function') setTimeout(updateCharts, 100);
    }
};
