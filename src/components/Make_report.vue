<template>
  <div class="outer">
    <h1>Report</h1>
    <div v-if="is_there_any_industry_created">
      <p>Select the industries to include in the report.</p>
      <v-treeview
          :items="assessments_and_industries_tree"
          dense
          hoverable
          selectable
          selection-type="leaf"
          return-object
          v-model="selected_industries"
          color="#1C195B"
          selected-color="#1C195B"
          open-on-click
      ></v-treeview>

      <br>

      <div>
        <v-progress-linear
            indeterminate
            rounded
            height="6"
            v-show="generating_pdf"
            color="#1C195B"

        ></v-progress-linear>

        <PDFJSViewer class="center" v-show="selected_industries.length>0 && !generating_pdf" ref="make_pdf"/>
      </div>
    </div>
    <div v-else>
      <p>Please, create an industry first to make a PDF report.</p>
    </div>


    <canvas v-show="false" id="chart" width="300" height="150"> </canvas>


    <br>
  </div>
</template>

<script>

let _ = require('lodash');
import PDFJSViewer from "@/components/PDFJSViewer";
import pdfMake from 'pdfmake/build/pdfmake.js'
import Vue from "vue";
import {utils, industry_statistics} from "../utils"
export default {
  name: "Make_report",
  components: {
    PDFJSViewer
  },
  props: ["selected_layers"],
  data() {
    return {
      created_assessments: this.$assessments,  //Created assessments
      selected_industries: [],
      doc: null,
      layers: utils.format_layer_description(Vue.prototype.$layers_description),
      generating_pdf: false
    }
  },
  watch: {
    selected_industries: async function () {

      this.generating_pdf = true

      if (pdfMake.vfs == undefined){
        let pdfFonts = require('pdfmake/build/vfs_fonts.js')
        pdfMake.vfs = pdfFonts.pdfMake.vfs;
      }

      let dd = {
        pageSize: 'A4',
        pageMargins: [50, 60, 50, 70],
        content: [],
        styles: {
          header: {
            fontSize: 18,
            bold: true
          },
          subheader: {
            fontSize: 15,
            bold: true
          },
          tableHeader: {
            bold: true,
            fontSize: 12,
            color: 'black'
          }
        },

      }

      const groupedByAssessments = _.groupBy(this.selected_industries, function(n) {
        return n.assessment.name;
      });


      for(const [assessment_name, industries] of Object.entries(groupedByAssessments)){
        dd.content.push({
          text: "Assessment "+assessment_name+"\n\n",
          style: 'header'
        })

        let assessment = industries[0].assessment

        dd.content.push("Assessment period: "+ assessment.assessment_period_start + " to "+ assessment.assessment_period_end + " ("+ utils.daysBetween(assessment.assessment_period_start, assessment.assessment_period_end) +" days)\n\n")

        this.emissions_table(dd, industries)

        await this.layers_table(dd, industries)



/*for(const industryAux of industries){

  let industry = industryAux.industry

  industry_statistics.emissions_and_descriptions(industry)

  dd.content.push({
    text: "Industry "+industry.name+"\n\n",
    style: 'subheader'
  })

  let lat = industry.location.lat
  let lng = industry.location.lng



  if(selected_layers_formatted.length > 0){
    //Layer values on industry
    dd.content.push("Layer information:\n\n")

    let layers_description = {
      table: {

        //headerRows: 2,
        // keepWithHeaderRows: 1,
        widths: ['*','*','*'],
        body: [
          [{},{text: 'Baseline', style: 'tableHeader'},{text: 'Future', style: 'tableHeader'}],
        ]
      }
    }


    //for(let [layer_name, info] of Object.entries(_this.layers)){
    for(let [layer_name, info] of  selected_layers_formatted){
      let current_layer = [layer_name]

      //Baseline
      let baseline_data = await info.layers.baseline.annual.layer["get_label_on_coord"](lat, lng)
      current_layer.push(baseline_data)
      //Future
      if(info.future){
        let future_data = await info.layers.future.layer["get_label_on_coord"](lat, lng)
        current_layer.push(future_data)
      }else current_layer.push('-')
      layers_description.table.body.push(current_layer)

    }
    dd.content.push(layers_description)
  }


  //Industry emissions
  dd.content.push("\nIndustry emissions:\n\n")
  let industry_emissions = {
    table: {
      widths: ['*','*','*','*','*'],
      body: [
        [{text: 'Emission', style: 'tableHeader'},{text: 'Total GHG Emission', style: 'tableHeader'},{text: 'CO2 emission', style: 'tableHeader'},{text: 'CH4 emission', style: 'tableHeader'},{text: 'N20 emission', style: 'tableHeader'}],
      ]
    }
  }

  let emissions_and_descriptions = industry.emissions_and_descriptions()
  for (let emission_and_description of emissions_and_descriptions){
    let description = emission_and_description.description
    let emission = emission_and_description.emissions

    let emission_row = [description, emission.total, emission.co2, emission.ch4, emission.n2o]
    industry_emissions.table.body.push(emission_row)
  }
  dd.content.push(industry_emissions)

  //Pie chart
  let pie = _this.pieChart_base64(industry)
  dd.content.push({
    image: pie,
    width: 500
  })

  //Water quality indicators
  dd.content.push("\nWater quality indicators:\n\n")
  let water_quality_indicators = {
    table: {
      widths: ['*','*','*'],
      body: [
        [{},{text: 'Value', style: 'tableHeader'},{text: 'Unit', style: 'tableHeader'}],
      ]
    }
  }

  let indicators = industry.water_quality_indicators()
  for (let indicator of indicators){
    let indicator_row = [indicator.type, indicator.value, indicator.unit,]
    water_quality_indicators.table.body.push(indicator_row)
  }
  dd.content.push(water_quality_indicators)*/


      }

      this.$refs.make_pdf.make_pdf(pdfMake.createPdf(dd))
      this.generating_pdf = false

    }
  },
  methods: {
    async layers_table(dd, industries){
      for(const industryAux of industries) {
        let industry = industryAux.industry
        dd.content.push({
          text: "Industry " + industry.name + "\n\n",
          style: 'subheader'
        })

        let lat = industry.location.lat
        let lng = industry.location.lng

        let selected_layers_formatted = this.selected_layers.map(function (layer) {
          return [layer.name, layer.layer]
        })


        if (selected_layers_formatted.length > 0) { //Layer values on industry
          dd.content.push("Layer information:\n\n")
          let layers_description = {
            table: {
              widths: ['*', '*', '*'],
              body: [
                [{}, {text: 'Baseline', style: 'tableHeader'}, {text: 'Future', style: 'tableHeader'}],
              ]
            }
          }

          for (let [layer_name, info] of selected_layers_formatted) {
            let current_layer = [layer_name]

            //Baseline
            let baseline_data = await info.layers.baseline.annual.layer["get_label_on_coord"](lat, lng)
            current_layer.push(baseline_data)
            //Future
            if (info.future) {
              let future_data = await info.layers.future.layer["get_label_on_coord"](lat, lng)
              current_layer.push(future_data)
            } else current_layer.push('-')

            layers_description.table.body.push(current_layer)
          }
          dd.content.push(layers_description)
        }
      }
    },
    emissions_table(dd, industries) {
      dd.content.push("GHG emissions\n\n")
      let widths = ['*']
      let body = [{}]
      for (const industryAux of industries) {
        widths.push('*')
        let industry = industryAux.industry
        body.push({
          text: industry.name,
          style: 'tableHeader'
        })
      }
      widths.push('*')
      body.push({
        text: "Units",
        style: 'tableHeader'
      })

      let elec = ["Indirect emissions from electricity consumption"]
      let fuel = ["Emissions from fuel engines"]
      let tre = ["Emissions from treatment"]
      let biog = ["Emissions from biogas"]
      let slu = ["Emissions from sludge management"]
      let reus = ["Emissions from water reuse transport"]
      let disc = ["Emissions from water discharged"]

      for (const industryAux of industries) {
        let industry = industryAux.industry
        let emissions = industry_statistics.emissions_and_descriptions(industry)
        elec.push(emissions["wwt_KPI_GHG_elec"].toExponential(3))
        fuel.push(emissions["wwt_KPI_GHG_fuel"].toExponential(3))
        tre.push(emissions["wwt_KPI_GHG_tre"].toExponential(3))
        biog.push(emissions["wwt_KPI_GHG_biog"].toExponential(3))
        slu.push(emissions["wwt_KPI_GHG_slu"].toExponential(3))
        reus.push(emissions["wwt_KPI_GHG_reus_trck"].toExponential(3))
        disc.push(emissions["wwt_KPI_GHG_disc"].toExponential(3))
      }

      elec.push("kgCO2eq")
      fuel.push("kgCO2eq")
      tre.push("kgCO2eq")
      biog.push("kgCO2eq")
      slu.push("kgCO2eq")
      reus.push("kgCO2eq")
      disc.push("kgCO2eq")

      let emissions_table = {
        table: {
          widths: widths,
          body: [
            body, elec, fuel, tre, biog, slu, reus, disc
          ]

        }
      }

      for (const industryAux of industries) {
        let industry = industryAux.industry
        industry_statistics.emissions_and_descriptions(industry)
      }

      dd.content.push(emissions_table)

    },

    pieChart_base64(industry) {
      let labels_for_pie = []
      let dataset_for_pie = [{
        borderWidth: 1,
        data: [],
        backgroundColor: []
      }]

      industry.emissions_and_descriptions().forEach(func => {
        labels_for_pie.push(func.description)
        dataset_for_pie[0].data.push(func.emissions.total)
        dataset_for_pie[0].backgroundColor.push(utils.getRandomColor())
      })

      let options = {
        animation: false
      };
      let content = {
        type: 'pie',
        data: {
          datasets: dataset_for_pie,
          labels: labels_for_pie,
        },
        options: options
      };
      let pieChart = new Chart(document.getElementById('chart').getContext('2d'), content);
      return pieChart.toBase64Image()

    }

  },
  computed: {

    is_there_any_industry_created: function () {

      let industries = []
      this.assessments_and_industries_tree.forEach(assessment => {
        industries.push(...assessment.children)
      })

      return industries.length > 0

    },


    assessments_and_industries_tree: function () {  //Assessments without any industry are ignored
      let id = 0
      let items = []
      this.created_assessments.forEach(assessment => {
        let obj = {}
        obj["name"] = assessment.name
        obj["children"] = []
        obj["id"] = id
        id++
        assessment.industries.forEach(industry => {
          obj["children"].push({
            "industry": industry,
            "id": id,
            "assessment": assessment,
            "name": industry.name
          })
          id++
        })
        if (obj["children"].length > 0) items.push(obj)
      })


      return items
    }
  },

}

</script>

<style scoped>
.center {
  margin: auto;

  padding: 10px;
}
</style>