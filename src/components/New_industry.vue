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
            <v-col cols="12">
              <v-img
                  :src="water_withdrawal_image"
                  width="100%"
                  class="grey darken-4"
              ></v-img>

            </v-col>


          </v-row>
          <v-row style="background-color: #F2F4F3" align="center">
            <v-col cols="8" >
              <div style="width: 100%;">
                <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                      <span>
                        Amount of water withdrawn from the water body every day
                      </span>

                </div>
              </div>
            </v-col>
            <v-col cols="4">
              <div>
                <div>
                  <v-text-field
                      v-model="water_withdrawn"
                      suffix="m3/day"
                      type="number"
                  ></v-text-field>

                </div>
              </div>

            </v-col>

          </v-row>
          <v-row style="background-color: #F2F4F3" align="center">
            <v-col cols="8" >
              <div style="width: 100%;">
                <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                      <span>
                        Amount of water used in the industry every day
                      </span>

                </div>
              </div>
            </v-col>
            <v-col cols="4">
              <div>
                <div>
                  <v-text-field
                      v-model="volume_used"
                      suffix="m3/day"
                      type="number"
                  ></v-text-field>

                </div>
              </div>

            </v-col>

          </v-row>
          <v-row style="background-color: #F2F4F3" align="center">
            <v-col cols="8" >
              <div style="width: 100%;">
                <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                      <span>
                        Has the industry an on-site treatment wastewater plant?
                      </span>

                </div>
              </div>
            </v-col>
            <v-col cols="4">
              <div>
                <v-select
                    v-model="has_onsite_wwtp"
                    :items="yes_no"
                    item-text="text"
                    item-value="value"
                    label="Select"
                ></v-select>
              </div>

            </v-col>

          </v-row>
          <v-row style="background-color: #F2F4F3" align="center">
            <v-col cols="8" >
              <div style="width: 100%;">
                <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                      <span>
                        Does the industry directly discharge wastewater into the water body?
                      </span>

                </div>
              </div>
            </v-col>
            <v-col cols="4">
              <div>
                <v-select
                    v-model="has_direct_discharge"
                    :items="yes_no"
                    item-text="text"
                    item-value="value"
                    label="Select"
                ></v-select>
              </div>

            </v-col>

          </v-row>
          <v-row style="background-color: #F2F4F3" align="center">
            <v-col cols="8" >
              <div style="width: 100%;">
                <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                      <span>
                        Has the industry an off-site treatment wastewater plant?
                      </span>

                </div>
              </div>
            </v-col>
            <v-col cols="4">
              <div>
                <v-select
                    v-model="has_offsite_wwtp"
                    :items="yes_no"
                    item-text="text"
                    item-value="value"
                    label="Select"
                ></v-select>
              </div>

            </v-col>

          </v-row>
          <v-row style="background-color: #F2F4F3" align="center" v-if="has_offsite_wwtp">
            <v-col cols="8" >
              <div style="width: 100%;">
                <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                      <span>
                        Off-site treatment wastewater plant type
                      </span>

                </div>
              </div>
            </v-col>
            <v-col cols="4">
              <div>
                <v-select
                    v-model="offsite_wwtp_type"
                    :items="industrial_domestic"
                    label="Select"
                ></v-select>
              </div>

            </v-col>

          </v-row>
          <v-row style="background-color: #F2F4F3" align="center">
            <v-col cols="8" >
              <div style="width: 100%;">
                <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                      <span>
                        Industry type
                      </span>

                </div>
              </div>
            </v-col>
            <v-col cols="4">
              <div>
                <v-select
                    v-model="industry_type"
                    :items="industry_typologies"
                    item-text="text"
                    item-value="value"
                    label="Select"
                ></v-select>
              </div>

            </v-col>

          </v-row>
          <v-row style="background-color: #F2F4F3" align="center">
            <v-col cols="8" >
              <div style="width: 100%;">
                <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                      <span>
                        COD concentration in the industry effluent
                      </span>



                  <v-btn v-if="ind_bod_effl !== null"
                         outlined
                         x-small
                         @click="ind_bod_effl_concentration = parseFloat(ind_bod_effl)"
                  >
                    Estimation: {{parseFloat(ind_bod_effl).toExponential(2)}} g/m3
                  </v-btn>

                </div>
              </div>
            </v-col>
            <v-col cols="4">
              <div>
                <div>
                  <v-text-field
                      v-model="ind_bod_effl_concentration"
                      suffix="g/m3"
                      type="number"
                  ></v-text-field>

                </div>
              </div>

            </v-col>

          </v-row>
          <v-row style="background-color: #F2F4F3" align="center">
            <v-col cols="8" >
              <div style="width: 100%;">
                <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                      <span>
                        Total Nitrogen concentration in the industry effluent
                      </span>



                  <v-btn v-if="ind_tn_effl != null"
                         outlined
                         x-small
                         @click="ind_tn_effl_concentration = parseFloat(ind_tn_effl)"
                  >
                    Estimation: {{parseFloat(ind_tn_effl).toExponential(2)}} g/m3
                  </v-btn>

                </div>
              </div>
            </v-col>
            <v-col cols="4">
              <div>
                <div>
                  <v-text-field
                      v-model="ind_tn_effl_concentration"
                      suffix="g/m3"
                      type="number"
                  ></v-text-field>

                </div>
              </div>

            </v-col>

          </v-row>
          <v-row style="background-color: #F2F4F3" align="center">
            <v-col cols="8" >
              <div style="width: 100%;">
                <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                      <span>
                        Total Phosphorus concentration in the industry effluent
                      </span>



                  <v-btn v-if="ind_tp_effl != null"
                         outlined
                         x-small
                         @click="ind_tp_effl_concentration = parseFloat(ind_tp_effl)"
                  >
                    Estimation: {{parseFloat(ind_tp_effl).toExponential(2)}} g/m3
                  </v-btn>

                </div>
              </div>
            </v-col>
            <v-col cols="4">
              <div>
                <div>
                  <v-text-field
                      v-model="ind_tp_effl_concentration"
                      suffix="g/m3"
                      type="number"
                  ></v-text-field>

                </div>
              </div>

            </v-col>

          </v-row>

          <!-- Priority pollutants -->
          <v-row style="background-color: #F2F4F3" align="center">
            <v-col cols="8" >
              <div style="width: 100%;">
                <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                      <span>
                        1,2-Dichloroethane concentration in the industry effluent
                      </span>

                  <v-btn v-if="ind_diclo_effl !== null"
                         outlined
                         x-small
                         @click="diclo_effl = parseFloat(ind_diclo_effl)"
                  >
                    Estimation: {{parseFloat(ind_diclo_effl).toExponential(2)}} g/m3
                  </v-btn>

                </div>
              </div>
            </v-col>
            <v-col cols="4">
              <div>
                <div>
                  <v-text-field
                      v-model="diclo_effl"
                      suffix="g/m3"
                      type="number"
                  ></v-text-field>

                </div>
              </div>

            </v-col>

          </v-row>
          <v-row style="background-color: #F2F4F3" align="center">
            <v-col cols="8" >
              <div style="width: 100%;">
                <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                      <span>
                        Cadmium concentration in the industry effluent
                      </span>



                  <v-btn v-if="ind_cadmium_effl !== null"
                         outlined
                         x-small
                         @click="cadmium_effl = parseFloat(ind_cadmium_effl)"
                  >
                    Estimation: {{parseFloat(ind_cadmium_effl).toExponential(2)}} g/m3
                  </v-btn>

                </div>
              </div>
            </v-col>
            <v-col cols="4">
              <div>
                <div>
                  <v-text-field
                      v-model="cadmium_effl"
                      suffix="g/m3"
                      type="number"
                  ></v-text-field>

                </div>
              </div>

            </v-col>

          </v-row>
          <v-row style="background-color: #F2F4F3" align="center">
            <v-col cols="8" >
              <div style="width: 100%;">
                <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                      <span>
                        Hexachlorobenzene concentration in the industry effluent
                      </span>


                  <v-btn v-if="ind_hexaclorobenzene_effl !== null"
                         outlined
                         x-small
                         @click="hexaclorobenzene_effl = parseFloat(ind_hexaclorobenzene_effl)"
                  >
                    Estimation: {{parseFloat(ind_hexaclorobenzene_effl).toExponential(2)}} g/m3
                  </v-btn>

                </div>
              </div>
            </v-col>
            <v-col cols="4">
              <div>
                <div>
                  <v-text-field
                      v-model="hexaclorobenzene_effl"
                      suffix="g/m3"
                      type="number"
                  ></v-text-field>

                </div>
              </div>

            </v-col>

          </v-row>
          <v-row style="background-color: #F2F4F3" align="center">
            <v-col cols="8" >
              <div style="width: 100%;">
                <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                      <span>
                        Mercury concentration in the industry effluent
                      </span>



                  <v-btn v-if="ind_mercury_effl !== null"
                         outlined
                         x-small
                         @click="mercury_effl = parseFloat(ind_mercury_effl)"
                  >
                    Estimation: {{parseFloat(ind_mercury_effl).toExponential(2)}} g/m3
                  </v-btn>

                </div>
              </div>
            </v-col>
            <v-col cols="4">
              <div>
                <div>
                  <v-text-field
                      v-model="mercury_effl"
                      suffix="g/m3"
                      type="number"
                  ></v-text-field>

                </div>
              </div>

            </v-col>

          </v-row>
          <v-row style="background-color: #F2F4F3" align="center">
            <v-col cols="8" >
              <div style="width: 100%;">
                <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                      <span>
                        Lead concentration in the industry effluent
                      </span>



                  <v-btn v-if="ind_plomo_effl !== null"
                         outlined
                         x-small
                         @click="plomo_effl = parseFloat(ind_plomo_effl)"
                  >
                    Estimation: {{parseFloat(ind_plomo_effl).toExponential(2)}} g/m3
                  </v-btn>

                </div>
              </div>
            </v-col>
            <v-col cols="4">
              <div>
                <div>
                  <v-text-field
                      v-model="plomo_effl"
                      suffix="g/m3"
                      type="number"
                  ></v-text-field>

                </div>
              </div>

            </v-col>

          </v-row>
          <v-row style="background-color: #F2F4F3" align="center">
            <v-col cols="8" >
              <div style="width: 100%;">
                <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                      <span>
                        Nickel concentration in the industry effluent
                      </span>



                  <v-btn v-if="ind_niquel_effl !== null"
                         outlined
                         x-small
                         @click="niquel_effl = parseFloat(ind_niquel_effl)"
                  >
                    Estimation: {{parseFloat(ind_niquel_effl).toExponential(2)}} g/m3
                  </v-btn>

                </div>
              </div>
            </v-col>
            <v-col cols="4">
              <div>
                <div>
                  <v-text-field
                      v-model="niquel_effl"
                      suffix="g/m3"
                      type="number"
                  ></v-text-field>

                </div>
              </div>

            </v-col>

          </v-row>
          <v-row style="background-color: #F2F4F3" align="center">
            <v-col cols="8" >
              <div style="width: 100%;">
                <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                      <span>
                        Chloroalkanes concentration in the industry effluent
                      </span>



                  <v-btn v-if="ind_chloro_effl !== null"
                         outlined
                         x-small
                         @click="chloro_effl = parseFloat(ind_chloro_effl)"
                  >
                    Estimation: {{parseFloat(ind_chloro_effl).toExponential(2)}} g/m3
                  </v-btn>

                </div>
              </div>
            </v-col>
            <v-col cols="4">
              <div>
                <div>
                  <v-text-field
                      v-model="chloro_effl"
                      suffix="g/m3"
                      type="number"
                  ></v-text-field>

                </div>
              </div>

            </v-col>

          </v-row>
          <v-row style="background-color: #F2F4F3" align="center">
            <v-col cols="8" >
              <div style="width: 100%;">
                <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                      <span>
                        Hexachlorobutadiene concentration in the industry effluent
                      </span>



                  <v-btn v-if="ind_hexaclorobutadie_effl !== null"
                         outlined
                         x-small
                         @click="hexaclorobutadie_effl = parseFloat(ind_hexaclorobutadie_effl)"
                  >
                    Estimation: {{parseFloat(ind_hexaclorobutadie_effl).toExponential(2)}} g/m3
                  </v-btn>

                </div>
              </div>
            </v-col>
            <v-col cols="4">
              <div>
                <div>
                  <v-text-field
                      v-model="hexaclorobutadie_effl"
                      suffix="g/m3"
                      type="number"
                  ></v-text-field>

                </div>
              </div>

            </v-col>

          </v-row>
          <v-row style="background-color: #F2F4F3" align="center">
            <v-col cols="8" >
              <div style="width: 100%;">
                <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                      <span>
                        Nonylphenols concentration in the industry effluent
                      </span>



                  <v-btn v-if="ind_nonilfenols_effl !== null"
                         outlined
                         x-small
                         @click="nonilfenols_effl = parseFloat(ind_nonilfenols_effl)"
                  >
                    Estimation: {{parseFloat(ind_nonilfenols_effl).toExponential(2)}} g/m3
                  </v-btn>

                </div>
              </div>
            </v-col>
            <v-col cols="4">
              <div>
                <div>
                  <v-text-field
                      v-model="nonilfenols_effl"
                      suffix="g/m3"
                      type="number"
                  ></v-text-field>

                </div>
              </div>

            </v-col>

          </v-row>
          <v-row style="background-color: #F2F4F3" align="center">
            <v-col cols="8" >
              <div style="width: 100%;">
                <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                      <span>
                        Tetrachloroethene concentration in the industry effluent
                      </span>



                  <v-btn v-if="ind_tetracloroetile_effl !== null"
                         outlined
                         x-small
                         @click="tetracloroetile_effl = parseFloat(ind_tetracloroetile_effl)"
                  >
                    Estimation: {{parseFloat(ind_tetracloroetile_effl).toExponential(2)}} g/m3
                  </v-btn>

                </div>
              </div>
            </v-col>
            <v-col cols="4">
              <div>
                <div>
                  <v-text-field
                      v-model="tetracloroetile_effl"
                      suffix="g/m3"
                      type="number"
                  ></v-text-field>

                </div>
              </div>

            </v-col>

          </v-row>
          <v-row style="background-color: #F2F4F3" align="center">
            <v-col cols="8" >
              <div style="width: 100%;">
                <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                      <span>
                        Trichloroethylene concentration in the industry effluent
                      </span>



                  <v-btn v-if="ind_tricloroetile_effl !== null"
                         outlined
                         x-small
                         @click="tricloroetile_effl = parseFloat(ind_tricloroetile_effl)"
                  >
                    Estimation: {{parseFloat(ind_tricloroetile_effl).toExponential(2)}} g/m3
                  </v-btn>

                </div>
              </div>
            </v-col>
            <v-col cols="4">
              <div>
                <div>
                  <v-text-field
                      v-model="tricloroetile_effl"
                      suffix="g/m3"
                      type="number"
                  ></v-text-field>

                </div>
              </div>

            </v-col>

          </v-row>

          <br>
          <v-btn
              color="primary"
              @click="tab_1_continue"
          >
            SAVE AND CONTINUE
          </v-btn>
        </v-stepper-content>  <!-- Industry -->

        <v-stepper-content step="2" >
          <v-row>
            <v-col cols="12">
              <v-img
                  :src="onsite_external_image"
                  width="100%"
                  class="grey darken-4"
                  v-if="industry.has_offsite_wwtp"
              ></v-img>
              <v-img
                  :src="onsite_no_external_image"
                  width="100%"
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

                        <v-btn v-if="value.estimation_equation && industrial_wwtp_onsite_estimations[key](wwtp_aux_inputs) !== null"
                          outlined
                          x-small
                          @click="wwtp_aux_inputs[key] = parseFloat(industrial_wwtp_onsite_estimations[key](wwtp_aux_inputs))"
                          >
                          Estimation: {{parseFloat(industrial_wwtp_onsite_estimations[key](wwtp_aux_inputs)).toExponential(2)}}{{value.unit}} <!-- Botó amb estimació -->
                        </v-btn>

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

                              <v-btn v-if="value.estimation_equation && industrial_wwtp_onsite_estimations[key](wwtp_aux_inputs) !== null"
                                     outlined
                                     x-small
                                     @click="wwtp_aux_inputs[key] = parseFloat(industrial_wwtp_onsite_estimations[key](wwtp_aux_inputs))"
                              >
                                Estimation: {{parseFloat(industrial_wwtp_onsite_estimations[key](wwtp_aux_inputs)).toExponential(2)}}{{value.unit}} <!-- Botó amb estimació -->
                              </v-btn>

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

        </v-stepper-content>  <!-- Onsite WWTP -->

        <v-stepper-content step="3" >

          <v-row>
            <v-col cols="12">
              <v-img
                  :src="direct_discharge_image"
                  width="100%"
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

                        <v-btn v-if="value.estimation_equation && direct_discharge_estimations[key](wwtp_aux_inputs) !== null"
                               outlined
                               x-small
                               @click="wwtp_aux_inputs[key] = parseFloat(direct_discharge_estimations[key](wwtp_aux_inputs))"
                        >
                          Estimation: {{parseFloat(direct_discharge_estimations[key](wwtp_aux_inputs)).toExponential(2)}}{{value.unit}} <!-- Botó amb estimació -->
                        </v-btn>

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

        </v-stepper-content>  <!-- Direct discharge -->

        <v-stepper-content step="4" >
          <v-row>
            <v-col cols="12">
              <v-img
                  :src="external_internal_image"
                  width="100%"
                  class="grey darken-4"
                  v-if="industry.has_onsite_wwtp"
              ></v-img>
              <v-img
                  :src="external_no_internal_image"
                  width="100%"
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

                        <v-btn v-if="value.estimation_equation && wwtp_offsite_estimations[key](wwtp_aux_inputs) !== null"
                               outlined
                               x-small
                               @click="wwtp_aux_inputs[key] = parseFloat(wwtp_offsite_estimations[key](wwtp_aux_inputs))"
                        >
                          Estimation: {{parseFloat(wwtp_offsite_estimations[key](wwtp_aux_inputs)).toExponential(2)}}{{value.unit}} <!-- Botó amb estimació -->
                        </v-btn>

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

                              <v-btn v-if="value.estimation_equation && wwtp_offsite_estimations[key](wwtp_aux_inputs) !== null"
                                     outlined
                                     x-small
                                     @click="wwtp_aux_inputs[key] = parseFloat(wwtp_offsite_estimations[key](wwtp_aux_inputs))"
                              >
                                Estimation: {{parseFloat(wwtp_offsite_estimations[key](wwtp_aux_inputs)).toExponential(2)}}{{value.unit}} <!-- Botó amb estimació -->
                              </v-btn>

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

        </v-stepper-content>  <!-- offsite wwtp -->

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
  Industrial_wwtp_onsite_external_industrial,
  Direct_discharge,
  Industrial_wwtp_offsite,
  Domestic_wwtp,
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
      industrial_wwtp_onsite_estimations: Industrial_wwtp_onsite.get_estimations(),
      direct_discharge_estimations: Direct_discharge.get_estimations(),
      wwtp_offsite_estimations: Domestic_wwtp.get_estimations(),

      stepper_model: 1,
      water_withdrawal_image: require("@/../public/water_flow/water_withdrawal.jpg"),
      onsite_no_external_image: require("../../public/water_flow/onsite_no_external.jpg"),
      onsite_external_image: require("../../public/water_flow/onsite_external.jpg"),
      direct_discharge_image: require("../../public/water_flow/direct_discharge.jpg"),
      external_no_internal_image: require("../../public/water_flow/external_no_internal.jpg"),
      external_internal_image: require("../../public/water_flow/external_internal.jpg"),

      water_withdrawal_valid: true,
      water_withdrawn: defaultIndustry.volume_withdrawn,

      has_onsite_wwtp: defaultIndustry.has_onsite_wwtp,
      yes_no: [{text: "Yes", value: true},{text: "No", value: false}],
      onsite_valid: true,
      has_offsite_wwtp: defaultIndustry.has_offsite_wwtp,
      offsite_wwtp_type: defaultIndustry.offsite_wwtp_type,
      industrial_domestic: ["Domestic", "Industrial"],
      wwtp_aux_inputs: {},
      has_direct_discharge: defaultIndustry.has_direct_discharge,
      ind_tn_effl_concentration: defaultIndustry.tn_effl_concentration,
      ind_tp_effl_concentration: defaultIndustry.tp_effl_concentration,
      ind_bod_effl_concentration: defaultIndustry.bod_effl_concentration,
      volume_used: defaultIndustry.volume_used,

      //Priority pollutants
      diclo_effl: defaultIndustry.diclo_effl, //1,2-Dichloroethane
      cadmium_effl: defaultIndustry.cadmium_effl, //Cadmium
      hexaclorobenzene_effl: defaultIndustry.hexaclorobenzene_effl, //Hexachlorobenzene
      mercury_effl: defaultIndustry.mercury_effl, //mercury
      plomo_effl: defaultIndustry.plomo_effl, //lead
      niquel_effl: defaultIndustry.niquel_effl, //nickel
      chloro_effl: defaultIndustry.chloro_effl, //chloroalkanes
      hexaclorobutadie_effl: defaultIndustry.hexaclorobutadie_effl, //Hexachlorobutadiene
      nonilfenols_effl: defaultIndustry.nonilfenols_effl, //Nonylphenols
      tetracloroetile_effl: defaultIndustry.tetracloroetile_effl, //tetrachloroethene
      tricloroetile_effl: defaultIndustry.tricloroetile_effl, //Trichloroethylene

      global_layers: utils.format_layer_description(Vue.prototype.$layers_description),
      cod_to_bod: 2.4,
      industry_type: defaultIndustry.industry_type,
      industry_typologies_2: [
        {text: "Undefined", value: null},
        {text: "Others", value: null},
        {text: "Alcohol refining", value: "alcohol"},
        {text: "Beer and malt", value: "beer"},
        {text: "Fish processing", value: "fish"},
        {text: "Iron and steel manufacturing", value: "iron"},
        {text: "Meat and poultry", value: "meat"},
        {text: "Nitrogen fertiliser", value: "nitrogen"},
        {text: "Plastics and resins", value: "plastics"},
        {text: "Starch production", value: "starch"}],
      industry_typologies: [
        {text: "Undefined", value: null},
        {text: "Others", value: null},
        {text: "Manufacture of food products", value: "food"},
        {text: "Manufacture of beverages", value: "beverages"},
        {text: "Manufacture of tobacco products", value: "tobacco"},
        {text: "Manufacture of textiles", value: "textiles"},
        {text: "Manufacture of wearing apparel", value: "wearing"},
        {text: "Manufacture of leather and related products", value: "leather"},
        {text: "Manufacture of wood and of products of wood and cork, except furniture; manufacture of articles of straw and plaiting materials", value: "wood"},
        {text: "Manufacture of paper and paper products", value: "paper"},
        {text: "Printing and reproduction of recorded media", value: "printing"},
        {text: "Manufacture of coke and refined petroleum products", value: "coke"},
        {text: "Manufacture of chemicals and chemical products", value: "chemicals"},
        {text: "Manufacture of basic pharmaceutical products and pharmaceutical preparations", value: "pharmaceutical"},
        {text: "Manufacture of rubber and plastic products", value: "rubber"},
        {text: "Manufacture of other non-metallic mineral products", value: "mineral"},
        {text: "Manufacture of basic metals", value: "metals"},
        {text: "Manufacture of fabricated metal products, except machinery and equipment", value: "fabricated_metals"},
        {text: "Manufacture of computer, electronic and optical products", value: "computer"},
        {text: "Manufacture of electrical equipment", value: "electrical"},
        {text: "Manufacture of machinery and equipment n.e.c.", value: "machinery"},
        {text: "Manufacture of motor vehicles, trailers and semi-trailers", value: "vehicles"},
        {text: "Manufacture of other transport equipment", value: "transport"},
        {text: "Manufacture of furniture", value: "furniture"},
        {text: "Other manufacturing", value: "other_manufacturing"},
        {text: "Repair and installation of machinery and equipment", value: "repair"}
      ],
    };
  },
  created() {
    if (this.industry === undefined) this.$router.push('/')
  },
  watch: {

    offsite_wwtp_type(type){
      if(type == "Industrial"){
        this.wwtp_offsite_estimations = Industrial_wwtp_offsite.get_estimations()
      }else {
        this.wwtp_offsite_estimations = Domestic_wwtp.get_estimations()
      }
    },
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
    //this.industry.onsite_wwtp = new Industrial_wwtp_onsite_external_domestic(
    copy_wwtp(old_wwtp,  new_wwtp){

      if(old_wwtp != null){
        for (let key of Object.keys(new_wwtp)){
          if(typeof new_wwtp[key] !== "function" && old_wwtp.hasOwnProperty(key)) new_wwtp[key] = old_wwtp[key]
        }
        if(old_wwtp.constructor.name == "Domestic" && new_wwtp.constructor.name == "Industrial_wwtp_offsite"){
          new_wwtp.bod_infl_wwtp = new_wwtp.bod_infl_wwtp/this.cod_to_bod
          new_wwtp.wwt_bod_effl_to_wb = new_wwtp.wwt_bod_effl_to_wb/this.cod_to_bod
          new_wwtp.wwt_bod_infl = new_wwtp.wwt_bod_infl/this.cod_to_bod
        }else if(old_wwtp.constructor.name == "Industrial_wwtp_offsite" && new_wwtp.constructor.name == "Domestic"){
          new_wwtp.bod_infl_wwtp = new_wwtp.bod_infl_wwtp*this.cod_to_bod
          new_wwtp.wwt_bod_effl_to_wb = new_wwtp.wwt_bod_effl_to_wb*this.cod_to_bod
          new_wwtp.wwt_bod_infl = new_wwtp.wwt_bod_infl*this.cod_to_bod
        }
      }

      return new_wwtp
    },

    tab_4_continue(){
      document.getElementsByClassName('outer').forEach(div => {
        div.scrollTo(0, 0)
      })


      for (let [key, value] of Object.entries(this.wwtp_aux_inputs)){
        if(Number(value) != NaN && typeof this.industry.offsite_wwtp[key] !== "function") this.industry.offsite_wwtp[key] = Number(value)
      }
      this.stepper_model = 1
    },


    tab_3_continue(){
      document.getElementsByClassName('outer').forEach(div => {
        div.scrollTo(0, 0)
      })
      for (let [key, value] of Object.entries(this.wwtp_aux_inputs)){
        if(Number(value) != NaN && typeof this.industry.direct_discharge[key] !== "function") this.industry.direct_discharge[key] = Number(value)
      }

      if(this.has_offsite_wwtp) {
        this.stepper_model = 4
      }
      else this.stepper_model = 1
    },

    tab_2_continue(){
      document.getElementsByClassName('outer').forEach(div => {
        div.scrollTo(0, 0)
      })
      for (let [key, value] of Object.entries(this.wwtp_aux_inputs)){
        if(Number(value) != NaN && typeof this.industry.onsite_wwtp[key] !== "function") this.industry.onsite_wwtp[key] = Number(value)
      }

      if(this.has_offsite_wwtp){
        this.industry.offsite_wwtp.vol_infl_wwtp = this.industry.onsite_wwtp.wwt_vol_treated_external
        this.industry.offsite_wwtp.tn_infl_wwtp = this.industry.onsite_wwtp.wwt_tn_effl_to_wb
        this.industry.offsite_wwtp.tp_infl_wwtp = this.industry.onsite_wwtp.wwt_tp_effl_to_wb
        this.industry.offsite_wwtp.diclo_infl_wwtp = this.industry.onsite_wwtp.wwt_diclo_effl_to_wb //1,2-Dichloroethane
        this.industry.offsite_wwtp.cadmium_infl_wwtp = this.industry.onsite_wwtp.wwt_cadmium_effl_to_wb //Cadmium
        this.industry.offsite_wwtp.hexaclorobenzene_infl_wwtp = this.industry.onsite_wwtp.wwt_hexaclorobenzene_effl_to_wb //Hexachlorobenzene
        this.industry.offsite_wwtp.mercury_infl_wwtp = this.industry.onsite_wwtp.wwt_mercury_effl_to_wb //mercury
        this.industry.offsite_wwtp.plomo_infl_wwtp = this.industry.onsite_wwtp.wwt_plomo_effl_to_wb //lead
        this.industry.offsite_wwtp.niquel_infl_wwtp = this.industry.onsite_wwtp.wwt_niquel_effl_to_wb //nickel
        this.industry.offsite_wwtp.chloro_infl_wwtp = this.industry.onsite_wwtp.wwt_chloro_effl_to_wb //chloroalkanes
        this.industry.offsite_wwtp.hexaclorobutadie_infl_wwtp = this.industry.onsite_wwtp.wwt_hexaclorobutadie_effl_to_wb //Hexachlorobutadiene
        this.industry.offsite_wwtp.nonilfenols_infl_wwtp = this.industry.onsite_wwtp.wwt_nonilfenols_effl_to_wb //Nonylphenols
        this.industry.offsite_wwtp.tetracloroetile_infl_wwtp = this.industry.onsite_wwtp.wwt_tetracloroetile_effl_to_wb //tetrachloroethene
        this.industry.offsite_wwtp.tricloroetile_infl_wwtp = this.industry.onsite_wwtp.wwt_tricloroetile_effl_to_wb //Trichloroethylene

        if(this.industry.offsite_wwtp_type === "Domestic") this.industry.offsite_wwtp.bod_infl_wwtp = this.industry.onsite_wwtp.wwt_bod_effl_to_wb*this.cod_to_bod
        else this.industry.offsite_wwtp.bod_infl_wwtp = this.industry.onsite_wwtp.wwt_bod_effl_to_wb

      }

      if(this.has_direct_discharge) {
        this.stepper_model = 3
      }
      else if(this.has_offsite_wwtp) this.stepper_model = 4
      else this.stepper_model = 1
    },

    tab_1_continue(){
      document.getElementsByClassName('outer').forEach(div => {
        console.log(div)
        div.scrollTo(0, 0)
      })
      this.industry.volume_withdrawn = this.water_withdrawn
      this.industry.has_onsite_wwtp = this.has_onsite_wwtp
      this.industry.has_offsite_wwtp = this.has_offsite_wwtp
      this.industry.offsite_wwtp_type = this.offsite_wwtp_type
      this.industry.has_direct_discharge = this.has_direct_discharge
      this.industry.industry_type = this.industry_type
      this.industry.tn_effl_concentration = this.ind_tn_effl_concentration
      this.industry.tp_effl_concentration = this.ind_tp_effl_concentration
      this.industry.bod_effl_concentration = this.ind_bod_effl_concentration
      this.industry.volume_used = this.volume_used
      this.industry.diclo_effl = this.diclo_effl //1,2-Dichloroethane
      this.industry.cadmium_effl = this.cadmium_effl //Cadmium
      this.industry.hexaclorobenzene_effl = this.hexaclorobenzene_effl //Hexachlorobenzene
      this.industry.mercury_effl = this.mercury_effl //mercury
      this.industry.plomo_effl = this.plomo_effl //lead
      this.industry.niquel_effl = this.niquel_effl //nickel
      this.industry.chloro_effl = this.chloro_effl //chloroalkanes
      this.industry.hexaclorobutadie_effl = this.hexaclorobutadie_effl //Hexachlorobutadiene
      this.industry.nonilfenols_effl = this.nonilfenols_effl //Nonylphenols
      this.industry.tetracloroetile_effl = this.tetracloroetile_effl //tetrachloroethene
      this.industry.tricloroetile_effl = this.tricloroetile_effl //Trichloroethylene


      //Local wwtp

      if(this.has_onsite_wwtp){
        if(this.has_offsite_wwtp){
          if(this.offsite_wwtp_type === "Domestic"){
            //if(this.industry.onsite_wwtp === null || this.industry.onsite_wwtp.constructor.name !== "Industrial_wwtp_onsite_external_domestic") this.industry.onsite_wwtp = new Industrial_wwtp_onsite_external_domestic()
            if(this.industry.onsite_wwtp === null || this.industry.onsite_wwtp.constructor.name !== "Industrial_wwtp_onsite_external_domestic") this.industry.onsite_wwtp = this.copy_wwtp(this.industry.onsite_wwtp,  new Industrial_wwtp_onsite_external_domestic())


            }else{  //Industrial
            if(this.industry.onsite_wwtp === null || this.industry.onsite_wwtp.constructor.name !== "Industrial_wwtp_onsite_external_industrial") {
              this.industry.onsite_wwtp = this.copy_wwtp(this.industry.onsite_wwtp,  new Industrial_wwtp_onsite_external_industrial())
            }
          }
        }else{
          if(this.industry.onsite_wwtp === null || this.industry.onsite_wwtp.constructor.name !== "Industrial_wwtp_onsite") {
            this.industry.onsite_wwtp = this.copy_wwtp(this.industry.onsite_wwtp,  new Industrial_wwtp_onsite())
          }
        }
        this.industry.onsite_wwtp.industry_type = this.industry.industry_type
        this.industry.onsite_wwtp.wwt_bod_infl = this.industry.bod_effl_concentration
        this.industry.onsite_wwtp.wwt_tn_infl = this.industry.tn_effl_concentration
        this.industry.onsite_wwtp.wwt_tp_infl = this.industry.tp_effl_concentration
        this.industry.onsite_wwtp.wwt_diclo_infl = this.industry.diclo_effl //1,2-Dichloroethane
        this.industry.onsite_wwtp.wwt_cadmium_infl = this.industry.cadmium_effl //Cadmium
        this.industry.onsite_wwtp.wwt_hexaclorobenzene_infl = this.industry.hexaclorobenzene_effl //Hexachlorobenzene
        this.industry.onsite_wwtp.wwt_mercury_infl = this.industry.mercury_effl //mercury
        this.industry.onsite_wwtp.wwt_plomo_infl = this.industry.plomo_effl //lead
        this.industry.onsite_wwtp.wwt_niquel_infl = this.industry.niquel_effl //nickel
        this.industry.onsite_wwtp.wwt_chloro_infl = this.industry.chloro_effl //chloroalkanes
        this.industry.onsite_wwtp.wwt_hexaclorobutadie_infl = this.industry.hexaclorobutadie_effl //Hexachlorobutadiene
        this.industry.onsite_wwtp.wwt_nonilfenols_infl = this.industry.nonilfenols_effl //Nonylphenols
        this.industry.onsite_wwtp.wwt_tetracloroetile_infl = this.industry.tetracloroetile_effl //tetrachloroethene
        this.industry.onsite_wwtp.wwt_tricloroetile_infl = this.industry.tricloroetile_effl //Trichloroethylene

      }

      //Direct discharge
      if(this.has_direct_discharge){
        if(this.industry.direct_discharge === null) {
          this.industry.direct_discharge = this.copy_wwtp(this.industry.direct_discharge,  new Direct_discharge())
        }
        this.industry.direct_discharge.industry_type = this.industry.industry_type
        this.industry.direct_discharge.wwt_bod_effl_to_wb = this.industry.bod_effl_concentration
        this.industry.direct_discharge.wwt_tn_effl_to_wb = this.industry.tn_effl_concentration
        this.industry.direct_discharge.wwt_tp_effl_to_wb = this.industry.tp_effl_concentration
        this.industry.direct_discharge.wwt_diclo_effl_to_wb = this.industry.diclo_effl //1,2-Dichloroethane
        this.industry.direct_discharge.wwt_cadmium_effl_to_wb = this.industry.cadmium_effl //Cadmium
        this.industry.direct_discharge.wwt_hexaclorobenzene_effl_to_wb = this.industry.hexaclorobenzene_effl //Hexachlorobenzene
        this.industry.direct_discharge.wwt_mercury_effl_to_wb = this.industry.mercury_effl //mercury
        this.industry.direct_discharge.wwt_plomo_effl_to_wb = this.industry.plomo_effl //lead
        this.industry.direct_discharge.wwt_niquel_effl_to_wb = this.industry.niquel_effl //nickel
        this.industry.direct_discharge.wwt_chloro_effl_to_wb = this.industry.chloro_effl //chloroalkanes
        this.industry.direct_discharge.wwt_hexaclorobutadie_effl_to_wb = this.industry.hexaclorobutadie_effl //Hexachlorobutadiene
        this.industry.direct_discharge.wwt_nonilfenols_effl_to_wb = this.industry.nonilfenols_effl //Nonylphenols
        this.industry.direct_discharge.wwt_tetracloroetile_effl_to_wb = this.industry.tetracloroetile_effl //tetrachloroethene
        this.industry.direct_discharge.wwt_tricloroetile_effl_to_wb = this.industry.tricloroetile_effl //Trichloroethylene

      }

      //Offsite wwtp
      if(this.has_offsite_wwtp){
        if(this.offsite_wwtp_type == "Industrial"){
          if(this.industry.offsite_wwtp === null || this.industry.offsite_wwtp.constructor.name !== "Industrial_wwtp_offsite") {
            this.industry.offsite_wwtp = this.copy_wwtp(this.industry.offsite_wwtp,  new Industrial_wwtp_offsite())
          }
          this.industry.offsite_wwtp.wwt_bod_infl = this.industry.bod_effl_concentration
        }else {
          if(this.industry.offsite_wwtp === null || this.industry.offsite_wwtp.constructor.name !== "Domestic_wwtp") {
            this.industry.offsite_wwtp = this.copy_wwtp(this.industry.offsite_wwtp,  new Domestic_wwtp())
          }
          this.industry.offsite_wwtp.wwt_bod_infl = this.industry.bod_effl_concentration*this.cod_to_bod
        }
        this.industry.offsite_wwtp.industry_type = this.industry.industry_type
        this.industry.offsite_wwtp.wwt_tn_infl = this.industry.tn_effl_concentration
        this.industry.offsite_wwtp.wwt_tp_infl = this.industry.tp_effl_concentration
        this.industry.offsite_wwtp.wwt_diclo_infl = this.industry.diclo_effl //1,2-Dichloroethane
        this.industry.offsite_wwtp.wwt_cadmium_infl = this.industry.cadmium_effl //Cadmium
        this.industry.offsite_wwtp.wwt_hexaclorobenzene_infl = this.industry.hexaclorobenzene_effl //Hexachlorobenzene
        this.industry.offsite_wwtp.wwt_mercury_infl = this.industry.mercury_effl //mercury
        this.industry.offsite_wwtp.wwt_plomo_infl = this.industry.plomo_effl //lead
        this.industry.offsite_wwtp.wwt_niquel_infl = this.industry.niquel_effl //nickel
        this.industry.offsite_wwtp.wwt_chloro_infl = this.industry.chloro_effl //chloroalkanes
        this.industry.offsite_wwtp.wwt_hexaclorobutadie_infl = this.industry.hexaclorobutadie_effl //Hexachlorobutadiene
        this.industry.offsite_wwtp.wwt_nonilfenols_infl = this.industry.nonilfenols_effl //Nonylphenols
        this.industry.offsite_wwtp.wwt_tetracloroetile_infl = this.industry.tetracloroetile_effl //tetrachloroethene
        this.industry.offsite_wwtp.wwt_tricloroetile_infl = this.industry.tricloroetile_effl //Trichloroethylene

        if(!this.has_onsite_wwtp){
          this.industry.offsite_wwtp.vol_infl_wwtp = 0
          this.industry.offsite_wwtp.bod_infl_wwtp = 0
          this.industry.offsite_wwtp.tn_infl_wwtp = 0
          this.industry.offsite_wwtp.tp_infl_wwtp = 0
          this.industry.offsite_wwtp.diclo_infl_wwtp = 0 //1,2-Dichloroethane
          this.industry.offsite_wwtp.cadmium_infl_wwtp = 0 //Cadmium
          this.industry.offsite_wwtp.hexaclorobenzene_infl_wwtp = 0 //Hexachlorobenzene
          this.industry.offsite_wwtp.mercury_infl_wwtp = 0 //mercury
          this.industry.offsite_wwtp.plomo_infl_wwtp = 0 //lead
          this.industry.offsite_wwtp.niquel_infl_wwtp = 0 //nickel
          this.industry.offsite_wwtp.chloro_infl_wwtp = 0 //chloroalkanes
          this.industry.offsite_wwtp.hexaclorobutadie_infl_wwtp = 0 //Hexachlorobutadiene
          this.industry.offsite_wwtp.nonilfenols_infl_wwtp = 0 //Nonylphenols
          this.industry.offsite_wwtp.tetracloroetile_infl_wwtp = 0 //tetrachloroethene
          this.industry.offsite_wwtp.tricloroetile_infl_wwtp = 0 //Trichloroethylene
        }
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
  },

  computed: {
    ind_bod_effl(){
      if(this.industry_type === "food"){  //noves categories
        return 336.2591324200910/2.4
      }else if(this.industry_type === "beverages"){  //noves categories
        return 231.09062980030700/2.4
      }else if(this.industry_type === "textiles"){  //noves categories
        return 410.09920634920627/2.4
      }else if(this.industry_type === "wearing"){  //noves categories
        return 40/2.4
      }else if(this.industry_type === "leather"){  //noves categories
        return null
      }else if(this.industry_type === "wood"){  //noves categories
        return 33.333333333333336/2.4
      }else if(this.industry_type === "paper"){  //noves categories
        return 366.27272727272725/2.4
      }else if(this.industry_type === "printing"){  //noves categories
        return 750/2.4
      }else if(this.industry_type === "coke"){  //noves categories
        return 300/2.4
      }else if(this.industry_type === "chemicals"){  //noves categories
        return 598.8096590909091/2.4
      }else if(this.industry_type === "pharmaceutical"){  //noves categories
        return 559.8717948717948/2.4
      }else if(this.industry_type === "rubber"){  //noves categories
        return 603.1034482758621/2.4
      }else if(this.industry_type === "mineral"){  //noves categories
        return 59.03846153846154/2.4
      }else if(this.industry_type === "metals"){  //noves categories
        return 586.5384615384615/2.4
      }else if(this.industry_type === "fabricated_metals"){  //noves categories
        return 641.4117647058823/2.4
      }else if(this.industry_type === "computer"){  //noves categories
        return 33.333333333333336/2.4
      }else if(this.industry_type === "electrical"){  //noves categories
        return 86.66666666666667/2.4
      }else if(this.industry_type === "machinery"){  //noves categories
        return 328.75/2.4
      }else if(this.industry_type === "vehicles"){  //noves categories
        return 563.1578947368421/2.4
      }else if(this.industry_type === "transport"){  //noves categories
        return null
      }else if(this.industry_type === "furniture"){  //noves categories
        return 35/2.4
      }else if(this.industry_type === "other_manufacturing"){  //noves categories
        return 35/2.4
      }else if(this.industry_type === "repair"){  //noves categories
        return 40/2.4
      }else return null
    },
    ind_tn_effl(){
      if(this.industry_type === "food"){  //noves categories
        return 12.95454545
      }else if(this.industry_type === "beverages"){  //noves categories
        return  null
      }else if(this.industry_type === "textiles"){  //noves categories
        return  null
      }else if(this.industry_type === "wearing"){  //noves categories
        return  null
      }else if(this.industry_type === "leather"){  //noves categories
        return null
      }else if(this.industry_type === "wood"){  //noves categories
        return  null
      }else if(this.industry_type === "paper"){  //noves categories
        return  null
      }else if(this.industry_type === "printing"){  //noves categories
        return 90
      }else if(this.industry_type === "coke"){  //noves categories
        return  null
      }else if(this.industry_type === "chemicals"){  //noves categories
        return  null
      }else if(this.industry_type === "pharmaceutical"){  //noves categories
        return  null
      }else if(this.industry_type === "rubber"){  //noves categories
        return  null
      }else if(this.industry_type === "mineral"){  //noves categories
        return 18.4374
      }else if(this.industry_type === "metals"){  //noves categories
        return  null
      }else if(this.industry_type === "fabricated_metals"){  //noves categories
        return 70
      }else if(this.industry_type === "computer"){  //noves categories
        return  null
      }else if(this.industry_type === "electrical"){  //noves categories
        return  null
      }else if(this.industry_type === "machinery"){  //noves categories
        return  null
      }else if(this.industry_type === "vehicles"){  //noves categories
        return  null
      }else if(this.industry_type === "transport"){  //noves categories
        return null
      }else if(this.industry_type === "furniture"){  //noves categories
        return  null
      }else if(this.industry_type === "other_manufacturing"){  //noves categories
        return  null
      }else if(this.industry_type === "repair"){  //noves categories
        return  null
      }else return null
    },
    ind_tp_effl(){
      if(this.industry_type === "food"){  //noves categories
        return 26.10771604938271
      }else if(this.industry_type === "beverages"){  //noves categories
        return  20.452873563218382
      }else if(this.industry_type === "textiles"){  //noves categories
        return  32.58536585365854
      }else if(this.industry_type === "wearing"){  //noves categories
        return  10
      }else if(this.industry_type === "leather"){  //noves categories
        return null
      }else if(this.industry_type === "wood"){  //noves categories
        return  10
      }else if(this.industry_type === "paper"){  //noves categories
        return  27.528301886792452
      }else if(this.industry_type === "printing"){  //noves categories
        return 40.19230769230769
      }else if(this.industry_type === "coke"){  //noves categories
        return  30
      }else if(this.industry_type === "chemicals"){  //noves categories
        return  39.810956790123456
      }else if(this.industry_type === "pharmaceutical"){  //noves categories
        return  35.96774193548387
      }else if(this.industry_type === "rubber"){  //noves categories
        return  35.0032786885246
      }else if(this.industry_type === "mineral"){  //noves categories
        return 11.279069767441861
      }else if(this.industry_type === "metals"){  //noves categories
        return  10
      }else if(this.industry_type === "fabricated_metals"){  //noves categories
        return 40.870535714285715
      }else if(this.industry_type === "computer"){  //noves categories
        return  10
      }else if(this.industry_type === "electrical"){  //noves categories
        return  25.714285714285715
      }else if(this.industry_type === "machinery"){  //noves categories
        return  32.857142857142854
      }else if(this.industry_type === "vehicles"){  //noves categories
        return  39.25
      }else if(this.industry_type === "transport"){  //noves categories
        return null
      }else if(this.industry_type === "furniture"){  //noves categories
        return  10
      }else if(this.industry_type === "other_manufacturing"){  //noves categories
        return  38.75
      }else if(this.industry_type === "repair"){  //noves categories
        return  10
      }else return null
    },

    ind_diclo_effl(){
      if(this.industry_type === "food"){  //noves categories
        return null
      }else if(this.industry_type === "beverages"){  //noves categories
        return  null
      }else if(this.industry_type === "textiles"){  //noves categories
        return  null
      }else if(this.industry_type === "wearing"){  //noves categories
        return  null
      }else if(this.industry_type === "leather"){  //noves categories
        return null
      }else if(this.industry_type === "wood"){  //noves categories
        return  null
      }else if(this.industry_type === "paper"){  //noves categories
        return  100*1e-3
      }else if(this.industry_type === "printing"){  //noves categories
        return null
      }else if(this.industry_type === "coke"){  //noves categories
        return  null
      }else if(this.industry_type === "chemicals"){  //noves categories
        return  647.13333333333*1e-3
      }else if(this.industry_type === "pharmaceutical"){  //noves categories
        return  null
      }else if(this.industry_type === "rubber"){  //noves categories
        return  null
      }else if(this.industry_type === "mineral"){  //noves categories
        return null
      }else if(this.industry_type === "metals"){  //noves categories
        return  null
      }else if(this.industry_type === "fabricated_metals"){  //noves categories
        return null
      }else if(this.industry_type === "computer"){  //noves categories
        return  null
      }else if(this.industry_type === "electrical"){  //noves categories
        return  null
      }else if(this.industry_type === "machinery"){  //noves categories
        return  null
      }else if(this.industry_type === "vehicles"){  //noves categories
        return  null
      }else if(this.industry_type === "transport"){  //noves categories
        return null
      }else if(this.industry_type === "furniture"){  //noves categories
        return  null
      }else if(this.industry_type === "other_manufacturing"){  //noves categories
        return  null
      }else if(this.industry_type === "repair"){  //noves categories
        return  null
      }else return null
    },
    ind_cadmium_effl(){
      if(this.industry_type === "food"){  //noves categories
        return 0.32*1e-3
      }else if(this.industry_type === "beverages"){  //noves categories
        return 0.455*1e-3
      }else if(this.industry_type === "textiles"){  //noves categories
        return  null
      }else if(this.industry_type === "wearing"){  //noves categories
        return  null
      }else if(this.industry_type === "leather"){  //noves categories
        return 0.8860526315789474*1e-3
      }else if(this.industry_type === "wood"){  //noves categories
        return 0.9*1e-3
      }else if(this.industry_type === "paper"){  //noves categories
        return 1.19*1e-3
      }else if(this.industry_type === "printing"){  //noves categories
        return 0.6015384615384615*1e-3
      }else if(this.industry_type === "coke"){  //noves categories
        return 0.33*1e-3
      }else if(this.industry_type === "chemicals"){  //noves categories
        return 0.5816129032258064*1e-3
      }else if(this.industry_type === "pharmaceutical"){  //noves categories
        return 0.7260416666666667*1e-3
      }else if(this.industry_type === "rubber"){  //noves categories
        return  null
      }else if(this.industry_type === "mineral"){  //noves categories
        return 1.31*1e-3
      }else if(this.industry_type === "metals"){  //noves categories
        return 21.673333333333332*1e-3
      }else if(this.industry_type === "fabricated_metals"){  //noves categories
        return null
      }else if(this.industry_type === "computer"){  //noves categories
        return  null
      }else if(this.industry_type === "electrical"){  //noves categories
        return  null
      }else if(this.industry_type === "machinery"){  //noves categories
        return 10015*1e-3
      }else if(this.industry_type === "vehicles"){  //noves categories
        return  null
      }else if(this.industry_type === "transport"){  //noves categories
        return null
      }else if(this.industry_type === "furniture"){  //noves categories
        return  null
      }else if(this.industry_type === "other_manufacturing"){  //noves categories
        return  null
      }else if(this.industry_type === "repair"){  //noves categories
        return  null
      }else return null
    },
    ind_hexaclorobenzene_effl(){
      if(this.industry_type === "food"){  //noves categories
        return null
      }else if(this.industry_type === "beverages"){  //noves categories
        return  null
      }else if(this.industry_type === "textiles"){  //noves categories
        return  null
      }else if(this.industry_type === "wearing"){  //noves categories
        return  null
      }else if(this.industry_type === "leather"){  //noves categories
        return null
      }else if(this.industry_type === "wood"){  //noves categories
        return  null
      }else if(this.industry_type === "paper"){  //noves categories
        return  null
      }else if(this.industry_type === "printing"){  //noves categories
        return null
      }else if(this.industry_type === "coke"){  //noves categories
        return  2*1e-3
      }else if(this.industry_type === "chemicals"){  //noves categories
        return 0.009523809523809526*1e-3
      }else if(this.industry_type === "pharmaceutical"){  //noves categories
        return  null
      }else if(this.industry_type === "rubber"){  //noves categories
        return  null
      }else if(this.industry_type === "mineral"){  //noves categories
        return null
      }else if(this.industry_type === "metals"){  //noves categories
        return  null
      }else if(this.industry_type === "fabricated_metals"){  //noves categories
        return null
      }else if(this.industry_type === "computer"){  //noves categories
        return  null
      }else if(this.industry_type === "electrical"){  //noves categories
        return  null
      }else if(this.industry_type === "machinery"){  //noves categories
        return  null
      }else if(this.industry_type === "vehicles"){  //noves categories
        return  null
      }else if(this.industry_type === "transport"){  //noves categories
        return null
      }else if(this.industry_type === "furniture"){  //noves categories
        return  null
      }else if(this.industry_type === "other_manufacturing"){  //noves categories
        return  null
      }else if(this.industry_type === "repair"){  //noves categories
        return  null
      }else return null
    },
    ind_mercury_effl(){
      if(this.industry_type === "food"){  //noves categories
        return 95*1e-3
      }else if(this.industry_type === "beverages"){  //noves categories
        return  0.1281690140845069*1e-3
      }else if(this.industry_type === "textiles"){  //noves categories
        return  null
      }else if(this.industry_type === "wearing"){  //noves categories
        return  null
      }else if(this.industry_type === "leather"){  //noves categories
        return 0.2044736842105263*1e-3
      }else if(this.industry_type === "wood"){  //noves categories
        return 0.1636363636363636*1e-3
      }else if(this.industry_type === "paper"){  //noves categories
        return 0.17*1e-3
      }else if(this.industry_type === "printing"){  //noves categories
        return null
      }else if(this.industry_type === "coke"){  //noves categories
        return 105*1e-3
      }else if(this.industry_type === "chemicals"){  //noves categories
        return  0.19192982456140348*1e-3
      }else if(this.industry_type === "pharmaceutical"){  //noves categories
        return 0.2647916666666666*1e-3
      }else if(this.industry_type === "rubber"){  //noves categories
        return  null
      }else if(this.industry_type === "mineral"){  //noves categories
        return 33.48333333333333*1e-3
      }else if(this.industry_type === "metals"){  //noves categories
        return 0.18000000000000002*1e-3
      }else if(this.industry_type === "fabricated_metals"){  //noves categories
        return null
      }else if(this.industry_type === "computer"){  //noves categories
        return  null
      }else if(this.industry_type === "electrical"){  //noves categories
        return  null
      }else if(this.industry_type === "machinery"){  //noves categories
        return 85*1e-3
      }else if(this.industry_type === "vehicles"){  //noves categories
        return  null
      }else if(this.industry_type === "transport"){  //noves categories
        return null
      }else if(this.industry_type === "furniture"){  //noves categories
        return  null
      }else if(this.industry_type === "other_manufacturing"){  //noves categories
        return  null
      }else if(this.industry_type === "repair"){  //noves categories
        return  null
      }else return null
    },
    ind_plomo_effl(){
      if(this.industry_type === "food"){  //noves categories
        return 1985*1e-3
      }else if(this.industry_type === "beverages"){  //noves categories
        return 12.361901408450692*1e-3
      }else if(this.industry_type === "textiles"){  //noves categories
        return  null
      }else if(this.industry_type === "wearing"){  //noves categories
        return  null
      }else if(this.industry_type === "leather"){  //noves categories
        return 12.063947368421049*1e-3
      }else if(this.industry_type === "wood"){  //noves categories
        return 11.763636363636364*1e-3
      }else if(this.industry_type === "paper"){  //noves categories
        return 5.36*1e-3
      }else if(this.industry_type === "printing"){  //noves categories
        return 3.3173076923076925*1e-3
      }else if(this.industry_type === "coke"){  //noves categories
        return 1.22*1e-3
      }else if(this.industry_type === "chemicals"){  //noves categories
        return 14.397151898734155*1e-3
      }else if(this.industry_type === "pharmaceutical"){  //noves categories
        return 3.4849999999999994*1e-3
      }else if(this.industry_type === "rubber"){  //noves categories
        return  null
      }else if(this.industry_type === "mineral"){  //noves categories
        return 339.66*1e-3
      }else if(this.industry_type === "metals"){  //noves categories
        return 35.682500000000005*1e-3
      }else if(this.industry_type === "fabricated_metals"){  //noves categories
        return null
      }else if(this.industry_type === "computer"){  //noves categories
        return  null
      }else if(this.industry_type === "electrical"){  //noves categories
        return  null
      }else if(this.industry_type === "machinery"){  //noves categories
        return 2212.8*1e-3
      }else if(this.industry_type === "vehicles"){  //noves categories
        return  null
      }else if(this.industry_type === "transport"){  //noves categories
        return null
      }else if(this.industry_type === "furniture"){  //noves categories
        return  null
      }else if(this.industry_type === "other_manufacturing"){  //noves categories
        return  null
      }else if(this.industry_type === "repair"){  //noves categories
        return  null
      }else return null
    },
    ind_niquel_effl(){
      if(this.industry_type === "food"){  //noves categories
        return 4395*1e-3
      }else if(this.industry_type === "beverages"){  //noves categories
        return 15.111126760563366*1e-3
      }else if(this.industry_type === "textiles"){  //noves categories
        return  null
      }else if(this.industry_type === "wearing"){  //noves categories
        return  null
      }else if(this.industry_type === "leather"){  //noves categories
        return 24.955526315789474*1e-3
      }else if(this.industry_type === "wood"){  //noves categories
        return 8.272727272727272*1e-3
      }else if(this.industry_type === "paper"){  //noves categories
        return 7.55*1e-3
      }else if(this.industry_type === "printing"){  //noves categories
        return 6.599230769230768*1e-3
      }else if(this.industry_type === "coke"){  //noves categories
        return 8.87*1e-3
      }else if(this.industry_type === "chemicals"){  //noves categories
        return 92.75778481012654*1e-3
      }else if(this.industry_type === "pharmaceutical"){  //noves categories
        return 4.578333333333334*1e-3
      }else if(this.industry_type === "rubber"){  //noves categories
        return  null
      }else if(this.industry_type === "mineral"){  //noves categories
        return 18.505000000000003*1e-3
      }else if(this.industry_type === "metals"){  //noves categories
        return 619.9191666666667*1e-3
      }else if(this.industry_type === "fabricated_metals"){  //noves categories
        return 3854.1666666666642*1e-3
      }else if(this.industry_type === "computer"){  //noves categories
        return null
      }else if(this.industry_type === "electrical"){  //noves categories
        return 2000*1e-3
      }else if(this.industry_type === "machinery"){  //noves categories
        return 20.14*1e-3
      }else if(this.industry_type === "vehicles"){  //noves categories
        return  null
      }else if(this.industry_type === "transport"){  //noves categories
        return null
      }else if(this.industry_type === "furniture"){  //noves categories
        return  null
      }else if(this.industry_type === "other_manufacturing"){  //noves categories
        return  null
      }else if(this.industry_type === "repair"){  //noves categories
        return  null
      }else return null
    },
    ind_chloro_effl(){
      if(this.industry_type === "food"){  //noves categories
        return null
      }else if(this.industry_type === "beverages"){  //noves categories
        return  null
      }else if(this.industry_type === "textiles"){  //noves categories
        return  null
      }else if(this.industry_type === "wearing"){  //noves categories
        return  null
      }else if(this.industry_type === "leather"){  //noves categories
        return 3.3494736842105253*1e-3
      }else if(this.industry_type === "wood"){  //noves categories
        return  null
      }else if(this.industry_type === "paper"){  //noves categories
        return  null
      }else if(this.industry_type === "printing"){  //noves categories
        return null
      }else if(this.industry_type === "coke"){  //noves categories
        return  null
      }else if(this.industry_type === "chemicals"){  //noves categories
        return  8.603859649122807*1e-3
      }else if(this.industry_type === "pharmaceutical"){  //noves categories
        return  null
      }else if(this.industry_type === "rubber"){  //noves categories
        return  null
      }else if(this.industry_type === "mineral"){  //noves categories
        return null
      }else if(this.industry_type === "metals"){  //noves categories
        return  5.809166666666667*1e-3
      }else if(this.industry_type === "fabricated_metals"){  //noves categories
        return null
      }else if(this.industry_type === "computer"){  //noves categories
        return  null
      }else if(this.industry_type === "electrical"){  //noves categories
        return  null
      }else if(this.industry_type === "machinery"){  //noves categories
        return  5105*1e-3
      }else if(this.industry_type === "vehicles"){  //noves categories
        return  null
      }else if(this.industry_type === "transport"){  //noves categories
        return null
      }else if(this.industry_type === "furniture"){  //noves categories
        return  null
      }else if(this.industry_type === "other_manufacturing"){  //noves categories
        return  null
      }else if(this.industry_type === "repair"){  //noves categories
        return  null
      }else return null
    },
    ind_hexaclorobutadie_effl(){
      if(this.industry_type === "food"){  //noves categories
        return null
      }else if(this.industry_type === "beverages"){  //noves categories
        return  null
      }else if(this.industry_type === "textiles"){  //noves categories
        return  null
      }else if(this.industry_type === "wearing"){  //noves categories
        return  null
      }else if(this.industry_type === "leather"){  //noves categories
        return null
      }else if(this.industry_type === "wood"){  //noves categories
        return  null
      }else if(this.industry_type === "paper"){  //noves categories
        return  null
      }else if(this.industry_type === "printing"){  //noves categories
        return null
      }else if(this.industry_type === "coke"){  //noves categories
        return 2*1e-3
      }else if(this.industry_type === "chemicals"){  //noves categories
        return 0.009523809523809526*1e-3
      }else if(this.industry_type === "pharmaceutical"){  //noves categories
        return  null
      }else if(this.industry_type === "rubber"){  //noves categories
        return  null
      }else if(this.industry_type === "mineral"){  //noves categories
        return null
      }else if(this.industry_type === "metals"){  //noves categories
        return  null
      }else if(this.industry_type === "fabricated_metals"){  //noves categories
        return null
      }else if(this.industry_type === "computer"){  //noves categories
        return  null
      }else if(this.industry_type === "electrical"){  //noves categories
        return  null
      }else if(this.industry_type === "machinery"){  //noves categories
        return  null
      }else if(this.industry_type === "vehicles"){  //noves categories
        return  null
      }else if(this.industry_type === "transport"){  //noves categories
        return null
      }else if(this.industry_type === "furniture"){  //noves categories
        return  null
      }else if(this.industry_type === "other_manufacturing"){  //noves categories
        return  null
      }else if(this.industry_type === "repair"){  //noves categories
        return  null
      }else return null
    },
    ind_nonilfenols_effl(){
      if(this.industry_type === "food"){  //noves categories
        return 0.73*1e-3
      }else if(this.industry_type === "beverages"){  //noves categories
        return 1.2240140845070406*1e-3
      }else if(this.industry_type === "textiles"){  //noves categories
        return 654.5454545454545*1e-3
      }else if(this.industry_type === "wearing"){  //noves categories
        return  null
      }else if(this.industry_type === "leather"){  //noves categories
        return 555*1e-3
      }else if(this.industry_type === "wood"){  //noves categories
        return 1.6727272727272728*1e-3
      }else if(this.industry_type === "paper"){  //noves categories
        return 441.50470588235294*1e-3
      }else if(this.industry_type === "printing"){  //noves categories
        return 3.326153846153846*1e-3
      }else if(this.industry_type === "coke"){  //noves categories
        return  null
      }else if(this.industry_type === "chemicals"){  //noves categories
        return  56760.85671794876*1e-3
      }else if(this.industry_type === "pharmaceutical"){  //noves categories
        return 1.2556249999999995*1e-3
      }else if(this.industry_type === "rubber"){  //noves categories
        return 1000*1e-3
      }else if(this.industry_type === "mineral"){  //noves categories
        return 0.96*1e-3
      }else if(this.industry_type === "metals"){  //noves categories
        return 1.0633333333333335*1e-3
      }else if(this.industry_type === "fabricated_metals"){  //noves categories
        return null
      }else if(this.industry_type === "computer"){  //noves categories
        return  null
      }else if(this.industry_type === "electrical"){  //noves categories
        return  null
      }else if(this.industry_type === "machinery"){  //noves categories
        return  null
      }else if(this.industry_type === "vehicles"){  //noves categories
        return  null
      }else if(this.industry_type === "transport"){  //noves categories
        return null
      }else if(this.industry_type === "furniture"){  //noves categories
        return  null
      }else if(this.industry_type === "other_manufacturing"){  //noves categories
        return  null
      }else if(this.industry_type === "repair"){  //noves categories
        return  null
      }else return null
    },
    ind_tetracloroetile_effl(){
      if(this.industry_type === "food"){  //noves categories
        return null
      }else if(this.industry_type === "beverages"){  //noves categories
        return  null
      }else if(this.industry_type === "textiles"){  //noves categories
        return  null
      }else if(this.industry_type === "wearing"){  //noves categories
        return  null
      }else if(this.industry_type === "leather"){  //noves categories
        return 156.15947368421058*1e-3
      }else if(this.industry_type === "wood"){  //noves categories
        return null
      }else if(this.industry_type === "paper"){  //noves categories
        return  100*1e-3
      }else if(this.industry_type === "printing"){  //noves categories
        return 0.49538461538461537*1e-3
      }else if(this.industry_type === "coke"){  //noves categories
        return  95*1e-3
      }else if(this.industry_type === "chemicals"){  //noves categories
        return  5.161904761904763*1e-3
      }else if(this.industry_type === "pharmaceutical"){  //noves categories
        return  0.1964583333333334*1e-3
      }else if(this.industry_type === "rubber"){  //noves categories
        return null
      }else if(this.industry_type === "mineral"){  //noves categories
        return null
      }else if(this.industry_type === "metals"){  //noves categories
        return  0.2058333333333333*1e-3
      }else if(this.industry_type === "fabricated_metals"){  //noves categories
        return null
      }else if(this.industry_type === "computer"){  //noves categories
        return  null
      }else if(this.industry_type === "electrical"){  //noves categories
        return  null
      }else if(this.industry_type === "machinery"){  //noves categories
        return  null
      }else if(this.industry_type === "vehicles"){  //noves categories
        return  null
      }else if(this.industry_type === "transport"){  //noves categories
        return null
      }else if(this.industry_type === "furniture"){  //noves categories
        return  null
      }else if(this.industry_type === "other_manufacturing"){  //noves categories
        return  null
      }else if(this.industry_type === "repair"){  //noves categories
        return  null
      }else return null
    },
    ind_tricloroetile_effl(){
      if(this.industry_type === "food"){  //noves categories
        return 75*1e-3
      }else if(this.industry_type === "beverages"){  //noves categories
        return 0.10253521126760569*1e-3
      }else if(this.industry_type === "textiles"){  //noves categories
        return  null
      }else if(this.industry_type === "wearing"){  //noves categories
        return  null
      }else if(this.industry_type === "leather"){  //noves categories
        return 0.6134210526315792*1e-3
      }else if(this.industry_type === "wood"){  //noves categories
        return 0.1818181818181818*1e-3
      }else if(this.industry_type === "paper"){  //noves categories
        return 100*1e-3
      }else if(this.industry_type === "printing"){  //noves categories
        return 0.26538461538461533*1e-3
      }else if(this.industry_type === "coke"){  //noves categories
        return null
      }else if(this.industry_type === "chemicals"){  //noves categories
        return  0.6655072463768117*1e-3
      }else if(this.industry_type === "pharmaceutical"){  //noves categories
        return  0.1879166666666667*1e-3
      }else if(this.industry_type === "rubber"){  //noves categories
        return  null
      }else if(this.industry_type === "mineral"){  //noves categories
        return null
      }else if(this.industry_type === "metals"){  //noves categories
        return  0.34*1e-3
      }else if(this.industry_type === "fabricated_metals"){  //noves categories
        return null
      }else if(this.industry_type === "computer"){  //noves categories
        return  null
      }else if(this.industry_type === "electrical"){  //noves categories
        return  null
      }else if(this.industry_type === "machinery"){  //noves categories
        return  null
      }else if(this.industry_type === "vehicles"){  //noves categories
        return  null
      }else if(this.industry_type === "transport"){  //noves categories
        return null
      }else if(this.industry_type === "furniture"){  //noves categories
        return  null
      }else if(this.industry_type === "other_manufacturing"){  //noves categories
        return  null
      }else if(this.industry_type === "repair"){  //noves categories
        return  null
      }else return null
    },



  }




};
</script>

<style>

</style>