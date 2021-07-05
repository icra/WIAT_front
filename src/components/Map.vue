<template>

  <div id="mapContainer"></div>

</template>

<script>
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { latLng, Icon } from "leaflet";
delete Icon.Default.prototype._getIconUrl;


import axios from "axios"
import deplession_layer from "../layers/deplession_topo.json"
import stress_layer from "../layers/stress_topo.json"

import VectorTile from "leaflet.vectorgrid/dist/Leaflet.VectorGrid.js";

export default {
  name: "Map",
  components: {
    L
  },
  data() {
    return {
      center2: [47.41322, -1.219482]

    };
  },
  methods: {

    get_population(event) {
      //http://localhost:3000/bona?longitude=2.16992&latitude=41.3879
      let lat = event.latlng.lat
      let lng = event.latlng.lng
      console.log(event.latlng)
      let call = "/bona?longitude="+lng+"&latitude="+lat
      return axios
          .get(call)
          .then(response => {
            return response.data.test[0]["0"]
          })

    },

    setupLeafletMap() {
      let _this = this

      const mapDiv = L.map("mapContainer", {
        center: this.center2,
        zoom: 13,
        preferCanvas: true,
        renderer: L.canvas()
      })
      L.tileLayer(
          'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
          {
            attribution: 'Map data (c) <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',            maxZoom: 18,
            id: 'mapbox/streets-v11',
            accessToken: "pk.eyJ1IjoiemVwaG9sIiwiYSI6ImNrcWMyN3N6eTA1Mm8yb3Bmb29uZ3d5eWoifQ.1YD7eO3cB9lH-J2eOaC2pg\n"
          }
      ).addTo(mapDiv);

      let popup = L.popup();

      async function onMapClick(e) {

        let population_associated = await _this.get_population(e)
        console.log(population_associated)
        popup
            .setLatLng(e.latlng)
            .setContent("You clicked the map at " + population_associated.toString())
            .openOn(mapDiv);
      }

      mapDiv.on('click', onMapClick);

      //Water stress
      let water_stress =
          L.vectorGrid.slicer(stress_layer, {
            rendererFactory: L.canvas.tile,
            vectorTileLayerStyles: {
              stress: function(properties, zoom) {
                let color = properties.bws_cat;
                return {
                  fillColor:
                      color==0 ? '#ffff99' :
                          color==1 ? '#ffe600' :
                              color==2 ? '#ff9900' :
                                  color==3 ? '#ffa49c' :
                                      color==4 ? '#cc0014' :
                                          '#4e4e4e',
                  fillOpacity: 0.5,
                  stroke: true,
                  fill: true,
                  color: 'black',
                  weight: 0,
                }
              }
            },
            interactive: true
          })

      //deplession layer
      let water_deplession =
          L.vectorGrid.slicer(deplession_layer, {
            rendererFactory: L.canvas.tile,
            vectorTileLayerStyles: {
              deplession: function(properties, zoom) {
                let color = properties.bwd_cat;
                return {
                  fillColor:
                      color==0 ? '#ffff99' :
                          color==1 ? '#ffe600' :
                              color==2 ? '#ff9900' :
                                  color==3 ? '#ffa49c' :
                                      color==4 ? '#cc0014' :
                                          '#4e4e4e',
                  fillOpacity: 0.5,
                  stroke: true,
                  fill: true,
                  color: 'black',
                  weight: 0,
                }
              }
            },
            interactive: true
          })

      let overlayMaps = {
        "Water Stress": water_stress,
        "Water Deplession": water_deplession
      }

      L.control.layers(null, overlayMaps).addTo(mapDiv);



    },
  },

  mounted() {
    this.setupLeafletMap();
  }
};
</script>

<style>

#mapContainer {
  width: 100%;
  height: 100%;
}
</style>