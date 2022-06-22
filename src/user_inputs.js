

export let user_inputs = {

    //WWTP inputs
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
        unit: "kg/L",
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
        question: "Total Volatile Solids (TVS) content of sludge sent to land application)",
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
        unit: "kgN2O-N/gN",
    }, //kgN2O-N/gN

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

    "wwt_vol_trea": {question: "Volume of water treated in the WWTP every day", value: 0, unit: "m3/day"},

    "wwt_vol_disc" :{question:"Volume of water discharged to water body every day", value: 0, unit: "m3/day"},
    "dd_vol_disc" :{question:"Volume of water discharged to water body every day (direct discharge of untreated water)", value: 0, unit: "m3/day"},

    "wwt_cod_effl": {
        question: "Concentration of COD in the WWTP effluent",
        value: 0,
        unit: "g/m3",
    }, //kgCOD   Table 6.6B and 6.10C


    "wwt_tn_effl": {
        question: "Concentration of Total Nitrogen in the WWTP effluent",
        value: 0,
        unit: "g/m3",
    },  //kgN   TAULA 6.10c

    "wwt_tp_effl": {
        question: "Concentration of Total Phosphorus in the WWTP effluent",
        value: 0,
        unit: "g/m3",
    },  //kgN   TAULA 6.10c

    //Priority pollutants
    "wwt_diclo_effl": {
        question: "Concentration of 1,2-Dichloroethane in the WWTP effluent",
        value: 0,
        unit: "g/m3",
    },

    "wwt_cadmium_effl": {
        question: "Concentration of cadmium in the WWTP effluent",
        value: 0,
        unit: "g/m3",
    },

    "wwt_hexaclorobenzene_effl": {
        question: "Concentration of hexachlorobenzene in the WWTP effluent",
        value: 0,
        unit: "g/m3",
    },

    "wwt_mercury_effl": {
        question: "Concentration of mercury in the WWTP effluent",
        value: 0,
        unit: "g/m3",
    },

    "wwt_plomo_effl": {
        question: "Concentration of lead in the WWTP effluent",
        value: 0,
        unit: "g/m3",
    },

    "wwt_niquel_effl": {
        question: "Concentration of nickel in the WWTP effluent",
        value: 0,
        unit: "g/m3",
    },

    "wwt_chloro_effl": {
        question: "Concentration of chloroalkanes in the WWTP effluent",
        value: 0,
        unit: "g/m3",
    },

    "wwt_hexaclorobutadie_effl": {
        question: "Concentration of hexachlorobutadiene in the WWTP effluent",
        value: 0,
        unit: "g/m3",
    },

    "wwt_nonilfenols_effl": {
        question: "Concentration of nonylphenols in the WWTP effluent",
        value: 0,
        unit: "g/m3",
    },

    "wwt_tetracloroetile_effl": {
        question: "Concentration of tetrachloroethene in the WWTP effluent",
        value: 0,
        unit: "g/m3",
    },

    "wwt_tricloroetile_effl": {
        question: "Concentration of trichloroethylene in the WWTP effluent",
        value: 0,
        unit: "g/m3",
    },

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

    //INDUSTRY INPUTS
    "volume_withdrawn": {question: "Industry withdrawal water quantity (surface water only)", value: 0, unit: "m3/day"},
    "volume_withdrawn_groundwater": {question: "Industry withdrawal water quantity (groundwater only)", value: 0, unit: "m3/day"},

    "has_onsite_wwtp": {question: "Has the industry an on-site wastewater pre-treatment or treatment plant?", value: false,},
    "has_direct_discharge": {question: "Does the industry directly discharge wastewater effluent (without treatment) into the water body?", value: false, description_tooltip: "Untreated water"},
    "has_offsite_wwtp": {question: "Does the industry discharge to an off-site treatment wastewater plant?", value: false,},
    "offsite_wwtp_type": {question: "Off-site treatment wastewater plant type", value: null,},
    "industry_type": {question: "Standard industrial classification", value: null,},
    "product_produced": {question: "Amount of product produced by the industry", value: 0, unit: "tonnes/day"},
    "ind_cod_infl": {question: "Industry withdrawal water COD concentration (surface water only)", value: 0, unit: "g/m3"},
    "ind_tn_infl": {question: "Industry withdrawal water TN concentration (surface water only)", value: 0, unit: "g/m3"},
    "ind_tp_infl": {question: "Industry withdrawal water TP concentration (surface water only)", value: 0, unit: "g/m3"},

    "ind_cod_effl": {question: "Concentration of COD in the industry effluent", value: 0, unit: "g/m3"},
    "ind_tn_effl": {question: "Concentration of Total Nitrogen in the industry effluent", value: 0, unit: "g/m3"},
    "ind_tp_effl": {question: "Concentration of Total Phosphorus in the industry effluent", value: 0, unit: "g/m3"},
    "ind_diclo_effl": {question: "Concentration of 1,2-Dichloroethane in the industry effluent", value: 0, unit: "g/m3"},
    "ind_cadmium_effl": {question: "Concentration of cadmium in the industry effluent", value: 0, unit: "g/m3"},
    "ind_hexaclorobenzene_effl": {question: "Concentration of hexachlorobenzene in the industry effluent", value: 0, unit: "g/m3"},
    "ind_mercury_effl": {question: "Concentration of mercury in the industry effluent", value: 0, unit: "g/m3"},
    "ind_plomo_effl": {question: "Concentration of lead in the industry effluent", value: 0, unit: "g/m3"},
    "ind_niquel_effl": {question: "Concentration of nickel in the industry effluent", value: 0, unit: "g/m3"},
    "ind_chloro_effl": {question: "Concentration of chloroalkanes in the industry effluent", value: 0, unit: "g/m3"},
    "ind_hexaclorobutadie_effl": {question: "Concentration of hexachlorobutadiene in the industry effluent", value: 0, unit: "g/m3"},
    "ind_nonilfenols_effl": {question: "Concentration of nonylphenols in the industry effluent", value: 0, unit: "g/m3"},
    "ind_tetracloroetile_effl": {question: "Concentration of tetrachloroethene in the industry effluent", value: 0, unit: "g/m3"},
    "ind_tricloroetile_effl": {question: "Concentration of trichloroethylene in the industry effluent", value: 0, unit: "g/m3"},

}

