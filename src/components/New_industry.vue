<template>
  <div class="outer">
    <v-row
        v-for="v in Object.values(industry_inputs)"
        :key="v.question"
    >
      <v-col>
        {{v.question}}
      </v-col>
      <v-col>
        <v-text-field
            v-model="v.value"
        ></v-text-field>
      </v-col>
    </v-row>

    <v-btn @click="create_industry">Create new Industry</v-btn>

  </div>
</template>

<script>

import {Assessment, Industry } from "../ecam_backend";
export default {
  name: "new_assessment",
  props: ['assessment_id'],
  components: {
  },
  data() {
    return {
      industry_inputs: {
        //BOD (creates CH4)
        "wwt_bod_infl" :{question:"Influent BOD5 load", value: 0},
        "wwt_bod_effl" :{question:"Effluent BOD5 load", value: 0},
        //TN (creates N2O)
        "wwt_tn_infl" :{question:"Total Nitrogen load in the influent", value: 0},
        "wwt_tn_effl" :{question:"Total Nitrogen load in the effluent", value: 0},
        //emission factors (treatment)
        "wwt_ch4_efac_tre" :{question:"CH4 emission factor (treatment)", value: 0},
        "wwt_n2o_efac_tre" :{question:"N2O emission factor (treatment)", value: 0},
        //emission factors (discharge)
        "wwt_ch4_efac_dis" :{question:"CH4 emission factor (discharge)", value: 0},
        "wwt_n2o_efac_dis" :{question:"N2O emission factor (discharge)", value: 0},
        //energy
        "wwt_nrg_cons" :{question:"Energy consumed from the grid", value: 0},
        "wwt_conv_kwh" :{question:"Emission factor for grid electricity", value: 0},
        //SLUDGE MANAGEMENT
        "wwt_mass_slu" :{question:"Sludge removed from wastewater treatment (dry weight)", value: 0},
        "wwt_bod_slud" :{question:"BOD5 removed as sludge", value: 0},



        "wwt_biog_fla" :{question:"% of biogas produced that is flared", value: 98},

      }
    };
  },
  methods: {
    create_industry(){
      let industry = new Industry()
      for (let [k,v] of Object.entries(this.industry_inputs)){
        industry[k] = v.value
      }
      let assessment = this.$assessments[this.assessment_id]
      assessment.add_industry(industry)
      console.log(assessment.TotalGHG());
    }
  },

};
</script>

<style>

</style>