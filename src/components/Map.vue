<template>
  <div id="container">
    <div id="map"></div>

    <aside class="toolbox" >

      <div id="toggle_layer" @click="toggle_layer_selection_menu">
          <v-icon large style="display: table-cell;vertical-align: middle;text-align: center; color:#1C195B;">mdi-layers</v-icon>
      </div>


      <div v-if="selected_layer !== null">
        <div class="box legend">
          <div>
            <b>{{ selected_layer }}</b> <v-icon style="float: right; color:#1C195B;" @click="$emit('closeLayer')">mdi-layers-remove</v-icon>
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
                color='#1C195B'
                dense
            ></v-radio>
          </v-radio-group>
          <div v-if="baseline_future_model === 'baseline' && layers[selected_layer].monthly ">
            <v-radio-group v-model="annual_monthly_model" row >
              <v-radio
                  v-for="resolution of annual_monthly"
                  :key="resolution.key"
                  :label="resolution.label"
                  :value="resolution.key"
                  color='#1C195B'
                  dense
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

    <v-dialog
        v-model="dialog"
        max-width="550"
    >
      <v-container
        style="background-color: white"
      >
        <b>Search a location by address, decimal degrees or in DMS (degrees, minutes and seconds):</b>
        <v-radio-group v-model="searchAddressModel" row>
          <v-radio
              label="Address"
              value="address"
              color="#1C195B"
              @click="address_model = null"
          ></v-radio>
          <v-radio
              label="Decimal degrees"
              value="decimal_degrees"
              color= "#1C195B"
              @click="latitudeModel=null; longitudeModel=null"
          ></v-radio>
          <v-radio
              label="Degrees Minutes Seconds"
              value="coordinates"
              color="#1C195B"
          ></v-radio>
        </v-radio-group>

        <div v-if="searchAddressModel === 'address'">
          <v-autocomplete
              v-model="address_model"
              :items="address_suggestions"
              label="Address"
              :loading="isLoading"
              :search-input.sync="searchAddress"
              hide-no-data
              hide-selected
              item-text="label"
              item-value="label"
              placeholder="Start typing to search"
              return-object
              clearable
          ></v-autocomplete>
        </div>
        <div v-else-if="searchAddressModel === 'decimal_degrees'">
          <v-form
            v-model="decimal_degrees_valid"
          >
            <v-row>
              <v-col
                  cols="6"
              >
                <v-text-field
                    v-model="latitudeModel"
                    :rules="latitudeRules"
                    label="Latitude"
                    required
                    type="number"
                ></v-text-field>
              </v-col>

              <v-col
                  cols="6">
                <v-text-field
                    v-model="longitudeModel"
                    :rules="longitudeRules"
                    label="Longitude"
                    required
                    type="number"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-btn
                :disabled="!decimal_degrees_valid"
                small
                tile
                block
                color="#b62373"
                @click="searchDecimalsDegrees"
            >
              SEARCH
            </v-btn>
          </v-form>
        </div>
        <div v-else-if="searchAddressModel === 'coordinates'">
          <v-form
            v-model="coordinates_valid"
          >
            <v-row><b style="margin-top: 15px; margin-left: 12px; margin-bottom: -15px">Latitude:</b></v-row>
            <v-row>
              <v-col cols="3">
                <v-text-field
                    v-model="latitude_degree"
                    :rules="degree_rules"
                    label="Degrees"
                    required
                    type="number"
                    append-icon="º"
                ></v-text-field>
              </v-col>
              <v-col cols="3">
                <v-text-field
                    v-model="latitude_minutes"
                    :rules="minutes_rules"
                    label="Minutes"
                    required
                    type="number"
                    append-icon="'"
                ></v-text-field>
              </v-col>
              <v-col cols="3">
                <v-text-field
                    v-model="latitude_seconds"
                    :rules="secondsRules"
                    label="Seconds"
                    required
                    type="number"
                    append-icon='"'
                ></v-text-field>
              </v-col>
              <v-col cols="3">
                <v-select
                    :items=latitude_direction
                    label="Direction"
                    v-model="north_south_model"
                ></v-select>
              </v-col>
            </v-row>
            <v-row><b style="margin-top: 15px; margin-left: 12px; margin-bottom: -15px">Longitude:</b></v-row>
            <v-row>
              <v-col cols="3">
                <v-text-field
                    v-model="longitude_degrees"
                    :rules="degree_rules"
                    label="Degrees"
                    required
                    type="number"
                    append-icon="º"
                ></v-text-field>
              </v-col>
              <v-col cols="3">
                <v-text-field
                    v-model="longitude_minutes"
                    :rules="minutes_rules"
                    label="Minutes"
                    required
                    type="number"
                    append-icon="'"
                ></v-text-field>
              </v-col>
              <v-col cols="3">
                <v-text-field
                    v-model="longitude_seconds"
                    :rules="secondsRules"
                    label="Seconds"
                    required
                    type="number"
                    append-icon='"'
                ></v-text-field>
              </v-col>
              <v-col cols="3">
                <v-select
                    :items=longitude_direction
                    label="Direction"
                    v-model="east_west_model"
                ></v-select>
              </v-col>
            </v-row>
          </v-form>

          <v-btn
              :disabled="!coordinates_valid"
              small
              tile
              block
              @click="searchCoordinates"
              color="#b62373"
          >
            SEARCH
          </v-btn>
        </div>
      </v-container>




    </v-dialog>

  </div>


</template>

<script>
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Icon } from "leaflet";
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';
import carto from '@carto/carto.js'
import "leaflet-easybutton"
import "leaflet-easybutton/src/easy-button.css"
import 'leaflet-arrowheads'

delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

import axios from "axios"
import Vue from "vue";

let parse_georaster = require("georaster");
let GeoRasterLayer = require("georaster-layer-for-leaflet");
let _ = require('lodash');
let chroma = require("chroma-js")
let $ = require( "jquery" );
import {utils} from "../utils"


