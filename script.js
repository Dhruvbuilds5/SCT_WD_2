const display = document.getElementById('display');
const startBtn = document.getElementById('startBtn');
const lapBtn = document.getElementById('lapBtn');
const resetBtn = document.getElementById('resetBtn');
const lapList = document.getElementById('lapList');
const emptyMsg = document.getElementById('emptyMsg');

let startTime = 0;      // the moment we pressed Start
let elapsed = 0;        // time counted so far (milliseconds)
let timerId = null;     // holds the running timer
let laps = [];          // saved lap times

// Turn milliseconds into 00:00.00 (or 00:00:00.00 after an hour)
function formatTime(ms) {
  const totalCs = Math.floor(ms / 10);
  const cs = totalCs % 100;
  const totalSec = Math.floor(totalCs / 100);
  const sec = totalSec % 60;
  const min = Math.floor(totalSec / 60) % 60;
  const hr = Math.floor(totalSec / 3600);

  const pad = n => String(n).padStart(2, '0');
  const base = `${pad(min)}:${pad(sec)}.${pad(cs)}`;
  return hr > 0 ? `${pad(hr)}:${base}` : base;
}

function updateDisplay() {
  elapsed = Date.now() - startTime;
  display.textContent = formatTime(elapsed);
}

function start() {
  startTime = Date.now() - elapsed;       // continue from where we paused
  timerId = setInterval(updateDisplay, 10);

  startBtn.textContent = 'Pause';
  startBtn.classList.add('pause');
  display.classList.add('running');
  lapBtn.disabled = false;
  resetBtn.disabled = false;
}

function pause() {
  clearInterval(timerId);
  timerId = null;
  updateDisplay();

  startBtn.textContent = 'Resume';
  startBtn.classList.remove('pause');
  display.classList.remove('running');
  lapBtn.disabled = true;
}

function toggleStartPause() {
  if (timerId === null) {
    start();
  } else {
    pause();
  }
}

function recordLap() {
  if (timerId === null) return;           // only works while running

  const previousTotal = laps.length ? laps[laps.length - 1].total : 0;
  laps.push({
    total: elapsed,
    split: elapsed - previousTotal        // time for just this lap
  });
  renderLaps();
}

function renderLaps() {
  lapList.innerHTML = '';
  emptyMsg.style.display = laps.length ? 'none' : 'block';

  // Work out fastest and slowest (only meaningful with 2+ laps)
  let fastest = null;
  let slowest = null;
  if (laps.length >= 2) {
    const splits = laps.map(l => l.split);
    fastest = Math.min(...splits);
    slowest = Math.max(...splits);
  }

  // Newest lap on top
  for (let i = laps.length - 1; i >= 0; i--) {
    const lap = laps[i];
    const li = document.createElement('li');

    if (lap.split === fastest) li.classList.add('fastest');
    if (lap.split === slowest) li.classList.add('slowest');

    li.innerHTML = `
      <span class="num">Lap ${i + 1}</span>
      <span class="split">${formatTime(lap.split)}</span>
      <span class="total">${formatTime(lap.total)}</span>
    `;
    lapList.appendChild(li);
  }
}

function reset() {
  clearInterval(timerId);
  timerId = null;
  elapsed = 0;
  laps = [];

  display.textContent = '00:00.00';
  startBtn.textContent = 'Start';
  startBtn.classList.remove('pause');
  display.classList.remove('running');
  lapBtn.disabled = true;
  resetBtn.disabled = true;
  renderLaps();
}

// Button clicks
startBtn.addEventListener('click', toggleStartPause);
lapBtn.addEventListener('click', recordLap);
resetBtn.addEventListener('click', reset);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    toggleStartPause();
  } else if (e.key.toLowerCase() === 'l') {
    recordLap();
  } else if (e.key.toLowerCase() === 'r' && !resetBtn.disabled) {
    reset();
  }
});

renderLaps();
// Gentle 3D tilt that follows the mouse (desktop only)
const windows = document.querySelectorAll('.window');

if (window.matchMedia('(hover: hover)').matches) {
  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    windows.forEach(w => {
      w.style.transform = `rotateY(${x * 5}deg) rotateX(${-y * 5}deg)`;
    });
  });
}