import React from 'react';
import SplitPane from 'react-split-pane';
import { Layer, Stage, Image } from 'react-konva';
import Konva from 'konva';
import BootstrapMenu from 'bootstrap-menu';

class SplitToolbox extends React.Component {

    constructor(props) {
        super(props);
        this.selected = null;
        this.components = [];
        this.componentsImage = [];
        for (var i = 0; i < 70; i++)
            this.components.push([null, null, null, null]);
        this.contextSelected = null;
    }

    componentDidMount() {
        this.initBackground();
        this.initBasic();
        this.updateComponents();
        this.drawComponents();
        setTimeout(() => {
            this.refs.foreground.draw();
        }, 500);
        var menu = new BootstrapMenu('#toolbox_menu', {
            actions: [
                {
                    name: 'Select',
                    onClick: () => {
                        // run when the action is clicked
                        if (this.contextSelected != null) {
                            //console.log(this.contextSelected);
                            this.select(this.contextSelected.obj, this.contextSelected.id);
                        }
                        this.contextSelected = null;
                    }
                },
                {
                    name: 'Remove',
                    onClick: () => {
                        // run when the action is clicked
                        if (this.contextSelected != null) {
                            this.props.onremove(this.contextSelected.id);
                        }
                        this.contextSelected = null;
                    }
                },
                {
                    name: 'Configure',
                    onClick: () => {
                        // run when the action is clicked
                        if (this.contextSelected != null) {
                            this.props.onconfigure(this.contextSelected.id);
                        }
                        this.contextSelected = null;
                    }
                }]
        });
    }

    componentDidUpdate() {
        //console.log("new component");
        //console.log(this.props.components);
        this.updateComponents();
        this.drawComponents();
        setTimeout(() => {
            this.refs.foreground.draw();
        }, 500)
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.mode != this.props.mode && nextProps.mode == 0)
            this.select(this.pointer,"pointer");
    }

    initBackground = () => {
        var bg = this.refs.background.getCanvas();
        var ctx = bg.getContext("2d");
        ctx.clearRect(0, 0, bg.width, bg.height);
        ctx.lineCap = 'round';
        ctx.setLineDash([5, 10]);
        ctx.strokeStyle = "grey";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 75);
        ctx.lineTo(75, 75);
        ctx.lineTo(75, 0);
        ctx.moveTo(75, 75);
        ctx.lineTo(75, 800);
        ctx.stroke();
    }

    initBasic = () => {
        this.addImage(this.refs.foreground, "/static/images/Unknown.svg", { x: 0, y: 75 + 5 }, { w: 30, h: 30 },
            e => { this.select(e, "pointer"); },"pointer");
        this.addImage(this.refs.foreground, "/static/images/Pen.svg", { x: 0, y: 75 + 5 + 37.5 }, { w: 30, h: 30 },
            e => { this.select(e, "pen"); },"pen");
        this.addImage(this.refs.foreground, "/static/images/Eraser.svg", { x: 37.5, y: 75 + 5 + 37.5 }, { w: 30, h: 30 },
            e => { this.select(e, "eraser"); },"eraser");
    }

    select = (konvaElement, id) => {
        if (this.selected != null)
            this.selected.remove();
        this.selected = konvaElement.clone();
        this.selected.off('click');
        this.selected.on('click', e => {
            if (this.selected.rotation() == 0) {
                this.selected.rotation(90);
                this.selected.x(75);
                this.selected.y(0);
            }
            else if(this.selected.rotation() == 90) {
                this.selected.rotation(-90);
                this.selected.x(0);
                this.selected.y(75);
            }
            else if(this.selected.rotation() == -90) {
                this.selected.rotation(180);
                this.selected.x(75);
                this.selected.y(75);
            }
            else {
                this.selected.rotation(0);
                this.selected.x(0);
                this.selected.y(0);
            }
            this.props.onselect(id,this.selected.rotation());
            this.refs.foreground.draw();
        });
        this.selected.size({ width: 75, height: 75 });
        this.selected.position({ x: 0, y: 0 });
        this.selected.cache();
        this.selected.filters([Konva.Filters.Brighten]);
        this.selected.brightness(0.15);
        this.refs.foreground.add(this.selected);
        this.refs.foreground.draw();
        this.props.onselect(id,this.selected.rotation());
    }

    addImage = (layer, url, pos, size, onclick, name) => {
        var icon = new window.Image();
        var src = url;
        icon.onload = () => {
            var konvaImage = new Konva.Image({
                x: pos.x,
                y: pos.y,
                image: icon,
                width: size.w,
                height: size.h
            });
            konvaImage.on('mouseover', () => {
                document.body.style.cursor = 'pointer';
            });
            konvaImage.on('mouseout', () => {
                document.body.style.cursor = 'default';
            });
            konvaImage.on('click', e => {
                if (onclick != null && e.evt.which == 1) onclick(konvaImage);
            });
            konvaImage.cache();
            this[name] = konvaImage;
            layer.add(konvaImage);
        };
        icon.src = src;
    }

    addComponent = (layer, url, id, pos, size, rotateEnable) => {
        var group = new Konva.Group({
            x: pos.x,
            y: pos.y
        });
        var textbox = new Konva.Rect({
            x: 49,
            y: 59,
            width: 26,
            height: 16,
            fill: "white",
            stroke: "black",
            strokeWidth: 1
        });
        var text = new Konva.Text({
            x: 52,
            y: 57,
            fontSize: 19,
            fontFamily: "times",
            fill: "black",
            text: id.toString()
        });
        var icon = new window.Image();
        var src = url;
        icon.onload = () => {
            var konvaImage = new Konva.Image({
                x: 0,
                y: 0,
                image: icon,
                width: size.w,
                height: size.h
            });
            group.on('mouseover', () => {
                document.body.style.cursor = 'pointer';
            });
            group.on('mouseout', () => {
                document.body.style.cursor = 'default';
            });
            group.on('click', e => {
                if (e.evt.which == 1)
                    this.select(group, id);
                else if (e.evt.which == 3)
                    this.contextSelected = { obj: group, id: id };
            });

            group.add(konvaImage);
            group.add(textbox);
            group.add(text);
            this.componentsImage.push(group);
            layer.add(group);
        };
        icon.src = src;
    }

    updateComponents = () => {
        for (var i = 0; i < this.componentsImage.length; i++)
            this.componentsImage[i].remove();
        var index = 0;
        for (var row = 0; row < this.components.length; row++) {
            for (var col = 0; col < 4; col++) {
                this.components[row][col] = this.props.components[index];
                index++;
            }
        }
    }

    drawComponents = () => {
        for (var row = 0; row < this.components.length; row++) {
            for (var col = 0; col < 4; col++) {
                if (this.refs.foreground, this.components[row][col] != null) {
                    this.addComponent(this.refs.foreground, this.components[row][col].icon, this.components[row][col].id,
                        {
                            x: 75 + 5 + col * 80,
                            y: row * 80
                        }, { w: 75, h: 75 });
                }
            }
        }
    }

    render() {
        return (
            <div id="toolbox_menu">
                <Stage ref="stage" width={600} height={800}>
                    <Layer ref="background" />
                    <Layer ref="foreground" />
                </Stage>
            </div>
        );
    }
}

module.exports = SplitToolbox;
