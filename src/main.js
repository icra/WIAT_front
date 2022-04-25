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
Vue.prototype.$map_info = {
  latlng: [41.9672203, 2.8385181],
  zoom_level: 6
},
Vue.prototype.$layers_description = [
  {
    name: "Population",
    locked: false,
    children: [
      {
        name: "Population",
        locked: false,
        layer: {
          info: "<b> Temporal resolution: 2000</b>",
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
          url: "https://sedac.ciesin.columbia.edu/data/collection/gpw-v4/documentation",


        },
      },
    ]
  },
  {
    name: "Water quantity",
    locked: false,

    children: [
      {
        name: "Water availability",
        locked: false,

        children: [
          {
            name: "Water variability ",
            locked: false,

            children: [
              {
                name: "Seasonal variability",
                locked: false,

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
                  info: "Seasonal variability measures the average within-year variability of available water supply, including both renewable surface and groundwater supplies. <br><br><b> Temporal resolution: 2000</b>"
                }
              },
              {
                name: "Interannual variability",
                locked: false,

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
                  info: "Interannual variability measures the average between year variability of available water supply, including both renewable surface and groundwater supplies. Higher values indicate wider variations in available supply from year to year. <br><br><b> Temporal resolution: 1960-2014</b>"
                }
              },
            ]
          },
          {
            name: "Water supply",
            locked: false,

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
              info: "Water supply is the sum of total blue water, which is flow-accumulated runoff, and available blue water, which accounts for upstream consumptive use.  <br><br><b> Temporal resolution: 1950-2010</b>"
            },
          },
          {
            name: "Flow accumulation",
            locked: false,

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
              info: "Flow accumulation indicates the accumulated flow as the accumulated weight of all cells flowing into each downslope cell. It counts the amount of water in each cell due to precipitation-evaporation water budget. <br><br><b> Temporal resolution: N/A</b>"
            },
          },
          {
            name: "Streamflow",
            locked: false,

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
              info: "Streamflow is the volume of water flowing in one point, it considers the extraction of water for irrigation, livestock, domestic uses, manufacturing process and thermal power. <br><br><b> Temporal resolution: N/A</b>"
            },
          },

        ]
      },
      {
        name: "Water demand",
        locked: false,

        children: [
          {
            name: "Water demand",
            locked: false,

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
              info: "Water demand is measured as water withdrawals. It counts the water used in agriculture, industry and in a domestic use. <br><br><b> Temporal resolution: 1960-2014</b>"
            }
          },
        ]
      },
      {
        name: "Water scarcity ratios",
        locked: false,

        children: [
          {
            name: "Water stress",
            locked: false,

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
              info: "Water stress stress measures the ratio of total water withdrawals to available renewable surface and groundwater supplies. Water withdrawals include domestic, industrial, irrigation, and livestock consumptive and nonconsumptive uses. <br><br><b> Temporal resolution: 1960-2014</b>"
            },
          },
          {
            name: "Water depletion",
            locked: false,

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
              info: "Water depletion measures the ratio of total water consumption to available renewable water supplies. Total water consumption includes domestic, industrial, irrigation, and livestock consumptive uses. <br><br><b> Temporal resolution: 1960-2014</b>"
            },
          },
          {
            name: "Aridity index",
            locked: false,

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
              info: "Aridity index is a global climate data related to evapotranspiration processes and rainfall deficit for potential vegetative growth.  It provides information about the potential availability of water in regions with low water demand, thus they are used to better account for deserts and other arid areas in the risk assessment. <br><br><b> Temporal resolution: 1970-2000</b>"
            }
          },
        ]
      },
      {
        name: "Groundwater",
        locked: false,

        children: [
          {
            name: "Groundwater table decline",
            locked: false,

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
              info: "Groundwater table decline measures the average decline of the groundwater table as the average change for the period of study. <br><br><b> Temporal resolution: 1960-2014</b>"
            }
          },

        ]
      },
      {
        name: "Flood risk",
        locked: false,

        children: [
          {
            name: "Riverine flood risk",
            locked: false,

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
              info: "Riverine flood risk measures the percentage of population expected to be affected by Riverine flooding in an average year, accounting for existing flood-protection standards. <br><br><b> Temporal resolution: 2010</b>"
            }
          },
          {
            name: "Coastal flood risk",
            locked: false,

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
              info: "Coastal flood risk measures the percentage of the population expected to be affected by coastal flooding in an average year, accounting for existing flood protection standards. <br><br><b> Temporal resolution: 2010</b>"
            }
          },
        ]
      },
      {
        name: "Drought risk",
        locked: false,

        children: [
          {
            name: "Drought risk",
            locked: false,

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
              info: "Drought risk measures where droughts are likely to occur, the population and assets exposed, and the vulnerability of the population and assets to adverse effects. <br><br><b> Temporal resolution: 2000-2014</b>"
            }
          },
        ]
      }
    ]
  },
  {
    name: "Water quality",
    locked: false,

    children: [
      {
        name: "Pollution",
        locked: false,

        children: [
            {
          name: 'Coastal Eutrophication Potential',
              locked: false,

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
            info: "Coastal eutrophication potential (CEP) measures the potential for riverine loadings of nitrogen (N), phosphorus (P), and silica (Si) to stimulate harmful algal blooms in coastal waters. The CEP indicator is a useful metric to map where anthropogenic activities produce enough point-source and nonpoint-source pollution to potentially degrade the environment. <br><br><b> Temporal resolution: 2000</b>"
          }
        },
          {
            name: 'Surface Water Pharmaceutical Pollution',
            locked: false,

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
              info: "Surface Water Pharmaceutical Pollution Indicates the concentration of the Diclofenac on the rivers from domestic uses, it takes in count the population consumption, the in-stream attenuation, excretion, and the removal at sanitation facilities. <br><br><b> Temporal resolution: N/A</b>"
            }
          },
          {
            name: 'Coastal Pharmaceutical Pollution',
            locked: false,

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
              info: "Coastal Pharmaceutical Pollution Indicates the amount of Diclofenac exported by the rivers to the ocean. <br><br><b> Temporal resolution: N/A</b>"
            }
          },
          {
            name: 'Unimproved/No Drinking Water',
            locked: false,

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
              info: "Unimproved/no drinking water reflects the percentage of the population collecting drinking water from an unprotected dug well or spring, or directly from a river, dam, lake, pond, stream, canal, or irrigation canal. <br><br><b> Temporal resolution: 2015</b>"
            }
          },
          {
            name: 'Unimproved/No Sanitation',
            locked: false,

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
              info: "Unimproved/no sanitation reflects the percentage of the population using pit latrines without a slab or platform, hanging/bucket latrines, or directly disposing human waste in fields, forests, bushes, open bodies of water, beaches, other open spaces, or with solid waste. <br><br><b> Temporal resolution: 2015</b>"
            }
          },
        ]
      },
    ],
  },
  {
    name: "Reputational risk",
    locked: false,

    children: [
      {
        name: 'Peak RepRisk Country ESG Risk Index',
        locked: false,

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
          info: "The Peak RepRisk country ESG risk index quantifies business conduct risk exposure related to environmental, social, and governance (ESG) issues in the corresponding country. The index provides insights into potential financial, reputational, and compliance risks, such as human rights violations and environmental destruction. <br><br><b> Temporal resolution: 2016-2018</b>"
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
