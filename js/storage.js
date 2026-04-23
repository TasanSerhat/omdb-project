/**
 * Module for interacting with LocalStorage to persist search state.
 */

const STORAGE_KEY = 'cinesearch_last_search';

/**
 * Saves the last successful search query and sort preference to LocalStorage.
 * @param {string} query 
 * @param {string} sortValue 
 */
export function saveLastSearch(query, sortValue) {
    try {
        const data = { query, sortValue, timestamp: Date.now() };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.warn("Failed to save to localStorage", e);
    }
}

/**
 * Retrieves the last saved search query and sort preference.
 * @returns {Object|null}
 */
export function getLastSearch() {
    try {
        const item = localStorage.getItem(STORAGE_KEY);
        return item ? JSON.parse(item) : null;
    } catch (e) {
        console.warn("Failed to read from localStorage", e);
        return null;
    }
}

// --- Favorites Storage ---

const FAV_KEY = 'cinesearch_favorites';

export function getFavorites() {
    try {
        const item = localStorage.getItem(FAV_KEY);
        return item ? JSON.parse(item) : [];
    } catch (e) {
        return [];
    }
}

export function isFavorite(imdbID) {
    const favs = getFavorites();
    return favs.some(m => m.imdbID === imdbID);
}

export function toggleFavorite(movie) {
    let favs = getFavorites();
    const index = favs.findIndex(m => m.imdbID === movie.imdbID);

    if (index === -1) {

        favs.push({
            imdbID: movie.imdbID,
            Title: movie.Title,
            Year: movie.Year,
            Poster: movie.Poster
        });
    } else {
        favs.splice(index, 1);
    }

    try {
        localStorage.setItem(FAV_KEY, JSON.stringify(favs));
    } catch (e) {
        console.warn("Failed to save favorites", e);
    }

    return index === -1;
}

