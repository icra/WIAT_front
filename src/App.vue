<template>
  <v-app id="app">

    <!-- Header -->
    <v-toolbar
        height="100px"
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
          mini-variant-width="5vw"
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

        <div style=" height: 100%; position: fixed; width: 100%">
          <div style="display: flex; justify-content: flex-end; padding: 7px ">
            <v-icon @click="secondMenu = !secondMenu">mdi-close</v-icon>
          </div>

          <h1>Assessment list</h1>
          <div style = "overflow-y: auto; height: 85%; max-height: 85%; width: 100%">
            <v-expansion-panels>
              <v-expansion-panel
                  v-for="(assessment, assessment_index ) in created_assessments"
                  :key="assessment.name"
              >
                <v-expansion-panel-header disable-icon-rotate>
                  {{ assessment.name }}
                  <template v-slot:actions>
                    <v-icon color="teal" @click="open_edit_assessment_tab(assessment_index)" @click.native.stop>
                      mdi-cog
                    </v-icon>
                  </template>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <div
                    v-for="(industry,industry_index ) in created_assessments[assessment_index].industries"
                    :key="industry.name"
                  >
                    {{industry.name}}
                    <v-icon @click = "open_edit_industry_tab(assessment_index, industry_index)">mdi-circle-edit-outline</v-icon>
                  </div>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
          </div>
          <v-btn block @click="rightMenu = true; right_sidebar_content = 1; assessment_name = null">
            Create assessment
          </v-btn>
        </div>

      </v-navigation-drawer>

      <!-- Main content -->
      <v-main :class=class_for_main_content>
        <div class="content">
          <router-view></router-view>
        </div>
      </v-main>

      <!--right menu -->
      <v-navigation-drawer
          v-model="rightMenu"
          style="background-color: #F2F4F3"
          :width="rightMenu ? '15vw' : '0vw'"
          flat
      >
        <div style="padding: 7px ">
          <v-icon @click="rightMenu = !rightMenu">mdi-close</v-icon>
        </div>
        <!-- Assessment creation -->
        <div v-if="right_sidebar_content === 1">
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
        <div v-else-if="right_sidebar_content === 2">

          <v-tabs
              v-model="edit_assessment_tab"
              background-color="deep-purple accent-4"
              dark
          >
            <v-tabs-slider></v-tabs-slider>

            <v-tab href="#tab-edit">
              <v-icon>mdi-circle-edit-outline</v-icon>
            </v-tab>

            <v-tab href="#tab-add-factory">
              <v-icon>mdi-factory</v-icon>
            </v-tab>


          </v-tabs>

          <v-tabs-items v-model="edit_assessment_tab">
            <v-tab-item
                key="edit"
                value="tab-edit"
            >
              <v-card flat>
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
                <v-btn @click = "delete_assessment">
                  Delete
                </v-btn>
              </v-card>
            </v-tab-item>
            <v-tab-item
                key="add-factory"
                value="tab-add-factory"
            >
              <v-card flat>
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

              </v-card>
            </v-tab-item>
          </v-tabs-items>
        </div>
        <div v-else-if="right_sidebar_content === 3">
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
          let assessments_with_same_name = this.created_assessments.filter(assessment => {
            return assessment.name === value
          })
          return assessments_with_same_name.length === 0 || 'An assessment with same name already exists. '
        },
        required: value => !!value || 'Required.',
      },
      edit_assessment_rules: { //Rules for editing assessment
        name: value => {  //Assessment name must be unique
          let assessments_with_same_name = this.created_assessments.filter(assessment => {
            return assessment.name === value
          })
          return (assessments_with_same_name.length === 0 || (assessments_with_same_name.length === 1 && this.created_assessments[this.selected_assessment].name === value)) || 'An assessment with same name already exists.' //If there is an assessment with the same name, must be the edited assessment
        },
        required: value => !!value || 'Required.',
      },
      new_assessment_valid: false,  //Enable or disable button for creating new assessment
      right_sidebar_content: null,  //Content of the right sidebar: 1->create assessment, 2->edit assessment, 3->edit industry
      selected_assessment: null,  //Id of the assessment to edit
      edit_assessment_tab: 0, //Vmodel for edit assessment tab
      factory_name: null, //v-model for creating new factory
      new_factory_rules: { //Rules for creating new factory
        name: value => {  // Factory name must bu unique inside an assessment
          let factories_with_same_name = this.created_assessments[this.selected_assessment].industries.filter(company => {
            return company.name === value
          })
          return factories_with_same_name.length === 0 || 'An industry with same name already exists. '
        },
        required: value => !!value || 'Required.',
      },
      new_factory_valid: false, //Enable or disable button for creating new factory
      edit_industry_rules: { //Rules for editing industry
        name: value => {  //Industry name must be unique
          let industries_with_same_name = this.created_assessments[this.selected_assessment].industries.filter(industry => {
            return industry.name === value
          })
          return (industries_with_same_name.length === 0 || (industries_with_same_name.length === 1 && this.created_assessments[this.selected_assessment].industries[this.selected_industry].name === value)) || 'An assessment with same name already exists.' //If there is an assessment with the same name, must be the edited assessment
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


    }
  },
  methods: {
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
      this.edit_assessment_tab = 0
      this.factory_name = null

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
    },
    add_factory(){
      let industry = new Industry()
      industry.name = this.factory_name
      let assessment = this.$assessments[this.selected_assessment]
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