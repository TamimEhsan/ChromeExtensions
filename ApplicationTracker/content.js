document.addEventListener("DOMContentLoaded", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = new URL(tab.url).href;

  chrome.storage.local.get(["appliedJobs"], (result) => {
    let appliedJobs = result.appliedJobs || {};
    let statusDiv = document.getElementById("status");
    let btn = document.getElementById("markBtn");

    // --- Current page check ---
    if (appliedJobs[url]) {
      statusDiv.innerHTML = `✅ Already applied here! <br>
              Applied on: ${appliedJobs[url].date}<br>
              (${getTimeBetween(appliedJobs[url].date)})`;
      btn.style.display = "none";
    } else {
      statusDiv.textContent = "❌ Not applied yet.";
      btn.style.display = "block";
      btn.onclick = () => {
        appliedJobs[url] = {
          date: new Date().toLocaleString(),
          title: document.title
        };
        chrome.storage.local.set({ appliedJobs }, () => {
          statusDiv.textContent = "✅ Marked as applied!";
          btn.style.display = "none";
        });
      };
    }
  });

  // --- Open list page ---
  document.getElementById("showAllBtn").onclick = () => {
    chrome.runtime.openOptionsPage();
  };
});

function getTimeBetween(dateString) {
  let pastDate = new Date(dateString);
  let now = new Date();
  let diffMs = now - pastDate;

  let diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays > 0) return `${diffDays} day(s) ago`;

  let diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours > 0) return `${diffHours} hour(s) ago`;

  let diffMinutes = Math.floor(diffMs / (1000 * 60));
  if (diffMinutes > 0) return `${diffMinutes} minute(s) ago`;

  return "Just now";
}