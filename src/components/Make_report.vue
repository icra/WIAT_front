<template>
  <div class="outer">
    <h1>Report</h1>
    <div v-if="is_there_any_industry_created" style="height: 100%">
      <div style="height: 100%; padding-top: 10px">
        <v-row>
          <v-col cols="9">
            <v-tabs v-model="tab">
              <v-tab
                  v-for="assessment_name in assessment_names"
                  :key="assessment_name"
              >
                {{assessment_name}}
              </v-tab>
            </v-tabs>
          </v-col>
        </v-row>
        <v-row style="height: 85%" class = "border_report">
          <v-col v-show="selected_industries.length === 0" cols="9" style="height: 100%">
            Please, select at least an industry to make the report

          </v-col>


          <v-col v-show="selected_industries.length > 0" cols="9" style="height: 100%">
            <template class="report" >

              <div style="width: 100%; height: 100%">
                <v-tabs-items v-model="tab">
                  <v-tab-item
                      v-for="(assessment_name, idx) in assessment_names"
                      :key="assessment_name"
                  >
                    <br>
                    <v-card flat style="margin-left: 10px;">
                      <div class = table_descriptor>
                        <b > Industry information </b>
                      </div>
                      <v-data-table
                          :headers="industry_table.header"
                          :items="industry_table.industries"
                          class="elevation-1"
                      ></v-data-table>

                      <div class = table_descriptor>
                        <b > Global Warming Potential </b>
                        <v-tooltip bottom max-width="700px">
                          <template v-slot:activator="{ on, attrs }">
                            <v-icon
                                color='#1C195B'
                                style="padding-right: 10px"
                                v-bind="attrs"
                                v-on="on"
                            >
                              mdi-information-outline
                            </v-icon>
                          </template>
                          <span>This metric indicates the CO2 emissions from the industry. It counts the amount of CO2 equivalent that is produced during the water treatment, water discharge, the emissions from sludge management and the emissions from biogas. It will always have positive values; higher values indicate higher impact. </span>
                        </v-tooltip>
                      </div>
                      <v-data-table
                          :headers="emissions_table.header"
                          :items="emissions_table.emissions"
                          class="elevation-1"
                      ></v-data-table>
                      <div id="global_warming_chart_wrapper" style="width:500px;margin-top: 20px; margin-bottom: 20px">
                        <BarChart :chartdata="ghg_emission_chart.chartData" :options="ghg_emission_chart.options"></BarChart>
                        <!--<canvas :id="'global_warming_potential_chart_tab_'+index"> </canvas>-->
                      </div>


                      <div class = table_descriptor>
                        <b> Availability & Quantity Indicators </b>
                      </div>
                      <v-data-table
                          :headers="water_quantity.header"
                          :items="water_quantity.value"
                          class="elevation-1"
                      >
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
                      </v-data-table>

                      <div style="width: 600px; margin-top: 20px; margin-bottom: 20px">
                        <RadarChart :chartdata="quantity_chart.chartData" :options="quantity_chart.options"></RadarChart>
                      </div>

                      <div class = table_descriptor>
                        <b> Eutrophication potential </b>
                        <v-tooltip bottom max-width="700px">
                          <template v-slot:activator="{ on, attrs }">
                            <v-icon
                                color='#1C195B'
                                style="padding-right: 10px"
                                v-bind="attrs"
                                v-on="on"
                            >
                              mdi-information-outline
                            </v-icon>
                          </template>
                        <span>
                          Eutrophication potential (EP) is defined as the potential to cause over-fertilization of water. and soil, which can result in increased growth of biomass. It will always have positive values; higher values indicate higher impact.
                        </span>
                        </v-tooltip>
                      </div>
                      <v-data-table
                          :headers="eutrophication_table.header"
                          :items="eutrophication_table.value"
                          class="elevation-1"
                      ></v-data-table>
                      <div style="width:500px;margin-top: 20px; margin-bottom: 20px">
                        <BarChart :chartdata="eutrophication_chart.chartData" :options="eutrophication_chart.options"></BarChart>
                      </div>

                      <div class = table_descriptor>
                        <b> Ecotoxicity potential </b>
                        <v-tooltip bottom max-width="700px">
                          <template v-slot:activator="{ on, attrs }">
                            <v-icon
                                color='#1C195B'
                                style="padding-right: 10px"
                                v-bind="attrs"
                                v-on="on"
                            >
                              mdi-information-outline
                            </v-icon>
                          </template>
                          <span>
                            Index that reflects the potential harm of a unit of chemical released into the environment. It is based on both the inherent toxicity of a compound and its potential dose. It will always have positive values; higher values indicate higher impact.
                          </span>
                        </v-tooltip>
                      </div>
                      <v-data-table
                          :headers="ecotoxicity_table.header"
                          :items="ecotoxicity_table.value"
                          class="elevation-1"
                      ></v-data-table>
                      <div style="width:500px;margin-top: 20px; margin-bottom: 20px">
                        <BarChart :chartdata="ecotoxicity_chart.chartData" :options="ecotoxicity_chart.options"></BarChart>
                      </div>


                      <div class = table_descriptor>
                        <b> Increment in pollutant load after discharging water </b>
                        <v-tooltip bottom max-width="700px">
                          <template v-slot:activator="{ on, attrs }">
                            <v-icon
                                color='#1C195B'
                                style="padding-right: 10px"
                                v-bind="attrs"
                                v-on="on"
                            >
                              mdi-information-outline
                            </v-icon>
                          </template>
                          <span>For each pollutant, we can calculate the increment of the concentration of the pollutant in the receiving water body by dividing the load of the pollutant discharged to the water body by the water body streamflow. This indicator will always have positive values, higher values indicate higher impact. </span>
                        </v-tooltip>

                      </div>
                      <v-data-table
                          :headers="pollutants_table.header"
                          :items="pollutants_table.value"
                          class="elevation-1"
                      ></v-data-table>


                      <div class = table_descriptor>
                        <b> Pollutant treatment efficiency </b>
                        <v-tooltip bottom max-width="700px">
                          <template v-slot:activator="{ on, attrs }">
                            <v-icon
                                color='#1C195B'
                                style="padding-right: 10px"
                                v-bind="attrs"
                                v-on="on"
                            >
                              mdi-information-outline
                            </v-icon>
                          </template>
                          <span>Amount of pollutant treated in the WWTP (based on the influent of the WWTP).</span>
                        </v-tooltip>

                      </div>
                      <v-data-table
                          :headers="treatment_efficiency_table.header"
                          :items="treatment_efficiency_table.value"
                          class="elevation-1"
                      ></v-data-table>
                      <div style="width: 600px; margin-top: 20px; margin-bottom: 20px">
                        <RadarChart :chartdata="treatment_efficiency_chart.chartData" :options="treatment_efficiency_chart.options"></RadarChart>
                      </div>

                      <div class = table_descriptor>
                        <b> Reporting indicators: </b>
                      </div>
                      <v-data-table
                          :headers="reporting_indicators.header"
                          :items="reporting_indicators.value"
                          class="elevation-1"
                      >
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


                      </v-data-table>

                      <div v-if="selected_layers.length > 0">
                        <div class = table_descriptor>
                          <b >Global GIS Indicators</b>
                        </div>
                        <v-data-table
                            :headers="layers_table.header"
                            :items="layers_table.value"
                            class="elevation-1"
                        ></v-data-table>
                      </div>


                    </v-card>
                  </v-tab-item>
                </v-tabs-items>
              </div>


            </template>

          </v-col>
          <v-col class="menu">
            <p>Select assessments to include in the report.</p>
            <v-checkbox
                v-for="assessment in created_assessments"
                v-model="selected_assessments"
                :label="assessment.name"
                :value="assessment"
                color="#1C195B"
                style="margin-left: 38px"
                :key="assessment.name"
            >

            </v-checkbox>
            <!--
            <v-treeview
                :items="assessments_and_industries_tree"
                dense
                hoverable
                selectable
                selection-type="leaf"
                return-object
                v-model="selected_industries"
                color="#1C195B"
                selected-color="#1C195B"
                open-on-click
            ></v-treeview>
            -->
            <p>Select the layers to include in the report.</p>
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
            >
            </v-treeview>
            <v-select
                v-model="aggregation_level"
                :items="aggregation_items"
                filled
                label="Aggregation level"
                style="padding-top: 10px"
            ></v-select>
            <v-select
                v-model="include_future"
                :items="yes_no"
                filled
                label="Include 2030 BAU values in the report"
            ></v-select>
            <v-select
                v-model="units_model"
                :items="bod_cod"
                filled
                label="Select units"
            ></v-select>
            <v-select
                v-model="period_model"
                :items="daily_annual_assessment"
                filled
                label="Time period to express the results"
            ></v-select>
            <v-row>
              <v-col>
                <v-btn block @click="button_generate_pdf_clicked">
                  GENERATE PDF
                </v-btn>
                <v-progress-linear
                    indeterminate
                    rounded
                    height="6"
                    v-show="generating_pdf"
                    color="#1C195B"

                ></v-progress-linear>
              </v-col>
            </v-row>

          </v-col>
        </v-row>
      </div>

      <br>

      <div>

        <!--<PDFJSViewer class="center" v-show="selected_industries.length>0 && !generating_pdf" ref="make_pdf"/> -->
        <div style="width: 600px; margin-top: 20px; margin-bottom: 20px">
          <canvas id="chart"></canvas>
        </div>

      </div>



    </div>
    <div v-else>
      <p>Please, create an industry first to make a PDF report.</p>
    </div>




    <br>
  </div>
</template>

<script>

import BarChart from "@/components/BarChart";
let _ = require('lodash');
import PDFJSViewer from "@/components/PDFJSViewer";
import pdfMake from 'pdfmake/build/pdfmake.js'
import Vue from "vue";
import {utils, metrics} from "../utils"
import standard_industrial_classification from "../standard_industrial_classification"
import RadarChart from "@/components/RadarChart";
import colors from "../colors"


