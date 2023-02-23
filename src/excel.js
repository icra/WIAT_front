import * as Excel from "exceljs";
import Vue from "vue";
import {Assessment, Industry} from "@/ecam_backend";
import * as moment from "moment";
import {utils} from "@/utils";
import standard_industries_classification from "@/standard_industrial_classification";
import {level_of_certainty} from "@/level_of_certainty";



let created_assessments = Vue.prototype.$assessments
let assessment_active = Vue.prototype.$assessment_active
let pollutants_added_by_user = null

function parse_excel(file){
    if(file != null){
        const wb = new Excel.Workbook();
        const reader = new FileReader()

        let assessments = []
        let industries = []

        return new Promise((resolve, reject) => {
            reader.onload = () => {
                const buffer = reader.result;
                wb.xlsx.load(buffer).then(workbook => {
                    workbook.eachSheet((sheet, id) => {
                        if(id == 1){    //assessments
                            sheet.eachRow((row, rowIndex) => {
                                if(rowIndex >= 4){
                                    let assessment_name = row.getCell(1).value
                                    if(assessment_name != null){
                                        let assessment_beginning = row.getCell(2).value
                                        let assessment_end = row.getCell(3).value
                                        assessments.push({
                                            name: assessment_name,
                                            beginning: assessment_beginning,
                                            end: assessment_end
                                        })
                                    }

                                }
                            })
                        } else if (id == 2) { //industries
                            sheet.eachRow((row, rowIndex) => {

                                if (rowIndex >= 4){
                                    let assessment_industry = row.getCell(1).value
                                    if (assessment_industry != null){
                                        let industry_name = row.getCell(2).value
                                        let industry_latitude = row.getCell(3).value
                                        let industry_longitude = row.getCell(4).value

                                        let suppliers = []

                                        if (row.values.length > 4){
                                            //array elements in chunks of 3 (get name, lat and long of supplier
                                            for (let i = 5; i < row.values.length; i+=3){
                                                suppliers.push({
                                                    name: row.getCell(i).value,
                                                    latitude: row.getCell(i+1).value,
                                                    longitude: row.getCell(i+2).value
                                                })
                                            }
                                        }

                                        industries.push({
                                            assessment: assessment_industry,
                                            name: industry_name,
                                            location: {
                                                latitude: industry_latitude,
                                                longitude: industry_longitude
                                            },
                                            suppliers: suppliers
                                        })
                                    }

                                }

                            })
                        }
                    })
                    resolve([assessments, industries])

                })

            }

            reader.readAsArrayBuffer(file)

        })


    }
}

function parse_assessments(assessments){

    for (let assessment of assessments){
        let assessment_name = assessment.name
        let assessment_beginning = assessment.beginning
        let assessment_end = assessment.end

        /*let new_assessment = new Assessment()
        new_assessment.name = this.assessment_name

        new_assessment.assessment_period_start = this.start_date_model_assessment
        new_assessment.assessment_period_end   = this.end_date_model_assessment*/

        //If there is an assessment with the same name like the one we are adding, delete the older one

        let assessment_to_delete = created_assessments.findIndex(a => a.name === assessment_name)
        if (assessment_to_delete > -1) {
            created_assessments.splice(assessment_to_delete,1);
            assessment_active.splice(assessment_to_delete,1);
        }

        let new_assessment = new Assessment()
        new_assessment.name = assessment_name

        let formats = ["MM/DD/YYYY", "MM-DD-YYYY", "YYYY-MM-DD"];
        if(!moment(assessment_beginning, formats, true).isValid() || !moment(assessment_end, formats, true).isValid()){
            throw "DATE FORMAT OF ASSESSMENT "+assessment_name+" INVALID"
        }


        if(moment(assessment_end) <= moment(assessment_beginning)) throw "END DATE OF ASSESSMENT "+assessment_name+" MUST BE AFTER BEGINNING DATE"
        new_assessment.assessment_period_start = moment(assessment_beginning, formats).format("YYYY-MM-DD")
        new_assessment.assessment_period_end = moment(assessment_end, formats).format("YYYY-MM-DD")
        created_assessments.push(new_assessment)
        assessment_active.push(true)

    }
}

