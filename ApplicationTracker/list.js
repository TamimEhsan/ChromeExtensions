document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(["appliedJobs"], (result) => {
    let appliedJobs = result.appliedJobs || {};
    let listDiv = document.getElementById("list");
    renderList(appliedJobs, listDiv);
  });
});

function renderList(appliedJobs, container) {
  container.innerHTML = "";
  let urls = Object.keys(appliedJobs);

  if (urls.length === 0) {
    container.textContent = "No jobs saved yet.";
    return;
  }

  urls.forEach((url) => {
    let job = appliedJobs[url];
    let div = document.createElement("div");
    div.className = "job";

    let infoDiv = document.createElement("div");
    infoDiv.className = "job-info";
    infoDiv.innerHTML = `
      <a href="${url}" target="_blank">${job.title || url}</a>
      <small>Applied: ${job.date}</small>
    `;

    let removeBtn = document.createElement("button");
    removeBtn.className = "remove-btn";
    removeBtn.textContent = "Remove";
    removeBtn.onclick = () => {
      delete appliedJobs[url];
      chrome.storage.local.set({ appliedJobs }, () => {
        renderList(appliedJobs, container);
      });
    };

    div.appendChild(infoDiv);
    div.appendChild(removeBtn);
    container.appendChild(div);
  });
}
