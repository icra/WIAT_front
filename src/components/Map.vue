<template>
  <div id="container">
    <div id="map"></div>
  </div>


</template>

<script>
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Icon } from "leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';
import carto from '@carto/carto.js'
import 'leaflet-easybutton'

delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

import axios from "axios"
import Vue from "vue";
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
      layer_selected: this.$selected_layer,
      layers: Vue.prototype.$layers,
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
      console.log('aaaaa')
      this.layers[old_layer].delete()
      this.layers[new_layer].apply()

    },

},
  methods: {

    define_carto_layer(dataset, style, label){

      let _this = this
      let obj = {}

      //Baseline water depletion
      const layerDataset = new carto.source.SQL(dataset);
      const layerStyle = new carto.style.CartoCSS(style);

      const layer = new carto.layer.Layer(layerDataset, layerStyle,
          {
            featureOverColumns: [label]
          });

      obj["apply"] = function(){
        _this.client.addLayer(layer);
        _this.client.getLeafletLayer().addTo(_this.mapDiv);
      }
      obj["delete"] = function(){
        _this.client.removeLayer(layer)
      }

      return obj
    },

    define_raster_layer(url_to_geotiff_file, scale_color, scale_rang, min_value){
      let _this = this
      let obj = {}

      obj["apply"] = function(){
        parseGeoraster(url_to_geotiff_file).then(georaster => {
          let scale = chroma.scale(scale_color).domain(scale_rang);

          let layer = new GeoRasterLayer({
            opacity: 0.75,
            georaster: georaster,
            pixelValuesToColorFn: function (values) {
              let value = values[0];
              if (value < min_value) return;
              return scale(value).hex();
            }
          });
          layer.addTo(_this.mapDiv);
        });
      }
      obj["delete"] = function(){
        _this.mapDiv.eachLayer(function (layer) {
          if (_this.base_layer_url != layer._url){
            _this.mapDiv.removeLayer(layer)
          }
        });
      }
      return obj
    },

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


      L.easyButton('<i class="material-icons">layers</i>', function(btn, map){
        _this.$emit('selectLayer')
      }, {position: 'topright'}).addTo( this.mapDiv );



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

        //if(_this.clicked_marker !== null) _this.mapDiv.removeLayer(_this.clicked_marker);
        //_this.clicked_marker = L.marker(e.latlng, {icon: greenIcon}).addTo(_this.mapDiv)

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

      //None layer
      this.layers["None"] = {}
      this.layers["None"]["apply"] = function(){}
      this.layers["None"]["delete"] = function(){}

      //Baseline water depletion
      const baselineWaterDepletionDataset = 'select * from "wri-rw".wat_051_aqueduct_baseline_water_depletion'
      const baselineWaterDepletionStyle = `
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
      `
      this.layers["Baseline water depletion"] = this.define_carto_layer(baselineWaterDepletionDataset, baselineWaterDepletionStyle, "bwd_cat")


      //Baseline water stress
      const baselineWaterStressDataset = 'select * from "wri-rw".wat_050_aqueduct_baseline_water_stress'
      const baselineWaterStressStyle = `
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
      `
      this.layers["Baseline water stress"] = this.define_carto_layer(baselineWaterStressDataset, baselineWaterStressStyle, "bws_cat")

      //Baseline population
      this.layers["Baseline population"] = this.define_raster_layer("https://wiatlayers.s3.us-east-2.amazonaws.com/population.tif", ['brown', 'orange', 'red'], [0, 100, 1500], 0)

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

<style >

@import "https://cdn.jsdelivr.net/npm/leaflet-easybutton@2/src/easy-button.css";
@import "https://fonts.googleapis.com/icon?family=Material+Icons";

.leaflet-touch .leaflet-bar button {
  width: 70px;
  height: 70px;
  line-height: 30px;
}


#container {
  width: 100%;
  height: 100%;
}

#map {
  position: absolute;
  height: 100%;
  width: 100%;
  z-index: 0;
}



.edit {
  background-color: #1C195B;
}
.layer-icon{
  font-size: 40px;
}

.leaflet-bar button {
  height: 50px !important;
  width: 50px !important;
  font-size: 3.8rem;
}
</style>