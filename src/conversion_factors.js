/* For each pollutant, conversion factor to:
   eutrophication --> gPO4/eq
   tu --> Toxic units (EC50 in µg/L)
   eqs --> environmental quality standards (mg/L)

    If value is a -, it means does this factor does not need to be set
    if value is null, factor needs to be set by the user
*/

let conversion_factors = {
    "COD": {eutrophication: 0.022, tu: '-', eqs: '-'},
    "TN": {eutrophication: 0.42, tu: '-', eqs: '-'},
    "TP": {eutrophication: 3.06, tu: '-', eqs: '-'},
    '1,2-Dichloroethane': {eutrophication: '-', tu: 150000, eqs: 0.01},
    "Cadmium": {eutrophication: '-', tu: 9.5, eqs: 0.001},
    "Hexaclorobenzene": {eutrophication: '-', tu: 30, eqs: 0.0005},
    "Mercury": {eutrophication: '-', tu: 1.4, eqs: 0.00007},
    "Lead": {eutrophication: '-', tu: 440, eqs: 0.0072},
    "Nickel": {eutrophication: '-', tu: 1000, eqs: 0.02},
    "Chloroalkanes": {eutrophication: '-', tu: 65000, eqs: 0.0014},
    "Hexachlorobutadiene": {eutrophication: '-', tu: 500, eqs: 0.0006},
    "Nonylphenols": {eutrophication: '-', tu: 150, eqs: 0.002},
    "Tetrachloroethene": {eutrophication: '-', tu: 3200, eqs: 0.01},
    "Trichloroethylene": {eutrophication: '-', tu: 76000, eqs: 0.01},
}






module.exports = conversion_factors