export let industry_inputs = ["volume_withdrawn", "volume_withdrawn_groundwater", "has_onsite_wwtp", "has_direct_discharge", "has_offsite_wwtp", "industry_type", "product_produced", "ind_cod_infl", "ind_tn_infl", "ind_tp_infl", "ind_cod_effl", "ind_tn_effl", "ind_tp_effl", "ind_diclo_effl", "ind_cadmium_effl", "ind_hexaclorobenzene_effl", "ind_mercury_effl", "ind_plomo_effl", "ind_niquel_effl", "ind_chloro_effl", "ind_hexaclorobutadie_effl", "ind_nonilfenols_effl", "ind_tetracloroetile_effl", "ind_tricloroetile_effl" ]


export let onsite_wwtp_no_offsite = ["wwt_treatment_type", "wwt_vol_trea", "wwt_vol_disc", "wwt_vol_reused", "wwt_cod_effl", "wwt_tn_effl", "wwt_tp_effl", "wwt_diclo_effl", "wwt_cadmium_effl", "wwt_hexaclorobenzene_effl", "wwt_mercury_effl", "wwt_plomo_effl", "wwt_niquel_effl", "wwt_chloro_effl", "wwt_hexaclorobutadie_effl", "wwt_nonilfenols_effl", "wwt_tetracloroetile_effl", "wwt_tricloroetile_effl", "wwt_nrg_cons", "wwt_conv_kwh", "wwt_mass_slu", "wwt_cod_slud", "wwt_ch4_efac_tre", "wwt_n2o_efac_tre", "wwt_ch4_efac_dis", "wwt_n2o_efac_dis", "wwt_fuel_typ", "wwt_vol_fuel",
    "wwt_biog_pro", "wwt_biog_fla", "wwt_biog_val", "wwt_biog_lkd", "wwt_biog_sold", "wwt_ch4_biog", "wwt_dige_typ", "wwt_fuel_dig", "wwt_reus_trck_typ", "wwt_reus_vol_trck",
    "wwt_mass_slu_sto", "wwt_time_slu_sto", "wwt_slu_sto_TVS", "wwt_slu_sto_f_CH4", "wwt_slu_sto_EF", "wwt_mass_slu_comp", "wwt_slu_comp_emis_treated_or_piles_covered", "wwt_slu_comp_solids_content", "wwt_slu_comp_TVS", "wwt_slu_comp_N_cont", "wwt_slu_comp_low_CN_EF", "wwt_slu_comp_uncovered_pile_EF", "wwt_slu_comp_seqst_rate",
    "wwt_mass_slu_inc", "wwt_temp_inc", "wwt_slu_inc_N_cont", "wwt_slu_inc_SNCR", "wwt_mass_slu_app", "wwt_slu_la_solids_content", "wwt_slu_la_TVS", "wwt_slu_la_N_cont", "wwt_slu_la_EF",
    "wwt_mass_slu_land", "wwt_slu_lf_TVS", "wwt_slu_lf_uncertainty", "wwt_slu_lf_CH4_in_gas", "wwt_slu_lf_DOCf", "wwt_slu_lf_decomp_3yr", "wwt_slu_lf_MCF", "wwt_slu_lf_N_cont", "wwt_slu_lf_low_CN_EF", "wwt_mass_slu_stock", "wwt_slu_sp_lifespan", "wwt_trck_typ", "wwt_vol_tslu"]

