

export let user_inputs = {

    //WWTP inputs
    "discharge_same_location_as_withdrawal":
        {question: "Is water withdrawn and discharged in the same watershed?", value: 0}, //YES OR NO

    //fuel engines
    "wwt_fuel_typ": {question: "Fuel type (engines)", value: 0}, //Option | type of fuel (see Tables)
    "wwt_vol_fuel": {question: "Volume of fuel consumed", value: 0, unit: "L/day"}, //L of fuel

    //Biogas produced from anaerobic digestion
    "wwt_biog_pro": {
        question: "Biogas produced (volume)",
        value: 0,
        unit: "Nm3/day",
        description_tooltip: "Biogas produced during the assessment period by the wastewater treatment plant managed by the undertaking",

    }, //Nm3 | total biogas produced

    "wwt_biog_fla": {
        question: "% of biogas produced that is flared",
        value: 98,
        unit: "%",
    },
    "wwt_biog_val": {
        question: "Biogas valorised as heat and/or electricity (% volume)",
        value: 0,
        unit: "%",
        description_tooltip: "Biogas valorized in the treatment plant to heat the digesters or the building and/or to run a Co-generator to generate heat and electricity"
    }, //% of biogas produced that is used for heat
    "wwt_biog_lkd": {
        question: "Biogas leaked to the atmosphere (% volume)",
        value: 2,
        unit: "%",
    }, //% of biogas produced that is leaked
    "wwt_biog_sold": {question: "Biogas sold (% volume)", value: 0, unit: "%"},
    "wwt_ch4_biog": {question: "Percentage of methane in the biogas (% volume)", value: 59, unit: "%"}, //% of CH4 in biogas (volume)
    "wwt_dige_typ": {
        question: "Fuel type (digester) for sludge",
        value: 0,
    }, //Option | type of fuel for digester
    "wwt_fuel_dig": {question: "Fuel consumed for the digester", value: 0, unit: "L/day"}, //L | volume of fuel used in the digester

    //fuel used in water reuse trucks
    "wwt_reus_trck_typ": {
        question: "Fuel type used in water reuse trucks",
        value: 0,
    }, //Option | type of fuel
    "wwt_reus_vol_trck": {question: "Volume of fuel consumed (trucks)", value: 0, unit: "L/day"}, //L | volume of fuel used


    //sludge storage
    "wwt_mass_slu_sto": {
        question: "Sludge stored (dry weight)",
        value: 0,
        unit: "kg",
        description_tooltip: "Amount of sludge that is stored prior to disposal (dry weight)"
    }, //kg of sludge stored
    "wwt_time_slu_sto": {
        question: "Storage time",
        value: 0,
        unit: "days",
        description_tooltip: "Time interval the sludge is stored for before being sent to disposal"
    }, //days
    "wwt_slu_sto_TVS": {
        question: "Total Volatile Solids (TVS) content of sludge stored (% of dry weight)",
        value: 0,
        unit: "%",
        description: "description"
    }, //%
    "wwt_slu_sto_f_CH4": {
        question: "CH4 potential factor",
        value: 0,
        unit: "%",
    }, //% for CH4 potential
    "wwt_slu_sto_EF": {
        question: "Emission factor due to storage (estimate with storage time)",
        value: 0,
        unit: "%"
    }, //%

    //sludge composting
    "wwt_mass_slu_comp": {
        question: "Sludge composted (dry weight)",
        value: 0,
        unit: "kg",
        description_tooltip: "Amount of sludge that is sent to composting (dry weight)"
    }, //kg of sludge composted
    "wwt_slu_comp_emis_treated_or_piles_covered": {
        question: "Are composting emissions treated and/or piles are covered",
        value: 0,
        type: "option",
    }, //yes/no
    "wwt_slu_comp_solids_content": {question: "Solids content of compost", value: 0, unit: "%"}, //%
    "wwt_slu_comp_TVS": {
        question: "Total Volatile Solids (TVS) content of sludge composted (% of dry weight)",
        value: 0,
        unit: "%",
    }, //%
    "wwt_slu_comp_N_cont": {
        question: "N content of sludge stored (% of dry weight)",
        value: 0,
        unit: "%",
    }, //%
    "wwt_slu_comp_low_CN_EF": {
        question: "N2O emission factor for low C:N ratio",
        value: 0.015,
        unit: "kgN2O-N/kgN",
        description_tooltip: "N2O emission factor for low C:N ratio (1.5% from Brown et al, 2008)"
    }, //kgN2O-N/kgN
    "wwt_slu_comp_uncovered_pile_EF": {
        question: "CH4 emission factor for uncovered pile (fractor of initial C in solids)",
        value: 0.025,
        unit: "kgCH4/kgC"
    }, //kgCH4/kgC
    "wwt_slu_comp_seqst_rate": {
        question: "CO2eq sequestration rate",
        value: 0.25,
        unit: "kgCO2eq/kgSludge",
        description_tooltip: "Estimated C02 equivalents sequestered per kg of sludge"
    }, //kgCO2eq/kgSludge

    //sludge incineration
    "wwt_mass_slu_inc": {question: "Sludge incinerated (dry weight)", value: 0, unit: "kg/day"}, //kg of sludge incinerated
    "wwt_temp_inc": {
        question: "Average highest temperature of combustion achieved in a Fluidized Bed incinerator",
        value: 1023,
        unit: "K",
        description_tooltip: "Incineration temperature"
    }, //K | temperature incineration
    "wwt_slu_inc_N_cont": {
        question: "N content of sludge incinerated (% of dry weight)",
        value: 0,
        unit: "%",
    }, //% of N
    "wwt_slu_inc_SNCR": {
        question: "Is 'SNCR air emissions technology with urea' used?",
        value: 0,
        type: "option",
    }, //boolean

    //sludge LA
    "wwt_mass_slu_app": {question: "Sludge sent to land application (dry weight)", value: 0, unit: "kg/day"}, //kg of sludge sent to LA
    "wwt_slu_la_solids_content": {
        question: "Solids content of sludge sent to land application",
        value: 0,
        unit: "%"
    }, //%
    "wwt_slu_la_TVS": {
        question: "Total Volatile Solids (TVS) content of sludge sent to land application",
        value: 0,
        unit: "%",
    }, //%
    "wwt_slu_la_N_cont": {
        question: "N content of sludge sent to land application (% of dry weight)",
        value: 0,
        unit: "%",
    }, //%
    "wwt_slu_la_EF": {
        question: "Amount of Nitrogen converted to N2O",
        value: 0,
        unit: "kgN2O-N/kgN",
    }, //kgN2O-N/kgN

    //sludge LF
    "wwt_mass_slu_land": {question: "Sludge sent to landfilling (dry weight)", value: 0, unit: "kg/day"}, //kg of sludge sent to LF
    "wwt_slu_lf_TVS": {
        question: "Total Volatile Solids (TVS) content of sludge sent to land application",
        value: 0,
        unit: "%",
    }, //%
    "wwt_slu_lf_uncertainty": {
        question: "Uncertainty factor (UNFCCC/CCNUC, 2008)",
        value: 0.9,
        description_tooltip: "Model uncertainty factor (default value:0.9, UNFCCC/CCNUC, 2008)"
    }, //adimensional
    "wwt_slu_lf_CH4_in_gas": {
        question: "CH4 in landfill gas",
        value: 50,
        unit: "%",
        description_tooltip: "CH4 in landfill gas (50% from Clean Development Mechanism, 2008)"
    }, //%
    "wwt_slu_lf_DOCf": {
        question: "Decomposable organic fraction of raw wastewater solids",
        value: 80,
        unit: "%",
        description_tooltip: "Decomposable organic fraction of raw wastewater solids (80% from Brown et al., 2008 and Metcalf & Eddy, 2003)"
    }, //%
    "wwt_slu_lf_decomp_3yr": {
        question: "Percentage decomposed in first 3 years",
        value: 69.9,
        unit: "%",
        description_tooltip: "Percentage decomposed in first 3 years of the decomposable organic fraction of raw wastewater solids"
    }, //%
    "wwt_slu_lf_MCF": {
        question: "Methane correction for anaerobic managed landfills (default=1)",
        value: 1,
        unit: "ratio",
        description_tooltip: "Methane correction for anaerobic managed landfills (default=1, UNFCCC/CCNUCC, 2008)"
    }, //ratio
    "wwt_slu_lf_N_cont": {
        question: "N content of sludge sent to land application (% of dry weight)",
        value: 0,
        unit: "%"
    }, //N content
    "wwt_slu_lf_low_CN_EF": {
        question: "N2O emission factor for low C:N ratio",
        value: 0.015,
        unit: "kgN2O-N/kgN",
        description_tooltip: "N2O emission factor for low C:N ratio (1.5% from Brown et al, 2008)"
    }, //kgN2O-N/kgN


    //sludge stockpiling
    "wwt_mass_slu_stock": {question: "Sludge stockpiled (dry weight)", value: 0, unit: "kg/day"}, //kg of sludge stockpiled
    "wwt_slu_sp_lifespan": {
        question: "Stockpile lifespan",
        value: 0,
        unit: "years",
        description_tooltip: "Expected timespan that the biosolid stockpile (BSP) will be emitting GHGs"
    }, //years

    //sludge truck transport
    "wwt_trck_typ": {
        question: "Fuel type (trucks) used for transportation of sludge",
        value: 0,
    }, //Option | fuel type
    "wwt_vol_tslu": {question: "Volume of fuel consumed (trucks)", value: 0, unit: "L/day"}, //L | volume of fuel

    "wwt_treatment_type" :{question:"Type of wastewater treatment", value: 0}, //Option | type of treatment (see Tables)

    "wwt_vol_trea": {question: "Volume of water treated in the WWTP every day", value: 0, unit: "m3/day", description_tooltip: "The quantity entered here is the portion of the Industry Wastewater Generation that is treated in the WWTP"}, //m3 | volume of water treated

    "wwt_vol_disc" :{question:"Volume of water discharged to water body every day", value: 0, unit: "m3/day"},
    "dd_vol_disc" :{question:"Volume of water discharged to water body every day (direct discharge of untreated water)", value: 0, unit: "m3/day"},

    "wwt_pollutants_effl": {value: 0, unit: "g/m3", description_tooltip: 'Select "Estimated" level of certainty if the non-detect value is used'},

    //energy
    "wwt_nrg_cons": {question: "Electricity consumed from the grid for wastewater treatment per cubic meter treated", value: 0, unit: "kWh/m3"},  //kWh | energy consumed from the grid
    "wwt_conv_kwh": {question: "Emission factor for grid electricity", value: 0, unit: "kgCO2eq/kWh", description_tooltip: "Emission factor for grid electricity (indirect emissions)"},  //kgCO2eq/kWh | conversion factor

    //SLUDGE MANAGEMENT
    "wwt_mass_slu": {
        question: "Sludge removed from wastewater treatment (dry weight) every day",
        value: 0,
        unit: "kg/day",
        description_tooltip: "Amount of raw sludge removed from wastewater treatment as dry mass every day"
    },  //kg | raw sludge removed from wwtp as dry mass
    "wwt_cod_slud": {
        question: "COD removed as sludge every day",
        value: 0,
        unit: "kg/day",
        description_tooltip: "COD (organic component) removed from wastewater (in the form of sludge) in aerobic treatment plant",
    },  //kg | COD removed as sludge    //Taula 6.6A

    //emission factors (treatment)
    "wwt_ch4_efac_tre": {
        question: "CH4 emission factor (treatment)",
        value: 0,
        unit: "kgCH4/kgCOD",
        description_tooltip: "Methane emission factor of selected biological wastewater aerobic treatment processes"

    },  //kgCH4/kgCOD  S'obté de la taula 6.3

    "wwt_n2o_efac_tre": {
        question: "N2O emission factor (treatment)",
        value: 0,
        unit: "kgN2O-N/kgN",
    },  //kgN2O-N/kgN     Taula 6.8A

    //emission factors (discharge)
    "wwt_ch4_efac_dis": {
        question: "CH4 emission factor (discharge)",
        value: 0,
        unit: "kgCH4/kgCOD",
    },  //kgCH4/kgCOD   Table 6.8

    "wwt_n2o_efac_dis": {
        question: "N2O emission factor (discharge)",
        value: 0,
        unit: "kgN2O-N/kgN",
    },  //kgN2O-N/kgN  //tAULA 6.8A

    "wwt_vol_reused": {question: "Volume of water reused/recycled on the WWTP every day", value: 0, unit: "m3/day"},
    "wwt_vol_treated_external": {question: "Volume of water from the WWTP also treated in an off-site WWTP every day", value: 0, unit: "m3/day"},

    "wwt_temperature_discharge": {question: "Temperature of the discharged water", value: 0, unit: "°C"},
    "ind_temperature_withdrawn": {question: "Temperature of water withdrawn from the receiving water body", value: 0, unit: "°C"},

    //INDUSTRY INPUTS
    "volume_withdrawn": {question: "Industry withdrawal water quantity (surface water only)", value: 0, unit: "m3/day", description_tooltip:"The quantity entered here is the quantity withdrawn from the river (raw water intake)"},
    "volume_withdrawn_groundwater": {question: "Industry withdrawal water quantity (groundwater only)", value: 0, unit: "m3/day"},
    "volume_external_same_watershed_sources": {question: "All other external sources of water from the same watershed from which the water was withdrawn", value: 0, unit: "m3/day", description_tooltip: "The quantity entered here is the quantity of water withdrawn from other sources (e.g. recycled water from a third party, drinking water purchased from the municipality, etc.) from the same watershed from which the water was withdrawn"},
    "volume_external_different_sources": {question: "All other external sources of water from different watersheds from where the water was withdrawn", value: 0, unit: "m3/day", description_tooltip: "The quantity entered here is the quantity of water withdrawn from other sources (e.g. recycled water from a third party, drinking water purchased from the municipality, etc.) from different watersheds from where the water was withdrawn"},

    "has_onsite_wwtp": {question: "Has the industry an on-site wastewater pre-treatment or treatment plant?", value: false,},
    "has_direct_discharge": {question: "Does the industry directly discharge wastewater effluent (without treatment) into the water body?", value: false, description_tooltip: "Untreated water"},
    "has_offsite_wwtp": {question: "Does the industry discharge to an off-site treatment wastewater plant?", value: false,},
    "offsite_wwtp_type": {question: "Off-site treatment wastewater plant type", value: null,},
    "industry_type": {question: "Standard industrial classification", value: null,},
    "product_produced_unit": {question: 'Specify a unit for calculating "Specific water consumption" metric (e.g. $)', value: 0, description_tooltip: '"Specific water consumption" indicates the amount of water used per what is produced. For example, if the industry produces 1000 products per day, and the water consumption is 1000 m3/day, the specific water consumption is 1 m3/unit of product produced. The unit of product produced can be anything, e.g. $, kg, m3, etc.'},
    "product_produced": {question: "Based on your units above, specify the amount per day", value: 0, unit: "units/day", description_tooltip: "The quantity entered here is the amount of units per day. Used on the denominator of the specific water consumption calculation"},

    "ind_pollutants_effl": {value: 0, unit: "g/m3", description_tooltip: 'Select "Estimated" level of certainty if the non-detect value is used'},
    "ind_pollutants_infl": {value: 0, unit: "g/m3", description_tooltip: 'Select "Estimated" level of certainty if the non-detect value is used'},
}

