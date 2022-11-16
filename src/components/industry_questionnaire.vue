<template>
  <div>
    <v-container
        v-for = "industry_input in array_intersection(industry_inputs, basic_inputs)"
        :key="industry_input"
    >
      <v-row
          align="center"
          v-if="industry_input !== 'pollutants_list' && industry_input !== 'ind_pollutants_effl'"
      >
        <!-- Input description -->
        <v-col cols="7" >
          <div style="width: 100%;">

            <!-- Input -->
            <div style="height: 100%; display: flex; justify-content: space-between; width: 90%">
              <div>
                <span>
                  {{user_inputs[industry_input].question}}
                </span>
                <v-tooltip bottom v-if="required.includes(industry_input)">
                  <template v-slot:activator="{ on, attrs }">
                    <span v-bind="attrs"
                          v-on="on"
                          style="color: red"
                    >*</span>
                  </template>
                  <span>Required input</span>
                </v-tooltip>
              </div>
            </div>

            <!-- Button estimation -->
            <v-btn v-if="button_estimation.includes(industry_input) && !isNaN(button_estimations(industry_input)) && button_estimations(industry_input) != null"
                   tile
                   x-small
                   color="#b62373"
                   @click="industry_model[industry_input] = button_estimations(industry_input)"
            >
              Estimation:  {{button_estimations(industry_input)}}
            </v-btn>

            <!--Toggle menu with estimation-->
            <div v-if="select_estimation.includes(industry_input)" style="width: 100%">
              <select v-model = "industry_model[industry_input]" style="max-width:90%;background-color: #d9d9d5; width: 90%; -webkit-appearance: menulist"  >
                <option
                    v-for="item in select_estimations(industry_input)"
                    :value="item.value"
                >
                  {{item.name}} ({{item.value.toFixed(3)}})
                </option>
                <option :value="industry_model[industry_input]">Custom value</option>
              </select>
            </div>
          </div>
        </v-col>
        <!-- Response -->
        <v-col cols="3">
          <div>
            <div>
              <span v-if="type_option[industry_input]">
                <!-- Toggle menu response -->
                <v-select
                    v-model="industry_model[industry_input]"
                    item-text="text"
                    item-value="value"
                    :items="type_option[industry_input].items"
                    label="Select"
                    :rules = "required_item_select_rule(industry_input)"
                >
                </v-select>
              </span>
              <span v-else>
                <!-- Text response -->
                <v-text-field
                    v-model="industry_model[industry_input]"
                    :suffix=user_inputs[industry_input].unit
                    type="number"
                    :rules="required_item_text_rule(industry_input)"
                ></v-text-field>
              </span>
            </div>
          </div>
        </v-col>
        <!-- Data origin -->
        <v-col cols="2">
          <v-select
              label="Level of certainty"
              :items = level_of_certainty
              v-model="industry_level_of_certainty[industry_input]"
              item-text="text"
              item-value="key"
          ></v-select>

        </v-col>
      </v-row>
      <!-- pollutants_list -->
      <v-row v-else-if = "industry_input == 'pollutants_list'"
             align="center"
      >
        <v-col cols="12">
          <v-combobox
              v-model="model_selected_pollutants"
              :items="items_selected_pollutants"
              :search-input.sync="search_pollutant"
              hide-selected
              multiple
              persistent-hint
              small-chips
              @change="onChangeCombobox"
          >
            <template v-slot:label>
              To add contaminants in this industry, first select them from this menu. If the one you want to add is not there, add it yourself and then add the parameters in the

              <v-tooltip top>
                <template v-slot:activator="{ on, attrs }">
                  <span
                      v-bind="attrs"
                      v-on="on"
                      class="link_to_report"
                  >Parameter configuration window</span>
                </template>
                <span>Accessible from your permanent side menu</span>
              </v-tooltip>
            </template>
            <template v-slot:selection="{ attrs, item, parent, selected }">
              <v-chip
                  v-bind="attrs"
                  :input-value="selected"
                  :close="item != 'COD' && item != 'TN' && item != 'TP'"
                  @click:close="remove_chip(item)"
              >
                <span class="pr-2">
                  {{ item }}
                </span>
              </v-chip>
            </template>
            <template v-slot:no-data>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>
                    No results matching "<strong>{{ search_pollutant }}</strong>". Press <kbd>enter</kbd> to create a new one
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </template>

          </v-combobox>
        </v-col>
      </v-row>
      <!-- ind_pollutants_effl -->
      <v-row v-else-if = "industry_input == 'ind_pollutants_effl'"
             align="center"
             v-for = "pollutant in model_selected_pollutants"
             :key="pollutant"
      >
        <v-col cols="7" >
          <div style="width: 100%;">
            <div style="height: 100%; display: flex; justify-content: space-between; width: 90%">
              <div>
                <span>
                  Concentration of {{pollutant}} in the industry effluent
                </span>
              </div>
              <!-- button estimation -->
              <v-btn v-if="button_estimation.includes(industry_input) && !isNaN(button_estimations(industry_input, pollutant)) && button_estimations(industry_input, pollutant) != null"
                     tile
                     x-small
                     color="#b62373"
                     @click="industry_model['ind_pollutants_effl'][pollutant] = button_estimations(industry_input, pollutant)"
              >
                Estimation:  {{button_estimations(industry_input, pollutant)}}
              </v-btn>
            </div>
          </div>
        </v-col>

        <v-col cols="3">
          <div>
            <div>
              <v-text-field
                  v-model="industry_model['ind_pollutants_effl'][pollutant]"
                  :suffix=user_inputs[industry_input].unit
                  type="number"
              ></v-text-field>
            </div>
          </div>
        </v-col>
        <!-- Data origin -->
        <v-col cols="2">
          <v-select
              label="Level of certainty"
              :items = level_of_certainty
              v-model="industry_level_of_certainty[industry_input][pollutant]"
              item-text="text"
              item-value="key"
          ></v-select>

        </v-col>

      </v-row>

    </v-container>
    <!-- Advanced inputs -->
    <v-expansion-panels style="padding-top: 20px">
      <v-expansion-panel>
        <v-expansion-panel-header color="#1c195b">
          <h3 style="color: white">SHOW ADVANCED INPUTS</h3>
          <template v-slot:actions>
            <v-icon color="white">
              $expand
            </v-icon>
          </template>
        </v-expansion-panel-header>
        <v-expansion-panel-content style="padding: 30px">
          <v-container
              v-for = "industry_input in array_difference(industry_inputs, basic_inputs)"
              :key="industry_input"
          >
            <v-row
                align="center"
                v-for = "pollutant in model_selected_pollutants"
                :key="pollutant"
            >
              <!-- Input description -->
              <v-col cols="7" >
                <div style="width: 100%;">
                  <div style="height: 100%; display: flex; justify-content: space-between; width: 90%">
                    <div>
                      <span>
                        Industry withdrawal water {{pollutant}} concentration (surface water only)
                      </span>
                    </div>
                  </div>
                </div>
              </v-col>
              <!-- Response -->
              <v-col cols="3">
                <div>
                  <div>
                    <v-text-field
                        v-model="industry_model['ind_pollutants_infl'][pollutant]"
                        :suffix=user_inputs[industry_input].unit
                        type="number"
                    ></v-text-field>
                  </div>
                </div>
              </v-col>
              <!-- Data origin -->
              <v-col cols="2">
                <v-select
                    label="Level of certainty"
                    :items = level_of_certainty
                    v-model="industry_level_of_certainty[industry_input][pollutant]"
                    item-text="text"
                    item-value="key"
                ></v-select>

              </v-col>

            </v-row>
          </v-container>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>

  </div>

