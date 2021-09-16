<template>
  <div class="outer">
    <div>
      <h1> {{ this.industry.name}} </h1>
    </div>
    <br>


    <v-stepper v-model="stepper_model">
      <v-stepper-header>
        <v-stepper-step
            :complete="stepper_model > 1"
            step="1"
        >
          Water withdrawal
        </v-stepper-step>

        <v-divider></v-divider>

        <v-stepper-step
            :complete="stepper_model > 2"
            step="2"
        >
          Onsite industrial WWTP
        </v-stepper-step>

        <v-divider></v-divider>

        <v-stepper-step
            :complete="stepper_model > 3"
            step="3"
        >
          External WWTP
        </v-stepper-step>

        <v-divider></v-divider>


        <v-stepper-step step="4">
          Advanced
        </v-stepper-step>
      </v-stepper-header>

      <v-stepper-items>
        <v-stepper-content step="1">

          <v-row>
            <v-col cols="6">
              <v-img
                  :src="water_withdrawal_image"
                  height="450"
                  class="grey darken-4"
              ></v-img>

            </v-col>
            <v-col cols="6">
              <v-form
                  ref="create_assessment_ref"
                  v-model="water_withdrawal_valid"
              >
                <v-text-field
                    v-model="water_needed"
                    label="Amount of water needed"
                    suffix="m3"
                    :rules="[industry_enter_leaving]"
                    type="number"
                ></v-text-field>
                <v-text-field
                    v-model="amount_insitu"
                    label="Amount of water treated in onsite industrial WWTP"
                    suffix="m3"
                    :rules="[industry_enter_leaving]"
                    type="number"
                ></v-text-field>
                <v-text-field
                    v-model="amount_offsite"
                    label="Amount of water treated in external WWTP"
                    :rules="[industry_enter_leaving]"
                    suffix="m3"
                    type="number"
                ></v-text-field>
                <v-row>
                  <v-col cols="6">
                    <v-text-field
                        v-model="cod_entering_industry"
                        label="Influent COD load entering the industry"
                        :rules="[]"
                        suffix="kg"
                        type="number"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                        v-model="cod_leaving_industry"
                        label="Effluent COD load leaving the industry"
                        :rules="[]"
                        suffix="kg"
                        type="number"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="6">
                    <v-text-field
                        v-model="p_entering_industry"
                        label="Influent P load entering the industry"
                        :rules="[]"
                        suffix="kg"
                        type="number"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                        v-model="p_leaving_industry"
                        label="Effluent P load leaving the industry"
                        :rules="[]"
                        suffix="kg"
                        type="number"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="6">
                    <v-text-field
                        v-model="n_entering_industry"
                        label="Influent N load entering the industry"
                        :rules="[]"
                        suffix="kg"
                        type="number"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                        v-model="n_leaving_industry"
                        label="Effluent N load leaving the industry"
                        :rules="[]"
                        suffix="kg"
                        type="number"
                    ></v-text-field>
                  </v-col>
                </v-row>

              </v-form>


            </v-col>

          </v-row>

          <br>

          <v-btn
              color="primary"
              @click="stepper_model = 2"
          >
            Continue
          </v-btn>

          <v-btn text>
            Cancel
          </v-btn>
        </v-stepper-content>

        <v-stepper-content step="2">
          <v-row>
            <v-col cols="6">
              <v-img
                  :src="onsite_industrial_image"
                  height="450"
                  class="grey darken-4"
              ></v-img>

            </v-col>
            <v-col cols="6">
              <v-form
                  ref="create_assessment_ref"
                  v-model="water_withdrawal_valid"
              >
                <v-text-field
                    v-model="water_needed"
                    label="Amount of water needed"
                    suffix="m3"
                    :rules="[]"
                    type="number"
                ></v-text-field>
                <v-text-field
                    v-model="amount_insitu"
                    label="Amount of water treated in onsite industrial WWTP"
                    suffix="m3"
                    :rules="[]"
                    type="number"
                ></v-text-field>
                <v-text-field
                    v-model="amount_offsite"
                    label="Amount of water treated in external WWTP"
                    :rules="[]"
                    suffix="m3"
                    type="number"
                ></v-text-field>
                <v-row>
                  <v-col cols="6">
                    <v-text-field
                        v-model="amount_offsite"
                        label="Influent COD load entering the industry"
                        :rules="[]"
                        suffix="kg"
                        type="number"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                        v-model="amount_offsite"
                        label="Effluent COD load leaving the industry"
                        :rules="[]"
                        suffix="kg"
                        type="number"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="6">
                    <v-text-field
                        v-model="amount_offsite"
                        label="Influent P load entering the industry"
                        :rules="[]"
                        suffix="kg"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                        v-model="amount_offsite"
                        label="Effluent P load leaving the industry"
                        :rules="[]"
                        suffix="kg"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="6">
                    <v-text-field
                        v-model="amount_offsite"
                        label="Influent N load entering the industry"
                        :rules="[]"
                        suffix="kg"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                        v-model="amount_offsite"
                        label="Effluent N load leaving the industry"
                        :rules="[]"
                        suffix="kg"
                    ></v-text-field>
                  </v-col>
                </v-row>

              </v-form>


            </v-col>

          </v-row>

          <v-btn
              color="primary"
              @click="stepper_model = 3"
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
          <v-expansion-panels>
            <v-expansion-panel
                v-for="[title, form] of Object.entries(this.inputs)"
                :key="title"
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
                    <v-row style="background-color: #F2F4F3" align="center" v-if="!value.depends_on || (industry[value.depends_on] === 1)">
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
                                    @click="industry[key] = parseFloat(estimations[key](industry)).toFixed(2)"
                                >
                                  Estimation: {{parseFloat(estimations[key](industry)).toFixed(2)}}{{value.unit}} <!-- Botó amb estimació -->
                                </v-btn>
                              </template>

                              <span style="white-space: pre;" v-html="estimations[key]"></span>
                            </v-tooltip>

                          </div>
                          <div v-if="value.estimation_type === 'option'" style="width: 100%">
                            <select v-model="industry[key]" style="max-width:90%;background-color: #d9d9d5; width: 90%; -webkit-appearance: menulist"  >
                              <option
                                  v-for="item in value.items"
                                  :value="value.estimation_based_on === null ? item[value.estimation_factor] : item[value.estimation_factor]*industry[value.estimation_based_on]"
                              >
                                <!--Desplegable amb estimació-->
                                {{item.name}} {{item[value.description]}} ({{value.estimation_based_on === null ? item[value.estimation_factor] : item[value.estimation_factor]*industry[value.estimation_based_on]}} {{value.unit}})
                              </option>
                              <option :value="industry[key]">Custom value</option>
                            </select>
                          </div>



                        </div>
                      </v-col>
                      <v-col cols="4">
                        <div>
                          <div v-if="value.type === 'option'">
                            <v-select
                                v-model="industry[key]"
                                :items="value.items"
                                item-text="text"
                                item-value="value"
                                label="Select"
                            ></v-select>
                          </div>
                          <div v-else >
                            <v-text-field
                                v-model="industry[key]"
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

          <br>

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

import {Assessment, Industry } from "../ecam_backend";

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
      inputs: Industry.info_inputs(),
      estimations: Industry.get_estimations(),
      stepper_model: 1,
      water_withdrawal_image: require("@/../public/water_flow/water_withdrawal.jpg"),
      onsite_industrial_image: require("@/../public/water_flow/onsite_industrial_wwtp.jpg"),

      water_withdrawal_valid: true,
      water_needed: 0,
      amount_offsite: 0,
      amount_insitu: 0,
      cod_entering_industry: 0,
      cod_leaving_industry: 0,
      n_leaving_industry: 0,
      n_entering_industry: 0,
      p_leaving_industry: 0,
      p_entering_industry: 0
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
    industry_enter_leaving(){

      console.log(this.amount_insitu + this.amount_offsite)
      if(this.water_needed === this.amount_insitu + this.amount_offsite) return true
      else return ("Amount of water entering the industry must be the same as the amount leaving")
    }
  }




};
</script>

<style>

</style>