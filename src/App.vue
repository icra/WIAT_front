<template>



  <v-app class="app">

    <!-- Header -->
    <v-app-bar
        height="70px"
        width="100%"
        absolute
        style="margin-left: 0px; margin-right: 0px; background-color: white"
    >
      <v-row style="background-color: white; width: 100%">
        <v-col cols="2" class="header">
          <a href="https://www.wbcsd.org/" target="_blank">
            <div>
              <v-icon>$wbcsd_logo</v-icon>
            </div>
          </a>
        </v-col>

        <v-col cols="8" class="header">
          <div >
            <v-hover
                v-slot="{ hover }"
            >
              <p :class="{ 'hover_header': hover }" class="center_vertically" @click="dialog_tour = true">HOW TO USE</p>
            </v-hover>
            <v-dialog
                v-model="dialog_tour"
                width="80%"
                height="80%"
                scrollable
                style="background-color: white"
            >
              <div style="background-color: white; height: 100%; width: 100%">

                <v-card flat style="padding: 40px; height: 100%;">
                  <br>
                  <video controls id="video" style="padding: 40px; width: 70%">
                    <source src="demo.mp4" type='video/mp4; codecs="avc1.42E01E, mp4a.40.2"' />
                  </video>

                  <br><br>
                  <b>Download the files used on the video and import them on the web:</b>
                  <ul>
                    <li><a href="dummy_files/dummy session.json" download>Import a previously exported session</a></li>
                    <li><a href="dummy_files/wiat_locations.xlsx" download>Upload site locations excel</a></li>
                    <li><a href="dummy_files/wiat_template.xlsx" download>Upload site data inputs excel</a></li>

                  </ul>

                </v-card>

              </div>
            </v-dialog>

          </div>

          <div>
            <v-hover
                v-slot="{ hover }"
            >
              <p :class="{ 'hover_header': hover }" class="center_vertically" @click="dialog_about = true">ABOUT US</p>
            </v-hover>

            <v-dialog
                v-model="dialog_about"
                width="700"
                scrollable
            >
              <div style="background-color: white; overflow: hidden">

                <v-card flat style="padding: 40px">
                  WIAT (Wastewater Impact Assessment Tool) v1 is a tool that allows users to understand which aspects of wastewater treatment and site management cause major changes in the state of nature related to climate, biodiversity and water security, as well as to help identify water risks and prioritize their water management interventions.
                  <br>

                  This project is part of the <a href="https://wbcsdpublications.org/wastewater-zero/" target="_blank" rel="noopener noreferrer">Wastewater Zero Commitment</a> initiative developed by the WBCSD.
                  <br>
                  <br>
                  <b>
                    Developed by
                  </b>
                  <v-img
                      max-width="400"
                      src="/developers/developers.PNG"
                  ></v-img>
                  <a href="https://www.wbcsd.org/" target="_blank" rel="noopener noreferrer">WBCSD</a> | <a href="https://www.icra.cat/" target="_blank" rel="noopener noreferrer">ICRA</a> | <a href="https://www.earthgenome.org/" target="_blank" rel="noopener noreferrer">The Earth Genome</a> | <a href="https://futureh2o.asu.edu/" target="_blank" rel="noopener noreferrer">Future H2O</a>

                  <br>
                  <br>
                  <b>
                    Working group
                  </b>
                  <v-img
                      max-width="400"
                      src="/developers/user_group.PNG"
                  ></v-img>
                  <br>
                  <a href="https://www.adityabirla.com/" target="_blank" rel="noopener noreferrer">Aditya Birla Group</a> | <a href="https://www.chevron.com/" target="_blank" rel="noopener noreferrer">Chevron Corporation</a> | <a href="https://www.dow.com/en-us.html" target="_blank" rel="noopener noreferrer">Dow Chemical Company</a> | <a href="https://www.holcim.com/" target="_blank" rel="noopener noreferrer">Holcim Group</a>


                </v-card>

              </div>
            </v-dialog>
          </div>

          <div>
            <v-hover
                v-slot="{ hover }"
            >
              <p :class="{ 'hover_header': hover }" class="center_vertically" @click="dialog_documents = true">DOCUMENTS</p>
            </v-hover>
            <v-dialog
                v-model="dialog_documents"
                width="700"
                scrollable
            >
              <div style="background-color: white; overflow: hidden">

                <v-card flat  style="padding: 40px">

                  <div style="padding: 0px 50px 0px 50px">
                    <a class="button-link" href="/WIAT Science and methods.pdf" download >
                      <v-btn small tile block color="#b62373">
                        Download methodology
                        <v-icon right>
                          mdi-cloud-download
                        </v-icon>
                      </v-btn>
                    </a>

                    <br>

                    <a class="button-link" href="/WIAT_UserGuide.pdf" download >
                      <v-btn small tile block color="#b62373">
                        DOWNLOAD USER MANUAL
                        <v-icon right>
                          mdi-cloud-download
                        </v-icon>
                      </v-btn>
                    </a>

                  </div>




                </v-card>

              </div>
            </v-dialog>
          </div>

          <div>
            <v-hover
                v-slot="{ hover }"
            >
              <p :class="{ 'hover_header': hover }" class="center_vertically" @click="dialog_contact = true">CONTACT US</p>
            </v-hover>
            <v-dialog
                v-model="dialog_contact"
                width="720"
                scrollable
            >
              <div style="background-color: white; overflow: hidden">

                <v-card flat style="padding: 40px 40px 40px 40px">
                  <iframe src="https://docs.google.com/forms/d/e/1FAIpQLSfaBsOylgrbD-NUOVAlTNYhUDJBbBUiWbVIncD0nkdANNotbA/viewform?embedded=true" width="640" height="674" frameborder="0" marginheight="0" marginwidth="0">Loading…</iframe>
                </v-card>

              </div>
            </v-dialog>

          </div>

          <div>
            <v-hover
                v-slot="{ hover }"
            >
              <p :class="{ 'hover_header': hover }" class="center_vertically" @click="dialog_legal = true">LEGAL DISCLAIMER</p>
            </v-hover>
            <v-dialog
                v-model="dialog_legal"
                width="700"
                scrollable
            >
              <div style="background-color: white; overflow: hidden">

                <v-card flat style="padding: 40px">
                  <v-row>
                    <v-col>
                      This tool has been developed in the name of WBCSD. It is the result of a collaborative effort by members of WBCSD and external agencies involved as advisory during the development of the tool. Input and feedback from stakeholders were incorporated in a balanced way. Use of and/or reliance on any data and/or information included on the WIAT tool is at User’s discretion. WBCSD and others involved in development of the tool or the sources from which data is collected make no claim, representation or warranty of any kind on the accuracy of the data/information included on the tool and shall not be held liable for incidental or consequential damages with or arising out of the furnishing, use or performance of this tool. By assessing, downloading and/or using this data/information in any manner the User agrees to assume any/all-risk with respect to use of such information.
                    </v-col>
                  </v-row>
                  <br>
                  <br>
                  <v-row justify="center">
                    <v-col style="text-align: center">
                      Copyright ©WBCSD, January 2022
                    </v-col>
                    <v-col style="text-align: center">
                      All rights reserved
                    </v-col>
                    <v-col style="text-align: center">
                      <a href="https://www.wbcsd.org/Overview/Privacy-Policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
                    </v-col>
                  </v-row>

                </v-card>

              </div>
            </v-dialog>

          </div>

        </v-col >

        <v-col cols="2" class="header">
          <div>
            <v-icon>$waste_water_zero_logo</v-icon>
          </div>
        </v-col>


      </v-row>
    </v-app-bar>

    <!-- Main sidebar (first)-->
    <v-navigation-drawer
        style="z-index:2; height: calc(100% - 70px); margin-top: 70px"
        clipped
        permanent
        width="4rem"
        app
        absolute
        disable-resize-watcher
        hide-overlay
    >

      <div class="icon_sidebar_container" style="overflow: hidden">
        <v-list height="100%">
          <div class="icon_sidebar_list">
            <v-tooltip right>
              <template v-slot:activator="{ on, attrs }">
                <div v-on="on" v-bind="attrs">
                  <v-hover v-slot:default="{ hover }">
                    <v-list-item :class="hover ? 'icon_hovered_pressed' : ''" @click="secondMenu = !secondMenu" style="height: 75px; margin-top: 25px">
                      <v-list-item-icon>
                        <v-icon color = "#F2F4F3" v-if="secondMenu" style="display: inline-block; position: relative; left: 50%; top: 50%; transform: translate(-50%, 25%);">
                          mdi-arrow-left
                        </v-icon>
                        <v-icon color = "#F2F4F3" v-else style="display: inline-block; position: relative; left: 50%; top: 50%; transform: translate(-50%, 25%);">
                          mdi-arrow-right
                        </v-icon>
                      </v-list-item-icon>
                      <v-list-item-content></v-list-item-content>
                    </v-list-item>
                  </v-hover>
                </div>

              </template>
              <span>Menu</span>
            </v-tooltip>

            <v-list-item-group>
              <v-tooltip
                  right
                  v-for="(item, index) in items"
                  :key="item.title"
              >
                <template v-slot:activator="{ on, attrs }">
                  <div v-on="on" v-bind="attrs">
                    <v-hover
                        v-slot:default="{ hover }"
                    >
                      <v-list-item
                          @click="left_side_menu_icon_selected(index)"
                          :class="(hover || icon_selected === index)? 'icon_hovered_pressed' : ''"
                          :to="{ name: item.to}"
                          style="height: 75px" :value="index"
                      >
                        <v-list-item-icon>
                          <v-icon color = "#F2F4F3" style="display: inline-block; position: relative; left: 50%; top: 50%; transform: translate(-50%, 25%);">
                            {{ item.icon }}
                          </v-icon>
                        </v-list-item-icon>
                        <v-list-item-content></v-list-item-content>
                      </v-list-item>
                    </v-hover>
                  </div>

                </template>
                <span>{{item.title}}</span>
              </v-tooltip>

            </v-list-item-group>






          </div>
        </v-list>
      </div>
    </v-navigation-drawer>

    <!-- Assessment and factory sidebar (second) -->
    <v-navigation-drawer
        style="z-index:1; background-color: #F2F4F3; left: 4rem; margin-top: 70px; height: calc(100% - 70px)"
        v-model="secondMenu"
        :width="secondMenu ? 'max(18rem, 20vw)' : '0rem'"
        app
        clipped
        disable-resize-watcher
        hide-overlay
    >
      <div style="height: 100%; display: flex; flex-flow: column; width: 100%;  overflow: hidden;  border-bottom-width: 10px">
        <div style="display: flex; justify-content: flex-end;  background-color: #1C195B; width: 100%">
          <v-icon style="margin: 5px 10px 5px 0px" color="white" @click="secondMenu = !secondMenu">mdi-close</v-icon>
        </div>

        <div style="padding: 10px; height: 95%;  display: flex; flex-flow: column; background-color: white">
          <h3 style="padding-bottom: 10px; color: #b62373">Assessment list</h3>
          <!-- <div style = "overflow-y: auto; height: 75%; max-height: 75%; width: 100%"> -->
          <div style="flex: 2; overflow-y: auto; width: 100%; position: relative; height: 100%" >

            <v-expansion-panels focusable v-model="assessment_expansion_panel" v-if="created_assessments.length > 0">
              <v-expansion-panel
                  v-for="(assessment, assessment_index ) in created_assessments"
                  :key="assessment.name"
                  @click.native.stop

              >
                <v-tooltip right>
                  <template v-slot:activator="{ on, attrs }">
                    <v-expansion-panel-header
                        disable-icon-rotate
                        style="background-color: #c4c4d4"
                        v-bind="attrs"
                        v-on="on"
                    >
                      <span>
                        <b>{{ assessment.name }}</b>
                        <span style="padding-left: 15px; font-size: 12px; font-weight: bold; color: #1C195B" v-if="assessment_index == assessment_expansion_panel">
                          CURRENT
                        </span>

                      </span>
                      <template v-slot:actions>
                        <v-tooltip bottom>
                          <template v-slot:activator="{ on, attrs }">
                            <v-hover  v-slot:default="{ hover }" style="margin-right: 10px">
                          <span>
                            <v-icon
                                v-bind="attrs"
                                v-on="on"
                                class="icon_clickable" :color="hover ? '#555283' : '#1C195B'" @click="hide_show_industries(assessment_index)" @click.native.stop
                                v-if="assessment_active[assessment_index]"
                            >

                            mdi-eye
                          </v-icon>
                            <v-icon
                                v-bind="attrs"
                                v-on="on"
                                class="icon_clickable" :color="hover ? '#555283' : '#1C195B'" @click="hide_show_industries(assessment_index)" @click.native.stop
                                v-else>
                            mdi-eye-off
                          </v-icon>

                          </span>
                            </v-hover>
                          </template>
                          <span v-if="assessment_active[assessment_index]">Hide</span>
                          <span v-else>Show</span>

                        </v-tooltip>

                        <v-tooltip bottom>
                          <template v-slot:activator="{ on, attrs }">
                            <v-hover v-slot:default="{ hover }">
                              <v-icon
                                  v-bind="attrs"
                                  v-on="on"
                                  class="icon_clickable" :color="hover ? '#555283' : '#1C195B'" @click="open_edit_assessment_tab(assessment_index)" @click.native.stop>
                                mdi-cog
                              </v-icon>
                            </v-hover>
                          </template>
                          <span>Edit assessment</span>
                        </v-tooltip>


                      </template>
                    </v-expansion-panel-header>
                  </template>
                  <span>Select assessment</span>
                </v-tooltip>
                <v-expansion-panel-content v-if="created_assessments[assessment_index].industries.length > 0" >
                  <div
                      v-for="(industry,industry_index ) in created_assessments[assessment_index].industries"
                      :key="industry.name"
                      style="width: 100%;"
                      @click = "open_edit_industry_tab(assessment_index, industry_index)"

                  >
                    <v-tooltip right>
                      <template v-slot:activator="{ on, attrs }">
                        <v-hover
                            v-slot:default="{ hover }">
                          <div style="padding: 7px 26px 7px 35px; display: flex; align-items: flex-end; width: 100%;" :class="{ 'hover_industry': hover }"
                               v-bind="attrs"
                               v-on="on"
                          >
                            <div >
                          <span>
                            {{industry.name}}
                          </span>
                              <span style="padding-left: 15px; font-size: 12px; font-weight: bold; color: #1C195B" v-if="selected_assessment == assessment_index && industry_index == selected_industry && rightMenu && right_sidebar_content">
                            CURRENT
                          </span>
                            </div>
                            <div style="flex-grow: 1; display: block;">
                              <v-icon
                                  style="float: right; margin-right: 3px; padding-bottom: 3px"
                                  color="#1C195B"
                                  size="18px"
                              >
                                mdi-factory
                              </v-icon>
                            </div>
                          </div>
                        </v-hover>

                      </template>
                      <span>Click to enter or modify data related to the industrial site</span>
                    </v-tooltip>
                  </div>
                </v-expansion-panel-content>
                <div v-if="created_assessments[assessment_index].industries.length == 0 && assessment_expansion_panel == assessment_index" style="margin: 10px 15px 10px 15px; min-width: 100px; color: #3b3b3b; font-size: 13px">
                  Click on the map to locate the industrial site for which you want to have an assessment
                </div>
              </v-expansion-panel>
            </v-expansion-panels>
            <div v-else style="margin: 0px 5px 0px 0px; min-width: 100px; color: #3b3b3b; font-size: 13px">
              Create an assessment by clicking on the button below.
            </div>

          </div>
          <div style="padding-bottom: 20px; min-width: 100px; margin-top: 10px">
            <div v-if="show_tip" style="margin-bottom: 20px; padding: 20px; border-color: #1C195B; border-size: 4px; border-style: solid; font-size: 13px">
              <div>
                Click the button below to start a new assessment. Once created, select it from the list above, and click on the map to create a site. With the site created, you can start adding site data inputs and view statistics. To see a more detailed manual, click on the "DOCUMENTS" tab (at the top of the page).
              </div>
              <v-btn
                  x-small
                  style="margin-top: 10px"
                  color="#1C195B"
                  @click="show_tip = false"
              >
                Hide tip
              </v-btn>
            </div>

            <v-btn
                style="width: 100%; "
                @click="open_create_assessment_tab"
                small block tile
                color="#b62373"
            >
              Create assessment
            </v-btn>
          </div>
        </div>

      </div>
    </v-navigation-drawer>


    <!-- Main content -->
    <div style="position: absolute; height: calc(100% - 70px); width: 100%; margin-top: 70px">
      <div class="content" :class="manageContentClass" style="overflow-y: auto;">
        <router-view :selected_assessment="assessment_expansion_panel" :selected_layer="selected_layer" :selected_industry="selected_industry" @createIndustry="createNewIndustry" @createSupplyChain="create_supply_chain" @editIndustry="open_edit_industry_tab"  @editSupplyChain="open_edit_supply_chain_tab" @selectLayer="toggleLayerSelection" @closeRightMenu="closeRightMenu" @closeLayer="applyLayer(selected_layer)" @wrongLocation="snackbars.wrong_location.v_model = true" ref="reference"></router-view>
      </div>
    </div>

    <v-navigation-drawer
        style="background-color: white; margin-top: 70px; height: calc(100% - 70px); overflow: hidden"
        v-model="rightMenu"
        :width="rightMenu ? 'max(20rem, 20vw)' : '0rem'"
        flat
        app
        right
        clipped
        disable-resize-watcher
        hide-overlay
    >

      <div style="height: 100%; overflow: hidden">
        <div style="height: 34px;  background-color: #1C195B; width: 100%" >
          <v-icon style="margin: 5px 0px 5px 10px" color="white" @click="rightMenu = !rightMenu">mdi-close</v-icon>
        </div>
        <div style=" height: 95%; overflow: hidden">

          <!-- Assessment creation -->
          <div v-if="right_sidebar_content === 1" style="margin: 7px; padding: 7px; background-color: white">
            <h3 style="color: #b62373">Create assessment</h3>
            <v-form
                ref="create_assessment_ref"
                v-model="new_assessment_valid"
            >
              <v-text-field
                  v-model="assessment_name"
                  label="Assessment name"
                  :rules="[new_assessment_rules_name, rules_required]"
              ></v-text-field>


              <v-menu
                  v-model="start_date_modal"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                      v-model="start_date_model_assessment"
                      label="Beginning of assessment period"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker
                    v-model="start_date_model_assessment"
                    @input="start_date_modal = false"
                    color="#1C195B"
                ></v-date-picker>
              </v-menu>
              <v-menu
                  v-model="end_date_modal"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                      v-model="end_date_model_assessment"
                      label="End of assessment period"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                      :rules="[assessment_date_rules]"
                  ></v-text-field>
                </template>
                <v-date-picker
                    v-model="end_date_model_assessment"
                    @input="end_date_modal = false"
                    color="#1C195B"
                ></v-date-picker>
              </v-menu>
              <v-btn
                  :disabled="!new_assessment_valid"
                  @click="create_assessment"
                  small
                  tile
                  block
                  color="#b62373"
              >
                Create assessment
              </v-btn>
            </v-form>
          </div>
          <!-- Edit assessment -->
          <div v-else-if="right_sidebar_content === 2" >
            <div style="margin: 7px; padding: 7px; background-color: white">
              <h3 style="color: #b62373">Edit assessment</h3>
              <v-form
                  v-model="new_assessment_valid"
              >
                <v-text-field
                    v-model="assessment_name"
                    :rules="[edit_assessment_rules, rules_required]"
                ></v-text-field>

                <v-menu
                    v-model="start_date_modal"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                        v-model="start_date_model_assessment"
                        label="Beginning of assessment period"
                        readonly
                        v-bind="attrs"
                        v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                      v-model="start_date_model_assessment"
                      @input="start_date_modal = false"
                      color="#1C195B"
                  ></v-date-picker>
                </v-menu>
                <v-menu
                    v-model="end_date_modal"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                        v-model="end_date_model_assessment"
                        label="End of assessment period"
                        readonly
                        v-bind="attrs"
                        v-on="on"
                        :rules="[assessment_date_rules]"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                      v-model="end_date_model_assessment"
                      @input="end_date_modal = false"
                      color="#1C195B"
                  ></v-date-picker>
                </v-menu>


                <v-btn
                    :disabled="!new_assessment_valid"
                    @click="edit_assessment"
                    small
                    tile
                    block
                    color="#b62373"
                >
                  Edit
                </v-btn>
              </v-form>
            </div>
            <div style="margin: 7px; padding: 7px;">
              <v-btn :to="{ name: 'report_prop', params: {assessment_id: this.selected_assessment}}" small tile block @click="selected_layer=null; secondMenu=false; rightMenu=false;" color="#b62373">
                Statistics
              </v-btn>

              <v-btn @click = "delete_assessment" small tile block color="#b62373">
                Delete
              </v-btn>
            </div>
          </div>
          <!-- edit industry -->
          <div v-else-if="right_sidebar_content === 3">
            <div style="margin: 7px; padding: 7px; background-color: white">
              <h3 style="color: #b62373">Edit site</h3>
              <v-form
                  v-model="new_factory_valid"
              >
                <v-text-field
                    v-model="factory_name"
                    :rules="[edit_industry_rules_name, rules_required]"
                ></v-text-field>
                <v-btn
                    :disabled="!new_factory_valid"
                    @click="edit_industry"
                    small
                    tile
                    block
                    color="#b62373"
                >
                  Rename
                </v-btn>

                <br>
              </v-form>
              <v-btn :to="{ name: 'edit_industry', params: {assessment_id: selected_assessment, industry_id: selected_industry}}" small tile block @click="selected_layer=null; secondMenu=false; rightMenu=false;" color="#b62373">
                ADD SITE DATA INPUTS
              </v-btn>
              <v-btn :to="{ name: 'statistics', params: {assessment_id: selected_assessment, industry_id: selected_industry}}" small tile block @click="selected_layer=null; secondMenu=false; rightMenu=false;" color="#b62373">
                Statistics
              </v-btn>
              <v-btn @click="delete_industry" small tile block color="#b62373">
                Delete
              </v-btn>
              <v-btn
                  block
                  tile
                  small
                  @click="add_supply_chain_industry"
                  :disabled="icon_selected != 0"
                  color="#b62373"

              >
                PLACE SUB-SUPPLIER ON THE MAP
              </v-btn>
            </div>
            <div style="margin: 7px; padding: 7px;">

              <!--<v-btn block small outlined :to="{ name: 'statistics_industry', params: {assessment_id: selected_assessment, industry_id: selected_industry}}" @click="icon_selected = -1; selected_layer=null; secondMenu=false; rightMenu=false">
                SHOW RESULTS
              </v-btn>-->

            </div>
          </div>

          <!-- Create industry -->
          <div v-else-if="right_sidebar_content === 5">
            <div style="margin: 7px; padding: 7px; background-color: white">
              <h1>New site</h1>
              <v-form
                  v-model="new_factory_valid"
              >
                <v-text-field
                    v-model="factory_name"
                    label="Site name"
                    :rules="[new_factory_rules_name, rules_required]"

                ></v-text-field>
                <v-btn
                    :disabled="!new_factory_valid"
                    @click="add_factory"
                    small
                    tile
                    block
                    color="#b62373"
                >
                  Add site
                </v-btn>
              </v-form>

            </div>

          </div>
          <!-- Search global layer -->
          <div v-else-if="right_sidebar_content === 6" style=" height: 100%; display: flex; flex-flow: column; width: 100%; padding: 10px; overflow: hidden">
            <div>
              <v-row dense>
                <v-col cols="12">
                  <v-sheet class="pa-4 search_box">
                    <v-text-field
                        v-model="search_layer_model"
                        label="Search layer"
                        dark
                        flat
                        solo-inverted
                        hide-details
                        clearable
                    ></v-text-field>

                  </v-sheet>

                </v-col>
              </v-row>
            </div>
            <!-- <div style = "overflow-y: auto; height: 75%; max-height: 75%; width: 100%"> -->
            <div style="flex: 2; overflow-y: auto; overflow-x: hidden; width: 100%; position: relative; height: 100%" >
              <v-row dense style="background-color: white">
                <v-col cols="12">
                  <div class="layer_list" style=" width: 100%;">
                    <v-treeview
                        :items="layer_tree"
                        dense
                        hoverable
                        activatable
                        selection-type="leaf"
                        return-object
                        open-on-click
                        color="#1C195B"
                        clear-icon="mdi-close-circle-outline"
                        :search="search_layer_model"
                        :active.sync = "actived_layers"
                        :open.sync = "opened_layers"

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

                        <v-icon v-if="selected_layer === item.name && item.layer" color='#1C195B'>
                          mdi-layers-remove
                        </v-icon>
                        <v-icon v-else-if="item.layer" color='#1C195B'>
                          mdi-layers-plus
                        </v-icon>

                      </template>
                    </v-treeview>

                  </div>

                </v-col>
              </v-row>

            </div>


          </div>
          <!-- Create supply chain industry -->
          <div v-else-if="right_sidebar_content === 7">
            <div style="margin: 7px; padding: 7px; background-color: white">
              <h3 style="color: #b62373">Sub-supplier</h3>
              <v-form
                  v-model="new_supply_chain_valid"
              >
                <v-text-field
                    v-model="supply_chain_name"
                    label="Sub-supplier name"
                    :rules="[new_supply_chain_rules_name, rules_required]"

                ></v-text-field>
                <v-btn
                    :disabled="!new_supply_chain_valid"
                    @click="add_supply_chain"
                    small
                    tile
                    block
                    color="#b62373"
                >
                  Add sub-supplier
                </v-btn>
              </v-form>

            </div>

          </div>
          <!-- Edit supply chain industry -->
          <div v-else-if="right_sidebar_content === 8">
            <div style="margin: 7px; padding: 7px; background-color: white">
              <h3 style="color: #b62373">Edit sub-supplier (from site {{ factory_name }})</h3>
              <v-form
                  v-model="new_supply_chain_valid"
              >
                <v-text-field
                    v-model="supply_chain_name"
                    :rules="[new_supply_chain_rules_name, rules_required]"
                ></v-text-field>
                <v-btn
                    :disabled="!new_supply_chain_valid"
                    @click="edit_supply_chain"
                    small
                    tile
                    block
                    color="#b62373"
                >
                  Rename
                </v-btn>

                <br>
              </v-form>
              <v-btn @click="delete_supply_chain" small tile block color="#b62373">
                Delete
              </v-btn>
            </div>

          </div>


        </div>

      </div>
    </v-navigation-drawer>

    <!-- Snackbars -->
    <v-snackbar
        v-for="[key, snackbar] in Object.entries(snackbars)"
        :key="key"
        v-model="snackbar.v_model"
        :timeout="2000"
    >
      {{ snackbar.text }}
      <template v-slot:action="{ attrs }">
        <v-btn
            color="pink"
            text
            v-bind="attrs"
            @click="snackbar.v_model = false"
        >
          CLOSE
        </v-btn>
      </template>
    </v-snackbar>

  </v-app>
