<template>
  <div class="outer">
    <div>
      <h1> {{ this.industry.name}} </h1>
    </div>
    <v-row
        v-for="[key, value] of Object.entries(this.Industry.info_inputs)"
        :key="key"
    >
      <v-col>
        {{value.question}}
      </v-col>
      <v-col>
        <v-text-field
            v-model="v.value"
        ></v-text-field>
      </v-col>
    </v-row>

    <v-btn @click="edit_industry">EDIT</v-btn>

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
      industry: this.$assessments[this.assessment_id].industries[this.industry_id]
    };
  },
  methods: {
    edit_industry(){
      console.log(this.industry)
    }
  },

};
</script>

<style>

</style>