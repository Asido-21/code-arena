const API = 'http://localhost:8000/api';

const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || 'null');

if (!token) window.location.href = 'login.html';
if (user?.role === 'admin') window.location.href = 'admin.html';

// Avatar initials
if (user) {
  document.getElementById('avatar-btn').textContent = user.username
    .slice(0, 2)
    .toUpperCase();
}

const slug = new URLSearchParams(window.location.search).get('slug');
if (!slug) window.location.href = 'problems.html';

let editor;
let currentProblem;

const starterCode = {
  javascript: '// Write your solution here\nfunction solution() {\n\n}\n',
  python: '# Write your solution here\ndef solution():\n    pass\n',
  java: '// Write your solution here\nclass Solution {\n    public void solve() {\n\n    }\n}\n',
  cpp: '// Write your solution here\n#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n\n    return 0;\n}\n',
};

require.config({
  paths: {
    vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs',
  },
});
require(['vs/editor/editor.main'], function () {
  editor = monaco.editor.create(document.getElementById('editor'), {
    value: starterCode.javascript,
    language: 'javascript',
    theme: 'vs-dark',
    fontSize: 14,
    fontFamily: 'JetBrains Mono, monospace',
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    lineNumbers: 'on',
    automaticLayout: true,
    padding: { top: 16 },
  });
  loadProblem();
});

document
  .getElementById('language-select')
  .addEventListener('change', function () {
    const lang = this.value;
    monaco.editor.setModelLanguage(
      editor.getModel(),
      lang === 'cpp' ? 'cpp' : lang
    );
    editor.setValue(starterCode[lang]);
  });

async function loadProblem() {
  try {
    const res = await fetch(`${API}/problems/${slug}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const problem = await res.json();
    currentProblem = problem;

    document.title = `${problem.title} — Code Arena`;
    document.getElementById('problem-title').textContent = problem.title;

    const badge = document.getElementById('difficulty-badge');
    badge.textContent = problem.difficulty;
    badge.className = `badge-${problem.difficulty}`;

    document.getElementById('problem-description').textContent =
      problem.description;

    document.getElementById('examples').innerHTML = problem.examples
      .map(
        (ex, i) => `
      <div class="example-block">
        <div class="label">Input:</div>
        <div class="value">${ex.input}</div>
        <div class="label">Output:</div>
        <div class="value">${ex.output}</div>
        ${ex.explanation ? `<div class="explanation">💡 ${ex.explanation}</div>` : ''}
      </div>
    `
      )
      .join('');

    document.getElementById('constraints').innerHTML = problem.constraints
      .map((c) => `<li>${c}</li>`)
      .join('');

    const hintList = document.getElementById('hint-list');
    const hints = [
      { label: 'Hint 1 — Nudge', key: 'tier1' },
      { label: 'Hint 2 — Direction', key: 'tier2' },
      { label: 'Hint 3 — Approach', key: 'tier3' },
    ];
    hintList.innerHTML = hints
      .map(
        (h, i) => `
      <div class="hint-item">
        <div class="hint-header" onclick="toggleHint(${i})">
          <span>${h.label}</span>
          <span id="hint-arrow-${i}">▼</span>
        </div>
        <div class="hint-body" id="hint-body-${i}">
          ${problem.hints[h.key] || 'No hint available.'}
        </div>
      </div>
    `
      )
      .join('');
  } catch (err) {
    document.getElementById('problem-description').textContent =
      'Failed to load problem.';
  }
}

function toggleHint(index) {
  const body = document.getElementById(`hint-body-${index}`);
  const arrow = document.getElementById(`hint-arrow-${index}`);
  const isOpen = body.classList.contains('open');
  body.classList.toggle('open', !isOpen);
  arrow.textContent = isOpen ? '▼' : '▲';
}

function showHints() {
  document.getElementById('description-panel').classList.add('hidden');
  document.getElementById('hints-panel').classList.remove('hidden');
  document
    .querySelectorAll('.tab')
    .forEach((t, i) => t.classList.toggle('active', i === 1));
}

document.querySelectorAll('.tab')[0].addEventListener('click', function () {
  document.getElementById('hints-panel').classList.add('hidden');
  document.getElementById('description-panel').classList.remove('hidden');
  document
    .querySelectorAll('.tab')
    .forEach((t, i) => t.classList.toggle('active', i === 0));
});

async function submitCode() {
  const code = editor.getValue();
  const language = document.getElementById('language-select').value;
  const btn = document.getElementById('submit-btn');

  if (!code.trim()) return;

  btn.disabled = true;
  btn.textContent = 'Submitting...';

  try {
    const res = await fetch(`${API}/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ problemId: currentProblem._id, code, language }),
    });
    const data = await res.json();
    if (!res.ok) {
      showVerdict('error', `Error: ${data.message}`);
      return;
    }
    showVerdict('pending', '⏳ Submitted — awaiting review');
  } catch (err) {
    showVerdict('error', '❌ Could not connect to server.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Submit';
  }
}

function showVerdict(type, message) {
  const bar = document.getElementById('verdict-bar');
  bar.className = `verdict-bar verdict-${type}`;
  bar.textContent = message;
}
