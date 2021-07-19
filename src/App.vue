<template>
  <v-app id="app">

    <!-- Header -->
    <v-toolbar
        height="75px"
        width="100%"
    >
      <div class="header">
        <v-icon size="90">$icra_logo</v-icon>
        <v-icon size="90">$icra_logo</v-icon>
        <v-icon size="90">$icra_logo</v-icon>
      </div>

    </v-toolbar>
    <v-layout fill-height>

      <!-- Main sidebar (first)-->
      <v-navigation-drawer
          style="z-index:2; max-height: 100%"
          clipped
          permanent
          mini-variant
          mini-variant-width="3.25vw"
          height="100%"
      >

        <div class="icon_sidebar_container">
          <v-list height="100%">
            <div class="icon_sidebar_list">
              <v-list-item>
                <v-list-item-action>
                  <v-icon color = "#F2F4F3" @click="secondMenu = !secondMenu">
                    mdi-arrow-expand-right
                  </v-icon>
                </v-list-item-action>
              </v-list-item>
              <v-list-item
                  v-for="item in items"
                  :key="item.title"
              >
                <v-list-item-action>
                  <router-link :to="{ name: item.to}">
                    <v-icon color = "#F2F4F3">
                      {{ item.icon }}
                    </v-icon>
                  </router-link>
                </v-list-item-action>
              </v-list-item>

            </div>
          </v-list>
        </div>
      </v-navigation-drawer>

      <!-- Assessment and factory sidebar (second) -->
      <v-navigation-drawer
          style="z-index:1; background-color: #F2F4F3;"
          v-model="secondMenu"
          :width="secondMenu ? '15vw' : '0vw'"
          flat

      >

        <div style=" height: 100%; position: fixed; width: 100%; padding: 10px">
          <div style="display: flex; justify-content: flex-end; padding: 7px ">
            <v-icon @click="secondMenu = !secondMenu">mdi-close</v-icon>
          </div>

          <h1>Assessment list</h1>
          <div style = "overflow-y: auto; height: 80%; max-height: 80%; width: 100%">
            <v-expansion-panels focusable v-model="assessment_expansion_panel">
              <v-expansion-panel
                  v-for="(assessment, assessment_index ) in created_assessments"
                  :key="assessment.name"
                  @click.native.stop
              >
                <v-expansion-panel-header disable-icon-rotate>
                  {{ assessment.name }}
                  <template v-slot:actions>
                    <v-hover v-slot:default="{ hover }">
                      <v-icon color="#1C195B" :size="hover ? '25px' : '20px'" @click="open_edit_assessment_tab(assessment_index)" @click.native.stop>
                        mdi-cog
                      </v-icon>
                    </v-hover>

                  </template>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <div
                    v-for="(industry,industry_index ) in created_assessments[assessment_index].industries"
                    :key="industry.name"
                    style="display: flex; align-items: flex-end"
                  >
                    <div>
                      {{industry.name}}
                    </div>
                    <div style="flex-grow: 1; display: block;">
                      <v-hover v-slot:default="{ hover }">
                        <v-icon
                            @click = "open_edit_industry_tab(assessment_index, industry_index)"
                            style="float: right; margin-right: 1px"
                            :size="hover ? '23px' : '20px'"
                        >
                          mdi-circle-edit-outline
                        </v-icon>
                      </v-hover>
                    </div>
                  </div>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
          </div>
          <v-btn style="width: 100%" @click="rightMenu = true; right_sidebar_content = 1; assessment_name = null">
            Create assessment
          </v-btn>
        </div>

      </v-navigation-drawer>

      <!-- Main content -->
      <v-main :class=class_for_main_content>
        <div class="content">
          <router-view @mapContent="toggleMapContent" @editIndustry="open_edit_industry_tab"></router-view>
        </div>
      </v-main>

      <!--right menu -->
      <v-navigation-drawer
          v-model="rightMenu"
          style="background-color: #F2F4F3"
          :width="rightMenu ? '15vw' : '0vw'"
          flat
      >
        <div style="padding: 17px ">
          <v-icon @click="rightMenu = !rightMenu">mdi-close</v-icon>
        </div>
        <!-- Assessment creation -->
        <div v-if="right_sidebar_content === 1" style="margin: 7px; padding: 7px; background-color: white">
          <h1>Create assessment</h1>
          <v-form
              ref="create_assessment_ref"
              v-model="new_assessment_valid"
          >
            <v-text-field
                v-model="assessment_name"
                label="Assessment name"
                :rules="[new_assessment_rules.name, new_assessment_rules.required]"
            ></v-text-field>
            <v-btn
                :disabled="!new_assessment_valid"
                @click="create_assessment">
              Create assessment
            </v-btn>
          </v-form>
        </div>
        <!-- Edit settings -->
        <div v-else-if="right_sidebar_content === 2" >
          <h1>Edit assessment</h1>
          <div style="margin: 7px; padding: 7px; background-color: white">
            <v-form
                v-model="new_assessment_valid"
            >
              <v-text-field
                  v-model="assessment_name"
                  :rules="[edit_assessment_rules.name, edit_assessment_rules.required]"

              ></v-text-field>
              <v-btn
                  :disabled="!new_assessment_valid"
                  @click="edit_assessment"

              >
                Edit
              </v-btn>
            </v-form>
          </div>

          <v-btn @click = "delete_assessment">
            Delete
          </v-btn>

        </div>
        <div v-else-if="right_sidebar_content === 3">
          <div style="margin: 7px; padding: 7px; background-color: white">
            <h1>Edit industry</h1>
            <v-form
                v-model="new_factory_valid"
            >
              <v-text-field
                  v-model="factory_name"
                  :rules="[edit_industry_rules.name, edit_industry_rules.required]"
              ></v-text-field>
              <v-btn
                  :disabled="!new_factory_valid"
                  @click="edit_industry">
                Edit industry
              </v-btn>
            </v-form>
            <v-btn :to="{ name: 'edit_industry', params: {assessment_id: selected_assessment, industry_id: selected_industry}}">
              Advanced edit
            </v-btn>
            <v-btn @click="delete_industry">
              Delete
            </v-btn>
            <v-btn :to="{ name: 'statistics_industry', params: {assessment_id: selected_assessment, industry_id: selected_industry}}">
              STATISTICS
            </v-btn>

          </div>
        </div>
        <div v-else-if="right_sidebar_content === 4">
          <div style="margin: 7px; padding: 7px; background-color: white">
            <h1>Map info</h1>
            <span
                v-for="[key, value] in Object.entries(map_content_info)"
                :key="key"
            >
              <b>{{key}}</b>: <p>{{value}}</p>
            </span>
          </div>
          <v-btn
              :disabled="assessment_expansion_panel === undefined"
              @click="right_sidebar_content = 5; factory_name = null"
          >
            ADD NEW INDUSTRY
          </v-btn>

        </div>
        <div v-else-if="right_sidebar_content === 5">
          <div style="margin: 7px; padding: 7px; background-color: white">
            <h1>New industry</h1>
            <v-form
                v-model="new_factory_valid"
            >
              <v-text-field
                  v-model="factory_name"
                  label="Industry name"
                  :rules="[new_factory_rules.name, new_factory_rules.required]"

              ></v-text-field>
              <v-btn
                  :disabled="!new_factory_valid"
                  @click="add_factory"

              >
                Add industry
              </v-btn>
            </v-form>

          </div>

        </div>

      </v-navigation-drawer>

    </v-layout>

    <!-- Snackbars -->
    <v-snackbar
        v-for="[key, snackbar] in Object.entries(snackbars)"
        :key="key"
        v-model="snackbar.v_model"
        :timeout="2000"
    >
      {{ snackbar.text }}
      <template v-slot:action="{ attrs }">
        <v-btn
            color="pink"
            text
            v-bind="attrs"
            @click="snackbar.v_model = false"
        >
          CLOSE
        </v-btn>
      </template>
    </v-snackbar>

  </v-app>
