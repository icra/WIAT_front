
import industry_estimations from "@/industry_estimation"



function merge_dicts(dicts){
    let industry = new Set()
    let onsite_wwtp = new Set()
    let offsite_wwtp = new Set()
    let direct_discharge = new Set()

    for(let dict of dicts){
        industry = new Set([ ...industry, ...dict.industry ])
        onsite_wwtp = new Set([ ...onsite_wwtp, ...dict.onsite_wwtp ])
        offsite_wwtp = new Set([ ...offsite_wwtp, ...dict.offsite_wwtp ])
        direct_discharge = new Set([ ...direct_discharge, ...dict.direct_discharge ])
    }
    return {
        industry: [...industry],
        onsite_wwtp: [...onsite_wwtp],
        offsite_wwtp: [...offsite_wwtp],
        direct_discharge: [...direct_discharge],
    }
}


/*
    stepper_model == 1 ---> industry stage
    stepper_model == 2 ---> onsite wwtp stage
    stepper_model == 3 ---> directly discharge stage
    stepper_model == 4 ---> external wwtp stage
 */
/*
For each input of inputs, says if value has been entered by the user (1), is an estimation of WIAT (2), or has not been set (3)
 */
function analyse_stage(inputs, industry, industry_model, stepper_model, wwtp, wwtp_model, pollutant){

    let stage = industry    //stepper_model == 1
    if (stepper_model == 2){
        stage = industry.onsite_wwtp
    }else if (stepper_model == 3){
        stage = industry.direct_discharge
    }else if (stepper_model == 4){
        stage = industry.offsite_wwtp
    }
    return inputs.map(input => {
        let estimation = industry_estimations.get_estimation(input, industry, industry_model, stepper_model, wwtp, wwtp_model, pollutant)
        let current_value = stage[input]

        if (typeof current_value === 'object' && current_value !== null) current_value = current_value[pollutant]
        console.log(input, estimation, current_value)

        if  (current_value == undefined) {
            return null
        }else if (estimation === current_value){
            return 2
        } else if (current_value !== 0){
            return 1
        } else {
            return 3
        }
    })
}

/*
Returns 1 if all the values has been entered by the user
Returns 2 if all values are set, but at least one is estimated
Returns 3 if at least any value is not set (or is 0)
 */
function category_of_inputs(industry, inputs, pollutant = null){
    let industry_model = industry
    let wwtp_model = industry.onsite_wwtp
    let wwtp = industry.onsite_wwtp


    let stages_evaluation = Object.keys(inputs).map(key => {
        let stepper_model = 1   //Industry stage

        if (key=='onsite_wwtp') stepper_model = 2
        else if (key=='offsite_wwtp') stepper_model = 3
        else if (key=='direct_discharge') stepper_model = 4

        if(stepper_model == 4){
            wwtp_model = industry.offsite_wwtp
            wwtp = industry.offsite_wwtp
        }

        return analyse_stage(inputs[key], industry, industry_model, stepper_model, wwtp, wwtp_model, pollutant)
    })
    return Math.max(...stages_evaluation.flat().filter(x => x != null))



}

