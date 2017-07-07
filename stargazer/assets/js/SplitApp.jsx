import React from 'react';
import { Alert, Grid, Row, Col, Modal, Button, Panel, FormControl, Tabs, Tab, Navbar, Nav, MenuItem, NavDropdown, ButtonGroup, NavItem, DropdownButton, Glyphicon } from 'react-bootstrap';
import SplitPane from 'react-split-pane';
import NavMenu from './NavMenu';
import SplitWorkbench from './SplitWorkbench';
import SplitToolbox from './SplitToolbox';
import SplitConfiguration from './SplitConfiguration';
import StartModal from './StartModal';
import Component from './components/Component';
import ResultPlot from './ResultPlot';

import Solver from './Solver';
import Loader from './Loader';
import LoaderModal from './LoaderModal';
import JSZip from "jszip";
import JSZipUtils from 'jszip-utils';

import axios from 'axios';

const EModes = {
    Normal: 0,
    DragAdd: 1,
    DragMove: 2,
    GridDraw: 3,
    GridDrawing: 4,
    GridErase: 5,
    GridErasing: 6
}

class SplitApp extends React.Component {
    constructor(props) {
        super(props);
        window.addEventListener("resize", () => {
            this.setState({
                width: window.innerWidth,
                height: window.innerHeight
            })
        });
        this.state = {
            width: window.innerWidth,
            height: window.innerHeight,
            splitYoffset1: (window.innerHeight - 55) * 0.75 * 0.5,
            splitYoffset2: (window.innerHeight - 55) * 0.75,
            splitXoffset: window.innerWidth * 0.75,
            row: 30,
            col: 100,
            mode: EModes.Normal,
            model: "network",
            status: "open",
            components: [],
            configured: null,
            selected: null,
            selectedRotation: 0,
            currentGrid: null,
            loading: false,
            parsed: null,
            result: null,
            showConfig: false,
            configurationEnable: false,
            showLoader: false,
            sheets: [],
            workbench: null
        }

        this.loader = new Loader();
        this.project = {
            model: this.state.model,
            time: new Date().toLocaleString(),
            status: this.state.status,
            row: this.state.row,
            col: this.state.col,
            result: {}
        }

        this.solver = new Solver();
        window.log = this.log;
    }

    componentDidMount() {
        const ele = document.getElementById('loading');
        if (ele) {
            setTimeout(() => {
                ele.outerHTML = ''
            }, 1000)
        };
    }

    onToolboxSelect = (id, rotation) => {
        //console.log("selected " + id);
        if (id == "pen")
            this.setState({
                currentGrid: null,
                mode: EModes.GridDraw
            });
        else if (id == "eraser")
            this.setState({ mode: EModes.GridErase });
        else if (id == "pointer")
            this.setState({ mode: EModes.Normal });
        else {
            var component = this.getComponentById(id);
            if (component.type == "grid") {
                this.setState({
                    currentGrid: component,
                    mode: EModes.GridDraw
                });
            }
            else
                this.setState({
                    selected: id,
                    selectedRotation: rotation,
                    mode: EModes.DragAdd
                })
        }

    }

    onToolboxRemove = id => {
        console.log("removed " + id);
        this.setState({ components: this.state.components.filter(item => item.id != id) });
    }

    getComponentById = id => {
        if (id == "grid")
            return { type: "grid" };
        return this.state.components.filter(item => item.id == id)[0];
    }

