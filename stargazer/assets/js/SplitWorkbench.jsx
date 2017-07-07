import React from 'react';
import { Layer, Stage, Image } from 'react-konva';
import Konva from 'konva';

class Node {
    constructor(row, col) {
        this.row = row;
        this.col = col;
    }

    row = 0;
    col = 0;

    connect = {
        up: false,
        down: false,
        right: false,
        left: false
    };

    empty = true;
    id = null;
    rotation = 0;
}

const EEvent = {
    MouseDown: 0,
    MouseUp: 1,
    MouseMove: 2,
    MouseDownElement: 3,
    MouseUpElement: 4
}

const EModes = {
    Normal: 0,
    DragAdd: 1,
    DragMove: 2,
    GridDraw: 3,
    GridDrawing: 4,
    GridErase: 5,
    GridErasing: 6
}

class SplitWorkbench extends React.Component {

    constructor(props) {
        super(props);
        this.props.init({ load: this.load });
        this.state =
            {
                row: this.props.row,
                col: this.props.col,
                board: this.initBoard(this.props.row, this.props.col)
            }
        this.shapes = [];

        // this.props.getComponent(id = 0)
    }

    load = workbench => {
        var els = this.refs.stage.getStage().find('Group');
        for (var i = 0; i < els.length; i++)
            els[i].remove();
        //console.log(workbench);
        this.setState({ board: workbench });
        for (var i = 0; i < workbench.length; i++) {
            var cell = workbench[i];
            if (!cell.empty) {
                var component = this.props.getComponentById(cell.id);
                if (component.type != "grid")
                    this.addElement({ x: cell.col * 50, y: cell.row * 50 }, component, cell.rotation);
                    
            }
        }
    }

    initBoard = (row, col) => {
        var board = [];
        for (var r = 0; r < row; r++)
            for (var c = 0; c < col; c++)
                board.push(new Node(r, c));
        return board;
    }

    componentDidMount() {
        this.drawBackgroundGrid();
        this.props.onChange(this.state.board);
    }

    componentDidUpdate(prevProps, prevState) {
        //console.log("previous");
        //console.log(prevProps);
        //console.log(prevState);
        //console.log("now");
        //console.log(this.props);
        //console.log(this.state);
        //console.log("state");
        //console.log(JSON.stringify(prevState) === JSON.stringify(this.state));
        //console.log("props");
        //console.log(JSON.stringify(prevProps) === JSON.stringify(this.props));
        //if(JSON.stringify(prevState) === JSON.stringify(this.state) && JSON.stringify(prevProps) === JSON.stringify(this.props)) return;
        this.drawBackgroundGrid();
        this.drawGrid();
    }

    componentWillReceiveProps(nextProps) {
        this.setState(
            {
                row: nextProps.row,
                col: nextProps.col,
                board: (this.props.row != nextProps.row || this.props.col != nextProps.col) ? this.initBoard(nextProps.row, nextProps.col) : this.state.board
            }
        );
    }

    drawBackgroundGrid = () => {
        var grid = this.refs.background.getCanvas();
        var ctx = grid.getContext("2d");
        ctx.clearRect(0, 0, grid.width, grid.height);

        ctx.lineCap = 'round';
        grid.width = this.props.col * 50 + 50;
        grid.height = this.props.row * 50 + 50;
        ctx.beginPath();
        ctx.setLineDash([1, 10]);
        ctx.strokeStyle = "grey";
        ctx.lineWidth = 1;
        for (var row = 0; row < this.props.row; row++) {
            for (var col = 0; col < this.props.col; col++) {
                ctx.moveTo(25 + col * 50 - 25, 25 + row * 50);
                ctx.lineTo(25 + col * 50 + 25, 25 + row * 50);
                ctx.moveTo(25 + col * 50, 25 + row * 50 - 25);
                ctx.lineTo(25 + col * 50, 25 + row * 50 + 25);
            }
        }
        ctx.stroke();
    }