//Inputs related to industry step
export let industry_inputs = ["volume_withdrawn", "volume_withdrawn_groundwater", "volume_external_same_watershed_sources", "volume_external_different_sources", "has_onsite_wwtp", "has_direct_discharge", "has_offsite_wwtp", "industry_type", "product_produced_unit", "product_produced", "pollutants_list", "ind_pollutants_effl", "ind_temperature_withdrawn", "ind_pollutants_infl"]

//Inputs related to onsite WWTP step (without external WWTP)
export let onsite_wwtp_no_offsite = ["wwt_treatment_type", "wwt_vol_trea", "wwt_vol_disc", "wwt_vol_reused", "discharge_same_location_as_withdrawal", "wwt_temperature_discharge", "wwt_pollutants_effl", "wwt_nrg_cons", "wwt_conv_kwh", "wwt_mass_slu", "wwt_cod_slud", "wwt_ch4_efac_tre", "wwt_n2o_efac_tre", "wwt_ch4_efac_dis", "wwt_n2o_efac_dis", "wwt_fuel_typ", "wwt_vol_fuel",
    "wwt_biog_pro", "wwt_biog_fla", "wwt_biog_val", "wwt_biog_lkd", "wwt_biog_sold", "wwt_ch4_biog", "wwt_dige_typ", "wwt_fuel_dig", "wwt_reus_trck_typ", "wwt_reus_vol_trck",
    "wwt_mass_slu_sto", "wwt_time_slu_sto", "wwt_slu_sto_TVS", "wwt_slu_sto_f_CH4", "wwt_slu_sto_EF", "wwt_mass_slu_comp", "wwt_slu_comp_emis_treated_or_piles_covered", "wwt_slu_comp_solids_content", "wwt_slu_comp_TVS", "wwt_slu_comp_N_cont", "wwt_slu_comp_low_CN_EF", "wwt_slu_comp_uncovered_pile_EF", "wwt_slu_comp_seqst_rate",
    "wwt_mass_slu_inc", "wwt_temp_inc", "wwt_slu_inc_N_cont", "wwt_slu_inc_SNCR", "wwt_mass_slu_app", "wwt_slu_la_solids_content", "wwt_slu_la_TVS", "wwt_slu_la_N_cont", "wwt_slu_la_EF",
    "wwt_mass_slu_land", "wwt_slu_lf_TVS", "wwt_slu_lf_uncertainty", "wwt_slu_lf_CH4_in_gas", "wwt_slu_lf_DOCf", "wwt_slu_lf_decomp_3yr", "wwt_slu_lf_MCF", "wwt_slu_lf_N_cont", "wwt_slu_lf_low_CN_EF", "wwt_mass_slu_stock", "wwt_slu_sp_lifespan", "wwt_trck_typ", "wwt_vol_tslu"]

