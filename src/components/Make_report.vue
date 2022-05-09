<template>
  <div style="height: 100%;" class="outer">

    <div v-if="is_there_any_industry_created" style="height: 100%;">
      <div>

        <v-row>
            <v-col cols="10">
              <v-tabs
                  id="main_tab"
                  v-model="main_tab"
              >
                <v-tabs-slider color="#b62373"></v-tabs-slider>
                <v-tab style="border-color: #b62373">INDUSTRIES</v-tab>
                <v-tab style="border-color: #b62373">EXTERNAL REPORTING</v-tab>
                <v-tab style="border-color: #b62373">EDIT INDUSTRY</v-tab>
                <v-tab style="border-color: #b62373">GLOBAL INDICATORS</v-tab>
                <v-tab style="border-color: #b62373">EXPORT</v-tab>
              </v-tabs>

            </v-col>
            <v-col>
              <v-select
                  class="select_asessment"
                  :items="assessments_with_industries"
                  label="Selected assessment"
                  color="#b62373"
                  v-model="selected_assessment"
                  item-text="assessment.name"
                  item-value="assessment.name"
                  item-disabled="disabled"
              ></v-select>

            </v-col>
          </v-row>


        <v-row style="height: 100%; margin-top: -40px" v-if="is_there_any_industry_created">
          <v-col cols="12" style="height: 100%">
            <template v-if="main_tab == 0" class="report" >
              <div style="width: 100%; height: 100%">
                <v-tabs-items v-model="tab" style="padding-bottom: 50px">
                  <v-tab-item
                      v-for="(assessment_name, idx) in assessment_names"
                      :key="assessment_name"
                  >
                    <br>
                    <v-card flat style="margin-left: 10px;">

                      <div>
                        <div class="instructions">
                          *Click at any row to see advanced information!
                        </div>
                        <v-data-table
                            class="simple_report_table"
                            :headers="simple_report_table.header"
                            :items="simple_report_table.value"
                            :item-class="itemRowBackground"
                            disable-pagination
                            :hide-default-footer="true"
                            style="border-color: #0AA44A"
                            @click:row="simpleTableRowClick"
                            :custom-sort="customSort"
                        >
                          <template v-slot:header.owr="{ header }">
                            {{ header.text }}

                            <v-tooltip bottom max-width="700px">
                              <template v-slot:activator="{ on, attrs }">
                                <v-icon
                                    small
                                    v-bind="attrs"
                                    v-on="on"
                                >mdi-information-outline</v-icon>
                              </template>
                              <span>
                                Overall water risk measures all water-related risks of an industry and all its suppliers, by aggregating all indicators from the Physical Quantity, Quality and Regulatory & Reputational Risk categories. Higher values indicate higher water risk.
                              </span>
                            </v-tooltip>


                          </template>

                          <template v-slot:no-data>
                            <v-progress-linear
                                indeterminate
                                color="#1C195B"
                            ></v-progress-linear>
                          </template>

                          <template v-slot:item.value="{ item }">
                            <v-tooltip bottom max-width="700px" v-if="item.info">
                              <template v-slot:activator="{ on, attrs }">
                                {{item.value}}
                                <v-icon
                                    color='#1C195B'
                                    style="padding-right: 10px"
                                    v-bind="attrs"
                                    v-on="on"
                                    size="18px"
                                >
                                  mdi-information-outline
                                </v-icon>
                              </template>
                              <span>{{ item.info }}</span>
                            </v-tooltip>
                            <span v-else>
                                    {{item.value}}
                                  </span>
                          </template>

                          <template
                              v-for="value in ['pollution_impact', 'freshwater_impact', 'carbon_impact', 'owr']"
                              v-slot:[`item.${value}`]="{ item }"
                          >
                            <template v-if="getSimpleReportColor(item, value) != null">
                              <v-tooltip bottom>
                                <template v-slot:activator="{ on, attrs }">
                                  <v-chip
                                      :color="getSimpleReportColor(item, value)[0]"
                                      dark
                                      :key="value"
                                      v-bind="attrs"
                                      v-on="on"
                                      text-color="#1c1c1b"
                                  >
                                    {{ item[value] }}
                                  </v-chip>
                                </template>
                                <span>{{ getSimpleReportColor(item, value)[1] }}</span>
                              </v-tooltip>
                            </template>
                            <template v-else>
                              <v-chip
                                  color="transparent"
                                  dark
                                  :key="value"
                                  text-color="#1c1c1b"
                                  class= "chip_no_hover"
                              >
                                {{ item[value] }}
                              </v-chip>
                            </template>
                          </template>

                        </v-data-table>
                      </div>

                    </v-card>
                  </v-tab-item>
                </v-tabs-items>
              </div>

            </template>
            <template v-else-if="main_tab == 1" class="report">
              <div style="padding-top: 20px">
                <div style="width: 90%; margin: auto">
                  <details>
                    <summary>
                      <span class="cdp_key">1.2B</span>
                      <span class="cdp_description">What are the total volumes of water withdrawn, discharged, and consumed
                                across all your operations, and how do these volumes compare to the previous
                                reporting year?
                      </span>
                    </summary>
                    <v-data-table
                        :headers="cdp_1_2_b.header"
                        :items="cdp_1_2_b.value"
                        disable-pagination
                        :hide-default-footer="true"
                        dense
                        style="padding: 20px 20px 20px 20px"

                    >

                      <template v-slot:no-data>
                        <v-progress-linear
                            indeterminate
                            color="#1C195B"
                        ></v-progress-linear>
                      </template>

                      <template v-slot:item.value="{ item }">
                        <v-tooltip bottom max-width="700px" v-if="item.info">
                          <template v-slot:activator="{ on, attrs }">
                                      <span>
                                        {{ item.value + " "}}
                                        <a target="_blank" :href="item.link_to">
                                        <span>
                                          {{ item.link_text}}
                                        </span>
                                        </a>
                                      </span>
                            {{" "}}

                            <v-icon
                                color='#1C195B'
                                style="padding-right: 10px"
                                v-bind="attrs"
                                v-on="on"
                                size="18px"
                            >
                              mdi-information-outline
                            </v-icon>
                          </template>
                          <span>{{ item.info }}</span>
                        </v-tooltip>
                        <span v-else>
                                    <span>
                                        {{ item.value + " "}}
                                        <a target="_blank" :href="item.link_to">
                                        <span>
                                          {{ item.link_text}}
                                        </span>
                                        </a>
                                      </span>
                                  </span>
                      </template>

                      <template
                          v-for="value in Object.keys(industries_aggregated)"
                          v-slot:[`item.${value}`]="{ item }"
                      >

                        <template v-if="getReportingColor(item, value) != null">
                          <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                              <v-chip
                                  :color="getReportingColor(item, value)[0]"
                                  dark
                                  :key="value"
                                  v-bind="attrs"
                                  v-on="on"
                                  text-color="#1c1c1b"
                              >
                                {{ item[value] }}
                              </v-chip>
                            </template>
                            <span>{{ getReportingColor(item, value)[1] }}</span>
                          </v-tooltip>
                        </template>
                        <template v-else>
                          <v-chip
                              color="transparent"
                              dark
                              :key="value"
                              text-color="#1c1c1b"
                              class= "chip_no_hover"
                          >
                            {{ item[value] }}
                          </v-chip>
                        </template>
                      </template>

                    </v-data-table>
                  </details>
                </div>
                <div style="width: 90%; margin: auto">
                  <details>
                    <summary>
                      <span class="cdp_key">{{external_indicators["cdp"]["5_1"]["key"]}}</span>
                      <span class="cdp_description">{{external_indicators["cdp"]["5_1"]["text"]}}</span>
                    </summary>
                    <v-data-table
                        :headers="cdp_5_1.header"
                        :items="cdp_5_1.value"
                        disable-pagination
                        :hide-default-footer="true"
                        dense
                        style="padding: 20px 20px 20px 20px"
                    >
                      <template v-slot:no-data>
                        <v-progress-linear
                            indeterminate
                            color="#1C195B"
                        ></v-progress-linear>
                      </template>
                    </v-data-table>
                  </details>
                </div>

              </div>
            </template>
            <template v-else-if="main_tab == 2" class="report" >

              <div style="width: 100%; height: 100%">
                <v-tabs-items v-model="tab" style="padding-bottom: 50px">
                  <v-tab-item
                      v-for="(assessment_name, assessment_idx) in assessment_names"
                      :key="assessment_name"
                  >
                    <br>
                    <v-card flat style="margin-left: 10px;">

                      <div>
                        <p class="side_menu_title">Select industry to edit</p>


                        <v-list dense>
                          <v-list-item-group
                              v-model="radio_industry_edit"
                              color="primary"
                          >
                            <v-row>
                              <v-col
                                  cols="4"
                                  v-for="n in created_assessments[tab].industries.length"
                                  :key="n-1"
                              >
                                <v-list-item>
                                  <v-list-item-icon>
                                    <v-icon>mdi-factory</v-icon>
                                  </v-list-item-icon>
                                  <v-list-item-content>
                                    <v-list-item-title v-text="created_assessments[tab].industries[n-1].name"></v-list-item-title>
                                  </v-list-item-content>

                                </v-list-item>
                              </v-col>


                            </v-row>
                          </v-list-item-group>
                        </v-list>
                        <v-btn  :to="{ name: 'edit_industry', params: {assessment_id: assessment_idx, industry_id: radio_industry_edit}}" tile color="#b62373" :disabled="radio_industry_edit == null">
                          EDIT INDUSTRY
                        </v-btn>

                      </div>

                    </v-card>
                  </v-tab-item>
                </v-tabs-items>
              </div>

            </template>
            <template v-else-if="main_tab == 3" class="report" >

              <div style="width: 100%; height: 100%">
                <v-tabs-items v-model="tab" style="padding-bottom: 0px">
                  <v-tab-item
                      v-for="(assessment_name, idx) in assessment_names"
                      :key="assessment_name"
                  >
                    <br>
                    <v-card flat style="margin-left: 10px;">

                      <div>

                        <p class="side_menu_title">Global indicators on industries and suppliers</p>
                        <div class="instructions_2">
                          *This step may require a some time, depending on the selected layers and the industries created
                        </div>
                        <v-row
                            class="pa-4"
                            justify="space-between"
                            style="padding-top: 25px !important;"
                        >
                          <v-col cols="4">
                            <v-radio-group v-model="radio_layers">
                              <v-radio
                                  :key="1"
                                  label="Select layers"
                                  :value="1"
                              ></v-radio>
                              <v-treeview
                                  :items="layer_tree"
                                  dense
                                  hoverable
                                  selectable
                                  selection-type="leaf"
                                  return-object
                                  v-model="selected_layers"
                                  open-on-click
                                  color="#1C195B"
                                  selected-color="#1C195B"
                                  style="padding-left: 15px"
                                  item-disabled="locked"
                              >
                              </v-treeview>
                              <v-radio
                                  :key="2"
                                  label="Layers used in the calculations"
                                  :value="2"
                                  style="padding-top: 5px"
                              ></v-radio>
                              <br>

                              <v-btn  tile color="#b62373" @click="apply_analysis_global_layers" :disabled="selected_layers.length == 0">
                                <div>
                                  APPLY ANALYSIS
                                </div>
                                <v-progress-circular
                                    v-show="loading_table"
                                    indeterminate
                                    color="white"
                                    :size="24"
                                    :width="3"
                                    style="padding-right: 50px"
                                ></v-progress-circular>


                              </v-btn>

                            </v-radio-group>

                          </v-col>
                          <v-divider vertical></v-divider>

                          <v-col
                              class="d-flex"
                              cols="8"
                          >
                            <div style="width: 100%">
                              <v-data-table
                                  :headers="layers_table.header"
                                  :items="layers_table.value"
                                  v-if="layers_table.header.length > 0"
                                  dense
                                  fixed-header
                                  height="55vh"
                                  disable-pagination
                                  :hide-default-footer="true"
                              >
                                <template v-slot:no-data>
                                  <v-progress-linear
                                      indeterminate
                                      color="#1C195B"
                                  ></v-progress-linear>
                                </template>
                                <template
                                    v-for="value in industry_and_supply_chain()"
                                    v-slot:[`item.${value}`]="{ item }"
                                >

                                  <template v-if="getGISLayerColor(item, value) != null">
                                    <v-tooltip bottom>
                                      <template v-slot:activator="{ on, attrs }">
                                        <v-chip
                                            :color="getGISLayerColor(item, value)[0]"
                                            dark
                                            :key="value"
                                            v-bind="attrs"
                                            v-on="on"
                                            text-color="#1c1c1b"
                                        >
                                          {{ item[value] }}
                                        </v-chip>
                                      </template>
                                      <span>{{ getGISLayerColor(item, value)[1] }}</span>
                                    </v-tooltip>
                                  </template>
                                  <template v-else>
                                    <v-chip
                                        color="transparent"
                                        dark
                                        :key="value"
                                        text-color="#1c1c1b"
                                        class= "chip_no_hover"
                                    >
                                      {{ item[value] }}
                                    </v-chip>
                                  </template>
                                </template>
                              </v-data-table>
                              <div
                                  class="text-h6 grey--text text--lighten-1 font-weight-light"
                                  style="align-self: center;"
                                  v-else
                              >
                                Select a layer and click the button "Apply analysis"
                              </div>
                            </div>

                          </v-col>
                        </v-row>


                      </div>

                    </v-card>
                  </v-tab-item>
                </v-tabs-items>
              </div>

            </template>
            <template v-else-if="main_tab == 4" class="report" >

              <div style="width: 100%; height: 100%">
                <v-tabs-items v-model="tab" style="padding-bottom: 50px">
                  <v-tab-item
                      v-for="(assessment_name, idx) in assessment_names"
                      :key="assessment_name"
                  >
                    <br>
                    <v-card flat style="margin-left: 10px;">

                      <div>

                        <v-row
                            class="pa-4"
                            justify="space-between"
                        >

                          <v-col cols="4">
                            <div>
                              <p class="side_menu_title">1) Select the assessments to include in the report</p>
                              <v-checkbox
                                  v-for="assessment in assessments_with_industries"
                                  v-model="selected_assessments"
                                  :label="assessment.assessment.name"
                                  :disabled="assessment.disabled"
                                  color="#1C195B"
                                  style="margin-left: 38px"
                                  :key="assessment.assessment.name"
                                  dense
                                  :value="assessment.assessment"
                              >

                              </v-checkbox>
                            </div>

                          </v-col>

                          <v-divider vertical></v-divider>

                          <v-col
                              cols="4"
                          >
                            <p class="side_menu_title">2) Select the global indicators to include in the report (optional)</p>
                            <div class="instructions_2">
                              *The more layers you select, the longer it takes to download the file.
                            </div>
                            <v-treeview
                                :items="layer_tree"
                                dense
                                hoverable
                                selectable
                                selection-type="leaf"
                                return-object
                                v-model="selected_layers_pdf"
                                open-on-click
                                color="#1C195B"
                                selected-color="#1C195B"
                            ></v-treeview>

                          </v-col>

                          <v-divider vertical></v-divider>

                          <v-col
                              class="text-center"
                              cols="4"
                          >
                            <div>
                              <v-btn block tile color="#b62373" @click="button_generate_pdf_clicked" :disabled="selected_industries.length === 0">
                                3) Download the report
                              </v-btn>
                              <v-progress-linear
                                  indeterminate
                                  rounded
                                  height="6"
                                  v-show="generating_pdf"
                                  color="#1C195B"

                              ></v-progress-linear>
                            </div>
                          </v-col>

                        </v-row>

                      </div>

                    </v-card>
                  </v-tab-item>
                </v-tabs-items>
              </div>

            </template>
          </v-col>
        </v-row>


      </div>

      <br>
      <div>

        <!--<PDFJSViewer class="center" v-show="selected_industries.length>0 && !generating_pdf" ref="make_pdf"/> -->
        <!--<div style="width: 700px; padding-top: -20px; margin-bottom: 20px; height: 0px">
          <canvas id="chart"></canvas>
        </div><!-->

      </div>

    </div>

    <div v-else>
      <p class="side_menu_title">Please create an industry first and fill in the required data to generate a report.</p>
    </div>

  </div>

