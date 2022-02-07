<template>
  <div class="outer">
    <div v-if="is_there_any_industry_created" style="height: 100%;">
      <div style="height: 100%;">
        <v-tabs
            center-active
            grow
            id="main_tab"
            v-model="main_tab"
        >
          <v-tabs-slider color="#b62373"></v-tabs-slider>
          <v-tab style="border-color: #b62373">REPORT</v-tab>
          <v-tab style="border-color: #b62373">EDIT INDUSTRY</v-tab>
          <v-tab style="border-color: #b62373">VALUES OF GLOBAL INDICATORS</v-tab>
          <v-tab style="border-color: #b62373">EXPORT IN PDF</v-tab>

        </v-tabs>
        <v-row>
          <v-col cols="9">
            <div>
              <v-tabs v-model="tab" id="assessment_tab" v-show="main_tab != 3">
                <v-tab
                    v-for="(assessment, idx) in assessments_with_industries"
                    :key="assessment.assessment.name"
                    @click="click_tab(idx)"
                    :disabled="assessment.disabled"
                >
                  {{assessment.assessment.name}}
                </v-tab>
              </v-tabs>
            </div>
          </v-col>
        </v-row>

        <v-row style="height: 82%" class = "border_report" v-if="is_there_any_industry_created">

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
                                  disable-pagination
                                  :hide-default-footer="true"
                                  dense
                                  single-expand
                                  show-expand
                                  item-key="industry_name"
                                  class="simple_report_table"
                                  @click:row="(item, slot) => slot.expand(!slot.isExpanded)"
                              >


                                <template v-slot:expanded-item="{ headers, item }">
                                  <td :colspan="headers.length" style="padding: 20px; background-color: #c4c4d4">
                                    <v-data-table
                                        :headers="get_supply_chain(item.industry).header"
                                        :items="get_supply_chain(item.industry).items"
                                        :hide-default-footer="true"
                                        class="expanded_table_hover"
                                    ></v-data-table>
                                  </td>
                                </template>


                              </v-data-table>
                            </v-expansion-panel-content>
                          </v-expansion-panel>
                          <v-expansion-panel>
                            <v-expansion-panel-header>
                              <div class = table_descriptor>
                                <span class="table_title"> Impacts and levers for actions </span>
                              </div>
                            </v-expansion-panel-header>
                            <v-expansion-panel-content>

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
                                    v-for="value in ['pollution_impact', 'freshwater_impact', 'carbon_impact']"
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


                            </v-expansion-panel-content>
                          </v-expansion-panel>
                          <v-expansion-panel>
                            <v-expansion-panel-header>
                              <div class = table_descriptor>
                                <span class="table_title"> Indicators for external reporting </span>
                              </div>
                            </v-expansion-panel-header>
                            <v-expansion-panel-content>
                              <v-data-table
                                  :headers="reporting_indicators.header"
                                  :items="reporting_indicators.value"
                                  disable-pagination
                                  :hide-default-footer="true"
                                  dense
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
                            </v-expansion-panel-content>
                          </v-expansion-panel>
                        </v-expansion-panels>


                      </div>

                    </v-card>
                  </v-tab-item>
                </v-tabs-items>
              </div>

            </template>
            <template v-else-if="main_tab == 1" class="report" >

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
                                  v-show="is_industry_valid(created_assessments[tab].industries[n-1])"
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
            <template v-else-if="main_tab == 2" class="report" >

              <div style="width: 100%; height: 100%">
                <v-tabs-items v-model="tab" style="padding-bottom: 0px">
                  <v-tab-item
                      v-for="(assessment_name, idx) in assessment_names"
                      :key="assessment_name"
                  >
                    <br>
                    <v-card flat style="margin-left: 10px;">

                      <div>

                        <p class="side_menu_title">Layers to include in the report</p>
                        <div class="instructions_2">
                          *This step may require a some time, depending on the selected layers and the industries created
                        </div>

                        <v-row
                              class="pa-4"
                              justify="space-between"
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
                              </v-radio-group>

                            </v-col>
                            <v-divider vertical></v-divider>

                            <v-col
                                class="d-flex">
                              <div style="width: 100%">
                                <v-data-table
                                    :headers="layers_table.header"
                                    :items="layers_table.value"
                                    v-if="selected_layers.length > 0 "
                                    disable-pagination
                                    :hide-default-footer="true"
                                    dense
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
                                <b v-else>Select a layer</b>
                              </div>

                            </v-col>
                          </v-row>


                      </div>

                    </v-card>
                  </v-tab-item>
                </v-tabs-items>
              </div>

            </template>
            <template v-else-if="main_tab == 3" class="report" >

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
        <div style="width: 700px; margin-top: 20px; margin-bottom: 20px">
          <canvas id="chart"></canvas>
        </div>

      </div>

    </div>
    <div v-else>
      <p class="side_menu_title">Please create an industry first and fill in the required data to generate a report.</p>
    </div>

    <br>


    <div v-if="industry_clicked != null">

      <!-- Quality and quantity -->
      <v-dialog
          v-model="info_energy_used"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3>Energy used</h3>
          <br>
          Energy used by wastewater treatment plants to treat the water sent to the treatment plant.
          <div v-katex:display="'\\sum_{i \\in WWTPS} W_{t_{i}} \\cdot energy_{{consumed}_i}'"></div>
          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'WWTPS'"></span>: Onsite and external WWTP's where industry treats water</li>
            <li><span v-katex="'W_t'"></span>: Volume of water treated in the WWTP</li>
            <li><span v-katex="'energy_{consumed}'"></span>: Electricity consumed from the grid for wastewater treatment per cubic meter treated</li>

          </ul>
        </div>

      </v-dialog>

      <v-dialog
          v-model="info_dilution_factor"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3>Dilution factor</h3>
          <br>
          Ratio of concentration in the effluent to concentration in the receiving water after mixing in the receiving water. Bigger values indicate less impact of the effluent concentration to the river.
          <div v-katex:display="'\\frac{W_a + W_{effl} - W_w}{W_{effl}}'"></div>
          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'W_a'"></span>: Amount of water available in the river <b>(streamflow global indicator)</b></li>
            <li><span v-katex="'W_w'"></span>: Amount of water withdrawn from the river</li>
            <li><span v-katex="'W_{effl}'"></span>: Amount of water discharged into the river by industry</li>

          </ul>
        </div>

      </v-dialog>
      <v-dialog
          v-model="info_recycled_factor"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3>Recycled water factor</h3>
          <br>
          This metric indicates the percentage of the reused water used by the industry
          respect the water that leaves the industry (to direct discharge, onsite industry
          WWTP effluent and to external WWTP effluent). Values that may have this
          metric range from 0 to 100, the larger its value the more efficient the water
          recycled is.
          <div v-katex:display="'\\frac{W_r}{OWWTP_{infl} + EWWTP_{infl} + DD}'"></div>
          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'W_r'"></span>: Amount of water that the industry reuses/recycles from the WWTP.</li>

            <li><span v-katex="'OWWTP_{infl}'"></span>: On-site industrial WWTP influent</li>
            <li><span v-katex="'EWWTP_{infl}'"></span>: External WWTP influent </li>
            <li><span v-katex="'DD'"></span>: Amount of water discharged into the river by industry</li>
          </ul>
        </div>

      </v-dialog>
      <v-dialog
          v-model="info_treated_factor"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3>Treated water factor</h3>
          <br>
          This metric indicates the ratio between the water remaining after the industry consumption and the water that is treated in the WWTP.
          <div v-katex:display="'\\frac{W_t}{OWWTP_{infl} + EWWTP_{infl} + DD}'"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'W_t'"></span>: Amount of water used by the industry that is treated in a WWTP</li>
            <li><span v-katex="'OWWTP_{infl}'"></span>: On-site industrial WWTP influent</li>
            <li><span v-katex="'EWWTP_{infl}'"></span>: External WWTP influent </li>
            <li><span v-katex="'DD'"></span>: Amount of water discharged into the river by industry</li>
          </ul>
        </div>

      </v-dialog>
      <v-dialog
          v-model="info_water_stress"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3>Consumption available (level of water stress)</h3>
          <br>
          This metric is calculated from the relationship between the amount of water withdrawn by the industry and the amount of water available and multiplied by 100. It indicates the percentage of the available water withdrawn by the industry’s consumption. This metric may have values ranging from 0, to a value greater than 100, indicating that the demand for water is higher than the available.
          <div v-katex:display="'100 \\cdot \\frac{W_w}{W_a}'"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'W_w'"></span>: amount of water that the industry withdraws from the river.</li>

            <li><span v-katex="'W_a'"></span>: amount of water available on the river <b>(streamflow global indicator)</b></li>
          </ul>
        </div>

      </v-dialog>
      <v-dialog
          v-model="info_specific_consumption"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3>Specific water consumption </h3>
          <br>
          Specific water consumption is a metric that indicates what is the amount of water from the water body needed to produce a tone of product manufactured in the industry. Higher values indicate higher water demand.
          <div v-katex:display="'\\frac{T_{ppi}}{W_w}'"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'T_{ppi}'"></span>: tons of product produced by the industry</li>

            <li><span v-katex="'W_w'"></span>: amount of water that the industry withdraws from the river</li>
          </ul>
        </div>

      </v-dialog>

      <!-- GHG -->
      <v-dialog
          v-model="info_electricity"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3>Indirect emissions from electricity consumption </h3>
          <br>
          <div v-katex:display="'\\sum_{i \\in WWTPS}EF_{i} \\cdot EC_i \\cdot W_t'"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'WWTPS'"></span>: onsite and external WWTP's where industry treats water</li>
            <li><span v-katex="'EF'"></span>: emission factor for grid electricity</li>
            <li><span v-katex="'EC'"></span>: energy consumed from the grid for wastewater treatment per cubic meter treated </li>
            <li><span v-katex="'W_t'"></span>: Amount of water treated </li>

          </ul>
        </div>

      </v-dialog>
      <v-dialog
          v-model="info_fuel_engines"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
            <h3>Emissions from fuel engines </h3>
          <br>
          Direct CO2 emitted from on-site engines in wastewater stages based upon sum of CO2, CH4 and N2O emission from stationary combustion.
          <div v-katex:display="'CO_2 = \\sum_{i \\in WWTPS} \\frac{V_i \\cdot FD \\cdot NCV \\cdot EF_{CO_2}}{1000}'"></div>
          <div v-katex:display="'N_2O = \\sum_{i \\in WWTPS} \\frac{V_i \\cdot FD \\cdot NCV \\cdot EF_{N_2O} \\cdot EQ_{N_2O}}{1000}'"></div>
          <div v-katex:display="'CH_{4} = \\sum_{i \\in WWTPS} \\frac{V_i \\cdot FD \\cdot NCV \\cdot EF_{CH_4} \\cdot EQ_{CH_4}}{1000}'"></div>
          <div v-katex:display="'Total = CO_2 + N_2O + CH_4'"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'WWTPS'"></span>: onsite and external WWTP's where industry treats water</li>
            <li><span v-katex="'V'"></span>: volume of fuel consumed</li>
            <li><span v-katex="'EQ_{N_2O}'"></span>:  conversion of N2O emissions to CO2 equivalent emissions (<b>298 kgCO2eq/kgN2O</b>) </li>
            <li><span v-katex="'EQ_{CH_4}'"></span>:  Conversion of CH4 emissions to CO2 equivalent emissions (<b>34 kgCO2eq/kgCH4</b>) </li>
          </ul>
          <br>
          <table style="width: 90%; border: 1px solid; border-collapse: collapse">
            <tr style="border: 1px solid; border-collapse: collapse">
              <td style="border: 1px solid; border-collapse: collapse"><b>Fuel type</b></td>
              <td style="border: 1px solid; border-collapse: collapse"><b>EFCH4 <br> (kg/TJ) </b></td>
              <td style="border: 1px solid; border-collapse: collapse"><b>EFN2O  <br> (kg/TJ) </b></td>
              <td style="border: 1px solid; border-collapse: collapse"><b>EFCO2  <br> (kg/TJ) </b></td>
              <td style="border: 1px solid; border-collapse: collapse"><b>FD  <br> (kg/L)  </b></td>
              <td style="border: 1px solid; border-collapse: collapse"><b>NCV  <br> (TJ/Gg)  </b></td>
            </tr>
            <tr style="border: 1px solid; border-collapse: collapse">
              <td style="border: 1px solid; border-collapse: collapse">Diesel</td>
              <td style="border: 1px solid; border-collapse: collapse">3</td>
              <td style="border: 1px solid; border-collapse: collapse">0.6</td>
              <td style="border: 1px solid; border-collapse: collapse">74100</td>
              <td style="border: 1px solid; border-collapse: collapse">0.84</td>
              <td style="border: 1px solid; border-collapse: collapse">43</td>
            </tr>
            <tr style="border: 1px solid; border-collapse: collapse">
              <td style="border: 1px solid; border-collapse: collapse">Gasoline/Petrol</td>
              <td style="border: 1px solid; border-collapse: collapse">3</td>
              <td style="border: 1px solid; border-collapse: collapse">0.6</td>
              <td style="border: 1px solid; border-collapse: collapse">69300</td>
              <td style="border: 1px solid; border-collapse: collapse">0.74</td>
              <td style="border: 1px solid; border-collapse: collapse">44.3</td>
            </tr>
            <tr style="border: 1px solid; border-collapse: collapse">
              <td style="border: 1px solid; border-collapse: collapse">Natural gas</td>
              <td style="border: 1px solid; border-collapse: collapse">10</td>
              <td style="border: 1px solid; border-collapse: collapse">0.1</td>
              <td style="border: 1px solid; border-collapse: collapse">56100</td>
              <td style="border: 1px solid; border-collapse: collapse">0.75</td>
              <td style="border: 1px solid; border-collapse: collapse">48</td>
            </tr>
          </table>
          <br>
          <b>Reference:</b> <a href="docs/V2_2_Ch2_Stationary_Combustion.pdf#page=16" target="_blank">IPCC 2006, Volume 2, Chapter 2: Stationary Combustion, Table 2.2</a>

        </div>

      </v-dialog>
      <v-dialog
          v-model="info_discharge"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3>Emissions from discharged water </h3>
          <br>
          <div v-katex:display="'CH_4 = \\sum_{i \\in DP} COD_{effl_i} \\cdot EF_{CH_4} \\cdot EQ_{CH_4}'"></div>
          <div v-katex:display="'N_2O = \\sum_{i \\in DP} TN_{effl_i} \\cdot EF_{N_2O} \\cdot NtoN_2O \\cdot EQ_{N_20}'"></div>
          <div v-katex:display="'Total = N_2O + CH_4'"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and offsite WWTP and directly discharged water</li>
            <li><span v-katex="'COD_{effl}'"></span>: load of COD in the effluent</li>
            <li><span v-katex="'EF_{CH_4}'"></span>: CH4 emission factor</li>
            <li><span v-katex="'EQ_{CH_4}'"></span>: conversion of CH4 emissions to CO2 equivalent emissions (<b>34 kgCO2eq/kgCH4</b>)</li>
            <li><span v-katex="'TN_{effl}'"></span>: load of TN in the effluent </li>
            <li><span v-katex="'EF{N_2O}'"></span>: N2O emission factor</li>
            <li><span v-katex="'NtoN_2O'"></span>: N2O-N to N20 conversion factor (<b>1.57 gN2O/gN2O-N</b>) </li>
            <li><span v-katex="'EQ_{N_2O}'"></span>: conversion of N2O to CO2 equivalent emissions (<b>298 kgCO2eq/kgN2O</b>)</li>
          </ul>

          <b>Reference:</b> <a href="docs/19R_V5_6_Ch06_Wastewater.pdf#page=17" target="_blank">IPCC 2019 revision, Volume 5, Chapter 6 Wastewater: equation 6.1</a>, <a href="docs/19R_V5_6_Ch06_Wastewater.pdf#page=37" target="_blank">IPCC 2019 revision, Volume 5, Chapter 6 Wastewater: equation 6.9</a>

          <br>
        </div>

      </v-dialog>
      <v-dialog
          v-model="info_reuse"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3>Water reuse transport </h3>
          <br>
          GHG emissions from truck transport of reused water
          <br>
          <div v-katex:display="'CO_2 = \\sum_{i \\in WWTPS}\\frac{V_i \\cdot FD \\cdot NCV \\cdot EF_{CO_2}}{1000}'"></div>
          <div v-katex:display="'N_2O = \\sum_{i \\in WWTPS}\\frac{V_i \\cdot FD \\cdot NCV \\cdot EF_{N_2O} \\cdot EQ_{N_2O}}{1000}'"></div>
          <div v-katex:display="'CH_4 = \\sum_{i \\in WWTPS}\\frac{V_i \\cdot FD \\cdot NCV \\cdot EF_{CH_4} \\cdot EQ_{CH_4}}{1000}'"></div>
          <div v-katex:display="'Total = CO_2 + N_2O + CH_4'"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'WWTPS'"></span>: onsite and external WWTP's where industry treats water</li>

            <li><span v-katex="'V'"></span>: volume of fuel consumed</li>

            <li><span v-katex="'EQ_{N_2O}'"></span>:  conversion of N2O emissions to CO2 equivalent emissions (<b>298 kgCO2eq/kgN2O</b>) </li>
            <li><span v-katex="'EQ_{CH_4}'"></span>:  Conversion of CH4 emissions to CO2 equivalent emissions (<b>34 kgCO2eq/kgCH4</b>) </li>
          </ul>
          <br>
          <table style="width: 90%; border: 1px solid; border-collapse: collapse">
            <tr style="border: 1px solid; border-collapse: collapse">
              <td style="border: 1px solid; border-collapse: collapse"><b>Fuel type</b></td>
              <td style="border: 1px solid; border-collapse: collapse"><b>EFCH4 <br> (kg/TJ) </b></td>
              <td style="border: 1px solid; border-collapse: collapse"><b>EFN2O  <br> (kg/TJ) </b></td>
              <td style="border: 1px solid; border-collapse: collapse"><b>EFCO2  <br> (kg/TJ) </b></td>
              <td style="border: 1px solid; border-collapse: collapse"><b>FD  <br> (kg/L)  </b></td>
              <td style="border: 1px solid; border-collapse: collapse"><b>NCV  <br> (TJ/Gg)  </b></td>
            </tr>
            <tr style="border: 1px solid; border-collapse: collapse">
              <td style="border: 1px solid; border-collapse: collapse">Diesel</td>
              <td style="border: 1px solid; border-collapse: collapse">3.9</td>
              <td style="border: 1px solid; border-collapse: collapse">3.0</td>
              <td style="border: 1px solid; border-collapse: collapse">74100</td>
              <td style="border: 1px solid; border-collapse: collapse">0.84</td>
              <td style="border: 1px solid; border-collapse: collapse">43</td>
            </tr>
            <tr style="border: 1px solid; border-collapse: collapse">
              <td style="border: 1px solid; border-collapse: collapse">Gasoline/Petrol</td>
              <td style="border: 1px solid; border-collapse: collapse">3.8</td>
              <td style="border: 1px solid; border-collapse: collapse">1.9</td>
              <td style="border: 1px solid; border-collapse: collapse">69300</td>
              <td style="border: 1px solid; border-collapse: collapse">0.74</td>
              <td style="border: 1px solid; border-collapse: collapse">44.3</td>
            </tr>
            <tr style="border: 1px solid; border-collapse: collapse">
              <td style="border: 1px solid; border-collapse: collapse">Natural gas</td>
              <td style="border: 1px solid; border-collapse: collapse">92</td>
              <td style="border: 1px solid; border-collapse: collapse">0.2</td>
              <td style="border: 1px solid; border-collapse: collapse">56100</td>
              <td style="border: 1px solid; border-collapse: collapse">0.75</td>
              <td style="border: 1px solid; border-collapse: collapse">48</td>
            </tr>
          </table>
          <br>
          <br>
          <b>Reference:</b> <a href="docs/V2_3_Ch3_Mobile_Combustion.pdf#page=21" target="_blank">IPCC 2006, Volume 2, Chapter 3: Mobile Combustion, Table 3.2.2 </a>

        </div>

      </v-dialog>
      <v-dialog
          v-model="info_treatment"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3>Emissions from water treatment </h3>
          <br>
          <div v-katex:display="'CH_4 = \\sum_{i \\in WWTPS} (COD_{infl_i} - COD_{slu_i}) \\cdot EF_{CH4_i} \\cdot EQ_{CH_4}'"></div>
          <div v-katex:display="'N_2O = \\sum_{i \\in WWTPS}TN_{infl_i} \\cdot EF_{N_2O_i} \\cdot NtoN_2O \\cdot EQ_{N_20}'"></div>
          <div v-katex:display="'Total = N_2O + CH_4'"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'WWTPS'"></span>: onsite and external wastewater treatment plants</li>
            <li><span v-katex="'COD_{infl}'"></span>: COD load in WWTP influent</li>
            <li><span v-katex="'COD_{slu}'"></span>: COD removed as sludge</li>
            <li><span v-katex="'EF_{CH_4}'"></span>: CH4 emission factor</li>
            <li><span v-katex="'EQ_{CH_4}'"></span>: conversion of CH4 emissions to CO2 equivalent emissions (<b>34 kgCO2eq/kgCH4</b>)</li>
            <li><span v-katex="'TN_{infl}'"></span>: Total Nitrogen load in the WWTP influent </li>
            <li><span v-katex="'EF{N_2O}'"></span>: N2O emission factor</li>
            <li><span v-katex="'NtoN_2O'"></span>: N2O-N to N20 conversion factor (<b>1.57 gN2O/gN2O-N</b>) </li>
            <li><span v-katex="'EQ_{N_2O}'"></span>: conversion of N2O to CO2 equivalent emissions (<b>298 kgCO2eq/kgN2O</b>)</li>


          </ul>
          <br>
        </div>

      </v-dialog>
      <v-dialog
          v-model="info_sludge_management"
          width="85%"
      >
        <div class="dialog_detail" style="background-color: white">
          <div v-if="dialog_biogas_stage == 0">
            <h3>Emissions from sludge management </h3>
            <br>
            GHG emissions from sludge management operations (storing, composting, incineration, land application, landfilling, stockpiling and truck transport).
            <br>
            <br>


            <div v-katex:display="'Total = \\sum_{i \\in WWTPS} storage_i + composting_i +incineration_i+ land\\_ application_i+landfilling_i+stockpiling_i + \\newline + storage_i+transport_i'"></div>
            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'WWTPS'"></span>: onsite and external WWTP's where industry treats water</li>
              <li><span class="hover" @click="dialog_biogas_stage = 1">storage</span>: Amount of CO2eq emissions related to sludge storage</li>
              <li><span class="hover" @click="dialog_biogas_stage = 2">composting</span>: Amount of CO2eq emissions due to sludge composted</li>
              <li><span class="hover" @click="dialog_biogas_stage = 3">incineration</span>: Amount of CO2eq emissions due to sludge incineration</li>
              <li><span class="hover" @click="dialog_biogas_stage = 4">land application</span>: Amount of CO2eq emissions due to land application of sludge</li>
              <li><span class="hover" @click="dialog_biogas_stage = 5">landfilling</span>: Fugitive methane emissions from biosolids decomposition in the landfill during the first 3 years after placement, and N2O emissions from landfilled biosolids</li>
              <li><span class="hover" @click="dialog_biogas_stage = 6">stockpiling</span>: Amount of CO2eq emissions due to sludge stockpiling</li>
              <li><span class="hover" @click="dialog_biogas_stage = 7">transport</span>: Indirect CO2 emitted from sludge transport off-site</li>


            </ul>

            <br>
            <b>Reference:</b> <a href="docs/beam_final_report_1432.pdf#page=169" target="_blank">Section 12.8 "Composting", Beam page 147</a>, <a href="docs/beam_final_report_1432.pdf#page=183" target="_blank">Section 12.10 "Combustion (Incineration)", Beam, page 161 </a>, <a href="docs/beam_final_report_1432.pdf#page=188" target="_blank">Section 12.11 "Land application", Beam page 166 </a>, <a href="docs/beam_final_report_1432.pdf#page=175" target="_blank">Section 12.9 "Landfill disposal", page 153 </a>, <a href="https://doi.org/10.1016/j.jenvman.2014.04.016 " target="_blank">Majumder, R., Livesley, S., Gregory, D., & Arndt, S. (2014, 05 15). Biosolids stockpiles are a significant point source for greenhouse gas emissions. Journal of Environmental Management, 143, pp. 34-43</a>, <a href="docs/V2_3_Ch3_Mobile_Combustion.pdf#page=21" target="_blank">IPCC 2006, Volume 2, Chapter 3: Mobile Combustion, Table 3.2.2 </a>

          </div>
          <div v-else>
            <div>
              <div
                  style="margin: -20px !important; padding-bottom: 60px"
              >
                <v-icon @click="dialog_biogas_stage = 0" class="hover">
                  mdi-undo
                </v-icon>
              </div>
            </div>
            <div v-if="dialog_biogas_stage == 1">
              <h3>Sludge storage</h3>
              <br>
              Amount of CO2eq emissions due to sludge storage
              <br>
              <br>
              <span v-katex:display="'TVS = \\frac{slustoTVS}{100}'"></span>
              <span v-katex:display="'FCH_4 = \\frac{slustoFCH_4}{100}'"></span>
              <span v-katex:display="'CH_4EF = \\frac{slustoEF}{100}'"></span>
              <span v-katex:display="'CH_4potential = sludgemass \\cdot TVStoOC \\cdot OCtoCH_4 \\cdot FCH_4'"></span>
              <span v-katex:display="'CH_4 = CH_4potential \\cdot CH_4EF \\cdot ctCH_4eq'"></span>
              <span v-katex:display="'CO_2SS = CH_4 '"></span>

              <br>
              <b>Where:</b>
              <br>
              <ul>
                <li><span v-katex="'sludgemass'"></span>: Amount of sludge that is sent to stored prior to disposal (dry weight)</li>
                <li><span v-katex="'slustoEF'"></span>: Emission factor due to storage</li>
                <li><span v-katex="'slustoTVS'"></span>: Total Volatile Solids (TVS) content of sludge stored (% of dry weight)</li>
                <li><span v-katex="'slustoFCH_4'"></span>: CH_4 potential factor</li>
                <li><span v-katex="'TVStoOC'"></span>: Organic Carbon content in Volatile Solids (0.56gOC/gVS)</li>
                <li><span v-katex="'OCtoCH_4'"></span>: Organic C to CH4 conversion factor (=16/12 gCH4/gOC)</li>
                <li><span v-katex="'ctCH_4eq'"></span>: Conversion of CH4 emissions to CO2 equivalent emissions (34 kgCO2eq/kgCH4)</li>
                <li><span v-katex="'CO_2SS'"></span>: Amount of CO_2eq due to sludge storage</li>
              </ul>
              <br>

            </div>
            <div v-else-if="dialog_biogas_stage == 2">
              <h3>Sludge composted</h3>
              <br>
              Amount of CO2eq emissions due to sludge composted
              <br>
              <br>
              <span v-katex:display="'TVS = \\frac{slucompTVS}{100}'"></span>
              <span v-katex:display="'Ncont = \\frac{slucompNcont}{100}'"></span>
              <span v-katex:display="'\\begin{cases}\n'+
                'CH_4=0 &\\text{if emissions are treated or covered}\\\\\n'+
                'CH_4= sludgemass \\cdot TVS \\cdot TVStoOC \\cdot upEf \\cdot OCtoCH_4 \\cdot ctCH_4eq &\\text{otherwise}\\\\\n'+
                '\\end{cases}'">
              </span>
              <span v-katex:display="'\\begin{cases}\n'+
                'N_2O=0 &\\text{if } ratioCN>30\\\\\n'+
                'N_2O=0 &\\text{if solid content of compost}>50 \\\\\n'+
                'N_2O= sludgemass \\cdot Ncont \\cdot lowCNEF \\cdot ctNtoN_2O4428 \\cdot ctN_2Oeq &\\text{otherwise}\\\\\n'+
                '\\end{cases}'">
              </span>
              <span v-katex:display="'CO_2SC = CH_4 + N_2O'"></span>


              <b>Where:</b>
              <br>
              <ul>
                <li><span v-katex="'sludgemass'"></span>: Amount of sludge that is sent to composting (dry weight)</li>
                <li><span v-katex="'slucompTVS'"></span>: Total Volatile Solids (TVS) content of sludge composted (% of dry weight).</li>
                <li><span v-katex="'TVStoOC'"></span>: Organic Carbon content in Volatile Solids (0.56 gOC/gVS)</li>
                <li><span v-katex="'upEF'"></span>: CH4 emission factor for uncovered pile (fraction of initial C in solids)</li>
                <li><span v-katex="'OCtoCH_4'"></span>: Organic C to CH4 conversion factor (16/12gCH4/gOC)</li>
                <li><span v-katex="'ctCH_4eq'"></span>: Conversion of CH4 emissions to CO2 equivalent emissions (34 kgCO2eq/kgCH4)</li>
                <li><span v-katex="'slucompNcont'"></span>: N content of sludge stored (% of dry weight)</li>
                <li><span v-katex="'lowCNEF'"></span>: N2O emission factor for low C:N ratio</li>
                <li><span v-katex="'ctNtoN_2O4428'"></span>: N2O-N to N2O conversion factor (44/28 gN2O/gN2O-N)</li>
                <li><span v-katex="'ctN_2Oeq'"></span>: Conversion of N2O emissions to CO2 equivalent emissions(=298 kgCO2eq/kgN2O)</li>
                <li><span v-katex="'CO_2SC'"></span>: Amount of CO2eq emissions due to sludge composted</li>
              </ul>
              <br>
              <b>Reference:</b> <a href="docs/beam_final_report_1432.pdf#page=169" target="_blank">Section 12.8 "Composting", Beam page 147</a>


            </div>
            <div v-else-if="dialog_biogas_stage == 3">
              <h3>Sludge incinerated</h3>
              <br>
              Amount of CO2eq emissions due to sludge incineration
              <br>
              <br>
              <span v-katex:display="'CH_4 = 4.85\\cdot 10^{-5} \\cdot sludgemass \\cdot ctCH4_{eq}'"></span>
              <span v-katex:display="'n = \\frac{161.3 - 0.14 \\cdot Tf}{100}'"></span>
              <span v-katex:display="'\\begin{cases}\n'+
                'Tf=1023 &\\text{if }Tf<1023\\\\\n'+
                '\\end{cases}'">
              </span>
              <span v-katex:display="'\\begin{cases}\n'+
                'n=0 &\\text{if }n<0\\\\\n'+
                '\\end{cases}'">
              </span>
              <span v-katex:display="'N_2O = 1.2 \\cdot sludgemass \\cdot Ncont \\cdot n \\cdot ctN_2Oeq'"></span>
              <span v-katex:display="'CO_2SI = CH_4 + N_2O'"></span>

              <b>Where:</b>
              <br>
              <ul>
                <li><span v-katex="'sludgemass'"></span>: Amount of sludge that is sent to incineration  (dry weight)</li>
                <li><span v-katex="'ctCH4'"></span>: Conversion of CH4 emissions to CO2 equivalent emissions (34 kgCO2eq/kgCH4)</li>
                <li><span v-katex="'Ncont'"></span>: N content of sludge incinerated (% of dry weight)</li>
                <li><span v-katex="'Tf'"></span>: Average highest temperature of combustion achieved in a Fluidized Bed incinerator</li>
                <li><span v-katex="'ctN_2Oeq'"></span>: Conversion of N2O emissions to CO2 equivalent emissions (298 kgCO2eq/kgN2O)</li>
                <li><span v-katex="'CO_2SI'"></span>: Amount of CO2eq emissions due to sludge incineration</li>
              </ul>
              <br>
              <b>Reference:</b> <a href="docs/beam_final_report_1432.pdf#page=183" target="_blank">Section 12.10 "Combustion (Incineration)", Beam, page 161 </a>


            </div>
            <div v-else-if="dialog_biogas_stage == 4">
              <h3>Land application of sludge</h3>
              <br>
              Amount of CO2eq emissions due to land application of sludge
              <br>
              <br>
              <span v-katex:display="'TVS = \\frac{slucompTVS}{100}'"></span>
              <span v-katex:display="'Ncont = \\frac{slulaNcont}{100}'"></span>

              <span v-katex:display="'Ccontent = sludgemass \\cdot TVS \\cdot TVStoOC'"></span>
              <span v-katex:display="'Ncontent = sludgemass \\cdot Ncont'"></span>
              <span v-katex:display="'racioCN = \\frac{Ccontent}{Ncontent}'"></span>

              <span v-katex:display="'\\begin{cases}\n'+
                'N_2O=0 &\\text{if }ratioCN>30\\\\\n'+
                'N_2O=0.5 \\cdot sludgemass \\cdot Ncont \\cdot EF \\cdot ctNtoN_2O4428 \\cdot ctN_2Oeq &\\text{if biosolids }>80\\%\\\\\n'+
                'N_2O=sludgemass \\cdot Ncont \\cdot EF \\cdot ctNtoN_2O4428 \\cdot ctN_2Oeq &\\text{otherwise }\\\\\n'+

                '\\end{cases}'">
              </span>
              <span v-katex:display="'CO_2LA = N_2O'"></span>

              <b>Where:</b>
              <br>
              <ul>
                <li><span v-katex="'sludgemass'"></span>: Amount of sludge that is sent to land application (dry weight)</li>
                <li><span v-katex="'TVStoOC'"></span>: Organic Carbon content in Volatile Solids (0.56 gOC/gVS)</li>
                <li><span v-katex="'slulaNcont'"></span>: N content of sludge sent to land application (% of dry weight)</li>
                <li><span v-katex="'SlucompTVS'"></span>: Total Volatile Solids (TVS) content of sludge composted (% of dry weight)</li>
                <li><span v-katex="'EF'"></span>: Amount of Nitrogen converted to N2O</li>
                <li><span v-katex="'ctNtoN_2O4428'"></span>: N2O-N to N2O conversion factor (=44/28 gN2O/gN2O-N)</li>
                <li><span v-katex="'ctN2Oeq'"></span>: Conversion of N2O emissions to CO2 equivalent emissions (298 kgCO2eq/kgN2O</li>
                <li><span v-katex="'CO_2LA'"></span>: Amount of CO2eq emissions due to land application of sludge</li>
              </ul>
              <br>
              <b>Reference:</b> <a href="docs/beam_final_report_1432.pdf#page=188" target="_blank">Section 12.11 "Land application", Beam page 166 </a>


            </div>
            <div v-else-if="dialog_biogas_stage == 5">
              <h3>Landfilling of sludge</h3>
              <br>
              Fugitive methane emissions from biosolids decomposition in the landfill during the first 3 years after placement, and N2O emissions from landfilled biosolids
              <br>
              <br>
              <span v-katex:display="'TVS = \\frac{slucompTVS}{100}'"></span>
              <span v-katex:display="'CH_4gas = \\frac{slulfCH_4ingas}{100}'"></span>
              <span v-katex:display="'DOCf = \\frac{slulfDOCf}{100}'"></span>
              <span v-katex:display="'dc3yrs = \\frac{slulfdecomp3yr}{100}'"></span>
              <span v-katex:display="'Ncont = \\frac{slulfcont}{100}'"></span>

              <span v-katex:display="'Ccontent = sludgemass \\cdot TVS \\cdot TVStoOC'"></span>
              <span v-katex:display="'Ncontent = sludgemass \\cdot Ncont'"></span>
              <span v-katex:display="'racioCN = \\frac{Ccontent}{Ncontent}'"></span>

              <span v-katex:display="'CH_4 = sludgemass \\cdot TVS \\cdot TVStoOC \\cdot un \\cdot OCtoCH_4 \\cdot CH_4gas \\cdot DOCF \\cdot dc3yrs \\cdot MCF \\cdot ctCH_4eq'"></span>
              <span v-katex:display="'N_2O = sludgemass \\cdot Ncont \\cdot lowCNEF \\cdot NtoN_2O \\cdot ctN_2Oeq'"></span>
              <span v-katex:display="'CO_2LFS = N_2O + CH_4'"></span>


              <b>Where:</b>
              <br>
              <ul>
                <li><span v-katex="'sludgemass'"></span>: Amount of sludge that is sent to landfilling  (dry weight)</li>
                <li><span v-katex="'slucompTVS'"></span>: Total Volatile Solids (TVS) content of sludge composted (% of dry weight)</li>
                <li><span v-katex="'TVStoOC'"></span>: Organic Carbon content in Volatile Solids (0.56gOC/gVS)</li>
                <li><span v-katex="'un'"></span>: Model uncertainty factor</li>
                <li><span v-katex="'OCtoCH_4'"></span>: Organic C to CH4 conversion factor (=16/12 gCH4/gOC)</li>
                <li><span v-katex="'slulfCH_4ingas'"></span>: CH4 in landfill gas</li>
                <li><span v-katex="'slulfDOC_f'"></span>: Decomposable organic fraction of raw wastewater solids</li>
                <li><span v-katex="'slulfdecomp3yr'"></span>: Percentage decomposed in first 3 years of the decomposable organic fraction of raw wastewater solids</li>
                <li><span v-katex="'MCF'"></span>: Methane correction for anaerobic managed landfills</li>
                <li><span v-katex="'ctCH_4eq'"></span>: Conversion of CH4 emissions to CO2 equivalent emissions (34 kgCO2eq/kgCH4)</li>
                <li><span v-katex="'slulfNcont'"></span>: N content of sludge sent to landfilling (% of dry weight)</li>
                <li><span v-katex="'lowCNEF'"></span>: N2O emission factor for low C:N ratio</li>
                <li><span v-katex="'NtoN_2O'"></span>: N2O-N to N2O conversion factor (=44/28 gN2O/gN2O-N)</li>
                <li><span v-katex="'ctN_2Oeq'"></span>: Conversion of N2O emissions to CO2 equivalent emissions (298 kgCO2eq/kgN2O)</li>
                <li><span v-katex="'CO_2LFS'"></span>: Landfilling of sludge CO2 equivalent</li>
              </ul>
              <br>
              <b>Reference:</b>  <a href="docs/beam_final_report_1432.pdf#page=175" target="_blank">Section 12.9 "Landfill disposal", page 153 </a>


            </div>
            <div v-else-if="dialog_biogas_stage == 6">
              <h3>Sludge stockpiling</h3>
              <br>
              Amount of CO2eq emissions due to sludge stockpiling
              <br>
              <br>
              <span v-katex:display="'lifespan\\_ int = \\lfloor lifespan \\rfloor'"></span>
              <span v-katex:display="'lifespan\\_ dec = lifespan - lifespan\\_ dec'"></span>
              <span v-katex:display="'rate_{CH4}(i) = \\begin{cases}\n'+
                'sludgemass \\cdot 0.2 \\cdot 10^{-3} &\\text{if }i<1\\\\\n'+
                'sludgemass \\cdot 2 \\cdot 10^{-3} &\\text{if }1<=i<3\\\\\n'+
                'sludgemass \\cdot 9.8 \\cdot 10^{-3} &\\text{if }3<=i<20\\\\\n'+
                '0 &\\text{if }i>=20\\\\\n'+
                '\\end{cases}'">
              </span>
              <span v-katex:display="'rate_{N2O}(i) = \\begin{cases}\n'+
                'sludgemass \\cdot 60 \\cdot 10^{-3} &\\text{if }i<1\\\\\n'+
                'sludgemass \\cdot 26.8 \\cdot 10^{-3} &\\text{if }1<=i<3\\\\\n'+
                'sludgemass \\cdot 17.4 \\cdot 10^{-3} &\\text{if }3<=i<20\\\\\n'+
                '0 &\\text{if }i>=20\\\\\n'+
                '\\end{cases}'">
              </span>
              <span v-katex:display="'rate_{CO2}(i) = \\begin{cases}\n'+
                'sludgemass \\cdot 30.1 \\cdot 10^{-3} &\\text{if }i<1\\\\\n'+
                'sludgemass \\cdot 30.5 \\cdot 10^{-3} &\\text{if }1<=i<3\\\\\n'+
                'sludgemass \\cdot 10.1 \\cdot 10^{-3} &\\text{if }3<=i<20\\\\\n'+
                '0 &\\text{if }i>=20\\\\\n'+
                '\\end{cases}'">
              </span>
              <span v-katex:display="'CH_4 = lifespan\\_ dec \\cdot rate_{CH4}(lifespan\\_ int) + \\sum _{i=0} ^{lifespan\\_ int -1} rate_{CH4}(i)'"></span>
              <span v-katex:display="'N_2O = lifespan\\_ dec \\cdot rate_{N2O}(lifespan\\_ int) + \\sum _{i=0} ^{lifespan\\_ int -1} rate_{N2O}(i)'"></span>
              <span v-katex:display="'CO_2 = lifespan\\_ dec \\cdot rate_{CO2}(lifespan\\_ int) + \\sum _{i=0} ^{lifespan\\_ int -1} rate_{CO2}(i)'"></span>

              <span v-katex:display="'CO_2SP = CH_4 + N_2O + CO_2'"></span>


              <b>Where:</b>
              <br>
              <ul>
                <li><span v-katex="'sludgemass'"></span>: Amount of sludge that is stockpiled (dry weight)</li>
                <li><span v-katex="'lifespan'"></span>: Expected timespan that the biosolid stockpile (BSP) will be emitting GHGs</li>
                <li><span v-katex="'CO_2SP'"></span>: Amount of CO2eq emissions due to sludge composted</li>
              </ul>
              <br>
              <b>Reference:</b> <a href="https://doi.org/10.1016/j.jenvman.2014.04.016 " target="_blank">Majumder, R., Livesley, S., Gregory, D., & Arndt, S. (2014, 05 15). Biosolids stockpiles are a significant point source for greenhouse gas emissions. Journal of Environmental Management, 143, pp. 34-43</a>


            </div>
            <div v-else-if="dialog_biogas_stage == 7">
              <h3>Water reuse transport </h3>
              <br>
              Indirect CO2 emitted from sludge transport off-site
              <br>
              <br>
              <span v-katex:display="'ECO_2 = \\frac{V \\cdot FD_{CO2} \\cdot NCV_{CO2} \\cdot EF_{CO2}}{1000}'"></span>
              <span v-katex:display="'ECH_4 = \\frac{V \\cdot FD_{CH4} \\cdot NCV_{CH4} \\cdot EF_{CH4} \\cdot EQ_{CH4}}{1000}'"></span>
              <span v-katex:display="'EN_2O = \\frac{V \\cdot FD_{N2O} \\cdot NCV_{N2O} \\cdot EF_{N2O} \\cdot EQ_{N2O}}{1000}'"></span>
              <span v-katex:display="'E_{total} = ECO_2 + N_2O + CH_4'"></span>


              <b>Where:</b>
              <br>
              <ul>
                <li><span v-katex="'V'"></span>: Volume of fuel consumed</li>
                <li><span v-katex="'EQ_{N2O}'"></span>: Conversion of N2O emissions to CO2 equivalent emissions </li>
                <li><span v-katex="'EQ_{CH_4}'"></span>: Conversion of CH4 emissions to CO2 equivalent emissions</li>
                <li><span v-katex="'EQ_{CH_4}'"></span>: Conversion of CH4 emissions to CO2 equivalent emissions</li>
                <li><span v-katex="'CO_2LFS'"></span>: Landfilling of sludge CO2 equivalent</li>
              </ul>
              <br>
              <table style="width: 90%; border: 1px solid; border-collapse: collapse">
                <tr style="border: 1px solid; border-collapse: collapse">
                  <td style="border: 1px solid; border-collapse: collapse"><b>Fuel type</b></td>
                  <td style="border: 1px solid; border-collapse: collapse"><b>EFCH4 <br> (kg/TJ) </b></td>
                  <td style="border: 1px solid; border-collapse: collapse"><b>EFN2O  <br> (kg/TJ) </b></td>
                  <td style="border: 1px solid; border-collapse: collapse"><b>EFCO2  <br> (kg/TJ) </b></td>
                  <td style="border: 1px solid; border-collapse: collapse"><b>FD  <br> (kg/L)  </b></td>
                  <td style="border: 1px solid; border-collapse: collapse"><b>NCV  <br> (TJ/Gg)  </b></td>
                </tr>
                <tr style="border: 1px solid; border-collapse: collapse">
                  <td style="border: 1px solid; border-collapse: collapse">Diesel</td>
                  <td style="border: 1px solid; border-collapse: collapse">3.9</td>
                  <td style="border: 1px solid; border-collapse: collapse">3.9</td>
                  <td style="border: 1px solid; border-collapse: collapse">74100</td>
                  <td style="border: 1px solid; border-collapse: collapse">0.84</td>
                  <td style="border: 1px solid; border-collapse: collapse">43</td>
                </tr>
                <tr style="border: 1px solid; border-collapse: collapse">
                  <td style="border: 1px solid; border-collapse: collapse">Gasoline/Petrol</td>
                  <td style="border: 1px solid; border-collapse: collapse">3.8</td>
                  <td style="border: 1px solid; border-collapse: collapse">1.9</td>
                  <td style="border: 1px solid; border-collapse: collapse">69300</td>
                  <td style="border: 1px solid; border-collapse: collapse">0.74</td>
                  <td style="border: 1px solid; border-collapse: collapse">44.3</td>
                </tr>
                <tr style="border: 1px solid; border-collapse: collapse">
                  <td style="border: 1px solid; border-collapse: collapse">Natural gas</td>
                  <td style="border: 1px solid; border-collapse: collapse">92</td>
                  <td style="border: 1px solid; border-collapse: collapse">0.2</td>
                  <td style="border: 1px solid; border-collapse: collapse">56100</td>
                  <td style="border: 1px solid; border-collapse: collapse">0.75</td>
                  <td style="border: 1px solid; border-collapse: collapse">48</td>
                </tr>
              </table>
              <br>
              <b>Reference:</b> <a href="docs/V2_3_Ch3_Mobile_Combustion.pdf#page=21" target="_blank">IPCC 2006, Volume 2, Chapter 3: Mobile Combustion, Table 3.2.2 </a>



            </div>

          </div>


        </div>

      </v-dialog>
      <v-dialog
          v-model="info_biogas"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3>Biogas (anaerobic digestion of sludge) </h3>
          <br>
          Sum of emissions from biogas production (biogas flared, valorized and leaked)
          <div v-katex:display="'biogas_{flared} = \\sum_{i \\in WWTPS} \\frac{P \\cdot V_i}{R \\cdot T} \\cdot \\frac{biog_{flared_i}}{100} \\cdot \\frac{biog_{CH4_i}}{100} \\cdot \\frac{44}{1000}'"></div>
          <div v-katex:display="'biogas_{valorised} = \\sum_{i \\in WWTPS} \\frac{P \\cdot V_i}{R \\cdot T} \\cdot \\frac{biog_{val_i}}{100} \\cdot \\frac{biog_{CH4_i}}{100} \\cdot \\frac{44}{1000}'"></div>
          <div v-katex:display="'biogas_{leaked} = \\sum_{i \\in WWTPS} \\frac{P \\cdot V_i}{R \\cdot T} \\cdot \\frac{biog_{leaked_i}}{100} \\cdot \\frac{biog_{CH4_i}}{100} \\cdot \\frac{16}{1000}'"></div>
          <div v-katex:display="'Total = biogas_{flared} + biogas_{valorised} + biogas_{leaked}'"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'WWTPS'"></span>: onsite and external WWTP's where industry treats water</li>
            <li><span v-katex="'P : 1.013 \\cdot 10^{5}'"></span> Pa </li>
            <li><span v-katex="'V'"></span>: Volume of biogas produced in the WWTP</li>
            <li><span v-katex="'R'"></span>: 8.31446261815324 J/K·mol </li>
            <li><span v-katex="'T'"></span>: 273.15K</li>
            <li><span v-katex="'biog_{flared}'"></span>: Biogas flared (% volume)</li>
            <li><span v-katex="'biog_{CH4}'"></span>: Percent of the methane content in the produced biogas</li>
            <li><span v-katex="'biog_{val}'"></span>: Biogas valorized in the treatment plant to heat the digesters or the building and/or to run a Co-generator to generate heat and electricity</li>
            <li><span v-katex="'biog_{leaked}'"></span>: Biogas leaked to the atmosphere (% volume)</li>


          </ul>


        </div>

      </v-dialog>

      <!-- Eutrophication -->
      <v-dialog
          v-model="info_tn_eutrophication"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3>Eutrophication potential (Total Nitrogen) </h3>
          <br>
          <div v-katex:display="'\\frac{\\sum_{i \\in DP} TN_{effl_i}}{\\sum_{i \\in DP} W_{effl_i}} \\cdot EQ_{TN} '"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'TN_{effl}'"></span>: load of TN in the effluent </li>
            <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body </li>
            <li><span v-katex="'EQ_{TN}'"></span>: conversion of TN to PO4 equivalent (<b>0.42 gPO4eq/gTN </b>) </li>
          </ul>
          <br>
          <b>Reference:</b> <a href="https://www.universiteitleiden.nl/en/research/research-output/science/cml-ia-characterisation-factors" target="_blank">CML-IA Characterisation Factors - Leiden University</a>


        </div>

      </v-dialog>
      <v-dialog
          v-model="info_cod_eutrophication"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3>Eutrophication potential (Chemical Oxygen Demand) </h3>
          <br>
          <div v-katex:display="'\\frac{\\sum_{i \\in DP} COD_{effl_i}}{\\sum_{i \\in DP} W_{effl_i}} \\cdot EQ_{COD} '"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'COD_{effl}'"></span>: load of COD in the effluent </li>
            <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body </li>
            <li><span v-katex="'EQ_{COD}'"></span>: conversion of COD to PO4 equivalent (<b>0.022 gPO4eq/gCOD </b>) </li>
          </ul>
          <br>
          <b>Reference:</b> <a href="https://www.universiteitleiden.nl/en/research/research-output/science/cml-ia-characterisation-factors" target="_blank">CML-IA Characterisation Factors - Leiden University</a>


        </div>

      </v-dialog>
      <v-dialog
          v-model="info_tp_eutrophication"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3>Eutrophication potential (Total Phosphorus) </h3>
          <br>
          <div v-katex:display="'\\frac{\\sum_{i \\in DP} TP_{effl_i}}{\\sum_{i \\in DP} W_{effl_i}} \\cdot EQ_{TP} '"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'TP_{effl}'"></span>: load of TP in the effluent </li>
            <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body </li>
            <li><span v-katex="'EQ_{TP}'"></span>: Conversion of TP to PO4 equivalent (<b>3.06 gPO4eq/gTP </b>) </li>
          </ul>
          <br>
          <b>Reference:</b> <a href="https://www.universiteitleiden.nl/en/research/research-output/science/cml-ia-characterisation-factors" target="_blank">CML-IA Characterisation Factors - Leiden University</a>


        </div>

      </v-dialog>

      <!-- TU -->
      <v-dialog
          v-model="info_tu_diclo"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Ecotoxicity profile for 1,2-Dichloroethane  </h3>
          <br>
          <div v-katex:display="'\\frac{\\sum_{i \\in DP} 1,2-Dichloroethane_{effl_i}}{\\sum_{i \\in DP} W_{effl_i}} \\cdot \\frac{1}{EC50_{1,2-Dichloroethane} \\cdot 10^{-3}}'"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'1,2-Dichloroethane_{effl}'"></span>: load of 1,2-Dichloroethane in the effluent </li>
            <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body </li>
            <li><span v-katex="'EC50_{1,2-Dichloroethane}: 150000 \\mu g/L'"></span></li>
          </ul>
          <br>


        </div>

      </v-dialog>
      <v-dialog
          v-model="info_tu_cadmium"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Ecotoxicity profile for cadmium  </h3>
          <br>
          <div v-katex:display="'\\frac{\\sum_{i \\in DP} cadmium_{effl_i}}{\\sum_{i \\in DP} W_{effl_i}} \\cdot \\frac{1}{EC50_{cadmium}\\cdot 10^{-6}}'"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'cadmium_{effl}'"></span>: load of cadmium in the effluent </li>
            <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body </li>
            <li><span v-katex="'EC50_{cadmium}: 9.5 \\mu g/L'"></span></li>
          </ul>
          <br>


        </div>

      </v-dialog>
      <v-dialog
          v-model="info_tu_hexaclorobenzene"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Ecotoxicity profile for hexachlorobenzene   </h3>
          <br>
          <div v-katex:display="'\\frac{\\sum_{i \\in DP} hexachlorobenzene_{effl_i}}{\\sum_{i \\in DP} W_{effl_i}} \\cdot \\frac{1}{EC50_{hexachlorobenzene} \\cdot 10^{-3}}'"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'hexachlorobenzene_{effl}'"></span>: load of hexachlorobenzene in the effluent </li>
            <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body </li>
            <li><span v-katex="'EC50_{hexachlorobenzene}: 30 \\mu g/L'"></span></li>
          </ul>
          <br>


        </div>

      </v-dialog>
      <v-dialog
          v-model="info_tu_mercury"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Ecotoxicity profile for mercury   </h3>
          <br>
          <div v-katex:display="'\\frac{\\sum_{i \\in DP} mercury_{effl_i}}{\\sum_{i \\in DP} W_{effl_i}} \\cdot \\frac{1}{EC50_{mercury} \\cdot 10^{-3}}'"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'mercury_{effl}'"></span>: load of mercury in the effluent </li>
            <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body </li>
            <li><span v-katex="'EC50_{mercury}: 1.4 \\mu g/L'"></span></li>
          </ul>
          <br>


        </div>

      </v-dialog>
      <v-dialog
          v-model="info_tu_lead"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Ecotoxicity profile for lead   </h3>
          <br>
          <div v-katex:display="'\\frac{\\sum_{i \\in DP} lead_{effl_i}}{\\sum_{i \\in DP} W_{effl_i}} \\cdot \\frac{1}{EC50_{lead} \\cdot 10^{-3}}'"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'lead_{effl}'"></span>: load of lead in the effluent </li>
            <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body </li>
            <li><span v-katex="'EC50_{lead}: 440 \\mu g/L'"></span></li>
          </ul>
          <br>


        </div>

      </v-dialog>
      <v-dialog
          v-model="info_tu_nickel"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Ecotoxicity profile for nickel   </h3>
          <br>
          <div v-katex:display="'\\frac{\\sum_{i \\in DP} nickel_{effl_i}}{\\sum_{i \\in DP} W_{effl_i}} \\cdot \\frac{1}{EC50_{nickel} \\cdot 10^{-3}}'"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'nickel_{effl}'"></span>: load of nickel in the effluent </li>
            <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body </li>
            <li><span v-katex="'EC50_{nickel}: 1000 \\mu g/L'"></span></li>
          </ul>
          <br>


        </div>

      </v-dialog>
      <v-dialog
          v-model="info_tu_chloroalkanes"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Ecotoxicity profile for chloroalkanes   </h3>
          <br>
          <div v-katex:display="'\\frac{\\sum_{i \\in DP} chloroalkanes_{effl_i}}{\\sum_{i \\in DP} W_{effl_i}} \\cdot \\frac{1}{EC50_{chloroalkanes} \\cdot 10^{-3}}'"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'chloroalkanes_{effl}'"></span>: load of chloroalkanes in the effluent </li>
            <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body </li>
            <li><span v-katex="'EC50_{chloroalkanes}: 65000 \\mu g/L'"></span></li>
          </ul>
          <br>


        </div>

      </v-dialog>
      <v-dialog
          v-model="info_tu_hexaclorobutadiene"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Ecotoxicity profile for hexachlorobutadiene    </h3>
          <br>
          <div v-katex:display="'\\frac{\\sum_{i \\in DP} hexachlorobutadiene_{effl_i}}{\\sum_{i \\in DP} W_{effl_i}} \\cdot \\frac{1}{EC50_{hexachlorobutadiene} \\cdot 10^{-3}}'"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'hexachlorobutadiene_{effl}'"></span>: load of hexachlorobutadiene in the effluent </li>
            <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body </li>
            <li><span v-katex="'EC50_{hexachlorobutadiene}: 500 \\mu g/L'"></span></li>
          </ul>
          <br>


        </div>

      </v-dialog>
      <v-dialog
          v-model="info_tu_nonylphenols"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Ecotoxicity profile for nonylphenols     </h3>
          <br>
          <div v-katex:display="'\\frac{\\sum_{i \\in DP} nonylphenol_{effl_i}}{\\sum_{i \\in DP} W_{effl_i}} \\cdot \\frac{1}{EC50_{nonylphenol} \\cdot 10^{-3}}'"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'nonylphenol_{effl}'"></span>: load of nonylphenol in the effluent </li>
            <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body </li>
            <li><span v-katex="'EC50_{nonylphenol}: 150 \\mu g/L'"></span></li>
          </ul>
          <br>


        </div>

      </v-dialog>
      <v-dialog
          v-model="info_tu_tetrachloroethene"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Ecotoxicity profile for tetrachloroethylene      </h3>
          <br>
          <div v-katex:display="'\\frac{\\sum_{i \\in DP} tetrachloroethylene_{effl_i}}{\\sum_{i \\in DP} W_{effl_i}} \\cdot \\frac{1}{EC50_{tetrachloroethylene} \\cdot 10^{-3}}'"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'tetrachloroethylene_{effl}'"></span>: load of tetrachloroethylene in the effluent </li>
            <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body </li>
            <li><span v-katex="'EC50_{tetrachloroethylene}: 3200 \\mu g/L'"></span></li>
          </ul>
          <br>


        </div>

      </v-dialog>
      <v-dialog
          v-model="info_tu_trychloroethylene"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Ecotoxicity profile for trichloroethylene  </h3>
          <br>
          <div v-katex:display="'\\frac{\\sum_{i \\in DP} trichloroethylene_{effl_i}}{\\sum_{i \\in DP} W_{effl_i}} \\cdot \\frac{1}{EC50_{trichloroethylene} \\cdot 10^{-3}}'"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'trichloroethylene_{effl}'"></span>: load of trichloroethylene in the effluent </li>
            <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body </li>
            <li><span v-katex="'EC50_{trichloroethylene}: 76000 \\mu g/L'"></span></li>
          </ul>
          <br>


        </div>

      </v-dialog>


      <!-- Delta TU -->
      <v-dialog
          v-model="info_delta_tu_diclo"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Ecotoxicity profile for 1,2-Dichloroethane  </h3>
          <br>
          <div v-katex:display="' \\frac{ \\sum_{i \\in DP} 1,2-Dichloroethane_{effl_i}}{W_{a} - W_{w} + \\sum_{i \\in DP} W_{effl}} \\cdot \\frac{1}{EC50_{1,2-Dichloroethane}\\cdot 10^{-3}} '"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'1,2-Dichloroethane_{effl}'"></span>: load of 1,2-Dichloroethane in the effluent </li>
            <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body </li>
            <li><span v-katex="'EC50_{1,2-Dichloroethane}: 150000 \\mu g/L'"></span></li>
            <li><span v-katex="'W_{a}'"></span>: amount of water available in the river <b>(streamflow global indicator)</b></li>
            <li><span v-katex="'W_{w}'"></span>: amount of water withdrawn from the river </li>

          </ul>
          <br>


        </div>

      </v-dialog>
      <v-dialog
          v-model="info_delta_tu_cadmium"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Ecotoxicity profile for cadmium  </h3>
          <br>
          <div v-katex:display="' \\frac{ \\sum_{i \\in DP} cadmium_{effl_i}}{W_{a} - W_{w} + \\sum_{i \\in DP} W_{effl}} \\cdot \\frac{1}{EC50_{cadmium}\\cdot 10^{-3}} '"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'cadmium_{effl}'"></span>: load of cadmium in the effluent </li>
            <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body </li>
            <li><span v-katex="'EC50_{cadmium}: 9.5 \\mu g/L'"></span></li>
            <li><span v-katex="'W_{a}'"></span>: amount of water available in the river <b>(streamflow global indicator)</b></li>
            <li><span v-katex="'W_{w}'"></span>: amount of water withdrawn from the river </li>

          </ul>
          <br>


        </div>

      </v-dialog>
      <v-dialog
          v-model="info_delta_tu_hexaclorobenzene"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Ecotoxicity profile for hexachlorobenzene  </h3>
          <br>
          <div v-katex:display="' \\frac{ \\sum_{i \\in DP} hexachlorobenzene_{effl_i}}{W_{a} - W_{w} + \\sum_{i \\in DP} W_{effl}} \\cdot \\frac{1}{EC50_{hexachlorobenzene}\\cdot 10^{-3}} '"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'hexachlorobenzene_{effl}'"></span>: load of hexachlorobenzene in the effluent </li>
            <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body </li>
            <li><span v-katex="'EC50_{hexachlorobenzene}: 30 \\mu g/L'"></span></li>
            <li><span v-katex="'W_{a}'"></span>: amount of water available in the river <b>streamflow global indicator</b></li>
            <li><span v-katex="'W_{w}'"></span>: amount of water withdrawn from the river </li>

          </ul>
          <br>


        </div>

      </v-dialog>
      <v-dialog
          v-model="info_delta_tu_mercury"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Ecotoxicity profile for mercury  </h3>
          <br>
          <div v-katex:display="' \\frac{ \\sum_{i \\in DP} mercury_{effl_i}}{W_{a} - W_{w} + \\sum_{i \\in DP} W_{effl}} \\cdot \\frac{1}{EC50_{mercury}\\cdot 10^{-3}} '"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'mercury_{effl}'"></span>: load of mercury in the effluent </li>
            <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body </li>
            <li><span v-katex="'EC50_{mercury}: 1.4 \\mu g/L'"></span></li>
            <li><span v-katex="'W_{a}'"></span>: amount of water available in the river <b>(streamflow global indicator)</b></li>
            <li><span v-katex="'W_{w}'"></span>: amount of water withdrawn from the river </li>

          </ul>
          <br>


        </div>

      </v-dialog>
      <v-dialog
        v-model="info_delta_tu_lead"
        width="60%"
    >
      <div class="dialog_detail" style="background-color: white">
        <h3> Ecotoxicity profile for lead  </h3>
        <br>
        <div v-katex:display="' \\frac{ \\sum_{i \\in DP} lead_{effl_i}}{W_{a} - W_{w} + \\sum_{i \\in DP} W_{effl}} \\cdot \\frac{1}{EC50_{lead}\\cdot 10^{-3}} '"></div>

        <b>Where:</b>
        <br>
        <ul>
          <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
          <li><span v-katex="'lead_{effl}'"></span>: load of lead in the effluent </li>
          <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body </li>
          <li><span v-katex="'EC50_{lead}: 440 \\mu g/L'"></span></li>
          <li><span v-katex="'W_{a}'"></span>: amount of water available in the river <b>(streamflow global indicator)</b></li>
          <li><span v-katex="'W_{w}'"></span>: amount of water withdrawn from the river </li>

        </ul>
        <br>


      </div>

    </v-dialog>
      <v-dialog
          v-model="info_delta_tu_nickel"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Ecotoxicity profile for nickel  </h3>
          <br>
          <div v-katex:display="' \\frac{ \\sum_{i \\in DP} nickel_{effl_i}}{W_{a} - W_{w} + \\sum_{i \\in DP} W_{effl}} \\cdot \\frac{1}{EC50_{nickel}\\cdot 10^{-3}} '"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'nickel_{effl}'"></span>: load of nickel in the effluent </li>
            <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body </li>
            <li><span v-katex="'EC50_{nickel}: 1000 \\mu g/L'"></span></li>
            <li><span v-katex="'W_{a}'"></span>: amount of water available in the river <b>(streamflow global indicator)</b></li>
            <li><span v-katex="'W_{w}'"></span>: amount of water withdrawn from the river </li>

          </ul>
          <br>


        </div>

      </v-dialog>
      <v-dialog
          v-model="info_delta_tu_chloroalkanes"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Ecotoxicity profile for chloroalkanes  </h3>
          <br>
          <div v-katex:display="' \\frac{ \\sum_{i \\in DP} chloroalkanes_{effl_i}}{W_{a} - W_{w} + \\sum_{i \\in DP} W_{effl}} \\cdot \\frac{1}{EC50_{chloroalkanes}\\cdot 10^{-3}} '"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'chloroalkanes_{effl}'"></span>: load of chloroalkanes in the effluent </li>
            <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body </li>
            <li><span v-katex="'EC50_{chloroalkanes}: 65000 \\mu g/L'"></span></li>
            <li><span v-katex="'W_{a}'"></span>: amount of water available in the river <b>(streamflow global indicator)</b></li>
            <li><span v-katex="'W_{w}'"></span>: amount of water withdrawn from the river </li>

          </ul>
          <br>


        </div>

      </v-dialog>
      <v-dialog
          v-model="info_delta_tu_hexaclorobutadiene"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Ecotoxicity profile for hexachlorobutadiene   </h3>
          <br>
          <div v-katex:display="' \\frac{ \\sum_{i \\in DP} hexachlorobutadiene_{effl_i}}{W_{a} - W_{w} + \\sum_{i \\in DP} W_{effl}} \\cdot \\frac{1}{EC50_{hexachlorobutadiene}\\cdot 10^{-3}} '"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'hexachlorobutadiene_{effl}'"></span>: load of hexachlorobutadiene in the effluent </li>
            <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body </li>
            <li><span v-katex="'EC50_{hexachlorobutadiene}: 500 \\mu g/L'"></span></li>
            <li><span v-katex="'W_{a}'"></span>: amount of water available in the river <b>(streamflow global indicator)</b></li>
            <li><span v-katex="'W_{w}'"></span>: amount of water withdrawn from the river </li>

          </ul>
          <br>


        </div>

      </v-dialog>
      <v-dialog
          v-model="info_delta_tu_nonylphenols"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Ecotoxicity profile for nonylphenols    </h3>
          <br>
          <div v-katex:display="' \\frac{ \\sum_{i \\in DP} nonylphenol_{effl_i}}{W_{a} - W_{w} + \\sum_{i \\in DP} W_{effl}} \\cdot \\frac{1}{EC50_{nonylphenol}\\cdot 10^{-3}} '"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'nonylphenol_{effl}'"></span>: load of nonylphenol in the effluent </li>
            <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body </li>
            <li><span v-katex="'EC50_{nonylphenol}: 150 \\mu g/L'"></span></li>
            <li><span v-katex="'W_{a}'"></span>: amount of water available in the river <b>(streamflow global indicator)</b></li>
            <li><span v-katex="'W_{w}'"></span>: amount of water withdrawn from the river </li>

          </ul>
          <br>


        </div>

      </v-dialog>
      <v-dialog
          v-model="info_delta_tu_tetrachloroethene"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Ecotoxicity profile for tetrachloroethylene     </h3>
          <br>
          <div v-katex:display="' \\frac{ \\sum_{i \\in DP} tetrachloroethylene_{effl_i}}{W_{a} - W_{w} + \\sum_{i \\in DP} W_{effl}} \\cdot \\frac{1}{EC50_{tetrachloroethylene}\\cdot 10^{-3}} '"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'tetrachloroethylene_{effl}'"></span>: load of tetrachloroethylene in the effluent </li>
            <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body </li>
            <li><span v-katex="'EC50_{tetrachloroethylene}: 3200 \\mu g/L'"></span></li>
            <li><span v-katex="'W_{a}'"></span>: amount of water available in the river <b>(streamflow global indicator)</b></li>
            <li><span v-katex="'W_{w}'"></span>: amount of water withdrawn from the river </li>

          </ul>
          <br>


        </div>

      </v-dialog>
      <v-dialog
          v-model="info_delta_tu_trychloroethylene"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Ecotoxicity profile for trichloroethylene      </h3>
          <br>
          <div v-katex:display="' \\frac{ \\sum_{i \\in DP} trichloroethylene_{effl_i}}{W_{a} - W_{w} + \\sum_{i \\in DP} W_{effl}} \\cdot \\frac{1}{EC50_{trichloroethylene}\\cdot 10^{-3}} '"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'trichloroethylene_{effl}'"></span>: load of trichloroethylene in the effluent </li>
            <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body </li>
            <li><span v-katex="'EC50_{trichloroethylene}: 76000 \\mu g/L'"></span></li>
            <li><span v-katex="'W_{a}'"></span>: amount of water available in the river <b>(streamflow global indicator)</b></li>
            <li><span v-katex="'W_{w}'"></span>: amount of water withdrawn from the river </li>

          </ul>
          <br>


        </div>

      </v-dialog>


      <!-- EQS -->
      <v-dialog
          v-model="info_eqs_diclo"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Ecotoxicity profile for 1,2-Dichloroethane  </h3>
          <br>
          <div v-katex:display="'\\frac{\\sum_{i \\in DP} 1,2-Dichloroethane_{effl_i}}{\\sum_{i \\in DP} W_{effl_i}} \\cdot \\frac{1}{EQS_{1,2-Dichloroethane}}'"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'1,2-Dichloroethane_{effl}'"></span>: load of 1,2-Dichloroethane in the effluent </li>
            <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body </li>
            <li><span v-katex="'EQS_{1,2-Dichloroethane}: 0.01 mg/L'"></span></li>
          </ul>
          <br>


        </div>

      </v-dialog>
      <v-dialog
          v-model="info_eqs_cadmium"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Ecotoxicity profile for cadmium  </h3>
          <br>
          <div v-katex:display="'\\frac{\\sum_{i \\in DP} cadmium_{effl_i}}{\\sum_{i \\in DP} W_{effl_i}} \\cdot \\frac{1}{EQS_{cadmium}}'"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'cadmium_{effl}'"></span>: load of cadmium in the effluent </li>
            <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body </li>
            <li><span v-katex="'EQS_{cadmium}: 0.001 mg/L'"></span></li>
          </ul>
          <br>


        </div>

      </v-dialog>
      <v-dialog
          v-model="info_eqs_hexaclorobenzene"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Ecotoxicity profile for hexachlorobenzene   </h3>
          <br>
          <div v-katex:display="'\\frac{\\sum_{i \\in DP} hexachlorobenzene_{effl_i}}{\\sum_{i \\in DP} W_{effl_i}} \\cdot \\frac{1}{EQS_{hexachlorobenzene}}'"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'hexachlorobenzene_{effl}'"></span>: load of hexachlorobenzene in the effluent </li>
            <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body </li>
            <li><span v-katex="'EQS_{hexachlorobenzene}: 0.0005 mg/L'"></span></li>
          </ul>
          <br>


        </div>

      </v-dialog>
      <v-dialog
          v-model="info_eqs_mercury"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Ecotoxicity profile for mercury   </h3>
          <br>
          <div v-katex:display="'\\frac{\\sum_{i \\in DP} mercury_{effl_i}}{\\sum_{i \\in DP} W_{effl_i}} \\cdot \\frac{1}{EQS_{mercury} \\cdot }'"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'mercury_{effl}'"></span>: load of mercury in the effluent </li>
            <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body </li>
            <li><span v-katex="'EQS_{mercury}: 0.00007 mg/L'"></span></li>
          </ul>
          <br>


        </div>

      </v-dialog>
      <v-dialog
          v-model="info_eqs_lead"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Ecotoxicity profile for lead   </h3>
          <br>
          <div v-katex:display="'\\frac{\\sum_{i \\in DP} lead_{effl_i}}{\\sum_{i \\in DP} W_{effl_i}} \\cdot \\frac{1}{EQS_{lead}}'"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'lead_{effl}'"></span>: load of lead in the effluent </li>
            <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body </li>
            <li><span v-katex="'EQS_{lead}: 0.0072 mg/L'"></span></li>
          </ul>
          <br>


        </div>

      </v-dialog>
      <v-dialog
          v-model="info_eqs_nickel"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Ecotoxicity profile for nickel   </h3>
          <br>
          <div v-katex:display="'\\frac{\\sum_{i \\in DP} nickel_{effl_i}}{\\sum_{i \\in DP} W_{effl_i}} \\cdot \\frac{1}{EQS_{nickel}}'"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'nickel_{effl}'"></span>: load of nickel in the effluent </li>
            <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body </li>
            <li><span v-katex="'EQS_{nickel}: 0.02 mg/L'"></span></li>
          </ul>
          <br>


        </div>

      </v-dialog>
      <v-dialog
          v-model="info_eqs_chloroalkanes"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Ecotoxicity profile for chloroalkanes   </h3>
          <br>
          <div v-katex:display="'\\frac{\\sum_{i \\in DP} chloroalkanes_{effl_i}}{\\sum_{i \\in DP} W_{effl_i}} \\cdot \\frac{1}{EQS_{chloroalkanes}}'"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'chloroalkanes_{effl}'"></span>: load of chloroalkanes in the effluent </li>
            <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body </li>
            <li><span v-katex="'EQS_{chloroalkanes}: 0.0014 mg/L'"></span></li>
          </ul>
          <br>


        </div>

      </v-dialog>
      <v-dialog
          v-model="info_eqs_hexaclorobutadiene"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Ecotoxicity profile for hexachlorobutadiene    </h3>
          <br>
          <div v-katex:display="'\\frac{\\sum_{i \\in DP} hexachlorobutadiene_{effl_i}}{\\sum_{i \\in DP} W_{effl_i}} \\cdot \\frac{1}{EQS_{hexachlorobutadiene}}'"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'hexachlorobutadiene_{effl}'"></span>: load of hexachlorobutadiene in the effluent </li>
            <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body </li>
            <li><span v-katex="'EQS_{hexachlorobutadiene}: 0.0006 mg/L'"></span></li>
          </ul>
          <br>


        </div>

      </v-dialog>
      <v-dialog
          v-model="info_eqs_nonylphenols"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Ecotoxicity profile for nonylphenols     </h3>
          <br>
          <div v-katex:display="'\\frac{\\sum_{i \\in DP} nonylphenol_{effl_i}}{\\sum_{i \\in DP} W_{effl_i}} \\cdot \\frac{1}{EQS_{nonylphenol} }'"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'nonylphenol_{effl}'"></span>: load of nonylphenol in the effluent </li>
            <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body </li>
            <li><span v-katex="'EQS_{nonylphenol}: 0.002 mg/L'"></span></li>
          </ul>
          <br>


        </div>

      </v-dialog>
      <v-dialog
          v-model="info_eqs_tetrachloroethene"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Ecotoxicity profile for tetrachloroethylene      </h3>
          <br>
          <div v-katex:display="'\\frac{\\sum_{i \\in DP} tetrachloroethylene_{effl_i}}{\\sum_{i \\in DP} W_{effl_i}} \\cdot \\frac{1}{EQS_{tetrachloroethylene}}'"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'tetrachloroethylene_{effl}'"></span>: load of tetrachloroethylene in the effluent </li>
            <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body </li>
            <li><span v-katex="'EQS_{tetrachloroethylene}: 0.01 mg/L'"></span></li>
          </ul>
          <br>


        </div>

      </v-dialog>
      <v-dialog
          v-model="info_eqs_trychloroethylene"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Ecotoxicity profile for trichloroethylene  </h3>
          <br>
          <div v-katex:display="'\\frac{\\sum_{i \\in DP} trichloroethylene_{effl_i}}{\\sum_{i \\in DP} W_{effl_i}} \\cdot \\frac{1}{EQS_{trichloroethylene}}'"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'trichloroethylene_{effl}'"></span>: load of trichloroethylene in the effluent </li>
            <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body </li>
            <li><span v-katex="'EQS_{trichloroethylene}: 0.01 mg/L'"></span></li>
          </ul>
          <br>


        </div>

      </v-dialog>


      <!-- Delta EQS -->
      <v-dialog
          v-model="info_delta_eqs_diclo"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Ecotoxicity profile for 1,2-Dichloroethane  </h3>
          <br>
          <div v-katex:display="' \\frac{ \\sum_{i \\in DP} 1,2-Dichloroethane_{effl_i}}{W_{a} - W_{w} + \\sum_{i \\in DP} W_{effl}} \\cdot \\frac{1}{EQS_{1,2-Dichloroethane}} '"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'1,2-Dichloroethane_{effl}'"></span>: load of 1,2-Dichloroethane in the effluent </li>
            <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body </li>
            <li><span v-katex="'EQS_{1,2-Dichloroethane}: 0.01 Mg/L'"></span></li>
            <li><span v-katex="'W_{a}'"></span>: amount of water available in the river <b>(streamflow global indicator)</b></li>
            <li><span v-katex="'W_{w}'"></span>: amount of water withdrawn from the river </li>

          </ul>
          <br>


        </div>

      </v-dialog>
      <v-dialog
          v-model="info_delta_eqs_cadmium"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Ecotoxicity profile for cadmium  </h3>
          <br>
          <div v-katex:display="' \\frac{ \\sum_{i \\in DP} cadmium_{effl_i}}{W_{a} - W_{w} + \\sum_{i \\in DP} W_{effl}} \\cdot \\frac{1}{EQS_{cadmium}} '"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'cadmium_{effl}'"></span>: load of cadmium in the effluent </li>
            <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body </li>
            <li><span v-katex="'EQS_{cadmium}: 0.001 Mg/L'"></span></li>
            <li><span v-katex="'W_{a}'"></span>: amount of water available in the river <b>(streamflow global indicator)</b></li>
            <li><span v-katex="'W_{w}'"></span>: amount of water withdrawn from the river </li>

          </ul>
          <br>


        </div>

      </v-dialog>
      <v-dialog
          v-model="info_delta_eqs_hexaclorobenzene"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Ecotoxicity profile for hexachlorobenzene  </h3>
          <br>
          <div v-katex:display="' \\frac{ \\sum_{i \\in DP} hexachlorobenzene_{effl_i}}{W_{a} - W_{w} + \\sum_{i \\in DP} W_{effl}} \\cdot \\frac{1}{EQS_{hexachlorobenzene}} '"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'hexachlorobenzene_{effl}'"></span>: load of hexachlorobenzene in the effluent </li>
            <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body </li>
            <li><span v-katex="'EQS_{hexachlorobenzene}: 0.0005 mg/L'"></span></li>
            <li><span v-katex="'W_{a}'"></span>: amount of water available in the river <b>(streamflow global indicator)</b></li>
            <li><span v-katex="'W_{w}'"></span>: amount of water withdrawn from the river </li>

          </ul>
          <br>


        </div>

      </v-dialog>
      <v-dialog
          v-model="info_delta_eqs_mercury"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Ecotoxicity profile for mercury  </h3>
          <br>
          <div v-katex:display="' \\frac{ \\sum_{i \\in DP} mercury_{effl_i}}{W_{a} - W_{w} + \\sum_{i \\in DP} W_{effl}} \\cdot \\frac{1}{EQS_{mercury}} '"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'mercury_{effl}'"></span>: load of mercury in the effluent </li>
            <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body </li>
            <li><span v-katex="'EQS_{mercury}: 0.00007 mg/L'"></span></li>
            <li><span v-katex="'W_{a}'"></span>: amount of water available in the river <b>(streamflow global indicator)</b></li>
            <li><span v-katex="'W_{w}'"></span>: amount of water withdrawn from the river </li>

          </ul>
          <br>


        </div>

      </v-dialog>
      <v-dialog
          v-model="info_delta_eqs_lead"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Ecotoxicity profile for lead  </h3>
          <br>
          <div v-katex:display="' \\frac{ \\sum_{i \\in DP} lead_{effl_i}}{W_{a} - W_{w} + \\sum_{i \\in DP} W_{effl}} \\cdot \\frac{1}{EQS_{lead}} '"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'lead_{effl}'"></span>: load of lead in the effluent </li>
            <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body </li>
            <li><span v-katex="'EQS_{lead}: 0.0072 mg/L'"></span></li>
            <li><span v-katex="'W_{a}'"></span>: amount of water available in the river <b>(streamflow global indicator)</b></li>
            <li><span v-katex="'W_{w}'"></span>: amount of water withdrawn from the river </li>

          </ul>
          <br>


        </div>

      </v-dialog>
      <v-dialog
          v-model="info_delta_eqs_nickel"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Ecotoxicity profile for nickel  </h3>
          <br>
          <div v-katex:display="' \\frac{ \\sum_{i \\in DP} nickel_{effl_i}}{W_{a} - W_{w} + \\sum_{i \\in DP} W_{effl}} \\cdot \\frac{1}{EQS_{nickel}} '"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'nickel_{effl}'"></span>: load of nickel in the effluent </li>
            <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body </li>
            <li><span v-katex="'EQS_{nickel}: 0.02 mg/L'"></span></li>
            <li><span v-katex="'W_{a}'"></span>: amount of water available in the river <b>(streamflow global indicator)</b></li>
            <li><span v-katex="'W_{w}'"></span>: amount of water withdrawn from the river </li>

          </ul>
          <br>


        </div>

      </v-dialog>
      <v-dialog
          v-model="info_delta_eqs_chloroalkanes"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Ecotoxicity profile for chloroalkanes  </h3>
          <br>
          <div v-katex:display="' \\frac{ \\sum_{i \\in DP} chloroalkanes_{effl_i}}{W_{a} - W_{w} + \\sum_{i \\in DP} W_{effl}} \\cdot \\frac{1}{EQS_{chloroalkanes}} '"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'chloroalkanes_{effl}'"></span>: load of chloroalkanes in the effluent </li>
            <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body </li>
            <li><span v-katex="'EQS_{chloroalkanes}: 0.0014 mg/L'"></span></li>
            <li><span v-katex="'W_{a}'"></span>: amount of water available in the river <b>(streamflow global indicator)</b></li>
            <li><span v-katex="'W_{w}'"></span>: amount of water withdrawn from the river </li>

          </ul>
          <br>


        </div>

      </v-dialog>
      <v-dialog
          v-model="info_delta_eqs_hexaclorobutadiene"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Ecotoxicity profile for hexachlorobutadiene   </h3>
          <br>
          <div v-katex:display="' \\frac{ \\sum_{i \\in DP} hexachlorobutadiene_{effl_i}}{W_{a} - W_{w} + \\sum_{i \\in DP} W_{effl}} \\cdot \\frac{1}{EQS_{hexachlorobutadiene}} '"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'hexachlorobutadiene_{effl}'"></span>: load of hexachlorobutadiene in the effluent </li>
            <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body </li>
            <li><span v-katex="'EQS_{hexachlorobutadiene}: 0.0006mg/L'"></span></li>
            <li><span v-katex="'W_{a}'"></span>: amount of water available in the river <b>(streamflow global indicator)</b></li>
            <li><span v-katex="'W_{w}'"></span>: amount of water withdrawn from the river </li>

          </ul>
          <br>


        </div>

      </v-dialog>
      <v-dialog
          v-model="info_delta_eqs_nonylphenols"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Ecotoxicity profile for nonylphenols    </h3>
          <br>
          <div v-katex:display="' \\frac{ \\sum_{i \\in DP} nonylphenol_{effl_i}}{W_{a} - W_{w} + \\sum_{i \\in DP} W_{effl}} \\cdot \\frac{1}{EQS_{nonylphenol}} '"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'nonylphenol_{effl}'"></span>: load of nonylphenol in the effluent </li>
            <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body </li>
            <li><span v-katex="'EQS_{nonylphenol}: 0.002 mg/L'"></span></li>
            <li><span v-katex="'W_{a}'"></span>: amount of water available in the river <b>(streamflow global indicator)</b></li>
            <li><span v-katex="'W_{w}'"></span>: amount of water withdrawn from the river </li>

          </ul>
          <br>


        </div>

      </v-dialog>
      <v-dialog
          v-model="info_delta_eqs_tetrachloroethene"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Ecotoxicity profile for tetrachloroethylene     </h3>
          <br>
          <div v-katex:display="' \\frac{ \\sum_{i \\in DP} tetrachloroethylene_{effl_i}}{W_{a} - W_{w} + \\sum_{i \\in DP} W_{effl}} \\cdot \\frac{1}{EQS_{tetrachloroethylene}} '"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'tetrachloroethylene_{effl}'"></span>: load of tetrachloroethylene in the effluent </li>
            <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body </li>
            <li><span v-katex="'EQS_{tetrachloroethylene}: 0.01 mg/L'"></span></li>
            <li><span v-katex="'W_{a}'"></span>: amount of water available in the river <b>(streamflow global indicator)</b></li>
            <li><span v-katex="'W_{w}'"></span>: amount of water withdrawn from the river </li>

          </ul>
          <br>


        </div>

      </v-dialog>
      <v-dialog
          v-model="info_delta_eqs_trychloroethylene"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Ecotoxicity profile for trichloroethylene      </h3>
          <br>
          <div v-katex:display="' \\frac{ \\sum_{i \\in DP} trichloroethylene_{effl_i}}{W_{a} - W_{w} + \\sum_{i \\in DP} W_{effl}} \\cdot \\frac{1}{EQS_{trichloroethylene}} '"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'trichloroethylene_{effl}'"></span>: load of trichloroethylene in the effluent </li>
            <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body </li>
            <li><span v-katex="'EQS_{trichloroethylene}: 0.01 mg/L'"></span></li>
            <li><span v-katex="'W_{a}'"></span>: amount of water available in the river <b>(streamflow global indicator)</b></li>
            <li><span v-katex="'W_{w}'"></span>: amount of water withdrawn from the river </li>

          </ul>
          <br>


        </div>

      </v-dialog>

      <!-- Treatment efficiency -->
      <v-dialog
          v-model="info_efficiency_cod"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Treatment efficiency for COD  </h3>
          <br>
          <div v-katex:display="'\\frac{\\sum_{i \\in DP} COD_{infl_i} - COD_{effl_i}}{\\sum_{i \\in DP} COD_{infl_i}}\\cdot 100'"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'COD_{effl}'"></span>: load of COD in the effluent </li>
            <li><span v-katex="'COD_{infl}'"></span>: load of COD in the influent </li>

          </ul>
          <br>


        </div>

      </v-dialog>
      <v-dialog
          v-model="info_efficiency_tn"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Treatment efficiency for TN  </h3>
          <br>
          <div v-katex:display="'\\frac{\\sum_{i \\in DP} TN_{infl_i} - TN_{effl_i}}{\\sum_{i \\in DP} TN_{infl_i}}\\cdot 100'"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'TN_{effl}'"></span>: load of TN in the effluent </li>
            <li><span v-katex="'TN_{infl}'"></span>: load of TN in the influent </li>

          </ul>
          <br>


        </div>

      </v-dialog>
      <v-dialog
          v-model="info_efficiency_tp"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Treatment efficiency for TP  </h3>
          <br>
          <div v-katex:display="'\\frac{\\sum_{i \\in DP} TP_{infl_i} - TP_{effl_i}}{\\sum_{i \\in DP} TP_{infl_i}}\\cdot 100'"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'TP_{effl}'"></span>: load of TP in the effluent </li>
            <li><span v-katex="'TP_{infl}'"></span>: load of TP in the influent </li>

          </ul>
          <br>


        </div>

      </v-dialog>
      <v-dialog
          v-model="info_efficiency_diclo"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Treatment efficiency for for 1,2-Dichloroethane  </h3>
          <br>
          <div v-katex:display="'\\frac{\\sum_{i \\in DP} 1,2-Dichloroethane_{infl_i} - 1,2-Dichloroethane_{effl_i}}{\\sum_{i \\in DP} 1,2-Dichloroethane_{infl_i}}\\cdot 100'"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'1,2-Dichloroethane_{effl}'"></span>: load of 1,2-Dichloroethane in the effluent </li>
            <li><span v-katex="'1,2-Dichloroethane_{infl}'"></span>: load of 1,2-Dichloroethane in the influent </li>

          </ul>
          <br>


        </div>

      </v-dialog>
      <v-dialog
          v-model="info_efficiency_cadmium"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Treatment efficiency for Cadmium  </h3>
          <br>
          <div v-katex:display="'\\frac{\\sum_{i \\in DP} cadmium_{infl_i} - cadmium_{effl_i}}{\\sum_{i \\in DP} cadmium_{infl_i}}\\cdot 100'"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'cadmium_{effl}'"></span>: load of cadmium in the effluent </li>
            <li><span v-katex="'cadmium_{infl}'"></span>: load of cadmium in the influent </li>

          </ul>
          <br>


        </div>

      </v-dialog>
      <v-dialog
          v-model="info_efficiency_hexaclorobenzene"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Treatment efficiency for hexachlorobenzene  </h3>
          <br>
          <div v-katex:display="'\\frac{\\sum_{i \\in DP} hexachlorobenzene_{infl_i} - hexachlorobenzene_{effl_i}}{\\sum_{i \\in DP} hexachlorobenzene_{infl_i}}\\cdot 100'"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'hexachlorobenzene_{effl}'"></span>: load of hexachlorobenzene in the effluent </li>
            <li><span v-katex="'hexachlorobenzene_{infl}'"></span>: load of hexachlorobenzene in the influent </li>

          </ul>
          <br>


        </div>

      </v-dialog>
      <v-dialog
          v-model="info_efficiency_mercury"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Treatment efficiency for mercury  </h3>
          <br>
          <div v-katex:display="'\\frac{\\sum_{i \\in DP} mercury_{infl_i} - mercury_{effl_i}}{\\sum_{i \\in DP} mercury_{infl_i}}\\cdot 100'"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'mercury_{effl}'"></span>: load of mercury in the effluent </li>
            <li><span v-katex="'mercury_{infl}'"></span>: load of mercury in the influent </li>

          </ul>
          <br>


        </div>

      </v-dialog>
      <v-dialog
          v-model="info_efficiency_lead"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Treatment efficiency for lead  </h3>
          <br>
          <div v-katex:display="'\\frac{\\sum_{i \\in DP} lead_{infl_i} - lead_{effl_i}}{\\sum_{i \\in DP} lead_{infl_i}}\\cdot 100'"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'lead_{effl}'"></span>: load of lead in the effluent </li>
            <li><span v-katex="'lead_{infl}'"></span>: load of lead in the influent </li>

          </ul>
          <br>


        </div>

      </v-dialog>
      <v-dialog
          v-model="info_efficiency_nickel"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Treatment efficiency for nickel  </h3>
          <br>
          <div v-katex:display="'\\frac{\\sum_{i \\in DP} nickel_{infl_i} - nickel_{effl_i}}{\\sum_{i \\in DP} nickel_{infl_i}}\\cdot 100'"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'nickel_{effl}'"></span>: load of nickel in the effluent </li>
            <li><span v-katex="'nickel_{infl}'"></span>: load of nickel in the influent </li>

          </ul>
          <br>


        </div>

      </v-dialog>
      <v-dialog
          v-model="info_efficiency_chloroalkanes"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Treatment efficiency for Chloroalkanes  </h3>
          <br>
          <div v-katex:display="'\\frac{\\sum_{i \\in DP} chloroalkanes_{infl_i} - chloroalkanes_{effl_i}}{\\sum_{i \\in DP} chloroalkanes_{infl_i}}\\cdot 100'"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'chloroalkanes_{effl}'"></span>: load of chloroalkanes in the effluent </li>
            <li><span v-katex="'chloroalkanes_{infl}'"></span>: load of chloroalkanes in the influent </li>

          </ul>
          <br>


        </div>

      </v-dialog>
      <v-dialog
          v-model="info_efficiency_hexaclorobutadiene"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Treatment efficiency for Hexachlorobutadiene   </h3>
          <br>
          <div v-katex:display="'\\frac{\\sum_{i \\in DP} hexachlorobutadiene_{infl_i} - hexachlorobutadiene_{effl_i}}{\\sum_{i \\in DP} hexachlorobutadiene_{infl_i}}\\cdot 100'"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'hexachlorobutadiene_{effl}'"></span>: load of Hexachlorobutadiene in the effluent </li>
            <li><span v-katex="'hexachlorobutadiene_{infl}'"></span>: load of Hexachlorobutadiene in the influent </li>

          </ul>
          <br>


        </div>

      </v-dialog>
      <v-dialog
          v-model="info_efficiency_nonylphenols"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Treatment efficiency for Nonylphenols    </h3>
          <br>
          <div v-katex:display="'\\frac{\\sum_{i \\in DP} nonylphenols_{infl_i} - nonylphenols_{effl_i}}{\\sum_{i \\in DP} nonylphenols_{infl_i}}\\cdot 100'"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'nonylphenols_{effl}'"></span>: load of Nonylphenols in the effluent </li>
            <li><span v-katex="'nonylphenols_{infl}'"></span>: load of Nonylphenols in the influent </li>

          </ul>
          <br>


        </div>

      </v-dialog>
      <v-dialog
          v-model="info_efficiency_tetrachloroethene"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Treatment efficiency for Tetrachloroethylene     </h3>
          <br>
          <div v-katex:display="'\\frac{\\sum_{i \\in DP} tetrachloroethylene_{infl_i} - tetrachloroethylene_{effl_i}}{\\sum_{i \\in DP} tetrachloroethylene_{infl_i}}\\cdot 100'"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'tetrachloroethylene_{effl}'"></span>: load of Tetrachloroethylene in the effluent </li>
            <li><span v-katex="'tetrachloroethylene_{infl}'"></span>: load of Tetrachloroethylene in the influent </li>

          </ul>
          <br>


        </div>

      </v-dialog>
      <v-dialog
          v-model="info_efficiency_trychloroethylene"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Treatment efficiency for Trichloroethylene      </h3>
          <br>
          <div v-katex:display="'\\frac{\\sum_{i \\in DP} trichloroethylene_{infl_i} - trichloroethylene_{effl_i}}{\\sum_{i \\in DP} trichloroethylene_{infl_i}}\\cdot 100'"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'trichloroethylene_{effl}'"></span>: load of Trichloroethylene in the effluent </li>
            <li><span v-katex="'trichloroethylene_{infl}'"></span>: load of Trichloroethylene in the influent </li>

          </ul>
          <br>


        </div>

      </v-dialog>

      <!-- Treatment efficiency influent-->
      <v-dialog
          v-model="info_efficiency_influent_cod"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Treatment efficiency for COD  </h3>
          <br>
          <div v-katex:display="'\\frac{\\sum_{i \\in DP} COD_{effl_i}}{COD_{infl}}\\cdot 100'"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'COD_{effl}'"></span>: load of COD in the effluent </li>
            <li><span v-katex="'COD_{infl}'"></span>: load of COD in the influent of the industry</li>

          </ul>
          <br>


        </div>

      </v-dialog>
      <v-dialog
          v-model="info_efficiency_influent_tn"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Treatment efficiency for TN  </h3>
          <br>
          <div v-katex:display="'\\frac{\\sum_{i \\in DP} TN_{effl_i}}{TN_{infl}}\\cdot 100'"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'TN_{effl}'"></span>: load of TN in the effluent </li>
            <li><span v-katex="'TN_{infl}'"></span>: load of TN in the influent of the industry</li>

          </ul>
          <br>


        </div>

      </v-dialog>
      <v-dialog
          v-model="info_efficiency_influent_tp"
          width="60%"
      >
        <div class="dialog_detail" style="background-color: white">
          <h3> Treatment efficiency for TP  </h3>
          <br>
          <div v-katex:display="'\\frac{\\sum_{i \\in DP} TP_{effl_i}}{TP_{infl}}\\cdot 100'"></div>

          <b>Where:</b>
          <br>
          <ul>
            <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water </li>
            <li><span v-katex="'TP_{effl}'"></span>: load of TP in the effluent </li>
            <li><span v-katex="'TP_{infl}'"></span>: load of TP in the influent of the industry</li>

          </ul>
          <br>


        </div>

      </v-dialog>

      <v-dialog
          v-model="industry_info"
          width="80%"
      >
        <div class="dialog_detail" v-if="industry_clicked != null" style="background-color: white">
          <h3>{{ industry_clicked[0].name }} </h3>
          <br>

          <v-row
              class="pa-4"
              justify="space-between"
          >
            <v-col cols="5">
              <v-treeview
                  :active.sync="active_indicator"
                  :items="indicators_industry"
                  activatable
                  open-on-click
                  transition
                  dense
                  :open.sync="open_indicator"
              >
                <template v-slot:prepend="{ item, open }" style="height: 100%;">
                  <div
                      style="width: 5px; margin-left: 40px"
                      :class="indicator_risk_class(item)"
                  >
                    &nbsp
                  </div>

                </template>


              </v-treeview>
            </v-col>

            <v-divider vertical></v-divider>

            <v-col
                class="d-flex text-center"
            >
              <v-scroll-y-transition mode="out-in">
                <div
                    class="text-h6 grey--text text--lighten-1 font-weight-light"
                    style="align-self: center;"
                    v-if="active_indicator.length == 0"
                >
                  Select an indicator
                </div>
                <div v-else>
                  <div v-if="active_indicator[0] == 3">
                    <v-data-table
                        :headers="delta_ecotox_table.header"
                        :items="delta_ecotox_table.value"
                        class="expanded_table_hover"
                        :item-class="itemRowBold"
                        disable-pagination
                        :hide-default-footer="true"
                        dense
                    >
                      <template v-slot:item.value="{ item }">
              <span v-if="item.info">
                {{item.value}}
                <v-btn
                    icon
                    @click="$data[item.info] = true"
                    class="icon_clickable"
                    x-small
                >
                  <v-icon
                      color='#1C195B'
                  >
                    mdi-information-outline
                  </v-icon>
                </v-btn>


              </span>
                        <span v-else>{{item.value}}</span>
                      </template>

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
                                  text-color="#1c1c1b"
                              >
                                {{ item[value] }}
                              </v-chip>
                            </template>
                            <span>{{ getDeltaEcotoxColor(item, value)[1] }}</span>
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
                  <div v-else-if="active_indicator[0] == 4">
                    <v-data-table
                        :headers="delta_eqs_table.header"
                        :items="delta_eqs_table.value"
                        class="expanded_table_hover"

                        disable-pagination
                        :hide-default-footer="true"
                        dense
                    >

                      <template v-slot:item.value="{ item }">
              <span v-if="item.info">
                {{item.value}}
                <v-btn
                    icon
                    @click="$data[item.info] = true"
                    class="icon_clickable"
                    x-small
                >
                  <v-icon
                      color='#1C195B'
                  >
                    mdi-information-outline
                  </v-icon>
                </v-btn>


              </span>
                        <span v-else>{{item.value}}</span>
                      </template>

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
                                  text-color="#1c1c1b"
                              >
                                {{ item[value] }}
                              </v-chip>
                            </template>
                            <span>{{ getDeltaEQSColor(item, value)[1] }}</span>
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
                  <div v-else-if="active_indicator[0] == 5">
                    <v-data-table
                        :headers="eutrophication_table.header"
                        :items="eutrophication_table.value"
                        class="expanded_table_hover"
                        :item-class="itemRowBold"
                        disable-pagination
                        :hide-default-footer="true"
                        dense
                    >
                      <template v-slot:item.value="{ item }">
              <span v-if="item.info">
                {{item.value}}
                <v-btn
                    icon
                    @click="$data[item.info] = true"
                    class="icon_clickable"
                    x-small
                >
                  <v-icon
                      color='#1C195B'
                  >
                    mdi-information-outline
                  </v-icon>
                </v-btn>


              </span>
                        <span v-else>{{item.value}}</span>
                      </template>

                      <template
                          v-for="value in Object.keys(industries_aggregated)"
                          v-slot:[`item.${value}`]="{ item }"
                      >

                        <template v-if="getEutrophicationColor(item, value) != null">
                          <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                              <v-chip
                                  :color="getEutrophicationColor(item, value)[0]"
                                  dark
                                  :key="value"
                                  v-bind="attrs"
                                  v-on="on"
                                  text-color="#1c1c1b"
                              >
                                {{ item[value] }}
                              </v-chip>
                            </template>
                            <span>{{ getEutrophicationColor(item, value)[1] }}</span>
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
                  <div v-else-if="active_indicator[0] == 6">
                    <v-data-table
                        :headers="ecotoxicity_table.header"
                        :items="ecotoxicity_table.value"
                        disable-pagination
                        :hide-default-footer="true"
                        dense
                        class="expanded_table_hover"
                        :item-class="itemRowBold"
                    >
                      <template v-slot:item.value="{ item }">
              <span v-if="item.info">
                {{item.value}}
                <v-btn
                    icon
                    @click="$data[item.info] = true"
                    class="icon_clickable"
                    x-small
                >
                  <v-icon
                      color='#1C195B'
                  >
                    mdi-information-outline
                  </v-icon>
                </v-btn>


              </span>
                        <span v-else>{{item.value}}</span>
                      </template>
                      <template
                          v-for="value in Object.keys(industries_aggregated)"
                          v-slot:[`item.${value}`]="{ item }"
                      >

                        <template v-if="getEcotoxicity(item, value) != null">
                          <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                              <v-chip
                                  :color="getEcotoxicity(item, value)[0]"
                                  dark
                                  :key="value"
                                  v-bind="attrs"
                                  v-on="on"
                                  text-color="#1c1c1b"
                              >
                                {{ item[value] }}
                              </v-chip>
                            </template>
                            <span>{{ getEcotoxicity(item, value)[1] }}</span>
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
                  <div v-else-if="active_indicator[0] == 7">
                    <v-data-table
                        :headers="eqs_table.header"
                        :items="eqs_table.value"
                        disable-pagination
                        :hide-default-footer="true"
                        dense
                        class="expanded_table_hover"
                    >

                      <template v-slot:item.value="{ item }">
              <span v-if="item.info">
                {{item.value}}
                <v-btn
                    icon
                    @click="$data[item.info] = true"
                    class="icon_clickable"
                    x-small
                >
                  <v-icon
                      color='#1C195B'
                  >
                    mdi-information-outline
                  </v-icon>
                </v-btn>


              </span>
                        <span v-else>{{item.value}}</span>
                      </template>
                      <template
                          v-for="value in Object.keys(industries_aggregated)"
                          v-slot:[`item.${value}`]="{ item }"
                      >

                        <template v-if="getEQSColor(item, value) != null">
                          <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                              <v-chip
                                  :color="getEQSColor(item, value)[0]"
                                  dark
                                  :key="value"
                                  v-bind="attrs"
                                  v-on="on"
                                  text-color="#1c1c1b"
                              >
                                {{ item[value] }}
                              </v-chip>
                            </template>
                            <span>{{ getEQSColor(item, value)[1] }}</span>
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
                  <div v-else-if="active_indicator[0] == 9">
                    <v-data-table
                        :headers="treatment_efficiency_table.header"
                        :items="treatment_efficiency_table.value"
                        class="expanded_table_hover"

                        disable-pagination
                        :hide-default-footer="true"
                        dense
                    >

                      <template v-slot:item.value="{ item }">
              <span v-if="item.info">
                {{item.value}}
                <v-btn
                    icon
                    @click="$data[item.info] = true"
                    class="icon_clickable"
                    x-small
                >
                  <v-icon
                      color='#1C195B'
                  >
                    mdi-information-outline
                  </v-icon>
                </v-btn>


              </span>
                        <span v-else>{{item.value}}</span>
                      </template>
                      <template
                          v-for="value in Object.keys(industries_aggregated)"
                          v-slot:[`item.${value}`]="{ item }"
                      >

                        <template v-if="getTreatmentEfficiencyColor(item, value) != null">
                          <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                              <v-chip
                                  :color="getTreatmentEfficiencyColor(item, value)[0]"
                                  dark
                                  :key="value"
                                  v-bind="attrs"
                                  v-on="on"
                                  text-color="#1c1c1b"
                              >
                                {{ item[value] }}
                              </v-chip>
                            </template>
                            <span>{{ getTreatmentEfficiencyColor(item, value)[1] }}</span>
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
                  <div v-else-if="active_indicator[0] == 10">
                    <v-data-table
                        :headers="treatment_efficiency_influent_table.header"
                        :items="treatment_efficiency_influent_table.value"
                        disable-pagination
                        :hide-default-footer="true"
                        dense
                        class="expanded_table_hover"

                    >

                      <template v-slot:item.value="{ item }">
              <span v-if="item.info">
                {{item.value}}
                <v-btn
                    icon
                    @click="$data[item.info] = true"
                    class="icon_clickable"
                    x-small
                >
                  <v-icon
                      color='#1C195B'
                  >
                    mdi-information-outline
                  </v-icon>
                </v-btn>


              </span>
                        <span v-else>{{item.value}}</span>
                      </template>

                      <template
                          v-for="value in Object.keys(industries_aggregated)"
                          v-slot:[`item.${value}`]="{ item }"
                      >

                        <template v-if="getTreatmentEfficiencyInfluentColor(item, value) != null">
                          <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                              <v-chip
                                  :color="getTreatmentEfficiencyInfluentColor(item, value)[0]"
                                  dark
                                  :key="value"
                                  v-bind="attrs"
                                  v-on="on"
                                  text-color="#1c1c1b"
                              >
                                {{ item[value] }}
                              </v-chip>
                            </template>
                            <span>{{ getTreatmentEfficiencyInfluentColor(item, value)[1] }}</span>
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
                  <div v-else-if="active_indicator[0] == 11">
                    <v-data-table
                        :headers="treated_table.header"
                        :items="treated_table.value"
                        disable-pagination
                        :hide-default-footer="true"
                        dense
                        class="expanded_table_hover"

                    >

                      <template v-slot:item.value="{ item }">
              <span v-if="item.info">
                {{item.value}}
                <v-btn
                    icon
                    @click="$data[item.info] = true"
                    class="icon_clickable"
                    x-small
                >
                  <v-icon
                      color='#1C195B'
                  >
                    mdi-information-outline
                  </v-icon>
                </v-btn>


              </span>
                        <span v-else>{{item.value}}</span>
                      </template>

                    </v-data-table>

                  </div>
                  <div v-else-if="active_indicator[0] == 13">
                    <v-data-table
                        :headers="water_quantity.header"
                        :items="water_quantity.value"

                        disable-pagination
                        :hide-default-footer="true"
                        dense
                    >
                      <template v-slot:item.value="{ item }">
                        <!--<v-tooltip bottom max-width="700px" v-if="item.info">
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
                        <span v-else>{{item.value}}</span>-->
                        <span v-if="item.info">
                {{item.value}}
                <v-btn
                    icon
                    @click="$data[item.info] = true"
                    class="icon_clickable"
                    x-small
                >
                  <v-icon
                      color='#1C195B'
                  >
                    mdi-information-outline
                  </v-icon>
                </v-btn>



              </span>
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
                                  text-color="#1c1c1b"
                              >
                                {{ item[value] }}
                              </v-chip>
                            </template>
                            <span>{{ getAvailabilityColor(item, value)[1] }}</span>
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
                  <div v-else-if="active_indicator[0] == 14">
                    <v-data-table
                        :headers="freshwater_lever_for_action.header"
                        :items="freshwater_lever_for_action.value"
                        disable-pagination
                        :hide-default-footer="true"
                        dense
                        class="expanded_table_hover"

                    >

                      <template v-slot:item.value="{ item }">
              <span v-if="item.info">
                {{item.value}}
                <v-btn
                    icon
                    @click="$data[item.info] = true"
                    class="icon_clickable"
                    x-small
                >
                  <v-icon
                      color='#1C195B'
                  >
                    mdi-information-outline
                  </v-icon>
                </v-btn>


              </span>
                        <span v-else>{{item.value}}</span>
                      </template>

                    </v-data-table>

                  </div>
                  <div v-else-if="active_indicator[0] == 16">
                    <v-data-table
                        :headers="emissions_table.header"
                        :items="emissions_table.value"

                        :item-class="itemRowBold"
                        disable-pagination
                        :hide-default-footer="true"
                        dense
                    >
                      <template v-slot:item.value="{ item }">
              <span v-if="item.info">
                {{item.value}}
                <v-btn
                    icon
                    @click="$data[item.info] = true"
                    class="icon_clickable"
                    x-small
                >
                  <v-icon
                      color='#1C195B'
                  >
                    mdi-information-outline
                  </v-icon>
                </v-btn>


              </span>
                        <span v-else>{{item.value}}</span>
                      </template>

                      <template
                          v-for="value in Object.keys(industries_aggregated)"
                          v-slot:[`item.${value}`]="{ item }"
                      >

                        <template v-if="getGlobalWarming(item, value) != null">
                          <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                              <v-chip
                                  :color="getGlobalWarming(item, value)[0]"
                                  dark
                                  :key="value"
                                  v-bind="attrs"
                                  v-on="on"
                                  text-color="#1c1c1b"
                              >
                                {{ item[value] }}
                              </v-chip>
                            </template>
                            <span>{{ getGlobalWarming(item, value)[1] }}</span>
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
                  <div v-else-if="active_indicator[0] == 18">
                    <v-data-table
                        :headers="energy_use_table.header"
                        :items="energy_use_table.value"

                        :item-class="itemRowBold"
                        disable-pagination
                        :hide-default-footer="true"
                        dense
                    >
                      <template v-slot:item.value="{ item }">
              <span v-if="item.info">
                {{item.value}}
                <v-btn
                    icon
                    @click="$data[item.info] = true"
                    class="icon_clickable"
                    x-small
                >
                  <v-icon
                      color='#1C195B'
                  >
                    mdi-information-outline
                  </v-icon>
                </v-btn>


              </span>
                        <span v-else>{{item.value}}</span>
                      </template>


                    </v-data-table>
                  </div>
                  <div v-else-if="active_indicator[0] == 19">
                    <v-data-table
                        :headers="effluent_load_table.header"
                        :items="effluent_load_table.value"

                        :item-class="itemRowBold"
                        disable-pagination
                        :hide-default-footer="true"
                        dense
                    >
                      <template v-slot:item.value="{ item }">
              <span v-if="item.info">
                {{item.value}}
                <v-btn
                    icon
                    @click="$data[item.info] = true"
                    class="icon_clickable"
                    x-small
                >
                  <v-icon
                      color='#1C195B'
                  >
                    mdi-information-outline
                  </v-icon>
                </v-btn>


              </span>
                        <span v-else>{{item.value}}</span>
                      </template>


                    </v-data-table>
                  </div>

                </div>
              </v-scroll-y-transition>
            </v-col>
          </v-row>

        </div>

      </v-dialog>


    </div>

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
import risk_thereshold from "../risk_categories"
import * as Excel from "exceljs";
import VueKatex from 'vue-katex';
import 'katex/dist/katex.min.css';

Vue.use(VueKatex, {
});


export default {
  name: "Make_report",
  components: {
    RadarChart,
    BarChart,
    PDFJSViewer
  },
  data() {
    return {
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
      selected_layers: [Vue.prototype.$layers_description[1].children[0].children[3]], //layers included in the report (initially only streamflow)
      selected_layers_pdf: [], //layers included in the pdf report

      tab: undefined,
      main_tab: 0,
      layers_table: {header: [], value: []},
      water_quantity: {header: [], value: []},
      treated_table: {header: [], value: []},
      freshwater_lever_for_action: {header: [], value: []},

      treatment_efficiency_table: {header: [], value: []},
      treatment_efficiency_influent_table: {header: [], value: []},

      reporting_indicators: {header: [], value: []},
      ecotoxicity_table: {header: [], value: []},
      eqs_table: {header: [], value: []},
      delta_ecotox_table: {header: [], value: []},
      delta_eqs_table: {header: [], value: []},

      eutrophication_table:  {header: [], value: []},
      emissions_table: {header: [], value: []},
      energy_use_table: {header: [], value: []},
      effluent_load_table: {header: [], value: []},

      simple_report_table: {header: [], value: []},
      include_future: true,

      aggregation_level: "industry",
      aggregation_items: [{text: "Industry", value: "industry"}, {text: "Country", value: "country"}],

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
      treatment_efficiency_influent_chart: {
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
      imported_file_excel: null,
      dialog_quality_quantity: false,
      dialog_emissions: false,
      dialog_eutrophication: false,
      dialog_ecotox: false,
      dialog_efficiency: false,
      dialog_tu: false,
      dialog_eqs: false,
      dialog_delta_tu: false,
      dialog_delta_eqs: false,
      dialog_influent_efficiency: false,
      dialog_ecotoxicity_and_biodiversity: false,
      dialog_pollution: false,

      biodiversity_models: [],
      info_energy_used: false,

      info_dilution_factor: false,
      info_recycled_factor: false,
      info_treated_factor: false,
      info_water_stress: false,
      info_specific_consumption: false,
      info_electricity: false,
      info_fuel_engines: false,
      info_treatment: false,
      info_reuse: false,
      info_discharge: false,
      info_sludge_management: false,
      info_biogas: false,
      info_tn_eutrophication: false,
      info_cod_eutrophication: false,
      info_tp_eutrophication: false,
      info_tu_diclo: false,
      info_tu_cadmium: false,
      info_tu_hexaclorobenzene: false,
      info_tu_mercury: false,
      info_tu_lead: false,
      info_tu_nickel: false,
      info_tu_chloroalkanes: false,
      info_tu_hexaclorobutadiene: false,
      info_tu_nonylphenols: false,
      info_tu_tetrachloroethene: false,
      info_tu_trychloroethylene: false,
      info_delta_tu_diclo: false,
      info_delta_tu_cadmium: false,
      info_delta_tu_hexaclorobenzene: false,
      info_delta_tu_mercury: false,
      info_delta_tu_lead: false,
      info_delta_tu_nickel: false,
      info_delta_tu_chloroalkanes: false,
      info_delta_tu_hexaclorobutadiene: false,
      info_delta_tu_nonylphenols: false,
      info_delta_tu_tetrachloroethene: false,
      info_delta_tu_trychloroethylene: false,
      info_eqs_diclo: false,
      info_eqs_cadmium: false,
      info_eqs_hexaclorobenzene: false,
      info_eqs_mercury: false,
      info_eqs_lead: false,
      info_eqs_nickel: false,
      info_eqs_chloroalkanes: false,
      info_eqs_hexaclorobutadiene: false,
      info_eqs_nonylphenols: false,
      info_eqs_tetrachloroethene: false,
      info_eqs_trychloroethylene: false,
      info_delta_eqs_diclo: false,
      info_delta_eqs_cadmium: false,
      info_delta_eqs_hexaclorobenzene: false,
      info_delta_eqs_mercury: false,
      info_delta_eqs_lead: false,
      info_delta_eqs_nickel: false,
      info_delta_eqs_chloroalkanes: false,
      info_delta_eqs_hexaclorobutadiene: false,
      info_delta_eqs_nonylphenols: false,
      info_delta_eqs_tetrachloroethene: false,
      info_delta_eqs_trychloroethylene: false,

      info_efficiency_cod: false,
      info_efficiency_tn: false,
      info_efficiency_tp: false,
      info_efficiency_diclo: false,
      info_efficiency_cadmium: false,
      info_efficiency_hexaclorobenzene: false,
      info_efficiency_mercury: false,
      info_efficiency_lead: false,
      info_efficiency_nickel: false,
      info_efficiency_chloroalkanes: false,
      info_efficiency_hexaclorobutadiene: false,
      info_efficiency_nonylphenols: false,
      info_efficiency_tetrachloroethene: false,
      info_efficiency_trychloroethylene: false,
      info_efficiency_influent_cod: false,
      info_efficiency_influent_tn: false,
      info_efficiency_influent_tp: false,
      radio_layers: 2,
      radio_industry_edit: null,
      tab_pollutant: 0,
      dialog_biogas_stage: 0,
      industry_clicked: null,
      industry_info: false,
      active_indicator: [],
      open_indicator: [],

    }

  },
  watch: {

    open_indicator(value){
      let impact_index = [1, 12, 15] //Index in tree-view where main categories start
      let new_item = value[value.length-1]
      if(impact_index.includes(new_item)){
        if(value.length > 1){
          Vue.nextTick(async function () {
            value.splice(0, value[value.length-1], new_item) //Close all categories previously opened          })
          })
        }
      }
    },
    info_sludge_management: function(value){
      if(value){
        this.dialog_biogas_stage = 0
      }
    },
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
            if(this.is_industry_valid(industry)){
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
    industry_clicked: async function () {
      this.emissions_table = {header: [], value: []}
      this.energy_use_table = {header: [], value: []}
      this.effluent_load_table = {header: [], value: []}
      this.water_quantity = {header: [], value: []}
      this.treated_table = {header: [], value: []}
      this.freshwater_lever_for_action = {header: [], value: []}
      this.eutrophication_table = {header: [], value: []}
      this.ecotoxicity_table = {header: [], value: []}
      this.treatment_efficiency_table = {header: [], value: []}
      this.delta_ecotox_table = {header: [], value: []}
      this.eqs_table = {header: [], value: []}
      this.delta_eqs_table = {header: [], value: []}
      this.radio_industry_edit = null
      this.open_indicator.splice(0, this.open_indicator.length)
      this.treatment_efficiency_influent_table = {header: [], value: []}
      this.active_indicator.splice(0, this.active_indicator.length)

      this.emissions_table = this.generate_emissions_table()
      this.energy_use_table = this.generate_energy_use_table()
      this.effluent_load_table = this.generate_effluent_load_table()

      this.water_quantity = await this.generate_water_quality_table()
      this.treated_table = await this.generate_treated_table()
      this.freshwater_lever_for_action = await this.generate_freshwater_lever_for_action_table()

      this.eutrophication_table = this.generate_eutrophication_table()
      this.ecotoxicity_table = this.generate_ecotoxicity_table()
      this.reporting_indicators = await this.generate_reporting_indicators_table()
      this.treatment_efficiency_table = this.generate_treatment_efficiency_table()
      this.treatment_efficiency_influent_table = this.generate_treatment_efficiency_influent_table()

      //this.layers_table = await this.generate_layers_table()
      //this.simple_report_table = await this.generate_simple_report_table()

      this.eqs_table = this.generate_eqs_table()
      this.delta_eqs_table = await this.generate_delta_eqs_table()
      this.delta_ecotox_table = await this.generate_delta_ecotox_table()
    },
    selected_layers: async function () {
      let _this = this
      _this.layers_table = {header: [], value: []}
      _this.layers_table = await _this.generate_layers_table(_this.tab)

      /*Vue.nextTick(async function () {
        if(_this.selected_assessments.length > 0){
          _this.layers_table = {header: [], value: []}
          _this.layers_table = await _this.generate_layers_table()

        }
      })*/

    },
    tab: async function () {
      let _this = this
      this.layers_table = {header: [], value: []}

      Vue.nextTick(async function () {
        _this.emissions_table =_this.generate_emissions_table()
        _this.energy_use_table = _this.generate_energy_use_table()
        _this.effluent_load_table = _this.generate_effluent_load_table()

        _this.water_quantity = await _this.generate_water_quality_table()
        _this.treated_table = await _this.generate_treated_table()
        _this.freshwater_lever_for_action = await _this.generate_freshwater_lever_for_action_table()

        _this.eutrophication_table = _this.generate_eutrophication_table()
        _this.ecotoxicity_table = _this.generate_ecotoxicity_table()
        _this.reporting_indicators = await _this.generate_reporting_indicators_table()
        _this.treatment_efficiency_table = _this.generate_treatment_efficiency_table()
        _this.treatment_efficiency_influent_table = _this.generate_treatment_efficiency_influent_table()

        _this.simple_report_table = await _this.generate_simple_report_table()

        _this.eqs_table = _this.generate_eqs_table()
        _this.delta_eqs_table = await _this.generate_delta_eqs_table()
        _this.delta_ecotox_table = await _this.generate_delta_ecotox_table()
        _this.selected_layers.splice(0, _this.selected_layers.length, _this.layers[1].children[0].children[3])
        _this.radio_layers = 2
        _this.main_tab = 0

      })
    },
  },
  methods: {


    industry_and_supply_chain(){
      let industries = this.created_assessments[this.tab].industries.map(x => x.name)
      let sc = this.created_assessments[this.tab].industries.map(industry => {
        return industry.supply_chain.map(sc => {
          return sc.name+" (Supply chain of "+industry.name+")"
        })
      }).flat(2)
      return [...industries, ...sc]
    },

    indicator_risk_class: function(id){

      if(this.current_industry == null) return
      //risks
      let current_industry_name = Object.keys(this.current_industry)[0]
      let industry = this.simple_report_table.value.filter(industry => industry.value == current_industry_name)[0]
      if(industry == null || industry == undefined) return
      //let ghg_impact = this.risk_categories["global_warming"](industry["carbon_impact"])

      let ghg_impact = this.risk_categories["global_warming"](industry["carbon_impact"])
      let freshwater_impact = this.risk_categories["pollution"](industry["freshwater_impact"])
      let pollution_impact = this.risk_categories["pollution"](industry["pollution_impact"])
      let eutrophication_impact = null
      if(this.eutrophication_table.value[0] != undefined) eutrophication_impact = this.risk_categories["eutrophication"](this.eutrophication_table.value[0][current_industry_name])
      let delta_ecotox_impact = null
      if(this.delta_ecotox_table.value[0] != undefined) delta_ecotox_impact = this.risk_categories["delta_ecotoxicity"](this.delta_ecotox_table.value[0][current_industry_name])
      let delta_eqs_impact = null
      if(this.delta_eqs_table.value.length > 0){
        let delta_eqs_values = this.delta_eqs_table.value.map(x => x[current_industry_name])
        delta_eqs_impact = this.risk_categories["delta_eqs"](delta_eqs_values.sum() / delta_eqs_values.length)
      }
      let ecotox_impact = null
      if(this.ecotoxicity_table.value[0] != undefined) ecotox_impact = this.risk_categories["ecotoxicity"](this.ecotoxicity_table.value[0][current_industry_name])
      let eqs_impact = null
      if(this.eqs_table.value.length > 0){
        let eqs_values = this.eqs_table.value.map(x => x[current_industry_name])
        eqs_impact = this.risk_categories["eqs"](eqs_values.sum() / eqs_values.length)
      }
      /*
      let pollution_load_to_environment_risk = [null, null]
      pollution_load_to_environment_risk[1] = this.return_avg_risk([eutrophication_impact, delta_eqs_impact, delta_ecotox_impact])
      let toxicity_load_risk = [null, null]
      toxicity_load_risk[1] = this.return_avg_risk([delta_eqs_impact, delta_ecotox_impact])
      let effluent_toxicity_risk = [null, null]
      effluent_toxicity_risk[1] = this.return_avg_risk([eqs_impact, ecotox_impact])*/


      let return_color_class = function(value){
        if(value == null) return null

        if(value[1] == "Low impact"){
          return 'low'
        }else if(value[1] == "Medium impact"){
          return "medium"
        }else if(value[1] == "High impact"){
          return "high"
        }else if(value[1] == "Very high impact"){
          return "very_high"
        }
        return null

      }

      let id_risk = [1,2,3,4,5,6,7,12,13,15,16]
      if(id_risk.includes(id.id)){
        if(id.id < 3) {
          return return_color_class(pollution_impact)
        }else if(id.id == 3){
          return return_color_class(delta_ecotox_impact)
        }else if(id.id == 4){
          return return_color_class(delta_eqs_impact)
        } else if(id.id == 5){
          return return_color_class(eutrophication_impact)
        } else if(id.id == 6){
          return return_color_class(ecotox_impact)
        }else if(id.id == 7){
          return return_color_class(eqs_impact)
        } else if(id.id <= 13) {
          return return_color_class(freshwater_impact)
        } else {
          return return_color_class(ghg_impact)
        }
      }
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

    click_tab(tab_clicked){
      if(this.tab === tab_clicked) return
      this.emissions_table = {header: [], value: []}
      this.energy_use_table = {header: [], value: []}
      this.effluent_load_table = {header: [], value: []}
      this.water_quantity = {header: [], value: []}
      this.treated_table = {header: [], value: []}
      this.freshwater_lever_for_action = {header: [], value: []}
      this.eutrophication_table = {header: [], value: []}
      this.ecotoxicity_table = {header: [], value: []}
      this.reporting_indicators = {header: [], value: []}
      this.treatment_efficiency_table = {header: [], value: []}
      this.layers_table = {header: [], value: []}
      this.simple_report_table = {header: [], value: []}
      this.delta_ecotox_table = {header: [], value: []}
      this.eqs_table = {header: [], value: []}
      this.delta_eqs_table = {header: [], value: []}
      this.radio_industry_edit = null
      this.treatment_efficiency_influent_table = {header: [], value: []}

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
    is_industry_valid(industry){
      if(industry.volume_withdrawn!=null && industry.product_produced!=null && industry.has_onsite_wwtp!=null && industry.has_offsite_wwtp!=null && industry.has_direct_discharge!=null && industry.industry_type!=null){
        let arr = [true]
        if(industry.has_onsite_wwtp == 1) {
          let wwtp = industry.onsite_wwtp
          arr.push(wwtp.wwt_vol_trea!=null && wwtp.wwt_vol_disc!=null)
        }
        if(industry.has_direct_discharge == 1) {
          let dd = industry.direct_discharge
          arr.push(dd.dd_vol_disc!=null)
        }
        if(industry.has_offsite_wwtp == 1) {
          let wwtp = industry.offsite_wwtp
          arr.push(wwtp.wwt_vol_trea!=null)
        }
        return !arr.includes(false)
      }
      return false

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

      this.industry_clicked = this.industries_aggregated[item.value]
      this.industry_info = true



    },


    get_color(color){
      return color == null ? null : color[0]
    },

    industries_deleted(){ //An industry or assessment has been deleted, if it's the current one return to map

      let _this = this
      this.layers_table = {header: [], value: []}

      Vue.nextTick(async function () {
        _this.emissions_table =_this.generate_emissions_table()
        _this.energy_use_table = _this.generate_energy_use_table()
        _this.effluent_load_table = _this.generate_effluent_load_table()

        _this.water_quantity = await _this.generate_water_quality_table()
        _this.treated_table = await _this.generate_treated_table()
        _this.freshwater_lever_for_action = await _this.generate_freshwater_lever_for_action_table()

        _this.eutrophication_table = _this.generate_eutrophication_table()
        _this.ecotoxicity_table = _this.generate_ecotoxicity_table()
        _this.reporting_indicators = await _this.generate_reporting_indicators_table()
        _this.treatment_efficiency_table = _this.generate_treatment_efficiency_table()
        _this.treatment_efficiency_influent_table = _this.generate_treatment_efficiency_influent_table()

        _this.simple_report_table = await _this.generate_simple_report_table()

        _this.eqs_table = _this.generate_eqs_table()
        _this.delta_eqs_table = await _this.generate_delta_eqs_table()
        _this.delta_ecotox_table = await _this.generate_delta_ecotox_table()
        _this.selected_layers.splice(0, _this.selected_layers.length, _this.layers[1].children[0].children[3])
        _this.radio_layers = 2
        _this.main_tab = 0
        let firstIndexValid = _this.assessments_with_industries.findIndex(assessment => assessment.disabled == false)
        _this.tab = firstIndexValid >= 0 ? firstIndexValid : undefined

      })



    },

    getAvailabilityColor (item, value) {
      if (item.value == this.table_title.availability_quantity.dilution_factor){
        return this.risk_categories["dilution_factor"](item[value])
      } else if (item.value == this.table_title.availability_quantity.recycled){
        return this.risk_categories["recycled_water_factor"](item[value])
      }else if (item.value == this.table_title.availability_quantity.treated){
        return this.risk_categories["water_treated"](item[value])
      }else if (item.value == this.table_title.availability_quantity.consumption_available){
        return this.risk_categories["water_stress_ratio"](item[value])
      }else if(item.value == this.table_title.availability_quantity.specific_water_consumption){
        return this.risk_categories["specific_water_consumption"](item[value])
      }
      return null
    },

    getEutrophicationColor(item, value) {
      return this.risk_categories["eutrophication"](item[value])
    },

    getDeltaEcotoxColor(item, value) {
      /*if (item.value == this.table_title.pollutants.total){
        return this.risk_categories["delta_ecotoxicity"](item[value] / 11)
      } else {
        return this.risk_categories["delta_ecotoxicity"](item[value])
      }*/
      return this.risk_categories["delta_ecotoxicity"](item[value])
    },

    getDelta(item, value) {
      return this.risk_categories["delta"](item[value])
    },

    getEQSColor(item, value) {
      return this.risk_categories["eqs"](item[value])
    },
    getGlobalWarming(item, value) {
      return this.risk_categories["global_warming"](item[value])
    },

    getEcotoxicity(item, value){
      return this.risk_categories["ecotoxicity"](item[value])
    },

    getDeltaEQSColor(item, value) {
      return this.risk_categories["delta_eqs"](item[value])
    },

    getTreatmentEfficiencyColor(item, value) {
      return this.risk_categories["treatment_efficiency"](item[value])
    },
    getTreatmentEfficiencyInfluentColor(item, value) {
      return this.risk_categories["influent_treatment_efficiency"](item[value])
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


      if(_this.industry_clicked !== null){

        let emission_table = {
          header: [{text: "Emissions", value: "value", sortable: false}],
          value: []
        }

        let total = {value: _this.table_title.global_warming_potential.total, unit: "kgCO2eq/day"}
        let elec = {value: _this.table_title.global_warming_potential.elec, unit: "kgCO2eq/day", info:"info_electricity"}
        let fuel = {value: _this.table_title.global_warming_potential.fuel, unit: "kgCO2eq/day", info:"info_fuel_engines"}
        let tre = {value: _this.table_title.global_warming_potential.treatment, unit: "kgCO2eq/day", info:"info_treatment"}
        let biog = {value: _this.table_title.global_warming_potential.biogas, unit: "kgCO2eq/day", info: "info_biogas"}
        let slu = {value: _this.table_title.global_warming_potential.sludge, unit: "kgCO2eq/day", info: "info_sludge_management"}
        let reus = {value: _this.table_title.global_warming_potential.reuse, unit: "kgCO2eq/day", info:"info_reuse"}
        let disc = {value: _this.table_title.global_warming_potential.discharged, unit: "kgCO2eq/day", info:"info_discharge"}


        const data_chart = {
          labels: [],
          datasets: [{
            data: [],
            backgroundColor: []
          }]
        };
        for (const [key, industries] of Object.entries(_this.current_industry)) {

          emission_table.header.push({
            text: key, value: key,
          })
          let emissions = metrics.emissions_and_descriptions(industries, 1)

          total[key] = emissions["total"]
          elec[key] = emissions["elec"]
          fuel[key] = emissions["fuel"]
          tre[key] = emissions["treatment"]
          biog[key] = emissions["biog"]
          slu[key] = emissions["slu"]
          reus[key] = emissions["reuse"]
          disc[key] = emissions["disc"]


          data_chart.datasets[0].data.push(emissions["total"])
          data_chart.labels.push(key)
          data_chart.datasets[0].backgroundColor.push(this.chooseColor(key))
        }

        emission_table.header.push({text: "Unit", value: "unit", sortable: false,})
        emission_table.value.push(total)
        emission_table.value.push(elec)
        emission_table.value.push(fuel)
        emission_table.value.push(tre)
        emission_table.value.push(biog)
        emission_table.value.push(slu)
        emission_table.value.push(reus)
        emission_table.value.push(disc)

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
      return {header: [], value: []}

    },

    generate_energy_use_table() {

      let _this = this

      if(_this.industry_clicked !== null){

        let pollutants_table = {
          header: [{text: "", value: "value", sortable: false}],
          value: []
        }

        let energy = {value: "Energy used per day", unit: "kWh/day", info: "info_energy_used"}

        for (const [key, industries] of Object.entries(_this.current_industry)) {

          pollutants_table.header.push({
            text: key, value: key,
          })

          energy[key] = metrics.energy_used(industries)
        }

        pollutants_table.header.push({text: "Unit", value: "unit", sortable: false,})

        pollutants_table.value.push(energy)
        return pollutants_table
      }
      else return {header: [], value: []}

    },

    generate_effluent_load_table() {

      let _this = this

      if(_this.industry_clicked != null){

        let pollutants_table = {
          header: [{text: "", value: "value", sortable: false}],
          value: []
        }

        let tn = {value: _this.table_title.pollutants.tn, unit: "gTN/m3", }
        let tp = {value: _this.table_title.pollutants.tp, unit: "gTP/m3", }
        let cod = {value: _this.table_title.pollutants.cod, unit: "gCOD/m3", }

        for (const [key, industries] of Object.entries(_this.current_industry)) {

          pollutants_table.header.push({
            text: key, value: key,
          })

          let load = metrics.effluent_concentration(industries)
          tn[key] = load.tn
          cod[key] = load.cod
          tp[key] = load.tp
        }

        pollutants_table.header.push({text: "Unit", value: "unit", sortable: false,})

        pollutants_table.value.push(cod)
        pollutants_table.value.push(tn)
        pollutants_table.value.push(tp)
        return pollutants_table
      }
      else return {header: [], value: []}

    },


    generate_eutrophication_table() {

      let _this = this

      if(_this.industry_clicked !== null){

        let pollutants_table = {
          header: [{text: "", value: "value", sortable: false}],
          value: []
        }

        let tn = {value: _this.table_title.pollutants.tn, unit: "gPO4eq/m3", info: "info_tn_eutrophication"}
        let tp = {value: _this.table_title.pollutants.tp, unit: "gPO4eq/m3", info: "info_tp_eutrophication"}
        let total = {value: _this.table_title.pollutants.total, unit: "gPO4eq/m3"}
        let cod = {value: _this.table_title.pollutants.cod, unit: "gPO4eq/m3", info: "info_cod_eutrophication"}


        const data_chart = {
          labels: [],
          datasets: [{
            data: [],
            backgroundColor: []
          }]
        };

        for (const [key, industries] of Object.entries(_this.current_industry)) {

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

        pollutants_table.value.push(total)
        pollutants_table.value.push(cod)
        pollutants_table.value.push(tn)
        pollutants_table.value.push(tp)

        return pollutants_table
      }
      else return {header: [], emissions: []}

    },

    generate_ecotoxicity_table() {

      let _this = this


      if(_this.industry_clicked !== null){

        let pollutants_table = {
          header: [{text: "", value: "value", sortable: false}],
          value: []
        }

        let dichloroethane = {value: _this.table_title.pollutants.diclo, unit: "TU/day", info:"info_tu_diclo"}
        let cadmium = {value: _this.table_title.pollutants.cadmium, unit: "TU/day", info:"info_tu_cadmium"}
        let hexachlorobenzene = {value: _this.table_title.pollutants.hexaclorobenzene, unit: "TU/day", info:"info_tu_hexaclorobenzene"}
        let mercury = {value: _this.table_title.pollutants.mercury, unit: "TU/day", info:"info_tu_mercury"}
        let lead = {value: _this.table_title.pollutants.lead, unit: "TU/day", info:"info_tu_lead"}
        let nickel = {value: _this.table_title.pollutants.nickel, unit: "TU/day", info:"info_tu_nickel"}
        let chloroalkanes = {value: _this.table_title.pollutants.chloroalkanes, unit: "TU/day", info:"info_tu_chloroalkanes"}
        let hexaclorobutadie = {value: _this.table_title.pollutants.hexaclorobutadie, unit: "TU/day", info:"info_tu_hexaclorobutadiene"}
        let nonylphenols = {value: _this.table_title.pollutants.nonylphenols, unit: "TU/day", info:"info_tu_nonylphenols"}
        let tetrachloroethene = {value: _this.table_title.pollutants.tetrachloroethene, unit: "TU/day", info:"info_tu_tetrachloroethene"}
        let trichloroethylene = {value: _this.table_title.pollutants.tricloroetile, unit: "TU/day", info:"info_tu_trychloroethylene"}
        let total = {value: _this.table_title.pollutants.total, unit: "TU/day"}

        const data_chart = {
          labels: [],
          datasets: [{
            data: [],
            backgroundColor: []
          }]
        };

        for (const [key, industries] of Object.entries(_this.current_industry)) {

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

        pollutants_table.value.push(total)
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

    async generate_delta_eqs_table() {

      let _this = this


      if(_this.industry_clicked !== null){


        let pollutants_table = {
          header: [{text: "", value: "value", sortable: false}],
          value: []
        }

        let dichloroethane = {value: _this.table_title.pollutants.diclo, unit: "-", info: "info_delta_eqs_diclo"}
        let cadmium = {value: _this.table_title.pollutants.cadmium, unit: "-", info: "info_delta_eqs_cadmium"}
        let hexachlorobenzene = {value: _this.table_title.pollutants.hexaclorobenzene, unit: "-", info: "info_delta_eqs_hexaclorobenzene"}
        let mercury = {value: _this.table_title.pollutants.mercury, unit: "-", info: "info_delta_eqs_mercury"}
        let lead = {value: _this.table_title.pollutants.lead, unit: "-", info: "info_delta_eqs_lead"}
        let nickel = {value: _this.table_title.pollutants.nickel, unit: "-", info: "info_delta_eqs_nickel"}
        let chloroalkanes = {value: _this.table_title.pollutants.chloroalkanes, unit: "-", info: "info_delta_eqs_chloroalkanes"}
        let hexaclorobutadie = {value: _this.table_title.pollutants.hexaclorobutadie, unit: "-", info: "info_delta_eqs_hexaclorobutadiene"}
        let nonylphenols = {value: _this.table_title.pollutants.nonylphenols, unit: "-", info: "info_delta_eqs_nonylphenols"}
        let tetrachloroethene = {value: _this.table_title.pollutants.tetrachloroethene, unit: "-", info: "info_delta_eqs_tetrachloroethene"}
        let trichloroethylene = {value: _this.table_title.pollutants.tricloroetile, unit: "-", info: "info_delta_eqs_trychloroethylene"}


        for (const [key, industries] of Object.entries(_this.current_industry)) {

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

      if(_this.industry_clicked !== null){

        let pollutants_table = {
          header: [{text: "", value: "value", sortable: false}],
          value: []
        }

        let dichloroethane = {value: _this.table_title.pollutants.diclo, unit: "TU/day", info:"info_delta_tu_diclo"}
        let cadmium = {value: _this.table_title.pollutants.cadmium, unit: "TU/day", info:"info_delta_tu_cadmium"}
        let hexachlorobenzene = {value: _this.table_title.pollutants.hexaclorobenzene, unit: "TU/day", info:"info_delta_tu_hexaclorobenzene"}
        let mercury = {value: _this.table_title.pollutants.mercury, unit: "TU/day", info:"info_delta_tu_mercury"}
        let lead = {value: _this.table_title.pollutants.lead, unit: "TU/day", info:"info_delta_tu_lead"}
        let nickel = {value: _this.table_title.pollutants.nickel, unit: "TU/day", info:"info_delta_tu_nickel"}
        let chloroalkanes = {value: _this.table_title.pollutants.chloroalkanes, unit: "TU/day", info:"info_delta_tu_chloroalkanes"}
        let hexaclorobutadie = {value: _this.table_title.pollutants.hexaclorobutadie, unit: "TU/day", info:"info_delta_tu_hexaclorobutadiene"}
        let nonylphenols = {value: _this.table_title.pollutants.nonylphenols, unit: "TU/day", info:"info_delta_tu_nonylphenols"}
        let tetrachloroethene = {value: _this.table_title.pollutants.tetrachloroethene, unit: "TU/day", info:"info_delta_tu_tetrachloroethene"}
        let trichloroethylene = {value: _this.table_title.pollutants.tricloroetile, unit: "TU/day", info:"info_delta_tu_trychloroethylene"}
        let total = {value: _this.table_title.pollutants.total, unit: "TU/day"}


        const data_chart = {
          labels: [],
          datasets: [{
            data: [],
            backgroundColor: []
          }]
        };

        for (const [key, industries] of Object.entries(_this.current_industry)) {

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

        pollutants_table.value.push(total)
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


    generate_eqs_table() {

      let _this = this


      if(_this.industry_clicked !== null){

        let pollutants_table = {
          header: [{text: "", value: "value", sortable: false}],
          value: []
        }

        let dichloroethane = {value: _this.table_title.pollutants.diclo, unit: "-", info: "info_eqs_diclo"}
        let cadmium = {value: _this.table_title.pollutants.cadmium, unit: "-", info: "info_eqs_cadmium"}
        let hexachlorobenzene = {value: _this.table_title.pollutants.hexaclorobenzene, unit: "-", info: "info_eqs_hexaclorobenzene"}
        let mercury = {value: _this.table_title.pollutants.mercury, unit: "-", info: "info_eqs_mercury"}
        let lead = {value: _this.table_title.pollutants.lead, unit: "-", info: "info_eqs_lead"}
        let nickel = {value: _this.table_title.pollutants.nickel, unit: "-", info: "info_eqs_nickel"}
        let chloroalkanes = {value: _this.table_title.pollutants.chloroalkanes, unit: "-", info: "info_eqs_chloroalkanes"}
        let hexaclorobutadie = {value: _this.table_title.pollutants.hexaclorobutadie, unit: "-", info: "info_eqs_hexaclorobutadiene"}
        let nonylphenols = {value: _this.table_title.pollutants.nonylphenols, unit: "-", info: "info_eqs_nonylphenols"}
        let tetrachloroethene = {value: _this.table_title.pollutants.tetrachloroethene, unit: "-", info: "info_eqs_tetrachloroethene"}
        let trichloroethylene = {value: _this.table_title.pollutants.tricloroetile, unit: "-", info: "info_eqs_trychloroethylene"}


        for (const [key, industries] of Object.entries(_this.current_industry)) {

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


      if(_this.tab !== undefined){

        let table = {
          header: [{text: "", value: "value", sortable: false}],
          value: []
        }

        let g4_en8 = {value: "Water withdrawal", unit: "m3/year", link_text: "(GRI 303-1)", link_to: "https://www.globalreporting.org/standards/media/1909/gri-303-water-and-effluents-2018.pdf"}
        let g4_en9 = {value: "Effect of water withdrawal on the water body", link_text: "(GRI 303-2)", link_to: "https://www.globalreporting.org/standards/media/1909/gri-303-water-and-effluents-2018.pdf", unit: "%", info: "If the value is greater than 5%, it means that the withdrawals significantly affect the water source"}
        let g4_en10 = {value: "Water recycled and reused", link_text: "(GRI 303-3)", link_to: "https://www.globalreporting.org/standards/media/1909/gri-303-water-and-effluents-2018.pdf", unit: "%"}
        let g4_en22 = {value: "Water discharge", link_text: "(GRI 306-1)", link_to: "https://www.globalreporting.org/standards/media/2573/gri-306-waste-2020.pdf", unit: "m3/year"}
        let g4_en26 = {value: "Effect of water discharges on the water body", link_text: "(GRI 306-5)", unit: "%", link_to: "https://www.globalreporting.org/standards/media/2573/gri-306-waste-2020.pdf", info: "If the value is greater than 5%, it means that the discharges significantly affect the water source"}

        let wd = {value: "Water withdrawn", link_text: "(CDP W1.2b)", unit: "ML/year", link_to: "https://guidance.cdp.net/en/guidance?cid=W1.2&ctype=ExternalRef&gettags=1+&idtype=RecordExternalRef&incchild=1&microsite=1&otype=questionnaire&page=1"}
        let dis = {value: "Water discharged", link_text: "(CDP W1.2b)", unit: "ML/year", link_to: "https://guidance.cdp.net/en/guidance?cid=W1.2&ctype=ExternalRef&gettags=1+&idtype=RecordExternalRef&incchild=1&microsite=1&otype=questionnaire&page=1"}
        let re = {value: "Water reused", link_text: "(CDP W1.2b)", unit: "ML/year", link_to: "https://guidance.cdp.net/en/guidance?cid=W1.2&ctype=ExternalRef&gettags=1+&idtype=RecordExternalRef&incchild=1&microsite=1&otype=questionnaire&page=1"}
        let highest_level_discharge = {value: "Highest level(s) to which you treat your discharge", link_text: "(CDP W1.2j)", unit: "-", link_to: "https://guidance.cdp.net/en/guidance?cid=W1.2&ctype=ExternalRef&gettags=1+&idtype=RecordExternalRef&incchild=1&microsite=1&otype=questionnaire&page=1"}

        for (const [key, industries] of Object.entries(_this.industries_aggregated)) {

          //aaaa
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
          re[key] = indicators["re"]
          highest_level_discharge[key] = indicators["highest_level_discharge"]

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
        table.value.push(highest_level_discharge)

        return table
      }
      else return {header: [], emissions: []}

    },


    async generate_simple_report_table_old() {

      let _this = this


      if(_this.tab !== undefined){

        let pollutants_table = {
          header: [{text: "", value: "value", sortable: false}],
          value: []
        }

        let quality_quantity = {value: _this.table_title.simple_table.quality_quantity, unit: "-"}
        let total_ghg = {value: _this.table_title.simple_table.total_ghg, unit: "kgCO2eq/day", info: "This metric indicates the CO2e emissions from the industry. It will always have positive values; higher values indicate higher impact."}
        let pollution = {value: _this.table_title.simple_table.pollution, unit: "-"}
        let recycled_factor = {value: _this.table_title.availability_quantity.recycled, unit: "%", info:"This metric indicates the percentage of the reused water used by the industry respect the water that leaves the industry"}
        let efficiency_factor = {value: _this.table_title.availability_quantity.specific_water_consumption, unit: "tonnes/m3", info: "Specific water consumption is a metric that indicates what is the amount of water from the water body needed to produce a tone of product manufactured in the industry"}
        let treated_factor = {value: _this.table_title.availability_quantity.treated, unit: "%", info:"This metric indicates the ratio between the water remaining after the industry consumption and the water that is treated in the WWTP"}
        let energy_used_row = {value: "Energy used", unit: "kWh/day", info: "Energy used by wastewater treatment plants to treat the water sent to the treatment plant"}


        /*
        let eutrophication = {value: _this.table_title.simple_table.eutrophication, unit: "gPO4eq/m3", info: "Eutrophication potential (EP) is defined as the potential to cause over-fertilization of water and soil, which can result in increased growth of biomass. It will always have positive values; higher values indicate higher impact."}
        let ecotox_effluent = {value: this.table_title.simple_table.tu, unit: "TU/day", info: " Toxic units (TU) are used in the field of toxicology to quantify the interactions of toxicants in mixtures of chemicals. A toxic unit for a given compound is based on the concentration at which there is a 50% effect (ex. EC50) for a certain biological endpoint."}
        let delta_ecotox = {value: this.table_title.simple_table.delta_tu, unit: "TU/day"}
        let eqs = {value: this.table_title.simple_table.eqs, unit: "-", info: "Index reflecting how large the load of each pollutant in the effluent is with respect to the EQS (Environmental Quality Standards). The larger it is, the worse."}
        let delta_eqs = {value: this.table_title.simple_table.delta_eqs, unit: "-"}
        let avg_treatment_efficiency = {value: _this.table_title.simple_table.avg_treatment_efficiency, unit: "%", info: "Removal rate of pollutants in WWTP's"}
        let avg_influent_efficiency = {value: _this.table_title.simple_table.avg_influent_efficiency, unit: "%", info: "If the value is less than 100, the industry discharges the water cleaner than when it was withdrawn."}
        */

        for (const [key, industries] of Object.entries(_this.industries_aggregated)) {
          pollutants_table.header.push({
            text: key, value: key,
          })

          let dilution_factor_value = await metrics.dilution_factor(this.global_layers, industries)
          let dilution_factor_risk = this.risk_categories["dilution_factor"](dilution_factor_value)

          recycled_factor[key] =  metrics.recycled_water_factor(industries)
          //let recycled_factor_risk = this.risk_categories["recycled_water_factor"](recycled_factor)

          let available_factor = await metrics.available_ratio(this.global_layers, industries)
          let available_factor_risk = this.risk_categories["water_stress_ratio"](available_factor)

          efficiency_factor[key] = metrics.efficiency_factor(industries)
          //let efficiency_factor_risk = this.risk_categories["specific_water_consumption"](efficiency_factor)

          //quality_quantity[key] = this.return_avg_risk([dilution_factor_risk, recycled_factor_risk, treated_factor_risk, available_factor_risk, efficiency_factor_risk])
          quality_quantity[key] = this.return_avg_risk([dilution_factor_risk, available_factor_risk])

          total_ghg[key] = metrics.emissions_and_descriptions(industries, 1).total
          energy_used_row[key] = metrics.energy_used(industries)

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

          let avg_treatment_efficiency_factor  = metrics.avg_treatment_efficiency(industries)
          let avg_treatment_efficiency_risk = this.risk_categories["treatment_efficiency"](avg_treatment_efficiency_factor)

          let avg_influent_efficiency_factor  = metrics.avg_influent_efficiency(industries)
          let avg_influent_efficiency_risk = this.risk_categories["influent_treatment_efficiency"](avg_influent_efficiency_factor)

          pollution[key] = this.return_avg_risk([eutrophication_risk, ecotox_effluent_risk, delta_ecotox_risk, eqs_risk, delta_eqs_risk, avg_treatment_efficiency_risk, avg_influent_efficiency_risk])
          treated_factor[key] = metrics.treated_water_factor(industries)


        }


        pollutants_table.header.push({text: "Unit", value: "unit", sortable: false,})
        pollutants_table.value.push(quality_quantity)
        pollutants_table.value.push(recycled_factor)
        pollutants_table.value.push(efficiency_factor)
        pollutants_table.value.push(total_ghg)
        pollutants_table.value.push(energy_used_row)
        pollutants_table.value.push(pollution)
        pollutants_table.value.push(treated_factor)


        /*pollutants_table.value.push(eutrophication)
        pollutants_table.value.push(ecotox_effluent)
        pollutants_table.value.push(delta_ecotox)
        pollutants_table.value.push(eqs)
        pollutants_table.value.push(delta_eqs)
        pollutants_table.value.push(avg_treatment_efficiency)
        pollutants_table.value.push(avg_influent_efficiency)*/

        return pollutants_table
      }
      else return {header: [], emissions: []}

    },

    async generate_simple_report_table() {

      let _this = this

      if(_this.tab !== undefined){

        let pollutants_table = {
          header: [{text: "", value: "value", sortable: false}, {text: "Pollution impact", value: "pollution_impact", sortable: false}, {text: "Freshwater impact", value: "freshwater_impact", sortable: false}, {text: "GHG emissions from Wastewater", value: "carbon_impact", sortable: false}],
          value: []
        }

        //let quality_quantity = {value: _this.table_title.simple_table.quality_quantity, unit: "-"}
        //let total_ghg = {value: _this.table_title.simple_table.total_ghg, unit: "kgCO2eq/day", info: "This metric indicates the CO2e emissions from the industry. It will always have positive values; higher values indicate higher impact."}
        //let pollution = {value: _this.table_title.simple_table.pollution, unit: "-"}


        for (const [key, industries] of Object.entries(_this.industries_aggregated)) {

          let industry_row = {value: key}

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
          pollutants_table.value.push(industry_row)
        }


        return pollutants_table
      }
      else return {header: [], emissions: []}

    },


    async generate_water_quality_table() {

      let _this = this


      if(_this.industry_clicked != null){

        let pollutants_table = {
          header: [{text: "", value: "value", sortable: false}],
          value: []
        }

        let dilution_factor_row = {value: _this.table_title.availability_quantity.dilution_factor, unit: "-", info: "info_dilution_factor"}
        let treated_factor = {value: _this.table_title.availability_quantity.treated, unit: "%", info:"info_treated_factor"}
        let available_ratio = {value: _this.table_title.availability_quantity.consumption_available, unit: "%", info: "info_water_stress"}
        let recycled_factor = {value: _this.table_title.availability_quantity.recycled, unit: "%", info:"info_recycled_factor"}
        let efficiency_factor = {value: _this.table_title.availability_quantity.specific_water_consumption, unit: "tonnes/m3", info: "info_specific_consumption"}
        //let water_quality_standards = {value: "Environmental quality standards", unit: "%", info: "Percentage of emitted pollutants exceeding the maximum allowable concentration"}


        let data_chart = {
          labels: ["Recycled water factor", "Treated water factor", "Consumption available ratio"],
          datasets: []
        };

        for (const [key, industries] of Object.entries(_this.current_industry)) {
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
        //pollutants_table.value.push(recycled_factor)
        //pollutants_table.value.push(treated_factor)
        pollutants_table.value.push(available_ratio)
        //pollutants_table.value.push(efficiency_factor)
        //pollutants_table.value.push(water_quality_standards)


        return pollutants_table
      }
      else return {header: [], emissions: []}

    },
    async generate_freshwater_lever_for_action_table() {

      let _this = this

      if(_this.industry_clicked != null){

        let pollutants_table = {
          header: [{text: "", value: "value", sortable: false}],
          value: []
        }

        let recycled_factor = {value: _this.table_title.availability_quantity.recycled, unit: "%", info:"info_recycled_factor"}
        let efficiency_factor = {value: _this.table_title.availability_quantity.specific_water_consumption, unit: "tonnes/m3", info: "info_specific_consumption"}


        let data_chart = {
          labels: ["Recycled water factor", "Treated water factor", "Consumption available ratio"],
          datasets: []
        };

        for (const [key, industries] of Object.entries(_this.current_industry)) {
          pollutants_table.header.push({
            text: key, value: key,
          })


          recycled_factor[key] = metrics.recycled_water_factor(industries)
          efficiency_factor[key] = metrics.efficiency_factor(industries)

        }




        pollutants_table.header.push({text: "Unit", value: "unit", sortable: false,})

        pollutants_table.value.push(recycled_factor)
        pollutants_table.value.push(efficiency_factor)

        return pollutants_table
      }
      else return {header: [], emissions: []}

    },

    async generate_treated_table() {

      let _this = this


      if(_this.industry_clicked != null){

        let pollutants_table = {
          header: [{text: "", value: "value", sortable: false}],
          value: []
        }

        let treated_factor = {value: _this.table_title.availability_quantity.treated, unit: "%", info:"info_treated_factor"}


        for (const [key, industries] of Object.entries(_this.current_industry)) {
          pollutants_table.header.push({
            text: key, value: key,
          })

          treated_factor[key] = metrics.treated_water_factor(industries)

        }



        pollutants_table.header.push({text: "Unit", value: "unit", sortable: false,})

        pollutants_table.value.push(treated_factor)

        return pollutants_table
      }
      else return {header: [], emissions: []}

    },


    generate_treatment_efficiency_table() {

      let _this = this

      if(_this.industry_clicked !== null){

        let pollutants_table = {
          header: [{text: "", value: "value", sortable: false}],
          value: []
        }


        let tn = {value: "TN treatment efficiency", unit: "%", info: "info_efficiency_tn"}
        let tp = {value: "TP treatment efficiency", unit: "%", info: "info_efficiency_tp"}
        let dichloroethane = {value: "1,2-Dichloroethane treatment efficiency", unit: "%", info: "info_efficiency_diclo"}
        let cadmium = {value: "Cadmium treatment efficiency", unit: "%", info: "info_efficiency_hexaclorobenzene"}
        let hexachlorobenzene = {value: "Hexachlorobenzene treatment efficiency", unit: "%", info: "info_efficiency_hexaclorobenzene"}
        let mercury = {value: "Mercury treatment efficiency", unit: "%", info: "info_efficiency_mercury"}
        let lead = {value: "Lead treatment efficiency", unit: "%", info: "info_efficiency_lead"}
        let nickel = {value: "Nickel treatment efficiency", unit: "%", info: "info_efficiency_nickel"}
        let chloroalkanes = {value: "Chloroalkanes treatment efficiency", unit: "%", info: "info_efficiency_chloroalkanes"}
        let hexaclorobutadie = {value: "Hexachlorobutadiene treatment efficiency", unit: "%", info: "info_efficiency_hexaclorobutadiene"}
        let nonylphenols = {value: "Nonylphenols treatment efficiency", unit: "%", info: "info_efficiency_nonylphenols"}
        let tetrachloroethene = {value: "Tetrachloroethene treatment efficiency", unit: "%", info: "info_efficiency_tetrachloroethene"}
        let trichloroethylene = {value: "Trichloroethylene treatment efficiency", unit: "%", info: "info_efficiency_trychloroethylene"}
        let cod = {value: "COD treatment efficiency", unit: "%", info: "info_efficiency_cod"}


        let data_chart = {
          labels: ["COD", "TN", "TP", "1,2-Dichloroethane", "Cadmium", "Hexachlorobenzene", "Mercury", "Lead", "Nickel", "Chloroalkanes", "Hexachlorobutadiene", "Nonylphenols", "Tetrachloroethene", "Trichloroethylene"],
          datasets: []
        };


        for (const [key, industries] of Object.entries(_this.current_industry)) {
          pollutants_table.header.push({
            text: key, value: key,
          })

          tn[key] = metrics.tn_efficiency(industries)
          tp[key] = metrics.tp_efficiency(industries)
          cod[key] = metrics.cod_efficiency(industries)
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

            data: [cod[key], tn[key], tp[key], dichloroethane[key], cadmium[key], hexachlorobenzene[key], mercury[key], lead[key], nickel[key], chloroalkanes[key], hexaclorobutadie[key], nonylphenols[key], tetrachloroethene[key], trichloroethylene[key]],
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

          }
        }

        _this.treatment_efficiency_chart = {
          chartData: data_chart,
          options: options
        }

        pollutants_table.header.push({text: "Unit", value: "unit", sortable: false,})


        pollutants_table.value.push(cod)
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

    generate_treatment_efficiency_influent_table() {

      let _this = this


      if(_this.industry_clicked !== null){


        let pollutants_table = {
          header: [{text: "", value: "value", sortable: false}],
          value: []
        }

        let tn = {value: "TN treatment efficiency", unit: "%", info: "info_efficiency_influent_tn"}
        let tp = {value: "TP treatment efficiency", unit: "%", info: "info_efficiency_influent_tp"}
        let cod = {value: "COD treatment efficiency", unit: "%", info: "info_efficiency_influent_cod"}


        let data_chart = {
          labels: ["COD", "TN", "TP"],
          datasets: []
        };


        for (const [key, industries] of Object.entries(_this.current_industry)) {
          pollutants_table.header.push({
            text: key, value: key,
          })

          let eff = metrics.amount_water_influent_cleaned(industries)

          tn[key] = eff.tn
          tp[key] = eff.tp
          cod[key] = eff.cod


          data_chart.datasets.push({

            data: [cod[key], tn[key], tp[key]],
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

          }
        }

        _this.treatment_efficiency_influent_chart = {
          chartData: data_chart,
          options: options
        }

        pollutants_table.header.push({text: "Unit", value: "unit", sortable: false,})


        pollutants_table.value.push(cod)
        pollutants_table.value.push(tn)
        pollutants_table.value.push(tp)

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
        let industries_and_supply_chain = []

        this.created_assessments[_this.tab].industries.forEach(industry => {

          if(_this.is_industry_valid(industry)){

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
      category.locked = (_this.radio_layers === 2)
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
      const ctx = document.getElementById('chart');
      let chart = new Chart(ctx, {
        type: "bar",
        data: data_chart,
        options: options
      });

      dd.content.push(industriesEmission)
      dd.content.push("\n")
      this.risk_categories.legend_impact_pdf(dd)
      dd.content.push("\n\n")


      dd.content.push({
        image: chart.toBase64Image(),
        fit: [450, 450]
      })

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
      let chart = new Chart(ctx, {
        type: "radar",
        data: data_chart,
        options: options
      });

      dd.content.push(industriesIndicator)
      dd.content.push("\n")
      this.risk_categories.legend_impact_pdf(dd)
      dd.content.push("\n\n")
      dd.content.push({
        image: chart.toBase64Image(),
        fit: [450, 450]
      })

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
      let chart = new Chart(ctx, {
        type: "bar",
        data: data_chart,
        options: options
      });

      dd.content.push(industriesEutrophication)
      dd.content.push("\n")
      _this.risk_categories.legend_impact_pdf(dd)
      dd.content.push("\n\n")
      dd.content.push({
        image: chart.toBase64Image(),
        fit: [450, 450]
      })

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
      let chart = new Chart(ctx, {
        type: "bar",
        data: data_chart,
        options: options
      });

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
      dd.content.push({
        image: chart.toBase64Image(),
        fit: [450, 450]
      })

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
      let chart = new Chart(ctx, {
        type: "radar",
        data: data_chart,
        options: options
      });

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
      dd.content.push({
        image: chart.toBase64Image(),
        fit: [450, 450]
      })

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
      let chart = new Chart(ctx, {
        type: "radar",
        data: data_chart,
        options: options
      });

      dd.content.push(industriesEfficiency)
      dd.content.push("\n\n")

      dd.content.push({
        image: chart.toBase64Image(),
        fit: [450, 450]
      })

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
                  {text: 'Page ' + pageCount, alignment: 'left'}
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
            sc.table.body.push([x.name, x.location.lat.toFixed(3), x.location.lng.toFixed(3)])
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
    if(indexFirstValid >= 0) this.tab = indexFirstValid
  },

  computed: {

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
            disabled: !assessment.industries.map(industry => {return _this.is_industry_valid(industry)}).includes(true)
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
          if(_this.is_industry_valid(industry))
          industries[industry.name] = [industry]
        })
        return industries
      }
    },

    current_industry(){
      if(this.industry_clicked != null || this.industry_clicked.length == 0) {
        let obj = {}
        obj[this.industry_clicked[0].name] = [this.industry_clicked[0]]
        return obj
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

          if(_this.is_industry_valid(industry)){
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
        return _this.is_industry_valid(industry.industry)
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
}

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
  overflow-y:scroll !important;
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

.no_scroll{
  overflow-y: hidden !important;
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




</style>