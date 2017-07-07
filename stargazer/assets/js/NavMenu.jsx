import React from 'react';
import { Grid, Row, Col, Button, SplitButton, OverlayTrigger, Navbar, Nav, MenuItem, NavDropdown, NavItem, Modal, Tooltip, DropdownButton, ButtonToolbar, Dropdown, Glyphicon, Image, FormControl } from 'react-bootstrap';

class NavMenu extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showAbout: false,
            session: 1
        }
        this.StatusStyle = {
            open: "info",
            success: "success",
            failed: "danger"
        };
        this.Status = {
            open: "Optimization Open",
            success: "Optimization Success",
            failed: "Optimization Failed"
        };
    }

    render() {
        var icon = (
            <span class="logo">
                <a href="/">
                    <img src="/image/logo.png" height="33" width="120" alt="home" /></a>
            </span>
        );

        return (
            <Navbar collapseOnSelect style={{ zIndex: 3 }}>
                <Navbar.Header>
                    <Navbar.Brand>
                        <a href="#">  <img src="static/images/logo.png" height="32" width="32" alt="home" /></a>
                    </Navbar.Brand>
                    <Navbar.Brand>
                        <a href="#">Stargazer</a>
                    </Navbar.Brand>
                    <Navbar.Toggle />
                </Navbar.Header>
                <Nav onSelect={this.props.handleMenu}>
                    <NavDropdown eventKey={1} title="File" id="File">
                        <MenuItem eventKey={1.1}>Open Project</MenuItem>
                        <MenuItem eventKey={1.2}>Save Project</MenuItem>
                        <MenuItem divider />
                        <MenuItem eventKey={1.3}>Import From Excel</MenuItem>
                        <MenuItem eventKey={1.4} disabled>General Settings</MenuItem>
                    </NavDropdown>
                    <NavDropdown eventKey={2} title="Session" id="Session">
                        <MenuItem eventKey={2.1}>Open Project</MenuItem>
                        <MenuItem eventKey={2.2}>Save Project</MenuItem>
                        <MenuItem eventKey={2.3}>Delete Project</MenuItem>
                        <MenuItem divider />
                        <MenuItem disabled>
                            Session ID : <FormControl
                                ref="session"
                                bsSize="small"
                                type="text"
                                id="session id"
                                placeholder="Enter session id"
                                onChange={e => this.props.setSession(e.target.value)}
                            />
                        </MenuItem>
                    </NavDropdown>
                </Nav>
                <Nav pullRight onSelect={() => { this.setState({ showAbout: true }) }}>
                    <NavItem eventKey={4} href="#">About</NavItem>
                </Nav>

                <ButtonToolbar style={{ paddingTop: 12 }}>
                    <Dropdown bsSize="small" id="Run">
                        <Button bsStyle="success" onClick={e => { this.props.handleMenu(10.0); }}>
                            <Glyphicon glyph="triangle-right" />
                            Run
                        </Button>
                        <Dropdown.Toggle bsStyle="success" />
                        <Dropdown.Menu onSelect={e => { this.props.handleMenu(e); }}>
                            <MenuItem eventKey="0.1" active={this.props.model == "basic"}>Basic Economic Dispatch</MenuItem>
                            <MenuItem eventKey="0.2" active={this.props.model == "network"}>Network Constrained Unit Commitment (basic)</MenuItem>
                            <MenuItem eventKey="0.3" disabled active={this.props.model == "network elastic"}>Network Constrained Unit Commitment (piecewise constant)</MenuItem>
                            <MenuItem eventKey="0.4" disabled active={this.props.model == "stochastic"}>Stochastic</MenuItem>
                        </Dropdown.Menu>
                    </Dropdown>

                    <Dropdown className="pull-right" bsSize="small" id="Run">
                        <Button bsSize="small" bsStyle={this.props.loading ? "warning" : this.StatusStyle[this.props.status]} onClick={e => { console.log("clicked") }}>
                            {this.props.loading ? <div><img src="/static/images/loading.gif" height="15" width="15" alt="loading" />Optimizing</div> : this.Status[this.props.status]}
                        </Button>
                        <Dropdown.Toggle bsStyle={this.props.loading ? "warning" : this.StatusStyle[this.props.status]} />
                        {this.props.model == "basic" ?
                            <Dropdown.Menu onSelect={e => { this.props.handleMenu(e); }}>
                                <MenuItem eventKey="9.1" disabled>Result already shown in output</MenuItem>
                            </Dropdown.Menu>
                            : null}
                        {this.props.model == "network" ?
                            <Dropdown.Menu onSelect={e => { this.props.handleMenu(e); }}>
                                <MenuItem eventKey="10.1" disabled={this.props.status != "success"}>Plot All</MenuItem>
                                <MenuItem eventKey="10.2" disabled={this.props.status != "success"}>Plot Generators</MenuItem>
                                <MenuItem eventKey="10.3" disabled={this.props.status != "success"}>Plot Load</MenuItem>
                            </Dropdown.Menu>
                            : null}
                        {this.props.model == "network elastic" ?
                            <Dropdown.Menu onSelect={e => { this.props.handleMenu(e); }}>
                                <MenuItem eventKey="11.1" disabled={this.props.status != "success"}>Plot All</MenuItem>
                                <MenuItem eventKey="11.2" disabled={this.props.status != "success"}>Plot Generators</MenuItem>
                                <MenuItem eventKey="11.3" disabled={this.props.status != "success"}>Plot Load</MenuItem>
                            </Dropdown.Menu>
                            : null}
                        {this.props.model == "stochastic" ?
                            <Dropdown.Menu onSelect={e => { this.props.handleMenu(e); }}>
                                <MenuItem eventKey="12.1" disabled={this.props.status != "success"}>Plot All</MenuItem>
                                <MenuItem eventKey="12.2" disabled={this.props.status != "success"}>Plot Generators</MenuItem>
                                <MenuItem eventKey="12.3" disabled={this.props.status != "success"}>Plot Buses</MenuItem>
                                <MenuItem eventKey="12.4" disabled={this.props.status != "success"}>Plot Lines</MenuItem>
                                <MenuItem eventKey="12.5" disabled={this.props.status != "success"}>Plot Load</MenuItem>
                            </Dropdown.Menu>
                            : null}

                    </Dropdown>

                    <p className="pull-right" style={{ paddingTop: 3 }}>Status:</p>
                </ButtonToolbar>
                <Modal show={this.state.showAbout} onHide={() => { this.setState({ showAbout: false }) }}>
                    <Modal.Header closeButton>
                        <Modal.Title>About power optimizer</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                    	<h4>Made by Martyn van Dijke </h4>
                    	<h6>for more information vist : <a href="https://github.com/martynvandijke/Stargazer">github</a></h6>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={() => { this.setState({ showAbout: false }) }}>Close</Button>
                    </Modal.Footer>
                </Modal>
            </Navbar>
        );
    }
}

module.exports = NavMenu;
