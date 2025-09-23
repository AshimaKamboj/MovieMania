// ====== CONFIG ======
const apiKey = "2296f008"; // OMDb API key
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const movieResults = document.getElementById("movieResults");

// Surprise elements
const surpriseBtn = document.getElementById("surpriseBtn");
const surpriseContent = document.getElementById("surpriseContent");
const favSurpriseBtn = document.getElementById("favSurpriseBtn");
const viewDetailBtn = document.getElementById("viewDetailBtn");
const bsSurpriseModal = new bootstrap.Modal(document.getElementById("surpriseModal"));

// ====== LOCAL STORAGE HELPERS ======
function getFavorites() {
  return JSON.parse(localStorage.getItem("favorites") || "[]");
}
function saveFavorites(arr) {
  localStorage.setItem("favorites", JSON.stringify(arr));
}
function isFav(id) {
  return getFavorites().includes(id);
}
function toggleFav(id, btn) {
  let favs = getFavorites();
  const idx = favs.indexOf(id);

  if (idx === -1) {
    favs.push(id);
    saveFavorites(favs);
    alert("✅ Added to Favorites!");
  } else {
    favs.splice(idx, 1);
    saveFavorites(favs);
    alert("❌ Removed from Favorites");
  }
  if (btn) updateFavButton(id, btn);
}
function updateFavButton(id, btn) {
  if (isFav(id)) {
    btn.classList.remove("btn-danger");
    btn.classList.add("btn-outline-danger");
    btn.innerHTML = `<i class="fas fa-heart"></i>`;
  } else {
    btn.classList.remove("btn-outline-danger");
    btn.classList.add("btn-danger");
    btn.innerHTML = `<i class="far fa-heart"></i>`;
  }
}

// ====== FETCH MOVIES ======
async function fetchMovies(query) {
  try {
    movieResults.innerHTML = `<p class="text-center text-light">🔍 Searching...</p>`;
    const res = await fetch(`https://www.omdbapi.com/?s=${query}&apikey=${apiKey}`);
    const data = await res.json();

    if (data.Response === "True") {
      displayMovies(data.Search);
    } else {
      movieResults.innerHTML = `<p class="text-center text-danger">${data.Error}</p>`;
    }
  } catch (error) {
    movieResults.innerHTML = `<p class="text-center text-danger">⚠️ Something went wrong. Try again!</p>`;
    console.error(error);
  }
}

// ====== DISPLAY MOVIES ======
function displayMovies(movies) {
  movieResults.innerHTML = "";
  movies.forEach((movie) => {
    const col = document.createElement("div");
    col.className = "col-md-3 col-sm-6 fade-in";

    col.innerHTML = `
      <div class="card bg-dark text-light h-100 shadow position-relative">
        <img src="${
          movie.Poster !== "N/A"
            ? movie.Poster
            : "https://via.placeholder.com/300x450?text=No+Image"
        }" class="card-img-top" alt="${movie.Title}">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${movie.Title}</h5>
          <p class="card-text">Year: ${movie.Year}</p>
          <div class="mt-auto d-flex gap-2">
            <a href="movie.html?id=${movie.imdbID}" class="btn btn-danger w-100">View Details</a>
            <button class="btn ${isFav(movie.imdbID) ? "btn-outline-danger" : "btn-danger"} favBtn" data-id="${movie.imdbID}">
              <i class="${isFav(movie.imdbID) ? "fas" : "far"} fa-heart"></i>
            </button>
          </div>
        </div>
      </div>
    `;
    movieResults.appendChild(col);
  });

  // attach fav button handlers
  document.querySelectorAll(".favBtn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      toggleFav(id, btn);
    });
  });
}

// ====== EVENTS ======
searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (query) fetchMovies(query);
});
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const query = searchInput.value.trim();
    if (query) fetchMovies(query);
  }
});

// ====== SURPRISE ME FEATURE ======
const surpriseIDs = [
  "tt1375666","tt0468569","tt0816692","tt4154796","tt0111161",
  "tt0068646","tt0110912","tt0137523","tt0133093","tt0109830"
];

function pickRandomId() {
  return surpriseIDs[Math.floor(Math.random() * surpriseIDs.length)];
}

async function surpriseMe() {
  const id = pickRandomId();
  surpriseContent.innerHTML = `<div class="spinner-border text-danger" role="status"><span class="visually-hidden">Loading...</span></div>`;
  bsSurpriseModal.show();

  try {
    const res = await fetch(`https://www.omdbapi.com/?i=${id}&apikey=${apiKey}&plot=short`);
    const data = await res.json();
    if (data.Response === "True") {
      surpriseContent.innerHTML = `
        <div class="col-md-4">
          <img src="${data.Poster !== "N/A" ? data.Poster : 'https://via.placeholder.com/400x600?text=No+Image'}" class="img-fluid rounded" alt="${data.Title}">
        </div>
        <div class="col-md-8 text-start">
          <h3 class="fw-bold">${data.Title} <small class="text-muted">(${data.Year})</small></h3>
          <p><strong>Genre:</strong> ${data.Genre}</p>
          <p><strong>Director:</strong> ${data.Director}</p>
          <p><strong>IMDB Rating:</strong> ${data.imdbRating}/10</p>
          <p>${data.Plot}</p>
        </div>
      `;
      viewDetailBtn.href = `movie.html?id=${data.imdbID}`;
      favSurpriseBtn.dataset.id = data.imdbID;
    } else {
      surpriseContent.innerHTML = `<p class="text-danger">Could not load movie.</p>`;
    }
  } catch (err) {
    console.error(err);
    surpriseContent.innerHTML = `<p class="text-danger">Something went wrong.</p>`;
  }
}

surpriseBtn.addEventListener("click", surpriseMe);
favSurpriseBtn.addEventListener("click", () => {
  const id = favSurpriseBtn.dataset.id;
  if (id) toggleFav(id, favSurpriseBtn);
});
