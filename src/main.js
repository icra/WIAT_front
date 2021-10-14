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
                  info: "Seasonal variability measures the average within-year variability of available water supply, including both renewable surface and groundwater supplies. "
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
                  info: "Interannual variability measures the average between year variability of available water supply, including both renewable surface and groundwater supplies. Higher values indicate wider variations in available supply from year to year."
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
              info: "Water supply is the sum of total blue water, which is flow-accumulated runoff, and available blue water, which accounts for upstream consumptive use.  "
            },
          },
          {
            name: "Flow accumulation",
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
            name: "Streamflow",
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
              info: "Streamflow is the volume of water flowing in one point, it considers the extraction of water for irrigation, livestock, domestic uses, manufacturing process and thermal power."
            },
          },

        ]
      },
      {
        name: "Water demand",
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
              info: "Water demand is measured as water withdrawals. It counts the water used in agriculture, industry and in a domestic use.  "
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
              info: "Water stress stress measures the ratio of total water withdrawals to available renewable surface and groundwater supplies. Water withdrawals include domestic, industrial, irrigation, and livestock consumptive and nonconsumptive uses. "
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
              info: "Water depletion measures the ratio of total water consumption to available renewable water supplies. Total water consumption includes domestic, industrial, irrigation, and livestock consumptive uses."
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
              info: "Aridity index is a global climate data related to evapotranspiration processes and rainfall deficit for potential vegetative growth.  It provides information about the potential availability of water in regions with low water demand, thus they are used to better account for deserts and other arid areas in the risk assessment. "
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
              info: "Groundwater table decline measures the average decline of the groundwater table as the average change for the period of study (1990–2014)."
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
              info: "Riverine flood risk measures the percentage of population expected to be affected by Riverine flooding in an average year, accounting for existing flood-protection standards. "
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
              info: "Coastal flood risk measures the percentage of the population expected to be affected by coastal flooding in an average year, accounting for existing flood protection standards. "
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
              info: "Drought risk measures where droughts are likely to occur, the population and assets exposed, and the vulnerability of the population and assets to adverse effects. "
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
            info: "Coastal eutrophication potential (CEP) measures the potential for riverine loadings of nitrogen (N), phosphorus (P), and silica (Si) to stimulate harmful algal blooms in coastal waters. The CEP indicator is a useful metric to map where anthropogenic activities produce enough point-source and nonpoint-source pollution to potentially degrade the environment. "
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
          info: "The Peak RepRisk country ESG risk index quantifies business conduct risk exposure related to environmental, social, and governance (ESG) issues in the corresponding country. The index provides insights into potential financial, reputational, and compliance risks, such as human rights violations and environmental destruction. "
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
]


new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')
