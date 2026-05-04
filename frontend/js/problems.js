const API = 'http://localhost:8000/api';

const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || 'null');

if (!token) window.location.href = 'login.html';
if (user?.role === 'admin') window.location.href = 'admin.html';
if (user) {
  document.getElementById('avatar-btn').textContent = user.username
    .slice(0, 2)
    .toUpperCase();
}

let allProblems = [];
let statusMap = {};

async function loadProblems() {
  try {
    const [problemsRes, statusRes] = await Promise.all([
      fetch(`${API}/problems`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${API}/problems/status`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);
    allProblems = await problemsRes.json();
    statusMap = await statusRes.json();
    renderProblems(allProblems);
  } catch (err) {
    document.getElementById('problems-body').innerHTML =
      '<tr><td colspan="6" class="loading">Failed to load problems.</td></tr>';
  }
}

function getStatusBadge(problemId) {
  const s = statusMap[problemId];
  if (s === 'solved')
    return '<span class="status-badge status-solved">Solved</span>';
  if (s === 'attempted')
    return '<span class="status-badge status-attempted">Attempted</span>';
  return '<span class="status-badge status-unsolved">Unsolved</span>';
}

function renderProblems(problems) {
  const tbody = document.getElementById('problems-body');
  if (problems.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="6" class="loading">No problems found.</td></tr>';
    return;
  }
  tbody.innerHTML = problems
    .map(
      (p, i) => `
    <tr onclick="window.location.href='problem.html?slug=${p.slug}'" style="cursor:pointer">
      <td class="num">${i + 1}</td>
      <td class="title-cell">${p.title}</td>
      <td><span class="badge badge-${p.difficulty}">${p.difficulty}</span></td>
      <td class="tags">${p.tags.slice(0, 2).join(', ')}</td>
      <td class="acceptance">${p.acceptanceRate}%</td>
      <td>${getStatusBadge(p._id)}</td>
    </tr>
  `
    )
    .join('');
}

function filterProblems(difficulty, btn) {
  document
    .querySelectorAll('.filter-btn')
    .forEach((b) => b.classList.remove('active'));
  btn.classList.add('active');
  renderProblems(
    difficulty === 'all'
      ? allProblems
      : allProblems.filter((p) => p.difficulty === difficulty)
  );
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

loadProblems();
