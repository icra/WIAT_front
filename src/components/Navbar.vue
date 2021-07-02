<template>
  <nav>
    <v-app-bar
        app
        clipped-left
        height="100px"
        width="100%"
        color="white"

    >
      <div class = "header">
        <v-icon size="90">$icra_logo</v-icon>
      </div>
      <div class = "header">
        <v-icon size="90">$icra_logo</v-icon>
      </div>
      <div class = "header">
        <v-icon size="90">$icra_logo</v-icon>
      </div>
    </v-app-bar>

    <v-navigation-drawer
        app
        mini-variant
        mini-variant-width="70"
        clipped
        permanent
    >

      <div class="icon_sidebar_container">
        <v-list
            class="icon_sidebar_list"
        >
          <v-list-item>
            <v-list-item-action>
              <v-icon color = "#F2F4F3">
                mdi-arrow-expand-right
              </v-icon>
            </v-list-item-action>

          </v-list-item>
          <v-list-item
              v-for="item in items"
              :key="item.title"
          >
            <v-list-item-action>
              <v-icon color = "#F2F4F3">
                {{ item.icon }}
              </v-icon>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </div>
    </v-navigation-drawer>




  </nav>
</template>

<script>

export default {
  name: "Navbar",
  components:{

  },
  data () {
    return {
      items: [
        { title: 'Show maps', icon: 'mdi-map' },
        { title: 'Show mapsa', icon: 'mdi-plus-circle-outline' },
        { title: 'Show mapsb', icon: 'mdi-import' },
        { title: 'Show mapsc', icon: 'mdi-export' },
        { title: 'Show mapsd', icon: 'mdi-chart-areaspline' },
      ],
      links: ['Home', 'Contacts', 'Settings'],
      mini: true,
      drawer: false
    }
  },
}
</script>

<style scoped>
.icon_sidebar_container {
  background-color: #1C195B;
  height: 100%;


}
.icon_sidebar_list {
  height: 100%;
  display: flex;
  align-items:center;
  justify-content:center;
  flex-direction: column;

}
.header{
  background-color: white;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

</style>