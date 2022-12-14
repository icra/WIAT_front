
/*
  UTILS
*/
import {utils} from "./utils"
import Countries from "./countries"
import {level_of_certainty} from "@/level_of_certainty";

//sum array of numbers
Array.prototype.sum=function(){return this.reduce((p,c)=>(parseFloat(p)+parseFloat(c)),0)};

function sumObjectsByKey(...objs) {
    return objs.reduce((a, b) => {
        for (let k in b) {
            if (b.hasOwnProperty(k))
                a[k] = (a[k] || 0) + b[k];
        }
        return a;
    }, {});
}
/*
  ASSESSMENT: main class
*/

export class Assessment{
    constructor(){
        this.name="new assessment";

        //assessment period
        this.assessment_period_start = (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10)
        this.assessment_period_end   = new Date(new Date().setFullYear((new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).getFullYear() + 1)).toISOString().substr(0, 10)

        //array for "Industry" objects
        this.industries=[];
    }

    /*
      methods
    */

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

    constructor(){
        this.name = "new industry";
        this.location = null
        this.streamflow = null
        this.water_stress = null
        this.has_onsite_wwtp = null
        this.has_offsite_wwtp = null
        this.volume_withdrawn = null   //Amount of superficial water withdrawn from the wb per day(m3/day)
        this.volume_withdrawn_groundwater = 0   //Amount of groundwater water withdrawn from the wb per day(m3/day)
        this.volume_external_sources = 0   //Amount of water from external sources per day(m3/day)
        this.has_direct_discharge = null
        this.industry_type = null

        this.ind_pollutants_effl = { //Concentration of pollutants in the industry effluent (before being treated by WWTP)
            COD: 0,
            TN: 0,
            TP: 0
        }

        this.ind_pollutants_infl = { //Concentration of pollutants in the industry influent (upstream the industry)
            COD: 0,
            TN: 0,
            TP: 0
        }

        this.pollutants_selected = ["COD", "TN", "TP"]
        this.product_produced = null
        this.supply_chain = []  //Suppliers

        this.level_of_certainty = level_of_certainty.set_level_of_certainty(this, 1, true)
        //this.level_of_certainty = {}

        this.direct_discharge = new Direct_discharge(this)
        this.onsite_wwtp = new WWTP(2, this)
        this.offsite_wwtp = new WWTP(4, this)


    }
    //emissions from biogenic emissions
    biogenic_emissions(){

        let flared = this.onsite_wwtp.wwt_KPI_GHG_biog_flared().total + this.offsite_wwtp.wwt_KPI_GHG_biog_flared().total
        let valorized = this.onsite_wwtp.wwt_KPI_GHG_biog_valorized().total + this.offsite_wwtp.wwt_KPI_GHG_biog_valorized().total
        let total = flared + valorized
        return {flared, valorized, total}
    }


    energy_used(){
        let energy = 0
        if(this.has_onsite_wwtp == 1){
            energy += this.onsite_wwtp.wwt_vol_trea*this.onsite_wwtp.wwt_nrg_cons
        }
        if(this.has_offsite_wwtp == 1){
            energy += (this.offsite_wwtp.wwt_vol_trea + this.offsite_wwtp.wwt_vol_from_external)*this.offsite_wwtp.wwt_nrg_cons
        }
        return energy
    }

    //Delete i-th suplier
    delete_supply_chain(i){
        this.supply_chain.splice(i,1);
    }

    add_industry_to_supply_chain(industry){
        this.supply_chain.push(industry)
    }

    //GHG deglossed by use
    ghg(){
        let onsite_wwtp = this.onsite_wwtp.wwt_KPI_GHG()
        let offsite_wwtp = this.offsite_wwtp.wwt_KPI_GHG()
        let direct_discharge = this.direct_discharge.wwt_KPI_GHG()
        return sumObjectsByKey(onsite_wwtp, offsite_wwtp, direct_discharge)
    }

    //GHG from sludge management deglossed by origin
    sludge_management_emissions(){
        let storage = sumObjectsByKey(this.onsite_wwtp.wwt_KPI_GHG_sludge_storage(), this.offsite_wwtp.wwt_KPI_GHG_sludge_storage()).total
        let composting = sumObjectsByKey(this.onsite_wwtp.wwt_KPI_GHG_sludge_composting(), this.offsite_wwtp.wwt_KPI_GHG_sludge_composting()).total
        let land_application = sumObjectsByKey(this.onsite_wwtp.wwt_KPI_GHG_sludge_land_application(), this.offsite_wwtp.wwt_KPI_GHG_sludge_land_application()).total
        let landfilling = sumObjectsByKey(this.onsite_wwtp.wwt_KPI_GHG_sludge_landfilling(), this.offsite_wwtp.wwt_KPI_GHG_sludge_landfilling()).total
        let stockpilling = sumObjectsByKey(this.onsite_wwtp.wwt_KPI_GHG_sludge_stockpilling(), this.offsite_wwtp.wwt_KPI_GHG_sludge_stockpilling()).total
        let sludge_transport = sumObjectsByKey(this.onsite_wwtp.wwt_KPI_GHG_sludge_transport(), this.offsite_wwtp.wwt_KPI_GHG_sludge_transport()).total
        let incineration = sumObjectsByKey(this.onsite_wwtp.wwt_KPI_GHG_sludge_incineration(), this.offsite_wwtp.wwt_KPI_GHG_sludge_incineration()).total


        return {storage, composting, land_application, landfilling, stockpilling, sludge_transport, incineration}
    }

