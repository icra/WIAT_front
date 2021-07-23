<template>
  <div class="outer">
    <h1>Load and save file</h1>
    <v-row class="mt-3">
      <v-col class="load_and_save ma-2" cols="6">

        <v-row>
          <v-col>
            <v-container fluid >
              <v-radio-group
                  v-model="option_for_import"
                  mandatory
              >
                <v-radio
                    label="Replace current list"
                    value="replace"
                ></v-radio>
                <v-radio
                    label="Append to current list"
                    value="append"
                ></v-radio>
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
      <v-col class="load_and_save ma-2 flex" cols="5">
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
  </div>
</template>

<script>
import {Assessment, Industry } from "../ecam_backend";

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
      location_markers: this.$location_markers
    }
  },
  methods: {
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
    async onUpload(){
      let _this = this
      try {
        let imported_assessments = await this.fileToJSON(this.imported_file)

        if(_this.option_for_import === 'replace'){
          //Empty arrays
          _this.created_assessments.splice(0,_this.created_assessments.length)
          _this.location_markers.splice(0,_this.location_markers.length)
        }

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


            let new_industry = new Industry()
            for(let [key, value] of Object.entries(industry)){
              new_industry[key] = value
            }
            new_assessment.industries.push(new_industry)

          })
          _this.created_assessments.push(new_assessment)
        })

        //Repeat loop but for adding markers to map
        this.created_assessments.forEach((assessment, assessment_index )=> {
          let industries = assessment.industries
          industries.forEach((industry, industry_index)=> {
            _this.location_markers.push({
              industry: industry_index,
              assessment: assessment_index,
              latlng: industry.location
            })

          })
        })


      } catch (e) {
        //error
      }

    }
  },
  created()  {

  }

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