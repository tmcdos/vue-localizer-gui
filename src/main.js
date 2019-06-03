import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import 'vuetify/src/stylus/app.styl'
import App from './App.vue'

Vue.config.performance = false;
Vue.config.productionTip = false;
Vue.use(Vuetify);
const myVue = new Vue({
  data:
    {
      modified: false,
    },
  render: h => h(App)
}).$mount('#app');

let myEvent = window.attachEvent || window.addEventListener;
let chkevent = window.attachEvent ? 'onbeforeunload' : 'beforeunload'; /// make IE7, IE8 compitable

myEvent(chkevent, function (e)
{
  // For >=IE7, Chrome, Firefox
  if (myVue.modified)
  {
    const confirmationMessage = 'There are unsaved changes. Are you sure to leave the page?'; // a space
    (e || window.event).returnValue = confirmationMessage;
    return confirmationMessage;
  }
});
