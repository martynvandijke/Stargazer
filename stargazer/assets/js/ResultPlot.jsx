import React from 'react';
import { Alert, Grid, Row, Col, Modal, Button, Panel, FormControl, Tabs, Tab, Navbar, Nav, MenuItem, NavDropdown, ButtonGroup, NavItem, DropdownButton, Glyphicon } from 'react-bootstrap';
import { Bar, Line } from 'react-chartjs-2';

class ResultPlot extends React.Component {
    constructor(props) {
        super(props);
        // model , status, result, components
        this.state = {
            log: []
        };
        console.log = this.log;
        console.info = this.log;
        console.warn = this.log;
        console.error = this.log;
        this.color = [
            'rgba(255,99,132,0.2)',
            'rgba(255,99,202,0.4)',
            'rgba(75,192,192,0.4)',
            'rgba(255,228,96,1.0)',
            'rgba(206,222,104,1.0)',
            'rgba(240,130,0,0.79)',
            'rgba(248,170,151,1.0)',
            'rgba(161,196,143,0.88)',
            'rgba(180,139,148,1.0)',
            'rgba(229,218,183,1.0)',
            'rgba(157,221,231,1.0)',
            'rgba(195,223,201,1.0)',
            'rgba(114,191,44,1.0)',
            'rgba(190,205,20,1.0)',
            'rgba(245,152,177,1.0)',
            'rgba(250,190,0,1.0)',
            'rgba(240,135,99,1.0)',
            'rgba(187,196,255,1.0)',
            'rgba(248,150,151,1.0)',
            'rgba(255,228,96,0.5)',
            'rgba(206,222,104,0.5)',
            'rgba(240,130,0,0.5)',
            'rgba(248,170,151,0.5)',
            'rgba(161,196,143,0.5)',
            'rgba(180,139,148,0.5)',
            'rgba(229,218,183,0.5)',
            'rgba(157,221,231,0.5)',
            'rgba(195,223,201,0.5)',
            'rgba(114,191,44,0.5)',
            'rgba(190,205,20,0.5)',
            'rgba(245,152,177,0.5)',
            'rgba(250,190,0,0.5)',
            'rgba(240,135,99,0.5)',
            'rgba(187,196,255,0.5)',
            'rgba(248,150,151,0.5)'
        ];
    }

    log = text => {
        if (typeof text == "string")
            this.setState({
                log: this.state.log.concat([{ time: new Date().toLocaleString(), text: text }])
            });
        else
            this.setState({
                log: this.state.log.concat([{ time: new Date().toLocaleString(), text: JSON.stringify(text) }])
            });
    }

    getRandomColor = count =>{
        var colors = [];
        while(colors.length!=count)
        {
            var color = this.color[Math.floor(Math.random() * (this.color.length + 1))];
            if(colors.indexOf(color) == -1)
                colors.push(color);
        }
        return colors;
    }

    renderBasic = () => {
        var dataset = [];
        var label = [];
        var colors = this.getRandomColor(this.props.result.solution.p_out.length);
        for (var i = 0; i < this.props.result.solution.p_out.length; i++) {
            dataset.push({
                type: 'bar',
                label: 'generator ' + this.props.request.generator[i].id + ' [MW]',
                backgroundColor: colors[i],
                data: this.props.result.solution.p_out[i]
            });
        }
        for (var i = 0; i < this.props.result.solution.p_out[0].length; i++)
            label.push('time ' + (i + 1));
        return (
            <div>
                <h2>Generator Supply Over Time</h2>
                <div style={{ fontSize: "15pt" }}>
                    <p style={{ display: "inline" }}>Cost: </p><p style={{ display: "inline", color: "red" }}>{this.props.result.solution.cost}</p>
                </div>
                <Bar data={{ labels: label, datasets: dataset }}
                    options={{ scales: { xAxes: [{ stacked: false }], yAxes: [{ stacked: false, ticks: { beginAtZero: true } }] } }}
                    height={50} />
            </div>);
    }

    renderNetwork = () => {
        var dataset = [];
        var dataset2 = [];
        var label = [];
        var generators = this.props.result.solution.generators.power;
        var buses = this.props.result.solution.bus.power;
        var time_length = 0;
        var color_count = Object.keys(generators).length;
        var colors = this.getRandomColor(color_count);
        var offset = 0;
        for (var field in generators) {
            var value = [];
            for (var field2 in generators[field])
                value.push(generators[field][field2]);
            time_length = value.length;
            dataset.push({
                type: 'bar',
                label: field + ' [MW]',
                backgroundColor: colors[offset],
                data: value
            });
            offset++;
        }
        colors = this.getRandomColor(color_count);
        offset = 0;
        for (var field in buses) {
            var value = [];
            for (var field2 in buses[field])
                value.push(buses[field][field2]);
            time_length = value.length;
            dataset2.push({
                type: 'bar',
                label: field + ' [MW]',
                backgroundColor: colors[offset],
                data: value
            });
            offset++;
        }
        for (var i = 0; i < time_length; i++)
            label.push('time ' + (i + 1));
        return (
            <div>
                <h2>Generator Supply Over Time</h2>
                <div style={{ fontSize: "15pt" }}>
                    <p style={{ display: "inline" }}>Cost: </p><p style={{ display: "inline", color: "red" }}>{this.props.result.solution.cost}</p>
                </div>
                <Bar data={{ labels: label, datasets: dataset }}
                    options={{ scales: { xAxes: [{ stacked: false }], yAxes: [{ stacked: false, ticks: { beginAtZero: true } }] } }}
                    height={50} />
                <h2>Bus Flow Over Time</h2>
                <Bar data={{ labels: label, datasets: dataset2 }}
                    options={{ scales: { xAxes: [{ stacked: false }], yAxes: [{ stacked: false, ticks: { beginAtZero: true } }] } }}
                    height={50} />
            </div>);
    }

