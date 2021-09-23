<template>
  <div class="outer">
    <div>
      <h1> {{ this.industry.name}} </h1>
    </div>
    <br>


    <v-stepper v-model="stepper_model" alt-labels>
      <v-stepper-header>
        <v-stepper-step
            :complete="stepper_model > 1"
            step="1"
        >
          Water withdrawal and industry
        </v-stepper-step>

        <v-divider></v-divider>

        <v-stepper-step
            :complete="stepper_model > 2"
            step="2"
        >
          On-site industrial WWTP
        </v-stepper-step>

        <v-divider></v-divider>

        <v-stepper-step
            :complete="stepper_model > 3"
            step="3"
        >
          External WWTP
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
                    v-model="water_needed"
                    label="Amount of water withdrawn from the water body"
                    suffix="m3"
                    type="number"
                    :rules="[rules_required]"
                ></v-text-field>
                <v-select
                    v-model="has_onsite_wwtp"
                    :items="yes_no"
                    filled
                    label="Has the industry an on-site treatment wastewater plant?"
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
                    v-if="has_offsite_wwtp === 'Yes'"
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
            Continue
          </v-btn>

          <v-btn text>
            Cancel
          </v-btn>
        </v-stepper-content>

        <v-stepper-content step="2">
          <v-row>
            <!--
            <v-col cols="8">
              <v-img
                  :src="onsite_industrial_image"
                  height="450"
                  class="grey darken-4"
              ></v-img>

            </v-col>
            <v-col cols="4">
              <v-form
                  ref="create_assessment_ref"
                  v-model="onsite_valid"
              >
                <v-select
                    v-model="has_onsite_wwtp"
                    :items="yes_no"
                    filled
                    label="Has the industry an on-site treatment wastewater plant?"
                ></v-select>
                <v-text-field
                    v-model="water_treated_onsite"
                    label="Amount of water treated in the on-site wastewater treatment plant"
                    suffix="m3"
                    :rules="[rules_required]"
                    type="number"
                    v-if="has_onsite_wwtp === 'Yes'"
                ></v-text-field>
                <v-text-field
                    v-model="cod_leaving_onsite"
                    label="Effluent COD load leaving the on-site wastewater treatment plant"
                    :rules="[rules_required]"
                    suffix="kg"
                    type="number"
                    v-if="has_onsite_wwtp === 'Yes'"

                ></v-text-field>
                <v-text-field
                    v-model="p_leaving_onsite"
                    label="Effluent P load leaving the on-site wastewater treatment plant"
                    :rules="[rules_required]"
                    suffix="kg"
                    type="number"
                    v-if="has_onsite_wwtp === 'Yes'"

                ></v-text-field>
                <v-text-field
                    v-model="n_leaving_onsite"
                    label="Effluent N load leaving the on-site wastewater treatment plant"
                    :rules="[rules_required]"
                    suffix="kg"
                    type="number"
                    v-if="has_onsite_wwtp === 'Yes'"
                ></v-text-field>
              </v-form>
            </v-col>
            -->
            <v-col cols="12">
              <v-img
                  :src="onsite_external_image"
                  height="600"
                  class="grey darken-4"
                  v-if="has_offsite_wwtp === 'Yes'"
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
          <div v-if="stepper_model === 2">
            <!-- Show inputs under "None" key -->
            <div
                v-for="[key, value] of Object.entries(this.onsite_inputs.None)"
                :key="key"
                v-if="has_onsite_wwtp === 'Yes'"
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
                            v-if="value.estimation_type === 'equation'">
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn
                                v-bind="attrs"
                                v-on="on"
                                outlined
                                x-small
                                @click="industry.onsite_wwtp[key] = parseFloat(estimations[key](industry.onsite_wwtp)).toFixed(2)"
                            >
                              Estimation: {{parseFloat(estimations[key](industry.onsite_wwtp)).toFixed(2)}}{{value.unit}} <!-- Botó amb estimació -->
                            </v-btn>
                          </template>

                          <span style="white-space: pre;" v-html="estimations[key]"></span>
                        </v-tooltip>

                      </div>
                      <div v-if="value.estimation_type === 'option'" style="width: 100%">
                        <select v-model="industry.onsite_wwtp[key]" style="max-width:90%;background-color: #d9d9d5; width: 90%; -webkit-appearance: menulist"  >
                          <option
                              v-for="item in value.items"
                              :value="value.estimation_based_on === null ? item[value.estimation_factor] : item[value.estimation_factor]*industry.onsite_wwtp[value.estimation_based_on]"
                          >
                            <!--Desplegable amb estimació-->
                            {{item.name}} {{item[value.description]}} ({{value.estimation_based_on === null ? item[value.estimation_factor] : item[value.estimation_factor]*industry.onsite_wwtp[value.estimation_based_on]}} {{value.unit}})
                          </option>
                          <option :value="industry.onsite_wwtp[key]">Custom value</option>
                        </select>
                      </div>



                    </div>
                  </v-col>
                  <v-col cols="4">
                    <div>
                      <div v-if="value.type === 'option'">
                        <v-select
                            v-model="industry.onsite_wwtp[key]"
                            :items="value.items"
                            item-text="text"
                            item-value="value"
                            label="Select"
                        ></v-select>
                      </div>
                      <div v-else >
                        <v-text-field
                            v-model="industry.onsite_wwtp[key]"
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
                          <div style="margin-left: 12px;">
                            <div style="height: 100%;  display: flex; justify-content: space-between; max-width: 90%;">
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
                                  v-if="value.estimation_type === 'equation'">
                                <template v-slot:activator="{ on, attrs }">
                                  <v-btn
                                      v-bind="attrs"
                                      v-on="on"
                                      outlined
                                      x-small
                                      @click="industry.onsite_wwtp[key] = parseFloat(estimations[key](industry.onsite_wwtp)).toFixed(2)"
                                  >
                                    Estimation: {{parseFloat(estimations[key](industry.onsite_wwtp)).toFixed(2)}}{{value.unit}} <!-- Botó amb estimació -->
                                  </v-btn>
                                </template>

                                <span style="white-space: pre;" v-html="estimations[key]"></span>
                              </v-tooltip>

                            </div>
                            <div v-if="value.estimation_type === 'option'" style="width: 100%">
                              <select v-model="industry.onsite_wwtp[key]" style="max-width:90%;background-color: #d9d9d5; width: 90%; -webkit-appearance: menulist"  >
                                <option
                                    v-for="item in value.items"
                                    :value="value.estimation_based_on === null ? item[value.estimation_factor] : item[value.estimation_factor]*industry.onsite_wwtp[value.estimation_based_on]"
                                >
                                  <!--Desplegable amb estimació-->
                                  {{item.name}} {{item[value.description]}} ({{value.estimation_based_on === null ? item[value.estimation_factor] : item[value.estimation_factor]*industry.onsite_wwtp[value.estimation_based_on]}} {{value.unit}})
                                </option>
                                <option :value="industry.onsite_wwtp[key]">Custom value</option>
                              </select>
                            </div>



                          </div>
                        </v-col>
                        <v-col cols="4">

                          <div style="margin: 12px">
                            <div v-if="value.type === 'option'">
                              <v-select
                                  v-model="industry.onsite_wwtp[key]"
                                  :items="value.items"
                                  item-text="text"
                                  item-value="value"
                                  label="Select"
                              ></v-select>
                            </div>
                            <div v-else >
                              <v-text-field
                                  v-model="industry.onsite_wwtp[key]"
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
              :disabled="has_onsite_wwtp === 'Yes' && !onsite_valid"
          >
            Continue
          </v-btn>

          <v-btn text>
            Cancel
          </v-btn>
        </v-stepper-content>

        <v-stepper-content step="3">
          <v-card
              class="mb-12"
              color="grey lighten-1"
              height="200px"
          ></v-card>

          <v-btn
              color="primary"
              @click="stepper_model = 4"
          >
            Continue
          </v-btn>

          <v-btn text>
            Cancel
          </v-btn>
        </v-stepper-content>
        <v-stepper-content step="4">


          <v-btn
              color="primary"
              @click="stepper_model = 1"
          >
            Continue
          </v-btn>

          <v-btn text>
            Cancel
          </v-btn>
        </v-stepper-content>

      </v-stepper-items>
    </v-stepper>




  </div>