    //GHG deglossed CO2, CH4 and N2O
    ghg_deglossed(){
        let onsite_wwtp = this.onsite_wwtp.wwt_KPI_GHG_deglossed()
        let offsite_wwtp = this.offsite_wwtp.wwt_KPI_GHG_deglossed()
        let direct_discharge = this.direct_discharge.wwt_KPI_GHG_deglossed()
        return sumObjectsByKey(onsite_wwtp, offsite_wwtp, direct_discharge)
    }

    //Update onsite wwtp
    update_onsite_wwtp(){
        let wwtp = this.onsite_wwtp
        wwtp.location = this.location
        for (let pollutant of this.pollutants_selected){
            wwtp.wwt_pollutants_infl_ind[pollutant] = this.ind_pollutants_effl[pollutant]
            wwtp.wwt_pollutants_infl_wwtp[pollutant] = 0
            if (!wwtp.wwt_pollutants_effl.hasOwnProperty(pollutant)) wwtp.wwt_pollutants_effl[pollutant] = 0
        }
        //wwtp.level_of_certainty['wwt_pollutants_infl_ind'] = JSON.parse(JSON.stringify(this.level_of_certainty["ind_pollutants_effl"]))

        if(this.has_offsite_wwtp != 1)  wwtp.wwt_vol_treated_external = 0
        wwtp["level_of_certainty"] = level_of_certainty.set_level_of_certainty(this, 2)


    }

    //Set onsite WWTP default values
    reset_onsite_wwtp(){
        this.onsite_wwtp = new WWTP(2, this)
    }

    //Update directly discharged water
    update_direct_discharge(){
        let direct_discharge = this.direct_discharge

        for (let pollutant of this.pollutants_selected){
            direct_discharge.wwt_pollutants_effl[pollutant] = this.ind_pollutants_effl[pollutant]
        }
        //direct_discharge.level_of_certainty['wwt_pollutants_effl'] = JSON.parse(JSON.stringify(this.level_of_certainty["ind_pollutants_effl"]))
        direct_discharge["level_of_certainty"] = level_of_certainty.set_level_of_certainty(this, 3)


    }

    //Set directly discharged water default values
    reset_direct_discharge(){
        this.direct_discharge = new Direct_discharge(this)
    }

    //Update offsite wwtp if industry or connected onsite WWTP has changed
    update_offsite_wwtp(){
        let wwtp = this.offsite_wwtp
        let onsite_wwtp = this.onsite_wwtp
        let _this = this


        wwtp.location = this.location

        for (let pollutant of this.pollutants_selected){
            wwtp.wwt_pollutants_infl_ind[pollutant] = this.ind_pollutants_effl[pollutant]
            wwtp.wwt_pollutants_infl_wwtp[pollutant] = _this.has_onsite_wwtp == 1 ? onsite_wwtp["wwt_pollutants_effl"][pollutant] : 0
        }

        wwtp.wwt_vol_from_external = _this.has_onsite_wwtp == 1 ? onsite_wwtp.wwt_vol_treated_external : 0

        /*wwtp.level_of_certainty['wwt_pollutants_infl_ind'] = JSON.parse(JSON.stringify(this.level_of_certainty["ind_pollutants_effl"]))
        if (_this.has_onsite_wwtp == 1){
            wwtp.level_of_certainty['wwt_pollutants_infl_wwtp'] = JSON.parse(JSON.stringify(this.onsite_wwtp.level_of_certainty["wwt_pollutants_effl"]))
        }*/
        wwtp["level_of_certainty"] = level_of_certainty.set_level_of_certainty(this, 4)


    }

    //Set offsite WWTP default values
    reset_offsite_wwtp(){
        this.offsite_wwtp = new WWTP(4, this)
    }


