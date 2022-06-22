/* Key and descriptions of external indicators */

let external_indicators = {
    gri: {
        "303_3": {
            key: "303-3a, 303-b",
            text: "Requirements",
        },
        "clause_2_2_1": {
            key: "Clause 2.2.1",
            text: "Recommendations",
        },
        "303_4": {
            key: "[Disclosure 303-4]",
            text: "Water discharge",
            description:  {
                body: {
                    "Surface water": 'Water treated in an on-site WWTP and directly discharged water',
                    "Third-party water (total)": 'Water treaded in an off-site WWTP',
                }
            }

        },
        "303_4_2": {
            key: "[Disclosure 303-4]",
            text: "Water discharge",
            description:  {
                body: {
                    "Discharge to the natural environment without treatment": 'Directly discharged water',
                    "Discharge to a third party without treatment": 'Water treaded in an off-site WWTP',
                }
            }

        },
    },
    cdp: {
        "1_2_b": {
            key: "W1.2B",
            text: "What are the total volumes of water withdrawn, discharged, and consumed across all your operations",
            description:  {
                body: {
                    "Total withdrawals": 'Surface and groundwater withdrawals',
                    "Total consumption": 'Water withdrawals minus total discharges',
                }
            }
        },
        "1_2_d": {
            key: "W1.2D",
            text: "Indicate whether water is withdrawn from areas with water stress and provide the proportion",
            description:  {
                header: {
                    "percentage": 'Percentage of water withdrawals (groundwater and surface) from areas that have a Baseline water stress equal to/greater than 40% (WRI Aqueduct).',
                }
            }

        },
        "1_2_h": {
            key: "W1.2H",
            text: "Provide total water withdrawal data by source",
        },
        "1_2_i": {
            key: "W1.2I",
            text: "Provide total water discharge data by destination",
            description:  {
                body: {
                    "Fresh surface water": 'Water treated in an on-site WWTP and directly discharged water',
                    "Third party destinations": 'Water treaded in an off-site WWTP',

                }
            }

        },
        "1_2_j": {
            key: "W1.2J",
            text: "Within your direct operations, indicate the highest level(s) to which you treat your discharge",
            description:  {
                header: {
                    "highest": 'This refers to the level of treatment applied by your organization to water at the point of discharge. If water has been treated to multiple levels, report the volume in the row for the highest level of treatment only.',
                    "percentage": 'Proportion of your organization’s facilities for which the volume reported accounts for.'
                }
            }

        },
        "2_1_a": {
            key: "W2.1A",
            text: "Describe the water-related detrimental impacts experienced by your organization, your response, and the total financial impact.",

        },
        "4_1_a": {
            key: "W4.1A",
            text: "How does your organization define substantive financial or strategic impact on your business?",
        },
        "5_1": {
            key: "W5.1",
            text: "For each facility, provide coordinates and water accounting data",
            description:  {
                header: {
                    "withdrawals": 'Surface and groundwater withdrawals',
                    "consumption": 'Water withdrawals minus total discharges',
                    "water_stress": 'Says if industry location has a Baseline water stress equal to/greater than 40% (WRI Aqueduct).'
                }
            }

        }
    }
}

module.exports = external_indicators


