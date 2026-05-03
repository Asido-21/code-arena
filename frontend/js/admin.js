const API = 'http://localhost:8000/api';

const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || 'null');

// Guard: must be logged in AND must be admin
if (!token) {
  window.location.href = 'login.html';
}

if (!user || user.role !== 'admin') {
  alert('Admin access only.');
  window.location.href = 'problems.html';
}

if (user) {
  document.getElementById('welcome-msg').textContent =
    `${user.username} (admin)`;
}

let allSubmissions = [];
let currentSubmissionId = null;

async function loadSubmissions() {
  try {
    const res = await fetch(`${API}/submissions`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const data = await res.json();
      document.getElementById('submissions-list').innerHTML =
        `<div class="loading">Error: ${data.message}</div>`;
      return;
    }

    const data = await res.json();
    allSubmissions = data;
    renderSubmissions(data.filter((s) => s.status === 'Pending'));
  } catch (err) {
    document.getElementById('submissions-list').innerHTML =
      '<div class="loading">Failed to load submissions.</div>';
  }
}

function renderSubmissions(submissions) {
  const container = document.getElementById('submissions-list');

  if (submissions.length === 0) {
    container.innerHTML = '<div class="loading">No submissions found.</div>';
    return;
  }

  container.innerHTML = submissions
    .map(
      (s) => `
    <div class="submission-card" onclick="openModal('${s._id}')">
      <div class="sub-info">
        <h3>${s.problem.title}</h3>
        <div class="sub-meta">
          <span>👤 ${s.user.username}</span>
          <span><span class="lang-tag">${s.language}</span></span>
          <span>${formatDate(s.createdAt)}</span>
        </div>
      </div>
      <span class="status-badge status-${s.status.replace(/ /g, '-')}">${s.status}</span>
    </div>
  `
    )
    .join('');
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function filterStatus(status, btn) {
  document
    .querySelectorAll('.filter-btn')
    .forEach((b) => b.classList.remove('active'));
  btn.classList.add('active');

  if (status === 'all') {
    renderSubmissions(allSubmissions);
    return;
  }

  renderSubmissions(allSubmissions.filter((s) => s.status === status));
}

function openModal(submissionId) {
  const submission = allSubmissions.find((s) => s._id === submissionId);
  if (!submission) return;

  currentSubmissionId = submissionId;

  document.getElementById('modal-problem-title').textContent =
    submission.problem.title;
  document.getElementById('modal-user-info').textContent =
    `${submission.user.username} · ${submission.language} · ${formatDate(submission.createdAt)}`;
  document.getElementById('modal-code').textContent = submission.code;
  document.getElementById('admin-note').value = submission.adminNote || '';
  document.getElementById('verdict-select').value =
    submission.status === 'Pending' ? 'Accepted' : submission.status;

  document.getElementById('modal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
  currentSubmissionId = null;
}

async function submitVerdict() {
  if (!currentSubmissionId) return;

  const status = document.getElementById('verdict-select').value;
  const adminNote = document.getElementById('admin-note').value;
  const btn = document.querySelector('.submit-verdict-btn');

  btn.disabled = true;
  btn.textContent = 'Submitting...';

  try {
    const res = await fetch(
      `${API}/submissions/${currentSubmissionId}/verdict`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, adminNote }),
      }
    );

    if (!res.ok) {
      const data = await res.json();
      alert(`Error: ${data.message}`);
      return;
    }

    closeModal();
    loadSubmissions(); // Reload list
  } catch (err) {
    alert('Could not connect to server.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Submit Verdict';
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

loadSubmissions();