    //Adds load of pollutant from onsite WWTP (after being treated), offsite WWTP (after being treated) and directly discharged water
    //if only_same_watershed is true, only loads from the same watershed are added
    effl_pollutant_load(pollutant, only_same_watershed = false){
        let load = 0
        if(this.has_onsite_wwtp == 1) {

            let concentration = 0
            if(this.onsite_wwtp.wwt_pollutants_effl.hasOwnProperty(pollutant)){
                concentration = this.onsite_wwtp.wwt_pollutants_effl[pollutant]
            }
            if (!only_same_watershed || this.onsite_wwtp.discharge_same_location_as_withdrawal == 1){
                load += concentration * this.onsite_wwtp.wwt_vol_disc // g/day
            }
        }
        if(this.has_direct_discharge == 1) {
            let concentration = 0
            if(this.direct_discharge.wwt_pollutants_effl.hasOwnProperty(pollutant)){
                concentration = this.direct_discharge.wwt_pollutants_effl[pollutant]
            }
            if (!only_same_watershed || this.direct_discharge.discharge_same_location_as_withdrawal == 1){
                load += concentration  *  this.direct_discharge.dd_vol_disc  // g/day
            }
        }
        if(this.has_offsite_wwtp == 1){
            let concentration = 0
            if(this.offsite_wwtp.wwt_pollutants_effl.hasOwnProperty(pollutant)){
                concentration = this.offsite_wwtp.wwt_pollutants_effl[pollutant]
            }
            if (!only_same_watershed || this.offsite_wwtp.discharge_same_location_as_withdrawal == 1){
                load += concentration * this.offsite_wwtp.wwt_vol_disc  // g/day
            }

        }
        return load
    }

    //Load of pollutant from the surface water withdrawn by the industry
    infl_pollutant_load(pollutant){

        let concentration = 0
        if(this.ind_pollutants_infl.hasOwnProperty(pollutant)){
            concentration = this.ind_pollutants_infl[pollutant]
        }

        return concentration*this.volume_of_surface_water_withdrawn()
    }

    //Adds load of pollutant from onsite WWTP (before being treated), offsite WWTP (before being treated) and directly discharged water
    generated_pollutant_load(pollutant){
        let load = 0
        let concentration = 0
        if(this.ind_pollutants_effl.hasOwnProperty(pollutant)){
            concentration = this.ind_pollutants_effl[pollutant]
        }
        if(this.has_onsite_wwtp == 1) {
            load += concentration * this.onsite_wwtp.wwt_vol_trea // g/day
        }
        if(this.has_direct_discharge == 1) {
            load += concentration  *  this.direct_discharge.dd_vol_disc  // g/day
        }
        if(this.has_offsite_wwtp == 1){
            load += concentration * this.offsite_wwtp.wwt_vol_trea  // g/day
        }
        return load
    }

    //Amount of pollutant removed by applying WWTP's treatment
    filtered_pollutant_load(industry_effluent, wwtp_effluent){

        let pollutant_generated = this.generated_pollutant_load(industry_effluent)
        let pollutant_discharged = this.effl_pollutant_load(wwtp_effluent)

        return pollutant_generated - pollutant_discharged
    }

    //Water discharged by the industry
    //if only_same_watershed is true, only discharges in same watershed where water was withdrawn are added
    water_discharged(only_same_watershed = false){
        let water_discharged = 0
        if(this.has_onsite_wwtp == 1) {
            if (!only_same_watershed || this.onsite_wwtp.discharge_same_location_as_withdrawal == 1){
                water_discharged += this.onsite_wwtp.wwt_vol_disc
            }
        }  //m3/day
        if(this.has_direct_discharge == 1) {
            if (!only_same_watershed || this.direct_discharge.discharge_same_location_as_withdrawal == 1){
                water_discharged += this.direct_discharge.dd_vol_disc
            }
        } //m3/day
        if(this.has_offsite_wwtp == 1) {
            if (!only_same_watershed || this.offsite_wwtp.discharge_same_location_as_withdrawal == 1){
                water_discharged += this.offsite_wwtp.wwt_vol_disc

            }
        } //m3/day
        return water_discharged
    }

    //Water discharged by onsite WWTP
    water_discharged_onsite(){
        let water_discharged = 0
        if(this.has_onsite_wwtp == 1) water_discharged += this.onsite_wwtp.wwt_vol_disc  //m3/day
        return water_discharged
    }

    //Amount of water directly discharged
    water_directly_discharged(){
        let water_discharged = 0
        if(this.has_direct_discharge == 1) water_discharged += this.direct_discharge.dd_vol_disc //m3/day
        return water_discharged
    }

    //Water discharged by external WWTP
    water_discharged_offsite(){
        let water_discharged = 0
        if(this.has_offsite_wwtp == 1) water_discharged += this.offsite_wwtp.wwt_vol_disc //m3/day
        return water_discharged
    }

    //Water treated by onsite WWTP reused by industry
    water_recycled(){
        if(this.has_onsite_wwtp == 1) return this.onsite_wwtp.wwt_vol_reused
        else return 0
    }

