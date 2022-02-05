import {createApp} from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

import {library} from '@fortawesome/fontawesome-svg-core';
import {
  faUndo,
  faRedo,
  faAlignLeft,
  faAlignCenter,
  faAlignRight,
  faTable,
  faListUl,
  faListOl,
  faQuoteRight,
  faEdit
} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';

library.add(faUndo, faRedo, faAlignLeft, faAlignCenter, faAlignRight, faTable,
  faListUl, faListOl, faQuoteRight, faEdit);

createApp(App)
  .component('font-awesome-icon', FontAwesomeIcon)
  .use(store)
  .use(router)
  .mount('#app');
