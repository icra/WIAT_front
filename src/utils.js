let main = require("./main")


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



async function effl_delta(industry, effl, global_layers){
    let load = 0
    if(industry.has_onsite_wwtp) {
        load += industry.onsite_wwtp[effl] * industry.onsite_wwtp.wwt_vol_disc // g/day
    }
    if(industry.has_direct_discharge) {
        load += industry.direct_discharge[effl]  *  industry.direct_discharge.wwt_vol_disc  // g/day
    }
    if(industry.has_offsite_wwtp){
        load += industry.offsite_wwtp[effl] * industry.offsite_wwtp.wwt_vol_disc  // g/day
    }

    let water_discharged = 0
    if(industry.has_onsite_wwtp) water_discharged += industry.onsite_wwtp.wwt_vol_disc  //m3/day
    if(industry.has_direct_discharge) water_discharged += industry.direct_discharge.wwt_vol_disc //m3/day
    if(industry.has_offsite_wwtp) water_discharged += industry.offsite_wwtp.wwt_vol_disc //m3/day

    let streamflow = global_layers["Streamflow"].layers.baseline.annual.layer
    let streamflow_value = await streamflow.data_on_point(industry.location.lat, industry.location.lng)*86400 //streamflow (m3/day)
    let water_withdrawn = industry.volume_withdrawn

    let delta = load / (streamflow_value + water_discharged - water_withdrawn)

    if(isNaN(delta)) return NaN
    return delta //g/m3
}

function effl_efficiency(industry, pollutant_effl, pollutant_infl){   //Amount of pollutant filtered
    let load = 0
    let treated = 0
    if(industry.has_onsite_wwtp) {
        load += industry.onsite_wwtp[pollutant_effl] * industry.onsite_wwtp.wwt_vol_disc // g/day
        treated += industry.onsite_wwtp.wwt_vol_trea
    }
    if(industry.has_direct_discharge) {
        load += industry.direct_discharge[pollutant_effl]  *  industry.direct_discharge.wwt_vol_disc  // g/day
        treated += industry.direct_discharge.wwt_vol_disc
    }
    if(industry.has_offsite_wwtp){
        load += industry.offsite_wwtp[pollutant_effl] * industry.offsite_wwtp.wwt_vol_disc  // g/day
        treated += industry.offsite_wwtp.wwt_vol_trea
    }

    let load_infl = industry[pollutant_infl] * treated

    let eff = load / load_infl

    if(isNaN(eff)) return NaN
    return eff*100
}

function water_discharged(industry){
    let water_discharged = 0
    if(industry.has_onsite_wwtp) water_discharged += industry.onsite_wwtp.wwt_vol_disc  //m3/day
    if(industry.has_direct_discharge) water_discharged += industry.direct_discharge.wwt_vol_disc //m3/day
    if(industry.has_offsite_wwtp) water_discharged += industry.offsite_wwtp.wwt_vol_disc //m3/day
    return water_discharged
}

async function withdrawn_factor(industry, global_layers){

    let streamflow = global_layers["Streamflow"].layers.baseline.annual.layer
    let streamflow_value = await streamflow.data_on_point(industry.location.lat, industry.location.lng)*86400 //streamflow (m3/day)
    let factor = industry.volume_withdrawn / streamflow_value //Withdrawals that account for an average of five percent or more of the annual average significantly affects the water source
    if(isNaN(factor)) return NaN
    return factor


}

