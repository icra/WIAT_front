<template>
  <div class="outer">
    <div>
      <h1> {{ this.industry.name}} </h1>
    </div>
    <br>

    <v-tabs
        v-model="tab_model"
        align-with-title
        fixed-tabs
        dark
        background-color="#1C195B"

    >
      <v-tabs-slider color="#463FCA"></v-tabs-slider>

      <v-tab
          v-for="item in tab_item"
          :key="item"
      >
        {{ item }}
      </v-tab>
    </v-tabs>

    <v-tabs-items v-model="tab_model">
      <v-tab-item
        key="GHG emission"
      >
        <v-data-table
            :headers="headers"
            :items="tableData"
            class="elevation-1"
        ></v-data-table>

        <br>

        <industry_pie_chart v-bind:dataset="dataset_for_pie" v-bind:labels='labels_for_pie'
        ></industry_pie_chart>
      </v-tab-item>
      <v-tab-item
          key="Water quality indicators"
      >
        <v-data-table
            :headers="waterQualityHeader"
            :items="tableDataQualityIndicators"
            class="elevation-1"
        ></v-data-table>
      </v-tab-item>
    </v-tabs-items>


  </div>
</template>

<script>

import {Assessment, Industry } from "../ecam_backend";
import Industry_pie_chart from "@/components/Industry_pie_chart";
import {utils} from "../utils";

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
      assessment: this.$assessments[this.assessment_id],
      industry: defaultIndustry,
      functions_to_call: defaultIndustry.emissions_and_descriptions(),
      water_quality_indicators: defaultIndustry.water_quality_indicators(),
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
      waterQualityHeader: [
        {
          text: '',
          align: 'start',
          sortable: false,
          value: 'type',
        },
        {
          text: 'Value',
          sortable: false,
          value: 'value',
        },
        {
          text: 'Unit',
          sortable: false,
          value: 'unit',
        },


      ],
      tableData: [],
      tableDataQualityIndicators: [],
      labels_for_pie: [],
      dataset_for_pie: [{
        borderWidth: 1,
        data: [],
        backgroundColor: []
      }],
      tab_item: ["GHG emission", "Water quality indicators"],
      tab_model: "GHG emission"
    };
  },
  methods: {

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

      this.tableDataQualityIndicators = this.water_quality_indicators
      /*for(let row of this.water_quality_indicators){
        this.tableDataQualityIndicators.push({
          "type": row.type,
          "value": row.emissions["total"],
          "unit": row.emissions["co2"],


        })*/

    },
    table_and_statistics(){
      let _this = this


      this.populateTable()
      this.functions_to_call.forEach(func => {
        _this.labels_for_pie.push(func.description)
        _this.dataset_for_pie[0].data.push(func.emissions.total)
        _this.dataset_for_pie[0].backgroundColor.push(utils.getRandomColor())
      })
    },
    industries_deleted(){ //An industry or assessment has been deleted, if it's the current one return to map
      let _this = this
      let assessment_index =  this.$assessments.findIndex(assessment => assessment.name === _this.assessment.name)
      if(assessment_index === -1) this.$router.push('/')
      else {
        let assessment = this.$assessments[assessment_index]
        let industry_index = assessment.industries.findIndex(industry => industry.name === _this.industry.name)
        if(industry_index === -1) this.$router.push('/')
      }
    }
},
  created()  {
    if (this.industry === undefined) this.$router.push('/')
    this.table_and_statistics()
  },
  watch: {
    industry_id: function (industry_id) {
      this.table_and_statistics()

    },
    assessment_id: function (assessment_id) {
      this.table_and_statistics()
    },
    industry: function (industry) {
      if (industry === undefined) this.$router.push('/')
    },
  },

};
</script>

<style>

</style>