</template>

<script>

import {Assessment, Industry } from "./ecam_backend";

export default {
  data () {
    let _this = this
    return {
      secondMenu: true, //Assessment/factory sidebar
      rightMenu: false, //Assessment/Company creation sidebar

      items: [  //Icons for the main sidebar
        { title: "Maps and Datasets", icon: 'mdi-map', to:"map" },
        { title: "Import assessment", icon: 'mdi-import', to:"map"},
        { title: "Export data", icon: 'mdi-export', to:"map" },
        { title: "Show statistics", icon: 'mdi-chart-areaspline', to:"map" },
      ],
      created_assessments: this.$assessments,  //Created assessments
      assessment_name: null,     //V-model name for creating/editing an assessment
      new_assessment_rules: { //Rules for creating new assessment
        name: value => {  //Assessment name must be unique
          let assessments_with_same_name = _this.created_assessments.filter(assessment => {
            return assessment.name === value
          })
          return assessments_with_same_name.length === 0 || 'An assessment with same name already exists. '
        },
        required: value => !!value || 'Required.',
      },
      edit_assessment_rules: { //Rules for editing assessment
        name: value => {  //Assessment name must be unique
          let assessments_with_same_name = _this.created_assessments.filter(assessment => {
            return assessment.name === value
          })
          return (assessments_with_same_name.length === 0 || (assessments_with_same_name.length === 1 && _this.created_assessments[_this.selected_assessment].name === value)) || 'An assessment with same name already exists.' //If there is an assessment with the same name, must be the edited assessment
        },
        required: value => !!value || 'Required.',
      },
      new_assessment_valid: false,  //Enable or disable button for creating new assessment
      right_sidebar_content: null,  //Content of the right sidebar: 1->create assessment, 2->edit assessment, 3->edit industry
      selected_assessment: null,  //Id of the assessment to edit
      factory_name: null, //v-model for creating new factory
      new_factory_rules: { //Rules for creating new factory
        name: value => {  // Factory name must bu unique inside an assessment
          let factories_with_same_name = _this.created_assessments[_this.selected_assessment].industries.filter(company => {
            return company.name === value
          })
          return factories_with_same_name.length === 0 || 'An industry with same name already exists. '
        },
        required: value => !!value || 'Required.',
      },
      new_factory_valid: false, //Enable or disable button for creating new factory
      edit_industry_rules: { //Rules for editing industry
        name: value => {  //Industry name must be unique
          let industries_with_same_name = _this.created_assessments[_this.selected_assessment].industries.filter(industry => {
            return industry.name === value
          })
          return (industries_with_same_name.length === 0 || (industries_with_same_name.length === 1 && _this.created_assessments[_this.selected_assessment].industries[_this.selected_industry].name === value)) || 'An assessment with same name already exists.' //If there is an assessment with the same name, must be the edited assessment
        },
        required: value => !!value || 'Required.',
      },
      selected_industry: null, //Id of the company to edit
      snackbars: {
        new_assessment: {v_model: false, text: "New assessment created correctly", },
        edit_assessment: {v_model: false, text: "Assessment edited correctly", },
        delete_assessment: {v_model: false, text: "Assessment deleted correctly", },
        new_industry: {v_model: false, text: "New industry added correctly", },
        edit_industry: {v_model: false, text: "Industry edited correctly", },
        delete_industry: {v_model: false, text: "Industry deleted correctly", },
      },
      map_content_info: null, //Info to show when the map is clicked
      assessment_expansion_panel: undefined, //Selected assessment in expansion panel
      latlng_selected: null //Coordinates of point in the map


    }
  },
  methods: {
    update_markers(){
      let _this = this
      this.$location_markers.splice(0,this.$location_markers.length)
      for (let assessment=0; assessment<_this.$assessments.length; assessment++) {
        for(let industry=0; industry<_this.$assessments[assessment].industries.length; industry++){
          let marker = {
            assessment: assessment,
            industry: industry,
            latlng: _this.$assessments[assessment].industries[industry].location
          }
          _this.$location_markers.push(marker)
        }
      }
    },
    toggleMapContent(content){
      this.right_sidebar_content = 4
      this.rightMenu = true
      this.map_content_info = content["right bar content"]
      this.latlng_selected = content.latlng
    },
    class_for_main_content() {
      if (this.secondMenu && this.rightMenu) return "two_sidebar_open"
      else if (this.secondMenu || this.rightMenu) return "one_sidebar_open"
      else return "zero_sidebar_open"
    },
    create_assessment() {
      let new_assessment = new Assessment()
      new_assessment.name = this.assessment_name
      this.$assessments.push(new_assessment)
      this.rightMenu = !this.rightMenu
      this.assessment_name = null
      this.snackbars.new_assessment.v_model = true
    },
    open_edit_assessment_tab(assessment_index){
      this.rightMenu = true;
      this.right_sidebar_content = 2;
      this.selected_assessment = assessment_index
      this.assessment_name = this.created_assessments[assessment_index].name

    },
    edit_assessment(){
      this.rightMenu = false
      this.$assessments[this.selected_assessment].name = this.assessment_name
      this.snackbars.edit_assessment.v_model = true
    },
    delete_assessment(){
      this.rightMenu = false
      this.snackbars.delete_assessment.v_model = true
      this.$assessments.splice(this.selected_assessment, 1)
      this.update_markers()
    },
    add_factory(){
      let industry = new Industry()
      industry.name = this.factory_name
      industry.location = this.latlng_selected
      let assessment = this.$assessments[this.assessment_expansion_panel]
      let marker = {
        assessment: this.assessment_expansion_panel,
        industry: assessment.industries.length,
        latlng: this.latlng_selected
      }
      this.$location_markers.push(marker)
      assessment.add_industry(industry)
      this.rightMenu = false
      this.factory_name = null
      this.snackbars.new_industry.v_model = true
    },
    open_edit_industry_tab(assessment_index, industry_index){
      this.right_sidebar_content = 3
      this.rightMenu = true
      this.factory_name = this.created_assessments[assessment_index].industries[industry_index].name
      this.selected_assessment = assessment_index
      this.selected_industry = industry_index
    },
    edit_industry(){
      this.rightMenu = false
      this.$assessments[this.selected_assessment].industries[this.selected_industry].name = this.factory_name
      this.snackbars.edit_industry.v_model = true
    },
    delete_industry(){
      this.rightMenu = false
      this.snackbars.delete_industry.v_model = true
      this.$assessments[this.selected_assessment].delete_industry(this.selected_industry)
      this.update_markers()
    }
  },
}
</script>

<style>


html {
  overflow: hidden !important;
  scrollbar-width: none;
  -ms-overflow-style: none;
  width: 100%;
}

html::-webkit-scrollbar {
  width: 0;
  height: 0;
}
.zero_sidebar_open{
  width: 95vw;
}
.one_sidebar_open{
  width: 80vw;
}
.two_sidebar_open{
  width: 65vw;
}
.header{
  background-color: white;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-evenly;

}

.icon_sidebar_container {
  background-color: #1C195B;
  height: 100%;


}
.icon_sidebar_list {
  height: 100%;
  display: flex;

  justify-content:space-evenly;
  flex-direction: column;
}

.content{
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #F2F4F3;
}


#app {
  background-color: #F2F4F3;
}

.assessment_list{
  background-color: red;
}

#app{
  width: 100%;
}

</style>