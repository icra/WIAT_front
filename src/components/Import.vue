<template>
  <div class="outer">
    <h1>Load and save file</h1>
    <v-row class="mt-3">
      <v-col class="load_and_save ma-2" cols="12">

        <v-row>
          <v-col>
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
                    <span>Replace assessments</span>
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
                    <span>Append industries and assessments</span>
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
          <v-col class="flex">
            <v-file-input
                label="File input"
                v-model="imported_file"
                @change="onUpload"
            ></v-file-input>

          </v-col>
        </v-row>


      </v-col>
      <v-col class="load_and_save ma-2 flex" cols="12">
        <v-input>
          <div  class="flex">
            <v-text-field
                label="File name"
                required
                v-model="export_file_name"
            >

            </v-text-field>
            <v-btn
                @click="download_json"
                small
                outlined
                style="float: right;"
                class="ml-8 mr-8"
            >
              SAVE SESSION
              <v-icon right>
                mdi-cloud-download
              </v-icon>
            </v-btn>

          </div>

        </v-input>
      </v-col>
    </v-row>
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
  Industrial_wwtp_onsite,
  Industrial_wwtp_onsite_external_domestic,
  Industrial_wwtp_onsite_external_industrial,
  Direct_discharge,
  Industrial_wwtp_offsite,
  Domestic_wwtp
} from "../ecam_backend";

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
      snackbar_text: ""
    }
  },
  methods: {

    copy_wwtp(wwtp, type, industry_type){

      const classes = {
        Industrial_wwtp_onsite,
        Industrial_wwtp_onsite_external_domestic,
        Industrial_wwtp_onsite_external_industrial,
        Direct_discharge,
        Industrial_wwtp_offsite,
        Domestic_wwtp
      };

      let new_wwtp = new classes[type];
      for (let key of Object.keys(new_wwtp)){
        if(typeof wwtp[key] !== "function") new_wwtp[key] = wwtp[key]
      }
      new_wwtp.industry_type = industry_type
      return new_wwtp
    },

    copyIndustry(industry){
      let new_industry = new Industry()
      new_industry.name = industry.name
      new_industry.location = industry.location
      new_industry.has_onsite_wwtp = industry.has_onsite_wwtp
      new_industry.has_offsite_wwtp = industry.has_offsite_wwtp
      new_industry.offsite_wwtp_type = industry.offsite_wwtp_type
      new_industry.volume_withdrawn = industry.volume_withdrawn
      new_industry.has_direct_discharge = industry.has_direct_discharge
      new_industry.industry_type = industry.industry_type
      new_industry.tn_effl_concentration = industry.tn_effl_concentration
      new_industry.tp_effl_concentration = industry.tp_effl_concentration
      new_industry.bod_effl_concentration = industry.bod_effl_concentration
      new_industry.vol_used = industry.vol_used

      new_industry.diclo_effl= industry.diclo_effl //1,2-Dichloroethane
      new_industry.cadmium_effl= industry.cadmium_effl //Cadmium
      new_industry.hexaclorobenzene_effl= industry.hexaclorobenzene_effl //Hexachlorobenzene
      new_industry.mercury_effl= industry.mercury_effl //mercury
      new_industry.plomo_effl= industry.plomo_effl //lead
      new_industry.niquel_effl= industry.niquel_effl //nickel
      new_industry.chloro_effl= industry.chloro_effl //chloroalkanes
      new_industry.hexaclorobutadie_effl= industry.hexaclorobutadie_effl //Hexachlorobutadiene
      new_industry.nonilfenols_effl= industry.nonilfenols_effl //Nonylphenols
      new_industry.tetracloroetile_effl= industry.tetracloroetile_effl //tetrachloroethene
      new_industry.tricloroetile_effl= industry.tricloroetile_effl //Trichloroethylene


      if(new_industry.has_onsite_wwtp)
        if(new_industry.has_offsite_wwtp){
          if(new_industry.offsite_wwtp_type === "Domestic") new_industry.onsite_wwtp = this.copy_wwtp(industry.onsite_wwtp, "Industrial_wwtp_onsite_external_domestic", new_industry.industry_type)
          else new_industry.onsite_wwtp = this.copy_wwtp(industry.onsite_wwtp, "Industrial_wwtp_onsite_external_industrial", new_industry.industry_type) //Industrial
        } else new_industry.onsite_wwtp = this.copy_wwtp(industry.onsite_wwtp, "Industrial_wwtp_onsite", new_industry.industry_type)
      else new_industry.onsite_wwtp = null

      if(new_industry.has_offsite_wwtp){
        if(new_industry.offsite_wwtp_type === "Industrial") new_industry.offsite_wwtp_type = this.copy_wwtp(industry.offsite_wwtp, "Industrial_wwtp_offsite", new_industry.industry_type)
        else new_industry.offsite_wwtp_type = this.copy_wwtp(industry.offsite_wwtp, "Domestic_wwtp",new_industry.industry_type)
      }
      else new_industry.offsite_wwtp = null


      if(new_industry.has_direct_discharge) new_industry.direct_discharge = this.copy_wwtp(industry.direct_discharge, "Direct_discharge", new_industry.industry_type)
      else new_industry.direct_discharge = null

      return new_industry

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

<style>

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