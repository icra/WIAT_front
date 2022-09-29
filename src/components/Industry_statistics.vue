<template>
  <div style="height: 100%;" class="outer">

    <div v-if="utils.is_industry_valid(industry)">
      <v-tabs
          id="main_tab"
          v-model="main_tab"
          style="padding: 5px 0px 5px 0px"
      >
        <v-tabs-slider color="#b62373"></v-tabs-slider>

        <v-tab style="border-color: #b62373">CONTEXT</v-tab>
        <v-tab style="border-color: #b62373">IMPACT AND LEVERS FOR ACTION</v-tab>


      </v-tabs>
      <div v-if="industry != null" style="background-color: white">
        <div
            v-if="main_tab == 0"
        >
          <v-row>
            <v-col cols="4">
              <v-treeview
                  :items="layer_tree"
                  dense
                  hoverable
                  activatable
                  selection-type="leaf"
                  return-object
                  open-on-click
                  color="#1C195B"
                  selected-color="#1C195B"
                  style="padding-left: 15px"
                  item-disabled="locked"
                  @update:active="layerTreeSelected"

              >
                <template v-slot:append="{ item }">
                  <v-tooltip bottom v-if="item.layer && item.layer.info" max-width="700px">
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon
                          color='#1C195B'
                          style="padding-right: 10px"
                          v-bind="attrs"
                          v-on="on"
                      >
                        mdi-information-outline
                      </v-icon>
                    </template>
                    <span v-html="item.layer.info"></span>
                  </v-tooltip>


                </template>

              </v-treeview>

            </v-col>
            <v-divider vertical></v-divider>
            <v-col cols="8">
              <v-data-table
                  :headers="industry_table.header"
                  :items="industry_table.value"
                  :hide-default-footer="true"
                  class="expanded_table_hover"
                  :loading = "loading_context_table"
                  loading-text="Loading... Please wait"
                  :custom-sort="customSort"
              >

                <template v-slot:item.type="{ item }">
                  <v-tooltip left v-if="item.supplier_name == industry.name">
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon
                          v-bind="attrs"
                          v-on="on"
                      >
                        mdi-factory
                      </v-icon>
                    </template>
                    <span>Main industry</span>
                  </v-tooltip>
                  <v-tooltip left v-else>
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon
                          v-bind="attrs"
                          v-on="on"
                      >
                        mdi-truck
                      </v-icon>
                    </template>
                    <span>Supplier</span>
                  </v-tooltip>

                </template>
                <template v-slot:header.overall_water_risk="{ header }">
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
                      Overall water risk measures all water-related risks of an industry, by aggregating all indicators from the Physical Quantity, Quality and Regulatory & Reputational Risk categories. Higher values indicate higher water risk.
                      <br>
                      <b>Source: Aqueduct</b>

                    </span>
                  </v-tooltip>


                </template>
                <template v-slot:header.baseline="{ header }">
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
                      {{selected_layer.layer.layers.baseline.annual.layer["unit"]()}}
                    </span>
                  </v-tooltip>


                </template>
                <template v-slot:header.future="{ header }">
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
                      {{selected_layer.layer.layers.baseline.annual.layer["unit"]()}}
                    </span>
                  </v-tooltip>


                </template>

                <template
                    v-slot:item.overall_water_risk="{ item }"
                >
                  <template v-if="get_owr_color(item) != null">
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on, attrs }">
                        <v-chip
                            :color="get_owr_color(item)[0]"
                            dark
                            v-bind="attrs"
                            v-on="on"
                            text-color="#1c1c1b"
                        >
                          {{ item['overall_water_risk'] }}
                        </v-chip>
                      </template>
                      <span>{{ get_owr_color(item)[1] }}</span>
                    </v-tooltip>
                  </template>
                  <template v-else>
                    <v-chip
                        color="transparent"
                        dark
                        text-color="#1c1c1b"
                        class= "chip_no_hover"
                    >
                      {{ item['overall_water_risk'] }}
                    </v-chip>
                  </template>
                </template>
                <template
                    v-for="value in ['baseline', 'future']"
                    v-slot:[`item.${value}`]="{ item }"
                >
                  <template v-if="getGISLayerColor(item, value) != null">
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on, attrs }">
                        <v-chip
                            :color="getGISLayerColor(item, value)[0]"
                            dark
                            :key="value"
                            v-bind="attrs"
                            v-on="on"
                            text-color="#1c1c1b"
                        >
                          {{ item[value] }}
                        </v-chip>
                      </template>
                      <span>{{ getGISLayerColor(item, value)[1] }}</span>
                    </v-tooltip>
                  </template>
                  <template v-else>
                    <v-chip
                        color="transparent"
                        dark
                        :key="value"
                        text-color="#1c1c1b"
                        class= "chip_no_hover"
                    >
                      {{ item[value] }}
                    </v-chip>
                  </template>
                </template>
              </v-data-table>
              <BarChart
                  v-if="show_context_chart"
                  style="padding-top: 40px;"
                  :chart-data="context_chart.chartData"
                  :chart-options="context_chart.chartOptions"
              />
            </v-col>
          </v-row>

        </div>
        <v-row
            class="pa-4"
            justify="space-between"
            v-else-if="main_tab == 1"
        >
          <v-col cols="6">
            <h3>{{ industry.name }} </h3>

            <v-treeview
                :active.sync="active_indicator"
                :items="indicators_industry"
                activatable
                open-on-click
                transition
                dense
                :open.sync="open_indicator"

            >
              <template v-slot:prepend="{ item, open }" style="height: 120%; margin-top: -10px; padding-bottom: -30px;">
                <v-tooltip left v-if="indicator_risk_class(item) != null">
                  <template v-slot:activator="{ on, attrs }">
                    <div
                        style="width: 5px;"
                        :class="indicator_risk_class(item)[0]"
                        v-bind="attrs"
                        v-on="on"
                    >
                      &nbsp
                    </div>

                  </template>
                  <span>{{indicator_risk_class(item)[1]}}</span>
                </v-tooltip>
              </template>
              <template v-slot:append="{ item }">
                <v-tooltip bottom max-width="700px" v-if="item.info">
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon
                        color='#1C195B'
                        style="padding-right: 10px"
                        v-bind="attrs"
                        v-on="on"
                    >
                      mdi-information-outline
                    </v-icon>
                  </template>
                  <span>{{ item.info }}</span>
                </v-tooltip>
              </template>

            </v-treeview>
          </v-col>

          <v-divider vertical></v-divider>

          <v-col
              class="d-flex text-center"
              cols="6"
          >
            <v-scroll-y-transition mode="out-in">
              <div
                  class="text-h6 grey--text text--lighten-1 font-weight-light"
                  style="align-self: center;"
                  v-if="active_indicator.length == 0"
              >
                Select an indicator
              </div>
              <div v-else style="width: 100%">
                <div v-if="active_indicator[0] == 3">


                  <v-chip-group
                      mandatory
                      v-model="delta_ecotox_chip"
                  >
                    <v-chip
                        color="primary"
                        outlined
                        class="ma-2"
                        pill
                    >
                      <v-icon left>
                        mdi-chart-pie
                      </v-icon>
                      Chart
                    </v-chip>

                    <v-chip
                        color="primary"
                        outlined
                        pill
                        class="ma-2"
                    >
                      <v-icon left>
                        mdi-table
                      </v-icon>
                      Table

                    </v-chip>
                  </v-chip-group>
                  <v-data-table
                      :headers="delta_ecotox_table.header"
                      :items="delta_ecotox_table.value"
                      class="expanded_table_hover"
                      :item-class="itemRowBold"
                      disable-pagination
                      :hide-default-footer="true"
                      dense
                      v-if="delta_ecotox_chip === 1"

                  >
                    <template v-slot:item.value="{ item }">
                    <span v-if="item.info">
                      {{ item.value }}
                      <v-btn
                          icon
                          @click="$data[item.info] = true"
                          class="icon_clickable"
                          x-small
                      >
                        <v-icon
                            color='#1C195B'
                        >
                          mdi-information-outline
                        </v-icon>
                      </v-btn>


                    </span>
                      <span v-else>{{ item.value }}</span>
                    </template>

                    <template
                        v-slot:[`item.${industry.name}`]="{ item }"
                    >
                      <template v-if="getDeltaEcotoxColor(item) != null">
                        <v-tooltip bottom>
                          <template v-slot:activator="{ on, attrs }">
                            <v-chip
                                :color="getDeltaEcotoxColor(item)[0]"
                                dark
                                :key="industry.name"
                                v-bind="attrs"
                                v-on="on"
                                text-color="#1c1c1b"
                            >
                              {{ item[industry.name] }}
                            </v-chip>
                          </template>
                          <span>{{ getDeltaEcotoxColor(item)[1] }}</span>
                        </v-tooltip>
                      </template>
                      <template v-else>
                        <v-chip
                            color="transparent"
                            dark
                            :key="industry.name"
                            text-color="#1c1c1b"
                            class="chip_no_hover"
                        >
                          {{ item[industry.name] }}
                        </v-chip>
                      </template>

                    </template>
                  </v-data-table>

                  <div v-else-if="delta_ecotox_chip === 0">
                    <PieChart
                        style="padding-top: 10px"
                        :chart-data="delta_ecotox_chart.chartData"
                        :chart-options="delta_ecotox_chart.chartOptions"

                    />
                    <p class="instructions_2">
                      *Only labels >5% are shown.
                    </p>
                  </div>


                </div>
                <div v-else-if="active_indicator[0] == 4">
                  <v-chip-group
                      mandatory
                      v-model="delta_eqs_chip"
                  >
                    <v-chip
                        color="primary"
                        outlined
                        class="ma-2"
                        pill
                    >
                      <v-icon left>
                        mdi-chart-pie
                      </v-icon>
                      Chart
                    </v-chip>

                    <v-chip
                        color="primary"
                        outlined
                        pill
                        class="ma-2"
                    >
                      <v-icon left>
                        mdi-table
                      </v-icon>
                      Table

                    </v-chip>
                  </v-chip-group>
                  <BarChart
                      style="padding-top: 40px;"
                      :chart-data="delta_eqs_chart.chartData"
                      :chart-options="delta_eqs_chart.chartOptions"
                      v-if="delta_eqs_chip == 0"
                  />
                  <v-data-table
                      :headers="delta_eqs_table.header"
                      :items="delta_eqs_table.value"
                      class="expanded_table_hover"
                      v-else

                      disable-pagination
                      :hide-default-footer="true"
                      dense
                  >

                    <template v-slot:item.value="{ item }">
                    <span v-if="item.info">
                      {{ item.value }}
                      <v-btn
                          icon
                          @click="$data[item.info] = true"
                          class="icon_clickable"
                          x-small
                      >
                        <v-icon
                            color='#1C195B'
                        >
                          mdi-information-outline
                        </v-icon>
                      </v-btn>


                    </span>
                      <span v-else>{{ item.value }}</span>
                    </template>

                    <template
                        v-slot:[`item.${industry.name}`]="{ item }"
                    >

                      <template v-if="getDeltaEQSColor(item) != null">
                        <v-tooltip bottom>
                          <template v-slot:activator="{ on, attrs }">
                            <v-chip
                                :color="getDeltaEQSColor(item)[0]"
                                dark
                                :key="industry.name"
                                v-bind="attrs"
                                v-on="on"
                                text-color="#1c1c1b"
                            >
                              {{ item[industry.name] }}
                            </v-chip>
                          </template>
                          <span>{{ getDeltaEQSColor(item)[1] }}</span>
                        </v-tooltip>
                      </template>
                      <template v-else>
                        <v-chip
                            color="transparent"
                            dark
                            :key="industry.name"
                            text-color="#1c1c1b"
                            class="chip_no_hover"
                        >
                          {{ item[industry.name] }}
                        </v-chip>
                      </template>
                    </template>


                  </v-data-table>

                </div>
                <div v-else-if="active_indicator[0] == 5">

                  <v-chip-group
                      mandatory
                      v-model="eutrophication_chip"
                  >
                    <v-chip
                        color="primary"
                        outlined
                        class="ma-2"
                        pill
                    >
                      <v-icon left>
                        mdi-chart-pie
                      </v-icon>
                      Chart
                    </v-chip>

                    <v-chip
                        color="primary"
                        outlined
                        pill
                        class="ma-2"
                    >
                      <v-icon left>
                        mdi-table
                      </v-icon>
                      Table

                    </v-chip>
                  </v-chip-group>
                  <v-data-table
                      :headers="eutrophication_table.header"
                      :items="eutrophication_table.value"
                      class="expanded_table_hover"
                      :item-class="itemRowBold"
                      disable-pagination
                      :hide-default-footer="true"
                      dense
                      v-if="eutrophication_chip === 1"
                  >
                    <template v-slot:item.value="{ item }">
                    <span v-if="item.info">
                      {{ item.value }}
                      <v-btn
                          icon
                          @click="$data[item.info] = true"
                          class="icon_clickable"
                          x-small
                      >
                        <v-icon
                            color='#1C195B'
                        >
                          mdi-information-outline
                        </v-icon>
                      </v-btn>

                    </span>
                      <span v-else>{{ item.value }}</span>
                    </template>

                    <template
                        v-slot:[`item.${industry.name}`]="{ item }"
                    >

                      <template v-if="getEutrophicationColor(item) != null">
                        <v-tooltip bottom>
                          <template v-slot:activator="{ on, attrs }">
                            <v-chip
                                :color="getEutrophicationColor(item)[0]"
                                dark
                                :key="value"
                                v-bind="attrs"
                                v-on="on"
                                text-color="#1c1c1b"
                            >
                              {{ item[industry.name] }}
                            </v-chip>
                          </template>
                          <span>{{ getEutrophicationColor(item)[1] }}</span>
                        </v-tooltip>
                      </template>
                      <template v-else>
                        <v-chip
                            color="transparent"
                            dark
                            :key="industry.name"
                            text-color="#1c1c1b"
                            class="chip_no_hover"
                        >
                          {{ item[industry.name] }}
                        </v-chip>
                      </template>
                    </template>

                  </v-data-table>

                  <div v-else-if="eutrophication_chip === 0">
                    <PieChart
                        style="padding-top: 10px"
                        :chart-data="eutrophication_chart.chartData"
                        :chart-options="eutrophication_chart.chartOptions"

                    />
                    <p class="instructions_2">
                      *Only labels >5% are shown.
                    </p>
                  </div>

                </div>
                <div v-else-if="active_indicator[0] == 6">

                  <v-chip-group
                      mandatory
                      v-model="ecotoxicity_chip"
                  >
                    <v-chip
                        color="primary"
                        outlined
                        class="ma-2"
                        pill
                    >
                      <v-icon left>
                        mdi-chart-pie
                      </v-icon>
                      Chart
                    </v-chip>

                    <v-chip
                        color="primary"
                        outlined
                        pill
                        class="ma-2"
                    >
                      <v-icon left>
                        mdi-table
                      </v-icon>
                      Table

                    </v-chip>
                  </v-chip-group>
                  <v-data-table
                      :headers="ecotoxicity_table.header"
                      :items="ecotoxicity_table.value"
                      disable-pagination
                      :hide-default-footer="true"
                      dense
                      class="expanded_table_hover"
                      :item-class="itemRowBold"
                      v-if="ecotoxicity_chip === 1"
                  >
                    <template v-slot:item.value="{ item }">
                    <span v-if="item.info">
                      {{ item.value }}
                      <v-btn
                          icon
                          @click="$data[item.info] = true"
                          class="icon_clickable"
                          x-small
                      >
                        <v-icon
                            color='#1C195B'
                        >
                          mdi-information-outline
                        </v-icon>
                      </v-btn>


                </span>
                      <span v-else>{{ item.value }}</span>
                    </template>
                    <template
                        v-for="value in [industry]"
                        v-slot:[`item.${industry.name}`]="{ item }"
                    >

                      <template v-if="getEcotoxicity(item) != null">
                        <v-tooltip bottom>
                          <template v-slot:activator="{ on, attrs }">
                            <v-chip
                                :color="getEcotoxicity(item)[0]"
                                dark
                                :key="industry.name"
                                v-bind="attrs"
                                v-on="on"
                                text-color="#1c1c1b"
                            >
                              {{ item[industry.name] }}
                            </v-chip>
                          </template>
                          <span>{{ getEcotoxicity(item)[1] }}</span>
                        </v-tooltip>
                      </template>
                      <template v-else>
                        <v-chip
                            color="transparent"
                            dark
                            :key="value"
                            text-color="#1c1c1b"
                            class="chip_no_hover"
                        >
                          {{ item[industry.name] }}
                        </v-chip>
                      </template>
                    </template>

                  </v-data-table>

                  <div v-else-if="ecotoxicity_chip === 0">
                    <PieChart
                        style="padding-top: 10px"
                        :chart-data="ecotoxicity_chart.chartData"
                        :chart-options="ecotoxicity_chart.chartOptions"


                    />
                    <p class="instructions_2">
                      *Only labels >5% are shown.
                    </p>
                  </div>


                </div>
                <div v-else-if="active_indicator[0] == 7">
                  <v-chip-group
                      mandatory
                      v-model="eqs_chip"
                  >
                    <v-chip
                        color="primary"
                        outlined
                        class="ma-2"
                        pill
                    >
                      <v-icon left>
                        mdi-chart-pie
                      </v-icon>
                      Chart
                    </v-chip>

                    <v-chip
                        color="primary"
                        outlined
                        pill
                        class="ma-2"
                    >
                      <v-icon left>
                        mdi-table
                      </v-icon>
                      Table

                    </v-chip>
                  </v-chip-group>
                  <BarChart
                      style="padding-top: 40px;"
                      :chart-data="eqs_chart.chartData"
                      :chart-options="eqs_chart.chartOptions"
                      v-if="eqs_chip == 0"
                  />

                  <v-data-table
                      :headers="eqs_table.header"
                      :items="eqs_table.value"
                      disable-pagination
                      :hide-default-footer="true"
                      dense
                      class="expanded_table_hover"
                      v-else
                  >

                    <template v-slot:item.value="{ item }">
                    <span v-if="item.info">
                      {{ item.value }}
                      <v-btn
                          icon
                          @click="$data[item.info] = true"
                          class="icon_clickable"
                          x-small
                      >
                        <v-icon
                            color='#1C195B'
                        >
                          mdi-information-outline
                        </v-icon>
                      </v-btn>

                    </span>
                      <span v-else>{{ item.value }}</span>
                    </template>
                    <template
                        v-slot:[`item.${industry.name}`]="{ item }"
                    >

                      <template v-if="getEQSColor(item) != null">
                        <v-tooltip bottom>
                          <template v-slot:activator="{ on, attrs }">
                            <v-chip
                                :color="getEQSColor(item)[0]"
                                dark
                                :key="industry.name"
                                v-bind="attrs"
                                v-on="on"
                                text-color="#1c1c1b"
                            >
                              {{ item[industry.name] }}
                            </v-chip>
                          </template>
                          <span>{{ getEQSColor(item)[1] }}</span>
                        </v-tooltip>
                      </template>
                      <template v-else>
                        <v-chip
                            color="transparent"
                            dark
                            :key="industry.name"
                            text-color="#1c1c1b"
                            class="chip_no_hover"
                        >
                          {{ item[industry.name] }}
                        </v-chip>
                      </template>
                    </template>


                  </v-data-table>

                </div>
                <div v-else-if="active_indicator[0] == 9">
                  <v-data-table
                      :headers="treatment_efficiency_table.header"
                      :items="treatment_efficiency_table.value"
                      class="expanded_table_hover"

                      disable-pagination
                      :hide-default-footer="true"
                      dense
                  >

                    <template v-slot:item.value="{ item }">
                    <span v-if="item.info">
                      {{ item.value }}
                      <v-btn
                          icon
                          @click="$data[item.info] = true"
                          class="icon_clickable"
                          x-small
                      >
                        <v-icon
                            color='#1C195B'
                        >
                          mdi-information-outline
                        </v-icon>
                      </v-btn>


                    </span>
                      <span v-else>{{ item.value }}</span>
                    </template>
                    <template
                        v-slot:[`item.${industry.name}`]="{ item }"
                    >

                      <template v-if="getTreatmentEfficiencyColor(item) != null">
                        <v-tooltip bottom>
                          <template v-slot:activator="{ on, attrs }">
                            <v-chip
                                :color="getTreatmentEfficiencyColor(item)[0]"
                                dark
                                :key="industry.name"
                                v-bind="attrs"
                                v-on="on"
                                text-color="#1c1c1b"
                            >
                              {{ item[industry.name] }}
                            </v-chip>
                          </template>
                          <span>{{ getTreatmentEfficiencyColor(item)[1] }}</span>
                        </v-tooltip>
                      </template>
                      <template v-else>
                        <v-chip
                            color="transparent"
                            dark
                            :key="industry.name"
                            text-color="#1c1c1b"
                            class="chip_no_hover"
                        >
                          {{ item[industry.name] }}
                        </v-chip>
                      </template>
                    </template>

                  </v-data-table>

                </div>
                <div v-else-if="active_indicator[0] == 10">
                  <v-data-table
                      :headers="treatment_efficiency_influent_table.header"
                      :items="treatment_efficiency_influent_table.value"
                      disable-pagination
                      :hide-default-footer="true"
                      dense
                      class="expanded_table_hover"

                  >

                    <template v-slot:item.value="{ item }">
                  <span v-if="item.info">
                    {{ item.value }}
                    <v-btn
                        icon
                        @click="$data[item.info] = true"
                        class="icon_clickable"
                        x-small
                    >
                      <v-icon
                          color='#1C195B'
                      >
                        mdi-information-outline
                      </v-icon>
                    </v-btn>


                    </span>
                      <span v-else>{{ item.value }}</span>
                    </template>

                    <template
                        v-slot:[`item.${industry.name}`]="{ item }"
                    >

                      <template v-if="getTreatmentEfficiencyInfluentColor(item) != null">
                        <v-tooltip bottom>
                          <template v-slot:activator="{ on, attrs }">
                            <v-chip
                                :color="getTreatmentEfficiencyInfluentColor(item)[0]"
                                dark
                                :key="industry.name"
                                v-bind="attrs"
                                v-on="on"
                                text-color="#1c1c1b"
                            >
                              {{ item[industry.name] }}
                            </v-chip>
                          </template>
                          <span>{{ getTreatmentEfficiencyInfluentColor(item)[1] }}</span>
                        </v-tooltip>
                      </template>
                      <template v-else>
                        <v-chip
                            color="transparent"
                            dark
                            :key="industry.name"
                            text-color="#1c1c1b"
                            class="chip_no_hover"
                        >
                          {{ item[industry.name] }}
                        </v-chip>
                      </template>
                    </template>

                  </v-data-table>

                </div>
                <div v-else-if="active_indicator[0] == 11">
                  <v-data-table
                      :headers="treated_table.header"
                      :items="treated_table.value"
                      disable-pagination
                      :hide-default-footer="true"
                      dense
                      class="expanded_table_hover"

                  >

                    <template v-slot:item.value="{ item }">
                    <span v-if="item.info">
                      {{ item.value }}
                      <v-btn
                          icon
                          @click="$data[item.info] = true"
                          class="icon_clickable"
                          x-small
                      >
                        <v-icon
                            color='#1C195B'
                        >
                          mdi-information-outline
                        </v-icon>
                      </v-btn>
                    </span>
                      <span v-else>{{ item.value }}</span>
                    </template>

                  </v-data-table>
                </div>
                <div v-else-if="active_indicator[0] == 12">
                  <v-data-table
                      :headers="concentration_table.header"
                      :items="concentration_table.value"
                      disable-pagination
                      :hide-default-footer="true"
                      dense
                      class="expanded_table_hover"

                  >

                    <template v-slot:item.value="{ item }">
                      <span v-if="item.info">
                      {{ item.value }}
                      <v-btn
                          icon
                          @click="$data[item.info] = true"
                          class="icon_clickable"
                          x-small
                      >
                        <v-icon
                            color='#1C195B'
                        >
                          mdi-information-outline
                        </v-icon>
                      </v-btn>
                    </span>
                      <span v-else>{{ item.value }}</span>
                    </template>

                  </v-data-table>

                </div>
                <div v-else-if="active_indicator[0] == 14">
                  <v-data-table
                      :headers="water_quantity.header"
                      :items="water_quantity.value"

                      disable-pagination
                      :hide-default-footer="true"
                      dense
                  >
                    <template v-slot:item.value="{ item }">
                    <span v-if="item.info">
                      {{ item.value }}
                      <v-btn
                          icon
                          @click="$data[item.info] = true"
                          class="icon_clickable"
                          x-small
                      >
                        <v-icon
                            color='#1C195B'
                        >
                          mdi-information-outline
                        </v-icon>
                      </v-btn>

                    </span>
                      <span v-else>{{ item.value }}</span>
                    </template>

                    <template
                        v-slot:[`item.${industry.name}`]="{ item }"
                    >

                      <template v-if="getAvailabilityColor(item) != null">
                        <v-tooltip bottom>
                          <template v-slot:activator="{ on, attrs }">
                            <v-chip
                                :color="getAvailabilityColor(item)[0]"
                                dark
                                :key="industry.name"
                                v-bind="attrs"
                                v-on="on"
                                text-color="#1c1c1b"
                            >
                              {{ item[industry.name] }}
                            </v-chip>
                          </template>
                          <span>{{ getAvailabilityColor(item)[1] }}</span>
                        </v-tooltip>
                      </template>
                      <template v-else>
                        <v-chip
                            color="transparent"
                            dark
                            :key="industry.name"
                            text-color="#1c1c1b"
                            class="chip_no_hover"
                        >
                          {{ item[industry.name] }}
                        </v-chip>
                      </template>
                    </template>
                  </v-data-table>

                </div>
                <div v-else-if="active_indicator[0] == 15">
                  <v-data-table
                      :headers="freshwater_lever_for_action.header"
                      :items="freshwater_lever_for_action.value"
                      disable-pagination
                      :hide-default-footer="true"
                      dense
                      class="expanded_table_hover"

                  >

                    <template v-slot:item.value="{ item }">
                  <span v-if="item.info">
                    {{ item.value }}
                    <v-btn
                        icon
                        @click="$data[item.info] = true"
                        class="icon_clickable"
                        x-small
                    >
                      <v-icon
                          color='#1C195B'
                      >
                        mdi-information-outline
                      </v-icon>
                    </v-btn>
                  </span>
                      <span v-else>{{ item.value }}</span>
                    </template>

                  </v-data-table>

                </div>
                <div v-else-if="active_indicator[0] == 17">

                  <v-chip-group
                      mandatory
                      v-model="emissions_chip"
                  >
                    <v-chip
                        color="primary"
                        outlined
                        class="ma-2"
                        pill
                    >
                      <v-icon left>
                        mdi-chart-pie
                      </v-icon>
                      Chart
                    </v-chip>

                    <v-chip
                        color="primary"
                        outlined
                        pill
                        class="ma-2"
                    >
                      <v-icon left>
                        mdi-table
                      </v-icon>
                      Table

                    </v-chip>
                  </v-chip-group>

                  <v-data-table
                      :headers="emissions_table.header"
                      :items="emissions_table.value"

                      :item-class="itemRowBold"
                      disable-pagination
                      :hide-default-footer="true"
                      dense
                      v-if="emissions_chip === 1"
                  >
                    <template v-slot:item.value="{ item }">
                    <span v-if="item.info">
                      {{ item.value }}
                      <v-btn
                          icon
                          @click="$data[item.info] = true"
                          class="icon_clickable"
                          x-small
                      >
                        <v-icon
                            color='#1C195B'
                        >
                          mdi-information-outline
                        </v-icon>
                      </v-btn>
                    </span>
                      <span v-else>{{ item.value }}</span>
                    </template>

                    <template
                        v-slot:[`item.${industry.name}`]="{ item }"
                    >

                      <template v-if="getGlobalWarming(item) != null">
                        <v-tooltip bottom>
                          <template v-slot:activator="{ on, attrs }">
                            <v-chip
                                :color="getGlobalWarming(item)[0]"
                                dark
                                :key="industry.name"
                                v-bind="attrs"
                                v-on="on"
                                text-color="#1c1c1b"
                            >
                              {{ item[industry.name] }}
                            </v-chip>
                          </template>
                          <span>{{ getGlobalWarming(item)[1] }}</span>
                        </v-tooltip>
                      </template>
                      <template v-else>
                        <v-chip
                            color="transparent"
                            dark
                            :key="industry.name"
                            text-color="#1c1c1b"
                            class="chip_no_hover"
                        >
                          {{ item[industry.name] }}
                        </v-chip>
                      </template>
                    </template>

                  </v-data-table>
                  <div v-else-if="emissions_chip === 0">
                    <PieChart
                        style="padding-top: 10px"
                        :chart-data="emissions_chart.chartData"
                        :chart-options="emissions_chart.chartOptions"


                    />
                    <p class="instructions_2">
                      *Only labels >5% are shown.
                    </p>
                  </div>




                </div>
                <div v-else-if="active_indicator[0] == 19">
                  <v-data-table
                      :headers="energy_use_table.header"
                      :items="energy_use_table.value"

                      :item-class="itemRowBold"
                      disable-pagination
                      :hide-default-footer="true"
                      dense
                  >
                    <template v-slot:item.value="{ item }">
                    <span v-if="item.info">
                      {{ item.value }}
                      <v-btn
                          icon
                          @click="$data[item.info] = true"
                          class="icon_clickable"
                          x-small
                      >
                        <v-icon
                            color='#1C195B'
                        >
                          mdi-information-outline
                        </v-icon>
                      </v-btn>


                    </span>
                      <span v-else>{{ item.value }}</span>
                    </template>


                  </v-data-table>
                </div>
                <div v-else-if="active_indicator[0] == 20">
                  <v-data-table
                      :headers="effluent_load_table.header"
                      :items="effluent_load_table.value"

                      :item-class="itemRowBold"
                      disable-pagination
                      :hide-default-footer="true"
                      dense
                  >
                    <template v-slot:item.value="{ item }">
                    <span v-if="item.info">
                      {{ item.value }}
                      <v-btn
                          icon
                          @click="$data[item.info] = true"
                          class="icon_clickable"
                          x-small
                      >
                        <v-icon
                            color='#1C195B'
                        >
                          mdi-information-outline
                        </v-icon>
                      </v-btn>


                    </span>
                      <span v-else>{{ item.value }}</span>
                    </template>


                  </v-data-table>
                </div>
                <div v-else-if="active_indicator[0] == 21">
                  <v-data-table
                      :headers="biogas_valorised_table.header"
                      :items="biogas_valorised_table.value"

                      :item-class="itemRowBold"
                      disable-pagination
                      :hide-default-footer="true"
                      dense
                  >
                    <template v-slot:item.value="{ item }">
                    <span v-if="item.info">
                      {{ item.value }}
                      <v-btn
                          icon
                          @click="$data[item.info] = true"
                          class="icon_clickable"
                          x-small
                      >
                        <v-icon
                            color='#1C195B'
                        >
                          mdi-information-outline
                        </v-icon>
                      </v-btn>


                    </span>
                      <span v-else>{{ item.value }}</span>
                    </template>


                  </v-data-table>
                </div>
                <div v-else-if="active_indicator[0] == 22">
                  <v-chip-group
                      mandatory
                      v-model="ghg_ratio_chip"
                  >
                    <v-chip
                        color="primary"
                        outlined
                        class="ma-2"
                        pill
                    >
                      <v-icon left>
                        mdi-chart-pie
                      </v-icon>
                      Chart
                    </v-chip>

                    <v-chip
                        color="primary"
                        outlined
                        pill
                        class="ma-2"
                    >
                      <v-icon left>
                        mdi-table
                      </v-icon>
                      Table

                    </v-chip>
                  </v-chip-group>
                  <v-data-table
                      :headers="ghg_ratio_table.header"
                      :items="ghg_ratio_table.value"
                      class="expanded_table_hover"
                      :item-class="itemRowBold"
                      disable-pagination
                      :hide-default-footer="true"
                      dense
                      v-if="ghg_ratio_chip === 1"
                  >
                    <template v-slot:item.value="{ item }">
                      <span v-if="item.info">
                      {{ item.value }}
                      <v-btn
                          icon
                          @click="$data[item.info] = true"
                          class="icon_clickable"
                          x-small
                      >
                        <v-icon
                            color='#1C195B'
                        >
                          mdi-information-outline
                        </v-icon>
                      </v-btn>

                    </span>
                      <span v-else>{{ item.value }}</span>
                    </template>

                  </v-data-table>

                  <div v-else-if="ghg_ratio_chip === 0">
                    <PieChart
                        style="padding-top: 10px"
                        :chart-data="ghg_ratio_chart.chartData"
                        :chart-options="ghg_ratio_chart.chartOptions"

                    />
                    <p class="instructions_2">
                      *Only labels >5% are shown.
                    </p>
                  </div>

                </div>
                <div v-else-if="active_indicator[0] == 23">
                  <v-chip-group
                      mandatory
                      v-model="ghg_sludge_management_chip"
                  >
                    <v-chip
                        color="primary"
                        outlined
                        class="ma-2"
                        pill
                    >
                      <v-icon left>
                        mdi-chart-pie
                      </v-icon>
                      Chart
                    </v-chip>

                    <v-chip
                        color="primary"
                        outlined
                        pill
                        class="ma-2"
                    >
                      <v-icon left>
                        mdi-table
                      </v-icon>
                      Table

                    </v-chip>
                  </v-chip-group>
                  <v-data-table
                      :headers="ghg_sludge_management_table.header"
                      :items="ghg_sludge_management_table.value"
                      class="expanded_table_hover"
                      :item-class="itemRowBold"
                      disable-pagination
                      :hide-default-footer="true"
                      dense
                      v-if="ghg_sludge_management_chip === 1"
                  >
                    <template v-slot:item.value="{ item }">
                      <span v-if="item.info">
                      {{ item.value }}
                      <v-btn
                          icon
                          @click="$data[item.info] = true"
                          class="icon_clickable"
                          x-small
                      >
                        <v-icon
                            color='#1C195B'
                        >
                          mdi-information-outline
                        </v-icon>
                      </v-btn>

                    </span>
                      <span v-else>{{ item.value }}</span>
                    </template>

                  </v-data-table>

                  <div v-else-if="ghg_sludge_management_chip === 0">
                    <BarChart
                        style="padding-top: 10px"
                        :chart-data="ghg_sludge_management_chart.chartData"
                        :chart-options="ghg_sludge_management_chart.chartOptions"
                    />
                  </div>

                </div>


              </div>
            </v-scroll-y-transition>
          </v-col>
        </v-row>


      </div>
      <div v-if="industry != null">

        <!-- Quality and quantity -->
        <v-dialog
            v-model="info_energy_used"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3>Energy used</h3>
            <br>
            Energy used by wastewater treatment plants to treat the water sent to the treatment plant.
            <div v-katex:display="'\\frac{\\sum_{i \\in WWTPS} W_{t_{i}} \\cdot energy_{{consumed}_i}}{\\sum_{i \\in WWTPS} W_{t_{i}} }'"></div>
            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'WWTPS'"></span>: Onsite and external WWTP's where industry treats water</li>
              <li><span v-katex="'W_t'"></span>: Volume of water treated in the WWTP</li>
              <li><span v-katex="'energy_{consumed}'"></span>: Electricity consumed from the grid for wastewater treatment
                per cubic meter treated
              </li>

            </ul>
          </div>

        </v-dialog>

        <v-dialog
            v-model="info_dilution_factor"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3>Dilution factor</h3>
            <br>
            Ratio of concentration in the effluent to concentration in the receiving water after mixing in the receiving
            water. Bigger values indicate less impact of the effluent concentration to the river.
            <div v-katex:display="'\\frac{W_a + W_{effl} - W_w}{W_{effl}}'"></div>
            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'W_a'"></span>: Amount of superficial water available <b>(streamflow global
                indicator)</b></li>
              <li><span v-katex="'W_w'"></span>: Amount of water withdrawn from the river</li>
              <li><span v-katex="'W_{effl}'"></span>: Amount of water discharged into the river by industry</li>

            </ul>
          </div>

        </v-dialog>
        <v-dialog
            v-model="info_recycled_factor"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3>Recycled water factor</h3>
            <br>
            This metric indicates the percentage of the reused water used by the industry
            respect the water that leaves the industry (to direct discharge, onsite industry
            WWTP effluent and to external WWTP effluent). Values that may have this
            metric range from 0 to 100, the larger its value the more efficient the water
            recycled is.
            <div v-katex:display="'\\frac{W_r}{OWWTP_{infl} + EWWTP_{infl} + DD}'"></div>
            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'W_r'"></span>: Amount of water that the industry reuses/recycles from the WWTP.</li>

              <li><span v-katex="'OWWTP_{infl}'"></span>: On-site industrial WWTP influent</li>
              <li><span v-katex="'EWWTP_{infl}'"></span>: External WWTP influent</li>
              <li><span v-katex="'DD'"></span>: Amount of water discharged into the river by industry</li>
            </ul>
          </div>

        </v-dialog>
        <v-dialog
            v-model="info_treated_factor"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3>Treated water factor</h3>
            <br>
            This metric indicates the ratio between the water remaining after the industry consumption and the water that
            is treated in the WWTP.
            <div v-katex:display="'\\frac{W_t}{OWWTP_{infl} + EWWTP_{infl} + DD}'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'W_t'"></span>: Amount of water used by the industry that is treated in a WWTP</li>
              <li><span v-katex="'OWWTP_{infl}'"></span>: On-site industrial WWTP influent</li>
              <li><span v-katex="'EWWTP_{infl}'"></span>: External WWTP influent</li>
              <li><span v-katex="'DD'"></span>: Amount of water discharged into the river by industry</li>
            </ul>
          </div>

        </v-dialog>
        <v-dialog
            v-model="info_water_stress"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3>Consumption available (level of water stress)</h3>
            <br>
            This metric is calculated from the relationship between the amount of water withdrawn by the industry and the
            amount of water available and multiplied by 100. It indicates the percentage of the available water withdrawn
            by the industry’s consumption. This metric may have values ranging from 0, to a value greater than 100,
            indicating that the demand for water is higher than the available.
            <div v-katex:display="'100 \\cdot \\frac{W_w}{W_a}'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'W_w'"></span>: amount of water that the industry withdraws from the river.</li>

              <li><span v-katex="'W_a'"></span>: amount of water available on the river <b>(streamflow global
                indicator)</b></li>
            </ul>
          </div>

        </v-dialog>
        <v-dialog
            v-model="info_specific_consumption"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3>Specific water consumption </h3>
            <br>
            Specific water consumption is a metric that indicates what is the amount of water from the water body needed
            to produce a tone of product manufactured in the industry. Higher values indicate higher water demand.
            <div v-katex:display="'\\frac{T_{ppi}}{W_w}'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'T_{ppi}'"></span>: tons of product produced by the industry</li>

              <li><span v-katex="'W_w'"></span>: amount of water that the industry withdraws (both superficial and groundwater)</li>
            </ul>
          </div>

        </v-dialog>

        <!-- GHG -->
        <v-dialog
            v-model="info_electricity"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3>Indirect emissions from electricity consumption </h3>
            <br>
            <div v-katex:display="'\\sum_{i \\in WWTPS}EF_{i} \\cdot EC_i \\cdot W_t'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'WWTPS'"></span>: onsite and external WWTP's where industry treats water</li>
              <li><span v-katex="'EF'"></span>: emission factor for grid electricity</li>
              <li><span v-katex="'EC'"></span>: energy consumed from the grid for wastewater treatment per cubic meter
                treated
              </li>
              <li><span v-katex="'W_t'"></span>: Amount of water treated</li>

            </ul>
          </div>

        </v-dialog>
        <v-dialog
            v-model="info_fuel_engines"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3>Emissions from fuel engines </h3>
            <br>
            Direct CO2 emitted from on-site engines in wastewater stages based upon sum of CO2, CH4 and N2O emission from
            stationary combustion.
            <div
                v-katex:display="'CO_2 = \\sum_{i \\in WWTPS} \\frac{V_i \\cdot FD \\cdot NCV \\cdot EF_{CO_2}}{1000}'"></div>
            <div
                v-katex:display="'N_2O = \\sum_{i \\in WWTPS} \\frac{V_i \\cdot FD \\cdot NCV \\cdot EF_{N_2O} \\cdot EQ_{N_2O}}{1000}'"></div>
            <div
                v-katex:display="'CH_{4} = \\sum_{i \\in WWTPS} \\frac{V_i \\cdot FD \\cdot NCV \\cdot EF_{CH_4} \\cdot EQ_{CH_4}}{1000}'"></div>
            <div v-katex:display="'Total = CO_2 + N_2O + CH_4'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'WWTPS'"></span>: onsite and external WWTP's where industry treats water</li>
              <li><span v-katex="'V'"></span>: volume of fuel consumed</li>
              <li><span v-katex="'EQ_{N_2O}'"></span>: conversion of N2O emissions to CO2 equivalent emissions (<b>298
                kgCO2eq/kgN2O</b>)
              </li>
              <li><span v-katex="'EQ_{CH_4}'"></span>: Conversion of CH4 emissions to CO2 equivalent emissions (<b>34
                kgCO2eq/kgCH4</b>)
              </li>
            </ul>
            <br>
            <table style="width: 90%; border: 1px solid; border-collapse: collapse">
              <tr style="border: 1px solid; border-collapse: collapse">
                <td style="border: 1px solid; border-collapse: collapse"><b>Fuel type</b></td>
                <td style="border: 1px solid; border-collapse: collapse"><b>EFCH4 <br> (kg/TJ) </b></td>
                <td style="border: 1px solid; border-collapse: collapse"><b>EFN2O <br> (kg/TJ) </b></td>
                <td style="border: 1px solid; border-collapse: collapse"><b>EFCO2 <br> (kg/TJ) </b></td>
                <td style="border: 1px solid; border-collapse: collapse"><b>FD <br> (kg/L) </b></td>
                <td style="border: 1px solid; border-collapse: collapse"><b>NCV <br> (TJ/Gg) </b></td>
              </tr>
              <tr style="border: 1px solid; border-collapse: collapse">
                <td style="border: 1px solid; border-collapse: collapse">Diesel</td>
                <td style="border: 1px solid; border-collapse: collapse">3</td>
                <td style="border: 1px solid; border-collapse: collapse">0.6</td>
                <td style="border: 1px solid; border-collapse: collapse">74100</td>
                <td style="border: 1px solid; border-collapse: collapse">0.84</td>
                <td style="border: 1px solid; border-collapse: collapse">43</td>
              </tr>
              <tr style="border: 1px solid; border-collapse: collapse">
                <td style="border: 1px solid; border-collapse: collapse">Gasoline/Petrol</td>
                <td style="border: 1px solid; border-collapse: collapse">3</td>
                <td style="border: 1px solid; border-collapse: collapse">0.6</td>
                <td style="border: 1px solid; border-collapse: collapse">69300</td>
                <td style="border: 1px solid; border-collapse: collapse">0.74</td>
                <td style="border: 1px solid; border-collapse: collapse">44.3</td>
              </tr>
              <tr style="border: 1px solid; border-collapse: collapse">
                <td style="border: 1px solid; border-collapse: collapse">Natural gas</td>
                <td style="border: 1px solid; border-collapse: collapse">10</td>
                <td style="border: 1px solid; border-collapse: collapse">0.1</td>
                <td style="border: 1px solid; border-collapse: collapse">56100</td>
                <td style="border: 1px solid; border-collapse: collapse">0.75</td>
                <td style="border: 1px solid; border-collapse: collapse">48</td>
              </tr>
            </table>
            <br>
            <b>Reference:</b> <a href="docs/V2_2_Ch2_Stationary_Combustion.pdf#page=16" target="_blank">IPCC 2006, Volume
            2, Chapter 2: Stationary Combustion, Table 2.2</a>

          </div>

        </v-dialog>
        <v-dialog
            v-model="info_discharge"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3>Emissions from discharged water </h3>
            <br>
            <div v-katex:display="'CH_4 = \\sum_{i \\in DP} COD_{effl_i} \\cdot EF_{CH_4} \\cdot EQ_{CH_4}'"></div>
            <div
                v-katex:display="'N_2O = \\sum_{i \\in DP} TN_{effl_i} \\cdot EF_{N_2O} \\cdot NtoN_2O \\cdot EQ_{N_20}'"></div>
            <div v-katex:display="'Total = N_2O + CH_4'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and offsite WWTP and directly discharged water</li>
              <li><span v-katex="'COD_{effl}'"></span>: load of COD in the effluent</li>
              <li><span v-katex="'EF_{CH_4}'"></span>: CH4 emission factor</li>
              <li><span v-katex="'EQ_{CH_4}'"></span>: conversion of CH4 emissions to CO2 equivalent emissions (<b>34
                kgCO2eq/kgCH4</b>)
              </li>
              <li><span v-katex="'TN_{effl}'"></span>: load of TN in the effluent</li>
              <li><span v-katex="'EF{N_2O}'"></span>: N2O emission factor</li>
              <li><span v-katex="'NtoN_2O'"></span>: N2O-N to N20 conversion factor (<b>1.57 gN2O/gN2O-N</b>)</li>
              <li><span v-katex="'EQ_{N_2O}'"></span>: conversion of N2O to CO2 equivalent emissions (<b>298
                kgCO2eq/kgN2O</b>)
              </li>
            </ul>

            <b>Reference:</b> <a href="docs/19R_V5_6_Ch06_Wastewater.pdf#page=17" target="_blank">IPCC 2019 revision,
            Volume 5, Chapter 6 Wastewater: equation 6.1</a>, <a href="docs/19R_V5_6_Ch06_Wastewater.pdf#page=37"
                                                                 target="_blank">IPCC 2019 revision, Volume 5, Chapter 6
            Wastewater: equation 6.9</a>

            <br>
          </div>

        </v-dialog>
        <v-dialog
            v-model="info_reuse"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3>Water reuse transport </h3>
            <br>
            GHG emissions from truck transport of reused water
            <br>
            <div
                v-katex:display="'CO_2 = \\sum_{i \\in WWTPS}\\frac{V_i \\cdot FD \\cdot NCV \\cdot EF_{CO_2}}{1000}'"></div>
            <div
                v-katex:display="'N_2O = \\sum_{i \\in WWTPS}\\frac{V_i \\cdot FD \\cdot NCV \\cdot EF_{N_2O} \\cdot EQ_{N_2O}}{1000}'"></div>
            <div
                v-katex:display="'CH_4 = \\sum_{i \\in WWTPS}\\frac{V_i \\cdot FD \\cdot NCV \\cdot EF_{CH_4} \\cdot EQ_{CH_4}}{1000}'"></div>
            <div v-katex:display="'Total = CO_2 + N_2O + CH_4'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'WWTPS'"></span>: onsite and external WWTP's where industry treats water</li>

              <li><span v-katex="'V'"></span>: volume of fuel consumed</li>

              <li><span v-katex="'EQ_{N_2O}'"></span>: conversion of N2O emissions to CO2 equivalent emissions (<b>298
                kgCO2eq/kgN2O</b>)
              </li>
              <li><span v-katex="'EQ_{CH_4}'"></span>: Conversion of CH4 emissions to CO2 equivalent emissions (<b>34
                kgCO2eq/kgCH4</b>)
              </li>
            </ul>
            <br>
            <table style="width: 90%; border: 1px solid; border-collapse: collapse">
              <tr style="border: 1px solid; border-collapse: collapse">
                <td style="border: 1px solid; border-collapse: collapse"><b>Fuel type</b></td>
                <td style="border: 1px solid; border-collapse: collapse"><b>EFCH4 <br> (kg/TJ) </b></td>
                <td style="border: 1px solid; border-collapse: collapse"><b>EFN2O <br> (kg/TJ) </b></td>
                <td style="border: 1px solid; border-collapse: collapse"><b>EFCO2 <br> (kg/TJ) </b></td>
                <td style="border: 1px solid; border-collapse: collapse"><b>FD <br> (kg/L) </b></td>
                <td style="border: 1px solid; border-collapse: collapse"><b>NCV <br> (TJ/Gg) </b></td>
              </tr>
              <tr style="border: 1px solid; border-collapse: collapse">
                <td style="border: 1px solid; border-collapse: collapse">Diesel</td>
                <td style="border: 1px solid; border-collapse: collapse">3.9</td>
                <td style="border: 1px solid; border-collapse: collapse">3.9</td>
                <td style="border: 1px solid; border-collapse: collapse">74100</td>
                <td style="border: 1px solid; border-collapse: collapse">0.84</td>
                <td style="border: 1px solid; border-collapse: collapse">43</td>
              </tr>
              <tr style="border: 1px solid; border-collapse: collapse">
                <td style="border: 1px solid; border-collapse: collapse">Gasoline/Petrol</td>
                <td style="border: 1px solid; border-collapse: collapse">3.8</td>
                <td style="border: 1px solid; border-collapse: collapse">1.9</td>
                <td style="border: 1px solid; border-collapse: collapse">69300</td>
                <td style="border: 1px solid; border-collapse: collapse">0.74</td>
                <td style="border: 1px solid; border-collapse: collapse">44.3</td>
              </tr>
              <tr style="border: 1px solid; border-collapse: collapse">
                <td style="border: 1px solid; border-collapse: collapse">Natural gas</td>
                <td style="border: 1px solid; border-collapse: collapse">92</td>
                <td style="border: 1px solid; border-collapse: collapse">0.2</td>
                <td style="border: 1px solid; border-collapse: collapse">56100</td>
                <td style="border: 1px solid; border-collapse: collapse">0.75</td>
                <td style="border: 1px solid; border-collapse: collapse">48</td>
              </tr>
            </table>
            <br>
            <br>
            <b>Reference:</b> <a href="docs/V2_3_Ch3_Mobile_Combustion.pdf#page=21" target="_blank">IPCC 2006, Volume 2,
            Chapter 3: Mobile Combustion, Table 3.2.2 </a>

          </div>

        </v-dialog>
        <v-dialog
            v-model="info_treatment"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3>Emissions from water treatment </h3>
            <br>
            <div
                v-katex:display="'CH_4 = \\sum_{i \\in WWTPS} (COD_{infl_i} - COD_{slu_i}) \\cdot EF_{CH4_i} \\cdot EQ_{CH_4}'"></div>
            <div
                v-katex:display="'N_2O = \\sum_{i \\in WWTPS}TN_{infl_i} \\cdot EF_{N_2O_i} \\cdot NtoN_2O \\cdot EQ_{N_20}'"></div>
            <div v-katex:display="'Total = N_2O + CH_4'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'WWTPS'"></span>: onsite and external wastewater treatment plants</li>
              <li><span v-katex="'COD_{infl}'"></span>: COD load in WWTP influent</li>
              <li><span v-katex="'COD_{slu}'"></span>: COD removed as sludge</li>
              <li><span v-katex="'EF_{CH_4}'"></span>: CH4 emission factor</li>
              <li><span v-katex="'EQ_{CH_4}'"></span>: conversion of CH4 emissions to CO2 equivalent emissions (<b>34
                kgCO2eq/kgCH4</b>)
              </li>
              <li><span v-katex="'TN_{infl}'"></span>: Total Nitrogen load in the WWTP influent</li>
              <li><span v-katex="'EF{N_2O}'"></span>: N2O emission factor</li>
              <li><span v-katex="'NtoN_2O'"></span>: N2O-N to N20 conversion factor (<b>1.57 gN2O/gN2O-N</b>)</li>
              <li><span v-katex="'EQ_{N_2O}'"></span>: conversion of N2O to CO2 equivalent emissions (<b>298
                kgCO2eq/kgN2O</b>)
              </li>


            </ul>
            <br>
          </div>

        </v-dialog>
        <v-dialog
            v-model="info_sludge_management"
            width="85%"
        >
          <div class="dialog_detail" style="background-color: white">
            <div v-if="dialog_biogas_stage == 0">
              <h3>Emissions from sludge management </h3>
              <br>
              GHG emissions from sludge management operations (storing, composting, incineration, land application,
              landfilling, stockpiling and truck transport).
              <br>
              <br>


              <div
                  v-katex:display="'Total = \\sum_{i \\in WWTPS} storage_i + composting_i +incineration_i+ land\\_ application_i+landfilling_i+stockpiling_i + \\newline + storage_i+transport_i'"></div>
              <b>Where:</b>
              <br>
              <ul>
                <li><span v-katex="'WWTPS'"></span>: onsite and external WWTP's where industry treats water</li>
                <li><span class="hover" @click="dialog_biogas_stage = 1">storage</span>: Amount of CO2eq emissions related
                  to sludge storage
                </li>
                <li><span class="hover" @click="dialog_biogas_stage = 2">composting</span>: Amount of CO2eq emissions due
                  to sludge composted
                </li>
                <li><span class="hover" @click="dialog_biogas_stage = 3">incineration</span>: Amount of CO2eq emissions
                  due to sludge incineration
                </li>
                <li><span class="hover" @click="dialog_biogas_stage = 4">land application</span>: Amount of CO2eq
                  emissions due to land application of sludge
                </li>
                <li><span class="hover" @click="dialog_biogas_stage = 5">landfilling</span>: Fugitive methane emissions
                  from biosolids decomposition in the landfill during the first 3 years after placement, and N2O emissions
                  from landfilled biosolids
                </li>
                <li><span class="hover" @click="dialog_biogas_stage = 6">stockpiling</span>: Amount of CO2eq emissions due
                  to sludge stockpiling
                </li>
                <li><span class="hover" @click="dialog_biogas_stage = 7">transport</span>: Indirect CO2 emitted from
                  sludge transport off-site
                </li>


              </ul>

              <br>
              <b>Reference:</b> <a href="docs/beam_final_report_1432.pdf#page=169" target="_blank">Section 12.8
              "Composting", Beam page 147</a>, <a href="docs/beam_final_report_1432.pdf#page=183" target="_blank">Section
              12.10 "Combustion (Incineration)", Beam, page 161 </a>, <a href="docs/beam_final_report_1432.pdf#page=188"
                                                                         target="_blank">Section 12.11 "Land application",
              Beam page 166 </a>, <a href="docs/beam_final_report_1432.pdf#page=175" target="_blank">Section 12.9
              "Landfill disposal", page 153 </a>, <a href="https://doi.org/10.1016/j.jenvman.2014.04.016 "
                                                     target="_blank">Majumder, R., Livesley, S., Gregory, D., & Arndt, S.
              (2014, 05 15). Biosolids stockpiles are a significant point source for greenhouse gas emissions. Journal of
              Environmental Management, 143, pp. 34-43</a>, <a href="docs/V2_3_Ch3_Mobile_Combustion.pdf#page=21"
                                                               target="_blank">IPCC 2006, Volume 2, Chapter 3: Mobile
              Combustion, Table 3.2.2 </a>

            </div>
            <div v-else>
              <div>
                <div
                    style="margin: -20px !important; padding-bottom: 60px"
                >
                  <v-icon @click="dialog_biogas_stage = 0" class="hover">
                    mdi-undo
                  </v-icon>
                </div>
              </div>
              <div v-if="dialog_biogas_stage == 1">
                <h3>Sludge storage</h3>
                <br>
                Amount of CO2eq emissions due to sludge storage
                <br>
                <br>
                <span v-katex:display="'TVS = \\frac{slustoTVS}{100}'"></span>
                <span v-katex:display="'FCH_4 = \\frac{slustoFCH_4}{100}'"></span>
                <span v-katex:display="'CH_4EF = \\frac{slustoEF}{100}'"></span>
                <span v-katex:display="'CH_4potential = sludgemass \\cdot TVStoOC \\cdot OCtoCH_4 \\cdot FCH_4'"></span>
                <span v-katex:display="'CH_4 = CH_4potential \\cdot CH_4EF \\cdot ctCH_4eq'"></span>
                <span v-katex:display="'CO_2SS = CH_4 '"></span>

                <br>
                <b>Where:</b>
                <br>
                <ul>
                  <li><span v-katex="'sludgemass'"></span>: Amount of sludge that is sent to stored prior to disposal (dry
                    weight)
                  </li>
                  <li><span v-katex="'slustoEF'"></span>: Emission factor due to storage</li>
                  <li><span v-katex="'slustoTVS'"></span>: Total Volatile Solids (TVS) content of sludge stored (% of dry
                    weight)
                  </li>
                  <li><span v-katex="'slustoFCH_4'"></span>: CH_4 potential factor</li>
                  <li><span v-katex="'TVStoOC'"></span>: Organic Carbon content in Volatile Solids (0.56gOC/gVS)</li>
                  <li><span v-katex="'OCtoCH_4'"></span>: Organic C to CH4 conversion factor (=16/12 gCH4/gOC)</li>
                  <li><span v-katex="'ctCH_4eq'"></span>: Conversion of CH4 emissions to CO2 equivalent emissions (34
                    kgCO2eq/kgCH4)
                  </li>
                  <li><span v-katex="'CO_2SS'"></span>: Amount of CO_2eq due to sludge storage</li>
                </ul>
                <br>

              </div>
              <div v-else-if="dialog_biogas_stage == 2">
                <h3>Sludge composted</h3>
                <br>
                Amount of CO2eq emissions due to sludge composted
                <br>
                <br>
                <span v-katex:display="'TVS = \\frac{slucompTVS}{100}'"></span>
                <span v-katex:display="'Ncont = \\frac{slucompNcont}{100}'"></span>
                <span v-katex:display="'\\begin{cases}\n'+
                'CH_4=0 &\\text{if emissions are treated or covered}\\\\\n'+
                'CH_4= sludgemass \\cdot TVS \\cdot TVStoOC \\cdot upEf \\cdot OCtoCH_4 \\cdot ctCH_4eq &\\text{otherwise}\\\\\n'+
                '\\end{cases}'">
              </span>
                <span v-katex:display="'\\begin{cases}\n'+
                'N_2O=0 &\\text{if } ratioCN>30\\\\\n'+
                'N_2O=0 &\\text{if solid content of compost}>50 \\\\\n'+
                'N_2O= sludgemass \\cdot Ncont \\cdot lowCNEF \\cdot ctNtoN_2O4428 \\cdot ctN_2Oeq &\\text{otherwise}\\\\\n'+
                '\\end{cases}'">
              </span>
                <span v-katex:display="'CO_2SC = CH_4 + N_2O'"></span>


                <b>Where:</b>
                <br>
                <ul>
                  <li><span v-katex="'sludgemass'"></span>: Amount of sludge that is sent to composting (dry weight)</li>
                  <li><span v-katex="'slucompTVS'"></span>: Total Volatile Solids (TVS) content of sludge composted (% of
                    dry weight).
                  </li>
                  <li><span v-katex="'TVStoOC'"></span>: Organic Carbon content in Volatile Solids (0.56 gOC/gVS)</li>
                  <li><span v-katex="'upEF'"></span>: CH4 emission factor for uncovered pile (fraction of initial C in
                    solids)
                  </li>
                  <li><span v-katex="'OCtoCH_4'"></span>: Organic C to CH4 conversion factor (16/12gCH4/gOC)</li>
                  <li><span v-katex="'ctCH_4eq'"></span>: Conversion of CH4 emissions to CO2 equivalent emissions (34
                    kgCO2eq/kgCH4)
                  </li>
                  <li><span v-katex="'slucompNcont'"></span>: N content of sludge stored (% of dry weight)</li>
                  <li><span v-katex="'lowCNEF'"></span>: N2O emission factor for low C:N ratio</li>
                  <li><span v-katex="'ctNtoN_2O4428'"></span>: N2O-N to N2O conversion factor (44/28 gN2O/gN2O-N)</li>
                  <li><span v-katex="'ctN_2Oeq'"></span>: Conversion of N2O emissions to CO2 equivalent emissions(=298
                    kgCO2eq/kgN2O)
                  </li>
                  <li><span v-katex="'CO_2SC'"></span>: Amount of CO2eq emissions due to sludge composted</li>
                </ul>
                <br>
                <b>Reference:</b> <a href="docs/beam_final_report_1432.pdf#page=169" target="_blank">Section 12.8
                "Composting", Beam page 147</a>


              </div>
              <div v-else-if="dialog_biogas_stage == 3">
                <h3>Sludge incinerated</h3>
                <br>
                Amount of CO2eq emissions due to sludge incineration
                <br>
                <br>
                <span v-katex:display="'CH_4 = 4.85\\cdot 10^{-5} \\cdot sludgemass \\cdot ctCH4_{eq}'"></span>
                <span v-katex:display="'n = \\frac{161.3 - 0.14 \\cdot Tf}{100}'"></span>
                <span v-katex:display="'\\begin{cases}\n'+
                'Tf=1023 &\\text{if }Tf<1023\\\\\n'+
                '\\end{cases}'">
              </span>
                <span v-katex:display="'\\begin{cases}\n'+
                'n=0 &\\text{if }n<0\\\\\n'+
                '\\end{cases}'">
              </span>
                <span v-katex:display="'N_2O = 1.2 \\cdot sludgemass \\cdot Ncont \\cdot n \\cdot ctN_2Oeq'"></span>
                <span v-katex:display="'CO_2SI = CH_4 + N_2O'"></span>

                <b>Where:</b>
                <br>
                <ul>
                  <li><span v-katex="'sludgemass'"></span>: Amount of sludge that is sent to incineration (dry weight)
                  </li>
                  <li><span v-katex="'ctCH4'"></span>: Conversion of CH4 emissions to CO2 equivalent emissions (34
                    kgCO2eq/kgCH4)
                  </li>
                  <li><span v-katex="'Ncont'"></span>: N content of sludge incinerated (% of dry weight)</li>
                  <li><span v-katex="'Tf'"></span>: Average highest temperature of combustion achieved in a Fluidized Bed
                    incinerator
                  </li>
                  <li><span v-katex="'ctN_2Oeq'"></span>: Conversion of N2O emissions to CO2 equivalent emissions (298
                    kgCO2eq/kgN2O)
                  </li>
                  <li><span v-katex="'CO_2SI'"></span>: Amount of CO2eq emissions due to sludge incineration</li>
                  <li><span v-katex="'SNCR'"></span>: Is 'SNCR air emissions with urea' used? (SNCR (Selective Non-Catalytic Reduction) uses the injection of ammonia or urea into the backend of the combustion chamber to reduce NO to N2)</li>

                </ul>
                <br>
                <b>Reference:</b> <a href="docs/beam_final_report_1432.pdf#page=183" target="_blank">Section 12.10
                "Combustion (Incineration)", Beam, page 161 </a>


              </div>
              <div v-else-if="dialog_biogas_stage == 4">
                <h3>Land application of sludge</h3>
                <br>
                Amount of CO2eq emissions due to land application of sludge
                <br>
                <br>
                <span v-katex:display="'TVS = \\frac{slucompTVS}{100}'"></span>
                <span v-katex:display="'Ncont = \\frac{slulaNcont}{100}'"></span>

                <span v-katex:display="'Ccontent = sludgemass \\cdot TVS \\cdot TVStoOC'"></span>
                <span v-katex:display="'Ncontent = sludgemass \\cdot Ncont'"></span>
                <span v-katex:display="'racioCN = \\frac{Ccontent}{Ncontent}'"></span>

                <span v-katex:display="'\\begin{cases}\n'+
                'N_2O=0 &\\text{if }ratioCN>30\\\\\n'+
                'N_2O=0.5 \\cdot sludgemass \\cdot Ncont \\cdot EF \\cdot ctNtoN_2O4428 \\cdot ctN_2Oeq &\\text{if biosolids }>80\\%\\\\\n'+
                'N_2O=sludgemass \\cdot Ncont \\cdot EF \\cdot ctNtoN_2O4428 \\cdot ctN_2Oeq &\\text{otherwise }\\\\\n'+

                '\\end{cases}'">
              </span>
                <span v-katex:display="'CO_2LA = N_2O'"></span>

                <b>Where:</b>
                <br>
                <ul>
                  <li><span v-katex="'sludgemass'"></span>: Amount of sludge that is sent to land application (dry weight)
                  </li>
                  <li><span v-katex="'TVStoOC'"></span>: Organic Carbon content in Volatile Solids (0.56 gOC/gVS)</li>
                  <li><span v-katex="'slulaNcont'"></span>: N content of sludge sent to land application (% of dry weight)
                  </li>
                  <li><span v-katex="'SlucompTVS'"></span>: Total Volatile Solids (TVS) content of sludge composted (% of
                    dry weight)
                  </li>
                  <li><span v-katex="'EF'"></span>: Amount of Nitrogen converted to N2O</li>
                  <li><span v-katex="'ctNtoN_2O4428'"></span>: N2O-N to N2O conversion factor (=44/28 gN2O/gN2O-N)</li>
                  <li><span v-katex="'ctN2Oeq'"></span>: Conversion of N2O emissions to CO2 equivalent emissions (298
                    kgCO2eq/kgN2O
                  </li>
                  <li><span v-katex="'CO_2LA'"></span>: Amount of CO2eq emissions due to land application of sludge</li>
                  <li><span v-katex="'biosolids'"></span>: Amount of solids content of sludge sent to land application</li>

                </ul>
                <br>
                <b>Reference:</b> <a href="docs/beam_final_report_1432.pdf#page=188" target="_blank">Section 12.11 "Land
                application", Beam page 166 </a>


              </div>
              <div v-else-if="dialog_biogas_stage == 5">
                <h3>Landfilling of sludge</h3>
                <br>
                Fugitive methane emissions from biosolids decomposition in the landfill during the first 3 years after
                placement, and N2O emissions from landfilled biosolids
                <br>
                <br>
                <span v-katex:display="'TVS = \\frac{slucompTVS}{100}'"></span>
                <span v-katex:display="'CH_4gas = \\frac{slulfCH_4ingas}{100}'"></span>
                <span v-katex:display="'DOCf = \\frac{slulfDOCf}{100}'"></span>
                <span v-katex:display="'dc3yrs = \\frac{slulfdecomp3yr}{100}'"></span>
                <span v-katex:display="'Ncont = \\frac{slulfcont}{100}'"></span>

                <span v-katex:display="'Ccontent = sludgemass \\cdot TVS \\cdot TVStoOC'"></span>
                <span v-katex:display="'Ncontent = sludgemass \\cdot Ncont'"></span>
                <span v-katex:display="'racioCN = \\frac{Ccontent}{Ncontent}'"></span>

                <span
                    v-katex:display="'CH_4 = sludgemass \\cdot TVS \\cdot TVStoOC \\cdot un \\cdot OCtoCH_4 \\cdot CH_4gas \\cdot DOCF \\cdot dc3yrs \\cdot MCF \\cdot ctCH_4eq'"></span>
                <span
                    v-katex:display="'N_2O = sludgemass \\cdot Ncont \\cdot lowCNEF \\cdot NtoN_2O \\cdot ctN_2Oeq'"></span>
                <span v-katex:display="'CO_2LFS = N_2O + CH_4'"></span>


                <b>Where:</b>
                <br>
                <ul>
                  <li><span v-katex="'sludgemass'"></span>: Amount of sludge that is sent to landfilling (dry weight)</li>
                  <li><span v-katex="'slucompTVS'"></span>: Total Volatile Solids (TVS) content of sludge composted (% of
                    dry weight)
                  </li>
                  <li><span v-katex="'TVStoOC'"></span>: Organic Carbon content in Volatile Solids (0.56gOC/gVS)</li>
                  <li><span v-katex="'un'"></span>: Model uncertainty factor</li>
                  <li><span v-katex="'OCtoCH_4'"></span>: Organic C to CH4 conversion factor (=16/12 gCH4/gOC)</li>
                  <li><span v-katex="'slulfCH_4ingas'"></span>: CH4 in landfill gas</li>
                  <li><span v-katex="'slulfDOC_f'"></span>: Decomposable organic fraction of raw wastewater solids</li>
                  <li><span v-katex="'slulfdecomp3yr'"></span>: Percentage decomposed in first 3 years of the decomposable
                    organic fraction of raw wastewater solids
                  </li>
                  <li><span v-katex="'MCF'"></span>: Methane correction for anaerobic managed landfills</li>
                  <li><span v-katex="'ctCH_4eq'"></span>: Conversion of CH4 emissions to CO2 equivalent emissions (34
                    kgCO2eq/kgCH4)
                  </li>
                  <li><span v-katex="'slulfNcont'"></span>: N content of sludge sent to landfilling (% of dry weight)</li>
                  <li><span v-katex="'lowCNEF'"></span>: N2O emission factor for low C:N ratio</li>
                  <li><span v-katex="'NtoN_2O'"></span>: N2O-N to N2O conversion factor (=44/28 gN2O/gN2O-N)</li>
                  <li><span v-katex="'ctN_2Oeq'"></span>: Conversion of N2O emissions to CO2 equivalent emissions (298
                    kgCO2eq/kgN2O)
                  </li>
                  <li><span v-katex="'CO_2LFS'"></span>: Landfilling of sludge CO2 equivalent</li>
                </ul>
                <br>
                <b>Reference:</b> <a href="docs/beam_final_report_1432.pdf#page=175" target="_blank">Section 12.9
                "Landfill disposal", page 153 </a>


              </div>
              <div v-else-if="dialog_biogas_stage == 6">
                <h3>Sludge stockpiling</h3>
                <br>
                Amount of CO2eq emissions due to sludge stockpiling
                <br>
                <br>
                <span v-katex:display="'lifespan\\_ int = \\lfloor lifespan \\rfloor'"></span>
                <span v-katex:display="'lifespan\\_ dec = lifespan - lifespan\\_ dec'"></span>
                <span v-katex:display="'rate_{CH4}(i) = \\begin{cases}\n'+
                'sludgemass \\cdot 0.2 \\cdot 10^{-3} &\\text{if }i<1\\\\\n'+
                'sludgemass \\cdot 2 \\cdot 10^{-3} &\\text{if }1<=i<3\\\\\n'+
                'sludgemass \\cdot 9.8 \\cdot 10^{-3} &\\text{if }3<=i<20\\\\\n'+
                '0 &\\text{if }i>=20\\\\\n'+
                '\\end{cases}'">
              </span>
                <span v-katex:display="'rate_{N2O}(i) = \\begin{cases}\n'+
                'sludgemass \\cdot 60 \\cdot 10^{-3} &\\text{if }i<1\\\\\n'+
                'sludgemass \\cdot 26.8 \\cdot 10^{-3} &\\text{if }1<=i<3\\\\\n'+
                'sludgemass \\cdot 17.4 \\cdot 10^{-3} &\\text{if }3<=i<20\\\\\n'+
                '0 &\\text{if }i>=20\\\\\n'+
                '\\end{cases}'">
              </span>
                <span v-katex:display="'rate_{CO2}(i) = \\begin{cases}\n'+
                'sludgemass \\cdot 30.1 \\cdot 10^{-3} &\\text{if }i<1\\\\\n'+
                'sludgemass \\cdot 30.5 \\cdot 10^{-3} &\\text{if }1<=i<3\\\\\n'+
                'sludgemass \\cdot 10.1 \\cdot 10^{-3} &\\text{if }3<=i<20\\\\\n'+
                '0 &\\text{if }i>=20\\\\\n'+
                '\\end{cases}'">
              </span>
                <span
                    v-katex:display="'CH_4 = lifespan\\_ dec \\cdot rate_{CH4}(lifespan\\_ int) + \\sum _{i=0} ^{lifespan\\_ int -1} rate_{CH4}(i)'"></span>
                <span
                    v-katex:display="'N_2O = lifespan\\_ dec \\cdot rate_{N2O}(lifespan\\_ int) + \\sum _{i=0} ^{lifespan\\_ int -1} rate_{N2O}(i)'"></span>
                <span
                    v-katex:display="'CO_2 = lifespan\\_ dec \\cdot rate_{CO2}(lifespan\\_ int) + \\sum _{i=0} ^{lifespan\\_ int -1} rate_{CO2}(i)'"></span>

                <span v-katex:display="'CO_2SP = CH_4 + N_2O + CO_2'"></span>


                <b>Where:</b>
                <br>
                <ul>
                  <li><span v-katex="'sludgemass'"></span>: Amount of sludge that is stockpiled (dry weight)</li>
                  <li><span v-katex="'lifespan'"></span>: Expected timespan that the biosolid stockpile (BSP) will be
                    emitting GHGs
                  </li>
                  <li><span v-katex="'CO_2SP'"></span>: Amount of CO2eq emissions due to sludge composted</li>
                </ul>
                <br>
                <b>Reference:</b> <a href="https://doi.org/10.1016/j.jenvman.2014.04.016 " target="_blank">Majumder, R.,
                Livesley, S., Gregory, D., & Arndt, S. (2014, 05 15). Biosolids stockpiles are a significant point source
                for greenhouse gas emissions. Journal of Environmental Management, 143, pp. 34-43</a>


              </div>
              <div v-else-if="dialog_biogas_stage == 7">
                <h3>Water reuse transport </h3>
                <br>
                Indirect CO2 emitted from sludge transport off-site
                <br>
                <br>
                <span v-katex:display="'ECO_2 = \\frac{V \\cdot FD_{CO2} \\cdot NCV_{CO2} \\cdot EF_{CO2}}{1000}'"></span>
                <span
                    v-katex:display="'ECH_4 = \\frac{V \\cdot FD_{CH4} \\cdot NCV_{CH4} \\cdot EF_{CH4} \\cdot EQ_{CH4}}{1000}'"></span>
                <span
                    v-katex:display="'EN_2O = \\frac{V \\cdot FD_{N2O} \\cdot NCV_{N2O} \\cdot EF_{N2O} \\cdot EQ_{N2O}}{1000}'"></span>
                <span v-katex:display="'E_{total} = ECO_2 + N_2O + CH_4'"></span>


                <b>Where:</b>
                <br>
                <ul>
                  <li><span v-katex="'V'"></span>: Volume of fuel consumed</li>
                  <li><span v-katex="'EQ_{N2O}'"></span>: Conversion of N2O emissions to CO2 equivalent emissions</li>
                  <li><span v-katex="'EQ_{CH_4}'"></span>: Conversion of CH4 emissions to CO2 equivalent emissions</li>
                  <li><span v-katex="'EQ_{CH_4}'"></span>: Conversion of CH4 emissions to CO2 equivalent emissions</li>
                  <li><span v-katex="'CO_2LFS'"></span>: Landfilling of sludge CO2 equivalent</li>
                </ul>
                <br>
                <table style="width: 90%; border: 1px solid; border-collapse: collapse">
                  <tr style="border: 1px solid; border-collapse: collapse">
                    <td style="border: 1px solid; border-collapse: collapse"><b>Fuel type</b></td>
                    <td style="border: 1px solid; border-collapse: collapse"><b>EFCH4 <br> (kg/TJ) </b></td>
                    <td style="border: 1px solid; border-collapse: collapse"><b>EFN2O <br> (kg/TJ) </b></td>
                    <td style="border: 1px solid; border-collapse: collapse"><b>EFCO2 <br> (kg/TJ) </b></td>
                    <td style="border: 1px solid; border-collapse: collapse"><b>FD <br> (kg/L) </b></td>
                    <td style="border: 1px solid; border-collapse: collapse"><b>NCV <br> (TJ/Gg) </b></td>
                  </tr>
                  <tr style="border: 1px solid; border-collapse: collapse">
                    <td style="border: 1px solid; border-collapse: collapse">Diesel</td>
                    <td style="border: 1px solid; border-collapse: collapse">3.9</td>
                    <td style="border: 1px solid; border-collapse: collapse">3.9</td>
                    <td style="border: 1px solid; border-collapse: collapse">74100</td>
                    <td style="border: 1px solid; border-collapse: collapse">0.84</td>
                    <td style="border: 1px solid; border-collapse: collapse">43</td>
                  </tr>
                  <tr style="border: 1px solid; border-collapse: collapse">
                    <td style="border: 1px solid; border-collapse: collapse">Gasoline/Petrol</td>
                    <td style="border: 1px solid; border-collapse: collapse">3.8</td>
                    <td style="border: 1px solid; border-collapse: collapse">1.9</td>
                    <td style="border: 1px solid; border-collapse: collapse">69300</td>
                    <td style="border: 1px solid; border-collapse: collapse">0.74</td>
                    <td style="border: 1px solid; border-collapse: collapse">44.3</td>
                  </tr>
                  <tr style="border: 1px solid; border-collapse: collapse">
                    <td style="border: 1px solid; border-collapse: collapse">Natural gas</td>
                    <td style="border: 1px solid; border-collapse: collapse">92</td>
                    <td style="border: 1px solid; border-collapse: collapse">0.2</td>
                    <td style="border: 1px solid; border-collapse: collapse">56100</td>
                    <td style="border: 1px solid; border-collapse: collapse">0.75</td>
                    <td style="border: 1px solid; border-collapse: collapse">48</td>
                  </tr>
                </table>
                <br>
                <b>Reference:</b> <a href="docs/V2_3_Ch3_Mobile_Combustion.pdf#page=21" target="_blank">IPCC 2006, Volume
                2, Chapter 3: Mobile Combustion, Table 3.2.2 </a>


              </div>

            </div>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_biogas"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3>Biogas (anaerobic digestion of sludge) </h3>
            <br>
            Sum of emissions from biogas production.
            <div
                v-katex:display="'biogas_{leaked} = \\sum_{i \\in WWTPS} \\frac{P \\cdot V_i}{R \\cdot T} \\cdot \\frac{biog_{leaked_i}}{100} \\cdot \\frac{biog_{CH4_i}}{100} \\cdot \\frac{16}{1000}'"></div>
            <div v-katex:display="'Total = biogas_{leaked}'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'WWTPS'"></span>: onsite and external WWTP's where industry treats water</li>
              <li><span v-katex="'P : 1.013 \\cdot 10^{5}'"></span> Pa</li>
              <li><span v-katex="'V'"></span>: Volume of biogas produced in the WWTP</li>
              <li><span v-katex="'R'"></span>: 8.31446261815324 J/K·mol</li>
              <li><span v-katex="'T'"></span>: 273.15K</li>
              <li><span v-katex="'biog_{CH4}'"></span>: Percent of the methane content in the produced biogas</li>
              <li><span v-katex="'biog_{leaked}'"></span>: Biogas leaked to the atmosphere (% volume)</li>


            </ul>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_biogas_valorised"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3>Biogas valorization </h3>
            <div
                v-katex:display="'biogas_{valorised} = \\sum_{i \\in WWTPS} \\frac{P \\cdot V_i}{R \\cdot T} \\cdot \\frac{biog_{val_i}}{100} \\cdot \\frac{biog_{CH4_i}}{100} \\cdot \\frac{44}{1000}'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'WWTPS'"></span>: onsite and external WWTP's where industry treats water</li>
              <li><span v-katex="'P : 1.013 \\cdot 10^{5}'"></span> Pa</li>
              <li><span v-katex="'V'"></span>: Volume of biogas produced in the WWTP</li>
              <li><span v-katex="'R'"></span>: 8.31446261815324 J/K·mol</li>
              <li><span v-katex="'T'"></span>: 273.15K</li>
              <li><span v-katex="'biog_{CH4}'"></span>: Percent of the methane content in the produced biogas</li>
              <li><span v-katex="'biog_{val}'"></span>: Biogas valorized in the treatment plant to heat the digesters or
                the building and/or to run a Co-generator to generate heat and electricity
              </li>

            </ul>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_biogas_flared"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3>Biogas flared </h3>
            <div
                v-katex:display="'biogas_{flared} = \\sum_{i \\in WWTPS} \\frac{P \\cdot V_i}{R \\cdot T} \\cdot \\frac{biog_{fla_i}}{100} \\cdot \\frac{biog_{CH4_i}}{100} \\cdot \\frac{44}{1000}'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'WWTPS'"></span>: onsite and external WWTP's where industry treats water</li>
              <li><span v-katex="'P : 1.013 \\cdot 10^{5}'"></span> Pa</li>
              <li><span v-katex="'V'"></span>: Volume of biogas produced in the WWTP</li>
              <li><span v-katex="'R'"></span>: 8.31446261815324 J/K·mol</li>
              <li><span v-katex="'T'"></span>: 273.15K</li>
              <li><span v-katex="'biog_{CH4}'"></span>: Percent of the methane content in the produced biogas</li>
              <li><span v-katex="'biog_{fla}'"></span>: Biogas flared (% volume)
              </li>

            </ul>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_digester_fuel"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3>Fuel (digester) </h3>
            <br>
            Amount of CO2 eq emissions due to fuel employed for digester
            <br>
            <div
                v-katex:display="'CO_2 = \\sum_{i \\in WWTPS}\\frac{V_i \\cdot FD \\cdot NCV \\cdot EF_{CO_2}}{1000}'"></div>
            <div
                v-katex:display="'N_2O = \\sum_{i \\in WWTPS}\\frac{V_i \\cdot FD \\cdot NCV \\cdot EF_{N_2O} \\cdot EQ_{N_2O}}{1000}'"></div>
            <div
                v-katex:display="'CH_4 = \\sum_{i \\in WWTPS}\\frac{V_i \\cdot FD \\cdot NCV \\cdot EF_{CH_4} \\cdot EQ_{CH_4}}{1000}'"></div>
            <div v-katex:display="'Total = CO_2 + N_2O + CH_4'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'WWTPS'"></span>: onsite and external WWTP's where industry treats water</li>

              <li><span v-katex="'V'"></span>: volume of fuel consumed</li>

              <li><span v-katex="'EQ_{N_2O}'"></span>: conversion of N2O emissions to CO2 equivalent emissions (<b>298
                kgCO2eq/kgN2O</b>)
              </li>
              <li><span v-katex="'EQ_{CH_4}'"></span>: Conversion of CH4 emissions to CO2 equivalent emissions (<b>34
                kgCO2eq/kgCH4</b>)
              </li>
            </ul>
            <br>
            <table style="width: 90%; border: 1px solid; border-collapse: collapse">
              <tr style="border: 1px solid; border-collapse: collapse">
                <td style="border: 1px solid; border-collapse: collapse"><b>Fuel type</b></td>
                <td style="border: 1px solid; border-collapse: collapse"><b>EFCH4 <br> (kg/TJ) </b></td>
                <td style="border: 1px solid; border-collapse: collapse"><b>EFN2O <br> (kg/TJ) </b></td>
                <td style="border: 1px solid; border-collapse: collapse"><b>EFCO2 <br> (kg/TJ) </b></td>
                <td style="border: 1px solid; border-collapse: collapse"><b>FD <br> (kg/L) </b></td>
                <td style="border: 1px solid; border-collapse: collapse"><b>NCV <br> (TJ/Gg) </b></td>
              </tr>
              <tr style="border: 1px solid; border-collapse: collapse">
                <td style="border: 1px solid; border-collapse: collapse">Diesel</td>
                <td style="border: 1px solid; border-collapse: collapse">3</td>
                <td style="border: 1px solid; border-collapse: collapse">0.6</td>
                <td style="border: 1px solid; border-collapse: collapse">74100</td>
                <td style="border: 1px solid; border-collapse: collapse">0.84</td>
                <td style="border: 1px solid; border-collapse: collapse">43</td>
              </tr>
              <tr style="border: 1px solid; border-collapse: collapse">
                <td style="border: 1px solid; border-collapse: collapse">Gasoline/Petrol</td>
                <td style="border: 1px solid; border-collapse: collapse">3</td>
                <td style="border: 1px solid; border-collapse: collapse">0.6</td>
                <td style="border: 1px solid; border-collapse: collapse">69300</td>
                <td style="border: 1px solid; border-collapse: collapse">0.74</td>
                <td style="border: 1px solid; border-collapse: collapse">44.3</td>
              </tr>
              <tr style="border: 1px solid; border-collapse: collapse">
                <td style="border: 1px solid; border-collapse: collapse">Natural gas</td>
                <td style="border: 1px solid; border-collapse: collapse">10</td>
                <td style="border: 1px solid; border-collapse: collapse">0.1</td>
                <td style="border: 1px solid; border-collapse: collapse">56100</td>
                <td style="border: 1px solid; border-collapse: collapse">0.75</td>
                <td style="border: 1px solid; border-collapse: collapse">48</td>
              </tr>
            </table>
            <br>
            <br>
            <b>Reference:</b> <a href="docs/V2_3_Ch3_Mobile_Combustion.pdf#page=21" target="_blank">IPCC 2006, Volume 2,
            Chapter 3: Mobile Combustion, Table 3.2.2 </a>

          </div>

        </v-dialog>

        <!-- Eutrophication -->
        <v-dialog
            v-model="info_tn_eutrophication"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3>Eutrophication potential (Total Nitrogen) </h3>
            <br>
            <div
                v-katex:display="'\\frac{\\sum_{i \\in DP} TN_{effl_i}}{\\sum_{i \\in DP} W_{effl_i}} \\cdot EQ_{TN} '"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'TN_{effl}'"></span>: load of TN in the effluent</li>
              <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body</li>
              <li><span v-katex="'EQ_{TN}'"></span>: conversion of TN to PO4 equivalent (<b>0.42 gPO4eq/gTN </b>)</li>
            </ul>
            <br>
            <b>Reference:</b> <a
              href="https://www.universiteitleiden.nl/en/research/research-output/science/cml-ia-characterisation-factors"
              target="_blank">CML-IA Characterisation Factors - Leiden University</a>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_cod_eutrophication"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3>Eutrophication potential (Chemical Oxygen Demand) </h3>
            <br>
            <div
                v-katex:display="'\\frac{\\sum_{i \\in DP} COD_{effl_i}}{\\sum_{i \\in DP} W_{effl_i}} \\cdot EQ_{COD} '"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'COD_{effl}'"></span>: load of COD in the effluent</li>
              <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body</li>
              <li><span v-katex="'EQ_{COD}'"></span>: conversion of COD to PO4 equivalent (<b>0.022 gPO4eq/gCOD </b>)</li>
            </ul>
            <br>
            <b>Reference:</b> <a
              href="https://www.universiteitleiden.nl/en/research/research-output/science/cml-ia-characterisation-factors"
              target="_blank">CML-IA Characterisation Factors - Leiden University</a>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_tp_eutrophication"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3>Eutrophication potential (Total Phosphorus) </h3>
            <br>
            <div
                v-katex:display="'\\frac{\\sum_{i \\in DP} TP_{effl_i}}{\\sum_{i \\in DP} W_{effl_i}} \\cdot EQ_{TP} '"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'TP_{effl}'"></span>: load of TP in the effluent</li>
              <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body</li>
              <li><span v-katex="'EQ_{TP}'"></span>: Conversion of TP to PO4 equivalent (<b>3.06 gPO4eq/gTP </b>)</li>
            </ul>
            <br>
            <b>Reference:</b> <a
              href="https://www.universiteitleiden.nl/en/research/research-output/science/cml-ia-characterisation-factors"
              target="_blank">CML-IA Characterisation Factors - Leiden University</a>


          </div>

        </v-dialog>

        <!-- TU -->
        <v-dialog
            v-model="info_tu_diclo"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Ecotoxicity profile for 1,2-Dichloroethane </h3>
            <br>
            <div
                v-katex:display="'\\frac{\\sum_{i \\in DP} 1,2-Dichloroethane_{effl_i}}{\\sum_{i \\in DP} W_{effl_i}} \\cdot \\frac{1}{EC50_{1,2-Dichloroethane} \\cdot 10^{-3}}'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'1,2-Dichloroethane_{effl}'"></span>: load of 1,2-Dichloroethane in the effluent</li>
              <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body</li>
              <li><span v-katex="'EC50_{1,2-Dichloroethane}: 150000 \\mu g/L'"></span></li>
            </ul>
            <br>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_tu_cadmium"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Ecotoxicity profile for cadmium </h3>
            <br>
            <div
                v-katex:display="'\\frac{\\sum_{i \\in DP} cadmium_{effl_i}}{\\sum_{i \\in DP} W_{effl_i}} \\cdot \\frac{1}{EC50_{cadmium}\\cdot 10^{-6}}'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'cadmium_{effl}'"></span>: load of cadmium in the effluent</li>
              <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body</li>
              <li><span v-katex="'EC50_{cadmium}: 9.5 \\mu g/L'"></span></li>
            </ul>
            <br>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_tu_hexaclorobenzene"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Ecotoxicity profile for hexachlorobenzene </h3>
            <br>
            <div
                v-katex:display="'\\frac{\\sum_{i \\in DP} hexachlorobenzene_{effl_i}}{\\sum_{i \\in DP} W_{effl_i}} \\cdot \\frac{1}{EC50_{hexachlorobenzene} \\cdot 10^{-3}}'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'hexachlorobenzene_{effl}'"></span>: load of hexachlorobenzene in the effluent</li>
              <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body</li>
              <li><span v-katex="'EC50_{hexachlorobenzene}: 30 \\mu g/L'"></span></li>
            </ul>
            <br>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_tu_mercury"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Ecotoxicity profile for mercury </h3>
            <br>
            <div
                v-katex:display="'\\frac{\\sum_{i \\in DP} mercury_{effl_i}}{\\sum_{i \\in DP} W_{effl_i}} \\cdot \\frac{1}{EC50_{mercury} \\cdot 10^{-3}}'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'mercury_{effl}'"></span>: load of mercury in the effluent</li>
              <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body</li>
              <li><span v-katex="'EC50_{mercury}: 1.4 \\mu g/L'"></span></li>
            </ul>
            <br>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_tu_lead"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Ecotoxicity profile for lead </h3>
            <br>
            <div
                v-katex:display="'\\frac{\\sum_{i \\in DP} lead_{effl_i}}{\\sum_{i \\in DP} W_{effl_i}} \\cdot \\frac{1}{EC50_{lead} \\cdot 10^{-3}}'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'lead_{effl}'"></span>: load of lead in the effluent</li>
              <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body</li>
              <li><span v-katex="'EC50_{lead}: 440 \\mu g/L'"></span></li>
            </ul>
            <br>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_tu_nickel"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Ecotoxicity profile for nickel </h3>
            <br>
            <div
                v-katex:display="'\\frac{\\sum_{i \\in DP} nickel_{effl_i}}{\\sum_{i \\in DP} W_{effl_i}} \\cdot \\frac{1}{EC50_{nickel} \\cdot 10^{-3}}'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'nickel_{effl}'"></span>: load of nickel in the effluent</li>
              <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body</li>
              <li><span v-katex="'EC50_{nickel}: 1000 \\mu g/L'"></span></li>
            </ul>
            <br>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_tu_chloroalkanes"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Ecotoxicity profile for chloroalkanes </h3>
            <br>
            <div
                v-katex:display="'\\frac{\\sum_{i \\in DP} chloroalkanes_{effl_i}}{\\sum_{i \\in DP} W_{effl_i}} \\cdot \\frac{1}{EC50_{chloroalkanes} \\cdot 10^{-3}}'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'chloroalkanes_{effl}'"></span>: load of chloroalkanes in the effluent</li>
              <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body</li>
              <li><span v-katex="'EC50_{chloroalkanes}: 65000 \\mu g/L'"></span></li>
            </ul>
            <br>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_tu_hexaclorobutadiene"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Ecotoxicity profile for hexachlorobutadiene </h3>
            <br>
            <div
                v-katex:display="'\\frac{\\sum_{i \\in DP} hexachlorobutadiene_{effl_i}}{\\sum_{i \\in DP} W_{effl_i}} \\cdot \\frac{1}{EC50_{hexachlorobutadiene} \\cdot 10^{-3}}'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'hexachlorobutadiene_{effl}'"></span>: load of hexachlorobutadiene in the effluent</li>
              <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body</li>
              <li><span v-katex="'EC50_{hexachlorobutadiene}: 500 \\mu g/L'"></span></li>
            </ul>
            <br>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_tu_nonylphenols"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Ecotoxicity profile for nonylphenols </h3>
            <br>
            <div
                v-katex:display="'\\frac{\\sum_{i \\in DP} nonylphenol_{effl_i}}{\\sum_{i \\in DP} W_{effl_i}} \\cdot \\frac{1}{EC50_{nonylphenol} \\cdot 10^{-3}}'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'nonylphenol_{effl}'"></span>: load of nonylphenol in the effluent</li>
              <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body</li>
              <li><span v-katex="'EC50_{nonylphenol}: 150 \\mu g/L'"></span></li>
            </ul>
            <br>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_tu_tetrachloroethene"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Ecotoxicity profile for tetrachloroethylene </h3>
            <br>
            <div
                v-katex:display="'\\frac{\\sum_{i \\in DP} tetrachloroethylene_{effl_i}}{\\sum_{i \\in DP} W_{effl_i}} \\cdot \\frac{1}{EC50_{tetrachloroethylene} \\cdot 10^{-3}}'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'tetrachloroethylene_{effl}'"></span>: load of tetrachloroethylene in the effluent</li>
              <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body</li>
              <li><span v-katex="'EC50_{tetrachloroethylene}: 3200 \\mu g/L'"></span></li>
            </ul>
            <br>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_tu_trychloroethylene"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Ecotoxicity profile for trichloroethylene </h3>
            <br>
            <div
                v-katex:display="'\\frac{\\sum_{i \\in DP} trichloroethylene_{effl_i}}{\\sum_{i \\in DP} W_{effl_i}} \\cdot \\frac{1}{EC50_{trichloroethylene} \\cdot 10^{-3}}'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'trichloroethylene_{effl}'"></span>: load of trichloroethylene in the effluent</li>
              <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body</li>
              <li><span v-katex="'EC50_{trichloroethylene}: 76000 \\mu g/L'"></span></li>
            </ul>
            <br>


          </div>

        </v-dialog>


        <!-- Delta TU -->
        <v-dialog
            v-model="info_delta_tu_diclo"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Ecotoxicity profile for 1,2-Dichloroethane </h3>
            <br>
            <div
                v-katex:display="' \\frac{ \\sum_{i \\in DP} 1,2-Dichloroethane_{effl_i}}{W_{a} - W_{w} + \\sum_{i \\in DP} W_{effl}} \\cdot \\frac{1}{EC50_{1,2-Dichloroethane}\\cdot 10^{-3}} '"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'1,2-Dichloroethane_{effl}'"></span>: load of 1,2-Dichloroethane in the effluent</li>
              <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body</li>
              <li><span v-katex="'EC50_{1,2-Dichloroethane}: 150000 \\mu g/L'"></span></li>
              <li><span v-katex="'W_{a}'"></span>: amount of water available in the river <b>(streamflow global
                indicator)</b></li>
              <li><span v-katex="'W_{w}'"></span>: amount of water withdrawn from the river</li>

            </ul>
            <br>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_delta_tu_cadmium"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Ecotoxicity profile for cadmium </h3>
            <br>
            <div
                v-katex:display="' \\frac{ \\sum_{i \\in DP} cadmium_{effl_i}}{W_{a} - W_{w} + \\sum_{i \\in DP} W_{effl}} \\cdot \\frac{1}{EC50_{cadmium}\\cdot 10^{-3}} '"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'cadmium_{effl}'"></span>: load of cadmium in the effluent</li>
              <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body</li>
              <li><span v-katex="'EC50_{cadmium}: 9.5 \\mu g/L'"></span></li>
              <li><span v-katex="'W_{a}'"></span>: amount of water available in the river <b>(streamflow global
                indicator)</b></li>
              <li><span v-katex="'W_{w}'"></span>: amount of water withdrawn from the river</li>

            </ul>
            <br>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_delta_tu_hexaclorobenzene"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Ecotoxicity profile for hexachlorobenzene </h3>
            <br>
            <div
                v-katex:display="' \\frac{ \\sum_{i \\in DP} hexachlorobenzene_{effl_i}}{W_{a} - W_{w} + \\sum_{i \\in DP} W_{effl}} \\cdot \\frac{1}{EC50_{hexachlorobenzene}\\cdot 10^{-3}} '"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'hexachlorobenzene_{effl}'"></span>: load of hexachlorobenzene in the effluent</li>
              <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body</li>
              <li><span v-katex="'EC50_{hexachlorobenzene}: 30 \\mu g/L'"></span></li>
              <li><span v-katex="'W_{a}'"></span>: amount of water available in the river <b>streamflow global
                indicator</b></li>
              <li><span v-katex="'W_{w}'"></span>: amount of water withdrawn from the river</li>

            </ul>
            <br>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_delta_tu_mercury"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Ecotoxicity profile for mercury </h3>
            <br>
            <div
                v-katex:display="' \\frac{ \\sum_{i \\in DP} mercury_{effl_i}}{W_{a} - W_{w} + \\sum_{i \\in DP} W_{effl}} \\cdot \\frac{1}{EC50_{mercury}\\cdot 10^{-3}} '"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'mercury_{effl}'"></span>: load of mercury in the effluent</li>
              <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body</li>
              <li><span v-katex="'EC50_{mercury}: 1.4 \\mu g/L'"></span></li>
              <li><span v-katex="'W_{a}'"></span>: amount of water available in the river <b>(streamflow global
                indicator)</b></li>
              <li><span v-katex="'W_{w}'"></span>: amount of water withdrawn from the river</li>

            </ul>
            <br>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_delta_tu_lead"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Ecotoxicity profile for lead </h3>
            <br>
            <div
                v-katex:display="' \\frac{ \\sum_{i \\in DP} lead_{effl_i}}{W_{a} - W_{w} + \\sum_{i \\in DP} W_{effl}} \\cdot \\frac{1}{EC50_{lead}\\cdot 10^{-3}} '"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'lead_{effl}'"></span>: load of lead in the effluent</li>
              <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body</li>
              <li><span v-katex="'EC50_{lead}: 440 \\mu g/L'"></span></li>
              <li><span v-katex="'W_{a}'"></span>: amount of water available in the river <b>(streamflow global
                indicator)</b></li>
              <li><span v-katex="'W_{w}'"></span>: amount of water withdrawn from the river</li>

            </ul>
            <br>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_delta_tu_nickel"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Ecotoxicity profile for nickel </h3>
            <br>
            <div
                v-katex:display="' \\frac{ \\sum_{i \\in DP} nickel_{effl_i}}{W_{a} - W_{w} + \\sum_{i \\in DP} W_{effl}} \\cdot \\frac{1}{EC50_{nickel}\\cdot 10^{-3}} '"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'nickel_{effl}'"></span>: load of nickel in the effluent</li>
              <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body</li>
              <li><span v-katex="'EC50_{nickel}: 1000 \\mu g/L'"></span></li>
              <li><span v-katex="'W_{a}'"></span>: amount of water available in the river <b>(streamflow global
                indicator)</b></li>
              <li><span v-katex="'W_{w}'"></span>: amount of water withdrawn from the river</li>

            </ul>
            <br>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_delta_tu_chloroalkanes"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Ecotoxicity profile for chloroalkanes </h3>
            <br>
            <div
                v-katex:display="' \\frac{ \\sum_{i \\in DP} chloroalkanes_{effl_i}}{W_{a} - W_{w} + \\sum_{i \\in DP} W_{effl}} \\cdot \\frac{1}{EC50_{chloroalkanes}\\cdot 10^{-3}} '"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'chloroalkanes_{effl}'"></span>: load of chloroalkanes in the effluent</li>
              <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body</li>
              <li><span v-katex="'EC50_{chloroalkanes}: 65000 \\mu g/L'"></span></li>
              <li><span v-katex="'W_{a}'"></span>: amount of water available in the river <b>(streamflow global
                indicator)</b></li>
              <li><span v-katex="'W_{w}'"></span>: amount of water withdrawn from the river</li>

            </ul>
            <br>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_delta_tu_hexaclorobutadiene"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Ecotoxicity profile for hexachlorobutadiene </h3>
            <br>
            <div
                v-katex:display="' \\frac{ \\sum_{i \\in DP} hexachlorobutadiene_{effl_i}}{W_{a} - W_{w} + \\sum_{i \\in DP} W_{effl}} \\cdot \\frac{1}{EC50_{hexachlorobutadiene}\\cdot 10^{-3}} '"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'hexachlorobutadiene_{effl}'"></span>: load of hexachlorobutadiene in the effluent</li>
              <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body</li>
              <li><span v-katex="'EC50_{hexachlorobutadiene}: 500 \\mu g/L'"></span></li>
              <li><span v-katex="'W_{a}'"></span>: amount of water available in the river <b>(streamflow global
                indicator)</b></li>
              <li><span v-katex="'W_{w}'"></span>: amount of water withdrawn from the river</li>

            </ul>
            <br>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_delta_tu_nonylphenols"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Ecotoxicity profile for nonylphenols </h3>
            <br>
            <div
                v-katex:display="' \\frac{ \\sum_{i \\in DP} nonylphenol_{effl_i}}{W_{a} - W_{w} + \\sum_{i \\in DP} W_{effl}} \\cdot \\frac{1}{EC50_{nonylphenol}\\cdot 10^{-3}} '"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'nonylphenol_{effl}'"></span>: load of nonylphenol in the effluent</li>
              <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body</li>
              <li><span v-katex="'EC50_{nonylphenol}: 150 \\mu g/L'"></span></li>
              <li><span v-katex="'W_{a}'"></span>: amount of water available in the river <b>(streamflow global
                indicator)</b></li>
              <li><span v-katex="'W_{w}'"></span>: amount of water withdrawn from the river</li>

            </ul>
            <br>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_delta_tu_tetrachloroethene"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Ecotoxicity profile for tetrachloroethylene </h3>
            <br>
            <div
                v-katex:display="' \\frac{ \\sum_{i \\in DP} tetrachloroethylene_{effl_i}}{W_{a} - W_{w} + \\sum_{i \\in DP} W_{effl}} \\cdot \\frac{1}{EC50_{tetrachloroethylene}\\cdot 10^{-3}} '"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'tetrachloroethylene_{effl}'"></span>: load of tetrachloroethylene in the effluent</li>
              <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body</li>
              <li><span v-katex="'EC50_{tetrachloroethylene}: 3200 \\mu g/L'"></span></li>
              <li><span v-katex="'W_{a}'"></span>: amount of water available in the river <b>(streamflow global
                indicator)</b></li>
              <li><span v-katex="'W_{w}'"></span>: amount of water withdrawn from the river</li>

            </ul>
            <br>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_delta_tu_trychloroethylene"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Ecotoxicity profile for trichloroethylene </h3>
            <br>
            <div
                v-katex:display="' \\frac{ \\sum_{i \\in DP} trichloroethylene_{effl_i}}{W_{a} - W_{w} + \\sum_{i \\in DP} W_{effl}} \\cdot \\frac{1}{EC50_{trichloroethylene}\\cdot 10^{-3}} '"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'trichloroethylene_{effl}'"></span>: load of trichloroethylene in the effluent</li>
              <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body</li>
              <li><span v-katex="'EC50_{trichloroethylene}: 76000 \\mu g/L'"></span></li>
              <li><span v-katex="'W_{a}'"></span>: amount of water available in the river <b>(streamflow global
                indicator)</b></li>
              <li><span v-katex="'W_{w}'"></span>: amount of water withdrawn from the river</li>

            </ul>
            <br>


          </div>

        </v-dialog>


        <!-- EQS -->
        <v-dialog
            v-model="info_eqs_diclo"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Ecotoxicity profile for 1,2-Dichloroethane </h3>
            <br>
            <div
                v-katex:display="'\\frac{\\sum_{i \\in DP} 1,2-Dichloroethane_{effl_i}}{\\sum_{i \\in DP} W_{effl_i}} \\cdot \\frac{1}{EQS_{1,2-Dichloroethane}} \\cdot 100'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'1,2-Dichloroethane_{effl}'"></span>: load of 1,2-Dichloroethane in the effluent</li>
              <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body</li>
              <li><span v-katex="'EQS_{1,2-Dichloroethane}: 0.01 mg/L'"></span></li>
            </ul>
            <br>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_eqs_cadmium"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Ecotoxicity profile for cadmium </h3>
            <br>
            <div
                v-katex:display="'\\frac{\\sum_{i \\in DP} cadmium_{effl_i}}{\\sum_{i \\in DP} W_{effl_i}} \\cdot \\frac{1}{EQS_{cadmium}} \\cdot 100'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'cadmium_{effl}'"></span>: load of cadmium in the effluent</li>
              <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body</li>
              <li><span v-katex="'EQS_{cadmium}: 0.001 mg/L'"></span></li>
            </ul>
            <br>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_eqs_hexaclorobenzene"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Ecotoxicity profile for hexachlorobenzene </h3>
            <br>
            <div
                v-katex:display="'\\frac{\\sum_{i \\in DP} hexachlorobenzene_{effl_i}}{\\sum_{i \\in DP} W_{effl_i}} \\cdot \\frac{1}{EQS_{hexachlorobenzene}} \\cdot 100'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'hexachlorobenzene_{effl}'"></span>: load of hexachlorobenzene in the effluent</li>
              <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body</li>
              <li><span v-katex="'EQS_{hexachlorobenzene}: 0.0005 mg/L'"></span></li>
            </ul>
            <br>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_eqs_mercury"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Ecotoxicity profile for mercury </h3>
            <br>
            <div
                v-katex:display="'\\frac{\\sum_{i \\in DP} mercury_{effl_i}}{\\sum_{i \\in DP} W_{effl_i}} \\cdot \\frac{1}{EQS_{mercury} \\cdot } \\cdot 100'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'mercury_{effl}'"></span>: load of mercury in the effluent</li>
              <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body</li>
              <li><span v-katex="'EQS_{mercury}: 0.00007 mg/L'"></span></li>
            </ul>
            <br>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_eqs_lead"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Ecotoxicity profile for lead </h3>
            <br>
            <div
                v-katex:display="'\\frac{\\sum_{i \\in DP} lead_{effl_i}}{\\sum_{i \\in DP} W_{effl_i}} \\cdot \\frac{1}{EQS_{lead}} \\cdot 100'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'lead_{effl}'"></span>: load of lead in the effluent</li>
              <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body</li>
              <li><span v-katex="'EQS_{lead}: 0.0072 mg/L'"></span></li>
            </ul>
            <br>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_eqs_nickel"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Ecotoxicity profile for nickel </h3>
            <br>
            <div
                v-katex:display="'\\frac{\\sum_{i \\in DP} nickel_{effl_i}}{\\sum_{i \\in DP} W_{effl_i}} \\cdot \\frac{1}{EQS_{nickel}} \\cdot 100'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'nickel_{effl}'"></span>: load of nickel in the effluent</li>
              <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body</li>
              <li><span v-katex="'EQS_{nickel}: 0.02 mg/L'"></span></li>
            </ul>
            <br>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_eqs_chloroalkanes"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Ecotoxicity profile for chloroalkanes </h3>
            <br>
            <div
                v-katex:display="'\\frac{\\sum_{i \\in DP} chloroalkanes_{effl_i}}{\\sum_{i \\in DP} W_{effl_i}} \\cdot \\frac{1}{EQS_{chloroalkanes}} \\cdot 100'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'chloroalkanes_{effl}'"></span>: load of chloroalkanes in the effluent</li>
              <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body</li>
              <li><span v-katex="'EQS_{chloroalkanes}: 0.0014 mg/L'"></span></li>
            </ul>
            <br>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_eqs_hexaclorobutadiene"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Ecotoxicity profile for hexachlorobutadiene </h3>
            <br>
            <div
                v-katex:display="'\\frac{\\sum_{i \\in DP} hexachlorobutadiene_{effl_i}}{\\sum_{i \\in DP} W_{effl_i}} \\cdot \\frac{1}{EQS_{hexachlorobutadiene}} \\cdot 100'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'hexachlorobutadiene_{effl}'"></span>: load of hexachlorobutadiene in the effluent</li>
              <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body</li>
              <li><span v-katex="'EQS_{hexachlorobutadiene}: 0.0006 mg/L'"></span></li>
            </ul>
            <br>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_eqs_nonylphenols"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Ecotoxicity profile for nonylphenols </h3>
            <br>
            <div
                v-katex:display="'\\frac{\\sum_{i \\in DP} nonylphenol_{effl_i}}{\\sum_{i \\in DP} W_{effl_i}} \\cdot \\frac{1}{EQS_{nonylphenol} } \\cdot 100'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'nonylphenol_{effl}'"></span>: load of nonylphenol in the effluent</li>
              <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body</li>
              <li><span v-katex="'EQS_{nonylphenol}: 0.002 mg/L'"></span></li>
            </ul>
            <br>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_eqs_tetrachloroethene"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Ecotoxicity profile for tetrachloroethylene </h3>
            <br>
            <div
                v-katex:display="'\\frac{\\sum_{i \\in DP} tetrachloroethylene_{effl_i}}{\\sum_{i \\in DP} W_{effl_i}} \\cdot \\frac{1}{EQS_{tetrachloroethylene}} \\cdot 100'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'tetrachloroethylene_{effl}'"></span>: load of tetrachloroethylene in the effluent</li>
              <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body</li>
              <li><span v-katex="'EQS_{tetrachloroethylene}: 0.01 mg/L'"></span></li>
            </ul>
            <br>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_eqs_trychloroethylene"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Ecotoxicity profile for trichloroethylene </h3>
            <br>
            <div
                v-katex:display="'\\frac{\\sum_{i \\in DP} trichloroethylene_{effl_i}}{\\sum_{i \\in DP} W_{effl_i}} \\cdot \\frac{1}{EQS_{trichloroethylene}} \\cdot 100'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'trichloroethylene_{effl}'"></span>: load of trichloroethylene in the effluent</li>
              <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body</li>
              <li><span v-katex="'EQS_{trichloroethylene}: 0.01 mg/L'"></span></li>
            </ul>
            <br>


          </div>

        </v-dialog>


        <!-- Delta EQS -->
        <v-dialog
            v-model="info_delta_eqs_diclo"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Ecotoxicity profile for 1,2-Dichloroethane </h3>
            <br>
            <div
                v-katex:display="' \\frac{ \\sum_{i \\in DP} 1,2-Dichloroethane_{effl_i}}{W_{a} - W_{w} + \\sum_{i \\in DP} W_{effl}} \\cdot \\frac{1}{EQS_{1,2-Dichloroethane}} \\cdot 100'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'1,2-Dichloroethane_{effl}'"></span>: load of 1,2-Dichloroethane in the effluent</li>
              <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body</li>
              <li><span v-katex="'EQS_{1,2-Dichloroethane}: 0.01 Mg/L'"></span></li>
              <li><span v-katex="'W_{a}'"></span>: amount of water available in the river <b>(streamflow global
                indicator)</b></li>
              <li><span v-katex="'W_{w}'"></span>: amount of water withdrawn from the river</li>

            </ul>
            <br>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_delta_eqs_cadmium"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Ecotoxicity profile for cadmium </h3>
            <br>
            <div
                v-katex:display="' \\frac{ \\sum_{i \\in DP} cadmium_{effl_i}}{W_{a} - W_{w} + \\sum_{i \\in DP} W_{effl}} \\cdot \\frac{1}{EQS_{cadmium}} \\cdot 100'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'cadmium_{effl}'"></span>: load of cadmium in the effluent</li>
              <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body</li>
              <li><span v-katex="'EQS_{cadmium}: 0.001 Mg/L'"></span></li>
              <li><span v-katex="'W_{a}'"></span>: amount of water available in the river <b>(streamflow global
                indicator)</b></li>
              <li><span v-katex="'W_{w}'"></span>: amount of water withdrawn from the river</li>

            </ul>
            <br>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_delta_eqs_hexaclorobenzene"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Ecotoxicity profile for hexachlorobenzene </h3>
            <br>
            <div
                v-katex:display="' \\frac{ \\sum_{i \\in DP} hexachlorobenzene_{effl_i}}{W_{a} - W_{w} + \\sum_{i \\in DP} W_{effl}} \\cdot \\frac{1}{EQS_{hexachlorobenzene}} \\cdot 100'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'hexachlorobenzene_{effl}'"></span>: load of hexachlorobenzene in the effluent</li>
              <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body</li>
              <li><span v-katex="'EQS_{hexachlorobenzene}: 0.0005 mg/L'"></span></li>
              <li><span v-katex="'W_{a}'"></span>: amount of water available in the river <b>(streamflow global
                indicator)</b></li>
              <li><span v-katex="'W_{w}'"></span>: amount of water withdrawn from the river</li>

            </ul>
            <br>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_delta_eqs_mercury"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Ecotoxicity profile for mercury </h3>
            <br>
            <div
                v-katex:display="' \\frac{ \\sum_{i \\in DP} mercury_{effl_i}}{W_{a} - W_{w} + \\sum_{i \\in DP} W_{effl}} \\cdot \\frac{1}{EQS_{mercury}} \\cdot 100'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'mercury_{effl}'"></span>: load of mercury in the effluent</li>
              <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body</li>
              <li><span v-katex="'EQS_{mercury}: 0.00007 mg/L'"></span></li>
              <li><span v-katex="'W_{a}'"></span>: amount of water available in the river <b>(streamflow global
                indicator)</b></li>
              <li><span v-katex="'W_{w}'"></span>: amount of water withdrawn from the river</li>

            </ul>
            <br>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_delta_eqs_lead"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Ecotoxicity profile for lead </h3>
            <br>
            <div
                v-katex:display="' \\frac{ \\sum_{i \\in DP} lead_{effl_i}}{W_{a} - W_{w} + \\sum_{i \\in DP} W_{effl}} \\cdot \\frac{1}{EQS_{lead}} \\cdot 100'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'lead_{effl}'"></span>: load of lead in the effluent</li>
              <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body</li>
              <li><span v-katex="'EQS_{lead}: 0.0072 mg/L'"></span></li>
              <li><span v-katex="'W_{a}'"></span>: amount of water available in the river <b>(streamflow global
                indicator)</b></li>
              <li><span v-katex="'W_{w}'"></span>: amount of water withdrawn from the river</li>

            </ul>
            <br>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_delta_eqs_nickel"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Ecotoxicity profile for nickel </h3>
            <br>
            <div
                v-katex:display="' \\frac{ \\sum_{i \\in DP} nickel_{effl_i}}{W_{a} - W_{w} + \\sum_{i \\in DP} W_{effl}} \\cdot \\frac{1}{EQS_{nickel}} \\cdot 100'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'nickel_{effl}'"></span>: load of nickel in the effluent</li>
              <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body</li>
              <li><span v-katex="'EQS_{nickel}: 0.02 mg/L'"></span></li>
              <li><span v-katex="'W_{a}'"></span>: amount of water available in the river <b>(streamflow global
                indicator)</b></li>
              <li><span v-katex="'W_{w}'"></span>: amount of water withdrawn from the river</li>

            </ul>
            <br>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_delta_eqs_chloroalkanes"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Ecotoxicity profile for chloroalkanes </h3>
            <br>
            <div
                v-katex:display="' \\frac{ \\sum_{i \\in DP} chloroalkanes_{effl_i}}{W_{a} - W_{w} + \\sum_{i \\in DP} W_{effl}} \\cdot \\frac{1}{EQS_{chloroalkanes}} \\cdot 100'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'chloroalkanes_{effl}'"></span>: load of chloroalkanes in the effluent</li>
              <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body</li>
              <li><span v-katex="'EQS_{chloroalkanes}: 0.0014 mg/L'"></span></li>
              <li><span v-katex="'W_{a}'"></span>: amount of water available in the river <b>(streamflow global
                indicator)</b></li>
              <li><span v-katex="'W_{w}'"></span>: amount of water withdrawn from the river</li>

            </ul>
            <br>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_delta_eqs_hexaclorobutadiene"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Ecotoxicity profile for hexachlorobutadiene </h3>
            <br>
            <div
                v-katex:display="' \\frac{ \\sum_{i \\in DP} hexachlorobutadiene_{effl_i}}{W_{a} - W_{w} + \\sum_{i \\in DP} W_{effl}} \\cdot \\frac{1}{EQS_{hexachlorobutadiene}} \\cdot 100'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'hexachlorobutadiene_{effl}'"></span>: load of hexachlorobutadiene in the effluent</li>
              <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body</li>
              <li><span v-katex="'EQS_{hexachlorobutadiene}: 0.0006mg/L'"></span></li>
              <li><span v-katex="'W_{a}'"></span>: amount of water available in the river <b>(streamflow global
                indicator)</b></li>
              <li><span v-katex="'W_{w}'"></span>: amount of water withdrawn from the river</li>

            </ul>
            <br>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_delta_eqs_nonylphenols"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Ecotoxicity profile for nonylphenols </h3>
            <br>
            <div
                v-katex:display="' \\frac{ \\sum_{i \\in DP} nonylphenol_{effl_i}}{W_{a} - W_{w} + \\sum_{i \\in DP} W_{effl}} \\cdot \\frac{1}{EQS_{nonylphenol}} \\cdot 100'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'nonylphenol_{effl}'"></span>: load of nonylphenol in the effluent</li>
              <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body</li>
              <li><span v-katex="'EQS_{nonylphenol}: 0.002 mg/L'"></span></li>
              <li><span v-katex="'W_{a}'"></span>: amount of water available in the river <b>(streamflow global
                indicator)</b></li>
              <li><span v-katex="'W_{w}'"></span>: amount of water withdrawn from the river</li>

            </ul>
            <br>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_delta_eqs_tetrachloroethene"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Ecotoxicity profile for tetrachloroethylene </h3>
            <br>
            <div
                v-katex:display="' \\frac{ \\sum_{i \\in DP} tetrachloroethylene_{effl_i}}{W_{a} - W_{w} + \\sum_{i \\in DP} W_{effl}} \\cdot \\frac{1}{EQS_{tetrachloroethylene}} \\cdot 100'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'tetrachloroethylene_{effl}'"></span>: load of tetrachloroethylene in the effluent</li>
              <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body</li>
              <li><span v-katex="'EQS_{tetrachloroethylene}: 0.01 mg/L'"></span></li>
              <li><span v-katex="'W_{a}'"></span>: amount of water available in the river <b>(streamflow global
                indicator)</b></li>
              <li><span v-katex="'W_{w}'"></span>: amount of water withdrawn from the river</li>

            </ul>
            <br>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_delta_eqs_trychloroethylene"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Ecotoxicity profile for trichloroethylene </h3>
            <br>
            <div
                v-katex:display="' \\frac{ \\sum_{i \\in DP} trichloroethylene_{effl_i}}{W_{a} - W_{w} + \\sum_{i \\in DP} W_{effl}} \\cdot \\frac{1}{EQS_{trichloroethylene}} \\cdot 100'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'trichloroethylene_{effl}'"></span>: load of trichloroethylene in the effluent</li>
              <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body</li>
              <li><span v-katex="'EQS_{trichloroethylene}: 0.01 mg/L'"></span></li>
              <li><span v-katex="'W_{a}'"></span>: amount of water available in the river <b>(streamflow global
                indicator)</b></li>
              <li><span v-katex="'W_{w}'"></span>: amount of water withdrawn from the river</li>

            </ul>
            <br>


          </div>

        </v-dialog>

        <!-- Treatment efficiency -->
        <v-dialog
            v-model="info_efficiency_cod"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Treatment efficiency for COD </h3>
            <br>
            <div
                v-katex:display="'\\frac{\\sum_{i \\in DP} COD_{infl_i} - COD_{effl_i}}{\\sum_{i \\in DP} COD_{infl_i}}\\cdot 100'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'COD_{effl}'"></span>: load of COD in the effluent</li>
              <li><span v-katex="'COD_{infl}'"></span>: load of COD in the influent</li>

            </ul>
            <br>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_efficiency_tn"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Treatment efficiency for TN </h3>
            <br>
            <div
                v-katex:display="'\\frac{\\sum_{i \\in DP} TN_{infl_i} - TN_{effl_i}}{\\sum_{i \\in DP} TN_{infl_i}}\\cdot 100'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'TN_{effl}'"></span>: load of TN in the effluent</li>
              <li><span v-katex="'TN_{infl}'"></span>: load of TN in the influent</li>

            </ul>
            <br>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_efficiency_tp"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Treatment efficiency for TP </h3>
            <br>
            <div
                v-katex:display="'\\frac{\\sum_{i \\in DP} TP_{infl_i} - TP_{effl_i}}{\\sum_{i \\in DP} TP_{infl_i}}\\cdot 100'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'TP_{effl}'"></span>: load of TP in the effluent</li>
              <li><span v-katex="'TP_{infl}'"></span>: load of TP in the influent</li>

            </ul>
            <br>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_efficiency_diclo"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Treatment efficiency for for 1,2-Dichloroethane </h3>
            <br>
            <div
                v-katex:display="'\\frac{\\sum_{i \\in DP} 1,2-Dichloroethane_{infl_i} - 1,2-Dichloroethane_{effl_i}}{\\sum_{i \\in DP} 1,2-Dichloroethane_{infl_i}}\\cdot 100'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'1,2-Dichloroethane_{effl}'"></span>: load of 1,2-Dichloroethane in the effluent</li>
              <li><span v-katex="'1,2-Dichloroethane_{infl}'"></span>: load of 1,2-Dichloroethane in the influent</li>

            </ul>
            <br>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_efficiency_cadmium"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Treatment efficiency for Cadmium </h3>
            <br>
            <div
                v-katex:display="'\\frac{\\sum_{i \\in DP} cadmium_{infl_i} - cadmium_{effl_i}}{\\sum_{i \\in DP} cadmium_{infl_i}}\\cdot 100'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'cadmium_{effl}'"></span>: load of cadmium in the effluent</li>
              <li><span v-katex="'cadmium_{infl}'"></span>: load of cadmium in the influent</li>

            </ul>
            <br>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_efficiency_hexaclorobenzene"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Treatment efficiency for hexachlorobenzene </h3>
            <br>
            <div
                v-katex:display="'\\frac{\\sum_{i \\in DP} hexachlorobenzene_{infl_i} - hexachlorobenzene_{effl_i}}{\\sum_{i \\in DP} hexachlorobenzene_{infl_i}}\\cdot 100'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'hexachlorobenzene_{effl}'"></span>: load of hexachlorobenzene in the effluent</li>
              <li><span v-katex="'hexachlorobenzene_{infl}'"></span>: load of hexachlorobenzene in the influent</li>

            </ul>
            <br>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_efficiency_mercury"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Treatment efficiency for mercury </h3>
            <br>
            <div
                v-katex:display="'\\frac{\\sum_{i \\in DP} mercury_{infl_i} - mercury_{effl_i}}{\\sum_{i \\in DP} mercury_{infl_i}}\\cdot 100'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'mercury_{effl}'"></span>: load of mercury in the effluent</li>
              <li><span v-katex="'mercury_{infl}'"></span>: load of mercury in the influent</li>

            </ul>
            <br>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_efficiency_lead"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Treatment efficiency for lead </h3>
            <br>
            <div
                v-katex:display="'\\frac{\\sum_{i \\in DP} lead_{infl_i} - lead_{effl_i}}{\\sum_{i \\in DP} lead_{infl_i}}\\cdot 100'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'lead_{effl}'"></span>: load of lead in the effluent</li>
              <li><span v-katex="'lead_{infl}'"></span>: load of lead in the influent</li>

            </ul>
            <br>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_efficiency_nickel"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Treatment efficiency for nickel </h3>
            <br>
            <div
                v-katex:display="'\\frac{\\sum_{i \\in DP} nickel_{infl_i} - nickel_{effl_i}}{\\sum_{i \\in DP} nickel_{infl_i}}\\cdot 100'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'nickel_{effl}'"></span>: load of nickel in the effluent</li>
              <li><span v-katex="'nickel_{infl}'"></span>: load of nickel in the influent</li>

            </ul>
            <br>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_efficiency_chloroalkanes"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Treatment efficiency for Chloroalkanes </h3>
            <br>
            <div
                v-katex:display="'\\frac{\\sum_{i \\in DP} chloroalkanes_{infl_i} - chloroalkanes_{effl_i}}{\\sum_{i \\in DP} chloroalkanes_{infl_i}}\\cdot 100'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'chloroalkanes_{effl}'"></span>: load of chloroalkanes in the effluent</li>
              <li><span v-katex="'chloroalkanes_{infl}'"></span>: load of chloroalkanes in the influent</li>

            </ul>
            <br>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_efficiency_hexaclorobutadiene"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Treatment efficiency for Hexachlorobutadiene </h3>
            <br>
            <div
                v-katex:display="'\\frac{\\sum_{i \\in DP} hexachlorobutadiene_{infl_i} - hexachlorobutadiene_{effl_i}}{\\sum_{i \\in DP} hexachlorobutadiene_{infl_i}}\\cdot 100'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'hexachlorobutadiene_{effl}'"></span>: load of Hexachlorobutadiene in the effluent</li>
              <li><span v-katex="'hexachlorobutadiene_{infl}'"></span>: load of Hexachlorobutadiene in the influent</li>

            </ul>
            <br>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_efficiency_nonylphenols"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Treatment efficiency for Nonylphenols </h3>
            <br>
            <div
                v-katex:display="'\\frac{\\sum_{i \\in DP} nonylphenols_{infl_i} - nonylphenols_{effl_i}}{\\sum_{i \\in DP} nonylphenols_{infl_i}}\\cdot 100'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'nonylphenols_{effl}'"></span>: load of Nonylphenols in the effluent</li>
              <li><span v-katex="'nonylphenols_{infl}'"></span>: load of Nonylphenols in the influent</li>

            </ul>
            <br>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_efficiency_tetrachloroethene"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Treatment efficiency for Tetrachloroethylene </h3>
            <br>
            <div
                v-katex:display="'\\frac{\\sum_{i \\in DP} tetrachloroethylene_{infl_i} - tetrachloroethylene_{effl_i}}{\\sum_{i \\in DP} tetrachloroethylene_{infl_i}}\\cdot 100'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'tetrachloroethylene_{effl}'"></span>: load of Tetrachloroethylene in the effluent</li>
              <li><span v-katex="'tetrachloroethylene_{infl}'"></span>: load of Tetrachloroethylene in the influent</li>

            </ul>
            <br>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_efficiency_trychloroethylene"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Treatment efficiency for Trichloroethylene </h3>
            <br>
            <div
                v-katex:display="'\\frac{\\sum_{i \\in DP} trichloroethylene_{infl_i} - trichloroethylene_{effl_i}}{\\sum_{i \\in DP} trichloroethylene_{infl_i}}\\cdot 100'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'trichloroethylene_{effl}'"></span>: load of Trichloroethylene in the effluent</li>
              <li><span v-katex="'trichloroethylene_{infl}'"></span>: load of Trichloroethylene in the influent</li>

            </ul>
            <br>


          </div>

        </v-dialog>

        <!-- Treatment efficiency influent-->
        <v-dialog
            v-model="info_efficiency_influent_cod"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Treatment efficiency for COD </h3>
            <br>
            <div v-katex:display="'\\frac{\\sum_{i \\in DP} COD_{effl_i}}{COD_{infl}}\\cdot 100'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'COD_{effl}'"></span>: load of COD in the effluent</li>
              <li><span v-katex="'COD_{infl}'"></span>:  Industry withdrawal water COD load (surface water only) </li>

            </ul>
            <br>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_efficiency_influent_tn"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Treatment efficiency for TN </h3>
            <br>
            <div v-katex:display="'\\frac{\\sum_{i \\in DP} TN_{effl_i}}{TN_{infl}}\\cdot 100'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'TN_{effl}'"></span>: load of TN in the effluent</li>
              <li><span v-katex="'TN_{infl}'"></span>:  Industry withdrawal water TN load (surface water only) </li>

            </ul>
            <br>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_efficiency_influent_tp"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Treatment efficiency for TP </h3>
            <br>
            <div v-katex:display="'\\frac{\\sum_{i \\in DP} TP_{effl_i}}{TP_{infl}}\\cdot 100'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'TP_{effl}'"></span>: load of TP in the effluent</li>
              <li><span v-katex="'TP_{infl}'"></span>:  Industry withdrawal water TP load (surface water only) </li>

            </ul>
            <br>


          </div>

        </v-dialog>
        <v-dialog
            v-model="info_effluent_load_cod"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> COD effluent load </h3>
            <br>
            Concentration of COD discharged by the industry.
            <br>
            Reducing COD will contribute to reducing your GHG emissions associated to "water discharged"
          </div>

        </v-dialog>
        <v-dialog
            v-model="info_effluent_load_tn"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> TN effluent load </h3>
            <br>
            Concentration of TN discharged by the industry.
            <br>
            Reducing TN will contribute to reducing your GHG emissions associated to "water discharged"
          </div>

        </v-dialog>
        <v-dialog
            v-model="info_effluent_load_tp"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> TP effluent load </h3>
            <br>
            Concentration of TP discharged by the industry.
            <br>
            Reducing TP will contribute to reducing your GHG emissions associated to "water discharged"
          </div>

        </v-dialog>

        <v-dialog
            v-model="co2_ghg_ratio_info"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> CO2 emissions </h3>
            <br>
            CO2 emissions in the wastewater treatment process.
            <br>
            For more information, see Carbon impact.          </div>

        </v-dialog>
        <v-dialog
            v-model="n2o_ghg_ratio_info"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> N2O emissions </h3>
            <br>
            N2O emissions in the wastewater treatment process.
            <br>
            For more information, see Carbon impact.
          </div>

        </v-dialog>
        <v-dialog
            v-model="ch4_ghg_ratio_info"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> CH4 emissions </h3>
            <br>
            CH4 emissions in the wastewater treatment process.
            <br>
            For more information, see Carbon impact.          </div>

        </v-dialog>
        <v-dialog
            v-model="info_pollutant_concentration"
            width="60%"
        >
          <div class="dialog_detail" style="background-color: white">
            <h3> Pollutant concentration </h3>
            <br>

            <div v-katex:display="'C = \\frac{\\sum_{i \\in DP} pollutant_{effl_i}}{\\sum_{i \\in DP} W_{effl_i}} '"></div>
            <div v-katex:display="' \\Delta = \\frac{C}{W_{a} - W_{w} + \\sum_{i \\in DP} W_{effl}}'"></div>

            <b>Where:</b>
            <br>
            <ul>
              <li><span v-katex="'C'"></span>: Concentration of pollutants in the water after treatment in the WWTP (g/m3)</li>
              <li><span v-katex="'\\Delta'"></span>: Increase of the concentration in the receiving water body after discharge (g/m3)</li>

              <li><span v-katex="'DP'"></span>: onsite and external WWTP's, and directly discharged water</li>
              <li><span v-katex="'pollutant_{effl}'"></span>: load of pollutant in the effluent</li>
              <li><span v-katex="'W_{effl}'"></span>: amount of water discharged to the water body</li>
              <li><span v-katex="'W_{a}'"></span>: amount of water available in the river <b>(streamflow global
                indicator)</b></li>
              <li><span v-katex="'W_{w}'"></span>: amount of water withdrawn from the river</li>

            </ul>
            <br>

          </div>
        </v-dialog>



      </div>
    </div>
    <div v-else>
      <h3>Please complete the required industry inputs so you can see the results.</h3>
      <br>
      <br>

      <router-link :to="{name: 'edit_industry'}" style="text-decoration: none">
        <v-hover
            v-slot="{ hover }"
        >
          <h3 :class="`${hover? 'link_to_edit_hovered': 'link_to_edit'}`">
            Click here to edit the industry
          </h3>

        </v-hover>
      </router-link>

    </div>


  </div>

</template>

<script>


let _ = require('lodash');
import {utils, metrics} from "../utils"
import external_indicators from "../external_indicators"

import colors from "../colors"
import risk_thereshold from "..//risk_categories"
import VueKatex from 'vue-katex';
import 'katex/dist/katex.min.css';
import Vue from "vue";

Vue.use(VueKatex, {});

import BarChart from "./BarChart";
import PieChart from "./PieChart";
export default {
  name: "Industry_statistics",
  components: { BarChart, PieChart },
  props: ['assessment_id', 'industry_id'],
  data() {
    return {
      selected_layer: null,
      utils,
      assessment: null,
      industry: null,
      expanded: [],
      risk_categories: risk_thereshold,
      created_assessments: this.$assessments,  //Created assessments
      layers: Vue.prototype.$layers_description,
      global_layers: utils.format_layer_description(Vue.prototype.$layers_description),
      industry_table: {header: [], value: []},
      water_quantity: {header: [], value: []},
      treated_table: {header: [], value: []},
      freshwater_lever_for_action: {header: [], value: []},

      treatment_efficiency_table: {header: [], value: []},
      treatment_efficiency_influent_table: {header: [], value: []},

      ecotoxicity_table: {header: [], value: []},
      ecotoxicity_chart: {chartData: {}, chartOptions: {}},
      ecotoxicity_chip: 0,

      eqs_table: {header: [], value: []},
      eqs_chart: {chartData: {}, chartOptions: {}},
      eqs_chip: 0,


      delta_ecotox_table: {header: [], value: []},
      delta_ecotox_chart: {chartData: {}, chartOptions: {}},
      delta_ecotox_chip: 0,

      context_chart: {chartData: {}, chartOptions: {}},

      delta_eqs_table: {header: [], value: []},
      delta_eqs_chart: {chartData: {}, chartOptions: {}},
      delta_eqs_chip: 0,

      eutrophication_table: {header: [], value: []},
      eutrophication_chart: {chartData: {}, chartOptions: {}},
      eutrophication_chip: 0,

      ghg_ratio_table: {header: [], value: []},
      ghg_ratio_chart: {chartData: {}, chartOptions: {}},
      ghg_ratio_chip: 0,

      ghg_sludge_management_table: {header: [], value: []},
      ghg_sludge_management_chart: {chartData: {}, chartOptions: {}},
      ghg_sludge_management_chip: 0,

      concentration_table: {header: [], value: []},


      emissions_table: {header: [], value: []},
      emissions_chart: {chartData: {}, chartOptions: {}},
      emissions_chip: 0,
      energy_use_table: {header: [], value: []},
      effluent_load_table: {header: [], value: []},
      biogas_valorised_table: {header: [], value: []},

      simple_report_table: {header: [], value: []},
      external_indicators: external_indicators,
      main_tab: 0,
      show_context_chart: false,
      loading_context_table: false,

      table_title: {
        global_warming_potential: {
          elec: "Electricity consumption",
          fuel: "Fuel engines",
          treatment: "Treatment",
          biogas: "Biogas",
          sludge: "Sludge management",
          reuse: "Water reuse transport",
          discharged: "Water discharged",
          total: "Total",
          fuel_digester: "Fuel (digester)",
          biogas_flared: "Biogas flared",
          biogas_valorized: "Biogas valorized",

        },
        availability_quantity: {
          dilution_factor: "Dilution factor",
          recycled: "Recycled water factor",
          treated: "Treated water factor",
          consumption_available: "Consumption available ratio",
          specific_water_consumption: "Specific water consumption"
        },
        pollutants: {
          cod: "COD",
          tn: "TN",
          tp: "TP",
          diclo: "1,2-Dichloroethane",
          cadmium: "Cadmium",
          hexaclorobenzene: "Hexaclorobenzene",
          mercury: "Mercury",
          lead: "Lead",
          nickel: "Nickel",
          chloroalkanes: "Chloroalkanes",
          hexaclorobutadie: "Hexachlorobutadiene",
          nonylphenols: "Nonylphenols",
          tetrachloroethene: "Tetrachloroethene",
          tricloroetile: "Trichloroethylene",
          total: "Total"
        },
        simple_table: {
          quality_quantity: "Freshwater impact",
          dilution_factor: "Dilution factor",
          recycled: "Recycled water factor",
          treated: "Treated water factor",
          consumption_available: "Consumption available ratio",
          specific_water_consumption: "Specific water consumption",
          total_ghg: "GHG emissions from Wastewater",
          eutrophication: "Eutrophication potential",
          tu: "Toxic units in the effluent",
          delta_tu: "Increase in toxic units in the receiving water body after discharge",
          delta_eqs: "Increase of the concentration of the pollutants in the receiving water body after discharge (with respect to EQS)",
          avg_treatment_efficiency: "Percentage of treatment efficiency (compared to WWTP influent)",
          impact_biodiversity: "Impact on biodiversity and ecosystems",
          eqs: "Concentration of the pollutants in the effluent (with respect to EQS)",
          avg_influent_efficiency: "Percentage of treatment efficiency (compared to intake water)",
          pollution: "Pollution impact",
          energy_used_text: "Energy used",
          ecotoxicology: "Ecotoxicology indicators"

        },
      },

      info_energy_used: false,

      info_dilution_factor: false,
      info_recycled_factor: false,
      info_treated_factor: false,
      info_water_stress: false,
      info_specific_consumption: false,
      info_electricity: false,
      info_fuel_engines: false,
      info_treatment: false,
      info_reuse: false,
      info_discharge: false,
      info_sludge_management: false,
      info_biogas: false,
      info_biogas_valorised: false,
      info_biogas_flared: false,
      info_digester_fuel: false,
      info_tn_eutrophication: false,
      info_cod_eutrophication: false,
      info_tp_eutrophication: false,
      info_tu_diclo: false,
      info_tu_cadmium: false,
      info_tu_hexaclorobenzene: false,
      info_tu_mercury: false,
      info_tu_lead: false,
      info_tu_nickel: false,
      info_tu_chloroalkanes: false,
      info_tu_hexaclorobutadiene: false,
      info_tu_nonylphenols: false,
      info_tu_tetrachloroethene: false,
      info_tu_trychloroethylene: false,
      info_delta_tu_diclo: false,
      info_delta_tu_cadmium: false,
      info_delta_tu_hexaclorobenzene: false,
      info_delta_tu_mercury: false,
      info_delta_tu_lead: false,
      info_delta_tu_nickel: false,
      info_delta_tu_chloroalkanes: false,
      info_delta_tu_hexaclorobutadiene: false,
      info_delta_tu_nonylphenols: false,
      info_delta_tu_tetrachloroethene: false,
      info_delta_tu_trychloroethylene: false,
      info_eqs_diclo: false,
      info_eqs_cadmium: false,
      info_eqs_hexaclorobenzene: false,
      info_eqs_mercury: false,
      info_eqs_lead: false,
      info_eqs_nickel: false,
      info_eqs_chloroalkanes: false,
      info_eqs_hexaclorobutadiene: false,
      info_eqs_nonylphenols: false,
      info_eqs_tetrachloroethene: false,
      info_eqs_trychloroethylene: false,
      info_delta_eqs_diclo: false,
      info_delta_eqs_cadmium: false,
      info_delta_eqs_hexaclorobenzene: false,
      info_delta_eqs_mercury: false,
      info_delta_eqs_lead: false,
      info_delta_eqs_nickel: false,
      info_delta_eqs_chloroalkanes: false,
      info_delta_eqs_hexaclorobutadiene: false,
      info_delta_eqs_nonylphenols: false,
      info_delta_eqs_tetrachloroethene: false,
      info_delta_eqs_trychloroethylene: false,

      info_efficiency_cod: false,
      info_efficiency_tn: false,
      info_efficiency_tp: false,
      info_efficiency_diclo: false,
      info_efficiency_cadmium: false,
      info_efficiency_hexaclorobenzene: false,
      info_efficiency_mercury: false,
      info_efficiency_lead: false,
      info_efficiency_nickel: false,
      info_efficiency_chloroalkanes: false,
      info_efficiency_hexaclorobutadiene: false,
      info_efficiency_nonylphenols: false,
      info_efficiency_tetrachloroethene: false,
      info_efficiency_trychloroethylene: false,
      info_efficiency_influent_cod: false,
      info_efficiency_influent_tn: false,
      info_efficiency_influent_tp: false,
      info_effluent_load_tn: false,
      info_effluent_load_cod: false,
      info_effluent_load_tp: false,

      info_pollutant_concentration: false,
      co2_ghg_ratio_info: false,
      n2o_ghg_ratio_info: false,
      ch4_ghg_ratio_info: false,
      dialog_biogas_stage: 0,
      active_indicator: [],
      open_indicator: [],
      selected_assessment: null,

    }

  },
  watch: {

    //Open treeview node under imppact and levers for action. If node is base level (pollution, freshwater or carbon) close the previosuly opened nodes
    open_indicator(value) {
      let impact_index = [1, 13, 16] //Index in tree-view where main categories start
      let new_item = value[value.length - 1]
      if (impact_index.includes(new_item)) {
        if (value.length > 1) {
          Vue.nextTick(async function () {
            value.splice(0, value[value.length - 1], new_item) //Close all categories previously opened          })
          })
        }
      }
    },

    //Reset informatiob the biogas dialog if popup with information of sludge management is shown
    info_sludge_management: function (value) {
      if (value) {
        this.dialog_biogas_stage = 0
      }
    },

    //Change current industry if user selects new assessment
    assessment_id: function (value) {
      this.industry = this.created_assessments[value][this.industry_id]
    },

    //Change current industry if user selects new industryh
    industry_id: function (value) {
      this.industry = this.created_assessments[this.assessment_id][value]
    },

  },
  methods: {

    //Sort strings numerically
    customSort(items, index, isDescending) {
      items.sort((a, b) => {
        let x1 = parseFloat(a[index[0]])
        let x2 = parseFloat(b[index[0]])
        if (isDescending[0]) {
          return x2 - x1;
        } else {
          return x1 - x2;
        }

      });
      return items
    },

    //Get color of item based on value
    getGISLayerColor(item, value){
      let layer = this.selected_layer.name
      let equals = function(name1, name2){
        return name1 == name2 || name1 == name2 + " (Value In Year to 2030 Business as usual)"
      }
      if (equals(layer, "Seasonal variability")){
        return this.risk_categories.seasonal_variability(item[value])
      }else if (equals(layer, "Interannual variability")){
        return this.risk_categories.interannual_variability(item[value])
      }else if (equals(layer, "Water stress")){
        return this.risk_categories.water_stress(item[value])
      }else if (equals(layer, "Water depletion")){
        return this.risk_categories.water_depletion(item[value])
      }else if (equals(layer, "Aridity index")){
        return this.risk_categories.aridity_index(item[value])
      }else if (equals(layer, "Groundwater table decline")){
        return this.risk_categories.groundwater_table_decline(item[value])
      }else if (equals(layer, "Riverine flood risk")){
        return this.risk_categories.riverine_flood_risk(item[value])
      }else if (equals(layer, "Coastal flood risk")){
        return this.risk_categories.coastal_flood_risk(item[value])
      }else if (equals(layer, "Drought risk")){
        return this.risk_categories.drought_risk(item[value])
      }else if (equals(layer, "Coastal eutrophication potential")){
        return this.risk_categories.coastal_eutrophication_potential(item[value])
      }/*else if (equals(layer, "Peak RepRisk Country ESG Risk Index")){
        return this.risk_categories.reprisk(item[value])
      }*/else if (equals(layer, "Unimproved/No Sanitation")){
        return this.risk_categories.no_sanitation(item[value])
      } else if (equals(layer, "Unimproved/No Drinking Water")){
        return this.risk_categories.no_drinking(item[value])
      }
    },

    //Overall water risk color
    get_owr_color(item){
      return this.risk_categories["owr"](item["overall_water_risk"])
    },

    //Get data and charts for nodeLayer selected under context tab
    async layerTreeSelected(nodeLayer){
      this.selected_layer = null
      this.show_context_chart = false
      if(nodeLayer.length > 0){
        this.selected_layer = nodeLayer[0]
        this.loading_context_table = true

        let arr =  [this.industry, ...this.industry.supply_chain]
        for(let [i, val] of arr.entries()) {
          this.industry_table.value[i]["baseline"] = null
          this.industry_table.value[i]["future"] = null

        }

        this.industry_table.header = [
            {text: "Type", value: "type"},
            {text: "Name", value: "supplier_name"},
            {text: "Country", value: "country"},
            {text: "Latitude", value: "lat"},
            {text: "Longitude", value: "lng"},
            {text: "Overall water risk.", value: "overall_water_risk"},
            {text: nodeLayer[0].name+ " (Baseline)", value: "baseline"},
          ]

        if(nodeLayer[0].layer.future == true){
          this.industry_table.header.push(
              {text: nodeLayer[0].name+ " (Value In Year To 2030 Business as usual)", value: "future"}
          )
        }


        let chart_label = []
        let chart_data_baseline = []
        let chart_data_future = []

        for(let [i, val] of arr.entries()){
          let location = arr[i].location


          let baseline = await nodeLayer[0].layer.layers.baseline.annual.layer["data_for_report"](location.lat, location.lng)
          this.industry_table.value[i]["baseline"] = baseline

          chart_label.push(val.name)
          chart_data_baseline.push(baseline)


          if(nodeLayer[0].layer.future == true){
            let future = await nodeLayer[0].layer.layers.future.layer["data_for_report"](location.lat, location.lng)
            this.industry_table.value[i]["future"] = future
            chart_data_future.push(future)

          }
        }
        let unit = await nodeLayer[0].layer.layers.baseline.annual.layer["unit"]()
        this.context_chart = {
          chartData: {
            labels: chart_label,
            datasets: [
              {
                label: "Baseline",
                data: chart_data_baseline,
                backgroundColor: '#1c195b',
              },
            ]
          },
          chartOptions: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              tooltip: {
                callbacks: {
                  label: function(context) {

                    return context.label + ": "+context.raw + unit
                  }

                }
              },
              datalabels: {
                color: 'white'
              },
            }
          }
        }
        if(chart_data_future.length > 0){
          this.context_chart.chartData.datasets.push({
            data: chart_data_future,
            label: "Future",
            backgroundColor: '#0095c6'
          })
        }
        this.loading_context_table = false
        this.show_context_chart = true



      }
      else {
        this.industry_table.header =
            [{text: "Type", value: "type"},
                {text: "Name", value: "supplier_name"},
              {text: "Country", value: "country"},
              {text: "Latitude", value: "lat"},
              {text: "Longitude", value: "lng"},
              {text: "Overall water risk", value: "overall_water_risk"}
            ]
      }
    },

    //Auxiliar function for creating global GIS layer treeview
    add_identifier: function (category, id){
      let _this = this
      category.id = id
      category.locked = (_this.radio_layers === 2 || _this.radio_layers === null)
      id++

      if(category.hasOwnProperty("children")){
        category.children.forEach(subcategory => {
          id = _this.add_identifier(subcategory, id)
        })

      }

      return id
    },

    //An industry or assessment has been deleted, if it's the current one return to map
    industries_deleted(){
      let _this = this
      let assessment_index =  this.$assessments.findIndex(assessment => assessment.name === _this.assessment.name)
      if(assessment_index === -1) this.$router.push('/')
      else {
        let assessment = this.$assessments[assessment_index]
        let industry_index = assessment.industries.findIndex(industry => industry.name === _this.industry.name)
        if(industry_index === -1) this.$router.push('/')
      }
    },

    //In impact and lever for action table, return impact (low, high, very-high, ...) associated to id
    indicator_risk_class: function (id) {


      if (this.industry == null) return
      //risks

      let current_industry_name = this.industry.name
      let industry = this.simple_report_table.value.filter(industry => industry.value == current_industry_name)[0]

      if (industry == null || industry == undefined) return
      //let ghg_impact = this.risk_categories["global_warming"](industry["carbon_impact"])

      let ghg_impact = this.risk_categories["global_warming"](industry["carbon_impact"])
      let freshwater_impact = this.risk_categories["pollution"](industry["freshwater_impact"])
      let pollution_impact = this.risk_categories["pollution"](industry["pollution_impact"])
      let eutrophication_impact = null
      if (this.eutrophication_table.value[0] != undefined) eutrophication_impact = this.risk_categories["eutrophication"](this.eutrophication_table.value[0][current_industry_name])
      let delta_ecotox_impact = null
      if (this.delta_ecotox_table.value[0] != undefined) delta_ecotox_impact = this.risk_categories["delta_ecotoxicity"](this.delta_ecotox_table.value[0][current_industry_name])
      let delta_eqs_impact = null
      if (this.delta_eqs_table.value.length > 0) {
        let delta_eqs_values = this.delta_eqs_table.value.map(x => x[current_industry_name])
        delta_eqs_impact = this.risk_categories["delta_eqs"](delta_eqs_values.sum() / delta_eqs_values.length)
      }
      let ecotox_impact = null
      if (this.ecotoxicity_table.value[0] != undefined) ecotox_impact = this.risk_categories["ecotoxicity"](this.ecotoxicity_table.value[0][current_industry_name])
      let eqs_impact = null
      if (this.eqs_table.value.length > 0) {
        let eqs_values = this.eqs_table.value.map(x => x[current_industry_name])
        eqs_impact = this.risk_categories["eqs"](eqs_values.sum() / eqs_values.length)
      }
      /*
      let pollution_load_to_environment_risk = [null, null]
      pollution_load_to_environment_risk[1] = this.return_avg_risk([eutrophication_impact, delta_eqs_impact, delta_ecotox_impact])
      let toxicity_load_risk = [null, null]
      toxicity_load_risk[1] = this.return_avg_risk([delta_eqs_impact, delta_ecotox_impact])
      let effluent_toxicity_risk = [null, null]
      effluent_toxicity_risk[1] = this.return_avg_risk([eqs_impact, ecotox_impact])*/


      let return_color_class = function (value) {
        if (value == null) return ['no-risk', "Cannot assess impact"]

        if (value[1] == "Low impact") {
          return ['low', value[1]]
        } else if (value[1] == "Medium impact") {
          return ["medium", value[1]]
        } else if (value[1] == "High impact") {
          return ["high", value[1]]
        } else if (value[1] == "Very high impact") {
          return ["very_high", value[1]]
        }
        return null

      }

      let id_risk = [1, 2, 3, 4, 5, 6, 7, 13, 14, 16, 17]
      if (id_risk.includes(id.id)) {
        if (id.id < 3) {
          return return_color_class(pollution_impact)
        } else if (id.id == 3) {
          return return_color_class(delta_ecotox_impact)
        } else if (id.id == 4) {
          return return_color_class(delta_eqs_impact)
        } else if (id.id == 5) {
          return return_color_class(eutrophication_impact)
        } else if (id.id == 6) {
          return return_color_class(ecotox_impact)
        } else if (id.id == 7) {
          return return_color_class(eqs_impact)
        } else if (id.id <= 14) {
          return return_color_class(freshwater_impact)
        } else {
          return return_color_class(ghg_impact)
        }
      }
    },

    //Return very high impact if there is a very high impact in factors, high impact if there is a high impact in factors, ..., until low impact level is reached
    return_avg_risk(factors) {
      let factors_not_null = factors.filter(factor => factor != null && factor != "-").map(factor => factor[1])
      if (factors_not_null.length === 0) {
        return null
      } else if (factors_not_null.includes(risk_thereshold.impact_strings.vh)) {  //Very high
        return risk_thereshold.impact_strings.vh
      } else if (factors_not_null.includes(risk_thereshold.impact_strings.h)) return risk_thereshold.impact_strings.h  //High
      else if (factors_not_null.includes(risk_thereshold.impact_strings.m)) return risk_thereshold.impact_strings.m  //Medium
      else if (factors_not_null.includes(risk_thereshold.impact_strings.l)) return risk_thereshold.impact_strings.l  //Low
      return null
    },


    //Get impact associated to item (related to freshwater)
    getAvailabilityColor(item) {
      if (item.value == this.table_title.availability_quantity.dilution_factor) {
        return this.risk_categories["dilution_factor"](item[this.industry.name])
      } else if (item.value == this.table_title.availability_quantity.recycled) {
        return this.risk_categories["recycled_water_factor"](item[this.industry.name])
      } else if (item.value == this.table_title.availability_quantity.treated) {
        return this.risk_categories["water_treated"](item[this.industry.name])
      } else if (item.value == this.table_title.availability_quantity.consumption_available) {
        return this.risk_categories["water_stress_ratio"](item[this.industry.name])
      } else if (item.value == this.table_title.availability_quantity.specific_water_consumption) {
        return this.risk_categories["specific_water_consumption"](item[this.industry.name])
      }
      return null
    },

    //Get impact associated to item (related to eutrophication potential)
    getEutrophicationColor(item) {
      return this.risk_categories["eutrophication"](item[this.industry.name])
    },

    //Get impact associated to item (related to ecotoxicity delta)
    getDeltaEcotoxColor(item) {
      /*if (item.value == this.table_title.pollutants.total){
        return this.risk_categories["delta_ecotoxicity"](item[value] / 11)
      } else {
        return this.risk_categories["delta_ecotoxicity"](item[value])
      }*/
      return this.risk_categories["delta_ecotoxicity"](item[this.industry.name])
    },

    //Get impact associated to item (related to environmental quality standards)
    getEQSColor(item) {
      return this.risk_categories["eqs"](item[this.industry.name])
    },

    //Get impact associated to item (related to carbon impact)
    getGlobalWarming(item) {
      return this.risk_categories["global_warming"](item[this.industry.name])
    },

    //Get impact associated to item (related to toxic units)
    getEcotoxicity(item) {
      return this.risk_categories["ecotoxicity"](item[this.industry.name])
    },

    //Get impact associated to item (related to delta of environmental quality standards)
    getDeltaEQSColor(item) {
      return this.risk_categories["delta_eqs"](item[this.industry.name])
    },

    //Get impact associated to item (related to treatment efficiency)
    getTreatmentEfficiencyColor(item) {
      return this.risk_categories["treatment_efficiency"](item[this.industry.name])
    },

    //Get impact associated to item (related to treatment efficiency compared to intake water)
    getTreatmentEfficiencyInfluentColor(item) {
      return this.risk_categories["influent_treatment_efficiency"](item[this.industry.name])
    },

    //Bold item if hovered
    itemRowBold: function (item) {
      return item.value == "Total" ? 'style-1' : 'style-2'
    },

    //Get color based on str
    chooseColor(str) {
      return Object.values(colors)[this.hashCode(str) % Object.values(colors).length]
    },

    //Calculate hash code of s
    hashCode(s) {
      let ADLER32 = require('adler-32');
      return ADLER32.str(s)
    },

    //Carbon impact table
    generate_emissions_table() {

      let _this = this

      if (_this.industry !== null) {

        let emission_table = {
          header: [{text: "Emissions", value: "value", sortable: false}],
          value: []
        }

        let total = {value: _this.table_title.global_warming_potential.total, unit: "kgCO2eq/day"}
        let elec = {
          value: _this.table_title.global_warming_potential.elec,
          unit: "kgCO2eq/day",
          info: "info_electricity"
        }
        let fuel = {
          value: _this.table_title.global_warming_potential.fuel,
          unit: "kgCO2eq/day",
          info: "info_fuel_engines"
        }
        let tre = {
          value: _this.table_title.global_warming_potential.treatment,
          unit: "kgCO2eq/day",
          info: "info_treatment"
        }
        let biog = {value: _this.table_title.global_warming_potential.biogas, unit: "kgCO2eq/day", info: "info_biogas"}

        let dig_fuel = {value: _this.table_title.global_warming_potential.fuel_digester, unit: "kgCO2eq/day", info: "info_digester_fuel"}

        let slu = {
          value: _this.table_title.global_warming_potential.sludge,
          unit: "kgCO2eq/day",
          info: "info_sludge_management"
        }
        let reus = {value: _this.table_title.global_warming_potential.reuse, unit: "kgCO2eq/day", info: "info_reuse"}
        let disc = {
          value: _this.table_title.global_warming_potential.discharged,
          unit: "kgCO2eq/day",
          info: "info_discharge"
        }


        let key = this.industry.name
        let industries = [this.industry]

        emission_table.header.push({
          text: key, value: key,
        })
        let emissions = metrics.emissions_and_descriptions(industries, 1)

        total[key] = emissions["total"]
        elec[key] = emissions["elec"]
        fuel[key] = emissions["fuel"]
        tre[key] = emissions["treatment"]
        biog[key] = emissions["biog"]
        dig_fuel[key] = emissions["digester_fuel"]
        slu[key] = emissions["slu"]
        reus[key] = emissions["reuse"]
        disc[key] = emissions["disc"]


        emission_table.header.push({text: "Unit", value: "unit", sortable: false,})
        emission_table.value.push(total)
        emission_table.value.push(elec)
        emission_table.value.push(fuel)
        emission_table.value.push(tre)
        emission_table.value.push(biog)
        emission_table.value.push(dig_fuel)
        emission_table.value.push(slu)
        emission_table.value.push(reus)
        emission_table.value.push(disc)


        _this.emissions_chart = {
          chartData: {
            labels: [
              _this.table_title.global_warming_potential.elec,
              _this.table_title.global_warming_potential.fuel,
              _this.table_title.global_warming_potential.treatment,
              _this.table_title.global_warming_potential.biogas,
              _this.table_title.global_warming_potential.fuel_digester,
              _this.table_title.global_warming_potential.sludge,
              _this.table_title.global_warming_potential.reuse,
              _this.table_title.global_warming_potential.discharged,


            ],
            datasets: [
              {
                backgroundColor: ['#1c195b', '#0095c6', '#5bc9bf', '#00b140', '#ff386b', '#f89c27', '#964fe5'],
                data: [elec[key], fuel[key], tre[key], biog[key], dig_fuel[key], slu[key], reus[key], disc[key]]
              }
            ]
          },
          chartOptions: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              tooltip: {
                callbacks: {
                  label: function(context) {
                    let datasets = context.dataset;
                    let sum = datasets.data.map(x => parseFloat(x)).reduce((a, b) => a + b, 0);
                    let percentage = ((context.raw / sum) * 100).toFixed(2);

                    return context.label + ": "+context.raw + " kgCO2eq/day" + " ("+percentage+"%)"
                  }

                }

              },
              datalabels: {
                formatter: function (value, ctx) {
                  let datasets = ctx.chart.data.datasets;
                  if (datasets.length > 0) {
                    let sum = datasets[0].data.map(x => parseFloat(x)).reduce((a, b) => a + b, 0);
                    let percentage = ((value / sum) * 100).toFixed(2);
                    if(percentage > 5) {
                      return percentage + "%"
                    }else return ''
                  }

                },
                color: 'white'
              },


            },
          }
        }

        return emission_table
      }
      return {header: [], value: []}

    },

    //GHG emissions ratio table
    generate_ghg_ratio_table() {

      let _this = this

      if (_this.industry !== null) {

        let emission_table = {
          header: [{text: "Emissions", value: "value", sortable: false}],
          value: []
        }

        let co2 = {value: "CO2 emissions", unit: "kgCO2eq/day", info: "co2_ghg_ratio_info"}
        let ch4 = {
          value: "CH4 emissions",
          unit: "kgCO2eq/day",
          info: "ch4_ghg_ratio_info"
        }
        let n2o = {
          value: "N2O emissions",
          unit: "kgCO2eq/day",
          info: "n2o_ghg_ratio_info"
        }

        let key = this.industry.name
        let industries = [this.industry]

        emission_table.header.push({
          text: key, value: key,
        })
        let emissions = metrics.emissions_deglossed(industries)


        co2[key] = emissions["co2"]
        ch4[key] = emissions["ch4"]
        n2o[key] = emissions["n2o"]

        emission_table.header.push({text: "Unit", value: "unit", sortable: false,})
        emission_table.value.push(co2)
        emission_table.value.push(ch4)
        emission_table.value.push(n2o)

        _this.ghg_ratio_chart = {
          chartData: {
            labels: [
              "CO2 emissions",
              "CH4 emissions",
              "N2O emissions",
            ],
            datasets: [
              {
                backgroundColor: ['#1c195b', '#0095c6', '#5bc9bf', ],
                data: [co2[key], ch4[key], n2o[key]]
              }
            ]
          },
          chartOptions: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              tooltip: {
                callbacks: {
                  label: function(context) {
                    let datasets = context.dataset;
                    let sum = datasets.data.map(x => parseFloat(x)).reduce((a, b) => a + b, 0);
                    let percentage = ((context.raw / sum) * 100).toFixed(2);

                    return context.label + ": "+context.raw + " kgCO2eq/day" + " ("+percentage+"%)"
                  }

                }

              },
              datalabels: {
                formatter: function (value, ctx) {
                  let datasets = ctx.chart.data.datasets;
                  if (datasets.length > 0) {
                    let sum = datasets[0].data.map(x => parseFloat(x)).reduce((a, b) => a + b, 0);
                    let percentage = ((value / sum) * 100).toFixed(2);
                    if(percentage > 5) {
                      return percentage + "%"
                    }else return ''
                  }

                },
                color: 'white'
              },


            },
          }
        }

        return emission_table
      }
      return {header: [], value: []}

    },

    //sludge management table
    generate_sludge_management_table() {

      let _this = this

      if (_this.industry !== null) {
        let emission_table = {
          header: [{text: "Emissions", value: "value", sortable: false}],
          value: []
        }

        let storage = {value: "Sludge storage", unit: "kgCO2eq/day", info: "info_sludge_management"}
        let composting = {value: "Sludge composted", unit: "kgCO2eq/day", info: "info_sludge_management"}
        let incineration = {value: "Sludge incineration", unit: "kgCO2eq/day", info: "info_sludge_management"}
        let land_application = {value: "Land application of sludge", unit: "kgCO2eq/day", info: "info_sludge_management"}
        let landfilling = {value: "Emissions from landfilled biosolids", unit: "kgCO2eq/day", info: "info_sludge_management"}
        let stockpilling = {value: "Sludge stockpiling", unit: "kgCO2eq/day", info: "info_sludge_management"}
        let transport = {value: "Sludge transport off-site", unit: "kgCO2eq/day", info: "info_sludge_management"}


        let key = this.industry.name
        let industries = [this.industry]

        emission_table.header.push({
          text: key, value: key,
        })
        let emissions = metrics.sludge_management(industries)


        storage[key] = emissions["storage"]
        composting[key] = emissions["composting"]
        incineration[key] = emissions["incineration"]
        land_application[key] = emissions["land_application"]
        landfilling[key] = emissions["landfilling"]
        stockpilling[key] = emissions["stockpilling"]
        transport[key] = emissions["sludge_transport"]


        emission_table.header.push({text: "Unit", value: "unit", sortable: false,})
        emission_table.value.push(storage)
        emission_table.value.push(composting)
        emission_table.value.push(incineration)
        emission_table.value.push(land_application)
        emission_table.value.push(landfilling)
        emission_table.value.push(stockpilling)
        emission_table.value.push(transport)



        _this.ghg_sludge_management_chart = {
          chartData: {
            labels: [
              storage['value'], composting['value'], incineration['value'], land_application['value'], landfilling['value'], stockpilling['value'], transport['value']
            ],
            datasets: [
              {
                backgroundColor: ['#1c195b', '#0095c6', '#5bc9bf', '#00b140', '#ff386b', '#f89c27', '#964fe5'],
                data: [storage[key], composting[key], incineration[key], land_application[key], landfilling[key], stockpilling[key], transport[key]]
              }
            ]
          },
          chartOptions: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    return context.label + ": "+context.raw + " kgCO2eq/day"
                  }

                }

              },
              datalabels: {
                formatter: function (value, ctx) {
                  let datasets = ctx.chart.data.datasets;
                  if (datasets.length > 0) {
                    return value
                  }

                },
                color: 'white'
              },


            },
          }
        }

        return emission_table
      }
      return {header: [], value: []}

    },

    //Concentration of pollutants table
    async generate_concentration_table() {
      let _this = this


      if (_this.industry !== null) {

        let pollutants_table = {
          header: [{text: "", value: "value", sortable: false}],
          value: []
        }

        let dichloroethane = {value: _this.table_title.pollutants.diclo,  info: "info_pollutant_concentration"}
        let cadmium = {value: _this.table_title.pollutants.cadmium, info: "info_pollutant_concentration"}
        let hexachlorobenzene = {value: _this.table_title.pollutants.hexaclorobenzene, info: "info_pollutant_concentration"}
        let mercury = {value: _this.table_title.pollutants.mercury, info: "info_pollutant_concentration"}
        let lead = {value: _this.table_title.pollutants.lead, info: "info_pollutant_concentration"}
        let nickel = {value: _this.table_title.pollutants.nickel, info: "info_pollutant_concentration"}
        let chloroalkanes = {value: _this.table_title.pollutants.chloroalkanes, info: "info_pollutant_concentration"}
        let hexaclorobutadie = {value: _this.table_title.pollutants.hexaclorobutadie, info: "info_pollutant_concentration"}
        let nonylphenols = {value: _this.table_title.pollutants.nonylphenols, unit: "%", info: "info_pollutant_concentration"}
        let tetrachloroethene = {value: _this.table_title.pollutants.tetrachloroethene, info: "info_pollutant_concentration"}
        let trichloroethylene = {
          value: _this.table_title.pollutants.tricloroetile,
          info: "info_pollutant_concentration"
        }

        let key = this.industry.name
        let industries = [this.industry]

        pollutants_table.header.push({
          text: "Concentration of the water discharged (g/m3)", value: key,
        })
        pollutants_table.header.push({
          text: "Increase of the concentration in the receiving water body (g/m3)", value: 'delta',
        })

        let tu = metrics.pollutant_concentration(industries)
        let delta = await metrics.pollutant_delta(industries, _this.global_layers)
        dichloroethane[key] = tu.diclo
        cadmium[key] = tu.cadmium
        hexachlorobenzene[key] = tu.hexaclorobenzene
        mercury[key] = tu.mercury
        lead[key] = tu.lead
        nickel[key] = tu.nickel
        chloroalkanes[key] = tu.chloroalkanes
        hexaclorobutadie[key] = tu.hexaclorobutadie
        nonylphenols[key] = tu.nonylphenols
        tetrachloroethene[key] = tu.tetracloroetile
        trichloroethylene[key] = tu.tricloroetile


        dichloroethane['delta'] = delta.diclo
        cadmium['delta'] = delta.cadmium
        hexachlorobenzene['delta'] = delta.hexaclorobenzene
        mercury['delta'] = delta.mercury
        lead['delta'] = delta.lead
        nickel['delta'] = delta.nickel
        chloroalkanes['delta'] = delta.chloroalkanes
        hexaclorobutadie['delta'] = delta.hexaclorobutadie
        nonylphenols['delta'] = delta.nonylphenols
        tetrachloroethene['delta'] = delta.tetracloroetile
        trichloroethylene['delta'] = delta.tricloroetile


        pollutants_table.value.push(dichloroethane)
        pollutants_table.value.push(cadmium)
        pollutants_table.value.push(hexachlorobenzene)
        pollutants_table.value.push(mercury)
        pollutants_table.value.push(lead)
        pollutants_table.value.push(nickel)
        pollutants_table.value.push(chloroalkanes)
        pollutants_table.value.push(hexaclorobutadie)
        pollutants_table.value.push(nonylphenols)
        pollutants_table.value.push(tetrachloroethene)
        pollutants_table.value.push(trichloroethylene)

        return pollutants_table
      } else return {header: [], emissions: []}


    },

    //Biogas valorisation table
    generate_biogas_valorised_table() {

      let _this = this

      if (_this.industry !== null) {

        let emission_table = {
          header: [{text: "Emissions", value: "value", sortable: false}],
          value: []
        }

        let total = {value: "Total", unit: "kgCO2eq/day"}
        let flared = {value: _this.table_title.global_warming_potential.biogas_flared, unit: "kgCO2eq/day", info: "info_biogas_flared"}
        let valorized = {value: _this.table_title.global_warming_potential.biogas_valorized, unit: "kgCO2eq/day", info: "info_biogas_valorised"}

        let key = this.industry.name
        let industries = [this.industry]

        emission_table.header.push({
          text: key, value: key,
        })
        let emissions = metrics.biogenic_emissions(industries)

        total[key] = emissions["total"]
        flared[key] = emissions["flared"]
        valorized[key] = emissions["valorized"]


        emission_table.header.push({text: "Unit", value: "unit", sortable: false,})

        emission_table.value.push(total)
        emission_table.value.push(flared)
        emission_table.value.push(valorized)


        return emission_table
      }
      return {header: [], value: []}

    },

    //Energy use table
    generate_energy_use_table() {

      let _this = this

      if (_this.industry !== null) {

        let pollutants_table = {
          header: [{text: "", value: "value", sortable: false}],
          value: []
        }

        let energy = {value: "Energy used per day", unit: "kWh/m3", info: "info_energy_used"}

        let key = this.industry.name
        let industries = [this.industry]

        pollutants_table.header.push({
          text: key, value: key,
        })

        energy[key] = metrics.energy_used(industries)

        pollutants_table.header.push({text: "Unit", value: "unit", sortable: false,})

        pollutants_table.value.push(energy)
        return pollutants_table
      } else return {header: [], value: []}

    },

    //Wastewater effluent concentration table
    generate_effluent_load_table() {

      let _this = this

      if (_this.industry != null) {

        let pollutants_table = {
          header: [{text: "", value: "value", sortable: false}],
          value: []
        }

        let tn = {value: _this.table_title.pollutants.tn, unit: "gTN/m3", info: "info_effluent_load_tn"}
        let tp = {value: _this.table_title.pollutants.tp, unit: "gTP/m3", info: "info_effluent_load_tp"}
        let cod = {value: _this.table_title.pollutants.cod, unit: "gCOD/m3", info: "info_effluent_load_cod"}

        let key = this.industry.name
        let industries = [this.industry]

        pollutants_table.header.push({
          text: key, value: key,
        })

        let load = metrics.effluent_concentration(industries)
        tn[key] = load.tn
        cod[key] = load.cod
        tp[key] = load.tp

        pollutants_table.header.push({text: "Unit", value: "unit", sortable: false,})

        pollutants_table.value.push(cod)
        pollutants_table.value.push(tn)
        pollutants_table.value.push(tp)

        return pollutants_table
      } else return {header: [], value: []}

    },

    //Eutrophication potential table
    generate_eutrophication_table() {

      let _this = this

      if (_this.industry !== null) {

        let pollutants_table = {
          header: [{text: "", value: "value", sortable: false}],
          value: []
        }

        let tn = {value: _this.table_title.pollutants.tn, unit: "gPO4eq/m3", info: "info_tn_eutrophication"}
        let tp = {value: _this.table_title.pollutants.tp, unit: "gPO4eq/m3", info: "info_tp_eutrophication"}
        let total = {value: _this.table_title.pollutants.total, unit: "gPO4eq/m3"}
        let cod = {value: _this.table_title.pollutants.cod, unit: "gPO4eq/m3", info: "info_cod_eutrophication"}


        let key = this.industry.name
        let industries = [this.industry]

        pollutants_table.header.push({
          text: key, value: key,
        })

        let eutrophication = metrics.eutrophication_potential(industries)

        cod[key] = eutrophication.cod
        tn[key] = eutrophication.tn
        tp[key] = eutrophication.tp
        total[key] = eutrophication.total


        pollutants_table.header.push({text: "Unit", value: "unit", sortable: false,})

        pollutants_table.value.push(total)
        pollutants_table.value.push(cod)
        pollutants_table.value.push(tn)
        pollutants_table.value.push(tp)

        _this.eutrophication_chart = {
          chartData: {
            labels: [
              cod.value,
              tn.value,
              tp.value,
            ],
            datasets: [
              {
                backgroundColor: ['#1c195b', '#0095c6', '#5bc9bf'],
                data: [cod[key], tn[key], tp[key]]
              }
            ]
          },
          chartOptions: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              tooltip: {
                callbacks: {
                  label: function(context) {
                    let datasets = context.dataset;
                    let sum = datasets.data.map(x => parseFloat(x)).reduce((a, b) => a + b, 0);
                    let percentage = ((context.raw / sum) * 100).toFixed(2);

                    return context.label + ": "+context.raw + " gPO4/m3" + " ("+percentage+"%)"
                  }

                }

              },
              datalabels: {
                formatter: function (value, ctx) {
                  let datasets = ctx.chart.data.datasets;
                  if (datasets.length > 0) {
                    let sum = datasets[0].data.map(x => parseFloat(x)).reduce((a, b) => a + b, 0);
                    let percentage = ((value / sum) * 100).toFixed(2);
                    if(percentage > 5) {
                      return percentage + "%"
                    }else return ''
                  }

                },
                color: 'white'
              },
            }
          }
        }


        return pollutants_table
      } else return {header: [], emissions: []}

    },

    //"Toxic units in the effluent" table
    generate_ecotoxicity_table() {

      let _this = this

      if (_this.industry !== null) {

        let pollutants_table = {
          header: [{text: "", value: "value", sortable: false}],
          value: []
        }


        for (let pollutant of this.industry.pollutants_selected){
          let obj = {
            value: pollutant,
            unit: "TU/day",
            info: 'info_tu_diclo',
          }
        }


        let dichloroethane = {value: _this.table_title.pollutants.diclo, unit: "TU/day", info: "info_tu_diclo"}
        let cadmium = {value: _this.table_title.pollutants.cadmium, unit: "TU/day", info: "info_tu_cadmium"}
        let hexachlorobenzene = {
          value: _this.table_title.pollutants.hexaclorobenzene,
          unit: "TU/day",
          info: "info_tu_hexaclorobenzene"
        }
        let mercury = {value: _this.table_title.pollutants.mercury, unit: "TU/day", info: "info_tu_mercury"}
        let lead = {value: _this.table_title.pollutants.lead, unit: "TU/day", info: "info_tu_lead"}
        let nickel = {value: _this.table_title.pollutants.nickel, unit: "TU/day", info: "info_tu_nickel"}
        let chloroalkanes = {
          value: _this.table_title.pollutants.chloroalkanes,
          unit: "TU/day",
          info: "info_tu_chloroalkanes"
        }
        let hexaclorobutadie = {
          value: _this.table_title.pollutants.hexaclorobutadie,
          unit: "TU/day",
          info: "info_tu_hexaclorobutadiene"
        }
        let nonylphenols = {
          value: _this.table_title.pollutants.nonylphenols,
          unit: "TU/day",
          info: "info_tu_nonylphenols"
        }
        let tetrachloroethene = {
          value: _this.table_title.pollutants.tetrachloroethene,
          unit: "TU/day",
          info: "info_tu_tetrachloroethene"
        }
        let trichloroethylene = {
          value: _this.table_title.pollutants.tricloroetile,
          unit: "TU/day",
          info: "info_tu_trychloroethylene"
        }
        let total = {value: _this.table_title.pollutants.total, unit: "TU/day"}

        let key = this.industry.name
        let industries = [this.industry]

        pollutants_table.header.push({
          text: key, value: key,
        })

        let tu = metrics.ecotoxicity_potential_tu(industries)
        dichloroethane[key] = tu.diclo
        cadmium[key] = tu.cadmium
        hexachlorobenzene[key] = tu.hexaclorobenzene
        mercury[key] = tu.mercury
        lead[key] = tu.lead
        nickel[key] = tu.nickel
        chloroalkanes[key] = tu.chloroalkanes
        hexaclorobutadie[key] = tu.hexaclorobutadie
        nonylphenols[key] = tu.nonylphenols
        tetrachloroethene[key] = tu.tetracloroetile
        trichloroethylene[key] = tu.tricloroetile
        total[key] = tu.total


        pollutants_table.header.push({text: "Unit", value: "unit", sortable: false,})

        pollutants_table.value.push(total)
        pollutants_table.value.push(dichloroethane)
        pollutants_table.value.push(cadmium)
        pollutants_table.value.push(hexachlorobenzene)
        pollutants_table.value.push(mercury)
        pollutants_table.value.push(lead)
        pollutants_table.value.push(nickel)
        pollutants_table.value.push(chloroalkanes)
        pollutants_table.value.push(hexaclorobutadie)
        pollutants_table.value.push(nonylphenols)
        pollutants_table.value.push(tetrachloroethene)
        pollutants_table.value.push(trichloroethylene)

        _this.ecotoxicity_chart = {
          chartData: {
            labels: [
              dichloroethane.value,
              cadmium.value,
              hexachlorobenzene.value,
              mercury.value,
              lead.value,
              nickel.value,
              chloroalkanes.value,
              hexaclorobutadie.value,
              nonylphenols.value,
              tetrachloroethene.value,
              trichloroethylene.value,

            ],
            datasets: [
              {
                backgroundColor: ['#1c195b', '#0095c6', '#5bc9bf', '#00b140', '#ff386b', '#f89c27', '#964fe5', '#009b77', '#b62373', '#9ebe3f', '#999999'],
                data: [dichloroethane[key], cadmium[key], hexachlorobenzene[key], mercury[key], lead[key], nickel[key], chloroalkanes[key], hexaclorobutadie[key], nonylphenols[key], tetrachloroethene[key], trichloroethylene[key]]
              }
            ]
          },
          chartOptions: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              tooltip: {
                callbacks: {
                  label: function(context) {
                    let datasets = context.dataset;
                    let sum = datasets.data.map(x => parseFloat(x)).reduce((a, b) => a + b, 0);
                    let percentage = ((context.raw / sum) * 100).toFixed(2);

                    return context.label + ": "+context.raw + " TU/day" + " ("+percentage+"%)"
                  }

                }

              },
              datalabels: {
                formatter: function (value, ctx) {
                  let datasets = ctx.chart.data.datasets;
                  if (datasets.length > 0) {
                    let sum = datasets[0].data.map(x => parseFloat(x)).reduce((a, b) => a + b, 0);
                    let percentage = ((value / sum) * 100).toFixed(2);
                    if(percentage > 5) {

                      return percentage + "%"
                    }else return ''
                  }

                },
                color: 'white'
              },

            },
          }
        }


        return pollutants_table
      } else return {header: [], emissions: []}

    },

    //"Increase of the concentration of the pollutants in the receiving water body after discharge (with respect to EQS)" table
    async generate_delta_eqs_table() {

      let _this = this


      if (_this.industry !== null) {


        let pollutants_table = {
          header: [{text: "", value: "value", sortable: false}],
          value: []
        }

        let dichloroethane = {value: _this.table_title.pollutants.diclo, unit: "%", info: "info_delta_eqs_diclo"}
        let cadmium = {value: _this.table_title.pollutants.cadmium, unit: "%", info: "info_delta_eqs_cadmium"}
        let hexachlorobenzene = {
          value: _this.table_title.pollutants.hexaclorobenzene,
          unit: "%",
          info: "info_delta_eqs_hexaclorobenzene"
        }
        let mercury = {value: _this.table_title.pollutants.mercury, unit: "%", info: "info_delta_eqs_mercury"}
        let lead = {value: _this.table_title.pollutants.lead, unit: "%", info: "info_delta_eqs_lead"}
        let nickel = {value: _this.table_title.pollutants.nickel, unit: "%", info: "info_delta_eqs_nickel"}
        let chloroalkanes = {
          value: _this.table_title.pollutants.chloroalkanes,
          unit: "%",
          info: "info_delta_eqs_chloroalkanes"
        }
        let hexaclorobutadie = {
          value: _this.table_title.pollutants.hexaclorobutadie,
          unit: "%",
          info: "info_delta_eqs_hexaclorobutadiene"
        }
        let nonylphenols = {
          value: _this.table_title.pollutants.nonylphenols,
          unit: "%",
          info: "info_delta_eqs_nonylphenols"
        }
        let tetrachloroethene = {
          value: _this.table_title.pollutants.tetrachloroethene,
          unit: "%",
          info: "info_delta_eqs_tetrachloroethene"
        }
        let trichloroethylene = {
          value: _this.table_title.pollutants.tricloroetile,
          unit: "%",
          info: "info_delta_eqs_trychloroethylene"
        }


        let key = this.industry.name
        let industries = [this.industry]

        pollutants_table.header.push({
          text: key, value: key,
        })

        let tu = await metrics.delta_eqs(industries, _this.global_layers)
        dichloroethane[key] = tu.diclo
        cadmium[key] = tu.cadmium
        hexachlorobenzene[key] = tu.hexaclorobenzene
        mercury[key] = tu.mercury
        lead[key] = tu.lead
        nickel[key] = tu.nickel
        chloroalkanes[key] = tu.chloroalkanes
        hexaclorobutadie[key] = tu.hexaclorobutadie
        nonylphenols[key] = tu.nonylphenols
        tetrachloroethene[key] = tu.tetracloroetile
        trichloroethylene[key] = tu.tricloroetile


        pollutants_table.header.push({text: "Unit", value: "unit", sortable: false,})

        pollutants_table.value.push(dichloroethane)
        pollutants_table.value.push(cadmium)
        pollutants_table.value.push(hexachlorobenzene)
        pollutants_table.value.push(mercury)
        pollutants_table.value.push(lead)
        pollutants_table.value.push(nickel)
        pollutants_table.value.push(chloroalkanes)
        pollutants_table.value.push(hexaclorobutadie)
        pollutants_table.value.push(nonylphenols)
        pollutants_table.value.push(tetrachloroethene)
        pollutants_table.value.push(trichloroethylene)

        this.delta_eqs_chart = {
          chartData: {
            labels: [dichloroethane.value, cadmium.value, hexachlorobenzene.value, mercury.value, lead.value, nickel.value, chloroalkanes.value, hexaclorobutadie.value, nonylphenols.value, tetrachloroethene.value, trichloroethylene.value],
            datasets: [
              {
                data: [dichloroethane[key],cadmium[key], hexachlorobenzene[key], mercury[key], lead[key], nickel[key], chloroalkanes[key], hexaclorobutadie[key], nonylphenols[key], tetrachloroethene[key], trichloroethylene[key]],
                backgroundColor: ['#1c195b', '#0095c6', '#5bc9bf', '#5f89c27', '#ff386b', '#9ebe3f', '#009b77', '#00b140', '#964fe5', '#b62373', '#999999' ]
              },

            ]
          },
          chartOptions: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    return context.label + ": "+context.raw + "%"
                  },
                }

              },
            },
            scales: {
              y: {
                ticks: {
                  beginAtZero:true,
                  callback: function(value, index, values) {
                    return value + '%';
                  }
                },
              }
            }
          },

        }


        return pollutants_table
      } else return {header: [], emissions: []}

    },

    //"Increase in toxic units in the receiving water body after discharge" table
    async generate_delta_ecotox_table() {

      let _this = this

      if (_this.industry !== null) {

        let pollutants_table = {
          header: [{text: "", value: "value", sortable: false}],
          value: []
        }

        let dichloroethane = {value: _this.table_title.pollutants.diclo, unit: "TU/day", info: "info_delta_tu_diclo"}
        let cadmium = {value: _this.table_title.pollutants.cadmium, unit: "TU/day", info: "info_delta_tu_cadmium"}
        let hexachlorobenzene = {
          value: _this.table_title.pollutants.hexaclorobenzene,
          unit: "TU/day",
          info: "info_delta_tu_hexaclorobenzene"
        }
        let mercury = {value: _this.table_title.pollutants.mercury, unit: "TU/day", info: "info_delta_tu_mercury"}
        let lead = {value: _this.table_title.pollutants.lead, unit: "TU/day", info: "info_delta_tu_lead"}
        let nickel = {value: _this.table_title.pollutants.nickel, unit: "TU/day", info: "info_delta_tu_nickel"}
        let chloroalkanes = {
          value: _this.table_title.pollutants.chloroalkanes,
          unit: "TU/day",
          info: "info_delta_tu_chloroalkanes"
        }
        let hexaclorobutadie = {
          value: _this.table_title.pollutants.hexaclorobutadie,
          unit: "TU/day",
          info: "info_delta_tu_hexaclorobutadiene"
        }
        let nonylphenols = {
          value: _this.table_title.pollutants.nonylphenols,
          unit: "TU/day",
          info: "info_delta_tu_nonylphenols"
        }
        let tetrachloroethene = {
          value: _this.table_title.pollutants.tetrachloroethene,
          unit: "TU/day",
          info: "info_delta_tu_tetrachloroethene"
        }
        let trichloroethylene = {
          value: _this.table_title.pollutants.tricloroetile,
          unit: "TU/day",
          info: "info_delta_tu_trychloroethylene"
        }
        let total = {value: _this.table_title.pollutants.total, unit: "TU/day"}


        let key = this.industry.name
        let industries = [this.industry]


        pollutants_table.header.push({
          text: key, value: key,
        })

        let tu = await metrics.delta_tu(industries, _this.global_layers)
        dichloroethane[key] = tu.diclo
        cadmium[key] = tu.cadmium
        hexachlorobenzene[key] = tu.hexaclorobenzene
        mercury[key] = tu.mercury
        lead[key] = tu.lead
        nickel[key] = tu.nickel
        chloroalkanes[key] = tu.chloroalkanes
        hexaclorobutadie[key] = tu.hexaclorobutadie
        nonylphenols[key] = tu.nonylphenols
        tetrachloroethene[key] = tu.tetracloroetile
        trichloroethylene[key] = tu.tricloroetile
        total[key] = tu.total


        pollutants_table.value.push(total)
        pollutants_table.header.push({text: "Unit", value: "unit", sortable: false,})
        pollutants_table.value.push(dichloroethane)
        pollutants_table.value.push(cadmium)
        pollutants_table.value.push(hexachlorobenzene)
        pollutants_table.value.push(mercury)
        pollutants_table.value.push(lead)
        pollutants_table.value.push(nickel)
        pollutants_table.value.push(chloroalkanes)
        pollutants_table.value.push(hexaclorobutadie)
        pollutants_table.value.push(nonylphenols)
        pollutants_table.value.push(tetrachloroethene)
        pollutants_table.value.push(trichloroethylene)


        _this.delta_ecotox_chart = {
          chartData: {
            labels: [
              dichloroethane.value,
              cadmium.value,
              hexachlorobenzene.value,
              mercury.value,
              lead.value,
              nickel.value,
              chloroalkanes.value,
              hexaclorobutadie.value,
              nonylphenols.value,
              tetrachloroethene.value,
              trichloroethylene.value,

            ],
            datasets: [
              {
                backgroundColor: ['#1c195b', '#0095c6', '#5bc9bf', '#00b140', '#ff386b', '#f89c27', '#964fe5', '#009b77', '#b62373', '#9ebe3f', '#999999'],
                data: [dichloroethane[key], cadmium[key], hexachlorobenzene[key], mercury[key], lead[key], nickel[key], chloroalkanes[key], hexaclorobutadie[key], nonylphenols[key], tetrachloroethene[key], trichloroethylene[key]]
              }
            ]
          },
          chartOptions: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              tooltip: {
                callbacks: {
                  label: function(context) {
                    let datasets = context.dataset;
                    let sum = datasets.data.map(x => parseFloat(x)).reduce((a, b) => a + b, 0);
                    let percentage = ((context.raw / sum) * 100).toFixed(2);

                    return context.label + ": "+context.raw + " TU/day" + " ("+percentage+"%)"
                  }
                }

              },
              datalabels: {
                formatter: function (value, ctx) {
                  let datasets = ctx.chart.data.datasets;
                  if (datasets.length > 0) {
                    let sum = datasets[0].data.map(x => parseFloat(x)).reduce((a, b) => a + b, 0);
                    let percentage = ((value / sum) * 100).toFixed(2);
                    if(percentage > 5) {
                      return percentage + "%"
                    }else return ''
                  }

                },
                color: 'white'
              },
            },
          }
        }


        return pollutants_table
      } else return {header: [], emissions: []}

    },

    //"Concentration of the pollutants in the effluent (with respect to EQS)"
    generate_eqs_table() {

      let _this = this


      if (_this.industry !== null) {

        let pollutants_table = {
          header: [{text: "", value: "value", sortable: false}],
          value: []
        }

        let dichloroethane = {value: _this.table_title.pollutants.diclo, unit: "%", info: "info_eqs_diclo"}
        let cadmium = {value: _this.table_title.pollutants.cadmium, unit: "%", info: "info_eqs_cadmium"}
        let hexachlorobenzene = {
          value: _this.table_title.pollutants.hexaclorobenzene,
          unit: "%",
          info: "info_eqs_hexaclorobenzene"
        }
        let mercury = {value: _this.table_title.pollutants.mercury, unit: "%", info: "info_eqs_mercury"}
        let lead = {value: _this.table_title.pollutants.lead, unit: "%", info: "info_eqs_lead"}
        let nickel = {value: _this.table_title.pollutants.nickel, unit: "%", info: "info_eqs_nickel"}
        let chloroalkanes = {
          value: _this.table_title.pollutants.chloroalkanes,
          unit: "%",
          info: "info_eqs_chloroalkanes"
        }
        let hexaclorobutadie = {
          value: _this.table_title.pollutants.hexaclorobutadie,
          unit: "%",
          info: "info_eqs_hexaclorobutadiene"
        }
        let nonylphenols = {value: _this.table_title.pollutants.nonylphenols, unit: "%", info: "info_eqs_nonylphenols"}
        let tetrachloroethene = {
          value: _this.table_title.pollutants.tetrachloroethene,
          unit: "%",
          info: "info_eqs_tetrachloroethene"
        }
        let trichloroethylene = {
          value: _this.table_title.pollutants.tricloroetile,
          unit: "%",
          info: "info_eqs_trychloroethylene"
        }

        let key = this.industry.name
        let industries = [this.industry]

        pollutants_table.header.push({
          text: key, value: key,
        })

        let tu = metrics.environmental_quality_standards(industries)
        dichloroethane[key] = tu.diclo
        cadmium[key] = tu.cadmium
        hexachlorobenzene[key] = tu.hexaclorobenzene
        mercury[key] = tu.mercury
        lead[key] = tu.lead
        nickel[key] = tu.nickel
        chloroalkanes[key] = tu.chloroalkanes
        hexaclorobutadie[key] = tu.hexaclorobutadie
        nonylphenols[key] = tu.nonylphenols
        tetrachloroethene[key] = tu.tetracloroetile
        trichloroethylene[key] = tu.tricloroetile

        pollutants_table.header.push({text: "Unit", value: "unit", sortable: false,})

        pollutants_table.value.push(dichloroethane)
        pollutants_table.value.push(cadmium)
        pollutants_table.value.push(hexachlorobenzene)
        pollutants_table.value.push(mercury)
        pollutants_table.value.push(lead)
        pollutants_table.value.push(nickel)
        pollutants_table.value.push(chloroalkanes)
        pollutants_table.value.push(hexaclorobutadie)
        pollutants_table.value.push(nonylphenols)
        pollutants_table.value.push(tetrachloroethene)
        pollutants_table.value.push(trichloroethylene)

        this.eqs_chart = {
          chartData: {
            labels: [dichloroethane.value, cadmium.value, hexachlorobenzene.value, mercury.value, lead.value, nickel.value, chloroalkanes.value, hexaclorobutadie.value, nonylphenols.value, tetrachloroethene.value, trichloroethylene.value],
            datasets: [
              {
                data: [dichloroethane[key],cadmium[key], hexachlorobenzene[key], mercury[key], lead[key], nickel[key], chloroalkanes[key], hexaclorobutadie[key], nonylphenols[key], tetrachloroethene[key], trichloroethylene[key]],
                backgroundColor: ['#1c195b', '#0095c6', '#5bc9bf', '#5f89c27', '#ff386b', '#9ebe3f', '#009b77', '#00b140', '#964fe5', '#b62373', '#999999' ]
              },

            ]
          },
          chartOptions: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    return context.label + ": "+context.raw + "%"
                  }

                }

              },

            },
            scales: {
              y: {
                ticks: {
                  beginAtZero:true,
                  callback: function(value, index, values) {
                    return value + '%';
                  }
                },
              }
            }

          }

        }


        return pollutants_table
      } else return {header: [], emissions: []}

    },

    //Calculates all statistics for current industry (for calculating and evaluating industry impact for showing colors in treeview)
    async generate_simple_report_table() {

      if (this.industry !== undefined) {

        let pollutants_table = {
          header: [{text: "Name", value: "value"}, {text: "Country", value: "country"}, {
            text: "Number of suppliers",
            value: "supply_chain_number"
          }, {text: "Pollution impact", value: "pollution_impact", sortable: false}, {
            text: "Freshwater impact",
            value: "freshwater_impact",
            sortable: false
          }, {text: "GHG emissions from Wastewater", value: "carbon_impact", sortable: false}],
          value: []
        }

        let key = this.industry.name
        let industries = [this.industry]

        let industry_row = {value: key}

        let dilution_factor_value = await metrics.dilution_factor(this.global_layers, industries)
        let dilution_factor_risk = this.risk_categories["dilution_factor"](dilution_factor_value)

        let available_factor = await metrics.available_ratio(this.global_layers, industries)
        let available_factor_risk = this.risk_categories["water_stress_ratio"](available_factor)

        industry_row["freshwater_impact"] = this.return_avg_risk([dilution_factor_risk, available_factor_risk])
        industry_row["carbon_impact"] = metrics.emissions_and_descriptions(industries, 1).total

        let eutrophication_factor = metrics.eutrophication_potential(industries).total
        let eutrophication_risk = this.risk_categories["eutrophication"](eutrophication_factor)

        let ecotox_effluent_factor = metrics.ecotoxicity_potential_tu(industries).total
        let ecotox_effluent_risk = this.risk_categories["ecotoxicity"](ecotox_effluent_factor)

        let delta_ecotox_factor = (await metrics.delta_tu(industries, this.global_layers)).total
        let delta_ecotox_risk = this.risk_categories["delta_ecotoxicity"](delta_ecotox_factor)

        let eqs_factor = metrics.eqs_avg(industries)
        let eqs_risk = this.risk_categories["eqs"](eqs_factor)

        let delta_eqs_factor = await metrics.delta_eqs_avg(industries, this.global_layers)
        let delta_eqs_risk = this.risk_categories["delta_eqs"](delta_eqs_factor)

        industry_row["pollution_impact"] = this.return_avg_risk([eutrophication_risk, ecotox_effluent_risk, delta_ecotox_risk, eqs_risk, delta_eqs_risk])

        let industry = industries[0]

        industry_row["country"] = utils.get_country_code_from_coordinates(industry.location.lat, industry.location.lng)
        industry_row["supply_chain_number"] = industry.supply_chain.length

        pollutants_table.value.push(industry_row)


        return pollutants_table
      } else return {header: [], emissions: []}

    },

    //Freshwater impact
    async generate_water_quality_table() {

      let _this = this

      if (_this.industry != null) {

        let pollutants_table = {
          header: [{text: "", value: "value", sortable: false}],
          value: []
        }

        let dilution_factor_row = {
          value: _this.table_title.availability_quantity.dilution_factor,
          unit: "-",
          info: "info_dilution_factor"
        }
        let treated_factor = {
          value: _this.table_title.availability_quantity.treated,
          unit: "%",
          info: "info_treated_factor"
        }
        let available_ratio = {
          value: _this.table_title.availability_quantity.consumption_available,
          unit: "%",
          info: "info_water_stress"
        }
        let recycled_factor = {
          value: _this.table_title.availability_quantity.recycled,
          unit: "%",
          info: "info_recycled_factor"
        }
        let efficiency_factor = {
          value: _this.table_title.availability_quantity.specific_water_consumption,
          unit: "tonnes/m3",
          info: "info_specific_consumption"
        }
        //let water_quality_standards = {value: "Environmental quality standards", unit: "%", info: "Percentage of emitted pollutants exceeding the maximum allowable concentration"}


        let data_chart = {
          labels: ["Recycled water factor", "Treated water factor", "Consumption available ratio"],
          datasets: []
        };


        let key = this.industry.name
        let industries = [this.industry]

        pollutants_table.header.push({
          text: key, value: key,
        })

        let dilution_factor_value = await metrics.dilution_factor(this.global_layers, industries)
        dilution_factor_row[key] = dilution_factor_value

        recycled_factor[key] = metrics.recycled_water_factor(industries)

        treated_factor[key] = metrics.treated_water_factor(industries)

        let available_ratio_value = await metrics.available_ratio(this.global_layers, industries)
        available_ratio[key] = available_ratio_value

        efficiency_factor[key] = metrics.efficiency_factor(industries)

        //water_quality_standards[key] = metrics.nqa(industries)

        data_chart.datasets.push({
          data: [recycled_factor[key], treated_factor[key], available_ratio_value],
          label: key,
          backgroundColor: this.chooseColor(key).concat("70"),
        })


        const options = {
          animation: false,
          scale: {
            ticks: {
              min: 0
            }
          },
          "tooltips": {
            "callbacks": {
              "title": (tooltipItem, data) => {
                //return data.labels[tooltipItem[0].index]
                return Object.values(tooltipItem).map(item => {
                  return data.labels[item.index]
                }).toString()
              }
            }
          }
        }

        _this.quantity_chart = {
          chartData: data_chart,
          options: options
        }

        pollutants_table.header.push({text: "Unit", value: "unit", sortable: false,})

        pollutants_table.value.push(dilution_factor_row)
        //pollutants_table.value.push(recycled_factor)
        //pollutants_table.value.push(treated_factor)
        pollutants_table.value.push(available_ratio)
        //pollutants_table.value.push(efficiency_factor)
        //pollutants_table.value.push(water_quality_standards)


        return pollutants_table
      } else return {header: [], emissions: []}

    },

    //Freshwater lever for action
    async generate_freshwater_lever_for_action_table() {

      let _this = this

      if (_this.industry != null) {

        let pollutants_table = {
          header: [{text: "", value: "value", sortable: false}],
          value: []
        }

        let recycled_factor = {
          value: _this.table_title.availability_quantity.recycled,
          unit: "%",
          info: "info_recycled_factor"
        }
        let efficiency_factor = {
          value: _this.table_title.availability_quantity.specific_water_consumption,
          unit: "tonnes/m3",
          info: "info_specific_consumption"
        }


        let data_chart = {
          labels: ["Recycled water factor", "Treated water factor", "Consumption available ratio"],
          datasets: []
        };

        let key = this.industry.name
        let industries = [this.industry]

        pollutants_table.header.push({
          text: key, value: key,
        })

        recycled_factor[key] = metrics.recycled_water_factor(industries)
        efficiency_factor[key] = metrics.efficiency_factor(industries)

        pollutants_table.header.push({text: "Unit", value: "unit", sortable: false,})

        pollutants_table.value.push(recycled_factor)
        pollutants_table.value.push(efficiency_factor)

        return pollutants_table
      } else return {header: [], emissions: []}

    },

    //Treated water factor
    async generate_treated_table() {

      let _this = this


      if (_this.industry != null) {

        let pollutants_table = {
          header: [{text: "", value: "value", sortable: false}],
          value: []
        }

        let treated_factor = {
          value: _this.table_title.availability_quantity.treated,
          unit: "%",
          info: "info_treated_factor"
        }


        let key = this.industry.name
        let industries = [this.industry]

        pollutants_table.header.push({
          text: key, value: key,
        })

        treated_factor[key] = metrics.treated_water_factor(industries)

        pollutants_table.header.push({text: "Unit", value: "unit", sortable: false,})

        pollutants_table.value.push(treated_factor)

        return pollutants_table
      } else return {header: [], emissions: []}

    },

    //Percentatge of treatment efficiency (compared to WWTP influent)
    generate_treatment_efficiency_table() {

      let _this = this

      if (_this.industry !== null) {

        let pollutants_table = {
          header: [{text: "", value: "value", sortable: false}],
          value: []
        }


        let tn = {value: "TN treatment efficiency", unit: "%", info: "info_efficiency_tn"}
        let tp = {value: "TP treatment efficiency", unit: "%", info: "info_efficiency_tp"}
        let dichloroethane = {
          value: "1,2-Dichloroethane treatment efficiency",
          unit: "%",
          info: "info_efficiency_diclo"
        }
        let cadmium = {value: "Cadmium treatment efficiency", unit: "%", info: "info_efficiency_hexaclorobenzene"}
        let hexachlorobenzene = {
          value: "Hexachlorobenzene treatment efficiency",
          unit: "%",
          info: "info_efficiency_hexaclorobenzene"
        }
        let mercury = {value: "Mercury treatment efficiency", unit: "%", info: "info_efficiency_mercury"}
        let lead = {value: "Lead treatment efficiency", unit: "%", info: "info_efficiency_lead"}
        let nickel = {value: "Nickel treatment efficiency", unit: "%", info: "info_efficiency_nickel"}
        let chloroalkanes = {
          value: "Chloroalkanes treatment efficiency",
          unit: "%",
          info: "info_efficiency_chloroalkanes"
        }
        let hexaclorobutadie = {
          value: "Hexachlorobutadiene treatment efficiency",
          unit: "%",
          info: "info_efficiency_hexaclorobutadiene"
        }
        let nonylphenols = {value: "Nonylphenols treatment efficiency", unit: "%", info: "info_efficiency_nonylphenols"}
        let tetrachloroethene = {
          value: "Tetrachloroethene treatment efficiency",
          unit: "%",
          info: "info_efficiency_tetrachloroethene"
        }
        let trichloroethylene = {
          value: "Trichloroethylene treatment efficiency",
          unit: "%",
          info: "info_efficiency_trychloroethylene"
        }
        let cod = {value: "COD treatment efficiency", unit: "%", info: "info_efficiency_cod"}


        let data_chart = {
          labels: ["COD", "TN", "TP", "1,2-Dichloroethane", "Cadmium", "Hexachlorobenzene", "Mercury", "Lead", "Nickel", "Chloroalkanes", "Hexachlorobutadiene", "Nonylphenols", "Tetrachloroethene", "Trichloroethylene"],
          datasets: []
        };


        let key = this.industry.name
        let industries = [this.industry]

        pollutants_table.header.push({
          text: key, value: key,
        })

        tn[key] = metrics.tn_efficiency(industries)
        tp[key] = metrics.tp_efficiency(industries)
        cod[key] = metrics.cod_efficiency(industries)
        dichloroethane[key] = metrics.dichloroethane_efficiency(industries)
        cadmium[key] = metrics.cadmium_efficiency(industries)
        hexachlorobenzene[key] = metrics.hexaclorobenzene_efficiency(industries)
        mercury[key] = metrics.mercury_efficiency(industries)
        lead[key] = metrics.lead_efficiency(industries)
        nickel[key] = metrics.nickel_efficiency(industries)
        chloroalkanes[key] = metrics.chloroalkanes_efficiency(industries)
        hexaclorobutadie[key] = metrics.hexaclorobutadie_efficiency(industries)
        nonylphenols[key] = metrics.nonylphenols_efficiency(industries)
        tetrachloroethene[key] = metrics.tetrachloroethene_efficiency(industries)
        trichloroethylene[key] = metrics.tricloroetile_efficiency(industries)


        data_chart.datasets.push({

          data: [cod[key], tn[key], tp[key], dichloroethane[key], cadmium[key], hexachlorobenzene[key], mercury[key], lead[key], nickel[key], chloroalkanes[key], hexaclorobutadie[key], nonylphenols[key], tetrachloroethene[key], trichloroethylene[key]],
          label: key,
          backgroundColor: this.chooseColor(key).concat("70"),

        })


        const options = {
          animation: false,
          scale: {
            ticks: {
              min: 0
            }
          },
          "tooltips": {}
        }

        _this.treatment_efficiency_chart = {
          chartData: data_chart,
          options: options
        }

        pollutants_table.header.push({text: "Unit", value: "unit", sortable: false,})


        pollutants_table.value.push(cod)
        pollutants_table.value.push(tn)
        pollutants_table.value.push(tp)
        pollutants_table.value.push(dichloroethane)
        pollutants_table.value.push(cadmium)
        pollutants_table.value.push(hexachlorobenzene)
        pollutants_table.value.push(mercury)
        pollutants_table.value.push(lead)
        pollutants_table.value.push(nickel)
        pollutants_table.value.push(chloroalkanes)
        pollutants_table.value.push(hexaclorobutadie)
        pollutants_table.value.push(nonylphenols)
        pollutants_table.value.push(tetrachloroethene)
        pollutants_table.value.push(trichloroethylene)


        return pollutants_table
      } else return {header: [], emissions: []}

    },

    //Percentage of treatment efficiency (compared to intake water)
    generate_treatment_efficiency_influent_table() {

      let _this = this


      if (_this.industry !== null) {


        let pollutants_table = {
          header: [{text: "", value: "value", sortable: false}],
          value: []
        }

        let tn = {value: "TN treatment efficiency", unit: "%", info: "info_efficiency_influent_tn"}
        let tp = {value: "TP treatment efficiency", unit: "%", info: "info_efficiency_influent_tp"}
        let cod = {value: "COD treatment efficiency", unit: "%", info: "info_efficiency_influent_cod"}


        let data_chart = {
          labels: ["COD", "TN", "TP"],
          datasets: []
        };


        let key = this.industry.name
        let industries = [this.industry]
        pollutants_table.header.push({
          text: key, value: key,
        })

        let eff = metrics.amount_water_influent_cleaned(industries)

        tn[key] = eff.tn
        tp[key] = eff.tp
        cod[key] = eff.cod


        data_chart.datasets.push({

          data: [cod[key], tn[key], tp[key]],
          label: key,
          backgroundColor: this.chooseColor(key).concat("70"),

        })


        const options = {
          animation: false,
          scale: {
            ticks: {
              min: 0
            }
          },
          "tooltips": {}
        }

        _this.treatment_efficiency_influent_chart = {
          chartData: data_chart,
          options: options
        }

        pollutants_table.header.push({text: "Unit", value: "unit", sortable: false,})


        pollutants_table.value.push(cod)
        pollutants_table.value.push(tn)
        pollutants_table.value.push(tp)

        return pollutants_table
      } else return {header: [], emissions: []}

    },

    //Default context table
    async generate_industry_table() {

      let _this = this

      if (_this.industry !== null) {
        let table = {
          header: [
            {text: "Type", value: "type"},
              {text: "Name", value: "supplier_name"}, {
            text: "Country",
            value: "country"
          }, {text: "Latitude", value: "lat"}, {text: "Longitude", value: "lng"}, {text: "Overall water risk", value: "overall_water_risk"}],
          value: []
        }

        let arr =  [this.industry, ...this.industry.supply_chain]

       for (let supply_chain of arr){

         //calculate overall water risk index
         let owr = await utils.overall_water_risk(supply_chain.location.lat, supply_chain.location.lng)
         owr = owr.toFixed(3)
         table.value.push({
            supplier_name: supply_chain.name,
            lat: supply_chain.location.lat.toFixed(3),
            lng: supply_chain.location.lng.toFixed(3),
            country: utils.get_country_code_from_coordinates(supply_chain.location.lat, supply_chain.location.lng),
            overall_water_risk: owr
          })
        }
       return table
      } else return {header: [], value: []}

    },

  },

  created() {
    let _this = this

    this.selected_assessment = this.created_assessments[this.assessment_id].name

  },
  async mounted() {

    let _this = this

    this.assessment = this.created_assessments[this.assessment_id]
    this.industry = this.created_assessments[this.assessment_id].industries[this.industry_id]

    _this.emissions_table = _this.generate_emissions_table()
    _this.energy_use_table = _this.generate_energy_use_table()
    _this.effluent_load_table = _this.generate_effluent_load_table()

    _this.water_quantity = await _this.generate_water_quality_table()
    _this.treated_table = await _this.generate_treated_table()
    _this.freshwater_lever_for_action = await _this.generate_freshwater_lever_for_action_table()

    _this.eutrophication_table = _this.generate_eutrophication_table()
    _this.ecotoxicity_table = _this.generate_ecotoxicity_table()
    _this.treatment_efficiency_table = _this.generate_treatment_efficiency_table()
    _this.treatment_efficiency_influent_table = _this.generate_treatment_efficiency_influent_table()

    _this.eqs_table = _this.generate_eqs_table()
    _this.delta_eqs_table = await _this.generate_delta_eqs_table()
    _this.delta_ecotox_table = await _this.generate_delta_ecotox_table()

    _this.simple_report_table = await _this.generate_simple_report_table()
    _this.industry_table = await _this.generate_industry_table()
    _this.biogas_valorised_table = _this.generate_biogas_valorised_table()

    _this.ghg_ratio_table = _this.generate_ghg_ratio_table()
    _this.ghg_sludge_management_table = _this.generate_sludge_management_table()
    _this.concentration_table = await _this.generate_concentration_table()


  },

  computed: {

    //Generate context treeview
    layer_tree: function () {
      let _this = this
      let id = 1
      this.layers.forEach(category => {
        id = _this.add_identifier(category, id)  //id has the new id to add
      })

      return this.layers
    },

    //Generate impact and lever for action treeview
    indicators_industry() {
      return [
        {
          id: 1,
          name: 'Pollution',
          children: [
            {
              id: 2,
              name: 'Impact',
              children: [
                {id: 3, name: this.table_title.simple_table.delta_tu, info: "Toxic units in the receiving water body indicates if the concentration after the effluent discharge on the water body exceed the EC50, supposing the receiving water has a concentration of 0 before discharge."},
                {id: 4, name: this.table_title.simple_table.delta_eqs, info: "Increase of the concentration of the pollutants in the receiving water body after discharge (with respect to EQS), supposing the receiving water has a concentration of 0 before discharge."},
                {id: 5, name: this.table_title.simple_table.eutrophication, info: "Eutrophication potential (EP) is defined as the potential to cause over-fertilization of water and soil, which can result in increased growth of biomass. It will always have positive values; higher values indicate higher impact. It converts the pollutants to PO4 equivalent to calculate the total Eutrophication potential. "},
                {id: 6, name: this.table_title.simple_table.tu, info: "Toxic units in the effluent aims to calculate haw toxic is industry effluent for the ecosystem. To calculate Toxic units, we have used the PP concentrations values from which in 24h cause the deaths or lack of movement of 50% of Daphnia magna individuals. These values (EC50) have been extracted from different studies compiled into two different databases, the ECOTOX Knowledgebase from the United States Environmental Protection Agency (ECOTOX | Home, n.d.) and from the NORMAN Ecotoxicology Database. (NORMAN Ecotoxicology Database, n.d.)\n" +
                      "This metric has no impact categories because it calculates with respect to the industry effluent and not with respect to the water body.\n"},
                {id: 7, name: this.table_title.simple_table.eqs, info: "The Environmental Quality Standards (EQS) are the limits approved by the EU’s Water Framework Directive. The directive sets environmental quality standards for priority pollutants (PP) and eight other pollutants. These substances include the metals cadmium, lead, mercury and nickel, and their compounds; benzene; polyaromatic hydrocarbons (PAH); and several pesticides. Several of these priority substances are classed as hazardous. Each PP has a maximum allowable concentration (MAC) for inland surface waters. The metric of impact indicates if the concentration of the pollutant in the industry effluent is higher than the MAC (> 100%) or lower (< 100%). (Priority Substances - Water - Environment - European Commission, n.d.)\n" +
                      "This metric has no impact categories because it calculates with respect to the industry effluent and not with respect to the water body.  \n"},
              ]
            },
            {
              id: 8,
              name: 'Levers for action',
              children: [
                {id: 9, name: this.table_title.simple_table.avg_treatment_efficiency, info: "This metric indicates what is the percentage of pollutant load that the WWTP eliminates from the industry water."},
                {id: 10, name: this.table_title.simple_table.avg_influent_efficiency, info: "This metric indicates whether there is an improvement in water quality due to its use by the industry. If the quality of the water after treatment is better than the industry withdrawal water quality (surface water only), then the value of this metric is greater than 100. This is only calculated for COD, TN and TP when the “advanced inputs” provide a value under “Industry withdrawal water quality (surface water only)”"},
                {id: 11, name: this.table_title.simple_table.treated, info: "This metric indicates the ratio between the water remaining after the industry consumption and the water that is treated in the WWTP. "},
                {id: 12, name: 'Concentration of pollutants', info: "Concentration of pollutants in the water after treatment in the WWTP, and increase of the concentration in the receiving water body after discharge."},
              ]
            },
          ],
        },
        {
          id: 13,
          name: "Freshwater",
          children: [
            {id: 14, name: "Impact",},
            {id: 15, name: "Levers for action",}
          ]
        },
        {
          id: 16,
          name: "Carbon",
          children: [
            {id: 17, name: "Impact",},
            {
              id: 18,
              name: "Levers for action",
              children: [
                {id: 19, name: "Energy use", info: "Energy used by the industry to treat a m3 of water"},
                {id: 20, name: "Wastewater effluent concentration", info: "Concentration of pollutant discharged by the industry"},
                //{id: 21, name: "Biogenic emissions", info: "Biogenic emissions sources are emissions that come from natural sources"},
                {id: 22, name: "GHG emissions ratio", info: "Amount of CO2, CH4 and N2O during wastewater treatment process"},
                {id: 23, name: "Sludge management", info: "GHG emissions from sludge management operations (storing, composting, incineration, land application, landfilling, stockpiling and truck transport)"},
              ]
            },
          ]
        }
      ]
    },

  }

}

