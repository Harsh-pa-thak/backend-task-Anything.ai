const API = '/api/v1/tasks';
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

// Guard — redirect to login if no token
if (!token) window.location.href = '/';

// Show user name in navbar
document.getElementById('user-name').textContent = `👤 ${user.name || ''}`;

function logout() {
    localStorage.clear();
    window.location.href = '/';
}

function authHeaders() {
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

function showCreateAlert(msg, type) {
    const el = document.getElementById('create-alert');
    el.textContent = msg;
    el.className = `alert ${type}`;
    el.style.display = 'block';
    setTimeout(() => (el.style.display = 'none'), 3000);
}

function badgeClass(value, prefix) {
    return `badge badge-${prefix === 'status' ? value : value}`;
}

function renderTasks(tasks) {
    const list = document.getElementById('task-list');

    if (!tasks.length) {
        list.innerHTML = '<div class="empty-state">No tasks yet. Create your first one above!</div>';
        return;
    }

    list.innerHTML = tasks.map(task => `
        <div class="task-card">
            <div class="task-info">
                <h3>${task.title}</h3>
                ${task.description ? `<p>${task.description}</p>` : ''}
                <div class="badges">
                    <span class="${badgeClass(task.status, 'status')}">${task.status}</span>
                    <span class="${badgeClass(task.priority, 'priority')}">${task.priority}</span>
                </div>
            </div>
            <div class="task-actions">
                <button class="btn-sm btn-edit" onclick="openEditModal('${task._id}', '${task.title}', \`${task.description || ''}\`, '${task.status}', '${task.priority}')">Edit</button>
                <button class="btn-sm btn-delete" onclick="handleDelete('${task._id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

async function loadTasks() {
    const res = await fetch(API, { headers: authHeaders() });
    if (res.status === 401) return logout();
    const data = await res.json();
    renderTasks(data.tasks);
}

async function handleCreate(e) {
    e.preventDefault();
    const body = {
        title: document.getElementById('task-title').value,
        description: document.getElementById('task-desc').value,
        status: document.getElementById('task-status').value,
        priority: document.getElementById('task-priority').value,
    };

    const res = await fetch(API, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) return showCreateAlert(data.message, 'error');

    showCreateAlert('Task created!', 'success');
    e.target.reset();
    loadTasks();
}

async function handleDelete(id) {
    if (!confirm('Delete this task?')) return;
    const res = await fetch(`${API}/${id}`, { method: 'DELETE', headers: authHeaders() });
    if (res.ok) loadTasks();
}

function openEditModal(id, title, description, status, priority) {
    document.getElementById('edit-id').value = id;
    document.getElementById('edit-title').value = title;
    document.getElementById('edit-desc').value = description;
    document.getElementById('edit-status').value = status;
    document.getElementById('edit-priority').value = priority;
    document.getElementById('edit-modal').classList.add('open');
}

function closeModal() {
    document.getElementById('edit-modal').classList.remove('open');
}

async function handleUpdate() {
    const id = document.getElementById('edit-id').value;
    const body = {
        title: document.getElementById('edit-title').value,
        description: document.getElementById('edit-desc').value,
        status: document.getElementById('edit-status').value,
        priority: document.getElementById('edit-priority').value,
    };

    const res = await fetch(`${API}/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(body),
    });

    if (res.ok) {
        closeModal();
        loadTasks();
    }
}

// Load on page start
loadTasks();