export let onsite_wwtp_with_offsite_wwtp_inputs = ["wwt_treatment_type", "wwt_vol_trea", "wwt_vol_disc", "wwt_vol_reused", "wwt_vol_treated_external", "wwt_cod_effl", "wwt_tn_effl", "wwt_tp_effl", "wwt_diclo_effl", "wwt_cadmium_effl", "wwt_hexaclorobenzene_effl", "wwt_mercury_effl", "wwt_plomo_effl", "wwt_niquel_effl", "wwt_chloro_effl", "wwt_hexaclorobutadie_effl", "wwt_nonilfenols_effl", "wwt_tetracloroetile_effl", "wwt_tricloroetile_effl", "wwt_nrg_cons", "wwt_conv_kwh", "wwt_mass_slu", "wwt_cod_slud", "wwt_ch4_efac_tre", "wwt_n2o_efac_tre", "wwt_ch4_efac_dis", "wwt_n2o_efac_dis", "wwt_fuel_typ", "wwt_vol_fuel",
    "wwt_biog_pro", "wwt_biog_fla", "wwt_biog_val", "wwt_biog_lkd", "wwt_biog_sold", "wwt_ch4_biog", "wwt_dige_typ", "wwt_fuel_dig", "wwt_reus_trck_typ", "wwt_reus_vol_trck",
    "wwt_mass_slu_sto", "wwt_time_slu_sto", "wwt_slu_sto_TVS", "wwt_slu_sto_f_CH4", "wwt_slu_sto_EF", "wwt_mass_slu_comp", "wwt_slu_comp_emis_treated_or_piles_covered", "wwt_slu_comp_solids_content", "wwt_slu_comp_TVS", "wwt_slu_comp_N_cont", "wwt_slu_comp_low_CN_EF", "wwt_slu_comp_uncovered_pile_EF", "wwt_slu_comp_seqst_rate",
    "wwt_mass_slu_inc", "wwt_temp_inc", "wwt_slu_inc_N_cont", "wwt_slu_inc_SNCR", "wwt_mass_slu_app", "wwt_slu_la_solids_content", "wwt_slu_la_TVS", "wwt_slu_la_N_cont", "wwt_slu_la_EF",
    "wwt_mass_slu_land", "wwt_slu_lf_TVS", "wwt_slu_lf_uncertainty", "wwt_slu_lf_CH4_in_gas", "wwt_slu_lf_DOCf", "wwt_slu_lf_decomp_3yr", "wwt_slu_lf_MCF", "wwt_slu_lf_N_cont", "wwt_slu_lf_low_CN_EF", "wwt_mass_slu_stock", "wwt_slu_sp_lifespan", "wwt_trck_typ", "wwt_vol_tslu"]

export let direct_discharge_inputs = ["dd_vol_disc", "wwt_ch4_efac_dis", "wwt_n2o_efac_dis"]

export let offsite_wwtp_inputs =  ["wwt_treatment_type", "wwt_vol_trea", "wwt_vol_disc", "wwt_cod_effl", "wwt_tn_effl", "wwt_tp_effl", "wwt_diclo_effl", "wwt_cadmium_effl", "wwt_hexaclorobenzene_effl", "wwt_mercury_effl", "wwt_plomo_effl", "wwt_niquel_effl", "wwt_chloro_effl", "wwt_hexaclorobutadie_effl", "wwt_nonilfenols_effl", "wwt_tetracloroetile_effl", "wwt_tricloroetile_effl", "wwt_nrg_cons", "wwt_conv_kwh", "wwt_mass_slu", "wwt_cod_slud", "wwt_ch4_efac_tre", "wwt_n2o_efac_tre", "wwt_ch4_efac_dis", "wwt_n2o_efac_dis", "wwt_fuel_typ", "wwt_vol_fuel",
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