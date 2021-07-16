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
                <v-col cols="7" >
                  <div style="width: 100%;">
                    <div style="height: 100%; width: 100%;">
                      <p>
                        {{value.question}}
                      </p>
                    </div>
                    <div v-if="value.estimation_type === 'option'" style="width: 100%">
                      <select v-model="industry[key]" style="max-width:90%;background-color: #d9d9d5; width: 90%; -webkit-appearance: menulist"  >
                        <option
                            v-for="item in value.items"
                            :value="value.estimation_based_on === null ? item[value.estimation_factor] : (item[value.estimation_factor])*industry[value.estimation_based_on]"
                        >
                          {{item.name + item[value.description]}}
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
    Assessment
  },
  data() {
    return {
      industry: this.$assessments[this.assessment_id].industries[this.industry_id],
      inputs: Industry.info_inputs()
    };
  },
  created() {
    console.log(this.industry)
  },
  methods:  {
  }

};
</script>

<style>

</style>