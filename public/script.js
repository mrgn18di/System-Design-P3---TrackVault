const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const searchResultsEl = document.getElementById("search-results");
const favoritesEl = document.getElementById("favorites");

console.log("TrackVault script loaded");

// Load favorites when page loads
window.addEventListener("DOMContentLoaded", () => {
  fetchFavorites();
});

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const term = searchInput.value.trim();
  if (!term) return;
  searchSongs(term);
});

async function searchSongs(term) {
  searchResultsEl.innerHTML = "<p>Loading...</p>";

  try {
    const res = await fetch(`/api/search?term=${encodeURIComponent(term)}`);
    if (!res.ok) throw new Error("Network error");

    const data = await res.json();
    console.log("Search results:", data);

    if (!Array.isArray(data) || data.length === 0) {
      searchResultsEl.innerHTML = "<p>No results found.</p>";
      return;
    }

    searchResultsEl.innerHTML = "";
    data.forEach((song) => {
      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <img src="${song.artworkUrl}" alt="${song.title}" />
        <div class="card-info">
          <h3>${song.title}</h3>
          <p>${song.artist}</p>
          ${
            song.previewUrl
              ? `<audio controls src="${song.previewUrl}"></audio>`
              : ""
          }
        </div>
        <button class="add-btn">Add to Favorites</button>
      `;

      const addBtn = card.querySelector(".add-btn");
      addBtn.addEventListener("click", () => addFavorite(song));

      searchResultsEl.appendChild(card);
    });
  } catch (err) {
    console.error("Error in searchSongs:", err);
    searchResultsEl.innerHTML = "<p>Error loading results.</p>";
  }
}

async function fetchFavorites() {
  favoritesEl.innerHTML = "<p>Loading...</p>";

  try {
    const res = await fetch("/api/favorites");
    const data = await res.json();
    console.log("Favorites:", data);

    if (!Array.isArray(data) || data.length === 0) {
      favoritesEl.innerHTML = "<p>No favorites yet.</p>";
      return;
    }

    favoritesEl.innerHTML = "";
    data.forEach((song) => {
      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <img src="${song.artworkUrl}" alt="${song.title}" />
        <div class="card-info">
          <h3>${song.title}</h3>
          <p>${song.artist}</p>
          ${
            song.previewUrl
              ? `<audio controls src="${song.previewUrl}"></audio>`
              : ""
          }
        </div>
        <button class="delete-btn">Remove</button>
      `;

      const deleteBtn = card.querySelector(".delete-btn");
      deleteBtn.addEventListener("click", () => deleteFavorite(song._id));

      favoritesEl.appendChild(card);
    });
  } catch (err) {
    console.error("Error fetching favorites:", err);
    favoritesEl.innerHTML = "<p>Error loading favorites.</p>";
  }
}

async function addFavorite(song) {
  try {
    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(song),
    });
    if (!res.ok) throw new Error("Failed to add favorite");
    fetchFavorites();
  } catch (err) {
    console.error("Error adding favorite:", err);
  }
}

async function deleteFavorite(id) {
  try {
    const res = await fetch(`/api/favorites/${id}`, {
      method: "DELETE",
    });
    if (!res.ok && res.status !== 204) {
      throw new Error("Failed to delete favorite");
    }
    fetchFavorites();
  } catch (err) {
    console.error("Error deleting favorite:", err);
  }
}
