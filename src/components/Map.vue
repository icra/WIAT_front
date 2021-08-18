<template>
  <div id="container">
    <div id="map"></div>
    <!-- Description -->
    <aside v-if="selected_layer !== null" class="toolbox">
      <div class="box">

        <b>Temporal resolution</b>
        <v-radio-group v-model="baseline_future_model" row v-if="layers[selected_layer].future">
          <v-radio
              v-for="resolution of baseline_future"
              :key="resolution.key"
              :label="resolution.label"
              :value="resolution.key"
          ></v-radio>
        </v-radio-group>
        <div v-if="baseline_future_model === 'baseline' && layers[selected_layer].monthly ">
          <v-radio-group v-model="annual_monthly_model" row >
            <v-radio
                v-for="resolution of annual_monthly"
                :key="resolution.key"
                :label="resolution.label"
                :value="resolution.key"
            ></v-radio>
          </v-radio-group>
          <v-row align="center" v-if="annual_monthly_model === 'monthly'">
            <v-col
                class="d-flex"
                cols="12"
            >
              <v-select
                  :items="months"
                  label="Select a month"
                  v-model="months_model"
                  item-text="label"
                  item-value="key"
              ></v-select>
            </v-col>
          </v-row>
        </div>

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
let $ = require( "jquery" );

