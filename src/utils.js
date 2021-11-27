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
    get_country_code_from_coordinates(lat, lng){
        let crg = require('country-reverse-geocoding').country_reverse_geocoding();
        let country = crg.get_country(lat, lng);
        let code = country.code
        return code
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

    if(isNaN(delta)) return (0).toExponential(3)
    return delta.toExponential(3) //g/m3
}

async function streamflow(industries, global_layers){

    let streamflow = global_layers["Streamflow"].layers.baseline.annual.layer
    let streamflow_value = await Promise.all(
        industries.map(async industry => {
            let _streamflow = await streamflow.data_on_point(industry.location.lat, industry.location.lng)*86400
            return _streamflow
        })) //streamflow (m3/day)
    return streamflow_value.sum()

}

function water_filtered(industries, industry_effluent, wwtp_effluent){
    return industries.map(industry => industry.filtered_pollutant_load(industry_effluent, wwtp_effluent))
}

function effl_efficiency(industries, industry_effluent, wwtp_effluent){   //Amount of pollutant filtered

    let filtered = water_filtered(industries, industry_effluent, wwtp_effluent)
    let discharged = calculate_water_discharged(industries)

    let eff = filtered / discharged

    if(isNaN(eff)) return (0).toFixed(3)
    else return (eff*100).toFixed(3)
}

function calculate_water_generated(industries){
    return industries.map(industry => industry.water_generated()).sum()
}

let metrics = {

    emissions_and_descriptions(industries, days_factor){
        let industries_emissions = industries.map(industry => industry.ghg())
        let aggregated = sumObjectsByKey(...industries_emissions)
        Object.keys(aggregated).forEach(key => {
            let value = aggregated[key]*days_factor
            if(Number.isFinite(value)) aggregated[key] = value.toExponential(3)
            else aggregated[key] = (0).toFixed(3)
        })
        return aggregated
    },

    async dilution_factor(global_layers, industries){

        let water_discharged = calculate_water_discharged(industries)    // m3/day

        if(water_discharged == 0) return (0).toFixed(3)

        let streamflow_value = await streamflow(industries, global_layers) //streamflow (m3/day)

        //let dilution_factor = water_discharged/(water_discharged + flow_acc_value)
        let dilution_factor = (water_discharged + streamflow_value)/water_discharged

        return dilution_factor.toExponential(3)

    },

    async available_ratio(global_layers, industries){

        let streamflow_value = await streamflow(industries, global_layers) //streamflow (m3/day)
        let water_withdrawn = calculate_water_withdrawn(industries)


        let available_ratio = water_withdrawn / streamflow_value
        if (isNaN(available_ratio)) return (0).toFixed(3)
        else return (available_ratio*100).toFixed(3)

    },

    recycled_water_factor(industries){
        let water_generated = calculate_water_generated(industries)
        let recycled_water = calculate_water_recycled(industries)

        if(water_generated > 0) {
            let recycled_water_factor = recycled_water / water_generated
            return (recycled_water_factor*100).toFixed(3)
        }
        return (0).toFixed(3)
    },

    treated_water_factor(industries){

        let water_discharged = calculate_water_generated(industries)    // m3/day
        let water_treated = calculate_water_treated(industries)

        if (water_discharged == 0) return (0).toFixed(3)
        else return (100*water_treated/water_discharged).toFixed(3)
    },

    efficiency_factor(industries){
        let product_produced = calculate_product_produced(industries)
        let vol_withdrawn = calculate_water_withdrawn(industries)
        if (vol_withdrawn>0) return (product_produced/vol_withdrawn).toExponential(3)
        return (0).toFixed(3)
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
            if(!isNaN(value)) obj[pollutant] = value.toFixed(3)
            else obj[pollutant] = (0).toFixed(3)
        })

        return obj

    },


    async bod_effl(industries, global_layers){
        let value = await effl_delta(industries, "wwt_cod_effl", global_layers)
        return value
    },

    bod_efficiency(industries){
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

    async reporting_metrics(industries, global_layers){
        let _this = this
        let withdrawn_factor_value = await withdrawn_factor(industries, global_layers)
        let discharged_factor_value = await discharged_factor(industries, global_layers)

        let reporting_metrics = {
            "g4-en8": calculate_water_withdrawn(industries)*365,
            "g4-en9": withdrawn_factor_value,   //mes gran que 5% mal
            "g4-en10": _this.recycled_water_factor(industries),
            "g4-en22": calculate_water_discharged(industries)*365,
            "g4-en26": discharged_factor_value,
            "wd": 365*0.001*calculate_water_withdrawn(industries), //Water withdrawn
            "dis": 365*0.001*calculate_water_discharged(industries),  //water discharged
            "re": 365*0.001*calculate_water_recycled(industries) //water reused
        }

        Object.keys(reporting_metrics).forEach(key => {
            let value = reporting_metrics[key]
            if(Number.isFinite(value)) reporting_metrics[key] = value.toExponential(3)
            else reporting_metrics[key] = (0).toExponential(3)
        })

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
            if(Number.isFinite(value)) toxic_units[key] = value.toExponential(3)
            else toxic_units[key] = (0).toExponential(3)
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
            if(Number.isFinite(value)) toxic_units[key] = value.toExponential(3)
            else toxic_units[key] = (0).toExponential(3)
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
            if(Number.isFinite(value)) toxic_units[key] = value.toExponential(3)
            else toxic_units[key] = (0).toExponential(3)
        })

        return toxic_units
    },


    /*async delta_toxic_units(industries, global_layers){
        let total_tu = this.ecotoxicity_potential_tu(industries).total
        let water_discharged = calculate_water_discharged(industries)
        let streamflow_value = await streamflow(industries, global_layers) //streamflow (m3/day)
        let water_withdrawn = calculate_water_withdrawn(industries)
        let delta = total_tu/(streamflow_value - water_withdrawn + water_discharged)
        if(isNaN(delta)) return (0).toExponential(3)
        return delta.toExponential(3)
    },*/

    eutrophication_potential(industries){
        let eutrophication = {
            cod: effl_concentration(industries, "wwt_cod_effl")*0.022,
            tn: effl_concentration(industries, "wwt_tn_effl")*0.42,
            tp: effl_concentration(industries, "wwt_tp_effl")*3.06,
        }

        let total_eutrophication = Object.values(eutrophication).sum()
        eutrophication["total"] = total_eutrophication

        Object.keys(eutrophication).forEach(key => {
            let value = eutrophication[key]
            if(Number.isFinite(value)) eutrophication[key] = value.toExponential(3)
            else eutrophication[key] = (0).toExponential(3)
        })

        return eutrophication

    }

}

export {metrics, utils}