//Inputs related to onsite WWTP step (with external WWTP)
export let onsite_wwtp_with_offsite_wwtp_inputs = ["wwt_treatment_type", "wwt_vol_trea", "wwt_vol_disc", "wwt_vol_reused", "wwt_vol_treated_external", "discharge_same_location_as_withdrawal", "wwt_temperature_discharge", "wwt_pollutants_effl", "wwt_nrg_cons", "wwt_conv_kwh", "wwt_mass_slu", "wwt_cod_slud", "wwt_ch4_efac_tre", "wwt_n2o_efac_tre", "wwt_ch4_efac_dis", "wwt_n2o_efac_dis", "wwt_fuel_typ", "wwt_vol_fuel",
    "wwt_biog_pro", "wwt_biog_fla", "wwt_biog_val", "wwt_biog_lkd", "wwt_biog_sold", "wwt_ch4_biog", "wwt_dige_typ", "wwt_fuel_dig", "wwt_reus_trck_typ", "wwt_reus_vol_trck",
    "wwt_mass_slu_sto", "wwt_time_slu_sto", "wwt_slu_sto_TVS", "wwt_slu_sto_f_CH4", "wwt_slu_sto_EF", "wwt_mass_slu_comp", "wwt_slu_comp_emis_treated_or_piles_covered", "wwt_slu_comp_solids_content", "wwt_slu_comp_TVS", "wwt_slu_comp_N_cont", "wwt_slu_comp_low_CN_EF", "wwt_slu_comp_uncovered_pile_EF", "wwt_slu_comp_seqst_rate",
    "wwt_mass_slu_inc", "wwt_temp_inc", "wwt_slu_inc_N_cont", "wwt_slu_inc_SNCR", "wwt_mass_slu_app", "wwt_slu_la_solids_content", "wwt_slu_la_TVS", "wwt_slu_la_N_cont", "wwt_slu_la_EF",
    "wwt_mass_slu_land", "wwt_slu_lf_TVS", "wwt_slu_lf_uncertainty", "wwt_slu_lf_CH4_in_gas", "wwt_slu_lf_DOCf", "wwt_slu_lf_decomp_3yr", "wwt_slu_lf_MCF", "wwt_slu_lf_N_cont", "wwt_slu_lf_low_CN_EF", "wwt_mass_slu_stock", "wwt_slu_sp_lifespan", "wwt_trck_typ", "wwt_vol_tslu"]

