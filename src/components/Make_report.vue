<template>
  <div style="height: 100%;" class="outer">

    <div v-if="is_there_any_industry_created" style="height: 100%;">

      <div v-if="assessment_id != null && (this.assessments_with_industries[this.assessment_id] == undefined || this.assessments_with_industries[this.assessment_id].disabled)" style="height: 100%;">
        <p class="side_menu_title">Please create an industry first and fill in the required data to see statistics of the current assessment.</p>
      </div>

      <div v-else>
        <div>
          <v-row>
            <v-col cols="9">
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

                                <br>
                                <b>Source: Aqueduct</b>

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

                            <template v-slot:item.warning="{ item }">
                              <v-tooltip left v-if="item.warning != ''" max-width="500">
                                <template v-slot:activator="{ on, attrs }">
                                  <v-icon
                                      small
                                      class="mr-2"
                                      v-bind="attrs"
                                      v-on="on"
                                      color="#b62373"
                                  >
                                    {{ item.warning }}
                                  </v-icon>

                                </template>
                                <span><b>Warning</b>: The industry has some mandatory entries that are not configured, and the impact estimation may not be completely accurate. </span>

                              </v-tooltip>
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
                  <div style="width: 100%; margin-left: 10px">
                    <div>
                      <div class="side_menu_title">
                        Linking to ESG reporting frameworks
                      </div>
                    </div>
                    <div style="padding: 20px 50px 20px 0px">

                    <span class="instructions_2" style="color: #b62373">
                      Select ESG reporting frameworks. More frameworks and responses will be added soon!
                    </span>
                      <v-sheet>
                        <v-chip-group
                            v-model = "selected_esg_frameworks"
                            multiple
                            column
                        >
                          <v-chip filter style =  "margin-right: 20px">CDP</v-chip>
                          <v-chip filter style =  "margin-right: 20px">GRI</v-chip>
                        </v-chip-group>
                      </v-sheet>

                    </div>
                    <details v-if="selected_esg_frameworks.includes(0)">
                      <summary >
                        <span class="cdp_key">W1.2</span>
                        <span class="cdp_description">Across all your operations, what proportion of the following water aspects are regularly measured and monitored?</span>
                      </summary>
                      <div v-if="selected_esg_frameworks.includes(0)" style="padding: 10px 0px 20px 40px">
                        <details v-for="key in ['1_2_b', '1_2_d', '1_2_h', '1_2_i', '1_2_j']">
                          <summary >
                            <span class="cdp_key_2">{{external_indicators["cdp"][key]["key"]}}</span>
                            <span class="cdp_description_2">{{external_indicators["cdp"][key]["text"]}}</span>
                          </summary>
                          <v-data-table
                              :headers="external_indicators_table.cdp['_'+key].header"
                              :items="external_indicators_table.cdp['_'+key].value"
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

                            <template v-for="header in external_indicators_table.cdp['_'+key].header" v-slot:[`header.${header.value}`]="{ header }">
                            <span v-if="exists_in_dict(external_indicators, ['cdp', key, 'description', 'header', header.value])" >

                              {{header.text}}
                              <v-tooltip bottom max-width="700px">
                                <template v-slot:activator="{ on, attrs }">
                                  <v-icon
                                      small
                                      v-bind="attrs"
                                      v-on="on"
                                  >mdi-information-outline</v-icon>
                                </template>
                                <span>
                                  {{ external_indicators.cdp[key]['description']['header'][header.value] }}
                                </span>
                              </v-tooltip>

                            </span>
                              <span v-else>
                              {{header.text}}
                            </span>
                            </template>

                            <template v-if="get_slot_cdp(key) != undefined" v-slot:[`item.${get_slot_cdp(key)}`]="{ item }">

                            <span v-if="exists_in_dict(external_indicators, ['cdp', key, 'description', 'body', item[get_slot_cdp(key)]])" >

                              {{item[get_slot_cdp(key)]}}
                              <v-tooltip bottom max-width="700px">
                                <template v-slot:activator="{ on, attrs }">
                                  <v-icon
                                      small
                                      v-bind="attrs"
                                      v-on="on"
                                  >mdi-information-outline</v-icon>
                                </template>
                                <span>
                                  {{ external_indicators.cdp[key]['description']['body'][item[get_slot_cdp(key)]] }}
                                </span>
                              </v-tooltip>

                            </span>
                              <span v-else>
                              {{item[get_slot_cdp(key)]}}
                            </span>

                            </template>

                          </v-data-table>
                        </details>
                      </div>

                    </details>
                    <details v-if="selected_esg_frameworks.includes(0)" v-for="key in ['2_1_a', '5_1']">
                      <summary >
                        <span class="cdp_key">{{external_indicators["cdp"][key]["key"]}}</span>
                        <span class="cdp_description">{{external_indicators["cdp"][key]["text"]}}</span>
                      </summary>
                      <v-data-table
                          :headers="external_indicators_table.cdp['_'+key].header"
                          :items="external_indicators_table.cdp['_'+key].value"
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

                        <template v-for="header in external_indicators_table.cdp['_'+key].header" v-slot:[`header.${header.value}`]="{ header }">
                            <span v-if="exists_in_dict(external_indicators, ['cdp', key, 'description', 'header', header.value])" >

                              {{header.text}}
                              <v-tooltip bottom max-width="700px">
                                <template v-slot:activator="{ on, attrs }">
                                  <v-icon
                                      small
                                      v-bind="attrs"
                                      v-on="on"
                                  >mdi-information-outline</v-icon>
                                </template>
                                <span>
                                  {{ external_indicators.cdp[key]['description']['header'][header.value] }}
                                </span>
                              </v-tooltip>

                            </span>
                          <span v-else>
                              {{header.text}}
                            </span>
                        </template>

                        <template v-if="get_slot_cdp(key) != undefined" v-slot:[`item.${get_slot_cdp(key)}`]="{ item }">

                            <span v-if="exists_in_dict(external_indicators, ['cdp', key, 'description', 'body', item[get_slot_cdp(key)]])" >

                              {{item[get_slot_cdp(key)]}}
                              <v-tooltip bottom max-width="700px">
                                <template v-slot:activator="{ on, attrs }">
                                  <v-icon
                                      small
                                      v-bind="attrs"
                                      v-on="on"
                                  >mdi-information-outline</v-icon>
                                </template>
                                <span>
                                  {{ external_indicators.cdp[key]['description']['body'][item[get_slot_cdp(key)]] }}
                                </span>
                              </v-tooltip>

                            </span>
                          <span v-else>
                              {{item[get_slot_cdp(key)]}}
                            </span>

                        </template>


                      </v-data-table>
                    </details>
                    <details v-if="selected_esg_frameworks.includes(1)">
                      <summary >
                        <span class="cdp_key">[Disclosure 303-3]</span>
                        <span class="cdp_description">Water withdrawal</span>
                      </summary>
                      <div v-if="selected_esg_frameworks.includes(1)" style="padding: 10px 0px 20px 40px">
                        <details v-if="selected_esg_frameworks.includes(1)" v-for="key in ['303_3', 'clause_2_2_1']">
                          <summary >
                            <span class="cdp_key_2">{{external_indicators["gri"][key]["key"]}}</span>
                            <span class="cdp_description_2">{{external_indicators["gri"][key]["text"]}}</span>

                          </summary>
                          <v-data-table
                              :headers="external_indicators_table.gri['_'+key].header"
                              :items="external_indicators_table.gri['_'+key].value"
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
                    </details>
                    <details v-if="selected_esg_frameworks.includes(1)" v-for="key in ['303_4']">
                      <summary >
                        <span class="cdp_key">{{external_indicators["gri"][key]["key"]}}</span>
                        <span class="cdp_description">{{external_indicators["gri"][key]["text"]}}</span>

                      </summary>
                      <v-data-table
                          :headers="external_indicators_table.gri['_'+key_2].header"
                          :items="external_indicators_table.gri['_'+key_2].value"
                          disable-pagination
                          :hide-default-footer="true"
                          dense
                          style="padding: 20px 20px 20px 20px"
                          v-for="key_2 in ['303_4', '303_4_2']"

                      >

                        <template v-slot:no-data>
                          <v-progress-linear
                              indeterminate
                              color="#1C195B"
                          ></v-progress-linear>
                        </template>

                        <template v-for="header in external_indicators_table.gri['_'+key_2].header" v-slot:[`header.${header.value}`]="{ header }">
                            <span v-if="exists_in_dict(external_indicators, ['gri', key_2, 'description', 'header', header.value])" >

                              {{header.text}}
                              <v-tooltip bottom max-width="700px">
                                <template v-slot:activator="{ on, attrs }">
                                  <v-icon
                                      small
                                      v-bind="attrs"
                                      v-on="on"
                                  >mdi-information-outline</v-icon>
                                </template>
                                <span>
                                  {{ external_indicators.gri[key_2]['description']['header'][header.value] }}
                                </span>
                              </v-tooltip>

                            </span>
                          <span v-else>
                              {{header.text}}
                            </span>
                        </template>
                        <template v-if="get_slot_gri(key_2) != undefined" v-slot:[`item.${get_slot_gri(key_2)}`]="{ item }">

                            <span v-if="exists_in_dict(external_indicators, ['gri', key_2, 'description', 'body', item[get_slot_gri(key_2)]])" >

                              {{item[get_slot_gri(key_2)]}}
                              <v-tooltip bottom max-width="700px">
                                <template v-slot:activator="{ on, attrs }">
                                  <v-icon
                                      small
                                      v-bind="attrs"
                                      v-on="on"
                                  >mdi-information-outline</v-icon>
                                </template>
                                <span>
                                  {{ external_indicators.gri[key_2]['description']['body'][item[get_slot_gri(key_2)]] }}
                                </span>
                              </v-tooltip>

                            </span>
                          <span v-else>
                              {{item[get_slot_gri(key_2)]}}
                            </span>

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
          <!--
          CHARTS ARE RENDERED HERE FOR PDF GENERATION, BUT HIDEN FROM THE USER
          -->
          <div style="position: absolute; left: -999em">
            <canvas id="chart"></canvas>
          </div>

        </div>
      </div>



    </div>

    <div v-else>
      <p class="side_menu_title">Please create an industry first and fill in the required data to generate a report.</p>
    </div>

  </div>

