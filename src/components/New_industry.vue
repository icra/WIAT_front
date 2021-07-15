<template>
  <div class="outer">
    <div>
      <h1> {{ this.industry.name}} </h1>
    </div>
    <div
        v-for="[key, value] of Object.entries(this.inputs)"
        :key="key"
    >
      <div v-if="value.type === 'title'">
        <h3>{{key}}</h3>
      </div>

      <div v-else>
        <v-row>
          <v-col cols="8">
            <v-row>
              <v-col>
                <div style="height: 100%; display: flex;
             justify-content: center;
             align-content: center;
             flex-direction: column;"
                >
                  <p>
                    {{value.question}}
                  </p>

                </div>

              </v-col>
              <v-col v-if="value.estimation_type === 'option'" cols="6">
                <v-select
                    full-width
                    :items="value.items"
                    item-text="name"
                    :item-value="item => item.bod_effl*industry[value.estimation_based_on]"
                    label="Select"
                    v-model="industry[key]"
                ></v-select>

              </v-col>
            </v-row>

          </v-col>
          <v-col v-if="value.type === 'option'" cols="4">
            <v-select
                v-model="value.value"
                :items="value.items"
                item-text="text"
                :item-value="value"
                label="Select"
            ></v-select>

          </v-col>
          <v-col v-else cols="4">
            <v-text-field
                v-model="industry[key]"
                :suffix="value.unit"
            ></v-text-field>
          </v-col>

        </v-row>

      </div>
    </div>

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
  methods:  {
  }

};
</script>

<style>

</style>