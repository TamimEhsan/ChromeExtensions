document.addEventListener("DOMContentLoaded", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = new URL(tab.url).href;
  let pageTitle = tab?.title || "No Title";

  chrome.storage.local.get(["appliedJobs", "wishlistJobs"], (result) => {
    let appliedJobs = result.appliedJobs || {};
    let wishlistJobs = result.wishlistJobs || {};
    console.log("Applied Jobs:", appliedJobs);
    console.log("Wishlist Jobs:", wishlistJobs);
    let statusDiv = document.getElementById("status");
    let markBtn = document.getElementById("markBtn");
    let wishlistBtn = document.getElementById("wishlistBtn");

    // --- Current page check ---
    if (appliedJobs[url]) {
      statusDiv.innerHTML = `✅ Already applied here! <br>
              Applied on: ${appliedJobs[url].date}<br>
              (${getTimeBetween(appliedJobs[url].date)})`;
      markBtn.style.display = "none";
      wishlistBtn.style.display = "none";
    } else if (wishlistJobs[url]) {
      statusDiv.innerHTML = `💖 In wishlist! <br>
              Added on: ${wishlistJobs[url].date}<br>
              (${getTimeBetween(wishlistJobs[url].date)})`;
      markBtn.style.display = "block";
      wishlistBtn.textContent = "Remove from Wishlist";
      wishlistBtn.onclick = () => {
        delete wishlistJobs[url];
        chrome.storage.local.set({ wishlistJobs }, () => {
          statusDiv.textContent = "❌ Not applied yet.";
          wishlistBtn.textContent = "Add to Wishlist";
          setupWishlistButton();
        });
      };
    } else {
      statusDiv.textContent = "❌ Not applied yet.";
      markBtn.style.display = "block";
      wishlistBtn.style.display = "block";
      setupWishlistButton();
    }

    // --- Mark as applied button ---
    markBtn.onclick = () => {
      appliedJobs[url] = {
        date: new Date().toLocaleString(),
        title: pageTitle
      };
      
      // Remove from wishlist if it exists
      if (wishlistJobs[url]) {
        delete wishlistJobs[url];
      }
      
      chrome.storage.local.set({ appliedJobs, wishlistJobs }, () => {
        statusDiv.textContent = "✅ Marked as applied!";
        markBtn.style.display = "none";
        wishlistBtn.style.display = "none";
      });
    };

    function setupWishlistButton() {
      wishlistBtn.onclick = () => {
        wishlistJobs[url] = {
          date: new Date().toLocaleString(),
          title: pageTitle
        };
        chrome.storage.local.set({ wishlistJobs }, () => {
          statusDiv.innerHTML = `💖 Added to wishlist!`;
          wishlistBtn.textContent = "Remove from Wishlist";
          wishlistBtn.onclick = () => {
            delete wishlistJobs[url];
            chrome.storage.local.set({ wishlistJobs }, () => {
              statusDiv.textContent = "❌ Not applied yet.";
              wishlistBtn.textContent = "Add to Wishlist";
              setupWishlistButton();
            });
          };
        });
      };
    }
  });

  // --- Open pages ---
  document.getElementById("showAllBtn").onclick = () => {
    chrome.runtime.openOptionsPage();
  };

  document.getElementById("showWishlistBtn").onclick = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL("wishlist.html") });
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