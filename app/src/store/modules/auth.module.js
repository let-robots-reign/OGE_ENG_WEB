export default {
    namespaced: true,
    state: {
        user: null,
    },
    mutations: {
        setUser: (state, user) => state.user = user
    },
    getters: {
        isAuthenticated: (state) => state.user !== null,
        role: (state) => state.user?.role,
        username: (state) => state.user?.name
    }
};