</template>

<script>

let _ = require('lodash');
import pdfMake from 'pdfmake/build/pdfmake.min'
import Vue from "vue";
import {utils, metrics} from "../utils"
import standard_industrial_classification from "../standard_industrial_classification"
import external_indicators from "../external_indicators"

import colors from "../colors"
import risk_thereshold from "..//risk_categories"

export default {
  name: "Make_report",
  data() {
    return {
      loading_table: false,
      expanded: [],
      singleExpand: true,
      risk_categories: risk_thereshold,
      created_assessments: this.$assessments,  //Created assessments
      selected_industries: [],
      selected_assessments: [],
      doc: null,
      layers: Vue.prototype.$layers_description,
      generating_pdf: false,
      global_layers: utils.format_layer_description(Vue.prototype.$layers_description),
      //selected_layers: [Vue.prototype.$layers_description[1].children[0].children[3]], //layers included in the report (initially only streamflow)
      selected_layers: [], //layers included in the report (initially only streamflow)

      selected_layers_pdf: [], //layers included in the pdf report

      main_tab: 0,
      layers_table: {header: [], value: []},

      simple_report_table: {header: [], value: []},
      cdp_5_1: {header: [], value: []},
      cdp_1_2_b: {header: [], value: []},
      external_indicators: external_indicators,

      include_future: true,

      table_title: {
        global_warming_potential: {
          elec: "Electricity consumption",
          fuel: "Fuel engines",
          treatment: "Treatment",
          biogas: "Biogas",
          sludge: "Sludge management",
          reuse: "Water reuse transport",
          discharged: "Water discharged",
          total: "Total"
        },
        availability_quantity: {
          dilution_factor: "Dilution factor",
          recycled: "Recycled water factor",
          treated: "Treated water factor",
          consumption_available: "Consumption available ratio",
          specific_water_consumption: "Specific water consumption"
        },
        pollutants: {
          cod: "COD",
          tn: "TN",
          tp: "TP",
          diclo: "1,2-Dichloroethane",
          cadmium: "Cadmium",
          hexaclorobenzene: "Hexaclorobenzene",
          mercury: "Mercury",
          lead: "Lead",
          nickel: "Nickel",
          chloroalkanes: "Chloroalkanes",
          hexaclorobutadie: "Hexachlorobutadiene",
          nonylphenols: "Nonylphenols",
          tetrachloroethene: "Tetrachloroethene",
          tricloroetile: "Trichloroethylene",
          total: "Total"
        },
        simple_table: {
          quality_quantity: "Freshwater impact",
          dilution_factor: "Dilution factor",
          recycled: "Recycled water factor",
          treated: "Treated water factor",
          consumption_available: "Consumption available ratio",
          specific_water_consumption: "Specific water consumption",
          total_ghg: "GHG emissions from Wastewater",
          eutrophication: "Eutrophication potential",
          tu: "Toxic units in the effluent",
          delta_tu: "Increase in toxic units in the receiving water body after discharge",
          delta_eqs: "Increase of the concentration of the pollutants in the receiving water body after discharge (with respect to EQS)",
          avg_treatment_efficiency: "Percentage of treatment efficiency (compared to WWTP influent)",
          impact_biodiversity: "Impact on biodiversity and ecosystems",
          eqs: "Concentration of the pollutants in the effluent (with respect to EQS)",
          avg_influent_efficiency: "Percentage of treatment efficiency (compared to industry influent)",
          pollution: "Pollution impact",
          energy_used_text: "Energy used",
          ecotoxicology: "Ecotoxicology indicators"

        },
      },
      radio_layers: 2,
      radio_industry_edit: null,
      industry_clicked: null,
      selected_assessment: null,

    }

  },
  watch: {

    radio_layers: function(value){
      let _this = this
      if(value == 2){
        Vue.nextTick(async function () {
          _this.selected_layers.splice(0, _this.selected_layers.length, _this.layers[1].children[0].children[3])
        })
      }
    },
    selected_assessments: function (new_selected_assessments, old_value){
      if(new_selected_assessments.length > 0){
        this.selected_industries = []
        if (old_value.length == 0) this.tab = 0
        let _this = this
        new_selected_assessments.forEach(assessment => {
          assessment.industries.forEach(industry => {
            //Required items
            if(utils.is_industry_valid(industry)){
              _this.selected_industries.push({
                "industry": industry,
                "assessment": assessment,
                "name": industry.name
              })
            }
          })
        })
      }
      else {
        this.selected_industries = []
      }
    },
    /*
    selected_layers: async function () {
      let _this = this
      _this.layers_table = {header: [], value: []}
      _this.layers_table = await _this.generate_layers_table(_this.tab)

    },*/
    selected_assessment: async function () {
      let _this = this
      this.layers_table = {header: [], value: []}
      this.simple_report_table = {header: [], value: []}
      this.cdp_5_1 = {header: [], value: []}
      this.cdp_1_2_b = {header: [], value: []}


      Vue.nextTick(async function () {
        //Taules a mantenir
        _this.simple_report_table = await _this.generate_simple_report_table()
        _this.selected_layers.splice(0, _this.selected_layers.length)
        _this.radio_layers = null
        _this.main_tab = 0
        _this.cdp_5_1 = await _this.generate_cdp_5_1_table()
        _this.cdp_1_2_b = await _this.generate_cdp_1_2_b_table()

      })
    },
  },
  methods: {
    customSort(items, index, isDescending) {
      // The following is informations as far as I researched.
      // items: 'food' items
      // index: Enabled sort headers value. (black arrow status).
      // isDescending: Whether enabled sort headers is desc
      items.sort((a, b) => {
        let x1 = parseFloat(a[index[0]])
        let x2 = parseFloat(b[index[0]])
        if (isDescending[0]) {
          return x2 - x1;
        } else {
          return x1 - x2;
        }
      });
      return items
    },

    async apply_analysis_global_layers(){
      this.loading_table = true
      this.layers_table = {header: [], value: []}
      this.layers_table = await this.generate_layers_table(this.tab)
      this.loading_table = false
    },
    async generate_cdp_5_1_table() {
      let assessment = this.assessments_with_industries[this.tab]

      let header = [
        {
          text: 'Facility name',
          align: 'start',
          value: 'name',
        },
        { text: 'Country', value: 'country' },
        { text: 'Latitude', value: 'lat' },
        { text: 'Longitude', value: 'lng' },
        { text: 'Located in area of water stress', value: 'water_stress' },
        { text: 'Total water withdrawals at this facility (ML/yr)', value: 'withdrawals' },
        { text: 'Total water discharges at this facility (ML/yr)', value: 'discharges' },
        { text: 'Total water consumption at this facility (ML/yr)', value: 'consumption' },
      ]
      let value = []

      for (let industry of assessment.assessment.industries){

        let indicators = await metrics.cdp_5_1_indicators([industry], this.global_layers)

        value.push({
          name: industry.name,
          country: utils.get_country_code_from_coordinates(industry.location.lat, industry.location.lng),
          lat: industry.location.lat.toFixed(2),
          lng: industry.location.lng.toFixed(2),
          withdrawals: indicators["dis"],
          discharges: indicators["wd"],
          consumption: indicators["consumed"],
          water_stress: indicators["water_stress"],

        })
      }

      return {
        header, value
      }

    },

    async generate_cdp_1_2_b_table() {
      let assessment = this.assessments_with_industries[this.tab]

      let header = [
        { text: 'Water aspect', value: 'water_aspect' },
        { text: 'Volume (megaliters/year)', value: 'volume' },
      ]
      let value = []

      let indicators = metrics.cdp_1_2_b_indicators(assessment.assessment.industries)
      value.push({
        water_aspect: "Total withdrawals",
        volume: indicators.wd,
      })
      value.push({
        water_aspect: "Total discharges",
        volume: indicators.dis,
      })
      value.push({
        water_aspect: "Total consumption",
        volume: indicators.consumed,
      })

      return {
        header, value
      }

    },

    industry_and_supply_chain(){
      let industries = this.created_assessments[this.tab].industries.map(x => x.name)
      let sc = this.created_assessments[this.tab].industries.map(industry => {
        return industry.supply_chain.map(sc => {
          return sc.name+" (Supply chain of "+industry.name+")"
        })
      }).flat(2)
      return [...industries, ...sc]
    },

    itemRowBackground: function (item) {
      return item.value === this.table_title.simple_table.quality_quantity || item.value === this.table_title.simple_table.pollution || item.value === this.table_title.simple_table.total_ghg ? 'impact-style' : 'lever-style'
    },
    get_supply_chain(industry){
      let header = [
        {text: "Supply chain", value: "name"},
        {text: "Latitude", value: "lat"},
        {text: "Longitude", value: "lng"}
      ]

      let items = []

      industry.supply_chain.forEach(supply_chain => {
        items.push({
          name: supply_chain.name,
          lat: supply_chain.location.lat,
          lng: supply_chain.location.lng
        })
      })

      return {header, items}
    },

    getBase64ImageFromURL(url) {
      return fetch(url)
          .then((response) => response.blob())
          .then(
              (blob) =>
                  new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                  })
          );
    },
    return_avg_risk(factors){
      let factors_not_null = factors.filter(factor => factor != null && factor != "-").map(factor => factor[1])
      if(factors_not_null.length === 0) {
        return null
      }
      else if(factors_not_null.includes(risk_thereshold.impact_strings.vh)) {
        return risk_thereshold.impact_strings.vh
      }
      else if(factors_not_null.includes(risk_thereshold.impact_strings.h)) return risk_thereshold.impact_strings.h
      else if(factors_not_null.includes(risk_thereshold.impact_strings.m)) return risk_thereshold.impact_strings.m
      else if(factors_not_null.includes(risk_thereshold.impact_strings.l)) return risk_thereshold.impact_strings.l
      return null
    },

    simpleTableRowClick(item, row){


      //this.industry_clicked = this.industries_aggregated[item.value]
      //this.industry_info = true

      let assessment_index = this.tab
      let industry_index = this.created_assessments[assessment_index].industries.findIndex(x => x.name == item.value)


      this.$router.push({ name: 'statistics', params: {assessment_id: assessment_index.toString(), industry_id: industry_index.toString()}})



    },


    get_color(color){
      return color == null ? null : color[0]
    },

    industries_deleted(){ //An industry or assessment has been deleted

      let _this = this
      this.layers_table = {header: [], value: []}
      _this.radio_layers = 1
      //_this.main_tab = 0
      let firstIndexValid = _this.assessments_with_industries.findIndex(assessment => assessment.disabled == false)
      if(firstIndexValid >= 0) {
        this.selected_assessment = _this.assessments_with_industries[firstIndexValid].assessment.name
        Vue.nextTick(async function () {
          _this.simple_report_table = await _this.generate_simple_report_table()
          _this.cdp_5_1 = await _this.generate_cdp_5_1_table()
          _this.cdp_1_2_b = await _this.generate_cdp_1_2_b_table()
          _this.selected_layers.splice(0, _this.selected_layers.length)
          _this.radio_layers = null

        })
      }
    },

    getGISLayerColor(item, value){

      let equals = function(name1, name2){
        return name1 == name2 || name1 == name2 + " (BAU 2030)"
      }
      if (equals(item.layer, "Seasonal variability")){
        return this.risk_categories.seasonal_variability(item[value])
      }else if (equals(item.layer, "Interannual variability")){
        return this.risk_categories.interannual_variability(item[value])
      }else if (equals(item.layer, "Water stress")){
        return this.risk_categories.water_stress(item[value])
      }else if (equals(item.layer, "Water depletion")){
        return this.risk_categories.water_depletion(item[value])
      }else if (equals(item.layer, "Aridity index")){
        return this.risk_categories.aridity_index(item[value])
      }else if (equals(item.layer, "Groundwater table decline")){
        return this.risk_categories.groundwater_table_decline(item[value])
      }else if (equals(item.layer, "Riverine flood risk")){
        return this.risk_categories.riverine_flood_risk(item[value])
      }else if (equals(item.layer, "Coastal flood risk")){
        return this.risk_categories.coastal_flood_risk(item[value])
      }else if (equals(item.layer, "Drought risk")){
        return this.risk_categories.drought_risk(item[value])
      }else if (equals(item.layer, "Coastal eutrophication potential")){
        return this.risk_categories.coastal_eutrophication_potential(item[value])
      }else if (equals(item.layer, "Peak RepRisk Country ESG Risk Index")){
        return this.risk_categories.reprisk(item[value])
      }else if (equals(item.layer, "Unimproved/No Sanitation")){
        return this.risk_categories.no_sanitation(item[value])
      } else if (equals(item.layer, "Unimproved/No Drinking Water")){
        return this.risk_categories.no_drinking(item[value])
      }
    },

    getGISLayerColorPDF(layer, value){

      let equals = function(name1, name2){
        return name1 == name2 || name1 == name2 + " (BAU 2030)"
      }

      let ret = null

      if (equals(layer, "Seasonal variability")){
        ret =  this.risk_categories.seasonal_variability(value)
      }else if (equals(layer, "Interannual variability")){
        ret = this.risk_categories.interannual_variability(value)
      }else if (equals(layer, "Water stress")){
        ret = this.risk_categories.water_stress(value)
      }else if (equals(layer, "Water depletion")){
        ret = this.risk_categories.water_depletion(value)
      }else if (equals(layer, "Aridity index")){
        ret = this.risk_categories.aridity_index(value)
      }else if (equals(layer, "Groundwater table decline")){
        ret = this.risk_categories.groundwater_table_decline(value)
      }else if (equals(layer, "Riverine flood risk")){
        ret = this.risk_categories.riverine_flood_risk(value)
      }else if (equals(layer, "Coastal flood risk")){
        ret = this.risk_categories.coastal_flood_risk(value)
      }else if (equals(layer, "Drought risk")){
        ret = this.risk_categories.drought_risk(value)
      }else if (equals(layer, "Coastal eutrophication potential")){
        ret = this.risk_categories.coastal_eutrophication_potential(value)
      }else if (equals(layer, "Peak RepRisk Country ESG Risk Index")){
        ret = this.risk_categories.reprisk(value)
      }else if (equals(layer, "Unimproved/No Sanitation")){
        ret = this.risk_categories.no_sanitation(value)
      } else if (equals(layer, "Unimproved/No Drinking Water")){
        ret = this.risk_categories.no_drinking(value)
      }

      return ret == null ? null : ret[0]
    },

    getReportingColor(item, value) {
      if (item.value == "Effect of water withdrawal on the water body"){
        return this.risk_categories["withdrawal_effect"](item[value])
      } else if (item.value == "Effect of water discharges on the water body"){
        return this.risk_categories["discharge_effect"](item[value])
      }
    },

    getSimpleReportColor(item, value){
      if(value == "pollution_impact"){
        return this.risk_categories["pollution"](item["pollution_impact"])
      }else if(value == "freshwater_impact"){
        return this.risk_categories["pollution"](item["freshwater_impact"])
      }else if(value == "carbon_impact")
        return this.risk_categories["global_warming"](item["carbon_impact"])
      else if(value == "owr"){
        return this.risk_categories["owr"](item["owr"])
      }
      /*
      if (item.value == this.table_title.simple_table.quality_quantity){
        return this.risk_categories["quality_quantity"](item[value])
      }else if(item.value == this.table_title.simple_table.total_ghg){
        return this.risk_categories["global_warming"](item[value])
      }else if(item.value == this.table_title.simple_table.eutrophication){
        return this.risk_categories["eutrophication"](item[value])
      }else if (item.value == this.table_title.simple_table.tu){
        return this.risk_categories["ecotoxicity"](item[value])
      }
      else if (item.value == this.table_title.simple_table.impact_biodiversity){
        return this.risk_categories["impact_biodiversity"](item[value])
      } else if(item.value == this.table_title.simple_table.avg_treatment_efficiency){
        return this.risk_categories["treatment_efficiency"](item[value])
      } else if(item.value == this.table_title.simple_table.delta_tu){
        return this.risk_categories["delta_ecotoxicity"](item[value])
      }else if(item.value == this.table_title.simple_table.eqs){
        return this.risk_categories["eqs"](item[value])
      }else if(item.value == this.table_title.simple_table.delta_eqs){
        return this.risk_categories["delta_eqs"](item[value])
      }else if(item.value == this.table_title.simple_table.avg_influent_efficiency){
        return this.risk_categories["influent_treatment_efficiency"](item[value])
      }else if(item.value == this.table_title.simple_table.pollution){
        return this.risk_categories["pollution"](item[value])
      }*/
      return null
    },

    chunk(array, size){
      let R = [];
      for (let i = 0; i < array.length; i += size)
        R.push(array.slice(i, i + size));
      return R;
    },

    chooseColor(str){
      return Object.values(colors)[this.hashCode(str) % Object.values(colors).length]
    },

    hashCode(s) {
      let ADLER32 = require('adler-32');
      return ADLER32.str(s)
    },


    async generate_simple_report_table() {

      let _this = this

      if(_this.tab !== undefined){

        let pollutants_table = {
          header: [{text: "Name", value: "value", sortable: false}, {text: "Country", value: "country", sortable: false}, {text: "Number of suppliers", value: "supply_chain_number", sortable: true}, {text: "Pollution impact", value: "pollution_impact", sortable: false}, {text: "Freshwater impact", value: "freshwater_impact", sortable: false}, {text: "GHG emissions from Wastewater", value: "carbon_impact", sortable: true}, {text: "Overall water risk", value: "owr", sortable: true}],
          value: []
        }

        //let quality_quantity = {value: _this.table_title.simple_table.quality_quantity, unit: "-"}
        //let total_ghg = {value: _this.table_title.simple_table.total_ghg, unit: "kgCO2eq/day", info: "This metric indicates the CO2e emissions from the industry. It will always have positive values; higher values indicate higher impact."}
        //let pollution = {value: _this.table_title.simple_table.pollution, unit: "-"}

        for (let industry of this.created_assessments[this.tab].industries) {

          let key = industry.name
          let industries = [industry]

          let industry_row = {value: key}

          industry_row["country"] = utils.get_country_code_from_coordinates(industry.location.lat, industry.location.lng)
          industry_row["supply_chain_number"] = industry.supply_chain.length

          //calcular overall water index a partir d'una mitjana entre la industria i els seus suppliers
          let avg_owr = 0
          const locations = [industry.location, ...industry.supply_chain.map(x => x.location)]
          for (const location of locations){
            let owr = await utils.overall_water_risk(location.lat, location.lng)
            avg_owr += owr
          }
          avg_owr = avg_owr / locations.length
          industry_row["owr"] = avg_owr.toFixed(3)


          if(utils.is_industry_valid(industry)){

            let dilution_factor_value = await metrics.dilution_factor(this.global_layers, industries)
            let dilution_factor_risk = this.risk_categories["dilution_factor"](dilution_factor_value)

            let available_factor = await metrics.available_ratio(this.global_layers, industries)
            let available_factor_risk = this.risk_categories["water_stress_ratio"](available_factor)

            industry_row["freshwater_impact"] = this.return_avg_risk([dilution_factor_risk, available_factor_risk])
            industry_row["carbon_impact"] = metrics.emissions_and_descriptions(industries, 1).total

            let eutrophication_factor = metrics.eutrophication_potential(industries).total
            let eutrophication_risk = this.risk_categories["eutrophication"](eutrophication_factor)

            let ecotox_effluent_factor = metrics.ecotoxicity_potential_tu(industries).total
            let ecotox_effluent_risk = this.risk_categories["ecotoxicity"](ecotox_effluent_factor)

            let delta_ecotox_factor = (await metrics.delta_tu(industries, this.global_layers)).total
            let delta_ecotox_risk = this.risk_categories["delta_ecotoxicity"](delta_ecotox_factor)

            let eqs_factor = metrics.eqs_avg(industries)
            let eqs_risk = this.risk_categories["eqs"](eqs_factor)

            let delta_eqs_factor = await metrics.delta_eqs_avg(industries, this.global_layers)
            let delta_eqs_risk = this.risk_categories["delta_eqs"](delta_eqs_factor)

            industry_row["pollution_impact"] = this.return_avg_risk([eutrophication_risk, ecotox_effluent_risk, delta_ecotox_risk, eqs_risk, delta_eqs_risk])

          }else{

            industry_row["freshwater_impact"] = "-"
            industry_row["carbon_impact"] = "-"
            industry_row["pollution_impact"] = "-"
          }

          pollutants_table.value.push(industry_row)

        }


        return pollutants_table
      }
      else return {header: [], emissions: []}

    },


    async button_generate_pdf_clicked(){
      if (this.selected_industries.length > 0) {
        this.generating_pdf = true
        await this.generate_pdf()
        this.generating_pdf = false

      }
    },

    async generate_layers_table(current_tab){

      let selected_layers_formatted = this.selected_layers.map(function (layer) {
        return [layer.name, layer.layer]
      })

      let _this = this

      if(_this.tab !== undefined){

        let layer_table = {
          header: [{text: "Layer", value: "layer", sortable: false}],
          value: []
        }
        _this.layers_table = layer_table

        let industries_and_supply_chain = []

        this.created_assessments[_this.tab].industries.forEach(industry => {

          if(utils.is_industry_valid(industry)){

            industries_and_supply_chain.push({
              name: industry.name,
              location: industry.location
            })
            industry.supply_chain.forEach(sc => {
              industries_and_supply_chain.push({
                name: sc.name + " (Supply chain of "+industry.name+")",
                location: sc.location
              })
            })
          }
        })


        for (const industry of industries_and_supply_chain) {
          layer_table.header.push({text: industry.name, value: industry.name})
        }
        layer_table.header.push({text: "Unit", value: "unit"})

        for (let [layer_name, info] of selected_layers_formatted) {
          let current_layer = {layer: layer_name}
          let future_layer = {layer: layer_name + " (BAU 2030)"}


          for (let industry of industries_and_supply_chain) {

            if(current_tab != this.tab) {
              let table = await this.generate_layers_table(this.tab) //Generate table for new tab
              return table
            }

            let lat = industry.location.lat
            let lng = industry.location.lng

            //Baseline

            let baseline_data = await info.layers.baseline.annual.layer["data_for_report"](lat, lng)

            current_layer[industry.name] = baseline_data

            if (info.future && this.include_future) {
              let future_data = await info.layers.future.layer["data_for_report"](lat, lng)
              future_layer[industry.name] = future_data
            }

          }
          current_layer["unit"] = (info.layers.baseline.annual.layer["unit"]())
          layer_table.value.push(current_layer)

          if(info.future && this.include_future){
            future_layer["unit"] = (info.layers.future.layer["unit"]())
            layer_table.value.push(future_layer)

            //layers_description.table.body.push(future_layer)

          }

          //layer_table.value.push(current_layer)
        }
        return layer_table
      }
      else return {header: [], value: []}


    },

    add_identifier: function (category, id){
      let _this = this
      category.id = id
      category.locked = (_this.radio_layers === 2 || _this.radio_layers === null)
      id++

      if(category.hasOwnProperty("children")){
        category.children.forEach(subcategory => {
          id = _this.add_identifier(subcategory, id)
        })

      }

      return id
    },

    async layers_table_pdf(dd, industries, assessment_days){


      let selected_layers_formatted = this.selected_layers_pdf.map(function (layer) {
        return [layer.name, layer.layer]
      })

      if (selected_layers_formatted.length > 0) { //Layer values on industry

        dd.content.push({
          text: "Global GIS Indicators\n\n",
          style: 'indicator_title'
        })


        let layers_to_include_in_report = [] //Layers to include in report (even the future)
        for (let [layer_name, info] of selected_layers_formatted) {
          layers_to_include_in_report.push([layer_name, info.layers.baseline.annual.layer])
          if (info.future && this.include_future){
            layers_to_include_in_report.push([layer_name+" (BAU 2030)", info.layers.future.layer])
          }
        }

        let layers_chunked = this.chunk(layers_to_include_in_report, 7)
        for(let chunk of layers_chunked){
          let col_widths = []
          Array.from(Array(10).keys()).forEach(x => {
            col_widths.push("*")
          })
          let layers_description = {
            table: {
              widths:col_widths,
              body: [
                [
                  {text:'Industry', style: "bold"},
                ]
              ]
            }
          }
          for (let [layer_name, layer] of chunk) {
            let units = "("+layer["unit"]()+")"
            if (units == "()") units = ""
            if(units[1] == " ") units = " ("+units.substring(2)
            let text = layer_name + units
            layers_description.table.body[0].push({text:text, style: "bold"})
          }

          let industries_aux = [].concat(...industries.map(x => x[1]))
          for(const industry of industries_aux) {

            let lat = industry.location.lat
            let lng = industry.location.lng

            let row = [industry.name]
            for (let [layer_name, layer] of chunk) {
              //Baseline
              let baseline_data = await layer["data_for_report"](lat, lng)
              row.push({text: baseline_data, fillColor: this.getGISLayerColorPDF(layer_name, baseline_data)})

            }
            layers_description.table.body.push(row)

            //Adding rows for supply chain
            for(let supply_chain of industry.supply_chain){
              let lat = supply_chain.location.lat
              let lng = supply_chain.location.lng

              let row = [supply_chain.name + " (Supply chain of "+industry.name+")"]
              for (let [layer_name, layer] of chunk) {
                let baseline_data = await layer["data_for_report"](lat, lng)
                row.push({text: baseline_data, fillColor: this.getGISLayerColorPDF(layer_name, baseline_data)})

              }
              layers_description.table.body.push(row)
            }


          }

          dd.content.push(layers_description)

          dd.content.push("\n")
          this.risk_categories.legend_risk_pdf(dd)
          dd.content.push("\n\n")


        }

      }

    },

    emissions_table_pdf(dd, industries_aux, assessment_days) {

      let _this = this

      let days_factor = 1

      dd.content.push({
        text: "GHG emissions from Wastewater\n\n",
        style: 'indicator_title'
      })


      let industriesEmission = {
        table: {
          body: [
            [
              {text:'Industry', style: "bold"},
              {text:"Total (kgCO2eq/day)",style: "bold"},
              {text:'Electricity consumption (kgCO2eq/day)',style: "bold"},
              {text:'Fuel engines (kgCO2eq/day)',style: "bold"},
              {text:"Water treatment (kgCO2eq/day)",style: "bold"},
              {text:"Biogas (kgCO2eq/day)",style: "bold"},
              {text:"Sludge management (kgCO2eq/day)",style: "bold"},
              {text:"Water reuse transport (kgCO2eq/day)",style: "bold"},
              {text:"Water discharged (kgCO2eq/day)",style: "bold"},

            ]
          ]
        }
      }

      const data_chart = {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: []
        }]
      };


      for (const [key, industries] of industries_aux) {
        let total = 0
        let emissions = metrics.emissions_and_descriptions(industries, days_factor)
        let row = [key]

        row.push({text: emissions.total, style: "bold", fillColor: _this.get_color(this.risk_categories.global_warming(emissions.total))})
        row.push({text: emissions.elec, fillColor: _this.get_color(this.risk_categories.global_warming(emissions.elec))})
        row.push({text: emissions.fuel, fillColor: _this.get_color(this.risk_categories.global_warming(emissions.fuel))})
        row.push({text: emissions.treatment, fillColor: _this.get_color(this.risk_categories.global_warming(emissions.treatment))})
        row.push({text: emissions.biog, fillColor: _this.get_color(this.risk_categories.global_warming(emissions.biog))})
        row.push({text: emissions.slu, fillColor: _this.get_color(this.risk_categories.global_warming(emissions.slu))})
        row.push({text: emissions.reuse, fillColor: _this.get_color(this.risk_categories.global_warming(emissions.reuse))})
        row.push({text: emissions.disc, fillColor: _this.get_color(this.risk_categories.global_warming(emissions.disc))})


        industriesEmission.table.body.push(row)

        data_chart.datasets[0].data.push(total)
        data_chart.labels.push(row[0])
        data_chart.datasets[0].backgroundColor.push(this.chooseColor(row[0]))

      }

      //CHART
      const options = {
      animation: false,
      legend: {
        display: false
      },
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true
          },
          scaleLabel: {
            display: true,
            labelString: 'kgCO2eq emission'
          }
        }],
        xAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Industry'
          }
        }]
      }
    }
      /*const ctx = document.getElementById('chart');
      let chart = new Chart(ctx, {
        type: "bar",
        data: data_chart,
        options: options
      });*/

      dd.content.push(industriesEmission)
      dd.content.push("\n")
      this.risk_categories.legend_impact_pdf(dd)
      dd.content.push("\n\n")


      /*dd.content.push({
        image: chart.toBase64Image(),
        fit: [450, 450]
      })*/

    },

    async quality_quantity_indicators(dd, industries_aux, assessment_days) {

      let _this = this

      dd.content.push({
        text: "Freshwater impact\n\n",
        style: 'indicator_title'
      })


      let industriesIndicator = {
        table: {
          body: [
            [
              {text:'Industry', style: "bold"},
              {text:'Dilution factor (%)',style: "bold"},
              {text:'Recycled water factor (%)',style: "bold"},
              {text:"Treated water factor (%)",style: "bold"},
              {text:"Consumption available ratio (%)",style: "bold"},
              {text:"Specific water consumption (tonnes/m3)",style: "bold"},
            ]
          ]
        }
      }

      let data_chart = {
        labels: ["Recycled water factor", "Treated water factor", "Consumption available ratio"],
        datasets: []
      };

      for (const [key, industries] of industries_aux) {
        let row = [key]

        let dilution_factor_value = await metrics.dilution_factor(this.global_layers, industries)
        row.push( {text: dilution_factor_value, fillColor: _this.get_color(this.risk_categories.dilution_factor(dilution_factor_value))})
        let recycled_water_factor = metrics.recycled_water_factor(industries)
        row.push({text: recycled_water_factor })
        let treated_water_factor = metrics.treated_water_factor(industries)
        row.push({text: treated_water_factor})
        let available_ratio_value = await metrics.available_ratio(this.global_layers, industries)
        row.push({text: available_ratio_value, fillColor: _this.get_color(this.risk_categories.water_stress_ratio(available_ratio_value))})

        row.push({text: metrics.efficiency_factor(industries)})


        data_chart.datasets.push({
          data: [recycled_water_factor, metrics.treated_water_factor(industries), available_ratio_value],
          label: row[0],
          backgroundColor: this.chooseColor(key).concat("70"),
        })

        industriesIndicator.table.body.push(row)

      }

      //CHART
      const options = {
        animation: false,
        scale: {
          ticks: {
            min: 0
          }
        },
        "tooltips": {}
      }

      const ctx = document.getElementById('chart');
      /*let chart = new Chart(ctx, {
        type: "radar",
        data: data_chart,
        options: options
      });*/

      dd.content.push(industriesIndicator)
      dd.content.push("\n")
      this.risk_categories.legend_impact_pdf(dd)
      dd.content.push("\n\n")
      /*dd.content.push({
        image: chart.toBase64Image(),
        fit: [450, 450]
      })*/

    },

    eutrophication_pdf(dd, industries_aux, assessment_days) {

      let _this = this

      let days_factor = 1
      if(this.period_model === "annual") days_factor = 365
      else if(this.period_model === "assessment") days_factor = assessment_days

      dd.content.push({
        text: "Eutrophication Potential\n\n",
        style: 'subsubheader'
      })


      let industriesEutrophication = {
        table: {
          body: [
            [
              {text:'Industry', style: "bold"},
              {text:"Total (gPO4eq/m3)",style: "bold"},
              {text: "COD (gPO4eq/m3)" , style: "bold"},
              {text:'TN (gPO4eq/m3)',style: "bold"},
              {text:'TP (gPO4eq/m3)',style: "bold"},
            ]
          ]
        }
      }

      const data_chart = {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: []
        }]
      };


      for (const [key, industries] of industries_aux) {

        let eutrophication = metrics.eutrophication_potential(industries)
        let row = [key]

        let total_value = eutrophication.total
        row.push({text: total_value, style: "bold", fillColor: _this.get_color(this.risk_categories.eutrophication(total_value)),})

        let cod_value = eutrophication.cod
        row.push({text: cod_value, fillColor: _this.get_color(this.risk_categories.eutrophication(cod_value)),})

        let tn_value = eutrophication.tn
        row.push({text: tn_value, fillColor: _this.get_color(this.risk_categories.eutrophication(tn_value)),})

        let tp_value = eutrophication.tp
        row.push({text: tp_value, fillColor: _this.get_color(this.risk_categories.eutrophication(tp_value)),})


        industriesEutrophication.table.body.push(row)

        data_chart.datasets[0].data.push(total_value)
        data_chart.labels.push(row[0])
        data_chart.datasets[0].backgroundColor.push(this.chooseColor(row[0]))
      }

      //CHART
      const options = {
        animation: false,
        legend: {
          display: false
        },
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            },
            scaleLabel: {
              display: true,
              labelString: 'gPO4eq/m3'
            }
          }],
          xAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Industry'
            }
          }]
        }
      }
      const ctx = document.getElementById('chart');
      /*let chart = new Chart(ctx, {
        type: "bar",
        data: data_chart,
        options: options
      });*/

      dd.content.push(industriesEutrophication)
      dd.content.push("\n")
      _this.risk_categories.legend_impact_pdf(dd)
      dd.content.push("\n\n")
      /*dd.content.push({
        image: chart.toBase64Image(),
        fit: [450, 450]
      })*/

    },

    async ecotoxicity_pdf(dd, industries_aux, assessment_days) {

      let days_factor = 1

      let _this = this

      dd.content.push({
        text: "Effluent toxicity level\n\n",
        style: 'subheader_big'
      })

      dd.content.push({
        text: "Toxic units in the effluent\n\n",
        style: 'subsubheader'
      })

      let industriesEcotoxicity = {
        table: {
          body: [
            [
              {text:'Industry', style: "bold"},
              {text:"Total (TU/day)",style: "bold"},
              [
                {text: [{text: "1,2-DCE", style: "bold"}, {text: "1" , sup: true, style: "asterisk"},]},
                {text: "(TU/day)", style: "bold"},
              ], //1,2-Dichloroethane
              {text:'Cadmium (TU/day)',style: "bold"},
              [
                {text: [{text: "HBC", style: "bold"}, {text: "2" , sup: true, style: "asterisk"},]},
                {text: "(TU/day)", style: "bold"},
              ], //Hexachlorobenzene
              {text:"Mercury (TU/day)",style: "bold"},
              {text:"Lead (TU/day)",style: "bold"},
              {text:"Nickel (TU/day)",style: "bold"},
              {text:"Chloroalkanes (TU/day)",style: "bold"},
              [
                {text: [{text: "HCBD", style: "bold"}, {text: "3" , sup: true, style: "asterisk"},]},
                {text: "(TU/day)", style: "bold"},
              ], //Hexachlorobutadiene
              [
                {text: [{text: "NP", style: "bold"}, {text: "4" , sup: true, style: "asterisk"},]},
                {text: "(TU/day)", style: "bold"},
              ], //Nonylphenols
              [
                {text: [{text: "PCE", style: "bold"}, {text: "5" , sup: true, style: "asterisk"},]},
                {text: "(TU/day)", style: "bold"},
              ], //Tetrachloroethene
              [
                {text: [{text: "TCE", style: "bold"}, {text: "6" , sup: true, style: "asterisk"},]},
                {text: "(TU/day)", style: "bold"},
              ], //trichloroethylene

            ]
          ]
        }
      }

      const data_chart = {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: []
        }]
      };

      for (const [key, industries] of industries_aux) {

        let row = [key]
        let tu = metrics.ecotoxicity_potential_tu(industries)

        let total_value = tu.total
        row.push({text: total_value, style: "bold", fillColor: _this.get_color(this.risk_categories["ecotoxicity"](total_value))})

        let dichloroethane_value = tu.diclo
        row.push({text: dichloroethane_value, fillColor: _this.get_color(this.risk_categories["ecotoxicity"](dichloroethane_value))})

        let cadmium_value = tu.cadmium
        row.push({text: cadmium_value, fillColor: _this.get_color(this.risk_categories["ecotoxicity"](cadmium_value))})

        let hexaclorobenzene_value = tu.hexaclorobenzene
        row.push({text: hexaclorobenzene_value, fillColor: _this.get_color(this.risk_categories["ecotoxicity"](hexaclorobenzene_value))})

        let mercury_value = tu.mercury
        row.push({text: mercury_value, fillColor: _this.get_color(this.risk_categories["ecotoxicity"](mercury_value))})

        let lead_value = tu.lead
        row.push({text: lead_value, fillColor: _this.get_color(this.risk_categories["ecotoxicity"](lead_value))})

        let nickel_value = tu.nickel
        row.push({text: nickel_value, fillColor: _this.get_color(this.risk_categories["ecotoxicity"](nickel_value))})

        let chloroalkanes_value = tu.chloroalkanes
        row.push({text: chloroalkanes_value, fillColor: _this.get_color(this.risk_categories["ecotoxicity"](chloroalkanes_value))})

        let hexaclorobutadie_value = tu.hexaclorobutadie
        row.push({text: hexaclorobutadie_value, fillColor: _this.get_color(this.risk_categories["ecotoxicity"](hexaclorobutadie_value))})

        let nonylphenols_value = tu.nonylphenols
        row.push({text: nonylphenols_value, fillColor: _this.get_color(this.risk_categories["ecotoxicity"](nonylphenols_value))})

        let tetrachloroethene_value = tu.tetracloroetile
        row.push({text: tetrachloroethene_value, fillColor: _this.get_color(this.risk_categories["ecotoxicity"](tetrachloroethene_value))})

        let trichloroethylene_value = tu.tricloroetile
        row.push({text: trichloroethylene_value, fillColor: _this.get_color(this.risk_categories["ecotoxicity"](trichloroethylene_value))})


        industriesEcotoxicity.table.body.push(row)

        data_chart.datasets[0].data.push(total_value)
        data_chart.labels.push(row[0])
        data_chart.datasets[0].backgroundColor.push(this.chooseColor(row[0]))
      }

      //CHART
      const options = {
        animation: false,
        legend: {
          display: false
        },
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            },
            scaleLabel: {
              display: true,
              labelString: 'gPO4eq/m3'
            }
          }],
          xAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Industry'
            }
          }]
        }
      }
      const ctx = document.getElementById('chart');
      /*let chart = new Chart(ctx, {
        type: "bar",
        data: data_chart,
        options: options
      });*/

      dd.content.push(industriesEcotoxicity)
      dd.content.push("\n")

      dd.content.push("\n")
      dd.content.push([
        {text: [{text: "1", sup: true, style: "asterisk"}, {text:"1,2-Dichloroethane, "},
            {text: [{text: "2", sup: true, style: "asterisk"}, {text:"Hexachlorobenzene, "}]},
            {text: [{text: "3", sup: true, style: "asterisk"}, {text:"Hexachlorobutadiene, "}]},
            {text: [{text: "4", sup: true, style: "asterisk"}, {text:"Nonylphenols, "}]},
            {text: [{text: "5", sup: true, style: "asterisk"}, {text:"Tetrachloroethene, "}]},
            {text: [{text: "6", sup: true, style: "asterisk"}, {text:"Trichloroethylene"}]},
          ]},
      ])

      dd.content.push("\n")
      this.risk_categories.legend_impact_pdf(dd)
      dd.content.push("\n\n")
      /*dd.content.push({
        image: chart.toBase64Image(),
        fit: [450, 450]
      })*/

      this.eqs_pdf(dd, industries_aux)
      await this.delta_pdf(dd, industries_aux, assessment_days)

      await this.delta_tu_pdf(dd, industries_aux)
      await this.delta_eqs_pdf(dd, industries_aux)



    },

    async delta_pdf(dd, industries_aux, assessment_days) {

      let _this = this
      let days_factor = 1
      if(this.period_model === "annual") days_factor = 365
      else if(this.period_model === "assessment") days_factor = assessment_days

      dd.content.push({
        text: "Effluent toxicity level\n\n",
        style: 'subheader_big'
      })
      /*dd.content.push({
        text: "Pollution load to the environment \n\n",
        style: 'subsubheader'
      })*/


      let industriesDelta = {
        table: {
          body: [
            [
              {text:'Industry', style: "bold"},
              {text: "COD (g/m3)",style: "bold"},
              {text:"TN (g/m3)",style: "bold"},
              {text:"TP (g/m3)",style: "bold"},

              [
                {text: [{text: "1,2-DCE", style: "bold"}, {text: "1" , sup: true, style: "asterisk"}, {text: "(g/m3)", style: "bold"}]},

              ], //1,2-Dichloroethane
              {text:'Cadmium (g/m3)',style: "bold"},
              [
                {text: [{text: "HBC", style: "bold"}, {text: "2" , sup: true, style: "asterisk"}, {text: "(g/m3)", style: "bold"}]},

              ], //Hexachlorobenzene

              {text:"Mercury (g/m3)",style: "bold"},
              {text:"Lead (g/m3)",style: "bold"},
              {text:"Nickel (g/m3)",style: "bold"},
              {text:"Chloroalkanes (g/m3)",style: "bold"},
            ]
          ]
        },
      }

      let industriesDelta_1 = {
        table: {
          body: [
            [
              {text:'Industry', style: "bold"},
              [
                {text: [{text: "HCBD", style: "bold",}, {text: "3" , sup: true, style: "asterisk"}, {text: "(g/m3)", style: "bold"}]},

              ], //Hexachlorobutadiene
              [
                {text: [{text: "NP", style: "bold"}, {text: "4" , sup: true, style: "asterisk"}, {text: "(g/m3)", style: "bold"}]},

              ], //Nonylphenols
              [
                {text: [{text: "PCE", style: "bold"}, {text: "5" , sup: true, style: "asterisk"}, {text: "(g/m3)", style: "bold"}]},
              ], //Tetrachloroethene
              [
                {text: [{text: "TCE", style: "bold"}, {text: "6" , sup: true, style: "asterisk"}, {text: "(g/m3)", style: "bold"}]},
              ], //trichloroethylene
            ]
          ]
        }
      }



      for (const [key, industries] of industries_aux) {

        let row = [key]
        let row_1 = [key]

        let cod_value = await metrics.cod_effl(industries, this.global_layers)

        //row.push({text: total_value, fillColor: _this.get_color(this.risk_categories.delta_ecotoxicity(total_value)), style: "bold"})

        row.push({text: cod_value, fillColor: _this.get_color(this.risk_categories.delta(cod_value)), style: "bold"})

        let tn_value = await metrics.tn_effl(industries,this.global_layers)
        row.push({text: tn_value, fillColor: _this.get_color(this.risk_categories.delta(tn_value)), style: "bold"})

        let tp_value = await metrics.tp_effl(industries, this.global_layers)
        row.push({text: tp_value, fillColor: _this.get_color(this.risk_categories.delta(tp_value)), style: "bold"})

        let dichloroethane_value = await metrics.dichloroethane_effl(industries, this.global_layers)
        row.push({text: dichloroethane_value, fillColor: _this.get_color(this.risk_categories.delta(dichloroethane_value)), style: "bold"})

        let cadmium_value = await metrics.cadmium_effl(industries, this.global_layers)
        row.push({text: cadmium_value, fillColor: _this.get_color(this.risk_categories.delta(cadmium_value)), style: "bold"})

        let hexaclorobenzene_value = await metrics.hexaclorobenzene_effl(industries, this.global_layers)
        row.push({text: hexaclorobenzene_value, fillColor: _this.get_color(this.risk_categories.delta(hexaclorobenzene_value)), style: "bold"})

        let mercury_value = await metrics.mercury_effl(industries, this.global_layers)
        row.push({text: mercury_value, fillColor: _this.get_color(this.risk_categories.delta(mercury_value)), style: "bold"})

        let lead_value = await metrics.lead_effl(industries, this.global_layers)
        row.push({text: lead_value, fillColor: _this.get_color(this.risk_categories.delta(lead_value)), style: "bold"})

        let nickel_value = await metrics.nickel_effl(industries, this.global_layers)
        row.push({text: nickel_value, fillColor: _this.get_color(this.risk_categories.delta(nickel_value)), style: "bold"})

        let chloroalkanes_value = await  metrics.chloroalkanes_effl(industries, this.global_layers)
        row.push({text: chloroalkanes_value, fillColor: _this.get_color(this.risk_categories.delta(chloroalkanes_value)), style: "bold"})

        let hexaclorobutadie_value = await metrics.hexaclorobutadie_effl(industries,this.global_layers)
        row_1.push({text: hexaclorobutadie_value, fillColor: _this.get_color(this.risk_categories.delta(hexaclorobutadie_value)), style: "bold"})

        let nonylphenols_value = await metrics.nonylphenols_effl(industries, this.global_layers)
        row_1.push({text: nonylphenols_value, fillColor: _this.get_color(this.risk_categories.delta(nonylphenols_value)), style: "bold"})

        let tetrachloroethene_value = await metrics.tetrachloroethene_effl(industries, this.global_layers)
        row_1.push({text: tetrachloroethene_value, fillColor: _this.get_color(this.risk_categories.delta(tetrachloroethene_value)), style: "bold"})

        let trichloroethylene_value = await metrics.tricloroetile_effl(industries, this.global_layers)
        row_1.push({text: trichloroethylene_value, fillColor: _this.get_color(this.risk_categories.delta(trichloroethylene_value)), style: "bold"})


        industriesDelta.table.body.push(row)
        industriesDelta_1.table.body.push(row_1)

      }

      /*dd.content.push(industriesDelta)
      dd.content.push("\n")
      dd.content.push(industriesDelta_1)
      dd.content.push("\n")
      dd.content.push([
        {text: [{text: "1", sup: true, style: "asterisk"}, {text:"1,2-Dichloroethane, "},
            {text: [{text: "2", sup: true, style: "asterisk"}, {text:"Hexachlorobenzene, "}]},
            {text: [{text: "3", sup: true, style: "asterisk"}, {text:"Hexachlorobutadiene, "}]},
            {text: [{text: "4", sup: true, style: "asterisk"}, {text:"Nonylphenols, "}]},
            {text: [{text: "5", sup: true, style: "asterisk"}, {text:"Tetrachloroethene, "}]},
            {text: [{text: "6", sup: true, style: "asterisk"}, {text:"Trichloroethylene"}]},
          ]},
      ])
      dd.content.push("\n")
      _this.risk_categories.legend_impact_pdf(dd)
      dd.content.push("\n\n")*/


    },

    eqs_pdf(dd, industries_aux) {


      let _this = this

      dd.content.push({
        text: "\nConcentration of the pollutants in the effluent (with respect to EQS) \n\n",
        style: 'subsubheader'
      })

      let industriesEcotoxicity = {
        table: {
          body: [
            [
              {text:'Industry', style: "bold"},
              [
                {text: [{text: "1,2-DCE", style: "bold"}, {text: "1" , sup: true, style: "asterisk"},]},

              ], //1,2-Dichloroethane
              {text:'Cadmium',style: "bold"},
              [
                {text: [{text: "HBC", style: "bold"}, {text: "2" , sup: true, style: "asterisk"},]},

              ], //Hexachlorobenzene

              {text:"Mercury",style: "bold"},
              {text:"Lead",style: "bold"},
              {text:"Nickel",style: "bold"},
              {text:"Chloroalkanes",style: "bold"},
              [
                {text: [{text: "HCBD", style: "bold"}, {text: "3" , sup: true, style: "asterisk"},]},

              ], //Hexachlorobutadiene
              [
                {text: [{text: "NP", style: "bold"}, {text: "4" , sup: true, style: "asterisk"},]},

              ], //Nonylphenols
              [
                {text: [{text: "PCE", style: "bold"}, {text: "5" , sup: true, style: "asterisk"},]},
              ], //Tetrachloroethene
              [
                {text: [{text: "TCE", style: "bold"}, {text: "6" , sup: true, style: "asterisk"},]},
              ], //trichloroethylene
            ]
          ]
        }
      }

      for (const [key, industries] of industries_aux) {

        let row = [key]
        let tu = metrics.environmental_quality_standards(industries)



        let dichloroethane_value = tu.diclo
        row.push({text: dichloroethane_value, fillColor: _this.get_color(this.risk_categories.eqs(dichloroethane_value))})

        let cadmium_value = tu.cadmium
        row.push({text: cadmium_value, fillColor: _this.get_color(this.risk_categories.eqs(cadmium_value))})

        let hexaclorobenzene_value = tu.hexaclorobenzene
        row.push({text: hexaclorobenzene_value, fillColor: _this.get_color(this.risk_categories.eqs(hexaclorobenzene_value))})

        let mercury_value = tu.mercury
        row.push({text: mercury_value, fillColor: _this.get_color(this.risk_categories.eqs(mercury_value))})

        let lead_value = tu.lead
        row.push({text: lead_value, fillColor: _this.get_color(this.risk_categories.eqs(lead_value))})

        let nickel_value = tu.nickel
        row.push({text: nickel_value, fillColor: _this.get_color(this.risk_categories.eqs(nickel_value))})

        let chloroalkanes_value = tu.chloroalkanes
        row.push({text: chloroalkanes_value, fillColor: _this.get_color(this.risk_categories.eqs(chloroalkanes_value))})

        let hexaclorobutadie_value = tu.hexaclorobutadie
        row.push({text: hexaclorobutadie_value, fillColor: _this.get_color(this.risk_categories.eqs(hexaclorobutadie_value))})

        let nonylphenols_value = tu.nonylphenols
        row.push({text: nonylphenols_value, fillColor: _this.get_color(this.risk_categories.eqs(nonylphenols_value))})

        let tetrachloroethene_value = tu.tetracloroetile
        row.push({text: tetrachloroethene_value, fillColor: _this.get_color(this.risk_categories.eqs(tetrachloroethene_value))})

        let trichloroethylene_value = tu.tricloroetile
        row.push({text: trichloroethylene_value, fillColor: _this.get_color(this.risk_categories.eqs(trichloroethylene_value))})


        industriesEcotoxicity.table.body.push(row)
      }


      dd.content.push(industriesEcotoxicity)
      dd.content.push("\n")
      dd.content.push([
        {text: [{text: "1", sup: true, style: "asterisk"}, {text:"1,2-Dichloroethane, "},
            {text: [{text: "2", sup: true, style: "asterisk"}, {text:"Hexachlorobenzene, "}]},
            {text: [{text: "3", sup: true, style: "asterisk"}, {text:"Hexachlorobutadiene, "}]},
            {text: [{text: "4", sup: true, style: "asterisk"}, {text:"Nonylphenols, "}]},
            {text: [{text: "5", sup: true, style: "asterisk"}, {text:"Tetrachloroethene, "}]},
            {text: [{text: "6", sup: true, style: "asterisk"}, {text:"Trichloroethylene"}]},
          ]},
      ])
      dd.content.push("\n")
      _this.risk_categories.legend_impact_pdf(dd)
      dd.content.push("\n")

    },

    async delta_tu_pdf(dd, industries_aux) {

      let _this = this

      dd.content.push({
        text: "Increase in toxic units in the receiving water body after discharge \n\n",
        style: 'subsubheader'
      })

      let industriesEcotoxicity = {
        table: {
          body: [
            [
              {text:'Industry', style: "bold"},
              {text:"Total (TU/day)",style: "bold"},
              [
                {text: [{text: "1,2-DCE", style: "bold"}, {text: "1" , sup: true, style: "asterisk"},]},
                {text: "(TU/day)", style: "bold"},

              ], //1,2-Dichloroethane
              {text:'Cadmium (TU/day)',style: "bold"},
              [
                {text: [{text: "HBC", style: "bold"}, {text: "2" , sup: true, style: "asterisk"},]},
                {text: "(TU/day)", style: "bold"},

              ], //Hexachlorobenzene

              {text:"Mercury (TU/day)",style: "bold"},
              {text:"Lead (TU/day)",style: "bold"},
              {text:"Nickel (TU/day)",style: "bold"},
              {text:"Chloroalkanes (TU/day)",style: "bold"},
              [
                {text: [{text: "HCBD", style: "bold"}, {text: "3" , sup: true, style: "asterisk"},]},
                {text: "(TU/day)", style: "bold"},

              ], //Hexachlorobutadiene
              [
                {text: [{text: "NP", style: "bold"}, {text: "4" , sup: true, style: "asterisk"},]},
                {text: "(TU/day)", style: "bold"},

              ], //Nonylphenols
              [
                {text: [{text: "PCE", style: "bold"}, {text: "5" , sup: true, style: "asterisk"},]},
                {text: "(TU/day)", style: "bold"},
              ], //Tetrachloroethene
              [
                {text: [{text: "TCE", style: "bold"}, {text: "6" , sup: true, style: "asterisk"},]},
                {text: "(TU/day)", style: "bold"},
              ], //trichloroethylene
            ]
          ]
        }
      }


      for (const [key, industries] of industries_aux) {

        let row = [key]
        let tu = await metrics.delta_tu(industries, this.global_layers)

        let total_value = tu.total
        row.push({text: total_value, fillColor: _this.get_color(this.risk_categories.delta_ecotoxicity(total_value)), style: "bold"})


        let dichloroethane_value = tu.diclo
        row.push({text: dichloroethane_value, fillColor: _this.get_color(this.risk_categories.delta_ecotoxicity(dichloroethane_value))})

        let cadmium_value = tu.cadmium
        row.push({text: cadmium_value, fillColor: _this.get_color(this.risk_categories.delta_ecotoxicity(cadmium_value))})

        let hexaclorobenzene_value = tu.hexaclorobenzene
        row.push({text: hexaclorobenzene_value, fillColor: _this.get_color(this.risk_categories.delta_ecotoxicity(hexaclorobenzene_value))})

        let mercury_value = tu.mercury
        row.push({text: mercury_value, fillColor: _this.get_color(this.risk_categories.delta_ecotoxicity(mercury_value))})

        let lead_value = tu.lead
        row.push({text: lead_value, fillColor: _this.get_color(this.risk_categories.delta_ecotoxicity(lead_value))})

        let nickel_value = tu.nickel
        row.push({text: nickel_value, fillColor: _this.get_color(this.risk_categories.delta_ecotoxicity(nickel_value))})

        let chloroalkanes_value = tu.chloroalkanes
        row.push({text: chloroalkanes_value, fillColor: _this.get_color(this.risk_categories.delta_ecotoxicity(chloroalkanes_value))})

        let hexaclorobutadie_value = tu.hexaclorobutadie
        row.push({text: hexaclorobutadie_value, fillColor: _this.get_color(this.risk_categories.delta_ecotoxicity(hexaclorobutadie_value))})

        let nonylphenols_value = tu.nonylphenols
        row.push({text: nonylphenols_value, fillColor: _this.get_color(this.risk_categories.delta_ecotoxicity(nonylphenols_value))})

        let tetrachloroethene_value = tu.tetracloroetile
        row.push({text: tetrachloroethene_value, fillColor: _this.get_color(this.risk_categories.delta_ecotoxicity(tetrachloroethene_value))})

        let trichloroethylene_value = tu.tricloroetile
        row.push({text: trichloroethylene_value, fillColor: _this.get_color(this.risk_categories.delta_ecotoxicity(trichloroethylene_value))})


        industriesEcotoxicity.table.body.push(row)

      }

      dd.content.push(industriesEcotoxicity)
      dd.content.push("\n")
      dd.content.push([
        {text: [{text: "1", sup: true, style: "asterisk"}, {text:"1,2-Dichloroethane, "},
            {text: [{text: "2", sup: true, style: "asterisk"}, {text:"Hexachlorobenzene, "}]},
            {text: [{text: "3", sup: true, style: "asterisk"}, {text:"Hexachlorobutadiene, "}]},
            {text: [{text: "4", sup: true, style: "asterisk"}, {text:"Nonylphenols, "}]},
            {text: [{text: "5", sup: true, style: "asterisk"}, {text:"Tetrachloroethene, "}]},
            {text: [{text: "6", sup: true, style: "asterisk"}, {text:"Trichloroethylene"}]},
          ]},
      ])
      dd.content.push("\n")
      this.risk_categories.legend_impact_pdf(dd)
      dd.content.push("\n\n")
    },

    async delta_eqs_pdf(dd, industries_aux) {

      dd.content.push({
        text: "\nIncrease of the concentration of the pollutants in the receiving water body after discharge (with respect to EQS)  \n\n",
        style: 'subsubheader'
      })

      let _this = this

      let industriesEcotoxicity = {
        table: {
          body: [
            [
              {text:'Industry', style: "bold"},
              [
                {text: [{text: "1,2-DCE", style: "bold"}, {text: "1" , sup: true, style: "asterisk"},]},

              ], //1,2-Dichloroethane
              {text:'Cadmium (TU/day)',style: "bold"},
              [
                {text: [{text: "HBC", style: "bold"}, {text: "2" , sup: true, style: "asterisk"},]},

              ], //Hexachlorobenzene

              {text:"Mercury",style: "bold"},
              {text:"Lead",style: "bold"},
              {text:"Nickel",style: "bold"},
              {text:"Chloroalkanes",style: "bold"},
              [
                {text: [{text: "HCBD", style: "bold"}, {text: "3" , sup: true, style: "asterisk"},]},

              ], //Hexachlorobutadiene
              [
                {text: [{text: "NP", style: "bold"}, {text: "4" , sup: true, style: "asterisk"},]},

              ], //Nonylphenols
              [
                {text: [{text: "PCE", style: "bold"}, {text: "5" , sup: true, style: "asterisk"},]},
              ], //Tetrachloroethene
              [
                {text: [{text: "TCE", style: "bold"}, {text: "6" , sup: true, style: "asterisk"},]},
              ], //trichloroethylene
            ]
          ]
        }
      }

      for (const [key, industries] of industries_aux) {

        let row = [key]
        let tu = await metrics.delta_eqs(industries, this.global_layers)

        let dichloroethane_value = tu.diclo
        row.push({text: dichloroethane_value, fillColor: _this.get_color(this.risk_categories.delta_eqs(dichloroethane_value))})

        let cadmium_value = tu.cadmium
        row.push({text: cadmium_value, fillColor: _this.get_color(this.risk_categories.delta_eqs(cadmium_value))})

        let hexaclorobenzene_value = tu.hexaclorobenzene
        row.push({text: hexaclorobenzene_value, fillColor: _this.get_color(this.risk_categories.delta_eqs(hexaclorobenzene_value))})

        let mercury_value = tu.mercury
        row.push({text: mercury_value, fillColor: _this.get_color(this.risk_categories.delta_eqs(mercury_value))})

        let lead_value = tu.lead
        row.push({text: lead_value, fillColor: _this.get_color(this.risk_categories.delta_eqs(lead_value))})

        let nickel_value = tu.nickel
        row.push({text: nickel_value, fillColor: _this.get_color(this.risk_categories.delta_eqs(nickel_value))})

        let chloroalkanes_value = tu.chloroalkanes
        row.push({text: chloroalkanes_value, fillColor: _this.get_color(this.risk_categories.delta_eqs(chloroalkanes_value))})

        let hexaclorobutadie_value = tu.hexaclorobutadie
        row.push({text: hexaclorobutadie_value, fillColor: _this.get_color(this.risk_categories.delta_eqs(hexaclorobutadie_value))})

        let nonylphenols_value = tu.nonylphenols
        row.push({text: nonylphenols_value, fillColor: _this.get_color(this.risk_categories.delta_eqs(nonylphenols_value))})

        let tetrachloroethene_value = tu.tetracloroetile
        row.push({text: tetrachloroethene_value, fillColor: _this.get_color(this.risk_categories.delta_eqs(tetrachloroethene_value))})

        let trichloroethylene_value = tu.tricloroetile
        row.push({text: trichloroethylene_value, fillColor: _this.get_color(this.risk_categories.delta_eqs(trichloroethylene_value))})


        industriesEcotoxicity.table.body.push(row)
      }


      dd.content.push(industriesEcotoxicity)
      dd.content.push("\n")
      dd.content.push([
        {text: [{text: "1", sup: true, style: "asterisk"}, {text:"1,2-Dichloroethane, "},
            {text: [{text: "2", sup: true, style: "asterisk"}, {text:"Hexachlorobenzene, "}]},
            {text: [{text: "3", sup: true, style: "asterisk"}, {text:"Hexachlorobutadiene, "}]},
            {text: [{text: "4", sup: true, style: "asterisk"}, {text:"Nonylphenols, "}]},
            {text: [{text: "5", sup: true, style: "asterisk"}, {text:"Tetrachloroethene, "}]},
            {text: [{text: "6", sup: true, style: "asterisk"}, {text:"Trichloroethylene"}]},
          ]},
      ])
      dd.content.push("\n")
      this.risk_categories.legend_impact_pdf(dd)
      dd.content.push("\n")


    },

    efficiency_pdf(dd, industries_aux, assessment_days) {


      let _this = this
      let days_factor = 1

      dd.content.push({
        text: " Percentage of treatment efficiency (compared to WWTP influent)\n\n",
        style: 'subheader'
      })

      let industriesEfficiency = {
        table: {
          body: [
            [
              {text:'Industry', style: "bold"},
              {text: "COD (%)",style: "bold"},
              {text:"TN (%)",style: "bold"},
              {text:"TP (%)",style: "bold"},

              [
                {text: [{text: "1,2-DCE", style: "bold"}, {text: "1" , sup: true, style: "asterisk"}, {text: "(%)", style: "bold"}]},

              ], //1,2-Dichloroethane
              {text:'Cadmium (%)',style: "bold"},
              [
                {text: [{text: "HBC", style: "bold"}, {text: "2" , sup: true, style: "asterisk"}, {text: "(%)", style: "bold"}]},

              ], //Hexachlorobenzene

              {text:"Mercury (%)",style: "bold", },
              {text:"Lead (%)",style: "bold"},
              {text:"Nickel (%)",style: "bold"},
              {text:"Chloroalkanes (%)",style: "bold"},
            ]
          ]
        },
      }
      let industriesEfficiency_1 = {
        table: {
          body: [
            [
              {text:'Industry', style: "bold"},
              [
                {text: [{text: "HCBD", style: "bold"}, {text: "3" , sup: true, style: "asterisk"}, {text: "(%)", style: "bold"}]},

              ], //Hexachlorobutadiene
              [
                {text: [{text: "NP", style: "bold"}, {text: "4" , sup: true, style: "asterisk"}, {text: "(%)", style: "bold"}]},

              ], //Nonylphenols
              [
                {text: [{text: "PCE", style: "bold"}, {text: "5" , sup: true, style: "asterisk"}, {text: "(%)", style: "bold"}]},
              ], //Tetrachloroethene
              [
                {text: [{text: "TCE", style: "bold"}, {text: "6" , sup: true, style: "asterisk"}, {text: "(%)", style: "bold"}]},
              ], //trichloroethylene
            ]
          ]
        }
      }

      let data_chart = {
        labels: ["COD", "TN", "TP", "1,2-Dichloroethane", "Cadmium", "Hexachlorobenzene", "Mercury", "Lead", "Nickel", "Chloroalkanes", "Hexachlorobutadiene", "Nonylphenols", "Tetrachloroethene", "Trichloroethylene"],
        datasets: []
      };

      for (const [key, industries] of industries_aux) {
        let row = [key]
        let row_1 = [key]


        let cod_value = metrics.cod_efficiency(industries)
        row.push({text: cod_value})

        let tn_value = metrics.tn_efficiency(industries)
        row.push({text: tn_value})

        let tp_value = metrics.tp_efficiency(industries)
        row.push({text: tp_value})

        let dichloroethane_value = metrics.dichloroethane_efficiency(industries)
        row.push({text: dichloroethane_value, })

        let cadmium_value = metrics.cadmium_efficiency(industries)
        row.push({text: cadmium_value, })

        let hexaclorobenzene_value = metrics.hexaclorobenzene_efficiency(industries)
        row.push({text: hexaclorobenzene_value, })

        let mercury_value = metrics.mercury_efficiency(industries)
        row.push({text: mercury_value, })

        let lead_value = metrics.lead_efficiency(industries)
        row.push({text: lead_value, })

        let nickel_value = metrics.nickel_efficiency(industries)
        row.push({text: nickel_value, })

        let chloroalkanes_value = metrics.chloroalkanes_efficiency(industries)
        row.push({text: chloroalkanes_value, })

        let hexaclorobutadie_value = metrics.hexaclorobutadie_efficiency(industries)
        row_1.push({text: hexaclorobutadie_value, })

        let nonylphenols_value = metrics.nonylphenols_efficiency(industries)
        row_1.push({text: nonylphenols_value, })

        let tetrachloroethene_value = metrics.tetrachloroethene_efficiency(industries)
        row_1.push({text: tetrachloroethene_value, })

        let trichloroethylene_value = metrics.tricloroetile_efficiency(industries)
        row_1.push({text: trichloroethylene_value, })

        data_chart.datasets.push({
          data: [cod_value, tn_value, tp_value, dichloroethane_value, cadmium_value, hexaclorobenzene_value, mercury_value, lead_value, nickel_value, chloroalkanes_value, hexaclorobutadie_value, nonylphenols_value, tetrachloroethene_value, trichloroethylene_value],
          label: key,
          backgroundColor: this.chooseColor(key).concat("70"),
        })

        industriesEfficiency.table.body.push(row)
        industriesEfficiency_1.table.body.push(row_1)
      }

      //CHART
      const options = {
        animation: false,
        scale: {
          ticks: {
            min: 0
          }
        },
        "tooltips": {
          "callbacks": {
            "title": (tooltipItem, data) => {
              //return data.labels[tooltipItem[0].index]
              return Object.values(tooltipItem).map(item => {
                return data.labels[item.index]
              }).toString()
            }
          }
        }
      }

      const ctx = document.getElementById('chart');
      /*let chart = new Chart(ctx, {
        type: "radar",
        data: data_chart,
        options: options
      });*/

      dd.content.push(industriesEfficiency)
      dd.content.push("\n\n")
      dd.content.push(industriesEfficiency_1)
      dd.content.push("\n")
      dd.content.push([
        {text: [{text: "1", sup: true, style: "asterisk"}, {text:"1,2-Dichloroethane, "},
            {text: [{text: "2", sup: true, style: "asterisk"}, {text:"Hexachlorobenzene, "}]},
            {text: [{text: "3", sup: true, style: "asterisk"}, {text:"Hexachlorobutadiene, "}]},
            {text: [{text: "4", sup: true, style: "asterisk"}, {text:"Nonylphenols, "}]},
            {text: [{text: "5", sup: true, style: "asterisk"}, {text:"Tetrachloroethene, "}]},
            {text: [{text: "6", sup: true, style: "asterisk"}, {text:"Trichloroethylene"}]},
          ]},
      ])
      dd.content.push("\n\n")
      /*dd.content.push({
        image: chart.toBase64Image(),
        fit: [450, 450]
      })*/

    },

    influent_efficiency_pdf(dd, industries_aux, assessment_days) {

      let _this = this

      dd.content.push({
        text: "Percentage of treatment efficiency (compared to industry influent)\n\n",
        style: 'subheader'
      })

      let industriesEfficiency = {
        table: {
          body: [
            [
              {text:'Industry', style: "bold"},
              {text: "COD (%)",style: "bold"},
              {text:"TN (%)",style: "bold"},
              {text:"TP (%)",style: "bold"},
            ]
          ]
        },
      }

      let data_chart = {
        labels: ["COD", "TN", "TP"],
        datasets: []
      };

      for (const [key, industries] of industries_aux) {
        let row = [key]

        let eff = metrics.amount_water_influent_cleaned(industries)

        row.push({text: eff.cod, })

        row.push({text: eff.tn, })

        row.push({text: eff.tp, })

        data_chart.datasets.push({
          data: [eff.cod, eff.tn, eff.tp],
          label: key,
          backgroundColor: this.chooseColor(key).concat("70"),
        })

        industriesEfficiency.table.body.push(row)
      }

      //CHART
      const options = {
        animation: false,
        scale: {
          ticks: {
            min: 0
          }
        },
        "tooltips": {
          "callbacks": {
            "title": (tooltipItem, data) => {
              //return data.labels[tooltipItem[0].index]
              return Object.values(tooltipItem).map(item => {
                return data.labels[item.index]
              }).toString()
            }
          }
        }
      }

      const ctx = document.getElementById('chart');
      /*let chart = new Chart(ctx, {
        type: "radar",
        data: data_chart,
        options: options
      });*/

      dd.content.push(industriesEfficiency)
      dd.content.push("\n\n")

      /*dd.content.push({
        image: chart.toBase64Image(),
        fit: [450, 450]
      })*/

    },

    async reporting_pdf(dd, industries_aux, assessment_days) {

      let days_factor = 1
      if(this.period_model === "annual") days_factor = 365
      else if(this.period_model === "assessment") days_factor = assessment_days

      let _this = this

      dd.content.push({
        text: "Indicators for external reporting\n\n",
        style: 'indicator_title'
      })

      let industriesIndicator = {
        table: {
          body: [
            [
              {text:'Industry', style: "bold"},
              {text:[{text: 'Water withdrawal (', style: "bold",}, {text: 'GRI 303-1', style: "bold", color: "blue", link: "https://www.globalreporting.org/standards/media/1909/gri-303-water-and-effluents-2018.pdf"}, {text: ') (m3/year)', style: "bold",}], },
              {text:[{text: 'Effect of water withdrawal on the water body (', style: "bold",}, {text: 'GRI 303-2', style: "bold", color: "blue", link: "https://www.globalreporting.org/standards/media/1909/gri-303-water-and-effluents-2018.pdf"}, {text: ') (%)', style: "bold",}], },
              {text:[{text: 'Water recycled and reused (', style: "bold",}, {text: 'GRI 303-3', style: "bold", color: "blue", link: "https://www.globalreporting.org/standards/media/1909/gri-303-water-and-effluents-2018.pdf"}, {text: ') (%)', style: "bold",}], },
              {text:[{text: 'Water discharge (', style: "bold",}, {text: 'GRI 306-1', style: "bold", color: "blue", link: "https://www.globalreporting.org/standards/media/2573/gri-306-waste-2020.pdf"}, {text: ') (m3/year)', style: "bold",}], },
              {text:[{text: 'Effect of water discharges on the water body (', style: "bold",}, {text: 'GRI 306-5', style: "bold", color: "blue", link: "https://www.globalreporting.org/standards/media/2573/gri-306-waste-2020.pdf"}, {text: ') (%)', style: "bold",}], },
              {text:[{text: 'Water withdrawn (', style: "bold",}, {text: 'CDP W1.2b', style: "bold", color: "blue", link: "https://guidance.cdp.net/en/guidance?cid=W1.2&ctype=ExternalRef&gettags=1+&idtype=RecordExternalRef&incchild=1&microsite=1&otype=questionnaire&page=1"}, {text: ') (ML/yr)', style: "bold",}], },
              {text:[{text: 'Water discharged (', style: "bold",}, {text: 'CDP W1.2b', style: "bold", color: "blue", link: "https://guidance.cdp.net/en/guidance?cid=W1.2&ctype=ExternalRef&gettags=1+&idtype=RecordExternalRef&incchild=1&microsite=1&otype=questionnaire&page=1"}, {text: ') (ML/yr)', style: "bold",}], },
              {text:[{text: 'Water reused (', style: "bold",}, {text: 'CDP W1.2b', style: "bold", color: "blue", link: "https://guidance.cdp.net/en/guidance?cid=W1.2&ctype=ExternalRef&gettags=1+&idtype=RecordExternalRef&incchild=1&microsite=1&otype=questionnaire&page=1"}, {text: ') (ML/yr)', style: "bold",}], },
              {text:[{text: 'Highest level(s) to which you treat your discharge (', style: "bold",}, {text: 'CDP W1.2j', style: "bold", color: "blue", link: "https://guidance.cdp.net/en/guidance?cid=W1.2&ctype=ExternalRef&gettags=1+&idtype=RecordExternalRef&incchild=1&microsite=1&otype=questionnaire&page=1"}, {text: ')', style: "bold",}], },

            ]
          ]
        }
      }

      for (const [key, industries] of industries_aux) {
        let row = [key]

        let indicators = await metrics.reporting_metrics(industries, this.global_layers)

        let en8 = indicators["g4-en8"]
        row.push(en8)
        let en9 = indicators["g4-en9"]

        row.push({text: en9, fillColor: _this.get_color(this.risk_categories.withdrawal_effect(en9))})
        let en10 = indicators["g4-en10"]
        row.push(en10)
        let en22 = indicators["g4-en22"]
        row.push(en22)
        let en26 = indicators["g4-en26"]
        row.push({text: en26, fillColor: _this.get_color(this.risk_categories.discharge_effect(en26))})
        let wd_value = indicators["wd"]
        row.push(wd_value)
        let dis_value = indicators["dis"]
        row.push(dis_value)
        let re_value = indicators["re"]
        row.push(re_value)
        let highest_level_discharge = indicators["highest_level_discharge"]
        row.push(highest_level_discharge)

        industriesIndicator.table.body.push(row)

      }

      dd.content.push(industriesIndicator)
      dd.content.push("\n")
      this.risk_categories.legend_impact_pdf(dd)
      dd.content.push("\n\n")

    },

    async generate_pdf(){
      let _this = this
      this.generating_pdf = true

      if (pdfMake.vfs == undefined){
        let pdfFonts = require('pdfmake/build/vfs_fonts.js')
        pdfMake.vfs = pdfFonts.pdfMake.vfs;
      }

      let img = await _this.getBase64ImageFromURL("wbcsd.png")

      let dd = {
        pageSize: 'A4',
        pageOrientation: 'landscape',
          pageMargins: [67, 60, 30, 42],
        footer: function (currentPage, pageCount) {
          return {
            table: {
              widths: [150, '*', 100],
              body: [
                [
                  {text: 'www.wiat.icradev.cat', alignment: 'right'},
                  {text: ' ', alignment: 'right'},
                  {text: 'Page ' + currentPage, alignment: 'left'}
                ]
              ]
            },
            layout: 'noBorders'
          };
        },
        header: function(currentPage, pageCount, pageSize) {
          return {
            margin: [20, 20],
            layout: 'noBorders',
            table: {
              widths: ['*',200],
              body: [
                ['', {image: img, fit:[50,50], alignment: 'right'}],

              ]
            }
          };
        },
        content: [],
        styles: {
          header: {
            fontSize: 18,
            bold: true
          },
          indicator_title: {
            fontSize: 14,
            bold: true,
            decoration: 'underline',
          },
          subheader_big: {
            fontSize: 13,
            bold: true
          },
          subheader: {
            fontSize: 12,
          },
          subsubheader: {
            fontSize: 11,
            bold: true
          },
          legend: {
            fontSize: 7,
          },

          tableHeader: {
            bold: true,
            fontSize: 10,
            color: '#1c1c1b'
          },
          bold: {
            bold: true
          },
          asterisk: {
            color: "red"
          },
          defaultStyle: {
            fontSize: 10,
          }

        },

      }

      const groupedByAssessments = _.groupBy(this.selected_industries, function(n) {
        return n.assessment.name;
      });


      for(const [assessment_name, industries] of Object.entries(groupedByAssessments)){
        dd.content.push({
          text: "Assessment "+assessment_name+"\n\n",
          style: 'header'
        })

        let assessment = industries[0].assessment

        let assessment_days = utils.daysBetween(assessment.assessment_period_start, assessment.assessment_period_end)

        dd.content.push({
          text: [
            {
              text:"Assessment period: ",
              bold: true
            },
            assessment.assessment_period_start + " to "+ assessment.assessment_period_end + " ("+ utils.daysBetween(assessment.assessment_period_start, assessment.assessment_period_end) +" days)\n\n"
          ]
        })

        let industriesSummary = {
          style: 'tableExample',
          table: {
            body: [
                [
                  {text:'Name', style: "bold"},
                  {text:'Latitude', style: "bold"},
                  {text:'Longitude', style: "bold"},
                  {text:"Standard Industrial Classification", style: "bold"},
                  {text:"Assessment period (days)", style: "bold"},
                  {text:"Supply chain", style: "bold"}
                ]
            ]
          }
        }

        industries.forEach(industryAux => {
          let industry = industryAux.industry

          let arr = [
            industry.name,
            industry.location.lat.toFixed(3),
            industry.location.lng.toFixed(3),
            industry.industry_type === null ? "-" : standard_industrial_classification.find(category => category.value == industry.industry_type).text,
            assessment_days,
          ]

          let sc = {
            table: {
              body: [
                ['Name', 'Latitude', 'Longitude'],
              ]
            },
          }

          industry.supply_chain.forEach(x => {
            sc.table.body.push([x.name, parseFloat(x.location.lat).toFixed(3), parseFloat(x.location.lng).toFixed(3)])
          })

          arr.push(sc)

          industriesSummary.table.body.push(arr)
        })

        dd.content.push(industriesSummary)
        dd.content.push("\n\n")

        let industries_aggregated = industries.map(industry => [industry.industry.name, [industry.industry]])

        this.emissions_table_pdf(dd, industries_aggregated, assessment_days)
        dd.content.push("\n\n")
        await this.quality_quantity_indicators(dd, industries_aggregated, assessment_days)
        dd.content.push("\n\n")

        dd.content.push({
          text: "Pollution impact\n\n",
          style: 'indicator_title'
        })

        await this.ecotoxicity_pdf(dd, industries_aggregated, assessment_days)
        dd.content.push("\n\n")

        this.eutrophication_pdf(dd, industries_aggregated, assessment_days)
        dd.content.push("\n\n")

        dd.content.push({
          text: "Treatment efficiency\n\n",
          style: 'subheader_big'
        })

        this.efficiency_pdf(dd, industries_aggregated, assessment_days)
        dd.content.push("\n\n")
        this.influent_efficiency_pdf(dd, industries_aggregated, assessment_days)
        dd.content.push("\n\n")

        await this.reporting_pdf(dd, industries_aggregated, assessment_days)
        dd.content.push("\n\n")

        await this.layers_table_pdf(dd, industries_aggregated, assessment_days)
      }


      this.generating_pdf = false
      pdfMake.createPdf(dd).download();

    },
  },

  created(){
    let _this = this
    this.assessments_with_industries.forEach(assessment => {
      if(!assessment.disabled) _this.selected_assessments.push(assessment.assessment)
    })
    let indexFirstValid = this.assessments_with_industries.findIndex(assessment => assessment.disabled == false)
    if(indexFirstValid >= 0) {
      this.selected_assessment = this.assessments_with_industries[indexFirstValid].assessment.name
    }
  },

  computed: {

    tab(){
      let _this = this
      let index = this.assessments_with_industries.findIndex(assessment => assessment.assessment.name == _this.selected_assessment)
      if(index  == -1) return undefined
      else return index
    },

    indicators_industry(){
      return [
        {
          id: 1,
          name: 'Pollution',
          children: [
            {
              id: 2,
              name: 'Impact' ,
              children: [
                {id: 3, name: this.table_title.simple_table.delta_tu,},
                {id: 4, name: this.table_title.simple_table.delta_eqs,},
                {id: 5, name: this.table_title.simple_table.eutrophication,},
                {id: 6, name: this.table_title.simple_table.tu,},
                {id: 7, name: this.table_title.simple_table.eqs,},
              ]
            },
            { id:8,
              name: 'Levers for action',
              children: [
                { id: 9, name: this.table_title.simple_table.avg_treatment_efficiency },
                { id: 10, name: this.table_title.simple_table.avg_influent_efficiency },
                { id: 11, name: this.table_title.simple_table.treated },
              ]
            },
          ],
        },
        {
          id: 12,
          name: "Freshwater",
          children: [
            {id: 13, name: "Impact",},
            {id: 14, name: "Levers for action",}
          ]
        },
        {
          id: 15,
          name: "Carbon",
          children: [
            {id: 16, name: "Impact",},
            {
              id: 17,
              name: "Levers for action",
              children: [
                {id: 18, name: "Energy use"},
                {id: 19, name: "Wastewater effluent concentration"},
              ]

            },

          ]
        }
      ]
    },

    assessments_with_industries(){
      let _this = this

      let disabled = this.created_assessments.map(assessment => {
        if(assessment.industries.length == 0){
          return {
            assessment: assessment,
            disabled: true,
          }
        }else{
          return {
            assessment: assessment,
            disabled: !assessment.industries.map(industry => {return utils.is_industry_valid(industry)}).includes(true)
          }
        }
      })
      return disabled
    },

    industries_aggregated(){
      let _this = this
      if(_this.tab !== undefined && _this.tab !== null && _this.created_assessments.length > 0) {

        let industries = {}
        this.created_assessments[_this.tab].industries.forEach(industry => {
          if(utils.is_industry_valid(industry))
          industries[industry.name] = [industry]
        })
        return industries
      }
    },

    industry_table() {

      let _this = this

      if(_this.tab !== undefined){

        let assessment = this.created_assessments[_this.tab]
        let assessment_days = utils.daysBetween(assessment.assessment_period_start, assessment.assessment_period_end)

        let table = {
          header: [
            {text: "Name", value: "industry_name"},
            {text: "Latitude", value: "lat"},
            {text: "Longitude", value: "lon"},
            {text: "Standard Industrial Classification", value: "industry_type"},
            {text: "Assessment period (days)", value: "assessment_period"},
            { text: 'Supply chain', value: 'data-table-expand'},
          ],
          industries: []
        }

        assessment.industries.forEach(industry => {

          if(utils.is_industry_valid(industry)){
            table.industries.push({
              industry_name: industry.name,
              lat: industry.location.lat.toFixed(3),
              lon: industry.location.lng.toFixed(3),
              industry_type: industry.industry_type === null ? "-" : standard_industrial_classification.find(category => category.value == industry.industry_type).text,
              assessment_period: assessment_days,
              industry: industry,
            })
          }


        })
        return table
      }
      else return {header: [], industries: []}
    },

    assessment_names: function() {
      return this.assessments_with_industries.map(assessment => assessment.assessment.name)

      //return this.assessments_with_industries.filter(assessment => !assessment.disabled).map(assessment => assessment.assessment.name)
    },

    layer_tree: function () {
      let _this = this
      let id = 1
      this.layers.forEach(category => {
        id = _this.add_identifier(category, id)  //id has the new id to add
      })

      return this.layers
    },

    is_there_any_industry_created: function () {

      let _this = this
      let industries = []
      this.assessments_and_industries_tree.forEach(assessment => {
        industries.push(...assessment.children)
      })
      return industries.filter(industry => {
        return utils.is_industry_valid(industry.industry)
      }).length > 0


    },

    assessments_and_industries_tree: function () {  //Assessments without any industry are ignored
      let id = 0
      let items = []
      this.created_assessments.forEach(assessment => {
        let obj = {}
        obj["name"] = assessment.name
        obj["children"] = []
        obj["id"] = id
        id++
        assessment.industries.forEach(industry => {
          obj["children"].push({
            "industry": industry,
            "id": id,
            "assessment": assessment,
            "name": industry.name
          })
          id++
        })
        if (obj["children"].length > 0) items.push(obj)
      })


      return items
    }
  }

  }

