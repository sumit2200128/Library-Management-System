// --- Data Initialization ---
let books = JSON.parse(localStorage.getItem('books')) || [];
let members = JSON.parse(localStorage.getItem('members')) || [];
let issuedItems = JSON.parse(localStorage.getItem('issuedItems')) || [];
let currentUserRole = 'admin';

const FINE_RATE_PER_DAY = 10; // Currency units
const LOAN_DAYS = 7;

// --- Authentication Simulation ---
function handleLogin() {
    const user = document.getElementById('login-user').value;
    const role = document.getElementById('login-role').value;

    if (user.trim() === "") {
        alert("Please enter a username");
        return;
    }

    currentUserRole = role;
    document.getElementById('login-overlay').classList.add('hidden');
    document.getElementById('app-container').classList.remove('hidden');
    document.getElementById('display-role').innerText = `Role: ${role.toUpperCase()}`;

    // Role-based UI restriction
    if (role === 'user') {
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
    } else {
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'block');
    }

    updateDashboard();
    renderInventory();
    renderMembers();
}

function handleLogout() {
    location.reload(); // Simple way to clear session state
}

// --- Navigation ---
function showSection(sectionId) {
    document.querySelectorAll('.view').forEach(view => view.classList.add('hidden'));
    document.getElementById(sectionId).classList.remove('hidden');
    
    if (sectionId === 'issued-list') renderIssuedList();
    if (sectionId === 'inventory') renderInventory();
}

// --- Core Logic: Inventory ---
function addItem() {
    const name = document.getElementById('item-name').value;
    const author = document.getElementById('item-author').value;
    const sn = document.getElementById('item-sn').value;
    const type = document.getElementById('item-type').value;

    if (!name || !sn) return alert("Fill required fields");

    books.push({ sn, name, author, type, status: 'Available' });
    saveData();
    renderInventory();
    updateDashboard();
}

function renderInventory() {
    const list = document.getElementById('inventory-list');
    list.innerHTML = books.map(book => `
        <tr>
            <td>${book.sn}</td>
            <td>${book.name}</td>
            <td>${book.author}</td>
            <td>${book.type}</td>
            <td><span class="status-${book.status.toLowerCase()}">${book.status}</span></td>
        </tr>
    `).join('');
}

// --- Core Logic: Issue & Return ---
function issueItem() {
    const sn = document.getElementById('issue-sn').value;
    const user = document.getElementById('issue-user').value;

    const book = books.find(b => b.sn === sn && b.status === 'Available');
    if (!book) return alert("Item not found or already issued");

    const issueDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(issueDate.getDate() + LOAN_DAYS);

    issuedItems.push({
        sn,
        userName: user,
        issueDate: issueDate.toISOString(),
        dueDate: dueDate.toISOString(),
        returned: false,
        finePaid: false
    });

    book.status = 'Issued';
    saveData();
    alert(`Issued successfully! Due date: ${dueDate.toDateString()}`);
}

function returnItem() {
    const sn = document.getElementById('return-sn').value;
    const record = issuedItems.find(i => i.sn === sn && !i.returned);

    if (!record) return alert("No active issue record found");

    const fine = calculateFine(record.dueDate);
    if (fine > 0) {
        const pay = confirm(`Late Return! Fine: $${fine}. Pay now?`);
        if (!pay) return alert("Return cancelled. Fine must be settled.");
    }

    record.returned = true;
    const book = books.find(b => b.sn === sn);
    book.status = 'Available';
    
    saveData();
    alert("Item returned successfully!");
    showSection('dashboard');
}

function calculateFine(dueDateStr) {
    const dueDate = new Date(dueDateStr);
    const today = new Date();
    if (today <= dueDate) return 0;

    const diffTime = Math.abs(today - dueDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays * FINE_RATE_PER_DAY;
}

// --- List View & Fines ---
function renderIssuedList() {
    const body = document.getElementById('issued-items-body');
    body.innerHTML = issuedItems.filter(i => !i.returned).map(i => {
        const fine = calculateFine(i.dueDate);
        return `
            <tr>
                <td>${i.sn}</td>
                <td>${i.userName}</td>
                <td>${new Date(i.issueDate).toLocaleDateString()}</td>
                <td>${new Date(i.dueDate).toLocaleDateString()}</td>
                <td style="color: ${fine > 0 ? 'red' : 'green'}">${fine > 0 ? '$'+fine : 'No Fine'}</td>
                <td><button onclick="payDummyFine('${i.sn}')" ${fine === 0 ? 'disabled' : ''}>Pay Fine</button></td>
            </tr>
        `;
    }).join('');
}

function payDummyFine(sn) {
    alert("Payment successful! Fine cleared for SN: " + sn);
    // In a real app, we would update the finePaid status here.
}

// --- Membership ---
function addMember() {
    const name = document.getElementById('member-name').value;
    const plan = document.getElementById('member-plan').value;
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + (plan === 'Yearly' ? 1 : 0));
    if(plan === 'Monthly') expiry.setMonth(expiry.getMonth() + 1);

    members.push({ name, plan, expiry: expiry.toDateString(), status: 'Active' });
    saveData();
    renderMembers();
    updateDashboard();
}

function renderMembers() {
    const container = document.getElementById('member-cards');
    container.innerHTML = members.map((m, index) => `
        <div class="stat-card">
            <h4>${m.name}</h4>
            <p>Plan: ${m.plan}</p>
            <p><small>Expires: ${m.expiry}</small></p>
            <button class="logout-btn" style="padding:5px; font-size:12px" onclick="cancelMember(${index})">Cancel</button>
        </div>
    `).join('');
}

function cancelMember(index) {
    members.splice(index, 1);
    saveData();
    renderMembers();
    updateDashboard();
}

// --- Utilities ---
function saveData() {
    localStorage.setItem('books', JSON.stringify(books));
    localStorage.setItem('members', JSON.stringify(members));
    localStorage.setItem('issuedItems', JSON.stringify(issuedItems));
}

function updateDashboard() {
    document.getElementById('stat-books').innerText = books.length;
    document.getElementById('stat-issued').innerText = issuedItems.filter(i => !i.returned).length;
    document.getElementById('stat-members').innerText = members.length;
}