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

      <!-- Main sidebar -->
      <v-navigation-drawer
          style="z-index:2"
          clipped
          permanent
          mini-variant
          mini-variant-width="5vw"
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

      <!-- Assessment and factory sidebar -->
      <v-navigation-drawer
          style="z-index:1; background-color: #F2F4F3"
          v-model="secondMenu"
          :width="secondMenu ? '15vw' : '0vw'"
          flat
      >

        <div style="display: flex; justify-content: flex-end; padding: 7px ">
          <v-icon @click="secondMenu = !secondMenu">mdi-close</v-icon>
        </div>

        <h1>Assessment list</h1>

        <div
            v-for="(assessment, index ) in created_assessments"
            :key="assessment.name"
        >
          {{assessment.name}}
          <router-link :to="{ name: 'new_industry', params: {assessment_id: index } }">
            <v-icon color = "black">mdi-plus-circle-outline</v-icon>
          </router-link>
          <br>
          <v-list>
            <v-list-item
                v-for="(industry, index_ind ) in assessment.industries"
                :key="industry.name"
            >
              {{industry.name}}
            </v-list-item>
          </v-list>
        </div>

        <v-btn block @click="rightMenu = !rightMenu">
          Create assessment
        </v-btn>
      </v-navigation-drawer>

      <!-- Main content -->
      <v-main :class=class_for_main_content>
        <div class="content">
          <router-view></router-view>
        </div>
      </v-main>

      <!-- Assessment/Company creation sidebar -->
      <v-navigation-drawer
          v-model="rightMenu"
          style="background-color: #F2F4F3"
          :width="rightMenu ? '15vw' : '0vw'"
          flat
      >
        <div style="padding: 7px ">
          <v-icon @click="rightMenu = !rightMenu">mdi-close</v-icon>
        </div>
        <div>
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
      </v-navigation-drawer>

    </v-layout>

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
      assessment_name: null,     //Default name for creating an assessment
      new_assessment_rules: {
        name: value => {  //Assessment name must be unique
          let assessments_with_same_name = this.created_assessments.filter(assessment => {
            return assessment.name === value
          })
          return assessments_with_same_name.length === 0 || 'An assessment with same name already exists. '
        },
        required: value => !!value || 'Required.',
      },
      new_assessment_valid: false
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
    }
  }
}
</script>

<style>


html {
  overflow: hidden !important;
  scrollbar-width: none;
  -ms-overflow-style: none;
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

</style>