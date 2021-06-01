class Api {
    constructor() {
        this.url = 'http://localhost:8000/api/v1';
    }

    async asyncRequest(url, method='GET', data=null) {
        const response = await fetch(url, {
            method: method,
            credentials: 'include',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data),
        });

        const responseData = await response.json();

        return {
            status: response.status,
            data: responseData
        };
    }

    signup(userData) {
        return this.asyncRequest(`${this.url}/signup`, 'POST', userData);
    }

    login(userData) {
        return this.asyncRequest(`${this.url}/login`, 'POST', userData);
    }
}

export const API = new Api();
