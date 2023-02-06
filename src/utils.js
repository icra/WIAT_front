import axios from "axios";
import conversion_factors from "@/conversion_factors";
import colors from "@/colors";
import risk_categories from "@/risk_categories";
let main = require("./main")
import risk_thereshold from "@/risk_categories";

//sum array of numbers
Array.prototype.sum=function(){return this.reduce((p,c)=>(p+c),0)};

//Sum objs
function sumObjectsByKey(...objs) {
    return objs.reduce((a, b) => {
        for (let k in b) {
            if (b.hasOwnProperty(k))
                a[k] = (a[k] || 0) + b[k];
        }
        return a;
    }, {});
}

function return_avg_risk(factors){
    let factors_not_null = factors.filter(factor => factor != null && factor != "-").map(factor => factor[1])
    if(factors_not_null.length === 0) {
        return null
    }
    else if(factors_not_null.includes(risk_thereshold.impact_strings.vh)) {
        return risk_thereshold.impact_strings.vh
    }
    else if(factors_not_null.includes(risk_thereshold.impact_strings.h)) return risk_thereshold.impact_strings.h
    else if(factors_not_null.includes(risk_thereshold.impact_strings.m)) return risk_thereshold.impact_strings.m
    else if(factors_not_null.includes(risk_thereshold.impact_strings.l)) return risk_thereshold.impact_strings.l
    return null
}

/***************
 Some basic functions used by other components
 */
let utils = {

    //Generate summary for a given industry
    async summary_industry(industry, global_layers){
        let key = industry.name
        let industries = [industry]

        let industry_row = {value: key}

        industry_row["country"] = utils.get_country_code_from_coordinates(industry.location.lat, industry.location.lng)
        industry_row["supply_chain_number"] = industry.supply_chain.length

        //calculate  overall water index using avg between industry and its suppliers
        let avg_owr = 0
        const locations = [industry.location, ...industry.supply_chain.map(x => x.location)]
        for (const location of locations){
            let owr = await utils.overall_water_risk(location.lat, location.lng)
            avg_owr += owr
        }
        avg_owr = avg_owr / locations.length
        industry_row["owr"] = avg_owr.toFixed(3)

        if(utils.is_industry_valid(industry)){

            let dilution_factor_value = await metrics.dilution_factor(global_layers, industries)
            let dilution_factor_risk = risk_categories["dilution_factor"](dilution_factor_value)

            let available_factor = await metrics.available_ratio(global_layers, industries)
            let available_factor_risk = risk_categories["water_stress_ratio"](available_factor)

            let consumption_available_different_watersheds = metrics.external_sources_from_other_watersheds(industries)
            let consumption_available_different_watersheds_risk = risk_categories['external_sources_from_other_watersheds'](consumption_available_different_watersheds)

            let gw_decline = await metrics.groundwater_withdrawals_in_high_groundwater_decline(industries, global_layers)
            let gw_decline_risk = risk_categories['groundwater_withdrawals_in_high_groundwater_decline'](gw_decline)

            industry_row["freshwater_impact"] = return_avg_risk([dilution_factor_risk, available_factor_risk, consumption_available_different_watersheds_risk, gw_decline_risk])
            industry_row["carbon_impact"] = metrics.emissions_and_descriptions(industries, 1).total

            let eutrophication_factor = metrics.eutrophication_potential(industries).total
            let eutrophication_risk = risk_categories["eutrophication"](eutrophication_factor)

            let delta_temperature = await metrics.delta_temperature(industries, global_layers)
            let delta_temperature_risk = risk_categories["delta_temperature"](delta_temperature)

            let delta_ecotox_factor = (await metrics.delta_tu(industries, global_layers)).total
            let delta_ecotox_risk = risk_categories["delta_ecotoxicity"](delta_ecotox_factor)

            let delta_eqs_factor = await metrics.delta_eqs_avg(industries, global_layers)
            let delta_eqs_risk = risk_categories["delta_eqs"](delta_eqs_factor)

            industry_row["pollution_impact"] = return_avg_risk([eutrophication_risk, delta_ecotox_risk, delta_eqs_risk, delta_temperature_risk])

        }else{
            industry_row["freshwater_impact"] = "-"
            industry_row["carbon_impact"] = "-"
            industry_row["pollution_impact"] = "-"
        }

        return industry_row
    },



    /*Gets the string equivalent to the input
  UD = User Data = 1
  Mo = Modeled = 2
  Es = Estimated = 3
  ID = Insufficient Data = 4
 */
    get_string_impact_legend(value){
        if (value == 1){
            return "User data"
        }
        else if (value == 2){
            return "Modeled"
        }
        else if (value == 3){
            return "Estimated"
        }
        else return "Insufficient data"
    },

    //Calculate hash code of s
    hashCode(s) {
        let ADLER32 = require('adler-32');
        return ADLER32.str(s)
    },


    //Get color based on str
    chooseColor(str) {
        if (str == "COD") {
            return '#1c195b'
        }else if (str == "TN") {
            return '#0095c6'
        }else if (str == "TP") {
            return '#5bc9bf'
        }
        return Object.values(colors)[this.hashCode(str) % Object.values(colors).length]
    },


    getDataTypeColor(item){
        if(item == "User data") {
            return ["#76FF03", 'All inputs have been entered with user data.']
        }
        else if(item == "Estimated") {
            return ["#1DE9B6", 'All the inputs have been introduced, but at least one is estimated']
        }
        else if (item == "Modeled") {
            return ["#D500F9", 'All the inputs have been introduced, but at least one is modeled']
        }
        else if (item == "Insufficient data") {
            return ["#F50057", 'Of all the inputs, at least one is not entered']
        }
        return null
    },

    //Complete list of pollutants for which we have performed estimations
    pollutants_from_older_version: ["COD", "TN", "TP",  "1,2-Dichloroethane", "Cadmium", "Hexaclorobenzene", "Mercury", "Lead",
        "Nickel", "Chloroalkanes", "Hexachlorobutadiene", "Nonylphenols", "Tetrachloroethene", "Trichloroethylene"],


    //Keys is [str1, str2, ..., str_n]. Says if dict[str1][str2][...][str_n] exists
    exists_in_dict(dict, keys) {
        try {
            let dict_aux = dict
            for(let key of keys){
                dict_aux = dict_aux[key]
            }

            return dict_aux != undefined
        } catch (error) {
            return false
        }
    },

    //Return avg water stress  from industries (%)
    async water_stress(industries, global_layers){
        let ws = global_layers["Water stress"].layers.baseline.annual.layer
        let ws_value = await Promise.all(
            industries.map(async industry => {
                if(industry.water_stress == null || industry.water_stress == undefined) {
                    industry.water_stress = await ws.data_on_point(industry.location.lat, industry.location.lng)
                }
                return industry.water_stress

            })) //water stress (%)

        let filtered = ws_value.filter(x => x!= null)
        return filtered.sum() / filtered.length
    },

    //Says if industry has the required inputs for being correct
    is_industry_valid(industry){
        if(industry == null || industry == undefined) return false
        if(industry.volume_withdrawn!=null && industry.product_produced!=null && industry.has_onsite_wwtp!=null && industry.has_offsite_wwtp!=null && industry.has_direct_discharge!=null && industry.industry_type!=null){
            let arr = [true]
            if(industry.has_onsite_wwtp == 1) {
                let wwtp = industry.onsite_wwtp
                arr.push(wwtp.wwt_vol_trea!=null && wwtp.wwt_vol_disc!=null)
            }
            if(industry.has_direct_discharge == 1) {
                let dd = industry.direct_discharge
                arr.push(dd.dd_vol_disc!=null)
            }
            if(industry.has_offsite_wwtp == 1) {
                let wwtp = industry.offsite_wwtp
                arr.push(wwtp.wwt_vol_trea!=null)
            }
            return !arr.includes(false)
        }
        return false

    },

    equals(a, b){
        return JSON.stringify(a) === JSON.stringify(b);
    },

    // Lowest to highest
    lowestToHighest(numbers){
        return numbers.sort((a, b) => a - b);
    },

    //Highest to lowest
    highestToLowest(numbers){
        return numbers.sort((a, b) => b-a);
    },

    get_country_code_from_coordinates(lat, lng){
        let crg = require('country-reverse-geocoding').country_reverse_geocoding();
        let country = crg.get_country(lat, lng)
        if(country == null) return null
        let code = country.code
        return code
    },

    async get_river_basin(lat, lng){
        let basin = await utils.get_carto_data("hydrobasins_fao_fiona_merged_v01", 'maj_name', lat, lng)
        return basin
    },

    //Opens file_name raster, and retrieve data at (lat lng)
    async get_raster_data(file_name, lat, lng){
        let call = "https://wiat-server.icradev.cat/data_point?filename="+file_name+"&longitude="+lng+"&latitude="+lat
        return axios
            .get(call)
            .then(response => {
                if(response) {
                    if(response.data.test[0]["0"]) {
                        if(response.data.test[0]["0"] >= 0) return response.data.test[0]["0"]
                        else return null
                    }
                    else return null
                }else return null
            })
    },

    //Opens dataset from carto server, and retrieve label data at (lat lng)
    async get_carto_data(dataset, label, lat, lng){
        return fetch("https://wri-rw.carto.com:443/api/v2/sql?q=select "+label+" from "+dataset+" where ST_Intersects( the_geom, cdb_latlng("+lat+","+lng+"))")
            // we transform the response from the Fetch API into a JSON format
            .then(resp => {
                return resp.json()
            }).then((response) => {
                // we get the data from the request response
                if(response.rows == undefined) return null
                else if(response.rows[0] == undefined) return null
                else if(response.rows[0][label] == undefined) return null
                else return response.rows[0][label]


            })
            .catch(function (error) {
                // check if the request is returning an error
                console.log(error)
            });
    },

    //Says if the location at lat lng is land or water
    async areCoordsLand(lat, lng){
        let file_name = "baseline_population"
        let population_data = (await this.get_raster_data(file_name, lat, lng))

        if(population_data !== null) return true
        else return false
    },

    //Overall water risk (dimensionless)
    async overall_water_risk(lat, lng){
        let file_name = "owr"
        let data = (await this.get_raster_data(file_name, lat, lng))
        if(data !== null) return data
        else return null
    },

    //Days between date2string and date1string (in days)
    daysBetween(date1String, date2String){
        let d1 = new Date(date1String);
        let d2 = new Date(date2String);
        return (d2-d1)/(1000*3600*24);
    },

    //Says if n is natural number
    is_Natural(n){
        if (typeof n !== 'number') return false
        else return (n >= 0.0) && (Math.floor(n) === n) && n !== Infinity;
    },

    //Resets global var that store all pollutants created (among all assessments and all industries), and updates it from pollutants created on the assessments
    reset_and_update_global_pollutants(assessments, pollutants_set){
        pollutants_set.clear();   //Delete all elements
        assessments.forEach(assessment => {
            assessment.industries.forEach(industry => {
                industry.pollutants_selected.forEach(pollutants_set.add, pollutants_set)
            })
        })
    },

    //Return list of pollutants without COD nor TN nor TP
    remove_nutrients(pollutants){
        return [...pollutants].filter(pollutant => pollutant != "COD" && pollutant != "TN" && pollutant != "TP")
    },

    //Return list of pollutants created in industries. If filter nutrients is true, returns the list neither COD nor TN nor TP
    get_pollutants(industries, filter_nutrients = true){
        let pollutants_set = new Set()
        for (let industry of industries){
            for (let pollutant of industry.pollutants_selected){
                if (filter_nutrients){
                    if (pollutant != "COD" && pollutant != "TN" && pollutant != "TP" ){
                        pollutants_set.add(pollutant)
                    }
                }else pollutants_set.add(pollutant)

            }
        }
        return [...pollutants_set]
    },

    /*********
    FUNCTIONS FOR GETTING AND CHANGE FORMAT OF DATA LAYER
     *********/

    format_layer_description(categories){
        let _this = this
        let object_to_return = {}
        categories.forEach(category => {
            object_to_return = {...object_to_return, ..._this.get_layers_from_category(category)}
        })


        return object_to_return
    },
    get_layers_from_category(category){
        let _this = this
        if(category.hasOwnProperty("layer")) {
            let obj = {}
            obj[category["name"]]= category["layer"]
            return obj
        }else{
            let obj = {}
            category.children.forEach(subcategory => {
                obj = {...obj, ..._this.get_layers_from_category(subcategory)}
            })
            return obj
        }
    },

}

