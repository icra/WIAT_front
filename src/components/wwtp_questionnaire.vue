<template>
  <div>
    <div v-if="(industry.has_onsite_wwtp == 1 && stepper_model == 2) || (industry.has_offsite_wwtp == 1 && stepper_model == 4)">

      <!-- Basic inputs -->
      <v-container
          v-for = "input in array_intersection(wwtp_inputs, basic_inputs)"
          :key="input"
      >
        <v-row
          :key="input"
        >
          <v-col cols="7" >
            <div style="width: 100%;">
              <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                <span>
                  <span v-if="input === 'wwt_vol_trea' && stepper_model == 4">
                    Volume of industrial wastewater sent to the offsite WWTP every day
                  </span>
                  <span v-else>
                    {{user_inputs[input].question}}
                  </span>
                  <v-tooltip bottom v-if="user_inputs[input].hasOwnProperty('description_tooltip')">
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon
                          v-bind="attrs"
                          v-on="on"
                          color="primary"
                          style="margin-left: 2px; margin-right: 2px; font-size: 1.3rem;"
                      >
                        mdi-information-outline
                      </v-icon>
                    </template>
                    <span>{{ user_inputs[input]['description_tooltip'] }}</span>
                  </v-tooltip>

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
                       @click="wwtp_model[input] = button_estimations(input)"
                >
                  Estimation:  {{button_estimations(input).toExponential(3)}}<!-- Estimation button -->
                </v-btn>
              </div>
              <div v-if="select_estimation.includes(input)" style="width: 100%">
                <select v-model = "wwtp_model[input]" style="max-width:90%;background-color: #d9d9d5; width: 90%; -webkit-appearance: menulist"  >
                  <option
                      v-for="item in select_estimations(input)"
                      :value="item.value"
                  >
                    <!--Toggle menu with estimation-->
                    {{item.name}} ({{item.value.toFixed(3)}})
                  </option>
                  <option :value="wwtp_model[input]">Custom value</option>
                </select>
              </div>

            </div>
          </v-col>
          <v-col
              :cols="keys_without_level_of_certainty.has(input) ? 5 : 3"
          >
            <div>
              <div>
                <v-select
                    v-if="type_option[input]"
                    v-model="wwtp_model[input]"
                    item-text="text"
                    item-value="value"
                    :items="type_option[input].items"
                    label="Select"
                >
                </v-select>
                <v-text-field
                    v-else
                    v-model="wwtp_model[input]"
                    :suffix=user_inputs[input].unit
                    type="number"
                ></v-text-field>

              </div>
            </div>

          </v-col>
          <!-- Data origin -->
          <v-col cols="2" v-if="!keys_without_level_of_certainty.has(input)">
            <v-select
                label="Level of certainty"
                :items = level_of_certainty
                item-text="text"
                item-value="key"
                v-model="wwtp_model.level_of_certainty[input]"

            ></v-select>

          </v-col>


        </v-row>
      </v-container>

      <!-- Advanced inputs -->
      <v-container>
        <v-expansion-panels style="padding-top: 20px">
          <v-expansion-panel>

            <v-expansion-panel-header color="#1c195b" >
              <h3 style="color: white">SHOW ADVANCED INPUTS</h3>
              <template v-slot:actions>
                <v-icon color="white">
                  $expand
                </v-icon>
              </template>
            </v-expansion-panel-header>

            <v-expansion-panel-content style="padding: 30px">
              <v-expansion-panels style="padding-top: 20px">

                <!-- Effluent pollution -->
                <v-container>
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
                        <v-col cols="7" >
                          <div style="width: 100%;">
                            <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                              <span>
                              Concentration of {{pollutant}} in the WWTP effluent
                              <v-tooltip bottom v-if="user_inputs['wwt_pollutants_effl'].hasOwnProperty('description_tooltip')">
                                <template v-slot:activator="{ on, attrs }">
                                  <v-icon
                                      v-bind="attrs"
                                      v-on="on"
                                      color="primary"
                                      style="margin-left: 2px; margin-right: 2px; font-size: 1.3rem;"
                                  >
                                    mdi-information-outline
                                  </v-icon>
                                </template>
                                <span>{{ user_inputs['wwt_pollutants_effl']['description_tooltip'] }}</span>
                              </v-tooltip>


                            </span>

                              <v-btn v-if="button_estimation.includes('wwt_pollutants_effl') && !isNaN(button_estimations('wwt_pollutants_effl', pollutant)) && button_estimations('wwt_pollutants_effl', pollutant) != null"
                                     tile
                                     x-small
                                     color="#b62373"
                                     @click="wwtp_model['wwt_pollutants_effl'][pollutant] = button_estimations('wwt_pollutants_effl', pollutant)"
                              >
                                Estimation:  {{button_estimations('wwt_pollutants_effl', pollutant)}}<!-- Estimation button -->
                              </v-btn>
                            </div>
                          </div>
                        </v-col>
                        <v-col cols="3">
                          <v-text-field
                              v-model="wwtp_model['wwt_pollutants_effl'][pollutant]"
                              :suffix="user_inputs['wwt_pollutants_effl'].unit"
                              type="number"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="2" v-if="!keys_without_level_of_certainty.has('wwt_pollutants_effl')">
                          <v-select
                              label="Level of certainty"
                              :items = level_of_certainty
                              item-text="text"
                              item-value="key"
                              v-model="wwtp_model.level_of_certainty['wwt_pollutants_effl'][pollutant]"

                          ></v-select>

                        </v-col>

                      </v-row>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-container>

                <!-- Fuel engines-->
                <v-container>
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
                        <v-col cols="7" >
                          <div style="width: 100%;">
                            <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                            <span>
                              {{user_inputs[input].question}}
                              <v-tooltip bottom v-if="user_inputs[input].hasOwnProperty('description_tooltip')">
                                <template v-slot:activator="{ on, attrs }">
                                  <v-icon
                                      v-bind="attrs"
                                      v-on="on"
                                      color="primary"
                                      style="margin-left: 2px; margin-right: 2px; font-size: 1.3rem;"
                                  >
                                    mdi-information-outline
                                  </v-icon>
                                </template>
                                <span>{{ user_inputs[input]['description_tooltip'] }}</span>
                              </v-tooltip>
                            </span>
                              <v-btn v-if="button_estimation.includes(input) && !isNaN(button_estimations(input)) && button_estimations(input) != null"
                                     tile
                                     color="#b62373"
                                     x-small
                                     @click="wwtp_model[input] = button_estimations(input)"
                              >
                                Estimation:  {{button_estimations(input).toExponential(3)}}<!-- Estimation button -->
                              </v-btn>
                            </div>
                            <div v-if="select_estimation.includes(input)" style="width: 100%">
                              <select v-model = "wwtp_model[input]" style="max-width:90%;background-color: #d9d9d5; width: 90%; -webkit-appearance: menulist"  >
                                <option
                                    v-for="item in select_estimations(input)"
                                    :value="item.value"
                                >
                                  <!--Toggle menu with estimation-->
                                  {{item.name}} ({{item.value.toFixed(3)}})
                                </option>
                                <option :value="wwtp_model[input]">Custom value</option>
                              </select>
                            </div>

                          </div>
                        </v-col>
                        <v-col :cols="keys_without_level_of_certainty.has(input) ? 5 : 3">
                          <div>
                            <div>
                              <v-select
                                  v-if="type_option[input]"
                                  v-model="wwtp_model[input]"
                                  item-text="text"
                                  item-value="value"
                                  :items="type_option[input].items"
                                  label="Select"
                              >
                              </v-select>
                              <v-text-field
                                  v-else
                                  v-model="wwtp_model[input]"
                                  :suffix=user_inputs[input].unit
                                  type="number"
                              ></v-text-field>

                            </div>
                          </div>

                        </v-col>
                        <v-col cols="2" v-if="!keys_without_level_of_certainty.has(input)">
                          <v-select
                              label="Level of certainty"
                              :items = level_of_certainty
                              item-text="text"
                              item-value="key"
                              v-model="wwtp_model.level_of_certainty[input]"

                          ></v-select>

                        </v-col>

                      </v-row>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-container>
                <!-- Biogas produced from anaerobic digestion -->
                <v-container>
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
                        <v-col cols="7" >
                          <div style="width: 100%;">
                            <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                            <span>
                              {{user_inputs[input].question}}
                              <v-tooltip bottom v-if="user_inputs[input].hasOwnProperty('description_tooltip')">
                                <template v-slot:activator="{ on, attrs }">
                                  <v-icon
                                      v-bind="attrs"
                                      v-on="on"
                                      color="primary"
                                      style="margin-left: 2px; margin-right: 2px; font-size: 1.3rem;"
                                  >
                                    mdi-information-outline
                                  </v-icon>
                                </template>
                                <span>{{ user_inputs[input]['description_tooltip'] }}</span>
                              </v-tooltip>

                            </span>
                              <v-btn v-if="button_estimation.includes(input) && !isNaN(button_estimations(input)) && button_estimations(input) != null"
                                     tile
                                     color="#b62373"
                                     x-small
                                     @click="wwtp_model[input] = button_estimations(input)"
                              >
                                Estimation:  {{button_estimations(input).toExponential(3)}}<!-- Estimation button -->
                              </v-btn>
                            </div>
                            <div v-if="select_estimation.includes(input)" style="width: 100%">
                              <select v-model = "wwtp_model[input]" style="max-width:90%;background-color: #d9d9d5; width: 90%; -webkit-appearance: menulist"  >
                                <option
                                    v-for="item in select_estimations(input)"
                                    :value="item.value"
                                >
                                  <!--Toggle menu with estimation-->
                                  {{item.name}} ({{item.value.toFixed(3)}})
                                </option>
                                <option :value="wwtp_model[input]">Custom value</option>
                              </select>
                            </div>

                          </div>
                        </v-col>
                        <v-col :cols="keys_without_level_of_certainty.has(input) ? 5 : 3">
                          <div>
                            <div>
                              <v-select
                                  v-if="type_option[input]"
                                  v-model="wwtp_model[input]"
                                  item-text="text"
                                  item-value="value"
                                  :items="type_option[input].items"
                                  label="Select"
                              >
                              </v-select>
                              <v-text-field
                                  v-else
                                  v-model="wwtp_model[input]"
                                  :suffix=user_inputs[input].unit
                                  type="number"
                              ></v-text-field>

                            </div>
                          </div>

                        </v-col>
                        <v-col cols="2" v-if="!keys_without_level_of_certainty.has(input)">
                          <v-select
                              label="Level of certainty"
                              :items = level_of_certainty
                              item-text="text"
                              item-value="key"
                              v-model="wwtp_model.level_of_certainty[input]"

                          ></v-select>

                        </v-col>


                      </v-row>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-container>
                <!-- Fuel used in water reuse trucks -->
                <v-container>
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
                        <v-col cols="7" >
                          <div style="width: 100%;">
                            <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                            <span>
                              {{user_inputs[input].question}}
                              <v-tooltip bottom v-if="user_inputs[input].hasOwnProperty('description_tooltip')">
                                <template v-slot:activator="{ on, attrs }">
                                  <v-icon
                                      v-bind="attrs"
                                      v-on="on"
                                      color="primary"
                                      style="margin-left: 2px; margin-right: 2px; font-size: 1.3rem;"
                                  >
                                    mdi-information-outline
                                  </v-icon>
                                </template>
                                <span>{{ user_inputs[input]['description_tooltip'] }}</span>
                              </v-tooltip>

                            </span>
                              <v-btn v-if="button_estimation.includes(input) && !isNaN(button_estimations(input)) && button_estimations(input) != null"
                                     tile
                                     color="#b62373"
                                     x-small
                                     @click="wwtp_model[input] = button_estimations(input)"
                              >
                                Estimation:  {{button_estimations(input).toExponential(3)}}<!-- Estimation button -->
                              </v-btn>
                            </div>
                            <div v-if="select_estimation.includes(input)" style="width: 100%">
                              <select v-model = "wwtp_model[input]" style="max-width:90%;background-color: #d9d9d5; width: 90%; -webkit-appearance: menulist"  >
                                <option
                                    v-for="item in select_estimations(input)"
                                    :value="item.value"
                                >
                                  <!--Toggle menu with estimation-->
                                  {{item.name}} ({{item.value.toFixed(3)}})
                                </option>
                                <option :value="wwtp_model[input]">Custom value</option>
                              </select>
                            </div>

                          </div>
                        </v-col>
                        <v-col :cols="keys_without_level_of_certainty.has(input) ? 5 : 3">
                          <div>
                            <div>
                              <v-select
                                  v-if="type_option[input]"
                                  v-model="wwtp_model[input]"
                                  item-text="text"
                                  item-value="value"
                                  :items="type_option[input].items"
                                  label="Select"
                              >
                              </v-select>
                              <v-text-field
                                  v-else
                                  v-model="wwtp_model[input]"
                                  :suffix=user_inputs[input].unit
                                  type="number"
                              ></v-text-field>

                            </div>
                          </div>

                        </v-col>
                        <v-col cols="2" v-if="!keys_without_level_of_certainty.has(input)">
                          <v-select
                              label="Level of certainty"
                              :items = level_of_certainty
                              item-text="text"
                              item-value="key"
                              v-model="wwtp_model.level_of_certainty[input]"

                          ></v-select>

                        </v-col>


                      </v-row>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-container>
                <!-- Sludge storage in WWTP -->
                <v-container>
                  <v-expansion-panel>
                    <v-expansion-panel-header >
                      <h3>Sludge storage in WWTP</h3>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content style="padding: 30px">
                      <v-row
                          align="center"
                          v-for = "input in advanced_sludge_storage"
                          :key="input"

                      >
                        <v-col cols="7" >
                          <div style="width: 100%;">
                            <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                            <span>
                              {{user_inputs[input].question}}
                              <v-tooltip bottom v-if="user_inputs[input].hasOwnProperty('description_tooltip')">
                                <template v-slot:activator="{ on, attrs }">
                                  <v-icon
                                      v-bind="attrs"
                                      v-on="on"
                                      color="primary"
                                      style="margin-left: 2px; margin-right: 2px; font-size: 1.3rem;"
                                  >
                                    mdi-information-outline
                                  </v-icon>
                                </template>
                                <span>{{ user_inputs[input]['description_tooltip'] }}</span>
                              </v-tooltip>

                            </span>
                              <v-btn v-if="button_estimation.includes(input) && !isNaN(button_estimations(input)) && button_estimations(input) != null"
                                     tile
                                     color="#b62373"
                                     x-small
                                     @click="wwtp_model[input] = button_estimations(input)"
                              >
                                Estimation:  {{button_estimations(input).toExponential(3)}}<!-- Estimation button -->
                              </v-btn>
                            </div>
                            <div v-if="select_estimation.includes(input)" style="width: 100%">
                              <select v-model = "wwtp_model[input]" style="max-width:90%;background-color: #d9d9d5; width: 90%; -webkit-appearance: menulist"  >
                                <option
                                    v-for="item in select_estimations(input)"
                                    :value="item.value"
                                >
                                  <!--Toggle menu with estimation-->
                                  {{item.name}} ({{item.value.toFixed(3)}})
                                </option>
                                <option :value="wwtp_model[input]">Custom value</option>
                              </select>
                            </div>

                          </div>
                        </v-col>
                        <v-col :cols="keys_without_level_of_certainty.has(input) ? 5 : 3">
                          <div>
                            <div>
                              <v-select
                                  v-if="type_option[input]"
                                  v-model="wwtp_model[input]"
                                  item-text="text"
                                  item-value="value"
                                  :items="type_option[input].items"
                                  label="Select"
                              >
                              </v-select>
                              <v-text-field
                                  v-else
                                  v-model="wwtp_model[input]"
                                  :suffix=user_inputs[input].unit
                                  type="number"
                              ></v-text-field>

                            </div>
                          </div>

                        </v-col>
                        <v-col cols="2" v-if="!keys_without_level_of_certainty.has(input)">
                          <v-select
                              label="Level of certainty"
                              :items = level_of_certainty
                              item-text="text"
                              item-value="key"
                              v-model="wwtp_model.level_of_certainty[input]"

                          ></v-select>

                        </v-col>


                      </v-row>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-container>
                <!-- Sludge composting in WWTP -->
                <v-container>
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
                        <v-col cols="7" >
                          <div style="width: 100%;">
                            <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                            <span>
                              {{user_inputs[input].question}}
                              <v-tooltip bottom v-if="user_inputs[input].hasOwnProperty('description_tooltip')">
                                <template v-slot:activator="{ on, attrs }">
                                  <v-icon
                                      v-bind="attrs"
                                      v-on="on"
                                      color="primary"
                                      style="margin-left: 2px; margin-right: 2px; font-size: 1.3rem;"
                                  >
                                    mdi-information-outline
                                  </v-icon>
                                </template>
                                <span>{{ user_inputs[input]['description_tooltip'] }}</span>
                              </v-tooltip>

                            </span>
                              <v-btn v-if="button_estimation.includes(input) && !isNaN(button_estimations(input)) && button_estimations(input) != null"
                                     tile
                                     color="#b62373"
                                     x-small
                                     @click="wwtp_model[input] = button_estimations(input)"
                              >
                                Estimation:  {{button_estimations(input).toExponential(3)}}<!-- Estimation button -->
                              </v-btn>
                            </div>
                            <div v-if="select_estimation.includes(input)" style="width: 100%">
                              <select v-model = "wwtp_model[input]" style="max-width:90%;background-color: #d9d9d5; width: 90%; -webkit-appearance: menulist"  >
                                <option
                                    v-for="item in select_estimations(input)"
                                    :value="item.value"
                                >
                                  <!--Toggle menu with estimation-->
                                  {{item.name}} ({{item.value.toFixed(3)}})
                                </option>
                                <option :value="wwtp_model[input]">Custom value</option>
                              </select>
                            </div>

                          </div>
                        </v-col>
                        <v-col :cols="keys_without_level_of_certainty.has(input) ? 5 : 3">
                          <div>
                            <div>
                              <v-select
                                  v-if="type_option[input]"
                                  v-model="wwtp_model[input]"
                                  item-text="text"
                                  item-value="value"
                                  :items="type_option[input].items"
                                  label="Select"
                              >
                              </v-select>
                              <v-text-field
                                  v-else
                                  v-model="wwtp_model[input]"
                                  :suffix=user_inputs[input].unit
                                  type="number"
                              ></v-text-field>

                            </div>
                          </div>

                        </v-col>
                        <v-col cols="2" v-if="!keys_without_level_of_certainty.has(input)">
                          <v-select
                              label="Level of certainty"
                              :items = level_of_certainty
                              item-text="text"
                              item-value="key"
                              v-model="wwtp_model.level_of_certainty[input]"

                          ></v-select>

                        </v-col>


                      </v-row>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-container>
                <!-- Sludge incineration -->
                <v-container>
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
                        <v-col cols="7" >
                          <div style="width: 100%;">
                            <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                            <span>
                              {{user_inputs[input].question}}
                              <v-tooltip bottom v-if="user_inputs[input].hasOwnProperty('description_tooltip')">
                                <template v-slot:activator="{ on, attrs }">
                                  <v-icon
                                      v-bind="attrs"
                                      v-on="on"
                                      color="primary"
                                      style="margin-left: 2px; margin-right: 2px; font-size: 1.3rem;"
                                  >
                                    mdi-information-outline
                                  </v-icon>
                                </template>
                                <span>{{ user_inputs[input]['description_tooltip'] }}</span>
                              </v-tooltip>

                            </span>
                              <v-btn v-if="button_estimation.includes(input) && !isNaN(button_estimations(input)) && button_estimations(input) != null"
                                     tile
                                     color="#b62373"
                                     x-small
                                     @click="wwtp_model[input] = button_estimations(input)"
                              >
                                Estimation:  {{button_estimations(input).toExponential(3)}}<!-- Estimation button -->
                              </v-btn>
                            </div>
                            <div v-if="select_estimation.includes(input)" style="width: 100%">
                              <select v-model = "wwtp_model[input]" style="max-width:90%;background-color: #d9d9d5; width: 90%; -webkit-appearance: menulist"  >
                                <option
                                    v-for="item in select_estimations(input)"
                                    :value="item.value"
                                >
                                  <!--Toggle menu with estimation-->
                                  {{item.name}} ({{item.value.toFixed(3)}})
                                </option>
                                <option :value="wwtp_model[input]">Custom value</option>
                              </select>
                            </div>

                          </div>
                        </v-col>
                        <v-col :cols="keys_without_level_of_certainty.has(input) ? 5 : 3">
                          <div>
                            <div>
                              <v-select
                                  v-if="type_option[input]"
                                  v-model="wwtp_model[input]"
                                  item-text="text"
                                  item-value="value"
                                  :items="type_option[input].items"
                                  label="Select"
                              >
                              </v-select>
                              <v-text-field
                                  v-else
                                  v-model="wwtp_model[input]"
                                  :suffix=user_inputs[input].unit
                                  type="number"
                              ></v-text-field>

                            </div>
                          </div>

                        </v-col>
                        <v-col cols="2" v-if="!keys_without_level_of_certainty.has(input)">
                          <v-select
                              label="Level of certainty"
                              :items = level_of_certainty
                              item-text="text"
                              item-value="key"
                              v-model="wwtp_model.level_of_certainty[input]"

                          ></v-select>

                        </v-col>


                      </v-row>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-container>
                <!-- Sludge sent to dry application -->
                <v-container>
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
                        <v-col cols="7" >
                          <div style="width: 100%;">
                            <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                            <span>
                              {{user_inputs[input].question}}
                              <v-tooltip bottom v-if="user_inputs[input].hasOwnProperty('description_tooltip')">
                                <template v-slot:activator="{ on, attrs }">
                                  <v-icon
                                      v-bind="attrs"
                                      v-on="on"
                                      color="primary"
                                      style="margin-left: 2px; margin-right: 2px; font-size: 1.3rem;"
                                  >
                                    mdi-information-outline
                                  </v-icon>
                                </template>
                                <span>{{ user_inputs[input]['description_tooltip'] }}</span>
                              </v-tooltip>

                            </span>
                              <v-btn v-if="button_estimation.includes(input) && !isNaN(button_estimations(input)) && button_estimations(input) != null"
                                     tile
                                     color="#b62373"
                                     x-small
                                     @click="wwtp_model[input] = button_estimations(input)"
                              >
                                Estimation:  {{button_estimations(input).toExponential(3)}}<!-- Estimation button -->
                              </v-btn>
                            </div>
                            <div v-if="select_estimation.includes(input)" style="width: 100%">
                              <select v-model = "wwtp_model[input]" style="max-width:90%;background-color: #d9d9d5; width: 90%; -webkit-appearance: menulist"  >
                                <option
                                    v-for="item in select_estimations(input)"
                                    :value="item.value"
                                >
                                  <!--Toggle menu with estimation-->
                                  {{item.name}} ({{item.value.toFixed(3)}})
                                </option>
                                <option :value="wwtp_model[input]">Custom value</option>
                              </select>
                            </div>

                          </div>
                        </v-col>
                        <v-col :cols="keys_without_level_of_certainty.has(input) ? 5 : 3">
                          <div>
                            <div>
                              <v-select
                                  v-if="type_option[input]"
                                  v-model="wwtp_model[input]"
                                  item-text="text"
                                  item-value="value"
                                  :items="type_option[input].items"
                                  label="Select"
                              >
                              </v-select>
                              <v-text-field
                                  v-else
                                  v-model="wwtp_model[input]"
                                  :suffix=user_inputs[input].unit
                                  type="number"
                              ></v-text-field>

                            </div>
                          </div>

                        </v-col>
                        <v-col cols="2" v-if="!keys_without_level_of_certainty.has(input)">
                          <v-select
                              label="Level of certainty"
                              :items = level_of_certainty
                              item-text="text"
                              item-value="key"
                              v-model="wwtp_model.level_of_certainty[input]"

                          ></v-select>

                        </v-col>


                      </v-row>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-container>
                <!-- Sludge landfilling -->
                <v-container>
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
                        <v-col cols="7" >
                          <div style="width: 100%;">
                            <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                            <span>
                              {{user_inputs[input].question}}
                              <v-tooltip bottom v-if="user_inputs[input].hasOwnProperty('description_tooltip')">
                                <template v-slot:activator="{ on, attrs }">
                                  <v-icon
                                      v-bind="attrs"
                                      v-on="on"
                                      color="primary"
                                      style="margin-left: 2px; margin-right: 2px; font-size: 1.3rem;"
                                  >
                                    mdi-information-outline
                                  </v-icon>
                                </template>
                                <span>{{ user_inputs[input]['description_tooltip'] }}</span>
                              </v-tooltip>

                            </span>
                              <v-btn v-if="button_estimation.includes(input) && !isNaN(button_estimations(input)) && button_estimations(input) != null"
                                     tile
                                     color="#b62373"
                                     x-small
                                     @click="wwtp_model[input] = button_estimations(input)"
                              >
                                Estimation:  {{button_estimations(input).toExponential(3)}}<!-- Estimation button -->
                              </v-btn>
                            </div>
                            <div v-if="select_estimation.includes(input)" style="width: 100%">
                              <select v-model = "wwtp_model[input]" style="max-width:90%;background-color: #d9d9d5; width: 90%; -webkit-appearance: menulist"  >
                                <option
                                    v-for="item in select_estimations(input)"
                                    :value="item.value"
                                >
                                  <!--Toggle menu with estimation-->
                                  {{item.name}} ({{item.value.toFixed(3)}})
                                </option>
                                <option :value="wwtp_model[input]">Custom value</option>
                              </select>
                            </div>

                          </div>
                        </v-col>
                        <v-col :cols="keys_without_level_of_certainty.has(input) ? 5 : 3">
                          <div>
                            <div>
                              <v-select
                                  v-if="type_option[input]"
                                  v-model="wwtp_model[input]"
                                  item-text="text"
                                  item-value="value"
                                  :items="type_option[input].items"
                                  label="Select"
                              >
                              </v-select>
                              <v-text-field
                                  v-else
                                  v-model="wwtp_model[input]"
                                  :suffix=user_inputs[input].unit
                                  type="number"
                              ></v-text-field>

                            </div>
                          </div>

                        </v-col>
                        <v-col cols="2" v-if="!keys_without_level_of_certainty.has(input)">
                          <v-select
                              label="Level of certainty"
                              :items = level_of_certainty
                              item-text="text"
                              item-value="key"
                              v-model="wwtp_model.level_of_certainty[input]"

                          ></v-select>

                        </v-col>


                      </v-row>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-container>
                <!-- Sludge stockpiling -->
                <v-container>
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
                        <v-col cols="7" >
                          <div style="width: 100%;">
                            <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                            <span>
                              {{user_inputs[input].question}}
                            </span>
                              <v-tooltip bottom v-if="user_inputs[input].hasOwnProperty('description_tooltip')">
                                <template v-slot:activator="{ on, attrs }">
                                  <v-icon
                                      v-bind="attrs"
                                      v-on="on"
                                      color="primary"
                                      style="margin-left: 2px; margin-right: 2px; font-size: 1.3rem;"
                                  >
                                    mdi-information-outline
                                  </v-icon>
                                </template>
                                <span>{{ user_inputs[input]['description_tooltip'] }}</span>
                              </v-tooltip>

                              <v-btn v-if="button_estimation.includes(input) && !isNaN(button_estimations(input)) && button_estimations(input) != null"
                                     tile
                                     color="#b62373"
                                     x-small
                                     @click="wwtp_model[input] = button_estimations(input)"
                              >
                                Estimation:  {{button_estimations(input).toExponential(3)}}<!-- Estimation button -->
                              </v-btn>
                            </div>
                            <div v-if="select_estimation.includes(input)" style="width: 100%">
                              <select v-model = "wwtp_model[input]" style="max-width:90%;background-color: #d9d9d5; width: 90%; -webkit-appearance: menulist"  >
                                <option
                                    v-for="item in select_estimations(input)"
                                    :value="item.value"
                                >
                                  <!--Toggle menu with estimation-->
                                  {{item.name}} ({{item.value.toFixed(3)}})
                                </option>
                                <option :value="wwtp_model[input]">Custom value</option>
                              </select>
                            </div>

                          </div>
                        </v-col>
                        <v-col :cols="keys_without_level_of_certainty.has(input) ? 5 : 3">
                          <div>
                            <div>
                              <v-select
                                  v-if="type_option[input]"
                                  v-model="wwtp_model[input]"
                                  item-text="text"
                                  item-value="value"
                                  :items="type_option[input].items"
                                  label="Select"
                              >
                              </v-select>
                              <v-text-field
                                  v-else
                                  v-model="wwtp_model[input]"
                                  :suffix=user_inputs[input].unit
                                  type="number"
                              ></v-text-field>

                            </div>
                          </div>

                        </v-col>
                        <v-col cols="2" v-if="!keys_without_level_of_certainty.has(input)">
                          <v-select
                              label="Level of certainty"
                              :items = level_of_certainty
                              item-text="text"
                              item-value="key"
                              v-model="wwtp_model.level_of_certainty[input]"

                          ></v-select>

                        </v-col>


                      </v-row>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-container>
                <!-- Sludge truck transportation to disposal site -->
                <v-container>
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
                        <v-col cols="7" >
                          <div style="width: 100%;">
                            <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                            <span>
                              {{user_inputs[input].question}}
                            </span>
                              <v-tooltip bottom v-if="user_inputs[input].hasOwnProperty('description_tooltip')">
                                <template v-slot:activator="{ on, attrs }">
                                  <v-icon
                                      v-bind="attrs"
                                      v-on="on"
                                      color="primary"
                                      style="margin-left: 2px; margin-right: 2px; font-size: 1.3rem;"
                                  >
                                    mdi-information-outline
                                  </v-icon>
                                </template>
                                <span>{{ user_inputs[input]['description_tooltip'] }}</span>
                              </v-tooltip>

                              <v-btn v-if="button_estimation.includes(input) && !isNaN(button_estimations(input)) && button_estimations(input) != null"
                                     tile
                                     color="#b62373"
                                     x-small
                                     @click="wwtp_model[input] = button_estimations(input)"
                              >
                                Estimation:  {{button_estimations(input).toExponential(3)}}<!-- Estimation button -->
                              </v-btn>
                            </div>
                            <div v-if="select_estimation.includes(input)" style="width: 100%">
                              <select v-model = "wwtp_model[input]" style="max-width:90%;background-color: #d9d9d5; width: 90%; -webkit-appearance: menulist"  >
                                <option
                                    v-for="item in select_estimations(input)"
                                    :value="item.value"
                                >
                                  <!--Toggle menu with estimation-->
                                  {{item.name}} ({{item.value.toFixed(3)}})
                                </option>
                                <option :value="wwtp_model[input]">Custom value</option>
                              </select>
                            </div>

                          </div>
                        </v-col>
                        <v-col :cols="keys_without_level_of_certainty.has(input) ? 5 : 3">
                          <div>
                            <div>
                              <v-select
                                  v-if="type_option[input]"
                                  v-model="wwtp_model[input]"
                                  item-text="text"
                                  item-value="value"
                                  :items="type_option[input].items"
                                  label="Select"
                              >
                              </v-select>
                              <v-text-field
                                  v-else
                                  v-model="wwtp_model[input]"
                                  :suffix=user_inputs[input].unit
                                  type="number"
                              ></v-text-field>

                            </div>
                          </div>

                        </v-col>
                        <v-col cols="2" v-if="!keys_without_level_of_certainty.has(input)">
                          <v-select
                              label="Level of certainty"
                              :items = level_of_certainty
                              item-text="text"
                              item-value="key"
                              v-model="wwtp_model.level_of_certainty[input]"

                          ></v-select>

                        </v-col>


                      </v-row>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-container>

              </v-expansion-panels>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>

      </v-container>


    </div>
    <br>
  </div>

