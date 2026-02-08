const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
let active = false;
let timer = null;

function firePulse() {
  if (active || prefersReduced.matches) return;

  const paths = document.querySelectorAll(".diagram-lines path");
  if (!paths.length) return;

  const path = paths[Math.floor(Math.random() * paths.length)];
  active = true;

  const length = path.getTotalLength();

  // Dash size: 20–30% of path (the "packet")
  const dashSize = length * (0.2 + Math.random() * 0.1);
  // Gap: make it large enough for the dash to traverse the full path
  const gapSize = length * 2.5;
  const speed = 1.5 + Math.random() * 0.8; // 1.5–2.3 seconds

  // Apply dash geometry BEFORE animation
  path.style.strokeDasharray = `${dashSize} ${gapSize}`;
  // Start: dash is off-screen to the left (negative offset)
  path.style.strokeDashoffset = -(dashSize + length * 0.5);

  // Force browser reflow to commit SVG state before animation
  void path.offsetWidth;

  // Expose calculated offsets to CSS keyframes
  path.style.setProperty("--dash-start", -(dashSize + length * 0.5));
  path.style.setProperty("--dash-end", length * 0.5);
  path.style.animationDuration = `${speed}s`;

  path.classList.add("signal");

  const cleanup = () => {
    path.classList.remove("signal");
    path.style.strokeDasharray = "";
    path.style.strokeDashoffset = "";
    path.style.animationDuration = "";
    path.style.removeProperty("--dash-start");
    path.style.removeProperty("--dash-end");
    path.removeEventListener("animationend", cleanup);
    active = false;
    scheduleNext();
  };

  path.addEventListener("animationend", cleanup, { once: true });
}

function scheduleNext() {
  const delay = 4000 + Math.random() * 16000;
  timer = setTimeout(firePulse, delay);
}

if (!prefersReduced.matches) {
  scheduleNext();
}

prefersReduced.addEventListener("change", (e) => {
  clearTimeout(timer);
  active = false;
  if (!e.matches) scheduleNext();
});
