import {industry_estimations} from "@/industry_estimation";
import {Direct_discharge, WWTP} from "@/ecam_backend";



function get_stage(industry, stepper_model){
    let stage = industry    //stepper_model == 1
    if (stepper_model == 2){
        stage = industry.onsite_wwtp
    }else if (stepper_model == 3){
        stage = industry.direct_discharge
    }else if (stepper_model == 4){
        stage = industry.offsite_wwtp
    }

    if (stage == undefined){
        if(stepper_model == 2 || stepper_model == 4) stage = new WWTP(stepper_model, industry, false)
        else stage = new Direct_discharge(industry, false)
    }

    return stage
}

function get_wwtp(industry, stepper_model){
    let wwtp = industry.onsite_wwtp
    if(stepper_model == 4){
        wwtp = industry.offsite_wwtp
    }
    return wwtp
}

let level_of_certainty = {

    keys_without_level_of_certainty: new Set(
        ['name', 'location', 'streamflow', 'water_stress', 'onsite_wwtp', 'has_onsite_wwtp', 'offsite_wwtp', 'has_offsite_wwtp',
            'direct_discharge', 'has_direct_discharge', 'pollutants_selected', 'level_of_certainty', 'industry_type', 'supply_chain',
            'wwt_treatment_type', 'wwt_fuel_typ', 'wwt_dige_typ', 'wwt_reus_trck_typ',
            'wwt_slu_comp_emis_treated_or_piles_covered', 'wwt_slu_inc_SNCR', 'wwt_trck_typ',
            'discharge_same_location_as_withdrawal'

        ]),

    keys_with_pollutant: new Set(['ind_pollutants_effl', 'ind_pollutants_infl',
        'wwt_pollutants_effl', "wwt_pollutants_infl_ind", "wwt_pollutants_infl_wwtp"]),

    /*
    return level of certainty obj based on stepper_model
        stepper_model == 1 ---> industry stage
        stepper_model == 2 ---> onsite wwtp stage
        stepper_model == 3 ---> directly discharge stage
        stepper_model == 4 ---> external wwtp stage

     If set_no_data, all values are set to 'no_data'
     */

    set_level_of_certainty(industry, stepper_model, set_no_data = false){

        let stage = get_stage(industry, stepper_model)
        let wwtp = get_wwtp(industry, stepper_model)

        let level_of_certainty = {}

        try{
            Object.keys(stage).forEach(input => {
                if (!this.keys_without_level_of_certainty.has(input)){
                    if(!this.keys_with_pollutant.has(input)){
                        if (set_no_data){
                            level_of_certainty[input] = 'no_data'
                        }else{
                            let estimation = industry_estimations.get_estimation(input, industry, industry, stepper_model, wwtp, wwtp, null, true)
                            if(stage[input] == 0 || stage[input] == null || stage[input] == '' ){
                                level_of_certainty[input] = 'no_data'
                            }else if (stage[input] == estimation){
                                level_of_certainty[input] = 'estimated'
                            }else{
                                level_of_certainty[input] = 'user_data'
                            }
                        }
                    }else{
                        level_of_certainty[input] = {}
                        for (let pollutant of industry['pollutants_selected']){
                            if (set_no_data){
                                level_of_certainty[input][pollutant] = 'no_data'
                            }else{
                                let estimation = industry_estimations.get_estimation(input, industry, industry, stepper_model, wwtp, wwtp, pollutant, true)
                                if(stage[input][pollutant] == 0 || stage[input][pollutant] == null || stage[input][pollutant] == ''){
                                    level_of_certainty[input][pollutant] = 'no_data'
                                }else if (stage[input][pollutant] == estimation){
                                    level_of_certainty[input][pollutant] = 'estimated'
                                }else{
                                    level_of_certainty[input][pollutant] = 'user_data'
                                }
                            }
                        }

                    }
                }
            })
        } catch (error){
            console.log(error, stepper_model)
        }


        if (stepper_model == 2){
            level_of_certainty['wwt_pollutants_infl_ind'] = JSON.parse(JSON.stringify(industry["level_of_certainty"]["ind_pollutants_effl"]))
        }else if (stepper_model == 3){
            level_of_certainty['wwt_pollutants_effl'] = JSON.parse(JSON.stringify(industry["level_of_certainty"]["ind_pollutants_effl"]))
        }else if (stepper_model == 4){
            level_of_certainty['wwt_pollutants_infl_ind'] = JSON.parse(JSON.stringify(industry["level_of_certainty"]["ind_pollutants_effl"]))
            if (industry.has_onsite_wwtp == 1){
                level_of_certainty['wwt_pollutants_infl_wwtp'] = JSON.parse(JSON.stringify(industry.onsite_wwtp["level_of_certainty"]["wwt_pollutants_effl"]))
                level_of_certainty['wwt_vol_from_external'] = 'user_data'
            } else{
                level_of_certainty['wwt_pollutants_infl_wwtp'] = null
                level_of_certainty['wwt_vol_from_external'] = 'user_data'
            }
        }

        return level_of_certainty
    },

    /*
    Modifies level of certainty obj based on stepper_model
        stepper_model == 1 ---> industry stage
        stepper_model == 2 ---> onsite wwtp stage
        stepper_model == 3 ---> directly discharge stage
        stepper_model == 4 ---> external wwtp stage
     */
    update_level_of_certainty(industry, stage, stepper_model, input, pollutant = null){


        let wwtp = get_wwtp(industry, stepper_model)
        let wwtp_model = stage
        if (stepper_model == 1){
            wwtp = get_wwtp(industry, stepper_model)
        }

        let estimation = industry_estimations.get_estimation(input, industry, industry, stepper_model, wwtp, wwtp_model, pollutant, true)

        if (!this.keys_without_level_of_certainty.has(input)){
            if(!this.keys_with_pollutant.has(input)){
                if(stage[input] == 0 || stage[input] == null || stage[input] == '' ){
                    stage.level_of_certainty[input] = 'no_data'
                }else if (stage[input] == estimation){
                    stage.level_of_certainty[input] = 'estimated'
                }else{
                    stage.level_of_certainty[input] = 'user_data'
                }
            }else{
                if(stage[input][pollutant] == 0 || stage[input][pollutant] == null || stage[input][pollutant] == '' ){
                    stage.level_of_certainty[input][pollutant] = 'no_data'
                }else if (stage[input][pollutant] == estimation){
                    stage.level_of_certainty[input][pollutant] = 'estimated'
                }else{
                    stage.level_of_certainty[input][pollutant] = 'user_data'
                }
            }
        }
    },




}

export {level_of_certainty}