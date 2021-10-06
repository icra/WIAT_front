<template>
  <div class="outer">
    <h1>Report</h1>
    <div v-if="is_there_any_industry_created">
      <br>
      <v-row>
        <v-col>
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
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <p>Select the layers to include in the report.</p>
          <v-treeview
              :items="layer_tree"
              dense
              hoverable
              selectable
              selection-type="leaf"
              return-object
              v-model="selected_layers"
              open-on-click
              color="#1C195B"
              selected-color="#1C195B"
          >
          </v-treeview>
        </v-col>

      </v-row>

      <v-row>
        <v-col cols="3">
          <v-select
              v-model="include_future"
              :items="yes_no"
              filled
              label="Include 2030 BAU values in the report"
          ></v-select>
        </v-col>
        <v-col cols="3">
          <v-select
              v-model="units_model"
              :items="bod_cod"
              filled
              label="Select units"
          ></v-select>
        </v-col>
        <v-col cols="3">
          <v-select
              v-model="period_model"
              :items="daily_annual_assessment"
              filled
              label="Time period to express the results"
          ></v-select>
        </v-col>


      </v-row>

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

      <!--
      <template>
        <v-tabs v-model="tab">
          <v-tab
              v-for="assessment_name in assessment_names"
              :key="assessment_name"
          >
            {{assessment_name}}
          </v-tab>

        </v-tabs>
        <v-tabs-items v-model="tab">
          <v-tab-item
              v-for="assessment_name in assessment_names"
              :key="assessment_name"
          >
            <br>
            <v-card flat style="background-color: #0AA44A; margin-left: 10px">
              <b> Global Warming Potential: </b>
              <v-data-table
                  :headers="emissions_table.header"
                  :items="emissions_table.emissions"
                  class="elevation-1"
              ></v-data-table>

              <b> Layers information: </b>
              {{layers_table}}
              <v-data-table
                  :headers="layers_table"
                  :items="layers_table.value"
                  class="elevation-1"
              ></v-data-table>


            </v-card>
          </v-tab-item>
        </v-tabs-items>
      </template>
-->
    </div>
    <div v-else>
      <p>Please, create an industry first to make a PDF report.</p>
    </div>


    <!-- <canvas v-show="false" id="chart" width="300" height="150"> </canvas> -->



    <br>
  </div>
</template>

<script>

