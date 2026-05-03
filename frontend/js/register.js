const API = 'http://localhost:8000/api';

async function register(event) {
  if (event) event.preventDefault();

  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  const errorMsg = document.getElementById('error-msg');
  const successMsg = document.getElementById('success-msg');
  const btnText = document.getElementById('btn-text');
  const btnLoader = document.getElementById('btn-loader');
  const btn = document.getElementById('register-btn');

  errorMsg.classList.add('hidden');
  successMsg.classList.add('hidden');

  if (!username || !email || !password) {
    errorMsg.textContent = 'All fields are required.';
    errorMsg.classList.remove('hidden');
    return;
  }

  btn.disabled = true;
  btnText.classList.add('hidden');
  btnLoader.classList.remove('hidden');

  try {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      errorMsg.textContent = data.message || 'Registration failed.';
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

    successMsg.textContent = `Welcome, ${data.username}! Redirecting...`;
    successMsg.classList.remove('hidden');

    setTimeout(() => {
      window.location.href = 'problems.html';
    }, 1500);
  } catch (err) {
    errorMsg.textContent = 'Could not connect to server.';
    errorMsg.classList.remove('hidden');
  } finally {
    btn.disabled = false;
    btnText.classList.remove('hidden');
    btnLoader.classList.add('hidden');
  }
}

function showPassword() {
  document.getElementById('password').type = 'text';
  document.getElementById('eye-open').classList.add('hidden');
  document.getElementById('eye-closed').classList.remove('hidden');
}

function hidePassword() {
  document.getElementById('password').type = 'password';
  document.getElementById('eye-closed').classList.add('hidden');
  document.getElementById('eye-open').classList.remove('hidden');
}
