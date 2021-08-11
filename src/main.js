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
Vue.prototype.$assessment_active = []    //active assessments shown on map
Vue.prototype.$selected_layer = "None"
Vue.prototype.$layers = {
  'None': null,
  "Baseline population": null,
  "Baseline water depletion": null,
  "Baseline water stress": null
}




new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')