</template>

<script>
import {Assessment, Industry } from "./ecam_backend";
import Vue from "vue";
export default {
  data () {
    return {
      show_tip: true,
      tab: null,
      dialog: false,
      secondMenu: true, //Assessment/factory sidebar
      rightMenu: false, //Assessment/Company creation sidebar
      items: [  //Icons for the main sidebar
        { title: "Maps and Datasets", icon: 'mdi-map', to:"map" },
        { title: "Import/Export", icon: 'mdi-import', to:"import"},
        { title: "Report", icon: 'mdi-file-chart', to:"report" },
        { title: "Parameter configuration", icon: 'mdi-cog', to:"general_configuration" },

      ],
      created_assessments: this.$assessments,  //Created assessments
      assessment_name: null,     //V-model name for creating/editing an assessment
      new_assessment_valid: false,  //Enable or disable button for creating new assessment
      right_sidebar_content: null,  //Content of the right sidebar: 1->create assessment, 2->edit assessment, 3->edit industry, 4->map info
      selected_assessment: null,  //Id of the assessment to edit
      factory_name: null, //v-model for creating new factory
      new_factory_valid: false, //Enable or disable button for creating new factory

      selected_industry: null, //Id of the company to edit
      selected_sc: null, //Id of the supply chain to edit

      snackbars: {
        new_assessment: {v_model: false, text: "New assessment created correctly", },
        edit_assessment: {v_model: false, text: "Assessment edited correctly", },
        delete_assessment: {v_model: false, text: "Assessment deleted correctly", },
        new_industry: {v_model: false, text: "New site added correctly", },
        edit_industry: {v_model: false, text: "Site edited correctly", },
        delete_industry: {v_model: false, text: "Site deleted correctly", },
        delete_sc: {v_model: false, text: "Sub-supplier deleted correctly", },
        assessment_not_selected: {v_model: false, text: "Can't create site, please select and assessment first", },
        create_industry_not_in_map: {v_model: false, text: "Can't create site, please return to the map tab and try again", },
        place_supply_chain: {v_model: false, text: "Please, indicate the location of the Sub-supplier on the map"},
        new_supply_chain: {v_model: false, text: "New sub-supplier added", },
        wrong_location: {v_model: false, text: "Please select a valid location", },
        edit_sc: {v_model: false, text: "sub-supplier edited correctly", },


      },
      map_content_info: {}, //Info to show when the map is clicked
      assessment_expansion_panel: undefined, //Selected assessment in expansion panel
      latlng_selected: null, //Coordinates of point in the map
      icon_selected: 0, //first sidebar icon selected
      assessment_active: this.$assessment_active, //if assessment_active[i]=true, industries of the i-th assessment are shown on the map
      selected_layer: null,  //Layer displayed in the map
      layers_description: this.$layers_description,
      search_layer_model: "",
      start_date_model_assessment: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10),
      start_date_modal: false,
      end_date_model_assessment: new Date(new Date().setFullYear((new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).getFullYear() + 1)).toISOString().substr(0, 10),
      end_date_modal: false,
      actived_layers: [],
      opened_layers: [],
      new_supply_chain_valid: false,
      supply_chain_name: null,
      supply_chain_marker: null,
      dialog_tour: false,
      dialog_about: false,
      dialog_documents: false,
      dialog_contact: false,
      dialog_legal: false
    }
  },

  beforeCreate() {
    if(!Vue.prototype.$first_page_loaded) {
      this.$router.push({name: 'map'})
    }
  },

  created() {
    document.title = "WIAT";
    window.addEventListener('beforeunload', e => this.beforeunloadFn(e))

    // if new content is available, reload the page
    if (process.env.NODE_ENV === 'production') {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function (registrations) {
          for (let registration of registrations) {
            registration.update()
          }
        })
      }
    }
  },

  watch: {
    //If opened, sets video tutorial under "how to use" to the beginning
    dialog_tour: function(opened){
      if(!opened){
        let video = document.querySelector("#video");
        video.pause()
        video.currentTime = 0;
      }
    },

    //When the selected assessment changes, if the user was adding a supply chain or industry form another assessment, the operation is cancelled
    assessment_expansion_panel: function(assessment){
      try {
        this.$refs.reference.close_supply_chain_mode()
        this.$refs.reference.industry_created()

      } catch (error) {}
    },

    //Change index (first side bar) uf URL changes
    '$route' (to, from){
      let page = to.name
      let index = 0
      if(page == "map") index = 0
      else if(page == "import") index = 1
      else if(page == "report") index = 2
      else if(page == "general_configuration") index = 3
      else index = -1
      this.icon_selected = index

      if(from.name == "map"){
        this.actived_layers.splice(0, this.actived_layers.length)
        this.opened_layers.splice(0, this.opened_layers.length)
      }

    }
  },

  methods: {
    //Call function from map component
    add_supply_chain_industry(){
      try {
        this.$refs.reference.enter_supply_chain_mode()
        this.rightMenu = false
        this.snackbars.place_supply_chain.v_model = true
      } catch (error) {}
    },

    create_supply_chain(latlng){
      this.supply_chain_marker = latlng
      this.right_sidebar_content = 7
      this.supply_chain_name = null
      this.rightMenu = true

    },

    add_supply_chain(){
      let _this = this
      let supply_chain = {
        name: _this.supply_chain_name,
        location: _this.supply_chain_marker
      }
      let industry = this.created_assessments[this.assessment_expansion_panel].industries[this.selected_industry]
      industry.add_industry_to_supply_chain(supply_chain)
      this.rightMenu = false
      this.snackbars.new_supply_chain.v_model = true

      let marker = {
        isSupplyChain: true,
        latlng: _this.supply_chain_marker,
        industry_coords: industry.location,
        assessment: this.assessment_expansion_panel,
        industry: this.selected_industry,
        supply_chain: industry.supply_chain.length - 1
      }

      _this.$location_markers.push(marker)


      try {
        this.$refs.reference.close_supply_chain_mode()
        this.$refs.reference.industry_created()

      } catch (error) {}

      this.open_edit_industry_tab(this.assessment_expansion_panel, this.selected_industry)

    },



    beforeunloadFn(){
      event.preventDefault()
      event.returnValue = ""
    },

    //Global layer selected
    layerTreeSelected(nodeLayer){
      if(nodeLayer.length > 0) this.applyLayer(nodeLayer[0].name)
      else this.applyLayer(this.selected_layer)
    },

    //Auxiliar function for creating global layers tree selector
    add_identifier: function (category, id){
      let _this = this
      category.id = id
      id++

      if(category.hasOwnProperty("children")){
        category.children.forEach(subcategory => {
          id = _this.add_identifier(subcategory, id)
        })

      }

      return id
    },

    //Clicked icon on first sidebar menu
    left_side_menu_icon_selected(index){
      this.selected_layer=null;
      this.secondMenu=false;
      this.rightMenu=false;
      if (index == 0) this.update_markers()
      if (this.icon_selected !== 0 && this.right_sidebar_content === 6) this.rightMenu=false  //Close layer selection menu if map is not active
    },

    //Apply or remove clicked global layer
    applyLayer(key){  //Selected layer to apply
      if (this.selected_layer === key){
        this.actived_layers.splice(0,this.actived_layers.length)
        this.selected_layer = null
      }
      else {
        this.selected_layer = key
      }
    },

    //Update markers from map
    update_markers(){
      let _this = this
      this.$location_markers.splice(0,this.$location_markers.length)
      for (let assessment=0; assessment<_this.$assessments.length; assessment++) {
        if(_this.assessment_active[assessment]){
          for(let industry=0; industry<_this.$assessments[assessment].industries.length; industry++){
            let marker = {
              assessment: assessment,
              industry: industry,
              latlng: _this.$assessments[assessment].industries[industry].location
            }
            _this.$location_markers.push(marker)

            //Adding supply chain
            let _industry = _this.$assessments[assessment].industries[industry]
            for(let sc=0; sc<_industry.supply_chain.length; sc++){
              let sc_obj = _industry.supply_chain[sc]
              marker = {
                isSupplyChain: true,
                latlng: sc_obj.location,
                //name: "<b>"+sp.name+"</b> (supply chain of "+_industry.name+")",
                industry_coords: _industry.location,
                assessment: assessment,
                industry: industry,
                supply_chain: sc
              }
              _this.$location_markers.push(marker)

            }

          }
        }
      }
    },
    toggleLayerSelection(){ //Open or close layer selection menu
      if(this.right_sidebar_content === 6 && this.rightMenu) this.rightMenu = false
      else{
        this.right_sidebar_content = 6
        this.rightMenu = true
      }
    },

    closeRightMenu(){ //Close layer selection menu
      this.rightMenu = false
    },


    createNewIndustry(latlng){  //Function called from Map component
      if(this.assessment_expansion_panel === undefined){
        this.snackbars.assessment_not_selected.v_model = true
      }else{
        this.rightMenu = true
        this.right_sidebar_content = 5;
        this.factory_name = null
        this.latlng_selected = latlng
      }
    },
    create_assessment() {
      let new_assessment = new Assessment()
      new_assessment.name = this.assessment_name

      new_assessment.assessment_period_start = this.start_date_model_assessment
      new_assessment.assessment_period_end   = this.end_date_model_assessment

      this.start_date_model_assessment = (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10)
      this.end_date_model_assessment   = new Date(new Date().setFullYear((new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).getFullYear() + 1)).toISOString().substr(0, 10)
      this.assessment_name = null

      this.$assessments.push(new_assessment)
      this.rightMenu = !this.rightMenu
      this.snackbars.new_assessment.v_model = true
      this.assessment_active.push(true)
      this.assessment_expansion_panel = this.selected_assessment = this.$assessments.length - 1

      try {
        this.$refs.reference.close_supply_chain_mode()
      }catch (error) {}


    },


    open_create_assessment_tab(){
      this.rightMenu = true;
      this.right_sidebar_content = 1;
      this.assessment_name = null
      this.start_date_model_assessment = (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10)
      this.end_date_model_assessment   = new Date(new Date().setFullYear((new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).getFullYear() + 1)).toISOString().substr(0, 10)

    },
    open_edit_assessment_tab(assessment_index){
      this.rightMenu = true;
      this.right_sidebar_content = 2;
      this.selected_assessment = assessment_index
      this.assessment_name = this.created_assessments[assessment_index].name
      this.start_date_model_assessment = this.created_assessments[assessment_index].assessment_period_start
      this.end_date_model_assessment = this.created_assessments[assessment_index].assessment_period_end
      try {
        this.$refs.reference.close_supply_chain_mode()
      }catch (error) {}

    },
    edit_assessment(){
      this.rightMenu = false
      this.$assessments[this.selected_assessment].name = this.assessment_name
      this.$assessments[this.selected_assessment].assessment_period_start = this.start_date_model_assessment
      this.$assessments[this.selected_assessment].assessment_period_end   = this.end_date_model_assessment
      this.start_date_model_assessment = (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10)
      this.end_date_model_assessment   = new Date(new Date().setFullYear((new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).getFullYear() + 1)).toISOString().substr(0, 10)
      this.assessment_name = null

      this.snackbars.edit_assessment.v_model = true
    },
    delete_assessment(){
      this.rightMenu = false
      this.snackbars.delete_assessment.v_model = true
      this.$assessments.splice(this.selected_assessment, 1)
      this.assessment_active.splice(this.selected_assessment, 1)
      this.update_markers()
      try {
        this.$refs.reference.industries_deleted()
      } catch (error) {}
    },
    add_factory(){
      if(this.icon_selected === 0){
        let industry = new Industry()
        industry.name = this.factory_name
        industry.location = this.latlng_selected
        let assessment = this.$assessments[this.assessment_expansion_panel]
        let marker = {
          assessment: this.assessment_expansion_panel,
          industry: assessment.industries.length,
          latlng: this.latlng_selected
        }
        this.$location_markers.push(marker)
        assessment.add_industry(industry)
        this.snackbars.new_industry.v_model = true
        this.$refs.reference.industry_created()
        this.secondMenu = false
        this.open_edit_industry_tab(this.assessment_expansion_panel, assessment.industries.length-1)
      }else {
        this.snackbars.create_industry_not_in_map.v_model = true
      }
      //this.rightMenu = false
      //this.factory_name = null

    },
    open_edit_industry_tab(assessment_index, industry_index){
      this.right_sidebar_content = 3
      this.rightMenu = true
      this.factory_name = this.created_assessments[assessment_index].industries[industry_index].name
      this.selected_assessment = assessment_index
      this.selected_industry = industry_index
      this.assessment_expansion_panel = assessment_index

      try {
        this.$refs.reference.pan_location(this.created_assessments[assessment_index].industries[industry_index].location)
        this.$refs.reference.close_supply_chain_mode()
      } catch (error) {}
    },
    open_edit_supply_chain_tab(assessment_index, industry_index, sc_index){
      this.right_sidebar_content = 8
      this.rightMenu = true
      this.factory_name = this.created_assessments[assessment_index].industries[industry_index].name
      this.selected_assessment = assessment_index
      this.selected_industry = industry_index
      this.selected_sc = sc_index
      this.assessment_expansion_panel = assessment_index
      this.supply_chain_name = this.created_assessments[assessment_index].industries[industry_index].supply_chain[sc_index].name
      try {
        this.$refs.reference.pan_location(this.created_assessments[assessment_index].industries[industry_index].supply_chain[sc_index].location)
        this.$refs.reference.close_supply_chain_mode()
      } catch (error) {}
    },

    edit_industry(){
      this.rightMenu = false
      this.$assessments[this.selected_assessment].industries[this.selected_industry].name = this.factory_name
      this.snackbars.edit_industry.v_model = true
    },
    edit_supply_chain(){
      this.rightMenu = false
      this.$assessments[this.selected_assessment].industries[this.selected_industry].supply_chain[this.selected_sc].name = this.supply_chain_name
      this.snackbars.edit_sc.v_model = true
    },
    delete_industry(){
      this.rightMenu = false
      this.snackbars.delete_industry.v_model = true


      this.$assessments[this.selected_assessment].delete_industry(this.selected_industry)
      this.update_markers()
      try {
        this.$refs.reference.industries_deleted()
      } catch (error) {}
    },
    delete_supply_chain(){
      this.rightMenu = false
      this.snackbars.delete_sc.v_model = true
      this.$assessments[this.selected_assessment].industries[this.selected_industry].delete_supply_chain(this.selected_sc)
      this.update_markers()
      /*try {
        this.$refs.reference.industries_deleted()
      } catch (error) {}*/
    },

    new_factory_rules_name(value) {  //Rules for creating new industry
      let factories_with_same_name = this.created_assessments[this.assessment_expansion_panel].industries.filter(company => {
        return company.name === value
      })
      if (factories_with_same_name.length === 0) return true
      else return 'A site with same name already exists. '
    },
    new_supply_chain_rules_name(value){

      if (this.created_assessments[this.assessment_expansion_panel].industries[this.selected_industry].supply_chain.filter(industry => {
        return industry.name == value
      }).length === 0) return true
      else return "Sub-supplier with same name already exists"
    },
    rules_required(value) {
      if(!!value) return true
      else return 'Required.'
    },
    edit_industry_rules_name(value){ //Rules for editing industry
      return this.new_factory_rules_name(value)
    },


    new_assessment_rules_name(value){//Rules for creating new assessment
      let assessments_with_same_name = this.created_assessments.filter(assessment => {
        return assessment.name === value
      })
      if (assessments_with_same_name.length === 0) return true
      else return 'An assessment with same name already exists.'
    },
    edit_assessment_rules(value){//Rules for editing assessment
      let assessments_with_same_name = this.created_assessments.filter(assessment => {
        return assessment.name === value
      })
      if (assessments_with_same_name.length === 0 || (assessments_with_same_name.length === 1 && this.created_assessments[this.selected_assessment].name === value)) return true
      else return 'An assessment with same name already exists.' //If there is an assessment with the same name, must be the edited assessment
    },

    //Hide/show markers in map
    hide_show_industries(assessment_index){
      this.assessment_active[assessment_index] = !this.assessment_active[assessment_index] //hide/show industries of the assessment

      if(this.assessment_active[assessment_index]){
        //show assessment
        this.update_markers()
      }else{
        //hide assessment
        let location_markers = this.$location_markers
        for (let i = location_markers.length - 1; i >= 0; i--) {
          if (location_markers[i].assessment === assessment_index) {
            location_markers.splice(i, 1);
          }
        }
      }

      try {
        this.$refs.reference.close_supply_chain_mode()
      }catch (error) {}
    },
    assessment_date_rules(finish_date){
      if(finish_date>this.start_date_model_assessment) return true
      else return "End date must be after beginning date"
    }
  },
  computed: {

    //Generate global layers selector tree
    layer_tree: function () {
      let _this = this
      let id = 1
      this.layers_description.forEach(category => {
        id = _this.add_identifier(category, id)  //id has the new id to add
      })

      return this.layers_description
    },

    //Apply css classes depending on side menus opened
    manageContentClass: function(){
      //Right sidebar is the right lateral menu (except for the layer selection menu, which is map_sidebar)
      return {
        'left_sidebar_opened': this.secondMenu,
        'right_sidebar_opened': this.rightMenu && !this.secondMenu && this.right_sidebar_content != 6,
        'zero_sidebar_opened': !this.rightMenu && !this.secondMenu,
        'map_and_left_opened': this.rightMenu && this.secondMenu && this.right_sidebar_content == 6,
        'map_sidebar_opened': this.rightMenu && !this.secondMenu && this.right_sidebar_content == 6,
      }
    },
  }
}
</script>

