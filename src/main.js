import Vue from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import router from "./router";
import Store from "electron-store";

Vue.config.productionTip = false;

Vue.prototype.$store = new Store();

const app = new Vue({
  vuetify,
  router,
  render: h => h(App)
}).$mount("#app");

const darkMode = Vue.prototype.$store.get("settings.darkMode");
app.$vuetify.theme.dark = darkMode ? darkMode : false;
