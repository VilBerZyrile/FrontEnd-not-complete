// --- Data Simulation (using localStorage as a simple "database") ---
const db = {
    init: () => {
        // Initialize if data doesn't exist
        if (!localStorage.getItem('users')) {
            localStorage.setItem('users', JSON.stringify([]));
        }
        if (!localStorage.getItem('students')) {
            localStorage.setItem('students', JSON.stringify([
                { id: 1, name: 'John Doe', yearCourse: 'Grade 10 - A', history: [] },
                { id: 2, name: 'Jane Smith', yearCourse: 'Grade 11 - STEM', history: [] },
                { id: 3, name: 'Peter Jones', yearCourse: 'Grade 12 - HUMSS', history: [] },
            ]));
        }
        if (!localStorage.getItem('inventory')) {
            localStorage.setItem('inventory', JSON.stringify([
                { id: 1, name: 'Paracetamol', stock: 50 },
                { id: 2, name: 'Ibuprofen', stock: 25 },
                { id: 3, name: 'Betadine', stock: 10 },
                { id: 4, name: 'Band-aid', stock: 5 }, // Low stock item
            ]));
        }
    },
    getUsers: () => JSON.parse(localStorage.getItem('users')),
    saveUsers: (users) => localStorage.setItem('users', JSON.stringify(users)),
    getStudents: () => JSON.parse(localStorage.getItem('students')),
    saveStudents: (students) => localStorage.setItem('students', JSON.stringify(students)),
    getInventory: () => JSON.parse(localStorage.getItem('inventory')),
    saveInventory: (inventory) => localStorage.setItem('inventory', JSON.stringify(inventory)),
};

// --- Application State and Routing ---
const appContainer = document.getElementById('app-container');
let loggedInUser = localStorage.getItem('loggedInUser');

const navigate = (page) => {
    switch (page) {
        case 'login':
            renderLoginPage();
            break;
        case 'signup':
            renderSignupPage();
            break;
        case 'home':
            renderHomePage();
            break;
        case 'studentList':
            renderStudentListPage();
            break;
        case 'inventory':
            renderInventoryPage();
            break;
        case 'request':
            renderRequestPage();
            break;
        case 'studentProfile':
            // The student profile is a sub-view, so it's not a full page change
            // It will be handled by the Student List Page's rendering function
            break;
        default:
            renderLoginPage();
            break;
    }
};

const setupNavBar = () => {
    if (loggedInUser) {
        return `
            <div class="header">
                <h1>School Clinic</h1>
                <nav class="nav-bar">
                    <a href="#" onclick="navigate('home')">Home</a>
                    <a href="#" onclick="navigate('studentList')">Student List</a>
                    <a href="#" onclick="navigate('inventory')">Inventory</a>
                    <a href="#" onclick="navigate('request')">Request Medicine</a>
                </nav>
                <button class="logout-btn" onclick="logout()">Logout</button>
            </div>
        `;
    }
    return '';
};

// --- Authentication Logic ---
const login = (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;
    const users = db.getUsers();
    const user = users.find(u => u.username === username && u.password === password); // In a real app, hash and compare passwords
    
    if (user) {
        loggedInUser = user.username;
        localStorage.setItem('loggedInUser', loggedInUser);
        navigate('home');
    } else {
        alert('Invalid username or password.');
    }
};

const signup = (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;
    const confirmPassword = e.target.confirmPassword.value;
    const users = db.getUsers();

    if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return;
    }
    if (users.find(u => u.username === username)) {
        alert('Username already exists.');
        return;
    }

    const newUser = { username, password }; // In a real app, hash the password
    users.push(newUser);
    db.saveUsers(users);
    alert('Account created successfully! You can now log in.');
    navigate('login');
};

const logout = () => {
    loggedInUser = null;
    localStorage.removeItem('loggedInUser');
    navigate('login');
};