export default {
  name: "Map",
  components: {
    L,
  },
  props: ["selected_layer", "selected_assessment", "selected_industry"],
  data() {
    return {
      center: this.$last_location,
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
          label: "2030"
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
      html_legend: "",
      dialog:false,
      searchAddressModel: "address",
      address_model: null,
      provider: new OpenStreetMapProvider(),
      address_suggestions: [],
      isLoading: false,
      searchAddress: null,

      latitudeModel: null,
      latitudeRules: [
        v => !!v || 'Latitude is required',
        v => (v>=-90 && v<=90) || "Latitude should be >= -90 and <= 90",
      ],
      longitudeModel: null,
      longitudeRules: [
        v => !!v || 'Longitude is required',
        v => (v>=-180 && v<=180) || "Longitude should be >= -180 and <= 180",
      ],
      decimal_degrees_valid: true,
      latitude_degree: null,
      degree_rules: [
        v => !!v || 'Degrees are required',
        v => (v>=0 && v<=59) || "Degrees should be >= 0 and <= 59",
        v => (utils.is_Natural(parseFloat(v))) || "Degrees should be a natural value"

      ],
      latitude_minutes: null,
      minutes_rules: [
        v => !!v || 'Minutes are required',
        v => (v>=0 && v<=59) || "Minutes should be >= 0 and <= 59",
        v => (utils.is_Natural(parseFloat(v))) || "Minutes should be a natural value"
      ],
      latitude_seconds: null,
      secondsRules: [
        v => !!v || 'Seconds are required',
        v => (v>=0 && v<60) || "Seconds should be >= 0 and < 60",
      ],
      latitude_direction: ["North", "South"],
      north_south_model: "North",

      longitude_degrees: null,
      longitude_minutes: null,
      longitude_seconds: null,
      longitude_direction: ["East", "West"],
      east_west_model: "East",
      coordinates_valid: false,
      listenToWatch: true,
      adding_supply_chain: false,
      supply_chain_name: null,
      vectors: []

    };
  },

  watch: {

    address_model: function(address) {
      if(address !== null){
        this.onMapClick({latlng: address.latlng})
        this.dialog = false
        this.$nextTick(() => {
          this.address_model = null
          this.searchAddress = null
        });
      }

    },

    searchAddress: function (address) {

      //if (this.address_suggestions.length > 0) return
      //if(this.isLoading) return

      this.isLoading = true
      //fetch("https://nominatim.openstreetmap.org/search?q="+address+"&format=json")
      fetch("https://photon.komoot.io/api/?q="+address)
          .then(res => res.json())
          .then(res => {
            let items = res.features.map(feature => {
              return {label: feature.properties.name, latlng: {lat: feature.geometry.coordinates[1], lng: feature.geometry.coordinates[0]}}
            })
            this.address_suggestions = items
          })
          .catch(err => {
            console.log(err)
          })
          .finally(() => (this.isLoading = false))
      //const results = await this.provider.search({ query: address });
      //this.address_suggestions = results

    },

    location_markers: function (markers) {
      //Delete markers first
      this.delete_markers()
      this.place_markers(markers)
    },

    selected_layer: function (new_layer, old_layer) {

      this.delete_layer(old_layer, this.baseline_future_model, this.annual_monthly_model, this.months_model)

      this.listenToWatch = false
      this.baseline_future_model = 'baseline'
      this.months_model = 0
      this.annual_monthly_model =  "annual"
      this.add_layer(new_layer)
      this.$nextTick(()=>{
        this.listenToWatch = true
      })




      //if(old_layer !== null) this.layers[old_layer].layer.delete()

    },
    baseline_future_model: function (new_value, old_value) {
      if(this.listenToWatch){
        let old_layer = this.selected_layer
        let new_layer = this.selected_layer
        this.delete_layer(old_layer, old_value, this.annual_monthly_model, this.months_model)
        this.add_layer(new_layer)
      }
    },
    months_model: function (new_value, old_value) {
      if(this.listenToWatch){
        let old_layer = this.selected_layer
        let new_layer = this.selected_layer
        this.delete_layer(old_layer, this.baseline_future_model, this.annual_monthly_model, old_value)
        this.add_layer(new_layer)
      }

    },
    annual_monthly_model: function (new_value, old_value) {
      if(this.listenToWatch){
        let old_layer = this.selected_layer
        let new_layer = this.selected_layer
        this.delete_layer(old_layer, this.baseline_future_model, old_value, this.months_model)
        this.add_layer(new_layer)
      }

    },
},
  methods: {


    close_supply_chain_mode(){
      this.adding_supply_chain = false
    },
    enter_supply_chain_mode(){
      this.adding_supply_chain = true
    },


    pan_location(location){
      this.mapDiv.panTo(location)
    },

    async onMapClick(e) {

      let _this = this

      let greenIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      let latlng = e.latlng

      let island = await utils.areCoordsLand(latlng.lat, latlng.lng)

      if(island){
        this.mapDiv.setView([latlng.lat, latlng.lng]);

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
          if(_this.adding_supply_chain){
            _this.$emit('createSupplyChain', latlng)
          }else{
            _this.$emit('createIndustry', latlng)
          }
        });
      }
      else{

        _this.$emit('wrongLocation', latlng)
      }


    },

    searchCoordinates(){

      let lat_decimal = Number.parseFloat(this.latitude_degree) + Number.parseFloat(this.latitude_minutes)/60 + Number.parseFloat(this.latitude_seconds)/3600
      let lng_decimal = Number.parseFloat(this.longitude_degrees) + Number.parseFloat(this.longitude_minutes)/60 + Number.parseFloat(this.longitude_seconds)/3600

      if(this.east_west_model === "West") lng_decimal = -1*lng_decimal
      if(this.north_south_model === "South") lat_decimal = -1*lat_decimal


      let e = {
        latlng: {
          lat: lat_decimal,
          lng: lng_decimal
        }
      }

      this.onMapClick(e)

      this.latitude_degree= null
      this.latitude_minutes= null
      this.latitude_seconds= null
      this.north_south_model= "North"
      this.longitude_degrees= null
      this.longitude_minutes= null
      this.longitude_seconds= null
      this.east_west_model= "East"
      this.dialog = false

    },

    searchDecimalsDegrees(){
      let _this = this
      let e = {
        latlng: {
          lat: _this.latitudeModel,
          lng: _this.longitudeModel
        }
      }

      this.dialog = false
      this.onMapClick(e)
    },

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
      if(this.popup_info===null) {
        this.popup_info=this.clicked_marker.bindPopup()
      }

      if(this.adding_supply_chain) text += ('<br><br><button class="trigger">ADD SUPPLY CHAIN INDUSTRY</button>')
      else if(add_industry === true) text += ('<br><br><button class="trigger">ADD INDUSTRY</button>')
      //else if(add_industry === "supply_chain") text += ('<br><br>'+this.supply_chain_name)


      this.popup_info.setPopupContent(text)
      this.popup_info.openPopup()
    },
    define_carto_layer(dataset, style, label, carto_client, username, change_unit = false, old_units = "", new_units = "", unit_scale_factor = 1){
      let _this = this
      let obj = {}

      //const layerDataset = new carto.source.SQL(dataset);
      const layerDataset = new carto.source.Dataset(dataset);
      const layerStyle = new carto.style.CartoCSS(style);

      let style_splited = style.split("\n")
      let style_label = style_splited.filter(line => line.includes(label)).map(function(line) {
        let label = line.split('"')[1]
        if(label === undefined) { //Label is a number
          return "-"
        }else{ //Label is a string
          return label
        }

      })

      style_label = style_label.map(function(label){
        if (change_unit) label = label.replace(old_units, new_units)
        if(label.match(/\d+/g) != null) label = label.replace(/\d+/g, digit => digit * unit_scale_factor);  //Multiply all numbers for the scale

        return label
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
        obj["unit"] = function(){
          return new_units
        }

      }
      obj["delete"] = function(){
        _this.current_carto_client.removeLayer(layer)
        _this.current_carto_client = null
        _this.delete_markers()
        _this.place_markers(_this.$location_markers)

      }

      async function data_on_point(lat, lng){
        return fetch("https://"+username+".carto.com:443/api/v2/sql?q=select "+label+" from "+dataset+" where ST_Intersects( the_geom, cdb_latlng("+lat+","+lng+"))")
            // we transform the response from the Fetch API into a JSON format
            .then(resp => {
              return resp.json()
            }).then((response) => {
              // we get the data from the request response
              let modified_string = response.rows[0][label]
              if (change_unit) modified_string = modified_string.replace(old_units, new_units)
              if(Number.isFinite(modified_string)){
                modified_string = modified_string * unit_scale_factor
              }else{
                if(modified_string.match(/\d+/g) != null) modified_string = modified_string.replace(/\d+/g, digit => digit * unit_scale_factor);  //Multiply all numbers for the scale

              }
              return(modified_string)
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

      obj["get_label_on_coord"] = async function(lat, lng){
        let value =  await data_on_point(lat, lng)
        if(value == undefined) return "No data"
        else return value
      }

      obj["data_on_point"] = async function(lat, lng){
        return await data_on_point(lat, lng)
      }

      obj["data_for_report"] = async function(lat, lng){
        let value =  await data_on_point(lat, lng)
        if(value == undefined) return "No data"
        else return value
      }

      obj["unit"] = function(){
        return "-"
      }
      return obj
    },

    define_carto_layer_v2(dataset, style, label, carto_client, username, color_legend, label_legend, noData, unit_scale_factor = 1, units=""){
      let _this = this
      let obj = {}

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
        _this.html_legend = "<br>"

        // loop through our density intervals and generate a label with a colored square for each interval
        for(let i = 0; i<label_legend.length; i++){
          let label = label_legend[i]
          let color = color_legend[i]
          _this.html_legend += '<i style="opacity: 0.5; background:' + color + '"></i> ' + label + '<br>';

        }

      }
      obj["delete"] = function(){
        _this.current_carto_client.removeLayer(layer)
        _this.current_carto_client = null
        _this.delete_markers()
        _this.place_markers(_this.$location_markers)
      }

      obj["unit"] = function(){
        return units
      }

      async function data_on_point(lat, lng){
        return fetch("https://"+username+".carto.com:443/api/v2/sql?q=select "+label+" from "+dataset+" where ST_Intersects( the_geom, cdb_latlng("+lat+","+lng+"))")
            // we transform the response from the Fetch API into a JSON format
            .then(resp => {
              return resp.json()
            }).then((response) => {
              // we get the data from the request response
              if(response.rows[0] == undefined) return noData
              else if (response.rows[0] == noData) return noData
              else return response.rows[0][label]*unit_scale_factor
            })
            .catch(function (error) {
              // check if the request is returning an error
              console.log(error)
            });
      }

      obj["data_on_point"] = async function(lat, lng){
        return await data_on_point(lat, lng)
      }

      obj["data_for_report"] = async function(lat, lng){
        let data = await data_on_point(lat, lng)
        if(data !== undefined){
          if(data !== noData) {
            if (units !== "%") return data.toExponential(3)
            else return +data.toFixed(3).toString()
          }
          else return "No data"
        }else return "No data"
      }

      async function label_on_point(lat, lng){
        let data = await data_on_point(lat, lng)
        if(data !== undefined){
          if(data !== noData) {
            if (units !== "%") return data.toExponential(3) + units
            else return +data.toFixed(3).toString() + units
          }
          else return "No data"
        }else return "No data"
      }



      obj["click"] = async function(latlng, add_industry=true){
        let label = await label_on_point(latlng.lat, latlng.lng)

        _this.toggle_popup("<b>"+_this.selected_layer+"</b>: "+label, add_industry)
      }

      obj["get_label_on_coord"] = async function(lat, lng){
        let label = await label_on_point(lat, lng)
        return label
      }
      return obj
    },


    define_raster_layer(geotiff_file_data, geotiff_file_palette, color_function, color_legend, label_legend, units="", scale=1, resolution=16, noData=null){
      let _this = this
      let obj = {}
      let url_to_geotiff_data = "https://wiat-server.icradev.cat/image?filename="+geotiff_file_data
      let url_to_geotiff_palette = url_to_geotiff_data
      if(geotiff_file_palette !== null) url_to_geotiff_palette = "https://wiat-server.icradev.cat/image?filename="+geotiff_file_palette


      obj["apply"] = function(){

        parseGeoraster(url_to_geotiff_palette).then(georaster => {

          let layer = new GeoRasterLayer({
            opacity: 0.7,
            georaster: georaster,
            resolution: resolution,
            pixelValuesToColorFn: color_function,
          });
          layer.addTo(_this.mapDiv);
        });

        _this.html_legend = "<br>"
        // loop through our density intervals and generate a label with a colored square for each interval
        for (let i = 0; i < color_legend.length; i++) {
          _this.html_legend += '<i style="opacity: 0.5; background:' + color_legend[i] + '"></i> ' + label_legend[i] + '<br>';
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

      obj["data_on_point"] = async function(lat, lng){
        return await data_on_point(lat, lng)
      }

      obj["data_for_report"] = async function(lat, lng){
        let value = await data_on_point(lat, lng)
        let value_string = ""
        let value_number = Number.parseFloat(value)
        if(value_number === NaN) value_string = value
        else {
          if (noData == null && value_number < 0) value_string = "No data"
          else if (noData != null && value_number == noData) value_string = "No data"

          else {
            if(units !== "%") {
              value_string = value_number.toExponential(3)
            } else {
              value_string = +value_number.toFixed(3).toString()
            }
          }

        }
        return value_string
      }
      async function data_on_point(lat, lng){
        let value = await _this.get_raster_data(lat, lng, geotiff_file_data)*scale
        return value
      }

      async function label_on_point(lat, lng){
        let value = await data_on_point(lat, lng)
        let value_string = ""
        let value_number = Number.parseFloat(value)
        if(value_number === NaN) value_string = value
        else {

          if (noData == null && value_number < 0) value_string = "No data"
          else if (noData != null && value_number == noData) value_string = "No data"

          else {
            if(units !== "%") {
              value_string = value_number.toExponential(3) + units
            } else {
              value_string = +value_number.toFixed(3).toString() + units
            }
          }

        }
        return value_string
      }

      obj["click"] = async function(latlng, add_industry=true){
        let popup_message = "<b>"+_this.selected_layer+"</b>: "
        let value_string = await label_on_point(latlng.lat, latlng.lng)
        _this.toggle_popup(popup_message + value_string, add_industry)
      }
      obj["get_label_on_coord"] = async function(lat, lng){
        let str = await label_on_point(lat, lng)
        return str
      }

      obj["unit"] = function(){
        return units
      }
      return obj
    },

    //Delete markers from industries
    delete_markers(){
      this.markers.forEach(marker => {
        this.mapDiv.removeLayer(marker);
      })
      this.vectors.forEach(vector => {
        vector.remove()
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
      _this.vectors.splice(0, _this.vectors.length)
      markers.forEach(marker =>{

        let new_marker = null
        if(marker.isSupplyChain){

          let smallIcon = new L.Icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [12, 20],
            iconAnchor: [6, 20],
            popupAnchor: [1, -17],
            shadowSize: [20, 20]
          });

          new_marker = L.marker(marker.latlng, {icon: smallIcon}).addTo(_this.mapDiv)

          new_marker.on('click', function(e) {
            _this.mapDiv.panTo(marker.latlng)
            _this.$emit('editSupplyChain', marker.assessment, marker.industry, marker.supply_chain)

            if(_this.selected_layer!==null) {
              _this.popup_info=new_marker.bindPopup()
              _this.supply_chain_name = marker.name
              //_this.toggle_popup(marker.name, false)
              let current_layer = _this.get_layer(_this.selected_layer, _this.baseline_future_model, _this.annual_monthly_model, _this.months_model)
              current_layer.click(marker.latlng, "supply_chain")
            }/*else{
              new_marker.unbindPopup()
            }*/
          })

          let myVector = L.polyline([ marker.latlng, marker.industry_coords ]).arrowheads({
            size: "5px"
          })
          myVector.addTo(_this.mapDiv)

          _this.vectors.push(myVector)

        }
        else {
          new_marker = L.marker(marker.latlng).addTo(_this.mapDiv).on('click', function(e) {
            _this.mapDiv.panTo(marker.latlng)
            _this.$emit('editIndustry', marker.assessment, marker.industry)

            if(_this.selected_layer!==null) {
              _this.popup_info=new_marker.bindPopup()
              let current_layer = _this.get_layer(_this.selected_layer, _this.baseline_future_model, _this.annual_monthly_model, _this.months_model)
              current_layer.click(marker.latlng, false)
            }else{
            }
          });
        }

        _this.markers.push(new_marker)
      })
    },

    get_raster_data(lat, lng, file_name) {
      //http://localhost:3000/bona?longitude=2.16992&latitude=41.3879
      let call = "https://wiat-server.icradev.cat/data_point?filename="+file_name+"&longitude="+lng+"&latitude="+lat
      return axios
          .get(call)
          .then(response => {
            if(response) {
              if(response.data.test[0]["0"]) return response.data.test[0]["0"]
              else return -9999999999
            }else return -999999999
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



      this.mapDiv.on('click', this.onMapClick);


      /*L.easyButton('<img src="https://www.vhv.rs/dpng/d/281-2813882_compass-icon-svg-hd-png-download.png" style="width:20px">', function(btn, map){
        _this.searchAddressModel = "address"
        _this.dialog = true
      }).addTo( this.mapDiv );*/

      L.easyButton('<span compass_icon="star">&target;</span>', function(btn, map){
        _this.searchAddressModel = "address"
        _this.dialog = true
      }).addTo( this.mapDiv );
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
      let label_legend_population = ["0 people","1-25 people","25-100 people","100-250 people","250-1000 people","1000-5000 people","5000-100000 people",">100000 people"]


      //Baseline population
      this.layers["Population"].layers.baseline.annual.layer = this.define_raster_layer("baseline_population", null, color_function_population, color_legend_population, label_legend_population, " people")

      //Future population
      this.layers["Population"].layers.future.layer = this.define_raster_layer("future_population", null, color_function_population, color_legend_population, label_legend_population, " people")

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


      this.layers["Aridity index"].layers.baseline.annual.layer = this.define_raster_layer("aridity_baseline", null, color_function_baseline_aridity, color_legend_baseline_aridity, label_legend_baseline_aridity,"", 1/10000)

      //Baseline runoff
      let color_legend_baseline_runoff = ['#bed1e3', '#4f9ce3', '#2171b5', '#19598d', '#08306b' ]
      let label_legend_baseline_runoff = ["<=1e+7 m3/year", "<=1e+8 m3/year", "<=1e+9 m3/year", "<=1e+10 m3/year", ">1e+10 m3/year"]

      this.layers["Flow accumulation"].layers.baseline.annual.layer = this.define_raster_layer("flow_accumulated",  "flow_accumulated_palette", undefined, color_legend_baseline_runoff, label_legend_baseline_runoff, " m3/year")
      this.layers["Flow accumulation"].layers.future.layer = this.define_raster_layer("flow_acc_bau",  "flow_acc_bau_palette", undefined, color_legend_baseline_runoff, label_legend_baseline_runoff, " m3/year")

      //Streamflow
      let color_function_streamflow = function(values) {
        let value = values[0]
        if (value <= 0 || value >= 100000002004087730000) return
        else if (value <= 3) return '#d1e2f3'
        else if(value <= 12) return '#9ac8e0'
        else if(value <= 35) return '#529dcc'
        else if(value <= 123.89) return '#1d6cb1'
        else if(value > 123.89) return '#08306b'

      }
      let color_legend_streamflow = ['#d1e2f3', '#9ac8e0', '#529dcc', '#1d6cb1', '#08306b' ]
      let label_legend_streamflow = ["<=3 m3/seconds", "<=12 m3/seconds", "<=35 m3/seconds", "<=123 m3/seconds", ">=123 m3/seconds"]

      this.layers["Streamflow"].layers.baseline.annual.layer = this.define_raster_layer("dismanual",  'streamflow_color', undefined, color_legend_streamflow, label_legend_streamflow, " m3/seconds", 1, 32)
      this.layers["Streamflow"].layers.future.layer = this.define_raster_layer("streamflow_2030",  'streamflow_2030_color', undefined, color_legend_streamflow, label_legend_streamflow, " m3/seconds", 1, 32)



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

      let water_stress_colors = ['#ffff99', '#ffe600', '#ff9900', '#ff1900', '#990000', '#808080', '#4e4e4e' ]
      let water_stress_labels = ["Low (<10%)", "Low - Medium (10-20%)","Medium - High (20-40%)", "High (40-80%)","Extremely High (>80%)","Arid and Low Water Use","No Data"]


      //this.layers["Water stress"].layers.baseline.annual.layer = this.define_carto_layer(baselineWaterStressDataset, baselineWaterStressStyle, "bws_label", wri_client, "wri-rw")
      this.layers["Water stress"].layers.baseline.annual.layer = this.define_carto_layer_v2(baselineWaterStressDataset, baselineWaterStressStyle, "bws_raw", wri_client, "wri-rw", water_stress_colors, water_stress_labels, -9999, 100, "%")


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
      //this.layers["Water stress"].layers.future.layer = this.define_carto_layer(futureWaterStressDataset, futureWaterStressStyle, "ws3028tl", wri_client, "wri-rw")
      this.layers["Water stress"].layers.future.layer = this.define_carto_layer_v2(futureWaterStressDataset, futureWaterStressStyle, "ws3028tr", wri_client, "wri-rw", water_stress_colors, water_stress_labels, 0, 100, "%")

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
        let layer_i = this.define_carto_layer(monthlyWaterStressDataset, monthlyWaterStressStyle, label, own_client, "jsalo")
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
      let water_depletion_colors = ['#ffff99', '#ffe600', '#ff9900', '#ff1900', '#990000', '#808080', '#4e4e4e' ]
      let water_depletion_labels = ["Low (<5%)", "Low - Medium (5-25%)","Medium - High (25-50%)", "High (50-75%)","Extremely High (>75%)","Arid and Low Water Use","No Data"]

      //this.layers["Water depletion"].layers.baseline.annual.layer = this.define_carto_layer(annualBaselineWaterDepletionDataset, annualBaselineWaterDepletionStyle, "bwd_label", wri_client, "wri-rw")
      this.layers["Water depletion"].layers.baseline.annual.layer = this.define_carto_layer_v2(annualBaselineWaterDepletionDataset, annualBaselineWaterDepletionStyle, "bwd_raw", wri_client, "wri-rw", water_depletion_colors, water_depletion_labels, -9999, 100, "%")


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
        let layer_i = this.define_carto_layer(monthlyWaterDepletionDataset, monthlyWaterDepletionStyle, label, own_client, "jsalo")
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
      let water_iav_colors = ['#ffff99', '#ffe600', '#ff9900', '#ff1900', '#990000', '#4e4e4e' ]
      let water_iav_labels = ["Low (<0.25)", "Low - Medium (0.25-0.50)","Medium - High (0.50-0.75)", "High (0.75-1.00)","Extremely High (>1.00)","No Data"]


      //this.layers["Interannual variability"].layers.baseline.annual.layer = this.define_carto_layer(baselineInterannualVariabilityDataset, baselineInterannualVariabilityStyle, "iav_label", wri_client, "wri-rw")
      this.layers["Interannual variability"].layers.baseline.annual.layer = this.define_carto_layer_v2(baselineInterannualVariabilityDataset, baselineInterannualVariabilityStyle, "iav_raw", wri_client, "wri-rw", water_iav_colors, water_iav_labels, -9999)

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
        let layer_i = this.define_carto_layer(monthlyInterannualVariabilityDataset, monthlyInterannualVariabilityStyle, label, own_client, "jsalo")
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

      let water_sev_colors = ['#ffff99', '#ffe600', '#ff9900', '#ff1900', '#990000', '#4e4e4e' ]
      let water_sev_labels = ["Low (<0.33)", "Low - Medium (0.33-0.66)","Medium - High (0.66-1.00)", "High (1.00-1.33)","Extremely High (>1.33)","No Data"]

      //this.layers["Seasonal variability"].layers.baseline.annual.layer = this.define_carto_layer(baselineSeasonalVariabilityDataset, baselineSeasonalVariabilityStyle, "sev_label", wri_client, "wri-rw")
      this.layers["Seasonal variability"].layers.baseline.annual.layer = this.define_carto_layer_v2(baselineSeasonalVariabilityDataset, baselineSeasonalVariabilityStyle, "sev_raw", wri_client, "wri-rw", water_sev_colors, water_sev_labels, -9999)


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
      //this.layers["Seasonal variability"].layers.future.layer = this.define_carto_layer(futureSeasonalVariabilityDataset, futureSeasonalVariabilityStyle, "sv3028tl", wri_client, "wri-rw")
      this.layers["Seasonal variability"].layers.future.layer = this.define_carto_layer_v2(futureSeasonalVariabilityDataset, futureSeasonalVariabilityStyle, "sv3028tr", wri_client, "wri-rw", water_sev_colors, water_sev_labels, -9999)

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
      let water_gtd_colors = ['#ffff99', '#ffe600', '#ff9900', '#ff1900', '#990000', '#808080', '#4e4e4e' ]
      let water_gtd_labels = ["Low (<0 mm/year)", "Low - Medium (0-20 mm/year)","Medium - High (20-40 mm/year)", "High (40-80 mm/year)","Extremely High (>80 mm/y)","Insignificant Trend","No Data"]

      //this.layers["Groundwater table decline"].layers.baseline.annual.layer = this.define_carto_layer(baselineGroundwaterTableDeclineDataset, baselineGroundwaterTableDeclineStyle, "gtd_label", wri_client, "wri-rw", true, "cm/y", "mm/yr", 10)
      this.layers["Groundwater table decline"].layers.baseline.annual.layer = this.define_carto_layer_v2(baselineGroundwaterTableDeclineDataset, baselineGroundwaterTableDeclineStyle, "gtd_raw", wri_client, "wri-rw", water_gtd_colors, water_gtd_labels, -9999, 10," mm/year")

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

      let water_rfr_colors = ['#ffff99', '#ffe600', '#ff9900', '#ff1900', '#990000', '#4e4e4e' ]
      let water_rfr_labels = ["Low (0 to 1 in 1,000)", "Low - Medium (1 in 1,000 to 2 in 1,000)", "Medium - High (2 in 1,000 to 6 in 1,000)","High (6 in 1,000 to 1 in 100)", "Extremely High (more than 1 in 100)","No Data"]

//      this.layers["Riverine flood risk"].layers.baseline.annual.layer = this.define_carto_layer(baselineRiverineFloodRiskDataset, baselineRiverineFloodRiskStyle, "rfr_label", wri_client, "wri-rw")
      this.layers["Riverine flood risk"].layers.baseline.annual.layer = this.define_carto_layer_v2(baselineRiverineFloodRiskDataset, baselineRiverineFloodRiskStyle, "rfr_raw", wri_client, "wri-rw", water_rfr_colors, water_rfr_labels, -9999)


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

      let water_cfr_colors = ['#ffff99', '#ffe600', '#ff9900', '#ff1900', '#990000', '#4e4e4e' ]
      let water_cfr_labels = ["Low (0 to 9 in 1,000,000)", "Low - Medium (9 in 1,000,000 to 7 in 100,000)", "Medium - High (7 in 100,000 to 3 in 10,000)","High (3 in 10,000 to 2 in 1,000)", "Extremely High (more than 2 in 1,000)","No Data"]

      //this.layers["Coastal flood risk"].layers.baseline.annual.layer = this.define_carto_layer(baselineCoastalFloodRiskDataset, baselineCoastalFloodRiskStyle, "cfr_label", wri_client, "wri-rw")
      this.layers["Coastal flood risk"].layers.baseline.annual.layer = this.define_carto_layer_v2(baselineCoastalFloodRiskDataset, baselineCoastalFloodRiskStyle, "cfr_raw", wri_client, "wri-rw", water_cfr_colors, water_cfr_labels, -9999)

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
      let water_ddr_colors = ['#ffff99', '#ffe600', '#ff9900', '#ff1900', '#990000', '#4e4e4e' ]
      let water_ddr_labels = ["Low (0.0-0.2)", "Low - Medium (0.2-0.4)", "Medium (0.4-0.6)","Medium - High (0.6-0.8)", "High (0.8-1.0)","No Data"]

      //this.layers["Drought risk"].layers.baseline.annual.layer = this.define_carto_layer(baselineDroughtRiskDataset, baselineDroughtRiskStyle, "drr_label", wri_client, "wri-rw")
      this.layers["Drought risk"].layers.baseline.annual.layer = this.define_carto_layer_v2(baselineDroughtRiskDataset, baselineDroughtRiskStyle, "drr_raw", wri_client, "wri-rw", water_ddr_colors, water_ddr_labels, -9999, 1/5)

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
      let water_cep_colors = ['#ffff99', '#ffe600', '#ff9900', '#ff1900', '#990000', '#4e4e4e' ]
      let water_cep_labels = ["Low (<-5)", "Low - Medium (-5 to 0)", "Medium - High (0 to 1)","High (1 to 5)", "Extremely High (>5)","No Data"]

      //this.layers["Coastal Eutrophication Potential"].layers.baseline.annual.layer = this.define_carto_layer(baselineCoastalEutrophicationPotentialDataset, baselineCoastalEutrophicationPotentialStyle, "cep_label", wri_client, "wri-rw")
      this.layers["Coastal Eutrophication Potential"].layers.baseline.annual.layer = this.define_carto_layer_v2(baselineCoastalEutrophicationPotentialDataset, baselineCoastalEutrophicationPotentialStyle, "cep_raw", wri_client, "wri-rw", water_cep_colors, water_cep_labels, -9999)

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
      let water_udw_colors = ['#ffff99', '#ffe600', '#ff9900', '#ff1900', '#990000', '#4e4e4e' ]
      let water_udw_labels = ["Low (<2.5%)", "Low - Medium (2.5-5%)", "Medium - High (5-10%)","High (10-20%)", "Extremely High (>20%)","No Data"]

      //this.layers["Unimproved/No Drinking Water"].layers.baseline.annual.layer = this.define_carto_layer(baselineNoDrinkingWaterDataset, baselineNoDrinkingWaterStyle, "udw_label", wri_client, "wri-rw")
      this.layers["Unimproved/No Drinking Water"].layers.baseline.annual.layer = this.define_carto_layer_v2(baselineNoDrinkingWaterDataset, baselineNoDrinkingWaterStyle, "udw_raw", wri_client, "wri-rw", water_udw_colors, water_udw_labels, -9999, 100, "%")


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

      let water_usa_colors = ['#ffff99', '#ffe600', '#ff9900', '#ff1900', '#990000', '#4e4e4e' ]
      let water_usa_labels = ["Low (<2.5%)", "Low - Medium (2.5-5%)", "Medium - High (5-10%)","High (10-20%)", "Extremely High (>20%)","No Data"]


      //this.layers["Unimproved/No Sanitation"].layers.baseline.annual.layer = this.define_carto_layer(baselineNoSanitationDataset, baselineNoSanitationStyle, "usa_label", wri_client, "wri-rw")
      this.layers["Unimproved/No Sanitation"].layers.baseline.annual.layer = this.define_carto_layer_v2(baselineNoSanitationDataset, baselineNoSanitationStyle, "usa_raw", wri_client, "wri-rw", water_usa_colors, water_usa_labels, -9999, 100, "%")


      //Demanar valor RAW

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
         [rri_label = "null"]{
           polygon-fill: #4e4e4e;
         }
        }
      `

      //let water_rri_colors = ['#ffff99', '#ffe600', '#ff9900', '#ff1900', '#990000', '#4e4e4e' ]
      //let water_rri_labels = ["Low (<25%)", "Low - Medium (25-50%)", "Medium - High (50-60%)","High (60-75%)","Extremely High (>75%)","No Data"]


      this.layers["Peak RepRisk Country ESG Risk Index"].layers.baseline.annual.layer = this.define_carto_layer(baselineRepRiskDataset, baselineRepRiskStyle, "rri_label", own_client, "jsalo")
      //this.layers["Peak RepRisk Country ESG Risk Index"].layers.baseline.annual.layer = this.define_carto_layer_v2(baselineRepRiskDataset, baselineRepRiskStyle, "rri_raw", wri_client, "wri-rw", water_rri_colors, water_rri_labels, -9999)


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

      let water_supply_colors = ['#0000ff', '#4169e1', '#1e90ff', '#00bfff', '#87ceeb', '#b0e0e6', '#add8e6', '#b0c4de' ]
      let water_supply_labels = [">10000 mm/year", "3000-10000 mm/year", "1000-3000 mm/year","300-1000 mm/year", "100-300 mm/year", "30-100 mm/year", "10-30 mm/year", "< 10 mm/year"]


      //this.layers["Water supply"].layers.baseline.annual.layer = this.define_carto_layer(baselineWaterSupplyDataset, baselineWaterSupplyStyle, "bt2028tl", wri_client, "wri-rw", true, "cm", "mm/yr", 10)
      this.layers["Water supply"].layers.baseline.annual.layer = this.define_carto_layer_v2(baselineWaterSupplyDataset, baselineWaterSupplyStyle, "bt2028tr", wri_client, "wri-rw", water_supply_colors, water_supply_labels, -9999, 1000, " mm/yr")


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
      //this.layers["Water supply"].layers.future.layer = this.define_carto_layer(futureWaterSupplyDataset, futureWaterSupplyStyle, "bt3038tl", wri_client, "wri-rw")
      this.layers["Water supply"].layers.future.layer = this.define_carto_layer_v2(futureWaterSupplyDataset, futureWaterSupplyStyle, "bt2028tr", wri_client, "wri-rw", water_supply_colors, water_supply_labels, -9999, 1000, " mm/yr")


      //Baseline Water demand
      const baselineWaterDemandDataset = 'aqueduct_projections_20150309'
      const baselineWaterDemandStyle = `
        #layer {
        opacity: 0.5;
         [ut2028tl = "> 30 cm"]{
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

      let water_demand_colors = ['#8b4513', '#daa520', '#d2b48c', '#ffdead', '#fff8dc']
      let water_demand_labels = [">300 mm/year", "100-300 mm/year", "30-100 mm/year","10-30 mm/year", "< 10 mm/year"]

      //this.layers["Water demand"].layers.baseline.annual.layer = this.define_carto_layer(baselineWaterDemandDataset, baselineWaterDemandStyle, "ut2028tl", wri_client, "wri-rw", true, "cm", "mm/yr", 10)
      this.layers["Water demand"].layers.baseline.annual.layer = this.define_carto_layer_v2(baselineWaterDemandDataset, baselineWaterDemandStyle, "ut2028tr", wri_client, "wri-rw", water_demand_colors, water_demand_labels, -9999, 1000, " mm/yr")



      //Future Water demand
      const futureWaterDemandDataset = 'aqueduct_projections_20150309'
      const futureWaterDemandStyle = `
        #layer {
        opacity: 0.5;
         [ut3028tl = "> 30 cm"]{
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

      //this.layers["Water demand"].layers.future.layer = this.define_carto_layer(futureWaterDemandDataset, futureWaterDemandStyle, "ut3028tl", wri_client, "wri-rw")
      this.layers["Water demand"].layers.future.layer = this.define_carto_layer_v2(futureWaterDemandDataset, futureWaterDemandStyle, "ut3028tr", wri_client, "wri-rw", water_demand_colors, water_demand_labels, -9999, 1000, " mm/yr")


      //Baseline Surface Water Pharmaceutical Pollution
      let color_function_Surface_Water_Pharmaceutical_Pollution = function(values) {
        let value = values[0]


        if(value<0) return
        else if (value <= 0) return '#09bbfb'
        else if(value <= 10) return '#3ad110'
        else if(value <= 30) return '#faed08'
        else if(value <= 100) return '#fe0000'
        else return '#010103'
      }
      let color_legend_Surface_Water_Pharmaceutical_Pollution = ['#09bbfb', '#3ad110', '#faed08', '#fe0000', '#010103' ]
      let label_legend_Surface_Water_Pharmaceutical_Pollution = ["0 ng/L", ">0-10 ng/L", "10-30 ng/L", "30-100 ng/L",">100 ng/L"]
      //this.layers["Surface Water Pharmaceutical Pollution"].layers.baseline.annual.layer = this.define_raster_layer("surface_pharmaceutical_pollution_baseline", color_function_Surface_Water_Pharmaceutical_Pollution, color_legend_Surface_Water_Pharmaceutical_Pollution, label_legend_Surface_Water_Pharmaceutical_Pollution, " ng/L")
      this.layers["Surface Water Pharmaceutical Pollution"].layers.baseline.annual.layer = this.define_raster_layer("contaminant_C", "contaminant_C_palette", undefined, color_legend_Surface_Water_Pharmaceutical_Pollution, label_legend_Surface_Water_Pharmaceutical_Pollution, " ng/L", 1, 32)



      //Future Surface Water Pharmaceutical Pollution
      this.layers["Surface Water Pharmaceutical Pollution"].layers.future.layer = this.define_raster_layer("contaminant_C_BAU", "contaminant_C_BAU_palette", undefined, color_legend_Surface_Water_Pharmaceutical_Pollution, label_legend_Surface_Water_Pharmaceutical_Pollution, " ng/L", 1, 32)


      const coastal_pollution_dataset = 'raster_to_points'
      const coastal_pollution_style = `
        #layer {
        opacity: 1;
         [dn > 100000]{
           polygon-fill: #000000;
         }
         [dn <= 100000]{
           polygon-fill: #fe0000;
         }
         [dn <= 1000]{
           polygon-fill: #f8ee04;
         }
         [dn <= 50]{
           polygon-fill: #34d10e;
         }
         [dn < 10]{
           polygon-fill: #02b5fd;
         }
        }
      `
      //this.layers["Coastal Pharmaceutical Pollution"].layers.baseline.annual.layer = this.define_carto_layer(coastal_pollution_dataset, coastal_pollution_style, "dn", own_client, "jsalo")
      let color_legend_coastal_Pharmaceutical_Pollution = [' #02b5fd', '#34d10e', '#f8ee04', '#fe0000', ' #000000' ]
      let label_legend_coastal_Pharmaceutical_Pollution = ["<10 g/km*year", "10-50 g/km*year", "50-1000 g/km*year", "1000-100000 g/km*year",">100000 g/km*year"]

      this.layers["Coastal Pharmaceutical Pollution"].layers.baseline.annual.layer = this.define_carto_layer_v2(coastal_pollution_dataset, coastal_pollution_style, "dn", own_client, "jsalo", color_legend_coastal_Pharmaceutical_Pollution, label_legend_coastal_Pharmaceutical_Pollution, -10000000, 1, " g/km*year")


    },
  },

  mounted() {
    this.setupLeafletMap();
    this.place_markers(this.$location_markers)
  },
  destroyed() {

    let location = this.mapDiv.getCenter()
    this.$last_location[0] = location.lat
    this.$last_location[1] = location.lng

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
  display: table
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
  background-color: #b62373;
  border-color: #b62373;
  font-size: 0.875rem;
  color: white;
  padding: 8px 15px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  margin: 4px 2px;
  cursor: pointer;
}

.trigger:hover {
  opacity: 0.92;
}



.legend i {
  width: 18px;
  height: 18px;
  float: left;
  margin-right: 8px;
}

.leaflet-bar button { height: 30px !important; width: 30px !important; font-size: 2.9em;  color: #1C195B}

.v-application a{
  color:#1C195B !important;
}

.v-messages {
  min-height: 0px !important;
}

.v-btn--disabled{
  background-color: rgba(0, 0, 0, 0.26) !important
}




</style>