//Inputs related to the directly discharged water
export let direct_discharge_inputs = ["dd_vol_disc", "wwt_ch4_efac_dis", "wwt_n2o_efac_dis", "discharge_same_location_as_withdrawal", "wwt_temperature_discharge"]

//Inputs related to external WWTP
export let offsite_wwtp_inputs =  ["wwt_treatment_type", "wwt_vol_trea", "wwt_vol_disc", "discharge_same_location_as_withdrawal", "wwt_temperature_discharge", "wwt_pollutants_effl", "wwt_nrg_cons", "wwt_conv_kwh", "wwt_mass_slu", "wwt_cod_slud", "wwt_ch4_efac_tre", "wwt_n2o_efac_tre", "wwt_ch4_efac_dis", "wwt_n2o_efac_dis", "wwt_fuel_typ", "wwt_vol_fuel",
    "wwt_biog_pro", "wwt_biog_fla", "wwt_biog_val", "wwt_biog_lkd", "wwt_biog_sold", "wwt_ch4_biog", "wwt_dige_typ", "wwt_fuel_dig", "wwt_reus_trck_typ", "wwt_reus_vol_trck",
    "wwt_mass_slu_sto", "wwt_time_slu_sto", "wwt_slu_sto_TVS", "wwt_slu_sto_f_CH4", "wwt_slu_sto_EF", "wwt_mass_slu_comp", "wwt_slu_comp_emis_treated_or_piles_covered", "wwt_slu_comp_solids_content", "wwt_slu_comp_TVS", "wwt_slu_comp_N_cont", "wwt_slu_comp_low_CN_EF", "wwt_slu_comp_uncovered_pile_EF", "wwt_slu_comp_seqst_rate",
    "wwt_mass_slu_inc", "wwt_temp_inc", "wwt_slu_inc_N_cont", "wwt_slu_inc_SNCR", "wwt_mass_slu_app", "wwt_slu_la_solids_content", "wwt_slu_la_TVS", "wwt_slu_la_N_cont", "wwt_slu_la_EF",
    "wwt_mass_slu_land", "wwt_slu_lf_TVS", "wwt_slu_lf_uncertainty", "wwt_slu_lf_CH4_in_gas", "wwt_slu_lf_DOCf", "wwt_slu_lf_decomp_3yr", "wwt_slu_lf_MCF", "wwt_slu_lf_N_cont", "wwt_slu_lf_low_CN_EF", "wwt_mass_slu_stock", "wwt_slu_sp_lifespan", "wwt_trck_typ", "wwt_vol_tslu"]

export default {
    user_inputs,
    industry_inputs,
    onsite_wwtp_no_offsite,
    onsite_wwtp_with_offsite_wwtp_inputs,
    direct_discharge_inputs,
    offsite_wwtp_inputs

}