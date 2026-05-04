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

let allSubmissions = [];

async function loadSubmissions() {
  try {
    const res = await fetch(`${API}/submissions/my`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    allSubmissions = data;
    renderSubmissions(data);
  } catch (err) {
    document.getElementById('submissions-body').innerHTML =
      '<tr><td colspan="5" class="loading">Failed to load submissions.</td></tr>';
  }
}

function renderSubmissions(submissions) {
  const tbody = document.getElementById('submissions-body');
  if (submissions.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="5" class="loading">No submissions yet. Solve a problem to get started!</td></tr>';
    return;
  }
  tbody.innerHTML = submissions
    .map(
      (s, i) => `
    <tr onclick="openModal('${s._id}')" style="cursor:pointer">
      <td class="num">${i + 1}</td>
      <td><span class="problem-link">${s.problem.title}</span></td>
      <td><span class="lang-tag">${s.language}</span></td>
      <td><span class="status-badge status-${s.status.replace(/ /g, '-')}">${s.status}</span></td>
      <td class="timestamp">${formatDate(s.createdAt)}</td>
    </tr>
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
  renderSubmissions(
    status === 'all'
      ? allSubmissions
      : allSubmissions.filter((s) => s.status === status)
  );
}

async function openModal(submissionId) {
  const submission = allSubmissions.find((s) => s._id === submissionId);
  if (!submission) return;

  document.getElementById('modal-problem-title').textContent =
    submission.problem.title;
  document.getElementById('modal-meta').textContent =
    `${submission.language} · ${formatDate(submission.createdAt)}`;

  const verdictBadge = document.getElementById('modal-verdict');
  verdictBadge.textContent = submission.status;
  verdictBadge.className = `status-badge status-${submission.status.replace(/ /g, '-')}`;

  const feedbackSection = document.getElementById('feedback-section');
  const feedbackBox = document.getElementById('modal-feedback');
  if (submission.adminNote && submission.adminNote.trim()) {
    feedbackBox.textContent = submission.adminNote;
    feedbackSection.classList.remove('hidden');
  } else {
    feedbackSection.classList.add('hidden');
  }

  document.getElementById('modal-code').textContent = submission.code;
  document.getElementById('modal').classList.remove('hidden');
  loadAttemptHistory(submission.problem._id, submission._id);
}

async function loadAttemptHistory(problemId, currentSubmissionId) {
  const historyEl = document.getElementById('attempt-history');
  historyEl.innerHTML =
    '<p class="muted" style="font-size:12px">Loading attempts...</p>';
  try {
    const res = await fetch(`${API}/submissions/problem/${problemId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const attempts = await res.json();
    const currentIndex = attempts.findIndex(
      (a) => a._id === currentSubmissionId
    );
    const attemptNumber = attempts.length - currentIndex;
    const acceptedCount = attempts.filter(
      (a) => a.status === 'Accepted'
    ).length;
    historyEl.innerHTML = `
      <div class="attempt-stats">
        <div class="stat-item">
          <span class="stat-value">${attemptNumber}</span>
          <span class="stat-label">of ${attempts.length} attempts</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">${acceptedCount}</span>
          <span class="stat-label">accepted</span>
        </div>
      </div>
    `;
  } catch (err) {
    historyEl.innerHTML =
      '<p class="muted" style="font-size:12px">Could not load attempts.</p>';
  }
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
}

document.getElementById('modal').addEventListener('click', function (e) {
  if (e.target === this) closeModal();
});

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

loadSubmissions();
