# Meet Focus — Local Session Tracker

A small Chrome Extension (Manifest V3) prototype for Google Meet. It is opt-in and records only aggregate activity totals locally in the browser.

## What it does

- Detects whether the active browser tab is on `meet.google.com`.
- Requires the user to click **Start local tracking**.
- Counts coarse active/idle time while tracking is enabled and a Meet tab is active.
- Counts throttled cursor-movement events on Meet pages.
- Stores totals in `chrome.storage.local`; there is no server, analytics endpoint, or account system.

## What it does not do

- Does not capture webcam frames, screenshots, audio, or meeting content.
- Does not infer gaze, emotion, attention, comprehension, or academic performance.
- Does not report to an instructor or administrator.
- Does not track outside Google Meet pages.

**Important:** Cursor movement and idle time are weak signals. A student may be listening, reading, taking notes on paper, or watching a presentation without moving the cursor. Do not use these metrics to grade students or make disciplinary decisions.

## Install locally

1. Download or clone this repository.
2. Open `chrome://extensions` in Chrome.
3. Enable **Developer mode**.
4. Select **Load unpacked** and choose this project folder.
5. Open a Google Meet tab, click the extension icon, and choose **Start local tracking**.

## Development

No build step or package manager is required. Edit the JavaScript/CSS/HTML files and press **Reload** on the extension card at `chrome://extensions`.

## Permissions

- `storage`: save session totals locally.
- `tabs`: determine whether the active tab is a Google Meet page.
- `idle`: classify browser-level idle state.
- `activeTab`: included for future user-triggered features; it is not currently required for the basic tracking flow.
- `alarms`: periodically update aggregate session time while the extension service worker is active.
- Host access to `https://meet.google.com/*`: run the cursor activity listener only on Meet pages.

## Privacy and consent

This prototype is designed for voluntary, visible use. Before any classroom rollout, provide clear notice, explain exactly what is collected and why, define retention, and obtain appropriate consent. Do not silently deploy it to students or treat its activity totals as proof of attention.

## Known prototype limitations

- Browser idle state and cursor activity are only rough proxies.
- The current popup displays aggregate totals for the current browser profile; it does not implement per-class sessions, export, remote dashboards, authentication, or instructor reporting.
- Chrome service workers can be suspended, so time totals are approximate and should be tested across sleep/wake and browser restart scenarios.
- This is a prototype, not a validated proctoring or learning-analytics product.

SIA ACTIVITY | Jan Christopher S. Villanueva | BSIT 3-1