/***************
 Functions used by metrics object below
 */
async function withdrawn_factor(industries, global_layers){

    let streamflow_value = await streamflow(industries, global_layers) //streamflow (m3/day)
    let water_withdrawn = calculate_water_withdrawn(industries) //m3/day
    let factor = water_withdrawn / streamflow_value
    if(isNaN(factor)) return (0).toFixed(3)
    return (factor*100).toFixed(3) //%
}

async function discharged_factor(industries, global_layers){

    let streamflow_value = await streamflow(industries, global_layers) //streamflow (m3/day)

    let wd = calculate_water_discharged(industries)  //Amount of water discharged by industries (m3/day)

    let factor = 100*wd/streamflow_value //%
    if(isNaN(factor)) return (0).toFixed(3)
    return factor.toFixed(3)
}

//Load of pollutant_effl discharged by industries (g/day)
//if only_same_watershed is true, only loads discharged in the same watershed are considered
function calculate_effluent_load(industries, pollutant_effl, only_same_watershed = false){
    let load = industries.map(industry => industry.effl_pollutant_load(pollutant_effl, only_same_watershed)).sum()
    return load
}

//Multiplies industry discharge water temperature (°C) by the weight of the discharged water (m3/day) and sums the products
function calculate_effluent_temperature_load(industries, only_same_watershed = false){
    let load_temperature = industries.map(industry => industry.temperature_of_discharged_water() * industry.water_discharged(only_same_watershed)).sum()
    return load_temperature

}

function calculate_effluent_load_not_ocean(industries, pollutant_effl){
    let load = industries.map(industry => industry.effl_pollutant_load_not_ocean(pollutant_effl)).sum()
    return load
}

//Load of pollutant from the surface water withdrawn by industries (g/day)
function calculate_influent_load(industries, pollutant){
    let load = industries.map(industry => industry.infl_pollutant_load(pollutant)).sum()
    return load
}

//Load of pollutant from the water before being withdrawn by industries (g/day)
async function calculate_load_water_body(industries, pollutant, global_layers){
    let loads = []
    for (let industry of industries){
        let streamflow_value = await streamflow([industry], global_layers)
        let concentration = industry.infl_pollutant_concentration(pollutant)
        loads.push(streamflow_value*concentration)
    }

    return loads.sum()
}

