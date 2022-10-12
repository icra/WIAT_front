<template>
  <div class="outer_2" id="top">
    <span>
      <h1 style="color: #b62373; padding: 20px 0px 0px 20px">
      {{ this.industry.name}}
        <v-tooltip bottom>
      <template v-slot:activator="{ on, attrs }">
        <v-hover  v-slot:default="{ hover }" style="margin-right: 10px">
                <span>
                  <v-icon
                      v-bind="attrs"
                      v-on="on"
                      class="icon_clickable" :color="hover ? '#555283' : '#1C195B'"
                      @click = "direct_discharge_modal = true"
                      style="margin: 0px 0px 4px -6px"

                  >
                    mdi-information-outline
                  </v-icon>

                </span>
        </v-hover>
      </template>
      <span>Display information</span>

    </v-tooltip>
    </h1>


    </span>


    <v-stepper id= "stepper" class="stepper" v-model="stepper_model" style="width: 100%; z-index: 2">
      <v-stepper-header class="white sticky" style="border-bottom: 2px solid #b62373 !important;">
        <v-stepper-step
              step="1"
              editable
          >

          <span>Water withdrawal and industry</span>

        </v-stepper-step>

        <v-divider></v-divider>

        <v-stepper-step
              step="2"
              :editable="industry.has_onsite_wwtp == 1"

          >
            <span>On-site WWTP</span>

          </v-stepper-step>

        <v-divider></v-divider>

        <v-stepper-step
              step="3"
              :editable="industry.has_direct_discharge == 1"
          >
          Direct discharge

        </v-stepper-step>

        <v-divider></v-divider>

        <v-stepper-step
              step="4"
              :editable="industry.has_offsite_wwtp == 1"
          >
          <span>Offsite WWTP</span>

        </v-stepper-step>

        <v-stepper-step
              v-show="false"
              step="5"
          >
            Finish page
          </v-stepper-step>



      </v-stepper-header>

      <v-stepper-items style="z-index: 2; position: relative; padding: 5px 20px 5px 20px">
          <v-stepper-content step="1">

            <v-container
                v-for = "industry_input in array_intersection(industry_inputs, basic_inputs)"
                :key="industry_input"
            >
              <v-row
                  align="center"
                  v-if="industry_input !== 'pollutants_list' && industry_input !== 'ind_pollutants_effl'"

              >
                <v-col cols="8" >
                  <div style="width: 100%;">
                    <div style="height: 100%; display: flex; justify-content: space-between; width: 90%">
                      <div>
                      <span>
                        {{user_inputs[industry_input].question}}
                      </span>
                        <v-tooltip bottom v-if="required.includes(industry_input)">
                          <template v-slot:activator="{ on, attrs }">
                          <span v-bind="attrs"
                                v-on="on"
                                style="color: red"
                          >*</span>
                          </template>
                          <span>Required input</span>
                        </v-tooltip>

                      </div>
                      <v-btn v-if="button_estimation.includes(industry_input) && !isNaN(button_estimations(industry_input)) && button_estimations(industry_input) != null"
                             tile
                             x-small
                             color="#b62373"
                             @click="industry_model[industry_input] = button_estimations(industry_input)"
                      >
                        Estimation:  {{button_estimations(industry_input)}}<!-- Botó amb estimació -->
                      </v-btn>
                    </div>
                    <div v-if="select_estimation.includes(industry_input)" style="width: 100%">
                      <select v-model = "industry_model[industry_input]" style="max-width:90%;background-color: #d9d9d5; width: 90%; -webkit-appearance: menulist"  >
                        <option
                            v-for="item in select_estimations(industry_input)"
                            :value="item.value"
                        >
                          <!--Desplegable amb estimació-->
                          {{item.name}} ({{item.value.toFixed(3)}})
                        </option>
                        <option :value="industry_model[industry_input]">Custom value</option>
                      </select>
                    </div>
                  </div>
                </v-col>
                <v-col cols="4">
                  <div>
                    <div>

              <span v-if="type_option[industry_input]">

                <v-select
                    v-if="required.includes(industry_input)"
                    v-model="industry_model[industry_input]"
                    item-text="text"
                    item-value="value"
                    :items="type_option[industry_input].items"
                    label="Select"
                    :rules = "rules(industry_input)"
                >
                </v-select>

                <v-select
                    v-else
                    v-model="industry_model[industry_input]"
                    item-text="text"
                    item-value="value"
                    :items="type_option[industry_input].items"
                    label="Select"
                >
                </v-select>

              </span>
                      <v-text-field
                          v-else-if="required.includes(industry_input)"
                          v-model="industry_model[industry_input]"
                          :suffix=user_inputs[industry_input].unit
                          type="number"
                          :rules="[v => v!=null || v!='' || 'Item is required!']"
                      ></v-text-field>
                      <v-text-field
                          v-else
                          v-model="industry_model[industry_input]"
                          :suffix=user_inputs[industry_input].unit
                          type="number"
                      ></v-text-field>

                    </div>
                  </div>

                </v-col>
              </v-row>
              <v-row v-else-if = "industry_input == 'pollutants_list'"
                     align="center"
              >
                <v-col cols="12">
                  <v-combobox
                      v-model="model_selected_pollutants"
                      :items="items_selected_pollutants"
                      label="Select pollutants ..."
                      :search-input.sync="search_pollutant"
                      hide-selected
                      multiple
                      persistent-hint
                      small-chips
                      @change="onChangeCombobox"
                  >
                    <template v-slot:selection="{ attrs, item, parent, selected }">
                      <v-chip
                          v-bind="attrs"
                          :input-value="selected"
                          :close="item != 'COD' && item != 'TN' && item != 'TP'"
                          @click:close="remove_chip(item)"
                      >
                        <span class="pr-2">
                          {{ item }}
                        </span>
                      </v-chip>
                    </template>
                    <template v-slot:no-data>
                      <v-list-item>
                        <v-list-item-content>
                          <v-list-item-title>
                            No results matching "<strong>{{ search_pollutant }}</strong>". Press <kbd>enter</kbd> to create a new one
                          </v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                    </template>

                  </v-combobox>
                </v-col>
              </v-row>
              <v-row v-else-if = "industry_input == 'ind_pollutants_effl'"
                     align="center"
                     v-for = "pollutant in model_selected_pollutants"
                     :key="pollutant"
              >
                <v-col cols="8" >
                  <div style="width: 100%;">
                    <div style="height: 100%; display: flex; justify-content: space-between; width: 90%">
                      <div>
                      <span>
                        Concentration of {{pollutant}} in the industry effluent
                      </span>
                      </div>
                      <v-btn v-if="button_estimation.includes(industry_input) && !isNaN(button_estimations(industry_input, pollutant)) && button_estimations(industry_input, pollutant) != null"
                             tile
                             x-small
                             color="#b62373"
                             @click="industry_model['ind_pollutants_effl'][pollutant] = button_estimations(industry_input, pollutant)"
                      >
                        Estimation:  {{button_estimations(industry_input, pollutant)}}<!-- Botó amb estimació -->
                      </v-btn>
                    </div>
                  </div>
                </v-col>

                <v-col cols="4">
                  <div>
                    <div>

                      <v-text-field
                          v-model="industry_model['ind_pollutants_effl'][pollutant]"
                          :suffix=user_inputs[industry_input].unit
                          type="number"
                      ></v-text-field>

                    </div>
                  </div>

                </v-col>


              </v-row>

            </v-container>

            <v-expansion-panels style="padding-top: 20px">
              <v-expansion-panel>
                <v-expansion-panel-header color="#1c195b">
                  <h3 style="color: white">SHOW ADVANCED INPUTS</h3>
                  <template v-slot:actions>
                    <v-icon color="white">
                      $expand
                    </v-icon>
                  </template>
                </v-expansion-panel-header>
                <v-expansion-panel-content style="padding: 30px">
                  <v-container
                      v-for = "industry_input in array_difference(industry_inputs, basic_inputs)"
                      :key="industry_input"
                  >
                    <v-row
                        align="center"
                        v-if="industry_input !== 'ind_pollutants_infl'"

                    >
                      <v-col cols="8" >
                        <div style="width: 100%;">
                          <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">

                            <div>
                <span>
                {{user_inputs[industry_input].question}}
                </span>
                              <v-tooltip bottom v-if="required.includes(industry_input)">
                                <template v-slot:activator="{ on, attrs }">
                    <span
                        v-bind="attrs"
                        v-on="on"
                        style="color: red"
                    >*</span>
                                </template>
                                <span>Required input</span>
                              </v-tooltip>

                            </div>
                            <v-btn v-if="button_estimation.includes(industry_input) && !isNaN(button_estimations(industry_input)) && button_estimations(industry_input) != null"
                                   tile
                                   color="#b62373"
                                   x-small
                                   @click="industry_model[industry_input] = button_estimations(industry_input)"
                            >
                              Estimation:  {{button_estimations(industry_input)}}<!-- Botó amb estimació -->
                            </v-btn>
                          </div>
                          <div v-if="select_estimation.includes(industry_input)" style="width: 100%">
                            <select v-model = "industry_model[industry_input]" style="max-width:90%;background-color: #d9d9d5; width: 90%; -webkit-appearance: menulist"  >
                              <option
                                  v-for="item in select_estimations(industry_input)"
                                  :value="item.value"
                              >
                                <!--Desplegable amb estimació-->
                                {{item.name}} ({{item.value.toFixed(3)}})
                              </option>
                              <option :value="industry_model[industry_input]">Custom value</option>
                            </select>
                          </div>
                        </div>
                      </v-col>
                      <v-col cols="4">
                        <div>
                          <div>
                            <v-select
                                v-if="type_option[industry_input]"
                                v-model="industry_model[industry_input]"
                                item-text="text"
                                item-value="value"
                                :items="type_option[industry_input].items"
                                label="Select"
                            >
                            </v-select>
                            <v-text-field
                                v-else-if="required.includes(industry_input)"
                                v-model="industry_model[industry_input]"
                                :suffix=user_inputs[industry_input].unit
                                type="number"
                                :rules="[v => v!=null || v!='' || 'Item is required!']"
                            ></v-text-field>
                            <v-text-field
                                v-else
                                v-model="industry_model[industry_input]"
                                :suffix=user_inputs[industry_input].unit
                                type="number"
                            ></v-text-field>

                          </div>
                        </div>

                      </v-col>
                    </v-row>
                    <v-row v-else-if = "industry_input == 'ind_pollutants_infl'"
                           align="center"
                           v-for = "pollutant in model_selected_pollutants"
                           :key="pollutant"
                    >
                      <v-col cols="8" >
                        <div style="width: 100%;">
                          <div style="height: 100%; display: flex; justify-content: space-between; width: 90%">
                            <div>
                              <span>
                                Industry withdrawal water {{pollutant}} concentration (surface water only)
                              </span>
                            </div>
                          </div>
                        </div>
                      </v-col>

                      <v-col cols="4">
                        <div>
                          <div>
                            <v-text-field
                                v-model="industry_model['ind_pollutants_infl'][pollutant]"
                                :suffix=user_inputs[industry_input].unit
                                type="number"
                            ></v-text-field>
                          </div>
                        </div>

                      </v-col>


                    </v-row>

                  </v-container>

                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>

            <br>

            <v-tooltip bottom :disabled="!tab_1_disabled">
              <template v-slot:activator="{ on }">
                <div v-on="on" class="d-inline-block">
                  <v-btn
                      @click="tab_1_continue"
                      :disabled="tab_1_disabled"
                      tile
                      color="#b62373"

                  >
                    SAVE AND CONTINUE
                  </v-btn>
                </div>
              </template>
              <span>Please, fill in the required items before continue.</span>
            </v-tooltip>


          </v-stepper-content>  <!-- Industry -->

          <v-stepper-content step="2" >
            <div v-if="industry.has_onsite_wwtp == 1 && stepper_model == 2">
              <v-row
                  align="center"
                  v-for = "input in array_intersection(onsite_wwtp_inputs, basic_inputs)"
                  :key="input"

              >
                <v-col cols="8" >
                  <div style="width: 100%;">
                    <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                <span>
                  {{user_inputs[input].question}}
                  <v-tooltip bottom v-if="required.includes(input)">
                  <template v-slot:activator="{ on, attrs }">
                    <span
                        v-bind="attrs"
                        v-on="on"
                        style="color: red"
                    >*</span>
                  </template>
                  <span>Required input</span>
                </v-tooltip>

                </span>
                      <v-btn v-if="button_estimation.includes(input) && !isNaN(button_estimations(input)) && button_estimations(input) != null"
                             tile
                             color="#b62373"
                             x-small
                             @click="onsite_wwtp_model[input] = button_estimations(input)"
                      >
                        Estimation:  {{button_estimations(input).toExponential(3)}}<!-- Botó amb estimació -->
                      </v-btn>
                    </div>
                    <div v-if="select_estimation.includes(input)" style="width: 100%">
                      <select v-model = "onsite_wwtp_model[input]" style="max-width:90%;background-color: #d9d9d5; width: 90%; -webkit-appearance: menulist"  >
                        <option
                            v-for="item in select_estimations(input)"
                            :value="item.value"
                        >
                          <!--Desplegable amb estimació-->
                          {{item.name}} ({{item.value.toFixed(3)}})
                        </option>
                        <option :value="onsite_wwtp_model[input]">Custom value</option>
                      </select>
                    </div>

                  </div>
                </v-col>
                <v-col cols="4">
                  <div>
                    <div>
                      <v-select
                          v-if="type_option[input]"
                          v-model="onsite_wwtp_model[input]"
                          item-text="text"
                          item-value="value"
                          :items="type_option[input].items"
                          label="Select"
                      >
                      </v-select>
                      <v-text-field
                          v-else
                          v-model="onsite_wwtp_model[input]"
                          :suffix=user_inputs[input].unit
                          type="number"
                      ></v-text-field>

                    </div>
                  </div>

                </v-col>

              </v-row>
              <v-expansion-panels style="padding-top: 20px">
                <v-expansion-panel>
                  <v-expansion-panel-header color="#1c195b">
                    <h3 style="color: white">SHOW ADVANCED INPUTS</h3>
                    <template v-slot:actions>
                      <v-icon color="white">
                        $expand
                      </v-icon>
                    </template>
                  </v-expansion-panel-header>
                  <v-expansion-panel-content style="padding: 30px">

                    <v-expansion-panels style="padding-top: 20px">
                      <v-expansion-panel>
                        <v-expansion-panel-header >
                          <h3>Effluent pollution</h3>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content style="padding: 30px">
                          <v-row
                              align="center"
                              v-for = "pollutant in model_selected_pollutants"
                              :key="pollutant"

                          >
                            <v-col cols="8" >
                              <div style="width: 100%;">
                                <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                                  <span>
                                    Concentration of {{pollutant}} in the WWTP effluent
                                  </span>
                                  <v-btn v-if="button_estimation.includes('wwt_pollutants_effl') && !isNaN(button_estimations('wwt_pollutants_effl', pollutant)) && button_estimations('wwt_pollutants_effl', pollutant) != null"
                                         tile
                                         x-small
                                         color="#b62373"
                                         @click="onsite_wwtp_model['wwt_pollutants_effl'][pollutant] = button_estimations('wwt_pollutants_effl', pollutant)"
                                  >
                                    Estimation:  {{button_estimations('wwt_pollutants_effl', pollutant)}}<!-- Botó amb estimació -->
                                  </v-btn>

                                </div>

                              </div>
                            </v-col>
                            <v-col cols="4">
                              <v-text-field
                                  v-model="onsite_wwtp_model['wwt_pollutants_effl'][pollutant]"
                                  :suffix="user_inputs['wwt_pollutants_effl'].unit"
                                  type="number"
                              ></v-text-field>
                            </v-col>

                          </v-row>
                        </v-expansion-panel-content>
                      </v-expansion-panel>
                      <v-expansion-panel>
                        <v-expansion-panel-header >
                          <h3>Fuel engines</h3>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content style="padding: 30px">
                          <v-row
                              align="center"
                              v-for = "input in advanced_fuel_engines"
                              :key="input"

                          >
                            <v-col cols="8" >
                              <div style="width: 100%;">
                                <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                <span>
                  {{user_inputs[input].question}}
                </span>
                                  <v-btn v-if="button_estimation.includes(input) && !isNaN(button_estimations(input)) && button_estimations(input) != null"
                                         tile
                                         color="#b62373"
                                         x-small
                                         @click="onsite_wwtp_model[input] = button_estimations(input)"
                                  >
                                    Estimation:  {{button_estimations(input).toExponential(3)}}<!-- Botó amb estimació -->
                                  </v-btn>
                                </div>
                                <div v-if="select_estimation.includes(input)" style="width: 100%">
                                  <select v-model = "onsite_wwtp_model[input]" style="max-width:90%;background-color: #d9d9d5; width: 90%; -webkit-appearance: menulist"  >
                                    <option
                                        v-for="item in select_estimations(input)"
                                        :value="item.value"
                                    >
                                      <!--Desplegable amb estimació-->
                                      {{item.name}} ({{item.value.toFixed(3)}})
                                    </option>
                                    <option :value="onsite_wwtp_model[input]">Custom value</option>
                                  </select>
                                </div>

                              </div>
                            </v-col>
                            <v-col cols="4">
                              <div>
                                <div>
                                  <v-select
                                      v-if="type_option[input]"
                                      v-model="onsite_wwtp_model[input]"
                                      item-text="text"
                                      item-value="value"
                                      :items="type_option[input].items"
                                      label="Select"
                                  >
                                  </v-select>
                                  <v-text-field
                                      v-else
                                      v-model="onsite_wwtp_model[input]"
                                      :suffix=user_inputs[input].unit
                                      type="number"
                                  ></v-text-field>

                                </div>
                              </div>

                            </v-col>

                          </v-row>
                        </v-expansion-panel-content>
                      </v-expansion-panel>
                      <v-expansion-panel>
                        <v-expansion-panel-header >
                          <h3>Biogas produced from anaerobic digestion</h3>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content style="padding: 30px">
                          <v-row
                              align="center"
                              v-for = "input in advanced_biogas_from_anaerobic"
                              :key="input"

                          >
                            <v-col cols="8" >
                              <div style="width: 100%;">
                                <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                <span>
                  {{user_inputs[input].question}}
                </span>
                                  <v-btn v-if="button_estimation.includes(input) && !isNaN(button_estimations(input)) && button_estimations(input) != null"
                                         tile
                                         color="#b62373"
                                         x-small
                                         @click="onsite_wwtp_model[input] = button_estimations(input)"
                                  >
                                    Estimation:  {{button_estimations(input).toExponential(3)}}<!-- Botó amb estimació -->
                                  </v-btn>
                                </div>
                                <div v-if="select_estimation.includes(input)" style="width: 100%">
                                  <select v-model = "onsite_wwtp_model[input]" style="max-width:90%;background-color: #d9d9d5; width: 90%; -webkit-appearance: menulist"  >
                                    <option
                                        v-for="item in select_estimations(input)"
                                        :value="item.value"
                                    >
                                      <!--Desplegable amb estimació-->
                                      {{item.name}} ({{item.value.toFixed(3)}})
                                    </option>
                                    <option :value="onsite_wwtp_model[input]">Custom value</option>
                                  </select>
                                </div>

                              </div>
                            </v-col>
                            <v-col cols="4">
                              <div>
                                <div>
                                  <v-select
                                      v-if="type_option[input]"
                                      v-model="onsite_wwtp_model[input]"
                                      item-text="text"
                                      item-value="value"
                                      :items="type_option[input].items"
                                      label="Select"
                                  >
                                  </v-select>
                                  <v-text-field
                                      v-else
                                      v-model="onsite_wwtp_model[input]"
                                      :suffix=user_inputs[input].unit
                                      type="number"
                                  ></v-text-field>

                                </div>
                              </div>

                            </v-col>

                          </v-row>
                        </v-expansion-panel-content>
                      </v-expansion-panel>
                      <v-expansion-panel>
                        <v-expansion-panel-header >
                          <h3>Fuel used in water reuse trucks</h3>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content style="padding: 30px">
                          <v-row
                              align="center"
                              v-for = "input in advanced_water_reuse_trucks"
                              :key="input"

                          >
                            <v-col cols="8" >
                              <div style="width: 100%;">
                                <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                <span>
                  {{user_inputs[input].question}}
                </span>
                                  <v-btn v-if="button_estimation.includes(input) && !isNaN(button_estimations(input)) && button_estimations(input) != null"
                                         tile
                                         color="#b62373"
                                         x-small
                                         @click="onsite_wwtp_model[input] = button_estimations(input)"
                                  >
                                    Estimation:  {{button_estimations(input).toExponential(3)}}<!-- Botó amb estimació -->
                                  </v-btn>
                                </div>
                                <div v-if="select_estimation.includes(input)" style="width: 100%">
                                  <select v-model = "onsite_wwtp_model[input]" style="max-width:90%;background-color: #d9d9d5; width: 90%; -webkit-appearance: menulist"  >
                                    <option
                                        v-for="item in select_estimations(input)"
                                        :value="item.value"
                                    >
                                      <!--Desplegable amb estimació-->
                                      {{item.name}} ({{item.value.toFixed(3)}})
                                    </option>
                                    <option :value="onsite_wwtp_model[input]">Custom value</option>
                                  </select>
                                </div>

                              </div>
                            </v-col>
                            <v-col cols="4">
                              <div>
                                <div>
                                  <v-select
                                      v-if="type_option[input]"
                                      v-model="onsite_wwtp_model[input]"
                                      item-text="text"
                                      item-value="value"
                                      :items="type_option[input].items"
                                      label="Select"
                                  >
                                  </v-select>
                                  <v-text-field
                                      v-else
                                      v-model="onsite_wwtp_model[input]"
                                      :suffix=user_inputs[input].unit
                                      type="number"
                                  ></v-text-field>

                                </div>
                              </div>

                            </v-col>

                          </v-row>
                        </v-expansion-panel-content>
                      </v-expansion-panel>
                      <v-expansion-panel>
                        <v-expansion-panel-header >
                          <h3>Sludge storage in WWTP</h3>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content style="padding: 30px">
                          <v-row
                              align="center"
                              v-for = "input in advanced_sludge_Storage"
                              :key="input"

                          >
                            <v-col cols="8" >
                              <div style="width: 100%;">
                                <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                <span>
                  {{user_inputs[input].question}}
                </span>
                                  <v-btn v-if="button_estimation.includes(input) && !isNaN(button_estimations(input)) && button_estimations(input) != null"
                                         tile
                                         color="#b62373"
                                         x-small
                                         @click="onsite_wwtp_model[input] = button_estimations(input)"
                                  >
                                    Estimation:  {{button_estimations(input).toExponential(3)}}<!-- Botó amb estimació -->
                                  </v-btn>
                                </div>
                                <div v-if="select_estimation.includes(input)" style="width: 100%">
                                  <select v-model = "onsite_wwtp_model[input]" style="max-width:90%;background-color: #d9d9d5; width: 90%; -webkit-appearance: menulist"  >
                                    <option
                                        v-for="item in select_estimations(input)"
                                        :value="item.value"
                                    >
                                      <!--Desplegable amb estimació-->
                                      {{item.name}} ({{item.value.toFixed(3)}})
                                    </option>
                                    <option :value="onsite_wwtp_model[input]">Custom value</option>
                                  </select>
                                </div>

                              </div>
                            </v-col>
                            <v-col cols="4">
                              <div>
                                <div>
                                  <v-select
                                      v-if="type_option[input]"
                                      v-model="onsite_wwtp_model[input]"
                                      item-text="text"
                                      item-value="value"
                                      :items="type_option[input].items"
                                      label="Select"
                                  >
                                  </v-select>
                                  <v-text-field
                                      v-else
                                      v-model="onsite_wwtp_model[input]"
                                      :suffix=user_inputs[input].unit
                                      type="number"
                                  ></v-text-field>

                                </div>
                              </div>

                            </v-col>

                          </v-row>
                        </v-expansion-panel-content>
                      </v-expansion-panel>
                      <v-expansion-panel>
                        <v-expansion-panel-header >
                          <h3>Sludge composting in WWTP</h3>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content style="padding: 30px">
                          <v-row
                              align="center"
                              v-for = "input in advanced_sludge_composting"
                              :key="input"

                          >
                            <v-col cols="8" >
                              <div style="width: 100%;">
                                <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                <span>
                  {{user_inputs[input].question}}
                </span>
                                  <v-btn v-if="button_estimation.includes(input) && !isNaN(button_estimations(input)) && button_estimations(input) != null"
                                         tile
                                         color="#b62373"
                                         x-small
                                         @click="onsite_wwtp_model[input] = button_estimations(input)"
                                  >
                                    Estimation:  {{button_estimations(input).toExponential(3)}}<!-- Botó amb estimació -->
                                  </v-btn>
                                </div>
                                <div v-if="select_estimation.includes(input)" style="width: 100%">
                                  <select v-model = "onsite_wwtp_model[input]" style="max-width:90%;background-color: #d9d9d5; width: 90%; -webkit-appearance: menulist"  >
                                    <option
                                        v-for="item in select_estimations(input)"
                                        :value="item.value"
                                    >
                                      <!--Desplegable amb estimació-->
                                      {{item.name}} ({{item.value.toFixed(3)}})
                                    </option>
                                    <option :value="onsite_wwtp_model[input]">Custom value</option>
                                  </select>
                                </div>

                              </div>
                            </v-col>
                            <v-col cols="4">
                              <div>
                                <div>
                                  <v-select
                                      v-if="type_option[input]"
                                      v-model="onsite_wwtp_model[input]"
                                      item-text="text"
                                      item-value="value"
                                      :items="type_option[input].items"
                                      label="Select"
                                  >
                                  </v-select>
                                  <v-text-field
                                      v-else
                                      v-model="onsite_wwtp_model[input]"
                                      :suffix=user_inputs[input].unit
                                      type="number"
                                  ></v-text-field>

                                </div>
                              </div>

                            </v-col>

                          </v-row>
                        </v-expansion-panel-content>
                      </v-expansion-panel>
                      <v-expansion-panel>
                        <v-expansion-panel-header >
                          <h3>Sludge incineration</h3>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content style="padding: 30px">
                          <v-row
                              align="center"
                              v-for = "input in advanced_sludge_incineration"
                              :key="input"

                          >
                            <v-col cols="8" >
                              <div style="width: 100%;">
                                <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                <span>
                  {{user_inputs[input].question}}
                </span>
                                  <v-btn v-if="button_estimation.includes(input) && !isNaN(button_estimations(input)) && button_estimations(input) != null"
                                         tile
                                         color="#b62373"
                                         x-small
                                         @click="onsite_wwtp_model[input] = button_estimations(input)"
                                  >
                                    Estimation:  {{button_estimations(input).toExponential(3)}}<!-- Botó amb estimació -->
                                  </v-btn>
                                </div>
                                <div v-if="select_estimation.includes(input)" style="width: 100%">
                                  <select v-model = "onsite_wwtp_model[input]" style="max-width:90%;background-color: #d9d9d5; width: 90%; -webkit-appearance: menulist"  >
                                    <option
                                        v-for="item in select_estimations(input)"
                                        :value="item.value"
                                    >
                                      <!--Desplegable amb estimació-->
                                      {{item.name}} ({{item.value.toFixed(3)}})
                                    </option>
                                    <option :value="onsite_wwtp_model[input]">Custom value</option>
                                  </select>
                                </div>

                              </div>
                            </v-col>
                            <v-col cols="4">
                              <div>
                                <div>
                                  <v-select
                                      v-if="type_option[input]"
                                      v-model="onsite_wwtp_model[input]"
                                      item-text="text"
                                      item-value="value"
                                      :items="type_option[input].items"
                                      label="Select"
                                  >
                                  </v-select>
                                  <v-text-field
                                      v-else
                                      v-model="onsite_wwtp_model[input]"
                                      :suffix=user_inputs[input].unit
                                      type="number"
                                  ></v-text-field>

                                </div>
                              </div>

                            </v-col>

                          </v-row>
                        </v-expansion-panel-content>
                      </v-expansion-panel>
                      <v-expansion-panel>
                        <v-expansion-panel-header >
                          <h3>Sludge sent to dry application</h3>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content style="padding: 30px">
                          <v-row
                              align="center"
                              v-for = "input in advanced_application"
                              :key="input"

                          >
                            <v-col cols="8" >
                              <div style="width: 100%;">
                                <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                <span>
                  {{user_inputs[input].question}}
                </span>
                                  <v-btn v-if="button_estimation.includes(input) && !isNaN(button_estimations(input)) && button_estimations(input) != null"
                                         tile
                                         color="#b62373"
                                         x-small
                                         @click="onsite_wwtp_model[input] = button_estimations(input)"
                                  >
                                    Estimation:  {{button_estimations(input).toExponential(3)}}<!-- Botó amb estimació -->
                                  </v-btn>
                                </div>
                                <div v-if="select_estimation.includes(input)" style="width: 100%">
                                  <select v-model = "onsite_wwtp_model[input]" style="max-width:90%;background-color: #d9d9d5; width: 90%; -webkit-appearance: menulist"  >
                                    <option
                                        v-for="item in select_estimations(input)"
                                        :value="item.value"
                                    >
                                      <!--Desplegable amb estimació-->
                                      {{item.name}} ({{item.value.toFixed(3)}})
                                    </option>
                                    <option :value="onsite_wwtp_model[input]">Custom value</option>
                                  </select>
                                </div>

                              </div>
                            </v-col>
                            <v-col cols="4">
                              <div>
                                <div>
                                  <v-select
                                      v-if="type_option[input]"
                                      v-model="onsite_wwtp_model[input]"
                                      item-text="text"
                                      item-value="value"
                                      :items="type_option[input].items"
                                      label="Select"
                                  >
                                  </v-select>
                                  <v-text-field
                                      v-else
                                      v-model="onsite_wwtp_model[input]"
                                      :suffix=user_inputs[input].unit
                                      type="number"
                                  ></v-text-field>

                                </div>
                              </div>

                            </v-col>

                          </v-row>
                        </v-expansion-panel-content>
                      </v-expansion-panel>
                      <v-expansion-panel>
                        <v-expansion-panel-header >
                          <h3>Sludge landfilling</h3>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content style="padding: 30px">
                          <v-row
                              align="center"
                              v-for = "input in advanced_landfilling"
                              :key="input"

                          >
                            <v-col cols="8" >
                              <div style="width: 100%;">
                                <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                <span>
                  {{user_inputs[input].question}}
                </span>
                                  <v-btn v-if="button_estimation.includes(input) && !isNaN(button_estimations(input)) && button_estimations(input) != null"
                                         tile
                                         color="#b62373"
                                         x-small
                                         @click="onsite_wwtp_model[input] = button_estimations(input)"
                                  >
                                    Estimation:  {{button_estimations(input).toExponential(3)}}<!-- Botó amb estimació -->
                                  </v-btn>
                                </div>
                                <div v-if="select_estimation.includes(input)" style="width: 100%">
                                  <select v-model = "onsite_wwtp_model[input]" style="max-width:90%;background-color: #d9d9d5; width: 90%; -webkit-appearance: menulist"  >
                                    <option
                                        v-for="item in select_estimations(input)"
                                        :value="item.value"
                                    >
                                      <!--Desplegable amb estimació-->
                                      {{item.name}} ({{item.value.toFixed(3)}})
                                    </option>
                                    <option :value="onsite_wwtp_model[input]">Custom value</option>
                                  </select>
                                </div>

                              </div>
                            </v-col>
                            <v-col cols="4">
                              <div>
                                <div>
                                  <v-select
                                      v-if="type_option[input]"
                                      v-model="onsite_wwtp_model[input]"
                                      item-text="text"
                                      item-value="value"
                                      :items="type_option[input].items"
                                      label="Select"
                                  >
                                  </v-select>
                                  <v-text-field
                                      v-else
                                      v-model="onsite_wwtp_model[input]"
                                      :suffix=user_inputs[input].unit
                                      type="number"
                                  ></v-text-field>

                                </div>
                              </div>

                            </v-col>

                          </v-row>
                        </v-expansion-panel-content>
                      </v-expansion-panel>
                      <v-expansion-panel>
                        <v-expansion-panel-header >
                          <h3>Sludge stockpiling</h3>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content style="padding: 30px">
                          <v-row
                              align="center"
                              v-for = "input in advanced_stockpiling"
                              :key="input"

                          >
                            <v-col cols="8" >
                              <div style="width: 100%;">
                                <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                <span>
                  {{user_inputs[input].question}}
                </span>
                                  <v-btn v-if="button_estimation.includes(input) && !isNaN(button_estimations(input)) && button_estimations(input) != null"
                                         tile
                                         color="#b62373"
                                         x-small
                                         @click="onsite_wwtp_model[input] = button_estimations(input)"
                                  >
                                    Estimation:  {{button_estimations(input).toExponential(3)}}<!-- Botó amb estimació -->
                                  </v-btn>
                                </div>
                                <div v-if="select_estimation.includes(input)" style="width: 100%">
                                  <select v-model = "onsite_wwtp_model[input]" style="max-width:90%;background-color: #d9d9d5; width: 90%; -webkit-appearance: menulist"  >
                                    <option
                                        v-for="item in select_estimations(input)"
                                        :value="item.value"
                                    >
                                      <!--Desplegable amb estimació-->
                                      {{item.name}} ({{item.value.toFixed(3)}})
                                    </option>
                                    <option :value="onsite_wwtp_model[input]">Custom value</option>
                                  </select>
                                </div>

                              </div>
                            </v-col>
                            <v-col cols="4">
                              <div>
                                <div>
                                  <v-select
                                      v-if="type_option[input]"
                                      v-model="onsite_wwtp_model[input]"
                                      item-text="text"
                                      item-value="value"
                                      :items="type_option[input].items"
                                      label="Select"
                                  >
                                  </v-select>
                                  <v-text-field
                                      v-else
                                      v-model="onsite_wwtp_model[input]"
                                      :suffix=user_inputs[input].unit
                                      type="number"
                                  ></v-text-field>

                                </div>
                              </div>

                            </v-col>

                          </v-row>
                        </v-expansion-panel-content>
                      </v-expansion-panel>
                      <v-expansion-panel>
                        <v-expansion-panel-header >
                          <h3>Sludge truck transportation to disposal site</h3>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content style="padding: 30px">
                          <v-row
                              align="center"
                              v-for = "input in advanced_truck_transportation"
                              :key="input"

                          >
                            <v-col cols="8" >
                              <div style="width: 100%;">
                                <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                <span>
                  {{user_inputs[input].question}}
                </span>
                                  <v-btn v-if="button_estimation.includes(input) && !isNaN(button_estimations(input)) && button_estimations(input) != null"
                                         tile
                                         color="#b62373"
                                         x-small
                                         @click="onsite_wwtp_model[input] = button_estimations(input)"
                                  >
                                    Estimation:  {{button_estimations(input).toExponential(3)}}<!-- Botó amb estimació -->
                                  </v-btn>
                                </div>
                                <div v-if="select_estimation.includes(input)" style="width: 100%">
                                  <select v-model = "onsite_wwtp_model[input]" style="max-width:90%;background-color: #d9d9d5; width: 90%; -webkit-appearance: menulist"  >
                                    <option
                                        v-for="item in select_estimations(input)"
                                        :value="item.value"
                                    >
                                      <!--Desplegable amb estimació-->
                                      {{item.name}} ({{item.value.toFixed(3)}})
                                    </option>
                                    <option :value="onsite_wwtp_model[input]">Custom value</option>
                                  </select>
                                </div>

                              </div>
                            </v-col>
                            <v-col cols="4">
                              <div>
                                <div>
                                  <v-select
                                      v-if="type_option[input]"
                                      v-model="onsite_wwtp_model[input]"
                                      item-text="text"
                                      item-value="value"
                                      :items="type_option[input].items"
                                      label="Select"
                                  >
                                  </v-select>
                                  <v-text-field
                                      v-else
                                      v-model="onsite_wwtp_model[input]"
                                      :suffix=user_inputs[input].unit
                                      type="number"
                                  ></v-text-field>

                                </div>
                              </div>

                            </v-col>

                          </v-row>
                        </v-expansion-panel-content>
                      </v-expansion-panel>

                    </v-expansion-panels>
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>


            </div>
            <br>

            <v-tooltip bottom :disabled="!tab_2_disabled">
              <template v-slot:activator="{ on }">
                <div v-on="on" class="d-inline-block">
                  <v-btn
                      @click="tab_2_continue"
                      :disabled="tab_2_disabled"
                      tile
                      color="#b62373"

                  >
                    SAVE AND CONTINUE
                  </v-btn>
                </div>
              </template>
              <span>Please, fill in the required items before continue.</span>
            </v-tooltip>

          </v-stepper-content>  <!-- Onsite WWTP -->

          <v-stepper-content step="3" >


            <div v-if="industry.has_direct_discharge == 1 && stepper_model == 3">
              <v-row
                  align="center"
                  v-for = "input in direct_discharge_inputs"
                  :key="input"

              >
                <v-col cols="8" >
                  <div style="width: 100%;">
                    <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                <span>
                  {{user_inputs[input].question}}
                  <v-tooltip bottom v-if="required.includes(input)">
                    <template v-slot:activator="{ on, attrs }">
                        <span
                            v-bind="attrs"
                            v-on="on"
                            style="color: red"
                        >*</span>
                    </template>
                    <span>Required input</span>
                  </v-tooltip>
                </span>

                      <v-btn v-if="button_estimation.includes(input) && !isNaN(button_estimations(input)) && button_estimations(input) != null"
                             tile
                             color="#b62373"
                             x-small
                             @click="direct_discharge_model[input] = button_estimations(input)"
                      >
                        Estimation:  {{button_estimations(input).toExponential(3)}}<!-- Botó amb estimació -->
                      </v-btn>
                    </div>
                    <div v-if="select_estimation.includes(input)" style="width: 100%">
                      <select v-model = "direct_discharge_model[input]" style="max-width:90%;background-color: #d9d9d5; width: 90%; -webkit-appearance: menulist"  >
                        <option
                            v-for="item in select_estimations(input)"
                            :value="item.value"
                        >
                          <!--Desplegable amb estimació-->
                          {{item.name}} ({{item.value.toFixed(3)}})
                        </option>
                        <option :value="direct_discharge_model[input]">Custom value</option>
                      </select>
                    </div>

                  </div>
                </v-col>
                <v-col cols="4">
                  <div>
                    <div>
                      <v-select
                          v-if="type_option[input]"
                          v-model="direct_discharge_model[input]"
                          item-text="text"
                          item-value="value"
                          :items="type_option[input].items"
                          label="Select"
                      >
                      </v-select>
                      <v-text-field
                          v-else
                          v-model="direct_discharge_model[input]"
                          :suffix=user_inputs[input].unit
                          type="number"
                      ></v-text-field>

                    </div>
                  </div>

                </v-col>

              </v-row>


            </div>

            <br>

            <v-tooltip bottom :disabled="!tab_3_disabled">
              <template v-slot:activator="{ on }">
                <div v-on="on" class="d-inline-block">
                  <v-btn
                      @click="tab_3_continue"
                      :disabled="tab_3_disabled"
                      tile
                      color="#b62373"

                  >
                    SAVE AND CONTINUE
                  </v-btn>
                </div>
              </template>
              <span>Please, fill in the required items before continue.</span>
            </v-tooltip>

          </v-stepper-content>  <!-- Direct discharge -->

          <v-stepper-content step="4" >

            <div v-if="industry.has_offsite_wwtp == 1 && stepper_model == 4">
              <v-row
                  align="center"
                  v-for = "input in array_intersection(offsite_wwtp_inputs, basic_inputs)"
                  :key="input"

              >
                <v-col cols="8" >
                  <div style="width: 100%;">
                    <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                      <span>
                        <span v-if="input === 'wwt_vol_trea'">
                          Volume of industrial wastewater sent to the offsite WWTP every day
                        </span>
                        <span v-else>
                          {{user_inputs[input].question}}
                        </span>
                        <v-tooltip bottom v-if="required.includes(input)">
                          <template v-slot:activator="{ on, attrs }">
                              <span
                                  v-bind="attrs"
                                  v-on="on"
                                  style="color: red"
                              >*</span>
                          </template>
                          <span>Required input</span>
                        </v-tooltip>
                      </span>
                      <v-btn v-if="button_estimation.includes(input) && !isNaN(button_estimations(input)) && button_estimations(input) != null"
                             tile
                             color="#b62373"
                             x-small
                             @click="offsite_wwtp_model[input] = button_estimations(input)"
                      >
                        Estimation:  {{parseFloat(button_estimations(input)).toExponential(3)}}<!-- Botó amb estimació -->
                      </v-btn>
                    </div>
                    <div v-if="select_estimation.includes(input)" style="width: 100%">
                      <select v-model = "offsite_wwtp_model[input]" style="max-width:90%;background-color: #d9d9d5; width: 90%; -webkit-appearance: menulist"  >
                        <option
                            v-for="item in select_estimations(input)"
                            :value="item.value"
                        >
                          <!--Desplegable amb estimació-->
                          {{item.name}} ({{item.value.toFixed(3)}})
                        </option>
                        <option :value="offsite_wwtp_model[input]">Custom value</option>
                      </select>
                    </div>

                  </div>
                </v-col>
                <v-col cols="4">
                  <div>
                    <div>
                      <v-select
                          v-if="type_option[input]"
                          v-model="offsite_wwtp_model[input]"
                          item-text="text"
                          item-value="value"
                          :items="type_option[input].items"
                          label="Select"
                      >
                      </v-select>
                      <v-text-field
                          v-else
                          v-model="offsite_wwtp_model[input]"
                          :suffix=user_inputs[input].unit
                          type="number"
                      ></v-text-field>

                    </div>
                  </div>

                </v-col>

              </v-row>
              <v-expansion-panels style="padding-top: 20px">
                <v-expansion-panel>
                  <v-expansion-panel-header color="#1c195b">
                    <h3 style="color: white">SHOW ADVANCED INPUTS</h3>
                    <template v-slot:actions>
                      <v-icon color="white">
                        $expand
                      </v-icon>
                    </template>
                  </v-expansion-panel-header>
                  <v-expansion-panel-content style="padding: 30px">
                    <v-expansion-panels style="padding-top: 20px">
                      <v-expansion-panel>
                        <v-expansion-panel-header >
                          <h3>Effluent pollution</h3>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content style="padding: 30px">
                          <v-row
                              align="center"
                              v-for = "pollutant in model_selected_pollutants"
                              :key="pollutant"

                          >
                            <v-col cols="8" >
                              <div style="width: 100%;">
                                <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                                  <span>
                                    Concentration of {{pollutant}} in the WWTP effluent
                                  </span>
                                  <v-btn v-if="button_estimation.includes('wwt_pollutants_effl') && !isNaN(button_estimations('wwt_pollutants_effl', pollutant)) && button_estimations('wwt_pollutants_effl', pollutant) != null"
                                         tile
                                         x-small
                                         color="#b62373"
                                         @click="offsite_wwtp_model['wwt_pollutants_effl'][pollutant] = button_estimations('wwt_pollutants_effl', pollutant)"
                                  >
                                    Estimation:  {{button_estimations('wwt_pollutants_effl', pollutant)}}<!-- Botó amb estimació -->
                                  </v-btn>

                                </div>

                              </div>
                            </v-col>
                            <v-col cols="4">
                              <v-text-field
                                  v-model="offsite_wwtp_model['wwt_pollutants_effl'][pollutant]"
                                  :suffix="user_inputs['wwt_pollutants_effl'].unit"
                                  type="number"
                              ></v-text-field>
                            </v-col>

                          </v-row>

                        </v-expansion-panel-content>
                      </v-expansion-panel>
                      <v-expansion-panel>
                        <v-expansion-panel-header >
                          <h3>Fuel engines</h3>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content style="padding: 30px">
                          <v-row
                              align="center"
                              v-for = "input in advanced_fuel_engines"
                              :key="input"

                          >
                            <v-col cols="8" >
                              <div style="width: 100%;">
                                <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                <span>
                  {{user_inputs[input].question}}
                </span>
                                  <v-btn v-if="button_estimation.includes(input) && !isNaN(button_estimations(input)) && button_estimations(input) != null"
                                         tile
                                         color="#b62373"
                                         x-small
                                         @click="offsite_wwtp_model[input] = button_estimations(input)"
                                  >
                                    Estimation:  {{button_estimations(input).toExponential(3)}}<!-- Botó amb estimació -->
                                  </v-btn>
                                </div>
                                <div v-if="select_estimation.includes(input)" style="width: 100%">
                                  <select v-model = "offsite_wwtp_model[input]" style="max-width:90%;background-color: #d9d9d5; width: 90%; -webkit-appearance: menulist"  >
                                    <option
                                        v-for="item in select_estimations(input)"
                                        :value="item.value"
                                    >
                                      <!--Desplegable amb estimació-->
                                      {{item.name}} ({{item.value.toFixed(3)}})
                                    </option>
                                    <option :value="offsite_wwtp_model[input]">Custom value</option>
                                  </select>
                                </div>

                              </div>
                            </v-col>
                            <v-col cols="4">
                              <div>
                                <div>
                                  <v-select
                                      v-if="type_option[input]"
                                      v-model="offsite_wwtp_model[input]"
                                      item-text="text"
                                      item-value="value"
                                      :items="type_option[input].items"
                                      label="Select"
                                  >
                                  </v-select>
                                  <v-text-field
                                      v-else
                                      v-model="offsite_wwtp_model[input]"
                                      :suffix=user_inputs[input].unit
                                      type="number"
                                  ></v-text-field>

                                </div>
                              </div>

                            </v-col>

                          </v-row>
                        </v-expansion-panel-content>
                      </v-expansion-panel>
                      <v-expansion-panel>
                        <v-expansion-panel-header >
                          <h3>Biogas produced from anaerobic digestion</h3>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content style="padding: 30px">
                          <v-row
                              align="center"
                              v-for = "input in advanced_biogas_from_anaerobic"
                              :key="input"

                          >
                            <v-col cols="8" >
                              <div style="width: 100%;">
                                <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                <span>
                  {{user_inputs[input].question}}
                </span>
                                  <v-btn v-if="button_estimation.includes(input) && !isNaN(button_estimations(input)) && button_estimations(input) != null"
                                         tile
                                         color="#b62373"
                                         x-small
                                         @click="offsite_wwtp_model[input] = button_estimations(input)"
                                  >
                                    Estimation:  {{button_estimations(input).toExponential(3)}}<!-- Botó amb estimació -->
                                  </v-btn>
                                </div>
                                <div v-if="select_estimation.includes(input)" style="width: 100%">
                                  <select v-model = "offsite_wwtp_model[input]" style="max-width:90%;background-color: #d9d9d5; width: 90%; -webkit-appearance: menulist"  >
                                    <option
                                        v-for="item in select_estimations(input)"
                                        :value="item.value"
                                    >
                                      <!--Desplegable amb estimació-->
                                      {{item.name}} ({{item.value.toFixed(3)}})
                                    </option>
                                    <option :value="offsite_wwtp_model[input]">Custom value</option>
                                  </select>
                                </div>

                              </div>
                            </v-col>
                            <v-col cols="4">
                              <div>
                                <div>
                                  <v-select
                                      v-if="type_option[input]"
                                      v-model="offsite_wwtp_model[input]"
                                      item-text="text"
                                      item-value="value"
                                      :items="type_option[input].items"
                                      label="Select"
                                  >
                                  </v-select>
                                  <v-text-field
                                      v-else
                                      v-model="offsite_wwtp_model[input]"
                                      :suffix=user_inputs[input].unit
                                      type="number"
                                  ></v-text-field>

                                </div>
                              </div>

                            </v-col>

                          </v-row>
                        </v-expansion-panel-content>
                      </v-expansion-panel>
                      <v-expansion-panel>
                        <v-expansion-panel-header >
                          <h3>Fuel used in water reuse trucks</h3>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content style="padding: 30px">
                          <v-row
                              align="center"
                              v-for = "input in advanced_water_reuse_trucks"
                              :key="input"

                          >
                            <v-col cols="8" >
                              <div style="width: 100%;">
                                <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                <span>
                  {{user_inputs[input].question}}
                </span>
                                  <v-btn v-if="button_estimation.includes(input) && !isNaN(button_estimations(input)) && button_estimations(input) != null"
                                         tile
                                         color="#b62373"
                                         x-small
                                         @click="offsite_wwtp_model[input] = button_estimations(input)"
                                  >
                                    Estimation:  {{button_estimations(input).toExponential(3)}}<!-- Botó amb estimació -->
                                  </v-btn>
                                </div>
                                <div v-if="select_estimation.includes(input)" style="width: 100%">
                                  <select v-model = "offsite_wwtp_model[input]" style="max-width:90%;background-color: #d9d9d5; width: 90%; -webkit-appearance: menulist"  >
                                    <option
                                        v-for="item in select_estimations(input)"
                                        :value="item.value"
                                    >
                                      <!--Desplegable amb estimació-->
                                      {{item.name}} ({{item.value.toFixed(3)}})
                                    </option>
                                    <option :value="offsite_wwtp_model[input]">Custom value</option>
                                  </select>
                                </div>

                              </div>
                            </v-col>
                            <v-col cols="4">
                              <div>
                                <div>
                                  <v-select
                                      v-if="type_option[input]"
                                      v-model="offsite_wwtp_model[input]"
                                      item-text="text"
                                      item-value="value"
                                      :items="type_option[input].items"
                                      label="Select"
                                  >
                                  </v-select>
                                  <v-text-field
                                      v-else
                                      v-model="offsite_wwtp_model[input]"
                                      :suffix=user_inputs[input].unit
                                      type="number"
                                  ></v-text-field>

                                </div>
                              </div>

                            </v-col>

                          </v-row>
                        </v-expansion-panel-content>
                      </v-expansion-panel>
                      <v-expansion-panel>
                        <v-expansion-panel-header >
                          <h3>Sludge storage in WWTP</h3>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content style="padding: 30px">
                          <v-row
                              align="center"
                              v-for = "input in advanced_sludge_Storage"
                              :key="input"

                          >
                            <v-col cols="8" >
                              <div style="width: 100%;">
                                <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                <span>
                  {{user_inputs[input].question}}
                </span>
                                  <v-btn v-if="button_estimation.includes(input) && !isNaN(button_estimations(input)) && button_estimations(input) != null"
                                         tile
                                         color="#b62373"
                                         x-small
                                         @click="offsite_wwtp_model[input] = button_estimations(input)"
                                  >
                                    Estimation:  {{button_estimations(input).toExponential(3)}}<!-- Botó amb estimació -->
                                  </v-btn>
                                </div>
                                <div v-if="select_estimation.includes(input)" style="width: 100%">
                                  <select v-model = "offsite_wwtp_model[input]" style="max-width:90%;background-color: #d9d9d5; width: 90%; -webkit-appearance: menulist"  >
                                    <option
                                        v-for="item in select_estimations(input)"
                                        :value="item.value"
                                    >
                                      <!--Desplegable amb estimació-->
                                      {{item.name}} ({{item.value.toFixed(3)}})
                                    </option>
                                    <option :value="offsite_wwtp_model[input]">Custom value</option>
                                  </select>
                                </div>

                              </div>
                            </v-col>
                            <v-col cols="4">
                              <div>
                                <div>
                                  <v-select
                                      v-if="type_option[input]"
                                      v-model="offsite_wwtp_model[input]"
                                      item-text="text"
                                      item-value="value"
                                      :items="type_option[input].items"
                                      label="Select"
                                  >
                                  </v-select>
                                  <v-text-field
                                      v-else
                                      v-model="offsite_wwtp_model[input]"
                                      :suffix=user_inputs[input].unit
                                      type="number"
                                  ></v-text-field>

                                </div>
                              </div>

                            </v-col>

                          </v-row>
                        </v-expansion-panel-content>
                      </v-expansion-panel>
                      <v-expansion-panel>
                        <v-expansion-panel-header >
                          <h3>Sludge composting in WWTP</h3>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content style="padding: 30px">
                          <v-row
                              align="center"
                              v-for = "input in advanced_sludge_composting"
                              :key="input"

                          >
                            <v-col cols="8" >
                              <div style="width: 100%;">
                                <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                <span>
                  {{user_inputs[input].question}}
                </span>
                                  <v-btn v-if="button_estimation.includes(input) && !isNaN(button_estimations(input)) && button_estimations(input) != null"
                                         tile
                                         color="#b62373"
                                         x-small
                                         @click="offsite_wwtp_model[input] = button_estimations(input)"
                                  >
                                    Estimation:  {{button_estimations(input).toExponential(3)}}<!-- Botó amb estimació -->
                                  </v-btn>
                                </div>
                                <div v-if="select_estimation.includes(input)" style="width: 100%">
                                  <select v-model = "offsite_wwtp_model[input]" style="max-width:90%;background-color: #d9d9d5; width: 90%; -webkit-appearance: menulist"  >
                                    <option
                                        v-for="item in select_estimations(input)"
                                        :value="item.value"
                                    >
                                      <!--Desplegable amb estimació-->
                                      {{item.name}} ({{item.value.toFixed(3)}})
                                    </option>
                                    <option :value="offsite_wwtp_model[input]">Custom value</option>
                                  </select>
                                </div>

                              </div>
                            </v-col>
                            <v-col cols="4">
                              <div>
                                <div>
                                  <v-select
                                      v-if="type_option[input]"
                                      v-model="offsite_wwtp_model[input]"
                                      item-text="text"
                                      item-value="value"
                                      :items="type_option[input].items"
                                      label="Select"
                                  >
                                  </v-select>
                                  <v-text-field
                                      v-else
                                      v-model="offsite_wwtp_model[input]"
                                      :suffix=user_inputs[input].unit
                                      type="number"
                                  ></v-text-field>

                                </div>
                              </div>

                            </v-col>

                          </v-row>
                        </v-expansion-panel-content>
                      </v-expansion-panel>
                      <v-expansion-panel>
                        <v-expansion-panel-header >
                          <h3>Sludge incineration</h3>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content style="padding: 30px">
                          <v-row
                              align="center"
                              v-for = "input in advanced_sludge_incineration"
                              :key="input"

                          >
                            <v-col cols="8" >
                              <div style="width: 100%;">
                                <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                <span>
                  {{user_inputs[input].question}}
                </span>
                                  <v-btn v-if="button_estimation.includes(input) && !isNaN(button_estimations(input)) && button_estimations(input) != null"
                                         tile
                                         color="#b62373"
                                         x-small
                                         @click="offsite_wwtp_model[input] = button_estimations(input)"
                                  >
                                    Estimation:  {{button_estimations(input).toExponential(3)}}<!-- Botó amb estimació -->
                                  </v-btn>
                                </div>
                                <div v-if="select_estimation.includes(input)" style="width: 100%">
                                  <select v-model = "offsite_wwtp_model[input]" style="max-width:90%;background-color: #d9d9d5; width: 90%; -webkit-appearance: menulist"  >
                                    <option
                                        v-for="item in select_estimations(input)"
                                        :value="item.value"
                                    >
                                      <!--Desplegable amb estimació-->
                                      {{item.name}} ({{item.value.toFixed(3)}})
                                    </option>
                                    <option :value="offsite_wwtp_model[input]">Custom value</option>
                                  </select>
                                </div>

                              </div>
                            </v-col>
                            <v-col cols="4">
                              <div>
                                <div>
                                  <v-select
                                      v-if="type_option[input]"
                                      v-model="offsite_wwtp_model[input]"
                                      item-text="text"
                                      item-value="value"
                                      :items="type_option[input].items"
                                      label="Select"
                                  >
                                  </v-select>
                                  <v-text-field
                                      v-else
                                      v-model="offsite_wwtp_model[input]"
                                      :suffix=user_inputs[input].unit
                                      type="number"
                                  ></v-text-field>

                                </div>
                              </div>

                            </v-col>

                          </v-row>
                        </v-expansion-panel-content>
                      </v-expansion-panel>
                      <v-expansion-panel>
                        <v-expansion-panel-header >
                          <h3>Sludge sent to dry application</h3>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content style="padding: 30px">
                          <v-row
                              align="center"
                              v-for = "input in advanced_application"
                              :key="input"

                          >
                            <v-col cols="8" >
                              <div style="width: 100%;">
                                <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                <span>
                  {{user_inputs[input].question}}
                </span>
                                  <v-btn v-if="button_estimation.includes(input) && !isNaN(button_estimations(input)) && button_estimations(input) != null"
                                         tile
                                         color="#b62373"
                                         x-small
                                         @click="offsite_wwtp_model[input] = button_estimations(input)"
                                  >
                                    Estimation:  {{button_estimations(input).toExponential(3)}}<!-- Botó amb estimació -->
                                  </v-btn>
                                </div>
                                <div v-if="select_estimation.includes(input)" style="width: 100%">
                                  <select v-model = "offsite_wwtp_model[input]" style="max-width:90%;background-color: #d9d9d5; width: 90%; -webkit-appearance: menulist"  >
                                    <option
                                        v-for="item in select_estimations(input)"
                                        :value="item.value"
                                    >
                                      <!--Desplegable amb estimació-->
                                      {{item.name}} ({{item.value.toFixed(3)}})
                                    </option>
                                    <option :value="offsite_wwtp_model[input]">Custom value</option>
                                  </select>
                                </div>

                              </div>
                            </v-col>
                            <v-col cols="4">
                              <div>
                                <div>
                                  <v-select
                                      v-if="type_option[input]"
                                      v-model="offsite_wwtp_model[input]"
                                      item-text="text"
                                      item-value="value"
                                      :items="type_option[input].items"
                                      label="Select"
                                  >
                                  </v-select>
                                  <v-text-field
                                      v-else
                                      v-model="offsite_wwtp_model[input]"
                                      :suffix=user_inputs[input].unit
                                      type="number"
                                  ></v-text-field>

                                </div>
                              </div>

                            </v-col>

                          </v-row>
                        </v-expansion-panel-content>
                      </v-expansion-panel>
                      <v-expansion-panel>
                        <v-expansion-panel-header >
                          <h3>Sludge landfilling</h3>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content style="padding: 30px">
                          <v-row
                              align="center"
                              v-for = "input in advanced_landfilling"
                              :key="input"

                          >
                            <v-col cols="8" >
                              <div style="width: 100%;">
                                <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                <span>
                  {{user_inputs[input].question}}
                </span>
                                  <v-btn v-if="button_estimation.includes(input) && !isNaN(button_estimations(input)) && button_estimations(input) != null"
                                         tile
                                         color="#b62373"
                                         x-small
                                         @click="offsite_wwtp_model[input] = button_estimations(input)"
                                  >
                                    Estimation:  {{button_estimations(input).toExponential(3)}}<!-- Botó amb estimació -->
                                  </v-btn>
                                </div>
                                <div v-if="select_estimation.includes(input)" style="width: 100%">
                                  <select v-model = "offsite_wwtp_model[input]" style="max-width:90%;background-color: #d9d9d5; width: 90%; -webkit-appearance: menulist"  >
                                    <option
                                        v-for="item in select_estimations(input)"
                                        :value="item.value"
                                    >
                                      <!--Desplegable amb estimació-->
                                      {{item.name}} ({{item.value.toFixed(3)}})
                                    </option>
                                    <option :value="offsite_wwtp_model[input]">Custom value</option>
                                  </select>
                                </div>

                              </div>
                            </v-col>
                            <v-col cols="4">
                              <div>
                                <div>
                                  <v-select
                                      v-if="type_option[input]"
                                      v-model="offsite_wwtp_model[input]"
                                      item-text="text"
                                      item-value="value"
                                      :items="type_option[input].items"
                                      label="Select"
                                  >
                                  </v-select>
                                  <v-text-field
                                      v-else
                                      v-model="offsite_wwtp_model[input]"
                                      :suffix=user_inputs[input].unit
                                      type="number"
                                  ></v-text-field>

                                </div>
                              </div>

                            </v-col>

                          </v-row>
                        </v-expansion-panel-content>
                      </v-expansion-panel>
                      <v-expansion-panel>
                        <v-expansion-panel-header >
                          <h3>Sludge stockpiling</h3>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content style="padding: 30px">
                          <v-row
                              align="center"
                              v-for = "input in advanced_stockpiling"
                              :key="input"

                          >
                            <v-col cols="8" >
                              <div style="width: 100%;">
                                <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                <span>
                  {{user_inputs[input].question}}
                </span>
                                  <v-btn v-if="button_estimation.includes(input) && !isNaN(button_estimations(input)) && button_estimations(input) != null"
                                         tile
                                         color="#b62373"
                                         x-small
                                         @click="offsite_wwtp_model[input] = button_estimations(input)"
                                  >
                                    Estimation:  {{button_estimations(input).toExponential(3)}}<!-- Botó amb estimació -->
                                  </v-btn>
                                </div>
                                <div v-if="select_estimation.includes(input)" style="width: 100%">
                                  <select v-model = "offsite_wwtp_model[input]" style="max-width:90%;background-color: #d9d9d5; width: 90%; -webkit-appearance: menulist"  >
                                    <option
                                        v-for="item in select_estimations(input)"
                                        :value="item.value"
                                    >
                                      <!--Desplegable amb estimació-->
                                      {{item.name}} ({{item.value.toFixed(3)}})
                                    </option>
                                    <option :value="offsite_wwtp_model[input]">Custom value</option>
                                  </select>
                                </div>

                              </div>
                            </v-col>
                            <v-col cols="4">
                              <div>
                                <div>
                                  <v-select
                                      v-if="type_option[input]"
                                      v-model="offsite_wwtp_model[input]"
                                      item-text="text"
                                      item-value="value"
                                      :items="type_option[input].items"
                                      label="Select"
                                  >
                                  </v-select>
                                  <v-text-field
                                      v-else
                                      v-model="offsite_wwtp_model[input]"
                                      :suffix=user_inputs[input].unit
                                      type="number"
                                  ></v-text-field>

                                </div>
                              </div>

                            </v-col>

                          </v-row>
                        </v-expansion-panel-content>
                      </v-expansion-panel>
                      <v-expansion-panel>
                        <v-expansion-panel-header >
                          <h3>Sludge truck transportation to disposal site</h3>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content style="padding: 30px">
                          <v-row
                              align="center"
                              v-for = "input in advanced_truck_transportation"
                              :key="input"

                          >
                            <v-col cols="8" >
                              <div style="width: 100%;">
                                <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                <span>
                  {{user_inputs[input].question}}
                </span>
                                  <v-btn v-if="button_estimation.includes(input) && !isNaN(button_estimations(input)) && button_estimations(input) != null"
                                         tile
                                         color="#b62373"
                                         x-small
                                         @click="offsite_wwtp_model[input] = button_estimations(input)"
                                  >
                                    Estimation:  {{button_estimations(input).toExponential(3)}}<!-- Botó amb estimació -->
                                  </v-btn>
                                </div>
                                <div v-if="select_estimation.includes(input)" style="width: 100%">
                                  <select v-model = "offsite_wwtp_model[input]" style="max-width:90%;background-color: #d9d9d5; width: 90%; -webkit-appearance: menulist"  >
                                    <option
                                        v-for="item in select_estimations(input)"
                                        :value="item.value"
                                    >
                                      <!--Desplegable amb estimació-->
                                      {{item.name}} ({{item.value.toFixed(3)}})
                                    </option>
                                    <option :value="offsite_wwtp_model[input]">Custom value</option>
                                  </select>
                                </div>

                              </div>
                            </v-col>
                            <v-col cols="4">
                              <div>
                                <div>
                                  <v-select
                                      v-if="type_option[input]"
                                      v-model="offsite_wwtp_model[input]"
                                      item-text="text"
                                      item-value="value"
                                      :items="type_option[input].items"
                                      label="Select"
                                  >
                                  </v-select>
                                  <v-text-field
                                      v-else
                                      v-model="offsite_wwtp_model[input]"
                                      :suffix=user_inputs[input].unit
                                      type="number"
                                  ></v-text-field>

                                </div>
                              </div>

                            </v-col>

                          </v-row>
                        </v-expansion-panel-content>
                      </v-expansion-panel>
                    </v-expansion-panels>

                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>


            </div>
            <br>
            <v-tooltip bottom :disabled="!tab_4_disabled">
              <template v-slot:activator="{ on }">
                <div v-on="on" class="d-inline-block">
                  <v-btn
                      @click="tab_4_continue"
                      :disabled="tab_4_disabled"
                      tile
                      color="#b62373"

                  >
                    SAVE AND CONTINUE
                  </v-btn>
                </div>
              </template>
              <span>Please, fill in the required items before continue.</span>
            </v-tooltip>

          </v-stepper-content>  <!-- offsite wwtp -->

          <v-stepper-content step="5">

            <h3>
              You have finished entering all the required data, but you can continue editing them if you wish.
            </h3>
            <br>
            <br>

            <router-link :to="{name: 'report'}" style="text-decoration: none">
              <v-hover
                  v-slot="{ hover }"
              >
                <h3 :class="`${hover? 'link_to_report_hovered': 'link_to_report'}`">
                  Click here to see the report
                </h3>

              </v-hover>


            </router-link>


          </v-stepper-content>  <!-- End of questionnaire -->

        </v-stepper-items>

    </v-stepper>

    <v-dialog
        v-model="direct_discharge_modal"
        width="900"
        scrollable
    >
      <div style="background-color: white; ">

        <v-card flat style="padding: 40px">
          In order to calculate some statistics, we need to know some inputs from the industry.
          We have divided them into different screens, depending on whether they relate to one part of the water treatment cycle or another.

          <br><br>
          In the <b>first step</b>, we ask inputs related to the industry in general. Depending on the answers here, the questions in the other screens will vary slightly.
          <br>
          <v-row style="padding: 10px 0px 10px 0px">
            <v-img
                :src="water_withdrawal_image"
            ></v-img>
          </v-row>

          In the <b>second step</b>, the questions are related to the treatment in the in-site WWTP (as well as the volume of water reused, or water also discharged and treated in an external treatment plant).

          <v-row style="padding: 0px 0px 0px 0px">
            <v-col>
              <v-img
                  :src="onsite_external_image"
              ></v-img>
            </v-col>
          </v-row>

          The <b>third step</b> is related to water directly discharged to the receiving water body (untreated water).

          <v-row style="padding: 0px 0px 0px 0px">
            <v-col>
              <v-img
                  :src="direct_discharge_image"
              ></v-img>
            </v-col>
          </v-row>

          Finally, the <b>fourth screen</b> contains inputs related to the external treatment plant (and the water sent from the on-site treatment plant, if any).

          <v-row style="padding: 0px 0px 0px 0px">
            <v-col>
              <v-img
                  :src="external_internal_image"
              ></v-img>
            </v-col>
          </v-row>

          <b>Notes:</b>
          <br>
          <ul>
            <li>The information is not saved until the "save and continue" button is pressed.</li>
            <li>Although it is not mandatory, the water balance in the treatment plants should be maintained: the amount of water that is treated is the same as the amount that comes out.</li>

          </ul>

        </v-card>

      </div>
    </v-dialog>


  </div>
