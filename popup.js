const toggleButton = document.getElementById("toggle");
const resetButton = document.getElementById("reset");
const tabState = document.getElementById("tab-state");
const trackingState = document.getElementById("tracking-state");
const activeTime = document.getElementById("active-time");
const idleTime = document.getElementById("idle-time");
const cursorCount = document.getElementById("cursor-count");

async function currentTabIsMeet() {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  return Boolean(tab?.url && tab.url.startsWith("https://meet.google.com/"));
}

function minutes(ms) {
  return `${Math.floor((ms || 0) / 60000)} min`;
}

async function render() {
  const data = await chrome.storage.local.get({
    enabled: false,
    totals: { activeMs: 0, idleMs: 0, cursorEvents: 0 }
  });
  const onMeet = await currentTabIsMeet();

  tabState.textContent = onMeet
    ? "Google Meet tab detected."
    : "Open a Google Meet tab to use this extension.";
  trackingState.textContent = data.enabled
    ? "Local tracking is ON."
    : "Tracking is off.";
  toggleButton.textContent = data.enabled ? "Stop local tracking" : "Start local tracking";
  toggleButton.disabled = !onMeet && !data.enabled;

  activeTime.textContent = minutes(data.totals.activeMs);
  idleTime.textContent = minutes(data.totals.idleMs);
  cursorCount.textContent = String(data.totals.cursorEvents || 0);
}

toggleButton.addEventListener("click", async () => {
  const { enabled = false } = await chrome.storage.local.get("enabled");
  await chrome.storage.local.set({ enabled: !enabled });
  await chrome.runtime.sendMessage({ type: "TRACKING_TOGGLE", enabled: !enabled });
  await render();
});

resetButton.addEventListener("click", async () => {
  await chrome.storage.local.set({
    totals: { activeMs: 0, idleMs: 0, cursorEvents: 0 },
    lastTick: Date.now()
  });
  await render();
});

chrome.storage.onChanged.addListener(render);
render();
