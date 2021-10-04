let main = require("./main")


let utils = {
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

let industry_statistics = {
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

        return sources
    }

}

let metrics = {

    async dilution_factor(global_layers, industry, assessment_days){

        let flow_acc = global_layers["Flow accumulation"].layers.baseline.annual.layer

        let water_discharged = 0    // m3/day
        if(industry.has_onsite_wwtp) water_discharged += industry.onsite_wwtp.wwt_vol_disc  //m3/day
        if(industry.has_direct_discharge) water_discharged += industry.direct_discharge.wwt_vol_disc //m3/day
        if(industry.has_offsite_wwtp) water_discharged += industry.offsite_wwtp.wwt_vol_disc //m3/day

        if(water_discharged == 0) return NaN

        let flow_acc_value = await flow_acc.data_on_point(industry.location.lat, industry.location.lng)/365 //flow accumulation (m3/day)

        //let dilution_factor = water_discharged/(water_discharged + flow_acc_value)
        let dilution_factor = (water_discharged + flow_acc_value)/water_discharged

        if(water_discharged === 0) return NaN

        return dilution_factor

    },

    recycled_water_factor(industry){
        if(industry.has_onsite_wwtp && industry.volume_withdrawn > 0) {
            let recycled_water_factor = industry.onsite_wwtp.wwt_vol_reused / industry.volume_used
            return recycled_water_factor
        }
        return NaN
    },

    async dbo_in_river(global_layers, industry, assessment_days, future = false){
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

    },

    bod_effl(industry){
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
        return load  //g/day
    },

    tn_effl(industry){
        let load = 0
        if(industry.has_onsite_wwtp) {
            load += industry.onsite_wwtp.wwt_tn_effl_to_wb * industry.onsite_wwtp.wwt_vol_disc // g/day
        }
        if(industry.has_direct_discharge) {
            load += industry.direct_discharge.wwt_tn_effl_to_wb  *  industry.direct_discharge.wwt_vol_disc  // g/day
        }
        if(industry.has_offsite_wwtp){
            load += industry.offsite_wwtp.wwt_tn_effl_to_wb * industry.offsite_wwtp.wwt_vol_disc  // g/day
        }
        return load //g/day
    }


    /*
  Functions for calling data from other components
*/

    /*water_quality_indicators(){
        return [

            {type: "COD load at the effluent of the WWTP", value: this.wwt_bod_effl_to_wb, unit: "kg"},
            {type: "Total Nitrogen load in the effluent", value: this.wwt_tn_effl_to_wb, unit: "kg"},

        ]
    }*/
}

export {metrics, utils, industry_statistics}

