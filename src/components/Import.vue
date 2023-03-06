<template>
  <div class="outer">

    <h1 style="color: #b62373">Load and save file</h1>
    <div style="display: flex">
      <div class= "load_and_save" style="width: 65%">
        <div style="padding-top: 15px; padding-left: 16px">
          <b>Import session</b>
        </div>
        <v-row>
          <v-col cols = "5">
            <v-container fluid >
              <v-radio-group
                  v-model="option_for_import"
                  mandatory
              >
                <v-radio
                    value="replace"
                    color="#1C195B"
                >
                  <template v-slot:label>
                    <span>Replace</span>
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon
                            color=#1C195B
                            v-bind="attrs"
                            v-on="on"
                            size="20px"
                        >
                          mdi-information-outline
                        </v-icon>
                      </template>
                      <span>Replace current assessments with imported ones</span>
                    </v-tooltip>
                  </template>
                </v-radio>
                <v-radio
                    value="append"
                    color="#1C195B"
                >
                  <template v-slot:label>
                    <span>Append</span>
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon
                            color=#1C195B
                            v-bind="attrs"
                            v-on="on"
                            size="20px"
                        >
                          mdi-information-outline
                        </v-icon>
                      </template>
                      <span>Add new industries and assessments to the current assessments</span>
                    </v-tooltip>
                  </template>

                </v-radio>
              </v-radio-group>
            </v-container>
          </v-col>
          <v-col class="flex" cols = 6>
            <v-file-input
                label="File input"
                v-model="imported_file"
                @change="onUpload"
                @click:clear="onClearJson()"
            ></v-file-input>
          </v-col>
        </v-row>

      </div>
      <div style="width: 4%">

      </div>
      <div class= "load_and_save" style="width: 48%">
        <div style="padding-top: 15px; padding-left: 16px">
          <b>Export session</b>
        </div>

        <v-row style="padding-left: 17px; padding-top: 25px">
          <v-col cols >
            <v-text-field
                label="File name"
                required
                v-model="export_file_name"
            >
            </v-text-field>
          </v-col>

          <v-col>
            <div style="height: 100%; display: flex; align-items: center; justify-content: center;">


              <v-btn
                  @click="download_json"
                  small
                  tile
                  class="ml-8 mr-8"
                  color="#b62373"
              >
                SAVE SESSION
                <v-icon right color="white">
                  mdi-cloud-download
                </v-icon>
              </v-btn>
            </div>


          </v-col>

        </v-row>
      </div>
    </div>

    <div style="padding-top: 30px">
      <h1 style="color: #b62373">Load from Excel file
        <v-tooltip bottom max-width="500px">
          <template v-slot:activator="{ on, attrs }">
            <v-icon
                color=#1C195B
                v-bind="attrs"
                v-on="on"
                size="25px"
            >
              mdi-information-outline
            </v-icon>
          </template>
          <span>In step 1, select "Industry Locations" to create new assessments and upload the locations of the new industries, with their suppliers. Note that if the industry you are adding already exists, the old one will be overwritten.
            On the other hand, if you want to add information (advanced entries) to an already created industry, select "Advanced entries" (in this case, the already existing industry will be overwritten).

          </span>
        </v-tooltip>


      </h1>


    </div>
    <div style="padding: 40px 30px 0px 20px" class="load_and_save">
      <v-row>
        <v-col cols="4">
          <v-row>
            <v-col cols="1">
              <b>1)</b>
            </v-col>
            <v-col>
              <v-select
                  :items="items_excel_type"
                  v-model="excel_type"
                  label="Excel type"
                  dense
                  style="margin-top: -3px"
                  item-text="value"
                  item-value="key"
              ></v-select>
            </v-col>
          </v-row>
        </v-col>

        <v-col cols="4">
          <v-row >
            <v-col cols="1">
              <b>2)</b>
            </v-col>
            <v-col>
              <a :href='excel_type === "industry_questionnaire" ? "/wiat_template.xlsx" : "/wiat_locations.xlsx"' download >
                <v-btn
                    small
                    tile
                    color="#b62373"
                    style="margin-top: -3px"
                >
                  DOWNLOAD TEMPLATE
                  <v-icon right color="white">
                    mdi-cloud-download
                  </v-icon>
                </v-btn>
              </a>
            </v-col>
          </v-row>
        </v-col>

        <v-col cols="4">
          <v-row>
            <v-col cols="1">
              <b>3)</b>
            </v-col>
            <v-col>
              Fill out excel file
            </v-col>
          </v-row>
        </v-col>

      </v-row>

      <v-row>

        <v-col cols="4">
          <v-row>
            <v-col cols="1">
              <b>4)</b>
            </v-col>
            <v-col>
              <v-file-input
                  label="Import template"
                  v-model="imported_file_excel"
                  @change="onUploadExcel"
                  style="margin-top: -17px; margin-left: -10px"
              ></v-file-input>

            </v-col>
          </v-row>
        </v-col>
      </v-row>

    </div>

    <div style="padding-top: 30px">
      <h1 style="color: #b62373; display: inline ">Upload custom risk thresholds
        <v-tooltip bottom max-width="500px">
          <template v-slot:activator="{ on, attrs }">
            <v-icon
                color=#1C195B
                v-bind="attrs"
                v-on="on"
                size="25px"
            >
              mdi-information-outline
            </v-icon>
          </template>
          <span>WIAT has, for some impact indicators, a default ranking, but you can upload custom values (e.g. if the GHG emission is less than X, the impact is low, if it is greater than X, the impact is high).</span>
        </v-tooltip>

      </h1>

    </div>
    <div style="padding: 20px 30px 0px 20px; margin-top: 10px" class="load_and_save">
      <v-row>
        <v-col cols="5"> <b>1)</b>
          <a class="download_link" href="/risk_threshold.xlsx" download >
            <v-btn
                small
                tile
                color="#b62373"
                class="ml-8 mr-8"
            >
              DOWNLOAD TEMPLATE
              <v-icon right>
                mdi-cloud-download
              </v-icon>
            </v-btn>
          </a>


        </v-col>
        <v-col cols="3">
          <b>2)</b> Fill out Excel file
        </v-col>
        <v-col>
          <div style="display: flex;">
            <b>3)</b>
            <v-file-input
                label="Import template"
                style="width: 100px; padding-top: 0px; margin-top: -3px"
                v-model="imported_file_excel_risk"
                @change="onUploadExcelRisk"

            ></v-file-input>


          </div>


        </v-col>
      </v-row>
    </div>


    <v-snackbar
        v-model="snackbar_imported_file"
    >
      {{ snackbar_text }}

      <template v-slot:action="{ attrs }">
        <v-btn
            color="pink"
            text
            v-bind="attrs"
            @click="snackbar_imported_file = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>

