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
          style="z-index:2; max-height: 100%; min-width: 35px; max-width: 70px "
          clipped
          permanent
          mini-variant
          mini-variant-width="3.25vw"
          height="100%"

      >

        <div class="icon_sidebar_container">
          <v-list height="100%">
            <div class="icon_sidebar_list">
              <v-hover v-slot:default="{ hover }">
                <v-list-item :class="hover ? 'icon_hovered_pressed' : ''" @click="secondMenu = !secondMenu" style="height: 75px">
                  <v-list-item-icon>
                    <v-icon color = "#F2F4F3" v-if="secondMenu">
                      mdi-arrow-left
                    </v-icon>
                    <v-icon color = "#F2F4F3" v-else>
                      mdi-arrow-right
                    </v-icon>
                  </v-list-item-icon>
                  <v-list-item-content></v-list-item-content>
                </v-list-item>
              </v-hover>
              <v-list-item-group>
                <v-hover
                    v-slot:default="{ hover }"
                    v-for="(item, index) in items"
                    :key="item.title"
                >
                  <v-list-item
                      @click="left_side_menu_icon_selected(index)"
                      :class="(hover || icon_selected === index)? 'icon_hovered_pressed' : ''"
                      :to="{ name: item.to}"
                      style="height: 75px" :value="index"
                  >
                    <v-list-item-icon>
                      <v-icon color = "#F2F4F3">
                        {{ item.icon }}
                      </v-icon>
                    </v-list-item-icon>
                    <v-list-item-content></v-list-item-content>
                  </v-list-item>
                </v-hover>

              </v-list-item-group>
            </div>
          </v-list>
        </div>
      </v-navigation-drawer>

      <!-- Assessment and factory sidebar (second) -->
      <v-navigation-drawer
          style="z-index:1; background-color: #F2F4F3; height: 100vh; max-width: 330px"
          v-model="secondMenu"
          :width="secondMenu ? '20vw' : '0vw'"
          flat

      >

        <div style=" height: 90vh; display: flex; flex-flow: column; width: 100%; padding: 10px">
          <div style="display: flex; justify-content: flex-end; padding: 7px ">
            <v-icon @click="secondMenu = !secondMenu">mdi-close</v-icon>
          </div>

          <h1>Assessment list</h1>
          <!-- <div style = "overflow-y: auto; height: 75%; max-height: 75%; width: 100%"> -->
          <div style="flex: 2;  /* 1 and it will fill whole space left if no flex value are set to other children*/
          overflow: auto; width: 100%">
            <v-expansion-panels focusable v-model="assessment_expansion_panel">
              <v-expansion-panel
                  v-for="(assessment, assessment_index ) in created_assessments"
                  :key="assessment.name"
                  @click.native.stop
              >
                <v-expansion-panel-header disable-icon-rotate>
                  <b>{{ assessment.name }}</b>
                  <template v-slot:actions>
                    <v-hover v-slot:default="{ hover }" style="margin-right: 10px">
                      <v-icon v-if="assessment_active[assessment_index]" :color="hover ? '#463FCA' : '#1C195B'" @click="hide_show_industries(assessment_index)" @click.native.stop>
                        mdi-eye
                      </v-icon>
                      <v-icon v-else :color="hover ? '#463FCA' : '#1C195B'" @click="hide_show_industries(assessment_index)" @click.native.stop>
                        mdi-eye-off
                      </v-icon>

                    </v-hover>

                    <v-hover v-slot:default="{ hover }">
                      <v-icon :color="hover ? '#463FCA' : '#1C195B'" @click="open_edit_assessment_tab(assessment_index)" @click.native.stop>
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
                            style="float: right; margin-right: 3px"
                            :color="hover ? '#463FCA' : '#1C195B'"
                            size="18px"
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
          <div style="padding-bottom: 20px; min-width: 100px; margin-top: 10px">
            <v-btn
                style="width: 100%; "
                @click="rightMenu = true; right_sidebar_content = 1; assessment_name = null"
                small outlined block>
              Create assessment
            </v-btn>
          </div>
        </div>

      </v-navigation-drawer>

      <!-- Main content -->
      <v-main :class=class_for_main_content>
        <div class="content">
          <router-view :selected_assessment="assessment_expansion_panel" :selected_layer="selected_layer" @createIndustry="createNewIndustry" @editIndustry="open_edit_industry_tab" @selectLayer="toggleLayerSelection" @closeLayer="applyLayer(selected_layer)" ref="reference"></router-view>
        </div>
      </v-main>

      <!--right menu -->
      <v-navigation-drawer
          v-model="rightMenu"
          style="background-color: #F2F4F3; max-width: 310px"
          :width="rightMenu ? '18vw' : '0vw'"
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
                :rules="[new_assessment_rules_name, rules_required]"
            ></v-text-field>
            <v-btn
                :disabled="!new_assessment_valid"
                @click="create_assessment"
                small
                outlined
                block
            >
              Create assessment
            </v-btn>
          </v-form>
        </div>
        <!-- Edit assessment -->
        <div v-else-if="right_sidebar_content === 2" >
          <div style="margin: 7px; padding: 7px; background-color: white">
            <h1>Edit assessment</h1>
            <v-form
                v-model="new_assessment_valid"
            >
              <v-text-field
                  v-model="assessment_name"
                  :rules="[edit_assessment_rules, rules_required]"

              ></v-text-field>
              <v-btn
                  :disabled="!new_assessment_valid"
                  @click="edit_assessment"
                  small
                  outlined
              >
                Edit
              </v-btn>
            </v-form>
          </div>
          <div style="margin: 7px; padding: 7px;">
            <v-btn @click = "delete_assessment" small outlined>
              Delete
            </v-btn>
          </div>

        </div>
        <!-- edit industry -->
        <div v-else-if="right_sidebar_content === 3">
          <div style="margin: 7px; padding: 7px; background-color: white">
            <h1>Edit industry</h1>
            <v-form
                v-model="new_factory_valid"
            >
              <v-text-field
                  v-model="factory_name"
                  :rules="[edit_industry_rules_name, rules_required]"
              ></v-text-field>
              <v-btn
                  :disabled="!new_factory_valid"
                  @click="edit_industry"
                  small
                  outlined
                  block
              >
                Edit industry
              </v-btn>
            </v-form>
          </div>
          <div style="margin: 7px; padding: 7px;">
            <v-btn :to="{ name: 'edit_industry', params: {assessment_id: selected_assessment, industry_id: selected_industry}}" small outlined block @click="icon_selected = -1">
              Advanced INPUTS
            </v-btn>
            <v-btn @click="delete_industry" small outlined block>
              Delete
            </v-btn>
            <v-btn block small outlined :to="{ name: 'statistics_industry', params: {assessment_id: selected_assessment, industry_id: selected_industry}}" @click="icon_selected = -1">
              SHOW RESULTS
            </v-btn>

          </div>
        </div>

        <!-- map info -->
        <!--
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
          <div style="margin: 7px; padding:7px">
            <v-btn
                :disabled="assessment_expansion_panel === undefined"
                @click="right_sidebar_content = 5; factory_name = null"
                small
                outlined
            >
              ADD NEW INDUSTRY
            </v-btn>

          </div>
        </div>
        -->
        <!-- Create industry -->
        <div v-else-if="right_sidebar_content === 5">
          <div style="margin: 7px; padding: 7px; background-color: white">
            <h1>New industry</h1>
            <v-form
                v-model="new_factory_valid"
            >
              <v-text-field
                  v-model="factory_name"
                  label="Industry name"
                  :rules="[new_factory_rules_name, rules_required]"

              ></v-text-field>
              <v-btn
                  :disabled="!new_factory_valid"
                  @click="add_factory"
                  small
                  outlined
                  block

              >
                Add industry
              </v-btn>
            </v-form>

          </div>

        </div>
        <!-- Select layer -->
        <div v-else-if="right_sidebar_content === 6">
          <div style="margin: 7px; padding: 7px; background-color: white;">
            <h1>Layer selection</h1>

            <v-row dense>

              <v-col cols="12">

                <v-text-field
                    prepend-inner-icon="mdi-magnify"
                    v-model="search_layer_model"
                    label="Search layer"
                ></v-text-field>

                <div class="layer_list" style="display: flex; flex-flow: column nowrap; width: 100%; height: 70vh">
                  <div
                      v-for="[key, layer] in Object.entries(layers_filtered)"
                      :key="key"
                  >
                    <v-card
                        v-if="key === selected_layer"
                        color="#463FCA"
                        dark
                    >
                      <v-card-title>{{key}}</v-card-title>
                      <v-card-subtitle><b>Category:</b> {{layer.category}} </v-card-subtitle>
                      <v-card-actions>
                        <v-btn text @click="applyLayer(key)">
                          Active
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                    <v-card
                        v-else
                        class="inactive_layer_card"
                    >
                      <v-card-title>{{key}}</v-card-title>
                      <v-card-subtitle><b>Category:</b> {{layer.category}} </v-card-subtitle>
                      <v-card-actions>
                        <v-btn @click="applyLayer(key)" dark color="#463FCA">
                          Add to map
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </div>

                </div>


              </v-col>
            </v-row>

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
import Vue from "vue";