function parse_industry_locations(industries){
    for (let industry of industries){
        let industry_name = industry.name
        let industry_latitude = industry.location.latitude
        let industry_longitude = industry.location.longitude
        let industry_assessment = industry.assessment
        let suppliers = industry.suppliers

        let assessment = created_assessments.find(a => a.name === industry_assessment)
        if (assessment == null){
            throw "INDUSTRY "+industry_name+" PLACED IN NON EXISTING ASSESSMENT"
        }
        if(industry_latitude == null || industry_longitude == null){
            throw "INDUSTRY "+industry_name+" HAS NO LOCATION"
        }

        //check if location is valid
        if(utils.get_country_code_from_coordinates(industry_latitude, industry_longitude) == null) throw new Error('COORDINATES OF INDUSTRY '+industry_name+' NOT VALID')

        let industry_to_delete = assessment.industries.findIndex(i => i.name === industry_name)
        if (industry_to_delete > -1) {
            assessment.industries.splice(industry_to_delete,1);
        }
        let new_industry = new Industry()
        new_industry.name = industry_name
        new_industry.location = {
            lat: industry_latitude,
            lng: industry_longitude
        }

        for (let supplier of suppliers){
            let supplier_name = supplier.name
            let supplier_latitude = supplier.latitude
            let supplier_longitude = supplier.longitude

            if(supplier_name == null || supplier_latitude == null || supplier_longitude == null){
                throw supplier_name+" MISSING FIELDS"
            }
            //check if location is valid
            if(utils.get_country_code_from_coordinates(supplier_latitude, supplier_longitude) == null) throw new Error('COORDINATES OF SUPPLIER '+supplier_name+' NOT VALID')

            let new_supplier = {
                name: supplier_name,
                location: {
                    lat: supplier_latitude,
                    lng: supplier_longitude
                }
            }

            //Delete supplier if it already exists
            let supplier_to_delete = new_industry.supply_chain.findIndex(s => s.name === supplier_name)
            if (supplier_to_delete > -1) {
                new_industry.supply_chain.splice(supplier_to_delete,1);
            }

            new_industry.supply_chain.push(new_supplier)
        }


        assessment.industries.push(new_industry)
    }
}

function parse_value(i, sheet, industry, stage, key, stepper_model, is_string = false, mandatory = false){
    let sheet_name = sheet.name
    let raw = sheet.getRow(i).getCell(5).value
    let value = 0

    if (raw == null){
        if (mandatory) throw "MISSING VALUE IN SHEET "+sheet_name+" ROW "+i
        else if (is_string) value = "tonnes"
        else value = 0
    }
    if (isNaN(raw) && is_string) value = raw
    else if (isNaN(raw) && !is_string) throw "INVALID VALUE IN SHEET "+sheet_name+" ROW "+i
    else{
        let parsed = parseInt(raw)

        //check if is int or float
        if(isNaN(parsed)){
            parsed = parseFloat(raw)
            if (isNaN(parsed) && is_string) value = raw
            else throw "INVALID VALUE IN SHEET "+sheet_name+" ROW "+i
        }
        value = parsed
    }
    stage[key] = value

    parse_level_of_certainty_row(i, sheet, industry, stage, stepper_model, key, null)

}

//sets given level of certainty value to the given key
function parse_level_of_certainty(industry, stage, stepper_model, key, level_of_certainty_value, pollutant=null){

    if (level_of_certainty.keys_without_level_of_certainty.has(key)) return

    if (level_of_certainty_value == null) {
        level_of_certainty.update_level_of_certainty(industry, stage, stepper_model, key, pollutant)
    } else {
        if (pollutant == null){
            stage.level_of_certainty[key] = level_of_certainty_value
        }
        else{
            stage.level_of_certainty[key][pollutant] = level_of_certainty_value
        }
    }
}