</script>

<style>
  .style-1 {
    font-weight: bold;
  }
  .style-2 {
    font-weight: normal;
  }

  .impact-style {
    background-color: #c4c4d4;
    font-weight: bold;
  }
  .impact-style:hover{
    background-color: #555283!important;
  }

  .lever-style{
    border: 10px solid orange !important;
  }

  .red{
    background-color: red;
  }


</style>

<style scoped>

.side_menu_title{
  font-weight: bold;
  font-size: 18px;
  color: #b62373;
}

.center {
  margin: auto;
  padding: 10px;
}

.table_descriptor{
  margin-bottom: 10px;
  margin-top: 10px;
}

.report {
  height: 100%;
  margin-bottom: 50px;
}



#assessment_tab .v-tab.v-tab--active{
  background-color: #1C195B;
  color: #F2F4F3 !important;
}

#main_tab .v-tab.v-tab--active{
  background-color: #b62373 !important;
  color: #F2F4F3 !important;
}

.border_report{
  border-style: solid;
  border-color: #1C195B;
}

.menu{
  border-left: 3px solid #1C195B;
  height: 100%;
  padding-top: 30px;
  padding-bottom: 30px;
}



.table_title {
  font-size: 140%;
  font-weight: bold;
}


table {
  padding: 15px;
}

