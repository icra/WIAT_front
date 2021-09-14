<template>
  <div id="container">
    <div id="map"></div>

    <aside class="toolbox" >

      <div id="toggle_layer" @click="toggle_layer_selection_menu">
          <v-icon large style="display: table-cell;vertical-align: middle;text-align: center;">mdi-layers</v-icon>
      </div>


      <div v-if="selected_layer !== null">
        <div class="box legend">
          <div>
            <b>{{ selected_layer }}</b> <v-icon style="float: right;" @click="delete_layer(selected_layer, baseline_future_model, annual_monthly_model, months_model); $emit('closeLayer')">mdi-layers-remove</v-icon>
          </div>
          <div v-html="html_legend"></div>

        </div>
        <div class="box legend" v-if="layers[selected_layer].future || layers[selected_layer].monthly">

          <div>
            <b>Temporal resolution</b>
          </div>

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
      </div>


    </aside>
  </div>


</template>

<script>
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Icon } from "leaflet";
import { GeoSearchControl, EsriProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';
import carto from '@carto/carto.js'



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
import utils from "../utils"


export default {
  name: "Map",
  components: {
    L
  },
  props: ["selected_layer", "selected_assessment"],
  data() {
    return {
      center: [41.9672203,2.8385181],
      location_markers: this.$location_markers,  //Created industries [{assessment, industry, location}]
      mapDiv: null,
      markers: [],
      clicked_marker: null,
      layers: utils.format_layer_description(Vue.prototype.$layers_description),
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
      popup_info: null,
      html_legend: ""

    };
  },
  created() {

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

    //FUNCTIONS FOR DISPLAYING LAYERS ON THE MAP

    toggle_layer_selection_menu(){
      this.$emit('selectLayer');
    },
    industry_created(){ //Delete clicked marker and add industry marker
      this.mapDiv.closePopup()
      this.clicked_marker.unbindPopup()
      this.mapDiv.removeLayer(this.clicked_marker)
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
    toggle_popup(text, add_industry=true){  //if add_industry, adds button for adding industry on clicked point
      if(this.popup_info===null) this.popup_info=this.clicked_marker.bindPopup()
      if(add_industry) text += ('<br><br><button class="trigger">ADD INDUSTRY</button>')

      this.popup_info.setPopupContent(text)
      this.popup_info.openPopup()
    },
    define_carto_layer(dataset, style, label, carto_client, username, name){
      let _this = this
      let obj = {}

      //const layerDataset = new carto.source.SQL(dataset);
      const layerDataset = new carto.source.Dataset(dataset);
      const layerStyle = new carto.style.CartoCSS(style);

      let style_splited = style.split("\n")
      let style_label = style_splited.filter(line => line.includes(label)).map(function(line) {
        return line.split('"')[1]
      })
      let style_color = style_splited.filter(line => line.includes("polygon-fill")).map(function(line) {
        return line.substring(line.indexOf('#')).replace(";", "")
      })


      let layer = new carto.layer.Layer(layerDataset, layerStyle,
          {
            featureOverColumns: [label]
          });
      obj["apply"] = function(){
        _this.current_carto_client = carto_client
        carto_client.addLayer(layer);
        carto_client.getLeafletLayer().addTo(_this.mapDiv);
        _this.html_legend = "<br>"

        // loop through our density intervals and generate a label with a colored square for each interval
        for(let i = 0; i<style_label.length; i++){
          let label = style_label[i]
          let color = style_color[i]
          _this.html_legend += '<i style="opacity: 0.5; background:' + color + '"></i> ' + label + '<br>';

        }

      }
      obj["delete"] = function(){
        _this.current_carto_client.removeLayer(layer)
        _this.current_carto_client = null
        _this.delete_markers()
        _this.place_markers(_this.$location_markers)

      }

      layer.on(carto.layer.events.FEATURE_CLICKED, featureEvent => {
        let popup_message = "<b>"+_this.selected_layer+"</b>: "+featureEvent.data[label]
        _this.toggle_popup(popup_message)
      })

      async function data_on_point(lat, lng){
        return fetch("https://"+username+".carto.com:443/api/v2/sql?q=select "+label+" from "+dataset+" where ST_Intersects( the_geom, cdb_latlng("+lat+","+lng+"))")
            // we transform the response from the Fetch API into a JSON format
            .then(resp => {
              return resp.json()
            }).then((response) => {
              // we get the data from the request response
              return(response.rows[0][label])
            })
            .catch(function (error) {
              // check if the request is returning an error
              console.log(error)
            });
      }

      obj["click"] = async function(latlng, add_industry=true){
        let value = await data_on_point(latlng.lat, latlng.lng)
        let popup_message = "<b>"+_this.selected_layer+"</b>: "+value
        _this.toggle_popup(popup_message, add_industry)
      }

      obj["get_data_on_coord"] = async function(lat, lng){
        return data_on_point(lat, lng)
      }
      return obj
    },

    define_raster_layer(geotiff_file, color_function, color_legend, label_legend, units="", layer_name){
      let _this = this
      let obj = {}
      let url_to_geotiff_file = "https://wiat-server.icradev.cat/image?filename="+geotiff_file

      obj["apply"] = function(){

        parseGeoraster(url_to_geotiff_file).then(georaster => {

          let layer = new GeoRasterLayer({
            opacity: 0.5,
            georaster: georaster,

            pixelValuesToColorFn: color_function
          });
          layer.addTo(_this.mapDiv);
        });

        _this.html_legend = "<br>"
        // loop through our density intervals and generate a label with a colored square for each interval
        for (let i = 0; i < color_legend.length; i++) {
          _this.html_legend += '<i style="opacity: 0.5; background:' + color_legend[i] + '"></i> ' + label_legend[i]+units + '<br>';
        }

      }
      obj["delete"] = function(){
        _this.mapDiv.eachLayer(function (layer) {
          if (_this.base_layer_url != layer._url){
            _this.mapDiv.removeLayer(layer)
          }
          _this.place_markers(_this.$location_markers)
        });
      }

      async function data_on_point(lat, lng){
        let value = await _this.get_raster_data(lat, lng, geotiff_file)
        let value_string = ""
        let value_number = Number.parseFloat(value)
        if(value_number === NaN) value_string = value
        else {
          if (value_number < 0) value_string = "No data"
          else value_string = +value_number.toFixed(2).toString() + units
        }
        return value_string
      }

      obj["click"] = async function(latlng, add_industry=true){
        let popup_message = "<b>"+_this.selected_layer+"</b>: "
        let value_string = await data_on_point(latlng.lat, latlng.lng)
        _this.toggle_popup(popup_message + value_string, add_industry)
      }
      obj["get_data_on_coord"] = async function(lat, lng){
        let str = await data_on_point(lat, lng)
        return str
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

          if(_this.selected_layer!==null) {
            _this.popup_info=new_marker.bindPopup()
            let current_layer = _this.get_layer(_this.selected_layer, _this.baseline_future_model, _this.annual_monthly_model, _this.months_model)
            current_layer.click(marker.latlng, false)
          }else{
          }

        });

        _this.markers.push(new_marker)
      })
    },

    get_raster_data(lat, lng, file_name) {
      //http://localhost:3000/bona?longitude=2.16992&latitude=41.3879
      let call = "https://wiat-server.icradev.cat/data_point?filename="+file_name+"&longitude="+lng+"&latitude="+lat
      return axios
          .get(call)
          .then(response => {
            return response.data.test[0]["0"]
          })

    },

    setupLeafletMap() {
      let _this = this

      this.mapDiv = L.map("map", {
        center: this.center,
        zoom: 6,
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

      const provider = new EsriProvider();
      let searchControl = new GeoSearchControl({
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

      //Baseline aridity
      let color_function_population = function(values) {
        let value = values[0]
        if (value < 0) return
        else if (value === 0) return '#e1e1e1'
        else if(value <= 25) return '#ffedde'
        else if(value <= 100) return '#fccfa2'
        else if(value <= 250) return '#fcae6a'
        else if(value <= 1000) return '#fc8d3d'
        else if(value <= 5000) return '#f26913'
        else if(value <= 100000) return '#d94800'
        else return '#8c2d04'
      }
      let color_legend_population = ['#e1e1e1','#ffedde','#fccfa2','#fcae6a','#fc8d3d','#f26913','#d94800','#8c2d04']
      let label_legend_population = ["0","1-25","25-100","100-250","250-1000","1000-5000","5000-100000",">100000"]


      //Baseline population
      this.layers["Population"].layers.baseline.annual.layer = this.define_raster_layer("baseline_population", color_function_population, color_legend_population, label_legend_population, " people", "Population")

      //Future population
      this.layers["Population"].layers.future.layer = this.define_raster_layer("future_population", color_function_population, color_legend_population, label_legend_population, " people", "Population")

      //Baseline aridity
      let color_function_baseline_aridity = function(values) {
        let value = values[0]*0.0001
        if (value < 0) return
        else if(value <= 0.03) return '#cf7563'
        else if(value <= 0.2) return '#e09053'
        else if(value <= 0.35) return '#f2ba41'
        else if(value <= 0.5) return '#fae039'
        else if(value <= 0.65) return '#d2fa32'
        else if(value <= 0.8) return '#5de833'
        else if(value <= 1) return '#3fd168'
        else if(value <= 1.25) return '#4ab09c'
        else if(value <= 1.5) return '#458aa1'
        else return '#3d5894'
      }
      let color_legend_baseline_aridity = ['#cf7563', '#e09053', '#f2ba41', '#fae039', '#d2fa32', '#5de833', '#3fd168', '#4ab09c', '#458aa1','#3d5894' ]
      let label_legend_baseline_aridity = ["0-0.03", "0.03-0.2", "0.2-0.35", "0.35-0.5","0.5-0.65","0.65-0.8","0.8-1.0","1.0-1.25","1.25-1.5",">1.50"]


      this.layers["Aridity index"].layers.baseline.annual.layer = this.define_raster_layer("aridity_baseline", color_function_baseline_aridity, color_legend_baseline_aridity, label_legend_baseline_aridity,"e-4", "Aridity index")

      //Baseline runoff
      let color_function_baseline_runoff = function(values) {
        let value = values[0]
        if (value < 0) return
        else if(value < 10) return '#c8ffff'
        else if(value < 50) return '#79fffe'
        else if(value < 100) return '#00feff'
        else if(value < 500) return '#00d5f0'
        else if(value < 1000) return '#01c4ff'
        else if(value < 5000) return '#007dff'
        else return '#0007a1'
      }
      let color_legend_baseline_runoff = ['#c8ffff', '#79fffe', '#00feff', '#00d5f0', '#01c4ff', '#007dff', '#0007a1' ]
      let label_legend_baseline_runoff = ["<10", "10-50", "50-100", "100-500","500-1000","1000-5000",">5000"]

      this.layers["RUN-OFF"].layers.baseline.annual.layer = this.define_raster_layer("baseline_runoff",  color_function_baseline_runoff, color_legend_baseline_runoff, label_legend_baseline_runoff, " mm/year", "RUN-OFF")


      //Baseline water stress
      const baselineWaterStressDataset = 'wat_050_aqueduct_baseline_water_stress'
      const baselineWaterStressStyle = `
        #layer {
        opacity: 0.5;
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
      this.layers["Water stress"].layers.baseline.annual.layer = this.define_carto_layer(baselineWaterStressDataset, baselineWaterStressStyle, "bws_label", wri_client, "wri-rw", "Water stress")

      //Future water stress
      const futureWaterStressDataset = 'aqueduct_projections_20150309'
      const futureWaterStressStyle = `
        #layer {
        opacity: 0.5;
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
      this.layers["Water stress"].layers.future.layer = this.define_carto_layer(futureWaterStressDataset, futureWaterStressStyle, "ws3028tl", wri_client, "wri-rw", "Water stress")

      //Monthly water stress
      for (let i=1; i<=12; i++){
        let monthlyWaterStressDataset = 'baseline_monthly_aqueduct'
        let label = "bws_"
        if (i<10) label += "0"+i+"_lab"
        else label += i+"_lab"
        let monthlyWaterStressStyle = `
        #layer {
        opacity: 0.5;
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
        let layer_i = this.define_carto_layer(monthlyWaterStressDataset, monthlyWaterStressStyle, label, own_client, "jsalo", "Water stress")
        this.layers["Water stress"].layers.baseline.monthly.push(layer_i)
      }

      //Baseline water depletion
      const annualBaselineWaterDepletionDataset = "wat_051_aqueduct_baseline_water_depletion"
      const annualBaselineWaterDepletionStyle = `
        #layer {
        opacity: 0.5;
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
      this.layers["Water depletion"].layers.baseline.annual.layer = this.define_carto_layer(annualBaselineWaterDepletionDataset, annualBaselineWaterDepletionStyle, "bwd_label", wri_client, "wri-rw", "Water depletion")

      //Monthly water depletion
      for (let i=1; i<=12; i++){
        let monthlyWaterDepletionDataset = 'baseline_monthly_aqueduct'
        let label = "bwd_"
        if (i<10) label += "0"+i+"_lab"
        else label += i+"_lab"
        let monthlyWaterDepletionStyle = `
        #layer {
        opacity: 0.5;
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
        let layer_i = this.define_carto_layer(monthlyWaterDepletionDataset, monthlyWaterDepletionStyle, label, own_client, "jsalo", "Water depletion")
        this.layers["Water depletion"].layers.baseline.monthly.push(layer_i)
      }

      //Baseline interannual variability
      const baselineInterannualVariabilityDataset = 'wat_052_aqueduct_interannual_variability'
      const baselineInterannualVariabilityStyle = `
        #layer {
        opacity: 0.5;
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
      this.layers["Interannual variability"].layers.baseline.annual.layer = this.define_carto_layer(baselineInterannualVariabilityDataset, baselineInterannualVariabilityStyle, "iav_label", wri_client, "wri-rw", "Interannual variability")

      //Monthly interannual variability
      for (let i=1; i<=12; i++){
        let monthlyInterannualVariabilityDataset = 'baseline_monthly_aqueduct'
        let label = "iav_"
        if (i<10) label += "0"+i+"_lab"
        else label += i+"_lab"
        let monthlyInterannualVariabilityStyle = `
        #layer {
        opacity: 0.5;
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
        let layer_i = this.define_carto_layer(monthlyInterannualVariabilityDataset, monthlyInterannualVariabilityStyle, label, own_client, "jsalo", "Interannual variability")
        this.layers["Interannual variability"].layers.baseline.monthly.push(layer_i)
      }

      //Baseline seasonal variability
      const baselineSeasonalVariabilityDataset = 'wat_053_aqueduct_seasonal_variability'
      const baselineSeasonalVariabilityStyle = `
        #layer {
        opacity: 0.5;
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
      this.layers["Seasonal variability"].layers.baseline.annual.layer = this.define_carto_layer(baselineSeasonalVariabilityDataset, baselineSeasonalVariabilityStyle, "sev_label", wri_client, "wri-rw", "Seasonal variability")

      //Future Seasonal Variability
      const futureSeasonalVariabilityDataset = 'aqueduct_projections_20150309'
      const futureSeasonalVariabilityStyle = `
        #layer {
        opacity: 0.5;
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
      this.layers["Seasonal variability"].layers.future.layer = this.define_carto_layer(futureSeasonalVariabilityDataset, futureSeasonalVariabilityStyle, "sv3028tl", wri_client, "wri-rw", "Seasonal variability")

      //Baseline groundwater table decline
      const baselineGroundwaterTableDeclineDataset = 'wat_054_aqueduct_groundwater_table_decline'
      const baselineGroundwaterTableDeclineStyle = `
        #layer {
        opacity: 0.5;
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
      this.layers["Groundwater table decline"].layers.baseline.annual.layer = this.define_carto_layer(baselineGroundwaterTableDeclineDataset, baselineGroundwaterTableDeclineStyle, "gtd_label", wri_client, "wri-rw", "Groundwater table decline")

      //Baseline riverine flood risk
      const baselineRiverineFloodRiskDataset = 'wat_055_aqueduct_riverine_flood_risk'
      const baselineRiverineFloodRiskStyle = `
        #layer {
        opacity: 0.5;
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
      this.layers["Riverine flood risk"].layers.baseline.annual.layer = this.define_carto_layer(baselineRiverineFloodRiskDataset, baselineRiverineFloodRiskStyle, "rfr_label", wri_client, "wri-rw", "Riverine flood risk")

      //Baseline coastal flood risk
      const baselineCoastalFloodRiskDataset = 'wat_056_aqueduct_coastal_flood_risk'
      const baselineCoastalFloodRiskStyle = `
        #layer {
        opacity: 0.5;
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
      this.layers["Coastal flood risk"].layers.baseline.annual.layer = this.define_carto_layer(baselineCoastalFloodRiskDataset, baselineCoastalFloodRiskStyle, "cfr_label", wri_client, "wri-rw", "Coastal flood risk")

      //Baseline Drought risk
      const baselineDroughtRiskDataset = 'wat_057_aqueduct_drought_risk'
      const baselineDroughtRiskStyle = `
        #layer {
        opacity: 0.5;
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
      this.layers["Drought risk"].layers.baseline.annual.layer = this.define_carto_layer(baselineDroughtRiskDataset, baselineDroughtRiskStyle, "drr_label", wri_client, "wri-rw", "Drought risk")

      //Baseline Coastal Eutrophication Potential
      const baselineCoastalEutrophicationPotentialDataset = 'wat_059_aqueduct_coastal_eutrophication_potential'
      const baselineCoastalEutrophicationPotentialStyle = `
        #layer {
        opacity: 0.5;
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
      this.layers["Coastal Eutrophication Potential"].layers.baseline.annual.layer = this.define_carto_layer(baselineCoastalEutrophicationPotentialDataset, baselineCoastalEutrophicationPotentialStyle, "cep_label", wri_client, "wri-rw", "Coastal Eutrophication Potential")

      //Baseline No Drinking Water
      const baselineNoDrinkingWaterDataset = 'wat_060_aqueduct_unimproved_or_no_drinking_water_access'
      const baselineNoDrinkingWaterStyle = `
        #layer {
        opacity: 0.5;
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
      this.layers["Unimproved/No Drinking Water"].layers.baseline.annual.layer = this.define_carto_layer(baselineNoDrinkingWaterDataset, baselineNoDrinkingWaterStyle, "udw_label", wri_client, "wri-rw", "Unimproved/No Drinking Water")

      //Baseline No sanitation
      const baselineNoSanitationDataset = 'wat_061_aqueduct_unimproved_or_no_sanitation_access'
      const baselineNoSanitationStyle = `
        #layer {
        opacity: 0.5;
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
      this.layers["Unimproved/No Sanitation"].layers.baseline.annual.layer = this.define_carto_layer(baselineNoSanitationDataset, baselineNoSanitationStyle, "usa_label", wri_client, "wri-rw", "Unimproved/No Sanitation")

      //Baseline RepRisk
      const baselineRepRiskDataset = 'baseline_rri_aqueduct'
      const baselineRepRiskStyle = `
        #layer {
        opacity: 0.5;
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
      this.layers["Peak RepRisk Country ESG Risk Index"].layers.baseline.annual.layer = this.define_carto_layer(baselineRepRiskDataset, baselineRepRiskStyle, "rri_label", own_client, "jsalo", "Peak RepRisk Country ESG Risk Index")

      //Baseline Water supply
      const baselineWaterSupplyDataset = 'aqueduct_projections_20150309'
      const baselineWaterSupplyStyle = `
        #layer {
        opacity: 0.5;
         [bt2028tl = ">1000 cm"]{
           polygon-fill: #0000ff;
         }
         [bt2028tl = "300-1000 cm"]{
           polygon-fill: #4169e1;
         }
         [bt2028tl = "100-300 cm"]{
           polygon-fill: #1e90ff;
         }
         [bt2028tl = "30-100 cm"]{
           polygon-fill: #00bfff;
         }
         [bt2028tl = "10-30 cm"]{
           polygon-fill: #87ceeb;
         }
         [bt2028tl = "3-10 cm"]{
           polygon-fill: #b0e0e6;
         }
         [bt2028tl = "1-3 cm"]{
           polygon-fill: #add8e6;
         }
         [bt2028tl = "< 1 cm"]{
           polygon-fill: #b0c4de;
         }
        }
      `
      this.layers["Water supply"].layers.baseline.annual.layer = this.define_carto_layer(baselineWaterSupplyDataset, baselineWaterSupplyStyle, "bt2028tl", wri_client, "wri-rw", "Water supply")

      //Future Water supply
      const futureWaterSupplyDataset = 'aqueduct_projections_20150309'
      const futureWaterSupplyStyle = `
        #layer {
        opacity: 0.5;
         [bt3038tl = ">1000 cm"]{
           polygon-fill: #0000ff;
         }
         [bt3038tl = "300-1000 cm"]{
           polygon-fill: #4169e1;
         }
         [bt3038tl = "100-300 cm"]{
           polygon-fill: #1e90ff;
         }
         [bt3038tl = "30-100 cm"]{
           polygon-fill: #00bfff;
         }
         [bt3038tl = "10-30 cm"]{
           polygon-fill: #87ceeb;
         }
         [bt3038tl = "3-10 cm"]{
           polygon-fill: #b0e0e6;
         }
         [bt3038tl = "1-3 cm"]{
           polygon-fill: #add8e6;
         }
         [bt3038tl = "< 1 cm"]{
           polygon-fill: #b0c4de;
         }
        }
      `
      this.layers["Water supply"].layers.future.layer = this.define_carto_layer(futureWaterSupplyDataset, futureWaterSupplyStyle, "bt3038tl", wri_client, "wri-rw", "Water supply")

      //Baseline Water demand
      const baselineWaterDemandDataset = 'aqueduct_projections_20150309'
      const baselineWaterDemandStyle = `
        #layer {
        opacity: 0.5;
         [ut2028tl = ">30 cm"]{
           polygon-fill: #8b4513;
         }
         [ut2028tl = "10-30 cm"]{
           polygon-fill: #daa520;
         }
         [ut2028tl = "3-10 cm"]{
           polygon-fill: #d2b48c;
         }
         [ut2028tl = "1-3 cm"]{
           polygon-fill: #ffdead;
         }
         [ut2028tl = "< 1 cm"]{
           polygon-fill: #fff8dc;
         }
        }
      `
      this.layers["Water demand"].layers.baseline.annual.layer = this.define_carto_layer(baselineWaterDemandDataset, baselineWaterDemandStyle, "ut2028tl", wri_client, "wri-rw", "Water demand")

      //Future Water demand
      const futureWaterDemandDataset = 'aqueduct_projections_20150309'
      const futureWaterDemandStyle = `
        #layer {
        opacity: 0.5;
         [ut3028tl = ">30 cm"]{
           polygon-fill: #8b4513;
         }
         [ut3028tl = "10-30 cm"]{
           polygon-fill: #daa520;
         }
         [ut3028tl = "3-10 cm"]{
           polygon-fill: #d2b48c;
         }
         [ut3028tl = "1-3 cm"]{
           polygon-fill: #ffdead;
         }
         [ut3028tl = "< 1 cm"]{
           polygon-fill: #fff8dc;
         }
        }
      `
      this.layers["Water demand"].layers.future.layer = this.define_carto_layer(futureWaterDemandDataset, futureWaterDemandStyle, "ut3028tl", wri_client, "wri-rw", "Water demand")

      //Baseline Surface Water Pharmaceutical Pollution
      let color_function_Surface_Water_Pharmaceutical_Pollution = function(values) {
        let value = values[0]
        if (value < 0) return
        else if (value === 0) return '#09bbfb'
        else if(value <= 10) return '#3ad110'
        else if(value <= 30) return '#faed08'
        else if(value <= 100) return '#fe0000'
        else return '#010103'
      }
      let color_legend_Surface_Water_Pharmaceutical_Pollution = ['#09bbfb', '#3ad110', '#faed08', '#fe0000', '#010103' ]
      let label_legend_Surface_Water_Pharmaceutical_Pollution = ["0", ">0-10", "10-30", "30-100",">100"]
      //this.layers["Surface Water Pharmaceutical Pollution"].layers.baseline.annual.layer = this.define_raster_layer("surface_pharmaceutical_pollution_baseline", color_function_Surface_Water_Pharmaceutical_Pollution, color_legend_Surface_Water_Pharmaceutical_Pollution, label_legend_Surface_Water_Pharmaceutical_Pollution, " ng/L", "Surface Water Pharmaceutical Pollution")
      this.layers["Surface Water Pharmaceutical Pollution"].layers.baseline.annual.layer = this.define_raster_layer("contaminant_C", color_function_Surface_Water_Pharmaceutical_Pollution, color_legend_Surface_Water_Pharmaceutical_Pollution, label_legend_Surface_Water_Pharmaceutical_Pollution, " ng/L", "Surface Water Pharmaceutical Pollution")

      //Future Surface Water Pharmaceutical Pollution
      this.layers["Surface Water Pharmaceutical Pollution"].layers.future.layer = this.define_raster_layer("contaminant_C_BAU", color_function_Surface_Water_Pharmaceutical_Pollution, color_legend_Surface_Water_Pharmaceutical_Pollution, label_legend_Surface_Water_Pharmaceutical_Pollution, " ng/L", "Surface Water Pharmaceutical Pollution")

      //Coastal Pharmaceutical Pollution
      let color_function_coastal_Pharmaceutical_Pollution = function(values) {
        let value = values[0]
        if (value < 0) return
        else if(value < 10) return '#02b5fd'
        else if(value <= 50) return '#34d10e'
        else if(value <= 1000) return '#f8ee04'
        else if(value <= 100000) return '#fe0000'
        else return '#000000'
      }
      let color_legend_coastal_Pharmaceutical_Pollution = ['#02b5fd', '#34d10e', '#f8ee04', '#fe0000', '#000000' ]
      let label_legend_coastal_Pharmaceutical_Pollution = ["<10", "10-50", "50-1000", "1000-100000",">100000"]
      this.layers["Coastal Pharmaceutical Pollution"].layers.baseline.annual.layer = this.define_raster_layer("contaminant_L_baseline", color_function_coastal_Pharmaceutical_Pollution, color_legend_coastal_Pharmaceutical_Pollution, label_legend_coastal_Pharmaceutical_Pollution, " g/(km*y)", "Surface Water Pharmaceutical Pollution")


    },
  },

  mounted() {
    this.setupLeafletMap();
    this.place_markers(this.$location_markers)
  }
};
</script>

<style >

@import "https://fonts.googleapis.com/icon?family=Material+Icons";
@import "https://carto.com/developers/carto-js/examples/maps/public/style.css";

aside.toolbox {
  position: absolute;
  right: 15px;
  top: 80px;
  min-width: 300px;
  max-width: 300px;
  z-index: 2;
}

#toggle_layer{
  position: absolute;
  z-index: 2;
  right: 0px;
  top: -58px;
  min-width: 50px;
  max-width: 50px;
  min-height: 50px;
  max-height: 50px;
  border-radius: 5px;
  border-color: #1C195B;
  border-style: solid;
  border-width: 1px;
  background-color: white;
  display: table}

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


.legend i {
  width: 18px;
  height: 18px;
  float: left;
  margin-right: 8px;
  opacity: 0.5;
}







</style>