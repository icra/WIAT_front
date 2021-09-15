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


Vue.prototype.$layers_description = [
  {
    name: "Population",
    children: [
      {
        name: "Population",
        layer: {
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
          future: true
        },
      },
    ]
  },
  {
    name: "Water quantity",
    children: [
      {
        name: "Water availability",
        children: [
          {
            name: "Water variability ",
            children: [
              {
                name: "Seasonal variability",
                layer: {
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
                }
              },
              {
                name: "Interannual variability",
                layer: {
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
                }
              },
            ]
          },
          {
            name: "Water supply",
            layer: {
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
            },
          },
          {
            name: "Specific discharge",
            layer: {
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
            },
          },
        ]
      },
      {
        name: "water demand",
        children: [
          {
            name: "Water demand",
            layer: {
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
            }
          },
        ]
      },
      {
        name: "Water scarcity ratios",
        children: [
          {
            name: "Water stress",
            layer: {
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
            },
          },
          {
            name: "Water depletion",
            layer: {
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
            },
          },
          {
            name: "Aridity index",
            layer: {
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
            }
          },
        ]
      },
      {
        name: "Groundwater",
        children: [
          {
            name: "Groundwater table decline",
            layer: {
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
            }
          },

        ]
      },
      {
        name: "Flood risk",
        children: [
          {
            name: "Riverine flood risk",
            layer: {
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
            }
          },
          {
            name: "Coastal flood risk",
            layer: {
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
            }
          },
        ]
      },
      {
        name: "Drought risk",
        children: [
          {
            name: "Drought risk",
            layer: {
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
            }
          },
        ]
      }
    ]
  },
  {
    name: "Water quality",
    children: [
      {
        name: "Pollution",
        children: [{
          name: 'Coastal Eutrophication Potential',
          layer: {
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
          }
          },
          {
            name: 'Coastal Pharmaceutical Pollution',
            layer: {
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
            }
          },
          {
            name: 'Surface Water Pharmaceutical Pollution',
            layer: {
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
            }
          }

        ]
      },
    ],
  },
  {
    name: "Reputational risk",
    children: [
      {
        name: 'Peak RepRisk Country ESG Risk Index',
        layer: {
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
        }
      },
      {
        name: 'Unimproved/No Drinking Water',
        layer: {
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
        }
      },
      {
        name: 'Unimproved/No Sanitation',
        layer: {
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
        }
      },
    ]
  },


  /*'Population': {
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
    category: ["Population indicators"],
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
    category: ["Quantity Risk"],
  },
  'RUN-OFF': {
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
    category: ["Quantity Risk"],
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
    category: ["Quantity risk"],
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
    category: ["Quantity risk"]
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
    category: ["Quantity risk"]
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
    category: ["Quantity risk"]
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
    category: ["Quantity risk"]
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
    category: ["Flood risk"]
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
    category: ["Flood risk"]
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
    category: ["Drought risk"]
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
    category: ["Water quality"]
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
    category: ["Reputational risk"]
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
    category: ["Reputational risk"]
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
    category: ["Reputational risk"]
  },
  'Water supply': {
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
    category: ["-"]
  },
  'Water demand': {
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
    category: ["-"]
  },
  'Surface Water Pharmaceutical Pollution': {
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
    category: ["Water quality"]
  },
  'Coastal Pharmaceutical Pollution': {
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
    category: ["Water quality"]
  },*/
]




new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')
