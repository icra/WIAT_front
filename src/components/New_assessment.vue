<template>
  <div class="outer">
    <v-text-field
        v-model="assessment_name"
        label="Assessment name"
    ></v-text-field>
    <v-btn @click="create_assessment">Create new Assessment</v-btn>
  </div>
</template>

<script>


import {Assessment, Industry } from "../ecam_backend";
export default {
  name: "new_assessment",
  components: {
  },
  data() {
    return {
      created_assessments: this.$assessments,
      assessment_name: "New assessment"

    };
  },

  methods: {
    create_assessment(){
      let new_assessment = new Assessment()
      new_assessment.name = this.assessment_name
      this.$assessments.push(new_assessment)
    }
  },
  created: function() {
  },


};
</script>

<style>

</style>