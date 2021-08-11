export default {
    namespaced: true,
    state: {
        authenticated: false
    },
    mutations: {
        setAuth: (state, auth) => state.authenticated = auth
    },
    getters: {
        isAuthenticated: (state) => !!state.authenticated
    }
};