</template>

<script>

import Vuetify from "vuetify";

let _ = require('lodash');
import pdfMake from 'pdfmake/build/pdfmake.min'
import Vue from "vue";
Vue.use(Vuetify)
import {utils, metrics} from "../utils"
import standard_industrial_classification from "../standard_industrial_classification"
import external_indicators from "../external_indicators"

import colors from "../colors"
import risk_thereshold from "..//risk_categories"
import {industry_impact_legend_category} from "@/industry_impact_legend_category";
import Chart from 'chart.js/auto'
import ChartJSPluginDatalabels from "chartjs-plugin-datalabels";

Chart.register(ChartJSPluginDatalabels)

export default {
  name: "Make_report",
  props: {
    assessment_id:{
      type: Number,
      default: null,
    }
  },
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
      external_indicators_table: {
        cdp: {
          _1_2_b: {header: [], value: []},
          _1_2_d: {header: [], value: []},
          _1_2_h: {header: [], value: []},
          _1_2_i: {header: [], value: []},
          _1_2_j: {header: [], value: []},
          _2_1_a: {header: [], value: []},
          _5_1: {header: [], value: []},
        },
        gri: {
          _303_3: {header: [], value: []},
          _clause_2_2_1: {header: [], value: []},
          _303_4: {header: [], value: []},
          _303_4_2: {header: [], value: []},

        }
      },
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
      selected_esg_frameworks: [0, 1],
      chart: null

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
      this.external_indicators_table.cdp._5_1 = {header: [], value: []}
      this.external_indicators_table.cdp._1_2_b = {header: [], value: []}
      this.external_indicators_table.cdp._1_2_d = {header: [], value: []}
      this.external_indicators_table.cdp._1_2_h = {header: [], value: []}
      this.external_indicators_table.cdp._1_2_i = {header: [], value: []}
      this.external_indicators_table.cdp._2_1_a = {header: [], value: []}
      this.external_indicators_table.gri._303_3 = {header: [], value: []}
      this.external_indicators_table.gri._clause_2_2_1 = {header: [], value: []}
      this.external_indicators_table.gri._303_4 = {header: [], value: []}


      Vue.nextTick(async function () {
        _this.simple_report_table = await _this.generate_simple_report_table()
        _this.selected_layers.splice(0, _this.selected_layers.length)
        _this.radio_layers = null
        _this.main_tab = 0
        _this.external_indicators_table.cdp._5_1 = await _this.generate_cdp_5_1_table()
        _this.external_indicators_table.cdp._1_2_b = await _this.generate_cdp_1_2_b_table()
        _this.external_indicators_table.cdp._1_2_d = await _this.generate_cdp_1_2_d_table()
        _this.external_indicators_table.cdp._1_2_h = _this.generate_cdp_1_2_h_table()
        _this.external_indicators_table.cdp._1_2_i = _this.generate_cdp_1_2_i_table()
        _this.external_indicators_table.cdp._1_2_j = _this.generate_cdp_1_2_j_table()
        _this.external_indicators_table.cdp._2_1_a = await _this.generate_cdp_2_1_a_table()
        _this.external_indicators_table.gri._303_3 = await _this.generate_gri_303_3_table()
        _this.external_indicators_table.gri._clause_2_2_1 = await _this.generate_gri_clause_2_2_1_table()
        _this.external_indicators_table.gri._303_4 = await _this.generate_gri_303_4_table()
      })

      this.selected_layers_pdf = [...this.layers[2].children[0].children, //water quality indicators
          ...this.layers[1].children[0].children[0].children, //water variability indicators
          ...this.layers[1].children[2].children, //water scarcity ratios
          ...this.layers[1].children[3].children, //groundwater indicators
          ...this.layers[1].children[5].children, //drought risk indicators
          this.layers[1].children[0].children[3], //streamflow

      ]
    },
  },
  methods: {


    get_slot_cdp(key){
      try {
        return this.external_indicators_table["cdp"]['_'+key].header[0].value
      } catch (error) {
        return undefined
      }
    },

    get_slot_gri(key){
      try {
        return this.external_indicators_table["gri"]['_'+key].header[0].value
      } catch (error) {
        return undefined
      }
    },

    exists_in_dict(keys, value){
      return utils.exists_in_dict(keys, value)
    },

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
          withdrawals: indicators["wd"],
          discharges: indicators["dis"],
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

    async generate_cdp_1_2_d_table() {
      let assessment = this.assessments_with_industries[this.tab]

      let header = [
        { text: 'Withdrawals are from areas with water stress', value: 'withdrawals_in_water_stress' },
        { text: '% withdrawn from areas with water stress', value: 'percentage' },
        { text: 'Identification tool', value: 'identification' },
      ]

      let value = []

      let indicators = await metrics.cdp_1_2_d_indicators(assessment.assessment.industries, this.global_layers)

      value.push({
        withdrawals_in_water_stress: indicators.withdrawals_in_water_stress,
        percentage: indicators.water_stress,
        identification: indicators.identification_tool
      })


      return {
        header, value
      }

    },

    generate_cdp_1_2_h_table() {
      let assessment = this.assessments_with_industries[this.tab]

      let header = [
        { text: 'Source', value: 'source' },
        { text: 'Volume (megaliters/year)', value: 'volume'},
      ]

      let value = []

      let indicators = metrics.cdp_1_2_h_indicators(assessment.assessment.industries)

      value.push({
        source: "Fresh surface water, including rainwater, water from wetlands, rivers and lakes",
        volume: indicators.surface,
      })

      value.push({
        source: "Groundwater",
        volume: indicators.groundwater,
      })

      return {
        header, value
      }

    },

    generate_cdp_1_2_i_table() {
      let assessment = this.assessments_with_industries[this.tab]

      let header = [
        { text: 'Destination', value: 'destination' },
        { text: 'Volume (megaliters/year)', value: 'volume'},
      ]

      let value = []

      let indicators = metrics.cdp_1_2_i_indicators(assessment.assessment.industries)

      value.push({
        destination: "Fresh surface water",
        volume: indicators.surface,
      })
      value.push({
        destination: "Third party destinations",
        volume: indicators.third_party,
      })

      return {
        header, value
      }

    },

    generate_cdp_1_2_j_table() {
      let assessment = this.assessments_with_industries[this.tab]

      let header = [
        { text: 'Highest level of treatment within direct operations', value: 'highest' },
        { text: 'Volume (megaliters/year)', value: 'volume'},
        { text: '% of your sites/facilities/operations this volume applies to ', value: 'percentage'},
      ]

      let value = []
      let reporting_metrics = metrics.cdp_1_2_j_indicators(assessment.assessment.industries)

      value.push({
        highest: "Tertiary treatment",
        volume: reporting_metrics.tertiary.volume,
        percentage: reporting_metrics.tertiary.sites,
      })
      value.push({
        highest: "Secondary treatment",
        volume: reporting_metrics.secondary.volume,
        percentage: reporting_metrics.secondary.sites,
      })
      value.push({
        highest: "Primary treatment only",
        volume: reporting_metrics.primary.volume,
        percentage: reporting_metrics.primary.sites,
      })
      value.push({
        highest: "Discharge to the natural environment without treatment",
        volume: reporting_metrics.direct_discharge.volume,
        percentage: reporting_metrics.direct_discharge.sites,
      })
      value.push({
        highest: "Discharge to a third party without treatment",
        volume: reporting_metrics.third_party.volume,
        percentage: reporting_metrics.third_party.sites,
      })

      return {
        header, value
      }

    },

    async generate_cdp_2_1_a_table() {
      let assessment = this.assessments_with_industries[this.tab]

      let header = [
        { text: 'Country/Area', value: 'country' },
        { text: 'River basin', value: 'basin'},
        { text: 'Type of impact driver', value: 'type'},
        { text: 'Primary impact driver ', value: 'primary'},
      ]

      let value = await metrics.cdp_2_1_a_indicators(assessment.assessment.industries, this.global_layers)


      return {
        header, value
      }

    },

    async generate_gri_303_3_table() {
      let assessment = this.assessments_with_industries[this.tab]

      let header = [
        { text: 'Water withdrawal by source', value: 'text' },
        { text: 'All areas (ML/yr)', value: 'all'},
        { text: 'Areas with water stress (ML/yr)', value: 'water_stress'},
      ]

      let value = await metrics.gri_303_3(assessment.assessment.industries, this.global_layers)


      return {
        header, value
      }

    },

    async generate_gri_clause_2_2_1_table() {
      let assessment = this.assessments_with_industries[this.tab]

      let header = [
        {text: "Facilities in areas with water stress", value: "water_type"},

      ]
      for(let industry of assessment.assessment.industries) {
        let ws = await utils.water_stress([industry], this.global_layers)
        if(ws >= 40){
          header.push({text: industry.name + " (ML/yr)", value: industry.name})
        }
      }
      let value = await metrics.gri_clause_2_2_1(assessment.assessment.industries, this.global_layers)
      return {
        header, value
      }

    },


    async generate_gri_303_4_table() {
      let assessment = this.assessments_with_industries[this.tab]

      let header = [
        { text: 'Water discharge by destination', value: 'text' },
        { text: 'All areas (ML/yr)', value: 'all'},
        { text: 'Areas with water stress (ML/yr)', value: 'water_stress'},
      ]
      let value = await metrics.gri_303_4(assessment.assessment.industries, this.global_layers)


      let header_2 = [
        { text: 'Water discharge by level of treatment', value: 'highest' },
        { text: 'All areas (ML/yr)', value: 'volume'},
      ]
      let value_2 = []
      let reporting_metrics = metrics.gri_303_4_2(assessment.assessment.industries)

      value_2.push({
        highest: "Tertiary treatment",
        volume: reporting_metrics.tertiary.volume,
        percentage: reporting_metrics.tertiary.sites,
      })
      value_2.push({
        highest: "Secondary treatment",
        volume: reporting_metrics.secondary.volume,
        percentage: reporting_metrics.secondary.sites,
      })
      value_2.push({
        highest: "Primary treatment only",
        volume: reporting_metrics.primary.volume,
        percentage: reporting_metrics.primary.sites,
      })
      value_2.push({
        highest: "Discharge to the natural environment without treatment",
        volume: reporting_metrics.direct_discharge.volume,
        percentage: reporting_metrics.direct_discharge.sites,
      })
      value_2.push({
        highest: "Discharge to a third party without treatment",
        volume: reporting_metrics.third_party.volume,
        percentage: reporting_metrics.third_party.sites,
      })

      this.external_indicators_table.gri._303_4_2.header = header_2
      this.external_indicators_table.gri._303_4_2.value = value_2


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


    get_impact(color){
      return color == null ? null : color[1]
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
          _this.cdp_1_2_d = await _this.generate_cdp_1_2_d_table()
          _this.cdp_1_2_h = _this.generate_cdp_1_2_h_table()
          _this.cdp_1_2_i = _this.generate_cdp_1_2_i_table()
          _this.cdp_1_2_j = _this.generate_cdp_1_2_j_table()
          _this.cdp_2_1_a = await _this.generate_cdp_2_1_a_table()
          _this.gri_303_3 = await _this.generate_gri_303_3_table()
          _this.gri_clause_2_2_1 = await _this.generate_gri_clause_2_2_1_table()

          _this.gri_303_4 = await _this.generate_gri_303_4_table()

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
      }/*else if (equals(item.layer, "Peak RepRisk Country ESG Risk Index")){
        return this.risk_categories.reprisk(item[value])
      }*/else if (equals(item.layer, "Unimproved/No Sanitation")){
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
      }/*else if (equals(layer, "Peak RepRisk Country ESG Risk Index")){
        ret = this.risk_categories.reprisk(value)
      }*/else if (equals(layer, "Unimproved/No Sanitation")){
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


    async generate_simple_report_table() {

      let _this = this

      if(_this.tab !== undefined){

        let pollutants_table = {
          header: [{text: "Name", value: "value", sortable: false}, {text: "Country", value: "country", sortable: false}, {text: "Number of suppliers", value: "supply_chain_number", sortable: true}, {text: "Impact of industrial wastewater on water quality", value: "pollution_impact", sortable: false}, {text: "Impact of industrial wastewater on water availability", value: "freshwater_impact", sortable: false}, {text: "GHG emissions from wastewater treatment", value: "carbon_impact", sortable: true}, {text: "Overall water risk", value: "owr", sortable: true}, {text: "", value: "warning", sortable: false}],
          value: []
        }

        for (let industry of this.created_assessments[this.tab].industries) {

          let industry_row = await utils.summary_industry(industry, this.global_layers)
          industry_row["warning"] = utils.industry_has_all_inputs(industry) ? '' : 'mdi-alert'
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

    async layers_table_pdf(dd, industry){

      let selected_layers_formatted = this.selected_layers_pdf.map(function (layer) {
        return [layer.name, layer.layer, layer.belongs_to]
      })



      if (selected_layers_formatted.length > 0) { //Layer values on industry

        dd.content.push({
          text: "Context layers\n\n",
          style: 'indicator_title',
          color: "#b62373"
        })

        //groupby context type (popupulation, water quality and water quantity)
        const groupedByfield = _.groupBy(selected_layers_formatted, function(n) {
          return n[2];  //field belongs_to
        });


        for (let [context_type, layers] of Object.entries(groupedByfield)) {
          dd.content.push({
            text: context_type+"\n\n",
            style: 'subsubheader',
          })

          let layers_to_include_in_report = [] //Layers to include in report (even the future)
          for (let [layer_name, info, belongs_to] of layers) {
            layers_to_include_in_report.push([layer_name, info.layers.baseline.annual.layer])
            if (info.future && this.include_future){
              layers_to_include_in_report.push([layer_name+" (BAU 2030)", info.layers.future.layer])
            }
          }

          let layers_chunked = this.chunk(layers_to_include_in_report, 5)
          for(let chunk of layers_chunked){

            let layers_description = {
              table: {
                headerRows: 1,
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

              let row = [supply_chain.name + " (Supplier)"]
              for (let [layer_name, layer] of chunk) {
                let baseline_data = await layer["data_for_report"](lat, lng)
                row.push({text: baseline_data, fillColor: this.getGISLayerColorPDF(layer_name, baseline_data)})

              }
              layers_description.table.body.push(row)
            }

            dd.content.push(layers_description)

            dd.content.push("\n")
            this.risk_categories.legend_risk_pdf(dd)
            dd.content.push("\n\n")


          }

        }



      }

    },


    async assessment_summary(dd, assessment) {

      let _this = this
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
          headerRows: 1,
          body: [
            [
              {text:'Name', style: "bold"},
              {text:'Country', style: "bold"},
              {text:'Number of suppliers', style: "bold"},
              {text:"Impact of industrial wastewater on water quality", style: "bold"},
              {text:"Impact of industrial wastewater on water availability", style: "bold"},
              {text:"GHG emissions from wastewater treatment", style: "bold"},
              {text:"Overall water risk", style: "bold"}
            ]
          ]
        }
      }


      for(let industry_obj of assessment.industries) {
        let industry = await utils.summary_industry(industry_obj, this.global_layers)

        let pollution_impact = _this.getSimpleReportColor(industry, "pollution_impact")
        let freshwater_impact = _this.getSimpleReportColor(industry, "freshwater_impact")
        let carbon_impact = _this.getSimpleReportColor(industry, "carbon_impact")
        let owr_impact = _this.getSimpleReportColor(industry, "owr")

        let arr = [
          industry.value,
          industry.country,
          industry.supply_chain_number,
          {text: industry.pollution_impact, fillColor: _this.get_color(pollution_impact)},
          {text: industry.freshwater_impact, fillColor: _this.get_color(freshwater_impact)},
          {text: industry.carbon_impact, fillColor: _this.get_color(carbon_impact)},
          {text: industry.owr, fillColor: _this.get_color(owr_impact)},
        ]

        industriesSummary.table.body.push(arr)
      }

      dd.content.push(industriesSummary)
      dd.content.push("\n")
      this.risk_categories.legend_impact_pdf(dd)

      //say which of the industries has not all the data setted (if any)

      let industries_completed_bool = assessment.industries.map(industry => utils.industry_has_all_inputs(industry))


      //zip with original array and filter out the ones that are completed
      let industries_not_completed = assessment.industries.map((industry, index) => [industry, industries_completed_bool[index]]).filter(industry => !industry[1])
      let industries_not_completed_name = industries_not_completed.map(industry => industry[0].name)
      if (industries_not_completed.length > 0){
        dd.content.push("\n\n")
        dd.content.push({
          text: "The following industries have not all the mandatory data settled, and they results may not be accurate:\n\n",
          color: '#b62373',
          bold: true
        })
        dd.content.push({
          ul: industries_not_completed_name
        })
      }


      dd.content.push("\n\n")

    },

    async impact_summary(dd, groupedByAssessments) {

      dd.content.push({
        text: "Summary\n\n",
        style: 'header',
        color: '#b62373'

      })

      let industriesIndicator = {
        table: {
          headerRows: 1,
          body: [
            [
              {text:'Assessment', style: "bold"},
              {text:'Industry', style: "bold"},
              {text:'Impact',style: "bold"},
              {text:'Statistic',style: "bold"},
              {text:"Value",style: "bold"},
              {text:"Units",style: "bold"},
              {text:"Level of certainty",style: "bold"},
            ]
          ]
        }
      }

      let table_content = []

      for(const [assessment_name, industries] of Object.entries(groupedByAssessments)){
        let industries_aggregated = industries.map(industry => [industry.industry.name, [industry.industry]])

        //For each industry, calculate all the statistics on each impact, and add to the table only the ones with very high or high impact
        for (const [key, industries] of industries_aggregated) {
          let row = [key]
          let industry = industries[0]

          row.push({text: assessment_name})
          row.push({text: key})

          let delta_tu = await metrics.delta_tu(industries, this.global_layers, true)
          let delta_tu_filtered = this.filter_total_and_low_impact(industry, delta_tu, 'delta_ecotoxicity', 'Delta TU', 'delta_tu', true, 'TU/day')

          let delta_eqs = await metrics.delta_eqs(industries, this.global_layers, true)
          let delta_eqs_filtered = this.filter_total_and_low_impact(industry, delta_eqs, 'delta_eqs', 'Delta EQS', 'delta_eqs', true, '%')

          let eutrophication = metrics.eutrophication_potential(industries)
          let eutrophication_filtered = this.filter_total_and_low_impact(industry, eutrophication, 'eutrophication', 'Eutrophication potencial', 'eutrophication', true, 'gPO4eq/m3')

          let dilution_factor = await metrics.dilution_factor(this.global_layers, industries, true)
          let dilution_factor_filtered = this.filter_total_and_low_impact(industry, {'Dilution factor': dilution_factor}, 'dilution_factor', 'Dilution factor', 'dilution_factor', false, '-')

          let consumption_available = await metrics.available_ratio(this.global_layers, industries)
          let consumption_available_filtered = this.filter_total_and_low_impact(industry, {'Consumption available': consumption_available}, 'water_stress_ratio', 'Consumption available', 'available_ratio', false, '%')

          let consumption_available_different_watsershed = metrics.external_sources_from_other_watersheds(industries)
          let consumption_available_different_watsershed_filtered = this.filter_total_and_low_impact(industry, {'Consumptive use from different watersheds': consumption_available_different_watsershed}, 'external_sources_from_other_watersheds', 'Consumptive use from different watersheds', 'external_sources_from_other_watersheds', false, 'm3/day')

          let groundwater_withdrawals_in_high_groundwater_decline = await metrics.groundwater_withdrawals_in_high_groundwater_decline(industries, this.global_layers)
          let groundwater_withdrawals_in_high_groundwater_decline_filtered = this.filter_total_and_low_impact(industry, {'Groundwater withdrawals (only in areas with GW decline)': groundwater_withdrawals_in_high_groundwater_decline}, 'groundwater_withdrawals_in_high_groundwater_decline', 'Groundwater withdrawals (only in areas with GW decline)', 'groundwater_withdrawals_in_high_groundwater_decline', false, 'm3/day')

          let emissions = metrics.emissions_deglossed(industries)
          let emissions_filtered = this.filter_total_and_low_impact(industry, emissions, 'global_warming', 'GHG emissions', 'emissions_and_descriptions', false, 'kgCO2eq/day')


          let content = [...delta_tu_filtered, ...delta_eqs_filtered, ...eutrophication_filtered, ...dilution_factor_filtered,
            ...consumption_available_filtered, ...consumption_available_different_watsershed_filtered,
            ...groundwater_withdrawals_in_high_groundwater_decline_filtered, ...emissions_filtered
          ]

          let a = content.sort(function(x, y) {
            let color_sorting = {
              'yellow': 0,
              'orange': 1,
              'red': 2
            }
            let data_type_sorting = {
              'Insufficient data': 0,
              'Modeled': 1,
              'Estimated': 2,
              'User Data': 3
            }

            //Sort by impact on environment
            if (color_sorting[x.color] < color_sorting[y.color]) {
              return 1;
            } else if (color_sorting[x.color] > color_sorting[y.color]) {
              return -1;
            }else{
              //in case of same impact, sort by data type
              if (data_type_sorting[x.data_type] < data_type_sorting[y.data_type]) {
                return -1;
              } else if (data_type_sorting[x.data_type] > data_type_sorting[y.data_type]) {
                return 1;
              }else return 0
            }

          });

          table_content.push(
              ... a.map(x => {
                let color_data_type = utils.getDataTypeColor(x.data_type)
                return [
                  {text: assessment_name},
                  {text: key},
                  {text: x.impact},
                  {text: x.statistic},
                  {text: x.value, fillColor: x.color},
                  {text: x.units},
                  {text: x.data_type, fillColor: color_data_type != null ? color_data_type[0] : null}
                ]
              })
          )

        }
      }



      industriesIndicator.table.body.push(...table_content)
      dd.content.push(industriesIndicator)
      dd.content.push("\n")
      this.risk_categories.legend_high_impact_pdf(dd)
      dd.content.push("\n\n")


    },

    filter_total_and_low_impact(industry, impact, risk_category, title, data_type, needs_pollutant, units) {
      let impact_filtered = Object.entries(impact).filter(([key, value]) => {
        let impact_category = this.get_impact(this.risk_categories[risk_category](value))
        return key.toLowerCase() != "total" && (impact_category == 'High impact' || impact_category == 'Very high impact' || impact_category == 'Medium impact')
        //return key.toLowerCase() != "total"

      })

      let impact_filtered_completed = impact_filtered.map(([key, value]) => {
        return {
          impact: title,
          statistic: key,
          color: this.get_color(this.risk_categories[risk_category](value)),
          value: value,
          units: units,
          data_type: needs_pollutant ? utils.get_string_impact_legend(industry_impact_legend_category[data_type](industry, key)) : utils.get_string_impact_legend(industry_impact_legend_category[data_type](industry))
        }
      })

      return impact_filtered_completed
    },


    pie_chart_pdf(dd, labels, data){
      const data_chart = {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: labels.map(x => utils.chooseColor(x))
        }]
      }

      const ctx = document.getElementById('chart');

      if (this.chart) this.chart.destroy()

      this.chart = new Chart(ctx, {
        type: "pie",
        data: data_chart,
        options: {
          devicePixelRatio: 1.5,
          animation: false,
          plugins: {
            legend: {
              display: true,
              labels: {
                font: {
                  size: 10,
                  //size: 60
                }
              }

            },
            datalabels: {
              formatter: function (value) {
                if(value > 5) return value.toFixed(2).toString()+'%'
                else return ''
              },
              color: 'white',
              font: {
                size: 10,
                //size: 60
              }
            },
          },

        }
      });

      /*dd.content.push({
        image: this.chart.toBase64Image(),
        fit: [200, 200]
      })*/
      let image = {
        image: this.chart.toBase64Image(),
        fit: [200, 200]
      }

      return image
      //dd.content.push("\n\n")

    },

    bar_chart_pdf(dd, labels, data){
      const data_chart = {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: labels.map(x => utils.chooseColor(x))
        }]
      };

      const ctx = document.getElementById('chart');

      if (this.chart) this.chart.destroy()

      this.chart = new Chart(ctx, {
        type: "bar",
        data: data_chart,
        options: {
          devicePixelRatio: 1.5,

          animation: false,
          plugins: {
            legend: {
              display: false,
            },
            datalabels: {
              formatter: function (value, ctx) {
                if (value > 0) return value
                else return ''

              },
              font: {
                size: 7,
                //size: 60
              }

            },
          },
          scales: {
            y: {
              ticks: {
                beginAtZero:true,
                callback: function(value, index, values) {
                  return value + '%';
                },
                font: {
                  size: 7,
                  //size: 60
                }
              }
            },
            x: {
              ticks: {
                font: {
                  size: 7,
                  //size: 60
                }
              }
            },

          }

        }
      });

      return {
        image: this.chart.toBase64Image(),
        fit: [270, 300]
      }

    },

    //if is_bar == true --> adds bar chart, else add pie chart
    table_and_chart(dd, table, labels, data, is_bar, table_width, chart_width){
      let image = is_bar ? this.bar_chart_pdf(dd, labels, data) : this.pie_chart_pdf(dd, labels, data)
      dd.content.push(
          {
            alignment: 'justify',
            columns: [
              {
                table: table.table,
                width: table_width
              },{
                image: image.image,
                fit: image.fit,
                width: chart_width
              }


            ],
            columnGap: 30

          },
      )
      dd.content.push("\n")

      this.risk_categories.legend_impact_pdf(dd)

    },

    async delta_tu_pdf(dd, industry) {


      let _this = this

      dd.content.push({
        text: "Increase in toxic units in the receiving water body after discharge\n\n",
        style: 'subsubheader'
      })


      let delta_tu = await metrics.delta_tu([industry], _this.global_layers, true)

      let industriesEcotoxicity = {
        table: {
          headerRows: 1,
          body: [[{text: "Pollutant", style: 'bold'}, {text: "Value (TU/day)", style: 'bold'}, {text: "Level of certainty", style: 'bold'}]]
        }
      }


      let labels = []
      let data = []

      for (let [pollutant, value] of  Object.entries(delta_tu)){

        let level_of_certainty = ''
        let fill_color_level_of_certainty = null

        if (pollutant != 'total'){
          labels.push(pollutant)
          data.push(100 * value / delta_tu.total)
          level_of_certainty = utils.get_string_impact_legend(industry_impact_legend_category.delta_tu(industry, pollutant))
          fill_color_level_of_certainty = utils.getDataTypeColor(level_of_certainty)

        }else{
          pollutant = 'Total'
        }

        industriesEcotoxicity.table.body.push([{
          text: pollutant,
          style: 'bold'
        }, {
          text: value,
          fillColor: _this.get_color(this.risk_categories["delta_ecotoxicity"](value))
        }, {
          text: level_of_certainty, fillColor: fill_color_level_of_certainty != null ? fill_color_level_of_certainty[0] : null
        }])
      }


      this.table_and_chart(dd, industriesEcotoxicity, labels, data, false, 250, '*')

      dd.content.push("\n\n")


    },

    async delta_eqs_pdf(dd, industry) {

      let _this = this

      dd.content.push({
        text: "Increase of the concentration of the pollutants in the receiving water body after discharge (compared to the EQS)\n\n",
        style: 'subsubheader'
      })


      let delta_eqs = await metrics.delta_eqs([industry], _this.global_layers, true)


      let industriesEcotoxicity = {
        table: {
          headerRows: 1,
          body: [[{text: "Pollutant", style: 'bold'}, {text: "Value (%)", style: 'bold'}, {text: "Level of certainty", style: 'bold'}]]
        }
      }

      let labels = []
      let data = []

      for (let [pollutant, value] of  Object.entries(delta_eqs)){

        let level_of_certainty = utils.get_string_impact_legend(industry_impact_legend_category.delta_eqs(industry, pollutant))
        let fill_color_level_of_certainty = utils.getDataTypeColor(level_of_certainty)

        labels.push(pollutant)
        data.push(value)

        industriesEcotoxicity.table.body.push([{
          text: pollutant,
          style: 'bold'
        }, {
          text: value,
          fillColor: _this.get_color(this.risk_categories["delta_eqs"](value))
        },{
          text: level_of_certainty, fillColor: fill_color_level_of_certainty != null ? fill_color_level_of_certainty[0] : null
        }])
      }

      this.table_and_chart(dd, industriesEcotoxicity, labels, data, true, 200, '*')

      dd.content.push("\n\n")






    },

    eutrophication_pdf(dd, industry) {

      let _this = this

      dd.content.push({
        text: "Eutrophication Potential\n\n",
        style: 'subsubheader'
      })


      let labels =  []
      let data =  []

      let eutrophication = metrics.eutrophication_potential([industry])

      let industriesEutrophication = {
        table: {
          headerRows: 1,
          body: [[{text: "Pollutant", style: 'bold'}, {text: "Value (gPO4eq/day)", style: 'bold'}, {text: "Level of certainty", style: 'bold'}]]
        }
      }

      for (let [pollutant, value] of  Object.entries(eutrophication)){

        let level_of_certainty = ''
        let fill_color_level_of_certainty = null


        if (pollutant != 'total'){
          labels.push(pollutant)
          data.push(100 * value / eutrophication.total)
          level_of_certainty = utils.get_string_impact_legend(industry_impact_legend_category.eutrophication(industry, pollutant))
          fill_color_level_of_certainty = utils.getDataTypeColor(level_of_certainty)
        }else{
          pollutant = 'Total'
        }

        industriesEutrophication.table.body.push([{
          text: pollutant,
          style: 'bold'
        }, {
          text: value,
          fillColor: _this.get_color(this.risk_categories["eutrophication"](value))
        },{
          text: level_of_certainty, fillColor: fill_color_level_of_certainty != null ? fill_color_level_of_certainty[0] : null
        }])
      }

      this.table_and_chart(dd, industriesEutrophication, labels, data, false, 250, '*')

      dd.content.push("\n\n")




    },

    async delta_temperature_pdf(dd, industry) {

      let _this = this

      dd.content.push({
        text: "Increase in temperature in the receiving water body due to industry discharge\n\n",
        style: 'subsubheader'
      })


      let delta_temperature = await metrics.delta_temperature([industry], this.global_layers)

      let level_of_certainty = utils.get_string_impact_legend(industry_impact_legend_category.delta_temperature(industry))
      let fill_color_level_of_certainty = utils.getDataTypeColor(level_of_certainty)[0]

      //fillColor: utils.get_string_impact_legend(industry_impact_legend_category.delta_temperature(industry))
      let table = {
        table: {
          headerRows: 1,
          body: [
              [{text: "Increase in temperature (°C)", style: 'bold'}, {text: "Level of certainty", style: 'bold'}],
                  [{text: delta_temperature, fillColor: _this.get_color(this.risk_categories["delta_temperature"](delta_temperature))},
                    {text: level_of_certainty, fillColor: fill_color_level_of_certainty}]

          ]
        }
      }


      dd.content.push(table)
      dd.content.push("\n\n")



    },

    efficiency_pdf(dd, industry) {

      dd.content.push({
        text: "Percentage of treatment efficiency (compared to WWTP influent)\n\n",
        style: 'subsubheader'
      })

      let industriesInfluentEfficiency = {
        table: {
          headerRows: 1,
          body: [[{text: "Pollutant", style: 'bold'}, {text: "Value (%)", style: 'bold'}, {text: "Level of certainty", style: 'bold'}]]
        }
      }

      let efficiency = metrics.wwtp_efficiency([industry])


      for (let [pollutant, value] of  Object.entries(efficiency)){

        let level_of_certainty = utils.get_string_impact_legend(industry_impact_legend_category.wwtp_efficiency(industry, pollutant))
        let fill_color_level_of_certainty = utils.getDataTypeColor(level_of_certainty)

        industriesInfluentEfficiency.table.body.push([{
          text: pollutant,
          style: 'bold'
        }, {
          text: value,
        },{
          text: level_of_certainty, fillColor: fill_color_level_of_certainty != null ? fill_color_level_of_certainty[0] : null
        }])
      }


      dd.content.push(industriesInfluentEfficiency)
      dd.content.push("\n\n")


    },

    influent_efficiency_pdf(dd, industry) {

      dd.content.push({
        text: "Percentage of treatment efficiency (compared to intake water)\n\n",
        style: 'subsubheader'
      })


      let industriesEfficiency = {
        table: {
          headerRows: 1,
          body: [[{text: "Pollutant", style: 'bold'}, {text: "Value (%)", style: 'bold'}, {text: "Level of certainty", style: 'bold'}]]
        }
      }

      let efficiency = metrics.amount_water_influent_cleaned([industry])


      for (let [pollutant, value] of  Object.entries(efficiency)){

        let level_of_certainty = utils.get_string_impact_legend(industry_impact_legend_category.amount_water_influent_cleaned(industry, pollutant))
        let fill_color_level_of_certainty = utils.getDataTypeColor(level_of_certainty)

        industriesEfficiency.table.body.push([{
          text: pollutant,
          style: 'bold'
        }, {
          text: value,
        },{
          text: level_of_certainty, fillColor: fill_color_level_of_certainty != null ? fill_color_level_of_certainty[0] : null
        }])
      }


      dd.content.push(industriesEfficiency)
      dd.content.push("\n\n")



    },

    treated_water_factor_pdf(dd, industry) {

      dd.content.push({
        text: "Treated water factor \n\n",
        style: 'subsubheader'
      })



      let treated = metrics.treated_water_factor([industry])
      let level_of_certainty = utils.get_string_impact_legend(industry_impact_legend_category.treated_water_factor(industry))
      let fill_color_level_of_certainty = utils.getDataTypeColor(level_of_certainty)



      let industriesTreatedFactor = {
        table: {
          headerRows: 1,
          body: [
              [{text: "Treated water factor (%)", style: 'bold'}, {text: "Level of certainty", style: 'bold'}],
            [{text: treated}, {text: level_of_certainty, fillColor: fill_color_level_of_certainty != null ? fill_color_level_of_certainty[0] : null}],

          ]
        }
      }


      dd.content.push(industriesTreatedFactor)
      dd.content.push("\n\n")



    },

    concentration_pollutants_effluent_pdf(dd, industry) {

      dd.content.push({
        text: "Pollutants in the industry effluent\n\n",
        style: 'subsubheader'
      })

      let table = {
        table: {
          headerRows: 1,
          body: [[{text: "Pollutant", style: 'bold'}, {text: "Concentration (g/m3)", style: 'bold'}, {text: "Toxic units (TU)", style: 'bold'}, {text: "Concentration with respect to EQS (%) ", style: 'bold'}, {text: "Level of certainty ", style: 'bold'}]]
        }
      }

      let concentration = metrics.pollutant_concentration([industry])
      let tu = metrics.ecotoxicity_potential_tu([industry])
      let eqs = metrics.environmental_quality_standards([industry])


      for(let pollutant of industry.pollutants_selected){
        let level_of_certainty = utils.get_string_impact_legend(industry_impact_legend_category.pollutant_concentration(industry, pollutant))
        let fill_color_level_of_certainty = utils.getDataTypeColor(level_of_certainty)
        table.table.body.push([
          {text: pollutant, style: 'bold'}, concentration[pollutant], tu[pollutant] == undefined ? '' : tu[pollutant], eqs[pollutant] == undefined ? '' : eqs[pollutant],
          {
            text: level_of_certainty, fillColor: fill_color_level_of_certainty != null ? fill_color_level_of_certainty[0] : null
          }
          ])


      }

      dd.content.push(table)
      dd.content.push("\n\n")


    },

    async concentration_water_body_pollutants_effluent_pdf(dd, industry) {

      dd.content.push({
        text: "Pollutants in the receiving water body\n\n",
        style: 'subsubheader'
      })

      let table = {
        table: {
          headerRows: 1,
          body: [[{text: "Pollutant", style: 'bold'}, {text: "Increase of concentration (g/m3)", style: 'bold'}, {text: "Concentration (g/m3)", style: 'bold'}, {text: "Toxic units (TU)", style: 'bold'}, {text: "Concentration with respect to EQS (%) ", style: 'bold'}, {text: "Level of certainty ", style: 'bold'}]]
        }
      }

      let concentration = await metrics.final_water_body_concentration([industry], this.global_layers)
      let delta = await metrics.pollutant_delta([industry], this.global_layers, true)
      let tu = await metrics.tu_receiving_water_body([industry], this.global_layers, true)
      let eqs = await metrics.eqs_receiving_water_body([industry], this.global_layers, true)


      for(let pollutant of industry.pollutants_selected){
        let level_of_certainty = utils.get_string_impact_legend(industry_impact_legend_category.final_water_body_concentration(industry, pollutant))
        let fill_color_level_of_certainty = utils.getDataTypeColor(level_of_certainty)
        table.table.body.push([
          {text: pollutant, style: 'bold'}, concentration[pollutant], delta[pollutant], tu[pollutant] == undefined ? '' : tu[pollutant], eqs[pollutant] == undefined ? '' : eqs[pollutant],
          {
            text: level_of_certainty, fillColor: fill_color_level_of_certainty != null ? fill_color_level_of_certainty[0] : null
          }
        ])


      }

      dd.content.push(table)
      dd.content.push("\n\n")


    },

    async water_availability_pdf(dd, industry) {

      let _this = this

      let table = {
        table: {
          headerRows: 1,
          body: []
        }
      }
      let dilution_factor = utils.get_string_impact_legend(industry_impact_legend_category.dilution_factor(industry))
      let consumption_available = utils.get_string_impact_legend(industry_impact_legend_category.available_ratio(industry))
      let external_sources_from_other_watersheds = utils.get_string_impact_legend(industry_impact_legend_category.external_sources_from_other_watersheds(industry))
      let groundwater_withdrawals_in_high_groundwater_decline = utils.get_string_impact_legend(industry_impact_legend_category.groundwater_withdrawals_in_high_groundwater_decline(industry))


      let table_statistics = [
        {
          statistic: "Dilution factor",
          value: await metrics.dilution_factor(_this.global_layers, [industry], true),
          fill_value: 'dilution_factor',
          level_of_certainty: dilution_factor,
          fill_color_level_of_certainty: utils.getDataTypeColor(dilution_factor)
        },
        {
          statistic: "Consumption available ratio (%)",
          value: await metrics.available_ratio(_this.global_layers, [industry]),
          level_of_certainty: consumption_available,
          fill_color_level_of_certainty: utils.getDataTypeColor(consumption_available),
          fill_value: 'water_stress_ratio',
        },
        {
          statistic: "Consumptive use from different watersheds (m3/day)",
          value: metrics.external_sources_from_other_watersheds([industry]),
          level_of_certainty: external_sources_from_other_watersheds,
          fill_color_level_of_certainty: utils.getDataTypeColor(external_sources_from_other_watersheds),
          fill_value: 'external_sources_from_other_watersheds',
        },
        {
          statistic: "Groundwater withdrawals (only in areas with GW decline) (m3/day) ",
          value: await metrics.groundwater_withdrawals_in_high_groundwater_decline([industry], _this.global_layers),
          level_of_certainty: groundwater_withdrawals_in_high_groundwater_decline,
          fill_color_level_of_certainty: utils.getDataTypeColor(groundwater_withdrawals_in_high_groundwater_decline),
          fill_value: 'groundwater_withdrawals_in_high_groundwater_decline',

        },
      ]

      table_statistics.forEach(item => {
        table.table.body.push(
          [
            {
              text: item.statistic, style: 'bold'
            },
            {
              text: item.value, fillColor: _this.get_color(this.risk_categories[item.fill_value](item.value))
            },
            {
              text: item.level_of_certainty, fillColor: item.fill_color_level_of_certainty != null ? item.fill_color_level_of_certainty[0] : null
            }
          ]
        )
      })

      dd.content.push(table)
      dd.content.push("\n\n")
      /*
      let concentration = await metrics.final_water_body_concentration([industry], this.global_layers)
      let delta = await metrics.pollutant_delta([industry], this.global_layers, true)
      let tu = await metrics.tu_receiving_water_body([industry], this.global_layers, true)
      let eqs = await metrics.eqs_receiving_water_body([industry], this.global_layers, true)


      for(let pollutant of industry.pollutants_selected){
        let level_of_certainty = utils.get_string_impact_legend(industry_impact_legend_category.final_water_body_concentration(industry, pollutant))
        let fill_color_level_of_certainty = utils.getDataTypeColor(level_of_certainty)
        table.table.body.push([
          pollutant, concentration[pollutant], delta[pollutant], tu[pollutant] == undefined ? '' : tu[pollutant], eqs[pollutant] == undefined ? '' : eqs[pollutant],
          {
            text: level_of_certainty, fillColor: fill_color_level_of_certainty != null ? fill_color_level_of_certainty[0] : null
          }
        ])


      }

      dd.content.push(table)
      dd.content.push("\n\n")


      let industriesIndicator = {
        table: {
          body: [
            [
              {text:'Industry', style: "bold"},
              {text:'Dilution factor',style: "bold"},
              //{text:'Recycled water factor (%)',style: "bold"},
              //{text:"Treated water factor (%)",style: "bold"},
              {text:"Consumption available ratio (%)",style: "bold"},
              {text:"Consumption use from different watersheds (m3/day)",style: "bold"},
              {text:"Groundwater withdrawals (only in areas with GW decline) (m3/day)",style: "bold"},

              //{text:"Specific water consumption (tonnes/m3)",style: "bold"},
            ]
          ]
        }
      }*/





    },

    async water_availability_levers_for_action_pdf(dd, industry) {

      let table = {
        table: {
          headerRows: 1,
          body: []
        }
      }


      let table_statistics = [
        {
          statistic: "Recycled water factor (%)",
          value: metrics.recycled_water_factor([industry]),
          level_of_certainty: utils.get_string_impact_legend(industry_impact_legend_category.recycled_water_factor(industry)),
        },
        {
          statistic: "Specific water consumption (m3/"+industry.product_produced_unit+")",
          value: await metrics.efficiency_factor( [industry], this.global_layers),
          level_of_certainty: utils.get_string_impact_legend(industry_impact_legend_category.efficiency_factor(industry)),
        },
        {
          statistic: "Net consumptive use (m3/day)",
          value: await metrics.net_consumptive_use([industry], this.global_layers),
          level_of_certainty: utils.get_string_impact_legend(industry_impact_legend_category.net_consumptive_use_all_watersheds(industry)),
        },
        {
          statistic: "Percentage of water withdrawn for consumptive use (%) ",
          value: await metrics.net_consumptive_use_percentage([industry], this.global_layers),
          level_of_certainty: utils.get_string_impact_legend(industry_impact_legend_category.net_consumptive_use_percentage(industry))
        },
      ]

      table_statistics.forEach(item => {
        table.table.body.push(
            [
              {
                text: item.statistic, style: 'bold'
              },
              {
                text: item.value
              },
              {
                text: item.level_of_certainty,
                fillColor: utils.getDataTypeColor(item.level_of_certainty) != null ? utils.getDataTypeColor(item.level_of_certainty)[0] : null
              }
            ]
        )
      })

      dd.content.push(table)
      dd.content.push("\n\n")

    },

    ghg_impacts(dd, industry) {

      let _this = this

      let ghg_ratio = metrics.emissions_deglossed([industry])

      let table = {
        table: {
          headerRows: 1,
          body: [[{text: "GHG gas", style: 'bold'}, {text: "Value (kgCO2eq/day)", style: 'bold'}, {text: "Level of certainty", style: 'bold'}]]
        }
      }

      let labels = []
      let data = []

      let level_of_certainty = utils.get_string_impact_legend(industry_impact_legend_category.emissions_and_descriptions(industry))
      let fill_color_level_of_certainty = utils.getDataTypeColor(level_of_certainty)
      //sum items in object
      let total = Object.values(ghg_ratio).reduce((a, b) => parseFloat(a) + parseFloat(b), 0)

      for (let [gas, value] of  Object.entries(ghg_ratio)){

        labels.push(gas)
        data.push(100 * parseFloat(value) / total)

        table.table.body.push([{
          text: gas,
          style: 'bold'
        }, {
          text: value,
          fillColor: _this.get_color(this.risk_categories["global_warming"](value))
        },{
          text: level_of_certainty, fillColor: fill_color_level_of_certainty != null ? fill_color_level_of_certainty[0] : null
        }])
      }

      this.table_and_chart(dd, table, labels, data, false, '*', '*')


      dd.content.push("\n\n")




    },

    energy_use_pdf(dd, industry) {
      dd.content.push({
        text: "Energy  use\n\n",
        style: 'subsubheader'
      })


      let energy_used = metrics.energy_used([industry])
      let level_of_certainty = utils.get_string_impact_legend(industry_impact_legend_category.energy_use(industry))
      let fill_color_level_of_certainty = utils.getDataTypeColor(level_of_certainty)

      let table = {
        table: {
          headerRows: 1,
          body: [
            [{text: "Energy used per day (kWh/m3)", style: 'bold'}, {text: "Level of certainty", style: 'bold'}],
            [{text: energy_used}, {text: level_of_certainty, fillColor: fill_color_level_of_certainty != null ? fill_color_level_of_certainty[0] : null}],
          ]
        }
      }

      dd.content.push(table)
      dd.content.push("\n\n")
    },

    effluent_concentration_prior_discharge(dd, industry) {

      dd.content.push({
        text: "Effluent concentration prior to discharge\n\n",
        style: 'subsubheader'
      })

      let table = {
        table: {
          headerRows: 1,
          body: [[{text: "Pollutant", style: 'bold'}, {text: "Concentration (g/m3)", style: 'bold'}, {text: "Level of certainty ", style: 'bold'}]]
        }
      }

      let concentration = metrics.pollutant_concentration([industry])

      for(let pollutant of ["COD", "TN"]){
        let level_of_certainty = utils.get_string_impact_legend(industry_impact_legend_category.pollutant_concentration(industry, pollutant))
        let fill_color_level_of_certainty = utils.getDataTypeColor(level_of_certainty)
        table.table.body.push([
          {text: pollutant, style: 'bold'}, concentration[pollutant],
          {
            text: level_of_certainty, fillColor: fill_color_level_of_certainty != null ? fill_color_level_of_certainty[0] : null
          }
        ])


      }

      dd.content.push(table)
      dd.content.push("\n\n")


    },

    biogenic_emissions(dd, industry) {

      dd.content.push({
        text: "Biogenic emissions\n\n",
        style: 'subsubheader'
      })

      let table = {
        table: {
          headerRows: 1,
          body: [[{text: "Biogenic source", style: 'bold'}, {text: "Value (kgCO2eq/day)", style: 'bold'}, {text: "Level of certainty ", style: 'bold'}]]
        }
      }

      let emissions = metrics.biogenic_emissions([industry])

      for(let [source, value] of Object.entries(emissions)){

        let level_of_certainty = ''
        let fill_color_level_of_certainty = null

        if (source == 'flared'){
          level_of_certainty = utils.get_string_impact_legend(industry_impact_legend_category.biogenic_flared(industry))
          fill_color_level_of_certainty = utils.getDataTypeColor(level_of_certainty)
        }else if (source == 'valorized'){
          level_of_certainty = utils.get_string_impact_legend(industry_impact_legend_category.biogenic_valorized(industry))
          fill_color_level_of_certainty = utils.getDataTypeColor(level_of_certainty)
        }
        table.table.body.push([
          //capitalize first letter
          {text: source.charAt(0).toUpperCase() + source.slice(1), style: 'bold'}, value,
          {
            text: level_of_certainty, fillColor: fill_color_level_of_certainty != null ? fill_color_level_of_certainty[0] : null
          }
        ])

      }

      dd.content.push(table)
      dd.content.push("\n\n")


    },

    emissions_by_source(dd, industry) {

      dd.content.push({
        text: "GHG emissions by source\n\n",
        style: 'subsubheader'
      })

      let table = {
        table: {
          headerRows: 1,
          body: [[{text: "Biogenic source", style: 'bold'}, {text: "Value (kgCO2eq/day)", style: 'bold'}, {text: "Level of certainty ", style: 'bold'}]]
        }
      }

      let emissions = metrics.emissions_and_descriptions([industry], 1)

      let emission_to_name = {
        elec: {name: "Electricity consumption", level: 'emissions_elec'},
        fuel: {name: "Fuel engines", level: 'emissions_fuel'},
        treatment: {name: "Treatment", level: 'emissions_tre'},
        biog: {name: "Biogas", level: 'emissions_biog'},
        digester_fuel: {name: "Fuel (digester)", level: 'emissions_dig_fuel'},
        slu: {name: "Sludge management", level: 'emissions_slu'},
        reuse: {name: "Water reuse transport", level: 'emissions_reus_trck'},
        disc: {name: "Water discharged", level: 'emissions_disc'},
        total: {name: "Total", level: ''},
      }

      for(let [source, value] of Object.entries(emissions)){

        let level_of_certainty_key = emission_to_name[source]['level']

        let level_of_certainty = level_of_certainty_key == '' ? '' : utils.get_string_impact_legend(industry_impact_legend_category[level_of_certainty_key](industry))
        let fill_color_level_of_certainty = level_of_certainty == '' ? null : utils.getDataTypeColor(level_of_certainty)

        table.table.body.push([
          {text: emission_to_name[source].name, style: 'bold'}, value,
          {
            text: level_of_certainty, fillColor: fill_color_level_of_certainty != null ? fill_color_level_of_certainty[0] : null
          }
        ])

      }

      dd.content.push(table)
      dd.content.push("\n\n")


    },

    sludge_management(dd, industry) {

      dd.content.push({
        text: "GHG emissions from sludge management\n\n",
        style: 'subsubheader'
      })

      let table = {
        table: {
          headerRows: 1,
          body: [[{text: "Emissions", style: 'bold'}, {text: "Value (kgCO2eq/day)", style: 'bold'}, {text: "Level of certainty ", style: 'bold'}]]
        }
      }

      let emissions = metrics.sludge_management([industry])

      let emission_to_name = {
        storage: {name: "Sludge storage", level: 'sludge_storage'},
        composting: {name: "Sludge composted", level: 'sludge_composting'},
        incineration: {name: "Sludge incineration", level: 'sludge_incineration'},
        land_application: {name: "Land application of sludge", level: 'sludge_land_application'},
        landfilling: {name: "Emissions from landfilled biosolids", level: 'sludge_landfilling'},
        stockpilling: {name: "Sludge stockpiling", level: 'sludge_stockpilling'},
        sludge_transport: {name: "Sludge transport off-site", level: 'sludge_transport'},
        total: {name: "Total", level: ''},
      }

      for(let [source, value] of Object.entries(emissions)){

        let level_of_certainty_key = emission_to_name[source]['level']

        let level_of_certainty = level_of_certainty_key == '' ? '' : utils.get_string_impact_legend(industry_impact_legend_category[level_of_certainty_key](industry))
        let fill_color_level_of_certainty = level_of_certainty == '' ? null : utils.getDataTypeColor(level_of_certainty)

        table.table.body.push([
          {text: emission_to_name[source].name, style: 'bold'}, value,
          {
            text: level_of_certainty, fillColor: fill_color_level_of_certainty != null ? fill_color_level_of_certainty[0] : null
          }
        ])

      }

      dd.content.push(table)
      dd.content.push("\n\n")


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
          headerRows: 1,
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
        //pageOrientation: 'landscape',
        pageMargins: [67, 60, 30, 60],

        footer: function (currentPage, pageCount) {
          return {
            margin: [0, 20, 0, 30],
            table: {
              headerRows: 1,
              widths: [150, '*', 100],
              body: [
                [
                  {text: 'www.wiat.icradev.cat', alignment: 'right', fontSize: 10},
                  {text: ' ', alignment: 'right'},
                  {text: 'Page ' + currentPage, alignment: 'left', fontSize: 10}
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
              headerRows: 1,
              widths: ['*',200],
              body: [
                ['', {image: img, fit:[50,50], alignment: 'right'}],

              ]
            }
          };
        },
        content: [],
        defaultStyle: {
          fontSize: 10,
        },
        styles: {
          header: {
            fontSize: 18,
            bold: true
          },
          industry_title: {
            fontSize: 14,
            bold: true

          },
          indicator_title: {
            fontSize: 12,
            bold: true,
            decoration: 'underline',
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


        },

      }

      const groupedByAssessments = _.groupBy(this.selected_industries, function(n) {
        return n.assessment.name;
      });


      await this.impact_summary(dd, groupedByAssessments)

      dd.content.push({text: '', pageBreak: 'before'})  // between summary and assessments

      for(const [assessment_name, industries] of Object.entries(groupedByAssessments)){
        dd.content.push({
          text: [{
              text: "Assessment: ",
              style: 'header',
              color: "#b62373"
            },
            {
              text: assessment_name + "\n\n",
              style: 'header'
            }]
        })

        let assessment = industries[0].assessment

        await this.assessment_summary(dd, assessment)

        for (let industry of industries.map(x => x.industry)){

          dd.content.push({
            text: [{
              text: "Industry: ",
              style: 'industry_title',
              color: "#b62373"
            },
              {
                text: industry.name + "\n\n",
                style: 'industry_title'
              }]
          })

          dd.content.push({
            text:
                [{
                  text: "Water quality - ",
                  style: 'indicator_title'
                },
                  {
                    text: "Change in the state of nature\n\n",
                    style: 'indicator_title',
                    color: "#b62373"
                  }

                ]
          })

          await this.delta_tu_pdf(dd, industry)
          await this.delta_eqs_pdf(dd, industry)
          this.eutrophication_pdf(dd, industry)
          await this.delta_temperature_pdf(dd, industry)

          dd.content.push({
            text:
                [{
                  text: "Water quality - ",
                  style: 'indicator_title'
                },
                  {
                    text: "Levers for action\n\n",
                    style: 'indicator_title',
                    color: "#b62373"
                  }

                ]
          })

          this.efficiency_pdf(dd, industry)
          this.influent_efficiency_pdf(dd, industry)
          this.treated_water_factor_pdf(dd, industry)
          this.concentration_pollutants_effluent_pdf(dd, industry)
          await this.concentration_water_body_pollutants_effluent_pdf(dd, industry)

          dd.content.push({
            text:
                [{
                  text: "Water availability - ",
                  style: 'indicator_title'
                },
                  {
                    text: "Change in the state of nature\n\n",
                    style: 'indicator_title',
                    color: "#b62373"
                  }

                ]
          })
          await this.water_availability_pdf(dd, industry)
          dd.content.push({
            text:
                [{
                  text: "Water availability - ",
                  style: 'indicator_title'
                },
                  {
                    text: "Levers for action\n\n",
                    style: 'indicator_title',
                    color: "#b62373"
                  }

                ]
          })
          await this.water_availability_levers_for_action_pdf(dd, industry)
          dd.content.push({
            text:
                [{
                  text: "GHG emissions from wastewater treatment - ",
                  style: 'indicator_title'
                },
                  {
                    text: "Change in the state of nature\n\n",
                    style: 'indicator_title',
                    color: "#b62373"
                  }

                ]
          })
          await this.ghg_impacts(dd, industry)
          dd.content.push({
            text:
                [{
                  text: "GHG emissions from wastewater treatment - ",
                  style: 'indicator_title'
                },
                  {
                    text: "Levers for action\n\n",
                    style: 'indicator_title',
                    color: "#b62373"
                  }

                ]
          })

          this.energy_use_pdf(dd, industry)
          this.effluent_concentration_prior_discharge(dd, industry)
          this.biogenic_emissions(dd, industry)
          this.emissions_by_source(dd, industry)
          this.sludge_management(dd, industry)

          await this.layers_table_pdf(dd, industry)

          dd.content.push({text: '', pageBreak: 'before'})  // add page break

        }

        //delete last page break
        dd.content.pop()

        /*



        await this.reporting_pdf(dd, industries_aggregated, assessment_days)
        dd.content.push("\n\n")

        */

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


    console.log(this.assessment_id)
    if(indexFirstValid >= 0 && this.assessment_id == null) {
      this.selected_assessment = this.assessments_with_industries[indexFirstValid].assessment.name
    }else if(indexFirstValid >= 0) {
      this.selected_assessment = this.assessments_with_industries[this.assessment_id].assessment.name
    }
  },

  computed: {

    tab(){
      let _this = this
      let index = this.assessments_with_industries.findIndex(assessment => assessment.assessment.name == _this.selected_assessment)
      if(index  == -1) return undefined
      else return index
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

      let industries = []
      this.assessments_and_industries_tree.forEach(assessment => {
        industries.push(...assessment.children)
      })

      return industries.length > 0

      /*
      return industries.filter(industry => {
        return utils.is_industry_valid(industry.industry)
      }).length > 0*/


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

.cdp_key_2 {
  color: #b62373;
  font-size: 0.9rem;
  font-weight: bold;
  padding-right: 10px;
}
.cdp_description_2 {
  font-weight: bold;
}

summary::marker {

  color: #b62373;
  font-size:22px;
}

chip_active_class {
  background-color: #b62373;
  color: #0A6BB4;

}




</style>