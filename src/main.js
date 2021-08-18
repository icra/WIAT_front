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


Vue.prototype.$layers_description = {
  'Population': {
    layers: {
      baseline: {
        annual: {
          layer: null
        },
        monthly: []
      },
      future: {
        layer: null
      },
    },
    monthly: false,
    future: false,
    category: "Population indicators",
  },
  'Aridity index': {
    layers: {
      baseline: {
        annual: {
          layer: null
        },
        monthly: []
      },
      future: {
        layer: null
      },
    },
    monthly: false,
    future: false,
    category: "Quantity Risk",
  },
  'Water stress': {
    layers: {
      baseline: {
        annual: {
          layer: null
        },
        monthly: []
      },
      future: {
        layer: null
      },
    },
    monthly: true,
    future: true,
    category: "Quantity risk",
  },
  'Water depletion': {
    layers: {
      baseline: {
        annual: {
          layer: null
        },
        monthly: []
      },
      future: {
        layer: null
      },
    },
    monthly: true,
    future: false,
    category: "Quantity risk"
  },
  'Interannual variability': {
    layers: {
      baseline: {
        annual: {
          layer: null
        },
        monthly: []
      },
      future: {
        layer: null
      },
    },
    monthly: true,
    future: false,
    category: "Quantity risk"
  },
  'Seasonal variability': {
    layers: {
      baseline: {
        annual: {
          layer: null
        },
        monthly: []
      },
      future: {
        layer: null
      },
    },
    monthly: false,
    future: true,
    category: "Quantity risk"
  },
  'Groundwater table decline': {
    layers: {
      baseline: {
        annual: {
          layer: null
        },
        monthly: []
      },
      future: {
        layer: null
      },
    },
    monthly: false,
    future: false,
    category: "Quantity risk"
  },
  'Riverine flood risk': {
    layers: {
      baseline: {
        annual: {
          layer: null
        },
        monthly: []
      },
      future: {
        layer: null
      },
    },
    monthly: false,
    future: false,
    category: "Flood risk"
  },
  'Coastal flood risk': {
    layers: {
      baseline: {
        annual: {
          layer: null
        },
        monthly: []
      },
      future: {
        layer: null
      },
    },
    monthly: false,
    future: false,
    category: "Flood risk"
  },
  'Drought risk': {
    layers: {
      baseline: {
        annual: {
          layer: null
        },
        monthly: []
      },
      future: {
        layer: null
      },
    },
    monthly: false,
    future: false,
    category: "Drought risk"
  },
  'Coastal Eutrophication Potential': {
    layers: {
      baseline: {
        annual: {
          layer: null
        },
        monthly: []
      },
      future: {
        layer: null
      },
    },
    monthly: false,
    future: false,
    category: "Water quality"
  },
  'Unimproved/No Drinking Water': {
    layers: {
      baseline: {
        annual: {
          layer: null
        },
        monthly: []
      },
      future: {
        layer: null
      },
    },
    monthly: false,
    future: false,
    category: "Reputational risk"
  },
  'Unimproved/No Sanitation': {
    layers: {
      baseline: {
        annual: {
          layer: null
        },
        monthly: []
      },
      future: {
        layer: null
      },
    },
    monthly: false,
    future: false,
    category: "Reputational risk"
  },
  'Peak RepRisk Country ESG Risk Index': {
    layers: {
      baseline: {
        annual: {
          layer: null
        },
        monthly: []
      },
      future: {
        layer: null
      },
    },
    monthly: false,
    future: false,
    category: "Reputational risk"
  },


}




new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')