let _parse_level_of_certainty = function(sheet, level_of_certainty){
    if (level_of_certainty == null) return null
    else if(level_of_certainty === 0) return "no_data"
    else if(level_of_certainty === 1) return "modeled"
    else if(level_of_certainty === 2) return "estimated"
    else if(level_of_certainty === 3) return "user_data"
    throw "INVALID LEVEL OF CERTAINTY IN SHEET "+sheet.name+" ROW "+i
}

//Read excel row and parses all level of certainty values (more than one if pollutant is not null)
function parse_level_of_certainty_row(i, sheet, industry, stage, stepper_model, key, pollutant=null){

    if (pollutant == null){
        let level_of_certainty = sheet.getRow(i).getCell(6).value
        parse_level_of_certainty(industry, stage, stepper_model, key, _parse_level_of_certainty(sheet, level_of_certainty), pollutant)
    }

}

function parse_yes_no(i, sheet, mandatory = false){
    let sheet_name = sheet.name
    let raw = sheet.getRow(i).getCell(5).value

    if (raw == null){
        if (mandatory) throw "MISSING VALUE IN SHEET "+sheet_name+" ROW "+i
        else return 0
    }
    if (raw.toLowerCase() === "yes") return 1
    else if (raw.toLowerCase() === "no") return 0
    else throw "INVALID VALUE IN SHEET "+sheet_name+" ROW "+i
}

function parse_industry_type(i, sheet, mandatory = false){
    let sheet_name = sheet.name
    let raw = sheet.getRow(i).getCell(5).value

    if (raw == null){
        if (mandatory) throw "MISSING VALUE IN SHEET "+sheet_name+" ROW "+i
        else return 0
    }
    let industry_type = standard_industries_classification.find(classification => {
        return classification.text == raw
    }).value
    if (industry_type == null) throw "INVALID VALUE IN SHEET "+sheet_name+" ROW "+i
    return industry_type
}

function parse_wwtp_type(i, sheet, mandatory = false){
    let sheet_name = sheet.name
    let raw = sheet.getRow(i).getCell(5).value

    if (raw == null){
        if (mandatory) throw "MISSING VALUE IN SHEET "+sheet_name+" ROW "+i
        else return 0
    }
    else if (raw.toLowerCase() === "untreated systems") return 0
    else if (raw.toLowerCase() === "primary") return 1
    else if (raw.toLowerCase() === "primary+secondary") return 2
    else if (raw.toLowerCase() === "primary+secondary+tertiary") return 3
    else throw "INVALID VALUE IN SHEET "+sheet_name+" ROW "+i
}

function parse_discharge_same_watershed(i, sheet, mandatory = false){
    let sheet_name = sheet.name
    let raw = sheet.getRow(i).getCell(5).value

    if (raw == null){
        if (mandatory) throw "MISSING VALUE IN SHEET "+sheet_name+" ROW "+i
        else return 0
    }
    else if (raw.toLowerCase() === "different watershed") return 0
    else if (raw.toLowerCase() === "same watershed") return 1
    else if (raw.toLowerCase() === "ocean discharges") return 2
    else throw "INVALID VALUE IN SHEET "+sheet_name+" ROW "+i
}

function parse_fuel(i, sheet, mandatory = false){
    let sheet_name = sheet.name
    let raw = sheet.getRow(i).getCell(5).value

    if (raw == null){
        if (mandatory) throw "MISSING VALUE IN SHEET "+sheet_name+" ROW "+i
        else return 0
    }
    else if (raw.toLowerCase() === "diesel") return 0
    else if (raw.toLowerCase() === "gasoline") return 1
    else if (raw.toLowerCase() === "natural gas") return 2
    else throw "INVALID VALUE IN SHEET "+sheet_name+" ROW "+i
}

function parse_selected_pollutants(i, sheet, add_mandatory_pollutants=true){
    let row = sheet.getRow(i).values

    //get from 5th to last in array
    let raw = row.slice(5, row.length)

    if (add_mandatory_pollutants){
        //Add default pollutants if not present
        for(let pollutant of ["COD", "TN", "TP"]){
            if (!raw.includes(pollutant)) raw.push(pollutant)
        }
    }

    utils.add_pollutants_to_conversion_factors(raw)
    return raw
}