export default {
  name: "Map",
  components: {
    L
  },
  props: ["selected_layer", "selected_assessment"],
  data() {
    return {
      center2: [47.41322, -1.219482],
      location_markers: this.$location_markers,  //Created industries [{assessment, industry, location}]
      mapDiv: null,
      markers: [],
      clicked_marker: null,
      layers: Vue.prototype.$layers_description,
      base_layer_url: 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
      baseline_future: [
        {
          key: "baseline",
          label: "Baseline"
        },
        {
          key: "future",
          label: "Future"
        },
      ],
      baseline_future_model: "baseline",
      annual_monthly: [
        {
          key: "annual",
          label: "Annual"
        },
        {
          key: "monthly",
          label: "Monthly"
        },
      ],
      annual_monthly_model: "annual",
      months: [
        {
          key: 0,
          label: "January"
        },
        {
          key: 1,
          label: "February"
        },
        {
          key: 2,
          label: "March"
        },
        {
          key: 3,
          label: "April"
        },
        {
          key: 4,
          label: "May"
        },
        {
          key: 5,
          label: "June"
        },
        {
          key: 6,
          label: "July"
        },
        {
          key: 7,
          label: "August"
        },
        {
          key: 8,
          label: "September"
        },
        {
          key: 9,
          label: "October"
        },
        {
          key: 10,
          label: "November"
        },
        {
          key: 11,
          label: "December"
        },
      ],
      months_model: 0,
      current_carto_client: null,
      popup_info: null

    };
  },
  watch: {
    location_markers: function (markers) {
      //Delete markers first
      this.delete_markers()
      this.place_markers(markers)
    },
    selected_layer: async function (new_layer, old_layer) {
      this.delete_layer(old_layer, this.baseline_future_model, this.annual_monthly_model, this.months_model)
      this.baseline_future_model = 'baseline'
      this.months_model = 0
      this.annual_monthly_model =  "annual"
      //if(old_layer !== null) this.layers[old_layer].layer.delete()
      this.add_layer(new_layer)

    },
    baseline_future_model: async function (new_value, old_value) {
      let old_layer = this.selected_layer
      let new_layer = this.selected_layer
      this.delete_layer(old_layer, old_value, this.annual_monthly_model, this.months_model)
      this.add_layer(new_layer)
    },
    months_model: async function (new_value, old_value) {
      let old_layer = this.selected_layer
      let new_layer = this.selected_layer
      this.delete_layer(old_layer, this.baseline_future_model, this.annual_monthly_model, old_value)
      this.add_layer(new_layer)
    },
    annual_monthly_model: async function (new_value, old_value) {
      let old_layer = this.selected_layer
      let new_layer = this.selected_layer
      this.delete_layer(old_layer, this.baseline_future_model, old_value, this.months_model)
      this.add_layer(new_layer)
    },
},
  methods: {
    industry_created(){
      console.log('sdfsdf')
      this.mapDiv.closePopup()
      this.clicked_marker.unbindPopup()
      this.clicked_marker = null
    },
    get_layer(layer, baseline_future, annual_monthly, months_model){
      if(layer !== null){
        if(baseline_future === "baseline"){
          if(annual_monthly === "monthly"){
            return this.layers[layer].layers.baseline.monthly[months_model]
          }else{  //Annual
            return this.layers[layer].layers.baseline.annual.layer
          }
        }else{  //Future
          return this.layers[layer].layers.future.layer
        }
      }else{
        return null
      }
    },

    delete_layer(layer, baseline_future, annual_monthly, months_model){

      if(this.clicked_marker !== null) this.mapDiv.removeLayer(this.clicked_marker)
      let current_layer = this.get_layer(layer, baseline_future, annual_monthly, months_model)
      if(current_layer !== null){
        current_layer.delete()
      }
    },
    add_layer(layer, baseline_future=this.baseline_future_model, annual_monthly=this.annual_monthly_model, months_model=this.months_model){
      let current_layer = this.get_layer(layer, baseline_future, annual_monthly, months_model)
      if(current_layer !== null){
        current_layer.apply()
      }
    },
    toggle_popup(text){
      if(this.popup_info===null) this.popup_info=this.clicked_marker.bindPopup()
      text += ('<br><br><button class="trigger">ADD INDUSTRY</button>')

      this.popup_info.setPopupContent(text)
      this.popup_info.openPopup()
    },
    define_carto_layer(dataset, style, label, carto_client){
      let _this = this
      let obj = {}

      //const layerDataset = new carto.source.SQL(dataset);
      const layerDataset = new carto.source.Dataset(dataset);
      const layerStyle = new carto.style.CartoCSS(style);

      let layer = new carto.layer.Layer(layerDataset, layerStyle,
          {
            featureOverColumns: [label]
          });
      obj["apply"] = function(){
        _this.current_carto_client = carto_client
        carto_client.addLayer(layer);
        carto_client.getLeafletLayer().addTo(_this.mapDiv);
      }
      obj["delete"] = function(){
        _this.current_carto_client.removeLayer(layer)
        _this.current_carto_client = null
      }

      layer.on(carto.layer.events.FEATURE_CLICKED, featureEvent => {
        console.log('asdfsadf')
        let popup_message = "<b>"+_this.selected_layer+"</b>: "+featureEvent.data[label]
        _this.toggle_popup(popup_message)
      })

      obj["click"] = async function(latlng){}  //empty
      return obj
    },

    define_raster_layer(geotiff_file, scale_color, scale_rang, min_value){
      let _this = this
      let obj = {}
      let url_to_geotiff_file = "https://wiat-server.icradev.cat/image?filename="+geotiff_file
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
      obj["click"] = async function(latlng){
        let popup_message = "<b>"+_this.selected_layer+"</b>: "
        let value = await _this.get_raster_data(latlng, geotiff_file)
        _this.toggle_popup(popup_message + value)
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

    get_raster_data(latlng, file_name) {
      //http://localhost:3000/bona?longitude=2.16992&latitude=41.3879
      let lat = latlng.lat
      let lng = latlng.lng
      let call = "/data_point?filename="+file_name+"&longitude="+lng+"&latitude="+lat
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


      let greenIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });


      async function onMapClick(e) {

        let latlng = null
        if(e.type === "click") latlng = e.latlng
        else {
          latlng = {
            'lat': e.location.y,
            'lng': e.location.x
          }
        }

        if(_this.clicked_marker !== null) _this.mapDiv.removeLayer(_this.clicked_marker);
        _this.clicked_marker = L.marker(latlng, {icon: greenIcon}).addTo(_this.mapDiv)

        if(_this.selected_assessment!==undefined || _this.selected_layer!==null) {
          _this.popup_info=_this.clicked_marker.bindPopup()
        }

        if(_this.selected_layer !== null){
          let current_layer = _this.get_layer(_this.selected_layer, _this.baseline_future_model, _this.annual_monthly_model, _this.months_model)
          current_layer.click(latlng)
        }else if(_this.selected_assessment!==undefined){
          _this.toggle_popup("")
        }

        $('#map').on('click', '.trigger', function() {
          _this.$emit('createIndustry', latlng)
        });
      }

      this.mapDiv.on('click', onMapClick);

      const provider = new OpenStreetMapProvider();
      const searchControl = new GeoSearchControl({
        provider: provider,
        showMarker: false
      });
      this.mapDiv.addControl(searchControl);


      this.mapDiv.on('geosearch/showlocation', onMapClick);


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

      let wri_client = new carto.Client({
        apiKey: 'default_public',
        username: 'wri-rw'
      })

      let own_client = new carto.Client({
        apiKey: 'default_public',
        username: 'jsalo'
      })

      //Baseline population
      this.layers["Population"].layers.baseline.annual.layer = this.define_raster_layer("baseline_population", ['#f7e6d8', '#c36d33', '#4e2911'], [0, 35, 800], 0)

      //Baseline aridity
      this.layers["Aridity index"].layers.baseline.annual.layer = this.define_raster_layer("aridity_baseline", ['#cf7563', '#d2fa32', '#5de833', '#3d5894'], [0, 5000, 6500, 15000], 0)

      //Baseline water stress
      const baselineWaterStressDataset = 'wat_050_aqueduct_baseline_water_stress'
      const baselineWaterStressStyle = `
        #layer {
         [bws_label = "Low (<10%)"]{
           polygon-fill: #ffff99;
         }
         [bws_label = "Low - Medium (10-20%)"]{
           polygon-fill: #ffe600;
         }
         [bws_label = "Medium - High (20-40%)"]{
           polygon-fill: #ff9900;
         }
         [bws_label = "High (40-80%)"]{
           polygon-fill: #ff1900;
         }
         [bws_label = "Extremely High (>80%)"]{
           polygon-fill: #990000;
         }
         [bws_label = "Arid and Low Water Use"]{
           polygon-fill: #808080;
         }
         [bws_label = "No Data"]{
           polygon-fill: #4e4e4e;
         }
        }
      `
      this.layers["Water stress"].layers.baseline.annual.layer = this.define_carto_layer(baselineWaterStressDataset, baselineWaterStressStyle, "bws_label", wri_client)

      //Future water stress
      const futureWaterStressDataset = 'aqueduct_projections_20150309'
      const futureWaterStressStyle = `
        #layer {
         [ws3028tl = "Low (<10%)"]{
           polygon-fill: #ffff99;
         }
         [ws3028tl = "Low-medium (10-20%)"]{
           polygon-fill: #ffe600;
         }
         [ws3028tl = "Medium-high (20-40%)"]{
           polygon-fill: #ff9900;
         }
         [ws3028tl = "High (40-80%)"]{
           polygon-fill: #ff1900;
         }
         [ws3028tl = "Extremely high (>80%)"]{
           polygon-fill: #990000;
         }
         [ws3028tl = "Arid and low water use"]{
           polygon-fill: #808080;
         }
         [ws3028tl = "No data"]{
           polygon-fill: #4e4e4e;
         }
        }
      `
      this.layers["Water stress"].layers.future.layer = this.define_carto_layer(futureWaterStressDataset, futureWaterStressStyle, "ws3028tl", wri_client)

      //Monthly water stress
      for (let i=1; i<=12; i++){
        let monthlyWaterStressDataset = 'baseline_monthly_aqueduct'
        let label = "bws_"
        if (i<10) label += "0"+i+"_lab"
        else label += i+"_lab"
        let monthlyWaterStressStyle = `
        #layer {
         [`+label+` = "Low (<10%)"]{
           polygon-fill: #ffff99;
         }
         [`+label+` = "Low - Medium (10-20%)"]{
           polygon-fill: #ffe600;
         }
         [`+label+` = "Medium - High (20-40%)"]{
           polygon-fill: #ff9900;
         }
         [`+ label+` = "High (40-80%)"]{
           polygon-fill: #ff1900;
         }
         [`+label+` = "Extremely High (>80%)"]{
           polygon-fill: #990000;
         }
         [`+label+` = "Arid and Low Water Use"]{
           polygon-fill: #808080;
         }
         [`+label+` = "NoData"]{
           polygon-fill: #4e4e4e;
         }
        }
      `
        let layer_i = this.define_carto_layer(monthlyWaterStressDataset, monthlyWaterStressStyle, label, own_client)
        this.layers["Water stress"].layers.baseline.monthly.push(layer_i)
      }

      //Baseline water depletion
      const annualBaselineWaterDepletionDataset = "wat_051_aqueduct_baseline_water_depletion"
      const annualBaselineWaterDepletionStyle = `
        #layer {
         [bwd_label = "Low (<5%)"]{
           polygon-fill: #ffff99;
         }
         [bwd_label = "Low - Medium (5-25%)"]{
           polygon-fill: #ffe600;
         }
         [bwd_label = "Medium - High (25-50%)"]{
           polygon-fill: #ff9900;
         }
         [bwd_label = "High (50-75%)"]{
           polygon-fill: #ff1900;
         }
         [bwd_label = "Extremely High (>75%)"]{
           polygon-fill: #990000;
         }
         [bwd_label = "Arid and Low Water Use"]{
           polygon-fill: #808080;
         }
         [bwd_label = "No Data"]{
           polygon-fill: #4e4e4e;
         }
        }
      `
      this.layers["Water depletion"].layers.baseline.annual.layer = this.define_carto_layer(annualBaselineWaterDepletionDataset, annualBaselineWaterDepletionStyle, "bwd_label", wri_client)

      //Monthly water depletion
      for (let i=1; i<=12; i++){
        let monthlyWaterDepletionDataset = 'baseline_monthly_aqueduct'
        let label = "bwd_"
        if (i<10) label += "0"+i+"_lab"
        else label += i+"_lab"
        let monthlyWaterDepletionStyle = `
        #layer {
         [`+label+` = "Low (<5%)"]{
           polygon-fill: #ffff99;
         }
         [`+label+` = "Low - Medium (5-25%)"]{
           polygon-fill: #ffe600;
         }
         [`+label+` = "Medium - High (25-50%)"]{
           polygon-fill: #ff9900;
         }
         [`+ label+` = "High (50-75%)"]{
           polygon-fill: #ff1900;
         }
         [`+label+` = "Extremely High (>75%)"]{
           polygon-fill: #990000;
         }
         [`+label+` = "Arid and Low Water Use"]{
           polygon-fill: #808080;
         }
         [`+label+` = "NoData"]{
           polygon-fill: #4e4e4e;
         }
        }
      `
        let layer_i = this.define_carto_layer(monthlyWaterDepletionDataset, monthlyWaterDepletionStyle, label, own_client)
        this.layers["Water depletion"].layers.baseline.monthly.push(layer_i)
      }

      //Baseline interannual variability
      const baselineInterannualVariabilityDataset = 'wat_052_aqueduct_interannual_variability'
      const baselineInterannualVariabilityStyle = `
        #layer {
         [iav_label = "Low (<0.25)"]{
           polygon-fill: #ffff99;
         }
         [iav_label = "Low - Medium (0.25-0.50)"]{
           polygon-fill: #ffe600;
         }
         [iav_label = "Medium - High (0.50-0.75)"]{
           polygon-fill: #ff9900;
         }
         [iav_label = "High (0.75-1.00)"]{
           polygon-fill: #ff1900;
         }
         [iav_label = "Extremely High (>1.00)"]{
           polygon-fill: #990000;
         }
         [iav_label = "No Data"]{
           polygon-fill: #4e4e4e;
         }
        }
      `
      this.layers["Interannual variability"].layers.baseline.annual.layer = this.define_carto_layer(baselineInterannualVariabilityDataset, baselineInterannualVariabilityStyle, "iav_label", wri_client)

      //Monthly interannual variability
      for (let i=1; i<=12; i++){
        let monthlyInterannualVariabilityDataset = 'baseline_monthly_aqueduct'
        let label = "iav_"
        if (i<10) label += "0"+i+"_lab"
        else label += i+"_lab"
        let monthlyInterannualVariabilityStyle = `
        #layer {
         [`+label+` = "Low (<0.25)"]{
           polygon-fill: #ffff99;
         }
         [`+label+` = "Low - Medium (0.25-0.50)"]{
           polygon-fill: #ffe600;
         }
         [`+label+` = "Medium - High (0.50-0.75)"]{
           polygon-fill: #ff9900;
         }
         [`+ label+` = "High (0.75-1.00)"]{
           polygon-fill: #ff1900;
         }
         [`+label+` = "Extremely High (>1.00)"]{
           polygon-fill: #990000;
         }
         [`+label+` = "NoData"]{
           polygon-fill: #4e4e4e;
         }
        }
      `
        let layer_i = this.define_carto_layer(monthlyInterannualVariabilityDataset, monthlyInterannualVariabilityStyle, label, own_client)
        this.layers["Interannual variability"].layers.baseline.monthly.push(layer_i)
      }

      //Baseline seasonal variability
      const baselineSeasonalVariabilityDataset = 'wat_053_aqueduct_seasonal_variability'
      const baselineSeasonalVariabilityStyle = `
        #layer {
         [sev_label = "Low (<0.33)"]{
           polygon-fill: #ffff99;
         }
         [sev_label = "Low - Medium (0.33-0.66)"]{
           polygon-fill: #ffe600;
         }
         [sev_label = "Medium - High (0.66-1.00)"]{
           polygon-fill: #ff9900;
         }
         [sev_label = "High (1.00-1.33)"]{
           polygon-fill: #ff1900;
         }
         [sev_label = "Extremely High (>1.33)"]{
           polygon-fill: #990000;
         }
         [sev_label = "No Data"]{
           polygon-fill: #4e4e4e;
         }
        }
      `
      this.layers["Seasonal variability"].layers.baseline.annual.layer = this.define_carto_layer(baselineSeasonalVariabilityDataset, baselineSeasonalVariabilityStyle, "sev_label", wri_client)

      //Future Seasonal Variability
      const futureSeasonalVariabilityDataset = 'aqueduct_projections_20150309'
      const futureSeasonalVariabilityStyle = `
        #layer {
         [sv3028tl = "Low (<0.33)"]{
           polygon-fill: #ffff99;
         }
         [sv3028tl = "Low-medium (0.33-0.66)"]{
           polygon-fill: #ffe600;
         }
         [sv3028tl = "Medium-high (0.66-1.0)"]{
           polygon-fill: #ff9900;
         }
         [sv3028tl = "High (1.0-1.33)"]{
           polygon-fill: #ff1900;
         }
         [sv3028tl = "Extremely High (>1.33)"]{
           polygon-fill: #990000;
         }
         [sv3028tl = "No data"]{
           polygon-fill: #4e4e4e;
         }
        }
      `
      this.layers["Seasonal variability"].layers.future.layer = this.define_carto_layer(futureSeasonalVariabilityDataset, futureSeasonalVariabilityStyle, "sv3028tl", wri_client)

      //Baseline groundwater table decline
      const baselineGroundwaterTableDeclineDataset = 'wat_054_aqueduct_groundwater_table_decline'
      const baselineGroundwaterTableDeclineStyle = `
        #layer {
         [gtd_label = "Low (<0 cm/y)"]{
           polygon-fill: #ffff99;
         }
         [gtd_label = "Low - Medium (0-2 cm/y)"]{
           polygon-fill: #ffe600;
         }
         [gtd_label = "Medium - High (2-4 cm/y)"]{
           polygon-fill: #ff9900;
         }
         [gtd_label = "High (4-8 cm/y)"]{
           polygon-fill: #ff1900;
         }
         [gtd_label = "Extremely High (>8 cm/y)"]{
           polygon-fill: #990000;
         }
         [gtd_label = "Insignificant Trend"]{
           polygon-fill: #808080;
         }
         [gtd_label = "No Data"]{
           polygon-fill: #4e4e4e;
         }
        }
      `
      this.layers["Groundwater table decline"].layers.baseline.annual.layer = this.define_carto_layer(baselineGroundwaterTableDeclineDataset, baselineGroundwaterTableDeclineStyle, "gtd_label", wri_client)

      //Baseline riverine flood risk
      const baselineRiverineFloodRiskDataset = 'wat_055_aqueduct_riverine_flood_risk'
      const baselineRiverineFloodRiskStyle = `
        #layer {
         [rfr_label = "Low (0 to 1 in 1,000)"]{
           polygon-fill: #ffff99;
         }
         [rfr_label = "Low - Medium (1 in 1,000 to 2 in 1,000)"]{
           polygon-fill: #ffe600;
         }
         [rfr_label = "Medium - High (2 in 1,000 to 6 in 1,000)"]{
           polygon-fill: #ff9900;
         }
         [rfr_label = "High (6 in 1,000 to 1 in 100)"]{
           polygon-fill: #ff1900;
         }
         [rfr_label = "Extremely High (more than 1 in 100)"]{
           polygon-fill: #990000;
         }
         [rfr_label = "No Data"]{
           polygon-fill: #4e4e4e;
         }
        }
      `
      this.layers["Riverine flood risk"].layers.baseline.annual.layer = this.define_carto_layer(baselineRiverineFloodRiskDataset, baselineRiverineFloodRiskStyle, "rfr_label", wri_client)

      //Baseline coastal flood risk
      const baselineCoastalFloodRiskDataset = 'wat_056_aqueduct_coastal_flood_risk'
      const baselineCoastalFloodRiskStyle = `
        #layer {
         [cfr_label = "Low (0 to 9 in 1,000,000)"]{
           polygon-fill: #ffff99;
         }
         [cfr_label = "Low - Medium (9 in 1,000,000 to 7 in 100,000)"]{
           polygon-fill: #ffe600;
         }
         [cfr_label = "Medium - High (7 in 100,000 to 3 in 10,000)"]{
           polygon-fill: #ff9900;
         }
         [cfr_label = "High (3 in 10,000 to 2 in 1,000)"]{
           polygon-fill: #ff1900;
         }
         [cfr_label = "Extremely High (more than 2 in 1,000)"]{
           polygon-fill: #990000;
         }
         [cfr_label = "No Data"]{
           polygon-fill: #4e4e4e;
         }
        }
      `
      this.layers["Coastal flood risk"].layers.baseline.annual.layer = this.define_carto_layer(baselineCoastalFloodRiskDataset, baselineCoastalFloodRiskStyle, "cfr_label", wri_client)

      //Baseline Drought risk
      const baselineDroughtRiskDataset = 'wat_057_aqueduct_drought_risk'
      const baselineDroughtRiskStyle = `
        #layer {
         [drr_label = "Low (0.0-0.2)"]{
           polygon-fill: #ffff99;
         }
         [drr_label = "Low - Medium (0.2-0.4)"]{
           polygon-fill: #ffe600;
         }
         [drr_label = "Medium (0.4-0.6)"]{
           polygon-fill: #ff9900;
         }
         [drr_label = "Medium - High (0.6-0.8)"]{
           polygon-fill: #ff1900;
         }
         [drr_label = "High (0.8-1.0)"]{
           polygon-fill: #990000;
         }
         [drr_label = "No Data"]{
           polygon-fill: #4e4e4e;
         }
        }
      `
      this.layers["Drought risk"].layers.baseline.annual.layer = this.define_carto_layer(baselineDroughtRiskDataset, baselineDroughtRiskStyle, "drr_label", wri_client)

      //Baseline Coastal Eutrophication Potential
      const baselineCoastalEutrophicationPotentialDataset = 'wat_059_aqueduct_coastal_eutrophication_potential'
      const baselineCoastalEutrophicationPotentialStyle = `
        #layer {
         [cep_label = "Low (<-5)"]{
           polygon-fill: #ffff99;
         }
         [cep_label = "Low - Medium (-5 to 0)"]{
           polygon-fill: #ffe600;
         }
         [cep_label = "Medium - High (0 to 1)"]{
           polygon-fill: #ff9900;
         }
         [cep_label = "High (1 to 5)"]{
           polygon-fill: #ff1900;
         }
         [cep_label = "Extremely High (>5)"]{
           polygon-fill: #990000;
         }
         [cep_label = "No Data"]{
           polygon-fill: #4e4e4e;
         }
        }
      `
      this.layers["Coastal Eutrophication Potential"].layers.baseline.annual.layer = this.define_carto_layer(baselineCoastalEutrophicationPotentialDataset, baselineCoastalEutrophicationPotentialStyle, "cep_label", wri_client)

      //Baseline No Drinking Water
      const baselineNoDrinkingWaterDataset = 'wat_060_aqueduct_unimproved_or_no_drinking_water_access'
      const baselineNoDrinkingWaterStyle = `
        #layer {
         [udw_label = "Low (<2.5%)"]{
           polygon-fill: #ffff99;
         }
         [udw_label = "Low - Medium (2.5-5%)"]{
           polygon-fill: #ffe600;
         }
         [udw_label = "Medium - High (5-10%)"]{
           polygon-fill: #ff9900;
         }
         [udw_label = "High (10-20%)"]{
           polygon-fill: #ff1900;
         }
         [udw_label = "Extremely High (>20%)"]{
           polygon-fill: #990000;
         }
         [udw_label = "No Data"]{
           polygon-fill: #4e4e4e;
         }
        }
      `
      this.layers["Unimproved/No Drinking Water"].layers.baseline.annual.layer = this.define_carto_layer(baselineNoDrinkingWaterDataset, baselineNoDrinkingWaterStyle, "udw_label", wri_client)

      //Baseline No sanitation
      const baselineNoSanitationDataset = 'wat_061_aqueduct_unimproved_or_no_sanitation_access'
      const baselineNoSanitationStyle = `
        #layer {
         [usa_label = "Low (<2.5%)"]{
           polygon-fill: #ffff99;
         }
         [usa_label = "Low - Medium (2.5-5%)"]{
           polygon-fill: #ffe600;
         }
         [usa_label = "Medium - High (5-10%)"]{
           polygon-fill: #ff9900;
         }
         [usa_label = "High (10-20%)"]{
           polygon-fill: #ff1900;
         }
         [usa_label = "Extremely High (>20%)"]{
           polygon-fill: #990000;
         }
         [usa_label = "No Data"]{
           polygon-fill: #4e4e4e;
         }
        }
      `
      this.layers["Unimproved/No Sanitation"].layers.baseline.annual.layer = this.define_carto_layer(baselineNoSanitationDataset, baselineNoSanitationStyle, "usa_label", wri_client)

      //Baseline RepRisk
      const baselineRepRiskDataset = 'baseline_rri_aqueduct'
      const baselineRepRiskStyle = `
        #layer {
         [rri_label = "Low (<25%)"]{
           polygon-fill: #ffff99;
         }
         [rri_label = "Low - Medium (25-50%)"]{
           polygon-fill: #ffe600;
         }
         [rri_label = "Medium - High (50-60%)"]{
           polygon-fill: #ff9900;
         }
         [rri_label = "High (60-75%)"]{
           polygon-fill: #ff1900;
         }
         [rri_label = "Extremely High (>75%)"]{
           polygon-fill: #990000;
         }
         [rri_label = null]{
           polygon-fill: #4e4e4e;
         }
        }
      `
      this.layers["Peak RepRisk Country ESG Risk Index"].layers.baseline.annual.layer = this.define_carto_layer(baselineRepRiskDataset, baselineRepRiskStyle, "rri_label", own_client)

    },
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
@import "https://carto.com/developers/carto-js/examples/maps/public/style.css";

aside.toolbox {
  position: absolute;
  right: 11px;
  top: 75px;
  min-width: 300px;
  max-width: 300px;
  z-index: 2;
}

.leaflet-touch .leaflet-bar button {
  width: 70px;
  height: 70px;
  line-height: 30px;
}


#container {
  width: 100%;
  height: 100%;
  position: relative;
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

.trigger {
  background-color: rgb(70, 63, 202);
  border-color: rgb(70, 63, 202);
  font-size: 0.875rem;
  color: white;
  padding: 8px 15px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 5px;
}

.trigger:hover {
  opacity: 0.92;
}
</style>