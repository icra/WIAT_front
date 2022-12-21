<template>
  <div class="outer_2" id="top">
    <span>
      <h1 style="color: #b62373; padding: 20px 0px 0px 20px">
      {{ this.industry.name}}
        <v-tooltip bottom>
      <template v-slot:activator="{ on, attrs }">
        <v-hover  v-slot:default="{ hover }" style="margin-right: 10px">
                <span>
                  <v-icon
                      v-bind="attrs"
                      v-on="on"
                      class="icon_clickable" :color="hover ? '#555283' : '#1C195B'"
                      @click = "direct_discharge_modal = true"
                      style="margin: 0px 0px 4px -6px"

                  >
                    mdi-information-outline
                  </v-icon>

                </span>
        </v-hover>
      </template>
      <span>Display information</span>

    </v-tooltip>
    </h1>


    </span>


    <v-stepper id= "stepper" class="stepper" v-model="stepper_model" style="width: 100%; z-index: 2">
      <v-stepper-header class="white sticky" style="border-bottom: 2px solid #b62373 !important;">
        <v-stepper-step
              step="1"
              editable
          >

          <span>Water withdrawal and industry</span>

        </v-stepper-step>

        <v-divider></v-divider>

        <v-stepper-step
              step="2"
              :editable="industry.has_onsite_wwtp == 1"

          >
            <span>On-site WWTP</span>

          </v-stepper-step>

        <v-divider></v-divider>

        <v-stepper-step
              step="3"
              :editable="industry.has_direct_discharge == 1"
          >
          Direct discharge

        </v-stepper-step>

        <v-divider></v-divider>

        <v-stepper-step
              step="4"
              :editable="industry.has_offsite_wwtp == 1"
          >
          <span>Offsite WWTP</span>

        </v-stepper-step>

        <v-stepper-step
              v-show="false"
              step="5"
          >
            Finish page
          </v-stepper-step>



      </v-stepper-header>

      <v-stepper-items style="z-index: 2; position: relative; padding: 5px 20px 5px 20px">
        <v-stepper-content step="1">

          <industry_questionnaire
              :array_intersection = array_intersection
              :industry_inputs = industry_inputs
              :basic_inputs = basic_inputs
              :user_inputs = user_inputs
              :required = required
              :button_estimations = button_estimations
              :select_estimation = select_estimation
              :type_option = type_option
              :required_item_text_rule = required_item_text_rule
              :industry_model = industry_model
              :required_item_select_rule = required_item_select_rule
              :items_selected_pollutants = items_selected_pollutants
              :search_pollutant = search_pollutant
              :onChangeCombobox = onChangeCombobox
              :model_selected_pollutants = model_selected_pollutants
              :button_estimation = button_estimation
              :array_difference = array_difference
              :remove_chip = remove_chip
              :stepper_model = 1
              ref="industry_questionnaire"

          />
          <br>
          <v-tooltip bottom :disabled="!tab_1_disabled">
            <template v-slot:activator="{ on }">
              <div v-on="on" class="d-inline-block">
                <v-btn
                    @click="tab_1_continue"
                    :disabled="tab_1_disabled"
                    tile
                    color="#b62373"

                >
                  SAVE AND CONTINUE
                </v-btn>
              </div>
            </template>
            <span>Please, fill in the required items before continue.</span>
          </v-tooltip>


        </v-stepper-content>  <!-- Industry -->

        <v-stepper-content step="2" >
          <Wwtp_questionnaire
              :industry = industry
              :stepper_model = 2
              :array_intersection = array_intersection
              :array_difference = array_difference
              :wwtp_inputs = onsite_wwtp_inputs
              :basic_inputs = basic_inputs
              :user_inputs = user_inputs
              :required = required
              :button_estimation = button_estimation
              :select_estimation = select_estimation
              :type_option = type_option
              :wwtp_model = onsite_wwtp_model
              :button_estimations = button_estimations
              :select_estimations = select_estimations
              :advanced_truck_transportation = advanced_truck_transportation
              :advanced_stockpiling = advanced_stockpiling
              :advanced_landfilling = advanced_landfilling
              :advanced_application = advanced_application
              :advanced_sludge_incineration = advanced_sludge_incineration
              :advanced_sludge_composting = advanced_sludge_composting
              :advanced_sludge_storage = advanced_sludge_storage
              :advanced_water_reuse_trucks = advanced_water_reuse_trucks
              :advanced_biogas_from_anaerobic = advanced_biogas_from_anaerobic
              :advanced_fuel_engines = advanced_fuel_engines
              :model_selected_pollutants = model_selected_pollutants


          ></Wwtp_questionnaire>

          <br>
          <v-tooltip bottom :disabled="!tab_2_disabled">
            <template v-slot:activator="{ on }">
              <div v-on="on" class="d-inline-block">
                <v-btn
                    @click="tab_2_continue"
                    :disabled="tab_2_disabled"
                    tile
                    color="#b62373"

                >
                  SAVE AND CONTINUE
                </v-btn>
              </div>
            </template>
            <span>Please, fill in the required items before continue.</span>
          </v-tooltip>

        </v-stepper-content> <!-- Onsite WWTP -->

        <v-stepper-content step="3" >

          <direct_discharge_questionnaire
              :industry = industry
              :stepper_model = 3
              :model = direct_discharge_model
              :direct_discharge_inputs = direct_discharge_inputs
              :user_inputs = user_inputs
              :required = required
              :button_estimation = button_estimation
              :select_estimation = select_estimation
              :type_option = type_option
              :select_estimations = select_estimations
              :button_estimations = button_estimations

          />


          <v-tooltip bottom :disabled="!tab_3_disabled">
            <template v-slot:activator="{ on }">
              <div v-on="on" class="d-inline-block">
                <v-btn
                    @click="tab_3_continue"
                    :disabled="tab_3_disabled"
                    tile
                    color="#b62373"

                >
                  SAVE AND CONTINUE
                </v-btn>
              </div>
            </template>
            <span>Please, fill in the required items before continue.</span>
          </v-tooltip>

        </v-stepper-content>  <!-- Direct discharge -->

        <v-stepper-content step="4">  <!-- Offsite WWTP -->

          <Wwtp_questionnaire
              :industry = industry
              :stepper_model = 4
              :array_intersection = array_intersection
              :array_difference = array_difference
              :wwtp_inputs = offsite_wwtp_inputs
              :basic_inputs = basic_inputs
              :user_inputs = user_inputs
              :required = required
              :button_estimation = button_estimation
              :select_estimation = select_estimation
              :type_option = type_option
              :wwtp_model = offsite_wwtp_model
              :button_estimations = button_estimations
              :select_estimations = select_estimations
              :advanced_truck_transportation = advanced_truck_transportation
              :advanced_stockpiling = advanced_stockpiling
              :advanced_landfilling = advanced_landfilling
              :advanced_application = advanced_application
              :advanced_sludge_incineration = advanced_sludge_incineration
              :advanced_sludge_composting = advanced_sludge_composting
              :advanced_sludge_storage = advanced_sludge_storage
              :advanced_water_reuse_trucks = advanced_water_reuse_trucks
              :advanced_biogas_from_anaerobic = advanced_biogas_from_anaerobic
              :advanced_fuel_engines = advanced_fuel_engines
              :model_selected_pollutants = model_selected_pollutants


          ></Wwtp_questionnaire>


          <v-tooltip bottom :disabled="!tab_4_disabled">
            <template v-slot:activator="{ on }">
              <div v-on="on" class="d-inline-block">
                <v-btn
                    @click="tab_4_continue"
                    :disabled="tab_4_disabled"
                    tile
                    color="#b62373"

                >
                  SAVE AND CONTINUE
                </v-btn>
              </div>
            </template>
            <span>Please, fill in the required items before continue.</span>
          </v-tooltip>

        </v-stepper-content>



        <v-stepper-content step="5">

            <h3>
              You have finished entering all the required data, but you can continue editing them if you wish.
            </h3>
            <br>
            <br>

            <router-link :to="{name: 'report'}" style="text-decoration: none">
              <v-hover
                  v-slot="{ hover }"
              >
                <h3 :class="`${hover? 'link_to_report_hovered': 'link_to_report'}`">
                  Click here to see the report
                </h3>

              </v-hover>


            </router-link>


          </v-stepper-content>  <!-- End of questionnaire -->

        </v-stepper-items>

    </v-stepper>

    <v-dialog
        v-model="direct_discharge_modal"
        width="900"
        scrollable
    >
      <div style="background-color: white; ">

        <v-card flat style="padding: 40px">
          In order to calculate some statistics, we need to know some inputs from the industry.
          We have divided them into different screens, depending on whether they relate to one part of the water treatment cycle or another.

          <br><br>
          In the <b>first step</b>, we ask inputs related to the industry in general. Depending on the answers here, the questions in the other screens will vary slightly.
          <br>
          <v-row style="padding: 10px 0px 10px 0px">
            <v-img
                :src="water_withdrawal_image"
            ></v-img>
          </v-row>

          In the <b>second step</b>, the questions are related to the treatment in the in-site WWTP (as well as the volume of water reused, or water also discharged and treated in an external treatment plant).

          <v-row style="padding: 0px 0px 0px 0px">
            <v-col>
              <v-img
                  :src="onsite_external_image"
              ></v-img>
            </v-col>
          </v-row>

          The <b>third step</b> is related to water directly discharged to the receiving water body (untreated water).

          <v-row style="padding: 0px 0px 0px 0px">
            <v-col>
              <v-img
                  :src="direct_discharge_image"
              ></v-img>
            </v-col>
          </v-row>

          Finally, the <b>fourth screen</b> contains inputs related to the external treatment plant (and the water sent from the on-site treatment plant, if any).

          <v-row style="padding: 0px 0px 0px 0px">
            <v-col>
              <v-img
                  :src="external_internal_image"
              ></v-img>
            </v-col>
          </v-row>

          <b>Notes:</b>
          <br>
          <ul>
            <li>The information is not saved until the "save and continue" button is pressed.</li>
            <li>Although it is not mandatory, the water balance in the treatment plants should be maintained: the amount of water that is treated is the same as the amount that comes out.</li>

          </ul>

        </v-card>

      </div>
    </v-dialog>


  </div>
