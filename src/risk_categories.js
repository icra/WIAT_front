
let impact_strings = {
    l: "Low impact",
    m: "Medium impact",
    h: "High impact",
    vh: "Very high impact",
}

let blue = ['#529fee', impact_strings.l]    //Low impact
let red = ['red', impact_strings.vh]        //Very high impact
let orange = ['orange', impact_strings.h]   //High impact
let yellow = ['yellow', impact_strings.m]   //Medium impact

let layers = {
    l: ['#f6f600', "Low risk"],
    lm: ['#f6cc00', "Low-medium risk"],
    mh: ['#ff9900', "Medium-high risk"],
    h: ['#ff1900', "High risk"],
    eh: ['#990000', "Extremely high risk"],
}



let risk_category = {

    impact_strings: impact_strings,

    quality_quantity(value){
        if(value == impact_strings.l) return blue
        else if(value == impact_strings.m) return yellow
        else if(value == impact_strings.h) return orange
        else if(value == impact_strings.vh) return red
        return null
    },
    pollution(value){
        if(value == impact_strings.l) return blue
        else if(value == impact_strings.m) return yellow
        else if(value == impact_strings.h) return orange
        else if(value == impact_strings.vh) return red
        return null
    },
    impact_biodiversity(value){
        if(value == impact_strings.l) return blue
        else if(value == impact_strings.m) return yellow
        else if(value == impact_strings.h) return orange
        else if(value == impact_strings.vh) return red
        return null
    },
    global_warming: function(value){
        return null
    },

    /**************************
     Impact
     **************************/

    //Dilution factor
    dilution_factor: function(value){
        if(value < 0) return null
        else if (value < 2) return red
        else if (value < 10) return orange
        else if (value < 100) return yellow
        else if (value >= 100) return blue
        return null
    },
    //Recycled water factor
    recycled_water_factor: function(value){
        if(value < 0) return null
        else if (value < 2) return red
        else if (value < 5) return orange
        else if (value < 20) return yellow
        else if (value >= 20) return blue
        return null
    },
    //Treated water factor
    water_treated: function(value){
        if(value < 0) return null
        else if (value < 2) return red
        else if (value < 5) return orange
        else if (value < 20) return yellow
        else if (value >= 20) return blue
        return null
    },
    //Consumption available ratio
    water_stress_ratio: function(value){
        if(value < 0) return null
        else if (value < 2) return blue
        else if (value < 5) return yellow
        else if (value < 20) return orange
        else if (value >= 20) return red
        return null
    },
    //Specific water consumption
    specific_water_consumption: function(){
        return null
    },
    //eutrophication potential
    eutrophication: function(value){
        if(value < 0) return null
        else if (value < 0.5) return blue
        else if (value < 1) return yellow
        else if (value < 2) return orange
        else if (value >= 2) return red
        return null
    },

    //toxic units
    ecotoxicity: function(){
        return null
    },

    delta: function(){
        return null
    },

    //Concentration of the pollutants in the effluent (with respect to EQS)
    eqs: function(){
        return null
    },

    //Increase of the concentration of the pollutants in the receiving water body after discharge (with respect to EQS)
    delta_eqs: function(value){
        if(value < 0) return null
        else if (value < 2) return blue
        else if (value < 100) return yellow
        else if (value < 200) return orange
        else if (value === '-' || value >= 200) return red
        return null
    },

    //Increase in toxic units in the receiving water body after discharge
    delta_ecotoxicity: function(value){
        if(value < 0) return null
        else if (value < 0.2) return blue
        else if (value < 1) return yellow
        else if (value < 2) return orange
        else if (value === '-' || value >= 2) return red
        return null
    },

    //treatment efficiency (compared to WWTP influent)
    treatment_efficiency: function(value){
        if(value < 0) return null
        else if (value < 25) return red
        else if (value < 50) return orange
        else if (value < 75) return yellow
        else if (value >= 75) return blue
        return null
    },

    //Percentage of treatment efficiency (compared to intake water)
    influent_treatment_efficiency: function(value){
        if(value < 0) return null
        else if (value <= 100) return blue
        else if (value > 100) return red
        return null
    },

    //Overall water risk
    owr: function(value){
        if(value < 1) return layers.l
        else if (value < 2) return layers.lm
        else if (value < 3) return layers.mh
        else if (value < 4) return layers.h
        else if (value >= 4) return layers.eh
        return null
    },

    /**************************
    Layers from aqueduct
     **************************/
    seasonal_variability: function(value){
        if(value < 0.33) return layers.l
        else if (value < 0.66) return layers.lm
        else if (value < 1) return layers.mh
        else if (value < 1.33) return layers.h
        else if (value >= 1.33) return layers.eh
        return null
    },
    interannual_variability: function(value){
        if(value < 0.33) return layers.l
        else if (value < 0.66) return layers.lm
        else if (value < 1) return layers.mh
        else if (value < 1.33) return layers.h
        else if (value >= 1.33) return layers.eh
        return null
    },
    water_stress: function(value){
        if(value < 10) return layers.l
        else if (value < 20) return layers.lm
        else if (value < 40) return layers.mh
        else if (value < 80) return layers.h
        else if (value >= 80) return layers.eh
        return null
    },
    water_depletion: function(value){
        if(value < 5) return layers.l
        else if (value < 25) return layers.lm
        else if (value < 50) return layers.mh
        else if (value < 75) return layers.h
        else if (value >= 75) return layers.eh
        return null
    },
    aridity_index: function(value){
        if(value <= 0.03) return layers.eh
        else if (value < 0.2) return layers.h
        else if (value < 0.5) return layers.mh
        else if (value < 0.65) return layers.lm
        else if (value >= 0.65) return layers.l
        return null
    },
    groundwater_table_decline: function(value){
        if(value < 0) return layers.l
        else if (value < 2) return layers.lm
        else if (value < 4) return layers.mh
        else if (value < 8) return layers.h
        else if (value >= 8) return layers.eh
        return null
    },
    riverine_flood_risk: function(value){
        if(value < 1/1000) return layers.l
        else if (value < 2/1000) return layers.lm
        else if (value < 6/1000) return layers.mh
        else if (value < 1/100) return layers.h
        else if (value >= 1/100) return layers.eh
        return null
    },
    coastal_flood_risk: function(value){
        if(value < 9/1000000) return layers.l
        else if (value < 7/100000) return layers.lm
        else if (value < 3/10000) return layers.mh
        else if (value < 2/1000) return layers.h
        else if (value >= 2/1000) return layers.eh
        return null
    },
    drought_risk: function(value){
        if(value < 0.2) return layers.l
        else if (value < 0.4) return layers.lm
        else if (value < 0.6) return layers.mh
        else if (value < 0.8) return layers.h
        else if (value >= 0.8) return layers.eh
        return null
    },
    coastal_eutrophication_potential: function(value){
        if(value < -5) return layers.l
        else if (value < 0) return layers.lm
        else if (value < 1) return layers.mh
        else if (value < 5) return layers.h
        else if (value >= 5) return layers.eh
        return null
    },
    /*reprisk: function(value){
        if(value < 25) return layers.l
        else if (value < 50) return layers.lm
        else if (value < 60) return layers.mh
        else if (value < 75) return layers.h
        else if (value >= 75) return layers.eh
        return null
    },*/
    no_drinking: function(value){
        if(value < 2.5) return layers.l
        else if (value < 5) return layers.lm
        else if (value < 10) return layers.mh
        else if (value < 20) return layers.h
        else if (value >= 20) return layers.eh
        return null
    },
    no_sanitation: function(value){
        if(value < 2.5) return layers.l
        else if (value < 5) return layers.lm
        else if (value < 10) return layers.mh
        else if (value < 20) return layers.h
        else if (value >= 20) return layers.eh
        return null
    },
    withdrawal_effect: function(value){
        if(value <= 5) return blue
        else if(value > 5) return red
        return null
    },
    discharge_effect: function(value){
        if(value <= 5) return blue
        else if(value > 5) return red
        return null
    },

    legend_impact_pdf: function(dd){
        dd.content.push({
            style: 'legend',
            table: {
                widths: [10, 'auto', 10, 'auto', 10, 'auto', 10, 'auto', 10, 'auto'],
                body: [
                    [
                        {text: " ", fillColor: "white", border: [true, true, true, true],},
                        {text: "Unknown", border: [false, false, false, false]},
                        {text: " ", fillColor: blue[0], border: [false, false, false, false]},
                        {text: blue[1], border: [false, false, false, false]},
                        {text: " ", fillColor: yellow[0], border: [false, false, false, false]},
                        {text: yellow[1], border: [false, false, false, false]},
                        {text: " ", fillColor: orange[0], border: [false, false, false, false]},
                        {text: orange[1], border: [false, false, false, false]},
                        {text: " ", fillColor: red[0], border: [false, false, false, false]},
                        {text: red[1], border: [false, false, false, false]},
                    ]
                ]
            }
        })

    },
    legend_risk_pdf: function(dd){
        dd.content.push({
            style: 'legend',
            table: {
                widths: [10, 'auto', 10, 'auto', 10, 'auto', 10, 'auto', 10, 'auto', 10, 'auto'],
                body: [
                    [
                        {text: " ", fillColor: "white", border: [true, true, true, true]},
                        {text: "Unknown", border: [false, false, false, false]},
                        {text: " ", fillColor: layers.l[0], border: [false, false, false, false]},
                        {text: layers.l[1], border: [false, false, false, false]},

                        {text: " ", fillColor: layers.lm[0], border: [false, false, false, false]},
                        {text: layers.lm[1], border: [false, false, false, false]},
                        {text: " ", fillColor: layers.mh[0], border: [false, false, false, false]},
                        {text: layers.mh[1], border: [false, false, false, false]},
                        {text: " ", fillColor: layers.h[0], border: [false, false, false, false]},
                        {text: layers.h[1], border: [false, false, false, false]},
                        {text: " ", fillColor: layers.eh[0], border: [false, false, false, false]},
                        {text: layers.eh[1], border: [false, false, false, false]},
                    ]
                ]
            }
        })

    },







}






module.exports = risk_category