// --- Page Rendering Functions ---
const renderLoginPage = () => {
    appContainer.innerHTML = `
        <div class="auth-container">
            <form class="auth-form" onsubmit="login(event)">
                <h2>Login</h2>
                <div class="form-group">
                    <label for="username">Username</label>
                    <input type="text" id="username" name="username" required>
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" required>
                </div>
                <button type="submit">Login</button>
                <div class="auth-link">
                    <a href="#" onclick="navigate('signup')">Don't have an account? Sign up</a>
                </div>
            </form>
        </div>
    `;
};

const renderSignupPage = () => {
    appContainer.innerHTML = `
        <div class="auth-container">
            <form class="auth-form" onsubmit="signup(event)">
                <h2>Sign Up</h2>
                <div class="form-group">
                    <label for="username">Username</label>
                    <input type="text" id="username" name="username" required>
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" required>
                </div>
                <div class="form-group">
                    <label for="confirmPassword">Confirm Password</label>
                    <input type="password" id="confirmPassword" name="confirmPassword" required>
                </div>
                <button type="submit">Sign Up</button>
                <div class="auth-link">
                    <a href="#" onclick="navigate('login')">Already have an account? Log in</a>
                </div>
            </form>
        </div>
    `;
};

const renderHomePage = () => {
    if (!loggedInUser) return navigate('login');
    const inventory = db.getInventory();
    const students = db.getStudents();
    const lowStockCount = inventory.filter(item => item.stock <= 10).length;
    const recentRequests = students.flatMap(s => s.history)
                                .sort((a, b) => new Date(b.date) - new Date(a.date))
                                .slice(0, 5);

    let recentRequestsHtml = recentRequests.length > 0 ? recentRequests.map(req => `
        <li>${req.studentName} received ${req.quantity}x ${req.medicineName} on ${req.date}</li>
    `).join('') : '<p>No recent requests.</p>';

    appContainer.innerHTML = `
        ${setupNavBar()}
        <div class="main-content">
            <h2 class="page-title">Dashboard</h2>
            <div class="dashboard-grid">
                <div class="dashboard-card">
                    <h3>Total Students</h3>
                    <p>${students.length}</p>
                </div>
                <div class="dashboard-card">
                    <h3>Total Inventory Items</h3>
                    <p>${inventory.length}</p>
                </div>
                <div class="dashboard-card">
                    <h3>Low Stock Alerts</h3>
                    <p class="${lowStockCount > 0 ? 'low-stock' : ''}">${lowStockCount}</p>
                </div>
            </div>
            <h3 style="margin-top: 40px;">Recent Medicine Requests</h3>
            <ul>${recentRequestsHtml}</ul>
        </div>
    `;
};

const renderStudentListPage = (searchQuery = '') => {
    if (!loggedInUser) return navigate('login');
    const students = db.getStudents();
    const filteredStudents = students.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const studentListHtml = filteredStudents.map(s => `
        <tr>
            <td><a href="#" class="student-link" onclick="renderStudentProfile(${s.id})">${s.name}</a></td>
            <td>${s.yearCourse}</td>
        </tr>
    `).join('');

    appContainer.innerHTML = `
        ${setupNavBar()}
        <div class="main-content">
            <h2 class="page-title">Student List</h2>
            <input type="text" class="search-bar" placeholder="Search for a student..." oninput="renderStudentListPage(this.value)">
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Year and Course</th>
                    </tr>
                </thead>
                <tbody>${studentListHtml}</tbody>
            </table>
            <div id="student-profile-view"></div>
        </div>
    `;
};