let inputs_required = {
    calculate_effluent_load(){
        let industry = []
        let onsite_wwtp = ['wwt_pollutants_effl', 'wwt_vol_disc']
        let offsite_wwtp = ['wwt_pollutants_effl', 'wwt_vol_disc']
        let direct_discharge = ['wwt_pollutants_effl', 'dd_vol_disc']
        return {industry, onsite_wwtp, offsite_wwtp, direct_discharge}
    },
    calculate_water_discharged(){
        let industry = []
        let onsite_wwtp = ['wwt_vol_disc']
        let offsite_wwtp = ['wwt_vol_disc']
        let direct_discharge = ['dd_vol_disc']
        return {industry, onsite_wwtp, offsite_wwtp, direct_discharge}
    },
    withdrawn_factor(){
        let industry = ['volume_withdrawn', 'volume_withdrawn_groundwater']
        let onsite_wwtp = []
        let offsite_wwtp = []
        let direct_discharge = []
        return {industry, onsite_wwtp, offsite_wwtp, direct_discharge}
    },
    discharged_factor(){
        return this.calculate_water_discharged()
    },
    calculate_surface_water_withdrawn(){
        let industry = ['volume_withdrawn']
        let onsite_wwtp = []
        let offsite_wwtp = []
        let direct_discharge = []
        return {industry, onsite_wwtp, offsite_wwtp, direct_discharge}
    },
    calculate_groundwater_water_withdrawn(){
        let industry = ['volume_withdrawn_groundwater']
        let onsite_wwtp = []
        let offsite_wwtp = []
        let direct_discharge = []
        return {industry, onsite_wwtp, offsite_wwtp, direct_discharge}
    },
    calculate_water_withdrawn_in_water_stress(){
        return this.withdrawn_factor()
    },
    calculate_surface_water_withdrawn_in_water_stress(){
        return this.calculate_surface_water_withdrawn()
    },
    calculate_groundwater_water_withdrawn_in_water_stress(){
        return this.calculate_groundwater_water_withdrawn()
    },
    calculate_water_discharged_surface(){
        let industry = []
        let onsite_wwtp = ['wwt_vol_disc']
        let offsite_wwtp = []
        let direct_discharge = ['dd_vol_disc']
        return {industry, onsite_wwtp, offsite_wwtp, direct_discharge}
    },
    calculate_water_discharged_third_party(){
        let industry = []
        let onsite_wwtp = []
        let offsite_wwtp = []
        let direct_discharge = ['dd_vol_disc']
        return {industry, onsite_wwtp, offsite_wwtp, direct_discharge}
    },
    calculate_water_discharged_surface_in_water_stress(){
        return this.calculate_water_discharged_surface()
    },
    calculate_water_discharged_third_party_in_water_stress(){
        return this.calculate_water_discharged_third_party()
    },
    calculate_water_treated(){
        let industry = []
        let onsite_wwtp = ['wwt_vol_trea']
        let offsite_wwtp = []
        let direct_discharge = ['wwt_vol_trea']
        return {industry, onsite_wwtp, offsite_wwtp, direct_discharge}
    },
    calculate_water_recycled(){
        let industry = []
        let onsite_wwtp = ['wwt_vol_reused']
        let offsite_wwtp = []
        let direct_discharge = []
        return {industry, onsite_wwtp, offsite_wwtp, direct_discharge}
    },
    calculate_product_produced(){
        let industry = ['product_produced']
        let onsite_wwtp = []
        let offsite_wwtp = []
        let direct_discharge = []
        return {industry, onsite_wwtp, offsite_wwtp, direct_discharge}
    },
    effl_delta(){
        return merge_dicts([this.calculate_effluent_load(), this.calculate_water_discharged(), this.calculate_surface_water_withdrawn()])
    },
    water_filtered(){
        let industry = ['ind_pollutants_effl']
        let onsite_wwtp = ['wwt_vol_trea']
        let offsite_wwtp = ['wwt_vol_trea']
        let direct_discharge = ['dd_vol_disc']
        return {industry, onsite_wwtp, offsite_wwtp, direct_discharge}
    },
    effl_efficiency(){
        return merge_dicts([this.water_filtered(), this.calculate_pollutant_generated()])
    },
    calculate_water_generated(){
        let industry = ['volume_withdrawn']
        let onsite_wwtp = ['wwt_vol_trea']
        let offsite_wwtp = ['wwt_vol_trea']
        let direct_discharge = ['dd_vol_disc']
        return {industry, onsite_wwtp, offsite_wwtp, direct_discharge}
    },
    calculate_water_consumed(){
        let industry = ['volume_withdrawn', 'volume_withdrawn_groundwater']
        let onsite_wwtp = ['wwt_vol_disc']
        let offsite_wwtp = ['wwt_vol_disc']
        let direct_discharge = ['dd_vol_disc']
        return {industry, onsite_wwtp, offsite_wwtp, direct_discharge}
    },
    calculate_pollutant_generated(){
        let industry = ['ind_pollutants_effl']
        let onsite_wwtp = ['wwt_vol_trea']
        let offsite_wwtp = ['wwt_vol_trea']
        let direct_discharge = ['dd_vol_disc']
        return {industry, onsite_wwtp, offsite_wwtp, direct_discharge}

    }




}


let industry_impact_legend_category = {

    delta_tu(industry, pollutant) {
        let inputs = inputs_required.effl_delta()
        console.log(pollutant, category_of_inputs(industry, inputs, pollutant))

    }
}






export {industry_impact_legend_category}