    handleMenu = select => {
        if (select == 0.1) {
            this.setState({ model: "basic" , status : "open" });
        }

        if (select == 0.2) {
            this.setState({ model: "network" , status : "open"});
        }

        if (select == 0.3) {
            this.setState({ model: "network elastic" , status : "open"});
        }

        if (select == 0.4) {
            this.setState({ model: "stochastic" , status : "open"});
        }

        // workbench layout                        | this.state.workbench
        // toolbox data                            | this.state.components
        // parsed connections                      | this.state.parsed
        // result                                  | this.state.result
        // project                                 | this.project

        // Open Project
        if (select == 1.1) {
            // Open project
            this.file.onchange = e => {
                if (e.target.files[0] == "") return;
                JSZip.loadAsync(e.target.files[0]).then(
                    zip => {
                        zip.file("components.json").async("string").then(content => {
                            var components = JSON.parse(content);
                            this.setState({ components: components,status: "open" },
                                () => {
                                    //console.log(this.state.components);
                                    zip.file("project.json").async("string").then(content => {
                                        this.project = JSON.parse(content);
                                        this.setState({
                                            model: this.project.model,
                                            status: this.project.status,
                                            row: this.project.row,
                                            col: this.project.col
                                        });
                                        zip.file("workbench.json").async("string").then(content => {
                                            var workbench = JSON.parse(content);
                                            this.load(workbench);
                                            this.setState({ workbench: workbench });
                                        });
                                    });
                                });
                            //console.log(components[0]._get_id());
                            var offset_id = 0
                            for (var i = 0; i < components.length; i++)
                                offset_id = Math.max(0, components[i].id);
                            for (var i = 0; i <= offset_id; i++)
                                new Component().id;

                        });
                        zip.file("result.json").async("string").then(content => { var result = JSON.parse(content); this.setState({ result: result }); });
                        zip.file("parsed.json").async("string").then(content => { var parsed = JSON.parse(content); this.setState({ parsed: parsed }) });
                    });
                this.file.value = "";
            }
            this.file.click();
        }

        // Save Project
        if (select == 1.2) {
            // Save project
            var zip = new JSZip();
            this.project = {
                model: this.state.model,
                time: new Date().toLocaleString(),
                status: this.state.status,
                row: this.state.row,
                col: this.state.col,
                result: {}
            }
            zip.file("project.json", JSON.stringify(this.project));
            zip.file("workbench.json", JSON.stringify(this.state.workbench));
            zip.file("parsed.json", JSON.stringify(this.state.parsed));
            zip.file("result.json", JSON.stringify(this.state.result));
            zip.file("components.json", JSON.stringify(this.state.components));
            zip.generateAsync({ type: "blob" })
                .then(function (content) {
                    saveAs(content, new Date().toLocaleDateString().replace('/', '-') + ".po");
                });
        }

        // Import from Local
        if (select == 1.3) {
            this.file.onchange = e => {
                if (e.target.files[0] == "") return;
                this.loader.readFile(e, workbench => {
                    this.load(workbench);
                },
                    sheets => {
                        this.setState({
                            showLoader: true,
                            sheets: sheets
                        });
                    });
                this.file.value = "";
            }
            this.file.click();
        }

        // General Settings
        if (select == 1.4) {
            this.setState({ showConfig: true });
        }

        // Open Session
        if (select == 2.1) {
            console.log(this.session);
            axios.post('/session', { hash: this.session })
                .then(response => {
                    if (response.status == 200) {
                        var byteString = atob(response.data.data.split(',')[1]);
                        // separate out the mime component
                        var mimeString = response.data.data.split(',')[0].split(':')[1].split(';')[0]
                        // write the bytes of the string to an ArrayBuffer
                        var ab = new ArrayBuffer(byteString.length);
                        var ia = new Uint8Array(ab);
                        for (var i = 0; i < byteString.length; i++) {
                            ia[i] = byteString.charCodeAt(i);
                        }
                        // write the ArrayBuffer to a blob, and you're done
                        var data = new Blob([ab]);
                        JSZip.loadAsync(data).then(zip => {
                            zip.file("components.json").async("string").then(content => {
                                var components = JSON.parse(content);
                                this.setState({ components: components,status: "open" },
                                    () => {
                                        zip.file("project.json").async("string").then(content => {
                                            this.project = JSON.parse(content);
                                            this.setState({
                                                model: this.project.model,
                                                status: this.project.status,
                                                row: this.project.row,
                                                col: this.project.col
                                            });
                                            zip.file("workbench.json").async("string").then(content => {
                                                var workbench = JSON.parse(content);
                                                this.load(workbench);
                                                this.setState({ workbench: workbench });
                                            });
                                        });
                                    });
                                var offset_id = 0
                                for (var i = 0; i < components.length; i++)
                                    offset_id = Math.max(0, components[i].id);
                                for (var i = 0; i <= offset_id; i++)
                                    new Component().id;
                            });
                            zip.file("result.json").async("string").then(content => { var result = JSON.parse(content); this.setState({ result: result }); });
                            zip.file("parsed.json").async("string").then(content => { var parsed = JSON.parse(content); this.setState({ parsed: parsed }) });
                        });
                    }
                })
                .catch(function (error) {
                    console.log(error);
                });
        }

        // Save Session
        if (select == 2.2) {
            // Save project
            var zip = new JSZip();
            this.project = {
                model: this.state.model,
                time: new Date().toLocaleString(),
                status: this.state.status,
                row: this.state.row,
                col: this.state.col,
                result: {}
            }
            zip.file("project.json", JSON.stringify(this.project));
            zip.file("workbench.json", JSON.stringify(this.state.workbench));
            zip.file("parsed.json", JSON.stringify(this.state.parsed));
            zip.file("result.json", JSON.stringify(this.state.result));
            zip.file("components.json", JSON.stringify(this.state.components));
            zip.generateAsync({ type: "blob" })
                .then(content => {
                    var reader = new window.FileReader();
                    reader.readAsDataURL(content);
                    reader.onloadend = function () {
                        var base64data = reader.result;
                        axios.post('/savesession', { data: base64data })
                            .then(response => {
                                if (response.status == 200) {
                                    alert("Your saved session id: " + response.data.hash);
                                }
                            })
                            .catch(function (error) {
                                console.log(error);
                            });
                    }

                });
        }

        // Delete Session
        if (select == 2.3) {
            axios.post('/delsession', { hash: this.session })
                .then(response => {
                    if (response.status == 200) {
                    }
                })
                .catch(function (error) {
                    console.log(error);
                });
        }

        // solve
        if (select == 10.0) {
            this.setState({ loading: true });
            setTimeout(() => {
                if (this.state.loading)
                    this.setState({
                        loading: false,
                        status: "failed"
                    });
            }, 60000);
            this.solver.solve(
                this.state.workbench,
                this.state.row,
                this.state.col,
                this.state.components,
                (res, req) => this.setState({ loading: false, status: res.status, result: res, parsed: req }),
                this.state.model);
        }
        // Plot All
        if (select == 10.1) {
            //this.solver.plotAll();
        }

        // Plot Generators
        if (select == 10.2) {
            //this.solver.plotGenerators();
        }

        // Plot Buses
        if (select == 10.3) {
            //this.solver.plotBuses();
        }

        // Plot Lines
        if (select == 10.4) {
            //this.solver.plotLines();
        }

        // Plot Load
        if (select == 10.5) {
            //this.solver.plotLoad();
        }
    }

