const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
let activeCount = 0;
const maxConcurrent = 2;
let timer = null;

function firePulse() {
  if (activeCount >= maxConcurrent || prefersReduced.matches) return;

  const paths = document.querySelectorAll(".diagram-lines path");
  if (!paths.length) return;

  const path = paths[Math.floor(Math.random() * paths.length)];
  activeCount++;

  const length = path.getTotalLength();
  if (length <= 0) {
    activeCount--;
    scheduleNext();
    return;
  }

  // Get start point (10% along path)
  const startPt = path.getPointAtLength(length * 0.1);
  // Get end point (85% along path)
  const endPt = path.getPointAtLength(length * 0.85);

  const speed = 1.8 + Math.random() * 0.6; // 1.8–2.4 seconds

  // Clone a packet so multiple can animate at once
  const svg = document.querySelector(".diagram");
  const templatePacket = document.querySelector(".signal-packet");

  if (!svg || !templatePacket) {
    activeCount--;
    scheduleNext();
    return;
  }

  const packet = templatePacket.cloneNode(true);
  packet.classList.remove("pulse");
  svg.appendChild(packet);

  // Set CSS custom properties for the animation keyframes
  packet.style.setProperty("--tx-start", `${startPt.x}px`);
  packet.style.setProperty("--ty-start", `${startPt.y}px`);
  packet.style.setProperty("--tx-end", `${endPt.x}px`);
  packet.style.setProperty("--ty-end", `${endPt.y}px`);
  packet.style.setProperty("--duration", `${speed}s`);

  // Force reflow
  void packet.offsetWidth;

  packet.classList.add("pulse");

  const cleanup = () => {
    packet.removeEventListener("animationend", cleanup);
    packet.remove();
    activeCount--;
    scheduleNext();
  };

  packet.addEventListener("animationend", cleanup, { once: true });
}

function scheduleNext() {
  if (prefersReduced.matches) {
    clearTimeout(timer);
    return;
  }
  // Fire pulses more frequently for that "light pulsing" feel
  const delay = 1200 + Math.random() * 1800; // 1.2–3s between pulses
  timer = setTimeout(firePulse, delay);
}

if (!prefersReduced.matches) {
  scheduleNext();
}

prefersReduced.addEventListener("change", (e) => {
  clearTimeout(timer);
  activeCount = 0;
  if (!e.matches) scheduleNext();
});
