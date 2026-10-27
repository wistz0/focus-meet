const DEFAULT_TOTALS = { activeMs: 0, idleMs: 0, cursorEvents: 0 };
const IDLE_THRESHOLD_SECONDS = 60;

async function getState() {
  return chrome.storage.local.get({
    enabled: false,
    totals: DEFAULT_TOTALS,
    lastTick: Date.now(),
    lastActivity: Date.now(),
    activeMeetTab: false
  });
}

async function isActiveMeetTab() {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  return Boolean(tab?.url && tab.url.startsWith("https://meet.google.com/"));
}

async function refreshTabState() {
  await chrome.storage.local.set({ activeMeetTab: await isActiveMeetTab() });
}

chrome.runtime.onInstalled.addListener(async () => {
  const state = await chrome.storage.local.get(["totals", "lastTick"]);
  await chrome.storage.local.set({
    enabled: false,
    totals: state.totals || DEFAULT_TOTALS,
    lastTick: state.lastTick || Date.now(),
    lastActivity: Date.now(),
    activeMeetTab: await isActiveMeetTab()
  });
  chrome.idle.setDetectionInterval(IDLE_THRESHOLD_SECONDS);
  chrome.alarms.create("account-time", { periodInMinutes: 0.25 });
});

chrome.tabs.onActivated.addListener(refreshTabState);
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.url || changeInfo.status === "complete") refreshTabState();
});
chrome.windows.onFocusChanged.addListener(refreshTabState);

chrome.idle.onStateChanged.addListener(async (state) => {
  await chrome.storage.local.set({ systemIdleState: state, lastActivity: Date.now() });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "TRACKING_TOGGLE") {
    chrome.storage.local.set({ enabled: Boolean(message.enabled), lastTick: Date.now() });
    sendResponse({ ok: true });
    return true;
  }

  if (message.type === "CURSOR_ACTIVITY") {
    (async () => {
      const state = await getState();
      if (!state.enabled || !sender.tab?.url?.startsWith("https://meet.google.com/")) return;
      const totals = { ...DEFAULT_TOTALS, ...state.totals };
      totals.cursorEvents += 1;
      await chrome.storage.local.set({ totals, lastActivity: Date.now() });
    })();
    sendResponse({ ok: true });
    return true;
  }
});

async function accountTime() {
  const state = await getState();
  const now = Date.now();
  const elapsed = Math.max(0, Math.min(now - state.lastTick, 15000));
  const onMeet = await isActiveMeetTab();
  const enabled = state.enabled && onMeet;
  const totals = { ...DEFAULT_TOTALS, ...state.totals };

  if (enabled) {
    const idle = Date.now() - state.lastActivity >= IDLE_THRESHOLD_SECONDS * 1000;
    if (idle) totals.idleMs += elapsed;
    else totals.activeMs += elapsed;
  }
  await chrome.storage.local.set({
    totals,
    lastTick: now,
    activeMeetTab: onMeet
  });
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "account-time") accountTime();
});
