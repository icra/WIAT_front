<template>
  <div>
    <div v-if="industry.has_direct_discharge == 1 && stepper_model == 3">
      <v-row
          align="center"
          v-for = "input in direct_discharge_inputs"
          :key="input"
      >
        <v-col cols="7" >
          <div style="width: 100%;">
            <div style="height: 100%; width: 100%;  display: flex; justify-content: space-between; max-width: 90%">
                <span>
                  {{user_inputs[input].question}}
                  <v-tooltip bottom v-if="user_inputs[input].hasOwnProperty('description_tooltip')">
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon
                          v-bind="attrs"
                          v-on="on"
                          color="primary"
                          style="margin-left: 2px; margin-right: 2px; font-size: 1.3rem;"
                      >
                        mdi-information-outline
                      </v-icon>
                    </template>
                    <span>{{ user_inputs[input]['description_tooltip'] }}</span>
                  </v-tooltip>
                  <v-tooltip bottom v-if="required.includes(input)">
                    <template v-slot:activator="{ on, attrs }">
                        <span
                            v-bind="attrs"
                            v-on="on"
                            style="color: red"
                        >*</span>
                    </template>
                    <span>Required input</span>
                  </v-tooltip>
                </span>
              <v-btn v-if="button_estimation.includes(input) && !isNaN(button_estimations(input)) && button_estimations(input) != null"
                     tile
                     color="#b62373"
                     x-small
                     @click="model[input] = button_estimations(input)"
              >
                Estimation:  {{button_estimations(input).toExponential(3)}}<!-- Botó amb estimació -->
              </v-btn>
            </div>
            <div v-if="select_estimation.includes(input)" style="width: 100%">
              <select v-model = "model[input]" style="max-width:90%;background-color: #d9d9d5; width: 90%; -webkit-appearance: menulist"  >
                <option
                    v-for="item in select_estimations(input)"
                    :value="item.value"
                >
                  <!--Desplegable amb estimació-->
                  {{item.name}} ({{item.value.toFixed(3)}})
                </option>
                <option :value="model[input]">Custom value</option>
              </select>
            </div>

          </div>
        </v-col>
        <v-col
            :cols="keys_without_level_of_certainty.has(input) ? 5 : 3"
        >
          <div>
            <div>
              <v-select
                  v-if="type_option[input]"
                  v-model="model[input]"
                  item-text="text"
                  item-value="value"
                  :items="type_option[input].items"
                  label="Select"
              >
              </v-select>
              <v-text-field
                  v-else
                  v-model="model[input]"
                  :suffix=user_inputs[input].unit
                  type="number"
              ></v-text-field>

            </div>
          </div>

        </v-col>
        <v-col cols="2" v-if="!keys_without_level_of_certainty.has(input)">
          <v-select
              label="Level of certainty"
              :items = level_of_certainty
              item-text="text"
              item-value="key"
              v-model="model.level_of_certainty[input]"

          ></v-select>

        </v-col>

      </v-row>


    </div>

    <br>
  </div>

</template>

<script>

import { updatedDiff } from 'deep-object-diff';
import {level_of_certainty} from "@/level_of_certainty";

export default {
  name: "direct_discharge_questionnaire",
  props: ['industry', 'stepper_model', 'model', 'direct_discharge_inputs', 'user_inputs', 'required', 'button_estimation', 'select_estimation',
  'type_option', 'select_estimations', 'button_estimations'],
  data(){
    return {
      level_of_certainty: [
        { text: 'User data', key: 'user_data' },
        { text: 'Estimated', key: 'estimated' },
        { text: 'Modeled', key: 'modeled' },
        { text: 'No data', key: 'no_data' },
      ],
      keys_without_level_of_certainty: level_of_certainty.keys_without_level_of_certainty
    }
  },

  computed:{
    clonedIndustry: function(){
      return JSON.parse(JSON.stringify(this.model))
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
      level_of_certainty.update_level_of_certainty(this.industry, this.model, this.stepper_model, input_diff, pollutant )
    },
  }

}

</script>





