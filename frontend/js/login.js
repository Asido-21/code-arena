const API = 'http://localhost:8000/api';

// If already logged in, redirect to problems
if (localStorage.getItem('token')) {
  window.location.href = 'problems.html';
}

async function login() {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  const errorMsg = document.getElementById('error-msg');
  const btnText = document.getElementById('btn-text');
  const btnLoader = document.getElementById('btn-loader');
  const btn = document.getElementById('login-btn');

  errorMsg.classList.add('hidden');

  if (!email || !password) {
    errorMsg.textContent = 'All fields are required.';
    errorMsg.classList.remove('hidden');
    return;
  }

  btn.disabled = true;
  btnText.classList.add('hidden');
  btnLoader.classList.remove('hidden');

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      errorMsg.textContent = data.message || 'Login failed.';
      errorMsg.classList.remove('hidden');
      return;
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem(
      'user',
      JSON.stringify({
        _id: data._id,
        username: data.username,
        email: data.email,
        role: data.role,
      })
    );

    window.location.href = 'problems.html';
  } catch (err) {
    errorMsg.textContent = 'Could not connect to server.';
    errorMsg.classList.remove('hidden');
  } finally {
    btn.disabled = false;
    btnText.classList.remove('hidden');
    btnLoader.classList.add('hidden');
  }
}