let _ = require('lodash');
import PDFJSViewer from "@/components/PDFJSViewer";
import pdfMake from 'pdfmake/build/pdfmake.js'
import Vue from "vue";
import {utils, industry_statistics, metrics} from "../utils"
import AsyncComputed from 'vue-async-computed'

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
      generating_pdf: false,
      global_layers: utils.format_layer_description(Vue.prototype.$layers_description),
      include_future: true,
      yes_no: [{text: "Yes", value: true},{text: "No", value: false}],
      units_model: "bod",
      bod_to_cod: 1,
      bod_cod: [{text: "BOD", value: "bod"},{text: "COD", value: "cod"}],
      period_model: "daily",
      daily_annual_assessment: [{text: "Daily", value: "daily"},{text: "Annual", value: "annual"}, {text: "Assessment period", value: "assessment"}],
      selected_layers: [], //layers included in the report
      tab: 0,

    }
  },
  watch: {

    selected_layers: async function () {
      if (this.selected_industries.length > 0) await this.generate_pdf()
    },

    selected_industries: async function () {
      await this.generate_pdf()
    },
    include_future: async function () {
      if (this.selected_industries.length > 0) await this.generate_pdf()
    },
    units_model: async function () {
      this.bod_to_cod = 1
      if(this.units_model === "cod") this.bod_to_cod = 1/2.4
      if (this.selected_industries.length > 0) await this.generate_pdf()
    },
    period_model: async function () {
      if (this.selected_industries.length > 0) await this.generate_pdf()
    },


  },
  methods: {

    add_identifier: function (category, id){
      let _this = this
      category.id = id
      id++

      if(category.hasOwnProperty("children")){
        category.children.forEach(subcategory => {
          id = _this.add_identifier(subcategory, id)
        })

      }

      return id
    },

    async layers_table_pdf(dd, industries, assessment_days){

      let selected_layers_formatted = this.selected_layers.map(function (layer) {
        return [layer.name, layer.layer]
      })

      if (selected_layers_formatted.length > 0) { //Layer values on industry

        dd.content.push({
          text: "Layers information\n\n",
          style: 'subheader'
        })

        let body = [{text: 'Layer', style: 'tableHeader'}]
        for(const industryAux of industries) {
          let industry = industryAux.industry
          body.push({text: industry.name, style: 'tableHeader'})
        }
        body.push({
          text: "Units",
          style: 'tableHeader'
        })

        let layers_description = {
          table: {
            body: [body]
          }
        }

        for (let [layer_name, info] of selected_layers_formatted) {
          let current_layer = [layer_name]
          let future_layer = [layer_name+ " (BAU 2030)"]


          for(const industryAux of industries) {
            let industry = industryAux.industry
            let lat = industry.location.lat
            let lng = industry.location.lng

            //Baseline
            let baseline_data = await info.layers.baseline.annual.layer["data_on_point"](lat, lng)
            current_layer.push(baseline_data.toExponential(3))
            //Future
            if (info.future && this.include_future) {
              let future_data = await info.layers.future.layer["data_on_point"](lat, lng)
              future_layer.push(future_data.toExponential(3))
            }
          }

          current_layer.push(info.layers.baseline.annual.layer["unit"]())
          layers_description.table.body.push(current_layer)

          if(info.future && this.include_future){
            future_layer.push(info.layers.baseline.annual.layer["unit"]())
            layers_description.table.body.push(future_layer)

          }
        }

        dd.content.push(layers_description)

      }

    },
    emissions_table_pdf(dd, industries, assessment_days) {

      let days_factor = 1
      if(this.period_model === "annual") days_factor = 365
      else if(this.period_model === "assessment") days_factor = assessment_days

      dd.content.push({
        text: "Global Warming Potential\n\n",
        style: 'subheader'
      })

      let body = [{}]
      for (const industryAux of industries) {
        let industry = industryAux.industry
        body.push({
          text: industry.name,
          style: 'tableHeader'
        })
      }
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
      let total_emissions = ["Total emissions"]


      for (const industryAux of industries) {
        let total = 0
        let industry = industryAux.industry
        let emissions = industry_statistics.emissions_and_descriptions(industry)
        if(Number.isFinite(emissions["wwt_KPI_GHG_elec"])){
          let value = days_factor*emissions["wwt_KPI_GHG_elec"]
          elec.push(value.toExponential(3))
          total += value
        }else{
          elec.push("-")
        }
        if(Number.isFinite(emissions["wwt_KPI_GHG_fuel"])){
          let value = days_factor*emissions["wwt_KPI_GHG_fuel"]
          fuel.push((value).toExponential(3))
          total += value
        }else{
          fuel.push("-")
        }
        if(Number.isFinite(emissions["wwt_KPI_GHG_tre"])){
          let value = days_factor*emissions["wwt_KPI_GHG_tre"]
          tre.push((value).toExponential(3))
          total += value
        }else{
          tre.push("-")
        }
        if(Number.isFinite(emissions["wwt_KPI_GHG_biog"])){
          let value = days_factor*emissions["wwt_KPI_GHG_biog"]
          biog.push((value).toExponential(3))
          total += value
        }else{
          biog.push("-")
        }
        if(Number.isFinite(emissions["wwt_KPI_GHG_slu"])){
          let value = days_factor*emissions["wwt_KPI_GHG_slu"]
          slu.push((value).toExponential(3))
          total += value
        }else{
          slu.push("-")
        }
        if(Number.isFinite(emissions["wwt_KPI_GHG_reus_trck"])){
          let value = days_factor*emissions["wwt_KPI_GHG_reus_trck"]
          reus.push((value).toExponential(3))
          total += value
        }else{
          reus.push("-")
        }
        if(Number.isFinite(emissions["wwt_KPI_GHG_disc"])){
          let value = days_factor*emissions["wwt_KPI_GHG_disc"]
          disc.push((value).toExponential(3))
          total += value
        }else{
          disc.push("-")
        }

        total_emissions.push(total.toExponential(3))
      }

      elec.push("kgCO2eq")
      fuel.push("kgCO2eq")
      tre.push("kgCO2eq")
      biog.push("kgCO2eq")
      slu.push("kgCO2eq")
      reus.push("kgCO2eq")
      disc.push("kgCO2eq")
      total_emissions.push("kgCO2eq")

      let emissions_table = {
        table: {
          body: [
            body, elec, fuel, tre, biog, slu, reus, disc, total_emissions
          ]
        }
      }

      dd.content.push(emissions_table)

    },
    async quality_quantity_indicators(dd, industries, assessment_days) {

      let days_factor = 1
      if(this.period_model === "annual") days_factor = 365
      else if(this.period_model === "assessment") days_factor = assessment_days


      dd.content.push({
        text: "Quality and quantity indicators\n\n",
        style: "subheader"
      })

      let body = [{}]
      for (const industryAux of industries) {
        let industry = industryAux.industry
        body.push({
          text: industry.name,
          style: 'tableHeader'
        })
      }
      body.push({
        text: "Units",
        style: 'tableHeader'
      })

      let tn = ["TN load discharged to the water body"]
      let bod = [""]
      let dilution_factor_row = ["Dilution factor"]
      let recycled_factor = ["Recycled water factor"]
      let dbo_in_river = [""]
      let dichloroethane = ["1,2-Dichloroethane load discharged to the water body"]
      let cadmium = ["Cadmium load discharged to the water body"]
      let hexachlorobenzene = ["Hexachlorobenzene load discharged to the water body"]
      let mercury = ["Mercury load discharged to the water body"]
      let lead = ["Lead load discharged to the water body"]
      let nickel = ["Nickel load discharged to the water body"]
      let chloroalkanes = ["Chloroalkanes load discharged to the water body"]
      let hexaclorobutadie = ["Hexachlorobutadiene load discharged to the water body"]
      let nonylphenols = ["Nonylphenols load discharged to the water body"]
      let tetrachloroethene = ["Tetrachloroethene load discharged to the water body"]
      let trichloroethylene = ["Trichloroethylene load discharged to the water body"]


      if(this.units_model === "bod") {
        bod = ["BOD load discharged to the water body"]
        dbo_in_river = ["BOD concentration in water body after discharging waste water"]
      }
      else {
        bod = ["COD load discharged to the water body"]
        dbo_in_river = ["COD concentration in water body after discharging waste water"]
      }

      for (const industryAux of industries) {
        let industry = industryAux.industry

        if(Number.isFinite(metrics.tn_effl(industry))){
          tn.push((days_factor*metrics.tn_effl(industry)).toExponential(3))
        }else{
          tn.push("-")
        }

        let dilution_factor_value = await metrics.dilution_factor(this.global_layers, industry, assessment_days)
        if(Number.isFinite(dilution_factor_value)){
          dilution_factor_row.push(dilution_factor_value.toExponential(3))
        }else{
          dilution_factor_row.push("-")
        }

        if(Number.isFinite(metrics.recycled_water_factor(industry))){
          recycled_factor.push(metrics.recycled_water_factor(industry).toExponential(3))
        }else{
          recycled_factor.push("-")
        }

        if(Number.isFinite(metrics.bod_effl(industry))){
          bod.push((days_factor*metrics.bod_effl(industry)*this.bod_to_cod).toExponential(3))
        }else{
          bod.push("-")
        }

        let dbo_value = await metrics.dbo_in_river(this.global_layers, industry, assessment_days)


        if(Number.isFinite(metrics.dichloroethane_effl(industry))){
          dichloroethane.push((days_factor*metrics.dichloroethane_effl(industry)).toExponential(3))
        }else{
          dichloroethane.push("-")
        }

        if(Number.isFinite(metrics.cadmium_effl(industry))){
          cadmium.push((days_factor*metrics.cadmium_effl(industry)).toExponential(3))
        }else{
          cadmium.push("-")
        }

        if(Number.isFinite(metrics.hexaclorobenzene_effl(industry))){
          hexachlorobenzene.push((days_factor*metrics.hexaclorobenzene_effl(industry)).toExponential(3))
        }else{
          hexachlorobenzene.push("-")
        }

        if(Number.isFinite(metrics.mercury_effl(industry))){
          mercury.push((days_factor*metrics.mercury_effl(industry)).toExponential(3))
        }else{
          mercury.push("-")
        }

        if(Number.isFinite(metrics.lead_effl(industry))){
          lead.push((days_factor*metrics.lead_effl(industry)).toExponential(3))
        }else{
          lead.push("-")
        }
        if(Number.isFinite(metrics.nickel_effl(industry))){
          nickel.push((days_factor*metrics.nickel_effl(industry)).toExponential(3))
        }else{
          nickel.push("-")
        }
        if(Number.isFinite(metrics.chloroalkanes_effl(industry))){
          chloroalkanes.push((days_factor*metrics.chloroalkanes_effl(industry)).toExponential(3))
        }else{
          chloroalkanes.push("-")
        }
        if(Number.isFinite(metrics.hexaclorobutadie_effl(industry))){
          hexaclorobutadie.push((days_factor*metrics.hexaclorobutadie_effl(industry)).toExponential(3))
        }else{
          hexaclorobutadie.push("-")
        }
        if(Number.isFinite(metrics.nonylphenols_effl(industry))){
          nonylphenols.push((days_factor*metrics.nonylphenols_effl(industry)).toExponential(3))
        }else{
          nonylphenols.push("-")
        }
        if(Number.isFinite(metrics.tetrachloroethene_effl(industry))){
          tetrachloroethene.push((days_factor*metrics.tetrachloroethene_effl(industry)).toExponential(3))
        }else{
          tetrachloroethene.push("-")
        }
        if(Number.isFinite(metrics.tricloroetile_effl(industry))){
          trichloroethylene.push((days_factor*metrics.tricloroetile_effl(industry)).toExponential(3))
        }else{
          trichloroethylene.push("-")
        }







        /*if(Number.isFinite(dbo_value)){
          dbo_in_river.push(dbo_value.toExponential(3)*this.bod_to_cod)
        }else{
          dbo_in_river.push("-")
        }*/

      }

      bod.push("g")
      tn.push("g")
      dilution_factor_row.push("-")
      recycled_factor.push("-")
      dbo_in_river.push("g/m3")
      dichloroethane.push("g")
      cadmium.push("g")
      hexachlorobenzene.push("g")
      mercury.push("g")
      lead.push("g")
      nickel.push("g")
      chloroalkanes.push("g")
      hexaclorobutadie.push("g")
      nonylphenols.push("g")
      tetrachloroethene.push("g")
      trichloroethylene.push("g")


      let emissions_table = {
        table: {
          body: [
            body, bod, tn, dichloroethane, cadmium, hexachlorobenzene, mercury, lead, nickel, chloroalkanes, hexaclorobutadie, nonylphenols, tetrachloroethene, trichloroethylene, dilution_factor_row, recycled_factor
          ]

        }
      }

      dd.content.push(emissions_table)

    },
    async generate_pdf(){
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
            fontSize: 12,
            bold: true
          },
          tableHeader: {
            bold: true,
            fontSize: 12,
            color: 'black'
          },
          bold_text: {
            bold: true
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

        dd.content.push({
          text: [
            {
              text:"Assessment period: ",
              bold: true
            },
            assessment.assessment_period_start + " to "+ assessment.assessment_period_end + " ("+ utils.daysBetween(assessment.assessment_period_start, assessment.assessment_period_end) +" days)\n\n"
          ]
        })

        let assessment_days = utils.daysBetween(assessment.assessment_period_start, assessment.assessment_period_end)


        this.emissions_table_pdf(dd, industries, assessment_days)
        dd.content.push("\n\n")
        await this.quality_quantity_indicators(dd, industries, assessment_days)
        dd.content.push("\n\n")
        await this.layers_table_pdf(dd, industries, assessment_days)



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

              dd.content.push({
                text: "GHG emissions\n\n",
                style: 'subheader'
              })
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

  asyncComputed: {
    async layers_table(){

      let selected_layers_formatted = this.selected_layers.map(function (layer) {
        return [layer.name, layer.layer]
      })

      const groupedByAssessments = _.groupBy(this.selected_industries, function(n) {
        return n.assessment.name;
      });

      let _this = this

      if(_this.tab !== undefined && _this.tab !== null){

        let assessment = Object.values(groupedByAssessments)[_this.tab][0].assessment
        let assessment_days = utils.daysBetween(assessment.assessment_period_start, assessment.assessment_period_end)

        let days_factor = 1
        if(this.period_model === "annual") days_factor = 365
        else if(this.period_model === "assessment") days_factor = assessment_days

        let layer_table = {
          header: [{text: "Layer", value: "layer", sortable: false}],
          value: []
        }

        for (let [layer_name, info] of selected_layers_formatted) {
          let current_layer = {layer: layer_name}
          let future_layer = [layer_name + " (BAU 2030)"]
          for (const industryAux of Object.values(groupedByAssessments)[_this.tab]) {
            let industry = industryAux.industry
            let lat = industry.location.lat
            let lng = industry.location.lng

            layer_table.header.push({text: industry.name, value: industry.name})

            //Baseline
            let baseline_data = await info.layers.baseline.annual.layer["data_on_point"](lat, lng)
            current_layer[industry.name] = baseline_data.toExponential(3)
          }
          layer_table.value.push(current_layer)
          console.log(layer_table)
        }
        return layer_table
      }
      else return {header: [], value: []}


    },

  },
  computed: {
    emissions_table() {

      let _this = this

      const groupedByAssessments = _.groupBy(this.selected_industries, function(n) {
        return n.assessment.name;
      });

      if(_this.tab !== undefined && _this.tab !== null){

        let assessment = Object.values(groupedByAssessments)[_this.tab][0].assessment
        let assessment_days = utils.daysBetween(assessment.assessment_period_start, assessment.assessment_period_end)

        let days_factor = 1
        if(this.period_model === "annual") days_factor = 365
        else if(this.period_model === "assessment") days_factor = assessment_days

        let emission_table = {
          header: [{text: "", value: "value", sortable: false}],
          emissions: []
        }

        let elec = {value: "Indirect emissions from electricity consumption", unit: "kgCO2eq"}
        let fuel = {value: "Emissions from fuel engines", unit: "kgCO2eq"}
        let tre = {value: "Emissions from treatment", unit: "kgCO2eq"}
        let biog = {value: "Emissions from biogas", unit: "kgCO2eq"}
        let slu = {value: "Emissions from sludge management", unit: "kgCO2eq"}
        let reus = {value: "Emissions from water reuse transport", unit: "kgCO2eq"}
        let disc = {value: "Emissions from water discharged", unit: "kgCO2eq"}
        let total = {value: "Total emissions", unit: "kgCO2eq"}


        for (const industryAux of Object.values(groupedByAssessments)[_this.tab]) {
          let industry = industryAux.industry
          let total_emission = 0
          emission_table.header.push({
            text: industry.name, value: industry.name,
          })
          let emissions = industry_statistics.emissions_and_descriptions(industry)
          if(Number.isFinite(emissions["wwt_KPI_GHG_elec"])){
            let value = (days_factor*emissions["wwt_KPI_GHG_elec"])
            elec[industry.name] = value.toExponential(3)
            total_emission += value
          }else{
            elec[industry.name] = ("-")
          }
          if(Number.isFinite(emissions["wwt_KPI_GHG_fuel"])){
            let value = emissions["wwt_KPI_GHG_fuel"]*days_factor
            fuel[industry.name] = value.toExponential(3)
            total_emission += value

          }else{
            fuel[industry.name] = ("-")
          }
          if(Number.isFinite(emissions["wwt_KPI_GHG_tre"])){
            let value = days_factor*emissions["wwt_KPI_GHG_tre"]
            tre[industry.name] = value.toExponential(3)
            total_emission += value

          }else{
            tre[industry.name] = ("-")
          }
          if(Number.isFinite(emissions["wwt_KPI_GHG_biog"])){
            let value = days_factor*emissions["wwt_KPI_GHG_biog"]
            biog[industry.name] = value.toExponential(3)
            total_emission += value
          }else{
            biog[industry.name] = ("-")
          }
          if(Number.isFinite(emissions["wwt_KPI_GHG_slu"])){
            let value = days_factor*emissions["wwt_KPI_GHG_slu"]
            slu[industry.name] = value.toExponential(3)
            total_emission += value

          }else{
            slu[industry.name] = ("-")
          }
          if(Number.isFinite(emissions["wwt_KPI_GHG_reus_trck"])){
            let value = days_factor*emissions["wwt_KPI_GHG_reus_trck"]
            reus[industry.name] = value.toExponential(3)
            total_emission += value
          }else{
            reus[industry.name] = ("-")
          }
          if(Number.isFinite(emissions["wwt_KPI_GHG_disc"])){
            let value = days_factor*emissions["wwt_KPI_GHG_disc"]
            disc[industry.name] = value.toExponential(3)
            total_emission += value
          }else{
            disc[industry.name] = ("-")
          }

          total[industry.name] = total_emission.toExponential(3)

        }


        emission_table.header.push({text: "Unit", value: "unit", sortable: false,})


        emission_table.emissions.push(elec)
        emission_table.emissions.push(fuel)
        emission_table.emissions.push(tre)
        emission_table.emissions.push(biog)
        emission_table.emissions.push(slu)
        emission_table.emissions.push(reus)
        emission_table.emissions.push(disc)
        emission_table.emissions.push(total)


        return emission_table
      }
      else return {header: [], emissions: []}





    },

    assessment_names: function() {
      const groupedByAssessments = _.groupBy(this.selected_industries, function(n) {
        return n.assessment.name;
      });
      return Object.entries(groupedByAssessments).map(assessment => assessment[0])
    },

    layer_tree: function () {
      let _this = this
      let id = 1
      console.log(this.layers)
      this.layers.forEach(category => {
        id = _this.add_identifier(category, id)  //id has the new id to add
      })

      return this.layers
    },


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
  }

  }

</script>

<style scoped>
.center {
  margin: auto;

  padding: 10px;
}
</style>