function parse_pollutants(i, sheet, industry, stage, key, stepper_model){


    let all_pollutants = industry.pollutants_selected

    let row = sheet.getRow(i).values
    let raw = row.slice(5, row.length)
    //if(raw.length % 2 != 0) throw new Error("Invalid number of values in row "+i+" of sheet "+sheet.name)

    let obj = {}

    //loop through pollutants added by the user (plus COD TN TP)
    for(let j = 0; j < all_pollutants.length; j++){

        let pollutant = all_pollutants[j]

        // if there are more selected pollutants than values, the value is 0
        let value = 0
        let level_of_certainty_value = 0

        //if user has not added neither COD nor TN nor TP, even though added by default, they will have 0 values
        if (pollutants_added_by_user.includes(pollutant)){
            //if pollutant is in the range of the array
            if (2*j < raw.length) value = raw[2*j]

            //if level of certainty is in the range of the array
            if (2*j+1 < raw.length) level_of_certainty_value = raw[2*j+1]
        }

        parse_level_of_certainty(industry, stage, stepper_model, key, _parse_level_of_certainty(sheet, level_of_certainty_value), pollutant)
        obj[pollutant] = value
    }
    stage[key] = obj
}

function parse_industry(industry, sheet){
    try {

        parse_value(5, sheet, industry, industry, 'volume_withdrawn', 1, false, true)
        parse_value(6, sheet, industry, industry, 'volume_withdrawn_groundwater', 1, false, true)
        parse_value(7, sheet, industry, industry, 'volume_external_same_watershed_sources', 1, false, true)
        parse_value(8, sheet, industry, industry, 'volume_external_different_sources', 1, false, true)
        industry.has_onsite_wwtp = parse_yes_no(9, sheet, true)
        industry.has_direct_discharge = parse_yes_no(10, sheet, true)
        industry.has_offsite_wwtp = parse_yes_no(11, sheet, true)
        industry.industry_type = parse_industry_type(12, sheet, true)
        parse_value(13, sheet, industry, industry, 'product_produced_unit', 1, true, false)
        parse_value(14, sheet, industry, industry, 'product_produced', 1, false, true)

        industry.pollutants_selected = parse_selected_pollutants(15, sheet)
        pollutants_added_by_user = parse_selected_pollutants(15, sheet, false)

        parse_pollutants(16, sheet, industry, industry, 'ind_pollutants_effl', 1)
        parse_value(17, sheet, industry, industry, 'ind_temperature_withdrawn', 1, false, false)
        parse_pollutants(18, sheet, industry, industry, 'ind_pollutants_infl', 1)


    } catch (e) {
        throw e
    }
}