//Concentration of pollutant_effl discharged by industries (g/m3)
function effl_concentration(industries, pollutant_effl){
    let load = calculate_effluent_load(industries, pollutant_effl)
    let discharged = calculate_water_discharged(industries)

    return load/discharged
}

function effl_concentration_not_ocean(industries, pollutant_effl){
    let load = calculate_effluent_load_not_ocean(industries, pollutant_effl)
    let discharged = calculate_water_discharged_not_ocean(industries)

    return load/discharged
}

//Water discharged by industries (m3/day)
function calculate_water_discharged(industries, only_same_watershed = false){
    return industries.map(industry => industry.water_discharged(only_same_watershed)).sum()
}

//Water discharged by industries (m3/day)
function calculate_water_discharged_not_ocean(industries){
    return industries.map(industry => industry.water_discharged_not_ocean()).sum()
}

//Amount of surface water withdrawn by industries (m3/day)
function calculate_surface_water_withdrawn(industries){
    return industries.map(industry => industry.volume_of_surface_water_withdrawn()).sum()
}

//Amount of groundwater withdrawn by industries (m3/day)
function calculate_groundwater_water_withdrawn(industries){
    return industries.map(industry => industry.volume_of_groundwater_water_withdrawn()).sum()
}

//Groundwater + superficial (m3/day)
function calculate_water_withdrawn(industries){
    return industries.map(industry => industry.volume_of_water_withdrawn()).sum()
}

//Volume from external sources from same watershed where water is withdrawn(m3/day)
function calculate_external_sources_same_watershed(industries){
    return industries.map(industry => industry.volume_of_external_sources_same_watershed()).sum()
}
//Volume from external sources from different watershed where water is withdrawn(m3/day)
function calculate_external_sources_different_watershed(industries){
    return industries.map(industry => industry.volume_of_external_sources_different_watershed()).sum()
}

//Volume from all external sources (m3/day)
function calculate_all_external_sources(industries){
    return industries.map(industry => industry.volume_all_external_sources()).sum()
}

//(m3/day)
async function calculate_water_withdrawn_in_water_stress(industries, global_layers){
    let volume = 0
    for(let industry of industries){
        let water_stress = await has_water_stress([industry], global_layers)
        if(water_stress == "Yes"){
            volume += industry.volume_of_water_withdrawn()
        }
    }
    return volume
}
//(m3/day)
async function calculate_surface_water_withdrawn_in_water_stress(industries, global_layers){
    let volume = 0
    for(let industry of industries){
        let water_stress = await has_water_stress([industry], global_layers)
        if(water_stress == "Yes"){
            volume += industry.volume_of_surface_water_withdrawn()
        }
    }
    return volume
}
//(m3/day)
async function calculate_groundwater_water_withdrawn_in_water_stress(industries, global_layers){
    let volume = 0
    for(let industry of industries){
        let water_stress = await has_water_stress([industry], global_layers)
        if(water_stress == "Yes"){
            volume += industry.volume_of_groundwater_water_withdrawn()
        }
    }
    return volume
}
//Does not include third-party WWTP (m3/day)
function calculate_water_discharged_surface(industries){
    return industries.map(industry => industry.water_discharged_onsite()+industry.water_directly_discharged()).sum()
}
//(m3/day)
function calculate_water_discharged_third_party(industries){
    return industries.map(industry => industry.water_discharged_offsite()).sum()
}
//(m3/day)
async function calculate_water_discharged_surface_in_water_stress(industries, global_layers){
    let volume = 0
    for(let industry of industries){
        let water_stress = await has_water_stress([industry], global_layers)
        if(water_stress == "Yes"){
            volume += calculate_water_discharged_surface([industry])
        }
    }
    return volume
}
//(m3/day)
async function calculate_water_discharged_third_party_in_water_stress(industries, global_layers){
    let volume = 0
    for(let industry of industries){
        let water_stress = await has_water_stress([industry], global_layers)
        if(water_stress == "Yes"){
            volume += calculate_water_discharged_third_party([industry])
        }
    }
    return volume
}
//(m3/day)
function calculate_water_treated(industries){
    return industries.map(industry => industry.volume_of_water_treated()).sum()
}
//(m3/day)
function calculate_water_recycled(industries){
    return industries.map(industry => industry.water_recycled()).sum()
}
//tonnes/day
function calculate_product_produced(industries){
    return industries.map(industry => industry.tonnes_of_product()).sum()
}

//Increase in the concentration of the receiving water body due to the discharges of the industry (g/m3)
//if only_same_watershed is true, only discharges from the same watershed where water is withdrawn are considered
async function effl_delta(industries, effl, global_layers, only_same_watershed = false){

    let load_effluent = calculate_effluent_load(industries, effl, only_same_watershed)
    //let load_river = await calculate_load_water_body(industries, effl, global_layers)
    //let load_influent_industry = calculate_influent_load(industries, effl)
    let load_river = 0
    let load_influent_industry = 0

    let water_discharged = calculate_water_discharged(industries, only_same_watershed)
    let streamflow_value = await streamflow(industries, global_layers) //streamflow (m3/day)
    let water_withdrawn = calculate_surface_water_withdrawn(industries)

    let delta = (load_river-load_influent_industry+load_effluent) / (streamflow_value + water_discharged - water_withdrawn)

    if(isNaN(delta)) return "-"
    return delta.toExponential(3) //g/m3
}

//Final concentration of the receiving water body after withdrawing, using, filtering and discharging water
async function concentration_receiving_water_body(industries, effl, global_layers, only_same_watershed = false){

    let load_effluent = calculate_effluent_load(industries, effl, only_same_watershed)
    let load_river = await calculate_load_water_body(industries, effl, global_layers)
    let load_influent_industry = calculate_influent_load(industries, effl)

    let water_discharged = calculate_water_discharged(industries, only_same_watershed)
    let streamflow_value = await streamflow(industries, global_layers) //streamflow (m3/day)
    let water_withdrawn = calculate_surface_water_withdrawn(industries)


    let delta = (load_river-load_influent_industry+load_effluent) / (streamflow_value + water_discharged - water_withdrawn)

    if(isNaN(delta)) return "-"
    return delta.toExponential(3) //g/m3
}

//Added streamflow of industries
async function streamflow(industries, global_layers){

    let streamflow = global_layers["Streamflow"].layers.baseline.annual.layer
    let streamflow_value = await Promise.all(
        industries.map(async industry => {
            if(industry.streamflow == null) {
                industry.streamflow = await streamflow.data_on_point(industry.location.lat, industry.location.lng)*86400
            }
            return industry.streamflow

        })) //streamflow (m3/day)


    return streamflow_value.filter(x => x!= null).sum()

}

//avg groundwater decline (mm/day)
async function groundwater_table_decline(industries, global_layers){

    let ws = global_layers["Groundwater table decline"].layers.baseline.annual.layer
    let ws_value = await Promise.all(
        industries.map(async industry => {
            if(industry.groundwater_table_decline == null || industry.groundwater_table_decline == undefined) {
                industry.groundwater_table_decline = await ws.data_on_point(industry.location.lat, industry.location.lng)
            }
            return industry.groundwater_table_decline

        }))

    let filtered = ws_value.filter(x => x!= null)
    return filtered.sum() / filtered.length
}