</template>

<script>

import {
  Assessment,
  Industry,
  Tables
} from "../ecam_backend";
import {
  user_inputs,
  onsite_wwtp_no_offsite,
  onsite_wwtp_with_offsite_wwtp_inputs,
  direct_discharge_inputs,
  offsite_wwtp_inputs,
  industry_inputs
} from "../user_inputs";
import Vue from 'vue'
import {utils, metrics} from "../utils"
import standard_industries_classification from "../standard_industrial_classification"
import Countries from "@/countries";
import conversion_factors from "@/conversion_factors";
import {industry_estimations} from "@/industry_estimation"
import Industry_questionnaire from "@/components/industry_questionnaire";
import Wwtp_questionnaire from "@/components/wwtp_questionnaire";
import Direct_discharge_questionnaire from "@/components/direct_discharge_questionnaire";

export default {
  name: "new_assessment",
  props: ['assessment_id', 'industry_id'],
  components: {
    Direct_discharge_questionnaire,
    Wwtp_questionnaire,
    Industry_questionnaire,
    Industry,
    Assessment,
  },
  data() {

    let defaultIndustry = this.$assessments[this.assessment_id].industries[this.industry_id]

    return {


      industry_type: null,

      assessment: this.$assessments[this.assessment_id],
      industry: defaultIndustry,

      stepper_model: 1,
      water_withdrawal_image: require("@/../public/water_flow/water_withdrawal.jpg"),
      onsite_no_external_image: require("@/../public/water_flow/onsite_no_external.jpg"),
      onsite_external_image: require("@/../public/water_flow/onsite_external.jpg"),
      direct_discharge_image: require("@/../public/water_flow/direct_discharge.jpg"),
      external_no_internal_image: require("@/../public/water_flow/external_no_internal.jpg"),
      external_internal_image: require("@/../public/water_flow/external_internal.jpg"),


      global_layers: utils.format_layer_description(Vue.prototype.$layers_description),
      industry_typologies: standard_industries_classification,

      user_inputs: user_inputs,
      onsite_wwtp_inputs: [],
      industry_inputs: industry_inputs,
      direct_discharge_inputs: direct_discharge_inputs,
      offsite_wwtp_inputs: offsite_wwtp_inputs,
      onsite_wwtp_with_offsite_wwtp_inputs: onsite_wwtp_with_offsite_wwtp_inputs,
      onsite_wwtp_no_offsite: onsite_wwtp_no_offsite,

      type_option: {
        "discharge_same_location_as_withdrawal": {items: Tables["Yes/No"]},
        "has_onsite_wwtp": {items: Tables["Yes/No"]},
        "has_direct_discharge": {items: Tables["Yes/No"]},
        "has_offsite_wwtp": {items: Tables["Yes/No"]},
        "industry_type": {items: standard_industries_classification},
        "wwt_treatment_type": {items: Tables["WW treatment type"]},
        "wwt_fuel_typ": {items: Tables["Fuel type options"]},
        "wwt_dige_typ": {items: Tables["Fuel type options"]},
        "wwt_reus_trck_typ": {items: Tables["Fuel type options"]},
        "wwt_slu_comp_emis_treated_or_piles_covered": {items: Tables["Yes/No"]},
        "wwt_slu_inc_SNCR": {items: Tables["Yes/No"]},
        "wwt_trck_typ": {items: Tables["Fuel type options"]},
      },
      button_estimation: ["ind_pollutants_infl", "ind_pollutants_effl", "wwt_vol_disc", "wwt_vol_treated_external", "wwt_vol_reused", "wwt_pollutants_effl", "wwt_conv_kwh",
        "wwt_biog_pro", "wwt_biog_fla", "wwt_biog_val", "wwt_biog_lkd", "wwt_biog_sold", "wwt_ch4_biog", "wwt_slu_comp_low_CN_EF", "wwt_slu_comp_seqst_rate", "wwt_slu_comp_uncovered_pile_EF", "wwt_temp_inc", "wwt_slu_lf_uncertainty", "wwt_slu_lf_CH4_in_gas", "wwt_slu_lf_DOCf", "wwt_slu_lf_decomp_3yr", "wwt_slu_lf_low_CN_EF" ],
      select_estimation: ["wwt_cod_slud", "wwt_ch4_efac_dis", "wwt_ch4_efac_tre", "wwt_n2o_efac_tre", "wwt_n2o_efac_dis", "wwt_slu_sto_TVS", "wwt_slu_sto_f_CH4", "wwt_slu_sto_f_CH4", "wwt_slu_comp_N_cont", "wwt_slu_comp_TVS", "wwt_slu_inc_N_cont", "wwt_slu_la_TVS", "wwt_slu_la_N_cont", "wwt_slu_la_EF", "wwt_slu_lf_TVS", "wwt_slu_lf_MCF", "wwt_slu_lf_N_cont"],
      basic_inputs: ["discharge_same_location_as_withdrawal", "pollutants_list", "ind_pollutants_effl", "wwt_treatment_type", "wwt_vol_trea", "wwt_vol_disc", "dd_vol_disc", "wwt_vol_reused", "wwt_vol_treated_external", "wwt_ch4_efac_tre", "wwt_n2o_efac_tre", "wwt_ch4_efac_dis", "wwt_n2o_efac_dis", "volume_withdrawn", "volume_withdrawn_groundwater", "has_onsite_wwtp", "has_direct_discharge", "has_offsite_wwtp", "industry_type", "product_produced", "ind_cod_effl", "ind_tn_effl", "ind_tp_effl", "wwt_nrg_cons", "wwt_conv_kwh", "wwt_mass_slu", "wwt_cod_slud"],
      advanced_pollution_effluent: ["wwt_diclo_effl", "wwt_cadmium_effl", "wwt_hexaclorobenzene_effl", "wwt_mercury_effl", "wwt_plomo_effl", "wwt_niquel_effl", "wwt_chloro_effl", "wwt_hexaclorobutadie_effl", "wwt_nonilfenols_effl", "wwt_tetracloroetile_effl", "wwt_tricloroetile_effl"],
      advanced_fuel_engines: ["wwt_fuel_typ", "wwt_vol_fuel"],
      advanced_biogas_from_anaerobic: ["wwt_biog_pro", "wwt_biog_fla", "wwt_biog_val", "wwt_biog_lkd", "wwt_biog_sold", "wwt_ch4_biog", "wwt_dige_typ", "wwt_fuel_dig"],
      advanced_water_reuse_trucks: ["wwt_reus_trck_typ", "wwt_reus_vol_trck"],
      advanced_sludge_storage: ["wwt_mass_slu_sto", "wwt_time_slu_sto", "wwt_slu_sto_TVS", "wwt_slu_sto_f_CH4", "wwt_slu_sto_EF",],
      advanced_sludge_composting: ["wwt_mass_slu_comp", "wwt_slu_comp_emis_treated_or_piles_covered", "wwt_slu_comp_solids_content", "wwt_slu_comp_TVS", "wwt_slu_comp_N_cont", "wwt_slu_comp_low_CN_EF", "wwt_slu_comp_uncovered_pile_EF", "wwt_slu_comp_seqst_rate",],
      advanced_sludge_incineration: ["wwt_mass_slu_inc", "wwt_temp_inc", "wwt_slu_inc_N_cont", "wwt_slu_inc_SNCR"],
      advanced_application: ["wwt_mass_slu_app", "wwt_slu_la_solids_content", "wwt_slu_la_TVS", "wwt_slu_la_N_cont", "wwt_slu_la_EF",],
      advanced_landfilling: ["wwt_mass_slu_land", "wwt_slu_lf_TVS", "wwt_slu_lf_uncertainty", "wwt_slu_lf_CH4_in_gas", "wwt_slu_lf_DOCf", "wwt_slu_lf_decomp_3yr", "wwt_slu_lf_MCF", "wwt_slu_lf_N_cont", "wwt_slu_lf_low_CN_EF"],
      advanced_stockpiling: ["wwt_mass_slu_stock", "wwt_slu_sp_lifespan"],
      advanced_truck_transportation: ["wwt_trck_typ", "wwt_vol_tslu"],


      required: ["volume_withdrawn", "product_produced", "has_onsite_wwtp", "has_offsite_wwtp", "has_direct_discharge", "industry_type", "wwt_vol_trea", "wwt_vol_disc", "dd_vol_disc" ],
      industry_model: {},
      onsite_wwtp_model: {},
      direct_discharge_model: {},
      offsite_wwtp_model: {},

      direct_discharge_modal: false,

      model_selected_pollutants: defaultIndustry.pollutants_selected,
      items_selected_pollutants: ["COD", "TN", "TP", '1,2-Dichloroethane', 'Cadmium', 'Hexaclorobenzene', 'Mercury', 'Lead', 'Nickel', 'Chloroalkanes', 'Hexachlorobutadiene', 'Nonylphenols', 'Tetrachloroethene', 'Trichloroethylene'],
      search_pollutant: null,


    }
  },
  created() {

    if (this.industry === undefined) this.$router.push('/')

    this.industry_to_model()
    this.direct_discharge_to_model()
    this.offsite_wwtp_to_model()
    this.onsite_wwtp_to_model()
  },
  watch: {


    //Changed step in the questionnaire, if step is onsite WWTP add or don't inputs related to offsite WWTP
    stepper_model(step){

      this.scrollToTop()
      let _this = this
      if(step == 2){

        this.onsite_wwtp_inputs.splice(0, this.onsite_wwtp_inputs.length)

        if(this.industry.has_offsite_wwtp == 1) {
          this.onsite_wwtp_with_offsite_wwtp_inputs.forEach(input => {
            _this.onsite_wwtp_inputs.push(input)
          })
        }else{
          this.onsite_wwtp_no_offsite.forEach(input => {
            _this.onsite_wwtp_inputs.push(input)
          })
        }

        for (let item of this.model_selected_pollutants){
          if (!this.onsite_wwtp_model["wwt_pollutants_effl"].hasOwnProperty(item)){
              this.$set(this.onsite_wwtp_model["wwt_pollutants_effl"], item, 0)
          }
        }
      }
      else if (step == 4){
        for (let item of this.model_selected_pollutants){
          if (!this.offsite_wwtp_model["wwt_pollutants_effl"].hasOwnProperty(item)){
            this.$set(this.offsite_wwtp_model["wwt_pollutants_effl"], item, 0)
          }
        }
      }
    },

    //Changed current  industry
    industry_id: function (industry_id) {
      this.industry = this.$assessments[this.assessment_id].industries[this.industry_id]
    },

    //Changed current assessment
    assessment_id: function (assessment_id) {
      this.industry = this.$assessments[this.assessment_id].industries[this.industry_id]
    },

    //Changed industry
    industry: function (industry) {
      if (industry === undefined) {
        this.$router.push('/')
      }

      location.href = "#";
      location.href = "#top";


      this.stepper_model = 1

      this.model_selected_pollutants.splice(0, this.model_selected_pollutants.length, ...this.industry.pollutants_selected)

      console.log(this.model_selected_pollutants)

      this.industry_to_model()
      this.direct_discharge_to_model()
      this.offsite_wwtp_to_model()
      this.onsite_wwtp_to_model()

    },
  },

  methods: {

    industry_to_model(){
      for (let industry_input of [...this.industry_inputs, 'level_of_certainty', 'location']) {

        //Vars stored as object, for example industry[input][pollutant]
        if (industry_input == "ind_pollutants_effl" || industry_input == "ind_pollutants_infl" || industry_input == "level_of_certainty"){
          this.$set(this.industry_model, industry_input, JSON.parse(JSON.stringify(this.industry[industry_input])))  //Deep copy
        }else {
          //industry[input]
          this.$set(this.industry_model, industry_input, this.industry[industry_input])

        }
      }
    },
    onsite_wwtp_to_model(){
      for (let input of ['level_of_certainty', ...this.onsite_wwtp_with_offsite_wwtp_inputs]) {
        if (input == "wwt_pollutants_effl" || input == "level_of_certainty"){  //Deep copy of variables  that are objects
          if (this.industry.onsite_wwtp[input] !== undefined) {
            this.$set(this.onsite_wwtp_model, input, JSON.parse(JSON.stringify(this.industry.onsite_wwtp[input])))
          }
        }
        else this.$set(this.onsite_wwtp_model, input, this.industry.onsite_wwtp[input])
      }
    },
    direct_discharge_to_model(){
      for (let input of ['level_of_certainty', ...this.direct_discharge_inputs]) {
        if (input == "level_of_certainty"){  //Deep copy of variables  that are objects
          if (this.industry.direct_discharge[input] !== undefined) {
            this.$set(this.direct_discharge_model, input, JSON.parse(JSON.stringify(this.industry.direct_discharge[input])))
          }
        }
        else this.$set(this.direct_discharge_model, input, this.industry.direct_discharge[input])
      }
    },
    offsite_wwtp_to_model(){
      for (let input of ['level_of_certainty', ...this.offsite_wwtp_inputs]) {
        if (input == "wwt_pollutants_effl" || input == "level_of_certainty"){  //Deep copy of variables  that are objects
          if (this.industry.offsite_wwtp[input] !== undefined){
            this.$set(this.offsite_wwtp_model, input, JSON.parse(JSON.stringify(this.industry.offsite_wwtp[input])))
          }
        }else this.$set(this.offsite_wwtp_model, input, this.industry.offsite_wwtp[input])

      }

    },

    //Change in pollutant select
    onChangeCombobox(items){

      //Prevent users deleting COD, TN or TP
      if(!items.includes("COD")){
        this.model_selected_pollutants.splice(0, 0, "COD");
        return
      }
      if(!items.includes("TN")){
        this.model_selected_pollutants.splice(1, 0, "TN");
        return
      }
      if(!items.includes("TP")){
        this.model_selected_pollutants.splice(2, 0, "TP");
        return
      }


      for (let item of items){
        if (!Object.keys(this.industry_model["ind_pollutants_effl"]).includes(item) ){
          this.$set(this.industry_model["ind_pollutants_effl"], item, 0)
        }
        if (!Object.keys(this.industry_model["ind_pollutants_infl"]).includes(item)){
          this.$set(this.industry_model["ind_pollutants_infl"], item, 0)
        }
      }
    },
    remove_chip (itemText) {

      if (itemText === 'COD') {
        return;
      } else {
        this.model_selected_pollutants.forEach(obj => {
          if (obj === itemText) {
            this.model_selected_pollutants.splice(this.model_selected_pollutants.indexOf(obj), 1)
          }
        })
        this.model_selected_pollutants = [...this.model_selected_pollutants]
      }
    },
    scrollToTop() {
      location.href = "#";
      location.href = "#top";
    },

    array_intersection(arrA, arrB){
      let intersection = arrA.filter(x => arrB.includes(x));
      return intersection
    },

    array_difference(arrA, arrB){
      let difference = arrA.filter(x => !arrB.includes(x));
      return difference
    },

    //Button estimations
    button_estimations(code, pollutant = null){
      let industry_model = this.industry_model
      let industry = this.industry
      let stepper_model = this.stepper_model
      let wwtp_model = this.onsite_wwtp_model
      let wwtp = industry.onsite_wwtp
      if(stepper_model == 4){
        wwtp_model = this.offsite_wwtp_model
        wwtp = industry.offsite_wwtp
      }
      return industry_estimations.get_estimation(code, industry, industry_model, stepper_model, wwtp, wwtp_model, pollutant)
    },

    //Select estimations
    select_estimations(code){
      let wwtp_model = this.onsite_wwtp_model
      if(this.stepper_model == 4){
        wwtp_model = this.offsite_wwtp_model
      }

      return industry_estimations.get_estimation(code, null, null, null, null, wwtp_model, null)

    },

    required_item_select_rule(code){
      if (!this.required.includes(code)) return false
      return [(item) => (!this.required.includes(code)) || (item != null) || "Required item"]
    },
    required_item_text_rule(code){
      return [(item) => (!this.required.includes(code)) || (item != null && item != undefined && item != '') || "Required item"]
    },
    tab_4_continue(){
      this.scrollToTop()

      for(let input of ['level_of_certainty', ...this.offsite_wwtp_inputs]){
        if((!isNaN(this.offsite_wwtp_model[input]) || this.offsite_wwtp_model[input]!="") && this.offsite_wwtp_model[input]>=0) this.industry.offsite_wwtp[input] = Number(this.offsite_wwtp_model[input])
        else if (input == "wwt_pollutants_effl") {
          this.industry.offsite_wwtp[input] = {}
          for (let pollutant of this.model_selected_pollutants){
            this.industry.offsite_wwtp[input][pollutant] = this.offsite_wwtp_model[input][pollutant]
          }
        }
        else if (input == "level_of_certainty") {
          this.industry.offsite_wwtp[input] = JSON.parse(JSON.stringify(this.offsite_wwtp_model[input]))
        }
      }

      //this.industry.offsite_wwtp['wwt_vol_disc'] = this.industry.offsite_wwtp["wwt_vol_trea"]
      this.stepper_model = 5
    },

    tab_3_continue(){
      this.scrollToTop()

      for(let input of this.direct_discharge_inputs){
        if((!isNaN(this.direct_discharge_model[input] ) || this.direct_discharge_model[input]!="") && this.direct_discharge_model[input]>=0) this.industry.direct_discharge[input] = Number(this.direct_discharge_model[input])
      }

      this.industry.direct_discharge['level_of_certainty'] = JSON.parse(JSON.stringify(this.direct_discharge_model['level_of_certainty']))

      if(this.industry.has_offsite_wwtp == 1) {
        this.stepper_model = 4
      }
      else this.stepper_model = 5
    },

    tab_2_continue(){
      this.scrollToTop()

      for(let input of ['level_of_certainty', ...this.onsite_wwtp_inputs]){
        if((!isNaN(this.onsite_wwtp_model[input]) || this.onsite_wwtp_model[input]!="") && this.onsite_wwtp_model[input]>=0) this.industry.onsite_wwtp[input] = Number(this.onsite_wwtp_model[input])
        else if (input == "wwt_pollutants_effl") {
          this.industry.onsite_wwtp[input] = {}
          for (let pollutant of this.model_selected_pollutants){
            this.industry.onsite_wwtp[input][pollutant] = this.onsite_wwtp_model[input][pollutant]
          }
        } else if (input == "level_of_certainty") {
          this.industry.onsite_wwtp[input] = JSON.parse(JSON.stringify(this.onsite_wwtp_model[input]))
        }
      }

      if(this.industry.has_offsite_wwtp == 1){
        this.industry.update_offsite_wwtp()
      }

      if(this.industry.has_direct_discharge == 1) {
        this.stepper_model = 3
      }
      else if(this.industry.has_offsite_wwtp == 1) this.stepper_model = 4
      else this.stepper_model = 5
    },

    tab_1_continue(){
      this.scrollToTop()


      let selected_pollutants = JSON.parse(JSON.stringify(this.$refs.industry_questionnaire.model_selected_pollutants_data))

      //Industry inputs
      for(let input of ['level_of_certainty', ...this.industry_inputs]){
        if((!isNaN(this.industry_model[input]) || this.industry_model[input]!="") &&  this.industry_model[input]>=0) this.industry[input] = Number(this.industry_model[input])

        else if (input == "ind_pollutants_effl") {
          this.industry['ind_pollutants_effl'] = {}
          for (let pollutant of this.model_selected_pollutants){
            this.industry['ind_pollutants_effl'][pollutant] = this.industry_model['ind_pollutants_effl'][pollutant]
          }
        }

        else if (input == "ind_pollutants_infl") {
          this.industry['ind_pollutants_infl'] = {}
          for (let pollutant of this.model_selected_pollutants){
            this.industry['ind_pollutants_infl'][pollutant] = this.industry_model['ind_pollutants_infl'][pollutant]
          }
        }

        else if (input == "level_of_certainty") {
          this.industry[input] = JSON.parse(JSON.stringify(this.industry_model[input]))
        }

      }

      this.industry['pollutants_selected'] = selected_pollutants

      for (let pollutant of selected_pollutants){
        if (!conversion_factors.hasOwnProperty(pollutant)){
          if (pollutant == "COD" || pollutant == "TN" || pollutant == "TP") {
            conversion_factors[pollutant] = {eutrophication: null, tu: '-', eqs: '-'}
          }else{
            conversion_factors[pollutant] = {eutrophication: '-', tu: null, eqs: null}
          }
        }
      }

      //Local wwtp
      if(this.industry.has_onsite_wwtp == 1){
        this.industry.update_onsite_wwtp()
      }else{
        this.industry.reset_onsite_wwtp()
        this.onsite_wwtp_to_model()
      }

      //Direct discharge
      if(this.industry.has_direct_discharge == 1){
        this.industry.update_direct_discharge()
      }else{
        this.industry.reset_direct_discharge()
        this.direct_discharge_to_model()
      }

      //Offsite wwtp
      if(this.industry.has_offsite_wwtp == 1){
        this.industry.update_offsite_wwtp()
      }else{
        this.industry.reset_offsite_wwtp()
        this.offsite_wwtp_to_model()
      }

      let global_pollutants_created = this.$created_pollutants
      this.model_selected_pollutants.forEach(item => global_pollutants_created.add(item)) //Update all pollutants created set


      if(this.industry.has_onsite_wwtp != 1){
        if(this.industry.has_direct_discharge == 1) this.stepper_model = 3
        else if(this.industry.has_offsite_wwtp == 1) this.stepper_model = 4
        else this.stepper_model = 5
      }else{
        this.stepper_model = 2
      }

    },

    industries_deleted(){ //An industry or assessment has been deleted, if it's the current one return to map
      let _this = this
      let assessment_index =  this.$assessments.findIndex(assessment => assessment.name === _this.assessment.name)
      if(assessment_index === -1) this.$router.push('/')
      else {
        let assessment = this.$assessments[assessment_index]
        let industry_index = assessment.industries.findIndex(industry => industry.name === _this.industry.name)
        if(industry_index === -1) this.$router.push('/')
      }
    },


  },

  computed: {

    tab_1_disabled(){
      let industry = this.industry_model


      let disabled = industry.volume_withdrawn != null && industry.volume_withdrawn !== "" &&
          industry.product_produced != null && industry.product_produced !== "" &&
          industry.has_onsite_wwtp != null && industry.has_direct_discharge != null && industry.has_offsite_wwtp != null && industry.industry_type != null

      return !disabled
    },

    tab_2_disabled(){
      let wwtp = this.onsite_wwtp_model
      let disabled = wwtp.wwt_vol_trea != null && wwtp.wwt_vol_trea != "" && wwtp.wwt_vol_disc != null && wwtp.wwt_vol_disc != ""
      return !disabled
    },

    tab_3_disabled(){
      let dd = this.direct_discharge_model
      let disabled = dd.dd_vol_disc != null && dd.dd_vol_disc != ""
      return !disabled
    },

    tab_4_disabled(){
      let wwtp = this.offsite_wwtp_model
      let disabled = wwtp.wwt_vol_trea != null && wwtp.wwt_vol_trea != ""
      return !disabled
    },
  }

};
</script>

<style scoped>
.link_to_report_hovered{
  color: #b62373;
  text-decoration: underline;
}
.link_to_report{
  color: #b62373;
  text-decoration: none;
}

.v-btn--disabled{
  background-color: rgba(0, 0, 0, 0.26) !important
}

.outer_2{
  width: 100%;
  height: 100%;
  background-color: white;
  position: absolute;
}

.stepper {
  overflow: visible;
  box-shadow: unset !important;
}

.sticky {
  position: sticky;
  top: 0;
  z-index: 3;
  box-shadow: unset;
}

.icon_clickable {
  transition: all .2s ease-in-out;
}
</style>