const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)");

const applySignals = () => {
  const paths = Array.from(document.querySelectorAll(".diagram-lines path"));
  if (!paths.length) return;

  const count = Math.min(4, Math.max(2, Math.floor(paths.length / 6)));
  const shuffled = paths.sort(() => Math.random() - 0.5);

  shuffled.slice(0, count).forEach((path) => {
    path.classList.add("pulse");
    const duration = 20 + Math.random() * 12;
    const delay = 4 + Math.random() * 12;
    const dash = 10 + Math.random() * 8;
    const gap = 220 + Math.random() * 120;

    path.style.animationDuration = `${duration.toFixed(1)}s`;
    path.style.animationDelay = `${delay.toFixed(1)}s`;
    path.style.strokeDasharray = `${dash.toFixed(0)} ${gap.toFixed(0)}`;
  });
};

const clearSignals = () => {
  document.querySelectorAll(".diagram-lines path").forEach((path) => {
    path.classList.remove("pulse");
    path.style.animationDuration = "";
    path.style.animationDelay = "";
    path.style.strokeDasharray = "";
  });
};

if (!prefersReduced.matches) {
  applySignals();
}

prefersReduced.addEventListener("change", (event) => {
  clearSignals();
  if (!event.matches) {
    applySignals();
  }
});
