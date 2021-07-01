import axios from 'axios';

class Api {
    constructor() {
        this.apiClient = axios.create({
            baseURL: 'http://localhost:8000/api/v1',
            withCredentials: true,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        });
    }

    signup(userData) {
        return this.apiClient.post('/signup', userData);
    }

    login(userData) {
        return this.apiClient.post('/login', userData);
    }

    logout() {
        return this.apiClient.post('/logout');
    }

    getCurrentUser() {
        return this.apiClient.get('/user');
    }
}

export const API = new Api();