<style>


@import url('https://use.typekit.net/eud5bih.css');


html {
  overflow: hidden !important;
  scrollbar-width: none;
  -ms-overflow-style: none;
  width: 100%;
  height:100%;
  color: white;
}
html::-webkit-scrollbar {
  width: 0;
  height: 0;
}


.zero_sidebar_opened{
  left: 4rem;
  width: calc(100% - 4rem);
  transition: 0.3s;
}
.left_sidebar_opened{
  left: calc(4rem + max(18rem, 20vw));
  width: calc(100% - 4rem - max(18rem, 20vw));
  transition: 0.3s;
}
.right_sidebar_opened{
  left: 4rem;
  width: calc(100% - 4rem);
  transition: 0.3s;
}
.map_and_left_opened{
  left: calc(4rem + max(18rem, 20vw));
  width: calc(100% - 4rem -  max(18rem, 20vw) - max(20rem, 20vw));
  transition: 0.3s;
}
.map_sidebar_opened{
  left: 4rem;
  width: calc(100% - 4rem - max(20rem, 20vw));
  transition: 0.3s;
}

.header{
  background-color: white;
  width: 100%;
  display: flex;
  align-items: center;
  align-content: center;
  justify-content: space-evenly;
}
.icon_sidebar_container {
  background-color: #1C195B;
  height: 100%;
}
.icon_sidebar_list {
  height: 100%;
}
.content{
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  position: absolute;

}
.icon_hovered_pressed{
  background-color: #555283;
}
#app {
  background-color: #F2F4F3;
}
#app{
  width: 100%;
}
.layer_list{
  overflow: auto;
  width: 100%;
  flex: 2;  /* 1 and it will fill whole space left if no flex value are set to other children*/
}


