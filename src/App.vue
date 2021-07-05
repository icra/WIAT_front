<template>
  <v-app id="app">
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
                  <v-icon color = "#F2F4F3" @click="rightMenu = !rightMenu">
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

      <v-navigation-drawer
          style="z-index:1; background-color: #F2F4F3"
          v-model="rightMenu"
          :width="rightMenu ? '15vw' : '0vw'"
          flat
      >
        <h1>Assessment list</h1>
        <div class = "assessment_list">
          <v-list>
            <v-list-item-group v-model="asdf">
              <v-list-item
                  v-for="(assessment, index ) in created_assessments"
                  :key="index"
              >
                  {{assessment.name}}

                <br>
                <v-list>
                  <v-list-item
                      v-for="(industry, index_ind ) in assessment.industries"
                      :key="industry.name"
                  >
                    {{industry.name}}
                  </v-list-item>
                </v-list>
              </v-list-item>
            </v-list-item-group>

          </v-list>
        </div>

      </v-navigation-drawer>
      <v-main :class="rightMenu ? 'sidebar_enabled' : 'sidebar_disabled'">
        <div class="content">
          <router-view></router-view>
        </div>

      </v-main>
    </v-layout>

  </v-app>
</template>

<script>
export default {
  data () {
    return {
      rightMenu: true,
      items: [
        { title: "Maps and Datasets", icon: 'mdi-map', to:"map" },
        { title: "Add assessment", icon: 'mdi-plus-circle-outline', to:"new_assessment" },
        { title: "Import assessment", icon: 'mdi-import', to:"map"},
        { title: "Export data", icon: 'mdi-export', to:"map" },
        { title: "Show statistics", icon: 'mdi-chart-areaspline', to:"map" },
      ],
      created_assessments: this.$assessments,
      assessment_selected: null
    }
  },
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

.sidebar_enabled{
  width: 80vw;
}
.sidebar_disabled{
  width: 95vw;
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

</style>