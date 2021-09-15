/*
  Draft for WIAT backend
*/

/*
  UTILS
*/
//sum array of numbers
Array.prototype.sum=function(){return this.reduce((p,c)=>(p+c),0)};

/*
  ASSESSMENT: main class
*/
export class Assessment{
    constructor(){
        this.name="new assessment";

        //assessment period
        this.assessment_period_start = new Date();
        this.assessment_period_end   = new Date();

        //array for "Industry" objects
        this.industries=[];
    }

    /*
      methods
    */

    //total emissions (all industries)
    TotalGHG(){
        return this.industries.map(i=>i.wwt_KPI_GHG().total).sum(); //kgCO2eq
    }

    //total energy consumed (all industries)
    TotalNRG(){
        return this.industries.map(i=>i.wwt_nrg_cons).sum(); //kWh
    }

    //add industry
    add_industry(){
        let i = new Industry();
        this.industries.push(i);
    }

    add_industry(i){
        this.industries.push(i);
    }

    //delete industry
    delete_industry(i){
        this.industries.splice(i,1);
    }

};

/*
  INDUSTRY: industries live inside an assessment object
*/
export class Industry{

    static info_inputs(){
        return {
            "Industry characteristics": {

                /*"wwt_serv_pop" :{question:"Serviced population", value: 0},
                "wwt_vol_trea" :{question:"Volume of treated wastewater", value: 0},
                "wwt_vol_disc" :{question:"Volume of discharged effluent to water body", value: 0},*/


                "wwt_ind_prod": {question: "Total industrial product", value: 0, unit: "t/yr"},  //t/yer | Total industrial product
                "wwt_wwt_generated": {question: "Wastewater generated for industrial sector", value: 0, unit: "m3/t"},  //m3/t | Wastewater generated
                "wwt_tot_nit": {question: "Total nitrogen in untreated wastewater", value: 0, unit: "kgTN/m3"},  //kgTN/m3 | Total nitrogen in untreated wastewater

                //energy
                "wwt_nrg_cons": {question: "Energy consumed from the grid", value: 0, unit: "kWh", description_tooltip: "Total energy consumed during the assessment period by all wastewater treatment plants managed by the undertaking"},  //kWh | energy consumed from the grid
                "wwt_conv_kwh": {question: "Emission factor for grid electricity", value: 0, unit: "kgCO2eq/kWh", description_tooltip: "Emission factor for grid electricity (indirect emissions)"},  //kgCO2eq/kWh | conversion factor

                //SLUDGE MANAGEMENT
                "wwt_mass_slu": {
                    question: "Sludge removed from wastewater treatment (dry weight)",
                    value: 0,
                    unit: "kg",
                    description_tooltip: "Amount of raw sludge removed from wastewater treatment as dry mass during the assessment period"
                },  //kg | raw sludge removed from wwtp as dry mass
                "wwt_bod_slud": {question: "COD removed as sludge", value: 0, unit: "kg", description_tooltip: "COD (organic component) removed from wastewater (in the form of sludge) in aerobic treatment plant"},  //kg | COD removed as sludge    //Taula 6.6A

            },
            "Wastewater treatment": {
                "wwt_bod_infl": {question: "Influent COD load", value: 0, unit: "kg", description_tooltip: "COD load entering the WWTP during the assessment period. It can be estimated by multiplying the average COD concentration in the influent by the volume entering the plant. If this is done daily and summed over the duration of the assessment period the value will be most accurate"}, //kgCOD   //No te estimacio

                "wwt_tn_infl": {question: "Total Nitrogen load in the influent", value: 0, unit: "kg", estimation_type: "equation"},  //kgN    Equacio 6.13

                "wwt_P_infl": {question: "Influent P load", value: 0, unit: "kg"}, //kgP

                "wwt_has_local_wwt_plant": {
                    question: "Is water treated in a local wastewater plant?",
                    value: 0,
                    type: "option",
                    items: Tables["Yes/No"]
                }, //yes/no

                "wwt_bod_effl": {
                    question: "Effluent COD load",
                    value: 0,
                    unit: "kg",
                    estimation_type: "option",
                    items: Tables["WW treatment organics removal fractions (centralised) (Table 6.6B and 6.10C)"],
                    estimation_based_on: "wwt_bod_infl",
                    estimation_factor: "bod_effl",
                    description: "bod_effl_table",
                    description_tooltip: "COD load at the effluent of the WWTP during the assessment period. It can be estimated by multiplying the average COD concentration in the effluent by the effluent volume the plant. If this is done daily and summed over the duration of the assessment period the value will be most accurate",
                    depends_on: "wwt_has_local_wwt_plant"
                }, //kgBOD   Table 6.6B and 6.10C


                "wwt_tn_effl": {
                    question: "Total Nitrogen load in the effluent",
                    value: 0,
                    unit: "kg",
                    estimation_type: "option",
                    items: Tables["WW treatment organics removal fractions (centralised) (Table 6.6B and 6.10C)"],
                    estimation_based_on: "wwt_tn_infl",
                    estimation_factor: "N_effl",
                    description: "N_effl_table"
                },  //kgN   TAULA 6.10c


            },

            "Treatment characteristics": {
                //emission factors (treatment)
                "wwt_ch4_efac_tre": {
                    question: "CH4 emission factor (treatment)",
                    value: 0,
                    unit: "kgCH4/kgCOD",
                    estimation_type: "option",
                    items: Tables["type_of_treatment"],
                    estimation_based_on: null,
                    estimation_factor: "ch4_efac",
                    description: "description",
                    description_tooltip: "Methane emission factor of selected biological wastewater aerobic treatment processes"

                },  //kgCH4/kgCOD  S'obté de la taula 6.3
                "wwt_n2o_efac_tre": {
                    question: "N2O emission factor (treatment)",
                    value: 0,
                    unit: "kgN2O-N/kgN",
                    estimation_type: "option",
                    items: Tables["N2O EF plants (Table 6.8A)"],
                    estimation_based_on: null,
                    estimation_factor: "n2o_efac",
                    description: "description"
                },  //kgN2O-N/kgN     Taula 6.8A

                //emission factors (discharge)
                "wwt_ch4_efac_dis": {
                    question: "CH4 emission factor (discharge)",
                    value: 0,
                    unit: "kgCH4/kgCOD",
                    estimation_type: "option",
                    items: Tables["type_of_water_body"],
                    estimation_based_on: null,
                    estimation_factor: "ch4_efac",
                    description: "description"
                },  //kgCH4/kgCOD   Table 6.8
                "wwt_n2o_efac_dis": {
                    question: "N2O emission factor (discharge)",
                    value: 0,
                    unit: "kgN2O-N/kgN",
                    estimation_type: "option",
                    items: Tables["N2O EF effluent (Table 6.8A)"],
                    estimation_based_on: null,
                    estimation_factor: "n2o_efac",
                    description: "description"
                },  //kgN2O-N/kgN  //tAULA 6.8A

            },

            "Fuel engines" :{

                //fuel engines
                "wwt_fuel_typ" :{question:"Fuel type (engines)", value: 0, type: "option", items: Tables["Fuel type options"]}, //Option | type of fuel (see Tables)
                "wwt_vol_fuel" :{question:"Volume of fuel consumed", value: 0, unit: "L"}, //L of fuel
            },

            "Biogas produced from anaerobic digestion" : {
                //biogas
                "wwt_biog_pro": {
                    question: "Biogas produced (volume)",
                    value: 0,
                    unit: "Nm3",
                    estimation_type: "equation",
                    description_tooltip: "Biogas produced during the assessment period by the wastewater treatment plant managed by the undertaking"
                }, //Nm3 | total biogas produced
                "wwt_biog_fla": {
                    question: "% of biogas produced that is flared",
                    value: 98,
                    unit: "%",
                    estimation_type: "equation"
                },
                "wwt_biog_val": {
                    question: "Biogas valorised as heat and/or electricity (% volume)",
                    value: 0,
                    unit: "%",
                    estimation_type: "equation",
                    description_tooltip: "Biogas valorized in the treatment plant to heat the digesters or the building and/or to run a Co-generator to generate heat and electricity"
                }, //% of biogas produced that is used for heat
                "wwt_biog_lkd": {
                    question: "Biogas leaked to the atmosphere (% volume)",
                    value: 2,
                    unit: "%",
                    estimation_type: "equation"
                }, //% of biogas produced that is leaked
                "wwt_biog_sold": {question: "Biogas sold (% volume)", value: 0, unit: "%", estimation_type: "equation"},
                "wwt_ch4_biog": {question: "Percentage of methane in the biogas (% volume)", value: 59, unit: "%"}, //% of CH4 in biogas (volume)
                "wwt_dige_typ": {
                    question: "Fuel type (digester)",
                    value: 0,
                    type: "option",
                    items: Tables["Fuel type options"]
                }, //Option | type of fuel for digester
                "wwt_fuel_dig": {question: "Fuel consumed for the digester", value: 0, unit: "L"}, //L | volume of fuel used in the digester
                //"wwt_nrg_biog_eff" :{question:"Energy efficiency for biogas valorization with respect to the theoretical maximum", value: 43},
                //"wwt_nrg_biog" :{question:"Electrical energy produced from biogas valorization", value: 0},
            },
                //Treatment performance
                /*
                "wwt_trea_cap" :{question:"Treatment capacity", value: 0},
                "wwt_tst_cmpl" :{question:"Number of water quality tests complying", value: 0},
                "wwt_tst_cond" :{question:"Number of water quality tests conducted", value: 0},*/

                //Pumping efficiency
                /*
                "wwt_nrg_pump" :{question:"Energy consumed from the grid (pumping)", value: 0},
                "wwt_vol_pump" :{question:"Volume of pumped wastewater", value: 0},
                "wwt_pmp_head" :{question:"Pump head", value: 0},
                "wwt_sta_head" :{question:"Static head", value: 0},
                "wwt_coll_len" :{question:"Collector length", value: 0},*/

                //Electromechanical efficiency of pump
                /*"wwt_pump_flow" :{question:"Measured pump flow", value: 0},
                "wwt_pmp_volt" :{question:"Measured pump voltage", value: 0},
                "wwt_pmp_amps" :{question:"Measured pump current", value: 0},
                "wwt_pmp_pf" :{question:"Power factor", value: 0},
                "wwt_pmp_exff" :{question:"Expected electromechanical efficiency of new pump", value: 0},*/
            //fuel used in water reuse trucks
            "Fuel used in water reuse trucks": {
                "wwt_reus_trck_typ": {
                    question: "Fuel type (trucks)",
                    value: 0,
                    type: "option",
                    items: Tables["Fuel type options"]
                }, //Option | type of fuel
                "wwt_reus_vol_trck": {question: "Volume of fuel consumed (trucks)", value: 0}, //L | volume of fuel used

            },
            //GHG emissions avoided from reusing water
                /*
                "wwt_vol_nonp" :{question:"Volume of reused effluent", value: 0},
                "wwt_wr_N_rec" :{question:"Total Nitrogen recovered", value: 0},
                "wwt_wr_P_rec" :{question:"Total Phosphorus recovered", value: 0},*/

                //sludge storage

            "Sludge storage in WWTP" : {
                "wwt_mass_slu_sto": {question: "Sludge stored (dry weight)", value: 0, unit: "kg", description_tooltip: "Amount of sludge that is stored prior to disposal (dry weight)"}, //kg of sludge stored
                "wwt_time_slu_sto": {question: "Storage time", value: 0, unit: "days", description_tooltip: "Time interval the sludge is stored for before being sent to disposal"}, //days
                "wwt_slu_sto_TVS": {
                    question: "Total Volatile Solids (TVS) content of sludge stored (% of dry weight)",
                    value: 0,
                    unit: "%",
                    estimation_type: "option",
                    items: Tables["Type of sludge disposed"],
                    estimation_based_on: null,
                    estimation_factor: "TVS",
                    description: "description"
                }, //%
                "wwt_slu_sto_f_CH4": {
                    question: "CH4 potential factor",
                    value: 0,
                    unit: "%",
                    estimation_type: "option",
                    items: Tables["Type of sludge disposed"],
                    estimation_based_on: null,
                    estimation_factor: "f_ch4",
                    description: "description"
                }, //% for CH4 potential
                "wwt_slu_sto_EF": {
                    question: "Emission factor due to storage (estimate with storage time)",
                    value: 0,
                    unit: "%"
                }, //%
            },
            //sludge composting
            "Sludge composting in WWTP" : {

                "wwt_mass_slu_comp": {question: "Sludge composted (dry weight)", value: 0, unit: "kg", description_tooltip: "Amount of sludge that is sent to composting (dry weight)"}, //kg of sludge composted
                "wwt_slu_comp_emis_treated_or_piles_covered": {
                    question: "Are composting emissions treated and/or piles are covered",
                    value: 0,
                    type: "option",
                    items: Tables["Yes/No"]
                }, //yes/no
                "wwt_slu_comp_solids_content": {question: "Solids content of compost", value: 0, unit: "%"}, //%
                "wwt_slu_comp_TVS": {
                    question: "Total Volatile Solids (TVS) content of sludge composted (% of dry weight)",
                    value: 0,
                    unit: "%",
                    estimation_type: "option",
                    items: Tables["Type of sludge disposed"],
                    estimation_based_on: null,
                    estimation_factor: "TVS",
                    description: "description"
                }, //%
                "wwt_slu_comp_N_cont": {
                    question: "N content of sludge stored (% of dry weight)",
                    value: 0,
                    unit: "%",
                    estimation_type: "option",
                    items: Tables["Type of sludge disposed"],
                    estimation_based_on: null,
                    estimation_factor: "N_cont",
                    description: "description"
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
                "wwt_slu_comp_seqst_rate": {question: "CO2eq sequestration rate", value: 0.25, unit: "kgCO2eq/kgSludge", description_tooltip:"Estimated C02 equivalents sequestered per kg of sludge"}, //kgCO2eq/kgSludge
            },
            //sludge incineration
            "Sludge incineration" : {

                "wwt_mass_slu_inc": {question: "Sludge incinerated (dry weight)", value: 0, unit: "kg"}, //kg of sludge incinerated
                "wwt_temp_inc": {
                    question: "Average highest temperature of combustion achieved in a Fluidized Bed incinerator",
                    value: 1023,
                    unit: "K",
                    description_tooltip:"Incineration temperature"
                }, //K | temperature incineration
                "wwt_slu_inc_N_cont": {
                    question: "N content of sludge incinerated (% of dry weight)",
                    value: 0,
                    unit: "%",
                    estimation_type: "option",
                    items: Tables["Type of sludge disposed"],
                    estimation_based_on: null,
                    estimation_factor: "N_cont",
                    description: "description"
                }, //% of N
                "wwt_slu_inc_SNCR": {
                    question: "Is 'SNCR air emissions technology with urea' used?",
                    value: 0,
                    type: "option",
                    items: Tables["Yes/No"]
                }, //boolean
            },
            //sludge LA
            "Sludge sent to dry application" : {

                "wwt_mass_slu_app": {question: "Sludge sent to land application (dry weight)", value: 0, unit: "kg"}, //kg of sludge sent to LA
                "wwt_slu_la_solids_content": {
                    question: "Solids content of sludge sent to land application",
                    value: 0,
                    unit: "%"
                }, //%
                "wwt_slu_la_TVS": {
                    question: "Total Volatile Solids (TVS) content of sludge sent to land application)",
                    value: 0,
                    unit: "%",
                    estimation_type: "option",
                    items: Tables["Type of sludge disposed"],
                    estimation_based_on: null,
                    estimation_factor: "TVS",
                    description: "description"
                }, //%
                "wwt_slu_la_N_cont": {
                    question: "N content of sludge sent to land application (% of dry weight)",
                    value: 0,
                    unit: "%",
                    estimation_type: "option",
                    items: Tables["Type of sludge disposed"],
                    estimation_based_on: null,
                    estimation_factor: "N_cont",
                    description: "description"
                }, //%
                "wwt_slu_la_EF": {
                    question: "Amount of Nitrogen converted to N2O",
                    value: 0,
                    unit: "kgN2O-N/gN",
                    estimation_type: "option",
                    items: Tables["Soil type"],
                    estimation_based_on: null,
                    estimation_factor: "f_la",
                    description: "description"
                }, //kgN2O-N/gN
                //"wwt_slu_la_seqst_rate" :{question:"CO2eq sequestration rate", value: 0}, //kgCO2eq/kgSludge
            },
            //sludge LF
            "Sludge landfilling" : {
                "wwt_mass_slu_land": {question: "Sludge sent to landfilling (dry weight)", value: 0, unit: "kg"}, //kg of sludge sent to LF
                "wwt_slu_lf_TVS": {
                    question: "Total Volatile Solids (TVS) content of sludge sent to land application",
                    value: 0,
                    unit: "%",
                    estimation_type: "option",
                    items: Tables["Type of sludge disposed"],
                    estimation_based_on: null,
                    estimation_factor: "TVS",
                    description: "description"
                }, //%
                "wwt_slu_lf_uncertainty": {question: "Uncertainty factor (UNFCCC/CCNUC, 2008)", value: 0.9, description_tooltip:"Model uncertainty factor (default value:0.9, UNFCCC/CCNUC, 2008)"}, //adimensional
                "wwt_slu_lf_CH4_in_gas": {question: "CH4 in landfill gas", value: 50, unit: "%", description_tooltip:"CH4 in landfill gas (50% from Clean Development Mechanism, 2008)"}, //%
                "wwt_slu_lf_DOCf": {
                    question: "Decomposable organic fraction of raw wastewater solids",
                    value: 80,
                    unit: "%",
                    description_tooltip:"Decomposable organic fraction of raw wastewater solids (80% from Brown et al., 2008 and Metcalf & Eddy, 2003)"
                }, //%
                "wwt_slu_lf_decomp_3yr": {question: "Percentage decomposed in first 3 years", value: 69.9, unit: "%", description_tooltip:"Percentage decomposed in first 3 years of the decomposable organic fraction of raw wastewater solids"}, //%
                "wwt_slu_lf_MCF": {
                    question: "Methane correction for anaerobic managed landfills (default=1)",
                    value: 1,
                    unit: "ratio",
                    estimation_type: "option",
                    items: Tables["Type of landfill"],
                    estimation_based_on: null,
                    estimation_factor: "MCF",
                    description: "description",
                    description_tooltip:"Methane correction for anaerobic managed landfills (default=1, UNFCCC/CCNUCC, 2008)"

                }, //ratio
                "wwt_slu_lf_N_cont": {
                    question: "N content of sludge sent to land application (% of dry weight)",
                    value: 0,
                    estimation_type: "option",
                    items: Tables["Type of sludge disposed"],
                    estimation_based_on: null,
                    estimation_factor: "N_cont",
                    description: "description"
                }, //N content
                "wwt_slu_lf_low_CN_EF": {
                    question: "N2O emission factor for low C:N ratio",
                    value: 0.015,
                    unit: "kgN2O-N/kgN",
                    description_tooltip:"N2O emission factor for low C:N ratio (1.5% from Brown et al, 2008)"
                } //kgN2O-N/kgN
            },
            //sludge
            "Sludge stockpiling" : {
                "wwt_mass_slu_stock": {question: "Sludge stockpiled (dry weight)", value: 0, unit: "kg"}, //kg of sludge stockpiled
                "wwt_slu_sp_lifespan": {question: "Stockpile lifespan", value: 0, unit: "years", description_tooltip:"Expected timespan that the biosolid stockpile (BSP) will be emitting GHGs"}, //years
            },
            //sludge truck transport
            "Sludge truck transportation to disposal site" : {

                "wwt_trck_typ": {
                    question: "Fuel type (trucks)",
                    value: 0,
                    type: "option",
                    items: Tables["Fuel type options"]
                }, //Option | fuel type
                "wwt_vol_tslu": {question: "Volume of fuel consumed (trucks)", value: 0, unit: "L"}, //L | volume of fuel
            }
        }
    }

    static get_estimations(){
        return {
            wwt_tn_infl(industry){  //Equation 6.13
                let P = industry.wwt_ind_prod   //Total industrial product
                let W = industry.wwt_wwt_generated  //Wastewater generated
                let TN = industry.wwt_tot_nit   //Total nitrogen in untreated wastewater
                return P*W*TN
            },

            wwt_biog_pro(substage){ //estimation for biogas produced
                let wwt_mass_slu    = substage.wwt_mass_slu;  //kg  | mass of combined sludge to digestion
                let VS_to_digestion = wwt_mass_slu    * 0.80; //kg  | VS to digestion: 80% of sludge mass
                let VS_destroyed    = VS_to_digestion * 0.60; //kg  | VS destroyed: 60% of VS
                let biogas_volume   = VS_destroyed    * 0.80; //Nm3 | biogas produced (volume)
                return biogas_volume;
            },
            //wwt
            wwt_biog_fla(substage){
                return 100-substage.wwt_biog_val-substage.wwt_biog_lkd-substage.wwt_biog_sold;
            },
            wwt_biog_val(substage){
                return 100-substage.wwt_biog_fla-substage.wwt_biog_lkd-substage.wwt_biog_sold;
            },
            wwt_biog_lkd(substage){
                return 100-substage.wwt_biog_val-substage.wwt_biog_fla-substage.wwt_biog_sold;
            },
            wwt_biog_sold(substage){
                return 100-substage.wwt_biog_val-substage.wwt_biog_fla-substage.wwt_biog_lkd;
            },
        }
    }

    constructor(){
        this.name = "new industry";
        this.location = null

        let _this = this

        for(let items of Object.values(Industry.info_inputs())){
            for(let [clau, valor] of Object.entries(items)){
                _this[clau] = valor.value

                if(clau === "wwt_has_local_wwt_plant") console.log(valor.value)

            }
        }
    }

    /*
      Functions for calling data from other components
    */

    //emissions with description
    emissions_and_descriptions(){
        return [
            {description: "Indirect emissions from electricity consumption", emissions: this.wwt_KPI_GHG_elec()},
            {description: "Emissions from fuel engines", emissions: this.wwt_KPI_GHG_fuel()},
            {description: "Emissions from biogas (fuel used in digester)", emissions: this.wwt_KPI_GHG_biog_dig()},
            {description: "Emissions from treatment", emissions: this.wwt_KPI_GHG_tre()},
            {description: "Emissions from biogas", emissions: this.wwt_KPI_GHG_biog()},
            {description: "Emissions from biogas flared", emissions: this.wwt_KPI_GHG_biog_flared()},
            {description: "Biogas valorized emissions", emissions: this.wwt_KPI_GHG_biog_valorized()},
            {description: "Biogas leaked emissions", emissions: this.wwt_KPI_GHG_biog_leaked()},
            {description: "GHG from sludge management", emissions: this.wwt_KPI_GHG_slu()},
            {description: "Emissions from sludge storage", emissions: this.wwt_KPI_GHG_sludge_storage()},
            {description: "Emissions from sludge composting", emissions: this.wwt_KPI_GHG_sludge_composting()},
            {description: "Emissions from sludge incineration", emissions: this.wwt_KPI_GHG_sludge_incineration()},
            {description: "Emissions from sludge applied to land", emissions: this.wwt_KPI_GHG_sludge_land_application()},
            {description: "Emissions from sludge used for landfilling", emissions: this.wwt_KPI_GHG_sludge_landfilling()},
            {description: "Emissions from sludge stockpiled", emissions: this.wwt_KPI_GHG_sludge_stockpilling()},
            {description: "Emissions from sludge transport", emissions: this.wwt_KPI_GHG_sludge_transport()},
            {description: "Emissions from water reuse transport", emissions: this.wwt_KPI_GHG_reus_trck()},
            {description: "Emissions from water discharged", emissions: this.wwt_KPI_GHG_disc()},
        ]
    }
    water_quality_indicators(){
        return [

            {type: "COD load at the effluent of the WWTP", value: this.wwt_bod_effl, unit: "kg"},
            {type: "Total Nitrogen load in the effluent", value: this.wwt_tn_effl, unit: "kg"},

        ]
    }

    /*
      GHG emissions (kgCO2eq)
    */
    //total GHG emissions
    wwt_KPI_GHG(){
        let sources=[
            this.wwt_KPI_GHG_elec(),
            this.wwt_KPI_GHG_fuel(),
            this.wwt_KPI_GHG_tre(),
            this.wwt_KPI_GHG_biog(),
            this.wwt_KPI_GHG_slu(),
            this.wwt_KPI_GHG_reus_trck(),
            this.wwt_KPI_GHG_disc(),
        ];

        //gases (numbers)
        let co2 = sources.map(s=>s.co2).sum();
        let ch4 = sources.map(s=>s.ch4).sum();
        let n2o = sources.map(s=>s.n2o).sum();

        //total
        let total = sources.map(s=>s.total).sum();
        return {total,co2,ch4,n2o};
    }

    //indirect emissions from electricity consumption
    wwt_KPI_GHG_elec(){
        let co2 = this.wwt_nrg_cons*this.wwt_conv_kwh;
        let ch4 = 0;
        let n2o = 0;
        let total = co2+ch4+n2o;
        return {total,co2,ch4,n2o};
    }

    //emissions from fuel engines
    wwt_KPI_GHG_fuel(){
        let vol   = this.wwt_vol_fuel;
        let fuel  = Tables.get_row('Fuel type',this.wwt_fuel_typ); //object
        let co2   = vol*fuel.FD*fuel.NCV/1000*fuel.EFCO2;
        let ch4   = vol*fuel.FD*fuel.NCV/1000*fuel.EFCH4.engines*Cts.ct_ch4_eq.value;
        let n2o   = vol*fuel.FD*fuel.NCV/1000*fuel.EFN2O.engines*Cts.ct_n2o_eq.value;
        let total = co2+n2o+ch4;
        return {total,co2,ch4,n2o};
    }

    //emissions from biogas (fuel used in digester)
    wwt_KPI_GHG_biog_dig(){
        let vol   = this.wwt_fuel_dig;
        let fuel  = Tables.get_row('Fuel type',this.wwt_dige_typ);
        let co2   = vol*fuel.FD*fuel.NCV/1000*fuel.EFCO2
        let ch4   = vol*fuel.FD*fuel.NCV/1000*fuel.EFCH4.engines*Cts.ct_ch4_eq.value;
        let n2o   = vol*fuel.FD*fuel.NCV/1000*fuel.EFN2O.engines*Cts.ct_n2o_eq.value;
        let total = co2+n2o+ch4;
        return {total,co2,ch4,n2o};
    }

    //emissions from treatment
    wwt_KPI_GHG_tre(){
        let co2   = 0;
        let ch4   = (this.wwt_bod_infl-this.wwt_bod_slud)*this.wwt_ch4_efac_tre*Cts.ct_ch4_eq.value;    //Eq. 6.1
        let n2o   = this.wwt_tn_infl*this.wwt_n2o_efac_tre*Cts.ct_N_to_N2O_44_28.value*Cts.ct_n2o_eq.value;  //Eq. 6.9
        let total = co2+ch4+n2o;
        return {total,co2,ch4,n2o};
    }

    //emissions from biogas
    wwt_KPI_GHG_biog(){
        let sources=[
            this.wwt_KPI_GHG_biog_flared(),
            this.wwt_KPI_GHG_biog_valorized(),
            this.wwt_KPI_GHG_biog_leaked(),
            this.wwt_KPI_GHG_biog_dig(),
        ];

        //gases (numbers)
        let co2 = sources.map(s=>s.co2).sum();
        let ch4 = sources.map(s=>s.ch4).sum();
        let n2o = sources.map(s=>s.n2o).sum();

        //total
        let total = sources.map(s=>s.total).sum();
        return {total,co2,ch4,n2o};
    }

    //emissions from biogas flared
    wwt_KPI_GHG_biog_flared(){
        let moles_biogas        = this.wwt_moles_biogas_produced(); //moles of biogas produced
        let moles_biogas_flared = moles_biogas*this.wwt_biog_fla/100; //moles of biogas flared
        let moles_ch4_flared    = moles_biogas_flared*this.wwt_ch4_biog/100; //moles of CH4 flared

        //combustion of 1 mol of CH4 produces 1 mol of CO2
        //CH4 + 2·O2 -> CO2 + 2·H2O
        //we do not account moles of CO2 already present into the biogas, because it is biogenic CO2
        let moles_co2_to_atmosphere = moles_ch4_flared; //moles of CO2
        let mass_co2_to_atmosphere = moles_co2_to_atmosphere*(44/1000); //kg of CO2

        let co2 = mass_co2_to_atmosphere; //kgCO2
        let n2o = 0;
        let ch4 = 0;
        let total = co2+ch4+n2o;
        return {total,co2,ch4,n2o};
    }

    //biogas valorized emissions
    wwt_KPI_GHG_biog_valorized(){
        let moles_biogas           = this.wwt_moles_biogas_produced(); //moles of biogas produced
        let moles_biogas_valorized = moles_biogas*this.wwt_biog_val/100; //moles of biogas valorized
        let moles_ch4_valorized    = moles_biogas_valorized*this.wwt_ch4_biog/100; //moles of CH4 valorized

        //combustion of 1 mol of CH4 produces 1 mol of CO2
        //CH4 + 2·O2 -> CO2 + 2·H2O
        //we do not account moles of CO2 already present into the biogas, because it is biogenic CO2
        let moles_co2_to_atmosphere = moles_ch4_valorized; //moles of CO2
        let mass_co2_to_atmosphere = moles_co2_to_atmosphere*(44/1000); //kg of CO2

        let co2 = mass_co2_to_atmosphere; //kgCO2
        let n2o = 0;
        let ch4 = 0;
        let total = co2+ch4+n2o;
        return {total,co2,ch4,n2o};
    }

    //biogas leaked emissions
    wwt_KPI_GHG_biog_leaked(){
        let moles_biogas = this.wwt_moles_biogas_produced(); //moles of biogas produced
        let moles_biogas_leaked = moles_biogas*this.wwt_biog_lkd/100; //moles of biogas leaked

        //we do not account moles of CO2 already present into the biogas, because it is biogenic CO2
        let moles_ch4_leaked = moles_biogas_leaked*this.wwt_ch4_biog/100; //moles of CH4 leaked
        let mass_ch4_to_atmosphere = moles_ch4_leaked*(16/1000); //kg of CH4 leaked

        let co2 = 0;
        let n2o = 0;
        let ch4 = mass_ch4_to_atmosphere*Cts.ct_ch4_eq.value; //kgCO2eq
        let total = co2+ch4+n2o;
        return {total,co2,ch4,n2o};
    }

    //ghg from sludge management
    wwt_KPI_GHG_slu(){
        let sources=[
            this.wwt_KPI_GHG_sludge_storage(),
            this.wwt_KPI_GHG_sludge_composting(),
            this.wwt_KPI_GHG_sludge_incineration(),
            this.wwt_KPI_GHG_sludge_land_application(),
            this.wwt_KPI_GHG_sludge_landfilling(),
            this.wwt_KPI_GHG_sludge_stockpilling(),
            this.wwt_KPI_GHG_sludge_transport(),
        ];

        //gases (numbers)
        let co2 = sources.map(s=>s.co2).sum();
        let ch4 = sources.map(s=>s.ch4).sum();
        let n2o = sources.map(s=>s.n2o).sum();

        //total
        let total = sources.map(s=>s.total).sum();
        return {total,co2,ch4,n2o};
    }

    //emissions from sludge storage
    wwt_KPI_GHG_sludge_storage(){
        let sludge_mass = this.wwt_mass_slu_sto; //kg of sludge
        let TVS         = this.wwt_slu_sto_TVS/100; //gTVS/gSludge
        let TVS_to_OC   = Cts.ct_VS_to_OC.value; //gOC/gTVS
        let OC_to_CH4   = Cts.ct_C_to_CH4_16_12.value; //gCH4/gOC
        let f_CH4       = this.wwt_slu_sto_f_CH4/100; //ratio for CH4 potential

        //max CH4 that could be released
        let ch4_potential = sludge_mass*TVS*TVS_to_OC*OC_to_CH4*f_CH4; //kgCH4 potential

        //emission factor
        let CH4_EF = this.wwt_slu_sto_EF/100; //gCH4 released / gCH4 potential

        //gases
        let co2   = 0;
        let n2o   = 0;
        let ch4   = ch4_potential*CH4_EF*Cts.ct_ch4_eq.value;
        let total = co2+ch4+n2o;
        return {total,co2,ch4,n2o};
    }

    //emissions from sludge composting
    wwt_KPI_GHG_sludge_composting(){
        let sludge_mass = this.wwt_mass_slu_comp; //kg of sludge
        let emissions_are_treated_or_piles_are_covered = this.wwt_slu_comp_emis_treated_or_piles_covered; //yes/no
        let solids_content_of_compost = this.wwt_slu_comp_solids_content; //%

        let TVS       = this.wwt_slu_comp_TVS/100; //gTVS/gSludge
        let N_cont    = this.wwt_slu_comp_N_cont/100; //gN/gSludge
        let TVS_to_OC = Cts.ct_VS_to_OC.value;  //gOC/gTVS
        let low_CN_EF = this.wwt_slu_comp_low_CN_EF; //0.015 kgN2O-N/kgN
        let up_EF     = this.wwt_slu_comp_uncovered_pile_EF; //0.025 kgCH4-C/kgC

        //gases
        let co2 = 0;
        let ch4 = (function(){
            if(emissions_are_treated_or_piles_are_covered){return 0}
            if(solids_content_of_compost>55){return 0}

            let OC_to_CH4 = Cts.ct_C_to_CH4_16_12.value; //1.33 gCH4/gOC
            return sludge_mass*TVS*TVS_to_OC*up_EF*OC_to_CH4*Cts.ct_ch4_eq.value;
        })();

        let n2o = (function(){
            let C_content = sludge_mass*TVS*TVS_to_OC; //kgC
            let N_content = sludge_mass*N_cont; //kgN
            let ratio_CN  = C_content/N_content||0;

            if(ratio_CN>30){return 0}
            if(solids_content_of_compost>55){return 0}

            return sludge_mass*N_cont*low_CN_EF*Cts.ct_N_to_N2O_44_28.value*Cts.ct_n2o_eq.value;
        })();

        let total = co2+ch4+n2o;
        return {total,co2,ch4,n2o};
    }

    //emissions from sludge incineration
    wwt_KPI_GHG_sludge_incineration(){
        let sludge_mass = this.wwt_mass_slu_inc;       //kg of sludge incinerated
        let Tf          = this.wwt_temp_inc;           //K
        let N_cont      = this.wwt_slu_inc_N_cont/100; //gN/gSludge
        let SNCR        = this.wwt_slu_inc_SNCR;       //yes/no

        //if Tf < 750ºC, use 750 ºC (1023 K)
        if(Tf < 1023){ Tf = 1023 }

        //gases
        let co2 = 0;
        let ch4 = (4.85e-5)*sludge_mass*Cts.ct_ch4_eq.value;
        let n2o = (function(){
            //n = % of total N that is emitted as N2O (suzuki et al 2003)
            let n = (161.3-0.14*Tf)/100; //gN2O/gN
            if(n<0) return 0;

            let emission = sludge_mass*N_cont*n*Cts.ct_n2o_eq.value; //kgCO2eq

            //increase N2O emissions by 20% if SNCR is used
            if(SNCR) emission *= 1.2;

            return emission;
        })();

        let total = co2+ch4+n2o;
        return {total,co2,ch4,n2o};
    }

    //emissions from sludge applied to land
    wwt_KPI_GHG_sludge_land_application(){
        let sludge_mass    = this.wwt_mass_slu_app; //kg sludge
        let solids_content = this.wwt_slu_la_solids_content; //%
        let TVS            = this.wwt_slu_la_TVS/100; //gTVS/gSludge
        let N_cont         = this.wwt_slu_la_N_cont/100; //gN/gSludge
        let TVS_to_OC      = Cts.ct_VS_to_OC.value; //gOC/gTVS
        let EF             = this.wwt_slu_la_EF; //gN2O-N/gN

        //gases
        let co2 = 0;
        let ch4 = 0;
        let n2o = (function(){
            //calculate ratio C:N
            let C_content = sludge_mass*TVS*TVS_to_OC; //kgC
            let N_content = sludge_mass*N_cont;        //kgN
            let ratio_CN  = C_content/N_content||0;

            if(ratio_CN>30){return 0}

            let emission = sludge_mass*N_cont*EF*Cts.ct_N_to_N2O_44_28.value*Cts.ct_n2o_eq.value;

            //if biosolids are >80%, N2O emissions are reduced by 50%
            if(solids_content>80) emission *= 0.5;

            return emission;
        })();

        let total = co2+ch4+n2o;
        return {total,co2,ch4,n2o};
    }

    //emissions from sludge used for landfilling
    wwt_KPI_GHG_sludge_landfilling(){
        let sludge_mass = this.wwt_mass_slu_land;

        let TVS         = this.wwt_slu_lf_TVS/100; //gTVS/gSludge
        let TVS_to_OC   = Cts.ct_VS_to_OC.value; //gOC/gTVS
        let uncertainty = this.wwt_slu_lf_uncertainty; //adimensional
        let OC_to_CH4   = Cts.ct_C_to_CH4_16_12.value; //kgCH4/kgC
        let CH4_in_gas  = this.wwt_slu_lf_CH4_in_gas/100; //%
        let DOCf        = this.wwt_slu_lf_DOCf/100; //%
        let decomp_3yr  = this.wwt_slu_lf_decomp_3yr/100; //%
        let MCF         = this.wwt_slu_lf_MCF; //methane correction for anaerobic managed landfills

        let N_cont      = this.wwt_slu_lf_N_cont/100; //gN/gSludge
        let low_CN_EF   = this.wwt_slu_lf_low_CN_EF; //0.015 kgN2O-N/kgN
        let N_to_N2O    = Cts.ct_N_to_N2O_44_28.value; //kgN2O/kgN2O-N

        let co2 = 0;
        let ch4 = (function(){
            return sludge_mass*TVS*TVS_to_OC*uncertainty*OC_to_CH4*CH4_in_gas*DOCf*decomp_3yr*MCF*Cts.ct_ch4_eq.value;
        })();
        let n2o = (function(){
            let C_cont = TVS*TVS_to_OC; //gOC/gSludge
            let ratio_CN = C_cont/N_cont||0; //gOC/gN
            if(ratio_CN>30){return 0;}
            return sludge_mass*N_cont*low_CN_EF*N_to_N2O*Cts.ct_n2o_eq.value;
        })();

        let total = co2+ch4+n2o;
        return {total,co2,ch4,n2o};
    }

    //emissions from sludge stockpiled
    wwt_KPI_GHG_sludge_stockpilling(){
        let sludge_mass = this.wwt_mass_slu_stock; //kg biosolids
        let sp_lifespan = this.wwt_slu_sp_lifespan; //years

        if(sp_lifespan<0) sp_lifespan=0;

        //integer part and decimal part (for example: 4.5 = 4 + 0.5)
        let sp_lifespan_int = Math.floor(sp_lifespan);
        let sp_lifespan_dec = sp_lifespan - sp_lifespan_int;

        //table of emission rates from Majumder et al., 2014 (table 3)
        let rates={
            //     <1 yo,  1-3 yo,   >3 yo, [kgCO2eq/kgSludge/year]
            ch4:[ 0.2e-3,  2.0e-3,  9.8e-3],
            n2o:[60.0e-3, 26.8e-3, 17.4e-3],
            co2:[30.1e-3, 30.5e-3, 10.1e-3],
        };

        //calculate emissions for 20 years then adapt to the real lifespan
        let emissions={ch4:[], n2o:[], co2:[]};

        //first year
        emissions.ch4[0] = sludge_mass*rates.ch4[0];
        emissions.n2o[0] = sludge_mass*rates.n2o[0];
        emissions.co2[0] = sludge_mass*rates.co2[0];

        //year 1 to 3
        for(let i=1;i<3;i++){
            emissions.ch4[i] = sludge_mass*rates.ch4[1];
            emissions.n2o[i] = sludge_mass*rates.n2o[1];
            emissions.co2[i] = sludge_mass*rates.co2[1];
        }

        //year 3 to 20
        for(let i=3;i<20;i++){
            emissions.ch4[i] = sludge_mass*rates.ch4[2];
            emissions.n2o[i] = sludge_mass*rates.n2o[2];
            emissions.co2[i] = sludge_mass*rates.co2[2];
        }

        //adapt emissions to real lifespan of stockpile (initialize to 0)
        let ch4 = 0;
        let n2o = 0;
        let co2 = 0;

        //sum whole years (integer part)
        for(let i=0; i < sp_lifespan_int; i++){
            ch4 += (emissions.ch4[i]||0);
            n2o += (emissions.n2o[i]||0);
            co2 += (emissions.co2[i]||0);
        }

        //sum decimal part
        ch4 += sp_lifespan_dec*(emissions.ch4[sp_lifespan_int]||0);
        n2o += sp_lifespan_dec*(emissions.n2o[sp_lifespan_int]||0);
        co2 += sp_lifespan_dec*(emissions.co2[sp_lifespan_int]||0);

        let total = co2+ch4+n2o;
        return {total,co2,ch4,n2o};
    }

    //emissions from sludge transport
    wwt_KPI_GHG_sludge_transport(){
        let vol   = this.wwt_vol_tslu;
        let fuel  = Tables.get_row('Fuel type',this.wwt_trck_typ);
        let co2   = vol*fuel.FD*fuel.NCV/1000*fuel.EFCO2;
        let n2o   = vol*fuel.FD*fuel.NCV/1000*fuel.EFN2O.vehicles*Cts.ct_n2o_eq.value;
        let ch4   = vol*fuel.FD*fuel.NCV/1000*fuel.EFCH4.vehicles*Cts.ct_ch4_eq.value;
        let total = co2+n2o+ch4;
        return {total,co2,n2o,ch4};
    }

    //emissions from water reuse transport
    wwt_KPI_GHG_reus_trck(){
        let vol   = this.wwt_reus_vol_trck;
        let fuel  = Tables.get_row('Fuel type',this.wwt_reus_trck_typ);
        let co2   = vol*fuel.FD*fuel.NCV/1000*fuel.EFCO2;
        let ch4   = vol*fuel.FD*fuel.NCV/1000*fuel.EFCH4.vehicles*Cts.ct_ch4_eq.value;
        let n2o   = vol*fuel.FD*fuel.NCV/1000*fuel.EFN2O.vehicles*Cts.ct_n2o_eq.value;
        let total = co2+n2o+ch4;
        return {total,co2,ch4,n2o};
    }

    //emissions from water discharged
    wwt_KPI_GHG_disc(){
        let co2   = 0;
        let ch4   = this.wwt_bod_effl*this.wwt_ch4_efac_dis*Cts.ct_ch4_eq.value;    //Equacio 6.2
        let n2o   = this.wwt_tn_effl *this.wwt_n2o_efac_dis*Cts.ct_N_to_N2O_44_28.value*Cts.ct_n2o_eq.value;    //Equacio 6.7
        let total = co2+ch4+n2o;
        return {total,co2,ch4,n2o};
    }

    /*
      Other methods
    */
    //convert volume of biogas produced to moles of biogas produced
    wwt_moles_biogas_produced(){
        //use PV=nRT formula
        //n = PV/RT
        //use normal conditions of pressure and temperature
        const P = 1.013e5; //Pa == N/m2 == J/m3
        let V = this.wwt_biog_pro; //m3
        const R = 8.31446261815324; //J/K·mol
        const T = 273.15; //K == 0ºC
        return P*V/(R*T); //"moles" of biogas produced
    }
};

/*
  TABLES
  Data structure for tabled values or dropdown menus
  used for two kinds of variables:
   1. nominal variables (strings) with magnitude==Option
   2. numeric variables inside Exceptions
*/
let Tables={

    "Fuel type":[//            EF (kg/TJ)                                                                      FD (kg/L) NCV (TJ/Gg)
        {name:"Diesel",          EFCH4:{engines: 3,vehicles:3.9}, EFN2O:{engines:0.6,vehicles:3.9}, EFCO2:74100, FD:0.84,  NCV:43.0},
        {name:"Gasoline/Petrol", EFCH4:{engines: 3,vehicles:3.8}, EFN2O:{engines:0.6,vehicles:1.9}, EFCO2:69300, FD:0.74,  NCV:44.3},
        {name:"Natural Gas",     EFCH4:{engines:10,vehicles:92 }, EFN2O:{engines:0.1,vehicles:0.2}, EFCO2:56100, FD:0.75,  NCV:48.0},
    ],

    "Fuel type options": [
        { text: 'Diesel', value: 0 },
        { text: 'Gasoline/Petrol', value: 1 },
        { text: 'Natural Gas', value: 2 },
    ],


    //ipcc 2019, table 6.3 (updated) EF (kgCH4/kgCOD)
    "type_of_water_body":[
        {name:"Water body undefined",                                                                   ch4_efac:0, description:""     },
        {name:"Discharge to aquatic environments (Tier 1)",                                             ch4_efac:0.028, description:"" },
        {name:"Discharge to aquatic environments other than reservoirs, lakes, and estuaries (Tier 2)", ch4_efac:0.009, description:"" },
        {name:"Discharge to reservoirs, lakes, and estuaries (Tier 2)",                                 ch4_efac:0.048, description:"" },
        //{name:"Stagnant sewer or anaerobic water body",                                                 ch4_efac:0.3, description:""   },
        //{name:"Flowing sewer (open or closed)",                                                         ch4_efac:0, description:""     },
        //{name:"Soil infiltration",                                                                      ch4_efac:0, description:""     },
    ],

    "type_of_sewer":[
        {name:"Type of sewer undefined",                ch4_efac:0},
        {name:"Stagnant sewer or anaerobic water body", ch4_efac:0.3},
        {name:"Flowing sewer (open or closed)",         ch4_efac:0},
    ],

    //ipcc 2019, table 6.3 (updated) EF (kgCH4/kgCOD)           C
    "type_of_treatment":[
        {name:"Type of treatment undefined",                                  ch4_efac:0,  description: ""   },
        {name:"Centralised, aerobic, treatment plant",                        ch4_efac:0, description: ""},
        {name:"Anaerobic Reactor - CH4 recovery not considered",              ch4_efac:0.2,  description: ""},
        //{name:"Anaerobic Reactor - CH4 recovery considered",                  ch4_efac:0.14,  description: ""},
        {name:"Anaerobic shallow lagoon and facultative lagoons (<2m depth)", ch4_efac:0.05,  description: ""},
        {name:"Anaerobic deep lagoon (>2m depth)",                            ch4_efac:0.2,  description: ""},
        //{name:"Anaerobic Lagoon covered",                                     ch4_efac:0,     description: ""},
        {name:"Wetlands - Surface flow",                                      ch4_efac:0.1,  description: ""},
        {name:"Wetlands - Horizontal subsurface flow",                        ch4_efac:0.025,  description: ""},
        {name:"Wetlands - Vertical subsurface flow",                          ch4_efac:0.0025, description: ""},
        //{name:"Activated Sludge - Well managed",                              ch4_efac:0,     description: ""},
        //{name:"Activated Sludge - Minor poorly aerated zones",                ch4_efac:0.06,  description: ""},
        //{name:"Activated Sludge - Some aerated zones",                        ch4_efac:0.12,  description: ""},
        //{name:"Activated Sludge - Not well managed",                          ch4_efac:0.18,  description: ""},
        //{name:"Aerated Lagoon",                                               ch4_efac:0.06,  description: ""},
        //{name:"Trickling Filter",                                             ch4_efac:0.036, description: ""},
    ],

    /*
    "Type of onsite treatment":[
        {name:"Type of treatment undefined",                      ch4_efac:0.00,   bod_rmvd_as_sludge_estm:0.0,},
        {name:"Anaerobic Digester",                               ch4_efac:0.48,   bod_rmvd_as_sludge_estm:0.10,},
        {name:"Imhoff Tanks",                                     ch4_efac:0.48,   bod_rmvd_as_sludge_estm:0.10,},
        {name:"Anaerobic Reactors - CH4 recovery not considered", ch4_efac:0.48,   bod_rmvd_as_sludge_estm:0.10,},
        {name:"Anaerobic Reactors - CH4 recovery considered",     ch4_efac:0.14,   bod_rmvd_as_sludge_estm:0.10,},
        {name:"Stabilization Ponds (<2m depth)",                  ch4_efac:0.12,   bod_rmvd_as_sludge_estm:0.30,},
        {name:"Stabilization Ponds (>2m depth)",                  ch4_efac:0.48,   bod_rmvd_as_sludge_estm:0.10,},
        {name:"Sludge Drying Beds",                               ch4_efac:0.00,   bod_rmvd_as_sludge_estm:0.0,},
        {name:"Wetlands - surface flow",                          ch4_efac:0.24,   bod_rmvd_as_sludge_estm:0.30,},
        {name:"Wetlands - Horizontal subsurface flow",            ch4_efac:0.06,   bod_rmvd_as_sludge_estm:0.65,},
        {name:"Wetlands - Vertical subsurface flow",              ch4_efac:0.006,  bod_rmvd_as_sludge_estm:0.65,},
        {name:"Composting",                                       ch4_efac:0.0013, bod_rmvd_as_sludge_estm:0.0,},
        {name:"Activated Sludge (well managed)",                  ch4_efac:0.0000, bod_rmvd_as_sludge_estm:0.65,},
        {name:"Activated Sludge - minor poorly aerated zones",    ch4_efac:0.06,   bod_rmvd_as_sludge_estm:0.65,},
        {name:"Activated Sludge - Some aerated zones",            ch4_efac:0.12,   bod_rmvd_as_sludge_estm:0.65,},
        {name:"Activated Sludge - Not well managed",              ch4_efac:0.18,   bod_rmvd_as_sludge_estm:0.65,},
        {name:"Trickling Filter",                                 ch4_efac:0.036,  bod_rmvd_as_sludge_estm:0.65,},
    ],*/

    "N2O EF plants (Table 6.8A)":[
        {name:"Type of treatment undefined",           n2o_efac:0, description:""     },
        {name:"Centralised, aerobic, treatment plant", n2o_efac:0.016, description:""  },
        {name:"Anaerobic reactor",                     n2o_efac:0, description:""      },
        {name:"Anaerobic lagoons",                     n2o_efac:0, description:""      },
        {name:"Septic tank",                           n2o_efac:0, description:""      },
        {name:"Septic tank + land dispersal field",    n2o_efac:0.0045, description:"" },
        {name:"Latrine",                               n2o_efac:0, description:""      },
    ],

    "N2O EF effluent (Table 6.8A)":[
        {name:"Discharge undefined",                                                                              n2o_efac:0.000, description:""},
        {name:"Freshwater, estuarine, and marine discharge (Tier 1)",                                             n2o_efac:0.005, description:""},
        {name:"Nutrient-impacted and/or hypoxic freshwater, estuarine, and marine discharge (Tier 3, if needed)", n2o_efac:0.019, description:""},
    ],

    "type_of_treatment_KREM":[
        {name:"Mechanical treatment plants (primary sedimentation sludge)",                                                                                 K_rem:0.50},
        {name:"Aerobic treatment plants with primary treatment (mixed primary and secondary sludge, untreated or treated aerobically)",                     K_rem:0.80},
        {name:"Aerobic treatment plants with primary treatment and anaerobic sludge digestion (mixed primary and secondary sludge, treated anaerobically)", K_rem:1.00},
        {name:"Aerobic wastewater treatment plants without separate primary treatment",                                                                     K_rem:1.16},
    ],

    "WW treatment organics removal fractions (centralised) (Table 6.6B and 6.10C)":[
        {name:"Untreated systems",                                                     bod_effl:1,  bod_effl_table:"[100%]",    N_effl:1.00,   N_effl_table:"[100%]"},
        {name:"Primary (mechanical treatment plants)",                                 bod_effl:0.60, bod_effl_table:"[60%]", N_effl:0.90, N_effl_table:"[90%]"},
        {name:"Primary + Secondary (biological treatment plants)",                     bod_effl:0.15, bod_effl_table:"[15%]", N_effl:0.60, N_effl_table:"[60%]"},
        {name:"Primary + Secondary + Tertiary (advanced biological treatment plants)", bod_effl:0.10, bod_effl_table:"[10%]", N_effl:0.20, N_effl_table:"[20%]"},
    ],

    "WW treatment organics removal fractions (onsite) (Table 6.6B and 6.10C)":[
        {name:"Untreated systems",                                                                        bod_rmvd:0,     N_effl:1.00 },
        {name:"Septic tank/septic system",                                                                bod_rmvd:0.625, N_effl:0.85 },
        {name:"Septic tank/septic system + land dispersal field",                                         bod_rmvd:0.625, N_effl:0.32 },
        {name:"Latrines – Dry climate, groundwater table lower than latrine, small family (3–5 persons)", bod_rmvd:0.1,   N_effl:0.88 },
        {name:"Latrines – Dry climate, groundwater table lower than latrine, communal (many users)",      bod_rmvd:0.5,   N_effl:0.88 },
        {name:"Latrines – Wet climate/flush water use, groundwater table higher than latrine",            bod_rmvd:0.7,   N_effl:0.88 },
    ],

    //Andreoli et al table 2.2
    "Sludge characteristics in each stage of the treatment process":[
        {name:"Type of treatment undefined",                                     gSS_inh_day:0},
        {name:"Primary treatment (conventional)",                                gSS_inh_day:(35+45)/2},
        {name:"Primary treatment (septic tanks)",                                gSS_inh_day:(20+30)/2},
        {name:"Facultative pond",                                                gSS_inh_day:(20+25)/2},
        {name:"Anaerobic pond – facultative pond (anaerobic pond)",              gSS_inh_day:(20+45)/2},
        {name:"Anaerobic pond – facultative pond (facultative pond)",            gSS_inh_day:( 6+10)/2},
        {name:"Anaerobic pond – facultative pond (total)",                       gSS_inh_day:(26+55)/2},
        {name:"Facultative aerated lagoon",                                      gSS_inh_day:( 8+13)/2},
        {name:"Complete-mix aerat.lagoon – sedim. pond",                         gSS_inh_day:(11+13)/2},
        {name:"Septic tank+anaerobic filter (septic tank)",                      gSS_inh_day:(20+30)/2},
        {name:"Septic tank+anaerobic filter (anaerobic filter)",                 gSS_inh_day:( 7+9 )/2},
        {name:"Septic tank+anaerobic filter (total)",                            gSS_inh_day:(27+39)/2},
        {name:"Conventional activated sludge (primary sludge)",                  gSS_inh_day:(35+45)/2},
        {name:"Conventional activated sludge (secondary sludge)",                gSS_inh_day:(25+35)/2},
        {name:"Conventional activated sludge (mixed sludge)",                    gSS_inh_day:(60+80)/2},
        {name:"Activated sludge extended aeration",                              gSS_inh_day:(40+45)/2},
        {name:"High rate trickling filter (primary sludge)",                     gSS_inh_day:(35+45)/2},
        {name:"High rate trickling filter (secondary sludge)",                   gSS_inh_day:(20+30)/2},
        {name:"High rate trickling filter (mixed sludge)",                       gSS_inh_day:(55+75)/2},
        {name:"Submerged aerated biofilter (primary sludge)",                    gSS_inh_day:(35+45)/2},
        {name:"Submerged aerated biofilter (secondary sludge)",                  gSS_inh_day:(25+35)/2},
        {name:"Submerged aerated biofilter (mixed sludge)",                      gSS_inh_day:(60+80)/2},
        {name:"UASB Reactor",                                                    gSS_inh_day:(12+18)/2},
        {name:"UASB+activated sludge (anaerobic sludge (UASB))",                 gSS_inh_day:(12+18)/2},
        {name:"UASB+activated sludge (aerobic sludge (activated sludge))",       gSS_inh_day:( 8+14)/2},
        {name:"UASB+activated sludge (mixed sludge)",                            gSS_inh_day:(20+32)/2},
        {name:"UASB+aerobic biofilm reactor (anaerobic sludge (UASB))",          gSS_inh_day:(12+18)/2},
        {name:"UASB+aerobic biofilm reactor (aerobic sludge (aerobic reactor))", gSS_inh_day:( 6+12)/2},
        {name:"UASB+aerobic biofilm reactor (mixed sludge)",                     gSS_inh_day:(18+30)/2},
    ],

    "Type of sludge disposed":[
        {name:"Type of sludge disposed", f_ch4:0,  N_cont:0, TVS:0, description:"" },
        {name:"Non-digested",            f_ch4:53, N_cont:3, TVS:70, description:""},
        {name:"Digested",                f_ch4:6,  N_cont:4, TVS:51, description:""},
    ],

    //for land application and landfilling
    "Type of faecal sludge":[
        {name:"Type of faecal sludge undefined", N_content:0.00, TVS:0,  total_solids:0.00},
        {name:"Untreated faecal sludge",         N_content:0.24, TVS:70, total_solids:0.04},
        {name:"Treated faecal sludge",           N_content:3.00, TVS:40, total_solids:0.22},
        {name:"Pit humus",                       N_content:4.00, TVS:65, total_solids:0.07},
        {name:"Dehydrated faeces",               N_content:3.00, TVS:70, total_solids:0.27},
        {name:"Compost",                         N_content:3.00, TVS:80, total_solids:0.08},
        {name:"Septic tank sludge",              N_content:0.03, TVS:60, total_solids:0.02},
    ],

    "Type of landfill":[
        {name:"Landfill",                     MCF:1, description: ""},
        {name:"Landfill (with gas recovery)", MCF:0.02, description: ""},
        {name:"Landfill (flaring)",           MCF:0, description: ""},
    ],

    //f_la: gN transformed to gN2O
    "Soil type":[
        {name:"Soil type undefined",         f_la:0.000, description: ""},
        {name:"Fine-Textured (>30% clay)",   f_la:0.023, description: ""},
        {name:"Coarse-Textured (<30% clay)", f_la:0.005, description: ""},
    ],

    "Type of containment":[
        {name:"Containment undefined",                                          ch4_efac:0,      ch4_efac_flooding:0,     BOD_conc_FS:0,    fs_density:0   },
        {name:"No containment (open defecation)",                               ch4_efac:0.027,  ch4_efac_flooding:0.027, BOD_conc_FS:67.8, fs_density:1400},
        {name:"Pit latrine without flush water (lined or unlined) – household", ch4_efac:0.06,   ch4_efac_flooding:0.42,  BOD_conc_FS:67.8, fs_density:1400},
        {name:"Pit latrine without flush water (lined or unlined) – communal",  ch4_efac:0.3,    ch4_efac_flooding:0.42,  BOD_conc_FS:67.8, fs_density:1400},
        {name:"Pit latrine with flush water use (lined or unlined)",            ch4_efac:0.42,   ch4_efac_flooding:0.42,  BOD_conc_FS:67.8, fs_density:1400},
        {name:"Septic tank (with or without dispersal field)",                  ch4_efac:0.3,    ch4_efac_flooding:0.42,  BOD_conc_FS:1.35, fs_density:1100},
        {name:"Fully lined tank without flush water use – not water tight",     ch4_efac:0.3,    ch4_efac_flooding:0.42,  BOD_conc_FS:67.8, fs_density:1400},
        {name:"Fully lined tank without flush water use – water tight",         ch4_efac:0.42,   ch4_efac_flooding:0.42,  BOD_conc_FS:67.8, fs_density:1400},
        {name:"Fully lined tank with flush water use - water tight or untight", ch4_efac:0.42,   ch4_efac_flooding:0.42,  BOD_conc_FS:67.8, fs_density:1400},
        {name:"Urine Diverting Dry Toilet (UDDT)",                              ch4_efac:0.0,    ch4_efac_flooding:0.42,  BOD_conc_FS:67.8, fs_density:1400},
        {name:"Composting Toilet",                                              ch4_efac:0.0013, ch4_efac_flooding:0.42,  BOD_conc_FS:67.8, fs_density:1400},
        {name:"Imhoff tank",                                                    ch4_efac:0.48,   ch4_efac_flooding:0.42,  BOD_conc_FS:67.8, fs_density:1400},
    ],

    "Yes/No":[
        {text:"No", value: 0},
        {text:"Yes", value: 1},
    ],
};

//get row object by "table" (string) and "index" (integer)
Tables.get_row=function(table, index){
    let t=Tables[table]; //array

    //check if table exists
    if(!t       ) throw `Table "${table}" does not exist`;
    if(!t[index]) throw `Table.${table}[${index}] does not exist`;

    //checks passed: return row
    return t[index];
};

//table titles and/or descriptions
Tables.get_table_description=function(table_name){
    return {
        "type_of_water_body":    "EFCH4 for Type of Water Body (Table 6.3)",
        "type_of_sewer":         "EFCH4 for Type of Sewer (Table 6.3)",
        "type_of_treatment":     "EFCH4 for Type of Treatment (Table 6.3)",
        "type_of_treatment_KREM":"Removal of organic component from wastewater as sludge (KREM) according to treatment type (Table 6.6A)",
    }[table_name]||table_name;
};

/*
  CONSTANTS
*/
let Cts={
    ct_ch4_eq:{
        value:34,
        descr:"Conversion of CH4 emissions to CO2 equivalent emissions",
        unit:"kgCO2eq/kgCH4",
    },
    ct_n2o_eq:{
        value:298,
        descr:"Conversion of N2O emissions to CO2 equivalent emissions",
        unit:"kgCO2eq/kgN2O",
    },
    ct_C_to_CH4_16_12:{
        value:16/12,
        descr:"Organic C to CH4 conversion factor (=16/12)",
        unit:"gCH4/gOC"
    },
    ct_N_to_N2O_44_28:{
        value:44/28,
        descr:"N2O-N to N2O conversion factor (=44/28)",
        unit:"gN2O/gN2O-N",
    },
    ct_C_to_CO2_44_12:{
        value:44/12,
        descr:"C to CO2 conversion (=44/12)",
        unit:"gCO2/gC",
    },
    ct_VS_to_OC:{
        value:0.56,
        descr:"Organic Carbon content in Volatile Solids",
        unit:"gOC/gVS",
    },
};





export default {
    Assessment,
    Industry,
}

/*
  Assessment example:
    - create an assessment
    - add 1 industry
    - modify some inputs
    - calculate total emissions
*/



/*
let a = new Assessment();
a.add_industry();
a.industries[0].wwt_nrg_cons = 500;
a.industries[0].wwt_conv_kwh = 0.5;
console.log(a.TotalGHG());*/