    StartModalLoad = session => {
        if (session == null) {
            // Open project
            this.file.onchange = e => {
                if (e.target.files[0] == "") return;
                JSZip.loadAsync(e.target.files[0]).then(
                    zip => {
                        zip.file("components.json").async("string").then(content => {
                            var components = JSON.parse(content);
                            this.setState({ components: components });
                            //console.log(components[0]._get_id());
                            var offset_id = 0
                            for (var i = 0; i < components.length; i++)
                                offset_id = Math.max(0, components[i].id);
                            for (var i = 0; i <= offset_id; i++)
                                new Component().id;
                            zip.file("project.json").async("string").then(content => {
                                this.project = JSON.parse(content);
                                this.setState({
                                    model: this.project.model,
                                    status: this.project.status,
                                    row: this.project.row,
                                    col: this.project.col
                                });
                                zip.file("workbench.json").async("string").then(content => {
                                    var workbench = JSON.parse(content);
                                    this.load(workbench);
                                    this.setState({ workbench: workbench });
                                });
                            });
                        });
                        zip.file("result.json").async("string").then(content => { var result = JSON.parse(content); this.setState({ result: result }); });
                        zip.file("parsed.json").async("string").then(content => { var parsed = JSON.parse(content); this.setState({ parsed: parsed }) });
                    });
                this.file.value = "";
            }
            this.file.click();
        }
        else {
            this.session = session;
            axios.post('/session', { hash: this.session })
                .then(response => {
                    if (response.status == 200) {
                        var byteString = atob(response.data.data.split(',')[1]);
                        // separate out the mime component
                        var mimeString = response.data.data.split(',')[0].split(':')[1].split(';')[0]
                        // write the bytes of the string to an ArrayBuffer
                        var ab = new ArrayBuffer(byteString.length);
                        var ia = new Uint8Array(ab);
                        for (var i = 0; i < byteString.length; i++) {
                            ia[i] = byteString.charCodeAt(i);
                        }
                        // write the ArrayBuffer to a blob, and you're done
                        var data = new Blob([ab]);
                        JSZip.loadAsync(data).then(zip => {
                            zip.file("components.json").async("string").then(content => {
                                var components = JSON.parse(content);
                                this.setState({ components: components });
                                var offset_id = 0
                                for (var i = 0; i < components.length; i++)
                                    offset_id = Math.max(0, components[i].id);
                                for (var i = 0; i <= offset_id; i++)
                                    new Component().id;
                                zip.file("project.json").async("string").then(content => {
                                    this.project = JSON.parse(content);
                                    this.setState({
                                        model: this.project.model,
                                        status: this.project.status,
                                        row: this.project.row,
                                        col: this.project.col
                                    });
                                    zip.file("workbench.json").async("string").then(content => {
                                        var workbench = JSON.parse(content);
                                        //console.log(workbench);
                                        this.load(workbench);
                                        this.setState({ workbench: workbench });
                                    });
                                });
                            });
                            zip.file("result.json").async("string").then(content => { var result = JSON.parse(content); this.setState({ result: result }); });
                            zip.file("parsed.json").async("string").then(content => { var parsed = JSON.parse(content); this.setState({ parsed: parsed }) });
                        });
                    }
                })
                .catch(function (error) {
                    console.log(error);
                });
        }
    }