    drawGrid = () => {
        var grid = this.refs.scene.getCanvas();
        var ctx = grid.getContext("2d");
        ctx.clearRect(0, 0, grid.width, grid.height);
        ctx.lineCap = 'round';
        ctx.setLineDash([]);
        ctx.strokeStyle = "black";
        ctx.lineWidth = 5;

        ctx.beginPath();
        for (var row = 0; row < this.props.row; row++) {
            for (var col = 0; col < this.props.col; col++) {
                var node = this.state.board[row * this.props.col + col];
                var target = this.props.getComponentById(node.id);
                if(!node.empty && !target)
                    target = {type:"unknown"};
                var type = node.empty ? null : target.type;
                if (type == "grid") {
                    if (node.connect.down) {
                        ctx.moveTo(25 + col * 50, 25 + row * 50);
                        ctx.lineTo(25 + col * 50, 25 + row * 50 + 25);
                    }
                    if (node.connect.left) {
                        ctx.moveTo(25 + col * 50, 25 + row * 50);
                        ctx.lineTo(25 + col * 50 - 25, 25 + row * 50);
                    }
                    if (node.connect.right) {
                        ctx.moveTo(25 + col * 50, 25 + row * 50);
                        ctx.lineTo(25 + col * 50 + 25, 25 + row * 50);
                    }
                    if (node.connect.up) {
                        ctx.moveTo(25 + col * 50, 25 + row * 50);
                        ctx.lineTo(25 + col * 50, 25 + row * 50 - 25);
                    }
                }
            }
        }
        ctx.stroke();
    }

    addElement = (pos, component, rotation) => {
        var group = new Konva.Group({
            draggable: true,
            x: pos.x,
            y: pos.y
        });
        var textbox = new Konva.Rect({
            x: 37,
            y: 37,
            width: 14,
            height: 10,
            fill: "white",
            stroke: "black",
            strokeWidth: 1
        });
        var text = new Konva.Text({
            x: 39,
            y: 37,
            fontSize: 10,
            fontFamily: "times",
            fill: "black",
            text: component.id.toString()
        });
        var icon = new window.Image();
        icon.onload = () => {
            var konvaImage = new Konva.Image({
                x: 0,
                y: 0,
                image: icon,
                width: 50,
                height: 50
            });
            group.on('mouseover', () => {
                document.body.style.cursor = 'pointer';
            });
            group.on('mouseout', () => {
                document.body.style.cursor = 'default';
            });
            group.on('click', e => {
                console.log("clicked");
            });
            if (rotation == 90) {
                konvaImage.rotation(rotation);
                konvaImage.x(50);
                konvaImage.y(0);
            } else if (rotation == -90)
            {
                konvaImage.rotation(rotation);
                konvaImage.x(0);
                konvaImage.y(50);
            } else if (rotation == 180)
            {
                konvaImage.rotation(rotation);
                konvaImage.x(50);
                konvaImage.y(50);
            }
            group.add(konvaImage);
            group.add(textbox);
            group.add(text);
            this.refs.foreground.add(group);
            //this.drag.fire("dragstart");
            this.refs.foreground.draw();
            //layer.add(group);
        };
        icon.src = component.icon;
    }

