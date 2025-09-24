document.addEventListener("DOMContentLoaded", () => {
  // Add event listeners for header buttons
  document.getElementById("viewAppliedBtn").addEventListener("click", () => {
    location.href = 'list.html';
  });
  
  document.getElementById("clearAllBtn").addEventListener("click", clearWishlist);

  chrome.storage.local.get(["wishlistJobs"], (result) => {
      let wishlistJobs = result.wishlistJobs || {};
      let jobsList = document.getElementById("jobsList");
      
      let urls = Object.keys(wishlistJobs);
      if (urls.length === 0) {
        jobsList.innerHTML = '<div class="empty-state">No jobs in wishlist yet!</div>';
        return;
      }

      urls.sort((a, b) => new Date(wishlistJobs[b].date) - new Date(wishlistJobs[a].date));
      
      urls.forEach(url => {
        let job = wishlistJobs[url];
        let jobDiv = document.createElement("div");
        jobDiv.className = "job-item";
        jobDiv.innerHTML = `
          <div class="job-title">${job.title}</div>
          <div class="job-date">Added: ${job.date}</div>
          <div class="job-url"><a href="${url}" target="_blank">${url}</a></div>
          <div class="actions">
            <button data-url="${url}" class="remove-btn">Remove</button>
            <button data-url="${url}" class="apply-btn">Mark as Applied</button>
          </div>
        `;
        
        // Add event listeners to buttons
        const removeBtn = jobDiv.querySelector('.remove-btn');
        const applyBtn = jobDiv.querySelector('.apply-btn');
        
        removeBtn.addEventListener('click', () => removeFromWishlist(url));
        applyBtn.addEventListener('click', () => markAsApplied(url));
        
        jobsList.appendChild(jobDiv);
      });
    });
});

function removeFromWishlist(url) {
  console.log("Removing from wishlist:", url);
  chrome.storage.local.get(["wishlistJobs"], (result) => {
    let wishlistJobs = result.wishlistJobs || {};
    delete wishlistJobs[url];
    chrome.storage.local.set({ wishlistJobs }, () => {
      location.reload();
    });
  });
}

function markAsApplied(url) {
  console.log("Marking as applied:", url);
  chrome.storage.local.get(["appliedJobs", "wishlistJobs"], (result) => {
    let appliedJobs = result.appliedJobs || {};
    let wishlistJobs = result.wishlistJobs || {};
    
    appliedJobs[url] = {
      date: new Date().toLocaleString(),
      title: wishlistJobs[url].title
    };
    
    delete wishlistJobs[url];
    
    chrome.storage.local.set({ appliedJobs, wishlistJobs }, () => {
      location.reload();
    });
  });
}

function clearWishlist() {
  if (confirm("Are you sure you want to clear all wishlist jobs?")) {
    chrome.storage.local.set({ wishlistJobs: {} }, () => {
      location.reload();
    });
  }
}

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
