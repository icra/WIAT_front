<template>
  <div class="outer">

    <h1 style="color: #b62373">Parameter configuration</h1>

    <div>
      For some factors WIAT has a default value assigned based on the literature (for example, for converting a pollutant to Toxic Units), but if you add more contaminants to work with in WIAT, you will have to add these values yourself.  For some factors WIAT has a default value assigned based on the literature (for example, for converting a pollutant to Toxic Units), but if you add more contaminants to work with in WIAT, you will have to add these values yourself.
      <b>If a value is not set it will be considered as 0.</b>
    </div>

    <v-card style="margin: 30px">
      <v-card-title>
        <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Search"
            single-line
            hide-details
        ></v-text-field>
      </v-card-title>
      <v-data-table
          :headers="headers"
          :items="pollutants"
          dense
          :search="search"
          hide-default-footer
          disable-pagination
      >
        <template v-slot:header.tu="{ header }">
          {{ header.text }}

          <v-tooltip bottom max-width="700px">
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                  small
                  v-bind="attrs"
                  v-on="on"
              >mdi-information-outline</v-icon>
            </template>
            <span>
              Concentration value of the pollutant at which in 24 hours causes the death or lack of movement of 50% of the individuals of Daphnia magna.
            </span>
          </v-tooltip>


        </template>
        <template v-slot:header.eqs="{ header }">
          {{ header.text }}

          <v-tooltip bottom max-width="700px">
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                  small
                  v-bind="attrs"
                  v-on="on"
              >mdi-information-outline</v-icon>
            </template>
            <span>
              Limits approved by the EU’s Water Framework Directive
            </span>
          </v-tooltip>


        </template>

        <template v-slot:top>
          <v-dialog
              v-model="dialog"
              max-width="500px"
          >

            <v-card>

              <v-card-text>
                <v-container>

                  <b>Editing:</b> {{editedItem.name}}
                  <v-row>
                    <v-col
                        cols="12"
                        sm="6"
                        md="6"
                    >
                      <v-text-field
                          v-model="editedItem.eqs"
                          label="EQS"
                          type="number"
                      ></v-text-field>
                    </v-col>
                    <v-col
                        cols="12"
                        sm="6"
                        md="6"
                    >
                      <v-text-field
                          v-model="editedItem.tu"
                          label="EC50"
                          :disabled = "editedItem.name == 'COD' || editedItem.name == 'TN' || editedItem.name == 'TP'"
                          type="number"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-btn
                      small
                      tile
                      block
                      color="#b62373"
                      @click="save"
                  >
                    SAVE
                  </v-btn>
                </v-container>
              </v-card-text>


            </v-card>
          </v-dialog>

        </template>
        <template v-slot:item.actions="{ item }">
          <v-icon
              small
              class="mr-2"
              @click="editItem(item)"
          >
            mdi-pencil
          </v-icon>
        </template>
        <template v-slot:item.warning="{ item }">
          <v-tooltip left v-if="item.warning != ''" max-width="500">
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                  small
                  class="mr-2"
                  v-bind="attrs"
                  v-on="on"
                  color="#b62373"
              >
                {{ item.warning }}
              </v-icon>

            </template>
            <span><b>Warning</b>: note that the EQS values are impact threshold values (universal) and not regulatory compliance values (locally defined). WBCSD recommends to not modify the EQS values, as they correspond to the stream quality needed for healthy ecosystems. These values apply to oceans or rivers (for more on EQS, refer to our Methodology document).</span>
          </v-tooltip>
        </template>

        <template v-slot:no-data>
          <br>
          <h2>Create sites or add pollutants first!</h2>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>


import conversion_factors from "@/conversion_factors";
import {utils} from "../utils"


export default {
  name: "import_assessments",
  components: {

  },
  data() {
    return {
      created_assessments: this.$assessments,  //Created assessments
      dialog: false,
      dialogDelete: false,
      headers: [
        {
          text: 'Pollutant',
          align: 'start',
          sortable: false,
          value: 'name',
        },
        { text: 'Environmental Quality Standards (mg/L)', value: 'eqs' },
        { text: 'EC50 (μg/L)', value: 'tu' },
        //{ text: 'Conversion factor to gPO4eq/m3 (Eutrophication potential)', value: 'eutrophication' },
        { text: 'Edit', value: 'actions', sortable: false },
        { text: '', value: 'warning', sortable: false },

      ],
      pollutants: [],
      search: '',
      editedIndex: -1,
      editedItem: {
        name: '',
        eqs: 0,
        tu: 0,
        eutrophication: 0,
      },
      defaultItem: {
        name: '',
        eqs: 0,
        tu: 0,
        eutrophication: 0,
      },
    }
  },
  computed: {
    formTitle () {
      return this.editedIndex === -1 ? 'New Item' : 'Edit Item'
    },
  },

  watch: {
    dialog (val) {
      val || this.close()
    },
    dialogDelete (val) {
      val || this.closeDelete()
    },
  },

  created () {
    this.initialize()
  },

  methods: {
    initialize () {
      let created_pollutants_set = this.$created_pollutants
      this.pollutants = utils.remove_nutrients([...created_pollutants_set]).map(pollutant => (
            {
              name: pollutant,
              eqs: conversion_factors[pollutant]['eqs'],
              tu: conversion_factors[pollutant]['tu'],
              //eutrophication: conversion_factors[pollutant]['eutrophication']
              //Pollutant in list
              warning: utils.pollutants_from_older_version.includes(pollutant) ? 'mdi-alert' : ''
            }
      ))
    },

    editItem (item) {
      this.editedIndex = this.pollutants.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },

    close () {
      this.dialog = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },

    closeDelete () {
      this.dialogDelete = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },

    save () {
      if (this.editedIndex > -1) {
        Object.assign(this.pollutants[this.editedIndex], this.editedItem)
      } else {
        this.pollutants.push(this.editedItem)
      }
      let tu_parsed = isNaN(parseFloat(this.editedItem.tu)) ? null : parseFloat(this.editedItem.tu)
      let eqs_parsed = isNaN(parseFloat(this.editedItem.eqs)) ? null : parseFloat(this.editedItem.eqs)

      conversion_factors[this.editedItem.name] = {eutrophication: '-', tu: tu_parsed, eqs: eqs_parsed}

      this.close()
    },
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