let metrics = {

    emissions_and_descriptions(industry){
        let sources = {
            "wwt_KPI_GHG_elec": 0,
            "wwt_KPI_GHG_fuel": 0,
            "wwt_KPI_GHG_tre": 0,
            "wwt_KPI_GHG_biog": 0,
            "wwt_KPI_GHG_slu": 0,
            "wwt_KPI_GHG_reus_trck":0,
            "wwt_KPI_GHG_disc": 0,
        }

        for (let key of Object.keys(sources)){

            if(industry.has_onsite_wwtp && industry.onsite_wwtp !== null){
                sources[key] += industry.onsite_wwtp[key]().total
            }
            if(industry.has_direct_discharge && industry.direct_discharge !== null){
                sources[key] += industry.direct_discharge[key]().total
            }
            if(industry.has_offsite_wwtp && industry.offsite_wwtp !== null){
                sources[key] += industry.offsite_wwtp[key]().total
            }
        }

        sources["supply_chain_emissions"] = industry.emissions_from_supply_chain().total


        return sources
    },

    global_warming_potential(industry){
        return Object.values(this.emissions_and_descriptions(industry)).reduce((a, b) => a + b, 0)
    },

    async dilution_factor(global_layers, industry){

        let streamflow = global_layers["Streamflow"].layers.baseline.annual.layer

        let water_discharged = 0    // m3/day
        if(industry.has_onsite_wwtp) water_discharged += industry.onsite_wwtp.wwt_vol_disc  //m3/day
        if(industry.has_direct_discharge) water_discharged += industry.direct_discharge.wwt_vol_disc //m3/day
        if(industry.has_offsite_wwtp) water_discharged += industry.offsite_wwtp.wwt_vol_disc //m3/day

        if(water_discharged == 0) return NaN

        let streamflow_value = await streamflow.data_on_point(industry.location.lat, industry.location.lng)*86400 //streamflow (m3/day)

        //let dilution_factor = water_discharged/(water_discharged + flow_acc_value)
        let dilution_factor = (water_discharged + streamflow_value)/water_discharged

        return dilution_factor*100

    },

    async available_ratio(global_layers, industry){

        let streamflow = global_layers["Streamflow"].layers.baseline.annual.layer
        let streamflow_value = await streamflow.data_on_point(industry.location.lat, industry.location.lng)*86400 //streamflow (m3/day)
        let water_withdrawn = industry.water_withdrawn

        let available_ratio = water_withdrawn / streamflow_value
        if (isNaN(available_ratio)) return NaN
        else return available_ratio*100

    },

    recycled_water_factor(industry){
        if(industry.has_onsite_wwtp && industry.water_withdrawn > 0) {
            let recycled_water_factor = industry.onsite_wwtp.wwt_vol_reused / industry.water_withdrawn
            return recycled_water_factor*100
        }
        return NaN
    },

    treated_water_factor(industry){

        let water_discharged = 0    // m3/day
        let water_treated = 0
        if(industry.has_onsite_wwtp) {
            water_discharged += industry.onsite_wwtp.wwt_vol_disc
            water_treated += industry.onsite_wwtp.wwt_vol_disc
        }  //m3/day
        if(industry.has_direct_discharge) water_discharged += industry.direct_discharge.wwt_vol_disc //m3/day
        if(industry.has_offsite_wwtp) {
            water_discharged += industry.offsite_wwtp.wwt_vol_disc
            water_treated += industry.offsite_wwtp.wwt_vol_disc
        } //m3/day

        if (water_discharged == 0) return NaN
        else return 100*water_treated/water_discharged
    },

    efficiency_factor(industry){
        let product_produced = industry.product_produced
        let vol_used = industry.vol_used
        let efficiency = product_produced/vol_used
        return NaN
    },

    /*async dbo_in_river(global_layers, industry, assessment_days, future = false){
        let pharmaceutical_pollution = global_layers["Surface Water Pharmaceutical Pollution"].layers.baseline.annual.layer
        let flow_acc = global_layers["Flow accumulation"].layers.baseline.annual.layer

        let dbo_concentration = await pharmaceutical_pollution.data_on_point(industry.location.lat, industry.location.lng)*100*1e-6 // From dyplophenac ng/L to BOD g/m3
        let flow_acc_value = await flow_acc.data_on_point(industry.location.lat, industry.location.lng)/365 //m3/day


        let load = dbo_concentration*flow_acc_value - industry.volume_withdrawn*dbo_concentration
        let water_discharged = 0    //m3/day

        if(industry.has_onsite_wwtp) {
            load += industry.onsite_wwtp.wwt_bod_effl_to_wb * 2.4 * industry.onsite_wwtp.wwt_vol_disc // g/day
            water_discharged += industry.onsite_wwtp.wwt_vol_disc  // m3/day
        }
        if(industry.has_direct_discharge) {
            load += industry.direct_discharge.wwt_bod_effl_to_wb * 2.4 * industry.direct_discharge.wwt_vol_disc  // g/day
            water_discharged += industry.direct_discharge.wwt_vol_disc  // m3/day
        }
        if(industry.has_offsite_wwtp){
            water_discharged += industry.offsite_wwtp.wwt_vol_disc  // m3/day
            if(industry.offsite_wwtp_type == "Domestic") load += industry.offsite_wwtp.wwt_bod_effl_to_wb * industry.offsite_wwtp.wwt_vol_disc  // g/day
            else load += industry.offsite_wwtp.wwt_bod_effl_to_wb * 2.4 * industry.offsite_wwtp.wwt_vol_disc  // g/day
        }
        let discharge = flow_acc_value - industry.volume_used + water_discharged
        let dbo = load/water_discharged
        if (discharge == 0) return NaN
        else{
            return dbo
        }

    },*/

    async bod_effl(industry, global_layers){
        let load = 0
        if(industry.has_onsite_wwtp) {
            load += industry.onsite_wwtp.wwt_bod_effl_to_wb * 2.4 * industry.onsite_wwtp.wwt_vol_disc // g/day
        }
        if(industry.has_direct_discharge) {
            load += industry.direct_discharge.wwt_bod_effl_to_wb * 2.4 * industry.direct_discharge.wwt_vol_disc  // g/day
        }
        if(industry.has_offsite_wwtp){
            if(industry.offsite_wwtp_type == "Domestic") load += industry.offsite_wwtp.wwt_bod_effl_to_wb * industry.offsite_wwtp.wwt_vol_disc  // g/day
            else load += industry.offsite_wwtp.wwt_bod_effl_to_wb * 2.4 * industry.offsite_wwtp.wwt_vol_disc  // g/day
        }

        let water_discharged = 0
        if(industry.has_onsite_wwtp) water_discharged += industry.onsite_wwtp.wwt_vol_disc  //m3/day
        if(industry.has_direct_discharge) water_discharged += industry.direct_discharge.wwt_vol_disc //m3/day
        if(industry.has_offsite_wwtp) water_discharged += industry.offsite_wwtp.wwt_vol_disc //m3/day

        let streamflow = global_layers["Streamflow"].layers.baseline.annual.layer
        let streamflow_value = await streamflow.data_on_point(industry.location.lat, industry.location.lng)*86400 //streamflow (m3/day)
        let water_withdrawn = industry.volume_withdrawn

        let delta = load / (streamflow_value + water_discharged - water_withdrawn)

        if(isNaN(delta)) return NaN
        return delta //g/m3
    },

    bod_efficiency(industry){
        let load = 0
        let water_treated = 0

        if(industry.has_onsite_wwtp) {
            load += industry.onsite_wwtp.wwt_bod_effl_to_wb * 2.4 * industry.onsite_wwtp.wwt_vol_disc // g/day
            water_treated += industry.onsite_wwtp.wwt_vol_trea
        }
        if(industry.has_direct_discharge) {
            load += industry.direct_discharge.wwt_bod_effl_to_wb * 2.4 * industry.direct_discharge.wwt_vol_disc  // g/day
            water_treated = industry.direct_discharge.wwt_vol_disc
        }
        if(industry.has_offsite_wwtp){
            if(industry.offsite_wwtp_type == "Domestic") load += industry.offsite_wwtp.wwt_bod_effl_to_wb * industry.offsite_wwtp.wwt_vol_disc  // g/day
            else load += industry.offsite_wwtp.wwt_bod_effl_to_wb * 2.4 * industry.offsite_wwtp.wwt_vol_disc  // g/day
            water_treated += industry.offsite_wwtp.wwt_vol_trea
        }
        let bod_industry = industry.bod_effl_concentration * water_treated
        let eff = load / bod_industry
        if(isNaN(eff)) return NaN
        return eff*100
    },

    async tn_effl(industry, global_layers){
        let value = await effl_delta(industry, "wwt_tn_effl_to_wb", global_layers)
        return value
    },
    tn_efficiency(industry){
        let value = effl_efficiency(industry, "wwt_tn_effl_to_wb", "tn_effl_concentration")
        return value
    },

    async tp_effl(industry, global_layers){
        let value = await effl_delta(industry, "wwt_tp_effl_to_wb", global_layers)
        return value
    },
    tp_efficiency(industry){
        let value = effl_efficiency(industry, "wwt_tp_effl_to_wb", "tp_effl_concentration")
        return value
    },

    async dichloroethane_effl(industry, global_layers){
        let value = await effl_delta(industry, "wwt_diclo_effl_to_wb", global_layers)
        return value
    },
    dichloroethane_efficiency(industry){
        let value = effl_efficiency(industry, "wwt_diclo_effl_to_wb", "diclo_effl")
        return value
    },

    async cadmium_effl(industry, global_layers){
        let value = await effl_delta(industry, "wwt_cadmium_effl_to_wb", global_layers)
        return value
    },
    cadmium_efficiency(industry){
        let value = effl_efficiency(industry, "wwt_cadmium_effl_to_wb", "cadmium_effl")
        return value
    },

    async hexaclorobenzene_effl(industry, global_layers){
        let value = await effl_delta(industry, "wwt_hexaclorobenzene_effl_to_wb", global_layers)
        return value
    },
    hexaclorobenzene_efficiency(industry){
        let value = effl_efficiency(industry, "wwt_hexaclorobenzene_effl_to_wb", "hexaclorobenzene_effl")
        return value
    },

    async mercury_effl(industry, global_layers){
        let value = await effl_delta(industry, "wwt_mercury_effl_to_wb", global_layers)
        return value
    },
    mercury_efficiency(industry){
        let value = effl_efficiency(industry, "wwt_mercury_effl_to_wb", "mercury_effl")
        return value
    },

    async lead_effl(industry, global_layers){
        let value = await effl_delta(industry, "wwt_plomo_effl_to_wb", global_layers)
        return value
    },
    lead_efficiency(industry){
        let value = effl_efficiency(industry, "wwt_plomo_effl_to_wb", "plomo_effl")
        return value
    },

    async nickel_effl(industry, global_layers){
        let value = await effl_delta(industry, "wwt_niquel_effl_to_wb", global_layers)
        return value
    },
    nickel_efficiency(industry){
        let value = effl_efficiency(industry, "wwt_niquel_effl_to_wb", "niquel_effl")
        return value
    },

    async chloroalkanes_effl(industry, global_layers){
        let value = await effl_delta(industry, "wwt_chloro_effl_to_wb", global_layers)
        return value
    },
    chloroalkanes_efficiency(industry){
        let value = effl_efficiency(industry, "wwt_chloro_effl_to_wb", "chloro_effl")
        return value
    },

    async hexaclorobutadie_effl(industry, global_layers){
        let value = await effl_delta(industry, "wwt_hexaclorobutadie_effl_to_wb", global_layers)
        return value
    },
    hexaclorobutadie_efficiency(industry){
        let value = effl_efficiency(industry, "wwt_hexaclorobutadie_effl_to_wb", "hexaclorobutadie_effl")
        return value
    },

    async nonylphenols_effl(industry, global_layers){
        let value = await effl_delta(industry, "wwt_nonilfenols_effl_to_wb", global_layers)
        return value
    },
    nonylphenols_efficiency(industry){
        let value = effl_efficiency(industry, "wwt_nonilfenols_effl_to_wb", "nonilfenols_effl")
        return value
    },

    async tetrachloroethene_effl(industry, global_layers){
        let value = await effl_delta(industry, "wwt_tetracloroetile_effl_to_wb", global_layers)
        return value
    },
    tetrachloroethene_efficiency(industry){
        let value = effl_efficiency(industry, "wwt_tetracloroetile_effl_to_wb", "tetracloroetile_effl")
        return value
    },

    async tricloroetile_effl(industry, global_layers){
        let value = await effl_delta(industry, "wwt_tricloroetile_effl_to_wb", global_layers)
        return value
    },
    tricloroetile_efficiency(industry){
        let value = effl_efficiency(industry, "wwt_tricloroetile_effl_to_wb", "tricloroetile_effl")
        return value
    },

    async reporting_metrics(industry, global_layers){
        let _this = this
        let withdrawn_factor_value = await withdrawn_factor(industry, global_layers)
        return {
            "g4-en8": industry.volume_withdrawn,
            "g4-en9": withdrawn_factor_value,
            "g4-en10": _this.recycled_water_factor(industry),
            "g4-en22": water_discharged(industry),
            "wd": industry.water_withdrawn,
            "dis": water_discharged(industry),
            "con": industry.volume_used,
            "re": industry.onsite_wwtp != null ? industry.onsite_wwtp.wwt_vol_reused : 0
        }
    }

}

export {metrics, utils}