function parse_onsite_wwtp(wwtp, industry, stepper_model, sheet){
    try {
        wwtp.wwt_treatment_type = parse_wwtp_type(2, sheet, true)

        parse_value(3, sheet, industry, wwtp, 'wwt_vol_trea', stepper_model, false, true)
        parse_value(4, sheet, industry, wwtp, 'wwt_vol_disc', stepper_model, false, true)
        parse_value(5, sheet, industry, wwtp, 'wwt_vol_reused', stepper_model, false, false)
        wwtp.discharge_same_location_as_withdrawal = parse_discharge_same_watershed(6, sheet, false)
        parse_value(7, sheet, industry, wwtp, 'wwt_temperature_discharge', stepper_model, false, false)
        parse_value(8, sheet, industry, wwtp, 'wwt_nrg_cons', stepper_model, false, false)
        parse_value(9, sheet, industry, wwtp, 'wwt_conv_kwh', stepper_model, false, false)
        parse_value(10, sheet, industry, wwtp, 'wwt_mass_slu', stepper_model, false, false)
        parse_value(11, sheet, industry, wwtp, 'wwt_cod_slud', stepper_model, false, false)
        parse_value(12, sheet, industry, wwtp, 'wwt_ch4_efac_tre', stepper_model, false, false)
        parse_value(13, sheet, industry, wwtp, 'wwt_n2o_efac_tre', stepper_model, false, false)
        parse_value(14, sheet, industry, wwtp, 'wwt_ch4_efac_dis', stepper_model, false, false)
        parse_value(15, sheet, industry, wwtp, 'wwt_n2o_efac_dis', stepper_model, false, false)
        parse_pollutants(16, sheet, industry, wwtp, 'wwt_pollutants_effl', stepper_model)
        wwtp.wwt_fuel_typ = parse_fuel(17, sheet, false)
        parse_value(18, sheet, industry, wwtp, 'wwt_vol_fuel', stepper_model, false, false)
        parse_value(19, sheet, industry, wwtp, 'wwt_biog_pro', stepper_model, false, false)
        parse_value(20, sheet, industry, wwtp, 'wwt_biog_fla', stepper_model, false, false)
        parse_value(21, sheet, industry, wwtp, 'wwt_biog_val', stepper_model, false, false)
        parse_value(22, sheet, industry, wwtp, 'wwt_biog_lkd', stepper_model, false, false)
        parse_value(23, sheet, industry, wwtp, 'wwt_biog_sold', stepper_model, false, false)
        parse_value(24, sheet, industry, wwtp, 'wwt_ch4_biog', stepper_model, false, false)
        wwtp.wwt_dige_typ = parse_fuel(25, sheet, false)
        parse_value(26, sheet, industry, wwtp, 'wwt_fuel_dig', stepper_model, false, false)
        wwtp.wwt_reus_trck_typ = parse_fuel(27, sheet, false)
        parse_value(28, sheet, industry, wwtp, 'wwt_reus_vol_trck', stepper_model, false, false)
        parse_value(29, sheet, industry, wwtp, 'wwt_mass_slu_sto', stepper_model, false, false)
        parse_value(30, sheet, industry, wwtp, 'wwt_time_slu_sto', stepper_model, false, false)
        parse_value(31, sheet, industry, wwtp, 'wwt_slu_sto_TVS', stepper_model, false, false)
        parse_value(32, sheet, industry, wwtp, 'wwt_slu_sto_f_CH4', stepper_model, false, false)
        parse_value(33, sheet, industry, wwtp, 'wwt_slu_sto_EF', stepper_model, false, false)
        parse_value(34, sheet, industry, wwtp, 'wwt_mass_slu_comp', stepper_model, false, false)
        wwtp.wwt_slu_comp_emis_treated_or_piles_covered = parse_yes_no(35, sheet, false)
        parse_value(36, sheet, industry, wwtp, 'wwt_slu_comp_solids_content', stepper_model, false, false)
        parse_value(37, sheet, industry, wwtp, 'wwt_slu_comp_TVS', stepper_model, false, false)
        parse_value(38, sheet, industry, wwtp, 'wwt_slu_comp_N_cont', stepper_model, false, false)
        parse_value(39, sheet, industry, wwtp, 'wwt_slu_comp_low_CN_EF', stepper_model, false, false)
        parse_value(40, sheet, industry, wwtp, 'wwt_slu_comp_uncovered_pile_EF', stepper_model, false, false)
        parse_value(41, sheet, industry, wwtp, 'wwt_slu_comp_seqst_rate', stepper_model, false, false)
        parse_value(42, sheet, industry, wwtp, 'wwt_mass_slu_inc', stepper_model, false, false)
        parse_value(43, sheet, industry, wwtp, 'wwt_temp_inc', stepper_model, false, false)
        parse_value(44, sheet, industry, wwtp, 'wwt_slu_inc_N_cont', stepper_model, false, false)
        wwtp.wwt_slu_inc_SNCR = parse_yes_no(45, sheet, false)

        parse_value(46, sheet, industry, wwtp, 'wwt_mass_slu_app', stepper_model, false, false)
        parse_value(47, sheet, industry, wwtp, 'wwt_slu_la_solids_content', stepper_model, false, false)
        parse_value(48, sheet, industry, wwtp, 'wwt_slu_la_TVS', stepper_model, false, false)
        parse_value(49, sheet, industry, wwtp, 'wwt_slu_la_N_cont', stepper_model, false, false)
        parse_value(50, sheet, industry, wwtp, 'wwt_slu_la_EF', stepper_model, false, false)
        parse_value(51, sheet, industry, wwtp, 'wwt_mass_slu_land', stepper_model, false, false)
        parse_value(52, sheet, industry, wwtp, 'wwt_slu_lf_TVS', stepper_model, false, false)
        parse_value(53, sheet, industry, wwtp, 'wwt_slu_lf_uncertainty', stepper_model, false, false)
        parse_value(54, sheet, industry, wwtp, 'wwt_slu_lf_CH4_in_gas', stepper_model, false, false)
        parse_value(55, sheet, industry, wwtp, 'wwt_slu_lf_DOCf', stepper_model, false, false)
        parse_value(56, sheet, industry, wwtp, 'wwt_slu_lf_decomp_3yr', stepper_model, false, false)
        parse_value(57, sheet, industry, wwtp, 'wwt_slu_lf_MCF', stepper_model, false, false)
        parse_value(58, sheet, industry, wwtp, 'wwt_slu_lf_N_cont', stepper_model, false, false)
        parse_value(59, sheet, industry, wwtp, 'wwt_slu_lf_low_CN_EF', stepper_model, false, false)
        parse_value(60, sheet, industry, wwtp, 'wwt_mass_slu_stock', stepper_model, false, false)
        parse_value(61, sheet, industry, wwtp, 'wwt_slu_sp_lifespan', stepper_model, false, false)
        wwtp.wwt_trck_typ = parse_fuel(62, sheet, false)
        parse_value(63, sheet, industry, wwtp, 'wwt_vol_tslu', stepper_model, false, false)


    } catch (e) {
        throw e
    }
}

