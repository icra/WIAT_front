<template>
  <div class="outer" >
    <h1>Report</h1>
    <div v-if="is_there_any_industry_created" style="height: 100%;">
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
                <v-tabs-items v-model="tab" style="padding-bottom: 50px">
                  <v-tab-item
                      v-for="(assessment_name, idx) in assessment_names"
                      :key="assessment_name"
                  >
                    <br>
                    <v-card flat style="margin-left: 10px;">

                      <div v-if="level_of_detail == 'simple'">

                        <v-expansion-panels>
                          <v-expansion-panel>
                            <v-expansion-panel-header>
                              <div class = table_descriptor>
                                <span class="table_title"> Industry information </span>
                              </div>
                            </v-expansion-panel-header>
                            <v-expansion-panel-content>
                              <v-data-table
                                  :headers="industry_table.header"
                                  :items="industry_table.industries"
                                  class="elevation-1"
                              ></v-data-table>
                            </v-expansion-panel-content>
                          </v-expansion-panel>
                          <v-expansion-panel>
                            <v-expansion-panel-header>
                              <div class = table_descriptor>
                                <span class="table_title"> General indicators </span>
                              </div>
                            </v-expansion-panel-header>
                            <v-expansion-panel-content>
                              <v-data-table
                                  :headers="simple_report_table.header"
                                  :items="simple_report_table.value"
                                  class="elevation-1"
                                  :item-class="itemRowBold"
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
                                <template
                                    v-for="value in Object.keys(industries_aggregated)"
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
                                            text-color="black"
                                        >
                                          {{ item[value] }}
                                        </v-chip>
                                      </template>
                                      <span>{{ getSimpleReportColor(item, value)[1] }}</span>
                                    </v-tooltip>
                                  </template>
                                  <template v-else>
                                    {{ item[value] }}
                                  </template>
                                </template>

                              </v-data-table>
                            </v-expansion-panel-content>
                          </v-expansion-panel>
                          <v-expansion-panel v-if="selected_layers.length > 0">
                            <v-expansion-panel-header>
                              <div class = table_descriptor>
                                <span class="table_title">Global GIS Indicators</span>
                              </div>

                            </v-expansion-panel-header>
                            <v-expansion-panel-content>
                              <v-data-table
                                  :headers="layers_table.header"
                                  :items="layers_table.value"
                                  class="elevation-1"
                              >
                                <template
                                    v-for="value in selected_industries.map(industry => industry.name)"
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
                                            text-color="black"
                                        >
                                          {{ item[value] }}
                                        </v-chip>
                                      </template>
                                      <span>{{ getGISLayerColor(item, value)[1] }}</span>
                                    </v-tooltip>
                                  </template>
                                  <template v-else>
                                    {{ item[value] }}
                                  </template>
                                </template>



                              </v-data-table>

                            </v-expansion-panel-content>
                          </v-expansion-panel>

                        </v-expansion-panels>


                      </div>
                      <div v-else>
                        <v-expansion-panels>
                          <v-expansion-panel>
                            <v-expansion-panel-header>
                              <div class = table_descriptor>
                                <span class="table_title"> Industry information </span>
                              </div>
                            </v-expansion-panel-header>
                            <v-expansion-panel-content>
                              <v-data-table
                                  :headers="industry_table.header"
                                  :items="industry_table.industries"
                                  class="elevation-1"
                              ></v-data-table>
                            </v-expansion-panel-content>
                          </v-expansion-panel>
                          <v-expansion-panel>
                            <v-expansion-panel-header>
                              <div class = table_descriptor>
                          <span class="table_title">
                            Global Warming Potential
                          </span>
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

                            </v-expansion-panel-header>
                            <v-expansion-panel-content>
                              <v-data-table
                                  :headers="emissions_table.header"
                                  :items="emissions_table.emissions"
                                  class="elevation-1"
                                  :item-class="itemRowBold"

                              ></v-data-table>
                              <div id="global_warming_chart_wrapper" style="width:500px; margin: 20px auto 20px auto;">
                                <BarChart :chartdata="ghg_emission_chart.chartData" :options="ghg_emission_chart.options"></BarChart>
                                <!--<canvas :id="'global_warming_potential_chart_tab_'+index"> </canvas>-->
                              </div>

                            </v-expansion-panel-content>
                          </v-expansion-panel>
                          <v-expansion-panel>
                            <v-expansion-panel-header>
                              <div class = table_descriptor>
                                <span class="table_title"> Availability & Quantity Indicators </span>
                              </div>

                            </v-expansion-panel-header>
                            <v-expansion-panel-content>
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
                                  <span v-else>{{item.value}}</span>
                                </template>

                                <template
                                    v-for="value in Object.keys(industries_aggregated)"
                                    v-slot:[`item.${value}`]="{ item }"
                                >

                                  <template v-if="getAvailabilityColor(item, value) != null">
                                    <v-tooltip bottom>
                                      <template v-slot:activator="{ on, attrs }">
                                        <v-chip
                                            :color="getAvailabilityColor(item, value)[0]"
                                            dark
                                            :key="value"
                                            v-bind="attrs"
                                            v-on="on"
                                            text-color="black"
                                        >
                                          {{ item[value] }}
                                        </v-chip>
                                      </template>
                                      <span>{{ getAvailabilityColor(item, value)[1] }}</span>
                                    </v-tooltip>
                                  </template>
                                  <template v-else>
                                    {{ item[value] }}
                                  </template>
                                </template>
                              </v-data-table>

                              <div style="width: 600px; margin: 20px auto 20px auto;">
                                <RadarChart :chartdata="quantity_chart.chartData" :options="quantity_chart.options"></RadarChart>
                              </div>

                            </v-expansion-panel-content>
                          </v-expansion-panel>
                          <v-expansion-panel>
                            <v-expansion-panel-header>
                              <div class = table_descriptor>
                                <span class="table_title"> Eutrophication potential </span>
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

                            </v-expansion-panel-header>
                            <v-expansion-panel-content>
                              <v-data-table
                                  :headers="eutrophication_table.header"
                                  :items="eutrophication_table.value"
                                  :item-class="itemRowBold"
                                  class="elevation-1"
                              >
                              </v-data-table>
                              <div style="width:500px; margin: 20px auto 20px auto;">
                                <BarChart :chartdata="eutrophication_chart.chartData" :options="eutrophication_chart.options"></BarChart>
                              </div>

                            </v-expansion-panel-content>
                          </v-expansion-panel>
                          <v-expansion-panel>
                            <v-expansion-panel-header>
                              <div class = table_descriptor>
                                <span class="table_title"> Chemical pollution </span>
                              </div>

                            </v-expansion-panel-header>
                            <v-expansion-panel-content>
                              <br>
                              <b>Ecotoxicity potential</b>
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

                              <v-data-table
                                  :headers="ecotoxicity_table.header"
                                  :items="ecotoxicity_table.value"
                                  class="elevation-1"
                                  :item-class="itemRowBold"
                                  disable-pagination
                                  :hide-default-footer="true"

                              ></v-data-table>
                              <div style="width:500px; margin: 20px auto 20px auto;">
                                <BarChart :chartdata="ecotoxicity_chart.chartData" :options="ecotoxicity_chart.options"></BarChart>
                              </div>
                              <br>
                              <b> Increase in the concentration of the pollutant in the receiving body </b>
                              <v-data-table
                                  :headers="pollutants_table.header"
                                  :items="pollutants_table.value"
                                  class="elevation-1"
                                  :item-class="itemRowBold"
                                  disable-pagination
                                  :hide-default-footer="true"
                              ></v-data-table>
                              <br>
                              <b> Effluent concentration with respect to EQS </b>
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
                                  Index reflecting how large the load of each pollutant in the effluent is with respect to the EQS. The larger it is, the worse.
                                </span>
                              </v-tooltip>

                              <v-data-table
                                  :headers="eqs_table.header"
                                  :items="eqs_table.value"
                                  disable-pagination
                                  :hide-default-footer="true"
                                  class="elevation-1"
                              ></v-data-table>
                              <br>
                              <b> Toxic Units in the receiving water body (assuming an initial concentration of 0) </b>
                              <v-data-table
                                    :headers="delta_ecotox_table.header"
                                    :items="delta_ecotox_table.value"
                                    class="elevation-1"
                                    :item-class="itemRowBold"
                                    disable-pagination
                                    :hide-default-footer="true"
                              >
                                <template
                                      v-for="value in Object.keys(industries_aggregated)"
                                      v-slot:[`item.${value}`]="{ item }"
                                  >

                                    <template v-if="getDeltaEcotoxColor(item, value) != null">
                                      <v-tooltip bottom>
                                        <template v-slot:activator="{ on, attrs }">
                                          <v-chip
                                              :color="getDeltaEcotoxColor(item, value)[0]"
                                              dark
                                              :key="value"
                                              v-bind="attrs"
                                              v-on="on"
                                              text-color="black"
                                          >
                                            {{ item[value] }}
                                          </v-chip>
                                        </template>
                                        <span>{{ getDeltaEcotoxColor(item, value)[1] }}</span>
                                      </v-tooltip>
                                    </template>
                                    <template v-else>
                                      {{ item[value] }}
                                    </template>
                                  </template>
                              </v-data-table>


                              <br>
                              <b>Final concentration in the receiving water body with respect to EQS (assuming an initial concentration of 0) </b>

                              <v-data-table
                                  :headers="delta_eqs_table.header"
                                  :items="delta_eqs_table.value"
                                  class="elevation-1"
                                  disable-pagination
                                  :hide-default-footer="true"
                              >
                                <template
                                    v-for="value in Object.keys(industries_aggregated)"
                                    v-slot:[`item.${value}`]="{ item }"
                                >

                                  <template v-if="getDeltaEQSColor(item, value) != null">
                                    <v-tooltip bottom>
                                      <template v-slot:activator="{ on, attrs }">
                                        <v-chip
                                            :color="getDeltaEQSColor(item, value)[0]"
                                            dark
                                            :key="value"
                                            v-bind="attrs"
                                            v-on="on"
                                            text-color="black"
                                        >
                                          {{ item[value] }}
                                        </v-chip>
                                      </template>
                                      <span>{{ getDeltaEQSColor(item, value)[1] }}</span>
                                    </v-tooltip>
                                  </template>
                                  <template v-else>
                                    {{ item[value] }}
                                  </template>
                                </template>


                              </v-data-table>
                              <br>
                            </v-expansion-panel-content>
                          </v-expansion-panel>
                          <v-expansion-panel>
                            <v-expansion-panel-header>
                              <div class = table_descriptor>
                                <span class="table_title"> Pollutant treatment efficiency </span>
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
                            </v-expansion-panel-header>
                            <v-expansion-panel-content>
                              <v-data-table
                                  :headers="treatment_efficiency_table.header"
                                  :items="treatment_efficiency_table.value"
                                  class="elevation-1"
                              ></v-data-table>
                              <div style="width: 600px; margin: 20px auto 20px auto;">
                                <RadarChart :chartdata="treatment_efficiency_chart.chartData" :options="treatment_efficiency_chart.options"></RadarChart>
                              </div>

                            </v-expansion-panel-content>
                          </v-expansion-panel>
                          <v-expansion-panel>
                            <v-expansion-panel-header>
                              <div class = table_descriptor>
                                <span class="table_title"> Reporting indicators </span>
                              </div>
                            </v-expansion-panel-header>
                            <v-expansion-panel-content>

                              <v-data-table
                                  :headers="reporting_indicators.header"
                                  :items="reporting_indicators.value"
                                  class="elevation-1"
                                  disable-pagination
                                  :hide-default-footer="true"
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
                                            text-color="black"
                                        >
                                          {{ item[value] }}
                                        </v-chip>
                                      </template>
                                      <span>{{ getReportingColor(item, value)[1] }}</span>
                                    </v-tooltip>
                                  </template>
                                  <template v-else>
                                    {{ item[value] }}
                                  </template>
                                </template>


                              </v-data-table>



                            </v-expansion-panel-content>
                          </v-expansion-panel>
                          <v-expansion-panel v-if="selected_layers.length > 0">
                            <v-expansion-panel-header>
                              <div class = table_descriptor>
                                <span class="table_title">Global GIS Indicators</span>
                              </div>

                            </v-expansion-panel-header>
                            <v-expansion-panel-content>
                              <v-data-table
                                  :headers="layers_table.header"
                                  :items="layers_table.value"
                                  class="elevation-1"
                              >
                                <template
                                    v-for="value in selected_industries.map(industry => industry.name)"
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
                                            text-color="black"
                                        >
                                          {{ item[value] }}
                                        </v-chip>
                                      </template>
                                      <span>{{ getGISLayerColor(item, value)[1] }}</span>
                                    </v-tooltip>
                                  </template>
                                  <template v-else>
                                    {{ item[value] }}
                                  </template>
                                </template>



                              </v-data-table>

                            </v-expansion-panel-content>
                          </v-expansion-panel>

                        </v-expansion-panels>

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
                v-model="level_of_detail"
                :items="level_of_detail_items"
                filled
                label="Level of detail"
                style="padding-top: 30px"
            ></v-select>
            <v-select
                v-model="aggregation_level"
                :items="aggregation_items"
                filled
                label="Aggregation level"
            ></v-select>
            <v-select
                v-model="include_future"
                :items="yes_no"
                filled
                label="Include 2030 BAU values in the report"
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
import risk_categories from "../risk_categories"


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
      level_of_detail: 'extended',
      level_of_detail_items: [{text: "Extended", value: "extended"},{text: "Simple", value: "simple"}],
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
      eqs_table: {header: [], value: []},
      delta_ecotox_table: {header: [], value: []},
      delta_eqs_table: {header: [], value: []},

      eutrophication_table:  {header: [], value: []},
      emissions_table: {header: [], value: []},
      simple_report_table: {header: [], value: []},
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
          dilution_factor: "Dilution factor",
          recycled: "Recycled water factor",
          treated: "Treated water factor",
          consumption_available: "Consumption available ratio",
          specific_water_consumption: "Specific water consumption",
          total_ghg: "Total GHG emissions",
          eutrophication: "Eutrophication potential",
          delta_tu: "Final Toxic Units in the receiving water body (assuming an initial amount of 0)",
          delta_eqs: "Final average pollutant concentration with respect to EQS in the receiving water body (assuming an initial concentration of 0)",
          avg_treatment_efficiency: "Average percentage of treatment efficiency"
        }

      }


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
      this.simple_report_table = await this.generate_simple_report_table()
      this.eqs_table = this.generate_eqs_table()
      this.delta_eqs_table = await this.generate_delta_eqs_table()
      this.delta_ecotox_table = await this.generate_delta_ecotox_table()


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
      this.simple_report_table = await this.generate_simple_report_table()
      this.eqs_table = this.generate_eqs_table()
      this.delta_eqs_table = await this.generate_delta_eqs_table()
      this.delta_ecotox_table = await this.generate_delta_ecotox_table()


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
          _this.simple_report_table = await _this.generate_simple_report_table()
          _this.eqs_table = _this.generate_eqs_table()
          _this.delta_eqs_table = await _this.generate_delta_eqs_table()
          _this.delta_ecotox_table = await _this.generate_delta_ecotox_table()

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
      this.simple_report_table = await this.generate_simple_report_table()
      this.eqs_table = this.generate_eqs_table()
      this.delta_eqs_table = await this.generate_delta_eqs_table()
      this.delta_ecotox_table = await this.generate_delta_ecotox_table()


    },

    level_of_detail: async function () {

      this.emissions_table = this.generate_emissions_table()
      this.water_quantity = await this.generate_water_quality_table()
      this.eutrophication_table = this.generate_eutrophication_table()
      this.ecotoxicity_table = this.generate_ecotoxicity_table()
      this.pollutants_table = await this.generate_pollutants_table()
      this.reporting_indicators = await this.generate_reporting_indicators_table()
      this.treatment_efficiency_table = this.generate_treatment_efficiency_table()
      this.layers_table = await this.generate_layers_table()
      this.simple_report_table = await this.generate_simple_report_table()
      this.eqs_table = this.generate_eqs_table()
      this.delta_eqs_table = await this.generate_delta_eqs_table()
      this.delta_ecotox_table = await this.generate_delta_ecotox_table()


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
      this.simple_report_table = await this.generate_simple_report_table()
      this.eqs_table = this.generate_eqs_table()
      this.delta_eqs_table = await this.generate_delta_eqs_table()
      this.delta_ecotox_table = await this.generate_delta_ecotox_table()

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
          _this.simple_report_table = await _this.generate_simple_report_table()
          _this.eqs_table = _this.generate_eqs_table()
          _this.delta_eqs_table = await _this.generate_delta_eqs_table()
          _this.delta_ecotox_table = await _this.generate_delta_ecotox_table()


        }
      })


    },

  },
  methods: {

    industries_deleted(){ //An industry or assessment has been deleted, if it's the current one return to map
      this.selected_assessments.splice(0, this.selected_assessments.length)

    },

    getAvailabilityColor (item, value) {
      if (item.value == this.table_title.availability_quantity.dilution_factor){
        return risk_categories["dilution_factor"](item[value])
      } else if (item.value == this.table_title.availability_quantity.recycled){
        return risk_categories["recycled_water_factor"](item[value])
      }else if (item.value == this.table_title.availability_quantity.treated){
        return risk_categories["water_treated"](item[value])
      }else if (item.value == this.table_title.availability_quantity.consumption_available){
        return risk_categories["water_stress_ratio"](item[value])
      }
      return null
    },

    getDeltaEcotoxColor(item, value) {
      if (item.value == this.table_title.pollutants.total){
        return risk_categories["delta_ecotoxicity"](item[value] / 11)
      } else {
        return risk_categories["delta_ecotoxicity"](item[value])
      }
    },

    getDeltaEQSColor(item, value) {
      return risk_categories["delta_eqs"](item[value])
    },

    getGISLayerColor(item, value){

      let equals = function(name1, name2){
        return name1 == name2 || name1 == name2 + " (BAU 2030)"
      }
      if (equals(item.layer, "Seasonal variability")){
        return risk_categories.seasonal_variability(item[value])
      }else if (equals(item.layer, "Interannual variability")){
        return risk_categories.interannual_variability(item[value])
      }else if (equals(item.layer, "Water stress")){
        return risk_categories.water_stress(item[value])
      }else if (equals(item.layer, "Water depletion")){
        return risk_categories.water_depletion(item[value])
      }else if (equals(item.layer, "Aridity index")){
        return risk_categories.aridity_index(item[value])
      }else if (equals(item.layer, "Groundwater table decline")){
        return risk_categories.groundwater_table_decline(item[value])
      }else if (equals(item.layer, "Riverine flood risk")){
        return risk_categories.riverine_flood_risk(item[value])
      }else if (equals(item.layer, "Coastal flood risk")){
        return risk_categories.coastal_flood_risk(item[value])
      }else if (equals(item.layer, "Drought risk")){
        return risk_categories.drought_risk(item[value])
      }else if (equals(item.layer, "Coastal eutrophication potential")){
        return risk_categories.coastal_eutrophication_potential(item[value])
      }else if (equals(item.layer, "Peak RepRisk Country ESG Risk Index")){
        return risk_categories.reprisk(item[value])
      }else if (equals(item.layer, "Unimproved/No Sanitation")){
        return risk_categories.no_sanitation(item[value])
      } else if (equals(item.layer, "Unimproved/No Drinking Water")){
        return risk_categories.no_drinking(item[value])
      }
    },

    getReportingColor(item, value) {
      if (item.value == "Effect of water withdrawal on the water body (GRI 303-2)"){
        return risk_categories["withdrawal_effect"](item[value])
      } else if (item.value == "Effect of water discharges on the water body (GRI 306-5)"){
        return risk_categories["discharge_effect"](item[value])
      }
    },

    getSimpleReportColor(item, value){

      if (item.value == this.table_title.simple_table.dilution_factor){
        return risk_categories["dilution_factor"](item[value])
      } else if (item.value == this.table_title.simple_table.recycled){
        return risk_categories["recycled_water_factor"](item[value])
      } else if (item.value == this.table_title.simple_table.treated){
        return risk_categories["water_treated"](item[value])
      } else if (item.value == this.table_title.simple_table.consumption_available){
        return risk_categories["water_stress_ratio"](item[value])
      } else if (item.value == this.table_title.simple_table.delta_tu){
        return risk_categories["delta_ecotoxicity"](item[value])
      } else if (item.value == this.table_title.simple_table.delta_eqs){
        return risk_categories["delta_eqs"](item[value])
      }
    },

    itemRowBold: function (item) {
      return item.value == "Total" ? 'style-1' : 'style-2'
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
          header: [{text: "Emissions", value: "value", sortable: false}],
          emissions: []
        }

        let elec = {value: _this.table_title.global_warming_potential.elec, unit: "kgCO2eq"}
        let fuel = {value: _this.table_title.global_warming_potential.fuel, unit: "kgCO2eq"}
        let tre = {value: _this.table_title.global_warming_potential.treatment, unit: "kgCO2eq"}
        let biog = {value: _this.table_title.global_warming_potential.biogas, unit: "kgCO2eq"}
        let slu = {value: _this.table_title.global_warming_potential.sludge, unit: "kgCO2eq"}
        let reus = {value: _this.table_title.global_warming_potential.reuse, unit: "kgCO2eq"}
        let disc = {value: _this.table_title.global_warming_potential.discharged, unit: "kgCO2eq"}
        let total = {value: _this.table_title.global_warming_potential.total, unit: "kgCO2eq"}


        const data_chart = {
          labels: [],
          datasets: [{
            data: [],
            backgroundColor: []
          }]
        };



        for (const [key, industries] of Object.entries(_this.industries_aggregated)) {
          let total_emission = 0
          emission_table.header.push({
            text: key, value: key,
          })
          let emissions = metrics.emissions_and_descriptions(industries, days_factor)

          elec[key] = emissions["elec"]
          fuel[key] = emissions["fuel"]
          tre[key] = emissions["treatment"]
          biog[key] = emissions["biog"]
          slu[key] = emissions["slu"]
          reus[key] = emissions["reuse"]
          disc[key] = emissions["disc"]
          total[key] = emissions["total"]

          data_chart.datasets[0].data.push(emissions["total"])
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

        let tn = {value: _this.table_title.pollutants.tn, unit: "gPO4eq/m3"}
        let tp = {value: _this.table_title.pollutants.tp, unit: "gPO4eq/m3"}
        let total = {value: _this.table_title.pollutants.total, unit: "gPO4eq/m3"}
        let cod = {value: _this.table_title.pollutants.cod, unit: "gPO4eq/m3"}


        const data_chart = {
          labels: [],
          datasets: [{
            data: [],
            backgroundColor: []
          }]
        };

        for (const [key, industries] of Object.entries(_this.industries_aggregated)) {

          pollutants_table.header.push({
            text: key, value: key,
          })

          let eutrophication = metrics.eutrophication_potential(industries)

          cod[key] = eutrophication.cod
          tn[key] = eutrophication.tn
          tp[key] = eutrophication.tp
          total[key] = eutrophication.total


          data_chart.datasets[0].data.push(eutrophication.total)
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


        let dichloroethane = {value: _this.table_title.pollutants.diclo, unit: "TU"}
        let cadmium = {value: _this.table_title.pollutants.cadmium, unit: "TU"}
        let hexachlorobenzene = {value: _this.table_title.pollutants.hexaclorobenzene, unit: "TU"}
        let mercury = {value: _this.table_title.pollutants.mercury, unit: "TU"}
        let lead = {value: _this.table_title.pollutants.lead, unit: "TU"}
        let nickel = {value: _this.table_title.pollutants.nickel, unit: "TU"}
        let chloroalkanes = {value: _this.table_title.pollutants.chloroalkanes, unit: "TU"}
        let hexaclorobutadie = {value: _this.table_title.pollutants.hexaclorobutadie, unit: "TU"}
        let nonylphenols = {value: _this.table_title.pollutants.nonylphenols, unit: "TU"}
        let tetrachloroethene = {value: _this.table_title.pollutants.tetrachloroethene, unit: "TU"}
        let trichloroethylene = {value: _this.table_title.pollutants.tricloroetile, unit: "TU"}
        let total = {value: _this.table_title.pollutants.total, unit: "TU"}

        const data_chart = {
          labels: [],
          datasets: [{
            data: [],
            backgroundColor: []
          }]
        };

        for (const [key, industries] of Object.entries(_this.industries_aggregated)) {

          pollutants_table.header.push({
            text: key, value: key,
          })

          let tu = metrics.ecotoxicity_potential_tu(industries)
          dichloroethane[key] = tu.diclo
          cadmium[key] = tu.cadmium
          hexachlorobenzene[key] = tu.hexaclorobenzene
          mercury[key] = tu.mercury
          lead[key] = tu.lead
          nickel[key] = tu.nickel
          chloroalkanes[key] = tu.chloroalkanes
          hexaclorobutadie[key] = tu.hexaclorobutadie
          nonylphenols[key] = tu.nonylphenols
          tetrachloroethene[key] = tu.tetracloroetile
          trichloroethylene[key] = tu.tricloroetile
          total[key] = tu.total

          data_chart.datasets[0].data.push(total[key])
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
                labelString: 'TU'
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

    async generate_delta_eqs_table() {

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

        let dichloroethane = {value: _this.table_title.pollutants.diclo, unit: "-"}
        let cadmium = {value: _this.table_title.pollutants.cadmium, unit: "-"}
        let hexachlorobenzene = {value: _this.table_title.pollutants.hexaclorobenzene, unit: "-"}
        let mercury = {value: _this.table_title.pollutants.mercury, unit: "-"}
        let lead = {value: _this.table_title.pollutants.lead, unit: "-"}
        let nickel = {value: _this.table_title.pollutants.nickel, unit: "-"}
        let chloroalkanes = {value: _this.table_title.pollutants.chloroalkanes, unit: "-"}
        let hexaclorobutadie = {value: _this.table_title.pollutants.hexaclorobutadie, unit: "-"}
        let nonylphenols = {value: _this.table_title.pollutants.nonylphenols, unit: "-"}
        let tetrachloroethene = {value: _this.table_title.pollutants.tetrachloroethene, unit: "-"}
        let trichloroethylene = {value: _this.table_title.pollutants.tricloroetile, unit: "-"}


        for (const [key, industries] of Object.entries(_this.industries_aggregated)) {

          pollutants_table.header.push({
            text: key, value: key,
          })

          let tu = await metrics.delta_eqs(industries, _this.global_layers)
          dichloroethane[key] = tu.diclo
          cadmium[key] = tu.cadmium
          hexachlorobenzene[key] = tu.hexaclorobenzene
          mercury[key] = tu.mercury
          lead[key] = tu.lead
          nickel[key] = tu.nickel
          chloroalkanes[key] = tu.chloroalkanes
          hexaclorobutadie[key] = tu.hexaclorobutadie
          nonylphenols[key] = tu.nonylphenols
          tetrachloroethene[key] = tu.tetracloroetile
          trichloroethylene[key] = tu.tricloroetile

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

        return pollutants_table
      }
      else return {header: [], emissions: []}

    },
    async generate_delta_ecotox_table() {

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

        let dichloroethane = {value: _this.table_title.pollutants.diclo, unit: "TU"}
        let cadmium = {value: _this.table_title.pollutants.cadmium, unit: "TU"}
        let hexachlorobenzene = {value: _this.table_title.pollutants.hexaclorobenzene, unit: "TU"}
        let mercury = {value: _this.table_title.pollutants.mercury, unit: "TU"}
        let lead = {value: _this.table_title.pollutants.lead, unit: "TU"}
        let nickel = {value: _this.table_title.pollutants.nickel, unit: "TU"}
        let chloroalkanes = {value: _this.table_title.pollutants.chloroalkanes, unit: "TU"}
        let hexaclorobutadie = {value: _this.table_title.pollutants.hexaclorobutadie, unit: "TU"}
        let nonylphenols = {value: _this.table_title.pollutants.nonylphenols, unit: "TU"}
        let tetrachloroethene = {value: _this.table_title.pollutants.tetrachloroethene, unit: "TU"}
        let trichloroethylene = {value: _this.table_title.pollutants.tricloroetile, unit: "TU"}
        let total = {value: _this.table_title.pollutants.total, unit: "TU"}

        const data_chart = {
          labels: [],
          datasets: [{
            data: [],
            backgroundColor: []
          }]
        };

        for (const [key, industries] of Object.entries(_this.industries_aggregated)) {

          pollutants_table.header.push({
            text: key, value: key,
          })

          let tu = await metrics.delta_tu(industries, _this.global_layers)
          dichloroethane[key] = tu.diclo
          cadmium[key] = tu.cadmium
          hexachlorobenzene[key] = tu.hexaclorobenzene
          mercury[key] = tu.mercury
          lead[key] = tu.lead
          nickel[key] = tu.nickel
          chloroalkanes[key] = tu.chloroalkanes
          hexaclorobutadie[key] = tu.hexaclorobutadie
          nonylphenols[key] = tu.nonylphenols
          tetrachloroethene[key] = tu.tetracloroetile
          trichloroethylene[key] = tu.tricloroetile
          total[key] = tu.total

          data_chart.datasets[0].data.push(total[key])
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
                labelString: 'TU'
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


    generate_eqs_table() {

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

        let dichloroethane = {value: _this.table_title.pollutants.diclo, unit: "-"}
        let cadmium = {value: _this.table_title.pollutants.cadmium, unit: "-"}
        let hexachlorobenzene = {value: _this.table_title.pollutants.hexaclorobenzene, unit: "."}
        let mercury = {value: _this.table_title.pollutants.mercury, unit: "-"}
        let lead = {value: _this.table_title.pollutants.lead, unit: "-"}
        let nickel = {value: _this.table_title.pollutants.nickel, unit: "-"}
        let chloroalkanes = {value: _this.table_title.pollutants.chloroalkanes, unit: "-"}
        let hexaclorobutadie = {value: _this.table_title.pollutants.hexaclorobutadie, unit: "-"}
        let nonylphenols = {value: _this.table_title.pollutants.nonylphenols, unit: "-"}
        let tetrachloroethene = {value: _this.table_title.pollutants.tetrachloroethene, unit: "-"}
        let trichloroethylene = {value: _this.table_title.pollutants.tricloroetile, unit: "-"}

        for (const [key, industries] of Object.entries(_this.industries_aggregated)) {

          pollutants_table.header.push({
            text: key, value: key,
          })

          let tu = metrics.environmental_quality_standards(industries)
          dichloroethane[key] = tu.diclo
          cadmium[key] = tu.cadmium
          hexachlorobenzene[key] = tu.hexaclorobenzene
          mercury[key] = tu.mercury
          lead[key] = tu.lead
          nickel[key] = tu.nickel
          chloroalkanes[key] = tu.chloroalkanes
          hexaclorobutadie[key] = tu.hexaclorobutadie
          nonylphenols[key] = tu.nonylphenols
          tetrachloroethene[key] = tu.tetracloroetile
          trichloroethylene[key] = tu.tricloroetile

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

        for (const [key, industries] of Object.entries(_this.industries_aggregated)) {
          let indicators = await metrics.reporting_metrics(industries, this.global_layers)

          table.header.push({
            text: key, value: key,
          })

          g4_en8[key] = indicators["g4-en8"]
          g4_en9[key] = indicators["g4-en9"]
          g4_en10[key] = indicators["g4-en10"]
          g4_en22[key] = indicators["g4-en22"]
          g4_en26[key] = indicators["g4-en26"]

          wd[key] = indicators["wd"]
          dis[key] = indicators["dis"]
          re[key] = indicators["dis"]

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

    async generate_simple_report_table() {

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

        let dilution_factor_row = {value: _this.table_title.simple_table.dilution_factor, unit: "-", info: "Ratio of concentration in the effluent to concentration in the receiving water after mixing in the receiving water. Bigger values indicate less impact of the effluent concentration to the river."}
        let recycled_factor = {value: _this.table_title.simple_table.recycled, unit: "%", info:"This metric indicates the percentage of the reused water used by the industry. Values that may have this metric range from 0 to 100, the larger its value the less impact it will generate."}
        let treated_factor = {value: _this.table_title.simple_table.treated, unit: "%", info:"Amount of water treated in the treatment plant divided by the amount of water withdrawn. The higher the value, the better."}
        let available_ratio = {value: _this.table_title.simple_table.consumption_available, unit: "%", info: "This metric is calculated from the relationship between the amount of water withdrawn by the industry and the amount of water available and multiplied by 100. It indicates the percentage of the available water withdrawn by the industry’s consumption. This metric may have values ranging from 0, to a value greater than 100, indicating that the demand for water is higher than the available."}
        let efficiency_factor = {value: _this.table_title.simple_table.specific_water_consumption, unit: "tonnes/m3", info: "Tonnes of product produced by the industry per cubic meter of water used"}
        let total_ghg = {value: _this.table_title.simple_table.total_ghg, unit: "kgCO2eq"}
        let eutrophication = {value: _this.table_title.simple_table.eutrophication, unit: "gPO4eq/m3"}
        let delta_tu = {value: _this.table_title.simple_table.delta_tu, unit: "TU"}
        let delta_eqs = {value: _this.table_title.simple_table.delta_eqs , unit: "-"}
        let avg_treatment_efficiency = {value: _this.table_title.simple_table.avg_treatment_efficiency, unit: "%"}


        for (const [key, industries] of Object.entries(_this.industries_aggregated)) {
          pollutants_table.header.push({
            text: key, value: key,
          })

          let dilution_factor_value = await metrics.dilution_factor(this.global_layers, industries)
          dilution_factor_row[key] = dilution_factor_value

          recycled_factor[key] = metrics.recycled_water_factor(industries)
          treated_factor[key] = metrics.treated_water_factor(industries)
          let available_ratio_value = await metrics.available_ratio(this.global_layers, industries)
          available_ratio[key] = available_ratio_value
          efficiency_factor[key] = metrics.efficiency_factor(industries)
          total_ghg[key] = metrics.emissions_and_descriptions(industries, days_factor).total
          eutrophication[key] = metrics.eutrophication_potential(industries).total
          delta_tu[key] = (await metrics.delta_tu(industries, this.global_layers)).total
          delta_eqs[key] = await metrics.delta_eqs_avg(industries, this.global_layers)
          avg_treatment_efficiency[key]  = metrics.avg_treatment_efficiency(industries)
        }


        pollutants_table.header.push({text: "Unit", value: "unit", sortable: false,})

        pollutants_table.value.push(dilution_factor_row)
        pollutants_table.value.push(recycled_factor)
        pollutants_table.value.push(treated_factor)
        pollutants_table.value.push(available_ratio)
        pollutants_table.value.push(efficiency_factor)
        //pollutants_table.value.push(water_quality_standards)
        pollutants_table.value.push(total_ghg)
        pollutants_table.value.push(eutrophication)
        pollutants_table.value.push(delta_tu)
        pollutants_table.value.push(delta_eqs)
        pollutants_table.value.push(avg_treatment_efficiency)

        return pollutants_table
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

        let dilution_factor_row = {value: _this.table_title.availability_quantity.dilution_factor, unit: "-", info: "Ratio of concentration in the effluent to concentration in the receiving water after mixing in the receiving water. Bigger values indicate less impact of the effluent concentration to the river."}
        let recycled_factor = {value: _this.table_title.availability_quantity.recycled, unit: "%", info:"This metric indicates the percentage of the reused water used by the industry. Values that may have this metric range from 0 to 100, the larger its value the less impact it will generate."}
        let treated_factor = {value: _this.table_title.availability_quantity.treated, unit: "%", info:"Amount of water treated in the treatment plant divided by the amount of water withdrawn. The higher the value, the better."}
        let available_ratio = {value: _this.table_title.availability_quantity.consumption_available, unit: "%", info: "This metric is calculated from the relationship between the amount of water withdrawn by the industry and the amount of water available and multiplied by 100. It indicates the percentage of the available water withdrawn by the industry’s consumption. This metric may have values ranging from 0, to a value greater than 100, indicating that the demand for water is higher than the available."}
        let efficiency_factor = {value: _this.table_title.availability_quantity.specific_water_consumption, unit: "tonnes/m3", info: "Tonnes of product produced by the industry per cubic meter of water used"}
        //let water_quality_standards = {value: "Environmental quality standards", unit: "%", info: "Percentage of emitted pollutants exceeding the maximum allowable concentration"}


        let data_chart = {
          labels: ["Recycled water factor", "Treated water factor", "Consumption available ratio"],
          datasets: []
        };

        for (const [key, industries] of Object.entries(_this.industries_aggregated)) {
          pollutants_table.header.push({
            text: key, value: key,
          })

          let dilution_factor_value = await metrics.dilution_factor(this.global_layers, industries)
          dilution_factor_row[key] = dilution_factor_value

          recycled_factor[key] = metrics.recycled_water_factor(industries)

          treated_factor[key] = metrics.treated_water_factor(industries)

          let available_ratio_value = await metrics.available_ratio(this.global_layers, industries)
          available_ratio[key] = available_ratio_value

          efficiency_factor[key] = metrics.efficiency_factor(industries)

          //water_quality_standards[key] = metrics.nqa(industries)

          data_chart.datasets.push({
            data: [recycled_factor[key], treated_factor[key], available_ratio_value],
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
        //pollutants_table.value.push(water_quality_standards)


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
        let bod = {value: "COD treatment efficiency", unit: "%"}


        let data_chart = {
          labels: ["COD", "TN", "TP", "1,2-Dichloroethane", "Cadmium", "Hexachlorobenzene", "Mercury", "Lead", "Nickel", "Chloroalkanes", "Hexachlorobutadiene", "Nonylphenols", "Tetrachloroethene", "Trichloroethylene"],
          datasets: []
        };


        for (const [key, industries] of Object.entries(_this.industries_aggregated)) {
          pollutants_table.header.push({
            text: key, value: key,
          })

          tn[key] = metrics.tn_efficiency(industries)
          tp[key] = metrics.tp_efficiency(industries)
          bod[key] = metrics.bod_efficiency(industries)
          dichloroethane[key] = metrics.dichloroethane_efficiency(industries)
          cadmium[key] = metrics.cadmium_efficiency(industries)
          hexachlorobenzene[key] = metrics.hexaclorobenzene_efficiency(industries)
          mercury[key] = metrics.mercury_efficiency(industries)
          lead[key] = metrics.lead_efficiency(industries)
          nickel[key] = metrics.nickel_efficiency(industries)
          chloroalkanes[key] = metrics.chloroalkanes_efficiency(industries)
          hexaclorobutadie[key] = metrics.hexaclorobutadie_efficiency(industries)
          nonylphenols[key] = metrics.nonylphenols_efficiency(industries)
          tetrachloroethene[key] = metrics.tetrachloroethene_efficiency(industries)
          trichloroethylene[key] = metrics.tricloroetile_efficiency(industries)


          data_chart.datasets.push({

            data: [bod[key], tn[key], tp[key], dichloroethane[key], cadmium[key], hexachlorobenzene[key], mercury[key], lead[key], nickel[key], chloroalkanes[key], hexaclorobutadie[key], nonylphenols[key], tetrachloroethene[key], trichloroethylene[key]],
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

        let tn = {value: _this.table_title.pollutants.tn, unit: "g/m3"}
        let tp = {value: _this.table_title.pollutants.tp, unit: "g/m3"}
        let dichloroethane = {value: _this.table_title.pollutants.diclo, unit: "g/m3"}
        let cadmium = {value: _this.table_title.pollutants.cadmium, unit: "g/m3"}
        let hexachlorobenzene = {value: _this.table_title.pollutants.hexaclorobenzene, unit: "g/m3"}
        let mercury = {value: _this.table_title.pollutants.mercury, unit: "g/m3"}
        let lead = {value: _this.table_title.pollutants.lead, unit: "g/m3"}
        let nickel = {value: _this.table_title.pollutants.nickel, unit: "g/m3"}
        let chloroalkanes = {value:_this.table_title.pollutants.chloroalkanes, unit: "g/m3"}
        let hexaclorobutadie = {value: _this.table_title.pollutants.hexaclorobutadie, unit: "g/m3"}
        let nonylphenols = {value:_this.table_title.pollutants.nonylphenols, unit: "g/m3"}
        let tetrachloroethene = {value: _this.table_title.pollutants.tetrachloroethene, unit: "g/m3"}
        let trichloroethylene = {value: _this.table_title.pollutants.tricloroetile, unit: "g/m3"}
        let bod = {value: _this.table_title.pollutants.cod, unit: "g/m3"}

        for (const [key, industries] of Object.entries(_this.industries_aggregated)) {
          pollutants_table.header.push({
            text: key, value: key,
          })

          let tn_value = await metrics.tn_effl(industries,this.global_layers)
          tn[key] = tn_value

          let tp_value = await metrics.tp_effl(industries, this.global_layers)
          tp[key] = tp_value

          let bod_value = await metrics.bod_effl(industries, this.global_layers)
          bod[key] = bod_value

          let dichloroethane_value = await metrics.dichloroethane_effl(industries, this.global_layers)
          dichloroethane[key] = dichloroethane_value

          let cadmium_value = await metrics.cadmium_effl(industries, this.global_layers)
          cadmium[key] = cadmium_value

          let hexaclorobenzene_value = await metrics.hexaclorobenzene_effl(industries, this.global_layers)
          hexachlorobenzene[key] = hexaclorobenzene_value

          let mercury_value = await metrics.mercury_effl(industries, this.global_layers)
          mercury[key] = mercury_value

          let lead_value = await metrics.lead_effl(industries, this.global_layers)
          lead[key] = lead_value

          let nickel_value = await metrics.nickel_effl(industries, this.global_layers)
          nickel[key] = nickel_value

          let chloroalkanes_value = await  metrics.chloroalkanes_effl(industries, this.global_layers)
          chloroalkanes[key] = chloroalkanes_value

          let hexaclorobutadie_value = await metrics.hexaclorobutadie_effl(industries,this.global_layers)
          hexaclorobutadie[key] = hexaclorobutadie_value

          let nonylphenols_value = await metrics.nonylphenols_effl(industries, this.global_layers)
          nonylphenols[key] = nonylphenols_value

          let tetrachloroethene_value = await metrics.tetrachloroethene_effl(industries, this.global_layers)
          tetrachloroethene[key] = tetrachloroethene_value

          let trichloroethylene_value = await metrics.tricloroetile_effl(industries, this.global_layers)
          trichloroethylene[key] = trichloroethylene_value

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


        let layer_table = {
          header: [{text: "Layer", value: "layer", sortable: false}],
          value: []
        }

        let industries_and_supply_chain = []
        Object.values(groupedByAssessments)[_this.tab].forEach(industryAux => {
          let industry = industryAux.industry

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
        })



        for (const industry of industries_and_supply_chain) {
          layer_table.header.push({text: industry.name, value: industry.name})
        }
        layer_table.header.push({text: "Unit", value: "unit"})

        for (let [layer_name, info] of selected_layers_formatted) {
          let current_layer = {layer: layer_name}
          let future_layer = {layer: layer_name + " (BAU 2030)"}


          for (let industry of industries_and_supply_chain) {
            console.log(industry)
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


      for (const [key, industries] of Object.entries(this.industries_aggregated)) {
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
              {text:"Specific water consumption (tonnes/m3)",style: "bold"},
              {text:"Environmental Quality Standards (%)",style: "bold"},
            ]
          ]
        }
      }

      let data_chart = {
        labels: ["Recycled water factor", "Treated water factor", "Consumption available ratio", "Quality standards"],
        datasets: []
      };

      for (const [key, industries] of Object.entries(this.industries_aggregated)) {
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


      for (const [key, industries] of Object.entries(this.industries_aggregated)) {

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


      for (const [key, industries] of Object.entries(this.industries_aggregated)) {

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
              {text:"Toxic units (TU)",style: "bold"},
            ]
          ]
        }
      }



      for (const [key, industries] of Object.entries(this.industries_aggregated)) {

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

      for (const [key, industries] of Object.entries(this.industries_aggregated)) {
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

      for (const [key, industries] of Object.entries(this.industries_aggregated)) {
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


    for (const [key, industries] of Object.entries(this.industries_aggregated)) {
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
          console.log(groupedByCountry)
          return groupedByCountry
        }
        else if(_this.aggregation_level == "industry"){
          let industries = {}
          industriesOfassessment.forEach(industry => {
            industries[industry.name] = [industry]
          })
          return industries
        }
      }
    },

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

<style>
  .style-1 {
    font-weight: bold;
  }
  .style-2 {
    font-weight: normal;
  }
</style>

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

.table_title {
  font-size: 140%;
  font-weight: bold;
}

b {
  padding-left: 10px;
}
.v-chip {
  margin-left: -11px !important;
}

table {
  padding: 15px;
}

</style>