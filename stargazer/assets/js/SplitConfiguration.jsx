import React from 'react';
import { ControlLabel, Button, FormGroup, FormControl, Tabs, Tab, Navbar, Nav, MenuItem, NavDropdown, ButtonGroup, NavItem, DropdownButton, Glyphicon } from 'react-bootstrap';

import Generator from './components/Generator';
import Bus from './components/Bus';
import Consumer from './components/Consumer';
import Grid from './components/Grid';

class SplitConfiguration extends React.Component {

    constructor(props) {
        super(props);
        this.sampleGenerator = new Generator();
        this.sampleGrid = new Grid();
        this.sampleBus = new Bus();
        this.sampleConsumer = new Consumer();
        this.state = {
            model: this.props.model,
            configured: this.props.configured,
            onConfiguration: this.props.configurationEnable,
            tab: 1
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ 
            model: nextProps.model, 
            configured: nextProps.configured,
            onConfiguration: nextProps.configurationEnable
        });
    }

    componentDidMount() {

    }

    componentDidUpdate() {

    }

    onFormComplete = e => {
        if (e.preventDefault) e.preventDefault();
        var sample = {};
        var component = {};
        if (this.state.tab == 1) {
            sample = this.sampleGenerator;
            component = new Generator();
        }
        if (this.state.tab == 2) {
            sample = this.sampleGrid;
            component = new Grid();
        }
        if (this.state.tab == 3) {
            sample = this.sampleBus;
            component = new Bus();
        }
        if (this.state.tab == 4) {
            sample = this.sampleConsumer;
            component = new Consumer();
        }

        var form = e.target.elements;
        var parameter = {};
        for (var i = 0; i < form.length; i++) {
            var name = form[i].name;
            var value = form[i].value;
            for (var field in sample.description) {
                if (name == sample.description[field]) {
                    var arrayinput = typeof sample.parameter[field] != "number";
                    if (arrayinput) {
                        if (this.state.model == "basic" && sample.parameter[field].length == 1)
                            parameter[field] = [Number(value)];
                        else
                            parameter[field] = value.split(',').map(Number);
                    }
                    else
                        parameter[field] = Number(value);
                }
            }
        }
        component.parameter = { ...sample.parameter, ...parameter };
        this.props.onadd(component);
        return false;
    }

    onFormCompleteConfig = e => {
        if (e.preventDefault) e.preventDefault();
        var sample = this.state.configured;

        var form = e.target.elements;
        var parameter = {};
        for (var i = 0; i < form.length; i++) {
            var name = form[i].name;
            var value = form[i].value;
            for (var field in sample.description) {
                if (name == sample.description[field]) {
                    var arrayinput = typeof sample.parameter[field] != "number";
                    if (arrayinput) {
                        if (this.state.model == "basic" && sample.parameter[field].length == 1)
                            parameter[field] = [Number(value)];
                        else
                            parameter[field] = value.split(',').map(Number);
                    }
                    else
                        parameter[field] = Number(value);
                }
            }
        }
        sample.parameter = { ...sample.parameter, ...parameter };
        //sample.id = Number(form.ID.value);
        this.setState({ onConfiguration: false });
        this.props.onchange(sample);
        return false;
    }

    renderTab = (sample, config) => {
        var renderContent = [];
        if (config && sample == null) return "";
        for (var field in sample.parameter) {
            var name = sample.description[field];
            var value = sample.parameter[field];
            var arrayinput = typeof value != "number";
            if (sample.model[field].indexOf(this.state.model) != -1)
                renderContent.push({ name: name, value: value, arrayinput: arrayinput });
        }
        return (
            <form onSubmit={config ? this.onFormCompleteConfig : this.onFormComplete}>
                <FormGroup controlId="Parameter">
                    {config ?
                        <div>
                            <ControlLabel>ID</ControlLabel>
                            <FormControl name="ID" type="number" value={sample.id} disabled/>
                        </div> : null}
                    {renderContent.map((item, i) => {
                        if (item.arrayinput) {
                            if (this.state.model == "basic" && item.value.length == 1) {
                                return (<div key={item.name} >
                                    <ControlLabel>{item.name}</ControlLabel>
                                    <FormControl name={item.name} type="number" defaultValue={item.value} />
                                </div>)
                            }
                            else {
                                return (<div key={item.name}>
                                    <ControlLabel>{item.name}</ControlLabel> <br />
                                    array input, seprate with ,
                                    <FormControl name={item.name} type="text" defaultValue={item.value} />
                                </div>)
                            }
                        }
                        else {
                            return (<div key={item.name}>
                                <ControlLabel>{item.name}</ControlLabel>
                                <FormControl name={item.name} type="number" defaultValue={item.value} />
                            </div>)
                        }
                    })}
                </FormGroup>
                {renderContent.length != 0 ? <Button type="submit">{config ? "Save" : "Add"}</Button> : null}
                {this.state.onConfiguration ? <Button className="pull-right" onClick={() => this.setState({ onConfiguration: false })}>Cancel</Button> : null}
            </form>);
    }

    render() {
        if (this.state.onConfiguration)
            return this.renderTab(this.state.configured, true);
        return (
            <Tabs className="small_tab" activeKey={this.state.tab} onSelect={key => this.setState({ tab: key })} id="select_category">
                <Tab eventKey={1} title="Generator">
                    {this.renderTab(this.sampleGenerator)}
                </Tab>
                <Tab eventKey={2} title="Grid">
                    {this.renderTab(this.sampleGrid)}
                </Tab>
                <Tab eventKey={3} title="Bus">
                    {this.renderTab(this.sampleBus)}
                </Tab>
                <Tab eventKey={4} title="Consumer">
                    {this.renderTab(this.sampleConsumer)}
                </Tab>
            </Tabs>
        );
    }
}

module.exports = SplitConfiguration;
