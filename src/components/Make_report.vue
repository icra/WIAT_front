<template>
  <div class="outer">
    <h1>Report</h1>
    <p>Select the assessments/industries to include in the report.</p>
    <v-treeview
        :items="assessments_and_industries_tree"
        dense
        hoverable
        selectable
        selection-type="leaf"
        return-object
        v-model="selected_industries"
    ></v-treeview>

    <PDFJSViewer :pdf_doc="doc"/>


    <br>
  </div>
</template>

<script>

let _ = require('lodash');
import PDFJSViewer from "@/components/PDFJSViewer";
import pdfMake from 'pdfmake/build/pdfmake.js'
import Vue from "vue";
export default {
  name: "Make_report",
  components: {
    PDFJSViewer
  },
  data() {
    return {
      created_assessments: this.$assessments,  //Created assessments
      selected_industries: [],
      doc: null,
      layers: Vue.prototype.$layers_description,
    }
  },
  watch: {
    selected_industries: async function () {
      let _this = this

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
            fontSize: 13,
            color: 'black'
          }
        }
      }

      const groupedByAssessments = _.groupBy(this.selected_industries, function(n) {
        return n["assessment name"];
      });

      for(const [assessment, industries] of Object.entries(groupedByAssessments)){
        dd.content.push({
          text: "Assessment "+assessment+"\n\n",
          style: 'header'
        })
        for(const industryAux of industries){

          let industry = industryAux.industry

          dd.content.push({
            text: "Industry "+industry.name+"\n\n",
            style: 'subheader'
          })

          let lat = industry.location.lat
          let lng = industry.location.lng


          //Layer values on industry
          dd.content.push("Layer information:\n\n")

          let layers_description = {
            table: {

              //headerRows: 2,
              // keepWithHeaderRows: 1,
              widths: ['*','*', '*'],
              body: [
                [{},{text: 'Baseline', style: 'tableHeader'},{text: 'Future', style: 'tableHeader'}],
              ]
            }
          }
          for(let [layer_name, info] of Object.entries(_this.layers)){

            let current_layer = [layer_name]

            //Baseline
            let baseline_data = await info.layers.baseline.annual.layer["get_data_on_coord"](lat, lng)
            current_layer.push(baseline_data)

            //Future
            if(info.future){
              let future_data = await info.layers.future.layer["get_data_on_coord"](lat, lng)
              current_layer.push(baseline_data)
            }else current_layer.push('-')
            layers_description.table.body.push(current_layer)

          }
          dd.content.push(layers_description)

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

        }
      }




      this.doc = pdfMake.createPdf(dd);

    }
  },
  computed: {
    assessments_and_industries_tree: function () {
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
            "industry":  industry,
            "id": id,
            "assessment name": assessment.name,
            "name": industry.name
          })
          id++
        })
        items.push(obj)
      })


      return items
    }
  },

}

</script>

<style scoped>

</style>