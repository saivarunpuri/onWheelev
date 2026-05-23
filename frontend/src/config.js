// Central API base URL
// In production this reads from Vite's env variable VITE_API_URL
// In local dev it falls back to localhost:5000
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default API;