    addGrid = (trace, board) => {
        var boardData = board.slice();
        var grid = this.props.currentGrid;
        if (grid == null) {
            grid = new Node(0, 0);
            grid.id = "grid";
            grid.empty = false;
        }

        for (var i = 1; i < trace.length; i++) {
            var indexLast = trace[i - 1];
            var index = trace[i];
            var posLast = this.state.board[indexLast];// this.getPosition(indexLast);
            var pos = this.state.board[index];//this.getPosition(index);

            var check_connection = (current_index) => {
                if (boardData[current_index].type == 'grid') {
                    if (boardData[current_index].id != grid.id) {
                        var min = boardData[current_index].id < grid.id ? boardData[current_index] : grid;
                        var max = boardData[current_index].id > grid.id ? boardData[current_index] : grid;
                        // set to new grid
                        var lastId = max.id;
                        grid = boardData[current_index];
                        // set all drawed new grid to fallback
                        for (var j = 0; j < boardData.length; j++)
                            if (boardData[j].type == 'grid')
                                if (boardData[j].id == lastId)
                                    boardData[j].id = min.id;
                    }
                }
            }
            check_connection(indexLast);
            check_connection(index);



            if (boardData[indexLast].empty) {
                boardData[indexLast].empty = false;
                boardData[indexLast].id = grid.id;
            }
            if (boardData[index].empty) {
                boardData[index].empty = false;
                boardData[index].id = grid.id;
            }

            if (pos.col == posLast.col && pos.row - posLast.row == 1) //on top of
            {
                boardData[indexLast].connect.down = true;
                boardData[index].connect.up = true;
            } else if (pos.col == posLast.col && pos.row - posLast.row == -1) //on bottom of
            {
                boardData[indexLast].connect.up = true;
                boardData[index].connect.down = true;
            } else if (pos.row == posLast.row && pos.col - posLast.col == 1) //on left of
            {
                boardData[indexLast].connect.right = true;
                boardData[index].connect.left = true;
            } else if (pos.row == posLast.row && pos.col - posLast.col == -1) //on right of
            {
                boardData[indexLast].connect.left = true;
                boardData[index].connect.right = true;
            }
        }
        return boardData;
    }

    removeGrid = (trace, board) => {
        var boardData = this.state.board.slice();
        for (var i = 0; i < trace.length; i++) {
            var index = trace[i];
            if (!boardData[index].empty) {
                boardData[index].empty = true;
                boardData[index].connect.down = false;
                boardData[index].connect.left = false;
                boardData[index].connect.right = false;
                boardData[index].connect.up = false;
                boardData[index].id = null;
            }
        }
        return boardData;
    }

    getPosition = index => {
        var colum = index % this.props.col;
        return {
            row: (index - colum) / this.props.col,
            col: colum
        }
    }

