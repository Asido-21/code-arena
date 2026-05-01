const API = 'http://localhost:8000/api';

// Check if user is logged in
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || 'null');

if (!token) {
  window.location.href = 'login.html';
}

// Show welcome message
if (user) {
  document.getElementById('welcome-msg').textContent = `hey, ${user.username}`;
}

let allProblems = [];

async function loadProblems() {
  try {
    const res = await fetch(`${API}/problems`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    allProblems = data;
    renderProblems(data);
  } catch (err) {
    document.getElementById('problems-body').innerHTML =
      '<tr><td colspan="5" class="loading">Failed to load problems.</td></tr>';
  }
}

function renderProblems(problems) {
  const tbody = document.getElementById('problems-body');

  if (problems.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="5" class="loading">No problems found.</td></tr>';
    return;
  }

  tbody.innerHTML = problems
    .map(
      (p, i) => `
    <tr>
      <td class="num">${i + 1}</td>
      <td class="title-cell">${p.title}</td>
      <td><span class="badge badge-${p.difficulty}">${p.difficulty}</span></td>
      <td class="tags">${p.tags.slice(0, 2).join(', ')}</td>
      <td class="acceptance">${p.acceptanceRate}%</td>
    </tr>
  `
    )
    .join('');
}

async function filterProblems(difficulty, btn) {
  // Update active button
  document
    .querySelectorAll('.filter-btn')
    .forEach((b) => b.classList.remove('active'));
  btn.classList.add('active');

  if (difficulty === 'all') {
    renderProblems(allProblems);
    return;
  }

  const filtered = allProblems.filter((p) => p.difficulty === difficulty);
  renderProblems(filtered);
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

// Load problems on page load
loadProblems();