    render() {
        return (
            <Grid fluid={true} style={{ height: "100%" }}>
                <Row>
                    <NavMenu
                        handleMenu={this.handleMenu}
                        model={this.state.model}
                        status={this.state.status}
                        loading={this.state.loading}
                        setSession={s => this.session = s}
                    />
                    <input type="file" ref={input => { this.file = input; }} style={{ display: 'none' }} accept=".csv,.xlsx,.xls,.po"></input>
                    <StartModal onSelect={model => this.setState({ model: model })} load={this.StartModalLoad} />
                    <LoaderModal show={this.state.showLoader} close={e => { this.setState({ showLoader: false }) }} confirm={components => this.setState({ components: components })} sheets={this.state.sheets} />
                </Row>
                <Row>
                    <SplitPane split="horizontal" defaultSize={55} allowResize={false}>
                        <div />
                        <SplitPane split="horizontal" defaultSize="75%" onChange={size => { this.setState({ splitYoffset2: size, splitYoffset1: size / 2 }) }}>
                            <div>
                                <SplitPane split="vertical" defaultSize="75%" minSize={this.state.width / 2} maxSize={this.state.width * 3 / 4}
                                    onChange={size => { this.setState({ splitXoffset: size }) }}>
                                    <div onContextMenu={e => { e.preventDefault(); return false; }}>
                                        <Panel style={{ width: "100%", height: "100vh", overflow: "scroll" }}
                                            header="Workbench"
                                            bsStyle="primary">
                                            <br /><br />
                                            <SplitWorkbench
                                                init={callbacks => { this.load = callbacks.load; }}
                                                row={this.state.row}
                                                col={this.state.col}
                                                getComponentById={this.getComponentById}
                                                mode={this.state.mode}
                                                setmode={e => { this.setState({ mode: e }) }}
                                                selected={this.state.selected}
                                                selectedRotation={this.state.selectedRotation}
                                                currentGrid={this.state.currentGrid}
                                                onChange={board => { this.setState({ workbench: board }) }} />
                                        </Panel>
                                    </div>
                                    <div>
                                        <SplitPane split="horizontal" defaultSize="50%" allowResize={false}
                                            minSize={this.state.height * 0.75 * 0.5 / 2} maxSize={this.state.height * 0.75 * 0.5 * 3 / 2}
                                            onChange={size => this.setState({ splitYoffset1: size })}
                                        >
                                            <div>
                                                <Panel style={{ width: this.state.width - this.state.splitXoffset, height: this.state.splitYoffset1, overflow: "scroll", overflowX: "hide" }}
                                                    header="Toolbox"
                                                    bsStyle="primary">
                                                    <br /><br />
                                                    <SplitToolbox
                                                        components={this.state.components}
                                                        onselect={this.onToolboxSelect}
                                                        onremove={this.onToolboxRemove}
                                                        onconfigure={id => this.setState({ configured: id, configurationEnable:true })}
                                                        mode={this.state.mode}
                                                    />
                                                </Panel>
                                            </div>
                                            <div>
                                                <Panel style={{ width: this.state.width - this.state.splitXoffset, height: this.state.splitYoffset2 - this.state.splitYoffset1, overflow: "scroll", overflowX: "hide" }}
                                                    header="Configuration"
                                                    bsStyle="primary">
                                                    <br /><br />
                                                    <SplitConfiguration model={this.state.model} onadd={component => { this.setState({ components: this.state.components.concat([component]) }) }}
                                                        configured={this.getComponentById(this.state.configured)}
                                                        configurationEnable={this.state.configurationEnable}
                                                        onchange={component => {
                                                            //console.log(component); console.log("changed");
                                                        }} />
                                                </Panel>
                                            </div>
                                        </SplitPane>
                                    </div>
                                </SplitPane>
                            </div>
                            <div>
                                <Panel style={{ width: this.state.width, height: this.state.height - this.state.splitYoffset2 - 50, overflow: "scroll", overflowX: "hide" }}
                                    header="Output"
                                    bsStyle="primary">
                                    <hr />
                                    <ResultPlot model={this.state.model} status={this.state.status} result={this.state.result} components={this.state.components} request={this.state.parsed} />
                                </Panel>
                            </div>
                        </SplitPane>
                    </SplitPane>
                </Row>
            </Grid>
        );
    }
}

module.exports = SplitApp;
