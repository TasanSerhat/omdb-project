/**
 * Module for handling DOM manipulations and UI rendering.
 */

const movieGrid = document.getElementById('movieGrid');
const statusArea = document.getElementById('statusArea');
const controlsSection = document.getElementById('controlsSection');
const resultsCount = document.getElementById('resultsCount');

const homeView = document.getElementById('homeView');
const popularMoviesGrid = document.getElementById('popularMoviesGrid');
const popularSeriesGrid = document.getElementById('popularSeriesGrid');

const modalBackdrop = document.getElementById('movieModal');
const modalContent = document.getElementById('modalContent');
const modalCloseBtn = document.getElementById('modalCloseBtn');

export function showLoading() {
    if (homeView) homeView.style.display = 'none';
    if (movieGrid) movieGrid.style.display = 'grid';
    controlsSection.style.display = 'none';
    movieGrid.innerHTML = '';
    
    // Create 8 skeleton cards for loading state
    const skeletons = Array(8).fill(0).map(() => `
        <article class="skeleton-card">
            <div class="skeleton-poster"></div>
            <div class="skeleton-info">
                <div class="skeleton-line"></div>
                <div class="skeleton-line short"></div>
            </div>
        </article>
    `).join('');
    
    movieGrid.innerHTML = skeletons;
    statusArea.style.display = 'none';
}

export function showError(message) {
    if (homeView) homeView.style.display = 'none';
    if (movieGrid) movieGrid.style.display = 'grid';
    controlsSection.style.display = 'none';
    movieGrid.innerHTML = '';
    statusArea.style.display = 'flex';
    statusArea.innerHTML = `
        <div class="error-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="error-icon"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <h2>Oops!</h2>
            <p>${message}</p>
        </div>
    `;
}

export function showEmptyState() {
    if (homeView) homeView.style.display = 'none';
    if (movieGrid) movieGrid.style.display = 'grid';
    controlsSection.style.display = 'none';
    movieGrid.innerHTML = '';
    statusArea.style.display = 'flex';
    statusArea.innerHTML = `
        <div class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="empty-icon"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>
            <h2>Trending / Popular Choices</h2>
            <p>Loading popular movies...</p>
        </div>
    `;
}

function createMovieCard(movie, onClickMovie, isFavoriteFn, toggleFavoriteFn) {
    const card = document.createElement('article');
    card.className = 'movie-card';
    card.setAttribute('role', 'button');
    card.tabIndex = 0;
    
    const posterHTML = movie.Poster && movie.Poster !== 'N/A' 
        ? `<img src="${movie.Poster}" alt="${movie.Title} poster" class="movie-poster" loading="lazy">`
        : `<div class="movie-poster-fallback">No Poster Available</div>`;
        
    const isFav = isFavoriteFn ? isFavoriteFn(movie.imdbID) : false;
    const favClass = isFav ? 'fav-btn active' : 'fav-btn';
    const heartSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;

    card.innerHTML = `
        <div class="movie-poster-container">
            ${posterHTML}
            <button class="${favClass}" aria-label="Toggle Favorite" title="Toggle Favorite">
                ${heartSVG}
            </button>
        </div>
        <div class="movie-info">
            <h3 class="movie-title" title="${movie.Title}">${movie.Title}</h3>
            <span class="movie-year">${movie.Year}</span>
        </div>
    `;
    
    const favBtn = card.querySelector('.fav-btn');
    favBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (toggleFavoriteFn) {
            const isNowFav = toggleFavoriteFn(movie);
            favBtn.className = isNowFav ? 'fav-btn active' : 'fav-btn';
            favBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="${isNowFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;
        }
    });

    const handleClick = () => onClickMovie(movie.imdbID);
    card.addEventListener('click', handleClick);
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            if (e.target !== favBtn) {
                e.preventDefault();
                handleClick();
            }
        }
    });
    
    return card;
}

export function renderMovies(movies, onClickMovie, isFavoriteFn, toggleFavoriteFn) {
    if (homeView) homeView.style.display = 'none';
    if (movieGrid) movieGrid.style.display = 'grid';
    statusArea.style.display = 'none';
    controlsSection.style.display = 'flex';
    resultsCount.textContent = `Found ${movies.length} result${movies.length !== 1 ? 's' : ''}`;
    
    movieGrid.innerHTML = '';
    movies.forEach(movie => {
        movieGrid.appendChild(createMovieCard(movie, onClickMovie, isFavoriteFn, toggleFavoriteFn));
    });
}

export function renderHomeSections(moviesData, seriesData, onClickMovie, isFavoriteFn, toggleFavoriteFn) {
    if (homeView) homeView.style.display = 'block';
    if (movieGrid) movieGrid.style.display = 'none';
    controlsSection.style.display = 'none';
    statusArea.style.display = 'none';
    
    popularMoviesGrid.innerHTML = '';
    popularSeriesGrid.innerHTML = '';
    
    moviesData.forEach(m => popularMoviesGrid.appendChild(createMovieCard(m, onClickMovie, isFavoriteFn, toggleFavoriteFn)));
    seriesData.forEach(m => popularSeriesGrid.appendChild(createMovieCard(m, onClickMovie, isFavoriteFn, toggleFavoriteFn)));
}

// Modal functions
export function openModal() {
    modalBackdrop.classList.add('active');
    modalBackdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // prevent background scrolling
}

export function closeModal() {
    modalBackdrop.classList.remove('active');
    modalBackdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

export function showModalLoading() {
    modalContent.innerHTML = `
        <div style="padding: 3rem; width: 100%; display: flex; justify-content: center; align-items: center;">
            <div class="spinner"></div>
        </div>
    `;
    openModal();
}

export function renderMovieDetails(movie) {
    const posterHTML = movie.Poster && movie.Poster !== 'N/A' 
        ? `<img src="${movie.Poster}" alt="${movie.Title} poster" class="modal-poster">`
        : `<div class="modal-poster" style="display:flex; align-items:center; justify-content:center; color: #94a3b8;">No Poster</div>`;

    modalContent.innerHTML = `
        ${posterHTML}
        <div class="modal-info">
            <h2 class="modal-title">${movie.Title}</h2>
            <div class="modal-meta">
                <span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> ${movie.Year}</span>
                <span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> ${movie.Runtime}</span>
                <span>⭐ ${movie.imdbRating}</span>
                <span class="badge">${movie.Rated}</span>
            </div>
            
            <p class="modal-plot">${movie.Plot}</p>
            
            <div class="modal-details">
                <div class="detail-row">
                    <span class="detail-label">Genre</span>
                    <span class="detail-value">${movie.Genre}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Director</span>
                    <span class="detail-value">${movie.Director}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Writer</span>
                    <span class="detail-value">${movie.Writer}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Actors</span>
                    <span class="detail-value">${movie.Actors}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Awards</span>
                    <span class="detail-value">${movie.Awards}</span>
                </div>
            </div>
        </div>
    `;
}

// Setup Event Listeners for UI strictly
modalCloseBtn.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) {
        closeModal();
    }
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop.classList.contains('active')) {
        closeModal();
    }
});
