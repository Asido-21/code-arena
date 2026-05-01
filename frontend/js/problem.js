const API = 'http://localhost:8000/api';

const token = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';

// Get slug from URL: problem.html?slug=two-sum
const slug = new URLSearchParams(window.location.search).get('slug');
if (!slug) window.location.href = 'problems.html';

let editor;
let currentProblem;

// Default starter code per language
const starterCode = {
  javascript: '// Write your solution here\nfunction solution() {\n\n}\n',
  python: '# Write your solution here\ndef solution():\n    pass\n',
  java: '// Write your solution here\nclass Solution {\n    public void solve() {\n\n    }\n}\n',
  cpp: '// Write your solution here\n#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n\n    return 0;\n}\n',
};

// Load Monaco editor
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

  // Load problem after editor is ready
  loadProblem();
});

// Switch language
document
  .getElementById('language-select')
  .addEventListener('change', function () {
    const lang = this.value;
    const monacoLang = lang === 'cpp' ? 'cpp' : lang;
    monaco.editor.setModelLanguage(editor.getModel(), monacoLang);
    editor.setValue(starterCode[lang]);
  });

async function loadProblem() {
  try {
    const res = await fetch(`${API}/problems/${slug}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const problem = await res.json();
    currentProblem = problem;

    // Set page title
    document.title = `${problem.title} — Code Arena`;
    document.getElementById('problem-title').textContent = problem.title;

    // Difficulty badge
    const badge = document.getElementById('difficulty-badge');
    badge.textContent = problem.difficulty;
    badge.className = `badge-${problem.difficulty}`;

    // Description
    document.getElementById('problem-description').textContent =
      problem.description;

    // Examples
    const examplesEl = document.getElementById('examples');
    examplesEl.innerHTML = problem.examples
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

    // Constraints
    const constraintsEl = document.getElementById('constraints');
    constraintsEl.innerHTML = problem.constraints
      .map((c) => `<li>${c}</li>`)
      .join('');

    // Hints
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

// Tab switching
function showHints() {
  document.getElementById('description-panel').classList.add('hidden');
  document.getElementById('hints-panel').classList.remove('hidden');
  document.querySelectorAll('.tab').forEach((t, i) => {
    t.classList.toggle('active', i === 1);
  });
}

document.querySelectorAll('.tab')[0].addEventListener('click', function () {
  document.getElementById('hints-panel').classList.add('hidden');
  document.getElementById('description-panel').classList.remove('hidden');
  document.querySelectorAll('.tab').forEach((t, i) => {
    t.classList.toggle('active', i === 0);
  });
});

async function submitCode() {
  const code = editor.getValue();
  const language = document.getElementById('language-select').value;
  const btn = document.getElementById('submit-btn');
  const verdictBar = document.getElementById('verdict-bar');

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
      body: JSON.stringify({
        problemId: currentProblem._id,
        code,
        language,
      }),
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
