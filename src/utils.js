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

    async dilution_factor(global_layers, industry){

        let flow_acc = global_layers["Flow accumulation"].layers.baseline.annual.layer

        let water_discharged = 0
        if(industry.has_onsite_wwtp) water_discharged += industry.onsite_wwtp.wwt_vol_disc
        if(industry.has_direct_discharge) water_discharged += industry.direct_discharge.wwt_vol_disc
        if(industry.has_offsite_wwtp) water_discharged += industry.offsite_wwtp.wwt_vol_disc

        if(water_discharged == 0) return NaN

        let flow_acc_value = await flow_acc.data_on_point(industry.location.lat, industry.location.lng)

        let dilution_factor = water_discharged/(water_discharged + flow_acc_value)
        console.log(dilution_factor)
        return dilution_factor

    },
    recycled_water_factor(industry){
        if(industry.has_onsite_wwtp && industry.volume_withdrawn > 0) {
            let recycled_water_factor = industry.onsite_wwtp.wwt_vol_reused / industry.volume_withdrawn
            console.log(recycled_water_factor)
            return recycled_water_factor
        }
        return NaN
    },

    async dbo_in_river(global_layers, industry){
        let pharmaceutical_pollution = global_layers["Surface Water Pharmaceutical Pollution"].layers.baseline.annual.layer
        let flow_acc = global_layers["Flow accumulation"].layers.baseline.annual.layer

        let dbo_concentration = await pharmaceutical_pollution.data_on_point(industry.location.lat, industry.location.lng)*100
        let flow_acc_value = await flow_acc.data_on_point(industry.location.lat, industry.location.lng)

        let load = dbo_concentration*flow_acc_value - industry.volume_withdrawn*dbo_concentration
        let water_discharged = 0

        if(industry.has_onsite_wwtp) {
            load += industry.onsite_wwtp.wwt_bod_effl_to_wb * 2.4
            water_discharged += industry.onsite_wwtp.wwt_vol_disc
        }
        if(industry.has_direct_discharge) {
            load += industry.direct_discharge.wwt_bod_effl_to_wb * 2.4
            water_discharged += industry.direct_discharge.wwt_vol_disc
        }
        if(industry.has_offsite_wwtp){
            water_discharged += industry.offsite_wwtp.wwt_vol_disc
            if(industry.offsite_wwtp_type == "Domestic") load += industry.offsite_wwtp.wwt_bod_effl_to_wb
            else load += industry.offsite_wwtp.wwt_bod_effl_to_wb * 2.4
        }
        let discharge = flow_acc_value - industry.volume_withdrawn + water_discharged
        let dbo = load/water_discharged
        if (discharge == 0) return NaN
        else{
            console.log(dbo)
            return dbo
        }

    },
}

export {metrics, utils, industry_statistics}

