

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

/*function analyse_stage(inputs, industry, industry_model, stepper_model, wwtp, wwtp_model, pollutant){
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

        if (typeof current_value === 'object' && current_value !== null) current_value = current_value[pollutant] //dict related with pollutants
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
}*/

function analyse_stage(inputs, level_of_certainty_obj, pollutant=null, print=false){
    if (level_of_certainty_obj == undefined || level_of_certainty_obj == null) return null
    return inputs.map(input => {
        let level_of_certainty = null
        if (pollutant == null){
            level_of_certainty = level_of_certainty_obj[input]
        }else{
            let obj = level_of_certainty_obj[input]
            if (obj!= null && typeof obj == 'object') level_of_certainty = obj[pollutant]
            else level_of_certainty = obj
        }


        if (level_of_certainty == 'user_data') return 1
        else if (level_of_certainty == 'modeled') return 2
        else if (level_of_certainty == 'estimated') return 3
        else if (level_of_certainty == 'no_data') return 4

    })
}


/*
Returns 1 if all the values has been entered by the user
Returns 2 if all values are set, but at least one is modeled
Returns 3 if all values are set, but at least one is modeled
Returns 4 if at least any value is not set (insufficient data)
 */
function category_of_inputs(industry, inputs, pollutant = null, print = false){


    let stages_evaluation = Object.keys(inputs).map(key => {
        let level_of_certainty_obj = undefined
        if (key=='offsite_wwtp'){
            if (industry.has_offsite_wwtp == 1){
                level_of_certainty_obj = industry[key]['level_of_certainty']
                return analyse_stage(inputs[key], level_of_certainty_obj, pollutant, print)
            }
            return null
        }if (key=='direct_discharge'){
            if (industry.has_direct_discharge == 1){
                level_of_certainty_obj = industry[key]['level_of_certainty']
                return analyse_stage(inputs[key], level_of_certainty_obj, pollutant)
            }
            return null
        }else if (key=='onsite_wwtp'){
            if (industry.has_onsite_wwtp == 1){
                level_of_certainty_obj = industry[key]['level_of_certainty']
                return analyse_stage(inputs[key], level_of_certainty_obj, pollutant, print)
            } else return null
        }else{
            level_of_certainty_obj = industry['level_of_certainty']   //Industry stage
            return analyse_stage(inputs[key], level_of_certainty_obj, pollutant)
        }

        //return analyse_stage(inputs[key], level_of_certainty_obj, pollutant)
    })
    if (print) console.log(Math.max(...stages_evaluation.flat().filter(x => x != null)))
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

    calculate_external_sources(){
        let industry = ['volume_external_sources']
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
    calculate_water_withdrawn(){
        return this.withdrawn_factor()
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
    //Does not include third-party
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
        let offsite_wwtp = ['wwt_vol_trea']
        let direct_discharge = []
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
    effl_concentration() {
        return merge_dicts([this.calculate_effluent_load(), this.calculate_water_discharged()])
    },
    water_filtered(){
        let industry = ['ind_pollutants_effl']
        let onsite_wwtp = ['wwt_vol_trea', 'wwt_vol_disc', 'wwt_pollutants_effl']
        let offsite_wwtp = ['wwt_vol_trea', 'wwt_vol_from_external', 'wwt_vol_disc', 'wwt_pollutants_effl', 'wwt_pollutants_infl_wwtp']
        let direct_discharge = ['dd_vol_disc', 'wwt_pollutants_effl']
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
    },
    calculate_influent_load(){
        let industry = ['ind_pollutants_infl', 'volume_withdrawn']
        let onsite_wwtp = []
        let offsite_wwtp = []
        let direct_discharge = []
        return {industry, onsite_wwtp, offsite_wwtp, direct_discharge}
    },

    wwt_KPI_GHG_elec(){
        let industry = []
        let onsite_wwtp = ["wwt_vol_trea", "wwt_nrg_cons", 'wwt_conv_kwh']
        let offsite_wwtp = onsite_wwtp
        let direct_discharge = []
        return {industry, onsite_wwtp, offsite_wwtp, direct_discharge}
    },

    wwt_KPI_GHG_fuel(){
        let industry = []
        let onsite_wwtp = ['wwt_vol_fuel', 'wwt_fuel_typ']
        let offsite_wwtp = onsite_wwtp
        let direct_discharge = []
        return {industry, onsite_wwtp, offsite_wwtp, direct_discharge}
    },

    wwt_KPI_GHG_dig_fuel(){
        let industry = []
        let onsite_wwtp = ['wwt_fuel_dig', 'wwt_dige_typ']
        let offsite_wwtp = onsite_wwtp
        let direct_discharge = []
        return {industry, onsite_wwtp, offsite_wwtp, direct_discharge}
    },

    wwt_KPI_GHG_biog(){
        return this.wwt_KPI_GHG_biog_leaked()
    },

    wwt_KPI_GHG_biog_flared(){
        let industry = []
        let onsite_wwtp = ['wwt_biog_fla']
        let offsite_wwtp = onsite_wwtp
        let direct_discharge = []
        return merge_dicts([
            {industry, onsite_wwtp, offsite_wwtp, direct_discharge},
            this.wwt_moles_biogas_produced()]
        )
    },

    wwt_KPI_GHG_biog_valorized(){
        let industry = []
        let onsite_wwtp = ['wwt_biog_val']
        let offsite_wwtp = onsite_wwtp
        let direct_discharge = []
        return merge_dicts([
            {industry, onsite_wwtp, offsite_wwtp, direct_discharge},
            this.wwt_moles_biogas_produced()]
        )
    },

    wwt_KPI_GHG_biog_leaked(){
        let industry = []
        let onsite_wwtp = ['wwt_ch4_biog', 'wwt_biog_lkd', ]
        let offsite_wwtp = onsite_wwtp
        let direct_discharge = []
        return merge_dicts([
            {industry, onsite_wwtp, offsite_wwtp, direct_discharge},
            this.wwt_moles_biogas_produced()]
        )
    },

    wwt_moles_biogas_produced(){
        let industry = []
        let onsite_wwtp = ['wwt_biog_pro']
        let offsite_wwtp = onsite_wwtp
        let direct_discharge = []
        return {industry, onsite_wwtp, offsite_wwtp, direct_discharge}
    },

    //Only for COD and TN
    wwt_KPI_GHG_disc(){
        let industry = []
        let onsite_wwtp = ['wwt_pollutants_effl', 'wwt_vol_disc', 'wwt_ch4_efac_dis']
        let offsite_wwtp = onsite_wwtp
        let direct_discharge = ['wwt_pollutants_effl', 'wwt_ch4_efac_dis', 'wwt_n2o_efac_dis']
        return {industry, onsite_wwtp, offsite_wwtp, direct_discharge}
    },

    //Only for COD and TN
    wwt_KPI_GHG_tre(){
        let industry = ["ind_pollutants_effl"]
        let onsite_wwtp = ['wwt_vol_trea', 'wwt_cod_slud', 'wwt_ch4_efac_tre', 'wwt_n2o_efac_tre']
        let offsite_wwtp = ['wwt_pollutants_infl_wwtp', 'wwt_vol_from_external','wwt_vol_trea', 'wwt_cod_slud', 'wwt_ch4_efac_tre', 'wwt_n2o_efac_tre']
        let direct_discharge = []
        return {industry, onsite_wwtp, offsite_wwtp, direct_discharge}
    },

    wwt_KPI_GHG_slu(){
        return merge_dicts([
            this.wwt_KPI_GHG_sludge_storage(),
            this.wwt_KPI_GHG_sludge_composting(),
            this.wwt_KPI_GHG_sludge_incineration(),
            this.wwt_KPI_GHG_sludge_land_application(),
            this.wwt_KPI_GHG_sludge_landfilling(),
            this.wwt_KPI_GHG_sludge_stockpilling(),
            this.wwt_KPI_GHG_sludge_transport()
            ])
    },

    wwt_KPI_GHG_sludge_storage(){
        let industry = []
        let onsite_wwtp = ['wwt_mass_slu_sto', 'wwt_slu_sto_TVS', 'wwt_slu_sto_f_CH4', 'wwt_slu_sto_EF']
        let offsite_wwtp = onsite_wwtp
        let direct_discharge = []
        return {industry, onsite_wwtp, offsite_wwtp, direct_discharge}
    },
    wwt_KPI_GHG_sludge_composting(){
        let industry = []
        let onsite_wwtp = ['wwt_mass_slu_comp', 'wwt_slu_comp_emis_treated_or_piles_covered', 'wwt_slu_comp_solids_content', 'wwt_slu_comp_TVS', 'wwt_slu_comp_N_cont', 'wwt_slu_comp_low_CN_EF', 'wwt_slu_comp_uncovered_pile_EF']
        let offsite_wwtp = onsite_wwtp
        let direct_discharge = []
        return {industry, onsite_wwtp, offsite_wwtp, direct_discharge}
    },
    wwt_KPI_GHG_sludge_incineration(){
        let industry = []
        let onsite_wwtp = ['wwt_mass_slu_inc', 'wwt_temp_inc', 'wwt_slu_inc_N_cont', 'wwt_slu_inc_SNCR', ]
        let offsite_wwtp = onsite_wwtp
        let direct_discharge = []
        return {industry, onsite_wwtp, offsite_wwtp, direct_discharge}
    },
    wwt_KPI_GHG_sludge_land_application(){
        let industry = []
        let onsite_wwtp = ['wwt_mass_slu_app', 'wwt_slu_la_solids_content', 'wwt_slu_la_TVS', 'wwt_slu_la_N_cont', 'wwt_slu_la_EF']
        let offsite_wwtp = onsite_wwtp
        let direct_discharge = []
        return {industry, onsite_wwtp, offsite_wwtp, direct_discharge}
    },
    wwt_KPI_GHG_sludge_landfilling(){
        let industry = []
        let onsite_wwtp = ['wwt_mass_slu_land', 'wwt_slu_lf_TVS', 'wwt_slu_lf_uncertainty', 'wwt_slu_lf_CH4_in_gas', 'wwt_slu_lf_DOCf', 'wwt_slu_lf_decomp_3yr', 'wwt_slu_lf_MCF', 'wwt_slu_lf_N_cont', 'wwt_slu_lf_low_CN_EF']
        let offsite_wwtp = onsite_wwtp
        let direct_discharge = []
        return {industry, onsite_wwtp, offsite_wwtp, direct_discharge}
    },
    wwt_KPI_GHG_sludge_stockpilling(){
        let industry = []
        let onsite_wwtp = ['wwt_mass_slu_stock', 'wwt_slu_sp_lifespan', ]
        let offsite_wwtp = onsite_wwtp
        let direct_discharge = []
        return {industry, onsite_wwtp, offsite_wwtp, direct_discharge}
    },
    wwt_KPI_GHG_sludge_transport(){
        let industry = []
        let onsite_wwtp = ['wwt_vol_tslu', 'wwt_trck_typ', ]
        let offsite_wwtp = onsite_wwtp
        let direct_discharge = []
        return {industry, onsite_wwtp, offsite_wwtp, direct_discharge}
    },
    wwt_KPI_GHG_reus_trck(){
        let industry = []
        let onsite_wwtp = ['wwt_reus_vol_trck', 'wwt_reus_trck_typ', ]
        let offsite_wwtp = onsite_wwtp
        let direct_discharge = []
        return {industry, onsite_wwtp, offsite_wwtp, direct_discharge}
    },

    wwt_KPI_GHG_deglossed(){
        return merge_dicts([
            this.wwt_KPI_GHG_elec(),
            this.wwt_KPI_GHG_fuel(),
            this.wwt_KPI_GHG_tre(),
            this.wwt_KPI_GHG_biog(),
            this.wwt_KPI_GHG_dig_fuel(),
            this.wwt_KPI_GHG_slu(),
            this.wwt_KPI_GHG_reus_trck(),
            this.wwt_KPI_GHG_disc()
        ])
    },
    energy_used(){
        let industry = []
        let onsite_wwtp = ['wwt_vol_trea', 'wwt_nrg_cons', ]
        let offsite_wwtp = ['wwt_vol_trea', 'wwt_vol_from_external', 'wwt_nrg_cons']
        let direct_discharge = []
        return merge_dicts([
            {industry, onsite_wwtp, offsite_wwtp, direct_discharge},
            this.calculate_water_treated()
        ])
    },






}


let industry_impact_legend_category = {

    delta_tu(industry, pollutant) {
        let inputs = inputs_required.effl_delta()
        return category_of_inputs(industry, inputs, pollutant)
    },
    delta_eqs(industry, pollutant) {
        let inputs = inputs_required.effl_delta()
        return category_of_inputs(industry, inputs, pollutant)
    },
    eutrophication(industry, pollutant) {
        let inputs = inputs_required.effl_concentration()
        return category_of_inputs(industry, inputs, pollutant)
    },
    ecotoxicity_potential_tu(industry, pollutant) {
        let inputs = inputs_required.effl_concentration()
        return category_of_inputs(industry, inputs, pollutant)
    },
    environmental_quality_standards(industry, pollutant) {
        let inputs = inputs_required.effl_concentration()
        return category_of_inputs(industry, inputs, pollutant)
    },
    wwtp_efficiency(industry, pollutant){
        let inputs = inputs_required.effl_efficiency()
        return category_of_inputs(industry, inputs, pollutant)
    },
    amount_water_influent_cleaned(industry, pollutant){
        let effluent_load_inputs = inputs_required.calculate_effluent_load()
        let influent_load_inputs = inputs_required.calculate_influent_load()

        return Math.max(
            category_of_inputs(industry, effluent_load_inputs, pollutant),
            category_of_inputs(industry, influent_load_inputs, pollutant)
        )
    },
    treated_water_factor(industry){
        let water_generated_inputs = inputs_required.calculate_water_generated()
        let water_treated_inputs = inputs_required.calculate_water_treated()
        return Math.max(
            category_of_inputs(industry, water_generated_inputs),
            category_of_inputs(industry, water_treated_inputs)
        )
    },
    pollutant_concentration(industry, pollutant){
        let inputs = inputs_required.effl_concentration()
        return category_of_inputs(industry, inputs, pollutant)
    },
    pollutant_delta(industry, pollutant){
        let inputs = inputs_required.effl_delta()
        return category_of_inputs(industry, inputs, pollutant)
    },
    dilution_factor(industry){
        return this.net_consumptive_use(industry)
    },
    //Consumption available ratio
    available_ratio(industry){
        return this.net_consumptive_use(industry)
    },
    recycled_water_factor(industry){
        let water_generated_inputs = inputs_required.calculate_water_generated()
        let water_recycled_inputs = inputs_required.calculate_water_recycled()
        return Math.max(
            category_of_inputs(industry, water_generated_inputs),
            category_of_inputs(industry, water_recycled_inputs)
        )
    },
    // Specific water consumption  (%)
    efficiency_factor(industry){
        let product_produced = inputs_required.calculate_product_produced()
        return Math.max(
            category_of_inputs(industry, product_produced),
            this.net_consumptive_use(industry)
        )
    },
    // Consumptive use
    net_consumptive_use(industry){
        let effluent_pollutant_load = inputs_required.calculate_effluent_load()
        let water_withdrawn = inputs_required.calculate_water_withdrawn()
        let water_discharged = inputs_required.calculate_water_discharged()
        let external_sources = inputs_required.calculate_external_sources()

        let pollutants = industry.pollutants_selected

        let level_certainty_pollutants = pollutants.map(pollutant => category_of_inputs(industry, effluent_pollutant_load, pollutant))

        return Math.max(
            ...level_certainty_pollutants,
            category_of_inputs(industry, water_withdrawn),
            category_of_inputs(industry, water_discharged),
            category_of_inputs(industry, external_sources)
        )
    },

    emissions_and_descriptions(industry) {
        let inputs = inputs_required.wwt_KPI_GHG_deglossed();
        return Math.max(
            category_of_inputs(industry, inputs, "COD"),
            category_of_inputs(industry, inputs, "TN")
        )
    },
    energy_use(industry) {
        let inputs = inputs_required.energy_used();
        return category_of_inputs(industry, inputs)
    },
    biogenic_emissions(industry){
        return Math.max(
            category_of_inputs(industry, this.wwt_KPI_GHG_biog_flared()),
            category_of_inputs(industry, this.wwt_KPI_GHG_biog_valorized())
        )
    },
    biogenic_flared(industry){
        let inputs = inputs_required.wwt_KPI_GHG_biog_flared();
        return category_of_inputs(industry, inputs)
    },
    biogenic_valorized(industry){
        let inputs = inputs_required.wwt_KPI_GHG_biog_valorized();
        return category_of_inputs(industry, inputs)
    },
    emissions_elec(industry){
        let inputs = inputs_required.wwt_KPI_GHG_elec();
        return category_of_inputs(industry, inputs)
    },
    emissions_fuel(industry) {
        let inputs = inputs_required.wwt_KPI_GHG_fuel();
        return category_of_inputs(industry, inputs)
    },
    emissions_tre(industry) {
        let inputs = inputs_required.wwt_KPI_GHG_tre();

        return Math.max(
            category_of_inputs(industry, inputs, "COD", true),
            category_of_inputs(industry, inputs, "TN", true)
        )
    },
    emissions_biog(industry) {
        let inputs = inputs_required.wwt_KPI_GHG_biog();
        return category_of_inputs(industry, inputs)
    },
    emissions_dig_fuel(industry) {
        let inputs = inputs_required.wwt_KPI_GHG_dig_fuel();
        return category_of_inputs(industry, inputs)
    },
    emissions_slu(industry) {
        let inputs = inputs_required.wwt_KPI_GHG_slu();
        return category_of_inputs(industry, inputs)
    },
    emissions_reus_trck(industry) {
        let inputs = inputs_required.wwt_KPI_GHG_reus_trck();
        return category_of_inputs(industry, inputs)
    },
    emissions_disc(industry) {
        let inputs = inputs_required.wwt_KPI_GHG_disc();
        return category_of_inputs(industry, inputs)
    },
    sludge_storage(industry) {
        let inputs = inputs_required.wwt_KPI_GHG_sludge_storage();
        return category_of_inputs(industry, inputs)
    },
    sludge_composting(industry) {
        let inputs = inputs_required.wwt_KPI_GHG_sludge_composting();
        return category_of_inputs(industry, inputs)
    },
    sludge_incineration(industry) {
        let inputs = inputs_required.wwt_KPI_GHG_sludge_incineration();
        return category_of_inputs(industry, inputs)
    },
    sludge_land_application(industry) {
        let inputs = inputs_required.wwt_KPI_GHG_sludge_land_application();
        return category_of_inputs(industry, inputs)
    },
    sludge_landfilling(industry) {
        let inputs = inputs_required.wwt_KPI_GHG_sludge_landfilling();
        return category_of_inputs(industry, inputs)
    },
    sludge_stockpilling(industry) {
        let inputs = inputs_required.wwt_KPI_GHG_sludge_stockpilling();
        return category_of_inputs(industry, inputs)
    },
    sludge_transport(industry) {
        let inputs = inputs_required.wwt_KPI_GHG_sludge_transport()
        return category_of_inputs(industry, inputs)
    },

    emissions_deglossed(industry){
        return this.emissions_and_descriptions(industry)
    },
    sludge_management(industry){
        return this.wwt_KPI_GHG_slu(industry)
    },
    groundwater_withdrawals_in_high_groundwater_decline(industry){
        let inputs = inputs_required.calculate_groundwater_water_withdrawn();
        return category_of_inputs(industry, inputs)
    },
    net_consumptive_use_percentage(industry){
        return this.net_consumptive_use(industry)
    }

}

export {industry_impact_legend_category}