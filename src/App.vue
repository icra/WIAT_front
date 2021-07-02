<template>
  <v-app id="app">
    <v-toolbar flat>
      <v-toolbar-title class="headline">
        <span>Testing...</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
    </v-toolbar>
    <v-layout fill-height>
      <v-navigation-drawer
          style="z-index:2"
          dark
          clipped
          stateless
          v-model="leftMenu"
      >
        <v-container ma-0 pa-0>
          <v-toolbar flat>
            <span>Some helper toolbar</span>
          </v-toolbar>
        </v-container>
        <v-list>
          <v-list-tile>
            <v-list-tile-action>
              <v-icon @click="rightMenu = !rightMenu">android</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>Task Menu</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-navigation-drawer>
      <v-navigation-drawer id="nav2"
                           dark
                           style="z-index:1"
                           v-model="rightMenu"
                           stateless>
        <v-list>
          <v-list-tile>
            <v-list-tile-content>
              <v-list-tile-title>Testing right nav</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-navigation-drawer>
      <v-main>
        <router-view></router-view>
      </v-main>
    </v-layout>

  </v-app>
</template>

<script>
import Navbar from "@/components/Navbar";
export default {
  components: {Navbar},
  data () {
    return {
      leftMenu: true,
      rightMenu: false,
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
#app{
  background-color: aqua
}
</style>