.v-treeview-node__content, .v-treeview-node__label {
  flex-shrink: 1;
  word-break: normal;
  white-space: normal !important;
}
.v-treeview-node__root {
  height: auto;
}

.search_box {
  background-color: #1C195B !important;
  border-color: #1C195B !important;
}

.v-expansion-panel-content__wrap {
  padding: unset !important;
  flex: 1 1 auto;
  width: 100%;
}

.hover_industry{
  background-color: #f0f2f1;
  transition: 0.3s;
  cursor: pointer;

}

.app{
  font-family: "aktiv-grotesk", "Helvetica Neue", Helvetica, Arial, sans-serif !important;
}

.button-link{
  text-decoration: none;
}

.v-tab{
  border-color: #1C195B;
  border-width: 0px;
  border-bottom-width: 2px;
  border-style: solid;
}
.v-tab.v-tab--active{
  background-color: #1C195B;
  color: #F2F4F3 !important;
}

.v-btn__content{
  color: white !important;
}
v-btn--disabled{
  color: rgba(0, 0, 0, 0.12) !important
}

.center_vertically{
  margin: 0;
  position: absolute;
  top: 50%;
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
  padding-right: 50px;
  color: #1C195B;
  font-weight: bold;
  text-align: center;

}

.hover_header{
  text-decoration: underline;
  color: #b62373;
}

.v-icon__component {
  height: 45px !important;
  width: 300px !important;
}

.icon_clickable {
  transition: all .2s ease-in-out;
}

.icon_clickable:hover{
  transform: scale(1.2);
}



.v-picker--date .v-btn__content {
  color: #646464 !important ;
}

.v-picker--date .v-btn--active .v-btn__content {
  color: white !important ;
}




</style>