    tonnes_of_product(){
        return this.product_produced == null ? 0 : this.product_produced
    }

    //groundwater + superficial
    volume_of_water_withdrawn(){
        let superficial = this.volume_withdrawn == null ? 0 : this.volume_withdrawn
        let groundwater = this.volume_withdrawn_groundwater == null ? 0 : this.volume_withdrawn_groundwater
        return superficial+groundwater
    }

    //superficial
    volume_of_surface_water_withdrawn(){
        return this.volume_withdrawn == null ? 0 : this.volume_withdrawn
    }

    //groundwater
    volume_of_groundwater_water_withdrawn(){
        return this.volume_withdrawn_groundwater == null ? 0 : this.volume_withdrawn_groundwater
    }

    //external sources
    volume_of_external_sources() {
        return this.volume_external_sources == null ? 0 : this.volume_external_sources
    }
    //Amount of water treated by onsite and external WWTP
    volume_of_water_treated(){
        let water_treated = 0
        if(this.has_onsite_wwtp == 1) {
            water_treated += this.onsite_wwtp.wwt_vol_trea
        }  //m3/day
        if(this.has_offsite_wwtp == 1) {
            water_treated += this.offsite_wwtp.wwt_vol_trea
        }
        return water_treated
    }

    //Amount of water treated by onsite WWTP + amount of water treated by external WWTP + directly discharged water
    water_generated(){
        let volume = 0
        if(this.has_onsite_wwtp == 1) {
            volume += this.onsite_wwtp.wwt_vol_trea
        }
        if(this.has_direct_discharge == 1) {
            volume += this.direct_discharge.dd_vol_disc
        }
        if(this.has_offsite_wwtp == 1){
            volume += this.offsite_wwtp.wwt_vol_trea
        }
        return volume
    }

};

export class Direct_discharge{

    constructor(industry = null, set_level_of_certainty = true){
        this.level_of_certainty = {}
        this.discharge_same_location_as_withdrawal = 1  //yes/no

        this.wwt_pollutants_effl = {
            COD: 0,
            TN: 0,
            TP: 0
        }

        this.dd_vol_disc = null
        this.wwt_ch4_efac_dis = 0
        this.wwt_n2o_efac_dis = 0

        if (set_level_of_certainty) this.level_of_certainty = level_of_certainty.set_level_of_certainty(industry, 3, true)
        else this.level_of_certainty = {}

    }

    /*
      GHG emissions (kgCO2eq)
    */
    //total GHG emissions deglossed by use
    wwt_KPI_GHG(){
        let elec = 0
        let fuel = 0
        let treatment = 0
        let biog = 0
        let slu = 0
        let reuse = 0
        let disc = this.wwt_KPI_GHG_disc().total
        let total = disc

        return {elec, fuel, treatment, biog, slu, reuse, disc, total}
    }

    //total GHG emissions deglossed by origin (CO2, N2O and CH4)
    wwt_KPI_GHG_deglossed(){
        let disc = this.wwt_KPI_GHG_disc()

        let co2 = disc.co2
        let n2o = disc.n2o
        let ch4 = disc.ch4

        return {co2, n2o, ch4}
    }


    //emissions from water discharged
    wwt_KPI_GHG_disc(){
        let co2   = 0;

        let cod = this.wwt_pollutants_effl["COD"]
        let tn = this.wwt_pollutants_effl["TN"]

        let ch4   = cod*this.wwt_ch4_efac_dis*Cts.ct_ch4_eq.value;    //Equation 6.2 IPCC
        let n2o   = tn*this.wwt_n2o_efac_dis*Cts.ct_N_to_N2O_44_28.value*Cts.ct_n2o_eq.value;    //Equation 6.12 IPCC
        let total = co2+ch4+n2o;
        return {total,co2,ch4,n2o};
    }

};  //Direct discharge