    renderStochastic = () => {

    }

    renderModel = () => {
        if (this.props.model == "basic")
            return this.renderBasic();
        if (this.props.model == "network")
            return this.renderNetwork();
        if (this.props.model == "stochastic")
            return this.renderStochastic();
    }

    renderRequestBasic = () => {
        //console.log(this.props.request);
        var generators = this.props.request.generator;
        var consumer = this.props.request.consumer[0];

        var supplyLabel = [];
        var supplyDataMin = [];
        var supplyDataMax = [];

        for (var i = 0; i < generators.length; i++) {
            supplyLabel.push("generator " + generators[i].id + " at cost " + generators[i].parameter.marginal_cost);
            supplyDataMin.push(generators[i].parameter.power_min);
            supplyDataMax.push(generators[i].parameter.power_max);
        }
        var colors = this.getRandomColor(2);
        var supplyData = {
            labels: supplyLabel,
            datasets: [{
                type: 'bar',
                label: 'min power [MW]',
                backgroundColor: colors[0],
                data: supplyDataMin
            }, {
                type: 'bar',
                label: 'max power [MW]',
                backgroundColor: colors[1],
                data: supplyDataMax
            }]
        };

        var demandLabel = [];
        var demandData = [];

        for (var i = 0; i < consumer.parameter.load.length; i++) {
            demandLabel.push("time " + (i + 1));
            demandData.push(consumer.parameter.load[i]);
        }
        var demandData = {
            labels: demandLabel,
            datasets: [{
                label: 'load [MW]',
                fill: false,
                lineTension: 0.1,
                backgroundColor: 'rgba(75,192,192,0.4)',
                borderColor: 'rgba(75,192,192,1)',
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: 'rgba(75,192,192,1)',
                pointBackgroundColor: '#fff',
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: 'rgba(75,192,192,1)',
                pointHoverBorderColor: 'rgba(220,220,220,1)',
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                data: demandData
            }]
        };

        return (
            <div>
                <h2>Generator Suppliers</h2>
                <Bar data={supplyData}
                    options={{ scales: { xAxes: [{ stacked: false }], yAxes: [{ stacked: false, ticks: { beginAtZero: true } }] } }}
                    height={50} />
                <h2>Load</h2>
                <Line data={demandData}
                    options={{ scales: { xAxes: [{ stacked: false }], yAxes: [{ stacked: false, ticks: { beginAtZero: true } }] } }}
                    height={50} />
            </div>);
    }

    renderRequestNetwork = () => {
        var generators = this.props.request.generator;
        var consumers = this.props.request.consumer;

        var supplyLabel = [];
        var supplyDataMin = [];
        var supplyDataMax = [];

        for (var i = 0; i < generators.length; i++) {
            supplyLabel.push("generator " + generators[i].id + " at cost " + generators[i].parameter.marginal_cost);
            supplyDataMin.push(generators[i].parameter.power_min);
            supplyDataMax.push(generators[i].parameter.power_max);
        }

        var colors = this.getRandomColor(2);

        var supplyData = {
            labels: supplyLabel,
            datasets: [{
                type: 'bar',
                label: 'min power [MW]',
                backgroundColor: colors[0],
                data: supplyDataMin
            }, {
                type: 'bar',
                label: 'max power [MW]',
                backgroundColor: colors[1],
                data: supplyDataMax
            }]
        };

        var dataset = [];
        var label = [];
        colors = this.getRandomColor(consumers.length);
        for (var i = 0; i < consumers.length; i++) {
            dataset.push({
                type: 'bar',
                label: 'load ' + consumers[i].id + ' [MW]',
                backgroundColor: colors[i],
                data: consumers[i].parameter.load
            });
        }
        for (var i = 0; i < consumers[0].parameter.load.length; i++)
            label.push('time ' + (i + 1));

        return (
            <div>
                <h2>Generator Suppliers</h2>
                <Bar data={supplyData}
                    options={{ scales: { xAxes: [{ stacked: false }], yAxes: [{ stacked: false, ticks: { beginAtZero: true } }] } }}
                    height={50} />
                <h2>Load</h2>
                <Bar data={{ labels: label, datasets: dataset }}
                    options={{ scales: { xAxes: [{ stacked: false }], yAxes: [{ stacked: false, ticks: { beginAtZero: true } }] } }}
                    height={50} />
            </div>);
    }

    renderRequestStochastic = () => {

    }

    renderRequest = () => {
        if (this.props.request == null) return "";
        if (this.props.model == "basic")
            return this.renderRequestBasic();
        if (this.props.model == "network")
            return this.renderRequestNetwork();
        if (this.props.model == "stochastic")
            return this.renderRequestStochastic();
    }

    render() {
        return (
            <Tabs className="xsmall_tab" defaultActiveKey={1} id="result">
                <Tab eventKey={1} title="Log">
                    {this.state.log.map((item, i) => {
                        return (
                            <div style={{ fontSize: "15pt" }} key={i}>
                                <p style={{ margin: 0, fontWeight: "bold" }}>{item.time + ":"}</p>
                                <pre style={{ margin: 0 }}>{item.text}</pre>
                            </div>
                        );
                    })}
                </Tab>
                <Tab eventKey={2} title="Request">
                    {
                        this.props.request == null ?
                            <p>No available request</p> :
                            this.renderRequest()
                    }
                </Tab>
                <Tab eventKey={3} title="Response">
                    {
                        this.props.status != "success" ?
                            <p>No available response</p> :
                            this.renderModel()
                    }
                </Tab>
            </Tabs>
        );

    }
}

module.exports = ResultPlot;