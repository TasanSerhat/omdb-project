/**
 * Module for interacting with the OMDB API.
 */

// TODO: Replace with your actual OMDB API key
const API_KEY = '7da83ac5'; 
const BASE_URL = 'https://www.omdbapi.com/';

/**
 * Searches for a list of movies by query string.
 * @param {string} query 
 * @returns {Promise<Array>} Array of movie objects
 */
export async function searchMovies(query, type = '') {
    try {
        let url = `${BASE_URL}?apikey=${API_KEY}&s=${encodeURIComponent(query)}`;
        if (type) {
            url += `&type=${encodeURIComponent(type)}`;
        }
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Network error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.Response === 'False') {
            throw new Error(data.Error);
        }
        
        return data.Search; // Returns array of minimal movie info
    } catch (error) {
        throw error;
    }
}

/**
 * Fetches full details for a specific movie by IMDB ID.
 * @param {string} id 
 * @returns {Promise<Object>} Detailed movie object
 */
export async function getMovieDetails(id) {
    try {
        const response = await fetch(`${BASE_URL}?apikey=${API_KEY}&i=${encodeURIComponent(id)}&plot=full`);
        if (!response.ok) {
            throw new Error(`Network error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.Response === 'False') {
            throw new Error(data.Error);
        }
        
        return data; // Returns full details (Director, Genre, Plot, etc.)
    } catch (error) {
        throw error;
    }
}