</template>

<script>

import { updatedDiff } from 'deep-object-diff';
import {level_of_certainty} from "@/level_of_certainty";

export default {
  name: "wwtp_questionnaire",
  props: [ 'industry', 'stepper_model', 'array_intersection', 'basic_inputs',
    'wwtp_inputs', 'basic_inputs', 'user_inputs', 'required', 'button_estimation',
    'select_estimation', 'type_option', 'wwtp_model', 'button_estimations', 'select_estimations',
    'advanced_truck_transportation', 'advanced_stockpiling', 'advanced_landfilling',
    'advanced_application', 'advanced_sludge_incineration', 'advanced_sludge_composting',
    'advanced_sludge_storage', 'advanced_water_reuse_trucks', 'advanced_biogas_from_anaerobic',
  'advanced_fuel_engines', 'model_selected_pollutants'],
  data(){
    return {
      level_of_certainty: [
        { text: 'User data', key: 'user_data' },
        { text: 'Estimated', key: 'estimated' },
        { text: 'Modeled', key: 'modeled' },
        { text: 'No data', key: 'no_data' },
      ],
      keys_without_level_of_certainty: level_of_certainty.keys_without_level_of_certainty
    }
  },

  created() {
    console.log(this.industry.onsite_wwtp.discharge_same_location_as_withdrawal)
  },

  computed:{
    clonedIndustry: function(){
      return JSON.parse(JSON.stringify(this.wwtp_model))
    },

  },
  watch: {
    clonedIndustry(newValue, oldValue){
      let input_diff = Object.keys(updatedDiff(newValue, oldValue))[0]
      let value_diff = Object.values(updatedDiff(newValue, oldValue))[0]
      let pollutant = null
      if (typeof value_diff === 'object' && value_diff !== null){
        pollutant = Object.keys(value_diff)[0]
      }
      level_of_certainty.update_level_of_certainty(this.industry, this.wwtp_model, this.stepper_model, input_diff, pollutant )
    },

  }

}

</script>





