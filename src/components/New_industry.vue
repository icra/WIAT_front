<template>
  <div class="outer">
    <div>
      <h1> {{ this.industry.name}} </h1>
    </div>
    <br>


    <v-stepper v-model="stepper_model" alt-labels>
      <v-stepper-header>
        <v-stepper-step
            step="1"
            editable
        >
          Water withdrawal and industry
        </v-stepper-step>

        <v-divider></v-divider>

        <v-stepper-step
            step="2"
            :editable="industry.has_onsite_wwtp"

        >
          On-site WWTP
        </v-stepper-step>

        <v-divider></v-divider>

        <v-stepper-step
            step="3"
            :editable="industry.has_direct_discharge"
        >
          Direct discharge
        </v-stepper-step>

        <v-stepper-step
            step="4"
            :editable="industry.has_offsite_wwtp"
        >
          Offsite WWTP
        </v-stepper-step>


        <v-divider></v-divider>

      </v-stepper-header>

      <v-stepper-items>
        <v-stepper-content step="1">

          <v-row>
            <v-col cols="8">
              <v-img
                  :src="water_withdrawal_image"
                  height="450"
                  class="grey darken-4"
              ></v-img>

            </v-col>
            <v-col cols="4">
              <v-form
                  v-model="water_withdrawal_valid"
              >
                <v-text-field
                    v-model="water_withdrawn"
                    label="Amount of water withdrawn from the water body"
                    suffix="m3"
                    type="number"
                    :rules="[water_withdrawn_rule]"
                ></v-text-field>
                <v-select
                    v-model="has_onsite_wwtp"
                    :items="yes_no"
                    filled
                    label="Has the industry an on-site treatment wastewater plant?"
                ></v-select>
                <v-select
                    v-model="has_direct_discharge"
                    :items="yes_no"
                    filled
                    label="Does the industry directly discharge wastewater into the water body?"
                ></v-select>
                <v-select
                    v-model="has_offsite_wwtp"
                    :items="yes_no"
                    filled
                    label="Has the industry an off-site treatment wastewater plant?"
                ></v-select>
                <v-select
                    v-model="offsite_wwtp_type"
                    :items="industrial_domestic"
                    filled
                    label="Off-site treatment wastewater plant type"
                    v-if="has_offsite_wwtp"
                ></v-select>
                <v-select
                    v-model="industry_type"
                    :items="industry_typologies"
                    filled
                    label="Industry type"
                ></v-select>

              </v-form>
            </v-col>

          </v-row>
          <br>
          <v-btn
              color="primary"
              @click="tab_1_continue"
              :disabled="!water_withdrawal_valid"
          >
            SAVE AND CONTINUE
          </v-btn>
        </v-stepper-content>

        <v-stepper-content step="2">
          <v-row>
            <v-col cols="12">
              <v-img
                  :src="onsite_external_image"
                  height="600"
                  class="grey darken-4"
                  v-if="industry.has_offsite_wwtp"
              ></v-img>
              <v-img
                  :src="onsite_no_external_image"
                  height="600"
                  class="grey darken-4"
                  v-else
              ></v-img>

            </v-col>
          </v-row>
          <br>
          <div v-if="industry.has_onsite_wwtp && stepper_model == 2">

            <!-- Show inputs under "None" key -->
            <div
                v-for="[key, value] of Object.entries(this.onsite_inputs.None)"
                :key="key"
            >
              <div>
                <v-row style="background-color: #F2F4F3" align="center">
                  <v-col cols="8" >
                    <div style="width: 100%;">
                      <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                      <span>
                        {{value.question}}
                        <!-- Input -->
                        <v-tooltip
                            bottom
                            v-if="value.description_tooltip"
                            max-width="500"
                        >
                          <template v-slot:activator="{ on, attrs }">
                            <v-icon
                                color=#1C195B
                                v-bind="attrs"
                                v-on="on"
                                size="20px"
                            >
                              mdi-information-variant
                            </v-icon>
                          </template>
                          <span>{{value.description_tooltip}}</span>
                        </v-tooltip>

                      </span>

                        <v-tooltip
                            bottom
                            v-if="value.estimation_equation">
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn
                                v-bind="attrs"
                                v-on="on"
                                outlined
                                x-small
                                @click="wwtp_aux_inputs[key] = parseFloat(estimations[key](wwtp_aux_inputs))"
                            >
                              Estimation: {{parseFloat(estimations[key](wwtp_aux_inputs)).toFixed(2)}}{{value.unit}} <!-- Botó amb estimació -->
                            </v-btn>
                          </template>

                          <span style="white-space: pre;" v-html="estimations[key]"></span>
                        </v-tooltip>

                      </div>
                      <div v-if="value.estimation_type === 'option'" style="width: 100%">
                        <select v-model="wwtp_aux_inputs[key]" style="max-width:90%;background-color: #d9d9d5; width: 90%; -webkit-appearance: menulist"  >
                          <option
                              v-for="item in value.items"
                              :value="value.estimation_based_on === null ? item[value.estimation_factor] : (typeof wwtp_aux_inputs[value.estimation_based_on] == 'function' ? item[value.estimation_factor]*wwtp_aux_inputs[value.estimation_based_on]() : item[value.estimation_factor]*wwtp_aux_inputs[value.estimation_based_on])"
                          >
                            <!--Desplegable amb estimació-->
                            {{item.name}} {{item[value.description]}} ({{value.estimation_based_on === null ? item[value.estimation_factor] : (typeof wwtp_aux_inputs[value.estimation_based_on] == 'function' ? parseFloat(item[value.estimation_factor]*wwtp_aux_inputs[value.estimation_based_on]()).toFixed(3) : parseFloat(item[value.estimation_factor]*wwtp_aux_inputs[value.estimation_based_on]).toFixed(3))}} {{value.unit}})
                          </option>
                          <option :value="wwtp_aux_inputs[key]">Custom value</option>
                        </select>
                      </div>
                    </div>
                  </v-col>
                  <v-col cols="4">
                    <div>
                      <div v-if="value.type === 'option'">
                        <v-select
                            v-model="wwtp_aux_inputs[key]"
                            :items="value.items"
                            item-text="text"
                            item-value="value"
                            label="Select"
                        ></v-select>
                      </div>
                      <div v-else >
                        <v-text-field
                            v-model="wwtp_aux_inputs[key]"
                            :suffix="value.unit"
                            type="number"
                        ></v-text-field>

                      </div>
                    </div>

                  </v-col>

                </v-row>


              </div>
            </div>
            <!-- Show other -->
            <v-expansion-panels>
              <v-expansion-panel
                  v-for="[title, form] of Object.entries(this.onsite_inputs)"
                  :key="title"
                  v-if="title !== 'None'"
              >
                <v-expansion-panel-header>
                  {{ title }}
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <div
                      v-for="[key, value] of Object.entries(form)"
                      :key="key"
                  >
                    <div>
                      <v-row style="background-color: #F2F4F3" align="center">
                        <v-col cols="8" >
                          <div style="width: 100%;">
                            <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                      <span>
                        {{value.question}}
                        <!-- Input -->
                        <v-tooltip
                            bottom
                            v-if="value.description_tooltip"
                            max-width="500"
                        >
                          <template v-slot:activator="{ on, attrs }">
                            <v-icon
                                color=#1C195B
                                v-bind="attrs"
                                v-on="on"
                                size="20px"
                            >
                              mdi-information-variant
                            </v-icon>
                          </template>
                          <span>{{value.description_tooltip}}</span>
                        </v-tooltip>

                      </span>

                              <v-tooltip
                                  bottom
                                  v-if="value.estimation_equation">
                                <template v-slot:activator="{ on, attrs }">
                                  <v-btn
                                      v-bind="attrs"
                                      v-on="on"
                                      outlined
                                      x-small
                                      @click="wwtp_aux_inputs[key] = parseFloat(estimations[key](wwtp_aux_inputs))"
                                  >
                                    Estimation: {{parseFloat(estimations[key](wwtp_aux_inputs)).toFixed(2)}}{{value.unit}} <!-- Botó amb estimació -->
                                  </v-btn>
                                </template>

                                <span style="white-space: pre;" v-html="estimations[key]"></span>
                              </v-tooltip>

                            </div>
                            <div v-if="value.estimation_type === 'option'" style="width: 100%">
                              <select v-model="wwtp_aux_inputs[key]" style="max-width:90%;background-color: #d9d9d5; width: 90%; -webkit-appearance: menulist"  >
                                <option
                                    v-for="item in value.items"
                                    :value="value.estimation_based_on === null ? item[value.estimation_factor] : (typeof wwtp_aux_inputs[value.estimation_based_on] == 'function' ? item[value.estimation_factor]*wwtp_aux_inputs[value.estimation_based_on]() : item[value.estimation_factor]*wwtp_aux_inputs[value.estimation_based_on])"
                                >
                                  <!--Desplegable amb estimació-->
                                  {{item.name}} {{item[value.description]}} ({{value.estimation_based_on === null ? item[value.estimation_factor] : (typeof wwtp_aux_inputs[value.estimation_based_on] == 'function' ? parseFloat(item[value.estimation_factor]*wwtp_aux_inputs[value.estimation_based_on]()).toFixed(3) : parseFloat(item[value.estimation_factor]*wwtp_aux_inputs[value.estimation_based_on]).toFixed(3))}} {{value.unit}})
                                </option>
                                <option :value="wwtp_aux_inputs[key]">Custom value</option>
                              </select>
                            </div>
                          </div>
                        </v-col>
                        <v-col cols="4">
                          <div>
                            <div v-if="value.type === 'option'">
                              <v-select
                                  v-model="wwtp_aux_inputs[key]"
                                  :items="value.items"
                                  item-text="text"
                                  item-value="value"
                                  label="Select"
                              ></v-select>
                            </div>
                            <div v-else >
                              <v-text-field
                                  v-model="wwtp_aux_inputs[key]"
                                  :suffix="value.unit"
                                  type="number"
                              ></v-text-field>

                            </div>
                          </div>

                        </v-col>

                      </v-row>


                    </div>
                  </div>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>

          </div>
          <br>
          <v-btn
              color="primary"
              @click="tab_2_continue"
          >
            SAVE AND CONTINUE
          </v-btn>

        </v-stepper-content>

        <v-stepper-content step="3">

          <v-row>
            <v-col cols="12">
              <v-img
                  :src="direct_discharge_image"
                  height="600"
                  class="grey darken-4"
              ></v-img>

            </v-col>
          </v-row>
          <br>
          <div v-if="industry.has_direct_discharge && stepper_model == 3">

            <!-- Show inputs under "None" key -->
            <div
                v-for="[key, value] of Object.entries(this.direct_discharge_inputs.None)"
                :key="key"
            >
              <div>
                <v-row style="background-color: #F2F4F3" align="center">
                  <v-col cols="8" >
                    <div style="width: 100%;">
                      <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                      <span>
                        {{value.question}}
                        <!-- Input -->
                        <v-tooltip
                            bottom
                            v-if="value.description_tooltip"
                            max-width="500"
                        >
                          <template v-slot:activator="{ on, attrs }">
                            <v-icon
                                color=#1C195B
                                v-bind="attrs"
                                v-on="on"
                                size="20px"
                            >
                              mdi-information-variant
                            </v-icon>
                          </template>
                          <span>{{value.description_tooltip}}</span>
                        </v-tooltip>

                      </span>

                        <v-tooltip
                            bottom
                            v-if="value.estimation_equation">
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn
                                v-bind="attrs"
                                v-on="on"
                                outlined
                                x-small
                                @click="wwtp_aux_inputs[key] = parseFloat(estimations[key](wwtp_aux_inputs))"
                            >
                              Estimation: {{parseFloat(estimations[key](wwtp_aux_inputs)).toFixed(2)}}{{value.unit}} <!-- Botó amb estimació -->
                            </v-btn>
                          </template>

                          <span style="white-space: pre;" v-html="estimations[key]"></span>
                        </v-tooltip>

                      </div>
                      <div v-if="value.estimation_type === 'option'" style="width: 100%">
                        <select v-model="wwtp_aux_inputs[key]" style="max-width:90%;background-color: #d9d9d5; width: 90%; -webkit-appearance: menulist"  >
                          <option
                              v-for="item in value.items"
                              :value="value.estimation_based_on === null ? item[value.estimation_factor] : (typeof wwtp_aux_inputs[value.estimation_based_on] == 'function' ? item[value.estimation_factor]*wwtp_aux_inputs[value.estimation_based_on]() : item[value.estimation_factor]*wwtp_aux_inputs[value.estimation_based_on])"
                          >
                            <!--Desplegable amb estimació-->
                            {{item.name}} {{item[value.description]}} ({{value.estimation_based_on === null ? item[value.estimation_factor] : (typeof wwtp_aux_inputs[value.estimation_based_on] == 'function' ? parseFloat(item[value.estimation_factor]*wwtp_aux_inputs[value.estimation_based_on]()).toFixed(3) : parseFloat(item[value.estimation_factor]*wwtp_aux_inputs[value.estimation_based_on]).toFixed(3))}} {{value.unit}})
                          </option>
                          <option :value="wwtp_aux_inputs[key]">Custom value</option>
                        </select>
                      </div>
                    </div>
                  </v-col>
                  <v-col cols="4">
                    <div>
                      <div v-if="value.type === 'option'">
                        <v-select
                            v-model="wwtp_aux_inputs[key]"
                            :items="value.items"
                            item-text="text"
                            item-value="value"
                            label="Select"
                        ></v-select>
                      </div>
                      <div v-else >
                        <v-text-field
                            v-model="wwtp_aux_inputs[key]"
                            :suffix="value.unit"
                            type="number"
                        ></v-text-field>

                      </div>
                    </div>

                  </v-col>

                </v-row>


              </div>
            </div>

          </div>
          <br>

          <v-btn
              color="primary"
              @click="tab_3_continue"
          >
            SAVE AND CONTINUE
          </v-btn>

        </v-stepper-content>

        <v-stepper-content step="4">
          <v-row>
            <v-col cols="12">
              <v-img
                  :src="external_internal_image"
                  height="600"
                  class="grey darken-4"
                  v-if="industry.has_onsite_wwtp"
              ></v-img>
              <v-img
                  :src="external_no_internal_image"
                  height="600"
                  class="grey darken-4"
                  v-else
              ></v-img>

            </v-col>
          </v-row>
          <br>
          <div v-if="industry.has_offsite_wwtp && stepper_model == 4">

            <!-- Show inputs under "None" key -->
            <div
                v-for="[key, value] of Object.entries(this.offsite_inputs.None)"
                :key="key"
            >
              <div>
                <v-row style="background-color: #F2F4F3" align="center">
                  <v-col cols="8" >
                    <div style="width: 100%;">
                      <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                      <span>
                        {{value.question}}
                        <!-- Input -->
                        <v-tooltip
                            bottom
                            v-if="value.description_tooltip"
                            max-width="500"
                        >
                          <template v-slot:activator="{ on, attrs }">
                            <v-icon
                                color=#1C195B
                                v-bind="attrs"
                                v-on="on"
                                size="20px"
                            >
                              mdi-information-variant
                            </v-icon>
                          </template>
                          <span>{{value.description_tooltip}}</span>
                        </v-tooltip>

                      </span>

                        <v-tooltip
                            bottom
                            v-if="value.estimation_equation">
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn
                                v-bind="attrs"
                                v-on="on"
                                outlined
                                x-small
                                @click="wwtp_aux_inputs[key] = parseFloat(estimations[key](wwtp_aux_inputs))"
                            >
                              Estimation: {{parseFloat(estimations[key](wwtp_aux_inputs)).toFixed(2)}}{{value.unit}} <!-- Botó amb estimació -->
                            </v-btn>
                          </template>

                          <span style="white-space: pre;" v-html="estimations[key]"></span>
                        </v-tooltip>

                      </div>
                      <div v-if="value.estimation_type === 'option'" style="width: 100%">
                        <select v-model="wwtp_aux_inputs[key]" style="max-width:90%;background-color: #d9d9d5; width: 90%; -webkit-appearance: menulist"  >
                          <option
                              v-for="item in value.items"
                              :value="value.estimation_based_on === null ? item[value.estimation_factor] : (typeof wwtp_aux_inputs[value.estimation_based_on] == 'function' ? item[value.estimation_factor]*wwtp_aux_inputs[value.estimation_based_on]() : item[value.estimation_factor]*wwtp_aux_inputs[value.estimation_based_on])"
                          >
                            <!--Desplegable amb estimació-->
                            {{item.name}} {{item[value.description]}} ({{value.estimation_based_on === null ? item[value.estimation_factor] : (typeof wwtp_aux_inputs[value.estimation_based_on] == 'function' ? parseFloat(item[value.estimation_factor]*wwtp_aux_inputs[value.estimation_based_on]()).toFixed(3) : parseFloat(item[value.estimation_factor]*wwtp_aux_inputs[value.estimation_based_on]).toFixed(3))}} {{value.unit}})
                          </option>
                          <option :value="wwtp_aux_inputs[key]">Custom value</option>
                        </select>
                      </div>
                    </div>
                  </v-col>
                  <v-col cols="4">
                    <div>
                      <div v-if="value.type === 'option'">
                        <v-select
                            v-model="wwtp_aux_inputs[key]"
                            :items="value.items"
                            item-text="text"
                            item-value="value"
                            label="Select"
                        ></v-select>
                      </div>
                      <div v-else >
                        <v-text-field
                            v-model="wwtp_aux_inputs[key]"
                            :suffix="value.unit"
                            type="number"
                        ></v-text-field>

                      </div>
                    </div>

                  </v-col>

                </v-row>


              </div>
            </div>
            <!-- Show other -->
            <v-expansion-panels>
              <v-expansion-panel
                  v-for="[title, form] of Object.entries(this.offsite_inputs)"
                  :key="title"
                  v-if="title !== 'None'"
              >
                <v-expansion-panel-header>
                  {{ title }}
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <div
                      v-for="[key, value] of Object.entries(form)"
                      :key="key"
                  >
                    <div>
                      <v-row style="background-color: #F2F4F3" align="center">
                        <v-col cols="8" >
                          <div style="width: 100%;">
                            <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                      <span>
                        {{value.question}}
                        <!-- Input -->
                        <v-tooltip
                            bottom
                            v-if="value.description_tooltip"
                            max-width="500"
                        >
                          <template v-slot:activator="{ on, attrs }">
                            <v-icon
                                color=#1C195B
                                v-bind="attrs"
                                v-on="on"
                                size="20px"
                            >
                              mdi-information-variant
                            </v-icon>
                          </template>
                          <span>{{value.description_tooltip}}</span>
                        </v-tooltip>

                      </span>

                              <v-tooltip
                                  bottom
                                  v-if="value.estimation_equation">
                                <template v-slot:activator="{ on, attrs }">
                                  <v-btn
                                      v-bind="attrs"
                                      v-on="on"
                                      outlined
                                      x-small
                                      @click="wwtp_aux_inputs[key] = parseFloat(estimations[key](wwtp_aux_inputs))"
                                  >
                                    Estimation: {{parseFloat(estimations[key](wwtp_aux_inputs)).toFixed(2)}}{{value.unit}} <!-- Botó amb estimació -->
                                  </v-btn>
                                </template>

                                <span style="white-space: pre;" v-html="estimations[key]"></span>
                              </v-tooltip>

                            </div>
                            <div v-if="value.estimation_type === 'option'" style="width: 100%">
                              <select v-model="wwtp_aux_inputs[key]" style="max-width:90%;background-color: #d9d9d5; width: 90%; -webkit-appearance: menulist"  >
                                <option
                                    v-for="item in value.items"
                                    :value="value.estimation_based_on === null ? item[value.estimation_factor] : (typeof wwtp_aux_inputs[value.estimation_based_on] == 'function' ? item[value.estimation_factor]*wwtp_aux_inputs[value.estimation_based_on]() : item[value.estimation_factor]*wwtp_aux_inputs[value.estimation_based_on])"
                                >
                                  <!--Desplegable amb estimació-->
                                  {{item.name}} {{item[value.description]}} ({{value.estimation_based_on === null ? item[value.estimation_factor] : (typeof wwtp_aux_inputs[value.estimation_based_on] == 'function' ? parseFloat(item[value.estimation_factor]*wwtp_aux_inputs[value.estimation_based_on]()).toFixed(3) : parseFloat(item[value.estimation_factor]*wwtp_aux_inputs[value.estimation_based_on]).toFixed(3))}} {{value.unit}})
                                </option>
                                <option :value="wwtp_aux_inputs[key]">Custom value</option>
                              </select>
                            </div>
                          </div>
                        </v-col>
                        <v-col cols="4">
                          <div>
                            <div v-if="value.type === 'option'">
                              <v-select
                                  v-model="wwtp_aux_inputs[key]"
                                  :items="value.items"
                                  item-text="text"
                                  item-value="value"
                                  label="Select"
                              ></v-select>
                            </div>
                            <div v-else >
                              <v-text-field
                                  v-model="wwtp_aux_inputs[key]"
                                  :suffix="value.unit"
                                  type="number"
                              ></v-text-field>

                            </div>
                          </div>

                        </v-col>

                      </v-row>


                    </div>
                  </div>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>

          </div>
          <br>
          <v-btn
              color="primary"
              @click="tab_4_continue"
          >
            SAVE AND CONTINUE
          </v-btn>

        </v-stepper-content>

      </v-stepper-items>
    </v-stepper>




  </div>
