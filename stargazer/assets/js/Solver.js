import axios from 'axios';
import React from 'react';

import { Grid, Row, Modal, Col, Button, Panel, Tabs, Tab, Navbar, Nav, MenuItem, NavDropdown, NavItem } from 'react-bootstrap';

var chartColors = {
    red: 'rgb(255, 99, 132)',
    orange: 'rgb(255, 159, 64)',
    yellow: 'rgb(255, 205, 86)',
    green: 'rgb(75, 192, 192)',
    blue: 'rgb(54, 162, 235)',
    purple: 'rgb(153, 102, 255)',
    grey: 'rgb(201, 203, 207)'
};

class Solver {
    constructor(addPanel, removePanel) {
        // callback method used to add panel
        // returns an index can be used to remove the panel
        // e.g var index = this.addPanel(<SomePanel props.... >);
        this.addPanel = addPanel;
        // callback method used to remove panel, removePanel(index)
        this.removePanel = removePanel;
        this.state = {
            data: []
        };
        this.plotid = null;
        this.result = null;
    }

    solve = (boardData, row, col, components, finish, model) => {
        this.processed = this.process(boardData, row, col, components, model);
        this.processed.model = model;
        console.log(this.processed);
        var requestData = JSON.stringify(this.processed); // the borad data posted to backend
        //console.log(requestData);
        var url = '/solve';
        if(model == "basic") url='/solvebasic';
        if(model == "network") url='/solvenetwork';
        if(model == "network elastic") url='/solvenetworkelastic';
        axios.post(url, { "boardData": requestData }) // with the relative path
            .then(response => {
                if (response.status == 200) {
                    console.log(response.data);
                    this.time = response.data['time'];
                    this.result = response.data;
                    finish(response.data, this.processed);
                } else
                    finish({ status: "failed" }, this.processed);
            })
            .catch(error=> {
                finish({ status: "failed" }, this.processed);
                console.log(error);
            });
    }

    onSelect = (type, id) => {
        // // type : "power plant" | "grid" | "consumer" | "bus"
        // // id
        if (this.result == null)
            return;
        if (!this.result.hasOwnProperty("generators-p"))
            return;
        if (this.plotid != null)
            this.removePanel(this.plotid);
        if (type == "power plant") {
            this.plotid = this.plotGenerator(id);
        }

    }

    plotAll = () => {
        this.plotGenerators();
        this.plotBuses();
        this.plotLines();
        this.plotLoad();
    }

    plotGenerators = () => {
        var count = Object.keys(this.result.generators.control).length;
        for (var i = 0; i < count; i++)
            this.plotGenerator(i);
    }

    plotBuses = () => {

    }

    plotLines = () => {

    }

    plotLoad = () => {

    }

    plotGenerator = id => {
        var field = "Power Plant " + String(id);
        var power = [];
        var time = [];
        if (this.result["generators-p"].hasOwnProperty(field)) {
            for (var key in this.result["generators-p"][field]) {
                time.push(key);
                power.push(this.result["generators-p"][field][key]);
            }
            console.log(power);
            console.log(time);
        }
        else {
            power.push(0);
            time.push(0);
        }
        // add plot
        return this.plot(time, power, field);
    }

    plot = (labels, data, title) => {
        return this.addPanel(<PlotPanel
            title={title}
            data={{
                labels: labels,
                datasets: [
                    {
                        label: title,
                        data: data,
                        backgroundColor: 'rgba(54, 162, 235,0.7)',
                        borderColor: chartColors.blue,
                        borderWidth: 1,
                    }
                ]

            }}
            options={{ maintainAspectRatio: false }} />);
    }

    process = (boardData, row, col, components, model) => {
        var parsed = {};
        //console.log(boardData);
        //{
        //    id: 0,
        //    connection: [], // bus id | grid id for bus
        //    parameter: { }
        //}

        for (var i = 0; i < components.length; i++) {
            if (typeof parsed[components[i].type] == "undefined")
                parsed[components[i].type] = [];
            parsed[components[i].type].push({
                id: components[i].id,
                type: components[i].type,
                connection: [],
                parameter: components[i].parameter
            });
        }

        if(typeof parsed.bus == "undefined") parsed.bus = [];
        if(typeof parsed.grid == "undefined") parsed.grid = [];
        if(typeof parsed.generator == "undefined") parsed.generator = [];
        if(typeof parsed.consumer == "undefined") parsed.consumer = [];

        // parsed
        var getComponentById = id => {
            for (var field in parsed)
                for (var i = 0; i < parsed[field].length; i++)
                    if (parsed[field][i].id == id)
                        return parsed[field][i];
            if(id=="grid")
                return {type:"grid",connection:[]};
            return null;
        }

        var attachGridToBus = (component_id, grid_id) => {
            var component = getComponentById(component_id);
            var grid = getComponentById(grid_id);
            // attach bus and grid
            if (component.type == "bus") {
                if (component.connection.indexOf(grid_id) == -1)
                    component.connection.push(grid_id);
                if (grid.connection.indexOf(component.id) == -1)
                    grid.connection.push(component.id);
            }
        };

        var attachComponentToBus = (component_id, grid_id) => {
            var component = getComponentById(component_id);
            //console.log(component.type);
            // attach component and bus
            if (component.type == "generator" || component.type == "consumer") {
                
                var buses = parsed.bus.filter(x => x.connection.indexOf(grid_id) != -1);
                for (var i = 0; i < buses.length; i++)
                    if (component.connection.indexOf(buses[i].id) == -1)
                        component.connection.push(buses[i].id);
            }
        };

        var attach = [attachGridToBus, attachComponentToBus];

        for (var k = 0; k < attach.length; k++) {
            for (var i = 0; i < row; i++) {
                for (var j = 0; j < col; j++) {
                    var node = boardData[j + i * row];
                    if(node.empty) continue;
                    var id = node.id;
                    var component = getComponentById(id);
                    if (component.type == "grid") {
                        if (node.connect.up && !boardData[j + i * row - col].empty)
                            attach[k](boardData[j + i * row - col].id, id)
                        if (node.connect.down && !boardData[j + i * row + col].empty)
                            attach[k](boardData[j + i * row + col].id, id)
                        if (node.connect.right && !boardData[j + 1 + i * row].empty)
                            attach[k](boardData[j + 1 + i * row].id, id)
                        if (node.connect.left && !boardData[j - 1 + i * row].empty)
                            attach[k](boardData[j - 1 + i * row].id, id)
                    }
                }
            }
        }

        parsed.grid = parsed.grid.filter(x => x.connection.length>=2);

        return parsed;
    }
    // demo plot
    // more demo can be found at
    // https://github.com/gor181/react-chartjs-2/tree/master/example/src/components
    // modify PlotPanel if needed
    showDemo = () => {
        this.addPanel(<PlotPanel
            data={{
                labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
                datasets: [
                    {
                        label: 'My First dataset',
                        backgroundColor: 'rgba(255,99,132,0.2)',
                        borderColor: 'rgba(255,99,132,1)',
                        borderWidth: 1,
                        hoverBackgroundColor: 'rgba(255,99,132,0.4)',
                        hoverBorderColor: 'rgba(255,99,132,1)',
                        data: [65, 59, 80, 81, 56, 55, 40]
                    }
                ]
            }}
            options={{
                responsive: true,
                maintainAspectRatio: false
            }} />);
    }

}

module.exports = Solver;