</template>

<script>

import { updatedDiff } from 'deep-object-diff';

export default {
  name: "industry_questionnaire",
  props: [ 'array_intersection', 'industry_inputs', 'basic_inputs', 'user_inputs', 'required',
    'button_estimations', 'select_estimation', 'type_option', 'industry_model', 'required_item_select_rule',
  'items_selected_pollutants', 'search_pollutant', 'onChangeCombobox', 'model_selected_pollutants', 'button_estimation', 'array_difference',
    'remove_chip', 'required_item_text_rule', 'industry_level_of_certainty'],
  data(){
    return {
      level_of_certainty: [
        { text: 'User data', key: 'user_data' },
        { text: 'Estimated', key: 'estimated' },
        { text: 'Modeled', key: 'modeled' },
        { text: 'No data', key: 'no_data' },
      ],
    }
  },

  methods: {
    update_level_of_certainty(input, pollutant = null){

      if (input == "ind_pollutants_effl" || input == "ind_pollutants_infl"){
        let estimation = this.button_estimations(input, pollutant)
        if(this.industry_model[input][pollutant] == 0 || this.industry_model[input][pollutant] == null || this.industry_model[input][pollutant] == '' ){
          this.industry_level_of_certainty[input][pollutant] = 'no_data'
        }else if (this.industry_model[input][pollutant] == estimation){
          this.industry_level_of_certainty[input][pollutant] = 'estimated'
        }else{
          this.industry_level_of_certainty[input][pollutant] = 'user_data'
        }
      }
      else {
        let estimation = this.button_estimations(input)
        if(this.industry_model[input] == 0 || this.industry_model[input] == null || this.industry_model[input] == '' ){
          this.industry_level_of_certainty[input] = 'no_data'
        }else if (this.industry_model[input] == estimation){
          this.industry_level_of_certainty[input] = 'estimated'
        }else{
          this.industry_level_of_certainty[input] = 'user_data'
        }
      }
    }
  },
  computed:{
    clonedIndustry: function(){
      return JSON.parse(JSON.stringify(this.industry_model))
    }
  },
  watch: {
    clonedIndustry(newValue, oldValue){
      let input_diff = Object.keys(updatedDiff(newValue, oldValue))[0]
      let value_diff = Object.values(updatedDiff(newValue, oldValue))[0]
      let pollutant = null
      if (typeof value_diff === 'object' && value_diff !== null){
        pollutant = Object.keys(value_diff)[0]
      }

      this.update_level_of_certainty(input_diff, pollutant)
    },
  }

}

</script>