</template>

<script>

import {
  Assessment,
  Industry,
  Industrial_wwtp_onsite,
  Industrial_wwtp_onsite_external_domestic,
  Industrial_wwtp_onsite_external_industrial, Direct_discharge, Industrial_wwtp_offsite, Domestic_wwtp
} from "../ecam_backend";
import Vue from 'vue'
import {utils, metrics} from "../utils"

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
      assessment: this.$assessments[this.assessment_id],
      industry: defaultIndustry,

      onsite_inputs: {},
      direct_discharge_inputs: {},
      offsite_inputs: {},
      estimations: Industrial_wwtp_onsite.get_estimations(),
      stepper_model: 1,
      water_withdrawal_image: require("@/../public/water_flow/water_withdrawal.jpg"),
      onsite_no_external_image: require("../../public/water_flow/onsite_no_external.jpg"),
      onsite_external_image: require("../../public/water_flow/onsite_external.jpg"),
      direct_discharge_image: require("../../public/water_flow/direct_discharge.jpg"),
      external_no_internal_image: require("../../public/water_flow/external_no_internal.jpg"),
      external_internal_image: require("../../public/water_flow/external_internal.jpg"),

      water_withdrawal_valid: true,
      water_withdrawn: defaultIndustry.volume_withdrawn,
      //water_withdrawn: 0,

      has_onsite_wwtp: defaultIndustry.has_onsite_wwtp,
      yes_no: [{text: "Yes", value: true},{text: "No", value: false}],
      onsite_valid: true,
      has_offsite_wwtp: defaultIndustry.has_offsite_wwtp,
      offsite_wwtp_type: defaultIndustry.offsite_wwtp_type,
      industrial_domestic: ["Domestic", "Industrial"],
      wwtp_aux_inputs: {},
      has_direct_discharge: defaultIndustry.has_direct_discharge,

      global_layers: utils.format_layer_description(Vue.prototype.$layers_description),

      industry_type: defaultIndustry.industry_type,
      industry_typologies: [
        {text: "Undefined", value: null},
        {text: "Others", value: null},
        {text: "Alcohol refining", value: "alcohol"},
        {text: "Beer and malt", value: "beer"},
        {text: "Fish processing", value: "fish"},
        {text: "Iron and steel manufacturing", value: "iron"},
        {text: "Meat and poultry", value: "meat"},
        {text: "Nitrogen fertiliser", value: "nitrogen"},
        {text: "Plastics and resins", value: "plastics"},
        {text: "Starch production", value: "starch"}]

    };
  },
  created() {
    if (this.industry === undefined) this.$router.push('/')
  },
  watch: {

    stepper_model(step){
      if(step == 2 ){
        this.onsite_inputs = this.industry.onsite_wwtp.get_inputs()
        this.wwtp_aux_inputs = {}
        for(let [clau, valor] of Object.entries(this.industry.onsite_wwtp)){
          this.$set(this.wwtp_aux_inputs, clau, valor);
        }
      }else if(step == 3){
        this.direct_discharge_inputs = this.industry.direct_discharge.get_inputs()
        this.wwtp_aux_inputs = {}
        for(let [clau, valor] of Object.entries(this.industry.direct_discharge)){
          console.log(clau)
          console.log(valor)
          this.$set(this.wwtp_aux_inputs, clau, valor);
        }
      }else if(step == 4){

        this.offsite_inputs = this.industry.offsite_wwtp.get_inputs()
        this.wwtp_aux_inputs = {}
        for(let [clau, valor] of Object.entries(this.industry.offsite_wwtp)){
          this.$set(this.wwtp_aux_inputs, clau, valor);
        }


        metrics.dilution_factor(this.global_layers, this.industry)
        metrics.recycled_water_factor(this.industry)
        metrics.dbo_in_river(this.global_layers, this.industry)

      }
    },
    industry_id: function (industry_id) {
      this.industry = this.$assessments[this.assessment_id].industries[this.industry_id]
    },
    assessment_id: function (assessment_id) {
      this.industry = this.$assessments[this.assessment_id].industries[this.industry_id]
    },
    industry: function (industry) {
      if (industry === undefined) {
        this.$router.push('/')
      }
      this.stepper_model = 1
      this.water_withdrawn = industry.volume_withdrawn
      this.has_onsite_wwtp = industry.has_onsite_wwtp
      this.has_offsite_wwtp = industry.has_offsite_wwtp
      this.offsite_wwtp_type = industry.offsite_wwtp_type
      this.has_direct_discharge = industry.has_direct_discharge
    },
  },
  methods: {

    tab_4_continue(){
      for (let [key, value] of Object.entries(this.wwtp_aux_inputs)){
        if(Number(value) != NaN) this.industry.offsite_wwtp[key] = Number(value)
      }
      this.stepper_model = 1
    },


    tab_3_continue(){
      for (let [key, value] of Object.entries(this.wwtp_aux_inputs)){
        if(Number(value) != NaN) this.industry.direct_discharge[key] = Number(value)
      }

      if(this.has_offsite_wwtp) {
        this.stepper_model = 4
      }
      else this.stepper_model = 1
    },

    tab_2_continue(){
      for (let [key, value] of Object.entries(this.wwtp_aux_inputs)){
        if(Number(value) != NaN) this.industry.onsite_wwtp[key] = Number(value)
      }

      if(this.has_offsite_wwtp){
        this.industry.offsite_wwtp.vol_infl_wwtp = this.industry.onsite_wwtp.wwt_vol_treated_external
        this.industry.offsite_wwtp.bod_infl_wwtp = this.industry.onsite_wwtp.wwt_cod_effl_treated_external
        this.industry.offsite_wwtp.tn_infl_wwtp = this.industry.onsite_wwtp.wwt_tn_effl_treated_external
      }

      if(this.has_direct_discharge) {
        this.stepper_model = 3
      }
      else if(this.has_offsite_wwtp) this.stepper_model = 4
      else this.stepper_model = 1
    },

    tab_1_continue(){

      this.industry.volume_withdrawn = this.water_withdrawn
      this.industry.has_onsite_wwtp = this.has_onsite_wwtp
      this.industry.has_offsite_wwtp = this.has_offsite_wwtp
      this.industry.offsite_wwtp_type = this.offsite_wwtp_type
      this.industry.has_direct_discharge = this.has_direct_discharge
      this.industry.industry_type = this.industry_type

      //Local wwtp

      if(this.has_onsite_wwtp){
        if(this.has_offsite_wwtp){
          if(this.offsite_wwtp_type === "Domestic"){
            if(this.industry.onsite_wwtp === null || this.industry.onsite_wwtp.constructor.name !== "Industrial_wwtp_onsite_external_domestic") this.industry.onsite_wwtp = new Industrial_wwtp_onsite_external_domestic()
          }else{  //Industrial
            if(this.industry.onsite_wwtp === null || this.industry.onsite_wwtp.constructor.name !== "Industrial_wwtp_onsite_external_industrial") {
              this.industry.onsite_wwtp = new Industrial_wwtp_onsite_external_industrial()
            }
          }
        }else{
          if(this.industry.onsite_wwtp === null || this.industry.onsite_wwtp.constructor.name !== "Industrial_wwtp_onsite") {
            this.industry.onsite_wwtp = new Industrial_wwtp_onsite()
          }
        }
        this.industry.onsite_wwtp.industry_type = this.industry.industry_type
      }

      //Direct discharge
      if(this.has_direct_discharge){
        if(this.industry.direct_discharge === null) {
          this.industry.direct_discharge = new Direct_discharge()
        }
        this.industry.direct_discharge.industry_type = this.industry.industry_type

      }

      //Offsite wwtp
      if(this.has_offsite_wwtp){
        if(this.offsite_wwtp_type == "Industrial"){
          if(this.industry.offsite_wwtp === null || this.industry.offsite_wwtp.constructor.name !== "Industrial_wwtp_offsite") this.industry.offsite_wwtp = new Industrial_wwtp_offsite()
        }else {
          if(this.industry.offsite_wwtp === null || this.industry.offsite_wwtp.constructor.name !== "Domestic_wwtp") this.industry.offsite_wwtp = new Domestic_wwtp()
        }
        this.industry.offsite_wwtp.industry_type = this.industry.industry_type

      }

      if(!this.has_onsite_wwtp){
        if(this.has_direct_discharge) this.stepper_model = 3
        else if(this.has_offsite_wwtp) this.stepper_model = 4
      }else{
        this.stepper_model = 2
      }
    },

    water_withdrawn_rule(str) {

      if (typeof str === "number") return true
      else if(typeof str === "string"){
        if(!isNaN(str) && !isNaN(parseFloat(str)) && parseFloat(str) >=0 ) return true
        return 'Real positive value required.'
      }
      return 'Real positive value required.'
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
    /*industry_enter_leaving(){

      console.log(this.amount_insitu + this.amount_offsite)
      if(this.water_needed === this.amount_insitu + this.amount_offsite) return true
      else return ("Amount of water entering the industry must be the same as the amount leaving")
    }*/
  }




};
</script>

<style>

</style>