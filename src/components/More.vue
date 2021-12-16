<template>
  <div class="outer">
    <v-tabs v-model="tab">
      <v-tab>Tour</v-tab>
      <v-tab>About</v-tab>
      <v-tab>Documents</v-tab>
      <v-tab>Contact</v-tab>

    </v-tabs>

    <v-tabs-items v-model="tab">
      <v-tab-item
      >
        <v-card flat>
          serf
        </v-card>

      </v-tab-item>
      <v-tab-item
      >
        <v-card flat>
          <v-card-text v-text="text"></v-card-text>
        </v-card>

      </v-tab-item>
      <v-tab-item
      >
        <v-card flat>
          <v-card-text v-text="text"></v-card-text>
        </v-card>

      </v-tab-item>
      <v-tab-item
      >
        <v-card flat>
          <v-card-text v-text="text"></v-card-text>
        </v-card>

      </v-tab-item>
    </v-tabs-items>
  </div>



</template>

<script>

import {
  Assessment,
  Industry,
  Direct_discharge,
} from "../ecam_backend";

import * as Excel from "exceljs";
import * as moment from 'moment'
import standard_industries_classification from "../standard_industrial_classification"
import {utils} from "../utils"

export default {
  name: "more",
  components: {

  },
  data() {
    return {
      tab: null,

    }
  },
  methods: {
  },


};
</script>

<style scoped>

.flex{
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 50%;

}

.load_and_save{
  border: 2px solid #1C195B;
  border-radius: 10px;
}

.v-btn--disabled{
  background-color: rgba(0, 0, 0, 0.26) !important
}

</style>