export class WWTP{
    //if step==2, onsite WWTP, if step == 4 external WWTP
    constructor(step, industry = null, set_level_of_certainty = true){

        this.location = null
        if (industry != null) this.location = industry.location
        this.discharge_same_location_as_withdrawal = 1  //yes/no

        this.wwt_treatment_type = 0
        this.wwt_vol_trea = null            //Amount of water treated by WWTP
        this.wwt_vol_disc = null            //Amount of water discharged by WWTP
        this.wwt_vol_reused = 0             //Amount of recycled water sent to industry (input in onsite WWTP)
        this.wwt_vol_treated_external = 0   //Amount of water treated in another WWTP (input in onsite WWTP)
        this.wwt_vol_from_external = 0      //Amount of water FROM other WWTP (input in offsite WWTP)

        this.wwt_pollutants_infl_ind = {    //Pollutant concentration of water that comes directly from industry (without being treated)
            COD: 0,
            TN: 0,
            TP: 0,
        }

        this.wwt_pollutants_infl_wwtp = {    //Pollutant concentration of water that comes from onsite WWTP (already treated)
            COD: 0,
            TN: 0,
            TP: 0,
        }

        this.wwt_pollutants_effl =  {        //Pollutant concentration of water discharged by current WWTP (already treated))
            COD: 0,
            TN: 0,
            TP: 0,
        }

        //energy
        this.wwt_nrg_cons = 0
        this.wwt_conv_kwh = 0

        //emission factors (treatment)
        this.wwt_ch4_efac_tre = 0
        this.wwt_n2o_efac_tre = 0

        //emission factors (discharge)
        this.wwt_ch4_efac_dis = 0
        this.wwt_n2o_efac_dis = 0

        //fuel engines
        this.wwt_vol_fuel = 0; //L of fuel
        this.wwt_fuel_typ = 0; //Option | type of fuel (see Tables)

        //biogas
        this.wwt_biog_pro = 0;  //Nm3 | total biogas produced
        this.wwt_biog_fla = 0; //% of biogas produced that is flared
        this.wwt_biog_val = 0;  //% of biogas produced that is used for heat
        this.wwt_biog_lkd = 0;  //% of biogas produced that is leaked
        this.wwt_biog_sold = 0;
        this.wwt_ch4_biog = 0; //% of CH4 in biogas (volume)
        this.wwt_dige_typ = 0;  //Option | type of fuel for digester
        this.wwt_fuel_dig = 0;  //L | volume of fuel used in the digester

        //fuel used in water reuse trucks
        this.wwt_reus_trck_typ = 0; //Option | type of fuel
        this.wwt_reus_vol_trck = 0; //L | volume of fuel used

        //SLUDGE MANAGEMENT
        this.wwt_mass_slu = 0; //kg | raw sludge removed from wwtp as dry mass
        this.wwt_cod_slud = 0; //kg | BOD removed as sludge

        //sludge storage
        this.wwt_mass_slu_sto  = 0; //kg of sludge stored
        this.wwt_time_slu_sto  = 0; //days
        this.wwt_slu_sto_TVS   = 0; //%
        this.wwt_slu_sto_f_CH4 = 0; //% for CH4 potential
        this.wwt_slu_sto_EF    = 0; //%

        //sludge composting
        this.wwt_mass_slu_comp                          = 0; //kg of sludge composted
        this.wwt_slu_comp_emis_treated_or_piles_covered = 0; //yes/no
        this.wwt_slu_comp_solids_content                = 0; //%
        this.wwt_slu_comp_TVS                           = 0; //%
        this.wwt_slu_comp_N_cont                        = 0; //%
        this.wwt_slu_comp_low_CN_EF                     = 0; //kgN2O-N/kgN
        this.wwt_slu_comp_uncovered_pile_EF             = 0; //kgCH4/kgC
        this.wwt_slu_comp_seqst_rate                    = 0; //kgCO2eq/kgSludge

        //sludge incineration
        this.wwt_mass_slu_inc   = 0;    //kg of sludge incinerated
        this.wwt_temp_inc       = 0; //K | temperature incineration
        this.wwt_slu_inc_N_cont = 0;    //% of N
        this.wwt_slu_inc_SNCR   = 0;    //boolean

        //sludge LA
        this.wwt_mass_slu_app          = 0; //kg of sludge sent to LA
        this.wwt_slu_la_solids_content = 0; //%
        this.wwt_slu_la_TVS            = 0; //%
        this.wwt_slu_la_N_cont         = 0; //%
        this.wwt_slu_la_EF             = 0; //gN2O-N/gN

        //sludge LF
        this.wwt_mass_slu_land      = 0;    //kg of sludge sent to LF
        this.wwt_slu_lf_TVS         = 0;    //%
        this.wwt_slu_lf_uncertainty = 0;  //adimensional
        this.wwt_slu_lf_CH4_in_gas  = 0;   //%
        this.wwt_slu_lf_DOCf        = 0;   //%
        this.wwt_slu_lf_decomp_3yr  = 0; //%
        this.wwt_slu_lf_MCF         = 0;    //ratio
        this.wwt_slu_lf_N_cont      = 0;    //% N content
        this.wwt_slu_lf_low_CN_EF   = 0; //kgN2O-N/kgN

        //sludge SP
        this.wwt_mass_slu_stock = 0;  //kg of sludge stockpiled
        this.wwt_slu_sp_lifespan = 0; //years

        //sludge truck transport
        this.wwt_trck_typ = 0; //Option | fuel type
        this.wwt_vol_tslu = 0; //L | volume of fuel

        if (set_level_of_certainty) this.level_of_certainty = level_of_certainty.set_level_of_certainty(industry, step, true)
        else this.level_of_certainty = {}


    }
    /*
    GHG emissions (kgCO2eq)
    */
    //total GHG emissions deglossed by use
    wwt_KPI_GHG(){

        let elec = this.wwt_KPI_GHG_elec().total
        let fuel = this.wwt_KPI_GHG_fuel().total
        let treatment = this.wwt_KPI_GHG_tre().total
        let biog = this.wwt_KPI_GHG_biog().total
        let digester_fuel = this.wwt_KPI_GHG_dig_fuel().total
        let slu = this.wwt_KPI_GHG_slu().total
        let reuse = this.wwt_KPI_GHG_reus_trck().total
        let disc = this.wwt_KPI_GHG_disc().total


        let obj = {elec, fuel, treatment, biog, digester_fuel, slu, reuse, disc}
        obj["total"] = Object.values(obj).sum()

        return obj
    }

