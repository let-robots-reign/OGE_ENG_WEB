import {createLogger, createStore} from 'vuex';
import auth from './modules/auth.module';

const plugins = [];

if (process.env.NODE_ENV === 'development') {
  plugins.push(createLogger());
}

const store = createStore({
  plugins,
  modules: {
    auth
  }
});

export default store;