//no sanitatin avg (%)
async function no_sanitation(industries, global_layers){

    let ws = global_layers["Unimproved/No Sanitation"].layers.baseline.annual.layer
    let ws_value = await Promise.all(
        industries.map(async industry => {
            if(industry.no_sanitation == null || industry.no_sanitation == undefined) {
                industry.no_sanitation = await ws.data_on_point(industry.location.lat, industry.location.lng)
            }
            return industry.no_sanitation

        }))

    let filtered = ws_value.filter(x => x!= null)
    return filtered.sum() / filtered.length
}

//avg seasonal variability (dimensionless)
async function seasonal_variability(industries, global_layers){

    let ws = global_layers["Seasonal variability"].layers.baseline.annual.layer
    let ws_value = await Promise.all(
        industries.map(async industry => {
            if(industry.seasonal_variability == null || industry.seasonal_variability == undefined) {
                industry.seasonal_variability = await ws.data_on_point(industry.location.lat, industry.location.lng)
            }
            return industry.seasonal_variability

        }))

    let filtered = ws_value.filter(x => x!= null)
    return filtered.sum() / filtered.length
}

//avg interannual variability (dimensionless)
async function interannual_variability(industries, global_layers){

    let ws = global_layers["Interannual variability"].layers.baseline.annual.layer
    let ws_value = await Promise.all(
        industries.map(async industry => {
            if(industry.interannual_variability == null || industry.interannual_variability == undefined) {
                industry.interannual_variability = await ws.data_on_point(industry.location.lat, industry.location.lng)
            }
            return industry.interannual_variability

        }))

    let filtered = ws_value.filter(x => x!= null)
    return filtered.sum() / filtered.length
}

//Avg drought risk
async function drought_risk(industries, global_layers){

    let ws = global_layers["Drought risk"].layers.baseline.annual.layer
    let ws_value = await Promise.all(
        industries.map(async industry => {
            if(industry.drought_risk == null || industry.drought_risk == undefined) {
                industry.drought_risk = await ws.data_on_point(industry.location.lat, industry.location.lng)
            }
            return industry.drought_risk

        }))

    let filtered = ws_value.filter(x => x!= null)
    return filtered.sum() / filtered.length
}
async function riverine_flood_risk(industries, global_layers){

    let ws = global_layers["Riverine flood risk"].layers.baseline.annual.layer
    let ws_value = await Promise.all(
        industries.map(async industry => {
            if(industry.riverine_flood_risk == null || industry.riverine_flood_risk == undefined) {
                industry.riverine_flood_risk = await ws.data_on_point(industry.location.lat, industry.location.lng)
            }
            return industry.riverine_flood_risk

        }))

    let filtered = ws_value.filter(x => x!= null)
    return filtered.sum() / filtered.length
}
async function coastal_flood_risk(industries, global_layers){

    let ws = global_layers["Coastal flood risk"].layers.baseline.annual.layer
    let ws_value = await Promise.all(
        industries.map(async industry => {
            if(industry.coastal_flood_risk == null || industry.coastal_flood_risk == undefined) {
                industry.coastal_flood_risk = await ws.data_on_point(industry.location.lat, industry.location.lng)
            }
            return industry.coastal_flood_risk

        }))

    let filtered = ws_value.filter(x => x!= null)
    return filtered.sum() / filtered.length
}

//Says if industries are in water stress area (avg industries water stress > 40% )
async function has_water_stress(industries, global_layers){
    let ws = await utils.water_stress(industries, global_layers)
    return (ws >= 40) ? "Yes" : "No"
}

//Says if industries have groundwater table decline
async function has_groundwater_table_decline(industries, global_layers, threshold = 40){
    let gw_decline = await groundwater_table_decline(industries, global_layers)
    return gw_decline >= threshold
}

//Amount of pollutant removed by applying WWTP's treatment (g/day)
function water_filtered(industries, industry_effluent, wwtp_effluent){
    return industries.map(industry => industry.filtered_pollutant_load(industry_effluent, wwtp_effluent)).sum()
}
//Amount of pollutant filtered compared to the pollutant generated by the industries (%)
function effl_efficiency(industries, industry_effluent, wwtp_effluent){

    let filtered = water_filtered(industries, industry_effluent, wwtp_effluent)
    let generated = calculate_pollutant_generated(industries, industry_effluent)
    
    let eff = filtered / generated

    if(isNaN(eff) || !isFinite(eff)) return "-"
    else return (eff*100).toFixed(3)
}

//Amount of water treated by onsite WWTP + amount of water treated by external WWTP + directly discharged water (m3/day)
function calculate_water_generated(industries){
    return industries.map(industry => industry.water_generated()).sum()
}

//m3/day
function calculate_water_consumed(industries){
    return industries.map(industry => industry.volume_of_water_withdrawn() - industry.water_discharged()).sum()
}
//g/day
function calculate_pollutant_generated(industries, pollutant){
    return industries.map(industry => industry.generated_pollutant_load(pollutant)).sum()
}

function better_treatment(industries){

    let scores = industries.map(industry => {
        let _scores = [0,0]
        if(industry.has_onsite_wwtp == 1){
            _scores[0] = industry.onsite_wwtp.wwt_treatment_type
        }
        if(industry.has_offsite_wwtp == 1){
            _scores[1] = industry.offsite_wwtp.wwt_treatment_type
        }
        return Math.max(..._scores)
    })

    if (Math.max(...scores) == 0) return "Discharge without treatment"
    else if (Math.max(...scores) == 1) return "Primary"
    else if (Math.max(...scores) == 2) return "Secondary"
    else if (Math.max(...scores) == 3) return "Tertiary"
}

//Says for each type of treatment, volume of water treated and number of sites where it is applied
function highest_level_of_treatment(industries){

    let treatments = {
        "tertiary": {
            volume: 0,
            sites: 0
        },
        "secondary": {
            volume: 0,
            sites: 0
        },
        "primary": {
            volume: 0,
            sites: 0
        },
        "direct_discharge": {
            volume: 0,
            sites: 0
        },
        "third_party": {
            volume: 0,
            sites: 0
        },
    }

    for(let industry of industries){
        if(industry.has_onsite_wwtp == 1 && industry.onsite_wwtp.wwt_treatment_type == 3){
            treatments.tertiary.volume += industry.onsite_wwtp.wwt_vol_disc
            treatments.tertiary.sites += 1
        }else if(industry.has_onsite_wwtp == 1 && industry.onsite_wwtp.wwt_treatment_type == 2){
            treatments.secondary.volume += industry.onsite_wwtp.wwt_vol_disc
            treatments.secondary.sites += 1
        }else if(industry.has_onsite_wwtp == 1 && industry.onsite_wwtp.wwt_treatment_type == 1){
            treatments.primary.volume += industry.onsite_wwtp.wwt_vol_disc
            treatments.primary.sites += 1
        }
        if(industry.has_offsite_wwtp == 1 && industry.offsite_wwtp.wwt_vol_trea > 0) {
            treatments.third_party.volume += industry.offsite_wwtp.wwt_vol_disc
            treatments.third_party.sites += 1
        }
        if(industry.has_direct_discharge == 1){
            treatments.direct_discharge.volume += industry.direct_discharge.dd_vol_disc
            treatments.direct_discharge.sites += 1
        }
    }

    return treatments

}

/***************
Impact and levers for action
 */