.divider {
  margin-top: 25px;
  border-color: #1C195B !important;
}

.v-icon{
  padding-bottom: 5px
}

.v-data-table{
  padding-left: 20px;
  padding-right: 20px;
  padding-bottom: 20px;
}

.v-btn--disabled{
  background-color: rgba(0, 0, 0, 0.26) !important
}
.dialog_detail{
  padding: 50px;
}


.instructions{
  color: grey;
  font-size: 12px;
  padding: 10px 0px 5px 30px;
  font-weight: bold;
}
.instructions_2{
  color: grey;
  font-size: 12px;
  font-weight: bold;
}

.download_link{
  text-decoration: none;
}

.v-chip{
  margin-left: 0px !important
}

.chip_no_hover::before{
  background-color: transparent !important;
}

.icon_clickable {
  transition: all .2s ease-in-out;
}

.icon_clickable:hover{
  transform: scale(1.2);
}


.hover {
  color: #b62373;
}

.hover:hover {
  text-decoration: underline;
}
.low {
  background-color: #529fee;
}
.medium {
  background-color: yellow;
}
.high {
  background-color: orange;
}
.very_high {
  background-color: red;
}


</style>

<style lang="scss">

.simple_report_table {
  border-collapse: collapse;
  tbody {
    tr:hover {
      font-weight: bold;
      cursor: pointer;
    }
  }
}

.expanded_table_hover {
  font-weight:  normal!important;
  cursor: default;
  tbody {
    tr:hover {
      font-weight: normal!important;
      cursor: default;
    }
  }
}

.select_asessment {
  color: #b62373 !important
}

.cdp_key {
  color: #b62373;
  font-size: 1.4rem;
  font-weight: bold;
  padding-right: 10px;
}
.cdp_description {
  font-weight: bold;
}

summary::marker {

  color: #b62373;
  font-size:22px;
}




</style>