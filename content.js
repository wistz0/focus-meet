(() => {
  let lastSentAt = 0;
  const THROTTLE_MS = 5000;

  const recordActivity = () => {
    const now = Date.now();
    if (now - lastSentAt < THROTTLE_MS) return;
    lastSentAt = now;
    chrome.runtime.sendMessage({ type: "CURSOR_ACTIVITY" }).catch(() => {});
  };

  for (const eventName of ["mousemove", "keydown", "scroll", "pointerdown", "touchstart"]) {
    document.addEventListener(eventName, recordActivity, { passive: true });
  }
})();