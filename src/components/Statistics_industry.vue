<template>
  <div class="outer">

    <v-data-table
        :headers="headers"
        :items="tableData"
        class="elevation-1"
    ></v-data-table>

    <industry_pie_chart v-bind:dataset="dataset_for_pie" v-bind:labels='labels_for_pie'
    ></industry_pie_chart>

  </div>
</template>

<script>

import {Assessment, Industry } from "../ecam_backend";
import Industry_pie_chart from "@/components/Industry_pie_chart";
export default {
  name: "new_assessment",
  props: ['assessment_id', 'industry_id'],
  components: {
    Industry,
    Assessment,
    Industry_pie_chart
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
      ],
      headers: [
        {
          text: 'Emission',
          align: 'start',
          sortable: false,
          value: 'emission',
        },


        { text: 'Total GHG emission', value: 'total GHG emission' },
        { text: 'CO2 emission', value: 'CO2 emission' },
        { text: 'CH4 emission', value: 'CH4 emission' },
        { text: 'N2O emission', value: 'N2O emission' },

      ],
      tableData: [],
      labels_for_pie: [],
      dataset_for_pie: [{
        borderWidth: 1,
        data: [],
        backgroundColor: []
      }],
    };
  },
  methods: {
    getRandomColor: function () {
      let letters = '0123456789ABCDEF';
      let color = '#';
      for (let  i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color
    },
    populateTable(){
      this.tableData = []
      for(let row of this.functions_to_call){
        this.tableData.push({
          emission: row.description,
          "total GHG emission": row.emissions["total"],
          "CO2 emission": row.emissions["co2"],
          "CH4 emission": row.emissions["ch4"],
          "N2O emission": row.emissions["n2o"],

        })
      }
    }
},
  created()  {
    let _this = this
    this.populateTable()
    this.functions_to_call.forEach(func => {
      _this.labels_for_pie.push(func.description)
      _this.dataset_for_pie[0].data.push(func.emissions.total)
      _this.dataset_for_pie[0].backgroundColor.push(_this.getRandomColor())
    })

  }

};
</script>

<style>

</style>