    onMouse = (e, type) => {
        //if(type == EEvent.MouseMove && this.props.mode == EModes.DragMove) return;
        var row = Math.round((e.evt.offsetY - 25) / 50);
        var col = Math.round((e.evt.offsetX - 25) / 50);
        var index = row * this.props.col + col;
        var mode = this.props.mode;
        //console.log(type);
        switch (type) {
            case EEvent.MouseDown: //dragg add, start draw/erase wire
                switch (mode) {
                    case EModes.DragAdd:
                        //this.props.setmode(EModes.Normal);
                        if (e.evt.which != 1) return;
                        var clone = this.state.board.slice();
                        clone[index].empty = false;
                        clone[index].id = this.props.selected;
                        clone[index].rotation = this.props.selectedRotation;
                        this.setState({ board: clone });
                        this.addElement({ x: col * 50, y: row * 50 }, this.props.getComponentById(this.props.selected),clone[index].rotation);
                        break;
                    case EModes.GridDraw:
                        this.trace = [];
                        this.oldBoard = this.state.board.slice();
                        this.props.setmode(EModes.GridDrawing);
                        break;
                    case EModes.GridErase:
                        this.trace = [];
                        this.oldBoard = this.state.board.slice();
                        this.props.setmode(EModes.GridErasing);
                        break;
                    default:
                        break;
                }
                break;
            case EEvent.MouseUpElement: //drop moved element
                switch (mode) {
                    case EModes.DragMove:
                        this.props.setmode(EModes.Normal);
                        var shape = e.target;
                        if (shape.parent.nodeType == "Group")
                            shape = shape.parent;
                        if (shape.nodeType != "Group")
                            console.log(shape);
                        var clone = this.state.board.slice();
                        clone[index].empty = false;
                        clone[index].id = this.drag;
                        shape.moveTo(this.refs.foreground);
                        console.log("foreground layer");
                        this.setState({ board: clone });
                        shape.position({ x: col * 50, y: row * 50 })
                        this.refs.foreground.draw();
                        this.refs.dragLayer.draw();
                        break;
                }
                break;
            case EEvent.MouseUp: //draw/erase wire finish
                switch (mode) {
                    case EModes.GridDrawing:
                        this.props.setmode(EModes.GridDraw);
                        //console.log(this.props.board);
                        break;
                    case EModes.GridErasing:
                        this.props.setmode(EModes.GridErase);
                        break;
                    default:
                }
                break;
            case EEvent.MouseMove: //record trace of draw/erase wire
                switch (mode) {
                    case EModes.GridDrawing:
                        if ((index != this.trace[this.trace.length - 1]
                            && (Math.abs(index - this.trace[this.trace.length - 1]) == 1
                                || Math.abs(index - this.trace[this.trace.length - 1]) == this.props.col)) || this.trace.length == 0) {
                            var exist = this.trace.indexOf(index);
                            if (exist == -1)
                                this.trace.push(index);
                            else
                                this.trace.splice(exist + 1, this.trace.length - 1 - exist);
                            var boardData = this.addGrid(this.trace, this.oldBoard);
                            this.props.onChange(boardData);
                            this.setState({ board: boardData });
                        }
                        break;
                    case EModes.GridErasing:
                        if ((index != this.trace[this.trace.length - 1]
                            && (Math.abs(index - this.trace[this.trace.length - 1]) == 1
                                || Math.abs(index - this.trace[this.trace.length - 1]) == this.props.col)) || this.trace.length == 0) {
                            var exist = this.trace.indexOf(index);
                            if (exist == -1)
                                this.trace.push(index);
                            else
                                this.trace.splice(exist + 1, this.trace.length - 1 - exist);
                            var boardData = this.removeGrid(this.trace, this.oldBoard);
                            this.props.onChange(boardData);
                            this.setState({ board: boardData });
                        }
                        break;
                    //case EModes.Normal:
                    //console.log("on down");
                    //    if (!this.state.board[index].empty)
                    //        document.body.style.cursor = 'pointer';
                    //    else
                    //        document.body.style.cursor = 'default';
                    default:
                }
                break;
            case EEvent.MouseDownElement: // delete element/ drag move element/ select element
                var shape = e.target;
                if (shape.parent.nodeType == "Group")
                    shape = shape.parent;
                if (shape.nodeType != "Group")
                    console.log(shape);
                //console.log(shape.parent);
                switch (e.evt.which) {
                    case 1: // left click drag move/select
                        //this.onSelectTarget(shape);
                        this.drag = this.state.board[index].id;
                        var clone = this.state.board.slice();
                        clone[index].empty = true;
                        clone[index].id = null;
                        clone[index].connect.down = false;
                        clone[index].connect.left = false;
                        clone[index].connect.right = false;
                        clone[index].connect.up = false;
                        this.setState({ board: clone });
                        shape.moveTo(this.refs.dragLayer);
                        console.log("draglayer");
                        this.refs.foreground.draw();
                        this.refs.dragLayer.draw();
                        shape.startDrag();
                        this.props.setmode(EModes.DragMove);
                        break;
                    case 3: // right click delete
                        shape.remove();
                        this.refs.foreground.draw();
                        var clone = this.state.board.slice();
                        clone[index].empty = true;
                        clone[index].id = null;
                        clone[index].connect.down = false;
                        clone[index].connect.left = false;
                        clone[index].connect.right = false;
                        clone[index].connect.up = false;
                        this.setState({ board: clone });
                        break;
                    default:
                }
                break;
            default:
        }
    }

    render() {
        return (
            <Stage ref="stage"
                style={{ overflow: "hide" }}
                onContentMousedown={e => { this.onMouse(e, EEvent.MouseDown) }}
                onContentMousemove={e => { this.onMouse(e, EEvent.MouseMove) }}
                onContentMouseup={e => { this.onMouse(e, EEvent.MouseUp) }}
                onMouseDown={e => { this.onMouse(e, EEvent.MouseDownElement) }}
                onMouseup={e => { this.onMouse(e, EEvent.MouseUpElement) }}
                width={this.props.col * 50 + 50} height={this.props.row * 50 + 50} >
                <Layer ref="background" />
                <Layer ref="scene" />
                <Layer ref="foreground" />
                <Layer ref="dragLayer" />
            </Stage >
        );
    }
}

module.exports = SplitWorkbench;
