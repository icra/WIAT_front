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
                          mdi-information-variant
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
                          mdi-information-variant
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
      <h1 style="color: #b62373">Load from Excel file</h1>
    </div>
    <div style="padding: 20px 30px 0px 20px" class="load_and_save">
      <v-row>
        <v-col cols="5"> <b>1)</b>
          <a href="/wiat_template.xlsx" download >
            <v-btn
                small
                tile
                class="ml-8 mr-8"
                color="#b62373"
            >
              DOWNLOAD TEMPLATE
              <v-icon right color="white">
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
                v-model="imported_file_excel"
                @change="onUploadExcel"
                style="width: 100px; padding-top: 0px; margin-top: -3px"
            ></v-file-input>

          </div>


        </v-col>
      </v-row>
    </div>

    <div style="padding-top: 30px">
      <h1 style="color: #b62373">Upload custom risk thresholds</h1>
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
  Direct_discharge,
} from "../ecam_backend";

import * as Excel from "exceljs";
import * as moment from 'moment'
import standard_industries_classification from "../standard_industrial_classification"
import {utils} from "../utils"
import risk_thereshold from "@/risk_categories";

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
      risk_categories: risk_thereshold
    }
  },
  methods: {

    parse_i(industry_input, i, mandatory = false){
      if(mandatory) return !isNaN(industry_input[i]) ? parseFloat(industry_input[i]) : null
      else return !isNaN(industry_input[i]) ? parseFloat(industry_input[i]) : null

    },

    parseRiskThereshold(risk, lowString, mediumString, highString, very_highString){


      let blue = ['#529fee', "Low impact"]
      let red = ['red', "Very high impact"]
      let orange = ['orange', "High impact"]
      let yellow = ['yellow', "Medium impact"]

      let layers = {
        l: ['#f6f600', "Low risk"],
        lm: ['#f6cc00', "Low-medium risk"],
        mh: ['#ff9900', "Medium-high risk"],
        h: ['#ff1900', "High risk"],
        eh: ['#990000', "Extremely high risk"],
      }

      let low = 0
      let medium = 0
      let high = 0
      let very_high = 0

      let null_function = function(){
        return null
      }

      try {
        low = parseFloat(lowString)
        medium = parseFloat(mediumString)
        high = parseFloat(highString)
        very_high = parseFloat(very_highString)

        if(isNaN(low) || isNaN(medium) || isNaN(high) || isNaN(very_high)){
          return null
        }
      } catch (error){
        return null
      }


      let increasing_better = function(){   //the higher the value, the better

        let arr = [very_high, high, medium, low]
        if(!utils.equals(arr, utils.highestToLowest(arr))){
          return null_function
        }
        return function(value){
          if(value < 0) return null
          else if (value < low) return red
          else if (value < medium) return orange
          else if (value < high) return yellow
          else if (value >= very_high) return blue
          return null
        }
      }

      let increasing_worse = function(){
        let arr = [low, medium, high, very_high]
        if(!utils.equals(arr, utils.lowestToHighest(arr))){
          return null_function
        }
        return function(value){   //the higher the value, the better
          if(value < 0 ) return  null
          else if (value < low) return blue
          else if (value < medium) return yellow
          else if (value < high) return orange
          else if (value >= very_high) return red
          return null
        }
      }

      try{
        risk = risk.richText[0].text
        if(risk === "Global warming potential"){
          this.risk_categories["global_warming"] = increasing_worse()
        }else if(risk === "Dilution factor"){
          this.risk_categories["dilution_factor"] = increasing_better()
        }else if(risk === "Treated water factor"){
          this.risk_categories["water_treated"] = increasing_better()
        }else if(risk === "Consumption available ratio"){
          this.risk_categories["water_stress_ratio"] = increasing_worse()
        }else if(risk === "Recycled water factor"){
          this.risk_categories["recycled_water_factor"] = increasing_better()
        }else if(risk === "Specific water consumption"){
          this.risk_categories["specific_water_consumption"] = increasing_better()
        }else if(risk === "Eutrophication potential"){
          this.risk_categories["eutrophication"] = increasing_worse()
        }else if(risk === "Toxic units on the effluent"){
          this.risk_categories["ecotoxicity"] = increasing_worse()
        }else if(risk === "Increase in the concentration of the pollutant in the receiving body"){
          this.risk_categories["delta"] = increasing_worse()
        }else if(risk === "Average concentration of the pollutants in the effluent (with respect to EQS)"){
          this.risk_categories["eqs"] = increasing_worse()
        }else if(risk === "Increase in toxic units in the receiving water body after discharge"){
          this.risk_categories["delta_ecotoxicity"] = increasing_worse()
        }else if(risk === "Increase of the average concentration of the pollutants in the receiving water body after discharge (with respect to EQS)"){
          this.risk_categories["delta_eqs"] = increasing_worse()
        }else if(risk === "Percentage of treatment efficiency (compared to WWTP influent)"){
          this.risk_categories["treatment_efficiency"] = increasing_better()
        }
        this.snackbar_text = "FILE IMPORTED CORRECTLY"
        this.snackbar_imported_file = true

      }catch (error){
        this.snackbar_text = "ERROR IMPORTING RISK THRESHOLDS"
        this.snackbar_imported_file = true

      }

    },

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
                let [_, risk, low, medium, high, very_high] = row.values
                _this.parseRiskThereshold(risk, low, medium, high, very_high)

              }
            })
          })
        }
      }
    },
    onUploadExcel(){

      if(this.imported_file_excel != null){
        const wb = new Excel.Workbook();
        const reader = new FileReader()
        let _this = this

        reader.readAsArrayBuffer(this.imported_file_excel)
        reader.onload = () => {
          const buffer = reader.result;
          wb.xlsx.load(buffer).then(workbook => {
            /*workbook.eachSheet((sheet, id) => {
              sheet.eachRow((row, rowIndex) => {
                console.log(row.values, rowIndex)
              })
            })*/
            let assessmentSheet = workbook.getWorksheet(1)
            assessmentSheet.eachRow((row, rowIndex) => {
              if(rowIndex > 1 ){
                let [_, assessment_name, assessment_beginning, assessment_end] = row.values

                //If there is an assessment with the same name like the one we are adding, delete the older one
                let assessment_to_delete = _this.created_assessments.findIndex(a => a.name === assessment_name)
                if (assessment_to_delete > -1) {
                  _this.created_assessments.splice(assessment_to_delete,1);
                  _this.$assessment_active.splice(assessment_to_delete,1);
                }

                try {
                  let new_assessment = new Assessment()
                  new_assessment.name = assessment_name

                  let formats = ["MM/DD/YYYY", "MM-DD-YYYY", "YYYY-MM-DD"];
                  if(!moment(assessment_beginning, formats, true).isValid() || !moment(assessment_end, formats, true).isValid()){
                    throw "date format invalid"
                  }

                  if(moment(assessment_end) <= moment(assessment_beginning)) throw "End date must be after beginning date"
                  new_assessment.assessment_period_start = moment(assessment_beginning, formats).format("YYYY-MM-DD")
                  new_assessment.assessment_period_end = moment(assessment_end, formats).format("YYYY-MM-DD")
                  _this.created_assessments.push(new_assessment)
                  _this.$assessment_active.push(true)

                  this.snackbar_text = "FILE IMPORTED CORRECTLY"
                  this.snackbar_imported_file = true


                } catch (error) {
                  console.log(error)
                  this.snackbar_text = "ERROR IMPORTING FILE"
                  this.snackbar_imported_file = true

                }

              }

            })
            let industrySheet = workbook.getWorksheet(2)
            industrySheet.eachRow({includeEmpty: true}, (row, rowIndex) => {
              if(rowIndex > 3 ){
                let industry_input = row.values

                let assessment = _this.created_assessments.find(assessment => {
                  return industry_input[1] == assessment.name
                })


                if(industry_input[1]!=undefined && industry_input[2]!=undefined && industry_input[3]!=undefined && industry_input[4]!=undefined){
                  if (assessment != undefined){

                    //If there is an assessment with the same name like the one we are adding, delete the older one
                    let industry_to_delete = assessment.industries.findIndex(i => i.name === industry_input[2])
                    if (industry_to_delete > -1) assessment.industries.splice(industry_to_delete,1);

                    try {
                      let new_industry = new Industry()
                      new_industry.name = industry_input[2]
                      new_industry.location = {
                        lat: _this.parse_i(industry_input, 3),
                        lng: _this.parse_i(industry_input, 4),
                      }

                      if(utils.get_country_code_from_coordinates(new_industry.location.lat, new_industry.location.lng) == null) throw new Error('Coordinates of industry not valid')

                      new_industry.volume_withdrawn = _this.parse_i(industry_input, 5, true)

                      if(industry_input[6] == "Yes") new_industry.has_onsite_wwtp = 1
                      else if(industry_input[6] == "No") new_industry.has_onsite_wwtp = 0
                      else new_industry.has_onsite_wwtp = null

                      if(industry_input[7] == "Yes") new_industry.has_direct_discharge = 1
                      else if(industry_input[7] == "No") new_industry.has_direct_discharge = 0
                      else new_industry.has_direct_discharge = null

                      if(industry_input[8] == "Yes") new_industry.has_offsite_wwtp = 1
                      else if(industry_input[8] == "No") new_industry.has_offsite_wwtp = 0
                      else new_industry.has_offsite_wwtp = null

                      if(industry_input[9] == undefined) new_industry.industry_type = null
                      else{
                        new_industry.industry_type = standard_industries_classification.find(classification => {
                          return classification.text == industry_input[9]
                        }).value
                      }


                      new_industry.product_produced = _this.parse_i(industry_input, 10, true)

                      new_industry.ind_cod_infl = _this.parse_i(industry_input, 11)
                      new_industry.ind_tn_infl = _this.parse_i(industry_input, 12)
                      new_industry.ind_tp_infl = _this.parse_i(industry_input, 13)



                      new_industry.ind_cod_effl = _this.parse_i(industry_input, 14)
                      new_industry.ind_tn_effl = _this.parse_i(industry_input, 15)
                      new_industry.ind_tp_effl = _this.parse_i(industry_input, 16)
                      new_industry.ind_diclo_effl = _this.parse_i(industry_input, 17)
                      new_industry.ind_cadmium_effl = _this.parse_i(industry_input, 18)
                      new_industry.ind_hexaclorobenzene_effl = _this.parse_i(industry_input, 19)
                      new_industry.ind_mercury_effl = _this.parse_i(industry_input, 20)
                      new_industry.ind_plomo_effl = _this.parse_i(industry_input, 21)
                      new_industry.ind_niquel_effl = _this.parse_i(industry_input, 22)
                      new_industry.ind_chloro_effl =_this.parse_i(industry_input, 23)
                      new_industry.ind_hexaclorobutadie_effl = _this.parse_i(industry_input, 24)
                      new_industry.ind_nonilfenols_effl = _this.parse_i(industry_input, 25)
                      new_industry.ind_tetracloroetile_effl = _this.parse_i(industry_input, 26)
                      new_industry.ind_tricloroetile_effl = _this.parse_i(industry_input, 27)

                      if (new_industry.has_onsite_wwtp == 1){

                        new_industry.onsite_wwtp.location = new_industry.location
                        new_industry.onsite_wwtp.wwt_cod_infl_ind = new_industry.ind_cod_effl
                        new_industry.onsite_wwtp.wwt_tn_infl_ind = new_industry.ind_tn_effl
                        new_industry.onsite_wwtp.wwt_tp_infl_ind = new_industry.ind_tp_effl
                        new_industry.onsite_wwtp.wwt_diclo_infl_ind = new_industry.ind_diclo_effl //1,2-Dichloroethane
                        new_industry.onsite_wwtp.wwt_cadmium_infl_ind = new_industry.ind_cadmium_effl //Cadmium
                        new_industry.onsite_wwtp.wwt_hexaclorobenzene_infl_ind = new_industry.ind_hexaclorobenzene_effl //Hexachlorobenzene
                        new_industry.onsite_wwtp.wwt_mercury_infl_ind = new_industry.ind_mercury_effl //mercury
                        new_industry.onsite_wwtp.wwt_plomo_infl_ind = new_industry.ind_plomo_effl //lead
                        new_industry.onsite_wwtp.wwt_niquel_infl_ind = new_industry.ind_niquel_effl //nickel
                        new_industry.onsite_wwtp.wwt_chloro_infl_ind = new_industry.ind_chloro_effl //chloroalkanes
                        new_industry.onsite_wwtp.wwt_hexaclorobutadie_infl_ind = new_industry.ind_hexaclorobutadie_effl //Hexachlorobutadiene
                        new_industry.onsite_wwtp.wwt_nonilfenols_infl_ind = new_industry.ind_nonilfenols_effl //Nonylphenols
                        new_industry.onsite_wwtp.wwt_tetracloroetile_infl_ind = new_industry.ind_tetracloroetile_effl //tetrachloroethene
                        new_industry.onsite_wwtp.wwt_tricloroetile_infl_ind = new_industry.ind_tricloroetile_effl //Trichloroethylene

                        if(industry_input[28] == "Untreated systems") new_industry.onsite_wwtp.wwt_treatment_type = 0
                        else if(industry_input[28] == "Primary") new_industry.onsite_wwtp.wwt_treatment_type = 1
                        else if(industry_input[28] == "Primary+Secondary") new_industry.onsite_wwtp.wwt_treatment_type = 2
                        else if(industry_input[28] == "Primary+Secondary+Tertiary") new_industry.onsite_wwtp.wwt_treatment_type = 3
                        else new_industry.onsite_wwtp.wwt_treatment_type = 0


                        new_industry.onsite_wwtp.wwt_vol_trea = _this.parse_i(industry_input, 29, true)
                        new_industry.onsite_wwtp.wwt_vol_disc = _this.parse_i(industry_input, 30, true)
                        new_industry.onsite_wwtp.wwt_cod_effl = _this.parse_i(industry_input, 31)
                        new_industry.onsite_wwtp.wwt_tn_effl = _this.parse_i(industry_input, 32)
                        new_industry.onsite_wwtp.wwt_tp_effl = _this.parse_i(industry_input, 33)
                        new_industry.onsite_wwtp.wwt_diclo_effl = _this.parse_i(industry_input, 34)
                        new_industry.onsite_wwtp.wwt_cadmium_effl = _this.parse_i(industry_input, 35)
                        new_industry.onsite_wwtp.wwt_hexaclorobenzene_effl = _this.parse_i(industry_input, 36)
                        new_industry.onsite_wwtp.wwt_mercury_effl = _this.parse_i(industry_input, 37)
                        new_industry.onsite_wwtp.wwt_plomo_effl = _this.parse_i(industry_input, 38)
                        new_industry.onsite_wwtp.wwt_niquel_effl = _this.parse_i(industry_input, 39)
                        new_industry.onsite_wwtp.wwt_chloro_effl = _this.parse_i(industry_input, 40)
                        new_industry.onsite_wwtp.wwt_hexaclorobutadie_effl = _this.parse_i(industry_input, 41)
                        new_industry.onsite_wwtp.wwt_nonilfenols_effl = _this.parse_i(industry_input, 42)
                        new_industry.onsite_wwtp.wwt_tetracloroetile_effl = _this.parse_i(industry_input, 43)
                        new_industry.onsite_wwtp.wwt_tricloroetile_effl = _this.parse_i(industry_input, 44)

                        new_industry.onsite_wwtp.wwt_nrg_cons = _this.parse_i(industry_input, 45)
                        new_industry.onsite_wwtp.wwt_conv_kwh = _this.parse_i(industry_input, 46)
                        new_industry.onsite_wwtp.wwt_mass_slu = _this.parse_i(industry_input, 47)
                        new_industry.onsite_wwtp.wwt_cod_slud = _this.parse_i(industry_input, 48)
                        new_industry.onsite_wwtp.wwt_ch4_efac_tre = _this.parse_i(industry_input, 49)
                        new_industry.onsite_wwtp.wwt_n2o_efac_tre = _this.parse_i(industry_input, 50)
                        new_industry.onsite_wwtp.wwt_ch4_efac_dis = _this.parse_i(industry_input, 51)
                        new_industry.onsite_wwtp.wwt_n2o_efac_dis = _this.parse_i(industry_input, 52)

                        new_industry.onsite_wwtp.wwt_vol_reused = _this.parse_i(industry_input, 53)
                        if (new_industry.has_offsite_wwtp == 1) new_industry.onsite_wwtp.wwt_vol_treated_external = _this.parse_i(industry_input, 54)

                        if(industry_input[55] == "Diesel") new_industry.onsite_wwtp.wwt_fuel_typ = 0
                        else if(industry_input[55] == "Gasoline") new_industry.onsite_wwtp.wwt_fuel_typ = 1
                        else if(industry_input[55] == "Natural gas") new_industry.onsite_wwtp.wwt_fuel_typ = 2
                        else new_industry.onsite_wwtp.wwt_fuel_typ = 0

                        new_industry.onsite_wwtp.wwt_vol_fuel = _this.parse_i(industry_input, 56)
                        new_industry.onsite_wwtp.wwt_biog_pro = _this.parse_i(industry_input, 57)
                        new_industry.onsite_wwtp.wwt_biog_fla = _this.parse_i(industry_input, 58)
                        new_industry.onsite_wwtp.wwt_biog_val = _this.parse_i(industry_input, 59)
                        new_industry.onsite_wwtp.wwt_biog_lkd = _this.parse_i(industry_input, 60)
                        new_industry.onsite_wwtp.wwt_biog_sold = _this.parse_i(industry_input, 61)
                        new_industry.onsite_wwtp.wwt_ch4_biog = _this.parse_i(industry_input, 62)

                        if(industry_input[63] == "Diesel") new_industry.onsite_wwtp.wwt_dige_typ = 0
                        else if(industry_input[63] == "Gasoline") new_industry.onsite_wwtp.wwt_dige_typ = 1
                        else if(industry_input[63] == "Natural gas") new_industry.onsite_wwtp.wwt_dige_typ = 2
                        else new_industry.onsite_wwtp.wwt_dige_typ = 0


                        new_industry.onsite_wwtp.wwt_fuel_dig = _this.parse_i(industry_input, 64)

                        if(industry_input[65] == "Diesel") new_industry.onsite_wwtp.wwt_reus_trck_typ = 0
                        else if(industry_input[65] == "Gasoline") new_industry.onsite_wwtp.wwt_reus_trck_typ = 1
                        else if(industry_input[65] == "Natural gas") new_industry.onsite_wwtp.wwt_reus_trck_typ = 2
                        else new_industry.onsite_wwtp.wwt_reus_trck_typ = 0

                        new_industry.onsite_wwtp.wwt_reus_vol_trck = _this.parse_i(industry_input, 66)
                        new_industry.onsite_wwtp.wwt_mass_slu_sto = _this.parse_i(industry_input, 67)
                        new_industry.onsite_wwtp.wwt_time_slu_sto = _this.parse_i(industry_input, 68)
                        new_industry.onsite_wwtp.wwt_slu_sto_TVS = _this.parse_i(industry_input, 69)
                        new_industry.onsite_wwtp.wwt_slu_sto_f_CH4 = _this.parse_i(industry_input, 70)
                        new_industry.onsite_wwtp.wwt_slu_sto_EF = _this.parse_i(industry_input, 71)
                        new_industry.onsite_wwtp.wwt_mass_slu_comp = _this.parse_i(industry_input, 72)
                        new_industry.onsite_wwtp.wwt_slu_comp_emis_treated_or_piles_covered = industry_input[73] == "Yes"  ? 1 : 0
                        new_industry.onsite_wwtp.wwt_slu_comp_solids_content = _this.parse_i(industry_input, 74)
                        new_industry.onsite_wwtp.wwt_slu_comp_TVS = _this.parse_i(industry_input, 75)
                        new_industry.onsite_wwtp.wwt_slu_comp_N_cont = _this.parse_i(industry_input, 76)
                        new_industry.onsite_wwtp.wwt_slu_comp_low_CN_EF = _this.parse_i(industry_input, 77)
                        new_industry.onsite_wwtp.wwt_slu_comp_uncovered_pile_EF = _this.parse_i(industry_input, 78)
                        new_industry.onsite_wwtp.wwt_slu_comp_seqst_rate = _this.parse_i(industry_input, 79)
                        new_industry.onsite_wwtp.wwt_mass_slu_inc = _this.parse_i(industry_input, 80)
                        new_industry.onsite_wwtp.wwt_temp_inc = _this.parse_i(industry_input, 81)
                        new_industry.onsite_wwtp.wwt_slu_inc_N_cont = _this.parse_i(industry_input, 82)
                        new_industry.onsite_wwtp.wwt_slu_inc_SNCR = industry_input[83] == "Yes"  ? 1 : 0

                        new_industry.onsite_wwtp.wwt_mass_slu_app = _this.parse_i(industry_input, 84)
                        new_industry.onsite_wwtp.wwt_slu_la_solids_content = _this.parse_i(industry_input, 85)
                        new_industry.onsite_wwtp.wwt_slu_la_TVS = _this.parse_i(industry_input, 86)
                        new_industry.onsite_wwtp.wwt_slu_la_N_cont = _this.parse_i(industry_input, 87)
                        new_industry.onsite_wwtp.wwt_slu_la_EF = _this.parse_i(industry_input, 88)

                        new_industry.onsite_wwtp.wwt_mass_slu_land = _this.parse_i(industry_input, 89)
                        new_industry.onsite_wwtp.wwt_slu_lf_TVS = _this.parse_i(industry_input, 90)
                        new_industry.onsite_wwtp.wwt_slu_lf_uncertainty = _this.parse_i(industry_input, 91)
                        new_industry.onsite_wwtp.wwt_slu_lf_CH4_in_gas = _this.parse_i(industry_input, 92)
                        new_industry.onsite_wwtp.wwt_slu_lf_DOCf = _this.parse_i(industry_input, 93)
                        new_industry.onsite_wwtp.wwt_slu_lf_decomp_3yr = _this.parse_i(industry_input, 94)
                        new_industry.onsite_wwtp.wwt_slu_lf_MCF = _this.parse_i(industry_input, 95)
                        new_industry.onsite_wwtp.wwt_slu_lf_N_cont = _this.parse_i(industry_input, 96)
                        new_industry.onsite_wwtp.wwt_slu_lf_low_CN_EF = _this.parse_i(industry_input, 97)
                        new_industry.onsite_wwtp.wwt_mass_slu_stock = _this.parse_i(industry_input, 98)
                        new_industry.onsite_wwtp.wwt_slu_sp_lifespan = _this.parse_i(industry_input, 99)

                        if(industry_input[100] == "Diesel") new_industry.onsite_wwtp.wwt_trck_typ = 0
                        else if(industry_input[100] == "Gasoline") new_industry.onsite_wwtp.wwt_trck_typ = 1
                        else if(industry_input[100] == "Natural gas") new_industry.onsite_wwtp.wwt_trck_typ = 2
                        else new_industry.onsite_wwtp.wwt_trck_typ = 0

                        new_industry.onsite_wwtp.wwt_vol_tslu = _this.parse_i(industry_input, 101)


                      }


                      if (new_industry.has_direct_discharge) {

                        new_industry.direct_discharge.location = new_industry.location
                        new_industry.direct_discharge.wwt_cod_effl = new_industry.ind_cod_effl
                        new_industry.direct_discharge.wwt_tn_effl = new_industry.ind_tn_effl
                        new_industry.direct_discharge.wwt_tp_effl = new_industry.ind_tp_effl
                        new_industry.direct_discharge.wwt_diclo_effl = new_industry.ind_diclo_effl //1,2-Dichloroethane
                        new_industry.direct_discharge.wwt_cadmium_effl = new_industry.ind_cadmium_effl //Cadmium
                        new_industry.direct_discharge.wwt_hexaclorobenzene_effl = new_industry.ind_hexaclorobenzene_effl //Hexachlorobenzene
                        new_industry.direct_discharge.wwt_mercury_effl = new_industry.ind_mercury_effl //mercury
                        new_industry.direct_discharge.wwt_plomo_effl = new_industry.ind_plomo_effl //lead
                        new_industry.direct_discharge.wwt_niquel_effl = new_industry.ind_niquel_effl //nickel
                        new_industry.direct_discharge.wwt_chloro_effl = new_industry.ind_chloro_effl //chloroalkanes
                        new_industry.direct_discharge.wwt_hexaclorobutadie_effl = new_industry.ind_hexaclorobutadie_effl //Hexachlorobutadiene
                        new_industry.direct_discharge.wwt_nonilfenols_effl = new_industry.ind_nonilfenols_effl //Nonylphenols
                        new_industry.direct_discharge.wwt_tetracloroetile_effl = new_industry.ind_tetracloroetile_effl //tetrachloroethene
                        new_industry.direct_discharge.wwt_tricloroetile_effl = new_industry.ind_tricloroetile_effl //Trichloroethylene

                        new_industry.direct_discharge.dd_vol_disc = _this.parse_i(industry_input, 102, true)
                        new_industry.direct_discharge.wwt_ch4_efac_dis = _this.parse_i(industry_input, 103)
                        new_industry.direct_discharge.wwt_n2o_efac_dis = _this.parse_i(industry_input, 104)

                      }

                      if(new_industry.has_offsite_wwtp == 1){

                        new_industry.offsite_wwtp.location = new_industry.location

                        new_industry.offsite_wwtp.wwt_cod_infl_ind = new_industry.ind_cod_effl
                        new_industry.offsite_wwtp.wwt_tn_infl_ind = new_industry.ind_tn_effl
                        new_industry.offsite_wwtp.wwt_tp_infl_ind = new_industry.ind_tp_effl
                        new_industry.offsite_wwtp.wwt_diclo_infl_ind = new_industry.ind_diclo_effl //1,2-Dichloroethane
                        new_industry.offsite_wwtp.wwt_cadmium_infl_ind = new_industry.ind_cadmium_effl //Cadmium
                        new_industry.offsite_wwtp.wwt_hexaclorobenzene_infl_ind = new_industry.ind_hexaclorobenzene_effl //Hexachlorobenzene
                        new_industry.offsite_wwtp.wwt_mercury_infl_ind = new_industry.ind_mercury_effl //mercury
                        new_industry.offsite_wwtp.wwt_plomo_infl_ind = new_industry.ind_plomo_effl //lead
                        new_industry.offsite_wwtp.wwt_niquel_infl_ind = new_industry.ind_niquel_effl //nickel
                        new_industry.offsite_wwtp.wwt_chloro_infl_ind = new_industry.ind_chloro_effl //chloroalkanes
                        new_industry.offsite_wwtp.wwt_hexaclorobutadie_infl_ind = new_industry.ind_hexaclorobutadie_effl //Hexachlorobutadiene
                        new_industry.offsite_wwtp.wwt_nonilfenols_infl_ind = new_industry.ind_nonilfenols_effl //Nonylphenols
                        new_industry.offsite_wwtp.wwt_tetracloroetile_infl_ind = new_industry.ind_tetracloroetile_effl //tetrachloroethene
                        new_industry.offsite_wwtp.wwt_tricloroetile_infl_ind = new_industry.ind_tricloroetile_effl //Trichloroethylene

                        if(new_industry.has_onsite_wwtp == 1){
                          new_industry.offsite_wwtp.wwt_cod_infl_wwtp = new_industry.onsite_wwtp.wwt_cod_effl
                          new_industry.offsite_wwtp.wwt_tn_infl_wwtp = new_industry.onsite_wwtp.wwt_tn_effl
                          new_industry.offsite_wwtp.wwt_tp_infl_wwtp = new_industry.onsite_wwtp.wwt_tp_effl
                          new_industry.offsite_wwtp.wwt_diclo_infl_wwtp = new_industry.onsite_wwtp.wwt_diclo_effl //1,2-Dichloroethane
                          new_industry.offsite_wwtp.wwt_cadmium_infl_wwtp = new_industry.onsite_wwtp.wwt_cadmium_effl //Cadmium
                          new_industry.offsite_wwtp.wwt_hexaclorobenzene_infl_wwtp = new_industry.onsite_wwtp.wwt_hexaclorobenzene_effl //Hexachlorobenzene
                          new_industry.offsite_wwtp.wwt_mercury_infl_wwtp = new_industry.onsite_wwtp.wwt_mercury_effl //mercury
                          new_industry.offsite_wwtp.wwt_plomo_infl_wwtp = new_industry.onsite_wwtp.wwt_plomo_effl //lead
                          new_industry.offsite_wwtp.wwt_niquel_infl_wwtp = new_industry.onsite_wwtp.wwt_niquel_effl //nickel
                          new_industry.offsite_wwtp.wwt_chloro_infl_wwtp = new_industry.onsite_wwtp.wwt_chloro_effl //chloroalkanes
                          new_industry.offsite_wwtp.wwt_hexaclorobutadie_infl_wwtp = new_industry.onsite_wwtp.wwt_hexaclorobutadie_effl //Hexachlorobutadiene
                          new_industry.offsite_wwtp.wwt_nonilfenols_infl_wwtp = new_industry.onsite_wwtp.wwt_nonilfenols_effl //Nonylphenols
                          new_industry.offsite_wwtp.wwt_tetracloroetile_infl_wwtp = new_industry.onsite_wwtp.wwt_tetracloroetile_effl //tetrachloroethene
                          new_industry.offsite_wwtp.wwt_tricloroetile_infl_wwtp = new_industry.onsite_wwtp.wwt_tricloroetile_effl //Trichloroethylene
                        }

                        if(industry_input[105] == "Untreated systems") new_industry.offsite_wwtp.wwt_treatment_type = 0
                        else if(industry_input[105] == "Primary") new_industry.offsite_wwtp.wwt_treatment_type = 1
                        else if(industry_input[105] == "Primary+Secondary") new_industry.offsite_wwtp.wwt_treatment_type = 2
                        else if(industry_input[105] == "Primary+Secondary+Tertiary") new_industry.offsite_wwtp.wwt_treatment_type = 3
                        else new_industry.offsite_wwtp.wwt_treatment_type = 0

                        new_industry.offsite_wwtp.wwt_vol_trea = _this.parse_i(industry_input, 106, true)
                        new_industry.offsite_wwtp.wwt_vol_disc = new_industry.offsite_wwtp.wwt_vol_trea

                        new_industry.offsite_wwtp.wwt_cod_effl = _this.parse_i(industry_input, 107)
                        new_industry.offsite_wwtp.wwt_tn_effl = _this.parse_i(industry_input, 108)
                        new_industry.offsite_wwtp.wwt_tp_effl = _this.parse_i(industry_input, 109)
                        new_industry.offsite_wwtp.wwt_diclo_effl = _this.parse_i(industry_input, 110)
                        new_industry.offsite_wwtp.wwt_cadmium_effl = _this.parse_i(industry_input, 111)
                        new_industry.offsite_wwtp.wwt_hexaclorobenzene_effl = _this.parse_i(industry_input, 112)
                        new_industry.offsite_wwtp.wwt_mercury_effl = _this.parse_i(industry_input, 113)
                        new_industry.offsite_wwtp.wwt_plomo_effl = _this.parse_i(industry_input, 114)
                        new_industry.offsite_wwtp.wwt_niquel_effl = _this.parse_i(industry_input, 115)
                        new_industry.offsite_wwtp.wwt_chloro_effl = _this.parse_i(industry_input, 116)
                        new_industry.offsite_wwtp.wwt_hexaclorobutadie_effl = _this.parse_i(industry_input, 117)
                        new_industry.offsite_wwtp.wwt_nonilfenols_effl = _this.parse_i(industry_input, 118)
                        new_industry.offsite_wwtp.wwt_tetracloroetile_effl = _this.parse_i(industry_input, 119)
                        new_industry.offsite_wwtp.wwt_tricloroetile_effl = _this.parse_i(industry_input, 120)

                        new_industry.offsite_wwtp.wwt_nrg_cons = _this.parse_i(industry_input, 121)
                        new_industry.offsite_wwtp.wwt_conv_kwh = _this.parse_i(industry_input, 122)
                        new_industry.offsite_wwtp.wwt_mass_slu = _this.parse_i(industry_input, 123)
                        new_industry.offsite_wwtp.wwt_cod_slud = _this.parse_i(industry_input, 124)
                        new_industry.offsite_wwtp.wwt_ch4_efac_tre = _this.parse_i(industry_input, 125)
                        new_industry.offsite_wwtp.wwt_n2o_efac_tre = _this.parse_i(industry_input, 126)
                        new_industry.offsite_wwtp.wwt_ch4_efac_dis = _this.parse_i(industry_input, 127)
                        new_industry.offsite_wwtp.wwt_n2o_efac_dis = _this.parse_i(industry_input, 128)


                        if(industry_input[129] == "Diesel") new_industry.offsite_wwtp.wwt_fuel_typ = 0
                        else if(industry_input[129] == "Gasoline") new_industry.offsite_wwtp.wwt_fuel_typ = 1
                        else if(industry_input[129] == "Natural gas") new_industry.offsite_wwtp.wwt_fuel_typ = 2
                        else new_industry.offsite_wwtp.wwt_fuel_typ = 0


                        new_industry.offsite_wwtp.wwt_vol_fuel = _this.parse_i(industry_input, 130)
                        new_industry.offsite_wwtp.wwt_biog_pro = _this.parse_i(industry_input, 131)
                        new_industry.offsite_wwtp.wwt_biog_fla = _this.parse_i(industry_input, 132)
                        new_industry.offsite_wwtp.wwt_biog_val = _this.parse_i(industry_input, 133)
                        new_industry.offsite_wwtp.wwt_biog_lkd = _this.parse_i(industry_input, 134)
                        new_industry.offsite_wwtp.wwt_biog_sold = _this.parse_i(industry_input, 135)
                        new_industry.offsite_wwtp.wwt_ch4_biog = _this.parse_i(industry_input, 136)

                        if(industry_input[137] == "Diesel") new_industry.offsite_wwtp.wwt_dige_typ = 0
                        else if(industry_input[137] == "Gasoline") new_industry.offsite_wwtp.wwt_dige_typ = 1
                        else if(industry_input[137] == "Natural gas") new_industry.offsite_wwtp.wwt_dige_typ = 2
                        else new_industry.offsite_wwtp.wwt_dige_typ = 0

                        new_industry.offsite_wwtp.wwt_fuel_dig = _this.parse_i(industry_input, 138)

                        if(industry_input[139] == "Diesel") new_industry.offsite_wwtp.wwt_reus_trck_typ = 0
                        else if(industry_input[139] == "Gasoline") new_industry.offsite_wwtp.wwt_reus_trck_typ = 1
                        else if(industry_input[139] == "Natural gas") new_industry.offsite_wwtp.wwt_reus_trck_typ = 2
                        else new_industry.offsite_wwtp.wwt_reus_trck_typ = 0
                        new_industry.offsite_wwtp.wwt_reus_vol_trck = _this.parse_i(industry_input, 140)

                        new_industry.offsite_wwtp.wwt_mass_slu_sto = _this.parse_i(industry_input, 141)
                        new_industry.offsite_wwtp.wwt_time_slu_sto = _this.parse_i(industry_input, 142)
                        new_industry.offsite_wwtp.wwt_slu_sto_TVS = _this.parse_i(industry_input, 143)
                        new_industry.offsite_wwtp.wwt_slu_sto_f_CH4 = _this.parse_i(industry_input, 144)
                        new_industry.offsite_wwtp.wwt_slu_sto_EF = _this.parse_i(industry_input, 145)
                        new_industry.offsite_wwtp.wwt_mass_slu_comp = _this.parse_i(industry_input, 146)
                        new_industry.offsite_wwtp.wwt_slu_comp_emis_treated_or_piles_covered = industry_input[147] == "Yes"  ? 1 : 0
                        new_industry.offsite_wwtp.wwt_slu_comp_solids_content = _this.parse_i(industry_input, 148)
                        new_industry.offsite_wwtp.wwt_slu_comp_TVS = _this.parse_i(industry_input, 149)
                        new_industry.offsite_wwtp.wwt_slu_comp_N_cont = _this.parse_i(industry_input, 150)
                        new_industry.offsite_wwtp.wwt_slu_comp_low_CN_EF = _this.parse_i(industry_input, 151)
                        new_industry.offsite_wwtp.wwt_slu_comp_uncovered_pile_EF = _this.parse_i(industry_input, 152)
                        new_industry.offsite_wwtp.wwt_slu_comp_seqst_rate = _this.parse_i(industry_input, 153)
                        new_industry.offsite_wwtp.wwt_mass_slu_inc = _this.parse_i(industry_input, 154)
                        new_industry.offsite_wwtp.wwt_temp_inc = _this.parse_i(industry_input, 155)
                        new_industry.offsite_wwtp.wwt_slu_inc_N_cont = _this.parse_i(industry_input, 156)

                        new_industry.offsite_wwtp.wwt_slu_inc_SNCR = industry_input[157] == "Yes"  ? 1 : 0

                        new_industry.offsite_wwtp.wwt_mass_slu_app = _this.parse_i(industry_input, 158)
                        new_industry.offsite_wwtp.wwt_slu_la_solids_content = _this.parse_i(industry_input, 159)
                        new_industry.offsite_wwtp.wwt_slu_la_TVS = _this.parse_i(industry_input, 160)
                        new_industry.offsite_wwtp.wwt_slu_la_N_cont = _this.parse_i(industry_input, 161)
                        new_industry.offsite_wwtp.wwt_slu_la_EF = _this.parse_i(industry_input, 162)

                        new_industry.offsite_wwtp.wwt_mass_slu_land = _this.parse_i(industry_input, 163)
                        new_industry.offsite_wwtp.wwt_slu_lf_TVS = _this.parse_i(industry_input, 164)
                        new_industry.offsite_wwtp.wwt_slu_lf_uncertainty = _this.parse_i(industry_input, 165)
                        new_industry.offsite_wwtp.wwt_slu_lf_CH4_in_gas = _this.parse_i(industry_input, 166)
                        new_industry.offsite_wwtp.wwt_slu_lf_DOCf = _this.parse_i(industry_input, 167)
                        new_industry.offsite_wwtp.wwt_slu_lf_decomp_3yr = _this.parse_i(industry_input, 168)
                        new_industry.offsite_wwtp.wwt_slu_lf_MCF = _this.parse_i(industry_input, 169)
                        new_industry.offsite_wwtp.wwt_slu_lf_N_cont = _this.parse_i(industry_input, 170)
                        new_industry.offsite_wwtp.wwt_slu_lf_low_CN_EF = _this.parse_i(industry_input, 171)
                        new_industry.offsite_wwtp.wwt_mass_slu_stock = _this.parse_i(industry_input, 172)
                        new_industry.offsite_wwtp.wwt_slu_sp_lifespan = _this.parse_i(industry_input, 173)

                        if(industry_input[174] == "Diesel") new_industry.offsite_wwtp.wwt_trck_typ = 0
                        else if(industry_input[174] == "Gasoline") new_industry.offsite_wwtp.wwt_trck_typ = 1
                        else if(industry_input[174] == "Natural gas") new_industry.offsite_wwtp.wwt_trck_typ = 2
                        else new_industry.offsite_wwtp.wwt_trck_typ = 0

                        new_industry.offsite_wwtp.wwt_vol_tslu = _this.parse_i(industry_input, 175)

                        if(industry_input[176] != undefined){
                          industry_input[176].replace(" ", "").replace('[', '').split("],").map(stringNameCoord => {
                            let [name, coordString] = stringNameCoord.replace(" ", "").split(",(")
                            let [lat, lng] = coordString.replace(')]', '').replace(' ', '').split("-").map(str => {
                              return parseFloat(str.replace(",", "."))
                            })

                            if(utils.get_country_code_from_coordinates(lat, lng) != null) {
                              let supply_chain = {
                                name: name,
                                location: {
                                  lat: lat,
                                  lng: lng
                                }
                              }

                              new_industry.supply_chain.push(supply_chain)

                            }
                          })
                        }



                        /*split('),').map(stringCoord => {
                          let str = stringCoord.replace('(', '').replace(')', '').replace(' ', '').replace(", ", ",")
                          let [lat, lng] = str.split(",").map(str => parseFloat(str))
                          if(utils.get_country_code_from_coordinates(lat, lng) != null) {
                            console.log(lat, lng)
                          }


                        })*/


                      }

                      assessment.industries.push(new_industry)

                      this.snackbar_text = "FILE IMPORTED CORRECTLY"
                      this.snackbar_imported_file = true
                      //_this.$emit('file_imported', "FILE IMPORTED CORRECTLY")
                      //this.$router.push('/')

                    } catch (error) {
                      console.log(error)
                      this.snackbar_text = "ERROR IMPORTING FILE"
                      this.snackbar_imported_file = true
                    }
                  }

                }


              }
            })
          })
        }
      }
    },

    copyIndustry(industry){
      let new_industry = new Industry()

      Object.keys(new_industry).forEach(key => {
        if (key != "onsite_wwtp" && key != "offsite_wwtp" && key!="direct_discharge"){
          new_industry[key] = industry[key]
        }
      })

      Object.keys(new_industry.onsite_wwtp).forEach(key => {
        new_industry.onsite_wwtp[key] = industry.onsite_wwtp[key]
      })
      Object.keys(new_industry.offsite_wwtp).forEach(key => {
        new_industry.offsite_wwtp[key] = industry.offsite_wwtp[key]
      })
      Object.keys(new_industry.direct_discharge).forEach(key => {
        new_industry.direct_discharge[key] = industry.direct_discharge[key]
      })


      return new_industry

    },

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
    download_json(){
      let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.created_assessments));
      let downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href",     dataStr);
      downloadAnchorNode.setAttribute("download", this.export_file_name + ".json");
      document.body.appendChild(downloadAnchorNode); // required for firefox
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    },
    async fileToJSON(file) {
      return new Promise((resolve, reject) => {
        const fileReader = new FileReader()
        fileReader.onload = event => resolve(JSON.parse(event.target.result))
        fileReader.onerror = error => reject(error)
        fileReader.readAsText(file)
      })
    },
    async import_replace(){
      let _this=this
      //Empty arrays
      _this.created_assessments.splice(0,_this.created_assessments.length)
      _this.location_markers.splice(0,_this.location_markers.length)
      _this.$assessment_active.splice(0,_this.$assessment_active.length)


      let imported_assessments = await this.fileToJSON(this.imported_file)

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
    async import_append(){
      let _this=this

      let imported_assessments = await this.fileToJSON(this.imported_file)

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
    async onUpload(){
      let _this = this
      try {

        this.$emit('closeRightMenu');

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