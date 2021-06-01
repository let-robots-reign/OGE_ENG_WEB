import {createStore} from 'vuex';

const store = createStore({
    state: {
        authenticated: false
    },
    mutations: {
        SET_AUTH: (state, auth) => state.authenticated = auth
    },
    actions: {
        setAuth: ({commit}, auth) => commit('SET_AUTH', auth)
    },
    modules: {}
});

export default store;