    //GHG separated by CO2, N2O, CH4
    wwt_KPI_GHG_deglossed(){
        let elec = this.wwt_KPI_GHG_elec()
        let fuel = this.wwt_KPI_GHG_fuel()
        let treatment = this.wwt_KPI_GHG_tre()
        let biog = this.wwt_KPI_GHG_biog()
        let digester_fuel = this.wwt_KPI_GHG_dig_fuel()
        let slu = this.wwt_KPI_GHG_slu()
        let reuse = this.wwt_KPI_GHG_reus_trck()
        let disc = this.wwt_KPI_GHG_disc()

        let arr = [elec, fuel, treatment, biog, digester_fuel, slu, reuse, disc]
        let co2 = arr.map(x => x.co2).sum()
        let n2o = arr.map(x => x.n2o).sum()
        let ch4 = arr.map(x => x.ch4).sum()

        return {co2, n2o, ch4}
    }


    //emissions from water discharged
    wwt_KPI_GHG_disc(){
        let co2   = 0;

        let cod = this.wwt_pollutants_effl["COD"]
        let tn = this.wwt_pollutants_effl["TN"]

        let ch4   = cod*this.wwt_vol_disc*this.wwt_ch4_efac_dis*Cts.ct_ch4_eq.value;    //Equation 6.2
        let n2o   = tn *this.wwt_vol_disc*this.wwt_n2o_efac_dis*Cts.ct_N_to_N2O_44_28.value*Cts.ct_n2o_eq.value;    //Equation 6.12
        let total = co2+ch4+n2o;
        return {total,co2,ch4,n2o};
    }

    //emissions from treatment
    wwt_KPI_GHG_tre(){

        let cod_infl_ind = this.wwt_pollutants_infl_ind["COD"]
        let tn_infl_ind = this.wwt_pollutants_infl_ind["TN"]
        let cod_infl_wwtp = this.wwt_pollutants_infl_wwtp["COD"]
        let tn_infl_wwtp = this.wwt_pollutants_infl_wwtp["TN"]

        let cod_load = cod_infl_ind*this.wwt_vol_trea + this.wwt_vol_from_external*cod_infl_wwtp
        let tn_load = tn_infl_ind*this.wwt_vol_trea + this.wwt_vol_from_external*tn_infl_wwtp

        let co2   = 0;
        let ch4   = (cod_load-this.wwt_cod_slud)*this.wwt_ch4_efac_tre*Cts.ct_ch4_eq.value;    //Eq. 6.4
        let n2o   = tn_load*this.wwt_n2o_efac_tre*Cts.ct_N_to_N2O_44_28.value*Cts.ct_n2o_eq.value;  //Eq. 6.11
        let total = co2+ch4+n2o;
        return {total,co2,ch4,n2o};
    }

