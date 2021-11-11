let main = require("./main")

//sum array of numbers
Array.prototype.sum=function(){return this.reduce((p,c)=>(p+c),0)};


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


async function effl_delta(industries, effl, global_layers){

    let load = industries.map(industry => {
        let _load = 0
        if(industry.has_onsite_wwtp) {
            _load += industry.onsite_wwtp[effl] * industry.onsite_wwtp.wwt_vol_disc // g/day
        }
        if(industry.has_direct_discharge) {
            _load += industry.direct_discharge[effl]  *  industry.direct_discharge.wwt_vol_disc  // g/day
        }
        if(industry.has_offsite_wwtp){
            _load += industry.offsite_wwtp[effl] * industry.offsite_wwtp.wwt_vol_disc  // g/day
        }
        return _load
    }).sum()

    let water_discharged = calculate_water_discharged(industries)
    let streamflow_value = await streamflow(industries, global_layers) //streamflow (m3/day)
    let water_withdrawn = industries.map(industry => industry.volume_withdrawn).sum()

    let delta = load / (streamflow_value + water_discharged - water_withdrawn)

    if(isNaN(delta)) return NaN
    return delta //g/m3
}

function calculate_water_discharged(industries){

    return industries.map(industry => {
        let water_discharged = 0
        if(industry.has_onsite_wwtp) water_discharged += industry.onsite_wwtp.wwt_vol_disc  //m3/day
        if(industry.has_direct_discharge) water_discharged += industry.direct_discharge.wwt_vol_disc //m3/day
        if(industry.has_offsite_wwtp) water_discharged += industry.offsite_wwtp.wwt_vol_disc //m3/day
        return water_discharged
    }).sum()
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

function effl_efficiency(industries, pollutant_effl, pollutant_infl){   //Amount of pollutant filtered
    let load = industries.map(industry => {
        let _load = 0
        if(industry.has_onsite_wwtp) {
            _load += industry.onsite_wwtp[pollutant_effl] * industry.onsite_wwtp.wwt_vol_disc // g/day
        }
        if(industry.has_direct_discharge) {
            _load += industry.direct_discharge[pollutant_effl]  *  industry.direct_discharge.wwt_vol_disc  // g/day
        }
        if(industry.has_offsite_wwtp){
            _load += industry.offsite_wwtp[pollutant_effl] * industry.offsite_wwtp.wwt_vol_disc  // g/day
        }
        return _load
    }).sum()

    let load_infl = industries.map(industry => {
        let treated = 0
        if(industry.has_onsite_wwtp) {
            treated += industry.onsite_wwtp.wwt_vol_trea
        }
        if(industry.has_direct_discharge) {
            treated += industry.direct_discharge.wwt_vol_disc
        }
        if(industry.has_offsite_wwtp){
            treated += industry.offsite_wwtp.wwt_vol_trea
        }
        return treated*industry[pollutant_infl]
    }).sum()

    let eff = 1 - (load / load_infl)

    if(isNaN(eff)) return NaN
    return eff*100
}

function effl_concentration(industries, pollutant_effl){
    let load = industries.map(industry => {
        let _load = 0
        if(industry.has_onsite_wwtp) {
            _load += industry.onsite_wwtp[pollutant_effl] * industry.onsite_wwtp.wwt_vol_disc // g/day
        }
        if(industry.has_direct_discharge) {
            _load += industry.direct_discharge[pollutant_effl]  *  industry.direct_discharge.wwt_vol_disc  // g/day
        }
        if(industry.has_offsite_wwtp){
            _load += industry.offsite_wwtp[pollutant_effl] * industry.offsite_wwtp.wwt_vol_disc  // g/day
        }
        return _load

    }).sum()

    let discharged = calculate_water_discharged(industries)

    return load/discharged
}

async function withdrawn_factor(industries, global_layers){

    let streamflow_value = await streamflow(industries, global_layers) //streamflow (m3/day)
    let factor = industries.map(industry => industry.volume_withdrawn).sum() / streamflow_value //Withdrawals that account for an average of five percent or more of the annual average significantly affects the water source
    if(isNaN(factor)) return NaN
    return factor
}

async function discharged_factor(industries, global_layers){

    let streamflow_value = await streamflow(industries, global_layers) //streamflow (m3/day)

    let wd = calculate_water_discharged(industries)

    let factor = wd / streamflow_value //Withdrawals that account for an average of five percent or more of the annual average significantly affects the water source
    if(isNaN(factor)) return NaN
    return factor
}

let metrics = {

    emissions_and_descriptions(industries){
        let sources = {
            "wwt_KPI_GHG_elec": 0,
            "wwt_KPI_GHG_fuel": 0,
            "wwt_KPI_GHG_tre": 0,
            "wwt_KPI_GHG_biog": 0,
            "wwt_KPI_GHG_slu": 0,
            "wwt_KPI_GHG_reus_trck":0,
            "wwt_KPI_GHG_disc": 0,
        }

        for (let industry of industries){
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
        }
        sources["supply_chain_emissions"] = industries.map(industry => industry.emissions_from_supply_chain().total).sum()

        return sources
    },

    global_warming_potential(industries){
        return Object.values(this.emissions_and_descriptions(industries)).sum()
    },

    async dilution_factor(global_layers, industries){

        let water_discharged = calculate_water_discharged(industries)    // m3/day

        if(water_discharged == 0) return NaN

        let streamflow_value = await streamflow(industries, global_layers) //streamflow (m3/day)

        //let dilution_factor = water_discharged/(water_discharged + flow_acc_value)
        let dilution_factor = (water_discharged + streamflow_value)/water_discharged

        return dilution_factor*100

    },

    async available_ratio(global_layers, industries){

        let streamflow_value = await streamflow(industries, global_layers) //streamflow (m3/day)
        let water_withdrawn = industries.map(industry => industry.volume_withdrawn).sum()


        let available_ratio = water_withdrawn / streamflow_value
        if (isNaN(available_ratio)) return NaN
        else return available_ratio*100

    },

    recycled_water_factor(industries){
        let water_withdrawn = industries.map(industry => industry.volume_withdrawn).sum()
        let recycled_water = industries.map(industry => {
            if(industry.has_onsite_wwtp) return industry.onsite_wwtp.wwt_vol_reused
            else return 0
        }).sum()

        if(water_withdrawn > 0) {
            let recycled_water_factor = recycled_water / water_withdrawn
            return recycled_water_factor*100
        }
        return NaN
    },

    treated_water_factor(industries){

        let water_discharged = calculate_water_discharged(industries)    // m3/day
        let water_treated = industries.map(industry => {
            let _water_treated = 0
            if(industry.has_onsite_wwtp) {
                _water_treated += industry.onsite_wwtp.wwt_vol_disc
            }  //m3/day
            if(industry.has_offsite_wwtp) {
                _water_treated += industry.offsite_wwtp.wwt_vol_disc
            }
            return _water_treated
        }).sum()//m3/day

        if (water_discharged == 0) return NaN
        else return 100*water_treated/water_discharged
    },

    efficiency_factor(industries){
        let product_produced = industries.map(industry => industry.product_produced).sum()
        let vol_used = industries.map(industry => industry.volume_used).sum()
        console.log(product_produced)
        console.log(vol_used)
        if (vol_used>0) return product_produced/vol_used
        return NaN
    },

    async bod_effl(industries, global_layers){
        let load = industries.map(industry => {
            let _load = 0
            if(industry.has_onsite_wwtp) {
                _load += industry.onsite_wwtp.wwt_bod_effl_to_wb * 2.4 * industry.onsite_wwtp.wwt_vol_disc // g/day
            }
            if(industry.has_direct_discharge) {
                _load += industry.direct_discharge.wwt_bod_effl_to_wb * 2.4 * industry.direct_discharge.wwt_vol_disc  // g/day
            }
            if(industry.has_offsite_wwtp){
                if(industry.offsite_wwtp_type == "Domestic") _load += industry.offsite_wwtp.wwt_bod_effl_to_wb * industry.offsite_wwtp.wwt_vol_disc  // g/day
                else _load += industry.offsite_wwtp.wwt_bod_effl_to_wb * 2.4 * industry.offsite_wwtp.wwt_vol_disc  // g/day
            }
            return _load
        }).sum()

        let water_discharged = calculate_water_discharged(industries)
        let streamflow_value = await streamflow(industries, global_layers)
        let water_withdrawn = industries.map(industry => industry.volume_withdrawn).sum()

        let delta = load / (streamflow_value + water_discharged - water_withdrawn)

        if(isNaN(delta)) return NaN
        return delta //g/m3
    },

    bod_efficiency(industries){
        let load = industries.map(industry => {
            let _load = 0
            if(industry.has_onsite_wwtp) {
                _load += industry.onsite_wwtp.wwt_bod_effl_to_wb * 2.4 * industry.onsite_wwtp.wwt_vol_disc // g/day
            }
            if(industry.has_direct_discharge) {
                _load += industry.direct_discharge.wwt_bod_effl_to_wb * 2.4 * industry.direct_discharge.wwt_vol_disc  // g/day
            }
            if(industry.has_offsite_wwtp){
                if(industry.offsite_wwtp_type == "Domestic") _load += industry.offsite_wwtp.wwt_bod_effl_to_wb * industry.offsite_wwtp.wwt_vol_disc  // g/day
                else _load += industry.offsite_wwtp.wwt_bod_effl_to_wb * 2.4 * industry.offsite_wwtp.wwt_vol_disc  // g/day
            }
            return _load
        }).sum()

        let bod_industry = industries.map(industry => {
            let water_treated = 0
            if(industry.has_onsite_wwtp) {
                water_treated += industry.onsite_wwtp.wwt_vol_trea
            }
            if(industry.has_direct_discharge) {
                water_treated += industry.direct_discharge.wwt_vol_disc
            }
            if(industry.has_offsite_wwtp){
                water_treated += industry.offsite_wwtp.wwt_vol_trea
            }
            return water_treated*industry.bod_effl_concentration*2.4
        }).sum()

        let eff = 1 - (load / bod_industry)
        if(isNaN(eff)) return NaN
        return eff*100
    },

    async tn_effl(industries, global_layers){
        let value = await effl_delta(industries, "wwt_tn_effl_to_wb", global_layers)
        return value
    },
    tn_efficiency(industries){
        let value = effl_efficiency(industries, "wwt_tn_effl_to_wb", "tn_effl_concentration")
        return value
    },

    async tp_effl(industries, global_layers){
        let value = await effl_delta(industries, "wwt_tp_effl_to_wb", global_layers)
        return value
    },
    tp_efficiency(industries){
        let value = effl_efficiency(industries, "wwt_tp_effl_to_wb", "tp_effl_concentration")
        return value
    },

    async dichloroethane_effl(industries, global_layers){
        let value = await effl_delta(industries, "wwt_diclo_effl_to_wb", global_layers)
        return value
    },
    dichloroethane_efficiency(industries){
        let value = effl_efficiency(industries, "wwt_diclo_effl_to_wb", "diclo_effl")
        return value
    },

    async cadmium_effl(industries, global_layers){
        let value = await effl_delta(industries, "wwt_cadmium_effl_to_wb", global_layers)
        return value
    },
    cadmium_efficiency(industries){
        let value = effl_efficiency(industries, "wwt_cadmium_effl_to_wb", "cadmium_effl")
        return value
    },

    async hexaclorobenzene_effl(industries, global_layers){
        let value = await effl_delta(industries, "wwt_hexaclorobenzene_effl_to_wb", global_layers)
        return value
    },
    hexaclorobenzene_efficiency(industries){
        let value = effl_efficiency(industries, "wwt_hexaclorobenzene_effl_to_wb", "hexaclorobenzene_effl")
        return value
    },

    async mercury_effl(industries, global_layers){
        let value = await effl_delta(industries, "wwt_mercury_effl_to_wb", global_layers)
        return value
    },
    mercury_efficiency(industries){
        let value = effl_efficiency(industries, "wwt_mercury_effl_to_wb", "mercury_effl")
        return value
    },

    async lead_effl(industries, global_layers){
        let value = await effl_delta(industries, "wwt_plomo_effl_to_wb", global_layers)
        return value
    },
    lead_efficiency(industries){
        let value = effl_efficiency(industries, "wwt_plomo_effl_to_wb", "plomo_effl")
        return value
    },

    async nickel_effl(industries, global_layers){
        let value = await effl_delta(industries, "wwt_niquel_effl_to_wb", global_layers)
        return value
    },
    nickel_efficiency(industries){
        let value = effl_efficiency(industries, "wwt_niquel_effl_to_wb", "niquel_effl")
        return value
    },

    async chloroalkanes_effl(industries, global_layers){
        let value = await effl_delta(industries, "wwt_chloro_effl_to_wb", global_layers)
        return value
    },
    chloroalkanes_efficiency(industries){
        let value = effl_efficiency(industries, "wwt_chloro_effl_to_wb", "chloro_effl")
        return value
    },

    async hexaclorobutadie_effl(industries, global_layers){
        let value = await effl_delta(industries, "wwt_hexaclorobutadie_effl_to_wb", global_layers)
        return value
    },
    hexaclorobutadie_efficiency(industries){
        let value = effl_efficiency(industries, "wwt_hexaclorobutadie_effl_to_wb", "hexaclorobutadie_effl")
        return value
    },

    async nonylphenols_effl(industries, global_layers){
        let value = await effl_delta(industries, "wwt_nonilfenols_effl_to_wb", global_layers)
        return value
    },
    nonylphenols_efficiency(industries){
        let value = effl_efficiency(industries, "wwt_nonilfenols_effl_to_wb", "nonilfenols_effl")
        return value
    },

    async tetrachloroethene_effl(industries, global_layers){
        let value = await effl_delta(industries, "wwt_tetracloroetile_effl_to_wb", global_layers)
        return value
    },
    tetrachloroethene_efficiency(industries){
        let value = effl_efficiency(industries, "wwt_tetracloroetile_effl_to_wb", "tetracloroetile_effl")
        return value
    },

    async tricloroetile_effl(industries, global_layers){
        let value = await effl_delta(industries, "wwt_tricloroetile_effl_to_wb", global_layers)
        return value
    },
    tricloroetile_efficiency(industries){
        let value = effl_efficiency(industries, "wwt_tricloroetile_effl_to_wb", "tricloroetile_effl")
        return value
    },

    async reporting_metrics(industries, global_layers){
        let _this = this
        let withdrawn_factor_value = await withdrawn_factor(industries, global_layers)
        let discharged_factor_value = await discharged_factor(industries, global_layers)

        return {
            "g4-en8": industries.map(industry => industry.volume_withdrawn).sum(),
            "g4-en9": withdrawn_factor_value,   //mes gran que 5% mal
            "g4-en10": _this.recycled_water_factor(industries),
            "g4-en22": calculate_water_discharged(industries),
            "g4_en26": discharged_factor_value,
            "wd": 0.001*industries.map(industry => industry.volume_withdrawn).sum(), //Water withdrawn
            "dis": 0.001*calculate_water_discharged(industries),  //water discharged
            "re": 0.001*industries.map(industry => {
                if (industry.onsite_wwtp != null) return industry.onsite_wwtp.wwt_vol_reused
                else return 0
            }).sum() //water reused

        }
    },

    ecotoxicity_potential_tu(industries){ //concentration of tu (tu/day)
        let toxic_units = {
            diclo: effl_concentration(industries, "wwt_diclo_effl_to_wb")/150,
            cadmium: effl_concentration(industries, "wwt_cadmium_effl_to_wb")/0.0095,
            hexaclorobenzene: effl_concentration(industries, "wwt_hexaclorobenzene_effl_to_wb")/0.03,
            mercury: effl_concentration(industries, "wwt_mercury_effl_to_wb")/0.0014,
            lead: effl_concentration(industries, "wwt_plomo_effl_to_wb")/0.44,
            nickel: effl_concentration(industries, "wwt_niquel_effl_to_wb")/1.41775,
            chloroalkanes: effl_concentration(industries, "wwt_chloro_effl_to_wb")/65,
            hexaclorobutadie: effl_concentration(industries, "wwt_hexaclorobutadie_effl_to_wb")/0.5,
            nonylphenols: effl_concentration(industries, "wwt_nonilfenols_effl_to_wb")/0.15,
            tetracloroetile: effl_concentration(industries, "wwt_tetracloroetile_effl_to_wb")/3.2,
            tricloroetile: effl_concentration(industries, "wwt_tricloroetile_effl_to_wb")/76,
        }
        let total_toxic_units = Object.values(toxic_units).sum()
        toxic_units["total"] = total_toxic_units
        return toxic_units
    },

    async delta_toxic_units(industries, global_layers){
        let total_tu = this.ecotoxicity_potential_tu(industries).total
        let water_discharged = calculate_water_discharged(industries)
        let streamflow_value = await streamflow(industries, global_layers) //streamflow (m3/day)
        let water_withdrawn = industries.map(industry => industry.volume_withdrawn).sum()
        let delta = total_tu/(streamflow_value - water_withdrawn + water_discharged)
        if(isNaN(delta)) return NaN
        return delta
    },

    nqa(industries){

        let pollutant_above_law_factor = industries.map(industry => {
            let nqa_per_pollutant = {
                diclo: effl_concentration([industry], "wwt_diclo_effl_to_wb")/0.01,
                cadmium: effl_concentration([industry], "wwt_cadmium_effl_to_wb")/0.001,
                hexaclorobenzene: effl_concentration([industry], "wwt_hexaclorobenzene_effl_to_wb")/0.0005,
                mercury: effl_concentration([industry], "wwt_mercury_effl_to_wb")/0.00007,
                lead: effl_concentration([industry], "wwt_plomo_effl_to_wb")/0.0072,
                nickel: effl_concentration([industry], "wwt_niquel_effl_to_wb")/0.02,
                chloroalkanes: effl_concentration([industry], "wwt_chloro_effl_to_wb")/0.0014,
                hexaclorobutadie: effl_concentration([industry], "wwt_hexaclorobutadie_effl_to_wb")/0.0006,
                nonylphenols: effl_concentration([industry], "wwt_nonilfenols_effl_to_wb")/0.002,
                tetracloroetile: effl_concentration([industry], "wwt_tetracloroetile_effl_to_wb")/0.01,
                tricloroetile: effl_concentration([industry], "wwt_tricloroetile_effl_to_wb")/0.01,
            }

            let pollutant_above_law = Object.values(nqa_per_pollutant).filter(p => {return p > 1}).length
            return pollutant_above_law
        }).sum()   //Number of pollutants which concentration is above the permission

        //Porcentage of pollutants which concentration is above the permission
        return 100*pollutant_above_law_factor/11
    },
    eutrophication_potential(industries){
        let cod_load = industries.map(industry => {
            let _cod_load = 0
            if(industry.has_onsite_wwtp) {
                _cod_load += industry.onsite_wwtp.wwt_bod_effl_to_wb * industry.onsite_wwtp.wwt_vol_disc // g/day
            }
            if(industry.has_direct_discharge) {
                _cod_load += industry.direct_discharge.wwt_bod_effl_to_wb * industry.direct_discharge.wwt_vol_disc  // g/day
            }
            if(industry.has_offsite_wwtp){
                if(industry.offsite_wwtp_type == "Domestic") _cod_load += industry.offsite_wwtp.wwt_bod_effl_to_wb * industry.offsite_wwtp.wwt_vol_disc / 2.4  // g/day
                else _cod_load += industry.offsite_wwtp.wwt_bod_effl_to_wb * industry.offsite_wwtp.wwt_vol_disc  // g/day
            }
            return _cod_load
        }).sum()

        let eutrophication = {
            cod: (cod_load / calculate_water_discharged(industries))*0.022,
            tn: effl_concentration(industries, "wwt_tn_effl_to_wb")*0.42,
            tp: effl_concentration(industries, "wwt_tp_effl_to_wb")*3.06,
        }

        let total_eutrophication = Object.values(eutrophication).sum()
        eutrophication["total"] = total_eutrophication

        return eutrophication

    }

}

export {metrics, utils}