export default {
  data () {
    return {
      secondMenu: true, //Assessment/factory sidebar
      rightMenu: false, //Assessment/Company creation sidebar

      items: [  //Icons for the main sidebar
        { title: "Maps and Datasets", icon: 'mdi-map', to:"map" },
        { title: "Import assessment", icon: 'mdi-import', to:"import"},
        { title: "Report", icon: 'mdi-file-chart', to:"report" },
      ],
      created_assessments: this.$assessments,  //Created assessments
      assessment_name: null,     //V-model name for creating/editing an assessment
      new_assessment_valid: false,  //Enable or disable button for creating new assessment
      right_sidebar_content: null,  //Content of the right sidebar: 1->create assessment, 2->edit assessment, 3->edit industry, 4->map info
      selected_assessment: null,  //Id of the assessment to edit
      factory_name: null, //v-model for creating new factory
      new_factory_valid: false, //Enable or disable button for creating new factory

      selected_industry: null, //Id of the company to edit
      snackbars: {
        new_assessment: {v_model: false, text: "New assessment created correctly", },
        edit_assessment: {v_model: false, text: "Assessment edited correctly", },
        delete_assessment: {v_model: false, text: "Assessment deleted correctly", },
        new_industry: {v_model: false, text: "New industry added correctly", },
        edit_industry: {v_model: false, text: "Industry edited correctly", },
        delete_industry: {v_model: false, text: "Industry deleted correctly", },
        assessment_not_selected: {v_model: false, text: "Can't create industry, please select and assessment first", },
        create_industry_not_in_map: {v_model: false, text: "Can't create industry, please return to the map tab and try again", },

      },
      map_content_info: {}, //Info to show when the map is clicked
      assessment_expansion_panel: undefined, //Selected assessment in expansion panel
      latlng_selected: null, //Coordinates of point in the map
      icon_selected: 0, //first sidebar icon selected
      assessment_active: this.$assessment_active, //if assessment_active[i]=true, industries of the i-th assessment are shown on the map
      selected_layer: null,  //Selected layer
      layers_description: this.$layers_description,
      search_layer_model: "",
    }
  },
  watch: {

  },
  methods: {


    left_side_menu_icon_selected(index){
      this.icon_selected = index;
      if (this.icon_selected !== 0 && this.right_sidebar_content === 6) this.rightMenu=false  //Close layer selection menu if map is not active
    },
    applyLayer(key){  //Selected layer to apply
      if (this.selected_layer === key) this.selected_layer = null
      else this.selected_layer = key
    },
    update_markers(){
      let _this = this
      this.$location_markers.splice(0,this.$location_markers.length)
      for (let assessment=0; assessment<_this.$assessments.length; assessment++) {
        if(_this.assessment_active[assessment]){
          for(let industry=0; industry<_this.$assessments[assessment].industries.length; industry++){
            let marker = {
              assessment: assessment,
              industry: industry,
              latlng: _this.$assessments[assessment].industries[industry].location
            }
            _this.$location_markers.push(marker)
          }
        }
      }
    },
    toggleLayerSelection(){ //Open or close layer selection menu
      if(this.right_sidebar_content === 6 && this.rightMenu) this.rightMenu = false
      else{
        this.right_sidebar_content = 6
        this.rightMenu = true
      }
    },

    createNewIndustry(latlng){  //Function called from Map component

      if(this.assessment_expansion_panel === undefined){
        this.snackbars.assessment_not_selected.v_model = true
      }else{
        this.rightMenu = true
        this.right_sidebar_content = 5;
        this.factory_name = null
        this.latlng_selected = latlng
      }

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
      this.assessment_active.push(true)
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
      this.assessment_active.splice(this.selected_assessment, 1)
      this.update_markers()
      try {
        this.$refs.reference.industries_deleted()
      } catch (error) {}

    },
    add_factory(){
      if(this.icon_selected === 0){
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
        this.snackbars.new_industry.v_model = true
        this.$refs.reference.industry_created()
      }else {
        this.snackbars.create_industry_not_in_map.v_model = true
      }
      this.rightMenu = false
      this.factory_name = null
    },
    open_edit_industry_tab(assessment_index, industry_index){
      this.right_sidebar_content = 3
      this.rightMenu = true
      this.factory_name = this.created_assessments[assessment_index].industries[industry_index].name
      this.selected_assessment = assessment_index
      this.selected_industry = industry_index
      this.assessment_expansion_panel = assessment_index
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
      try {
        this.$refs.reference.industries_deleted()
      } catch (error) {}
    },
    new_factory_rules_name(value) {  //Rules for creating new industry
      let factories_with_same_name = this.created_assessments[this.assessment_expansion_panel].industries.filter(company => {
        return company.name === value
      })
      if (factories_with_same_name.length === 0) return true
      else return 'An industry with same name already exists. '
    },
    rules_required(value) {  //Rules for creating new factory
      if(!!value) return true
      else return 'Required.'
    },
    edit_industry_rules_name(value){ //Rules for editing industry
      let industries_with_same_name = this.created_assessments[this.selected_assessment].industries.filter(industry => {
        return industry.name === value
      })
      if (industries_with_same_name.length === 0 || (industries_with_same_name.length === 1 && this.created_assessments[this.selected_assessment].industries[this.selected_industry].name === value)) return true  //If there is an assessment with the same name, must be the edited assessment
      else return 'An assessment with same name already exists.'
    },
    new_assessment_rules_name(value){//Rules for creating new assessment
      let assessments_with_same_name = this.created_assessments.filter(assessment => {
        return assessment.name === value
      })
      if (assessments_with_same_name.length === 0) return true
      else return 'An assessment with same name already exists.'
    },
    edit_assessment_rules(value){//Rules for editing assessment
      let assessments_with_same_name = this.created_assessments.filter(assessment => {
        return assessment.name === value
      })
      if (assessments_with_same_name.length === 0 || (assessments_with_same_name.length === 1 && this.created_assessments[this.selected_assessment].name === value)) return true
      else return 'An assessment with same name already exists.' //If there is an assessment with the same name, must be the edited assessment

    },
    hide_show_industries(assessment_index){
      this.assessment_active[assessment_index] = !this.assessment_active[assessment_index] //hide/show industries of the assessment
      if(this.assessment_active[assessment_index]){
        //show assessment
        this.update_markers()
      }else{
        //hide assessment
        let location_markers = this.$location_markers
        for (let i = location_markers.length - 1; i >= 0; i--) {
          if (location_markers[i].assessment === assessment_index) {
            location_markers.splice(i, 1);
          }
        }

      }
    }
  },
  computed: {
    layers_filtered: function() {
      if(!this.search_layer_model) return this.layers_description
      else {
        let filtered = {}
        for(let [key, value] of Object.entries(this.layers_description)){
          if(key.toLowerCase().includes(this.search_layer_model.toLowerCase())) filtered[key] = value //name matches
          else if(value.category.toLowerCase().includes(this.search_layer_model.toLowerCase())) filtered[key] = value //category matches
        }
        return filtered

      }
    }
  }

}
</script>

<style>


html {
  overflow: hidden !important;
  scrollbar-width: none;
  -ms-overflow-style: none;
  width: 100%;
  height:100%;
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
}

.content{
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #F2F4F3;
}

.icon_hovered_pressed{
  background-color: #463FCA;
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

.layer_list{
  overflow: auto;
  width: 100%;
  flex: 2;  /* 1 and it will fill whole space left if no flex value are set to other children*/
}


</style>