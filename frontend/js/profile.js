const API = 'http://localhost:8000/api';
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || 'null');

if (!token) window.location.href = 'login.html';
if (user)
  document.getElementById('welcome-msg').textContent = `hey, ${user.username}`;

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

function getStatusClass(status) {
  if (status === 'Accepted') return 'status-solved';
  if (status === 'Pending') return 'status-pending';
  return 'status-attempted';
}

async function loadProfile() {
  try {
    const res = await fetch(`${API}/users/${user.username}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error('Failed to load profile');
    const data = await res.json();

    // Avatar initials
    const initials = data.username.slice(0, 2).toUpperCase();
    document.getElementById('avatar-initials').textContent = initials;

    // Name + member since
    document.getElementById('profile-username').textContent = data.username;
    const joined = new Date(data.memberSince).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
    document.getElementById('member-since').textContent =
      `Member since ${joined}`;

    // Ratings
    document.getElementById('hardcore-rating').textContent =
      data.hardcoreRating;
    document.getElementById('learning-rating').textContent =
      data.learningRating;

    // Solved stats
    document.getElementById('total-solved').textContent = data.totalSolved;
    document.getElementById('easy-solved').textContent =
      data.solvedByDifficulty.Easy;
    document.getElementById('medium-solved').textContent =
      data.solvedByDifficulty.Medium;
    document.getElementById('hard-solved').textContent =
      data.solvedByDifficulty.Hard;

    // Roadmap
    document.getElementById('roadmap-day').textContent =
      `${data.roadmapProgress.currentDay} / 30`;

    // Recent submissions
    const list = document.getElementById('recent-list');
    if (data.recentSubmissions.length === 0) {
      list.innerHTML = '<p class="empty-msg">No submissions yet.</p>';
      return;
    }

    list.innerHTML = data.recentSubmissions
      .map(
        (sub) => `
      <div class="sub-row" onclick="window.location.href='problem.html?slug=${sub.problem?.slug}'" style="cursor:pointer">
        <span class="sub-title">${sub.problem?.title || 'Unknown'}</span>
        <span class="badge badge-${sub.problem?.difficulty}">${sub.problem?.difficulty}</span>
        <span class="status-badge ${getStatusClass(sub.status)}">${sub.status}</span>
        <span class="sub-time">${new Date(sub.createdAt).toLocaleDateString()}</span>
      </div>
    `
      )
      .join('');
  } catch (err) {
    console.error(err);
  }
}

loadProfile();
