import Component from './Component';

class Generator extends Component {

    icon = "/static/images/generator.png"

    type = "generator"
    
    parameter = {
        power_min : 0,          // MW
        power_max: 0,           // MW
        marginal_cost: 0,       // €
        minimum_down_time: 0,   // h
        minimum_up_time: 0,     // h
        ramp_up_rate: 0,        // MW/min
        ramp_down_rate: 0,      // MW/min
        energy_block: [0,0],    // MWh
        cost_block: [0,0],      // €/MWh
        start_up_cost: 0,       // €
        shut_down_cost: 0       // €
    }

    description = {
        power_min :          "Pmin [MW]",
        power_max:           "Pmax [MW]",
        marginal_cost:       "Marginal cost [€/MWh]",
        minimum_down_time:   "Minimum down time [h]",
        minimum_up_time:     "Minimum up time [h]",
        ramp_up_rate:        "Ramp-up rate [MW/min]",
        ramp_down_rate:      "Ramp-down rate [MW/min]",
        energy_block:        "Energy block pairs [MWh]",
        cost_block:          "Cost block pairs [€/MWh]",
        start_up_cost:       "Start-up cost [€]",
        shut_down_cost:      "Shut-down cost [€]"
    }

    model = {
        power_min :          ["basic","network","stochastic"],
        power_max:           ["basic","network","stochastic"],
        marginal_cost:       ["basic","network"],
        minimum_down_time:   ["network","network elastic","stochastic"],
        minimum_up_time:     ["network","network elastic","stochastic"],
        ramp_up_rate:        ["network","network elastic","stochastic"],
        ramp_down_rate:      ["network","network elastic","stochastic"],
        energy_block:        ["network elastic"],
        cost_block:          ["network elastic"],
        start_up_cost:       ["network","network elastic","stochastic"],
        shut_down_cost:      ["network","network elastic","stochastic"]
    }
}

module.exports = Generator;