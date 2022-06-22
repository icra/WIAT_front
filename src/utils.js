import axios from "axios";

let main = require("./main")

//sum array of numbers
Array.prototype.sum=function(){return this.reduce((p,c)=>(p+c),0)};

function sumObjectsByKey(...objs) {
    return objs.reduce((a, b) => {
        for (let k in b) {
            if (b.hasOwnProperty(k))
                a[k] = (a[k] || 0) + b[k];
        }
        return a;
    }, {});
}

let utils = {

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

    is_industry_valid(industry){
        if(industry == null || industry == undefined) return false
        if(industry.volume_withdrawn!=null && industry.volume_withdrawn_groundwater!=null && industry.product_produced!=null && industry.has_onsite_wwtp!=null && industry.has_offsite_wwtp!=null && industry.has_direct_discharge!=null && industry.industry_type!=null){
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

    async areCoordsLand(lat, lng){
        let file_name = "baseline_population"
        let population_data = (await this.get_raster_data(file_name, lat, lng))

        if(population_data !== null) return true
        else return false
    },

    async overall_water_risk(lat, lng){
        let file_name = "owr"
        let data = (await this.get_raster_data(file_name, lat, lng))
        if(data !== null) return data
        else return null
    },

    getRandomColor(){
        let letters = '0123456789ABCDEF';
        let color = '#';
        for (let  i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color
    },

    daysBetween(date1String, date2String){
        let d1 = new Date(date1String);
        let d2 = new Date(date2String);
        return (d2-d1)/(1000*3600*24);
    },

    is_Natural(n){
        if (typeof n !== 'number') return false
        else return (n >= 0.0) && (Math.floor(n) === n) && n !== Infinity;
    },

    //FUNCTIONS FOR GETTING AND CHANGE FORMAT OF DATA LAYER
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


async function withdrawn_factor(industries, global_layers){     //S'ha de mirar

    let streamflow_value = await streamflow(industries, global_layers) //streamflow (m3/day)
    let water_withdrawn = calculate_water_withdrawn(industries)
    let factor = water_withdrawn / streamflow_value //Withdrawals that account for an average of five percent or more of the annual average significantly affects the water source
    if(isNaN(factor)) return (0).toFixed(3)
    return (factor*100).toFixed(3)
}

async function discharged_factor(industries, global_layers){

    let streamflow_value = await streamflow(industries, global_layers) //streamflow (m3/day)

    let wd = calculate_water_discharged(industries)

    let factor = 100*wd/streamflow_value //Withdrawals that account for an average of five percent or more of the annual average significantly affects the water source
    if(isNaN(factor)) return (0).toFixed(3)
    return factor.toFixed(3)
}


function calculate_effluent_load(industries, pollutant_effl){
    let load = industries.map(industry => industry.effl_pollutant_load(pollutant_effl)).sum()
    return load
}

function calculate_influent_load(industries, pollutant){
    let load = industries.map(industry => industry.infl_pollutant_load(pollutant)).sum()
    return load
}

function effl_concentration(industries, pollutant_effl){
    let load = calculate_effluent_load(industries, pollutant_effl)
    let discharged = calculate_water_discharged(industries)

    return load/discharged
}

function calculate_water_discharged(industries){
    return industries.map(industry => industry.water_discharged()).sum()
}

//superficial
function calculate_surface_water_withdrawn(industries){
    return industries.map(industry => industry.volume_of_surface_water_withdrawn()).sum()
}

//groundwater
function calculate_groundwater_water_withdrawn(industries){
    return industries.map(industry => industry.volume_of_groundwater_water_withdrawn()).sum()
}

//Groundwater + superficial
function calculate_water_withdrawn(industries){
    return industries.map(industry => industry.volume_of_water_withdrawn()).sum()
}

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

function calculate_water_discharged_surface(industries){
    return industries.map(industry => industry.water_discharged_onsite()+industry.water_directly_discharged()).sum()
}

function calculate_water_discharged_third_party(industries){
    return industries.map(industry => industry.water_discharged_offsite()).sum()
}

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

function calculate_water_treated(industries){
    return industries.map(industry => industry.volume_of_water_treated()).sum()
}

function calculate_water_recycled(industries){
    return industries.map(industry => industry.water_recycled()).sum()
}

function calculate_product_produced(industries){
    return industries.map(industry => industry.tonnes_of_product()).sum()
}

async function effl_delta(industries, effl, global_layers){

    let load = calculate_effluent_load(industries, effl)

    let water_discharged = calculate_water_discharged(industries)
    let streamflow_value = await streamflow(industries, global_layers) //streamflow (m3/day)
    let water_withdrawn = calculate_surface_water_withdrawn(industries)

    let delta = load / (streamflow_value + water_discharged - water_withdrawn)

    if(isNaN(delta)) return "-"
    return delta.toExponential(3) //g/m3
}

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

async function has_water_stress(industries, global_layers){
    let ws = await utils.water_stress(industries, global_layers)
    return (ws >= 40) ? "Yes" : "No"
}

function water_filtered(industries, industry_effluent, wwtp_effluent){
    return industries.map(industry => industry.filtered_pollutant_load(industry_effluent, wwtp_effluent))
}

function effl_efficiency(industries, industry_effluent, wwtp_effluent){   //Amount of pollutant filtered

    let filtered = water_filtered(industries, industry_effluent, wwtp_effluent)
    let generated = calculate_pollutant_generated(industries, industry_effluent)
    
    let eff = filtered / generated

    if(isNaN(eff) || !isFinite(eff)) return "-"
    else return (eff*100).toFixed(3)
}

function calculate_water_generated(industries){
    return industries.map(industry => industry.water_generated()).sum()
}

function calculate_water_consumed(industries){
    return industries.map(industry => industry.volume_of_water_withdrawn() - industry.water_discharged()).sum()
}

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
            treatments.tertiary.volume += industry.onsite_wwtp.wwt_vol_disc + industry.onsite_wwtp.wwt_vol_treated_external
            treatments.tertiary.sites += 1
        }else if(industry.has_onsite_wwtp == 1 && industry.onsite_wwtp.wwt_treatment_type == 2){
            treatments.secondary.volume += industry.onsite_wwtp.wwt_vol_disc + industry.onsite_wwtp.wwt_vol_treated_external
            treatments.secondary.sites += 1
        }else if(industry.has_onsite_wwtp == 1 && industry.onsite_wwtp.wwt_treatment_type == 1){
            treatments.primary.volume += industry.onsite_wwtp.wwt_vol_disc + industry.onsite_wwtp.wwt_vol_treated_external
            treatments.primary.sites += 1
        }
        if(industry.has_onsite_wwtp == 0 && industry.has_offsite_wwtp == 1) {
            treatments.third_party.volume += industry.offsite_wwtp.wwt_vol_trea
            treatments.third_party.sites += 1
        }
        if(industry.has_direct_discharge == 1){
            treatments.direct_discharge.volume += industry.direct_discharge.dd_vol_disc
            treatments.direct_discharge.sites += 1
        }
    }

    return treatments

}

let metrics = {


    emissions_and_descriptions(industries, days_factor){

        let industries_emissions = industries.map(industry => industry.ghg())
        let aggregated = sumObjectsByKey(...industries_emissions)
        Object.keys(aggregated).forEach(key => {
            let value = aggregated[key]*days_factor
            if(Number.isFinite(value)) aggregated[key] = value.toExponential(2)
            else aggregated[key] = "-"
        })
        return aggregated
    },

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


    async dilution_factor(global_layers, industries){

        let water_discharged = calculate_water_discharged(industries)    // m3/day

        if(water_discharged == 0) return "-"

        let streamflow_value = await streamflow(industries, global_layers) //streamflow (m3/day)

        //let dilution_factor = water_discharged/(water_discharged + flow_acc_value)
        let dilution_factor = (water_discharged + streamflow_value)/water_discharged

        return dilution_factor.toExponential(2)

    },

    async available_ratio(global_layers, industries){

        let streamflow_value = await streamflow(industries, global_layers) //streamflow (m3/day)
        let water_withdrawn = calculate_surface_water_withdrawn(industries)


        let available_ratio = water_withdrawn / streamflow_value
        if (isNaN(available_ratio)) return "-"
        else return (available_ratio*100).toFixed(2)

    },

    recycled_water_factor(industries){
        let water_generated = calculate_water_generated(industries)
        let recycled_water = calculate_water_recycled(industries)

        if(water_generated > 0) {
            let recycled_water_factor = recycled_water / water_generated
            return (recycled_water_factor*100).toFixed(2)
        }
        return "-"
    },

    treated_water_factor(industries){

        let water_discharged = calculate_water_generated(industries)    // m3/day
        let water_treated = calculate_water_treated(industries)

        if (water_discharged == 0) return "-"
        else return (100*water_treated/water_discharged).toFixed(2)
    },

    efficiency_factor(industries){
        let product_produced = calculate_product_produced(industries)
        let vol_withdrawn = calculate_water_withdrawn(industries)
        if (vol_withdrawn>0) return (product_produced/vol_withdrawn).toExponential(2)
        return "-"
    },

    nqa(industries){

        let pollutant_above_law_factor = industries.map(industry => {
            let nqa_per_pollutant = {
                diclo: effl_concentration([industry], "wwt_diclo_effl")/0.01,
                cadmium: effl_concentration([industry], "wwt_cadmium_effl")/0.001,
                hexaclorobenzene: effl_concentration([industry], "wwt_hexaclorobenzene_effl")/0.0005,
                mercury: effl_concentration([industry], "wwt_mercury_effl")/0.00007,
                lead: effl_concentration([industry], "wwt_plomo_effl")/0.0072,
                nickel: effl_concentration([industry], "wwt_niquel_effl")/0.02,
                chloroalkanes: effl_concentration([industry], "wwt_chloro_effl")/0.0014,
                hexaclorobutadie: effl_concentration([industry], "wwt_hexaclorobutadie_effl")/0.0006,
                nonylphenols: effl_concentration([industry], "wwt_nonilfenols_effl")/0.002,
                tetracloroetile: effl_concentration([industry], "wwt_tetracloroetile_effl")/0.01,
                tricloroetile: effl_concentration([industry], "wwt_tricloroetile_effl")/0.01,
            }

            let pollutant_above_law = Object.values(nqa_per_pollutant).filter(p => {return p > 1}).length
            return pollutant_above_law
        }).sum()   //Number of pollutants which concentration is above the permission

        //Porcentage of pollutants which concentration is above the permission
        return (100*pollutant_above_law_factor/11).toFixed(3)
    },

    environmental_quality_standards(industries){

        let obj = {
            diclo: 100*effl_concentration(industries, "wwt_diclo_effl")/0.01,
            cadmium: 100*effl_concentration(industries, "wwt_cadmium_effl")/0.001,
            hexaclorobenzene: 100*effl_concentration(industries, "wwt_hexaclorobenzene_effl")/0.0005,
            mercury: 100*effl_concentration(industries, "wwt_mercury_effl")/0.00007,
            lead: 100*effl_concentration(industries, "wwt_plomo_effl")/0.0072,
            nickel: 100*effl_concentration(industries, "wwt_niquel_effl")/0.02,
            chloroalkanes: 100*effl_concentration(industries, "wwt_chloro_effl")/0.0014,
            hexaclorobutadie: 100*effl_concentration(industries, "wwt_hexaclorobutadie_effl")/0.0006,
            nonylphenols: 100*effl_concentration(industries, "wwt_nonilfenols_effl")/0.002,
            tetracloroetile: 100*effl_concentration(industries, "wwt_tetracloroetile_effl")/0.01,
            tricloroetile: 100*effl_concentration(industries, "wwt_tricloroetile_effl")/0.01,
        }

        Object.keys(obj).forEach(pollutant => {
            let value = obj[pollutant]
            if(!isNaN(value)) {
                obj[pollutant] = value.toFixed(2)
            }
            else obj[pollutant] = "-"
        })

        return obj

    },


    pollutant_concentration(industries){

        let obj = {
            diclo: effl_concentration(industries, "wwt_diclo_effl"),
            cadmium: effl_concentration(industries, "wwt_cadmium_effl"),
            hexaclorobenzene: effl_concentration(industries, "wwt_hexaclorobenzene_effl"),
            mercury: effl_concentration(industries, "wwt_mercury_effl"),
            lead: effl_concentration(industries, "wwt_plomo_effl"),
            nickel: effl_concentration(industries, "wwt_niquel_effl"),
            chloroalkanes: effl_concentration(industries, "wwt_chloro_effl"),
            hexaclorobutadie: effl_concentration(industries, "wwt_hexaclorobutadie_effl"),
            nonylphenols: effl_concentration(industries, "wwt_nonilfenols_effl"),
            tetracloroetile: effl_concentration(industries, "wwt_tetracloroetile_effl"),
            tricloroetile: effl_concentration(industries, "wwt_tricloroetile_effl"),
        }

        Object.keys(obj).forEach(pollutant => {
            let value = obj[pollutant]
            if(!isNaN(value)) {
                obj[pollutant] = value.toExponential(2)
            }
            else obj[pollutant] = "-"
        })

        return obj

    },

    async pollutant_delta(industries, global_layers){

        let obj = {
            diclo: await effl_delta(industries, "wwt_diclo_effl", global_layers),
            cadmium: await effl_delta(industries, "wwt_cadmium_effl", global_layers),
            hexaclorobenzene: await effl_delta(industries, "wwt_hexaclorobenzene_effl", global_layers),
            mercury: await effl_delta(industries, "wwt_mercury_effl", global_layers),
            lead: await effl_delta(industries, "wwt_plomo_effl", global_layers),
            nickel: await effl_delta(industries, "wwt_niquel_effl", global_layers),
            chloroalkanes: await effl_delta(industries, "wwt_chloro_effl", global_layers),
            hexaclorobutadie: await effl_delta(industries, "wwt_hexaclorobutadie_effl", global_layers),
            nonylphenols: await effl_delta(industries, "wwt_nonilfenols_effl", global_layers),
            tetracloroetile: await effl_delta(industries, "wwt_tetracloroetile_effl", global_layers),
            tricloroetile: await effl_delta(industries, "wwt_tricloroetile_effl", global_layers),
        }

        return obj

    },


    eqs_avg(industries){
        let eqs = this.environmental_quality_standards(industries)

        let avg = Object.values(eqs).sum() / Object.values(eqs).length

        if(Number.isFinite(avg)) return avg.toExponential(2)
        else return "-"
    },

    async cod_effl(industries, global_layers){
        let value = await effl_delta(industries, "wwt_cod_effl", global_layers)
        return value
    },

    cod_efficiency(industries){
        let value = effl_efficiency(industries, "ind_cod_effl", "wwt_cod_effl")
        return value
    },

    async tn_effl(industries, global_layers){
        let value = await effl_delta(industries, "wwt_tn_effl", global_layers)
        return value
    },
    tn_efficiency(industries){
        let value = effl_efficiency(industries, "ind_tn_effl", "wwt_tn_effl")
        return value
    },

    async tp_effl(industries, global_layers){
        let value = await effl_delta(industries, "wwt_tp_effl", global_layers)
        return value
    },
    tp_efficiency(industries){
        let value = effl_efficiency(industries, "ind_tp_effl", "wwt_tp_effl")
        return value
    },

    async dichloroethane_effl(industries, global_layers){
        let value = await effl_delta(industries, "wwt_diclo_effl", global_layers)
        return value
    },
    dichloroethane_efficiency(industries){
        let value = effl_efficiency(industries, "ind_diclo_effl", "wwt_diclo_effl")
        return value
    },

    async cadmium_effl(industries, global_layers){
        let value = await effl_delta(industries, "wwt_cadmium_effl", global_layers)
        return value
    },
    cadmium_efficiency(industries){
        let value = effl_efficiency(industries, "ind_cadmium_effl", "wwt_cadmium_effl")
        return value
    },

    async hexaclorobenzene_effl(industries, global_layers){
        let value = await effl_delta(industries, "wwt_hexaclorobenzene_effl", global_layers)
        return value
    },
    hexaclorobenzene_efficiency(industries){
        let value = effl_efficiency(industries, "ind_hexaclorobenzene_effl", "wwt_hexaclorobenzene_effl")
        return value
    },

    async mercury_effl(industries, global_layers){
        let value = await effl_delta(industries, "wwt_mercury_effl", global_layers)
        return value
    },
    mercury_efficiency(industries){
        let value = effl_efficiency(industries, "ind_mercury_effl", "wwt_mercury_effl")
        return value
    },

    async lead_effl(industries, global_layers){
        let value = await effl_delta(industries, "wwt_plomo_effl", global_layers)
        return value
    },
    lead_efficiency(industries){
        let value = effl_efficiency(industries, "ind_plomo_effl", "wwt_plomo_effl")
        return value
    },

    async nickel_effl(industries, global_layers){
        let value = await effl_delta(industries, "wwt_niquel_effl", global_layers)
        return value
    },
    nickel_efficiency(industries){
        let value = effl_efficiency(industries, "ind_niquel_effl", "wwt_niquel_effl")
        return value
    },

    async chloroalkanes_effl(industries, global_layers){
        let value = await effl_delta(industries, "wwt_chloro_effl", global_layers)
        return value
    },
    chloroalkanes_efficiency(industries){
        let value = effl_efficiency(industries, "ind_chloro_effl", "wwt_chloro_effl")
        return value
    },

    async hexaclorobutadie_effl(industries, global_layers){
        let value = await effl_delta(industries, "wwt_hexaclorobutadie_effl", global_layers)
        return value
    },
    hexaclorobutadie_efficiency(industries){
        let value = effl_efficiency(industries, "ind_hexaclorobutadie_effl", "wwt_hexaclorobutadie_effl")
        return value
    },

    async nonylphenols_effl(industries, global_layers){
        let value = await effl_delta(industries, "wwt_nonilfenols_effl", global_layers)
        return value
    },
    nonylphenols_efficiency(industries){
        let value = effl_efficiency(industries, "ind_nonilfenols_effl", "wwt_nonilfenols_effl")
        return value
    },

    async tetrachloroethene_effl(industries, global_layers){
        let value = await effl_delta(industries, "wwt_tetracloroetile_effl", global_layers)
        return value
    },
    tetrachloroethene_efficiency(industries){
        let value = effl_efficiency(industries, "ind_tetracloroetile_effl", "wwt_tetracloroetile_effl")
        return value
    },

    async tricloroetile_effl(industries, global_layers){
        let value = await effl_delta(industries, "wwt_tricloroetile_effl", global_layers)
        return value
    },
    tricloroetile_efficiency(industries){
        let value = effl_efficiency(industries, "ind_tricloroetile_effl", "wwt_tricloroetile_effl")
        return value
    },

    amount_water_influent_cleaned(industries){
        let cod_infl = calculate_influent_load(industries, "ind_cod_infl")
        let tn_infl = calculate_influent_load(industries, "ind_tn_infl")
        let tp_infl = calculate_influent_load(industries, "ind_tp_infl")

        let cod_effl = calculate_effluent_load(industries, "wwt_cod_effl")
        let tn_effl = calculate_effluent_load(industries, "wwt_tn_effl")
        let tp_effl = calculate_effluent_load(industries, "wwt_tp_effl")

        let cod = (cod_infl == 0 || isNaN(cod_infl)) ? "-" : (100*cod_effl/cod_infl).toFixed(2)
        let tn = (tn_infl == 0 || isNaN(tn_infl)) ? "-" : (100*tn_effl/tn_infl).toFixed(2)
        let tp = (tp_infl == 0 || isNaN(tp_infl)) ? "-" : (100*tp_effl/tp_infl).toFixed(2)

        return {cod, tn, tp}
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
        let treatment_efficiency = [this.cod_efficiency(industries), this.tn_efficiency(industries),
            this.tp_efficiency(industries), this.dichloroethane_efficiency(industries), this.cadmium_efficiency(industries),
            this.hexaclorobenzene_efficiency(industries), this.mercury_efficiency(industries), this.lead_efficiency(industries),
            this.nickel_efficiency(industries), this.chloroalkanes_efficiency(industries), this.hexaclorobutadie_efficiency(industries),
            this.nonylphenols_efficiency(industries), this.tetrachloroethene_efficiency(industries), this.tricloroetile_efficiency(industries)
        ]

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


    ecotoxicity_potential_tu(industries) { //concentration of tu (tu/day)
        let toxic_units = {
            diclo: effl_concentration(industries, "wwt_diclo_effl")/150,
            cadmium: effl_concentration(industries, "wwt_cadmium_effl")/0.0095,
            hexaclorobenzene: effl_concentration(industries, "wwt_hexaclorobenzene_effl")/0.03,
            mercury: effl_concentration(industries, "wwt_mercury_effl")/0.0014,
            lead: effl_concentration(industries, "wwt_plomo_effl")/0.44,
            nickel: effl_concentration(industries, "wwt_niquel_effl")/1,
            chloroalkanes: effl_concentration(industries, "wwt_chloro_effl")/65,
            hexaclorobutadie: effl_concentration(industries, "wwt_hexaclorobutadie_effl")/0.5,
            nonylphenols: effl_concentration(industries, "wwt_nonilfenols_effl")/0.15,
            tetracloroetile: effl_concentration(industries, "wwt_tetracloroetile_effl")/3.2,
            tricloroetile: effl_concentration(industries, "wwt_tricloroetile_effl")/76,
        }
        let total_toxic_units = Object.values(toxic_units).sum()
        toxic_units["total"] = total_toxic_units

        Object.keys(toxic_units).forEach(key => {
            let value = toxic_units[key]
            if(Number.isFinite(value)) toxic_units[key] = value.toExponential(2)
            else toxic_units[key] = "-"
        })

        return toxic_units
    },
    async delta_tu(industries, global_layers){ //concentration of tu (tu/day)
        let toxic_units = {
            diclo: await effl_delta(industries, "wwt_diclo_effl", global_layers)/150,
            cadmium: await effl_delta(industries, "wwt_cadmium_effl", global_layers)/0.0095,
            hexaclorobenzene: await effl_delta(industries, "wwt_hexaclorobenzene_effl", global_layers)/0.03,
            mercury: await effl_delta(industries, "wwt_mercury_effl", global_layers)/0.0014,
            lead: await effl_delta(industries, "wwt_plomo_effl", global_layers)/0.44,
            nickel: await effl_delta(industries, "wwt_niquel_effl", global_layers)/1,
            chloroalkanes: await effl_delta(industries, "wwt_chloro_effl", global_layers)/65,
            hexaclorobutadie: await effl_delta(industries, "wwt_hexaclorobutadie_effl", global_layers)/0.5,
            nonylphenols: await effl_delta(industries, "wwt_nonilfenols_effl", global_layers)/0.15,
            tetracloroetile: await effl_delta(industries, "wwt_tetracloroetile_effl", global_layers)/3.2,
            tricloroetile: await effl_delta(industries, "wwt_tricloroetile_effl", global_layers)/76,
        }
        let total_toxic_units = Object.values(toxic_units).sum()
        toxic_units["total"] = total_toxic_units

        Object.keys(toxic_units).forEach(key => {
            let value = toxic_units[key]
            if(Number.isFinite(value)) toxic_units[key] = value.toExponential(2)
            else toxic_units[key] = "-"
        })

        return toxic_units
    },
    async delta_eqs(industries, global_layers){ //concentration of tu (tu/day)
        let toxic_units = {
            diclo: await effl_delta(industries, "wwt_diclo_effl", global_layers)*100/0.01,
            cadmium: await effl_delta(industries, "wwt_cadmium_effl", global_layers)*100/0.001,
            hexaclorobenzene: await effl_delta(industries, "wwt_hexaclorobenzene_effl", global_layers)*100/0.0005,
            mercury: await effl_delta(industries, "wwt_mercury_effl", global_layers)*100/0.00007,
            lead: await effl_delta(industries, "wwt_plomo_effl", global_layers)*100/0.0072,
            nickel: await effl_delta(industries, "wwt_niquel_effl", global_layers)*100/0.02,
            chloroalkanes: await effl_delta(industries, "wwt_chloro_effl", global_layers)*100/0.0014,
            hexaclorobutadie: await effl_delta(industries, "wwt_hexaclorobutadie_effl", global_layers)*100/0.0006,
            nonylphenols: await effl_delta(industries, "wwt_nonilfenols_effl", global_layers)*100/0.002,
            tetracloroetile: await effl_delta(industries, "wwt_tetracloroetile_effl", global_layers)*100/0.01,
            tricloroetile: await effl_delta(industries, "wwt_tricloroetile_effl", global_layers)*100/0.01,
        }

        Object.keys(toxic_units).forEach(key => {
            let value = toxic_units[key]
            if(Number.isFinite(value)) toxic_units[key] = value.toFixed(2)
            else toxic_units[key] = "-"
        })

        return toxic_units
    },
    async delta_eqs_avg(industries, global_layers){ //concentration of tu (tu/day)
        let eqs = await this.delta_eqs(industries, global_layers)

        let avg = Object.values(eqs).sum() / Object.values(eqs).length

        if(Number.isFinite(avg)) return avg.toExponential(2)
        else return "-"

    },

    eutrophication_potential(industries){
        let eutrophication = {
            cod: effl_concentration(industries, "wwt_cod_effl")*0.022,
            tn: effl_concentration(industries, "wwt_tn_effl")*0.42,
            tp: effl_concentration(industries, "wwt_tp_effl")*3.06,
        }

        eutrophication["total"] = Object.values(eutrophication).sum()

        Object.keys(eutrophication).forEach(key => {
            let value = eutrophication[key]
            if(Number.isFinite(value)) eutrophication[key] = value.toExponential(2)
            else eutrophication[key] = "-"
        })

        return eutrophication

    },

    energy_used(industries){

        let energy = industries.map(i => i.energy_used()).sum() / calculate_water_treated(industries)
        if(Number.isFinite(energy)) return energy.toExponential(2)
        else return "-"
    },

    effluent_concentration(industries){
        let load = {
            cod: effl_concentration(industries, "wwt_cod_effl"),
            tn: effl_concentration(industries, "wwt_tn_effl"),
            tp: effl_concentration(industries, "wwt_tp_effl"),
        }

        Object.keys(load).forEach(key => {
            let value = load[key]
            if(Number.isFinite(value)) load[key] = value.toExponential(2)
            else load[key] = "-"
        })

        return load

    },

    sludge_management(industries){
        let sludge = sumObjectsByKey(...industries.map(x => x.sludge_management_emissions()))

        Object.keys(sludge).forEach(key => {
            let value = sludge[key]
            if(Number.isFinite(value)) sludge[key] = value.toExponential(2)
            else sludge[key] = "-"
        })

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




}

export {metrics, utils}

