import React from 'react';
import { Row, Col, Button, SplitButton, OverlayTrigger, DropdownButton, FormGroup, Form, ControlLabel, HelpBlock, Navbar, Nav, MenuItem, NavDropdown, NavItem, Modal, Tooltip, Tabs, Tab } from 'react-bootstrap';
import Handsontable from 'handsontable/dist/handsontable.full';

import Generator from './components/Generator';
import Bus from './components/Bus';
import Consumer from './components/Consumer';
import Grid from './components/Grid';

class LoaderModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            show: this.props.show,
            selected: 0,
            selected_category: "power plant",
            sheets: this.props.sheets
        };
        this.selection = {
            row1: 0,
            col1: 0,
            row2: 0,
            col2: 0
        };

        this.sampleGenerator = new Generator();
        this.sampleGrid = new Grid();
        this.sampleBus = new Bus();
        this.sampleConsumer = new Consumer();

        this.raw = {
            generators: {},
            grids: {},
            buses: {},
            consumers: {}
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            show: nextProps.show,
            sheets: nextProps.sheets
        });
    }

    fillTable = index => {
        // display first sheet
        var sheetName = this.state.sheets.sheetName[index];
        var sheet = this.state.sheets.data[sheetName];
        var container = this.refs.table;
        this.ht = new Handsontable(container, {
            data: sheet,
            rowHeaders: true,
            colHeaders: true,
            afterSelection: this.onSelection
        });
    }

    onSelection = (row1, col1, row2, col2) => {
        this.selection = {
            row1: row1,
            col1: col1,
            row2: row2,
            col2: col2
        };
    }

    onSelectSheet = (key, obj) => {
        this.setState({ selected: key });
        this.fillTable(key);
    }

    confirm = () => {
        var components = [];
        var count = raw =>{
            var max = 0;
            for(var field in raw)
                max = Math.max(max,raw[field].length);
            return max;
        }
        var addComponent = (raw,result) =>{
            for(var i=0;i<result.length;i++)
            {
                for(var field in result[i].parameter)
                {
                    if(typeof raw[field] == "undefined") continue;
                    var value = raw[field][i];
                    if(typeof value =="undefined")
                        continue;
                    result[i].parameter[field] = raw[field][i];
                }
            }
        };

        // generators
        var generator_count = count(this.raw.generators);
        var generators = [];
        for(var i=0;i<generator_count;i++)
            generators.push(new Generator());
        addComponent(this.raw.generators,generators);

        // consumers
        var consumer_count = count(this.raw.consumers);
        var consumers = [];
        for(var i=0;i<consumer_count;i++)
            consumers.push(new Consumer());
        addComponent(this.raw.consumers,consumers);

        // grids
        var grid_count = count(this.raw.grids);
        var grids = [];
        for(var i=0;i<grid_count;i++)
            grids.push(new Grid());
        addComponent(this.raw.grids,grids);

        // buses
        var bus_count = count(this.raw.buses);
        var buses = [];
        for(var i=0;i<bus_count;i++)
            buses.push(new Bus());
        addComponent(this.raw.buses,buses);

        // combine
        components = components.concat(generators,consumers,grids,buses);
        console.log("save");
        console.log(components);
        // callback
        this.props.confirm(components);
        this.props.close();
    }

    renderDropdown = () => {
        if (this.state.sheets.length != 0) {
            return this.state.sheets.sheetName.map((item, i) => {
                return <MenuItem key={i} eventKey={i}>{item}</MenuItem>;
            });
        }
        else
            return <MenuItem eventKey={1}>Empty</MenuItem>;
    }

    setSelected = (target, arrayinput) => {
        var selected_sheet = this.state.sheets.sheetName[this.state.selected];
        var selected_sheet_data = this.state.sheets.data[selected_sheet];
        if (this.selection.row1 == this.selection.row2) {
            // select row
            var add = Math.abs(this.selection.row2 - this.selection.row1) == selected_sheet_data[this.selection.row1].length-1 ? 1 : 0;
            for (var i = this.selection.col1 + add; i <= this.selection.col2; i++)
                if (arrayinput)
                {
                    var value = selected_sheet_data[this.selection.row1][i];
                    if(typeof value == "number")
                        target.push([value]);
                    else
                        target.push(value.split(';').map(Number));
                }
                else
                    target.push(selected_sheet_data[this.selection.row1][i]);
        }
        else if (this.selection.col1 == this.selection.col2) {
            // select col
            var add = Math.abs(this.selection.row2 - this.selection.row1) == selected_sheet_data.length-1 ? 1 : 0;
            for (var i = this.selection.row1 + add; i <= this.selection.row2; i++)
                if (arrayinput)
                {
                    var value = selected_sheet_data[i][this.selection.col1];
                    if(typeof value == "number")
                        target.push([value]);
                    else
                        target.push(value.split(';').map(Number));
                }
                else
                    target.push(selected_sheet_data[i][this.selection.col1]);
        }
    }

    renderData = (result, sample) => {
        var renderContent = [];
        for (var field in sample.parameter) {
            var name = sample.description[field];
            var value = sample.parameter[field];
            var arrayinput = typeof value != "number";
            renderContent.push({ name: name, field_name:field, value: value, arrayinput: arrayinput });
        }
        return (renderContent.map((item, i) => {
            return <MenuItem key={i} eventKey={i} onClick={() => {
                result[item.field_name] = [];
                this.setSelected(result[item.field_name], item.arrayinput);
            }}>{item.name}</MenuItem>
        }));
    }

    renderDataPanel = () => {
        // Generator | Bus | Consumer | Grid
        return (
            <div>
                <DropdownButton bsStyle='primary' title='Generator' id='select_generator' onSelect={this.onSelectGenerator}>
                    {this.renderData(this.raw.generators, this.sampleGenerator)}
                </DropdownButton>
                <DropdownButton bsStyle='primary' title='Consumer' id='select_consumer' onSelect={this.onSelectGenerator}>
                    {this.renderData(this.raw.consumers, this.sampleConsumer)}
                </DropdownButton>
                <DropdownButton bsStyle='primary' title='Bus' id='select_bus' onSelect={this.onSelectGenerator}>
                    {this.renderData(this.raw.buses, this.sampleBus)}
                </DropdownButton>
                <DropdownButton bsStyle='primary' title='Grid' id='select_grid' onSelect={this.onSelectGenerator}>
                    {this.renderData(this.raw.grids, this.sampleGrid)}
                </DropdownButton>
            </div>
        );
    }

    render() {
        return (
            <Modal onEnter={() => this.fillTable(0)} show={this.state.show} onHide={this.props.close}>
                <Modal.Header closeButton>
                    <Modal.Title>Loader Configuration</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <DropdownButton bsStyle='primary'
                        title={this.state.sheets.length != 0 ?
                            this.state.sheets.sheetName[this.state.selected] :
                            "Empty"}
                        id='select_sheet' onSelect={this.onSelectSheet}>
                        {this.renderDropdown()}
                    </DropdownButton>
                    <div ref='table' style={{ width: 550, height: 200, overflow: "hidden" }} />
                    <hr />
                    <ControlLabel>Click dropdown button to set selected data</ControlLabel>
                    {this.renderDataPanel()}
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.confirm}>Confirm</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

module.exports = LoaderModal;