function parse_external_wwtp(wwtp, industry, stepper_model, sheet){
    try {
        wwtp.wwt_treatment_type = parse_wwtp_type(2, sheet, true)

        parse_value(3, sheet, industry, wwtp, 'wwt_vol_trea', stepper_model, false, true)
        parse_value(4, sheet, industry, wwtp, 'wwt_vol_disc', stepper_model, false, true)
        wwtp.discharge_same_location_as_withdrawal = parse_discharge_same_watershed(5, sheet, false)
        parse_value(6, sheet, industry, wwtp, 'wwt_temperature_discharge', stepper_model, false, false)
        parse_value(7, sheet, industry, wwtp, 'wwt_nrg_cons', stepper_model, false, false)
        parse_value(8, sheet, industry, wwtp, 'wwt_conv_kwh', stepper_model, false, false)
        parse_value(9, sheet, industry, wwtp, 'wwt_mass_slu', stepper_model, false, false)
        parse_value(10, sheet, industry, wwtp, 'wwt_cod_slud', stepper_model, false, false)
        parse_value(11, sheet, industry, wwtp, 'wwt_ch4_efac_tre', stepper_model, false, false)
        parse_value(12, sheet, industry, wwtp, 'wwt_n2o_efac_tre', stepper_model, false, false)
        parse_value(13, sheet, industry, wwtp, 'wwt_ch4_efac_dis', stepper_model, false, false)
        parse_value(14, sheet, industry, wwtp, 'wwt_n2o_efac_dis', stepper_model, false, false)
        parse_pollutants(15, sheet, industry, wwtp, 'wwt_pollutants_effl', stepper_model)
        wwtp.wwt_fuel_typ = parse_fuel(16, sheet, false)
        parse_value(17, sheet, industry, wwtp, 'wwt_vol_fuel', stepper_model, false, false)
        parse_value(18, sheet, industry, wwtp, 'wwt_biog_pro', stepper_model, false, false)
        parse_value(19, sheet, industry, wwtp, 'wwt_biog_fla', stepper_model, false, false)
        parse_value(20, sheet, industry, wwtp, 'wwt_biog_val', stepper_model, false, false)
        parse_value(21, sheet, industry, wwtp, 'wwt_biog_lkd', stepper_model, false, false)
        parse_value(22, sheet, industry, wwtp, 'wwt_biog_sold', stepper_model, false, false)
        parse_value(23, sheet, industry, wwtp, 'wwt_ch4_biog', stepper_model, false, false)
        wwtp.wwt_dige_typ = parse_fuel(24, sheet, false)
        parse_value(25, sheet, industry, wwtp, 'wwt_fuel_dig', stepper_model, false, false)
        wwtp.wwt_reus_trck_typ = parse_fuel(26, sheet, false)
        parse_value(27, sheet, industry, wwtp, 'wwt_reus_vol_trck', stepper_model, false, false)
        parse_value(28, sheet, industry, wwtp, 'wwt_mass_slu_sto', stepper_model, false, false)
        parse_value(29, sheet, industry, wwtp, 'wwt_time_slu_sto', stepper_model, false, false)
        parse_value(30, sheet, industry, wwtp, 'wwt_slu_sto_TVS', stepper_model, false, false)
        parse_value(31, sheet, industry, wwtp, 'wwt_slu_sto_f_CH4', stepper_model, false, false)
        parse_value(32, sheet, industry, wwtp, 'wwt_slu_sto_EF', stepper_model, false, false)
        parse_value(33, sheet, industry, wwtp, 'wwt_mass_slu_comp', stepper_model, false, false)
        wwtp.wwt_slu_comp_emis_treated_or_piles_covered = parse_yes_no(34, sheet, false)
        parse_value(35, sheet, industry, wwtp, 'wwt_slu_comp_solids_content', stepper_model, false, false)
        parse_value(36, sheet, industry, wwtp, 'wwt_slu_comp_TVS', stepper_model, false, false)
        parse_value(37, sheet, industry, wwtp, 'wwt_slu_comp_N_cont', stepper_model, false, false)
        parse_value(38, sheet, industry, wwtp, 'wwt_slu_comp_low_CN_EF', stepper_model, false, false)
        parse_value(39, sheet, industry, wwtp, 'wwt_slu_comp_uncovered_pile_EF', stepper_model, false, false)
        parse_value(40, sheet, industry, wwtp, 'wwt_slu_comp_seqst_rate', stepper_model, false, false)
        parse_value(41, sheet, industry, wwtp, 'wwt_mass_slu_inc', stepper_model, false, false)
        parse_value(42, sheet, industry, wwtp, 'wwt_temp_inc', stepper_model, false, false)
        parse_value(43, sheet, industry, wwtp, 'wwt_slu_inc_N_cont', stepper_model, false, false)
        wwtp.wwt_slu_inc_SNCR = parse_yes_no(44, sheet, false)
        parse_value(45, sheet, industry, wwtp, 'wwt_mass_slu_app', stepper_model, false, false)
        parse_value(46, sheet, industry, wwtp, 'wwt_slu_la_solids_content', stepper_model, false, false)
        parse_value(47, sheet, industry, wwtp, 'wwt_slu_la_TVS', stepper_model, false, false)
        parse_value(48, sheet, industry, wwtp, 'wwt_slu_la_N_cont', stepper_model, false, false)
        parse_value(49, sheet, industry, wwtp, 'wwt_slu_la_EF', stepper_model, false, false)
        parse_value(50, sheet, industry, wwtp, 'wwt_mass_slu_land', stepper_model, false, false)
        parse_value(51, sheet, industry, wwtp, 'wwt_slu_lf_TVS', stepper_model, false, false)
        parse_value(52, sheet, industry, wwtp, 'wwt_slu_lf_uncertainty', stepper_model, false, false)
        parse_value(53, sheet, industry, wwtp, 'wwt_slu_lf_CH4_in_gas', stepper_model, false, false)
        parse_value(54, sheet, industry, wwtp, 'wwt_slu_lf_DOCf', stepper_model, false, false)
        parse_value(55, sheet, industry, wwtp, 'wwt_slu_lf_decomp_3yr', stepper_model, false, false)
        parse_value(56, sheet, industry, wwtp, 'wwt_slu_lf_MCF', stepper_model, false, false)
        parse_value(57, sheet, industry, wwtp, 'wwt_slu_lf_N_cont', stepper_model, false, false)
        parse_value(58, sheet, industry, wwtp, 'wwt_slu_lf_low_CN_EF', stepper_model, false, false)
        parse_value(59, sheet, industry, wwtp, 'wwt_mass_slu_stock', stepper_model, false, false)
        parse_value(60, sheet, industry, wwtp, 'wwt_slu_sp_lifespan', stepper_model, false, false)
        wwtp.wwt_trck_typ = parse_fuel(61, sheet, false)
        parse_value(62, sheet, industry, wwtp, 'wwt_vol_tslu', stepper_model, false, false)


    } catch (e) {
        throw e
    }
}

