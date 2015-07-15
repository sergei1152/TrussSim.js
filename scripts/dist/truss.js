(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Car = fabric.util.createClass(fabric.Rect, {

    type: 'car',
    weight: null,
    length: null,

    initialize: function(options) {
        if (!options) {
            options = {};
        }

        this.callSuper('initialize', options);
        this.set('label', options.label || '');
        this.set('weight', options.weight || 7.5); //set the weight and length of the car
        this.set('length', options.length || 6);
        
        //Restricting movement of the car by player to only the x-axis
        this.set({
            lockMovementY: true,
            lockRotation: true,
            lockScalingX: true,
            lockScalingY: true
        }); 
    },

    toObject: function() {
        return fabric.util.object.extend(this.callSuper('toObject'), {
            label: this.get('label')
        });
    },

    _render: function(ctx) {
        this.callSuper('_render', ctx);

        ctx.font = '20px Helvetica';
        ctx.fillStyle = '#333';
        ctx.fillText(this.label, -this.width / 2, -this.height / 2 + 20);
    }
});

module.exports = Car;
},{}],2:[function(require,module,exports){
var Grid = {
    canvas: null,
    grid_size: 50,
    min_grid_size:14,
    lines: [], //to keep track of the lines created so they can be removed

    //Removes the current Grid
    removeGrid: function() {
        for (var i = 0; i < Grid.lines.length; i++) {
            Grid.canvas.remove(Grid.lines[i]);
        }
    },

    //Removes the current grid and recreates it based on the grid size
    createGrid: function() {
        Grid.removeGrid();
        var line;
        //create the harizontal lines of the grid
        for (i = 0; i < this.canvas.width; i += this.grid_size) {
            line = new fabric.Line([i, 0, i, this.canvas.height * 2], {
                stroke: '#ccc',
                selectable: false
            });
            Grid.lines.push(line);
            Grid.canvas.add(line);
            Grid.canvas.sendToBack(line);
        }

        //create the vertical lines of the grid
        for (i = 0; i < Grid.canvas.height; i += Grid.grid_size) {
            line = new fabric.Line([0, i, Grid.canvas.width * 2, i], {
                stroke: '#ccc',
                selectable: false
            });
            Grid.lines.push(line);
            Grid.canvas.add(line);
            Grid.canvas.sendToBack(line);
        }
    }
};

//Monitors for changes in the grid spacing input field and re-creates the grid if a change is detected
$('#grid-size-input').change(function() {
    var new_grid_size = parseInt($('#grid-size-input').val());

    if (!isNaN(new_grid_size) && new_grid_size > Grid.min_grid_size) {
        Grid.grid_size = new_grid_size;
        Grid.createGrid();
    }
});

module.exports = Grid;
},{}],3:[function(require,module,exports){
var Node=require('./Node');
var Member=require('./Member');
var Car=require('./Car');

module.exports = function(canvas, ModeController) {

    //Handles movement of new nodes and new members
    canvas.on('mouse:move', function(event) {
        if (ModeController.mode === 'add_node') {
            ModeController.new_node.circle.set({ //set the new node to follow the cursor
                'left': event.e.x,
                'top': event.e.y - 105
            });
            canvas.renderAll();
        }
        //if in add member mode and the start of the new member has already been determined
        else if (ModeController.mode === 'add_member' && (ModeController.new_member.placedStart && !ModeController.new_member.placedEnd)) {
            ModeController.new_member.line.set({ //set the end of the member to follow the cursor
                'x2': event.e.x,
                'y2': event.e.y - 105
            });
            canvas.renderAll();
        }
    });

    //Handles placements of new nodes
    canvas.on('mouse:up', function(event) {
        if (ModeController.mode === 'add_node') {
            //for some reason have to remove and re-add node to avoid weird glitcheness
            canvas.remove(ModeController.new_node.circle);
            canvas.add(ModeController.new_node.circle);
            canvas.bringToFront(ModeController.new_node.circle);
            ModeController.new_node = new Node(event.e.x, event.e.y - 105, canvas); //create a new node, while leaving the old one in the canvas
        }

        else if (ModeController.mode === 'add_member') {
            if (event.target.type === 'circle') {
                if (!ModeController.new_member.placedStart) { //if the member's start has not been determined yet
                    ModeController.new_member.line.set({ //position the start of the member to be at the center of the node
                        x1: event.target.left,
                        y1: event.target.top,
                        x2: event.target.left,
                        y2: event.target.top
                    });
                    ModeController.new_member.line.start_node=event.target;
                    event.target.connected_members.push(ModeController.new_member.line);
                    ModeController.new_member.placedStart = true;
                } else { //if the new member already has a starting node
                    ModeController.new_member.line.set({ //place the end of the node at the center of the selected node
                        x2: event.target.left,
                        y2: event.target.top
                    });
                    ModeController.new_member.line.end_node=event.target;
                    event.target.connected_members.push(ModeController.new_member.line);
                    ModeController.new_member.placedEnd = true;

                    canvas.remove(ModeController.new_member.line); //re-add the member to avoid weird glitchiness
                    canvas.add(ModeController.new_member.line);
                    canvas.sendToBack(ModeController.new_member.line);
                    ModeController.new_member = new Member(-100, -100, canvas); //create a new member while leaving the old one in the canvas
                }
            }
        }

    });

    //Handles erasing nodes and members, as well as placing members
    canvas.on('object:selected', function(event) {
        if (ModeController.mode === 'erase') {
            canvas.remove(event.target); //remove the selected node from the canvas
        } 

        
    });

    var previous_fill = 'grey';
    var hover_fill = 'red';
    canvas.on('mouse:over', function(e) {
        if (ModeController.mode === 'erase') {
            previous_fill = e.target.getFill();
            e.target.setFill(hover_fill);
            canvas.renderAll();
        }
    });

    canvas.on('mouse:out', function(e) {
        if (ModeController.mode === 'erase') {
            e.target.setFill(previous_fill);
            canvas.renderAll();
        }
    });

    canvas.on('object:moving', function(event) {
        if(event.target.type=='circle'){ //if a node is moving
            var node=event.target;
            node.moveMembers();
        }

        if(event.target.type=='line'){ //if a member is being moves
            var member=event.target;
            member.moveNodes();        
        }
    });

    $('#simulation-button').on('click', function(){
      var car = new Car({
          width: 100,
          height: 50,
          left: 100,
          top: 100,
          label: 'test',
          fill: '#faa',
          length: 10,
          weight: 7.5
      });
      canvas.add(car);
      console.log(car);
      return false;
    });
};
},{"./Car":1,"./Member":4,"./Node":6}],4:[function(require,module,exports){
function Member(left, top, canv) {
    this.line = new fabric.Line([left, top, left, top], {
        fill: 'red',
        stroke: 'blue',
        strokeWidth: 5,
        selectable: true,
        hasControls: false,
        hasBorders: false
    });
    this.line.force = null; //positive inficates tensile, negative indicates compressive
    this.line.start_node = null;
    this.line.end_node = null;

    this.placed_start = false; //whether the member's start position has been placed on a node
    this.placed_end = false; //whether a member's end position has been placed on a node

    if (canv) {
        Member.canvas = canv;
        Member.canvas.add(this.line);
        Member.canvas.sendToBack(this.line);
    }
    return this;
}

fabric.Line.prototype.moveNodes=function() {
	if(this.start_node && this.end_node){
		console.log(this.get('x1'));
		// this.start_node.set({left: this.x1, top: this.y1});
		// this.end_node.set({left: this.x2, top: this.y2});


		// this.start_node.moveMembers();
		// this.end_node.moveMembers();
	}
};

module.exports = Member;
},{}],5:[function(require,module,exports){
var Node=require('./Node');
var Member=require('./Member');

//Controlls the current mode
var ModeController={
	canvas: null,
	mode: 'move',
	new_node:null,
	new_member: null,

	clearNode:function(){
		if(ModeController.new_node){
			ModeController.canvas.remove(ModeController.new_node.circle);
			ModeController.new_node=null;
		}
	},
	clearMember:function(){
		if(ModeController.new_member){
			ModeController.canvas.remove(ModeController.new_member.line);
			ModeController.new_member=null;
		}
	}
};

$('#eraser-button').on('click',function(){
	ModeController.mode='erase';
	ModeController.clearNode();
	ModeController.clearMember();
});

$('#move-button').on('click',function(){
	ModeController.mode='move';
	ModeController.clearNode();
	ModeController.clearMember();
});

$('#add-member-button').on('click',function(){
	ModeController.clearNode(); 
	ModeController.canvas.defaultCursor='auto';
	ModeController.canvas.hoverCursor='copy';
	if(ModeController.mode!=='add_member'){ //if not already in add-member mode
		ModeController.mode='add_member';
		ModeController.new_member=new Member(-100,-100, ModeController.canvas);
	}
});

$('#add-node-button').on('click',function(){
	ModeController.clearMember();
	ModeController.canvas.defaultCursor='copy';
	if(ModeController.mode!=='add_node'){ //if not already in add node mode
		ModeController.new_node=new Node(-100,-100, ModeController.canvas);
		ModeController.mode='add_node';
	}
});

module.exports=ModeController;

},{"./Member":4,"./Node":6}],6:[function(require,module,exports){
function Node(left, top, canv) {
    this.circle = new fabric.Circle({
        left: left,
        top: top,
        strokeWidth: 5,
        radius: 12,
        fill: '#fff',
        stroke: '#666',
        selectable: true
    });

    this.circle.hasControls = this.circle.hasBorders = false;
    this.circle.connected_members = [];

    if (canv) {
        Node.canvas = canv;
        Node.canvas.add(this.circle);
        Node.canvas.bringToFront(this.circle);
    }
    
    return this;
}

fabric.Circle.prototype.moveMembers = function() { //TODO: Figure out how to make this a prototype
    for (var i = 0; i < this.connected_members.length; i++) {
        if (this.connected_members[i].start_node == this) { //if the start of the member is connected to the this
            this.connected_members[i].set({
                x1: this.left,
                y1: this.top
            });
        } else if (this.connected_members[i].end_node == this) { //if the end of the member is connected to the this
            this.connected_members[i].set({
                x2: this.left,
                y2: this.top
            });
        }
        Node.canvas.remove(this.connected_members[i]);
        Node.canvas.add(this.connected_members[i]);
    }
};

module.exports = Node;
},{}],7:[function(require,module,exports){
var ResizeController={
	canvas: null,
	grid: null,
	initial:true,
	resize_grid: true, //whether the grid should be regenerated after a resize event

	//resizes canvas based on current and future window dimensions, as well as resizes the grid
	resizeCanvas: function(){
		if(ResizeController.canvas){
			ResizeController.canvas.setHeight($(window).height()-120);
	    	ResizeController.canvas.setWidth($(window).width()-2);
	    	ResizeController.canvas.renderAll();
		}

		if(ResizeController.grid && (ResizeController.resize_grid || ResizeController.initial)){
	    	ResizeController.grid.createGrid();
	    	ResizeController.initial=false;
	    }
	}
};
//Resizes the canvas and grid upon a window resize
$(window).on('resize',function(){
	ResizeController.resizeCanvas();
});

module.exports=ResizeController;
},{}],8:[function(require,module,exports){
  var ModeController = require('./ModeController');
  var InteractionController = require('./InteractionController');
  var Grid = require('./Grid');
  var ResizeController = require('./ResizeController');

  var canvas = new fabric.Canvas('truss-canvas', {
      selection: true
  });

   //So that all fabric objects have an origin along the center
  fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';

  ModeController.canvas = canvas;
  Grid.canvas = canvas;
  ResizeController.canvas = canvas;
  ResizeController.grid = Grid;
  ResizeController.resizeCanvas(); //creates the grid as well, and recreates it upon a window resize 


  InteractionController(canvas, ModeController);


},{"./Grid":2,"./InteractionController":3,"./ModeController":5,"./ResizeController":7}]},{},[8]);