let metrics = {

    //Emissions separated by use
    emissions_and_descriptions(industries, days_factor = 1){

        let industries_emissions = industries.map(industry => industry.ghg())
        let aggregated = sumObjectsByKey(...industries_emissions)
        Object.keys(aggregated).forEach(key => {
            let value = aggregated[key]*days_factor
            if(Number.isFinite(value)) aggregated[key] = value.toExponential(2)
            else aggregated[key] = "-"
        })
        return aggregated
    },
    //GHG deglossed by CO2, CH4 and N2O
    emissions_deglossed(industries){

        let industries_emissions = industries.map(industry => industry.ghg_deglossed())
        let aggregated = sumObjectsByKey(...industries_emissions)
        Object.keys(aggregated).forEach(key => {
            let value = aggregated[key]
            if(Number.isFinite(value)) aggregated[key] = value.toExponential(2)
            else aggregated[key] = "-"
        })
        return aggregated
    },

    //Dilution factor (dimensionless)
    async dilution_factor(global_layers, industries, only_same_watershed=true){

        let water_discharged = calculate_water_discharged(industries, only_same_watershed)    // m3/day

        if(water_discharged == 0) return "-"

        let streamflow_value = await streamflow(industries, global_layers) //streamflow (m3/day)

        let water_withdrawn = calculate_water_withdrawn(industries, only_same_watershed) //m3/day

        //let dilution_factor = water_discharged/(water_discharged + flow_acc_value)
        let dilution_factor = (streamflow_value - water_withdrawn + water_discharged)/water_discharged

        return dilution_factor.toExponential(2)

    },

    //Consumption available ratio (%)
    async available_ratio(global_layers, industries){

        let streamflow_value = await streamflow(industries, global_layers) //streamflow (m3/day)
        let consumptive_use = await this.calculate_net_consumptive_use_external_sources_same_watershed(industries, global_layers)

        let available_ratio = consumptive_use / streamflow_value
        if (isNaN(available_ratio)) return "-"
        else return (available_ratio*100).toFixed(2)

    },
    // Recycled water factor  (%)
    recycled_water_factor(industries){
        let water_generated = calculate_water_generated(industries)
        let recycled_water = calculate_water_recycled(industries)

        if(water_generated > 0) {
            let recycled_water_factor = recycled_water / water_generated
            return (recycled_water_factor*100).toFixed(2)
        }
        return "-"
    },

    //Treated water factor (%)
    treated_water_factor(industries){

        let water_discharged = calculate_water_generated(industries)    // m3/day
        let water_treated = calculate_water_treated(industries)

        if (water_discharged == 0) return "-"
        else return (100*water_treated/water_discharged).toFixed(2)
    },

    // Specific water consumption  (m3/tonnes)
    async efficiency_factor(industries, global_layers){
        let product_produced = calculate_product_produced(industries)
        let consumptive_use = await this.calculate_net_consumptive_use_all_external_sources(industries, global_layers)
        if (product_produced>0) return (consumptive_use / product_produced).toExponential(2)
        return "-"
    },

    // For each pollutant, says the concentration of the water discharged (with respect to EQS, %)
    environmental_quality_standards(industries){

        let toxic_units = {}
        for(let pollutant of utils.get_pollutants(industries)){
            let eqs_factor = conversion_factors[pollutant]['eqs']
            let effluent_concentration = effl_concentration(industries, pollutant)
            let eqs = 100*effluent_concentration/eqs_factor

            if(Number.isFinite(eqs)) toxic_units[pollutant] = eqs.toFixed(3)
            else toxic_units[pollutant] = "-"
        }
        return toxic_units
    },

    // For each pollutant, says the concentration of the water discharged (g/m3)
    pollutant_concentration(industries){

        let concentration = {}
        for(let pollutant of utils.get_pollutants(industries, false)){
            let pollutant_concentration = effl_concentration(industries, pollutant)
            if(Number.isFinite(pollutant_concentration)) concentration[pollutant] = pollutant_concentration.toExponential(3)
            else concentration[pollutant] = "-"
        }
        return concentration

    },
    // For each pollutant, says the increase of the concentration in the receiving water body due to discharge (g/m3)
    async pollutant_delta(industries, global_layers){

        let delta = {}
        for(let pollutant of utils.get_pollutants(industries, false)){
            delta[pollutant] = await effl_delta(industries, pollutant, global_layers, true)
        }
        return delta
    },

    // For each pollutant, says the concentration of the water in the receiver water body after discharging water (g/m3)
    async final_water_body_concentration(industries, global_layers){

        let concentration = {}
        for(let pollutant of utils.get_pollutants(industries, false)){
            let pollutant_concentration = await concentration_receiving_water_body(industries, pollutant, global_layers, true)
            concentration[pollutant] = pollutant_concentration
        }
        return concentration

    },

    // avg concentration of pollutants expressed as EQS
    eqs_avg(industries){
        let eqs = this.environmental_quality_standards(industries)

        let avg = Object.values(eqs).sum() / Object.values(eqs).length

        if(Number.isFinite(avg)) return avg.toExponential(2)
        else return "-"
    },

    //Percentage of treatment efficiency compared to WWTP influent
    wwtp_efficiency(industries){ //Increase in the concentration of the receiving water body (compared to EQS) due to  discharging the water(%)

        let efficiency = {}
        for(let pollutant of utils.get_pollutants(industries, false)){
            let eff = effl_efficiency(industries, pollutant, pollutant)
            efficiency[pollutant] = eff
        }
        return efficiency
    },

    // Says if the water discharged by the industry to the receiving water body is cleaner (< 100) or more polluted (> 100) than the water withdrawn
    amount_water_influent_cleaned(industries){

        let efficiency = {}
        for(let pollutant of utils.get_pollutants(industries, false)){
            let infl = calculate_influent_load(industries, pollutant)
            let effl = calculate_effluent_load(industries, pollutant)
            efficiency[pollutant] = (infl == 0 || isNaN(infl)) ? "-" : (100*effl/infl).toFixed(2)
        }
        return efficiency
    },

    avg_influent_efficiency(industries){
        let efficiency = Object.values(this.amount_water_influent_cleaned(industries))
        let efficiency_filtered = efficiency.filter(x => !Number.isNaN(parseFloat(x))).map(x => parseFloat(x))

        if(efficiency_filtered.length == 0) return "-"

        let avg = efficiency_filtered.sum() / efficiency_filtered.length
        if(Number.isFinite(avg)) return avg.toFixed(2)
        else return "-"

    },

    avg_treatment_efficiency(industries){

        let treatment_efficiency = Object.values(this.wwtp_efficiency(industries))
        let treatment_efficiency_filtered = treatment_efficiency.filter(x => !Number.isNaN(parseFloat(x))).map(x => parseFloat(x))

        if(treatment_efficiency_filtered.length == 0) return "-"

        let avg = treatment_efficiency_filtered.sum() / treatment_efficiency_filtered.length
        if(Number.isFinite(avg)) return avg.toFixed(2)
        else return "-"
    },

    async reporting_metrics(industries, global_layers){
        let _this = this
        let withdrawn_factor_value = await withdrawn_factor(industries, global_layers)
        let discharged_factor_value = await discharged_factor(industries, global_layers)


        let reporting_metrics = {
            "g4-en8": calculate_water_withdrawn(industries)*365,
            "g4-en9": 1*withdrawn_factor_value,   //mes gran que 5% mal
            "g4-en10": 1*_this.recycled_water_factor(industries),
            "g4-en22": calculate_water_discharged(industries)*365,
            "g4-en26": 1*discharged_factor_value,
            "wd": 365*0.001*calculate_water_withdrawn(industries), //Water withdrawn
            "dis": 365*0.001*calculate_water_discharged(industries),  //water discharged
            "re": 365*0.001*calculate_water_recycled(industries), //water reused
            "consumed": 365*0.001*calculate_water_generated(industries)   //water consumed or generated
        }
        Object.keys(reporting_metrics).forEach(key => {
            let value = reporting_metrics[key]
            if(Number.isFinite(value)) reporting_metrics[key] = value.toExponential(2)
            else reporting_metrics[key] = "-"
        })

        reporting_metrics["highest_level_discharge"] = better_treatment(industries)
        reporting_metrics["water_stress"] = await has_water_stress(industries, global_layers)


        return reporting_metrics
    },

    cdp_1_2_b_indicators(industries){

        let reporting_metrics = {
            "wd": 365*0.001*calculate_water_withdrawn(industries), //Water withdrawn
            "dis": 365*0.001*calculate_water_discharged(industries),  //water discharged
            "consumed": 365*0.001*calculate_water_consumed(industries)   //water consumed or generated
        }

        Object.keys(reporting_metrics).forEach(key => {
            let value = reporting_metrics[key]
            if(Number.isFinite(value)) reporting_metrics[key] = value.toExponential(2)
            else reporting_metrics[key] = "-"
        })

        return reporting_metrics
    },

    async cdp_1_2_d_indicators(industries, global_layers){

        let water_withdrawn_in_water_stress = await calculate_water_withdrawn_in_water_stress(industries, global_layers)

        let percentage = 100*water_withdrawn_in_water_stress/calculate_water_withdrawn(industries)
        if(Number.isFinite(percentage)){
            percentage = percentage.toFixed(2)
        }else{
            percentage = "-"
        }
        let withdrawals_in_water_stress = ""
        if(percentage == '-'){
            withdrawals_in_water_stress = "Unknown"
        }else if(percentage == 0){
            withdrawals_in_water_stress = "No"
        }else{
            withdrawals_in_water_stress = "Yes"
        }


        let reporting_metrics = {
            "withdrawals_in_water_stress": withdrawals_in_water_stress,
            "water_stress": percentage,
            "identification_tool": "WRI Aqueduct",
        }

        return reporting_metrics
    },

    cdp_1_2_h_indicators(industries){

        let reporting_metrics = {
            "surface": 365*0.001*calculate_surface_water_withdrawn(industries),
            "groundwater": 365*0.001*calculate_groundwater_water_withdrawn(industries),
        }

        Object.keys(reporting_metrics).forEach(key => {
            let value = reporting_metrics[key]
            if(Number.isFinite(value)) reporting_metrics[key] = value.toExponential(2)
            else reporting_metrics[key] = "-"
        })

        return reporting_metrics
    },

    cdp_1_2_i_indicators(industries){

        let reporting_metrics = {
            "surface": 365*0.001*calculate_water_discharged_surface(industries),
            "third_party": 365*0.001*calculate_water_discharged_third_party(industries)
        }

        Object.keys(reporting_metrics).forEach(key => {
            let value = reporting_metrics[key]
            if(Number.isFinite(value)) reporting_metrics[key] = value.toExponential(2)
            else reporting_metrics[key] = "-"
        })

        return reporting_metrics
    },

    cdp_1_2_j_indicators(industries){

        let highest_level = highest_level_of_treatment(industries)

        Object.keys(highest_level).forEach(key => {
            let sites = highest_level[key].sites
            if(Number.isFinite(sites)) highest_level[key].sites = (100 * sites / industries.length).toFixed(2)
            else highest_level[key].sites = "-"

            let volume = highest_level[key].volume
            if(Number.isFinite(volume)) highest_level[key].volume = (365*0.001*volume).toExponential(2)
            else highest_level[key].volume = "-"
        })

        return highest_level
    },

    async cdp_2_1_a_indicators(industries, global_layers){
        let industries_and_supply_chains = []
        for(let industry of industries){
            industries_and_supply_chains.push(industry)
            for(let sp of industry.supply_chain){
                industries_and_supply_chains.push(sp)
            }
        }


        let high_water_stress = async function(){
            let values = []
            for(let site of industries_and_supply_chains){
                let lat = site.location.lat
                let lng = site.location.lng
                let ws = (await has_water_stress([site], global_layers)) == "Yes"

                if(ws){
                    values.push({
                        country: utils.get_country_code_from_coordinates(lat, lng),
                        basin: await utils.get_river_basin(lat, lng),
                        type: "Chronic physical",
                        primary: "Water stress"
                    })
                }
            }
            return values
        }

        let high_groundwater_table_decline = async function(){
            let values = []
            for(let site of industries_and_supply_chains){
                let lat = site.location.lat
                let lng = site.location.lng
                let ws = await groundwater_table_decline([site], global_layers)
                if(ws > 40){
                    values.push({
                        country: utils.get_country_code_from_coordinates(lat, lng),
                        basin: await utils.get_river_basin(lat, lng),
                        type: "Chronic physical",
                        primary: "Declining water quality"
                    })
                }
            }
            return values
        }
        let poorly_sanitation = async function(){
            let values = []
            for(let site of industries_and_supply_chains){
                let lat = site.location.lat
                let lng = site.location.lng
                let ws = await no_sanitation([site], global_layers)
                if(ws > 10){
                    values.push({
                        country: utils.get_country_code_from_coordinates(lat, lng),
                        basin: await utils.get_river_basin(lat, lng),
                        type: "Chronic physical",
                        primary: "Poorly managed sanitation"
                    })
                }
            }
            return values
        }
        let supply_variability = async function(){
            let values = []
            for(let site of industries_and_supply_chains){
                let lat = site.location.lat
                let lng = site.location.lng
                let seasonal = await seasonal_variability([site], global_layers)
                let interannual = await interannual_variability([site], global_layers)

                if(seasonal > 1 || interannual > 0.75){
                    values.push({
                        country: utils.get_country_code_from_coordinates(lat, lng),
                        basin: await utils.get_river_basin(lat, lng),
                        type: "Chronic physical",
                        primary: "Seasonal supply variability/inter annual variability"
                    })
                }
            }
            return values
        }
        let drought = async function(){
            let values = []
            for(let site of industries_and_supply_chains){
                let lat = site.location.lat
                let lng = site.location.lng
                let risk = await drought_risk([site], global_layers)

                if(risk > 0.6){
                    values.push({
                        country: utils.get_country_code_from_coordinates(lat, lng),
                        basin: await utils.get_river_basin(lat, lng),
                        type: "Acute physical",
                        primary: "Drought"
                    })
                }
            }
            return values
        }
        let flood_risk = async function(){
            let values = []
            for(let site of industries_and_supply_chains){
                let lat = site.location.lat
                let lng = site.location.lng
                let riverine = await riverine_flood_risk([site], global_layers)
                let coastal = await coastal_flood_risk([site], global_layers)

                if(riverine > 6/1000 || coastal > 3/10000){
                    values.push({
                        country: utils.get_country_code_from_coordinates(lat, lng),
                        basin: await utils.get_river_basin(lat, lng),
                        type: "Acute physical",
                        primary: "Flood (coastal, fluvial, pluvial, groundwater)"
                    })
                }
            }
            return values
        }

        let impacts = [...(await high_water_stress()), ...(await high_groundwater_table_decline()), ...(await poorly_sanitation()), ...(await supply_variability()), ...(await drought()),  ...(await flood_risk())]
        if(impacts.length == 0){
            return [{
                country: '-',
                basin: '-',
                type: "-",
                primary: "-"
            }]
        }

        return impacts
    },

    async cdp_5_1_indicators(industries, global_layers){

        let reporting_metrics = {
            "wd": 365*0.001*calculate_water_withdrawn(industries), //Water withdrawn
            "dis": 365*0.001*calculate_water_discharged(industries),  //water discharged
            "consumed": 365*0.001*calculate_water_consumed(industries)   //water consumed or generated
        }

        Object.keys(reporting_metrics).forEach(key => {
            let value = reporting_metrics[key]
            if(Number.isFinite(value)) reporting_metrics[key] = value.toExponential(2)
            else reporting_metrics[key] = "-"
        })

        reporting_metrics["water_stress"] = await has_water_stress(industries, global_layers)

        return reporting_metrics
    },

    async gri_303_3(industries, global_layers){
        let reporting_metrics = [
            {
                "all": 365*0.001*calculate_surface_water_withdrawn(industries),
                "water_stress": 365*0.001*(await calculate_surface_water_withdrawn_in_water_stress(industries, global_layers)),
                "text": "Surface water (total)"
            },
            {
                "all": 365*0.001*calculate_groundwater_water_withdrawn(industries),
                "water_stress": 365*0.001*(await calculate_groundwater_water_withdrawn_in_water_stress(industries, global_layers)),
                "text": "Groundwater (total)"
            },
            {
                "all": 365*0.001*calculate_water_withdrawn(industries),
                "water_stress": 365*0.001*(await calculate_water_withdrawn_in_water_stress(industries, global_layers)),
                "text": "Surface water (total) + groundwater (total)"
            }
        ]

        reporting_metrics.forEach(obj => {
            for(let key of ["all", "water_stress"]){
                let value = obj[key]
                if(Number.isFinite(value)) obj[key] = value.toExponential(2)
                else obj[key] = "-"
            }
        })

        return reporting_metrics

    },

    async gri_303_4(industries, global_layers){

        let discharged_surface = 365*0.001*calculate_water_discharged_surface(industries)
        let discharged_third_party = 365*0.001*calculate_water_discharged_third_party(industries)
        let discharged_surface_water_stress = 365*0.001*(await calculate_water_discharged_surface_in_water_stress(industries, global_layers))
        let discharged_third_party_water_stress = 365*0.001*(await calculate_water_discharged_third_party_in_water_stress(industries, global_layers))

        let reporting_metrics = [
            {
                "all": discharged_surface,
                "water_stress": discharged_surface_water_stress,
                "text": "Surface water"
            },
            {
                "all": discharged_third_party,
                "water_stress": discharged_third_party_water_stress,
                "text": "Third-party water (total)"
            },
            {
                "all": discharged_surface+discharged_third_party,
                "water_stress": discharged_surface_water_stress+discharged_third_party_water_stress,
                "text": "Surface water + Third-party water (total)"
            }
        ]

        reporting_metrics.forEach(obj => {
            for(let key of ["all", "water_stress"]){
                let value = obj[key]
                if(Number.isFinite(value)) obj[key] = value.toExponential(2)
                else obj[key] = "-"
            }
        })

        return reporting_metrics

    },

    gri_303_4_2(industries){
        return this.cdp_1_2_j_indicators(industries)

    },

    async gri_clause_2_2_1(industries, global_layers){
        let table = [
            {water_type: "Surface water", },
            {water_type: "Groundwater", },
        ]
        for(let industry of industries) {
            let ws = (await has_water_stress([industry], global_layers)) == "Yes"
            if(ws){
                let surface = 365 * 0.001 * calculate_surface_water_withdrawn([industry])
                if(Number.isFinite(surface)) surface = surface.toExponential(2)
                else surface = "-"

                let groundwater = 365 * 0.001 * calculate_groundwater_water_withdrawn([industry])
                if(Number.isFinite(groundwater)) groundwater = groundwater.toExponential(2)
                else groundwater = "-"

                table[0][industry.name] = surface
                table[1][industry.name] = groundwater
            }

        }
        return table

    },


    ecotoxicity_potential_tu(industries) { //concentration of tu in the water discharged(tu/day)

        let toxic_units = {}
        for(let pollutant of utils.get_pollutants(industries)){
            let tu_factor = conversion_factors[pollutant]['tu']
            let effluent_concentration = effl_concentration(industries, pollutant)
            let tu = 1000*effluent_concentration/tu_factor

            if(Number.isFinite(tu)) toxic_units[pollutant] = tu.toExponential(2)
            else toxic_units[pollutant] = "-"
        }

        if (Object.values(toxic_units).filter(x => x != "-").length == 0) toxic_units["total"] = '-'
        else toxic_units["total"] = Object.values(toxic_units).sum().toExponential(2)

        return toxic_units
    },
    async delta_tu(industries, global_layers, only_same_watershed= false){ //increase of tu in the receiving water body due to discharging the water(tu/day)

        let toxic_units = {}
        for(let pollutant of utils.get_pollutants(industries)){
            let tu_factor = conversion_factors[pollutant]['tu']
            let pollutant_delta = await effl_delta(industries, pollutant, global_layers, only_same_watershed)
            let delta_tu = 1000*pollutant_delta/tu_factor
            if(Number.isFinite(delta_tu)) toxic_units[pollutant] = delta_tu.toExponential(2)
            else toxic_units[pollutant] = "-"

        }

        if (Object.values(toxic_units).filter(x => x != "-").length == 0) toxic_units["total"] = '-'
        else toxic_units["total"] = Object.values(toxic_units).sum().toExponential(2)

        return toxic_units
    },
    //tu in the receiving water body due to discharging the water(tu/day)
    async tu_receiving_water_body(industries, global_layers, only_same_watershed= false){

        let toxic_units = {}
        for(let pollutant of utils.get_pollutants(industries)){
            let tu_factor = conversion_factors[pollutant]['tu']
            let pollutant_concentration = await concentration_receiving_water_body(industries, pollutant, global_layers, only_same_watershed)
            let tu_receiving_water_body = 1000*pollutant_concentration/tu_factor
            if(Number.isFinite(tu_receiving_water_body)) toxic_units[pollutant] = tu_receiving_water_body.toExponential(2)
            else toxic_units[pollutant] = "-"

        }

        if (Object.values(toxic_units).filter(x => x != "-").length == 0) toxic_units["total"] = '-'
        else toxic_units["total"] = Object.values(toxic_units).sum().toExponential(2)

        return toxic_units
    },
    async delta_eqs(industries, global_layers, same_watershed = false){ //Increase in the concentration of the receiving water body (compared to EQS) due to  discharging the water(%)

        let toxic_units = {}
        for(let pollutant of utils.get_pollutants(industries)){
            let eqs_factor = conversion_factors[pollutant]['eqs']
            let pollutant_delta = await effl_delta(industries, pollutant, global_layers, same_watershed)
            let delta_eqs = 100*pollutant_delta/eqs_factor

            if(pollutant_delta == 0) toxic_units[pollutant] = (0).toFixed(3)
            else if(Number.isFinite(delta_eqs)) toxic_units[pollutant] = delta_eqs.toFixed(3)
            else toxic_units[pollutant] = "-"
        }

        return toxic_units
    },

    //Increase in the concentration of the receiving water body (compared to EQS) due to  discharging the water(%)
    async eqs_receiving_water_body(industries, global_layers, same_watershed = false){

        let toxic_units = {}
        for(let pollutant of utils.get_pollutants(industries)){
            let eqs_factor = conversion_factors[pollutant]['eqs']
            let pollutant_concentration = await concentration_receiving_water_body(industries, pollutant, global_layers, same_watershed)
            let eqs = 100*pollutant_concentration/eqs_factor

            if(eqs == 0) toxic_units[pollutant] = (0).toFixed(3)
            else if(Number.isFinite(eqs)) toxic_units[pollutant] = eqs.toFixed(3)
            else toxic_units[pollutant] = "-"
        }

        return toxic_units
    },


    async delta_eqs_avg(industries, global_layers){
        let eqs = await this.delta_eqs(industries, global_layers, true)

        if (Object.values(eqs).filter(x => x != "-").length == 0) return  '-'

        let avg = Object.values(eqs).sum() / Object.values(eqs).length

        if(Number.isFinite(avg)) return avg.toFixed(3)
        else return "-"
    },

    //From the water discharged in same watershed where is withdrawn, find number of pollutants
    //that are above EQS
    async number_of_pollutants_above_eqs_same_watershed(industries, global_layers){
        let eqs = await this.delta_eqs(industries, global_layers, true)
        return Object.values(eqs).filter(x => x == "-" || x > 100).length  //Number of pollutants above EQS
    },


    async calculate_net_consumptive_use_external_sources_same_watershed(industries, global_layers){
        //From discharges in same watershed, find number of pollutants above EQS
        let number_of_pollutants_above_eqs_same_watershed = await this.number_of_pollutants_above_eqs_same_watershed(industries, global_layers)
        let water_withdrawn = calculate_water_withdrawn(industries)
        let external_sources = calculate_external_sources_same_watershed(industries)

        //If number of pollutants equals 0, return water withdrawn - water discharged in same watershed
        if(number_of_pollutants_above_eqs_same_watershed == 0){
            let water_discharged = calculate_water_discharged(industries, true)
            return water_withdrawn + external_sources - water_discharged
        }else{
            //If number of pollutants > 0, return water withdrawn
            return water_withdrawn + external_sources
        }
    },

    async calculate_net_consumptive_use_all_external_sources(industries, global_layers){
        //From discharges in same watershed, find number of pollutants above EQS
        let number_of_pollutants_above_eqs_same_watershed = await this.number_of_pollutants_above_eqs_same_watershed(industries, global_layers)
        let water_withdrawn = calculate_water_withdrawn(industries)
        let external_sources = calculate_all_external_sources(industries)

        //If number of pollutants equals 0, return water withdrawn - water discharged in same watershed
        if(number_of_pollutants_above_eqs_same_watershed == 0){
            let water_discharged = calculate_water_discharged(industries, true)
            return water_withdrawn + external_sources - water_discharged
        }else{
            //If number of pollutants > 0, return water withdrawn
            return water_withdrawn + external_sources
        }
    },


    eutrophication_potential(industries){

        let eutrophication = {}
        for(let pollutant of ["COD", "TN", "TP"]){
            let eutrophication_factor = conversion_factors[pollutant]['eutrophication']
            let effluent_concentration = effl_concentration_not_ocean(industries, pollutant)

            let eutrophication_value = eutrophication_factor*effluent_concentration
            if(Number.isFinite(eutrophication_value)) eutrophication[pollutant] = eutrophication_value.toExponential(3)
            else eutrophication[pollutant] = "NA"
        }
        let filtered_total = Object.values(eutrophication).filter(x => x != 'NA')
        if(filtered_total.length == 0) eutrophication["total"] = 'NA'
        else eutrophication["total"] = filtered_total.sum().toExponential(3)

        return eutrophication

    },

    energy_used(industries){
        let energy = industries.map(i => i.energy_used()).sum() / calculate_water_treated(industries)
        if(Number.isFinite(energy)) return energy.toExponential(2)
        else return "-"
    },

    sludge_management(industries){
        let sludge = sumObjectsByKey(...industries.map(x => x.sludge_management_emissions()))
        Object.keys(sludge).forEach(key => {
            let value = sludge[key]
            if(Number.isFinite(value)) sludge[key] = value.toExponential(2)
            else sludge[key] = "-"
        })

        let filtered_total = Object.values(sludge).filter(x => x != '-')
        if(filtered_total.length == 0) sludge["total"] = '-'
        else sludge["total"] = filtered_total.sum().toExponential(3)

        return sludge
    },

    biogenic_emissions(industries){
        let industries_emissions = industries.map(industry => industry.biogenic_emissions())
        let aggregated = sumObjectsByKey(...industries_emissions)
        Object.keys(aggregated).forEach(key => {
            let value = aggregated[key]
            if(Number.isFinite(value)) aggregated[key] = value.toExponential(2)
            else aggregated[key] = "-"
        })
        return aggregated
    },

    // consumptive use  (m3/day)
    async net_consumptive_use(industries, global_layers){
        let netConsumptiveUse = await this.calculate_net_consumptive_use_all_external_sources(industries, global_layers)
        if (netConsumptiveUse>=0) return netConsumptiveUse.toExponential(2)
        return "-"
    },

    // groundwater withdrawals in areas with high groundwater decline (m3/day)
    async groundwater_withdrawals_in_high_groundwater_decline(industries, global_layers){
        let total_gw_decline = 0
        for (let industry of industries){
            let has_gw_decline = await has_groundwater_table_decline([industry], global_layers, 0)
            let groundwater = industry.volume_of_groundwater_water_withdrawn()
            if (has_gw_decline) total_gw_decline += groundwater
        }
        if (total_gw_decline>=0) return total_gw_decline.toExponential(2)
        return "-"
    },

    // from the water withdrawn, amount of water that is considered as consumptive use (m3/day)
    async net_consumptive_use_percentage(industries, global_layers){
        let netConsumptiveUse = await this.calculate_net_consumptive_use_all_external_sources(industries, global_layers)
        let waterWithdrawn = calculate_water_withdrawn(industries)
        if (netConsumptiveUse>=0 && waterWithdrawn>0) return (100*netConsumptiveUse/waterWithdrawn).toFixed(2)
        return "-"
    },

    //external sources from other watersheds (m3/day)
    external_sources_from_other_watersheds(industries){
        return calculate_external_sources_different_watershed(industries)
    },

    //Increase in the temperature of the receiving water body due to the discharges of the industry (°C)
    // if only_same_watershed is true, only discharges from the same watershed where water is withdrawn are considered
    async delta_temperature(industries, global_layers){

        let load_temperature = calculate_effluent_temperature_load(industries, true)

        let water_discharged = calculate_water_discharged(industries, true)
        let streamflow_value = await streamflow(industries, global_layers) //streamflow (m3/day)
        let water_withdrawn = calculate_surface_water_withdrawn(industries)

        let delta = (load_temperature) / (streamflow_value + water_discharged - water_withdrawn)

        if(isNaN(delta)) return "-"
        return delta.toExponential(3) //°C
    }



}

export {metrics, utils}