function parse_direct_discharge(dd, industry, stepper_model, sheet){
    try {

        parse_value(2, sheet, industry, dd, 'dd_vol_disc', stepper_model, false, true)
        parse_value(3, sheet, industry, dd, 'wwt_ch4_efac_dis', stepper_model, false, false)
        parse_value(4, sheet, industry, dd, 'wwt_n2o_efac_dis', stepper_model, false, false)
        dd.discharge_same_location_as_withdrawal = parse_discharge_same_watershed(5, sheet, false)
        parse_value(6, sheet, industry, dd, 'wwt_temperature_discharge', stepper_model, false, false)
    } catch (e) {
        throw e
    }
}


function parse_excel_new_industry(file){
    if(file != null){
        const wb = new Excel.Workbook();
        const reader = new FileReader()

        return new Promise((resolve, reject) => {
            reader.onload = () => {
                const buffer = reader.result;
                wb.xlsx.load(buffer).then(workbook => {

                    //Check if industry is already created
                    let sheet = workbook.getWorksheet(1)
                    let assessment_name = sheet.getRow(3).getCell(5).value
                    let industry_name = sheet.getRow(4).getCell(5).value

                    //check if assessment and industry exist
                    let assessment = created_assessments.find(a => a.name === assessment_name)
                    if (assessment == null){
                        reject("ASSESSMENT "+assessment_name+" DOES NOT EXIST. CREATE IT FIRST")
                    }
                    let industry = assessment.industries.find(i => i.name === industry_name)
                    if (industry == null){
                        reject("INDUSTRY "+industry_name+" DOES NOT EXIST IN ASSESSMENT "+assessment_name+". CREATE IT FIRST")
                    }
                    try {
                        parse_industry(industry, workbook.getWorksheet(1))
                        if(industry.has_onsite_wwtp == 1) {
                            industry.update_onsite_wwtp()
                            let wwtp = industry.onsite_wwtp
                            wwtp.location = industry.location
                            parse_onsite_wwtp(wwtp, industry, 2, workbook.getWorksheet(2))
                        }
                        if(industry.has_direct_discharge == 1) {
                            industry.update_direct_discharge()
                            let dd = industry.direct_discharge
                            dd.location = industry.location
                            parse_direct_discharge(dd, industry, 3, workbook.getWorksheet(3))
                        }
                        if(industry.has_offsite_wwtp == 1) {
                            industry.update_offsite_wwtp()
                            let wwtp = industry.offsite_wwtp
                            wwtp.location = industry.location
                            parse_external_wwtp(wwtp, industry, 4, workbook.getWorksheet(4))
                        }
                    }
                    catch (e) {
                        reject(e)
                    }
                    resolve([industry])
                })
            }
            reader.readAsArrayBuffer(file)

        }).catch(e => {
            throw e
        })

    }
}

let utils_excel = {

    async read_industres_location(file){
        let [assessments, industries] = await parse_excel(file)

        if (assessments.length === 0 || industries.length === 0) return "ERROR IMPORTING FILE"

        try {
            parse_assessments(assessments)
            parse_industry_locations(industries)
            return "FILE IMPORTED CORRECTLY"
        }catch (e) {
            return e
        }
        return "ERROR IMPORTING FILE"
    },
    async read_new_industry(file){
        try {
            let new_industry = await parse_excel_new_industry(file)
            return "FILE IMPORTED CORRECTLY"

        }catch (e) {
            return e
        }
    }


}





export {utils_excel}

