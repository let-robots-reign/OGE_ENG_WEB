import axios from 'axios';

class Api {
    constructor() {
        this.apiClient = axios.create({
            baseURL: process.env.VUE_APP_API_URL,
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

    getAudioTraining(topic) {
        return this.apiClient.get(`/training/audio?topic=${topic}`);
    }

    getReadingTraining(topic) {
        return this.apiClient.get(`/training/reading?topic=${topic}`);
    }

    getUoeTraining(topic) {
        return this.apiClient.get('/training/use-of-english' + ((topic) ? `?topic=${topic}` : ''));
    }

    checkTraining(category, answers) {
        return this.apiClient.post(`/training/${category}/check`, answers);
    }
}

export const API = new Api();
