<template>
  <div>
    Industria
    {{this.assessment_id}}
  </div>
</template>

<script>


export default {
  name: "new_assessment",
  props: ['assessment_id'],
  components: {
  },
  data() {
    return {
      industry_inputs: {
        "wwt_nrg_cons" :{question:"Energy consumed from the grid", value: this.$assessments[this.assessment_id].wwt_nrg_cons},
        "wwt_conv_kwh" :{question:"Emission factor for grid electricity", value: this.$assessments[this.assessment_id].wwt_conv_kwh},


      }
    };
  },
  methods: {

  },
  created: function() {
    console.log(this.assessment_id)
  },


};
</script>

<style>

</style>