</template>

<script>

import {
  Assessment,
  Industry,
  Tables
} from "../ecam_backend";
import {
  user_inputs,
  onsite_wwtp_no_offsite,
  onsite_wwtp_with_offsite_wwtp_inputs,
  direct_discharge_inputs,
  offsite_wwtp_inputs,
  industry_inputs
} from "../user_inputs";
import Vue from 'vue'
import {utils, metrics} from "../utils"
import standard_industries_classification from "../standard_industrial_classification"
import Countries from "@/countries";
import conversion_factors from "@/conversion_factors";


export default {
  name: "new_assessment",
  props: ['assessment_id', 'industry_id'],
  components: {
    Industry,
    Assessment,
  },
  data() {

    let defaultIndustry = this.$assessments[this.assessment_id].industries[this.industry_id]

    return {
      industry_type: null,

      assessment: this.$assessments[this.assessment_id],
      industry: defaultIndustry,

      stepper_model: 1,
      water_withdrawal_image: require("@/../public/water_flow/water_withdrawal.jpg"),
      onsite_no_external_image: require("@/../public/water_flow/onsite_no_external.jpg"),
      onsite_external_image: require("@/../public/water_flow/onsite_external.jpg"),
      direct_discharge_image: require("@/../public/water_flow/direct_discharge.jpg"),
      external_no_internal_image: require("@/../public/water_flow/external_no_internal.jpg"),
      external_internal_image: require("@/../public/water_flow/external_internal.jpg"),


      global_layers: utils.format_layer_description(Vue.prototype.$layers_description),
      cod_to_bod: 2.4,
      industry_typologies: standard_industries_classification,

      user_inputs: user_inputs,
      onsite_wwtp_inputs: [],
      industry_inputs: industry_inputs,
      direct_discharge_inputs: direct_discharge_inputs,
      offsite_wwtp_inputs: offsite_wwtp_inputs,
      onsite_wwtp_with_offsite_wwtp_inputs: onsite_wwtp_with_offsite_wwtp_inputs,
      onsite_wwtp_no_offsite: onsite_wwtp_no_offsite,

      type_option: {
        "has_onsite_wwtp": {items: Tables["Yes/No"]},
        "has_direct_discharge": {items: Tables["Yes/No"]},
        "has_offsite_wwtp": {items: Tables["Yes/No"]},
        "industry_type": {items: standard_industries_classification},
        "wwt_treatment_type": {items: Tables["WW treatment type"]},
        "wwt_fuel_typ": {items: Tables["Fuel type options"]},
        "wwt_dige_typ": {items: Tables["Fuel type options"]},
        "wwt_reus_trck_typ": {items: Tables["Fuel type options"]},
        "wwt_slu_comp_emis_treated_or_piles_covered": {items: Tables["Yes/No"]},
        "wwt_slu_inc_SNCR": {items: Tables["Yes/No"]},
        "wwt_trck_typ": {items: Tables["Fuel type options"]},
      },
      button_estimation: ["ind_pollutants_effl", "wwt_vol_disc", "wwt_vol_treated_external", "wwt_vol_reused", "wwt_pollutants_effl", "wwt_cod_effl", "wwt_tn_effl", "wwt_tp_effl", "wwt_diclo_effl", "wwt_cadmium_effl", "wwt_hexaclorobenzene_effl", "wwt_mercury_effl", "wwt_plomo_effl", "wwt_niquel_effl", "wwt_chloro_effl", "wwt_hexaclorobutadie_effl", "wwt_nonilfenols_effl", "wwt_tetracloroetile_effl", "wwt_tricloroetile_effl", "wwt_conv_kwh",
        "wwt_biog_pro", "wwt_biog_fla", "wwt_biog_val", "wwt_biog_lkd", "wwt_biog_sold", "wwt_ch4_biog", "wwt_slu_comp_low_CN_EF", "wwt_slu_comp_seqst_rate", "wwt_slu_comp_uncovered_pile_EF", "wwt_temp_inc", "wwt_slu_lf_uncertainty", "wwt_slu_lf_CH4_in_gas", "wwt_slu_lf_DOCf", "wwt_slu_lf_decomp_3yr", "wwt_slu_lf_low_CN_EF" ],
      select_estimation: ["wwt_cod_slud", "wwt_ch4_efac_dis", "wwt_ch4_efac_tre", "wwt_n2o_efac_tre", "wwt_n2o_efac_dis", "wwt_slu_sto_TVS", "wwt_slu_sto_f_CH4", "wwt_slu_sto_f_CH4", "wwt_slu_comp_N_cont", "wwt_slu_comp_TVS", "wwt_slu_inc_N_cont", "wwt_slu_la_TVS", "wwt_slu_la_N_cont", "wwt_slu_la_EF", "wwt_slu_lf_TVS", "wwt_slu_lf_MCF", "wwt_slu_lf_N_cont"],
      basic_inputs: ["pollutants_list", "ind_pollutants_effl", "wwt_treatment_type", "wwt_vol_trea", "wwt_vol_disc", "dd_vol_disc", "wwt_vol_reused", "wwt_vol_treated_external", "wwt_ch4_efac_tre", "wwt_n2o_efac_tre", "wwt_ch4_efac_dis", "wwt_n2o_efac_dis", "volume_withdrawn", "volume_withdrawn_groundwater", "has_onsite_wwtp", "has_direct_discharge", "has_offsite_wwtp", "industry_type", "product_produced", "ind_cod_effl", "ind_tn_effl", "ind_tp_effl", "wwt_nrg_cons", "wwt_conv_kwh", "wwt_mass_slu", "wwt_cod_slud"],
      advanced_pollution_effluent: ["wwt_diclo_effl", "wwt_cadmium_effl", "wwt_hexaclorobenzene_effl", "wwt_mercury_effl", "wwt_plomo_effl", "wwt_niquel_effl", "wwt_chloro_effl", "wwt_hexaclorobutadie_effl", "wwt_nonilfenols_effl", "wwt_tetracloroetile_effl", "wwt_tricloroetile_effl"],
      advanced_fuel_engines: ["wwt_fuel_typ", "wwt_vol_fuel"],
      advanced_biogas_from_anaerobic: ["wwt_biog_pro", "wwt_biog_fla", "wwt_biog_val", "wwt_biog_lkd", "wwt_biog_sold", "wwt_ch4_biog", "wwt_dige_typ", "wwt_fuel_dig"],
      advanced_water_reuse_trucks: ["wwt_reus_trck_typ", "wwt_reus_vol_trck"],
      advanced_sludge_Storage: ["wwt_mass_slu_sto", "wwt_time_slu_sto", "wwt_slu_sto_TVS", "wwt_slu_sto_f_CH4", "wwt_slu_sto_EF",],
      advanced_sludge_composting: ["wwt_mass_slu_comp", "wwt_slu_comp_emis_treated_or_piles_covered", "wwt_slu_comp_solids_content", "wwt_slu_comp_TVS", "wwt_slu_comp_N_cont", "wwt_slu_comp_low_CN_EF", "wwt_slu_comp_uncovered_pile_EF", "wwt_slu_comp_seqst_rate",],
      advanced_sludge_incineration: ["wwt_mass_slu_inc", "wwt_temp_inc", "wwt_slu_inc_N_cont", "wwt_slu_inc_SNCR"],
      advanced_application: ["wwt_mass_slu_app", "wwt_slu_la_solids_content", "wwt_slu_la_TVS", "wwt_slu_la_N_cont", "wwt_slu_la_EF",],
      advanced_landfilling: ["wwt_mass_slu_land", "wwt_slu_lf_TVS", "wwt_slu_lf_uncertainty", "wwt_slu_lf_CH4_in_gas", "wwt_slu_lf_DOCf", "wwt_slu_lf_decomp_3yr", "wwt_slu_lf_MCF", "wwt_slu_lf_N_cont", "wwt_slu_lf_low_CN_EF"],
      advanced_stockpiling: ["wwt_mass_slu_stock", "wwt_slu_sp_lifespan"],
      advanced_truck_transportation: ["wwt_trck_typ", "wwt_vol_tslu"],


      required: ["volume_withdrawn", "product_produced", "has_onsite_wwtp", "has_offsite_wwtp", "has_direct_discharge", "industry_type", "wwt_vol_trea", "wwt_vol_disc", "dd_vol_disc" ],
      industry_model: {},
      onsite_wwtp_model: {},
      direct_discharge_model: {},
      offsite_wwtp_model: {},

      direct_discharge_modal: false,

      model_selected_pollutants: defaultIndustry.pollutants_selected,
      items_selected_pollutants: ["COD", "TN", "TP", '1,2-Dichloroethane', 'Cadmium', 'Hexaclorobenzene', 'Mercury', 'Lead', 'Nickel', 'Chloroalkanes', 'Hexachlorobutadiene', 'Nonylphenols', 'Tetrachloroethene', 'Trichloroethylene'],
      search_pollutant: null,


    }
  },
  created() {

    if (this.industry === undefined) this.$router.push('/')

    for (let industry_input of this.industry_inputs) {

      if (industry_input == "ind_pollutants_effl" || industry_input == "ind_pollutants_infl"){  //Deep copy of variables  that are objects
        this.$set(this.industry_model, industry_input, Object.assign({}, this.industry[industry_input]))
      }else this.$set(this.industry_model, industry_input, this.industry[industry_input])
    }

    for (let input of this.direct_discharge_inputs) {
      this.$set(this.direct_discharge_model, input, this.industry.direct_discharge[input])
    }
    for (let input of this.offsite_wwtp_inputs) {
      if (input == "wwt_pollutants_effl"){  //Deep copy of variables  that are objects
        this.$set(this.offsite_wwtp_model, input, Object.assign({}, this.industry.offsite_wwtp[input]))
      }else this.$set(this.offsite_wwtp_model, input, this.industry.offsite_wwtp[input])

    }
    for (let input of this.onsite_wwtp_with_offsite_wwtp_inputs) {
      if (input == "wwt_pollutants_effl"){  //Deep copy of variables  that are objects
        this.$set(this.onsite_wwtp_model, input, Object.assign({}, this.industry.onsite_wwtp[input]))
      }else this.$set(this.onsite_wwtp_model, input, this.industry.onsite_wwtp[input])
    }



  },
  watch: {


    //Changed step in the questionnaire, if step is onsite WWTP add or don't inputs related to offsite WWTP
    stepper_model(step){

      this.scrollToTop()
      let _this = this
      if(step == 2){

        this.onsite_wwtp_inputs.splice(0, this.onsite_wwtp_inputs.length)

        if(this.industry.has_offsite_wwtp == 1) {
          this.onsite_wwtp_with_offsite_wwtp_inputs.forEach(input => {
            _this.onsite_wwtp_inputs.push(input)
          })
        }else{
          this.onsite_wwtp_no_offsite.forEach(input => {
            _this.onsite_wwtp_inputs.push(input)
          })
        }

        for (let item of this.model_selected_pollutants){
          if (!this.onsite_wwtp_model["wwt_pollutants_effl"].hasOwnProperty(item)){
              this.$set(this.onsite_wwtp_model["wwt_pollutants_effl"], item, 0)
          }
        }
      }
      else if (step == 4){
        for (let item of this.model_selected_pollutants){
          if (!this.offsite_wwtp_model["wwt_pollutants_effl"].hasOwnProperty(item)){
            this.$set(this.offsite_wwtp_model["wwt_pollutants_effl"], item, 0)
          }
        }
      }
    },

    //Changed current  industry
    industry_id: function (industry_id) {
      this.industry = this.$assessments[this.assessment_id].industries[this.industry_id]
    },

    //Changed current assessment
    assessment_id: function (assessment_id) {
      this.industry = this.$assessments[this.assessment_id].industries[this.industry_id]
    },

    //Changed industry
    industry: function (industry) {
      if (industry === undefined) {
        this.$router.push('/')
      }

      location.href = "#";
      location.href = "#top";


      for (let industry_input of this.industry_inputs) {
        this.industry_model[industry_input] = this.industry[industry_input]
      }
      for (let input of this.direct_discharge_inputs) {
        this.direct_discharge_model[input] = this.industry.direct_discharge[input]
      }
      for (let input of this.offsite_wwtp_inputs) {
        this.offsite_wwtp_model[input] = this.industry.offsite_wwtp[input]
      }
      for (let input of this.onsite_wwtp_with_offsite_wwtp_inputs) {
        this.onsite_wwtp_model[input] = this.industry.onsite_wwtp[input]
      }

      this.model_selected_pollutants = industry.pollutants_selected

      this.stepper_model = 1

    },
  },

  //Change in pollutant selector
  methods: {

    onChangeCombobox(items){

      //Prevent users deleteing COD, TN or TP
      if(!items.includes("COD")){
        this.model_selected_pollutants.splice(0, 0, "COD");
        return
      }
      if(!items.includes("TN")){
        this.model_selected_pollutants.splice(1, 0, "TN");
        return
      }
      if(!items.includes("TP")){
        this.model_selected_pollutants.splice(2, 0, "TP");
        return
      }


      for (let item of items){
        if (!Object.keys(this.industry_model["ind_pollutants_effl"]).includes(item) ){
          this.$set(this.industry_model["ind_pollutants_effl"], item, 0)
        }
        if (!Object.keys(this.industry_model["ind_pollutants_infl"]).includes(item)){
          this.$set(this.industry_model["ind_pollutants_infl"], item, 0)
        }
      }
    },
    remove_chip (itemText) {

      if (itemText === 'COD') {
        return;
      } else {
        this.model_selected_pollutants.forEach(obj => {
          if (obj === itemText) {
            this.model_selected_pollutants.splice(this.model_selected_pollutants.indexOf(obj), 1)
          }
        })
        this.model_selected_pollutants = [...this.model_selected_pollutants]
      }
    },
    scrollToTop() {
      location.href = "#";
      location.href = "#top";
    },

    array_intersection(arrA, arrB){
      let intersection = arrA.filter(x => arrB.includes(x));
      return intersection
    },

    array_difference(arrA, arrB){
      let difference = arrA.filter(x => !arrB.includes(x));
      return difference
    },

    //Effluent concentration of WWTP after receiving water from other WWTP (if any) and water from industry (if any) and applying treatment
    concentration_effluent_load(pollutant_ind, pollutant_wwtp, pollutant_table){

      let wwtp = this.industry.onsite_wwtp
      let wwtp_model = this.onsite_wwtp_model
      if(this.stepper_model == 4){
        wwtp = this.industry.offsite_wwtp
        wwtp_model = this.offsite_wwtp_model
      }

      let influent_load = wwtp_model.wwt_vol_trea*wwtp["wwt_pollutants_infl_ind"][pollutant_ind] + wwtp.wwt_vol_from_external*wwtp["wwt_pollutants_infl_wwtp"][pollutant_wwtp]
      let flowstream = Number(wwtp_model.wwt_vol_trea) + wwtp.wwt_vol_from_external

      let loadEffl = Tables["WW treatment organics removal fractions (centralised) (Table 6.6B and 6.10C)"][wwtp_model.wwt_treatment_type][pollutant_table]*influent_load/flowstream
      return Number(loadEffl)
    },

    //Button estimations
    button_estimations(code, args = null){
      let industry_model = this.industry_model
      let industry = this.industry
      let stepper_model = this.stepper_model
      let wwtp_model = this.onsite_wwtp_model
      let wwtp = industry.onsite_wwtp
      if(stepper_model == 4){
        wwtp_model = this.offsite_wwtp_model
        wwtp = industry.offsite_wwtp
      }
      let _this = this

      let estimations = {
        wwt_vol_disc: function(){
          if(stepper_model == 2){
            return wwtp_model.wwt_vol_trea - wwtp_model.wwt_vol_reused - wwtp_model.wwt_vol_treated_external
          }else if(stepper_model == 3){
            return null
          }else if(stepper_model == 4){

            if (wwtp_model.wwt_vol_trea == null) return wwtp.wwt_vol_from_external
            else return parseFloat(wwtp_model.wwt_vol_trea) + wwtp.wwt_vol_from_external
          }

        },
        wwt_vol_reused: function(){
          if(stepper_model == 2){
            return wwtp_model.wwt_vol_trea - wwtp_model.wwt_vol_disc - wwtp_model.wwt_vol_treated_external
          }
          return null

        },
        wwt_vol_treated_external: function(){
          if(stepper_model == 2){
            return wwtp_model.wwt_vol_trea - wwtp_model.wwt_vol_disc - wwtp_model.wwt_vol_reused
          }
          return null

        },
        ind_pollutants_effl: function(pollutant){
          if (pollutant == "COD"){
            if(industry_model.industry_type === 1){  //noves categories
              return 336.2591324200910/2.4
            }else if(industry_model.industry_type === 2){  //noves categories
              return 231.09062980030700/2.4
            }else if(industry_model.industry_type === 4){  //noves categories
              return 410.09920634920627/2.4
            }else if(industry_model.industry_type === 5){  //noves categories
              return 40/2.4
            }else if(industry_model.industry_type === 6){  //noves categories
              return null
            }else if(industry_model.industry_type === 7){  //noves categories
              return 33.333333333333336/2.4
            }else if(industry_model.industry_type === 8){  //noves categories
              return 366.27272727272725/2.4
            }else if(industry_model.industry_type === 9){  //noves categories
              return 750/2.4
            }else if(industry_model.industry_type === 10){  //noves categories
              return 300/2.4
            }else if(industry_model.industry_type === 11){  //noves categories
              return 598.8096590909091/2.4
            }else if(industry_model.industry_type === 12){  //noves categories
              return 559.8717948717948/2.4
            }else if(industry_model.industry_type === 13){  //noves categories
              return 603.1034482758621/2.4
            }else if(industry_model.industry_type === 14){  //noves categories
              return 59.03846153846154/2.4
            }else if(industry_model.industry_type === 15){  //noves categories
              return 586.5384615384615/2.4
            }else if(industry_model.industry_type === 16){  //noves categories
              return 641.4117647058823/2.4
            }else if(industry_model.industry_type === 17){  //noves categories
              return 33.333333333333336/2.4
            }else if(industry_model.industry_type === 18){  //noves categories
              return 86.66666666666667/2.4
            }else if(industry_model.industry_type === 19){  //noves categories
              return 328.75/2.4
            }else if(industry_model.industry_type === 20){  //noves categories
              return 563.1578947368421/2.4
            }else if(industry_model.industry_type === 21){  //noves categories
              return null
            }else if(industry_model.industry_type === 22){  //noves categories
              return 35/2.4
            }else if(industry_model.industry_type === 23){  //noves categories
              return 35/2.4
            }else if(industry_model.industry_type === 24){  //noves categories
              return 40/2.4
            }else return null

          }
          else if (pollutant == "TN"){
            if(industry_model.industry_type === 1){  //noves categories
              return 12.95454545
            }else if(industry_model.industry_type === 2){  //noves categories
              return  null
            }else if(industry_model.industry_type === 4){  //noves categories
              return  null
            }else if(industry_model.industry_type === 5){  //noves categories
              return  null
            }else if(industry_model.industry_type === 6){  //noves categories
              return null
            }else if(industry_model.industry_type === 7){  //noves categories
              return  null
            }else if(industry_model.industry_type === 8){  //noves categories
              return  null
            }else if(industry_model.industry_type === 9){  //noves categories
              return 90
            }else if(industry_model.industry_type === 10){  //noves categories
              return  null
            }else if(industry_model.industry_type === 11){  //noves categories
              return  null
            }else if(industry_model.industry_type === 12){  //noves categories
              return  null
            }else if(industry_model.industry_type === 13){  //noves categories
              return  null
            }else if(industry_model.industry_type === 14){  //noves categories
              return 18.4374
            }else if(industry_model.industry_type === 15){  //noves categories
              return  null
            }else if(industry_model.industry_type === 16){  //noves categories
              return 70
            }else if(industry_model.industry_type === 17){  //noves categories
              return  null
            }else if(industry_model.industry_type === 18){  //noves categories
              return  null
            }else if(industry_model.industry_type === 19){  //noves categories
              return  null
            }else if(industry_model.industry_type === 20){  //noves categories
              return  null
            }else if(industry_model.industry_type === 21){  //noves categories
              return null
            }else if(industry_model.industry_type === 22){  //noves categories
              return  null
            }else if(industry_model.industry_type === 23){  //noves categories
              return  null
            }else if(industry_model.industry_type === 24){  //noves categories
              return  null
            }else return null

          }
          else if (pollutant == "TP"){
            if(industry_model.industry_type === 1){  //noves categories
              return 26.10771604938271
            }else if(industry_model.industry_type === 2){  //noves categories
              return  20.452873563218382
            }else if(industry_model.industry_type === 4){  //noves categories
              return  32.58536585365854
            }else if(industry_model.industry_type === 5){  //noves categories
              return  10
            }else if(industry_model.industry_type === 6){  //noves categories
              return null
            }else if(industry_model.industry_type === 7){  //noves categories
              return  10
            }else if(industry_model.industry_type === 8){  //noves categories
              return  27.528301886792452
            }else if(industry_model.industry_type === 9){  //noves categories
              return 40.19230769230769
            }else if(industry_model.industry_type === 10){  //noves categories
              return  30
            }else if(industry_model.industry_type === 11){  //noves categories
              return  39.810956790123456
            }else if(industry_model.industry_type === 12){  //noves categories
              return  35.96774193548387
            }else if(industry_model.industry_type === 13){  //noves categories
              return  35.0032786885246
            }else if(industry_model.industry_type === 14){  //noves categories
              return 11.279069767441861
            }else if(industry_model.industry_type === 15){  //noves categories
              return  10
            }else if(industry_model.industry_type === 16){  //noves categories
              return 40.870535714285715
            }else if(industry_model.industry_type === 17){  //noves categories
              return  10
            }else if(industry_model.industry_type === 18){  //noves categories
              return  25.714285714285715
            }else if(industry_model.industry_type === 19){  //noves categories
              return  32.857142857142854
            }else if(industry_model.industry_type === 20){  //noves categories
              return  39.25
            }else if(industry_model.industry_type === 21){  //noves categories
              return null
            }else if(industry_model.industry_type === 22){  //noves categories
              return  10
            }else if(industry_model.industry_type === 23){  //noves categories
              return  38.75
            }else if(industry_model.industry_type === 24){  //noves categories
              return  10
            }else return null

          }
          else if (pollutant == "1,2-Dichloroethane"){
            if(industry_model.industry_type === 1){  //noves categories
              return null
            }else if(industry_model.industry_type === 2){  //noves categories
              return  null
            }else if(industry_model.industry_type === 4){  //noves categories
              return  null
            }else if(industry_model.industry_type === 5){  //noves categories
              return  null
            }else if(industry_model.industry_type === 6){  //noves categories
              return null
            }else if(industry_model.industry_type === 7){  //noves categories
              return  null
            }else if(industry_model.industry_type === 8){  //noves categories
              return  100*1e-3
            }else if(industry_model.industry_type === 9){  //noves categories
              return null
            }else if(industry_model.industry_type === 10){  //noves categories
              return  null
            }else if(industry_model.industry_type === 11){  //noves categories
              return  647.13333333333*1e-3
            }else if(industry_model.industry_type === 12){  //noves categories
              return  null
            }else if(industry_model.industry_type === 13){  //noves categories
              return  null
            }else if(industry_model.industry_type === 14){  //noves categories
              return null
            }else if(industry_model.industry_type === 15){  //noves categories
              return  null
            }else if(industry_model.industry_type === 16){  //noves categories
              return null
            }else if(industry_model.industry_type === 17){  //noves categories
              return  null
            }else if(industry_model.industry_type === 18){  //noves categories
              return  null
            }else if(industry_model.industry_type === 19){  //noves categories
              return  null
            }else if(industry_model.industry_type === 20){  //noves categories
              return  null
            }else if(industry_model.industry_type === 21){  //noves categories
              return null
            }else if(industry_model.industry_type === 22){  //noves categories
              return  null
            }else if(industry_model.industry_type === 23){  //noves categories
              return  null
            }else if(industry_model.industry_type === 24){  //noves categories
              return  null
            }else return null

          }
          else if (pollutant == "Cadmium"){
            if(industry_model.industry_type === 1){  //noves categories
              return 0.32*1e-3
            }else if(industry_model.industry_type === 2){  //noves categories
              return 0.455*1e-3
            }else if(industry_model.industry_type === 4){  //noves categories
              return  null
            }else if(industry_model.industry_type === 5){  //noves categories
              return  null
            }else if(industry_model.industry_type === 6){  //noves categories
              return 0.8860526315789474*1e-3
            }else if(industry_model.industry_type === 7){  //noves categories
              return 0.9*1e-3
            }else if(industry_model.industry_type === 8){  //noves categories
              return 1.19*1e-3
            }else if(industry_model.industry_type === 9){  //noves categories
              return 0.6015384615384615*1e-3
            }else if(industry_model.industry_type === 10){  //noves categories
              return 0.33*1e-3
            }else if(industry_model.industry_type === 11){  //noves categories
              return 0.5816129032258064*1e-3
            }else if(industry_model.industry_type === 12){  //noves categories
              return 0.7260416666666667*1e-3
            }else if(industry_model.industry_type === 13){  //noves categories
              return  null
            }else if(industry_model.industry_type === 14){  //noves categories
              return 1.31*1e-3
            }else if(industry_model.industry_type === 15){  //noves categories
              return 21.673333333333332*1e-3
            }else if(industry_model.industry_type === 16){  //noves categories
              return null
            }else if(industry_model.industry_type === 17){  //noves categories
              return  null
            }else if(industry_model.industry_type === 18){  //noves categories
              return  null
            }else if(industry_model.industry_type === 19){  //noves categories
              return 10015*1e-3
            }else if(industry_model.industry_type === 20){  //noves categories
              return  null
            }else if(industry_model.industry_type === 21){  //noves categories
              return null
            }else if(industry_model.industry_type === 22){  //noves categories
              return  null
            }else if(industry_model.industry_type === 23){  //noves categories
              return  null
            }else if(industry_model.industry_type === 24){  //noves categories
              return  null
            }else return null

          }
          else if (pollutant == "Hexachlorobenzene"){
            if(industry_model.industry_type === 1){  //noves categories
              return null
            }else if(industry_model.industry_type === 2){  //noves categories
              return  null
            }else if(industry_model.industry_type === 4){  //noves categories
              return  null
            }else if(industry_model.industry_type === 5){  //noves categories
              return  null
            }else if(industry_model.industry_type === 6){  //noves categories
              return null
            }else if(industry_model.industry_type === 7){  //noves categories
              return  null
            }else if(industry_model.industry_type === 8){  //noves categories
              return  null
            }else if(industry_model.industry_type === 9){  //noves categories
              return null
            }else if(industry_model.industry_type === 10){  //noves categories
              return  2*1e-3
            }else if(industry_model.industry_type === 11){  //noves categories
              return 0.009523809523809526*1e-3
            }else if(industry_model.industry_type === 12){  //noves categories
              return  null
            }else if(industry_model.industry_type === 13){  //noves categories
              return  null
            }else if(industry_model.industry_type === 14){  //noves categories
              return null
            }else if(industry_model.industry_type === 15){  //noves categories
              return  null
            }else if(industry_model.industry_type === 16){  //noves categories
              return null
            }else if(industry_model.industry_type === 17){  //noves categories
              return  null
            }else if(industry_model.industry_type === 18){  //noves categories
              return  null
            }else if(industry_model.industry_type === 19){  //noves categories
              return  null
            }else if(industry_model.industry_type === 20){  //noves categories
              return  null
            }else if(industry_model.industry_type === 21){  //noves categories
              return null
            }else if(industry_model.industry_type === 22){  //noves categories
              return  null
            }else if(industry_model.industry_type === 23){  //noves categories
              return  null
            }else if(industry_model.industry_type === 24){  //noves categories
              return  null
            }else return null

          }
          else if (pollutant == "Mercury"){
            if(industry_model.industry_type === 1){  //noves categories
              return 95*1e-3
            }else if(industry_model.industry_type === 2){  //noves categories
              return  0.1281690140845069*1e-3
            }else if(industry_model.industry_type === 4){  //noves categories
              return  null
            }else if(industry_model.industry_type === 5){  //noves categories
              return  null
            }else if(industry_model.industry_type === 6){  //noves categories
              return 0.2044736842105263*1e-3
            }else if(industry_model.industry_type === 7){  //noves categories
              return 0.1636363636363636*1e-3
            }else if(industry_model.industry_type === 8){  //noves categories
              return 0.17*1e-3
            }else if(industry_model.industry_type === 9){  //noves categories
              return null
            }else if(industry_model.industry_type === 10){  //noves categories
              return 105*1e-3
            }else if(industry_model.industry_type === 11){  //noves categories
              return  0.19192982456140348*1e-3
            }else if(industry_model.industry_type === 12){  //noves categories
              return 0.2647916666666666*1e-3
            }else if(industry_model.industry_type === 13){  //noves categories
              return  null
            }else if(industry_model.industry_type === 14){  //noves categories
              return 33.48333333333333*1e-3
            }else if(industry_model.industry_type === 15){  //noves categories
              return 0.18000000000000002*1e-3
            }else if(industry_model.industry_type === 16){  //noves categories
              return null
            }else if(industry_model.industry_type === 17){  //noves categories
              return  null
            }else if(industry_model.industry_type === 18){  //noves categories
              return  null
            }else if(industry_model.industry_type === 19){  //noves categories
              return 85*1e-3
            }else if(industry_model.industry_type === 20){  //noves categories
              return  null
            }else if(industry_model.industry_type === 21){  //noves categories
              return null
            }else if(industry_model.industry_type === 22){  //noves categories
              return  null
            }else if(industry_model.industry_type === 23){  //noves categories
              return  null
            }else if(industry_model.industry_type === 24){  //noves categories
              return  null
            }else return null

          }
          else if (pollutant == "Lead"){
            if(industry_model.industry_type === 1){  //noves categories
              return 1985*1e-3
            }else if(industry_model.industry_type === 2){  //noves categories
              return 12.361901408450692*1e-3
            }else if(industry_model.industry_type === 4){  //noves categories
              return  null
            }else if(industry_model.industry_type === 5){  //noves categories
              return  null
            }else if(industry_model.industry_type === 6){  //noves categories
              return 12.063947368421049*1e-3
            }else if(industry_model.industry_type === 7){  //noves categories
              return 11.763636363636364*1e-3
            }else if(industry_model.industry_type === 8){  //noves categories
              return 5.36*1e-3
            }else if(industry_model.industry_type === 9){  //noves categories
              return 3.3173076923076925*1e-3
            }else if(industry_model.industry_type === 10){  //noves categories
              return 1.22*1e-3
            }else if(industry_model.industry_type === 11){  //noves categories
              return 14.397151898734155*1e-3
            }else if(industry_model.industry_type === 12){  //noves categories
              return 3.4849999999999994*1e-3
            }else if(industry_model.industry_type === 13){  //noves categories
              return  null
            }else if(industry_model.industry_type === 14){  //noves categories
              return 339.66*1e-3
            }else if(industry_model.industry_type === 15){  //noves categories
              return 35.682500000000005*1e-3
            }else if(industry_model.industry_type === 16){  //noves categories
              return null
            }else if(industry_model.industry_type === 17){  //noves categories
              return  null
            }else if(industry_model.industry_type === 18){  //noves categories
              return  null
            }else if(industry_model.industry_type === 19){  //noves categories
              return 2212.8*1e-3
            }else if(industry_model.industry_type === 20){  //noves categories
              return  null
            }else if(industry_model.industry_type === 21){  //noves categories
              return null
            }else if(industry_model.industry_type === 22){  //noves categories
              return  null
            }else if(industry_model.industry_type === 23){  //noves categories
              return  null
            }else if(industry_model.industry_type === 24){  //noves categories
              return  null
            }else return null

          }
          else if (pollutant == "Nickel"){
            if(industry_model.industry_type === 1){  //noves categories
              return 4395*1e-3
            }else if(industry_model.industry_type === 2){  //noves categories
              return 15.111126760563366*1e-3
            }else if(industry_model.industry_type === 4){  //noves categories
              return  null
            }else if(industry_model.industry_type === 5){  //noves categories
              return  null
            }else if(industry_model.industry_type === 6){  //noves categories
              return 24.955526315789474*1e-3
            }else if(industry_model.industry_type === 7){  //noves categories
              return 8.272727272727272*1e-3
            }else if(industry_model.industry_type === 8){  //noves categories
              return 7.55*1e-3
            }else if(industry_model.industry_type === 9){  //noves categories
              return 6.599230769230768*1e-3
            }else if(industry_model.industry_type === 10){  //noves categories
              return 8.87*1e-3
            }else if(industry_model.industry_type === 11){  //noves categories
              return 92.75778481012654*1e-3
            }else if(industry_model.industry_type === 12){  //noves categories
              return 4.578333333333334*1e-3
            }else if(industry_model.industry_type === 13){  //noves categories
              return  null
            }else if(industry_model.industry_type === 14){  //noves categories
              return 18.505000000000003*1e-3
            }else if(industry_model.industry_type === 15){  //noves categories
              return 619.9191666666667*1e-3
            }else if(industry_model.industry_type === 16){  //noves categories
              return 3854.1666666666642*1e-3
            }else if(industry_model.industry_type === 17){  //noves categories
              return null
            }else if(industry_model.industry_type === 18){  //noves categories
              return 2000*1e-3
            }else if(industry_model.industry_type === 19){  //noves categories
              return 20.14*1e-3
            }else if(industry_model.industry_type === 20){  //noves categories
              return  null
            }else if(industry_model.industry_type === 21){  //noves categories
              return null
            }else if(industry_model.industry_type === 22){  //noves categories
              return  null
            }else if(industry_model.industry_type === 23){  //noves categories
              return  null
            }else if(industry_model.industry_type === 24){  //noves categories
              return  null
            }else return null

          }
          else if (pollutant == "Chloroalkanes"){
            if(industry_model.industry_type === 1){  //noves categories
              return null
            }else if(industry_model.industry_type === 2){  //noves categories
              return  null
            }else if(industry_model.industry_type === 4){  //noves categories
              return  null
            }else if(industry_model.industry_type === 5){  //noves categories
              return  null
            }else if(industry_model.industry_type === 6){  //noves categories
              return 3.3494736842105253*1e-3
            }else if(industry_model.industry_type === 7){  //noves categories
              return  null
            }else if(industry_model.industry_type === 8){  //noves categories
              return  null
            }else if(industry_model.industry_type === 9){  //noves categories
              return null
            }else if(industry_model.industry_type === 10){  //noves categories
              return  null
            }else if(industry_model.industry_type === 11){  //noves categories
              return  8.603859649122807*1e-3
            }else if(industry_model.industry_type === 12){  //noves categories
              return  null
            }else if(industry_model.industry_type === 13){  //noves categories
              return  null
            }else if(industry_model.industry_type === 14){  //noves categories
              return null
            }else if(industry_model.industry_type === 15){  //noves categories
              return  5.809166666666667*1e-3
            }else if(industry_model.industry_type === 16){  //noves categories
              return null
            }else if(industry_model.industry_type === 17){  //noves categories
              return  null
            }else if(industry_model.industry_type === 18){  //noves categories
              return  null
            }else if(industry_model.industry_type === 19){  //noves categories
              return  5105*1e-3
            }else if(industry_model.industry_type === 20){  //noves categories
              return  null
            }else if(industry_model.industry_type === 21){  //noves categories
              return null
            }else if(industry_model.industry_type === 22){  //noves categories
              return  null
            }else if(industry_model.industry_type === 23){  //noves categories
              return  null
            }else if(industry_model.industry_type === 24){  //noves categories
              return  null
            }else return null

          }
          else if (pollutant == "Hexachlorobutadiene"){
            if(industry_model.industry_type === 1){  //noves categories
              return null
            }else if(industry_model.industry_type === 2){  //noves categories
              return  null
            }else if(industry_model.industry_type === 4){  //noves categories
              return  null
            }else if(industry_model.industry_type === 5){  //noves categories
              return  null
            }else if(industry_model.industry_type === 6){  //noves categories
              return null
            }else if(industry_model.industry_type === 7){  //noves categories
              return  null
            }else if(industry_model.industry_type === 8){  //noves categories
              return  null
            }else if(industry_model.industry_type === 9){  //noves categories
              return null
            }else if(industry_model.industry_type === 10){  //noves categories
              return 2*1e-3
            }else if(industry_model.industry_type === 11){  //noves categories
              return 0.009523809523809526*1e-3
            }else if(industry_model.industry_type === 12){  //noves categories
              return  null
            }else if(industry_model.industry_type === 13){  //noves categories
              return  null
            }else if(industry_model.industry_type === 14){  //noves categories
              return null
            }else if(industry_model.industry_type === 15){  //noves categories
              return  null
            }else if(industry_model.industry_type === 16){  //noves categories
              return null
            }else if(industry_model.industry_type === 17){  //noves categories
              return  null
            }else if(industry_model.industry_type === 18){  //noves categories
              return  null
            }else if(industry_model.industry_type === 19){  //noves categories
              return  null
            }else if(industry_model.industry_type === 20){  //noves categories
              return  null
            }else if(this.industry_type === 21){  //noves categories
              return null
            }else if(industry_model.industry_type === 22){  //noves categories
              return  null
            }else if(industry_model.industry_type === 23){  //noves categories
              return  null
            }else if(industry_model.industry_type === 24){  //noves categories
              return  null
            }else return null

          }
          else if (pollutant == "Nonylphenols"){
            if(industry_model.industry_type === 1){  //noves categories
              return 0.73*1e-3
            }else if(industry_model.industry_type === 2){  //noves categories
              return 1.2240140845070406*1e-3
            }else if(industry_model.industry_type === 4){  //noves categories
              return 654.5454545454545*1e-3
            }else if(industry_model.industry_type === 5){  //noves categories
              return  null
            }else if(industry_model.industry_type === 6){  //noves categories
              return 555*1e-3
            }else if(industry_model.industry_type === 7){  //noves categories
              return 1.6727272727272728*1e-3
            }else if(industry_model.industry_type === 8){  //noves categories
              return 441.50470588235294*1e-3
            }else if(industry_model.industry_type === 9){  //noves categories
              return 3.326153846153846*1e-3
            }else if(industry_model.industry_type === 10){  //noves categories
              return  null
            }else if(industry_model.industry_type === 11){  //noves categories
              return  56760.85671794876*1e-3
            }else if(industry_model.industry_type === 12){  //noves categories
              return 1.2556249999999995*1e-3
            }else if(industry_model.industry_type === 13){  //noves categories
              return 1000*1e-3
            }else if(industry_model.industry_type === 14){  //noves categories
              return 0.96*1e-3
            }else if(industry_model.industry_type === 15){  //noves categories
              return 1.0633333333333335*1e-3
            }else if(industry_model.industry_type === 16){  //noves categories
              return null
            }else if(industry_model.industry_type === 17){  //noves categories
              return  null
            }else if(industry_model.industry_type === 18){  //noves categories
              return  null
            }else if(industry_model.industry_type === 19){  //noves categories
              return  null
            }else if(industry_model.industry_type === 20){  //noves categories
              return  null
            }else if(industry_model.industry_type === 21){  //noves categories
              return null
            }else if(industry_model.industry_type === 22){  //noves categories
              return  null
            }else if(industry_model.industry_type === 23){  //noves categories
              return  null
            }else if(industry_model.industry_type === 24){  //noves categories
              return  null
            }else return null

          }
          else if (pollutant == "Tetrachloroethene"){
            if(industry_model.industry_type === 1){  //noves categories
              return null
            }else if(industry_model.industry_type === 2){  //noves categories
              return  null
            }else if(industry_model.industry_type === 4){  //noves categories
              return  null
            }else if(industry_model.industry_type === 5){  //noves categories
              return  null
            }else if(industry_model.industry_type === 6){  //noves categories
              return 156.15947368421058*1e-3
            }else if(industry_model.industry_type === 7){  //noves categories
              return null
            }else if(industry_model.industry_type === 8){  //noves categories
              return  100*1e-3
            }else if(industry_model.industry_type === 9){  //noves categories
              return 0.49538461538461537*1e-3
            }else if(industry_model.industry_type === 10){  //noves categories
              return  95*1e-3
            }else if(industry_model.industry_type === 11){  //noves categories
              return  5.161904761904763*1e-3
            }else if(industry_model.industry_type === 12){  //noves categories
              return  0.1964583333333334*1e-3
            }else if(industry_model.industry_type === 13){  //noves categories
              return null
            }else if(industry_model.industry_type === 14){  //noves categories
              return null
            }else if(industry_model.industry_type === 15){  //noves categories
              return  0.2058333333333333*1e-3
            }else if(industry_model.industry_type === 16){  //noves categories
              return null
            }else if(industry_model.industry_type === 17){  //noves categories
              return  null
            }else if(industry_model.industry_type === 18){  //noves categories
              return  null
            }else if(industry_model.industry_type === 19){  //noves categories
              return  null
            }else if(industry_model.industry_type === 20){  //noves categories
              return  null
            }else if(industry_model.industry_type === 21){  //noves categories
              return null
            }else if(industry_model.industry_type === 22){  //noves categories
              return  null
            }else if(industry_model.industry_type === 23){  //noves categories
              return  null
            }else if(industry_model.industry_type === 24){  //noves categories
              return  null
            }else return null

          }
          else if (pollutant == "Trichloroethylene"){
            if(industry_model.industry_type === 1){  //noves categories
              return 75*1e-3
            }else if(industry_model.industry_type === 2){  //noves categories
              return 0.10253521126760569*1e-3
            }else if(industry_model.industry_type === 4){  //noves categories
              return  null
            }else if(industry_model.industry_type === 5){  //noves categories
              return  null
            }else if(industry_model.industry_type === 6){  //noves categories
              return 0.6134210526315792*1e-3
            }else if(industry_model.industry_type === 7){  //noves categories
              return 0.1818181818181818*1e-3
            }else if(industry_model.industry_type === 8){  //noves categories
              return 100*1e-3
            }else if(industry_model.industry_type === 9){  //noves categories
              return 0.26538461538461533*1e-3
            }else if(industry_model.industry_type === 10){  //noves categories
              return null
            }else if(industry_model.industry_type === 11){  //noves categories
              return  0.6655072463768117*1e-3
            }else if(industry_model.industry_type === 12){  //noves categories
              return  0.1879166666666667*1e-3
            }else if(industry_model.industry_type === 13){  //noves categories
              return  null
            }else if(industry_model.industry_type === 14){  //noves categories
              return null
            }else if(industry_model.industry_type === 15){  //noves categories
              return  0.34*1e-3
            }else if(industry_model.industry_type === 16){  //noves categories
              return null
            }else if(industry_model.industry_type === 17){  //noves categories
              return  null
            }else if(industry_model.industry_type === 18){  //noves categories
              return  null
            }else if(industry_model.industry_type === 19){  //noves categories
              return  null
            }else if(industry_model.industry_type === 20){  //noves categories
              return  null
            }else if(industry_model.industry_type === 21){  //noves categories
              return null
            }else if(industry_model.industry_type === 22){  //noves categories
              return  null
            }else if(industry_model.industry_type === 23){  //noves categories
              return  null
            }else if(industry_model.industry_type === 24){  //noves categories
              return  null
            }else return null

          }
        },
        wwt_pollutants_effl: function(pollutant){
          if (pollutant == "COD"){
            return _this.concentration_effluent_load(pollutant, pollutant, "cod_effl")
          }else if (pollutant == "TN"){
            return _this.concentration_effluent_load(pollutant, pollutant, "N_effl")
          }else if (pollutant == "TP"){
            return _this.concentration_effluent_load(pollutant, pollutant, "P_effl")
          } else if (pollutant == "1,2-Dichloroethane"){
            return _this.concentration_effluent_load(pollutant, pollutant, "diclo_effl")
          }else if (pollutant == "Cadmium"){
            return _this.concentration_effluent_load(pollutant, pollutant, "cadmium_effl")
          }else if (pollutant == "Hexachlorobenzene"){
            return _this.concentration_effluent_load(pollutant, pollutant, "hexaclorobenzene_effl")
          }else if (pollutant == "Mercury"){
            return _this.concentration_effluent_load(pollutant, pollutant, "mercury_effl")
          }else if (pollutant == "Lead"){
            return _this.concentration_effluent_load(pollutant, pollutant, "plomo_effl")
          }else if (pollutant == "Nickel"){
            return _this.concentration_effluent_load(pollutant, pollutant, "niquel_effl")
          }else if (pollutant == "Chloroalkanes"){
            return _this.concentration_effluent_load(pollutant, pollutant, "chloro_effl")
          }else if (pollutant == "Hexachlorobutadiene"){
            return _this.concentration_effluent_load(pollutant, pollutant, "hexaclorobutadie_effl")
          }else if (pollutant == "Nonylphenols"){
            return _this.concentration_effluent_load(pollutant, pollutant, "nonilfenols_effl")
          }else if (pollutant == "Tetrachloroethene"){
            return _this.concentration_effluent_load(pollutant, pollutant, "tetracloroetile_effl")
          }else if (pollutant == "Trichloroethylene"){
            return _this.concentration_effluent_load(pollutant, pollutant, "tricloroetile_effl")
          }else return null
        },

        wwt_cod_effl: function(){
          return _this.concentration_effluent_load("wwt_cod_infl_ind", "wwt_cod_infl_wwtp", "cod_effl")
        },
        wwt_tn_effl: function(){
          return _this.concentration_effluent_load("wwt_tn_infl_ind", "wwt_tn_infl_wwtp", "N_effl")
        },
        wwt_tp_effl: function(){
          return null
        },
        wwt_diclo_effl: function() {
          return _this.concentration_effluent_load("wwt_diclo_infl_ind", "wwt_diclo_infl_wwtp", "diclo_effl")
        },
        wwt_cadmium_effl: function() {
          return _this.concentration_effluent_load("wwt_cadmium_infl_ind", "wwt_cadmium_infl_wwtp", "cadmium_effl")
        },
        wwt_hexaclorobenzene_effl: function() {
          return _this.concentration_effluent_load("wwt_hexaclorobenzene_infl_ind", "wwt_hexaclorobenzene_infl_wwtp", "hexaclorobenzene_effl")
        },
        wwt_mercury_effl: function() {
          return _this.concentration_effluent_load("wwt_mercury_infl_ind", "wwt_mercury_infl_wwtp", "mercury_effl")
        },
        wwt_plomo_effl: function() {
          return _this.concentration_effluent_load("wwt_plomo_infl_ind", "wwt_plomo_infl_wwtp", "plomo_effl")
        },
        wwt_niquel_effl: function() {
          return _this.concentration_effluent_load("wwt_niquel_infl_ind", "wwt_niquel_infl_wwtp", "niquel_effl")
        },
        wwt_chloro_effl: function() {
          return _this.concentration_effluent_load("wwt_chloro_infl_ind", "wwt_chloro_infl_wwtp", "chloro_effl")
        },
        wwt_hexaclorobutadie_effl: function() {
          return _this.concentration_effluent_load("wwt_hexaclorobutadie_infl_ind", "wwt_hexaclorobutadie_infl_wwtp", "hexaclorobutadie_effl")
        },
        wwt_nonilfenols_effl: function() {
          return _this.concentration_effluent_load("wwt_nonilfenols_infl_ind", "wwt_nonilfenols_infl_wwtp", "nonilfenols_effl")
        },
        wwt_tetracloroetile_effl: function() {
          return _this.concentration_effluent_load("wwt_tetracloroetile_infl_ind", "wwt_tetracloroetile_infl_wwtp", "tetracloroetile_effl")
        },
        wwt_tricloroetile_effl: function() {
          return _this.concentration_effluent_load("wwt_tricloroetile_infl_ind", "wwt_tricloroetile_infl_wwtp", "tricloroetile_effl")
        },
        wwt_conv_kwh: function(){
          let location = wwtp.location
          let lat = location.lat
          let lng = location.lng
          let code = utils.get_country_code_from_coordinates(lat, lng)
          if(code == null) return null
          return Countries[code].conv_kwh_co2
        },
        wwt_biog_pro: function(){
          let wwt_mass_slu    = wwtp_model.wwt_mass_slu;  //kg  | mass of combined sludge to digestion
          let VS_to_digestion = wwt_mass_slu    * 0.80; //kg  | VS to digestion: 80% of sludge mass
          let VS_destroyed    = VS_to_digestion * 0.60; //kg  | VS destroyed: 60% of VS
          let biogas_volume   = VS_destroyed    * 0.80; //Nm3 | biogas produced (volume)
          return biogas_volume;
        },
        wwt_biog_fla: function(){
          return 98
        },
        wwt_biog_val: function(){
          return 100-wwtp_model.wwt_biog_fla-wwtp_model.wwt_biog_lkd-wwtp_model.wwt_biog_sold;
        },
        wwt_biog_lkd: function(){
          return 2
        },
        wwt_biog_sold: function() {
          return 100-wwtp_model.wwt_biog_val-wwtp_model.wwt_biog_fla-wwtp_model.wwt_biog_lkd;
        },
        wwt_ch4_biog: function(){
          return 59
        },
        wwt_slu_comp_low_CN_EF: function(){
          return 0.015
        },
        wwt_slu_comp_uncovered_pile_EF: function(){
          return 0.025
        },
        wwt_slu_comp_seqst_rate: function(){
          return 0.25
        },
        wwt_temp_inc: function(){
          return 1023
        },
        wwt_slu_lf_uncertainty: function(){
          return 0.9
        },
        wwt_slu_lf_CH4_in_gas: function(){
          return 50
        },
        wwt_slu_lf_DOCf: function(){
          return 80
        },
        wwt_slu_lf_decomp_3yr: function(){
          return 69.9
        },
        wwt_slu_lf_low_CN_EF: function(){
          return 0.015
        }

      }
      if(args == null) return estimations[code]()
      else return estimations[code](args)
    },

    //Select estimations
    select_estimations(code){
      let wwt_model = this.onsite_wwtp_model
      if(this.stepper_model == 4){
        wwt_model = this.offsite_wwtp_model
      }

      let estimations = {
        wwt_cod_slud: function(){
          return Tables["type_of_treatment_KREM"].map(option => {
            return {
              name: option.name,
              value: option.K_rem * wwt_model.wwt_mass_slu
            }
          })
        },
        wwt_ch4_efac_dis: function(){
          return Tables["type_of_water_body"].map(option => {
            return {
              name: option.name,
              value: option.ch4_efac
            }
          })
        },
        wwt_ch4_efac_tre: function(){
          return Tables["type_of_treatment"].map(option => {
            return {
              name: option.name,
              value: option.ch4_efac
            }
          })
        },
        wwt_n2o_efac_tre: function(){
          return Tables["N2O EF plants (Table 6.8A)"].map(option => {
            return {
              name: option.name,
              value: option.n2o_efac
            }
          })
        },
        wwt_n2o_efac_dis: function(){
          return Tables["N2O EF effluent (Table 6.8A)"].map(option => {
            return {
              name: option.name,
              value: option.n2o_efac
            }
          })
        },
        wwt_slu_sto_TVS: function(){
          return Tables["Type of sludge disposed"].map(option => {
            return {
              name: option.name,
              value: option.TVS
            }
          })
        },
        wwt_slu_sto_f_CH4: function(){
          return Tables["Type of sludge disposed"].map(option => {
            return {
              name: option.name,
              value: option.f_ch4
            }
          })
        },
        wwt_slu_comp_TVS: function(){
          return Tables["Type of sludge disposed"].map(option => {
            return {
              name: option.name,
              value: option.TVS
            }
          })
        },
        wwt_slu_comp_N_cont: function(){
          return Tables["Type of sludge disposed"].map(option => {
            return {
              name: option.name,
              value: option.N_cont
            }
          })
        },
        wwt_slu_inc_N_cont: function(){
          return Tables["Type of sludge disposed"].map(option => {
            return {
              name: option.name,
              value: option.N_cont
            }
          })
        },
        wwt_slu_la_TVS: function(){
          return Tables["Type of sludge disposed"].map(option => {
            return {
              name: option.name,
              value: option.TVS
            }
          })
        },
        wwt_slu_la_N_cont: function(){
          return Tables["Type of sludge disposed"].map(option => {
            return {
              name: option.name,
              value: option.N_cont
            }
          })
        },
        wwt_slu_la_EF: function(){
          return Tables["Soil type"].map(option => {
            return {
              name: option.name,
              value: option.f_la
            }
          })
        },
        wwt_slu_lf_TVS: function(){
          return Tables["Type of sludge disposed"].map(option => {
            return {
              name: option.name,
              value: option.TVS
            }
          })

        },
        wwt_slu_lf_MCF: function(){
          return Tables["Type of landfill"].map(option => {
            return {
              name: option.name,
              value: option.MCF
            }
          })

        },
        wwt_slu_lf_N_cont: function(){
          return Tables["Type of sludge disposed"].map(option => {
            return {
              name: option.name,
              value: option.N_cont
            }
          })
        },



      }
      return estimations[code]()

    },

    rules(code){

      let _this = this
      let rules = {
        has_onsite_wwtp: function(){
          return [(item) =>item != null || "Required item"]
        },
        has_direct_discharge: function(){
          return [(item) =>item != null || "Required item"]
        },
        has_offsite_wwtp: function(){
          return [(item) =>item != null || "Required item"]
        },
        industry_type: function(){
          return [(item) =>item != null || "Required item"]
        },


      }

      return rules[code]()
    },


    tab_4_continue(){
      this.scrollToTop()

      for(let input of this.offsite_wwtp_inputs){
        if((!isNaN(this.offsite_wwtp_model[input]) || this.offsite_wwtp_model[input]!="") && this.offsite_wwtp_model[input]>=0) this.industry.offsite_wwtp[input] = Number(this.offsite_wwtp_model[input])
        else if (input == "wwt_pollutants_effl") {
          this.industry.offsite_wwtp[input] = {}
          for (let pollutant of this.model_selected_pollutants){
            this.industry.offsite_wwtp[input][pollutant] = this.offsite_wwtp_model[input][pollutant]
          }
        }
      }

      //this.industry.offsite_wwtp['wwt_vol_disc'] = this.industry.offsite_wwtp["wwt_vol_trea"]
      this.stepper_model = 5
    },

    tab_3_continue(){
      this.scrollToTop()

      for(let input of this.direct_discharge_inputs){
        if((!isNaN(this.direct_discharge_model[input] ) || this.direct_discharge_model[input]!="") && this.direct_discharge_model[input]>=0) this.industry.direct_discharge[input] = Number(this.direct_discharge_model[input])
      }

      if(this.industry.has_offsite_wwtp == 1) {
        this.stepper_model = 4
      }
      else this.stepper_model = 5
    },

    tab_2_continue(){
      this.scrollToTop()

      for(let input of this.onsite_wwtp_inputs){
        if((!isNaN(this.onsite_wwtp_model[input]) || this.onsite_wwtp_model[input]!="") && this.onsite_wwtp_model[input]>=0) this.industry.onsite_wwtp[input] = Number(this.onsite_wwtp_model[input])
        else if (input == "wwt_pollutants_effl") {
          this.industry.onsite_wwtp[input] = {}
          for (let pollutant of this.model_selected_pollutants){
            this.industry.onsite_wwtp[input][pollutant] = this.onsite_wwtp_model[input][pollutant]
          }
        }
      }

      if(this.industry.has_offsite_wwtp == 1){
        this.industry.update_offsite_wwtp()
      }

      if(this.industry.has_direct_discharge == 1) {
        this.stepper_model = 3
      }
      else if(this.industry.has_offsite_wwtp == 1) this.stepper_model = 4
      else this.stepper_model = 5
    },

    tab_1_continue(){
      this.scrollToTop()

      //Industry inputs
      for(let input of this.industry_inputs){
        if((!isNaN(this.industry_model[input]) || this.industry_model[input]!="") &&  this.industry_model[input]>=0) this.industry[input] = Number(this.industry_model[input])
        else if (input == "ind_pollutants_effl") {
          this.industry['ind_pollutants_effl'] = {}
          for (let pollutant of this.model_selected_pollutants){
            this.industry['ind_pollutants_effl'][pollutant] = this.industry_model['ind_pollutants_effl'][pollutant]
          }
        }
        else if (input == "ind_pollutants_infl") {
          this.industry['ind_pollutants_infl'] = {}
          for (let pollutant of this.model_selected_pollutants){
            this.industry['ind_pollutants_infl'][pollutant] = this.industry_model['ind_pollutants_infl'][pollutant]
          }
        }

      }

      this.industry['pollutants_selected'] = this.model_selected_pollutants

      for (let pollutant of this.model_selected_pollutants){
        if (!conversion_factors.hasOwnProperty(pollutant)){
          if (pollutant == "COD" || pollutant == "TN" || pollutant == "TP") {
            conversion_factors[pollutant] = {eutrophication: null, tu: '-', eqs: '-'}
          }else{
            conversion_factors[pollutant] = {eutrophication: '-', tu: null, eqs: null}
          }
        }
      }

      //Local wwtp
      if(this.industry.has_onsite_wwtp == 1){
        this.industry.update_onsite_wwtp()
      }else{
        this.industry.reset_onsite_wwtp()
      }

      //Direct discharge
      if(this.industry.has_direct_discharge == 1){
        this.industry.update_direct_discharge()
      }else{
        this.industry.reset_direct_discharge()
      }

      //Offsite wwtp
      if(this.industry.has_offsite_wwtp == 1){
        this.industry.update_offsite_wwtp()
      }else{
        this.industry.reset_offsite_wwtp()
      }

      let global_pollutants_created = this.$created_pollutants
      this.model_selected_pollutants.forEach(item => global_pollutants_created.add(item)) //Update all pollutants created set


      if(this.industry.has_onsite_wwtp != 1){
        if(this.industry.has_direct_discharge == 1) this.stepper_model = 3
        else if(this.industry.has_offsite_wwtp == 1) this.stepper_model = 4
        else this.stepper_model = 5
      }else{
        this.stepper_model = 2
      }

    },

    industries_deleted(){ //An industry or assessment has been deleted, if it's the current one return to map
      let _this = this
      let assessment_index =  this.$assessments.findIndex(assessment => assessment.name === _this.assessment.name)
      if(assessment_index === -1) this.$router.push('/')
      else {
        let assessment = this.$assessments[assessment_index]
        let industry_index = assessment.industries.findIndex(industry => industry.name === _this.industry.name)
        if(industry_index === -1) this.$router.push('/')
      }
    },
  },

  computed: {

    tab_1_disabled(){
      let industry = this.industry_model


      let disabled = industry.volume_withdrawn != null && industry.volume_withdrawn !== "" &&
          industry.product_produced != null && industry.product_produced !== "" &&
          industry.has_onsite_wwtp != null && industry.has_direct_discharge != null && industry.has_offsite_wwtp != null && industry.industry_type != null

      return !disabled
    },

    tab_2_disabled(){
      let wwtp = this.onsite_wwtp_model
      let disabled = wwtp.wwt_vol_trea != null && wwtp.wwt_vol_trea != "" && wwtp.wwt_vol_disc != null && wwtp.wwt_vol_disc != ""
      return !disabled
    },

    tab_3_disabled(){
      let dd = this.direct_discharge_model
      let disabled = dd.dd_vol_disc != null && dd.dd_vol_disc != ""
      return !disabled
    },

    tab_4_disabled(){
      let wwtp = this.offsite_wwtp_model
      let disabled = wwtp.wwt_vol_trea != null && wwtp.wwt_vol_trea != ""
      return !disabled
    },
  }

};
</script>

<style scoped>
.link_to_report_hovered{
  color: #b62373;
  text-decoration: underline;
}
.link_to_report{
  color: #b62373;
  text-decoration: none;
}

.v-btn--disabled{
  background-color: rgba(0, 0, 0, 0.26) !important
}

.outer_2{
  width: 100%;
  height: 100%;
  background-color: white;
  position: absolute;
}

.stepper {
  overflow: visible;
  box-shadow: unset !important;
}

.sticky {
  position: sticky;
  top: 0;
  z-index: 3;
  box-shadow: unset;
}

.icon_clickable {
  transition: all .2s ease-in-out;
}
</style>