export default {
  name: "Make_report",
  components: {
    RadarChart,
    BarChart,
    PDFJSViewer
  },
  data() {
    return {
      created_assessments: this.$assessments,  //Created assessments
      selected_industries: [],
      selected_assessments: [],
      doc: null,
      layers: Vue.prototype.$layers_description,
      generating_pdf: false,
      global_layers: utils.format_layer_description(Vue.prototype.$layers_description),
      include_future: true,
      yes_no: [{text: "Yes", value: true},{text: "No", value: false}],
      units_model: "bod",
      bod_to_cod: 1,
      bod_cod: [{text: "BOD", value: "bod"},{text: "COD", value: "cod"}],
      period_model: "daily",
      daily_annual_assessment: [{text: "Daily", value: "daily"},{text: "Annual", value: "annual"}, {text: "Assessment period", value: "assessment"}],
      selected_layers: [], //layers included in the report
      tab: 0,
      layers_table: {header: [], value: []},
      pollutants_table: {header: [], value: []},
      water_quantity: {header: [], value: []},
      treatment_efficiency_table: {header: [], value: []},
      reporting_indicators: {header: [], value: []},
      ecotoxicity_table: {header: [], value: []},
      eutrophication_table:  {header: [], value: []},
      emissions_table: {header: [], value: []},
      aggregation_level: "industry",
      aggregation_items: [{text: "Industry", value: "industry"}, {text: "Final product and supply chain", value: "supply_chain"}, {text: "Country", value: "country"}],

      ghg_emission_chart: {
        chartData: null,
        options: null
      },
      quantity_chart: {
        chartData: null,
        options: null
      },
      eutrophication_chart: {
        chartData: null,
        options: null
      },
      ecotoxicity_chart: {
        chartData: null,
        options: null
      },
      treatment_efficiency_chart: {
        chartData: null,
        options: null
      },


  }
  },
  watch: {
    aggregation_level: async function () {


      this.emissions_table = this.generate_emissions_table()
      this.water_quantity = await this.generate_water_quality_table()
      this.eutrophication_table = this.generate_eutrophication_table()
      this.ecotoxicity_table = this.generate_ecotoxicity_table()
      this.pollutants_table = await this.generate_pollutants_table()
      this.reporting_indicators = await this.generate_reporting_indicators_table()
      this.treatment_efficiency_table = this.generate_treatment_efficiency_table()
      this.layers_table = await this.generate_layers_table()


    },

    selected_layers: async function () {
      /*this.layers_table = await this.generate_layers_table()
      */
      this.emissions_table = this.generate_emissions_table()
      this.water_quantity = await this.generate_water_quality_table()
      this.eutrophication_table = this.generate_eutrophication_table()
      this.ecotoxicity_table = this.generate_ecotoxicity_table()
      this.pollutants_table = await this.generate_pollutants_table()
      this.reporting_indicators = await this.generate_reporting_indicators_table()
      this.treatment_efficiency_table = this.generate_treatment_efficiency_table()
      this.layers_table = await this.generate_layers_table()

    },

    selected_assessments: function (new_selected_assessments, old_value){

      if(new_selected_assessments.length > 0){
        this.selected_industries = []
        if (old_value.length == 0) this.tab = 0
        let _this = this
        new_selected_assessments.forEach(assessment => {
          assessment.industries.forEach(industry => {
            _this.selected_industries.push({
              "industry": industry,
              "assessment": assessment,
              "name": industry.name
            })
          })
        })

        Vue.nextTick(async function () {
          _this.emissions_table = _this.generate_emissions_table()
          _this.water_quantity = await _this.generate_water_quality_table()
          _this.eutrophication_table = _this.generate_eutrophication_table()
          _this.ecotoxicity_table = _this.generate_ecotoxicity_table()
          _this.pollutants_table = await _this.generate_pollutants_table()
          _this.reporting_indicators = await _this.generate_reporting_indicators_table()
          _this.treatment_efficiency_table = _this.generate_treatment_efficiency_table()
          _this.layers_table = await _this.generate_layers_table()


        })


        //if(new_selected_industries.length > 0) this.pieChart_base64()

      }
      else {
        this.selected_industries = []
      }
    },

    include_future: async function () {

      this.emissions_table = this.generate_emissions_table()
      this.water_quantity = await this.generate_water_quality_table()
      this.eutrophication_table = this.generate_eutrophication_table()
      this.ecotoxicity_table = this.generate_ecotoxicity_table()
      this.pollutants_table = await this.generate_pollutants_table()
      this.reporting_indicators = await this.generate_reporting_indicators_table()
      this.treatment_efficiency_table = this.generate_treatment_efficiency_table()
      this.layers_table = await this.generate_layers_table()



    },

    units_model: async function () {

      this.emissions_table = this.generate_emissions_table()
      this.water_quantity = await this.generate_water_quality_table()
      this.eutrophication_table = this.generate_eutrophication_table()
      this.ecotoxicity_table = this.generate_ecotoxicity_table()
      this.pollutants_table = await this.generate_pollutants_table()
      this.reporting_indicators = await this.generate_reporting_indicators_table()
      this.treatment_efficiency_table = this.generate_treatment_efficiency_table()
      this.layers_table = await this.generate_layers_table()




      this.bod_to_cod = 1
      if(this.units_model === "cod") this.bod_to_cod = 1/2.4
    },

    period_model: async function () {
      this.emissions_table = this.generate_emissions_table()
      this.water_quantity = await this.generate_water_quality_table()
      this.eutrophication_table = this.generate_eutrophication_table()
      this.ecotoxicity_table = this.generate_ecotoxicity_table()
      this.pollutants_table = await this.generate_pollutants_table()
      this.reporting_indicators = await this.generate_reporting_indicators_table()
      this.treatment_efficiency_table = this.generate_treatment_efficiency_table()
      this.layers_table = await this.generate_layers_table()




    },

    tab: async function () {

      let _this = this
      Vue.nextTick(async function () {
        if(_this.selected_assessments.length > 0){
          _this.emissions_table =_this.generate_emissions_table()
          _this.water_quantity = await _this.generate_water_quality_table()
          _this.eutrophication_table = _this.generate_eutrophication_table()
          _this.ecotoxicity_table = _this.generate_ecotoxicity_table()
          _this.pollutants_table = await _this.generate_pollutants_table()
          _this.reporting_indicators = await _this.generate_reporting_indicators_table()
          _this.treatment_efficiency_table = _this.generate_treatment_efficiency_table()
          _this.layers_table = await _this.generate_layers_table()
        }
      })


    },

  },
  methods: {

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

    generate_emissions_table() {

      let _this = this

      const groupedByAssessments = _.groupBy(this.selected_industries, function(n) {
        return n.assessment.name;
      });

      if(_this.tab !== undefined && Object.values(groupedByAssessments)[_this.tab] != undefined){

        let assessment = Object.values(groupedByAssessments)[_this.tab][0].assessment
        let assessment_days = utils.daysBetween(assessment.assessment_period_start, assessment.assessment_period_end)

        let days_factor = 1
        if(this.period_model === "annual") days_factor = 365
        else if(this.period_model === "assessment") days_factor = assessment_days

        let emission_table = {
          header: [{text: "", value: "value", sortable: false}],
          emissions: []
        }

        let elec = {value: "Indirect emissions from electricity consumption", unit: "kgCO2eq"}
        let fuel = {value: "Emissions from fuel engines", unit: "kgCO2eq"}
        let tre = {value: "Emissions from treatment", unit: "kgCO2eq"}
        let biog = {value: "Emissions from biogas", unit: "kgCO2eq"}
        let slu = {value: "Emissions from sludge management", unit: "kgCO2eq"}
        let reus = {value: "Emissions from water reuse transport", unit: "kgCO2eq"}
        let disc = {value: "Emissions from water discharged", unit: "kgCO2eq"}
        let supply_chain = {value: "Emissions for supply products to final product industry", unit: "kgCO2eq"}
        let total = {value: "Total emissions", unit: "kgCO2eq"}


        const data_chart = {
          labels: [],
          datasets: [{
            data: [],
            backgroundColor: []
          }]
        };

        for (const [key, industries] of Object.entries(_this.industries_aggregated())) {
          let total_emission = 0
          emission_table.header.push({
            text: key, value: key,
          })
          let emissions = metrics.emissions_and_descriptions(industries)
          if(Number.isFinite(emissions["wwt_KPI_GHG_elec"])){
            let value = (days_factor*emissions["wwt_KPI_GHG_elec"])
            elec[key] = value.toExponential(3)
            total_emission += value
          }else{
            elec[key] = Number(0).toFixed(3)
          }
          if(Number.isFinite(emissions["wwt_KPI_GHG_fuel"])){
            let value = emissions["wwt_KPI_GHG_fuel"]*days_factor
            fuel[key] = value.toExponential(3)
            total_emission += value

          }else{
            fuel[key] = Number(0).toFixed(3)
          }
          if(Number.isFinite(emissions["wwt_KPI_GHG_tre"])){
            let value = days_factor*emissions["wwt_KPI_GHG_tre"]
            tre[key] = value.toExponential(3)
            total_emission += value

          }else{
            tre[key] = Number(0).toFixed(3)
          }
          if(Number.isFinite(emissions["wwt_KPI_GHG_biog"])){
            let value = days_factor*emissions["wwt_KPI_GHG_biog"]
            biog[key] = value.toExponential(3)
            total_emission += value
          }else{
            biog[key] = Number(0).toFixed(3)
          }
          if(Number.isFinite(emissions["wwt_KPI_GHG_slu"])){
            let value = days_factor*emissions["wwt_KPI_GHG_slu"]
            slu[key] = value.toExponential(3)
            total_emission += value

          }else{
            slu[key] = Number(0).toFixed(3)
          }
          if(Number.isFinite(emissions["wwt_KPI_GHG_reus_trck"])){
            let value = days_factor*emissions["wwt_KPI_GHG_reus_trck"]
            reus[key] = value.toExponential(3)
            total_emission += value
          }else{
            reus[key] = Number(0).toFixed(3)
          }
          if(Number.isFinite(emissions["wwt_KPI_GHG_disc"])){
            let value = days_factor*emissions["wwt_KPI_GHG_disc"]
            disc[key] = value.toExponential(3)
            total_emission += value
          }else{
            disc[key] = Number(0).toFixed(3)
          }

          let raw_material_transport = days_factor*emissions["supply_chain_emissions"]
          supply_chain[key] = raw_material_transport.toExponential(3)
          total_emission += raw_material_transport

          total[key] = total_emission.toExponential(3)

          data_chart.datasets[0].data.push(total_emission)
          data_chart.labels.push(key)
          data_chart.datasets[0].backgroundColor.push(this.chooseColor(key))



        }

        emission_table.header.push({text: "Unit", value: "unit", sortable: false,})
        emission_table.emissions.push(elec)
        emission_table.emissions.push(fuel)
        emission_table.emissions.push(tre)
        emission_table.emissions.push(biog)
        emission_table.emissions.push(slu)
        emission_table.emissions.push(reus)
        emission_table.emissions.push(disc)
        emission_table.emissions.push(supply_chain)
        emission_table.emissions.push(total)

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


        _this.ghg_emission_chart = {
          chartData: data_chart,
          options: options
        }



        return emission_table
      }
      return {header: [], emissions: []}

    },


    generate_eutrophication_table() {

      let _this = this

      const groupedByAssessments = _.groupBy(this.selected_industries, function(n) {
        return n.assessment.name;
      });

      if(_this.tab !== undefined && _this.tab !== null && Object.values(groupedByAssessments)[_this.tab] != undefined){

        let assessment = Object.values(groupedByAssessments)[_this.tab][0].assessment
        let assessment_days = utils.daysBetween(assessment.assessment_period_start, assessment.assessment_period_end)

        let days_factor = 1
        if(this.period_model === "annual") days_factor = 365
        else if(this.period_model === "assessment") days_factor = assessment_days

        let pollutants_table = {
          header: [{text: "", value: "value", sortable: false}],
          value: []
        }

        let tn = {value: "TN", unit: "gPO4eq/m3"}
        let tp = {value: "TP", unit: "gPO4eq/m3"}
        let total = {value: "Total", unit: "gPO4eq/m3"}
        let cod = {value: "", unit: "gPO4eq/m3"}
        if(this.units_model === "bod") {
          cod.value = "BOD"
        }
        else {
          cod.value = "COD"
        }

        const data_chart = {
          labels: [],
          datasets: [{
            data: [],
            backgroundColor: []
          }]
        };

        for (const [key, industries] of Object.entries(_this.industries_aggregated())) {

          pollutants_table.header.push({
            text: key, value: key,
          })

          let eutrophication = metrics.eutrophication_potential(industries)

          let cod_value = eutrophication.cod
          if(Number.isFinite(cod_value)){
            cod[key] = ((days_factor*cod_value).toExponential(3))
          }else{
            cod[key] = (0).toExponential(3)
          }

          let tn_value = eutrophication.tn
          if(Number.isFinite(tn_value)){
            tn[key] = ((days_factor*tn_value).toExponential(3))
          }else{
            tn[key] = (0).toExponential(3)
          }

          let tp_value = eutrophication.tp
          if(Number.isFinite(tp_value)){
            tp[key] = ((days_factor*tp_value).toExponential(3))
          }else{
            tp[key] = (0).toExponential(3)
          }

          let total_value = eutrophication.total
          if(Number.isFinite(total_value)){
            total[key] = ((days_factor*total_value).toExponential(3))
          }else{
            total[key] = (0).toExponential(3)
          }

          data_chart.datasets[0].data.push(total_value)
          data_chart.labels.push(key)
          data_chart.datasets[0].backgroundColor.push('rgba(210,109,9,0.93)')

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


        _this.eutrophication_chart = {
          chartData: data_chart,
          options: options
        }

        pollutants_table.header.push({text: "Unit", value: "unit", sortable: false,})

        pollutants_table.value.push(cod)
        pollutants_table.value.push(tn)
        pollutants_table.value.push(tp)
        pollutants_table.value.push(total)

        return pollutants_table
      }
      else return {header: [], emissions: []}

    },

    generate_ecotoxicity_table() {

      let _this = this

      const groupedByAssessments = _.groupBy(this.selected_industries, function(n) {
        return n.assessment.name;
      });

      if(_this.tab !== undefined && _this.tab !== null && Object.values(groupedByAssessments)[_this.tab] != undefined){

        let assessment = Object.values(groupedByAssessments)[_this.tab][0].assessment
        let assessment_days = utils.daysBetween(assessment.assessment_period_start, assessment.assessment_period_end)

        let days_factor = 1
        if(this.period_model === "annual") days_factor = 365
        else if(this.period_model === "assessment") days_factor = assessment_days

        let pollutants_table = {
          header: [{text: "", value: "value", sortable: false}],
          value: []
        }

        let dichloroethane = {value: "1,2-Dichloroethane", unit: "TU/m3"}
        let cadmium = {value: "Cadmium", unit: "TU/m3"}
        let hexachlorobenzene = {value: "Hexachlorobenzene", unit: "TU/m3"}
        let mercury = {value: "Mercury", unit: "TU/m3"}
        let lead = {value: "Lead", unit: "TU/m3"}
        let nickel = {value: "Nickel", unit: "TU/m3"}
        let chloroalkanes = {value: "Chloroalkanes", unit: "TU/m3"}
        let hexaclorobutadie = {value: "Hexachlorobutadiene", unit: "TU/m3"}
        let nonylphenols = {value: "Nonylphenols", unit: "TU/m3"}
        let tetrachloroethene = {value: "Tetrachloroethene", unit: "TU/m3"}
        let trichloroethylene = {value: "Trichloroethylene", unit: "TU/m3"}
        let total = {value: "Total", unit: "TU/m3"}

        const data_chart = {
          labels: [],
          datasets: [{
            data: [],
            backgroundColor: []
          }]
        };

        for (const [key, industries] of Object.entries(_this.industries_aggregated())) {

          pollutants_table.header.push({
            text: key, value: key,
          })

          let tu = metrics.ecotoxicity_potential_tu(industries)

          let dichloroethane_value = tu.diclo
          if(Number.isFinite(dichloroethane_value)){
            dichloroethane[key] = ((days_factor*dichloroethane_value).toExponential(3))
          }else{
            dichloroethane[key] = (0).toExponential(3)
          }

          let cadmium_value = tu.cadmium
          if(Number.isFinite(cadmium_value)){
            cadmium[key] = ((days_factor*cadmium_value).toExponential(3))
          }else{
            cadmium[key] = (0).toExponential(3)
          }

          let hexaclorobenzene_value = tu.hexaclorobenzene
          if(Number.isFinite(hexaclorobenzene_value)){
            hexachlorobenzene[key] = ((days_factor*hexaclorobenzene_value).toExponential(3))
          }else{
            hexachlorobenzene[key] = (0).toExponential(3)
          }

          let mercury_value = tu.mercury
          if(Number.isFinite(mercury_value)){
            mercury[key] = ((days_factor*mercury_value).toExponential(3))
          }else{
            mercury[key] = (0).toExponential(3)
          }

          let lead_value = tu.lead
          if(Number.isFinite(lead_value)){
            lead[key] = ((days_factor*lead_value).toExponential(3))
          }else{
            lead[key] = (0).toExponential(3)
          }

          let nickel_value = tu.nickel
          if(Number.isFinite(nickel_value)){
            nickel[key] = ((days_factor*nickel_value).toExponential(3))
          }else{
            nickel[key] = (0).toExponential(3)
          }

          let chloroalkanes_value = tu.chloroalkanes
          if(Number.isFinite(chloroalkanes_value)){
            chloroalkanes[key] = ((days_factor*chloroalkanes_value).toExponential(3))
          }else{
            chloroalkanes[key] = (0).toExponential(3)
          }

          let hexaclorobutadie_value = tu.hexaclorobutadie
          if(Number.isFinite(hexaclorobutadie_value)){
            hexaclorobutadie[key] = ((days_factor*hexaclorobutadie_value).toExponential(3))
          }else{
            hexaclorobutadie[key] = (0).toExponential(3)
          }

          let nonylphenols_value = tu.nonylphenols
          if(Number.isFinite(nonylphenols_value)){
            nonylphenols[key] = ((days_factor*nonylphenols_value).toExponential(3))
          }else{
            nonylphenols[key] = (0).toExponential(3)
          }

          let tetrachloroethene_value = tu.tetracloroetile
          if(Number.isFinite(tetrachloroethene_value)){
            tetrachloroethene[key] = ((days_factor*tetrachloroethene_value).toExponential(3))
          }else{
            tetrachloroethene[key] = (0).toExponential(3)
          }

          let trichloroethylene_value = tu.tricloroetile
          if(Number.isFinite(trichloroethylene_value)){
            trichloroethylene[key] = ((days_factor*trichloroethylene_value).toExponential(3))
          }else{
            trichloroethylene[key] = (0).toExponential(3)
          }

          let total_value = tu.total
          if(Number.isFinite(total_value)){
            total[key] = ((days_factor*total_value).toExponential(3))
          }else{
            total[key] = (0).toExponential(3)
          }

          data_chart.datasets[0].data.push(total_value)
          data_chart.labels.push(key)
          data_chart.datasets[0].backgroundColor.push('rgba(210,109,9,0.93)')

        }

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
                labelString: 'TU/m3'
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


        _this.ecotoxicity_chart = {
          chartData: data_chart,
          options: options
        }


        pollutants_table.header.push({text: "Unit", value: "unit", sortable: false,})

        pollutants_table.value.push(dichloroethane)
        pollutants_table.value.push(cadmium)
        pollutants_table.value.push(hexachlorobenzene)
        pollutants_table.value.push(mercury)
        pollutants_table.value.push(lead)
        pollutants_table.value.push(nickel)
        pollutants_table.value.push(chloroalkanes)
        pollutants_table.value.push(hexaclorobutadie)
        pollutants_table.value.push(nonylphenols)
        pollutants_table.value.push(tetrachloroethene)
        pollutants_table.value.push(trichloroethylene)
        pollutants_table.value.push(total)

        return pollutants_table
      }
      else return {header: [], emissions: []}

    },

    async generate_reporting_indicators_table() {

      let _this = this

      const groupedByAssessments = _.groupBy(this.selected_industries, function(n) {
        return n.assessment.name;
      });

      if(_this.tab !== undefined && _this.tab !== null && Object.values(groupedByAssessments)[_this.tab] != undefined){

        let assessment = Object.values(groupedByAssessments)[_this.tab][0].assessment
        let assessment_days = utils.daysBetween(assessment.assessment_period_start, assessment.assessment_period_end)

        let days_factor = 1
        if(this.period_model === "annual") days_factor = 365
        else if(this.period_model === "assessment") days_factor = assessment_days

        let table = {
          header: [{text: "", value: "value", sortable: false}],
          value: []
        }

        let g4_en8 = {value: "Water withdrawal (GRI 303-1)", unit: "m3/year"}
        let g4_en9 = {value: "Effect of water withdrawal on the water body (GRI 303-2)", unit: "%", info: "If the value is greater than 5%, it means that the withdrawals significantly affect the water source"}
        let g4_en10 = {value: "Water recycled and reused (GRI 303-3)", unit: "%"}
        let g4_en22 = {value: "Water discharge (GRI 306-1)", unit: "m3/year"}
        let g4_en26 = {value: "Effect of water discharges on the water body (GRI 306-5)", unit: "%", info: "If the value is greater than 5%, it means that the discharges significantly affect the water source"}

        let wd = {value: "Water withdrawn (CDP W1.2b)", unit: "ML/year"}
        let dis = {value: "Water discharged (CDP W1.2b)", unit: "ML/year"}
        let re = {value: "Water reused (CDP W1.2b)", unit: "ML/year"}

        for (const [key, industries] of Object.entries(_this.industries_aggregated())) {
          let indicators = await metrics.reporting_metrics(industries, this.global_layers)

          table.header.push({
            text: key, value: key,
          })

          let en8 = indicators["g4-en8"]
          if(Number.isFinite(en8)){
            g4_en8[key] = ((365*en8).toExponential(3))
          }else{
            g4_en8[key] = Number(0).toExponential(3)
          }
          let en9 = indicators["g4-en9"]
          if(Number.isFinite(en9)){
            g4_en9[key] = ((365*en9).toFixed(3))
          }else{
            g4_en9[key] = Number(0).toFixed(3)
          }
          let en10 = indicators["g4-en10"]
          if(Number.isFinite(en10)){
            g4_en10[key] = ((365*en10).toFixed(3))
          }else{
            g4_en10[key] = Number(0).toFixed(3)
          }

          let en22 = indicators["g4-en22"]
          if(Number.isFinite(en22)){
            g4_en22[key] = ((365*en22).toExponential(3))
          }else{
            g4_en22[key] = Number(0).toExponential(3)
          }

          let en26 = indicators["g4-en26"]
          if(Number.isFinite(en26)){
            g4_en26[key] = ((365*en26).toFixed(3))
          }else{
            g4_en26[key] = Number(0).toFixed(3)
          }

          let wd_value = indicators["wd"]
          if(Number.isFinite(wd_value)){
            wd[key] = ((0.001*365*wd_value).toExponential(3))
          }else{
            wd[key] = Number(0).toExponential(3)
          }

          let dis_value = indicators["dis"]
          if(Number.isFinite(dis_value)){
            dis[key] = ((0.001*365*dis_value).toExponential(3))
          }else{
            dis[key] = Number(0).toExponential(3)
          }

          let re_value = indicators["dis"]
          if(Number.isFinite(re_value)){
            re[key] = ((0.001*365*re_value).toExponential(3))
          }else{
            re[key] = Number(0).toExponential(3)
          }
        }

        table.header.push({text: "Unit", value: "unit", sortable: false,})

        table.value.push(g4_en8)
        table.value.push(g4_en9)
        table.value.push(g4_en10)
        table.value.push(g4_en22)
        table.value.push(g4_en26)
        table.value.push(wd)
        table.value.push(dis)
        table.value.push(re)

        return table
      }
      else return {header: [], emissions: []}

    },
    async generate_water_quality_table() {

      let _this = this

      const groupedByAssessments = _.groupBy(this.selected_industries, function(n) {
        return n.assessment.name;
      });

      if(_this.tab !== undefined && _this.tab !== null && Object.values(groupedByAssessments)[_this.tab] != undefined){

        let assessment = Object.values(groupedByAssessments)[_this.tab][0].assessment
        let assessment_days = utils.daysBetween(assessment.assessment_period_start, assessment.assessment_period_end)

        let days_factor = 1
        if(this.period_model === "annual") days_factor = 365
        else if(this.period_model === "assessment") days_factor = assessment_days

        let pollutants_table = {
          header: [{text: "", value: "value", sortable: false}],
          value: []
        }

        let dilution_factor_row = {value: "Dilution factor", unit: "%", info: "Ratio of concentration in the effluent to concentration in the receiving water after mixing in the receiving water. Bigger values indicate less impact of the effluent concentration to the river."}
        let recycled_factor = {value: "Recycled water factor", unit: "%", info:"This metric indicates the percentage of the reused water used by the industry. Values that may have this metric range from 0 to 100, the larger its value the less impact it will generate."}
        let treated_factor = {value: "Treated water factor", unit: "%", info:"Amount of water treated in the treatment plant divided by the amount of water withdrawn. The higher the value, the better."}
        let available_ratio = {value: "Consumption available ratio", unit: "%", info: "This metric is calculated from the relationship between the amount of water withdrawn by the industry and the amount of water available and multiplied by 100. It indicates the percentage of the available water withdrawn by the industry’s consumption. This metric may have values ranging from 0, to a value greater than 100, indicating that the demand for water is higher than the available."}
        let efficiency_factor = {value: "Water efficiency", unit: "tonnes/m3", info: "Tonnes of product produced by the industry per cubic meter of water used"}
        let water_quality_standards = {value: "Environmental quality standards", unit: "%", info: "Percentage of emitted pollutants exceeding the maximum allowable concentration"}


        let data_chart = {
          labels: ["Recycled water factor", "Treated water factor", "Consumption available ratio", "Quality standards"],
          datasets: []
        };

        for (const [key, industries] of Object.entries(_this.industries_aggregated())) {
          pollutants_table.header.push({
            text: key, value: key,
          })

          let dilution_factor_value = await metrics.dilution_factor(this.global_layers, industries)
          if(Number.isFinite(dilution_factor_value)){
            dilution_factor_row[key] = (dilution_factor_value.toFixed(3))
          }else{
            dilution_factor_row[key] = (0).toFixed(3)
          }

          let recycled_water_factor_value = metrics.recycled_water_factor(industries)
          if(Number.isFinite(recycled_water_factor_value)){
            recycled_factor[key] = (recycled_water_factor_value.toFixed(3))
          }else{
            recycled_factor[key] = (0).toFixed(3)
          }

          let treated_water_factor = metrics.treated_water_factor(industries)
          if(Number.isFinite(treated_water_factor)){
            treated_factor[key] = (treated_water_factor.toFixed(3))
          }else{
            treated_factor[key] = (0).toFixed(3)
          }

          let available_ratio_value = await metrics.available_ratio(this.global_layers, industries)
          if(Number.isFinite(available_ratio_value)){
            available_ratio[key] = (available_ratio_value.toFixed(3))
          }else{
            available_ratio[key] = (0).toFixed(3)
          }


          if(Number.isFinite(metrics.efficiency_factor(industries))){
            efficiency_factor[key] = (metrics.efficiency_factor(industries).toExponential(3))
          }else{
            efficiency_factor[key] = (0).toExponential(3)
          }

          if(Number.isFinite(metrics.nqa(industries))){
            water_quality_standards[key] = metrics.nqa(industries).toFixed(3)
          }else{
            water_quality_standards[key] = (0).toFixed(3)
          }

          data_chart.datasets.push({
            data: [recycled_water_factor_value, treated_water_factor, available_ratio_value, metrics.nqa(industries)],
            label: key,
            backgroundColor: this.chooseColor(key).concat("70"),

          })
        }


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

        _this.quantity_chart = {
          chartData: data_chart,
          options: options
        }

        pollutants_table.header.push({text: "Unit", value: "unit", sortable: false,})

        pollutants_table.value.push(dilution_factor_row)
        pollutants_table.value.push(recycled_factor)
        pollutants_table.value.push(treated_factor)
        pollutants_table.value.push(available_ratio)
        pollutants_table.value.push(efficiency_factor)
        pollutants_table.value.push(water_quality_standards)


        return pollutants_table
      }
      else return {header: [], emissions: []}

    },

    generate_treatment_efficiency_table() {

      let _this = this

      const groupedByAssessments = _.groupBy(this.selected_industries, function(n) {
        return n.assessment.name;
      });

      if(_this.tab !== undefined && _this.tab !== null && Object.values(groupedByAssessments)[_this.tab] != undefined){

        let assessment = Object.values(groupedByAssessments)[_this.tab][0].assessment
        let assessment_days = utils.daysBetween(assessment.assessment_period_start, assessment.assessment_period_end)

        let days_factor = 1
        if(this.period_model === "annual") days_factor = 365
        else if(this.period_model === "assessment") days_factor = assessment_days

        let pollutants_table = {
          header: [{text: "", value: "value", sortable: false}],
          value: []
        }


        let tn = {value: "TN treatment efficiency", unit: "%"}
        let tp = {value: "TP treatment efficiency", unit: "%"}
        let dichloroethane = {value: "1,2-Dichloroethane treatment efficiency", unit: "%"}
        let cadmium = {value: "Cadmium treatment efficiency", unit: "%"}
        let hexachlorobenzene = {value: "Hexachlorobenzene treatment efficiency", unit: "%"}
        let mercury = {value: "Mercury treatment efficiency", unit: "%"}
        let lead = {value: "Lead treatment efficiency", unit: "%"}
        let nickel = {value: "Nickel treatment efficiency", unit: "%"}
        let chloroalkanes = {value: "Chloroalkanes treatment efficiency", unit: "%"}
        let hexaclorobutadie = {value: "Hexachlorobutadiene treatment efficiency", unit: "%"}
        let nonylphenols = {value: "Nonylphenols treatment efficiency", unit: "%"}
        let tetrachloroethene = {value: "Tetrachloroethene treatment efficiency", unit: "%"}
        let trichloroethylene = {value: "Trichloroethylene treatment efficiency", unit: "%"}
        let bod = {value: "", unit: "%"}
        if(this.units_model === "bod") {
          bod.value = "BOD treatment efficiency"
        }
        else {
          bod.value = "COD treatment efficiency"
        }

        let data_chart = {
          labels: ["BOD", "TN", "TP", "1,2-Dichloroethane", "Cadmium", "Hexachlorobenzene", "Mercury", "Lead", "Nickel", "Chloroalkanes", "Hexachlorobutadiene", "Nonylphenols", "Tetrachloroethene", "Trichloroethylene"],
          datasets: []
        };

        if(this.units_model === "cod") data_chart.labels[0] = "COD"

        for (const [key, industries] of Object.entries(_this.industries_aggregated())) {
          pollutants_table.header.push({
            text: key, value: key,
          })

          let tn_value = metrics.tn_efficiency(industries)
          if(Number.isFinite(tn_value)){
            tn[key] = ((tn_value).toFixed(3))
          }else{
            tn[key] = (0).toFixed(3)
          }
          let tp_value = metrics.tp_efficiency(industries)
          if(Number.isFinite(tp_value)){
            tp[key] = ((tp_value).toFixed(3))
          }else{
            tp[key] = (0).toFixed(3)
          }

          let bod_value = metrics.bod_efficiency(industries)
          if(Number.isFinite(bod_value)){
            bod[key] = ((bod_value).toFixed(3))
          }else{
            bod[key] =(0).toFixed(3)
          }

          let dichloroethane_value = metrics.dichloroethane_efficiency(industries)
          if(Number.isFinite(dichloroethane_value)){
            dichloroethane[key] = ((dichloroethane_value).toFixed(3))
          }else{
            dichloroethane[key] = (0).toFixed(3)
          }

          let cadmium_value = metrics.cadmium_efficiency(industries)
          if(Number.isFinite(cadmium_value)){
            cadmium[key] = ((cadmium_value).toFixed(3))
          }else{
            cadmium[key] = (0).toFixed(3)
          }

          let hexaclorobenzene_value = metrics.hexaclorobenzene_efficiency(industries)
          if(Number.isFinite(hexaclorobenzene_value)){
            hexachlorobenzene[key] = ((hexaclorobenzene_value).toFixed(3))
          }else{
            hexachlorobenzene[key] = (0).toFixed(3)
          }

          let mercury_value = metrics.mercury_efficiency(industries)
          if(Number.isFinite(mercury_value)){
            mercury[key] = ((mercury_value).toFixed(3))
          }else{
            mercury[key] = (0).toFixed(3)
          }

          let lead_value = metrics.lead_efficiency(industries)
          if(Number.isFinite(lead_value)){
            lead[key] = ((lead_value).toFixed(3))
          }else{
            lead[key] = (0).toFixed(3)
          }

          let nickel_value = metrics.nickel_efficiency(industries)
          if(Number.isFinite(nickel_value)){
            nickel[key] = ((nickel_value).toFixed(3))
          }else{
            nickel[key] = (0).toFixed(3)
          }

          let chloroalkanes_value = metrics.chloroalkanes_efficiency(industries)
          if(Number.isFinite(chloroalkanes_value)){
            chloroalkanes[key] = ((chloroalkanes_value).toFixed(3))
          }else{
            chloroalkanes[key] = (0).toFixed(3)
          }

          let hexaclorobutadie_value = metrics.hexaclorobutadie_efficiency(industries)
          if(Number.isFinite(hexaclorobutadie_value)){
            hexaclorobutadie[key] = ((hexaclorobutadie_value).toFixed(3))
          }else{
            hexaclorobutadie[key] = (0).toFixed(3)
          }

          let nonylphenols_value = metrics.nonylphenols_efficiency(industries)
          if(Number.isFinite(nonylphenols_value)){
            nonylphenols[key] = ((nonylphenols_value).toFixed(3))
          }else{
            nonylphenols[key] = (0).toFixed(3)
          }

          let tetrachloroethene_value = metrics.tetrachloroethene_efficiency(industries)
          if(Number.isFinite(tetrachloroethene_value)){
            tetrachloroethene[key] = ((tetrachloroethene_value).toFixed(3))
          }else{
            tetrachloroethene[key] = (0).toFixed(3)
          }

          let trichloroethylene_value = metrics.tricloroetile_efficiency(industries)
          if(Number.isFinite(trichloroethylene_value)){
            trichloroethylene[key] = ((trichloroethylene_value).toFixed(3))
          }else{
            trichloroethylene[key] = (0).toFixed(3)
          }

          data_chart.datasets.push({


            data: [bod_value, tn_value, tp_value, dichloroethane_value, cadmium_value, hexaclorobenzene_value, mercury_value, lead_value, nickel_value, chloroalkanes_value, hexaclorobutadie_value, nonylphenols_value, tetrachloroethene_value, trichloroethylene_value],
            label: key,
            backgroundColor: this.chooseColor(key).concat("70"),

          })
        }


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

        _this.treatment_efficiency_chart = {
          chartData: data_chart,
          options: options
        }

        pollutants_table.header.push({text: "Unit", value: "unit", sortable: false,})


        pollutants_table.value.push(bod)
        pollutants_table.value.push(tn)
        pollutants_table.value.push(tp)
        pollutants_table.value.push(dichloroethane)
        pollutants_table.value.push(cadmium)
        pollutants_table.value.push(hexachlorobenzene)
        pollutants_table.value.push(mercury)
        pollutants_table.value.push(lead)
        pollutants_table.value.push(nickel)
        pollutants_table.value.push(chloroalkanes)
        pollutants_table.value.push(hexaclorobutadie)
        pollutants_table.value.push(nonylphenols)
        pollutants_table.value.push(tetrachloroethene)
        pollutants_table.value.push(trichloroethylene)



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

    async generate_pollutants_table() {

      let _this = this

      const groupedByAssessments = _.groupBy(this.selected_industries, function(n) {
        return n.assessment.name;
      });

      if(_this.tab !== undefined && _this.tab !== null && Object.values(groupedByAssessments)[_this.tab] != undefined){

        let assessment = Object.values(groupedByAssessments)[_this.tab][0].assessment
        let assessment_days = utils.daysBetween(assessment.assessment_period_start, assessment.assessment_period_end)

        let days_factor = 1
        if(this.period_model === "annual") days_factor = 365
        else if(this.period_model === "assessment") days_factor = assessment_days

        let pollutants_table = {
          header: [{text: "", value: "value", sortable: false}],
          value: []
        }

        let tn = {value: "TN load increment", unit: "g/m3"}
        let tp = {value: "TP load increment", unit: "g/m3"}
        let dichloroethane = {value: "1,2-Dichloroethane load increment", unit: "g/m3"}
        let cadmium = {value: "Cadmium load increment", unit: "g/m3"}
        let hexachlorobenzene = {value: "Hexachlorobenzene load increment", unit: "g/m3"}
        let mercury = {value: "Mercury load increment", unit: "g/m3"}
        let lead = {value: "Lead load increment", unit: "g/m3"}
        let nickel = {value: "Nickel load increment", unit: "g/m3"}
        let chloroalkanes = {value: "Chloroalkanes load increment", unit: "g/m3"}
        let hexaclorobutadie = {value: "Hexachlorobutadiene load increment", unit: "g/m3"}
        let nonylphenols = {value: "Nonylphenols load increment", unit: "g/m3"}
        let tetrachloroethene = {value: "Tetrachloroethene load increment", unit: "g/m3"}
        let trichloroethylene = {value: "Trichloroethylene load increment", unit: "g/m3"}
        let tu = {value: "Toxic Units load increment", unit: "TU/m3"}

        let bod = {value: "", unit: "g/m3"}
        if(this.units_model === "bod") {
          bod.value = "BOD load increment"
        }
        else {
          bod.value = "COD load increment"
        }


        for (const [key, industries] of Object.entries(_this.industries_aggregated())) {
          pollutants_table.header.push({
            text: key, value: key,
          })

          let tn_value = await metrics.tn_effl(industries,this.global_layers)
          if(Number.isFinite(tn_value)){
            tn[key] = ((tn_value).toExponential(3))
          }else{
            tn[key] = (0).toExponential(3)
          }
          let tp_value = await metrics.tp_effl(industries, this.global_layers)
          if(Number.isFinite(tp_value)){
            tp[key] = ((tp_value).toExponential(3))
          }else{
            tp[key] = (0).toExponential(3)
          }

          let bod_value = await metrics.bod_effl(industries, this.global_layers)
          if(Number.isFinite(bod_value)){
            bod[key] = ((bod_value*this.bod_to_cod).toExponential(3))
          }else{
            bod[key] = (0).toExponential(3)
          }

          //let dbo_value = await metrics.dbo_in_river(this.global_layers, industry, assessment_days)

          let dichloroethane_value = await metrics.dichloroethane_effl(industries, this.global_layers)
          if(Number.isFinite(dichloroethane_value)){
            dichloroethane[key] = ((dichloroethane_value).toExponential(3))
          }else{
            dichloroethane[key] = (0).toExponential(3)
          }

          let cadmium_value = await metrics.cadmium_effl(industries, this.global_layers)
          if(Number.isFinite(cadmium_value)){
            cadmium[key] = ((cadmium_value).toExponential(3))
          }else{
            cadmium[key] = (0).toExponential(3)
          }

          let hexaclorobenzene_value = await metrics.hexaclorobenzene_effl(industries, this.global_layers)
          if(Number.isFinite(hexaclorobenzene_value)){
            hexachlorobenzene[key] = ((hexaclorobenzene_value).toExponential(3))
          }else{
            hexachlorobenzene[key] = (0).toExponential(3)
          }

          let mercury_value = await metrics.mercury_effl(industries, this.global_layers)
          if(Number.isFinite(mercury_value)){
            mercury[key] = ((mercury_value).toExponential(3))
          }else{
            mercury[key] = (0).toExponential(3)
          }

          let lead_value = await metrics.lead_effl(industries, this.global_layers)
          if(Number.isFinite(lead_value)){
            lead[key] = ((lead_value).toExponential(3))
          }else{
            lead[key] = (0).toExponential(3)
          }

          let nickel_value = await metrics.nickel_effl(industries, this.global_layers)
          if(Number.isFinite(nickel_value)){
            nickel[key] = ((nickel_value).toExponential(3))
          }else{
            nickel[key] = (0).toExponential(3)
          }

          let chloroalkanes_value = await  metrics.chloroalkanes_effl(industries, this.global_layers)
          if(Number.isFinite(chloroalkanes_value)){
            chloroalkanes[key] = ((chloroalkanes_value).toExponential(3))
          }else{
            chloroalkanes[key] = (0).toExponential(3)
          }

          let hexaclorobutadie_value = await metrics.hexaclorobutadie_effl(industries,this.global_layers)
          if(Number.isFinite(hexaclorobutadie_value)){
            hexaclorobutadie[key] = ((hexaclorobutadie_value).toExponential(3))
          }else{
            hexaclorobutadie[key] = (0).toExponential(3)
          }

          let nonylphenols_value = await metrics.nonylphenols_effl(industries, this.global_layers)
          if(Number.isFinite(nonylphenols_value)){
            nonylphenols[key] = ((nonylphenols_value).toExponential(3))
          }else{
            nonylphenols[key] = (0).toExponential(3)
          }

          let tetrachloroethene_value = await metrics.tetrachloroethene_effl(industries, this.global_layers)
          if(Number.isFinite(tetrachloroethene_value)){
            tetrachloroethene[key] = ((tetrachloroethene_value).toExponential(3))
          }else{
            tetrachloroethene[key] = (0).toExponential(3)
          }

          let trichloroethylene_value = await metrics.tricloroetile_effl(industries, this.global_layers)
          if(Number.isFinite(trichloroethylene_value)){
            trichloroethylene[key] = ((trichloroethylene_value).toExponential(3))
          }else{
            trichloroethylene[key] = (0).toExponential(3)
          }

          let tu_value = await metrics.delta_toxic_units(industries, this.global_layers)
          if(Number.isFinite(tu_value)){
            tu[key] = ((tu_value).toExponential(3))
          }else{
            tu[key] = (0).toExponential(3)
          }

        }

        pollutants_table.header.push({text: "Unit", value: "unit", sortable: false,})


        pollutants_table.value.push(bod)
        pollutants_table.value.push(tn)
        pollutants_table.value.push(tp)
        pollutants_table.value.push(dichloroethane)
        pollutants_table.value.push(cadmium)
        pollutants_table.value.push(hexachlorobenzene)
        pollutants_table.value.push(mercury)
        pollutants_table.value.push(lead)
        pollutants_table.value.push(nickel)
        pollutants_table.value.push(chloroalkanes)
        pollutants_table.value.push(hexaclorobutadie)
        pollutants_table.value.push(nonylphenols)
        pollutants_table.value.push(tetrachloroethene)
        pollutants_table.value.push(trichloroethylene)
        pollutants_table.value.push(tu)



        return pollutants_table
      }
      else return {header: [], emissions: []}

    },

    async generate_layers_table(){

      let selected_layers_formatted = this.selected_layers.map(function (layer) {
        return [layer.name, layer.layer]
      })

      const groupedByAssessments = _.groupBy(this.selected_industries, function(n) {
        return n.assessment.name;
      });

      let _this = this

      if(_this.tab !== undefined && _this.tab !== null && Object.values(groupedByAssessments)[_this.tab] != undefined){

        let assessment = Object.values(groupedByAssessments)[_this.tab][0].assessment
        let assessment_days = utils.daysBetween(assessment.assessment_period_start, assessment.assessment_period_end)

        let days_factor = 1
        if(this.period_model === "annual") days_factor = 365
        else if(this.period_model === "assessment") days_factor = assessment_days

        let layer_table = {
          header: [{text: "Layer", value: "layer", sortable: false}],
          value: []
        }

        for (const industryAux of Object.values(groupedByAssessments)[_this.tab]) {
          let industry = industryAux.industry
          layer_table.header.push({text: industry.name, value: industry.name})
        }
        layer_table.header.push({text: "Unit", value: "unit"})

        for (let [layer_name, info] of selected_layers_formatted) {
          let current_layer = {layer: layer_name}
          let future_layer = {layer: layer_name + " (BAU 2030)"}
          for (const industryAux of Object.values(groupedByAssessments)[_this.tab]) {
            let industry = industryAux.industry
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
      id++

      if(category.hasOwnProperty("children")){
        category.children.forEach(subcategory => {
          id = _this.add_identifier(subcategory, id)
        })

      }

      return id
    },

    async layers_table_pdf(dd, industries, assessment_days){

      let selected_layers_formatted = this.selected_layers.map(function (layer) {
        return [layer.name, layer.layer]
      })

      if (selected_layers_formatted.length > 0) { //Layer values on industry

        dd.content.push({
          text: "Global GIS Indicators\n\n",
          style: 'subheader'
        })


        let layers_to_include_in_report = [] //Layers to include in report (even the futre)
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
          for(const industryAux of industries) {
            let industry = industryAux.industry
            let lat = industry.location.lat
            let lng = industry.location.lng

            let row = [industry.name]
            for (let [layer_name, layer] of chunk) {

              //Baseline
              let baseline_data = await layer["data_for_report"](lat, lng)
              row.push(baseline_data)
              //Future

            }
            layers_description.table.body.push(row)
          }

          dd.content.push(layers_description)

        }

      }

    },

    emissions_table_pdf(dd, industries_aux, assessment_days) {

      let days_factor = 1
      if(this.period_model === "annual") days_factor = 365
      else if(this.period_model === "assessment") days_factor = assessment_days

      dd.content.push({
        text: "Global Warming Potential\n\n",
        style: 'subheader'
      })


      let industriesEmission = {
        table: {
          body: [
            [
              {text:'Industry', style: "bold"},
              {text:'Electricity consumption (kgCO2eq)',style: "bold"},
              {text:'Fuel engines (kgCO2eq)',style: "bold"},
              {text:"Water treatment (kgCO2eq)",style: "bold"},
              {text:"Biogas (kgCO2eq)",style: "bold"},
              {text:"Sludge management (kgCO2eq)",style: "bold"},
              {text:"Water reuse transport (kgCO2eq)",style: "bold"},
              {text:"Water discharged (kgCO2eq)",style: "bold"},
              {text:"Supply chain (kgCO2eq)",style: "bold"},
              {text:"Total (kgCO2eq)",style: "bold"},
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


      for (const [key, industries] of Object.entries(this.industries_aggregated())) {
        let total = 0
        let emissions = metrics.emissions_and_descriptions(industries)
        let row = [key]
        if(Number.isFinite(emissions["wwt_KPI_GHG_elec"])){
          let value = days_factor*emissions["wwt_KPI_GHG_elec"]
          row.push(value.toExponential(2))
          total += value
        }else{
          row.push((0).toFixed(2))
        }
        if(Number.isFinite(emissions["wwt_KPI_GHG_fuel"])){
          let value = days_factor*emissions["wwt_KPI_GHG_fuel"]
          row.push((value).toExponential(2))
          total += value
        }else{
          row.push((0).toFixed(2))
        }
        if(Number.isFinite(emissions["wwt_KPI_GHG_tre"])){
          let value = days_factor*emissions["wwt_KPI_GHG_tre"]
          row.push((value).toExponential(2))
          total += value
        }else{
          row.push((0).toFixed(2))
        }
        if(Number.isFinite(emissions["wwt_KPI_GHG_biog"])){
          let value = days_factor*emissions["wwt_KPI_GHG_biog"]
          row.push((value).toExponential(2))
          total += value
        }else{
          row.push((0).toFixed(2))
        }
        if(Number.isFinite(emissions["wwt_KPI_GHG_slu"])){
          let value = days_factor*emissions["wwt_KPI_GHG_slu"]
          row.push((value).toExponential(2))
          total += value
        }else{
          row.push((0).toFixed(2))
        }
        if(Number.isFinite(emissions["wwt_KPI_GHG_reus_trck"])){
          let value = days_factor*emissions["wwt_KPI_GHG_reus_trck"]
          row.push((value).toExponential(2))
          total += value
        }else{
          row.push((0).toFixed(2))
        }
        if(Number.isFinite(emissions["wwt_KPI_GHG_disc"])){
          let value = days_factor*emissions["wwt_KPI_GHG_disc"]
          row.push((value).toExponential(2))
          total += value
        }else{
          row.push((0).toFixed(2))
        }

        let raw_material_transport = days_factor*emissions["supply_chain_emissions"]
        row.push(raw_material_transport.toExponential(2))
        total += raw_material_transport

        row.push(total.toExponential(2))
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
      const ctx = document.getElementById('chart');
      let chart = new Chart(ctx, {
        type: "bar",
        data: data_chart,
        options: options
      });

      dd.content.push(industriesEmission)
      dd.content.push("\n\n")
      dd.content.push({
        image: chart.toBase64Image(),
        fit: [500, 500]
      })

    },

    async quality_quantity_indicators(dd, industries_aux, assessment_days) {

      let days_factor = 1
      if(this.period_model === "annual") days_factor = 365
      else if(this.period_model === "assessment") days_factor = assessment_days

      dd.content.push({
        text: "Availability & Quantity indicators\n\n",
        style: 'subheader'
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
              {text:"Water efficiency (tonnes/m3)",style: "bold"},
              {text:"Environmental Quality Standards (%)",style: "bold"},
            ]
          ]
        }
      }

      let data_chart = {
        labels: ["Recycled water factor", "Treated water factor", "Consumption available ratio", "Quality standards"],
        datasets: []
      };

      for (const [key, industries] of Object.entries(this.industries_aggregated())) {
        let row = [key]

        let dilution_factor_value = await metrics.dilution_factor(this.global_layers, industries)
        if(Number.isFinite(dilution_factor_value)){
          row.push(dilution_factor_value.toFixed(2))
        }else{
          row.push((0).toFixed(2))
        }

        let recycled_water_factor_value = metrics.recycled_water_factor(industries)
        if(Number.isFinite(recycled_water_factor_value)){
          row.push(recycled_water_factor_value.toFixed(2))
        }else{
          row.push((0).toFixed(2))
        }

        let treated_water_factor = metrics.treated_water_factor(industries)
        if(Number.isFinite(treated_water_factor)){
          row.push(treated_water_factor.toFixed(2))
        }else{
          row.push((0).toFixed(2))
        }

        let available_ratio_value = await metrics.available_ratio(this.global_layers, industries)
        if(Number.isFinite(available_ratio_value)){
          row.push(available_ratio_value.toFixed(2))
        }else{
          row.push((0).toFixed(2))
        }


        if(Number.isFinite(metrics.efficiency_factor(industries))){
          row.push(metrics.efficiency_factor(industries).toFixed(2))
        }else{
          row.push((0).toFixed(2))
        }

        if(Number.isFinite(metrics.nqa(industries))){
          row.push(metrics.nqa(industries).toFixed(2))
        }else{
          row.push((0).toFixed(2))
        }

        data_chart.datasets.push({
          data: [recycled_water_factor_value, treated_water_factor, available_ratio_value, metrics.nqa(industries)],
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
      let chart = new Chart(ctx, {
        type: "radar",
        data: data_chart,
        options: options
      });

      dd.content.push(industriesIndicator)
      dd.content.push("\n\n")
      dd.content.push({
        image: chart.toBase64Image(),
        fit: [500, 500]
      })

    },

    eutrophication_pdf(dd, industries_aux, assessment_days) {

      let days_factor = 1
      if(this.period_model === "annual") days_factor = 365
      else if(this.period_model === "assessment") days_factor = assessment_days

      dd.content.push({
        text: "Eutrophication Potential\n\n",
        style: 'subheader'
      })



      let industriesEutrophication = {
        table: {
          body: [
            [
              {text:'Industry', style: "bold"},
              {text: this.units_model == "bod" ? "BOD (gPO4eq/m3)" : "COD (gPO4eq/m3)" , style: "bold"},
              {text:'TN (gPO4eq/m3)',style: "bold"},
              {text:'TP (gPO4eq/m3)',style: "bold"},
              {text:"Total (gPO4eq/m3)",style: "bold"},
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


      for (const [key, industries] of Object.entries(this.industries_aggregated())) {

        let eutrophication = metrics.eutrophication_potential(industries)
        let row = [key]

        let cod_value = eutrophication.cod
        if(Number.isFinite(cod_value)){
          row.push((days_factor*cod_value).toExponential(2))
        }else{
          row.push((0).toExponential(2))
        }

        let tn_value = eutrophication.tn
        if(Number.isFinite(tn_value)){
          row.push((days_factor*tn_value).toExponential(2))
        }else{
          row.push((0).toExponential(2))
        }

        let tp_value = eutrophication.tp
        if(Number.isFinite(tp_value)){
          row.push((days_factor*tp_value).toExponential(2))
        }else{
          row.push((0).toExponential(2))
        }

        let total_value = eutrophication.total
        if(Number.isFinite(total_value)){
          row.push((days_factor*total_value).toExponential(2))
        }else{
          row.push((0).toExponential(2))
        }

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
      let chart = new Chart(ctx, {
        type: "bar",
        data: data_chart,
        options: options
      });

      dd.content.push(industriesEutrophication)
      dd.content.push("\n\n")
      dd.content.push({
        image: chart.toBase64Image(),
        fit: [500, 500]
      })

    },

    ecotoxicity_pdf(dd, industries_aux, assessment_days) {

      let days_factor = 1
      if(this.period_model === "annual") days_factor = 365
      else if(this.period_model === "assessment") days_factor = assessment_days

      dd.content.push({
        text: "Ecotoxicity Potential\n\n",
        style: 'subheader'
      })

      let industriesEcotoxicity = {
        table: {
          body: [
            [
              {text:'Industry', style: "bold"},
              [
                {text: [{text: "1,2-DCE", style: "bold"}, {text: "1" , sup: true, style: "asterisk"},]},
                {text: "(TU)", style: "bold"},

              ], //1,2-Dichloroethane
              {text:'Cadmium (TU)',style: "bold"},
              [
                {text: [{text: "HBC", style: "bold"}, {text: "2" , sup: true, style: "asterisk"},]},
                {text: "(TU)", style: "bold"},

              ], //Hexachlorobenzene

              {text:"Mercury (TU)",style: "bold"},
              {text:"Lead (TU)",style: "bold"},
              {text:"Nickel (TU)",style: "bold"},
              {text:"Chloroalkanes (TU)",style: "bold"},
              [
                {text: [{text: "HCBD", style: "bold"}, {text: "3" , sup: true, style: "asterisk"},]},
                {text: "(TU)", style: "bold"},

              ], //Hexachlorobutadiene
              [
                {text: [{text: "NP", style: "bold"}, {text: "4" , sup: true, style: "asterisk"},]},
                {text: "(TU)", style: "bold"},

              ], //Nonylphenols
              [
                {text: [{text: "PCE", style: "bold"}, {text: "5" , sup: true, style: "asterisk"},]},
                {text: "(TU)", style: "bold"},
              ], //Tetrachloroethene
              [
                {text: [{text: "TCE", style: "bold"}, {text: "6" , sup: true, style: "asterisk"},]},
                {text: "(TU)", style: "bold"},
              ], //trichloroethylene
              {text:"Total (TU)",style: "bold"},
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


      for (const [key, industries] of Object.entries(this.industries_aggregated())) {

        let row = [key]
        let tu = metrics.ecotoxicity_potential_tu(industries)

        let dichloroethane_value = tu.diclo
        if(Number.isFinite(dichloroethane_value)){
          row.push((days_factor*dichloroethane_value).toExponential(2))
        }else{
          row.push(Number(0).toExponential(2))
        }

        let cadmium_value = tu.cadmium
        if(Number.isFinite(cadmium_value)){
          row.push((days_factor*cadmium_value).toExponential(2))
        }else{
          row.push(Number(0).toExponential(2))
        }

        let hexaclorobenzene_value = tu.hexaclorobenzene
        if(Number.isFinite(hexaclorobenzene_value)){
          row.push((days_factor*hexaclorobenzene_value).toExponential(2))
        }else{
          row.push(Number(0).toExponential(2))
        }

        let mercury_value = tu.mercury
        if(Number.isFinite(mercury_value)){
          row.push((days_factor*mercury_value).toExponential(2))
        }else{
          row.push(Number(0).toExponential(2))
        }

        let lead_value = tu.lead
        if(Number.isFinite(lead_value)){
          row.push((days_factor*lead_value).toExponential(2))
        }else{
          row.push(Number(0).toExponential(2))
        }

        let nickel_value = tu.nickel
        if(Number.isFinite(nickel_value)){
          row.push((days_factor*nickel_value).toExponential(2))
        }else{
          row.push(Number(0).toExponential(2))
        }

        let chloroalkanes_value = tu.chloroalkanes
        if(Number.isFinite(chloroalkanes_value)){
          row.push((days_factor*chloroalkanes_value).toExponential(2))
        }else{
          row.push(Number(0).toExponential(2))
        }

        let hexaclorobutadie_value = tu.hexaclorobutadie
        if(Number.isFinite(hexaclorobutadie_value)){
          row.push((days_factor*hexaclorobutadie_value).toExponential(2))
        }else{
          row.push(Number(0).toExponential(2))
        }

        let nonylphenols_value = tu.nonylphenols
        if(Number.isFinite(nonylphenols_value)){
          row.push((days_factor*nonylphenols_value).toExponential(2))
        }else{
          row.push(Number(0).toExponential(2))
        }

        let tetrachloroethene_value = tu.tetracloroetile
        if(Number.isFinite(tetrachloroethene_value)){
          row.push((days_factor*tetrachloroethene_value).toExponential(2))
        }else{
          row.push(Number(0).toExponential(2))
        }

        let trichloroethylene_value = tu.tricloroetile
        if(Number.isFinite(trichloroethylene_value)){
          row.push((days_factor*trichloroethylene_value).toExponential(2))
        }else{
          row.push(Number(0).toExponential(2))
        }

        let total_value = tu.total
        if(Number.isFinite(total_value)){
          row.push((days_factor*total_value).toExponential(2))
        }else{
          row.push(Number(0).toExponential(2))
        }

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
      let chart = new Chart(ctx, {
        type: "bar",
        data: data_chart,
        options: options
      });

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

      dd.content.push("\n\n")
      dd.content.push({
        image: chart.toBase64Image(),
        fit: [500, 500]
      })

    },

    async delta_pdf(dd, industries_aux, assessment_days) {

      let days_factor = 1
      if(this.period_model === "annual") days_factor = 365
      else if(this.period_model === "assessment") days_factor = assessment_days

      dd.content.push({
        text: "Increment in pollutant load after discharging water\n\n",
        style: 'subheader'
      })


      let industriesDelta = {
        table: {
          body: [
            [
              {text:'Industry', style: "bold"},
              {text: this.units_model === "BOD" ? 'BOD (g/m3)' : "COD (g/m3)",style: "bold"},
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
                {text: [{text: "HCBD", style: "bold"}, {text: "3" , sup: true, style: "asterisk"}, {text: "(g/m3)", style: "bold"}]},

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
              {text:"Toxic units (TU/m3)",style: "bold"},
            ]
          ]
        }
      }



      for (const [key, industries] of Object.entries(this.industries_aggregated())) {

        let row = [key]
        let row_1 = [key]

        let bod_value = await metrics.bod_effl(industries, this.global_layers)
        if(Number.isFinite(bod_value)){
         row.push((bod_value*this.bod_to_cod).toExponential(2))
        }else{
          row.push(Number(0).toExponential(2))
        }

        let tn_value = await metrics.tn_effl(industries,this.global_layers)
        if(Number.isFinite(tn_value)){
          row.push((tn_value).toExponential(2))
        }else{
          row.push(Number(0).toExponential(2))
        }
        let tp_value = await metrics.tp_effl(industries, this.global_layers)
        if(Number.isFinite(tp_value)){
          row.push((tp_value).toExponential(2))
        }else{
          row.push(Number(0).toExponential(2))
        }

        let dichloroethane_value = await metrics.dichloroethane_effl(industries, this.global_layers)
        if(Number.isFinite(dichloroethane_value)){
          row.push((dichloroethane_value).toExponential(2))
        }else{
          row.push(Number(0).toExponential(2))
        }

        let cadmium_value = await metrics.cadmium_effl(industries, this.global_layers)
        if(Number.isFinite(cadmium_value)){
          row.push((cadmium_value).toExponential(2))
        }else{
          row.push(Number(0).toExponential(2))
        }

        let hexaclorobenzene_value = await metrics.hexaclorobenzene_effl(industries, this.global_layers)
        if(Number.isFinite(hexaclorobenzene_value)){
          row.push((hexaclorobenzene_value).toExponential(2))
        }else{
          row.push(Number(0).toExponential(2))
        }

        let mercury_value = await metrics.mercury_effl(industries, this.global_layers)
        if(Number.isFinite(mercury_value)){
          row.push((mercury_value).toExponential(2))
        }else{
          row.push(Number(0).toExponential(2))
        }

        let lead_value = await metrics.lead_effl(industries, this.global_layers)
        if(Number.isFinite(lead_value)){
          row.push((lead_value).toExponential(2))
        }else{
          row.push(Number(0).toExponential(2))
        }

        let nickel_value = await metrics.nickel_effl(industries, this.global_layers)
        if(Number.isFinite(nickel_value)){
          row.push((nickel_value).toExponential(2))
        }else{
          row.push(Number(0).toExponential(2))
        }

        let chloroalkanes_value = await  metrics.chloroalkanes_effl(industries, this.global_layers)
        if(Number.isFinite(chloroalkanes_value)){
          row.push((chloroalkanes_value).toExponential(2))
        }else{
          row.push(Number(0).toExponential(2))
        }

        let hexaclorobutadie_value = await metrics.hexaclorobutadie_effl(industries,this.global_layers)
        if(Number.isFinite(hexaclorobutadie_value)){
          row_1.push((hexaclorobutadie_value).toExponential(2))
        }else{
          row_1.push(Number(0).toExponential(2))
        }

        let nonylphenols_value = await metrics.nonylphenols_effl(industries, this.global_layers)
        if(Number.isFinite(nonylphenols_value)){
          row_1.push((nonylphenols_value).toExponential(2))
        }else{
          row_1.push(Number(0).toExponential(2))
        }

        let tetrachloroethene_value = await metrics.tetrachloroethene_effl(industries, this.global_layers)
        if(Number.isFinite(tetrachloroethene_value)){
          row_1.push((tetrachloroethene_value).toExponential(2))
        }else{
          row_1.push(Number(0).toExponential(2))
        }

        let trichloroethylene_value = await metrics.tricloroetile_effl(industries, this.global_layers)
        if(Number.isFinite(trichloroethylene_value)){
          row_1.push((trichloroethylene_value).toExponential(2))
        }else{
          row_1.push(Number(0).toExponential(2))
        }

        let tu_value = await metrics.delta_toxic_units(industries, this.global_layers)
        if(Number.isFinite(tu_value)){
          row_1.push((tu_value).toExponential(2))
        }else{
          row_1.push(Number(0).toExponential(2))
        }


        industriesDelta.table.body.push(row)
        industriesDelta_1.table.body.push(row_1)

      }

      dd.content.push(industriesDelta)
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


    },

    efficiency_pdf(dd, industries_aux, assessment_days) {

      let days_factor = 1
      if(this.period_model === "annual") days_factor = 365
      else if(this.period_model === "assessment") days_factor = assessment_days

      dd.content.push({
        text: "Pollutant treatment efficiency\n\n",
        style: 'subheader'
      })


      let industriesEfficiency = {
        table: {
          body: [
            [
              {text:'Industry', style: "bold"},
              {text: this.units_model === "BOD" ? 'BOD (%)' : "COD (%)",style: "bold"},
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
        labels: ["BOD", "TN", "TP", "1,2-Dichloroethane", "Cadmium", "Hexachlorobenzene", "Mercury", "Lead", "Nickel", "Chloroalkanes", "Hexachlorobutadiene", "Nonylphenols", "Tetrachloroethene", "Trichloroethylene"],
        datasets: []
      };

      for (const [key, industries] of Object.entries(this.industries_aggregated())) {
        let row = [key]
        let row_1 = [key]

        let bod_value = metrics.bod_efficiency(industries)
        if(Number.isFinite(bod_value)){
          row.push((bod_value).toFixed(2))
        }else{
          row.push((0).toFixed(2))
        }

        let tn_value = metrics.tn_efficiency(industries)
        if(Number.isFinite(tn_value)){
          row.push((tn_value).toFixed(2))
        }else{
          row.push((0).toFixed(2))
        }
        let tp_value = metrics.tp_efficiency(industries)
        if(Number.isFinite(tp_value)){
          row.push((tp_value).toFixed(2))
        }else{
          row.push((0).toFixed(2))
        }

        let dichloroethane_value = metrics.dichloroethane_efficiency(industries)
        if(Number.isFinite(dichloroethane_value)){
          row.push((dichloroethane_value).toFixed(2))
        }else{
          row.push((0).toFixed(2))
        }

        let cadmium_value = metrics.cadmium_efficiency(industries)
        if(Number.isFinite(cadmium_value)){
          row.push((cadmium_value).toFixed(2))
        }else{
          row.push((0).toFixed(2))
        }

        let hexaclorobenzene_value = metrics.hexaclorobenzene_efficiency(industries)
        if(Number.isFinite(hexaclorobenzene_value)){
          row.push((hexaclorobenzene_value).toFixed(2))
        }else{
          row.push((0).toFixed(2))
        }

        let mercury_value = metrics.mercury_efficiency(industries)
        if(Number.isFinite(mercury_value)){
          row.push((mercury_value).toFixed(2))
        }else{
          row.push((0).toFixed(2))
        }

        let lead_value = metrics.lead_efficiency(industries)
        if(Number.isFinite(lead_value)){
          row.push((lead_value).toFixed(2))
        }else{
          row.push((0).toFixed(2))
        }

        let nickel_value = metrics.nickel_efficiency(industries)
        if(Number.isFinite(nickel_value)){
          row.push((nickel_value).toFixed(2))
        }else{
          row.push((0).toFixed(2))
        }

        let chloroalkanes_value = metrics.chloroalkanes_efficiency(industries)
        if(Number.isFinite(chloroalkanes_value)){
          row.push((chloroalkanes_value).toFixed(2))
        }else{
          row.push((0).toFixed(2))
        }

        let hexaclorobutadie_value = metrics.hexaclorobutadie_efficiency(industries)
        if(Number.isFinite(hexaclorobutadie_value)){
          row_1.push((hexaclorobutadie_value).toFixed(2))
        }else{
          row_1.push((0).toFixed(2))
        }

        let nonylphenols_value = metrics.nonylphenols_efficiency(industries)
        if(Number.isFinite(nonylphenols_value)){
          row_1.push((nonylphenols_value).toFixed(2))
        }else{
          row_1.push((0).toFixed(2))
        }

        let tetrachloroethene_value = metrics.tetrachloroethene_efficiency(industries)
        if(Number.isFinite(tetrachloroethene_value)){
          row_1.push((tetrachloroethene_value).toFixed(2))
        }else{
          row_1.push((0).toFixed(2))
        }

        let trichloroethylene_value = metrics.tricloroetile_efficiency(industries)
        if(Number.isFinite(trichloroethylene_value)){
          row_1.push((trichloroethylene_value).toFixed(2))
        }else{
          row_1.push((0).toFixed(2))
        }

        data_chart.datasets.push({
          data: [bod_value, tn_value, tp_value, dichloroethane_value, cadmium_value, hexaclorobenzene_value, mercury_value, lead_value, nickel_value, chloroalkanes_value, hexaclorobutadie_value, nonylphenols_value, tetrachloroethene_value, trichloroethylene_value],
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
      let chart = new Chart(ctx, {
        type: "radar",
        data: data_chart,
        options: options
      });

      dd.content.push(industriesEfficiency)
      dd.content.push("\n\n")
      dd.content.push(industriesEfficiency_1)
      dd.content.push("\n\n")
      dd.content.push({
        image: chart.toBase64Image(),
        fit: [500, 500]
      })

    },

    async reporting_pdf(dd, industries_aux, assessment_days) {

      let days_factor = 1
      if(this.period_model === "annual") days_factor = 365
      else if(this.period_model === "assessment") days_factor = assessment_days

      dd.content.push({
        text: "Reporting indicators\n\n",
        style: 'subheader'
      })

      let industriesIndicator = {
        table: {
          body: [
            [
              {text:'Industry', style: "bold"},
              {text:'Water withdrawal (GRI 303-1) (m3/year)',style: "bold"},
              {text:'Effect of water withdrawal on the water body (GRI 303-2) (%)',style: "bold"},
              {text:"Water recycled and reused (GRI 303-3) (%)",style: "bold"},
              {text:"Water discharge (GRI 306-1) (m3/year)",style: "bold"},
              {text:"Effect of water discharges on the water body (GRI 306-5) (%)",style: "bold"},
              {text:"Water withdrawn (CDP W1.2b) (ML/year)",style: "bold"},
              {text:"Water discharged (CDP W1.2b) (ML/year)",style: "bold"},
              {text:"Water reused (CDP W1.2b) (ML/year)",style: "bold"},

            ]
          ]
        }
      }

      for (const [key, industries] of Object.entries(this.industries_aggregated())) {
        let row = [key]

        let indicators = await metrics.reporting_metrics(industries, this.global_layers)


        let en8 = indicators["g4-en8"]
        if(Number.isFinite(en8)){
          row.push((365*en8).toExponential(2))
        }else{
          row.push((0).toExponential(2))
        }
        let en9 = indicators["g4-en9"]
        if(Number.isFinite(en9)){
          row.push((365*en9).toFixed(2))
        }else{
          row.push((0).toFixed(2))
        }
        let en10 = indicators["g4-en10"]
        if(Number.isFinite(en10)){
          row.push((365*en10).toFixed(2))
        }else{
          row.push((0).toFixed(2))
        }

        let en22 = indicators["g4-en22"]
        if(Number.isFinite(en22)){
          row.push((365*en22).toExponential(2))
        }else{
          row.push((0).toExponential(2))
        }

        let en26 = indicators["g4-en26"]
        if(Number.isFinite(en26)){
          row.push((365*en26).toFixed(2))
        }else{
          row.push((0).toFixed(2))
        }

        let wd_value = indicators["wd"]
        if(Number.isFinite(wd_value)){
          row.push((0.001*365*wd_value).toExponential(2))
        }else{
          row.push((0).toExponential(2))
        }

        let dis_value = indicators["dis"]
        if(Number.isFinite(dis_value)){
          row.push((0.001*365*dis_value).toExponential(2))
        }else{
          row.push((0).toExponential(2))
        }

        let re_value = indicators["dis"]
        if(Number.isFinite(re_value)){
          row.push((0.001*365*re_value).toExponential(2))
        }else{
          row.push((0).toExponential(2))
        }

        industriesIndicator.table.body.push(row)

      }

      dd.content.push(industriesIndicator)
      dd.content.push("\n\n")

    },

    /*async layers_pdf(dd, industries_aux, assessment_days) {

      let days_factor = 1
      if(this.period_model === "annual") days_factor = 365
      else if(this.period_model === "assessment") days_factor = assessment_days

      dd.content.push({
        text: "Selected layers\n\n",
        style: 'subheader'
      })


      let industriesIndicator = {
        table: {
          body: []
        }
      }

      let selected_layers_formatted = this.selected_layers.map(function (layer) {
        return [layer.name, layer.layer]
      })

      let header_row = [{text:'Industry', style: "bold"},]
      for (let [layer_name, info] of selected_layers_formatted) {

        let current_layer = {layer: layer_name}
        header_row.push({text:layer_name, style: "bold"},)
        if (info.future && this.include_future) {
          let future_layer = {layer: layer_name + " (BAU 2030)"}
          header_row.push({text:future_layer, style: "bold"},)
        }
      }

      industriesIndicator.table.body.push(header_row)

      for (let [layer_name, info] of selected_layers_formatted) {

        let row = [industry.name]
        let row_future = [industry.name]

        for (const industryAux of industries_aux) {
          let industry = industryAux.industry
          let lat = industry.location.lat
          let lng = industry.location.lng



          //Baseline
          let baseline_data = await info.layers.baseline.annual.layer["data_for_report"](lat, lng)
          row.push(baseline_data)

          if (info.future && this.include_future) {
            let future_data = await info.layers.future.layer["data_for_report"](lat, lng)
            row_future.push(future_data)
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


    for (const [key, industries] of Object.entries(this.industries_aggregated())) {
        let row = [key]

        let indicators = await metrics.reporting_metrics(industries, this.global_layers)


        let en8 = indicators["g4-en8"]
        if(Number.isFinite(en8)){
          row.push((365*en8).toExponential(3))
        }else{
          row.push("-")
        }
        let en9 = indicators["g4-en9"]
        if(Number.isFinite(en9)){
          row.push((365*en9).toExponential(3))
        }else{
          row.push("-")
        }
        let en10 = indicators["g4-en10"]
        if(Number.isFinite(en10)){
          row.push((365*en10).toExponential(3))
        }else{
          row.push("-")
        }

        let en22 = indicators["g4-en22"]
        if(Number.isFinite(en22)){
          row.push((365*en22).toExponential(3))
        }else{
          row.push("-")
        }

        let en26 = indicators["g4-en26"]
        if(Number.isFinite(en26)){
          row.push((365*en26).toExponential(3))
        }else{
          row.push("-")
        }

        let wd_value = indicators["wd"]
        if(Number.isFinite(wd_value)){
          row.push((0.001*365*wd_value).toExponential(3))
        }else{
          row.push("-")
        }

        let dis_value = indicators["dis"]
        if(Number.isFinite(dis_value)){
          row.push((0.001*365*dis_value).toExponential(3))
        }else{
          row.push("-")
        }

        let re_value = indicators["dis"]
        if(Number.isFinite(re_value)){
          row.push((0.001*365*re_value).toExponential(3))
        }else{
          row.push("-")
        }

        industriesIndicator.table.body.push(row)

      }

      dd.content.push(industriesIndicator)
      dd.content.push("\n\n")

    },*/

    industries_aggregated(){
      let _this = this

      const groupedByAssessments = _.groupBy(this.selected_industries, function(n) {
        return n.assessment.name;
      });

      if(_this.tab !== undefined && _this.tab !== null && Object.values(groupedByAssessments)[_this.tab] != undefined){

        let industriesOfassessment = Object.values(groupedByAssessments)[_this.tab].map(industry => {return industry.industry})
        if(_this.aggregation_level == "country"){
          //Agrupació per països
          const groupedByCountry = _.groupBy(industriesOfassessment, function(industry) {
            return utils.get_country_code_from_coordinates(industry.location.lat, industry.location.lng)
          }) //Array of arrays of industries
          return groupedByCountry
        }
        else if(_this.aggregation_level == "industry"){
          let industries = {}
          industriesOfassessment.forEach(industry => {
            industries[industry.name] = [industry]
          })
          return industries
        } else if(_this.aggregation_level == "supply_chain"){
          let industries = {}
          industriesOfassessment.filter(industry => {
            return industry.operation_type == "Final product"
          }).forEach(industry => {
            industries[industry.name] = [industry]
          })
          industriesOfassessment.filter(industry => {
            return industry.operation_type == "Supply chain"
          }).forEach(industry => {
            industries[industry.industry_provided].push(industry)
          })
          return industries
        }
      }
    },

    async generate_pdf(){
      this.generating_pdf = true

      if (pdfMake.vfs == undefined){
        let pdfFonts = require('pdfmake/build/vfs_fonts.js')
        pdfMake.vfs = pdfFonts.pdfMake.vfs;
      }

      let dd = {
        pageSize: 'A4',
        pageOrientation: 'landscape',
        pageMargins: [67, 42, 30, 42],
        content: [],
        styles: {
          header: {
            fontSize: 18,
            bold: true
          },
          subheader: {
            fontSize: 12,
            bold: true
          },
          tableHeader: {
            bold: true,
            fontSize: 12,
            color: 'black'
          },
          bold: {
            bold: true
          },
          asterisk: {
            color: "red"
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
                  {text:"Operation type", style: "bold"},
                  {text:"Supplies to", style: "bold"},
                  {text:"Assessment period (days)", style: "bold"},
                ]
            ]
          }
        }

        industries.forEach(industryAux => {
          let industry = industryAux.industry
          industriesSummary.table.body.push(
              [
                industry.name,
                industry.location.lat.toFixed(3),
                industry.location.lng.toFixed(3),
                industry.industry_type === null ? "-" : industry.industry_type,
                industry.operation_type,
                industry.industry_provided === null ? "-" : industry.industry_provided,
                assessment_days
              ]
          )
        })

        dd.content.push(industriesSummary)
        dd.content.push("\n\n")


        this.emissions_table_pdf(dd, industries, assessment_days)
        dd.content.push("\n\n")
        await this.quality_quantity_indicators(dd, industries, assessment_days)
        dd.content.push("\n\n")
        this.eutrophication_pdf(dd, industries, assessment_days)
        dd.content.push("\n\n")
        this.ecotoxicity_pdf(dd, industries, assessment_days)
        dd.content.push("\n\n")
        await this.delta_pdf(dd, industries, assessment_days)
        dd.content.push("\n\n")
        this.efficiency_pdf(dd, industries, assessment_days)
        dd.content.push("\n\n")
        await this.reporting_pdf(dd, industries, assessment_days)
        dd.content.push("\n\n")
        await this.layers_table_pdf(dd, industries, assessment_days)
      }


      this.generating_pdf = false
      pdfMake.createPdf(dd).download();

    },
  },


  computed: {

    industry_table() {

      let _this = this

      const groupedByAssessments = _.groupBy(this.selected_industries, function(n) {
        return n.assessment.name;
      });

      if(_this.tab !== undefined && _this.tab !== null && Object.values(groupedByAssessments)[_this.tab] != undefined){

        let assessment = Object.values(groupedByAssessments)[_this.tab][0].assessment
        let assessment_days = utils.daysBetween(assessment.assessment_period_start, assessment.assessment_period_end)

        let table = {
          header: [
              {text: "Name", value: "industry_name"},
            {text: "Latitude", value: "lat"},
            {text: "Longitude", value: "lon"},
            {text: "Standard Industrial Classification", value: "industry_type"},
            {text: "Operation type", value: "operation_type"},
            {text: "Supplies to", value: "supplies_to"},
            {text: "Assessment period (days)", value: "assessment_period"},
            ],
          industries: []
        }

        assessment.industries.forEach(industry => {
          table.industries.push({
            industry_name: industry.name,
            lat: industry.location.lat.toFixed(3),
            lon: industry.location.lng.toFixed(3),
            industry_type: industry.industry_type === null ? "-" : standard_industrial_classification.find(category => category.value == industry.industry_type).text,
            operation_type: industry.operation_type,
            supplies_to: industry.industry_provided === null ? "-" : industry.industry_provided,
            assessment_period: assessment_days
          })
        })
        return table
      }
      else return {header: [], industries: []}
    },

    assessment_names: function() {
      const groupedByAssessments = _.groupBy(this.selected_industries, function(n) {
        return n.assessment.name;
      });
      return Object.entries(groupedByAssessments).map(assessment => assessment[0])
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

      let industries = []
      this.assessments_and_industries_tree.forEach(assessment => {
        industries.push(...assessment.children)
      })

      return industries.length > 0

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

<style scoped>

.outer{
  overflow: hidden;
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
.v-tabs-items {
  padding: 20px;
  overflow-y:scroll !important;
  height: 100%;
}

.border_report{
  border-style: solid;
  border-color: #1C195B;
}

.menu{
  border-left: 3px solid #1C195B;
  overflow-y:scroll !important;
  height: 100%;
  padding-top: 30px;
  padding-bottom: 30px;
}

.v-tab.v-tab--active{
  background-color: #1C195B;
  color: #F2F4F3
}




</style>