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
            lockScalingY: true,
            hasControls: false,
            fill: "#4500F5"
        }); 
    },

    toObject: function() {
        return fabric.util.object.extend(this.callSuper('toObject'), {
            label: this.get('label')
        });
    },

    _render: function(ctx) {
        this.callSuper('_render', ctx);

        ctx.font = '20px Arial';
        ctx.fillStyle = '#FFFFFF'; //color of the font
        ctx.fillText(this.label, -this.width / 4, -this.height / 2+30);
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
        //if in 'add-node' mode
        if (ModeController.mode === 'add_node') {
            ModeController.new_node.set({ //set the new node to follow the cursor
                'left': event.e.x,
                'top': event.e.y - 105
            });
            canvas.renderAll();
        }
        //if in 'add-member' mode and the start of the member has been placed already
        else if (ModeController.mode === 'add_member' && (ModeController.new_member.start_node && !ModeController.new_member.end_node)) {
            ModeController.new_member.set({ //set the end of the member to follow the cursor
                'x2': event.e.x,
                'y2': event.e.y - 105
            });
            canvas.renderAll();
        }
    });

    //Handles placements of new nodes
    canvas.on('mouse:up', function(event) {
        if (ModeController.mode === 'add_node') {
            canvas.remove(ModeController.new_node);//for some reason have to remove and re-add node to avoid weird glitcheness
            canvas.add(ModeController.new_node);
            canvas.bringToFront(ModeController.new_node); //bringing the new node to the front of the canvas
            ModeController.new_node = new Node(); //create a new node, while leaving the old one in the canvas
            canvas.add(ModeController.new_node); //adding the new node to the canvas
        }

        else if (ModeController.mode === 'add_member') {
            if (event.target && event.target.type === 'node') { //if a node has been clicked on
                if (!ModeController.new_member.start_node) { //if the member's start has not been determined yet
                    ModeController.new_member.set({ //position the start of the member to be at the center of the node
                        x1: event.target.left,
                        y1: event.target.top,
                        x2: event.target.left,
                        y2: event.target.top
                    });

                    ModeController.new_member.start_node=event.target;
                    event.target.connected_members.push(ModeController.new_member);
                    canvas.renderAll();
                } else if(ModeController.new_member.start_node && !ModeController.new_member.end_node && event.target!=ModeController.new_member.start_node){ //if the new member already has a starting node and the end has not been determined yet
                    ModeController.new_member.set({ //place the end of the node at the center of the selected node
                        x2: event.target.left,
                        y2: event.target.top
                    });
                    ModeController.new_member.end_node=event.target;
                    event.target.connected_members.push(ModeController.new_member); 

                    canvas.remove(ModeController.new_member); //re-add the member to avoid weird glitchiness
                    canvas.add(ModeController.new_member);
                    canvas.sendToBack(ModeController.new_member);
                    ModeController.new_member = new Member(); //create a new member while leaving the old one in the canvas
                    canvas.add(ModeController.new_member);
                }
            }
        }

    });

    //Handles erasing nodes and members, as well as placing members
    canvas.on('object:selected', function(event) {
        if (ModeController.mode === 'erase') { //TODO: remove all connected members from the nodes as well
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
        if(event.target.type=='node'){ //if a node is moving
            var node=event.target;
            node.moveMembers(canvas);
        }
    });

    $('#simulation-button').on('click', function(){
      var car = new Car({
          width: 100,
          height: 50,
          left: 100,
          top: 100,
          label: 'Truck',
          length: 10,
          weight: 7.5
      });
      canvas.add(car);
      return false;
    });
};
},{"./Car":1,"./Member":4,"./Node":6}],4:[function(require,module,exports){
var Member = fabric.util.createClass(fabric.Line, {
    type: 'member',

    initialize: function(options) {
        if (!options) {
            options = {};
        }

        this.callSuper('initialize', options);

        //settings default values of the most important properties
        this.set({
            fill: 'blue',
            stroke: 'red',
            strokeWidth: 5,
            strokeLineJoin : "round",
            selectable: false,
            hasControls: false,
            hasBorders: false,
            x1: options.x1 || -100,
            y1: options.y1 || -100,
            x2: options.x2 || -100,
            y2: options.y2 || -100,
            force: null,
            start_node: null, //what node the member is connected to at it's start
            end_node: null //what node the member is connected to at it's end
        });
    },

    toObject: function() {
        return fabric.util.object.extend(this.callSuper('toObject'), {
            force: this.get('force'),
            start_node: this.get('start_node'),
            end_node: this.get('end_node')
        });
    },

    _render: function(ctx) {
        this.callSuper('_render', ctx);
    }
});

module.exports=Member;
},{}],5:[function(require,module,exports){
//Sets the current mode based on what button the user presses, as well as holds the context for the current node and member
//TODO: Set cursors based on what mode is selected
var Node=require('./Node');
var Member=require('./Member');

//Controlls the current mode
var ModeController={
	canvas: null,
	mode: 'move',
	new_node:null,
	new_member: null,

	//removes the currently unplaced node from the canvas
	clearNode:function(){
		if(ModeController.new_node){
			ModeController.canvas.remove(ModeController.new_node);
			ModeController.new_node=null;
		}
	},
	//removes the currently unplaced member from the canvas
	clearMember:function(){
		if(ModeController.new_member){
			ModeController.canvas.remove(ModeController.new_member);
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
	ModeController.clearNode(); //gets rid of any existing unplaced nodes

	if(ModeController.mode!=='add_member'){ //if not already in add-member mode
		ModeController.mode='add_member';
		ModeController.new_member=new Member();
		ModeController.canvas.add(ModeController.new_member); //adds the new member to the canvas
	}
});

$('#add-node-button').on('click',function(){
	ModeController.clearMember(); //gets rid of any existing unplaced members

	if(ModeController.mode!=='add_node'){ //if not already in add node mode
		ModeController.mode='add_node';
		ModeController.new_node=new Node();
		ModeController.canvas.add(ModeController.new_node); //adds the new node to the canvas
	}
});

module.exports=ModeController;

},{"./Member":4,"./Node":6}],6:[function(require,module,exports){
var Node = fabric.util.createClass(fabric.Circle, {
    type: 'node',

    initialize: function(options) {
        if (!options) {
            options = {};
        }

        this.callSuper('initialize', options);

        //settings default values of the most important properties
        this.set({
            left: options.left || -100,
            top: options.top || -100,
            strokeWidth: options.strokeWidth || 5,
            radius: options.radius || 12,
            fill: options.fill || '#FFFFFF',
            stroke: options.stroke || '#666',
            selectable: options.selectable || true,
            hasControls: false,
            hasBorders: false,
            support: options.support || false,
            external_forces: [],
            connected_members: []
        });
    },

    toObject: function() {
        return fabric.util.object.extend(this.callSuper('toObject'), {
            support: this.get('support'),
            external_forces: this.get('external_forces'),
            connected_members: this.get('connected_members')
        });
    },

    _render: function(ctx) {
        this.callSuper('_render', ctx);
    }
});

//Moves the connected members of the node to its position
Node.prototype.moveMembers = function(canvas) {
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
        //Re-adding the members to avoing weird glitchiness
        canvas.remove(this.connected_members[i]);
        canvas.add(this.connected_members[i]);
        canvas.sendToBack(this.connected_members[i]); //sending the connected members to the back of the canvas
    }
};

module.exports=Node;
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