    //indirect emissions from electricity consumption
    wwt_KPI_GHG_elec(){
        let co2 = this.wwt_vol_trea*this.wwt_nrg_cons*this.wwt_conv_kwh;
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
    wwt_KPI_GHG_dig_fuel(){
        let vol   = this.wwt_fuel_dig;
        let fuel  = Tables.get_row('Fuel type',this.wwt_dige_typ);
        let co2   = vol*fuel.FD*fuel.NCV/1000*fuel.EFCO2
        let ch4   = vol*fuel.FD*fuel.NCV/1000*fuel.EFCH4.engines*Cts.ct_ch4_eq.value;
        let n2o   = vol*fuel.FD*fuel.NCV/1000*fuel.EFN2O.engines*Cts.ct_n2o_eq.value;
        let total = co2+n2o+ch4;
        return {total,co2,ch4,n2o};
    }

    //emissions from biogas
    wwt_KPI_GHG_biog(){
        let sources=[
            //this.wwt_KPI_GHG_biog_flared(),
            //this.wwt_KPI_GHG_biog_valorized(),
            this.wwt_KPI_GHG_biog_leaked(),
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

        let moles_co2_to_atmosphere = moles_biogas_flared; //moles of CO2
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

        let moles_co2_to_atmosphere = moles_biogas_valorized; //moles of CO2
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

        //if Tf < 750??C, use 750 ??C (1023 K)
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

        //year 1 to 3eel
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
        let fuel  = Tables.get_row('Fuel type', this.wwt_reus_trck_typ);
        let co2   = vol*fuel.FD*fuel.NCV/1000*fuel.EFCO2;
        let ch4   = vol*fuel.FD*fuel.NCV/1000*fuel.EFCH4.vehicles*Cts.ct_ch4_eq.value;
        let n2o   = vol*fuel.FD*fuel.NCV/1000*fuel.EFN2O.vehicles*Cts.ct_n2o_eq.value;
        let total = co2+n2o+ch4;
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
        const R = 8.31446261815324; //J/K??mol
        const T = 273.15; //K == 0??C
        return P*V/(R*T); //"moles" of biogas produced
    }
};  //WWTP with sludge management


/*
  TABLES
  Data structure for tabled values or dropdown menus
  used for two kinds of variables:
   1. nominal variables (strings) with magnitude==Option
   2. numeric variables inside Exceptions
*/
export let Tables={

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
        {name:"Water body undefined",                                                                   ch4_efac:0, ch4_efac_bod:0, description:""     },
        {name:"Discharge to aquatic environments (Tier 1)",                                             ch4_efac:0.028, ch4_efac_bod:0.068, description:"" },
        {name:"Discharge to aquatic environments other than reservoirs, lakes, and estuaries (Tier 2)", ch4_efac:0.009, ch4_efac_bod:0.021, description:"" },
        {name:"Discharge to reservoirs, lakes, and estuaries (Tier 2)",                                 ch4_efac:0.048, ch4_efac_bod:0.114, description:"" },
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
        {name:"Type of treatment undefined",                                  ch4_efac:0,  ch4_efac_bod: 0, description: ""   },
        {name:"Centralised, aerobic, treatment plant",                        ch4_efac:0.0075, ch4_efac_bod:0.018, description: ""},
        {name:"Anaerobic Reactor - CH4 recovery not considered",              ch4_efac:0.2, ch4_efac_bod:0.48, description: ""},
        //{name:"Anaerobic Reactor - CH4 recovery considered",                  ch4_efac:0.14,  description: ""},
        {name:"Anaerobic shallow lagoon and facultative lagoons (<2m depth)", ch4_efac:0.05,  ch4_efac_bod:0.12,description: ""},
        {name:"Anaerobic deep lagoon (>2m depth)",                            ch4_efac:0.2,  ch4_efac_bod:0.48, description: ""},
        //{name:"Anaerobic Lagoon covered",                                     ch4_efac:0,     description: ""},
        {name:"Wetlands - Surface flow",                                      ch4_efac:0.1,  ch4_efac_bod:0.24, description: ""},
        {name:"Wetlands - Horizontal subsurface flow",                        ch4_efac:0.025,  ch4_efac_bod:0.06, description: ""},
        {name:"Wetlands - Vertical subsurface flow",                          ch4_efac:0.0025, ch4_efac_bod:0.006, description: ""},
        //{name:"Activated Sludge - Well managed",                              ch4_efac:0,     description: ""},
        //{name:"Activated Sludge - Minor poorly aerated zones",                ch4_efac:0.06,  description: ""},
        //{name:"Activated Sludge - Some aerated zones",                        ch4_efac:0.12,  description: ""},
        //{name:"Activated Sludge - Not well managed",                          ch4_efac:0.18,  description: ""},
        //{name:"Aerated Lagoon",                                               ch4_efac:0.06,  description: ""},
        //{name:"Trickling Filter",                                             ch4_efac:0.036, description: ""},
    ],


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
        {name:"Mechanical treatment plants (primary sedimentation sludge)",                                                                                 K_rem:0.20833, K_rem_bod:0.50},
        {name:"Aerobic treatment plants with primary treatment (mixed primary and secondary sludge, untreated or treated aerobically)",                     K_rem:0.33333, K_rem_bod:0.80},
        {name:"Aerobic treatment plants with primary treatment and anaerobic sludge digestion (mixed primary and secondary sludge, treated anaerobically)", K_rem:0.41666, K_rem_bod:1},
        {name:"Aerobic wastewater treatment plants without separate primary treatment",                                                                     K_rem:0.48333, K_rem_bod:1.16},
    ],

