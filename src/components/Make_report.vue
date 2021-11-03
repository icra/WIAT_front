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
                      ></v-data-table>

                      <div v-if="selected_layers.length > 0">
                        <div class = table_descriptor>
                          <b > Layers information </b>
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

    chooseColor(str){
      return Object.values(colors)[this.hashCode(str) % Object.values(colors).length]
    },

    hashCode(str) {
      let hash = 0;
      if (str.length == 0) {
        return hash;
      }
      for (let i = 0; i < str.length; i++) {
        let char = str.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return hash;
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
            elec[key] = ("-")
          }
          if(Number.isFinite(emissions["wwt_KPI_GHG_fuel"])){
            let value = emissions["wwt_KPI_GHG_fuel"]*days_factor
            fuel[key] = value.toExponential(3)
            total_emission += value

          }else{
            fuel[key] = ("-")
          }
          if(Number.isFinite(emissions["wwt_KPI_GHG_tre"])){
            let value = days_factor*emissions["wwt_KPI_GHG_tre"]
            tre[key] = value.toExponential(3)
            total_emission += value

          }else{
            tre[key] = ("-")
          }
          if(Number.isFinite(emissions["wwt_KPI_GHG_biog"])){
            let value = days_factor*emissions["wwt_KPI_GHG_biog"]
            biog[key] = value.toExponential(3)
            total_emission += value
          }else{
            biog[key] = ("-")
          }
          if(Number.isFinite(emissions["wwt_KPI_GHG_slu"])){
            let value = days_factor*emissions["wwt_KPI_GHG_slu"]
            slu[key] = value.toExponential(3)
            total_emission += value

          }else{
            slu[key] = ("-")
          }
          if(Number.isFinite(emissions["wwt_KPI_GHG_reus_trck"])){
            let value = days_factor*emissions["wwt_KPI_GHG_reus_trck"]
            reus[key] = value.toExponential(3)
            total_emission += value
          }else{
            reus[key] = ("-")
          }
          if(Number.isFinite(emissions["wwt_KPI_GHG_disc"])){
            let value = days_factor*emissions["wwt_KPI_GHG_disc"]
            disc[key] = value.toExponential(3)
            total_emission += value
          }else{
            disc[key] = ("-")
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
            cod[key] = ("-")
          }

          let tn_value = eutrophication.tn
          if(Number.isFinite(tn_value)){
            tn[key] = ((days_factor*tn_value).toExponential(3))
          }else{
            tn[key] = ("-")
          }

          let tp_value = eutrophication.tp
          if(Number.isFinite(tp_value)){
            tp[key] = ((days_factor*tp_value).toExponential(3))
          }else{
            tp[key] = ("-")
          }

          let total_value = eutrophication.total
          if(Number.isFinite(total_value)){
            total[key] = ((days_factor*total_value).toExponential(3))
          }else{
            total[key] = ("-")
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
            dichloroethane[key] = ("-")
          }

          let cadmium_value = tu.cadmium
          if(Number.isFinite(cadmium_value)){
            cadmium[key] = ((days_factor*cadmium_value).toExponential(3))
          }else{
            cadmium[key] = ("-")
          }

          let hexaclorobenzene_value = tu.hexaclorobenzene
          if(Number.isFinite(hexaclorobenzene_value)){
            hexachlorobenzene[key] = ((days_factor*hexaclorobenzene_value).toExponential(3))
          }else{
            hexachlorobenzene[key] = ("-")
          }

          let mercury_value = tu.mercury
          if(Number.isFinite(mercury_value)){
            mercury[key] = ((days_factor*mercury_value).toExponential(3))
          }else{
            mercury[key] = ("-")
          }

          let lead_value = tu.lead
          if(Number.isFinite(lead_value)){
            lead[key] = ((days_factor*lead_value).toExponential(3))
          }else{
            lead[key] = ("-")
          }

          let nickel_value = tu.nickel
          if(Number.isFinite(nickel_value)){
            nickel[key] = ((days_factor*nickel_value).toExponential(3))
          }else{
            nickel[key] = ("-")
          }

          let chloroalkanes_value = tu.chloroalkanes
          if(Number.isFinite(chloroalkanes_value)){
            chloroalkanes[key] = ((days_factor*chloroalkanes_value).toExponential(3))
          }else{
            chloroalkanes[key] = ("-")
          }

          let hexaclorobutadie_value = tu.hexaclorobutadie
          if(Number.isFinite(hexaclorobutadie_value)){
            hexaclorobutadie[key] = ((days_factor*hexaclorobutadie_value).toExponential(3))
          }else{
            hexaclorobutadie[key] = ("-")
          }

          let nonylphenols_value = tu.nonylphenols
          if(Number.isFinite(nonylphenols_value)){
            nonylphenols[key] = ((days_factor*nonylphenols_value).toExponential(3))
          }else{
            nonylphenols[key] = ("-")
          }

          let tetrachloroethene_value = tu.tetracloroetile
          if(Number.isFinite(tetrachloroethene_value)){
            tetrachloroethene[key] = ((days_factor*tetrachloroethene_value).toExponential(3))
          }else{
            tetrachloroethene[key] = ("-")
          }

          let trichloroethylene_value = tu.tricloroetile
          if(Number.isFinite(trichloroethylene_value)){
            trichloroethylene[key] = ((days_factor*trichloroethylene_value).toExponential(3))
          }else{
            trichloroethylene[key] = ("-")
          }

          let total_value = tu.total
          if(Number.isFinite(total_value)){
            total[key] = ((days_factor*total_value).toExponential(3))
          }else{
            total[key] = ("-")
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
        let g4_en9 = {value: "Effect of water withdrawal on the water body (GRI 303-2)", unit: "%"}
        let g4_en10 = {value: "Water recycled and reused (GRI 303-3)", unit: "%"}
        let g4_en22 = {value: "Water discharge (GRI 306-1)", unit: "m3/year"}
        let g4_en26 = {value: "Effect of water discharges on the water body (GRI 306-5)", unit: "%"}

        let wd = {value: "Water withdrawn (CDP W1.2b)", unit: "ML/year"}
        let dis = {value: "Water discharged (CDP W1.2b)", unit: "ML/year"}
        let re = {value: "Water reused (CDP W1.2b)", unit: "ML/year"}

        for (const [key, industries] of Object.entries(_this.industries_aggregated())) {
          let indicators = await metrics.reporting_metrics(industries, this.global_layers)

          console.log(indicators)

          table.header.push({
            text: key, value: key,
          })

          let en8 = indicators["g4-en8"]
          if(Number.isFinite(en8)){
            g4_en8[key] = ((365*en8).toExponential(3))
          }else{
            g4_en8[key] = ("-")
          }
          let en9 = indicators["g4-en9"]
          if(Number.isFinite(en9)){
            g4_en9[key] = ((365*en9).toExponential(3))
          }else{
            g4_en9[key] = ("-")
          }
          let en10 = indicators["g4-en10"]
          if(Number.isFinite(en10)){
            g4_en10[key] = ((365*en10).toExponential(3))
          }else{
            g4_en10[key] = ("-")
          }

          let en22 = indicators["g4-en22"]
          if(Number.isFinite(en22)){
            g4_en22[key] = ((365*en22).toExponential(3))
          }else{
            g4_en22[key] = ("-")
          }

          let en26 = indicators["g4-en26"]
          if(Number.isFinite(en26)){
            g4_en26[key] = ((365*en26).toExponential(3))
          }else{
            g4_en26[key] = ("-")
          }

          let wd_value = indicators["wd"]
          if(Number.isFinite(wd_value)){
            wd[key] = ((0.001*365*wd_value).toExponential(3))
          }else{
            wd[key] = ("-")
          }

          let dis_value = indicators["dis"]
          if(Number.isFinite(dis_value)){
            dis[key] = ((0.001*365*dis_value).toExponential(3))
          }else{
            dis[key] = ("-")
          }

          let re_value = indicators["dis"]
          if(Number.isFinite(re_value)){
            re[key] = ((0.001*365*re_value).toExponential(3))
          }else{
            re[key] = ("-")
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

        let dilution_factor_row = {value: "Dilution factor", unit: "%"}
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
            dilution_factor_row[key] = (dilution_factor_value.toExponential(3))
          }else{
            dilution_factor_row[key] = ("-")
          }

          let recycled_water_factor_value = metrics.recycled_water_factor(industries)
          if(Number.isFinite(recycled_water_factor_value)){
            recycled_factor[key] = (recycled_water_factor_value.toExponential(3))
          }else{
            recycled_factor[key] = ("-")
          }

          let treated_water_factor = metrics.treated_water_factor(industries)
          if(Number.isFinite(treated_water_factor)){
            treated_factor[key] = (treated_water_factor.toExponential(3))
          }else{
            treated_factor[key] = ("-")
          }

          let available_ratio_value = await metrics.available_ratio(this.global_layers, industries)
          if(Number.isFinite(available_ratio_value)){
            available_ratio[key] = (available_ratio_value.toExponential(3))
          }else{
            available_ratio[key] = ("-")
          }


          if(Number.isFinite(metrics.efficiency_factor(industries))){
            efficiency_factor[key] = (metrics.efficiency_factor(industries).toExponential(3))
          }else{
            efficiency_factor[key] = ("-")
          }

          if(Number.isFinite(metrics.nqa(industries))){
            water_quality_standards[key] = metrics.nqa(industries)
          }else{
            water_quality_standards[key] = ("-")
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
            tn[key] = ((tn_value).toExponential(3))
          }else{
            tn[key] = ("-")
          }
          let tp_value = metrics.tp_efficiency(industries)
          if(Number.isFinite(tp_value)){
            tp[key] = ((tp_value).toExponential(3))
          }else{
            tp[key] = ("-")
          }

          let bod_value = metrics.bod_efficiency(industries)
          if(Number.isFinite(bod_value)){
            bod[key] = ((bod_value).toExponential(3))
          }else{
            bod[key] = ("-")
          }

          let dichloroethane_value = metrics.dichloroethane_efficiency(industries)
          if(Number.isFinite(dichloroethane_value)){
            dichloroethane[key] = ((dichloroethane_value).toExponential(3))
          }else{
            dichloroethane[key] = ("-")
          }

          let cadmium_value = metrics.cadmium_efficiency(industries)
          if(Number.isFinite(cadmium_value)){
            cadmium[key] = ((cadmium_value).toExponential(3))
          }else{
            cadmium[key] = ("-")
          }

          let hexaclorobenzene_value = metrics.hexaclorobenzene_efficiency(industries)
          if(Number.isFinite(hexaclorobenzene_value)){
            hexachlorobenzene[key] = ((hexaclorobenzene_value).toExponential(3))
          }else{
            hexachlorobenzene[key] = ("-")
          }

          let mercury_value = metrics.mercury_efficiency(industries)
          if(Number.isFinite(mercury_value)){
            mercury[key] = ((mercury_value).toExponential(3))
          }else{
            mercury[key] = ("-")
          }

          let lead_value = metrics.lead_efficiency(industries)
          if(Number.isFinite(lead_value)){
            lead[key] = ((lead_value).toExponential(3))
          }else{
            lead[key] = ("-")
          }

          let nickel_value = metrics.nickel_efficiency(industries)
          if(Number.isFinite(nickel_value)){
            nickel[key] = ((nickel_value).toExponential(3))
          }else{
            nickel[key] = ("-")
          }

          let chloroalkanes_value = metrics.chloroalkanes_efficiency(industries)
          if(Number.isFinite(chloroalkanes_value)){
            chloroalkanes[key] = ((chloroalkanes_value).toExponential(3))
          }else{
            chloroalkanes[key] = ("-")
          }

          let hexaclorobutadie_value = metrics.hexaclorobutadie_efficiency(industries)
          if(Number.isFinite(hexaclorobutadie_value)){
            hexaclorobutadie[key] = ((hexaclorobutadie_value).toExponential(3))
          }else{
            hexaclorobutadie[key] = ("-")
          }

          let nonylphenols_value = metrics.nonylphenols_efficiency(industries)
          if(Number.isFinite(nonylphenols_value)){
            nonylphenols[key] = ((nonylphenols_value).toExponential(3))
          }else{
            nonylphenols[key] = ("-")
          }

          let tetrachloroethene_value = metrics.tetrachloroethene_efficiency(industries)
          if(Number.isFinite(tetrachloroethene_value)){
            tetrachloroethene[key] = ((tetrachloroethene_value).toExponential(3))
          }else{
            tetrachloroethene[key] = ("-")
          }

          let trichloroethylene_value = metrics.tricloroetile_efficiency(industries)
          if(Number.isFinite(trichloroethylene_value)){
            trichloroethylene[key] = ((trichloroethylene_value).toExponential(3))
          }else{
            trichloroethylene[key] = ("-")
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
            tn[key] = ("-")
          }
          let tp_value = await metrics.tp_effl(industries, this.global_layers)
          if(Number.isFinite(tp_value)){
            tp[key] = ((tp_value).toExponential(3))
          }else{
            tp[key] = ("-")
          }

          let bod_value = await metrics.bod_effl(industries, this.global_layers)
          if(Number.isFinite(bod_value)){
            bod[key] = ((bod_value*this.bod_to_cod).toExponential(3))
          }else{
            bod[key] = ("-")
          }

          //let dbo_value = await metrics.dbo_in_river(this.global_layers, industry, assessment_days)

          let dichloroethane_value = await metrics.dichloroethane_effl(industries, this.global_layers)
          if(Number.isFinite(dichloroethane_value)){
            dichloroethane[key] = ((dichloroethane_value).toExponential(3))
          }else{
            dichloroethane[key] = ("-")
          }

          let cadmium_value = await metrics.cadmium_effl(industries, this.global_layers)
          if(Number.isFinite(cadmium_value)){
            cadmium[key] = ((cadmium_value).toExponential(3))
          }else{
            cadmium[key] = ("-")
          }

          let hexaclorobenzene_value = await metrics.hexaclorobenzene_effl(industries, this.global_layers)
          if(Number.isFinite(hexaclorobenzene_value)){
            hexachlorobenzene[key] = ((hexaclorobenzene_value).toExponential(3))
          }else{
            hexachlorobenzene[key] = ("-")
          }

          let mercury_value = await metrics.mercury_effl(industries, this.global_layers)
          if(Number.isFinite(mercury_value)){
            mercury[key] = ((mercury_value).toExponential(3))
          }else{
            mercury[key] = ("-")
          }

          let lead_value = await metrics.lead_effl(industries, this.global_layers)
          if(Number.isFinite(lead_value)){
            lead[key] = ((lead_value).toExponential(3))
          }else{
            lead[key] = ("-")
          }

          let nickel_value = await metrics.nickel_effl(industries, this.global_layers)
          if(Number.isFinite(nickel_value)){
            nickel[key] = ((nickel_value).toExponential(3))
          }else{
            nickel[key] = ("-")
          }

          let chloroalkanes_value = await  metrics.chloroalkanes_effl(industries, this.global_layers)
          if(Number.isFinite(chloroalkanes_value)){
            chloroalkanes[key] = ((chloroalkanes_value).toExponential(3))
          }else{
            chloroalkanes[key] = ("-")
          }

          let hexaclorobutadie_value = await metrics.hexaclorobutadie_effl(industries,this.global_layers)
          if(Number.isFinite(hexaclorobutadie_value)){
            hexaclorobutadie[key] = ((hexaclorobutadie_value).toExponential(3))
          }else{
            hexaclorobutadie[key] = ("-")
          }

          let nonylphenols_value = await metrics.nonylphenols_effl(industries, this.global_layers)
          if(Number.isFinite(nonylphenols_value)){
            nonylphenols[key] = ((nonylphenols_value).toExponential(3))
          }else{
            nonylphenols[key] = ("-")
          }

          let tetrachloroethene_value = await metrics.tetrachloroethene_effl(industries, this.global_layers)
          if(Number.isFinite(tetrachloroethene_value)){
            tetrachloroethene[key] = ((tetrachloroethene_value).toExponential(3))
          }else{
            tetrachloroethene[key] = ("-")
          }

          let trichloroethylene_value = await metrics.tricloroetile_effl(industries, this.global_layers)
          if(Number.isFinite(trichloroethylene_value)){
            trichloroethylene[key] = ((trichloroethylene_value).toExponential(3))
          }else{
            trichloroethylene[key] = ("-")
          }

          let tu_value = await metrics.delta_toxic_units(industries, this.global_layers)
          if(Number.isFinite(tu_value)){
            tu[key] = ((tu_value).toExponential(3))
          }else{
            tu[key] = ("-")
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
          text: "Layers information\n\n",
          style: 'subheader'
        })

        let body = [{text: 'Layer', style: 'tableHeader'}]
        for(const industryAux of industries) {
          let industry = industryAux.industry
          body.push({text: industry.name, style: 'tableHeader'})
        }
        body.push({
          text: "Units",
          style: 'tableHeader'
        })

        let layers_description = {
          table: {
            body: [body]
          }
        }

        for (let [layer_name, info] of selected_layers_formatted) {
          let current_layer = [layer_name]
          let future_layer = [layer_name+ " (BAU 2030)"]


          for(const industryAux of industries) {
            let industry = industryAux.industry
            let lat = industry.location.lat
            let lng = industry.location.lng

            //Baseline
            let baseline_data = await info.layers.baseline.annual.layer["data_for_report"](lat, lng)
            current_layer.push(baseline_data)
            //Future
            if (info.future && this.include_future) {
              let future_data = await info.layers.future.layer["data_for_report"](lat, lng)
              future_layer.push(future_data)
            }
          }

          current_layer.push(info.layers.baseline.annual.layer["unit"]())
          layers_description.table.body.push(current_layer)

          if(info.future && this.include_future){
            future_layer.push(info.layers.baseline.annual.layer["unit"]())
            layers_description.table.body.push(future_layer)

          }
        }

        dd.content.push(layers_description)

      }

    },

    emissions_table_pdf(dd, industries, assessment_days) {

      let days_factor = 1
      if(this.period_model === "annual") days_factor = 365
      else if(this.period_model === "assessment") days_factor = assessment_days

      dd.content.push({
        text: "Global Warming Potential\n\n",
        style: 'subheader'
      })

      let body = [{}]
      for (const industryAux of industries) {
        let industry = industryAux.industry
        body.push({
          text: industry.name,
          style: 'tableHeader'
        })
      }
      body.push({
        text: "Units",
        style: 'tableHeader'
      })

      let elec = ["Indirect emissions from electricity consumption"]
      let fuel = ["Emissions from fuel engines"]
      let tre = ["Emissions from treatment"]
      let biog = ["Emissions from biogas"]
      let slu = ["Emissions from sludge management"]
      let reus = ["Emissions from water reuse transport"]
      let disc = ["Emissions from water discharged"]
      let total_emissions = ["Total emissions"]


      for (const industryAux of industries) {
        let total = 0
        let industry = industryAux.industry
        let emissions = metrics.emissions_and_descriptions(industry)
        if(Number.isFinite(emissions["wwt_KPI_GHG_elec"])){
          let value = days_factor*emissions["wwt_KPI_GHG_elec"]
          elec.push(value.toExponential(3))
          total += value
        }else{
          elec.push("-")
        }
        if(Number.isFinite(emissions["wwt_KPI_GHG_fuel"])){
          let value = days_factor*emissions["wwt_KPI_GHG_fuel"]
          fuel.push((value).toExponential(3))
          total += value
        }else{
          fuel.push("-")
        }
        if(Number.isFinite(emissions["wwt_KPI_GHG_tre"])){
          let value = days_factor*emissions["wwt_KPI_GHG_tre"]
          tre.push((value).toExponential(3))
          total += value
        }else{
          tre.push("-")
        }
        if(Number.isFinite(emissions["wwt_KPI_GHG_biog"])){
          let value = days_factor*emissions["wwt_KPI_GHG_biog"]
          biog.push((value).toExponential(3))
          total += value
        }else{
          biog.push("-")
        }
        if(Number.isFinite(emissions["wwt_KPI_GHG_slu"])){
          let value = days_factor*emissions["wwt_KPI_GHG_slu"]
          slu.push((value).toExponential(3))
          total += value
        }else{
          slu.push("-")
        }
        if(Number.isFinite(emissions["wwt_KPI_GHG_reus_trck"])){
          let value = days_factor*emissions["wwt_KPI_GHG_reus_trck"]
          reus.push((value).toExponential(3))
          total += value
        }else{
          reus.push("-")
        }
        if(Number.isFinite(emissions["wwt_KPI_GHG_disc"])){
          let value = days_factor*emissions["wwt_KPI_GHG_disc"]
          disc.push((value).toExponential(3))
          total += value
        }else{
          disc.push("-")
        }

        total_emissions.push(total.toExponential(3))
      }

      elec.push("kgCO2eq")
      fuel.push("kgCO2eq")
      tre.push("kgCO2eq")
      biog.push("kgCO2eq")
      slu.push("kgCO2eq")
      reus.push("kgCO2eq")
      disc.push("kgCO2eq")
      total_emissions.push("kgCO2eq")

      let emissions_table = {
        table: {
          body: [
            body, elec, fuel, tre, biog, slu, reus, disc, total_emissions
          ]
        }
      }

      dd.content.push(emissions_table)

    },

    async quality_quantity_indicators(dd, industries, assessment_days) {

      let days_factor = 1
      if(this.period_model === "annual") days_factor = 365
      else if(this.period_model === "assessment") days_factor = assessment_days


      dd.content.push({
        text: "Quality and quantity indicators\n\n",
        style: "subheader"
      })

      let body = [{}]
      for (const industryAux of industries) {
        let industry = industryAux.industry
        body.push({
          text: industry.name,
          style: 'tableHeader'
        })
      }
      body.push({
        text: "Units",
        style: 'tableHeader'
      })

      let tn = ["TN load discharged to the water body"]
      let tp = ["TP load discharged to the water body"]

      let bod = [""]
      let dilution_factor_row = ["Dilution factor"]
      let recycled_factor = ["Recycled water factor"]
      let dbo_in_river = [""]
      let dichloroethane = ["1,2-Dichloroethane load discharged to the water body"]
      let cadmium = ["Cadmium load discharged to the water body"]
      let hexachlorobenzene = ["Hexachlorobenzene load discharged to the water body"]
      let mercury = ["Mercury load discharged to the water body"]
      let lead = ["Lead load discharged to the water body"]
      let nickel = ["Nickel load discharged to the water body"]
      let chloroalkanes = ["Chloroalkanes load discharged to the water body"]
      let hexaclorobutadie = ["Hexachlorobutadiene load discharged to the water body"]
      let nonylphenols = ["Nonylphenols load discharged to the water body"]
      let tetrachloroethene = ["Tetrachloroethene load discharged to the water body"]
      let trichloroethylene = ["Trichloroethylene load discharged to the water body"]


      if(this.units_model === "bod") {
        bod = ["BOD load discharged to the water body"]
        dbo_in_river = ["BOD concentration in water body after discharging waste water"]
      }
      else {
        bod = ["COD load discharged to the water body"]
        dbo_in_river = ["COD concentration in water body after discharging waste water"]
      }

      for (const industryAux of industries) {
        let industry = industryAux.industry

        if(Number.isFinite(metrics.tn_effl(industry))){
          tn.push((days_factor*metrics.tn_effl(industry)).toExponential(3))
        }else{
          tn.push("-")
        }
        if(Number.isFinite(metrics.tp_effl(industry))){
          tp.push((days_factor*metrics.tp_effl(industry)).toExponential(3))
        }else{
          tp.push("-")
        }
        let dilution_factor_value = await metrics.dilution_factor(this.global_layers, industry)
        if(Number.isFinite(dilution_factor_value)){
          dilution_factor_row.push(dilution_factor_value.toExponential(3))
        }else{
          dilution_factor_row.push("-")
        }

        if(Number.isFinite(metrics.recycled_water_factor(industry))){
          recycled_factor.push(metrics.recycled_water_factor(industry).toExponential(3))
        }else{
          recycled_factor.push("-")
        }

        if(Number.isFinite(metrics.bod_effl(industry))){
          bod.push((days_factor*metrics.bod_effl(industry)*this.bod_to_cod).toExponential(3))
        }else{
          bod.push("-")
        }

        //let dbo_value = await metrics.dbo_in_river(this.global_layers, industry, assessment_days)


        if(Number.isFinite(metrics.dichloroethane_effl(industry))){
          dichloroethane.push((days_factor*metrics.dichloroethane_effl(industry)).toExponential(3))
        }else{
          dichloroethane.push("-")
        }

        if(Number.isFinite(metrics.cadmium_effl(industry))){
          cadmium.push((days_factor*metrics.cadmium_effl(industry)).toExponential(3))
        }else{
          cadmium.push("-")
        }

        if(Number.isFinite(metrics.hexaclorobenzene_effl(industry))){
          hexachlorobenzene.push((days_factor*metrics.hexaclorobenzene_effl(industry)).toExponential(3))
        }else{
          hexachlorobenzene.push("-")
        }

        if(Number.isFinite(metrics.mercury_effl(industry))){
          mercury.push((days_factor*metrics.mercury_effl(industry)).toExponential(3))
        }else{
          mercury.push("-")
        }

        if(Number.isFinite(metrics.lead_effl(industry))){
          lead.push((days_factor*metrics.lead_effl(industry)).toExponential(3))
        }else{
          lead.push("-")
        }
        if(Number.isFinite(metrics.nickel_effl(industry))){
          nickel.push((days_factor*metrics.nickel_effl(industry)).toExponential(3))
        }else{
          nickel.push("-")
        }
        if(Number.isFinite(metrics.chloroalkanes_effl(industry))){
          chloroalkanes.push((days_factor*metrics.chloroalkanes_effl(industry)).toExponential(3))
        }else{
          chloroalkanes.push("-")
        }
        if(Number.isFinite(metrics.hexaclorobutadie_effl(industry))){
          hexaclorobutadie.push((days_factor*metrics.hexaclorobutadie_effl(industry)).toExponential(3))
        }else{
          hexaclorobutadie.push("-")
        }
        if(Number.isFinite(metrics.nonylphenols_effl(industry))){
          nonylphenols.push((days_factor*metrics.nonylphenols_effl(industry)).toExponential(3))
        }else{
          nonylphenols.push("-")
        }
        if(Number.isFinite(metrics.tetrachloroethene_effl(industry))){
          tetrachloroethene.push((days_factor*metrics.tetrachloroethene_effl(industry)).toExponential(3))
        }else{
          tetrachloroethene.push("-")
        }
        if(Number.isFinite(metrics.tricloroetile_effl(industry))){
          trichloroethylene.push((days_factor*metrics.tricloroetile_effl(industry)).toExponential(3))
        }else{
          trichloroethylene.push("-")
        }




        /*if(Number.isFinite(dbo_value)){
          dbo_in_river.push(dbo_value.toExponential(3)*this.bod_to_cod)
        }else{
          dbo_in_river.push("-")
        }*/

      }

      bod.push("g")
      tn.push("g")
      tp.push("g")

      dilution_factor_row.push("-")
      recycled_factor.push("-")
      dbo_in_river.push("g/m3")
      dichloroethane.push("g")
      cadmium.push("g")
      hexachlorobenzene.push("g")
      mercury.push("g")
      lead.push("g")
      nickel.push("g")
      chloroalkanes.push("g")
      hexaclorobutadie.push("g")
      nonylphenols.push("g")
      tetrachloroethene.push("g")
      trichloroethylene.push("g")


      let emissions_table = {
        table: {
          body: [
            body, bod, tn, tp, dichloroethane, cadmium, hexachlorobenzene, mercury, lead, nickel, chloroalkanes, hexaclorobutadie, nonylphenols, tetrachloroethene, trichloroethylene, dilution_factor_row, recycled_factor
          ]

        }
      }

      dd.content.push(emissions_table)

    },

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
        pageMargins: [50, 60, 50, 70],
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
          bold_text: {
            bold: true
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

        dd.content.push({
          text: [
            {
              text:"Assessment period: ",
              bold: true
            },
            assessment.assessment_period_start + " to "+ assessment.assessment_period_end + " ("+ utils.daysBetween(assessment.assessment_period_start, assessment.assessment_period_end) +" days)\n\n"
          ]
        })

        let assessment_days = utils.daysBetween(assessment.assessment_period_start, assessment.assessment_period_end)


        this.emissions_table_pdf(dd, industries, assessment_days)
        dd.content.push("\n\n")
        await this.quality_quantity_indicators(dd, industries, assessment_days)
        dd.content.push("\n\n")
        await this.layers_table_pdf(dd, industries, assessment_days)



        /*for(const industryAux of industries){

          let industry = industryAux.industry

          industry_statistics.emissions_and_descriptions(industry)

          dd.content.push({
            text: "Industry "+industry.name+"\n\n",
            style: 'subheader'
          })

          let lat = industry.location.lat
          let lng = industry.location.lng



          if(selected_layers_formatted.length > 0){
            //Layer values on industry
            dd.content.push("Layer information:\n\n")

            let layers_description = {
              table: {

                //headerRows: 2,
                // keepWithHeaderRows: 1,
                widths: ['*','*','*'],
                body: [
                  [{},{text: 'Baseline', style: 'tableHeader'},{text: 'Future', style: 'tableHeader'}],
                ]
              }
            }

              dd.content.push({
                text: "GHG emissions\n\n",
                style: 'subheader'
              })
            //for(let [layer_name, info] of Object.entries(_this.layers)){
            for(let [layer_name, info] of  selected_layers_formatted){
              let current_layer = [layer_name]

              //Baseline
              let baseline_data = await info.layers.baseline.annual.layer["get_label_on_coord"](lat, lng)
              current_layer.push(baseline_data)
              //Future
              if(info.future){
                let future_data = await info.layers.future.layer["get_label_on_coord"](lat, lng)
                current_layer.push(future_data)
              }else current_layer.push('-')
              layers_description.table.body.push(current_layer)

            }
            dd.content.push(layers_description)
          }


          //Industry emissions
          dd.content.push("\nIndustry emissions:\n\n")
          let industry_emissions = {
            table: {
              widths: ['*','*','*','*','*'],
              body: [
                [{text: 'Emission', style: 'tableHeader'},{text: 'Total GHG Emission', style: 'tableHeader'},{text: 'CO2 emission', style: 'tableHeader'},{text: 'CH4 emission', style: 'tableHeader'},{text: 'N20 emission', style: 'tableHeader'}],
              ]
            }
          }

          let emissions_and_descriptions = industry.emissions_and_descriptions()
          for (let emission_and_description of emissions_and_descriptions){
            let description = emission_and_description.description
            let emission = emission_and_description.emissions

            let emission_row = [description, emission.total, emission.co2, emission.ch4, emission.n2o]
            industry_emissions.table.body.push(emission_row)
          }
          dd.content.push(industry_emissions)

          //Pie chart
          let pie = _this.pieChart_base64(industry)
          dd.content.push({
            image: pie,
            width: 500
          })

          //Water quality indicators
          dd.content.push("\nWater quality indicators:\n\n")
          let water_quality_indicators = {
            table: {
              widths: ['*','*','*'],
              body: [
                [{},{text: 'Value', style: 'tableHeader'},{text: 'Unit', style: 'tableHeader'}],
              ]
            }
          }

          let indicators = industry.water_quality_indicators()
          for (let indicator of indicators){
            let indicator_row = [indicator.type, indicator.value, indicator.unit,]
            water_quality_indicators.table.body.push(indicator_row)
          }
          dd.content.push(water_quality_indicators)*/


      }

      //this.$refs.make_pdf.make_pdf(pdfMake.createPdf(dd))
      this.generating_pdf = false
      pdfMake.createPdf(dd).download();

    },

    async pieChart_base64() {

      const data = {
        labels: [
          'Global warming Potential',
          'Dillution factor',
          'Recycled water factor',
        ],
        datasets: []
      };

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

        for (const industryAux of Object.values(groupedByAssessments)[_this.tab]) {
          let industry = industryAux.industry

          let global_warming_potential = metrics.global_warming_potential(industry)
          let dilution_factor = await metrics.dilution_factor(this.global_layers, industry)
          let recycled_water_factor = metrics.recycled_water_factor(industry)

          data.datasets.push({
            label: industry.name,
            data: [global_warming_potential, dilution_factor, recycled_water_factor],
            fill: true,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgb(54, 162, 235)',
            pointBackgroundColor: 'rgb(54, 162, 235)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgb(54, 162, 235)'
          })
        }


        const config = {
          type: 'radar',
          data: data,
          options: {
            elements: {
              line: {
                borderWidth: 3
              }
            },
            animation: false,
            scales: {
              r: {
                max: 100,
              }
            }
          },
        };
        //let pieChart = new Chart(document.getElementById('chart').getContext('2d'), config);
        //return pieChart.toBase64Image()

      }


      }

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