</template>

<script>

import {Assessment, Industry, Industrial_wwtp_onsite, Industrial_wwtp_onsite_external_domestic} from "../ecam_backend";

export default {
  name: "new_assessment",
  props: ['assessment_id', 'industry_id'],
  components: {
    Industry,
    Assessment,
  },
  data() {
    return {
      assessment: this.$assessments[this.assessment_id],
      industry: this.$assessments[this.assessment_id].industries[this.industry_id],
      onsite_inputs: {},
      estimations: Industrial_wwtp_onsite.get_estimations(),
      stepper_model: 1,
      water_withdrawal_image: require("@/../public/water_flow/water_withdrawal.jpg"),
      onsite_industrial_image: require("@/../public/water_flow/onsite.jpg"),
      onsite_no_external_image: require("../../public/water_flow/onsite_no_external.jpg"),
      onsite_external_image: require("../../public/water_flow/onsite_external.jpg"),



      water_withdrawal_valid: false,
      water_needed: "0",
      n_leaving_industry: "0",
      p_leaving_industry: "0",
      has_onsite_wwtp: "No",
      yes_no: ["No", "Yes"],
      water_treated_onsite: "0",
      onsite_valid: true,
      has_offsite_wwtp: "No",
      offsite_wwtp_type: "Domestic",
      industrial_domestic: ["Domestic", "Industrial"],
    };
  },
  created() {
    if (this.industry === undefined) this.$router.push('/')
  },
  watch: {
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
    },
  },
  methods: {
    tab_2_continue(){
      this.stepper_model = 3
    },

    tab_1_continue(){
      if(this.has_onsite_wwtp === "No"){
        this.stepper_model = 3
      }else{
        this.stepper_model = 2
        if(this.has_offsite_wwtp){
          if(this.offsite_wwtp_type === "Domestic"){
            console.log('ssdf')
            this.industry.onsite_wwtp = new Industrial_wwtp_onsite_external_domestic()
            this.onsite_inputs = Industrial_wwtp_onsite_external_domestic.info_inputs()
          }else{  //Industrial
          }
        }else{
          this.industry.onsite_wwtp = new Industrial_wwtp_onsite()
          this.onsite_inputs = Industrial_wwtp_onsite.info_inputs()

        }





      }




      console.log(this.industry.onsite_wwtp.wwt_KPI_GHG_biog_dig())
    },

    rules_required(value) {
      if(!!value){
        if(Number.parseFloat(value) < 0) return 'Real positive value required.'
        else return true
      }
      else return 'Real positive value required.'
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