    "WW treatment organics removal fractions (centralised) (Table 6.6B and 6.10C)":[
        {name:"Untreated systems",                                                     cod_effl:1,  bod_effl_table:"[100%]",    N_effl:1.00,   N_effl_table:"[100%]", P_effl:1.00,   P_effl_table:"[100%]", diclo_effl:1,  diclo_effl_table:"[100%]", cadmium_effl:1,  cadmium_effl_table:"[100%]",hexaclorobenzene_effl:1,  hexaclorobenzene_effl_table:"[100%]",mercury_effl:1,  mercury_effl_table:"[100%]",plomo_effl:1,  plomo_effl_table:"[100%]",niquel_effl:1,  niquel_effl_table:"[100%]",chloro_effl:1,  chloro_effl_table:"[100%]", hexaclorobutadie_effl:1,  hexaclorobutadie_effl_table:"[100%]", nonilfenols_effl:1,  nonilfenols_effl_table:"[100%]", tetracloroetile_effl:1,  tetracloroetile_effl_table:"[100%]",tricloroetile_effl:1, tricloroetile_effl_table:"[100%]",},
        {name:"Primary (mechanical treatment plants)",                                 cod_effl:0.60, bod_effl_table:"[60%]", N_effl:0.90, N_effl_table:"[90%]", diclo_effl:0.7875,  diclo_effl_table:"[78.75%]", cadmium_effl:0.785,  cadmium_effl_table:"[78.5%]", hexaclorobenzene_effl:1,  hexaclorobenzene_effl_table:"[100%]",mercury_effl:0.64,  mercury_effl_table:"[64%]",plomo_effl:0.585,  plomo_effl_table:"[58.5%]",niquel_effl:0.83,  niquel_effl_table:"[83%]",chloro_effl:0.9,  chloro_effl_table:"[90%]", hexaclorobutadie_effl:0.95,  hexaclorobutadie_effl_table:"[95%]", nonilfenols_effl:0.57,  nonilfenols_effl_table:"[57%]", tetracloroetile_effl:0.765,  tetracloroetile_effl_table:"[76.5%]",tricloroetile_effl:0.9, tricloroetile_effl_table:"[90%]"},
        {name:"Primary + Secondary (biological treatment plants)",                     cod_effl:0.15, bod_effl_table:"[15%]", N_effl:0.60, N_effl_table:"[60%]", diclo_effl:0.3268125,  diclo_effl_table:"[32.68%]", cadmium_effl:0.42785,  cadmium_effl_table:"[42.785%]", hexaclorobenzene_effl:1,  hexaclorobenzene_effl_table:"[100%]",mercury_effl:0.53312,  mercury_effl_table:"[53.312%]",plomo_effl:0.2720835,  plomo_effl_table:"[27.20835%]",niquel_effl:0.41417,  niquel_effl_table:"[41.417%]",chloro_effl:0.54,  chloro_effl_table:"[54%]", hexaclorobutadie_effl:0.19,  hexaclorobutadie_effl_table:"[19%]", nonilfenols_effl:0.1197,  nonilfenols_effl_table:"[11.97%]", tetracloroetile_effl:0.153,  tetracloroetile_effl_table:"[15.3%]",tricloroetile_effl:0.222, tricloroetile_effl_table:"[22.2%]"},
        {name:"Primary + Secondary + Tertiary (advanced biological treatment plants)", cod_effl:0.10, bod_effl_table:"[10%]", N_effl:0.20, N_effl_table:"[20%]", diclo_effl:0.0653625,  diclo_effl_table:"[6.53%]", cadmium_effl:0.15829525,  cadmium_effl_table:"[15.83%]", hexaclorobenzene_effl:0.4275,  hexaclorobenzene_effl_table:"[42.75%]",mercury_effl:0.53312,  mercury_effl_table:"[53.312%]",plomo_effl:0.087746929,  plomo_effl_table:"[8.77%]",niquel_effl:0.256437,  niquel_effl_table:"[25.64%]",chloro_effl:0.54,  chloro_effl_table:"[54%]", hexaclorobutadie_effl:0.19,  hexaclorobutadie_effl_table:"[19%]", nonilfenols_effl:0.005985,  nonilfenols_effl_table:"[0.59%]", tetracloroetile_effl:0.00918,  tetracloroetile_effl_table:"[0.918%]",tricloroetile_effl:0.01332, tricloroetile_effl_table:"[1.33%]"},
    ],

    "WW treatment type":[
        {text:"Untreated systems",                                                     value: 0,},
        {text:"Primary (mechanical treatment plants)",                                 value: 1,},
        {text:"Primary + Secondary (biological treatment plants)",                     value: 2,},
        {text:"Primary + Secondary + Tertiary (advanced biological treatment plants)", value: 3,},
    ],

    "Type of sludge disposed":[
        {name:"Type of sludge disposed", f_ch4:0,  N_cont:0, TVS:0, description:"" },
        {name:"Non-digested",            f_ch4:53, N_cont:3, TVS:70, description:""},
        {name:"Digested",                f_ch4:6,  N_cont:4, TVS:51, description:""},
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
    Tables
}

/*
  Assessment example:
    - create an assessment
    - add 1 industry
    - modify some inputs
    - calculate total emissions
*/


