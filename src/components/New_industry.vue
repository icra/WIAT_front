<template>
  <div class="outer">
    <div>
      <h1> {{ this.industry.name}} </h1>
    </div>

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
              <v-row style="background-color: #F2F4F3" align="center">
                <v-col cols="8" >
                  <div style="width: 100%;">
                    <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                      <span>
                        {{value.question}}   <!-- Input -->
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
                        <span>{{ estimations[key].toString() }}</span>
                      </v-tooltip>

                    </div>
                    <div v-if="value.estimation_type === 'option'" style="width: 100%">
                      <select v-model="industry[key]" style="max-width:90%;background-color: #d9d9d5; width: 90%; -webkit-appearance: menulist"  >
                        <option
                            v-for="item in value.items"
                            :value="value.estimation_based_on === null ? parseFloat(item[value.estimation_factor]).toFixed(2) : parseFloat((item[value.estimation_factor])*industry[value.estimation_based_on]).toFixed(2)"
                        >
                          <!--Desplegable amb estimació-->
                          {{item.name}} {{item[value.description]}} ({{value.estimation_based_on === null ? parseFloat(item[value.estimation_factor]).toFixed(2) : parseFloat((item[value.estimation_factor])*industry[value.estimation_based_on]).toFixed(2)}} {{value.unit}})
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
                          v-model="value.value"
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
      industry: this.$assessments[this.assessment_id].industries[this.industry_id],
      inputs: Industry.info_inputs(),
      estimations: Industry.get_estimations()
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
      if (industry === undefined) this.$router.push('/')
    },
  }




};
</script>

<style>

</style>