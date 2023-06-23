

//Effluent concentration of WWTP after receiving water from other WWTP (if any) and water from industry (if any) and applying treatment

import {Tables} from "@/ecam_backend";
import {utils} from "@/utils";
const Countries = require("@/countries");

//Effluent concentration of WWTP after receiving water from other WWTP (if any) and water from industry (if any) and applying treatment
function concentration_effluent_load(wwtp, wwtp_model, pollutant_ind, pollutant_wwtp, pollutant_table){
    let influent_load = wwtp_model.wwt_vol_trea*wwtp["wwt_pollutants_infl_ind"][pollutant_ind] + wwtp.wwt_vol_from_external*wwtp["wwt_pollutants_infl_wwtp"][pollutant_wwtp]
    let flowstream = Number(wwtp_model.wwt_vol_trea) + wwtp.wwt_vol_from_external

    let loadEffl = Tables["WW treatment organics removal fractions (centralised) (Table 6.6B and 6.10C)"][wwtp_model.wwt_treatment_type][pollutant_table]*influent_load/flowstream


    return Number(loadEffl)
}


export let industry_estimations = {
    get_estimation(estimation, industry, industry_model, stepper_model, wwtp, wwtp_model, pollutant, get_result_of_toggle = false){

        let all_toggle_estimations_or_current = function(table_name, option_name, option_value, multiplier = 1){
            //If current value matches with estimation, return estimation
            if(get_result_of_toggle){
                let current_value = wwtp_model[estimation]
                let estimations = new Set(Tables[table_name].map(option => multiplier*option[option_value]))
                if (estimations.has(current_value)){
                    return current_value
                }
                else return null
            }

            //Return possible estimations
            return Tables[table_name].map(option => {
                return {
                    name: option[option_name],
                    value: multiplier*option[option_value]
                }
            })

        }

        if(stepper_model == 1) industry = industry_model

        let industry_estimations = {

            wwt_vol_disc: function(){
                if(stepper_model == 2){
                    return wwtp_model.wwt_vol_trea - wwtp_model.wwt_vol_reused - wwtp_model.wwt_vol_treated_external
                }else if(stepper_model == 3){
                    return null
                }else if(stepper_model == 4){
                    if (wwtp_model.wwt_vol_trea == null) return wwtp.wwt_vol_from_external
                    else return parseFloat(wwtp_model.wwt_vol_trea) + wwtp.wwt_vol_from_external
                }
            },
            wwt_vol_reused: function(){
                if(stepper_model == 2){
                    return wwtp_model.wwt_vol_trea - wwtp_model.wwt_vol_disc - wwtp_model.wwt_vol_treated_external
                }
                return null
            },
            wwt_vol_treated_external: function(){
                if(stepper_model == 2){
                    return wwtp_model.wwt_vol_trea - wwtp_model.wwt_vol_disc - wwtp_model.wwt_vol_reused
                }
                return null
            },
            ind_pollutants_infl: function(){
                if (pollutant == "COD"){
                    let bod = utils.get_raster_data("bod", industry.location.lat, industry.location.lng)
                    return bod
                }else if(pollutant == "TN"){
                    let nitrates = utils.get_raster_data("nitrates", industry.location.lat, industry.location.lng)
                    return nitrates

                }else return null
            },

            ind_pollutants_effl: function(){

                if (pollutant == "COD"){
                    if(industry.industry_type === 1){
                        return 336.2591324200910/2.4
                    }else if(industry.industry_type === 2){
                        return 231.09062980030700/2.4
                    }else if(industry.industry_type === 4){
                        return 410.09920634920627/2.4
                    }else if(industry.industry_type === 5){
                        return 40/2.4
                    }else if(industry.industry_type === 6){
                        return null
                    }else if(industry.industry_type === 7){
                        return 33.333333333333336/2.4
                    }else if(industry.industry_type === 8){
                        return 366.27272727272725/2.4
                    }else if(industry.industry_type === 9){
                        return 750/2.4
                    }else if(industry.industry_type === 10){
                        return 300/2.4
                    }else if(industry.industry_type === 11){
                        return 598.8096590909091/2.4
                    }else if(industry.industry_type === 12){
                        return 559.8717948717948/2.4
                    }else if(industry.industry_type === 13){
                        return 603.1034482758621/2.4
                    }else if(industry.industry_type === 14){
                        return 59.03846153846154/2.4
                    }else if(industry.industry_type === 15){
                        return 586.5384615384615/2.4
                    }else if(industry.industry_type === 16){
                        return 641.4117647058823/2.4
                    }else if(industry.industry_type === 17){
                        return 33.333333333333336/2.4
                    }else if(industry.industry_type === 18){
                        return 86.66666666666667/2.4
                    }else if(industry.industry_type === 19){
                        return 328.75/2.4
                    }else if(industry.industry_type === 20){
                        return 563.1578947368421/2.4
                    }else if(industry.industry_type === 21){
                        return null
                    }else if(industry.industry_type === 22){
                        return 35/2.4
                    }else if(industry.industry_type === 23){
                        return 35/2.4
                    }else if(industry.industry_type === 24){
                        return 40/2.4
                    }else return null

                }
                else if (pollutant == "TN"){
                    if(industry.industry_type === 1){
                        return 12.95454545
                    }else if(industry.industry_type === 2){
                        return  null
                    }else if(industry.industry_type === 4){
                        return  null
                    }else if(industry.industry_type === 5){
                        return  null
                    }else if(industry.industry_type === 6){
                        return null
                    }else if(industry.industry_type === 7){
                        return  null
                    }else if(industry.industry_type === 8){
                        return  null
                    }else if(industry.industry_type === 9){
                        return 90
                    }else if(industry.industry_type === 10){
                        return  null
                    }else if(industry.industry_type === 11){
                        return  null
                    }else if(industry.industry_type === 12){
                        return  null
                    }else if(industry.industry_type === 13){
                        return  null
                    }else if(industry.industry_type === 14){
                        return 18.4374
                    }else if(industry.industry_type === 15){
                        return  null
                    }else if(industry.industry_type === 16){
                        return 70
                    }else if(industry.industry_type === 17){
                        return  null
                    }else if(industry.industry_type === 18){
                        return  null
                    }else if(industry.industry_type === 19){
                        return  null
                    }else if(industry.industry_type === 20){
                        return  null
                    }else if(industry.industry_type === 21){
                        return null
                    }else if(industry.industry_type === 22){
                        return  null
                    }else if(industry.industry_type === 23){
                        return  null
                    }else if(industry.industry_type === 24){
                        return  null
                    }else return null

                }
                else if (pollutant == "TP"){
                    if(industry.industry_type === 1){
                        return 26.10771604938271
                    }else if(industry.industry_type === 2){
                        return  20.452873563218382
                    }else if(industry.industry_type === 4){
                        return  32.58536585365854
                    }else if(industry.industry_type === 5){
                        return  10
                    }else if(industry.industry_type === 6){
                        return null
                    }else if(industry.industry_type === 7){
                        return  10
                    }else if(industry.industry_type === 8){
                        return  27.528301886792452
                    }else if(industry.industry_type === 9){
                        return 40.19230769230769
                    }else if(industry.industry_type === 10){
                        return  30
                    }else if(industry.industry_type === 11){
                        return  39.810956790123456
                    }else if(industry.industry_type === 12){
                        return  35.96774193548387
                    }else if(industry.industry_type === 13){
                        return  35.0032786885246
                    }else if(industry.industry_type === 14){
                        return 11.279069767441861
                    }else if(industry.industry_type === 15){
                        return  10
                    }else if(industry.industry_type === 16){
                        return 40.870535714285715
                    }else if(industry.industry_type === 17){
                        return  10
                    }else if(industry.industry_type === 18){
                        return  25.714285714285715
                    }else if(industry.industry_type === 19){
                        return  32.857142857142854
                    }else if(industry.industry_type === 20){
                        return  39.25
                    }else if(industry.industry_type === 21){
                        return null
                    }else if(industry.industry_type === 22){
                        return  10
                    }else if(industry.industry_type === 23){
                        return  38.75
                    }else if(industry.industry_type === 24){
                        return  10
                    }else return null

                }
                else if (pollutant == "1,2-Dichloroethane"){
                    if(industry.industry_type === 1){
                        return null
                    }else if(industry.industry_type === 2){
                        return  null
                    }else if(industry.industry_type === 4){
                        return  null
                    }else if(industry.industry_type === 5){
                        return  null
                    }else if(industry.industry_type === 6){
                        return null
                    }else if(industry.industry_type === 7){
                        return  null
                    }else if(industry.industry_type === 8){
                        return  100*1e-3
                    }else if(industry.industry_type === 9){
                        return null
                    }else if(industry.industry_type === 10){
                        return  null
                    }else if(industry.industry_type === 11){
                        return  647.13333333333*1e-3
                    }else if(industry.industry_type === 12){
                        return  null
                    }else if(industry.industry_type === 13){
                        return  null
                    }else if(industry.industry_type === 14){
                        return null
                    }else if(industry.industry_type === 15){
                        return  null
                    }else if(industry.industry_type === 16){
                        return null
                    }else if(industry.industry_type === 17){
                        return  null
                    }else if(industry.industry_type === 18){
                        return  null
                    }else if(industry.industry_type === 19){
                        return  null
                    }else if(industry.industry_type === 20){
                        return  null
                    }else if(industry.industry_type === 21){
                        return null
                    }else if(industry.industry_type === 22){
                        return  null
                    }else if(industry.industry_type === 23){
                        return  null
                    }else if(industry.industry_type === 24){
                        return  null
                    }else return null

                }
                else if (pollutant == "Cadmium"){
                    if(industry.industry_type === 1){
                        return 0.32*1e-3
                    }else if(industry.industry_type === 2){
                        return 0.455*1e-3
                    }else if(industry.industry_type === 4){
                        return  null
                    }else if(industry.industry_type === 5){
                        return  null
                    }else if(industry.industry_type === 6){
                        return 0.8860526315789474*1e-3
                    }else if(industry.industry_type === 7){
                        return 0.9*1e-3
                    }else if(industry.industry_type === 8){
                        return 1.19*1e-3
                    }else if(industry.industry_type === 9){
                        return 0.6015384615384615*1e-3
                    }else if(industry.industry_type === 10){
                        return 0.33*1e-3
                    }else if(industry.industry_type === 11){
                        return 0.5816129032258064*1e-3
                    }else if(industry.industry_type === 12){
                        return 0.7260416666666667*1e-3
                    }else if(industry.industry_type === 13){
                        return  null
                    }else if(industry.industry_type === 14){
                        return 1.31*1e-3
                    }else if(industry.industry_type === 15){
                        return 21.673333333333332*1e-3
                    }else if(industry.industry_type === 16){
                        return null
                    }else if(industry.industry_type === 17){
                        return  null
                    }else if(industry.industry_type === 18){
                        return  null
                    }else if(industry.industry_type === 19){
                        return 10015*1e-3
                    }else if(industry.industry_type === 20){
                        return  null
                    }else if(industry.industry_type === 21){
                        return null
                    }else if(industry.industry_type === 22){
                        return  null
                    }else if(industry.industry_type === 23){
                        return  null
                    }else if(industry.industry_type === 24){
                        return  null
                    }else return null

                }
                else if (pollutant == "Hexachlorobenzene"){
                    if(industry.industry_type === 1){
                        return null
                    }else if(industry.industry_type === 2){
                        return  null
                    }else if(industry.industry_type === 4){
                        return  null
                    }else if(industry.industry_type === 5){
                        return  null
                    }else if(industry.industry_type === 6){
                        return null
                    }else if(industry.industry_type === 7){
                        return  null
                    }else if(industry.industry_type === 8){
                        return  null
                    }else if(industry.industry_type === 9){
                        return null
                    }else if(industry.industry_type === 10){
                        return  2*1e-3
                    }else if(industry.industry_type === 11){
                        return 0.009523809523809526*1e-3
                    }else if(industry.industry_type === 12){
                        return  null
                    }else if(industry.industry_type === 13){
                        return  null
                    }else if(industry.industry_type === 14){
                        return null
                    }else if(industry.industry_type === 15){
                        return  null
                    }else if(industry.industry_type === 16){
                        return null
                    }else if(industry.industry_type === 17){
                        return  null
                    }else if(industry.industry_type === 18){
                        return  null
                    }else if(industry.industry_type === 19){
                        return  null
                    }else if(industry.industry_type === 20){
                        return  null
                    }else if(industry.industry_type === 21){
                        return null
                    }else if(industry.industry_type === 22){
                        return  null
                    }else if(industry.industry_type === 23){
                        return  null
                    }else if(industry.industry_type === 24){
                        return  null
                    }else return null

                }
                else if (pollutant == "Mercury"){
                    if(industry.industry_type === 1){
                        return 95*1e-3
                    }else if(industry.industry_type === 2){
                        return  0.1281690140845069*1e-3
                    }else if(industry.industry_type === 4){
                        return  null
                    }else if(industry.industry_type === 5){
                        return  null
                    }else if(industry.industry_type === 6){
                        return 0.2044736842105263*1e-3
                    }else if(industry.industry_type === 7){
                        return 0.1636363636363636*1e-3
                    }else if(industry.industry_type === 8){
                        return 0.17*1e-3
                    }else if(industry.industry_type === 9){
                        return null
                    }else if(industry.industry_type === 10){
                        return 105*1e-3
                    }else if(industry.industry_type === 11){
                        return  0.19192982456140348*1e-3
                    }else if(industry.industry_type === 12){
                        return 0.2647916666666666*1e-3
                    }else if(industry.industry_type === 13){
                        return  null
                    }else if(industry.industry_type === 14){
                        return 33.48333333333333*1e-3
                    }else if(industry.industry_type === 15){
                        return 0.18000000000000002*1e-3
                    }else if(industry.industry_type === 16){
                        return null
                    }else if(industry.industry_type === 17){
                        return  null
                    }else if(industry.industry_type === 18){
                        return  null
                    }else if(industry.industry_type === 19){
                        return 85*1e-3
                    }else if(industry.industry_type === 20){
                        return  null
                    }else if(industry.industry_type === 21){
                        return null
                    }else if(industry.industry_type === 22){
                        return  null
                    }else if(industry.industry_type === 23){
                        return  null
                    }else if(industry.industry_type === 24){
                        return  null
                    }else return null

                }
                else if (pollutant == "Lead"){
                    if(industry.industry_type === 1){
                        return 1985*1e-3
                    }else if(industry.industry_type === 2){
                        return 12.361901408450692*1e-3
                    }else if(industry.industry_type === 4){
                        return  null
                    }else if(industry.industry_type === 5){
                        return  null
                    }else if(industry.industry_type === 6){
                        return 12.063947368421049*1e-3
                    }else if(industry.industry_type === 7){
                        return 11.763636363636364*1e-3
                    }else if(industry.industry_type === 8){
                        return 5.36*1e-3
                    }else if(industry.industry_type === 9){
                        return 3.3173076923076925*1e-3
                    }else if(industry.industry_type === 10){
                        return 1.22*1e-3
                    }else if(industry.industry_type === 11){
                        return 14.397151898734155*1e-3
                    }else if(industry.industry_type === 12){
                        return 3.4849999999999994*1e-3
                    }else if(industry.industry_type === 13){
                        return  null
                    }else if(industry.industry_type === 14){
                        return 339.66*1e-3
                    }else if(industry.industry_type === 15){
                        return 35.682500000000005*1e-3
                    }else if(industry.industry_type === 16){
                        return null
                    }else if(industry.industry_type === 17){
                        return  null
                    }else if(industry.industry_type === 18){
                        return  null
                    }else if(industry.industry_type === 19){
                        return 2212.8*1e-3
                    }else if(industry.industry_type === 20){
                        return  null
                    }else if(industry.industry_type === 21){
                        return null
                    }else if(industry.industry_type === 22){
                        return  null
                    }else if(industry.industry_type === 23){
                        return  null
                    }else if(industry.industry_type === 24){
                        return  null
                    }else return null

                }
                else if (pollutant == "Nickel"){
                    if(industry.industry_type === 1){
                        return 4395*1e-3
                    }else if(industry.industry_type === 2){
                        return 15.111126760563366*1e-3
                    }else if(industry.industry_type === 4){
                        return  null
                    }else if(industry.industry_type === 5){
                        return  null
                    }else if(industry.industry_type === 6){
                        return 24.955526315789474*1e-3
                    }else if(industry.industry_type === 7){
                        return 8.272727272727272*1e-3
                    }else if(industry.industry_type === 8){
                        return 7.55*1e-3
                    }else if(industry.industry_type === 9){
                        return 6.599230769230768*1e-3
                    }else if(industry.industry_type === 10){
                        return 8.87*1e-3
                    }else if(industry.industry_type === 11){
                        return 92.75778481012654*1e-3
                    }else if(industry.industry_type === 12){
                        return 4.578333333333334*1e-3
                    }else if(industry.industry_type === 13){
                        return  null
                    }else if(industry.industry_type === 14){
                        return 18.505000000000003*1e-3
                    }else if(industry.industry_type === 15){
                        return 619.9191666666667*1e-3
                    }else if(industry.industry_type === 16){
                        return 3854.1666666666642*1e-3
                    }else if(industry.industry_type === 17){
                        return null
                    }else if(industry.industry_type === 18){
                        return 2000*1e-3
                    }else if(industry.industry_type === 19){
                        return 20.14*1e-3
                    }else if(industry.industry_type === 20){
                        return  null
                    }else if(industry.industry_type === 21){
                        return null
                    }else if(industry.industry_type === 22){
                        return  null
                    }else if(industry.industry_type === 23){
                        return  null
                    }else if(industry.industry_type === 24){
                        return  null
                    }else return null

                }
                else if (pollutant == "Chloroalkanes"){
                    if(industry.industry_type === 1){
                        return null
                    }else if(industry.industry_type === 2){
                        return  null
                    }else if(industry.industry_type === 4){
                        return  null
                    }else if(industry.industry_type === 5){
                        return  null
                    }else if(industry.industry_type === 6){
                        return 3.3494736842105253*1e-3
                    }else if(industry.industry_type === 7){
                        return  null
                    }else if(industry.industry_type === 8){
                        return  null
                    }else if(industry.industry_type === 9){
                        return null
                    }else if(industry.industry_type === 10){
                        return  null
                    }else if(industry.industry_type === 11){
                        return  8.603859649122807*1e-3
                    }else if(industry.industry_type === 12){
                        return  null
                    }else if(industry.industry_type === 13){
                        return  null
                    }else if(industry.industry_type === 14){
                        return null
                    }else if(industry.industry_type === 15){
                        return  5.809166666666667*1e-3
                    }else if(industry.industry_type === 16){
                        return null
                    }else if(industry.industry_type === 17){
                        return  null
                    }else if(industry.industry_type === 18){
                        return  null
                    }else if(industry.industry_type === 19){
                        return  5105*1e-3
                    }else if(industry.industry_type === 20){
                        return  null
                    }else if(industry.industry_type === 21){
                        return null
                    }else if(industry.industry_type === 22){
                        return  null
                    }else if(industry.industry_type === 23){
                        return  null
                    }else if(industry.industry_type === 24){
                        return  null
                    }else return null

                }
                else if (pollutant == "Hexachlorobutadiene"){
                    if(industry.industry_type === 1){
                        return null
                    }else if(industry.industry_type === 2){
                        return  null
                    }else if(industry.industry_type === 4){
                        return  null
                    }else if(industry.industry_type === 5){
                        return  null
                    }else if(industry.industry_type === 6){
                        return null
                    }else if(industry.industry_type === 7){
                        return  null
                    }else if(industry.industry_type === 8){
                        return  null
                    }else if(industry.industry_type === 9){
                        return null
                    }else if(industry.industry_type === 10){
                        return 2*1e-3
                    }else if(industry.industry_type === 11){
                        return 0.009523809523809526*1e-3
                    }else if(industry.industry_type === 12){
                        return  null
                    }else if(industry.industry_type === 13){
                        return  null
                    }else if(industry.industry_type === 14){
                        return null
                    }else if(industry.industry_type === 15){
                        return  null
                    }else if(industry.industry_type === 16){
                        return null
                    }else if(industry.industry_type === 17){
                        return  null
                    }else if(industry.industry_type === 18){
                        return  null
                    }else if(industry.industry_type === 19){
                        return  null
                    }else if(industry.industry_type === 20){
                        return  null
                    }else if(this.industry_type === 21){
                        return null
                    }else if(industry.industry_type === 22){
                        return  null
                    }else if(industry.industry_type === 23){
                        return  null
                    }else if(industry.industry_type === 24){
                        return  null
                    }else return null

                }
                else if (pollutant == "Nonylphenols"){
                    if(industry.industry_type === 1){
                        return 0.73*1e-3
                    }else if(industry.industry_type === 2){
                        return 1.2240140845070406*1e-3
                    }else if(industry.industry_type === 4){
                        return 654.5454545454545*1e-3
                    }else if(industry.industry_type === 5){
                        return  null
                    }else if(industry.industry_type === 6){
                        return 555*1e-3
                    }else if(industry.industry_type === 7){
                        return 1.6727272727272728*1e-3
                    }else if(industry.industry_type === 8){
                        return 441.50470588235294*1e-3
                    }else if(industry.industry_type === 9){
                        return 3.326153846153846*1e-3
                    }else if(industry.industry_type === 10){
                        return  null
                    }else if(industry.industry_type === 11){
                        return  56760.85671794876*1e-3
                    }else if(industry.industry_type === 12){
                        return 1.2556249999999995*1e-3
                    }else if(industry.industry_type === 13){
                        return 1000*1e-3
                    }else if(industry.industry_type === 14){
                        return 0.96*1e-3
                    }else if(industry.industry_type === 15){
                        return 1.0633333333333335*1e-3
                    }else if(industry.industry_type === 16){
                        return null
                    }else if(industry.industry_type === 17){
                        return  null
                    }else if(industry.industry_type === 18){
                        return  null
                    }else if(industry.industry_type === 19){
                        return  null
                    }else if(industry.industry_type === 20){
                        return  null
                    }else if(industry.industry_type === 21){
                        return null
                    }else if(industry.industry_type === 22){
                        return  null
                    }else if(industry.industry_type === 23){
                        return  null
                    }else if(industry.industry_type === 24){
                        return  null
                    }else return null

                }
                else if (pollutant == "Tetrachloroethene"){
                    if(industry.industry_type === 1){
                        return null
                    }else if(industry.industry_type === 2){
                        return  null
                    }else if(industry.industry_type === 4){
                        return  null
                    }else if(industry.industry_type === 5){
                        return  null
                    }else if(industry.industry_type === 6){
                        return 156.15947368421058*1e-3
                    }else if(industry.industry_type === 7){
                        return null
                    }else if(industry.industry_type === 8){
                        return  100*1e-3
                    }else if(industry.industry_type === 9){
                        return 0.49538461538461537*1e-3
                    }else if(industry.industry_type === 10){
                        return  95*1e-3
                    }else if(industry.industry_type === 11){
                        return  5.161904761904763*1e-3
                    }else if(industry.industry_type === 12){
                        return  0.1964583333333334*1e-3
                    }else if(industry.industry_type === 13){
                        return null
                    }else if(industry.industry_type === 14){
                        return null
                    }else if(industry.industry_type === 15){
                        return  0.2058333333333333*1e-3
                    }else if(industry.industry_type === 16){
                        return null
                    }else if(industry.industry_type === 17){
                        return  null
                    }else if(industry.industry_type === 18){
                        return  null
                    }else if(industry.industry_type === 19){
                        return  null
                    }else if(industry.industry_type === 20){
                        return  null
                    }else if(industry.industry_type === 21){
                        return null
                    }else if(industry.industry_type === 22){
                        return  null
                    }else if(industry.industry_type === 23){
                        return  null
                    }else if(industry.industry_type === 24){
                        return  null
                    }else return null

                }
                else if (pollutant == "Trichloroethylene"){
                    if(industry.industry_type === 1){
                        return 75*1e-3
                    }else if(industry.industry_type === 2){
                        return 0.10253521126760569*1e-3
                    }else if(industry.industry_type === 4){
                        return  null
                    }else if(industry.industry_type === 5){
                        return  null
                    }else if(industry.industry_type === 6){
                        return 0.6134210526315792*1e-3
                    }else if(industry.industry_type === 7){
                        return 0.1818181818181818*1e-3
                    }else if(industry.industry_type === 8){
                        return 100*1e-3
                    }else if(industry.industry_type === 9){
                        return 0.26538461538461533*1e-3
                    }else if(industry.industry_type === 10){
                        return null
                    }else if(industry.industry_type === 11){
                        return  0.6655072463768117*1e-3
                    }else if(industry.industry_type === 12){
                        return  0.1879166666666667*1e-3
                    }else if(industry.industry_type === 13){
                        return  null
                    }else if(industry.industry_type === 14){
                        return null
                    }else if(industry.industry_type === 15){
                        return  0.34*1e-3
                    }else if(industry.industry_type === 16){
                        return null
                    }else if(industry.industry_type === 17){
                        return  null
                    }else if(industry.industry_type === 18){
                        return  null
                    }else if(industry.industry_type === 19){
                        return  null
                    }else if(industry.industry_type === 20){
                        return  null
                    }else if(industry.industry_type === 21){
                        return null
                    }else if(industry.industry_type === 22){
                        return  null
                    }else if(industry.industry_type === 23){
                        return  null
                    }else if(industry.industry_type === 24){
                        return  null
                    }else return null

                }
            },
            wwt_pollutants_effl: function(){
                if (pollutant == "COD"){
                    return concentration_effluent_load(wwtp, wwtp_model, pollutant, pollutant, "cod_effl")
                }else if (pollutant == "TN"){
                    return concentration_effluent_load(wwtp, wwtp_model, pollutant, pollutant, "N_effl")
                }else if (pollutant == "TP"){
                    return concentration_effluent_load(wwtp, wwtp_model, pollutant, pollutant, "P_effl")
                } else if (pollutant == "1,2-Dichloroethane"){
                    return concentration_effluent_load(wwtp, wwtp_model, pollutant, pollutant, "diclo_effl")
                }else if (pollutant == "Cadmium"){
                    return concentration_effluent_load(wwtp, wwtp_model, pollutant, pollutant, "cadmium_effl")
                }else if (pollutant == "Hexachlorobenzene"){
                    return concentration_effluent_load(wwtp, wwtp_model, pollutant, pollutant, "hexaclorobenzene_effl")
                }else if (pollutant == "Mercury"){
                    return concentration_effluent_load(wwtp, wwtp_model, pollutant, pollutant, "mercury_effl")
                }else if (pollutant == "Lead"){
                    return concentration_effluent_load(wwtp, wwtp_model, pollutant, pollutant, "plomo_effl")
                }else if (pollutant == "Nickel"){
                    return concentration_effluent_load(wwtp, wwtp_model, pollutant, pollutant, "niquel_effl")
                }else if (pollutant == "Chloroalkanes"){
                    return concentration_effluent_load(wwtp, wwtp_model, pollutant, pollutant, "chloro_effl")
                }else if (pollutant == "Hexachlorobutadiene"){
                    return concentration_effluent_load(wwtp, wwtp_model, pollutant, pollutant, "hexaclorobutadie_effl")
                }else if (pollutant == "Nonylphenols"){
                    return concentration_effluent_load(wwtp, wwtp_model, pollutant, pollutant, "nonilfenols_effl")
                }else if (pollutant == "Tetrachloroethene"){
                    return concentration_effluent_load(wwtp, wwtp_model, pollutant, pollutant, "tetracloroetile_effl")
                }else if (pollutant == "Trichloroethylene"){
                    return concentration_effluent_load(wwtp, wwtp_model, pollutant, pollutant, "tricloroetile_effl")
                }else return null
            },
            wwt_conv_kwh: function(){
                let location = wwtp.location
                let lat = location.lat
                let lng = location.lng
                let code = utils.get_country_code_from_coordinates(lat, lng)
                if(code == null) return null

                //check if undefined
                if (Countries[code] === undefined) return null
                if (Countries[code].conv_kwh_co2 === undefined) return null

                return Countries[code].conv_kwh_co2
            },
            wwt_biog_pro: function(){
                let wwt_mass_slu    = wwtp_model.wwt_mass_slu;  //kg  | mass of combined sludge to digestion
                let VS_to_digestion = wwt_mass_slu    * 0.80; //kg  | VS to digestion: 80% of sludge mass
                let VS_destroyed    = VS_to_digestion * 0.60; //kg  | VS destroyed: 60% of VS
                let biogas_volume   = VS_destroyed    * 0.80; //Nm3 | biogas produced (volume)
                return biogas_volume;
            },
            wwt_biog_fla: function(){
                return 98
            },
            wwt_biog_val: function(){
                return 100-wwtp_model.wwt_biog_fla-wwtp_model.wwt_biog_lkd-wwtp_model.wwt_biog_sold;
            },
            wwt_biog_lkd: function(){
                return 2
            },
            wwt_biog_sold: function() {
                return 100-wwtp_model.wwt_biog_val-wwtp_model.wwt_biog_fla-wwtp_model.wwt_biog_lkd;
            },
            wwt_ch4_biog: function(){
                return 59
            },
            wwt_slu_comp_low_CN_EF: function(){
                return 0.015
            },
            wwt_slu_comp_uncovered_pile_EF: function(){
                return 0.025
            },
            wwt_slu_comp_seqst_rate: function(){
                return 0.25
            },
            wwt_temp_inc: function(){
                return 1023
            },
            wwt_slu_lf_uncertainty: function(){
                return 0.9
            },
            wwt_slu_lf_CH4_in_gas: function(){
                return 50
            },
            wwt_slu_lf_DOCf: function(){
                return 80
            },
            wwt_slu_lf_decomp_3yr: function(){
                return 69.9
            },
            wwt_slu_lf_low_CN_EF: function(){
                return 0.015
            },
            wwt_cod_slud: function(){
                return all_toggle_estimations_or_current("type_of_treatment_KREM", "name", "K_rem", wwtp_model.wwt_mass_slu)

            },
            wwt_ch4_efac_dis: function(){
                return all_toggle_estimations_or_current("type_of_water_body", "name", "ch4_efac")

            },
            wwt_ch4_efac_tre: function(){
                return all_toggle_estimations_or_current("type_of_treatment", "name", "ch4_efac")
            },
            wwt_n2o_efac_tre: function(){
                return all_toggle_estimations_or_current("N2O EF plants (Table 6.8A)", "name", "n2o_efac")


            },
            wwt_n2o_efac_dis: function(){
                return all_toggle_estimations_or_current("N2O EF effluent (Table 6.8A)", "name", "n2o_efac")

            },
            wwt_slu_sto_TVS: function(){
                return all_toggle_estimations_or_current("Type of sludge disposed", "name", "TVS")

            },
            wwt_slu_sto_f_CH4: function(){
                return all_toggle_estimations_or_current("Type of sludge disposed", "name", "f_ch4")
            },
            wwt_slu_comp_TVS: function(){
                return all_toggle_estimations_or_current("Type of sludge disposed", "name", "TVS")
            },
            wwt_slu_comp_N_cont: function(){
                return all_toggle_estimations_or_current("Type of sludge disposed", "name", "N_cont")
            },
            wwt_slu_inc_N_cont: function(){
                return all_toggle_estimations_or_current("Type of sludge disposed", "name", "N_cont")
            },
            wwt_slu_la_TVS: function(){
                return all_toggle_estimations_or_current("Type of sludge disposed", "name", "TVS")
            },
            wwt_slu_la_N_cont: function(){
                return all_toggle_estimations_or_current("Type of sludge disposed", "name", "N_cont")
            },
            wwt_slu_la_EF: function(){
                return all_toggle_estimations_or_current("Soil type", "name", "f_la")
            },
            wwt_slu_lf_TVS: function(){
                return all_toggle_estimations_or_current("Type of sludge disposed", "name", "TVS")
            },
            wwt_slu_lf_MCF: function(){
                return all_toggle_estimations_or_current("Type of landfill", "name", "MCF")
            },
            wwt_slu_lf_N_cont: function(){
                return all_toggle_estimations_or_current("Type of sludge disposed", "name", "N_cont")
            },
            wwt_slu_sto_EF: function(){
                let storage_time = wwtp_model.wwt_time_slu_sto
                if(storage_time < 5) return 0
                else if(storage_time < 20) return 3
                else return 5
            },
            wwt_temperature_discharge: function(){
                return industry.ind_temperature_withdrawn
            }



        }

        if (!industry_estimations.hasOwnProperty(estimation)) return null
        return industry_estimations[estimation]()

    }
}


export default {
    industry_estimations
}