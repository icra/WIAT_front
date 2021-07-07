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
                    <v-icon color="teal" @click="rightMenu = true; right_sidebar_content = 2; selected_assessment = assessment_index" @click.native.stop>
                      mdi-map
                    </v-icon>
                  </template>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                  Lorem ipsum dolor sit amet, conssdffffffffff fffffffffffffffff fffffffffffffffffff fffffffffff ffffffffff ffff ffffff fffffffffff fffffff ffffecte tur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
          </div>
          <v-btn block @click="rightMenu = true; right_sidebar_content = 1">
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
        <div v-if="right_sidebar_content === 2">

          <v-tabs
              v-model="tab"
              background-color="deep-purple accent-4"

              dark
          >
            <v-tabs-slider></v-tabs-slider>

            <v-tab href="#tab-1">
              <v-icon>mdi-phone</v-icon>
            </v-tab>

            <v-tab href="#tab-2">
              <v-icon>mdi-heart</v-icon>
            </v-tab>


          </v-tabs>

          <v-tabs-items v-model="tab">
            <v-tab-item
                v-for="i in 3"
                :key="i"
                :value="'tab-' + i"
            >
              <v-card flat>
                <v-card-text>adsfsadf</v-card-text>
              </v-card>
            </v-tab-item>
          </v-tabs-items>

          <v-text-field
              v-model="created_assessments[selected_assessment].name"
              :rules="[new_assessment_rules.name, new_assessment_rules.required]"

          ></v-text-field>
          <v-btn>
            Edit
          </v-btn>
          <v-btn>
            Add factory
          </v-btn>
          <v-btn>
            Delete
          </v-btn>
        </div>
      </v-navigation-drawer>

    </v-layout>
    <v-snackbar
        v-model="new_assessment_snackbar"
        :timeout="2000"
    >
      New assessment created correctly
      <template v-slot:action="{ attrs }">
        <v-btn
            color="pink"
            text
            v-bind="attrs"
            @click="new_assessment_snackbar = false"
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
      assessment_name: null,     //Default name for creating an assessment
      new_assessment_rules: { //Rules for creating new assessment
        name: value => {  //Assessment name must be unique
          let assessments_with_same_name = this.created_assessments.filter(assessment => {
            return assessment.name === value
          })
          return assessments_with_same_name.length === 0 || 'An assessment with same name already exists. '
        },
        required: value => !!value || 'Required.',
      },
      new_assessment_valid: false,  //Enable or disable button for creating new assessment
      new_assessment_snackbar: false, //Snackbar when a new assessment is created
      right_sidebar_content: null,  //Content of the right sidebar: 1->create assessment, 2->assessment information
      selected_assessment: null,
      tab: null
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
      this.new_assessment_snackbar = true
    },
    open_right_sidebar_show_assessment(){
      this.right_sidebar_content = 2
      this.secondMenu = true

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