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
          <v-col v-if="value.type === 'option'">
            <v-select
                v-model="value.value"
                :items="value.items"
                item-text="text"
                item-value="value"
                label="Select"
            ></v-select>

          </v-col>
          <v-col v-else>
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