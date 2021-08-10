<template>
  <div id="container">
    <div id="map"></div>
    <aside class="toolbox">
      <div class="box">
        <header>
          <h1>Select layer</h1>
        </header>
        <section>
          <v-container
              class="px-0"
              fluid
          >
            <v-radio-group v-model="layer_selected">
              <v-radio
                  v-for="layer in Object.keys(layers)"
                  :key="layer"
                  :label="layer"
                  :value="layer"
              ></v-radio>
            </v-radio-group>
          </v-container>
        </section>
        <footer class="js-footer"></footer>
      </div>
    </aside>
  </div>


</template>

<script>
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Icon } from "leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';
import carto from '@carto/carto.js'

delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

import axios from "axios"
//import deplession_layer from "../layers/deplession_topo.json"
//import stress_layer from "../layers/stress_topo.json"
//import VectorTile from "leaflet.vectorgrid/dist/Leaflet.VectorGrid.js";

let parse_georaster = require("georaster");
let GeoRasterLayer = require("georaster-layer-for-leaflet");
let _ = require('lodash');
let chroma = require("chroma-js")

export default {
  name: "Map",
  components: {
    L
  },
  data() {
    return {
      center2: [47.41322, -1.219482],
      location_markers: this.$location_markers,  //Created industries [{assessment, industry, location}]
      mapDiv: null,
      markers: [],
      clicked_marker: null,
      layer_selected: 'None',
      layers: {
        'None': null,
        "Baseline population": null,
        "Baseline water depletion": null,
        "Baseline water stress": null

      },
      client: new carto.Client({
        apiKey: 'default_public',
        username: 'wri-rw'
      }),
      base_layer_url: 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}'

    };
  },
  watch: {
    location_markers: function (markers) {
      //Delete markers first
      this.delete_markers()
      this.place_markers(markers)
    },
    layer_selected: async function (new_layer, old_layer) {

      let _this = this

      if (old_layer === 'Baseline water depletion' || old_layer === 'Baseline water stress'){
        this.client.removeLayer(this.layers[old_layer])
      }
      else if(old_layer === 'Baseline population'){
        _this.mapDiv.eachLayer(function (layer) {
          if (_this.base_layer_url != layer._url){
            _this.mapDiv.removeLayer(layer)
          }
        });

      }

      if (new_layer !== "None"){
        if (new_layer === "Baseline population"){

          /*
          console.log("loading population layer")
          let wmsLayer = L.tileLayer.wms('https://sedac.ciesin.columbia.edu/geoserver/wms', {
            layers: 'gpw-v4:gpw-v4-population-density-rev11_2020'
          }).addTo(this.mapDiv);*/


          let url_to_geotiff_file = "https://wiatlayers.s3.us-east-2.amazonaws.com/population.tif";

          parseGeoraster(url_to_geotiff_file).then(georaster => {
            let scale = chroma.scale(['brown', 'orange', 'red']).domain([0,100,1000]);

            let layer = new GeoRasterLayer({
              opacity: 0.75,
              georaster: georaster,
              pixelValuesToColorFn: function (values) {
                let population = values[0];
                if (population < 0) return;
                return scale(population).hex();
              }
            });
            layer.addTo(this.mapDiv);

            });

        }else{
          this.client.addLayer(this.layers[new_layer]);
          this.client.getLeafletLayer().addTo(this.mapDiv);
        }
      }
    },

},
  methods: {


    //Delete markers from industries
    delete_markers(){
      this.markers.forEach(marker => {
        this.mapDiv.removeLayer(marker);
      })
    },

    //Delete clicked marker
    delete_click_marker(){
      if (this.clicked_marker !== null) {
        this.mapDiv.removeLayer(this.clicked_marker);
        this.clicked_marker = null
      }
    },

    //Place markers on the map
    place_markers(markers) {

      let _this = this
      _this.markers = []
      markers.forEach(marker =>{
        let new_marker = L.marker(marker.latlng).addTo(_this.mapDiv).on('click', function(e) {
          _this.mapDiv.panTo(marker.latlng)
          _this.$emit('editIndustry', marker.assessment, marker.industry)
        });
        _this.markers.push(new_marker)
      })
    },

    get_population(event) {
      //http://localhost:3000/bona?longitude=2.16992&latitude=41.3879
      let lat = event.latlng.lat
      let lng = event.latlng.lng
      let call = "/bona?longitude="+lng+"&latitude="+lat
      return axios
          .get(call)
          .then(response => {
            //console.log(response)
            return response.data.test[0]["0"]
          })

    },

    setupLeafletMap() {
      let _this = this

      this.mapDiv = L.map("map", {
        center: this.center2,
        zoom: 13,
        preferCanvas: true,
        renderer: L.canvas()
      })

      L.tileLayer(
          _this.base_layer_url,
          {
            attribution: 'Map data (c) <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',            maxZoom: 18,
            id: 'mapbox/streets-v11',
            accessToken: "pk.eyJ1IjoiemVwaG9sIiwiYSI6ImNrcWMyN3N6eTA1Mm8yb3Bmb29uZ3d5eWoifQ.1YD7eO3cB9lH-J2eOaC2pg\n"
          }
      ).addTo(this.mapDiv);



      let popup = L.popup();

      let greenIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      async function onMapClick(e) {


        //let population_associated = await _this.get_population(e)




        let mapContent = {
          "latlng": e.latlng,
          "right bar content": {
          }
        }

        if (_this.layer_selected === "Baseline water stress"){
          _this.layers["Baseline water stress"].on(carto.layer.events.FEATURE_CLICKED, featureEvent => {
            mapContent["right bar content"]["Baseline water stress"] = featureEvent.data["bws_label"]
            _this.$emit('mapContent', mapContent)
            _this.place_pop_up_content(popup, e, "Baseline water stress: "+featureEvent.data["bws_label"])
          })
        }else if (_this.layer_selected === "Baseline water depletion"){
          _this.layers["Baseline water depletion"].on(carto.layer.events.FEATURE_CLICKED, featureEvent => {
            mapContent["right bar content"]["Baseline water depletion"] = featureEvent.data["bwd_label"]
            _this.$emit('mapContent', mapContent)

            _this.place_pop_up_content(popup, e, "Baseline water depletion: "+featureEvent.data["bwd_label"])

          })
        }

        if(_this.clicked_marker !== null) _this.mapDiv.removeLayer(_this.clicked_marker);
        _this.clicked_marker = L.marker(e.latlng, {icon: greenIcon}).addTo(_this.mapDiv)

        //console.log(_this.$parent)

      }

      this.mapDiv.on('click', onMapClick);

      const provider = new OpenStreetMapProvider();
      const searchControl = new GeoSearchControl({
        provider: provider,
        showMarker: false
      });
      this.mapDiv.addControl(searchControl);

      function searchLocation(e) {
        let mapContent = {
          "latlng": {
            'lat': e.location.y,
            'lng': e.location.x

          },
          "right bar content": {
            "Population associated": 45
          }

        }
        //console.log(_this.$parent)
        _this.$emit('mapContent', mapContent)

        if(_this.clicked_marker !== null) _this.mapDiv.removeLayer(_this.clicked_marker);
        _this.clicked_marker = L.marker({'lat': e.location.y, 'lng': e.location.x}, {icon: greenIcon}).addTo(_this.mapDiv)

      }

      this.mapDiv.on('geosearch/showlocation', searchLocation);


      /*
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

      L.control.layers(null, overlayMaps).addTo(this.mapDiv);*/

      //Baseline water depletion
      const baselineWaterDepletionDataset = new carto.source.SQL('select * from "wri-rw".wat_051_aqueduct_baseline_water_depletion');
      const baselineWaterDepletionStyle = new carto.style.CartoCSS(`
        #layer {
         [bwd_cat = 0]{
           polygon-fill: #ffff99;
         }
         [bwd_cat = 1]{
           polygon-fill: #ffe600;
         }
         [bwd_cat = 2]{
           polygon-fill: #ff9900;
         }
         [bwd_cat = 3]{
           polygon-fill: #ffa49c;
         }
         [bwd_cat = 4]{
           polygon-fill: #cc0014;
         }
         [bwd_cat = 5]{
           polygon-fill: #ff9900;
         }
         [bwd_cat = -1]{
           polygon-fill: #4e4e4e;
         }
        }
      `);
      const baselineWaterDepletion = new carto.layer.Layer(baselineWaterDepletionDataset, baselineWaterDepletionStyle,
          {
            featureOverColumns: ['bwd_label']
          });
      this.layers["Baseline water depletion"] = baselineWaterDepletion


      //Baseline water stress
      const baselineWaterStressDataset = new carto.source.SQL('select * from "wri-rw".wat_050_aqueduct_baseline_water_stress');
      const baselineWaterStressStyle = new carto.style.CartoCSS(`
        #layer {
         [bws_cat = 0]{
           polygon-fill: #ffff99;
         }
         [bws_cat = 1]{
           polygon-fill: #ffe600;
         }
         [bws_cat = 2]{
           polygon-fill: #ff9900;
         }
         [bws_cat = 3]{
           polygon-fill: #ffa49c;
         }
         [bws_cat = 4]{
           polygon-fill: #cc0014;
         }
         [bws_cat = 5]{
           polygon-fill: #ff9900;
         }
         [bws_cat = -1]{
           polygon-fill: #4e4e4e;
         }
        }
      `);
      const baselineWaterStress = new carto.layer.Layer(baselineWaterStressDataset, baselineWaterStressStyle,
          {
            featureOverColumns: ['bws_label']
          });
      this.layers["Baseline water stress"] = baselineWaterStress
      //client.addLayers([waterDepletion]);
      //client.getLeafletLayer().addTo(this.mapDiv);



    },
    place_pop_up_content(popup, e, content){

      console.log('0asdasdasd')
      const template =
          '<button type="button" @click="console.log(33434)" style="background-color: #1C195B;">Edit <a href="http://www.google.com">Visit Google</a></button>';

      popup
          .setLatLng(e.latlng)
          .setContent(template)
          .openOn(this.mapDiv)
    }
  },

  mounted() {
    this.setupLeafletMap();
    this.place_markers(this.$location_markers)
  }
};
</script>

<style scoped>

@import 'https://carto.com/developers/carto-js/examples/maps/public/style.css';

#container {
  width: 100%;
  height: 100%;
}



.edit {
  background-color: #1C195B;
}
</style>