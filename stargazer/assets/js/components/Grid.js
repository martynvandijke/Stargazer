import Component from './Component';

class Grid extends Component {

    icon = "/static/images/Wire.svg"

    type = "grid"
    
    parameter = {
        reactance:   0,
        resistance:  0,
        capacity:    0
    }

    description = {
        reactance:   "Reactance [Ω] per 100 MVA",
        resistance:  "Resistance [Ω]",
        capacity:    "Capacity [MW]"
    }

    model = {
        reactance:       ["network","network elastic","stochastic"],
        resistance:      ["network","network elastic","stochastic"],
        capacity:        ["network","network elastic","stochastic"]
    }
}

module.exports = Grid;