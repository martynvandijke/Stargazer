import Component from './Component';

class Bus extends Component {

    icon = "/static/images/Bus.svg"

    type = "bus"
    
    parameter = {
        v_min: 0,         // [MV]
        v_max: 0          // [MV]
    }

    description = {
        v_min: "Minimum desired voltage [MV]",
        v_max: "Maximum desired voltage [MV]"
    }

    model = {
        v_min:    ["network","network elastic","stochastic"],
        v_max:    ["network","network elastic","stochastic"]
    }
}

module.exports = Bus;