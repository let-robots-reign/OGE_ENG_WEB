export default {
    namespaced: true,
    state: {
        user: null,
    },
    mutations: {
        setUser: (state, user) => state.user = user
    },
    getters: {
        user: (state) => state.user,
        isAuthenticated: (state) => state.user !== null,
        role: (state) => state.user?.role,
        username: (state) => state.user?.name
    }
};