import {
  Assessment,
  Industry,
} from "../ecam_backend";

import * as Excel from "exceljs";
import * as moment from 'moment'
import standard_industries_classification from "../standard_industrial_classification"
import {utils} from "../utils"
import risk_thereshold from "@/risk_categories";
import Conversion_factors from "@/conversion_factors";
import {level_of_certainty} from "@/level_of_certainty";
import {utils_excel} from "@/excel";
let fs = require('fs');

export default {
  name: "import_assessments",
  components: {

  },
  data() {
    return {
      created_assessments: this.$assessments,  //Created assessments
      imported_file: null, //Imported file
      option_for_import: 'replace',  //Model for selecting option for importing
      export_file_name: 'Untitled file',
      location_markers: this.$location_markers,
      snackbar_imported_file: false,
      snackbar_text: "",
      imported_file_excel: null,
      imported_file_excel_risk: null,
      risk_categories: risk_thereshold,
      //current_thresholds: [[], [0.2, 1, 2], [20, 100, 200], [0.5, 1, 2], [], [], [2, 10, 100], [2, 5, 50]],
      keys_from_older_versions: [
          "ind_cod_infl", "ind_tn_infl", "ind_tp_infl",
        "ind_cod_effl", "ind_tn_effl", "ind_tp_effl", "ind_diclo_effl", "ind_cadmium_effl", "ind_hexaclorobenzene_effl", "ind_mercury_effl", "ind_plomo_effl", "ind_niquel_effl", "ind_chloro_effl", "ind_hexaclorobutadie_effl", "ind_nonilfenols_effl", "ind_tetracloroetile_effl", "ind_tricloroetile_effl",
        "wwt_cod_infl_wwtp", "wwt_tn_infl_wwtp", "wwt_tp_infl_wwtp", "wwt_diclo_infl_wwtp", "wwt_cadmium_infl_wwtp", "wwt_hexaclorobenzene_infl_wwtp", "wwt_mercury_infl_wwtp", "wwt_plomo_infl_wwtp", "wwt_niquel_infl_wwtp", "wwt_chloro_infl_wwtp", "wwt_hexaclorobutadie_infl_wwtp", "wwt_nonilfenols_infl_wwtp", "wwt_tetracloroetile_infl_wwtp", "wwt_tricloroetile_infl_wwtp",
        "wwt_cod_infl_ind", "wwt_tn_infl_ind", "wwt_tp_infl_ind", "wwt_diclo_infl_ind", "wwt_cadmium_infl_ind", "wwt_hexaclorobenzene_infl_ind", "wwt_mercury_infl_ind", "wwt_plomo_infl_ind", "wwt_niquel_infl_ind", "wwt_chloro_infl_ind", "wwt_hexaclorobutadie_infl_ind", "wwt_nonilfenols_infl_ind", "wwt_tetracloroetile_infl_ind", "wwt_tricloroetile_infl_ind",
        "wwt_cod_effl", "wwt_tn_effl", "wwt_tp_effl", "wwt_diclo_effl", "wwt_cadmium_effl", "wwt_hexaclorobenzene_effl", "wwt_mercury_effl", "wwt_plomo_effl", "wwt_niquel_effl", "wwt_chloro_effl", "wwt_hexaclorobutadie_effl", "wwt_nonilfenols_effl", "wwt_tetracloroetile_effl", "wwt_tricloroetile_effl",
      ],
      pollutants_from_older_version: utils.pollutants_from_older_version,
      items_excel_type: [{value:'Industry locations', key: 'industry_locations'}, {value: 'Advanced inputs', key: "industry_questionnaire"}],
      excel_type : 'industry_locations'
    }

  },

  methods: {

    onClearJson(){
      this.imported_file = null
    },

    //if industry_input[i] is float, return it. Otherwise, return null if mandatory, else return 0
    parse_i(industry_input, i, mandatory = false){
      if(mandatory) return !isNaN(industry_input[i]) ? parseFloat(industry_input[i]) : null
      else return !isNaN(industry_input[i]) ? parseFloat(industry_input[i]) : 0

    },

    //Parse row of risk threshold excel
    parseRiskThereshold(risk, lowString, mediumString, highString){

      let blue = ['#529fee', "Low impact"]
      let red = ['red', "Very high impact"]
      let orange = ['orange', "High impact"]
      let yellow = ['yellow', "Medium impact"]

      let low = 0
      let medium = 0
      let high = 0

      let null_function = function(){
        return null
      }

      try {
        low = parseFloat(lowString)
        medium = parseFloat(mediumString)
        high = parseFloat(highString)

        if(isNaN(low) || isNaN(medium) || isNaN(high)){
          return null
        }
      } catch (error){
        return null
      }


      let increasing_better = function(){   //the higher the value, the lower the impact

        let arr = [high, medium, low]
        if(!utils.equals(arr, utils.highestToLowest(arr))){
          return null_function
        }
        return function(value){
          if(value < 0) return null
          else if (value <= low) return red
          else if (value <= medium) return orange
          else if (value <= high) return yellow
          else if (value > high) return blue
          return null
        }
      }

      let increasing_worse = function(){
        let arr = [low, medium, high]
        if(!utils.equals(arr, utils.lowestToHighest(arr))){
          return null_function
        }
        return function(value){   //the higher the value, the higher the impact
          if(value < 0 ) return  null
          else if (value <= low) return blue
          else if (value <= medium) return yellow
          else if (value <= high) return orange
          else if (value > high) return red
          return null
        }
      }

      try{
        risk = risk.richText[0].text

        if(risk === "GHG emissions from wastewater treatment"){
          this.risk_categories["global_warming"] = increasing_worse()
          //this.current_thresholds[0] = [low, medium, high]
        }else if(risk === "Increase in toxic units in the receiving water body after discharge"){
          this.risk_categories["delta_ecotoxicity"] = increasing_worse()
          //this.current_thresholds[1] = [low, medium, high]
        }else if(risk === "Increase of the concentration of the pollutants in the receiving water body after discharge (with respect to EQS)"){
          this.risk_categories["delta_eqs"] = increasing_worse()
          //this.current_thresholds[2] = [low, medium, high]
        }else if(risk === "Eutrophication potential"){
          this.risk_categories["eutrophication"] = increasing_worse()
          //this.current_thresholds[3] = [low, medium, high]
        }else if(risk === "Increase in temperature in the receiving water body due to industry discharge"){
          console.log('aaa')
          this.risk_categories["delta_temperature"] = increasing_worse()
          //this.current_thresholds[3] = [low, medium, high]
        }


        else if(risk === "Dilution factor"){
          this.risk_categories["dilution_factor"] = increasing_better()
          //this.current_thresholds[6] = [low, medium, high]
        }else if(risk === "Consumption available ratio"){
          this.risk_categories["water_stress_ratio"] = increasing_worse()
          //this.current_thresholds[7] = [low, medium, high]

        }

        this.snackbar_text = "FILE IMPORTED CORRECTLY"
        this.snackbar_imported_file = true

      }catch (error){
        this.snackbar_text = "ERROR IMPORTING RISK THRESHOLDS"
        this.snackbar_imported_file = true

      }

    },

    //Uploaded risk threshold excel
    onUploadExcelRisk(){

      let _this = this
      if(this.imported_file_excel_risk != null){
        const wb = new Excel.Workbook();
        const reader = new FileReader()

        reader.readAsArrayBuffer(this.imported_file_excel_risk)
        reader.onload = () => {
          const buffer = reader.result;
          wb.xlsx.load(buffer).then(workbook => {

            let sheet = workbook.getWorksheet(1)
            sheet.eachRow((row, rowIndex) => {
              if (rowIndex > 3) {
                let [_, risk, low, medium, high] = row.values
                _this.parseRiskThereshold(risk, low, medium, high)

              }
            })
          })
        }
      }
    },

    //Uploaded excel session
    async onUploadExcel(){

      if (this.excel_type === "industry_locations") {
        utils_excel.read_industres_location(this.imported_file_excel).then((text) => {
          this.snackbar_text = text
          this.snackbar_imported_file = true
        })
      } else {
        utils_excel.read_new_industry(this.imported_file_excel).then((text) => {
          this.snackbar_text = text
          this.snackbar_imported_file = true
        })
      }
    },

    //new_industry is an industry object, industry is read form json file
    copy_level_of_certainty(industry, new_industry){
      //Imported from WIAT 1.0, level_of_certainty was not implemented
      if (new_industry['level_of_certainty'] == 0){
        new_industry["level_of_certainty"] = level_of_certainty.set_level_of_certainty(new_industry, 1)
        if(new_industry.has_onsite_wwtp == 1){
          new_industry['onsite_wwtp']["level_of_certainty"] = level_of_certainty.set_level_of_certainty(new_industry, 2)
        }else{
          new_industry['onsite_wwtp']["level_of_certainty"] = level_of_certainty.set_level_of_certainty(new_industry, 2, true)
        }
        if(new_industry.has_direct_discharge == 1){
          new_industry['direct_discharge']["level_of_certainty"] = level_of_certainty.set_level_of_certainty(new_industry, 3)
        }else{
          new_industry['direct_discharge']["level_of_certainty"] = level_of_certainty.set_level_of_certainty(new_industry, 3, true)
        }
        if(new_industry.has_offsite_wwtp == 1){
          new_industry['offsite_wwtp']["level_of_certainty"] = level_of_certainty.set_level_of_certainty(new_industry, 4)
        }else{
          new_industry['offsite_wwtp']["level_of_certainty"] = level_of_certainty.set_level_of_certainty(new_industry, 4, true)
        }
      }
      else {
        new_industry["level_of_certainty"] = level_of_certainty.set_level_of_certainty(new_industry, 1)
        new_industry['onsite_wwtp']["level_of_certainty"] = level_of_certainty.set_level_of_certainty(new_industry, 2)
        new_industry['direct_discharge']["level_of_certainty"] = level_of_certainty.set_level_of_certainty(new_industry, 3)
        new_industry['offsite_wwtp']["level_of_certainty"] = level_of_certainty.set_level_of_certainty(new_industry, 4)

        //Some values of level of levels of certainty were not setted right, so we set them all by default and overwrite
        // the defaults with the ones that were setted

        for (let key in industry['level_of_certainty']){
          //check if value is primitive or object
          if (typeof industry['level_of_certainty'][key] == "object") {
            for (let key2 in industry['level_of_certainty'][key]) {
              new_industry['level_of_certainty'][key][key2] = industry['level_of_certainty'][key][key2]
            }
          }else{
            new_industry['level_of_certainty'][key] = industry['level_of_certainty'][key]
          }
        }

        let stages = []
        if (new_industry.has_onsite_wwtp == 1){
          stages.push('onsite_wwtp')
        }
        if (new_industry.has_direct_discharge == 1){
          stages.push('direct_discharge')
        }
        if (new_industry.has_offsite_wwtp == 1){
          stages.push('offsite_wwtp')
        }

        for (let stage of stages){
          for (let key in industry[stage]['level_of_certainty']){
            //check if value is primitive or object
            if (typeof industry[stage]['level_of_certainty'][key] == "object") {
              for (let key2 in industry[stage]['level_of_certainty'][key]) {
                new_industry[stage]['level_of_certainty'][key][key2] = industry[stage]['level_of_certainty'][key][key2]
              }
            }else{
              new_industry[stage]['level_of_certainty'][key] = industry[stage]['level_of_certainty'][key]
            }
          }
        }
      }

      return new_industry
    },

    set_pollutants(industry){
      //industry and wwtp must have all the pollutants selected (in case they were not stored correctly))
      let selected_pollutants = industry.pollutants_selected

      for(let pollutant of selected_pollutants){
        if (industry.ind_pollutants_effl[pollutant] == undefined){
          industry.ind_pollutants_effl[pollutant] = 0
        }
        if (industry.ind_pollutants_infl[pollutant] == undefined){
          industry.ind_pollutants_infl[pollutant] = 0
        }
      }

      return industry
    },

    //Make copy of industry (from json file to obj)
    copyIndustry(industry){
      let new_industry = new Industry()

      Object.keys(new_industry).forEach(key => {
        if (key != "onsite_wwtp" && key != "offsite_wwtp" && key!="direct_discharge"){
          if (industry[key] == undefined && key != "streamflow" && key != "water_stress"){

            if (key == "ind_pollutants_effl"){      //ind_pollutants_effl not in imported industry (created using WIAT 1.0)
                new_industry["ind_pollutants_effl"] = {
                  COD: industry["ind_cod_effl"],
                  TN: industry["ind_tn_effl"],
                  TP: industry["ind_tp_effl"],
                  "1,2-Dichloroethane": industry["ind_diclo_effl"],
                  Cadmium: industry["ind_cadmium_effl"],
                  Hexaclorobenzene: industry["ind_hexaclorobenzene_effl"],
                  Mercury: industry["ind_mercury_effl"],
                  Lead: industry["ind_plomo_effl"],
                  Nickel: industry["ind_niquel_effl"],
                  Chloroalkanes: industry["ind_chloro_effl"],
                  Hexachlorobutadiene: industry["ind_hexaclorobutadie_effl"],
                  Nonylphenols: industry["ind_nonilfenols_effl"],
                  Tetrachloroethene: industry["ind_tetracloroetile_effl"],
                  Trichloroethylene: industry["ind_tricloroetile_effl"],
                }
              }

            else if (key == "ind_pollutants_infl"){     //ind_pollutants_infl not in imported industry (created using WIAT 1.0)
              new_industry["ind_pollutants_infl"] = {
                "1,2-Dichloroethane": 0,
                Cadmium: 0,
                Hexaclorobenzene: 0,
                Mercury: 0,
                Lead: 0,
                Nickel: 0,
                Chloroalkanes: 0,
                Hexachlorobutadiene: 0,
                Nonylphenols: 0,
                Tetrachloroethene: 0,
                Trichloroethylene: 0

              }

              if (industry.hasOwnProperty("ind_cod_infl")){
                new_industry["ind_pollutants_infl"]["COD"] = industry["ind_cod_infl"]
              }else{
                new_industry["ind_pollutants_infl"]["COD"] = 0
              }
              if (industry.hasOwnProperty("ind_tn_infl")){
                new_industry["ind_pollutants_infl"]["TN"] = industry["ind_tn_infl"]
              }else{
                new_industry["ind_pollutants_infl"]["TN"] = 0
              }
              if (industry.hasOwnProperty("ind_tp_infl")){
                new_industry["ind_pollutants_infl"]["TP"] = industry["ind_tp_infl"]
              }else{
                new_industry["ind_pollutants_infl"]["TP"] = 0
              }
            }

            else if (key == "pollutants_selected"){
              new_industry["pollutants_selected"] = this.pollutants_from_older_version
            }

            else if (key == "product_produced_unit"){
              new_industry[key] = 'tonnes'
            }

            else {
              new_industry[key] = 0
            }

          } else {
            new_industry[key] = industry[key]
          }
        }

      })

      Object.keys(new_industry.onsite_wwtp).forEach(key => {
        if(key=="wwt_pollutants_infl_ind"){
          if ('wwt_pollutants_infl_ind' in industry.onsite_wwtp){
            new_industry.onsite_wwtp[key] = industry.onsite_wwtp[key]
          }else { //Adapt from WIAT 1.0 version
            new_industry.onsite_wwtp.wwt_pollutants_infl_ind = {
              COD: new_industry["ind_pollutants_effl"]["COD"],
              TN: new_industry["ind_pollutants_effl"]["TN"],
              TP: new_industry["ind_pollutants_effl"]["TP"],
              "1,2-Dichloroethane": new_industry["ind_pollutants_effl"]["1,2-Dichloroethane"],
              Cadmium: new_industry["ind_pollutants_effl"]["Cadmium"],
              Hexaclorobenzene: new_industry["ind_pollutants_effl"]["Hexaclorobenzene"],
              Mercury: new_industry["ind_pollutants_effl"]["Mercury"],
              Lead: new_industry["ind_pollutants_effl"]["Lead"],
              Nickel: new_industry["ind_pollutants_effl"]["Nickel"],
              Chloroalkanes: new_industry["ind_pollutants_effl"]["Chloroalkanes"],
              Hexachlorobutadiene: new_industry["ind_pollutants_effl"]["Hexachlorobutadiene"],
              Nonylphenols: new_industry["ind_pollutants_effl"]["Nonylphenols"],
              Tetrachloroethene: new_industry["ind_pollutants_effl"]["Tetrachloroethene"],
              Trichloroethylene: new_industry["ind_pollutants_effl"]["Trichloroethylene"]
            }
          }

        }
        else if(key=="wwt_pollutants_infl_wwtp") {                   //Adapt from WIAT 1.0 version
          if ('wwt_pollutants_infl_wwtp' in industry.onsite_wwtp){
            new_industry.onsite_wwtp[key] = industry.onsite_wwtp[key]
          }else { //Adapt from WIAT 1.0 version
            new_industry.onsite_wwtp.wwt_pollutants_infl_wwtp = {
              COD: 0,
              TN: 0,
              TP: 0,
              "1,2-Dichloroethane": 0,
              Cadmium: 0,
              Hexaclorobenzene: 0,
              Mercury: 0,
              Lead: 0,
              Nickel: 0,
              Chloroalkanes: 0,
              Hexachlorobutadiene: 0,
              Nonylphenols: 0,
              Tetrachloroethene: 0,
              Trichloroethylene: 0
            }

          }
        }
        else if(key=="wwt_pollutants_effl"){

          if ('wwt_pollutants_effl' in industry.onsite_wwtp){
            new_industry.onsite_wwtp[key] = industry.onsite_wwtp[key]
          }else{  //Adapt from WIAT 1.0 version
            new_industry.onsite_wwtp.wwt_pollutants_effl = {
              COD: industry.onsite_wwtp.wwt_cod_effl,
              TN: industry["onsite_wwtp"]["wwt_tn_effl"],
              TP: industry["onsite_wwtp"]["wwt_tp_effl"],
              "1,2-Dichloroethane": industry["onsite_wwtp"]["wwt_diclo_effl"],
              Cadmium: industry["onsite_wwtp"]["wwt_cadmium_effl"],
              Hexaclorobenzene: industry["onsite_wwtp"]["wwt_hexaclorobenzene_effl"],
              Mercury: industry["onsite_wwtp"]["wwt_mercury_effl"],
              Lead: industry["onsite_wwtp"]["wwt_plomo_effl"],
              Nickel: industry["onsite_wwtp"]["wwt_niquel_effl"],
              Chloroalkanes: industry["onsite_wwtp"]["wwt_chloro_effl"],
              Hexachlorobutadiene: industry["onsite_wwtp"]["wwt_hexaclorobutadie_effl"],
              Nonylphenols: industry["onsite_wwtp"]["wwt_nonilfenols_effl"],
              Tetrachloroethene: industry["onsite_wwtp"]["wwt_tetracloroetile_effl"],
              Trichloroethylene: industry["onsite_wwtp"]["wwt_tricloroetile_effl"]
            }
          }
        }
        else if(industry.onsite_wwtp[key] == undefined){
          if (key == "discharge_same_location_as_withdrawal"){
            new_industry.onsite_wwtp[key] = 1
          }else{
            new_industry.onsite_wwtp[key] = 0
          }
        }
        else{
          new_industry.onsite_wwtp[key] = industry.onsite_wwtp[key]
        }
      })

      Object.keys(new_industry.offsite_wwtp).forEach(key => {

        if(key=="wwt_pollutants_infl_ind"){

          if ('wwt_pollutants_infl_ind' in industry.offsite_wwtp){
            new_industry.offsite_wwtp[key] = industry.offsite_wwtp[key]
          }else {  //Adapt from WIAT 1.0 version
            new_industry.offsite_wwtp.wwt_pollutants_infl_ind = {
              COD: new_industry["ind_pollutants_effl"]["COD"],
              TN: new_industry["ind_pollutants_effl"]["TN"],
              TP: new_industry["ind_pollutants_effl"]["TP"],
              "1,2-Dichloroethane": new_industry["ind_pollutants_effl"]["1,2-Dichloroethane"],
              Cadmium: new_industry["ind_pollutants_effl"]["Cadmium"],
              Hexaclorobenzene: new_industry["ind_pollutants_effl"]["Hexaclorobenzene"],
              Mercury: new_industry["ind_pollutants_effl"]["Mercury"],
              Lead: new_industry["ind_pollutants_effl"]["Lead"],
              Nickel: new_industry["ind_pollutants_effl"]["Nickel"],
              Chloroalkanes: new_industry["ind_pollutants_effl"]["Chloroalkanes"],
              Hexachlorobutadiene: new_industry["ind_pollutants_effl"]["Hexachlorobutadiene"],
              Nonylphenols: new_industry["ind_pollutants_effl"]["Nonylphenols"],
              Tetrachloroethene: new_industry["ind_pollutants_effl"]["Tetrachloroethene"],
              Trichloroethylene: new_industry["ind_pollutants_effl"]["Trichloroethylene"]
            }
          }
        }
        else if(key=="wwt_pollutants_infl_wwtp") {

          if ('wwt_pollutants_infl_wwtp' in industry.offsite_wwtp){
            new_industry.offsite_wwtp[key] = industry.offsite_wwtp[key]
          }else{   //Adapt from WIAT 1.0 version
            new_industry.offsite_wwtp.wwt_pollutants_infl_wwtp = {
              COD: industry.onsite_wwtp.wwt_cod_effl,
              TN: industry["onsite_wwtp"]["wwt_tn_effl"],
              TP: industry["onsite_wwtp"]["wwt_tp_effl"],
              "1,2-Dichloroethane": industry["onsite_wwtp"]["wwt_diclo_effl"],
              Cadmium: industry["onsite_wwtp"]["wwt_cadmium_effl"],
              Hexaclorobenzene: industry["onsite_wwtp"]["wwt_hexaclorobenzene_effl"],
              Mercury: industry["onsite_wwtp"]["wwt_mercury_effl"],
              Lead: industry["onsite_wwtp"]["wwt_plomo_effl"],
              Nickel: industry["onsite_wwtp"]["wwt_niquel_effl"],
              Chloroalkanes: industry["onsite_wwtp"]["wwt_chloro_effl"],
              Hexachlorobutadiene: industry["onsite_wwtp"]["wwt_hexaclorobutadie_effl"],
              Nonylphenols: industry["onsite_wwtp"]["wwt_nonilfenols_effl"],
              Tetrachloroethene: industry["onsite_wwtp"]["wwt_tetracloroetile_effl"],
              Trichloroethylene: industry["onsite_wwtp"]["wwt_tricloroetile_effl"]
            }
          }
        }
        else if(key=="wwt_pollutants_effl"){
          if ('wwt_pollutants_effl' in industry.offsite_wwtp){
            new_industry.offsite_wwtp[key] = industry.offsite_wwtp[key]
          }else{
            //Adapt from WIAT 1.0 version
            new_industry.offsite_wwtp.wwt_pollutants_effl = {
              COD: industry.offsite_wwtp.wwt_cod_effl,
              TN: industry["offsite_wwtp"]["wwt_tn_effl"],
              TP: industry["offsite_wwtp"]["wwt_tp_effl"],
              "1,2-Dichloroethane": industry["offsite_wwtp"]["wwt_diclo_effl"],
              Cadmium: industry["offsite_wwtp"]["wwt_cadmium_effl"],
              Hexaclorobenzene: industry["offsite_wwtp"]["wwt_hexaclorobenzene_effl"],
              Mercury: industry["offsite_wwtp"]["wwt_mercury_effl"],
              Lead: industry["offsite_wwtp"]["wwt_plomo_effl"],
              Nickel: industry["offsite_wwtp"]["wwt_niquel_effl"],
              Chloroalkanes: industry["offsite_wwtp"]["wwt_chloro_effl"],
              Hexachlorobutadiene: industry["offsite_wwtp"]["wwt_hexaclorobutadie_effl"],
              Nonylphenols: industry["offsite_wwtp"]["wwt_nonilfenols_effl"],
              Tetrachloroethene: industry["offsite_wwtp"]["wwt_tetracloroetile_effl"],
              Trichloroethylene: industry["offsite_wwtp"]["wwt_tricloroetile_effl"]
            }
          }


        }
        else if(industry.offsite_wwtp[key] == undefined) {
          if (key == "discharge_same_location_as_withdrawal") {
            new_industry.offsite_wwtp[key] = 1
          } else {
            new_industry.offsite_wwtp[key] = 0
          }
        } else{
          new_industry.offsite_wwtp[key] = industry.offsite_wwtp[key]
        }
      })

      Object.keys(new_industry.direct_discharge).forEach(key => {

        if(key=="wwt_pollutants_effl"){
          new_industry.direct_discharge.wwt_pollutants_effl = {
            COD: new_industry["ind_pollutants_effl"]["COD"],
            TN: new_industry["ind_pollutants_effl"]["TN"],
            TP: new_industry["ind_pollutants_effl"]["TP"],
            "1,2-Dichloroethane": new_industry["ind_pollutants_effl"]["1,2-Dichloroethane"],
            Cadmium: new_industry["ind_pollutants_effl"]["Cadmium"],
            Hexaclorobenzene: new_industry["ind_pollutants_effl"]["Hexaclorobenzene"],
            Mercury: new_industry["ind_pollutants_effl"]["Mercury"],
            Lead: new_industry["ind_pollutants_effl"]["Lead"],
            Nickel: new_industry["ind_pollutants_effl"]["Nickel"],
            Chloroalkanes: new_industry["ind_pollutants_effl"]["Chloroalkanes"],
            Hexachlorobutadiene: new_industry["ind_pollutants_effl"]["Hexachlorobutadiene"],
            Nonylphenols: new_industry["ind_pollutants_effl"]["Nonylphenols"],
            Tetrachloroethene: new_industry["ind_pollutants_effl"]["Tetrachloroethene"],
            Trichloroethylene: new_industry["ind_pollutants_effl"]["Trichloroethylene"]
          }
        }

        else if(industry.direct_discharge[key] == undefined){
          if (key == "discharge_same_location_as_withdrawal"){
            new_industry.direct_discharge[key] = 1
          }else{
            new_industry.direct_discharge[key] = 0
          }
        } else{
          new_industry.direct_discharge[key] = industry.direct_discharge[key]
        }
      })

      new_industry = this.set_pollutants(new_industry)

      //Set level of certainty
      new_industry = this.copy_level_of_certainty(industry, new_industry)

      return new_industry

    },

    //Download excel template
    async download_excel(){
      axios.get('/download/template/file/'+file, {responseType: 'arraybuffer'}).then(res=>{
        let blob = new Blob([res.data], {type:'application/*'})
        let link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = file
        link._target = 'blank'
        link.click();
      })

    },

    //Download json session
    download_json(){

      let export_object = {
        assessments: this.created_assessments,
        general_configuration: Conversion_factors
      }
      let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(export_object));
      let downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href",     dataStr);
      downloadAnchorNode.setAttribute("download", this.export_file_name + ".json");
      document.body.appendChild(downloadAnchorNode); // required for firefox
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    },

    //.JSON to json object
    async fileToJSON(file) {
      try {
        return new Promise((resolve, reject) => {
          const fileReader = new FileReader()
          try {
            fileReader.onload = event => {
              try {
                resolve(JSON.parse(event.target.result))
              } catch (error) {
                reject(error)
              }
            }
            fileReader.readAsText(file)
          } catch (error) {
            reject(error)
          }
        })

      }
      catch (error) {
        reject(error)

      }


    },

    async read_json_file(file) {
      let imported_json = await this.fileToJSON(file)
      if(Array.isArray(imported_json)){ //file from version 1.0
        return imported_json
      }else{         //file from version 1.1
        let general_configuration = imported_json.general_configuration
        for (let key of Object.keys(general_configuration)){
          Conversion_factors[key] = general_configuration[key]
        }
        return imported_json.assessments
      }
    },
    //replace current assessments with imported assessments
    async import_replace(){
      let _this=this
      //Empty arrays
      _this.created_assessments.splice(0,_this.created_assessments.length)
      _this.location_markers.splice(0,_this.location_markers.length)
      _this.$assessment_active.splice(0,_this.$assessment_active.length)


      let imported_assessments = await this.read_json_file(this.imported_file)

      imported_assessments.forEach((assessment, assessment_index )=> {

        //If there is an assessment with the same name like the one we are adding, delete the older one
        let assessment_to_delete = this.created_assessments.findIndex(a => a.name === assessment.name)
        if (assessment_to_delete > -1) this.created_assessments.splice(assessment_to_delete,1);

        let new_assessment = new Assessment()
        new_assessment.name = assessment.name
        new_assessment.assessment_period_start = assessment.assessment_period_start
        new_assessment.assessment_period_end = assessment.assessment_period_end

        let industries = assessment.industries
        industries.forEach((industry, industry_index)=> {

          //If the assessment has industry with same name that the one we are adding, delete the older one
          let industry_to_delete = new_assessment.industries.findIndex(e => e.name === industry.name)
          if (industry_to_delete > -1) new_assessment.industries.splice(industry_to_delete,1);

          let new_industry = this.copyIndustry(industry)
          new_assessment.industries.push(new_industry)

        })
        _this.created_assessments.push(new_assessment)
        _this.$assessment_active.push(true)

      })
    },

    //append current assessments to new assessments
    async import_append(){
      let _this=this

      let imported_assessments = await this.read_json_file(this.imported_file)

      imported_assessments.forEach(assessment => {

        //If there is an assessment with the same name like the one we are adding, delete the older one
        let assessment_index = this.created_assessments.findIndex(a => a.name === assessment.name)
        if (assessment_index > -1) {  //Assessment with same name
          let industries_to_add = assessment.industries
          let current_assessment = this.created_assessments[assessment_index] //Assessment where we are adding new industries
          industries_to_add.forEach(industry => {

            //If the assessment has industry with same name that the one we are adding, delete the older one
            let industry_to_delete = current_assessment.industries.findIndex(e => e.name === industry.name)
            if (industry_to_delete > -1) current_assessment.industries.splice(industry_to_delete,1);

            let new_industry = this.copyIndustry(industry)
            current_assessment.industries.push(new_industry)
          })
        }else{
          let new_assessment = new Assessment()
          new_assessment.name = assessment.name
          new_assessment.assessment_period_start = assessment.assessment_period_start
          new_assessment.assessment_period_end = assessment.assessment_period_end

          let industries = assessment.industries
          industries.forEach((industry, industry_index)=> {

            //If the assessment has industry with same name that the one we are adding, delete the older one
            let industry_to_delete = new_assessment.industries.findIndex(e => e.name === industry.name)
            if (industry_to_delete > -1) new_assessment.industries.splice(industry_to_delete,1);

            let new_industry = this.copyIndustry(industry)
            new_assessment.industries.push(new_industry)

          })
          _this.created_assessments.push(new_assessment)
          _this.$assessment_active.push(true)

        }

      })

    },

    //json session uploaded
    async onUpload(){
      let _this = this
      try {

        if (this.imported_file === null) return

        this.$emit('closeRightMenu');

        //check if file is json
        try {
          //check if file is json
          let data = await this.fileToJSON(this.imported_file)
          //console.log(data)

        }
        catch (e) {
          this.snackbar_text = "THIS IS NOT A JSON FILE"
          this.snackbar_imported_file = true

          return
        }

        if(_this.option_for_import === 'replace'){
          await this.import_replace()
        }else{
          await this.import_append()
        }

        //Repeat loop but for adding markers to map
        this.created_assessments.forEach((assessment, assessment_index )=> {
          this.$assessment_active.push(true)
          let industries = assessment.industries
          industries.forEach((industry, industry_index)=> {
            _this.location_markers.push({
              industry: industry_index,
              assessment: assessment_index,
              latlng: industry.location
            })

            industry.supply_chain.forEach(sc => {
              let marker = {
                isSupplyChain: true,
                latlng: sc.location,
                industry_coords: industry.location,
                assessment: assessment_index,
                industry: industry_index,
                supply_chain: industry.supply_chain.length - 1
              }
              _this.location_markers.push(marker)
            })

          })
        })
        this.snackbar_text = "FILE IMPORTED CORRECTLY"
        this.snackbar_imported_file = true

        utils.reset_and_update_global_pollutants(this.created_assessments, this.$created_pollutants)

        //_this.$emit('file_imported', "FILE IMPORTED CORRECTLY")
        //this.$router.push('/')

      } catch (e) {
        //error
        this.snackbar_text = "ERROR IMPORTING FILE"
        this.snackbar_imported_file = true

      }

    }
  },


};
</script>

<style scoped>

.flex{
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 50%;

}

.load_and_save{
  border: 2px solid #1C195B;
  border-radius: 10px;
}

.v-btn--disabled{
  background-color: rgba(0, 0, 0, 0.26) !important
}
</style>