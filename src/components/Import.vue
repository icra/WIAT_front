<template>
  <div class="outer">



    <h1>Load and save file</h1>
    <div style="display: flex; padding-top: 30px">
      <div class= "load_and_save" style="width: 48%">
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

              <!--<a href="/wiat_template.xlsx" download >bbbb</a> -->

              <v-btn
                  @click="download_json"
                  small
                  outlined
                  class="ml-8 mr-8"
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
      <h1>Load from Excel file</h1>
    </div>
    <div style="padding-top: 20px">
      <v-row>
        <v-col cols="5"> <b>1)</b>
          <a href="/wiat_template.xlsx" download >
            <v-btn
                small
                outlined
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
          <b>2)</b> Fill out .XLSX file
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

              } catch (error) {
                console.log(error)
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

              //MIRAR SI HI HA CELES OBLIGATORIES BUIDES

              if (assessment != undefined){
                //If there is an assessment with the same name like the one we are adding, delete the older one
                let industry_to_delete = assessment.industries.findIndex(i => i.name === industry_input[2])
                if (industry_to_delete > -1) assessment.industries.splice(industry_to_delete,1);

                try {
                  let new_industry = new Industry()
                  new_industry.name = industry_input[2]
                  new_industry.location = {
                    lat: industry_input[3],
                    lng: industry_input[4]
                  }
                  new_industry.volume_withdrawn = !isNaN(industry_input[5]) ? industry_input[5] : 0
                  new_industry.volume_used = !isNaN(industry_input[6]) ? industry_input[6] : 0
                  new_industry.has_onsite_wwtp = industry_input[7] == "Yes"  ? true : false
                  new_industry.has_direct_discharge = industry_input[8] == "Yes"  ? true : false
                  new_industry.has_offsite_wwtp = industry_input[9] == "Yes"  ? true : false
                  new_industry.offsite_wwtp_type = industry_input[10] == "Domestic"  ? "Domestic" : "Industrial"
                  new_industry.industry_type = standard_industries_classification.find(classification => {
                    return classification.text == industry_input[11]
                  }).value


                  new_industry.product_produced = !isNaN(industry_input[12]) ? industry_input[12] : 0
                  new_industry.operation_type = industry_input[13]

                  if(new_industry.operation_type == "Supply chain"){
                    let final_product_industry = assessment.industries.find(industry => {
                      return industry.name == industry[14]
                    })
                    if(final_product_industry != undefined && final_product_industry.operation_type == "Final Product") final_product_industry.industry_provided = industry[14]
                    else new_industry.operation_type ="Final product"

                    new_industry.weight_cargo = !isNaN(industry_input[15]) ? industry_input[15] : 0
                    new_industry.volume_cargo = !isNaN(industry_input[16]) ? industry_input[16] : 0
                    new_industry.km_air = !isNaN(industry_input[17]) ? industry_input[17] : 0
                    new_industry.km_barge = !isNaN(industry_input[18]) ? industry_input[18] : 0
                    new_industry.km_ocean = !isNaN(industry_input[19]) ? industry_input[19] : 0
                    new_industry.km_rail = !isNaN(industry_input[20]) ? industry_input[20] : 0
                    new_industry.km_truck = !isNaN(industry_input[21]) ? industry_input[21] : 0
                  }

                  new_industry.bod_effl_concentration = !isNaN(industry_input[22]) ? industry_input[22] : 0
                  new_industry.tn_effl_concentration = !isNaN(industry_input[23]) ? industry_input[23] : 0
                  new_industry.tp_effl_concentration = !isNaN(industry_input[24]) ? industry_input[24] : 0
                  new_industry.diclo_effl = !isNaN(industry_input[25]) ? industry_input[25] : 0
                  new_industry.cadmium_effl = !isNaN(industry_input[26]) ? industry_input[26] : 0
                  new_industry.hexaclorobenzene_effl = !isNaN(industry_input[27]) ? industry_input[27] : 0
                  new_industry.mercury_effl = !isNaN(industry_input[28]) ? industry_input[28] : 0
                  new_industry.plomo_effl = !isNaN(industry_input[29]) ? industry_input[29] : 0
                  new_industry.niquel_effl = !isNaN(industry_input[30]) ? industry_input[30] : 0
                  new_industry.chloro_effl = !isNaN(industry_input[31]) ? industry_input[31] : 0
                  new_industry.hexaclorobutadie_effl = !isNaN(industry_input[32]) ? industry_input[32] : 0
                  new_industry.nonilfenols_effl = !isNaN(industry_input[33]) ? industry_input[33] : 0
                  new_industry.tetracloroetile_effl = !isNaN(industry_input[34]) ? industry_input[34] : 0
                  new_industry.tricloroetile_effl = !isNaN(industry_input[35]) ? industry_input[35] : 0


                  if (new_industry.has_onsite_wwtp){
                    if (new_industry.has_offsite_wwtp && new_industry.offsite_wwtp_type == "Domestic") new_industry.onsite_wwtp = new Industrial_wwtp_onsite_external_domestic()
                    else if (new_industry.has_offsite_wwtp && new_industry.offsite_wwtp_type == "Industrial") new_industry.onsite_wwtp = new Industrial_wwtp_onsite_external_industrial()
                    else new_industry.onsite_wwtp = new Industrial_wwtp_onsite()

                    new_industry.onsite_wwtp.location = new_industry.location
                    new_industry.onsite_wwtp.wwt_bod_infl = new_industry.bod_effl_concentration
                    new_industry.onsite_wwtp.wwt_tn_infl = new_industry.tn_effl_concentration
                    new_industry.onsite_wwtp.wwt_tp_infl = new_industry.tp_effl_concentration
                    new_industry.onsite_wwtp.wwt_diclo_infl = new_industry.diclo_effl //1,2-Dichloroethane
                    new_industry.onsite_wwtp.wwt_cadmium_infl = new_industry.cadmium_effl //Cadmium
                    new_industry.onsite_wwtp.wwt_hexaclorobenzene_infl = new_industry.hexaclorobenzene_effl //Hexachlorobenzene
                    new_industry.onsite_wwtp.wwt_mercury_infl = new_industry.mercury_effl //mercury
                    new_industry.onsite_wwtp.wwt_plomo_infl = new_industry.plomo_effl //lead
                    new_industry.onsite_wwtp.wwt_niquel_infl = new_industry.niquel_effl //nickel
                    new_industry.onsite_wwtp.wwt_chloro_infl = new_industry.chloro_effl //chloroalkanes
                    new_industry.onsite_wwtp.wwt_hexaclorobutadie_infl = new_industry.hexaclorobutadie_effl //Hexachlorobutadiene
                    new_industry.onsite_wwtp.wwt_nonilfenols_infl = new_industry.nonilfenols_effl //Nonylphenols
                    new_industry.onsite_wwtp.wwt_tetracloroetile_infl = new_industry.tetracloroetile_effl //tetrachloroethene
                    new_industry.onsite_wwtp.wwt_tricloroetile_infl = new_industry.tricloroetile_effl //Trichloroethylene

                    if(industry_input[36] == "Untreated systems") new_industry.onsite_wwtp.wwt_treatment_type = 0
                    else if(industry_input[36] == "Primary") new_industry.onsite_wwtp.wwt_treatment_type = 1
                    else if(industry_input[36] == "Primary+Secondary") new_industry.onsite_wwtp.wwt_treatment_type = 2
                    else if(industry_input[36] == "Primary+Secondary+Tertiary") new_industry.onsite_wwtp.wwt_treatment_type = 3

                    new_industry.onsite_wwtp.wwt_vol_trea = !isNaN(industry_input[37]) ? industry_input[37] : 0
                    new_industry.onsite_wwtp.wwt_vol_disc = !isNaN(industry_input[38]) ? industry_input[38] : 0
                    new_industry.onsite_wwtp.wwt_bod_effl_to_wb = !isNaN(industry_input[39]) ? industry_input[39] : 0
                    new_industry.onsite_wwtp.wwt_tn_effl_to_wb = !isNaN(industry_input[40]) ? industry_input[40] : 0
                    new_industry.onsite_wwtp.wwt_tp_effl_to_wb = !isNaN(industry_input[41]) ? industry_input[41] : 0
                    new_industry.onsite_wwtp.wwt_diclo_effl_to_wb = !isNaN(industry_input[42]) ? industry_input[42] : 0
                    new_industry.onsite_wwtp.wwt_cadmium_effl_to_wb = !isNaN(industry_input[43]) ? industry_input[43] : 0
                    new_industry.onsite_wwtp.wwt_hexaclorobenzene_effl_to_wb = !isNaN(industry_input[44]) ? industry_input[44] : 0
                    new_industry.onsite_wwtp.wwt_mercury_effl_to_wb = !isNaN(industry_input[45]) ? industry_input[45] : 0
                    new_industry.onsite_wwtp.wwt_plomo_effl_to_wb = !isNaN(industry_input[46]) ? industry_input[46] : 0
                    new_industry.onsite_wwtp.wwt_niquel_effl_to_wb = !isNaN(industry_input[47]) ? industry_input[47] : 0
                    new_industry.onsite_wwtp.wwt_chloro_effl_to_wb = !isNaN(industry_input[48]) ? industry_input[48] : 0
                    new_industry.onsite_wwtp.wwt_hexaclorobutadie_effl_to_wb = !isNaN(industry_input[49]) ? industry_input[49] : 0
                    new_industry.onsite_wwtp.wwt_nonilfenols_effl_to_wb = !isNaN(industry_input[50]) ? industry_input[50] : 0
                    new_industry.onsite_wwtp.wwt_tetracloroetile_effl_to_wb = !isNaN(industry_input[51]) ? industry_input[51] : 0
                    new_industry.onsite_wwtp.wwt_tricloroetile_effl_to_wb = !isNaN(industry_input[52]) ? industry_input[52] : 0

                    new_industry.onsite_wwtp.wwt_nrg_cons = !isNaN(industry_input[53]) ? industry_input[53] : 0
                    new_industry.onsite_wwtp.wwt_conv_kwh = !isNaN(industry_input[54]) ? industry_input[54] : 0
                    new_industry.onsite_wwtp.wwt_mass_slu = !isNaN(industry_input[55]) ? industry_input[55] : 0
                    new_industry.onsite_wwtp.wwt_bod_slud = !isNaN(industry_input[56]) ? industry_input[56] : 0
                    new_industry.onsite_wwtp.wwt_ch4_efac_tre = !isNaN(industry_input[57]) ? industry_input[57] : 0
                    new_industry.onsite_wwtp.wwt_n2o_efac_tre = !isNaN(industry_input[58]) ? industry_input[58] : 0
                    new_industry.onsite_wwtp.wwt_ch4_efac_dis = !isNaN(industry_input[59]) ? industry_input[59] : 0
                    new_industry.onsite_wwtp.wwt_n2o_efac_dis = !isNaN(industry_input[60]) ? industry_input[60] : 0

                    new_industry.onsite_wwtp.wwt_vol_reused = !isNaN(industry_input[61]) ? industry_input[61] : 0
                    if (new_industry.has_offsite_wwtp) new_industry.onsite_wwtp.wwt_vol_treated_external = !isNaN(industry_input[62]) ? industry_input[62] : 0

                    if(industry_input[63] == "Diesel") new_industry.onsite_wwtp.wwt_fuel_typ = 0
                    else if(industry_input[63] == "Gasoline") new_industry.onsite_wwtp.wwt_fuel_typ = 1
                    else if(industry_input[63] == "Natural gas") new_industry.onsite_wwtp.wwt_fuel_typ = 2

                    new_industry.onsite_wwtp.wwt_vol_fuel = !isNaN(industry_input[64]) ? industry_input[64] : 0
                    new_industry.onsite_wwtp.wwt_biog_pro = !isNaN(industry_input[65]) ? industry_input[65] : 0
                    new_industry.onsite_wwtp.wwt_biog_fla = !isNaN(industry_input[66]) ? industry_input[66] : 98
                    new_industry.onsite_wwtp.wwt_biog_val = !isNaN(industry_input[67]) ? industry_input[67] : 0
                    new_industry.onsite_wwtp.wwt_biog_lkd = !isNaN(industry_input[68]) ? industry_input[68] : 2
                    new_industry.onsite_wwtp.wwt_biog_sold = !isNaN(industry_input[69]) ? industry_input[69] : 0
                    new_industry.onsite_wwtp.wwt_ch4_biog = !isNaN(industry_input[70]) ? industry_input[70] : 59

                    if(industry_input[71] == "Diesel") new_industry.onsite_wwtp.wwt_dige_typ = 0
                    else if(industry_input[71] == "Gasoline") new_industry.onsite_wwtp.wwt_dige_typ = 1
                    else if(industry_input[71] == "Natural gas") new_industry.onsite_wwtp.wwt_dige_typ = 2

                    new_industry.onsite_wwtp.wwt_fuel_dig = !isNaN(industry_input[72]) ? industry_input[72] : 0

                    if(industry_input[73] == "Diesel") new_industry.onsite_wwtp.wwt_reus_trck_typ = 0
                    else if(industry_input[73] == "Gasoline") new_industry.onsite_wwtp.wwt_reus_trck_typ = 1
                    else if(industry_input[73] == "Natural gas") new_industry.onsite_wwtp.wwt_reus_trck_typ = 2
                    new_industry.onsite_wwtp.wwt_reus_vol_trck = !isNaN(industry_input[74]) ? industry_input[74] : 0
                    new_industry.onsite_wwtp.wwt_mass_slu_sto = !isNaN(industry_input[75]) ? industry_input[75] : 0
                    new_industry.onsite_wwtp.wwt_time_slu_sto = !isNaN(industry_input[76]) ? industry_input[76] : 0
                    new_industry.onsite_wwtp.wwt_slu_sto_TVS = !isNaN(industry_input[77]) ? industry_input[77] : 0
                    new_industry.onsite_wwtp.wwt_slu_sto_f_CH4 = !isNaN(industry_input[78]) ? industry_input[78] : 0
                    new_industry.onsite_wwtp.wwt_slu_sto_EF = !isNaN(industry_input[79]) ? industry_input[79] : 0
                    new_industry.onsite_wwtp.wwt_mass_slu_comp = !isNaN(industry_input[80]) ? industry_input[80] : 0
                    new_industry.onsite_wwtp.wwt_slu_comp_emis_treated_or_piles_covered = industry_input[81] == "Yes"  ? 1 : 0
                    new_industry.onsite_wwtp.wwt_slu_comp_solids_content = !isNaN(industry_input[82]) ? industry_input[82] : 0
                    new_industry.onsite_wwtp.wwt_slu_comp_TVS = !isNaN(industry_input[83]) ? industry_input[83] : 0
                    new_industry.onsite_wwtp.wwt_slu_comp_N_cont = !isNaN(industry_input[84]) ? industry_input[84] : 0
                    new_industry.onsite_wwtp.wwt_slu_comp_low_CN_EF = !isNaN(industry_input[85]) ? industry_input[85] : 0.015
                    new_industry.onsite_wwtp.wwt_slu_comp_uncovered_pile_EF = !isNaN(industry_input[86]) ? industry_input[86] : 0.025
                    new_industry.onsite_wwtp.wwt_slu_comp_seqst_rate = !isNaN(industry_input[87]) ? industry_input[87] : 0.25
                    new_industry.onsite_wwtp.wwt_mass_slu_inc = !isNaN(industry_input[88]) ? industry_input[88] : 0
                    new_industry.onsite_wwtp.wwt_temp_inc = !isNaN(industry_input[89]) ? industry_input[89] : 1023
                    new_industry.onsite_wwtp.wwt_slu_inc_N_cont = !isNaN(industry_input[90]) ? industry_input[90] : 0
                    new_industry.onsite_wwtp.wwt_slu_inc_SNCR = industry_input[91] == "Yes"  ? 1 : 0

                    new_industry.onsite_wwtp.wwt_mass_slu_app = !isNaN(industry_input[92]) ? industry_input[92] : 0
                    new_industry.onsite_wwtp.wwt_slu_la_solids_content = !isNaN(industry_input[93]) ? industry_input[93] : 0
                    new_industry.onsite_wwtp.wwt_slu_la_TVS = !isNaN(industry_input[94]) ? industry_input[94] : 0
                    new_industry.onsite_wwtp.wwt_slu_la_N_cont = !isNaN(industry_input[95]) ? industry_input[95] : 0
                    new_industry.onsite_wwtp.wwt_slu_la_EF = !isNaN(industry_input[96]) ? industry_input[96] : 0

                    new_industry.onsite_wwtp.wwt_mass_slu_land = !isNaN(industry_input[97]) ? industry_input[97] : 0
                    new_industry.onsite_wwtp.wwt_slu_lf_TVS = !isNaN(industry_input[98]) ? industry_input[98] : 0
                    new_industry.onsite_wwtp.wwt_slu_lf_uncertainty = !isNaN(industry_input[90]) ? industry_input[99] : 0.9
                    new_industry.onsite_wwtp.wwt_slu_lf_CH4_in_gas = !isNaN(industry_input[100]) ? industry_input[100] : 50
                    new_industry.onsite_wwtp.wwt_slu_lf_DOCf = !isNaN(industry_input[101]) ? industry_input[101] : 80
                    new_industry.onsite_wwtp.wwt_slu_lf_decomp_3yr = !isNaN(industry_input[102]) ? industry_input[102] : 69.9
                    new_industry.onsite_wwtp.wwt_slu_lf_MCF = !isNaN(industry_input[103]) ? industry_input[103] : 1
                    new_industry.onsite_wwtp.wwt_slu_lf_N_cont = !isNaN(industry_input[104]) ? industry_input[104] : 0
                    new_industry.onsite_wwtp.wwt_slu_lf_low_CN_EF = !isNaN(industry_input[105]) ? industry_input[105] : 0.015
                    new_industry.onsite_wwtp.wwt_mass_slu_stock = !isNaN(industry_input[106]) ? industry_input[106] : 0
                    new_industry.onsite_wwtp.wwt_slu_sp_lifespan = !isNaN(industry_input[107]) ? industry_input[107] : 0
                    new_industry.onsite_wwtp.wwt_trck_typ = industry_input[108] == "Yes"  ? 1 : 0
                    new_industry.onsite_wwtp.wwt_vol_tslu = !isNaN(industry_input[109]) ? industry_input[109] : 0
                  }

                  if (new_industry.has_direct_discharge) {
                    new_industry.direct_discharge =  new Direct_discharge()

                    new_industry.direct_discharge.location = new_industry.location
                    new_industry.direct_discharge.wwt_bod_effl_to_wb = new_industry.bod_effl_concentration
                    new_industry.direct_discharge.wwt_tn_effl_to_wb = new_industry.tn_effl_concentration
                    new_industry.direct_discharge.wwt_tp_effl_to_wb = new_industry.tp_effl_concentration
                    new_industry.direct_discharge.wwt_diclo_effl_to_wb = new_industry.diclo_effl //1,2-Dichloroethane
                    new_industry.direct_discharge.wwt_cadmium_effl_to_wb = new_industry.cadmium_effl //Cadmium
                    new_industry.direct_discharge.wwt_hexaclorobenzene_effl_to_wb = new_industry.hexaclorobenzene_effl //Hexachlorobenzene
                    new_industry.direct_discharge.wwt_mercury_effl_to_wb = new_industry.mercury_effl //mercury
                    new_industry.direct_discharge.wwt_plomo_effl_to_wb = new_industry.plomo_effl //lead
                    new_industry.direct_discharge.wwt_niquel_effl_to_wb = new_industry.niquel_effl //nickel
                    new_industry.direct_discharge.wwt_chloro_effl_to_wb = new_industry.chloro_effl //chloroalkanes
                    new_industry.direct_discharge.wwt_hexaclorobutadie_effl_to_wb = new_industry.hexaclorobutadie_effl //Hexachlorobutadiene
                    new_industry.direct_discharge.wwt_nonilfenols_effl_to_wb = new_industry.nonilfenols_effl //Nonylphenols
                    new_industry.direct_discharge.wwt_tetracloroetile_effl_to_wb = new_industry.tetracloroetile_effl //tetrachloroethene
                    new_industry.direct_discharge.wwt_tricloroetile_effl_to_wb = new_industry.tricloroetile_effl //Trichloroethylene

                    new_industry.direct_discharge.wwt_vol_disc = !isNaN(industry_input[110]) ? industry_input[110] : 0
                    new_industry.direct_discharge.wwt_ch4_efac_dis = !isNaN(industry_input[111]) ? industry_input[111] : 0
                    new_industry.direct_discharge.wwt_n2o_efac_dis = !isNaN(industry_input[112]) ? industry_input[112] : 0

                  }

                  if(new_industry.has_offsite_wwtp){
                    if (new_industry.offsite_wwtp_type == "Domestic") new_industry.offsite_wwtp = new Domestic_wwtp()
                    else new_industry.offsite_wwtp = new Industrial_wwtp_offsite()

                    new_industry.offsite_wwtp.location = new_industry.location

                    /*Passar a BOD si es domestic*/
                    if (new_industry.offsite_wwtp_type == "Domestic") new_industry.offsite_wwtp.wwt_bod_infl = new_industry.bod_effl_concentration * 2.4
                    else new_industry.offsite_wwtp.wwt_bod_infl = new_industry.bod_effl_concentration

                    new_industry.offsite_wwtp.wwt_tn_infl = new_industry.tn_effl_concentration
                    new_industry.offsite_wwtp.wwt_tp_infl = new_industry.tp_effl_concentration
                    new_industry.offsite_wwtp.wwt_diclo_infl = new_industry.diclo_effl //1,2-Dichloroethane
                    new_industry.offsite_wwtp.wwt_cadmium_infl = new_industry.cadmium_effl //Cadmium
                    new_industry.offsite_wwtp.wwt_hexaclorobenzene_infl = new_industry.hexaclorobenzene_effl //Hexachlorobenzene
                    new_industry.offsite_wwtp.wwt_mercury_infl = new_industry.mercury_effl //mercury
                    new_industry.offsite_wwtp.wwt_plomo_infl = new_industry.plomo_effl //lead
                    new_industry.offsite_wwtp.wwt_niquel_infl = new_industry.niquel_effl //nickel
                    new_industry.offsite_wwtp.wwt_chloro_infl = new_industry.chloro_effl //chloroalkanes
                    new_industry.offsite_wwtp.wwt_hexaclorobutadie_infl = new_industry.hexaclorobutadie_effl //Hexachlorobutadiene
                    new_industry.offsite_wwtp.wwt_nonilfenols_infl = new_industry.nonilfenols_effl //Nonylphenols
                    new_industry.offsite_wwtp.wwt_tetracloroetile_infl = new_industry.tetracloroetile_effl //tetrachloroethene
                    new_industry.offsite_wwtp.wwt_tricloroetile_infl = new_industry.tricloroetile_effl //Trichloroethylene


                    if(industry_input[113] == "Untreated systems") new_industry.offsite_wwtp.wwt_treatment_type = 0
                    else if(industry_input[113] == "Primary") new_industry.offsite_wwtp.wwt_treatment_type = 1
                    else if(industry_input[113] == "Primary+Secondary") new_industry.offsite_wwtp.wwt_treatment_type = 2
                    else if(industry_input[113] == "Primary+Secondary+Tertiary") new_industry.offsite_wwtp.wwt_treatment_type = 3

                    new_industry.offsite_wwtp.wwt_vol_trea = !isNaN(industry_input[114]) ? industry_input[114] : 0
                    new_industry.offsite_wwtp.wwt_vol_disc = !isNaN(industry_input[115]) ? industry_input[115] : 0
                    new_industry.offsite_wwtp.wwt_bod_effl_to_wb = !isNaN(industry_input[116]) ? industry_input[116] : 0
                    new_industry.offsite_wwtp.wwt_tn_effl_to_wb = !isNaN(industry_input[117]) ? industry_input[117] : 0
                    new_industry.offsite_wwtp.wwt_tp_effl_to_wb = !isNaN(industry_input[118]) ? industry_input[118] : 0
                    new_industry.offsite_wwtp.wwt_diclo_effl_to_wb = !isNaN(industry_input[119]) ? industry_input[119] : 0
                    new_industry.offsite_wwtp.wwt_cadmium_effl_to_wb = !isNaN(industry_input[120]) ? industry_input[120] : 0
                    new_industry.offsite_wwtp.wwt_hexaclorobenzene_effl_to_wb = !isNaN(industry_input[121]) ? industry_input[121] : 0
                    new_industry.offsite_wwtp.wwt_mercury_effl_to_wb = !isNaN(industry_input[122]) ? industry_input[122] : 0
                    new_industry.offsite_wwtp.wwt_plomo_effl_to_wb = !isNaN(industry_input[123]) ? industry_input[123] : 0
                    new_industry.offsite_wwtp.wwt_niquel_effl_to_wb = !isNaN(industry_input[124]) ? industry_input[124] : 0
                    new_industry.offsite_wwtp.wwt_chloro_effl_to_wb = !isNaN(industry_input[125]) ? industry_input[125] : 0
                    new_industry.offsite_wwtp.wwt_hexaclorobutadie_effl_to_wb = !isNaN(industry_input[126]) ? industry_input[126] : 0
                    new_industry.offsite_wwtp.wwt_nonilfenols_effl_to_wb = !isNaN(industry_input[127]) ? industry_input[127] : 0
                    new_industry.offsite_wwtp.wwt_tetracloroetile_effl_to_wb = !isNaN(industry_input[128]) ? industry_input[128] : 0
                    new_industry.offsite_wwtp.wwt_tricloroetile_effl_to_wb = !isNaN(industry_input[129]) ? industry_input[129] : 0

                    new_industry.offsite_wwtp.wwt_nrg_cons = !isNaN(industry_input[130]) ? industry_input[130] : 0
                    new_industry.offsite_wwtp.wwt_conv_kwh = !isNaN(industry_input[131]) ? industry_input[131] : 0
                    new_industry.offsite_wwtp.wwt_mass_slu = !isNaN(industry_input[132]) ? industry_input[132] : 0
                    new_industry.offsite_wwtp.wwt_bod_slud = !isNaN(industry_input[133]) ? industry_input[133] : 0
                    new_industry.offsite_wwtp.wwt_ch4_efac_tre = !isNaN(industry_input[134]) ? industry_input[134] : 0
                    new_industry.offsite_wwtp.wwt_n2o_efac_tre = !isNaN(industry_input[135]) ? industry_input[135] : 0
                    new_industry.offsite_wwtp.wwt_ch4_efac_dis = !isNaN(industry_input[136]) ? industry_input[136] : 0
                    new_industry.offsite_wwtp.wwt_n2o_efac_dis = !isNaN(industry_input[137]) ? industry_input[137] : 0


                    if(industry_input[138] == "Diesel") new_industry.offsite_wwtp.wwt_fuel_typ = 0
                    else if(industry_input[138] == "Gasoline") new_industry.offsite_wwtp.wwt_fuel_typ = 1
                    else if(industry_input[138] == "Natural gas") new_industry.offsite_wwtp.wwt_fuel_typ = 2

                    new_industry.offsite_wwtp.wwt_vol_fuel = !isNaN(industry_input[139]) ? industry_input[139] : 0
                    new_industry.offsite_wwtp.wwt_biog_pro = !isNaN(industry_input[140]) ? industry_input[140] : 0
                    new_industry.offsite_wwtp.wwt_biog_fla = !isNaN(industry_input[141]) ? industry_input[141] : 98
                    new_industry.offsite_wwtp.wwt_biog_val = !isNaN(industry_input[142]) ? industry_input[142] : 0
                    new_industry.offsite_wwtp.wwt_biog_lkd = !isNaN(industry_input[143]) ? industry_input[143] : 2
                    new_industry.offsite_wwtp.wwt_biog_sold = !isNaN(industry_input[144]) ? industry_input[144] : 0
                    new_industry.offsite_wwtp.wwt_ch4_biog = !isNaN(industry_input[145]) ? industry_input[145] : 59

                    if(industry_input[146] == "Diesel") new_industry.offsite_wwtp.wwt_dige_typ = 0
                    else if(industry_input[146] == "Gasoline") new_industry.offsite_wwtp.wwt_dige_typ = 1
                    else if(industry_input[146] == "Natural gas") new_industry.offsite_wwtp.wwt_dige_typ = 2

                    new_industry.offsite_wwtp.wwt_fuel_dig = !isNaN(industry_input[147]) ? industry_input[147] : 0

                    if(industry_input[148] == "Diesel") new_industry.offsite_wwtp.wwt_reus_trck_typ = 0
                    else if(industry_input[148] == "Gasoline") new_industry.offsite_wwtp.wwt_reus_trck_typ = 1
                    else if(industry_input[148] == "Natural gas") new_industry.offsite_wwtp.wwt_reus_trck_typ = 2
                    new_industry.offsite_wwtp.wwt_reus_vol_trck = !isNaN(industry_input[149]) ? industry_input[149] : 0
                    new_industry.offsite_wwtp.wwt_mass_slu_sto = !isNaN(industry_input[150]) ? industry_input[150] : 0
                    new_industry.offsite_wwtp.wwt_time_slu_sto = !isNaN(industry_input[151]) ? industry_input[151] : 0
                    new_industry.offsite_wwtp.wwt_slu_sto_TVS = !isNaN(industry_input[152]) ? industry_input[152] : 0
                    new_industry.offsite_wwtp.wwt_slu_sto_f_CH4 = !isNaN(industry_input[153]) ? industry_input[153] : 0
                    new_industry.offsite_wwtp.wwt_slu_sto_EF = !isNaN(industry_input[154]) ? industry_input[154] : 0
                    new_industry.offsite_wwtp.wwt_mass_slu_comp = !isNaN(industry_input[155]) ? industry_input[155] : 0
                    new_industry.offsite_wwtp.wwt_slu_comp_emis_treated_or_piles_covered = industry_input[156] == "Yes"  ? 1 : 0
                    new_industry.offsite_wwtp.wwt_slu_comp_solids_content = !isNaN(industry_input[157]) ? industry_input[157] : 0
                    new_industry.offsite_wwtp.wwt_slu_comp_TVS = !isNaN(industry_input[158]) ? industry_input[158] : 0
                    new_industry.offsite_wwtp.wwt_slu_comp_N_cont = !isNaN(industry_input[159]) ? industry_input[159] : 0
                    new_industry.offsite_wwtp.wwt_slu_comp_low_CN_EF = !isNaN(industry_input[160]) ? industry_input[160] : 0.015
                    new_industry.offsite_wwtp.wwt_slu_comp_uncovered_pile_EF = !isNaN(industry_input[161]) ? industry_input[161] : 0.025
                    new_industry.offsite_wwtp.wwt_slu_comp_seqst_rate = !isNaN(industry_input[162]) ? industry_input[162] : 0.25
                    new_industry.offsite_wwtp.wwt_mass_slu_inc = !isNaN(industry_input[163]) ? industry_input[163] : 0
                    new_industry.offsite_wwtp.wwt_temp_inc = !isNaN(industry_input[164]) ? industry_input[164] : 1023
                    new_industry.offsite_wwtp.wwt_slu_inc_N_cont = !isNaN(industry_input[165]) ? industry_input[165] : 0
                    new_industry.offsite_wwtp.wwt_slu_inc_SNCR = industry_input[166] == "Yes"  ? 1 : 0

                    new_industry.offsite_wwtp.wwt_mass_slu_app = !isNaN(industry_input[167]) ? industry_input[167] : 0
                    new_industry.offsite_wwtp.wwt_slu_la_solids_content = !isNaN(industry_input[168]) ? industry_input[168] : 0
                    new_industry.offsite_wwtp.wwt_slu_la_TVS = !isNaN(industry_input[169]) ? industry_input[169] : 0
                    new_industry.offsite_wwtp.wwt_slu_la_N_cont = !isNaN(industry_input[170]) ? industry_input[170] : 0
                    new_industry.offsite_wwtp.wwt_slu_la_EF = !isNaN(industry_input[171]) ? industry_input[171] : 0

                    new_industry.offsite_wwtp.wwt_mass_slu_land = !isNaN(industry_input[172]) ? industry_input[172] : 0
                    new_industry.offsite_wwtp.wwt_slu_lf_TVS = !isNaN(industry_input[173]) ? industry_input[173] : 0
                    new_industry.offsite_wwtp.wwt_slu_lf_uncertainty = !isNaN(industry_input[174]) ? industry_input[174] : 0.9
                    new_industry.offsite_wwtp.wwt_slu_lf_CH4_in_gas = !isNaN(industry_input[175]) ? industry_input[175] : 50
                    new_industry.offsite_wwtp.wwt_slu_lf_DOCf = !isNaN(industry_input[176]) ? industry_input[176] : 80
                    new_industry.offsite_wwtp.wwt_slu_lf_decomp_3yr = !isNaN(industry_input[177]) ? industry_input[177] : 69.9
                    new_industry.offsite_wwtp.wwt_slu_lf_MCF = !isNaN(industry_input[178]) ? industry_input[178] : 1
                    new_industry.offsite_wwtp.wwt_slu_lf_N_cont = !isNaN(industry_input[179]) ? industry_input[179] : 0
                    new_industry.offsite_wwtp.wwt_slu_lf_low_CN_EF = !isNaN(industry_input[180]) ? industry_input[180] : 0.015
                    new_industry.offsite_wwtp.wwt_mass_slu_stock = !isNaN(industry_input[181]) ? industry_input[181] : 0
                    new_industry.offsite_wwtp.wwt_slu_sp_lifespan = !isNaN(industry_input[182]) ? industry_input[182] : 0
                    new_industry.offsite_wwtp.wwt_trck_typ = industry_input[183] == "Yes"  ? 1 : 0
                    new_industry.offsite_wwtp.wwt_vol_tslu = !isNaN(industry_input[184]) ? industry_input[184] : 0
                  }

                  assessment.industries.push(new_industry)
                } catch (error) {
                  console.log(error)
                }
              }

            }
          })
        })
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

}

.load_and_save{
  border: 2px solid #1C195B;
  border-radius: 10px;
}

</style>