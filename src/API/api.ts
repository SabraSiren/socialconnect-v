import axios from 'axios';
import type { AxiosInstance } from 'axios';

// Типизированный axios instance
const api: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

export default api;