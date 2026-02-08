const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
let active = false;
let timer = null;

function firePulse() {
  if (active || prefersReduced.matches) return;

  const paths = document.querySelectorAll(".diagram-lines path:not(.pulse-overlay)");
  if (!paths.length) return;

  const originalPath = paths[Math.floor(Math.random() * paths.length)];
  active = true;

  const length = originalPath.getTotalLength();
  if (length <= 0) {
    active = false;
    scheduleNext();
    return;
  }

  // Clone the path so the pulse animates on top of the static trace
  const pulsePath = originalPath.cloneNode(true);
  pulsePath.classList.add("pulse-overlay");
  originalPath.parentNode.appendChild(pulsePath);

  // Dash size: ~25% of path length (the "head and tail" of the signal)
  const dashSize = length * 0.25;
  // Gap: large enough for the dash to traverse the entire path
  const gapSize = length * 2;

  // Offset calculations: dash travels from off-screen-left to off-screen-right
  const offsetStart = gapSize;        // Dash starts beyond left end
  const offsetEnd = -dashSize - length; // Dash ends beyond right end

  const speed = 1.8 + Math.random() * 0.6; // 1.8–2.4 seconds

  // Apply stroke geometry
  pulsePath.style.strokeDasharray = `${dashSize} ${gapSize}`;
  pulsePath.style.strokeDashoffset = offsetStart;

  // Expose to CSS animation
  pulsePath.style.setProperty("--offset-start", offsetStart);
  pulsePath.style.setProperty("--offset-end", offsetEnd);
  pulsePath.style.setProperty("--duration", `${speed}s`);

  // Force layout to commit stroke state before animation
  void pulsePath.offsetWidth;

  // Trigger animation
  pulsePath.classList.add("pulse-overlay"); // Ensure class is applied

  const cleanup = () => {
    pulsePath.removeEventListener("animationend", cleanup);
    pulsePath.remove();
    active = false;
    scheduleNext();
  };

  pulsePath.addEventListener("animationend", cleanup, { once: true });
}

function scheduleNext() {
  if (prefersReduced.matches) {
    clearTimeout(timer);
    return;
  }
  // Chain pulses immediately with minimal transition time
  const delay = 200 + Math.random() * 300; // 200-500ms before next pulse
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