const renderStudentProfile = (studentId) => {
    if (!loggedInUser) return navigate('login');
    const students = db.getStudents();
    const student = students.find(s => s.id === studentId);
    
    if (!student) return;

    const historyHtml = student.history.length > 0 ? student.history.map(h => `
        <tr>
            <td>${h.date}</td>
            <td>${h.medicineName}</td>
            <td>${h.quantity}</td>
            <td>${h.reason}</td>
        </tr>
    `).join('') : `<tr><td colspan="4">No history of medicine requests.</td></tr>`;

    const profileView = document.getElementById('student-profile-view');
    profileView.innerHTML = `
        <h3 style="margin-top: 30px;">Student Profile: ${student.name}</h3>
        <p><strong>Year and Course:</strong> ${student.yearCourse}</p>
        <h4>Medical History</h4>
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Medicine</th>
                    <th>Quantity</th>
                    <th>Reason</th>
                </tr>
            </thead>
            <tbody>${historyHtml}</tbody>
        </table>
        <button class="btn-primary" onclick="renderStudentListPage()">Back to Student List</button>
    `;
    profileView.scrollIntoView({ behavior: 'smooth' });
};

const renderInventoryPage = () => {
    if (!loggedInUser) return navigate('login');
    const inventory = db.getInventory();
    
    const inventoryHtml = inventory.map(item => `
        <tr>
            <td>${item.name}</td>
            <td class="${item.stock <= 10 ? 'low-stock' : ''}">${item.stock}</td>
        </tr>
    `).join('');

    appContainer.innerHTML = `
        ${setupNavBar()}
        <div class="main-content">
            <h2 class="page-title">Inventory</h2>
            <table>
                <thead>
                    <tr>
                        <th>Medicine Name</th>
                        <th>Current Stock</th>
                    </tr>
                </thead>
                <tbody>${inventoryHtml}</tbody>
            </table>
        </div>
    `;
};

const renderRequestPage = () => {
    if (!loggedInUser) return navigate('login');
    const students = db.getStudents();
    const inventory = db.getInventory();

    const studentOptions = students.map(s => `<option value="${s.id}">${s.name} (${s.yearCourse})</option>`).join('');
    const medicineOptions = inventory.map(item => `<option value="${item.id}">${item.name}</option>`).join('');

    appContainer.innerHTML = `
        ${setupNavBar()}
        <div class="main-content">
            <h2 class="page-title">Request for Medicine</h2>
            <div class="form-container">
                <form onsubmit="handleMedicineRequest(event)">
                    <div class="form-group">
                        <label for="student">Student Name:</label>
                        <select id="student" name="studentId" required>${studentOptions}</select>
                    </div>
                    <div class="form-group">
                        <label for="medicine">Medicine:</label>
                        <select id="medicine" name="medicineId" required>${medicineOptions}</select>
                    </div>
                    <div class="form-group">
                        <label for="quantity">Quantity:</label>
                        <input type="number" id="quantity" name="quantity" min="1" required>
                    </div>
                    <div class="form-group">
                        <label for="reason">Reason:</label>
                        <textarea id="reason" name="reason" rows="3" required></textarea>
                    </div>
                    <button type="submit" class="btn-success">Submit Request</button>
                </form>
            </div>
        </div>
    `;
};

// --- Core Functionality Logic ---
const handleMedicineRequest = (e) => {
    e.preventDefault();
    const studentId = parseInt(e.target.studentId.value);
    const medicineId = parseInt(e.target.medicineId.value);
    const quantity = parseInt(e.target.quantity.value);
    const reason = e.target.reason.value;

    const students = db.getStudents();
    const inventory = db.getInventory();

    const student = students.find(s => s.id === studentId);
    const medicine = inventory.find(item => item.id === medicineId);

    if (medicine.stock < quantity) {
        alert('Error: Not enough stock available for this medicine.');
        return;
    }

    // 1. Deduct from inventory
    medicine.stock -= quantity;
    db.saveInventory(inventory);

    // 2. Add to student's history
    const request = {
        date: new Date().toLocaleDateString('en-US'),
        medicineName: medicine.name,
        quantity,
        reason
    };
    student.history.push(request);
    db.saveStudents(students);

    alert('Medicine request successful. Inventory has been updated.');
    e.target.reset(); // Clear the form
    navigate('home'); // Redirect to home page
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    db.init(); // Initialize database (localStorage)
    if (loggedInUser) {
        navigate('home');
    } else {
        navigate('login');
    }
});