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

    getUserActivity() {
        return this.apiClient.get('/user/activity');
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

    getWritingTraining() {
        return this.apiClient.get('/training/writing');
    }

    checkTraining(category, answers) {
        return this.apiClient.post(`/training/${category}/check`, answers);
    }

    getTheoryArticlesByCategory(category) {
        return this.apiClient.get(`/theory/category/${category}`);
    }

    getTheoryArticleContent(id) {
        return this.apiClient.get(`/theory/${id}`);
    }

    createTheoryArticle(article) {
        return this.apiClient.post('/theory', article);
    }

    updateTheoryArticle(article, id) {
        return this.apiClient.put(`/theory/${id}`, article);
    }
}

export const API = new Api();
