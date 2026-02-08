const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)");

let _nextTimer = null;
let _active = false;

const clearSignals = () => {
  if (_nextTimer) {
    clearTimeout(_nextTimer);
    _nextTimer = null;
  }

  document.querySelectorAll(".diagram-lines path").forEach((path) => {
    path.classList.remove("signal");
    path.style.animationDuration = "";
    path.style.strokeDasharray = "";
    path.style.removeProperty('--dash');
    path.style.removeProperty('--gap');
    path.style.removeProperty('--sd-offset');
    path.style.removeProperty('--signal-duration');
    path.removeEventListener('animationend', _onAnimationEnd);
  });
  _active = false;
};

function _onAnimationEnd(e) {
  const path = e.currentTarget;
  path.classList.remove('signal');
  path.style.animationDuration = '';
  path.style.strokeDasharray = '';
  path.style.removeProperty('--dash');
  path.style.removeProperty('--gap');
  path.style.removeProperty('--sd-offset');
  path.style.removeProperty('--signal-duration');
  path.removeEventListener('animationend', _onAnimationEnd);
  _active = false;
  scheduleNext();
}

function fireOnce() {
  if (_active) return;
  const paths = Array.from(document.querySelectorAll('.diagram-lines path'));
  if (!paths.length) return;

  // choose a single random path
  const candidate = paths[Math.floor(Math.random() * paths.length)];
  _active = true;

  // traversal ~1–2s
  const duration = 1 + Math.random() * 1; // 1.0 - 2.0s
  const dash = 6 + Math.random() * 10; // small-ish dash
  const gap = 120 + Math.random() * 240; // gap controls travel distance

  candidate.style.strokeDasharray = `${Math.round(dash)} ${Math.round(gap)}`;
  candidate.style.setProperty('--dash', Math.round(dash));
  candidate.style.setProperty('--gap', Math.round(gap));
  candidate.style.setProperty('--sd-offset', Math.round(gap));
  candidate.style.setProperty('--signal-duration', `${duration.toFixed(2)}s`);

  candidate.addEventListener('animationend', _onAnimationEnd);
  // trigger one-shot animation by adding class
  // small random micro-delay to avoid mechanical timing
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      candidate.classList.add('signal');
    });
  });
}

function scheduleNext() {
  if (prefersReduced.matches) return;
  // mostly idle; next signal in ~4–20s
  const idle = 4000 + Math.random() * 16000;
  _nextTimer = setTimeout(() => {
    fireOnce();
  }, idle);
}

if (!prefersReduced.matches) {
  scheduleNext();
}

prefersReduced.addEventListener('change', (event) => {
  clearSignals();
  if (!event.matches) {
    scheduleNext();
  }
});
