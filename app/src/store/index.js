import {createStore} from 'vuex';

const store = createStore({
    state: {
        authenticated: false
    },
    mutations: {
        SET_AUTH: (state, auth) => state.authenticated = auth
    },
    actions: {
        setAuth: (context, auth) => context.commit('SET_AUTH', auth)
    },
    getters: {
        isAuthenticated: (state) => state.authenticated
    },
    modules: {}
});

export default store;
