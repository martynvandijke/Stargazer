import Component from './Component';

class Consumer extends Component {

    icon = "/static/images/Consumer.svg"
    
    type = "consumer"
    
    parameter = {
        load: [0,0]
    }

    description = {
        load: "Power Load [MW]"
    }

    model = {
        load:    ["basic","network","network elastic","stochastic"]
    }
}

module.exports = Consumer;