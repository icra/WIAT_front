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

    async areCoordsLand(lat, lng){
        let file_name = "baseline_population"
        let population_data = (await this.get_raster_data(file_name, lat, lng))
        if(population_data !== null) return true
        else return false

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


async function withdrawn_factor(industries, global_layers){

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

function calculate_water_withdrawn(industries){
    return industries.map(industry => industry.volume_of_water_withdrawn()).sum()
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
    let water_withdrawn = calculate_water_withdrawn(industries)

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
        let water_withdrawn = calculate_water_withdrawn(industries)


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
            diclo: effl_concentration(industries, "wwt_diclo_effl")/0.01,
            cadmium: effl_concentration(industries, "wwt_cadmium_effl")/0.001,
            hexaclorobenzene: effl_concentration(industries, "wwt_hexaclorobenzene_effl")/0.0005,
            mercury: effl_concentration(industries, "wwt_mercury_effl")/0.00007,
            lead: effl_concentration(industries, "wwt_plomo_effl")/0.0072,
            nickel: effl_concentration(industries, "wwt_niquel_effl")/0.02,
            chloroalkanes: effl_concentration(industries, "wwt_chloro_effl")/0.0014,
            hexaclorobutadie: effl_concentration(industries, "wwt_hexaclorobutadie_effl")/0.0006,
            nonylphenols: effl_concentration(industries, "wwt_nonilfenols_effl")/0.002,
            tetracloroetile: effl_concentration(industries, "wwt_tetracloroetile_effl")/0.01,
            tricloroetile: effl_concentration(industries, "wwt_tricloroetile_effl")/0.01,
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
        }
        Object.keys(reporting_metrics).forEach(key => {
            let value = reporting_metrics[key]
            if(Number.isFinite(value)) reporting_metrics[key] = value.toExponential(2)
            else reporting_metrics[key] = "-"
        })



        reporting_metrics["highest_level_discharge"] = better_treatment(industries)

        return reporting_metrics
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
            diclo: await effl_delta(industries, "wwt_diclo_effl", global_layers)/0.01,
            cadmium: await effl_delta(industries, "wwt_cadmium_effl", global_layers)/0.001,
            hexaclorobenzene: await effl_delta(industries, "wwt_hexaclorobenzene_effl", global_layers)/0.0005,
            mercury: await effl_delta(industries, "wwt_mercury_effl", global_layers)/0.00007,
            lead: await effl_delta(industries, "wwt_plomo_effl", global_layers)/0.0072,
            nickel: await effl_delta(industries, "wwt_niquel_effl", global_layers)/0.02,
            chloroalkanes: await effl_delta(industries, "wwt_chloro_effl", global_layers)/0.0014,
            hexaclorobutadie: await effl_delta(industries, "wwt_hexaclorobutadie_effl", global_layers)/0.0006,
            nonylphenols: await effl_delta(industries, "wwt_nonilfenols_effl", global_layers)/0.002,
            tetracloroetile: await effl_delta(industries, "wwt_tetracloroetile_effl", global_layers)/0.01,
            tricloroetile: await effl_delta(industries, "wwt_tricloroetile_effl", global_layers)/0.01,
        }

        Object.keys(toxic_units).forEach(key => {
            let value = toxic_units[key]
            if(Number.isFinite(value)) toxic_units[key] = value.toExponential(2)
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
        return industries.map(i => i.energy_used()).sum()
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


}

export {metrics, utils}

