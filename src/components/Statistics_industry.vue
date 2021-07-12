<template>
  <div class="outer">
    <v-row>
      <v-col>
        Emission
      </v-col>
      <v-col>
        Total GHG emission
      </v-col>
      <v-col>
        CO2 emission
      </v-col>
      <v-col>
        CH4 emission
      </v-col>
      <v-col>
        N2O emission
      </v-col>
    </v-row>
    <v-row
      v-for="func in functions_to_call"
      :key="func.key"
    >
      <v-col>
        {{func.description}}
      </v-col>
      <v-col>
        {{func.emissions["total"]}}
      </v-col>
      <v-col>
        {{func.emissions["co2"]}}
      </v-col>
      <v-col>
        {{func.emissions["ch4"]}}
      </v-col>
      <v-col>
        {{func.emissions["n2o"]}}
      </v-col>
    </v-row>

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
    let defaultIndustry = this.$assessments[this.assessment_id].industries[this.industry_id]
    return {
      industry: defaultIndustry,
      inputs: Industry.info_inputs(),
      functions_to_call: [
        {description: "indirect emissions from electricity consumption", emissions: defaultIndustry.wwt_KPI_GHG_elec()},
        {description: "emissions from fuel engines", emissions: defaultIndustry.wwt_KPI_GHG_fuel()},
        {description: "emissions from biogas (fuel used in digester)", emissions: defaultIndustry.wwt_KPI_GHG_biog_dig()},
        {description: "emissions from treatment", emissions: defaultIndustry.wwt_KPI_GHG_tre()},
        {description: "emissions from biogas", emissions: defaultIndustry.wwt_KPI_GHG_biog()},
        {description: "emissions from biogas flared", emissions: defaultIndustry.wwt_KPI_GHG_biog_flared()},
        {description: "biogas valorized emissions", emissions: defaultIndustry.wwt_KPI_GHG_biog_valorized()},
        {description: "biogas leaked emissions", emissions: defaultIndustry.wwt_KPI_GHG_biog_leaked()},
        {description: "ghg from sludge management", emissions: defaultIndustry.wwt_KPI_GHG_slu()},
        {description: "emissions from sludge storage", emissions: defaultIndustry.wwt_KPI_GHG_sludge_storage()},
        {description: "emissions from sludge composting", emissions: defaultIndustry.wwt_KPI_GHG_sludge_composting()},
        {description: "emissions from sludge incineration", emissions: defaultIndustry.wwt_KPI_GHG_sludge_incineration()},
        {description: "emissions from sludge applied to land", emissions: defaultIndustry.wwt_KPI_GHG_sludge_land_application()},
        {description: "emissions from sludge used for landfilling", emissions: defaultIndustry.wwt_KPI_GHG_sludge_landfilling()},
        {description: "emissions from sludge stockpiled", emissions: defaultIndustry.wwt_KPI_GHG_sludge_stockpilling()},
        {description: "emissions from sludge transport", emissions: defaultIndustry.wwt_KPI_GHG_sludge_transport()},
        {description: "emissions from water reuse transport", emissions: defaultIndustry.wwt_KPI_GHG_reus_trck()},
        {description: "emissions from water discharged", emissions: defaultIndustry.wwt_KPI_GHG_disc()},


      ]
    };
  },
  methods:  {

  }

};
</script>

<style>

</style>