import React from 'react';
import { Panel, Row, Col, Button, SplitButton, OverlayTrigger, DropdownButton, FormGroup, Form, ControlLabel, HelpBlock, Navbar, Nav, MenuItem, NavDropdown, NavItem, Modal, Tooltip, Tabs, Tab } from 'react-bootstrap';

class StartModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            show: true,
            selected: null,
            model: null
        };
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

    onSelect = e => {
        var model = "basic";
        if (e == 2)
            model = "network";
        if (e == 3)
            model = "network elastic";
        if (e == 4)
            model = "stochastic";
        this.setState({
            selected: e,
            model: model
        });
    }

    renderBasic = () => {
        //katex.render()
        return (
            <div>
                <h5> Basic Economic Dispatch </h5>
                <h6> Cost Rule: </h6>
                <span style={{ fontSize: "15pt" }} ref={r => {
                    if (this.state.show && this.state.selected == 1)
                        katex.render("\\sum_{t}  \\sum_{i} c_i \\cdot p_{i,t} ", r)
                }} />
                <h6> Unit Rule </h6>
                <span style={{ fontSize: "15pt" }} ref={r => {
                    if (this.state.show && this.state.selected == 1)
                        katex.render("\\sum_{i}  p_{i,t}  = \\sum_j l_{t,t} ", r)
                }} />
                <h6> Balance Rule </h6>
                <span style={{ fontSize: "15pt" }} ref={r => {
                    if (this.state.show && this.state.selected == 1)
                        katex.render("p_{i}^{min} \\leq p_{i,t} \\leq p_{i}^{max}", r)
                }} />
            </div>
        );
    }

    renderNetwork = () => {
        return (
            <div>
                <h5> Network Constrained Unit Commitment (basic) </h5>
                <h6> Cost Rule: </h6>
                <span style={{ fontSize: "15pt" }} ref={r => {
                    if (this.state.show && this.state.selected == 2)
                        katex.render("  \\sum_{t} \\sum_i \\sum_n  c_{i}  \\cdot {p}_{i,t,n }   + \\sum_{t}  \\left(c_{i,t,n}^{sd} + c_{i,t,n}^{su} \\right)", r)
                }} />
              <h6> Constrained to:</h6>
                <span style={{ fontSize: "15pt" }} ref={r => {
                    if (this.state.show && this.state.selected == 2)
                        katex.render("\\sum_l K_{nl} f_{l,t} =    \\sum_i {p}_{i,t,n}  - \\sum_j {l}_{j,t,n}", r)
                }} />
              <br/>
                <span style={{ fontSize: "15pt" }} ref={r => {
                    if (this.state.show && this.state.selected == 2)
                        katex.render("f_{l,t} = \\left| \\frac{\\theta_{n,t} - \\theta_{m,t} }{x_l} \\right|", r)
                }} />
                  <br/>
                <span style={{ fontSize: "15pt" }} ref={r => {
                    if (this.state.show && this.state.selected == 2)
                        katex.render("  f_{l,t} \\leq F_l", r)
                }} />
                  <br/>
                <span style={{ fontSize: "15pt" }} ref={r => {
                    if (this.state.show && this.state.selected == 2)
                        katex.render("u_{i,t,n} \\cdot p_{i,n}^{min} \\leq p_{i,t,n} \\leq   u_{i,t,n} \\cdot p_{i,n}^{max}", r)
                }} />
                <br/>
                <span style={{ fontSize: "15pt" }} ref={r => {
                    if (this.state.show && this.state.selected == 2)
                        katex.render("\\sum_{t'=t}^{t+t^{mu}} u_{i,t',n} \\geq t^{mu} (u_{i,t,n} - u_{i,t-1,n}) ", r)
                }} />
                <br/>
                <span style={{ fontSize: "15pt" }} ref={r => {
                    if (this.state.show && this.state.selected == 2)
                        katex.render("\\sum_{t'=t}^{t+t^{md}} (1-u_{i,t',n}) \\geq t^{md} (u_{i,t-1,n} - u_{i,t,n})", r)
                }} />
                <br/>
                <span style={{ fontSize: "15pt" }} ref={r => {
                    if (this.state.show && this.state.selected == 2)
                        katex.render(" -rd_{i,n}  \\leq (p_{i,t,n} - p_{i,t-1,n}) \\leq ru_{i,n}", r)
                }} />
                <br/>
                <span style={{ fontSize: "15pt" }} ref={r => {
                    if (this.state.show && this.state.selected == 2)
                        katex.render(" c_{i,t,n}^{sd} \\geq c_{i,n}^{sd} (u_{i,t-1,n} - u_{i,t,n})  ", r)
                }} />
                <br/>
                <span style={{ fontSize: "15pt" }} ref={r => {
                    if (this.state.show && this.state.selected == 2)
                        katex.render("   c_{i,t,n}^{su} \\geq c_{i,n}^{su} (u_{i,t,n} - u_{i,t-1,n})    ", r)
                }} />
            </div>
        );
    }

    renderNetworkElastic = () => {

        return "network elastic";
    }

    renderStochastic = () => {

        return "stochastic";
    }

    renderDescription = i => {
        if (i == 1)
            return this.renderBasic();
        if (i == 2)
            return this.renderNetwork();
        if (i == 3)
            return this.renderNetworkElastic();
        if (i == 4)
            return this.renderStochastic();
    }

    confirm = () => {
        this.setState({ show: false });
        this.props.onSelect(this.state.model);
    }

    onSelectLoad = e =>{
        if(e==1)
        {
            this.props.load();
        }
        if(e==2)
        {
            var session = prompt("Please enter your session id", "");
            this.props.load(session);
        }
        this.setState({ show: false });
    }

    render() {
        return (
            <Modal show={this.state.show}>
                <Modal.Header>
                    <Modal.Title>Welcome</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h5>Please select one of the following models</h5>
                    <DropdownButton bsStyle='default' title="Models" id='select_model' onSelect={this.onSelect}>
                        <MenuItem eventKey={1}>Basic Economic Dispatch</MenuItem>
                        <MenuItem eventKey={2}>Network Constrained Unit Commitment (basic)</MenuItem>
                        <MenuItem eventKey={3} disabled>Network Constrained Unit Commitment (piecewise constant)</MenuItem>
                        <MenuItem eventKey={4} disabled>Stochastic</MenuItem>
                    </DropdownButton>
                    {this.state.selected ?
                        <Panel>
                            {this.renderDescription(this.state.selected)}
                        </Panel> :
                        <div>
                            <h5>Or continue from last time</h5>
                            <DropdownButton bsStyle='default' title="Load" id='select_load' onSelect={this.onSelectLoad}>
                                <MenuItem eventKey={1}>from Local</MenuItem>
                                <MenuItem eventKey={2}>from Remote</MenuItem>
                            </DropdownButton>
                        </div>}
                </Modal.Body>
                <Modal.Footer>
                    {this.state.selected ? <Button onClick={this.confirm}>Confirm</Button> : null}
                </Modal.Footer>
            </Modal>
        );
    }
}

module.exports = StartModal;
