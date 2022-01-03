<template>
  <div class="outer">



    <h1 style="color: #b62373">Load and save file</h1>
    <div style="display: flex; padding-top: 30px">
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
                <v-icon right>
                  mdi-cloud-download
                </v-icon>
              </v-btn>
            </div>


          </v-col>

        </v-row>
      </div>
    </div>


    <div style="padding-top: 15px">
      <h1 style="color: #b62373">Load from Excel file</h1>
    </div>
    <div style="padding: 20px 30px 0px 20px; margin-top: 30px" class="load_and_save">
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
                v-model="imported_file_excel"
                @change="onUploadExcel"
                style="width: 100px; padding-top: 0px; margin-top: -3px"
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
    }
  },
  methods: {
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
                  new_assessment.assessment_period_start = moment(assessment_beginning).format("YYYY-MM-DD")
                  new_assessment.assessment_period_end = moment(assessment_end).format("YYYY-MM-DD")
                  _this.created_assessments.push(new_assessment)
                  _this.$assessment_active.push(true)

                  this.snackbar_text = "FILE IMPORTED CORRECTLY"
                  this.snackbar_imported_file = true


                } catch (error) {
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
                        lat: !isNaN(industry_input[3]) ? parseFloat(industry_input[3]) : 0,
                        lng: !isNaN(industry_input[4]) ? parseFloat(industry_input[4]) : 0
                      }

                      if(utils.get_country_code_from_coordinates(new_industry.location.lat, new_industry.location.lng) == null) throw new Error('Coordinates of industry not valid')

                      new_industry.volume_withdrawn = !isNaN(industry_input[5]) ? parseFloat(industry_input[5]) : 0

                      new_industry.has_onsite_wwtp = industry_input[6] == "Yes"  ? 1 : 0
                      new_industry.has_direct_discharge = industry_input[7] == "Yes"  ? 1 : 0
                      new_industry.has_offsite_wwtp = industry_input[8] == "Yes"  ? 1 : 0


                      new_industry.industry_type = standard_industries_classification.find(classification => {
                        return classification.text == industry_input[9]
                      }).value

                      new_industry.product_produced = !isNaN(industry_input[10]) ? parseFloat(industry_input[10]) : 0

                      new_industry.ind_cod_effl = !isNaN(industry_input[11]) ? parseFloat(industry_input[11]) : 0
                      new_industry.ind_tn_effl = !isNaN(industry_input[12]) ? parseFloat(industry_input[12]) : 0
                      new_industry.ind_tp_effl = !isNaN(industry_input[13]) ? parseFloat(industry_input[13]) : 0
                      new_industry.ind_diclo_effl = !isNaN(industry_input[14]) ? parseFloat(industry_input[14]) : 0
                      new_industry.ind_cadmium_effl = !isNaN(industry_input[15]) ? parseFloat(industry_input[15]) : 0
                      new_industry.ind_hexaclorobenzene_effl = !isNaN(industry_input[16]) ? parseFloat(industry_input[16]) : 0
                      new_industry.ind_mercury_effl = !isNaN(industry_input[17]) ? parseFloat(industry_input[17]) : 0
                      new_industry.ind_plomo_effl = !isNaN(industry_input[18]) ? parseFloat(industry_input[18]) : 0
                      new_industry.ind_niquel_effl = !isNaN(industry_input[19]) ? parseFloat(industry_input[19]) : 0
                      new_industry.ind_chloro_effl = !isNaN(industry_input[20]) ? parseFloat(industry_input[20]) : 0
                      new_industry.ind_hexaclorobutadie_effl = !isNaN(industry_input[21]) ? parseFloat(industry_input[21]) : 0
                      new_industry.ind_nonilfenols_effl = !isNaN(industry_input[22]) ? parseFloat(industry_input[22]) : 0
                      new_industry.ind_tetracloroetile_effl = !isNaN(industry_input[23]) ? parseFloat(industry_input[23]) : 0
                      new_industry.ind_tricloroetile_effl = !isNaN(industry_input[24]) ? parseFloat(industry_input[24]) : 0

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

                        if(industry_input[25] == "Untreated systems") new_industry.onsite_wwtp.wwt_treatment_type = 0
                        else if(industry_input[25] == "Primary") new_industry.onsite_wwtp.wwt_treatment_type = 1
                        else if(industry_input[25] == "Primary+Secondary") new_industry.onsite_wwtp.wwt_treatment_type = 2
                        else if(industry_input[25] == "Primary+Secondary+Tertiary") new_industry.onsite_wwtp.wwt_treatment_type = 3
                        else new_industry.onsite_wwtp.wwt_treatment_type = 0


                        new_industry.onsite_wwtp.wwt_vol_trea = !isNaN(industry_input[26]) ? parseFloat(industry_input[26]) : 0
                        new_industry.onsite_wwtp.wwt_vol_disc = !isNaN(industry_input[27]) ? parseFloat(industry_input[27]) : 0
                        new_industry.onsite_wwtp.wwt_cod_effl = !isNaN(industry_input[28]) ? parseFloat(industry_input[28]) : 0
                        new_industry.onsite_wwtp.wwt_tn_effl = !isNaN(industry_input[29]) ? parseFloat(industry_input[29]) : 0
                        new_industry.onsite_wwtp.wwt_tp_effl = !isNaN(industry_input[30]) ? parseFloat(industry_input[30]) : 0
                        new_industry.onsite_wwtp.wwt_diclo_effl = !isNaN(industry_input[31]) ? parseFloat(industry_input[31]) : 0
                        new_industry.onsite_wwtp.wwt_cadmium_effl = !isNaN(industry_input[32]) ? parseFloat(industry_input[32]) : 0
                        new_industry.onsite_wwtp.wwt_hexaclorobenzene_effl = !isNaN(industry_input[33]) ? parseFloat(industry_input[33]) : 0
                        new_industry.onsite_wwtp.wwt_mercury_effl = !isNaN(industry_input[34]) ? parseFloat(industry_input[34]) : 0
                        new_industry.onsite_wwtp.wwt_plomo_effl = !isNaN(industry_input[35]) ? parseFloat(industry_input[35]) : 0
                        new_industry.onsite_wwtp.wwt_niquel_effl = !isNaN(industry_input[36]) ? parseFloat(industry_input[36]) : 0
                        new_industry.onsite_wwtp.wwt_chloro_effl = !isNaN(industry_input[37]) ? parseFloat(industry_input[37]) : 0
                        new_industry.onsite_wwtp.wwt_hexaclorobutadie_effl = !isNaN(industry_input[38]) ? parseFloat(industry_input[38]) : 0
                        new_industry.onsite_wwtp.wwt_nonilfenols_effl = !isNaN(industry_input[39]) ? parseFloat(industry_input[39]) : 0
                        new_industry.onsite_wwtp.wwt_tetracloroetile_effl = !isNaN(industry_input[40]) ? parseFloat(industry_input[40]) : 0
                        new_industry.onsite_wwtp.wwt_tricloroetile_effl = !isNaN(industry_input[41]) ? parseFloat(industry_input[41]) : 0

                        new_industry.onsite_wwtp.wwt_nrg_cons = !isNaN(industry_input[42]) ? parseFloat(industry_input[42]) : 0
                        new_industry.onsite_wwtp.wwt_conv_kwh = !isNaN(industry_input[43]) ? parseFloat(industry_input[43]) : 0
                        new_industry.onsite_wwtp.wwt_mass_slu = !isNaN(industry_input[44]) ? parseFloat(industry_input[44]) : 0
                        new_industry.onsite_wwtp.wwt_cod_slud = !isNaN(industry_input[45]) ? parseFloat(industry_input[45]) : 0
                        new_industry.onsite_wwtp.wwt_ch4_efac_tre = !isNaN(industry_input[46]) ? parseFloat(industry_input[46]) : 0
                        new_industry.onsite_wwtp.wwt_n2o_efac_tre = !isNaN(industry_input[47]) ? parseFloat(industry_input[47]) : 0
                        new_industry.onsite_wwtp.wwt_ch4_efac_dis = !isNaN(industry_input[48]) ? parseFloat(industry_input[48]) : 0
                        new_industry.onsite_wwtp.wwt_n2o_efac_dis = !isNaN(industry_input[49]) ? parseFloat(industry_input[49]) : 0

                        new_industry.onsite_wwtp.wwt_vol_reused = !isNaN(industry_input[50]) ? parseFloat(industry_input[50]) : 0
                        if (new_industry.has_offsite_wwtp == 1) new_industry.onsite_wwtp.wwt_vol_treated_external = !isNaN(industry_input[51]) ? parseFloat(industry_input[51]) : 0

                        if(industry_input[52] == "Diesel") new_industry.onsite_wwtp.wwt_fuel_typ = 0
                        else if(industry_input[52] == "Gasoline") new_industry.onsite_wwtp.wwt_fuel_typ = 1
                        else if(industry_input[52] == "Natural gas") new_industry.onsite_wwtp.wwt_fuel_typ = 2
                        else new_industry.onsite_wwtp.wwt_fuel_typ = 0

                        new_industry.onsite_wwtp.wwt_vol_fuel = !isNaN(industry_input[53]) ? parseFloat(industry_input[53]) : 0
                        new_industry.onsite_wwtp.wwt_biog_pro = !isNaN(industry_input[54]) ? parseFloat(industry_input[54]) : 0
                        new_industry.onsite_wwtp.wwt_biog_fla = !isNaN(industry_input[55]) ? parseFloat(industry_input[55]) : 0
                        new_industry.onsite_wwtp.wwt_biog_val = !isNaN(industry_input[56]) ? parseFloat(industry_input[56]) : 0
                        new_industry.onsite_wwtp.wwt_biog_lkd = !isNaN(industry_input[57]) ? parseFloat(industry_input[57]) : 0
                        new_industry.onsite_wwtp.wwt_biog_sold = !isNaN(industry_input[58]) ? parseFloat(industry_input[58]) : 0
                        new_industry.onsite_wwtp.wwt_ch4_biog = !isNaN(industry_input[59]) ? parseFloat(industry_input[59]) : 0

                        if(industry_input[60] == "Diesel") new_industry.onsite_wwtp.wwt_dige_typ = 0
                        else if(industry_input[60] == "Gasoline") new_industry.onsite_wwtp.wwt_dige_typ = 1
                        else if(industry_input[60] == "Natural gas") new_industry.onsite_wwtp.wwt_dige_typ = 2
                        else new_industry.onsite_wwtp.wwt_dige_typ = 0


                        new_industry.onsite_wwtp.wwt_fuel_dig = !isNaN(industry_input[61]) ? parseFloat(industry_input[61]) : 0

                        if(industry_input[62] == "Diesel") new_industry.onsite_wwtp.wwt_reus_trck_typ = 0
                        else if(industry_input[62] == "Gasoline") new_industry.onsite_wwtp.wwt_reus_trck_typ = 1
                        else if(industry_input[62] == "Natural gas") new_industry.onsite_wwtp.wwt_reus_trck_typ = 2
                        else new_industry.onsite_wwtp.wwt_reus_trck_typ = 0

                        new_industry.onsite_wwtp.wwt_reus_vol_trck = !isNaN(industry_input[63]) ? parseFloat(industry_input[63]) : 0
                        new_industry.onsite_wwtp.wwt_mass_slu_sto = !isNaN(industry_input[64]) ? parseFloat(industry_input[64]) : 0
                        new_industry.onsite_wwtp.wwt_time_slu_sto = !isNaN(industry_input[65]) ? parseFloat(industry_input[65]) : 0
                        new_industry.onsite_wwtp.wwt_slu_sto_TVS = !isNaN(industry_input[66]) ? parseFloat(industry_input[66]) : 0
                        new_industry.onsite_wwtp.wwt_slu_sto_f_CH4 = !isNaN(industry_input[67]) ? parseFloat(industry_input[67]) : 0
                        new_industry.onsite_wwtp.wwt_slu_sto_EF = !isNaN(industry_input[68]) ? parseFloat(industry_input[68]) : 0
                        new_industry.onsite_wwtp.wwt_mass_slu_comp = !isNaN(industry_input[69]) ? parseFloat(industry_input[69]) : 0
                        new_industry.onsite_wwtp.wwt_slu_comp_emis_treated_or_piles_covered = industry_input[70] == "Yes"  ? 1 : 0
                        new_industry.onsite_wwtp.wwt_slu_comp_solids_content = !isNaN(industry_input[71]) ? parseFloat(industry_input[71]) : 0
                        new_industry.onsite_wwtp.wwt_slu_comp_TVS = !isNaN(industry_input[72]) ? parseFloat(industry_input[72]) : 0
                        new_industry.onsite_wwtp.wwt_slu_comp_N_cont = !isNaN(industry_input[73]) ? parseFloat(industry_input[73]) : 0
                        new_industry.onsite_wwtp.wwt_slu_comp_low_CN_EF = !isNaN(industry_input[74]) ? parseFloat(industry_input[74]) : 0
                        new_industry.onsite_wwtp.wwt_slu_comp_uncovered_pile_EF = !isNaN(industry_input[75]) ? parseFloat(industry_input[75]) : 0
                        new_industry.onsite_wwtp.wwt_slu_comp_seqst_rate = !isNaN(industry_input[76]) ? parseFloat(industry_input[76]) : 0
                        new_industry.onsite_wwtp.wwt_mass_slu_inc = !isNaN(industry_input[77]) ? parseFloat(industry_input[77]) : 0
                        new_industry.onsite_wwtp.wwt_temp_inc = !isNaN(industry_input[78]) ? parseFloat(industry_input[78]) : 0
                        new_industry.onsite_wwtp.wwt_slu_inc_N_cont = !isNaN(industry_input[79]) ? parseFloat(industry_input[79]) : 0
                        new_industry.onsite_wwtp.wwt_slu_inc_SNCR = industry_input[80] == "Yes"  ? 1 : 0

                        new_industry.onsite_wwtp.wwt_mass_slu_app = !isNaN(industry_input[81]) ? parseFloat(industry_input[81]) : 0
                        new_industry.onsite_wwtp.wwt_slu_la_solids_content = !isNaN(industry_input[82]) ? parseFloat(industry_input[82]) : 0
                        new_industry.onsite_wwtp.wwt_slu_la_TVS = !isNaN(industry_input[83]) ? parseFloat(industry_input[83]) : 0
                        new_industry.onsite_wwtp.wwt_slu_la_N_cont = !isNaN(industry_input[84]) ? parseFloat(industry_input[84]) : 0
                        new_industry.onsite_wwtp.wwt_slu_la_EF = !isNaN(industry_input[85]) ? parseFloat(industry_input[85]) : 0

                        new_industry.onsite_wwtp.wwt_mass_slu_land = !isNaN(industry_input[86]) ? parseFloat(industry_input[86]) : 0
                        new_industry.onsite_wwtp.wwt_slu_lf_TVS = !isNaN(industry_input[87]) ? parseFloat(industry_input[87]) : 0
                        new_industry.onsite_wwtp.wwt_slu_lf_uncertainty = !isNaN(industry_input[88]) ? parseFloat(industry_input[88]) : 0
                        new_industry.onsite_wwtp.wwt_slu_lf_CH4_in_gas = !isNaN(industry_input[89]) ? parseFloat(industry_input[89]) : 0
                        new_industry.onsite_wwtp.wwt_slu_lf_DOCf = !isNaN(industry_input[90]) ? parseFloat(industry_input[90]) : 0
                        new_industry.onsite_wwtp.wwt_slu_lf_decomp_3yr = !isNaN(industry_input[91]) ? parseFloat(industry_input[91]) : 0
                        new_industry.onsite_wwtp.wwt_slu_lf_MCF = !isNaN(industry_input[92]) ? parseFloat(industry_input[92]) : 0
                        new_industry.onsite_wwtp.wwt_slu_lf_N_cont = !isNaN(industry_input[93]) ? parseFloat(industry_input[93]) : 0
                        new_industry.onsite_wwtp.wwt_slu_lf_low_CN_EF = !isNaN(industry_input[94]) ? parseFloat(industry_input[94]) : 0
                        new_industry.onsite_wwtp.wwt_mass_slu_stock = !isNaN(industry_input[95]) ? parseFloat(industry_input[95]) : 0
                        new_industry.onsite_wwtp.wwt_slu_sp_lifespan = !isNaN(industry_input[96]) ? parseFloat(industry_input[96]) : 0
                        new_industry.onsite_wwtp.wwt_trck_typ = industry_input[97] == "Yes"  ? 1 : 0
                        new_industry.onsite_wwtp.wwt_vol_tslu = !isNaN(industry_input[98]) ? parseFloat(industry_input[98]) : 0
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

                        new_industry.direct_discharge.dd_vol_disc = !isNaN(industry_input[99]) ? parseFloat(industry_input[99]) : 0
                        new_industry.direct_discharge.wwt_ch4_efac_dis = !isNaN(industry_input[100]) ? parseFloat(industry_input[100]) : 0
                        new_industry.direct_discharge.wwt_n2o_efac_dis = !isNaN(industry_input[101]) ? parseFloat(industry_input[101]) : 0

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

                        if(industry_input[102] == "Untreated systems") new_industry.offsite_wwtp.wwt_treatment_type = 0
                        else if(industry_input[102] == "Primary") new_industry.offsite_wwtp.wwt_treatment_type = 1
                        else if(industry_input[102] == "Primary+Secondary") new_industry.offsite_wwtp.wwt_treatment_type = 2
                        else if(industry_input[102] == "Primary+Secondary+Tertiary") new_industry.offsite_wwtp.wwt_treatment_type = 3
                        else new_industry.offsite_wwtp.wwt_treatment_type = 0

                        new_industry.offsite_wwtp.wwt_vol_trea = !isNaN(industry_input[103]) ? parseFloat(industry_input[103]) : 0
                        new_industry.offsite_wwtp.wwt_vol_disc = !isNaN(industry_input[104]) ? parseFloat(industry_input[104]) : 0
                        new_industry.offsite_wwtp.wwt_cod_effl = !isNaN(industry_input[105]) ? parseFloat(industry_input[105]) : 0
                        new_industry.offsite_wwtp.wwt_tn_effl = !isNaN(industry_input[106]) ? parseFloat(industry_input[106]) : 0
                        new_industry.offsite_wwtp.wwt_tp_effl = !isNaN(industry_input[107]) ? parseFloat(industry_input[107]) : 0
                        new_industry.offsite_wwtp.wwt_diclo_effl = !isNaN(industry_input[108]) ? parseFloat(industry_input[108]) : 0
                        new_industry.offsite_wwtp.wwt_cadmium_effl = !isNaN(industry_input[109]) ? parseFloat(industry_input[109]) : 0
                        new_industry.offsite_wwtp.wwt_hexaclorobenzene_effl = !isNaN(industry_input[110]) ? parseFloat(industry_input[110]) : 0
                        new_industry.offsite_wwtp.wwt_mercury_effl = !isNaN(industry_input[111]) ? parseFloat(industry_input[111]) : 0
                        new_industry.offsite_wwtp.wwt_plomo_effl = !isNaN(industry_input[112]) ? parseFloat(industry_input[112]) : 0
                        new_industry.offsite_wwtp.wwt_niquel_effl = !isNaN(industry_input[113]) ? parseFloat(industry_input[113]) : 0
                        new_industry.offsite_wwtp.wwt_chloro_effl = !isNaN(industry_input[114]) ? parseFloat(industry_input[114]) : 0
                        new_industry.offsite_wwtp.wwt_hexaclorobutadie_effl = !isNaN(industry_input[115]) ? parseFloat(industry_input[115]) : 0
                        new_industry.offsite_wwtp.wwt_nonilfenols_effl = !isNaN(industry_input[116]) ? parseFloat(industry_input[116]) : 0
                        new_industry.offsite_wwtp.wwt_tetracloroetile_effl = !isNaN(industry_input[117]) ? parseFloat(industry_input[117]) : 0
                        new_industry.offsite_wwtp.wwt_tricloroetile_effl = !isNaN(industry_input[118]) ? parseFloat(industry_input[118]) : 0

                        new_industry.offsite_wwtp.wwt_nrg_cons = !isNaN(industry_input[119]) ? parseFloat(industry_input[119]) : 0
                        new_industry.offsite_wwtp.wwt_conv_kwh = !isNaN(industry_input[120]) ? parseFloat(industry_input[120]) : 0
                        new_industry.offsite_wwtp.wwt_mass_slu = !isNaN(industry_input[121]) ? parseFloat(industry_input[121]) : 0
                        new_industry.offsite_wwtp.wwt_cod_slud = !isNaN(industry_input[122]) ? parseFloat(industry_input[122]) : 0
                        new_industry.offsite_wwtp.wwt_ch4_efac_tre = !isNaN(industry_input[123]) ? parseFloat(industry_input[123]) : 0
                        new_industry.offsite_wwtp.wwt_n2o_efac_tre = !isNaN(industry_input[124]) ? parseFloat(industry_input[124]) : 0
                        new_industry.offsite_wwtp.wwt_ch4_efac_dis = !isNaN(industry_input[125]) ? parseFloat(industry_input[125]) : 0
                        new_industry.offsite_wwtp.wwt_n2o_efac_dis = !isNaN(industry_input[126]) ? parseFloat(industry_input[126]) : 0


                        if(industry_input[127] == "Diesel") new_industry.offsite_wwtp.wwt_fuel_typ = 0
                        else if(industry_input[127] == "Gasoline") new_industry.offsite_wwtp.wwt_fuel_typ = 1
                        else if(industry_input[127] == "Natural gas") new_industry.offsite_wwtp.wwt_fuel_typ = 2
                        else new_industry.offsite_wwtp.wwt_fuel_typ = 0


                        new_industry.offsite_wwtp.wwt_vol_fuel = !isNaN(industry_input[128]) ? parseFloat(industry_input[128]) : 0
                        new_industry.offsite_wwtp.wwt_biog_pro = !isNaN(industry_input[129]) ? parseFloat(industry_input[129]) : 0
                        new_industry.offsite_wwtp.wwt_biog_fla = !isNaN(industry_input[130]) ? parseFloat(industry_input[130]) : 0
                        new_industry.offsite_wwtp.wwt_biog_val = !isNaN(industry_input[131]) ? parseFloat(industry_input[131]) : 0
                        new_industry.offsite_wwtp.wwt_biog_lkd = !isNaN(industry_input[132]) ? parseFloat(industry_input[132]) : 0
                        new_industry.offsite_wwtp.wwt_biog_sold = !isNaN(industry_input[133]) ? parseFloat(industry_input[133]) : 0
                        new_industry.offsite_wwtp.wwt_ch4_biog = !isNaN(industry_input[134]) ? parseFloat(industry_input[134]) : 0

                        if(industry_input[135] == "Diesel") new_industry.offsite_wwtp.wwt_dige_typ = 0
                        else if(industry_input[135] == "Gasoline") new_industry.offsite_wwtp.wwt_dige_typ = 1
                        else if(industry_input[135] == "Natural gas") new_industry.offsite_wwtp.wwt_dige_typ = 2
                        else new_industry.offsite_wwtp.wwt_dige_typ = 0

                        new_industry.offsite_wwtp.wwt_fuel_dig = !isNaN(industry_input[136]) ? parseFloat(industry_input[136]) : 0

                        if(industry_input[137] == "Diesel") new_industry.offsite_wwtp.wwt_reus_trck_typ = 0
                        else if(industry_input[137] == "Gasoline") new_industry.offsite_wwtp.wwt_reus_trck_typ = 1
                        else if(industry_input[137] == "Natural gas") new_industry.offsite_wwtp.wwt_reus_trck_typ = 2
                        else new_industry.offsite_wwtp.wwt_reus_trck_typ = 0


                        new_industry.offsite_wwtp.wwt_reus_vol_trck = !isNaN(industry_input[138]) ? parseFloat(industry_input[138]) : 0
                        new_industry.offsite_wwtp.wwt_mass_slu_sto = !isNaN(industry_input[139]) ? parseFloat(industry_input[139]) : 0
                        new_industry.offsite_wwtp.wwt_time_slu_sto = !isNaN(industry_input[140]) ? parseFloat(industry_input[140]) : 0
                        new_industry.offsite_wwtp.wwt_slu_sto_TVS = !isNaN(industry_input[141]) ? parseFloat(industry_input[141]) : 0
                        new_industry.offsite_wwtp.wwt_slu_sto_f_CH4 = !isNaN(industry_input[142]) ? parseFloat(industry_input[142]) : 0
                        new_industry.offsite_wwtp.wwt_slu_sto_EF = !isNaN(industry_input[143]) ? parseFloat(industry_input[143]) : 0
                        new_industry.offsite_wwtp.wwt_mass_slu_comp = !isNaN(industry_input[144]) ? parseFloat(industry_input[144]) : 0
                        new_industry.offsite_wwtp.wwt_slu_comp_emis_treated_or_piles_covered = industry_input[145] == "Yes"  ? 1 : 0
                        new_industry.offsite_wwtp.wwt_slu_comp_solids_content = !isNaN(industry_input[146]) ? parseFloat(industry_input[146]) : 0
                        new_industry.offsite_wwtp.wwt_slu_comp_TVS = !isNaN(industry_input[147]) ? parseFloat(industry_input[147]) : 0
                        new_industry.offsite_wwtp.wwt_slu_comp_N_cont = !isNaN(industry_input[148]) ? parseFloat(industry_input[148]) : 0
                        new_industry.offsite_wwtp.wwt_slu_comp_low_CN_EF = !isNaN(industry_input[149]) ? parseFloat(industry_input[149]) : 0
                        new_industry.offsite_wwtp.wwt_slu_comp_uncovered_pile_EF = !isNaN(industry_input[150]) ? parseFloat(industry_input[150]) : 0
                        new_industry.offsite_wwtp.wwt_slu_comp_seqst_rate = !isNaN(industry_input[151]) ? parseFloat(industry_input[151]) : 0
                        new_industry.offsite_wwtp.wwt_mass_slu_inc = !isNaN(industry_input[152]) ? parseFloat(industry_input[152]) : 0
                        new_industry.offsite_wwtp.wwt_temp_inc = !isNaN(industry_input[153]) ? parseFloat(industry_input[153]) : 0
                        new_industry.offsite_wwtp.wwt_slu_inc_N_cont = !isNaN(industry_input[154]) ? parseFloat(industry_input[154]) : 0
                        new_industry.offsite_wwtp.wwt_slu_inc_SNCR = industry_input[155] == "Yes"  ? 1 : 0

                        new_industry.offsite_wwtp.wwt_mass_slu_app = !isNaN(industry_input[156]) ? parseFloat(industry_input[156]) : 0
                        new_industry.offsite_wwtp.wwt_slu_la_solids_content = !isNaN(industry_input[157]) ? parseFloat(industry_input[157]) : 0
                        new_industry.offsite_wwtp.wwt_slu_la_TVS = !isNaN(industry_input[158]) ? parseFloat(industry_input[158]) : 0
                        new_industry.offsite_wwtp.wwt_slu_la_N_cont = !isNaN(industry_input[159]) ? parseFloat(industry_input[159]) : 0
                        new_industry.offsite_wwtp.wwt_slu_la_EF = !isNaN(industry_input[160]) ? parseFloat(industry_input[160]) : 0

                        new_industry.offsite_wwtp.wwt_mass_slu_land = !isNaN(industry_input[161]) ? parseFloat(industry_input[161]) : 0
                        new_industry.offsite_wwtp.wwt_slu_lf_TVS = !isNaN(industry_input[162]) ? parseFloat(industry_input[162]) : 0
                        new_industry.offsite_wwtp.wwt_slu_lf_uncertainty = !isNaN(industry_input[163]) ? parseFloat(industry_input[163]) : 0
                        new_industry.offsite_wwtp.wwt_slu_lf_CH4_in_gas = !isNaN(industry_input[164]) ? parseFloat(industry_input[164]) : 0
                        new_industry.offsite_wwtp.wwt_slu_lf_DOCf = !isNaN(industry_input[165]) ? parseFloat(industry_input[165]) : 0
                        new_industry.offsite_wwtp.wwt_slu_lf_decomp_3yr = !isNaN(industry_input[166]) ? parseFloat(industry_input[166]) : 0
                        new_industry.offsite_wwtp.wwt_slu_lf_MCF = !isNaN(industry_input[167]) ? parseFloat(industry_input[167]) : 0
                        new_industry.offsite_wwtp.wwt_slu_lf_N_cont = !isNaN(industry_input[168]) ? parseFloat(industry_input[168]) : 0
                        new_industry.offsite_wwtp.wwt_slu_lf_low_CN_EF = !isNaN(industry_input[169]) ? parseFloat(industry_input[169]) : 0
                        new_industry.offsite_wwtp.wwt_mass_slu_stock = !isNaN(industry_input[170]) ? parseFloat(industry_input[170]) : 0
                        new_industry.offsite_wwtp.wwt_slu_sp_lifespan = !isNaN(industry_input[171]) ? parseFloat(industry_input[171]) : 0
                        new_industry.offsite_wwtp.wwt_trck_typ = industry_input[172] == "Yes"  ? 1 : 0
                        new_industry.offsite_wwtp.wwt_vol_tslu = !isNaN(industry_input[173]) ? parseFloat(industry_input[173]) : 0

                        industry_input[174].replace(" ", "").replace('[', '').split("],").map(stringNameCoord => {
                          let [name, coordString] = stringNameCoord.replace(" ", "").split(",(")
                          let [lat, lng] = coordString.replace(')]', '').replace(' ', '').split(",").map(str => parseFloat(str))
                          if(utils.get_country_code_from_coordinates(lat, lng) != null) {

                            let supply_chain = {
                              name: name,
                              location: {
                                lat: lat,
                                lng: lng
                              }
                            }

                            new_industry.supply_chain.push(supply_chain)

                            let marker = {
                              isSupplyChain: true,
                              latlng: supply_chain.location,
                              name: "<b>"+name+"</b> (supply chain of "+new_industry.name+")",
                              industry_coords: new_industry.location

                            }
                            _this.$location_markers.push(marker)

                          }
                        })


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

                    } catch (error) {
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
          })
        })
        this.snackbar_text = "FILE IMPORTED CORRECTLY"
        this.snackbar_imported_file = true

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