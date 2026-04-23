import { searchMovies, getMovieDetails } from './api.js';
import { debounce } from './utils.js';
import { saveLastSearch, getLastSearch, isFavorite, toggleFavorite, getFavorites } from './storage.js';
import * as UI from './ui.js';

let currentMovies = [];
let currentQuery = '';

const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const sortSelect = document.getElementById('sortSelect');
const typeSelect = document.getElementById('typeSelect');
const favoritesBtn = document.getElementById('favoritesBtn');
const homeBtn = document.getElementById('homeBtn');

let isShowingFavorites = false;

// Initialize the app
function init() {
    const lastSearch = getLastSearch();

    if (lastSearch && lastSearch.query) {
        searchInput.value = lastSearch.query;
        currentQuery = lastSearch.query;
        if (lastSearch.sortValue) {
            sortSelect.value = lastSearch.sortValue;
        }

        performSearch(lastSearch.query);
    } else {
        loadPopularMovies();
    }

    setupEventListeners();
}

// Setup all main event listeners
function setupEventListeners() {
    // Debounced input for real-time search
    const debouncedSearch = debounce((query) => {
        if (query.trim().length > 2) {
            performSearch(query);
        } else if (query.trim().length === 0) {
            UI.showEmptyState();
            currentMovies = [];
        }
    }, 600);

    searchInput.addEventListener('input', (e) => {
        debouncedSearch(e.target.value);
    });

    // Handle button click immediately (bypassing debounce)
    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query.length > 0) performSearch(query);
    });

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query.length > 0) performSearch(query);
        }
    });

    // Handle sorting
    sortSelect.addEventListener('change', () => {
        if (!isShowingFavorites) saveLastSearch(currentQuery, sortSelect.value);
        applySortAndRender();
    });

    // Handle type filtering
    typeSelect.addEventListener('change', () => {
        if (isShowingFavorites) {
            isShowingFavorites = false;
            favoritesBtn.classList.remove('active');
        }
        const query = searchInput.value.trim();
        if (query.length > 0) performSearch(query);
    });

    // Handle Favorites Button
    favoritesBtn.addEventListener('click', () => {
        isShowingFavorites = !isShowingFavorites;
        if (isShowingFavorites) {
            favoritesBtn.classList.add('active');
            showFavorites();
        } else {
            favoritesBtn.classList.remove('active');
            if (currentQuery) performSearch(currentQuery);
            else loadPopularMovies();
        }
    });

    // Handle Home Button
    if (homeBtn) {
        homeBtn.addEventListener('click', () => {
            isShowingFavorites = false;
            favoritesBtn.classList.remove('active');
            searchInput.value = '';
            currentQuery = '';
            localStorage.removeItem('cinesearch_last_search');
            loadPopularMovies();
        });
    }
}

// Core search logic
async function performSearch(query) {
    if (isShowingFavorites) {
        isShowingFavorites = false;
        favoritesBtn.classList.remove('active');
    }

    currentQuery = query;
    UI.showLoading();

    try {
        const type = typeSelect.value;
        const results = await searchMovies(query, type);
        currentMovies = results || [];

        saveLastSearch(query, sortSelect.value);

        if (currentMovies.length === 0) {
            UI.showError("No movies found. Try a different search term or category.");
        } else {
            applySortAndRender();
        }
    } catch (error) {
        UI.showError(error.message || "An error occurred while fetching data.");
    }
}

async function loadPopularMovies() {
    UI.showLoading();
    try {
        const movieTitles = ['Inception', 'Interstellar', 'Goodfellas', 'The Godfather'];
        const seriesTitles = ['Breaking Bad', 'Stranger Things', 'Friends', 'Game of Thrones'];

        const moviesRes = await Promise.all(
            movieTitles.map(async title => {
                const res = await searchMovies(title, 'movie');
                return res ? res[0] : null;
            })
        );

        const seriesRes = await Promise.all(
            seriesTitles.map(async title => {
                const res = await searchMovies(title, 'series');
                return res ? res[0] : null;
            })
        );

        UI.renderHomeSections(
            moviesRes.filter(Boolean),
            seriesRes.filter(Boolean),
            handleMovieClick,
            isFavorite,
            toggleFavorite
        );
    } catch (error) {
        console.error("Failed to load popular movies:", error);
        UI.showError("Could not load popular movies: " + error.message);
    }
}

function showFavorites() {
    currentMovies = getFavorites();
    if (currentMovies.length === 0) {
        UI.showError("You haven't added any favorites yet!");
    } else {
        applySortAndRender();
    }
}

// Sorting logic
function applySortAndRender() {
    const sortValue = sortSelect.value;
    let sortedMovies = [...currentMovies];

    if (sortValue === 'year-desc') {
        sortedMovies.sort((a, b) => parseInt(b.Year) - parseInt(a.Year));
    } else if (sortValue === 'year-asc') {
        sortedMovies.sort((a, b) => parseInt(a.Year) - parseInt(b.Year));
    }

    UI.renderMovies(sortedMovies, handleMovieClick, isFavorite, toggleFavorite);
}

// Handle clicking a movie card
async function handleMovieClick(imdbID) {
    UI.showModalLoading();

    try {
        const details = await getMovieDetails(imdbID);
        UI.renderMovieDetails(details);
    } catch (error) {
        UI.closeModal();
        alert(error.message || "Failed to load movie details.");
    }
}

// Start application
document.addEventListener('DOMContentLoaded', init);