</script>

<style scoped>

.link_to_edit_hovered{
  color: #b62373;
  text-decoration: underline;
}
.link_to_edit{
  color: #b62373;
  text-decoration: none;
}

.side_menu_title {
  font-weight: bold;
  font-size: 18px;
  color: #b62373;

}

#assessment_tab .v-tab.v-tab--active {
  background-color: #1C195B;
  color: #F2F4F3 !important;
}

#main_tab .v-tab.v-tab--active {
  background-color: #b62373 !important;
  color: #F2F4F3 !important;
}


table {
  padding: 15px;
}

.dialog_detail {
  padding: 50px;
}

.chip_no_hover::before {
  background-color: transparent !important;
}

.icon_clickable {
  transition: all .2s ease-in-out;
}

.icon_clickable:hover {
  transform: scale(1.2);
}


.hover {
  color: #b62373;
}

.hover:hover {
  text-decoration: underline;
}
.instructions_2{
  color: grey;
  font-size: 10px;
  font-weight: bold;
  text-align: left !important;
}

.no-risk {
  background-color: white;
  border-color: #1C195B;
  border-style: solid;
  border-width: 1px;
}
.low {
  background-color: #529fee;
}
.medium {
  background-color: yellow;
}
.high {
  background-color: orange;
}
.very_high {
  background-color: red;
}

</style>






