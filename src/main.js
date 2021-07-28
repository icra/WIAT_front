import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'

Vue.config.productionTip = false

import "@/assets/global.css"

//Global variables
Vue.prototype.$assessments = []   //created assessments
Vue.prototype.$location_markers = []    //Location of the industries of the assessments to show on the map
Vue.prototype.$clicked_point = null    //Location of the point clicked on the map



new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')
