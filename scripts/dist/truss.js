(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{}],2:[function(require,module,exports){
var Node=require('./Node');
var Member=require('./Member');

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
                    ModeController.new_member.placedStart = true;
                } else { //if the new member already has a starting node
                    ModeController.new_member.line.set({ //place the end of the node at the center of the selected node
                        x2: event.target.left,
                        y2: event.target.top
                    });
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
};
},{"./Member":3,"./Node":5}],3:[function(require,module,exports){
function Member(left,top,canv){
	this.line=new fabric.Line([left,top,left,top], {
       fill: 'red',
       stroke: 'blue',
       strokeWidth: 5,
       selectable: false
    });
    this.line.force=null; //positive inficates tensile, negative indicates compressive

	this.placed_start=false; //whether the member's start position has been placed on a node
	this.placed_end=false; //whether a member's end position has been placed on a node
	
	if(canv){
		Member.canvas=canv;
		Member.canvas.add(this.line);
		Member.canvas.sendToBack(this.line);
	}
	return this;
}

module.exports=Member;
},{}],4:[function(require,module,exports){
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
	if(ModeController.mode!=='add_member'){ //if not already in add-member mode
		ModeController.mode='add_member';
		ModeController.new_member=new Member(-100,-100, ModeController.canvas);
	}
});

$('#add-node-button').on('click',function(){
	ModeController.clearMember();
	if(ModeController.mode!=='add_node'){ //if not already in add node mode
		ModeController.new_node=new Node(-100,-100, ModeController.canvas);
		ModeController.mode='add_node';
	}
});

module.exports=ModeController;

},{"./Member":3,"./Node":5}],5:[function(require,module,exports){
function Node(left, top,canv){
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
    this.circle.connected_members=[];

    if(canv){
        Node.canvas = canv;
        Node.canvas.add(this.circle);
        Node.canvas.bringToFront(this.circle);
    }
    
    return this;
}

module.exports=Node;
},{}],6:[function(require,module,exports){
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
},{}],7:[function(require,module,exports){
  var ModeController = require('./ModeController');
  var InteractionController=require('./InteractionController');
  var Node = require('./Node');
  var Member=require('./Member');
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


  
  // var node = new Node(50, 50, canvas);
  // node.addMember(5, 6, 8, 11);


  // //The redraw button
  // $('#redraw').on('click', function() {
  //     canvas.renderAll();
  //     canvas.calcOffset();
  //     console.log('redraw');
  // });
   // function makeCircle(left, top, line1, line2, line3, line4) {
   //   var c = new fabric.Circle({
   //     left: left,
   //     top: top,
   //     strokeWidth: 5,
   //     radius: 12,
   //     fill: '#fff',
   //     stroke: '#666',
   //     selectable: true
   //   });
   //   c.hasControls = c.hasBorders = false;

   //   c.line1 = line1;
   //   c.line2 = line2;
   //   c.line3 = line3;
   //   c.line4 = line4;

   //   return c;
   // }

   // function makeLine(coords) {
   //   return new fabric.Line(coords, {
   //     fill: 'red',
   //     stroke: 'blue',
   //     strokeWidth: 5,
   //     selectable: false
   //   });
   // }

   // var line = makeLine([ 250, 125, 250, 175 ]),
   //     line2 = makeLine([ 250, 175, 250, 250 ]),
   //     line3 = makeLine([ 250, 250, 300, 350]),
   //     line4 = makeLine([ 250, 250, 200, 350]),
   //     line5 = makeLine([ 250, 175, 175, 225 ]),
   //     line6 = makeLine([ 250, 175, 325, 225 ]);

   // canvas.add(line, line2, line3, line4, line5, line6);
   // canvas.add(Node(5,5));
   // canvas.add(
   //   makeCircle(line.get('x1'), line.get('y1'), null, line),
   //   makeCircle(line.get('x2'), line.get('y2'), line, line2, line5, line6),
   //   makeCircle(line2.get('x2'), line2.get('y2'), line2, line3, line4),
   //   makeCircle(line3.get('x2'), line3.get('y2'), line3),
   //   makeCircle(line4.get('x2'), line4.get('y2'), line4),
   //   makeCircle(line5.get('x2'), line5.get('y2'), line5),
   //   makeCircle(line6.get('x2'), line6.get('y2'), line6)
   // );
  // canvas.on('object:moving', function(e) {
  //     var target = e.target;

  //     if (target.type === 'circle') {
  //         for (var i = 0; i < target.connected_members.length; i++) {
  //             target.connected_members[i].set({
  //                 'x1': target.left,
  //                 'y1': target.top
  //             });
  //         }
  //     }
      // if(p.line1){
      // 	p.line1.set({ 'x2': p.left, 'y2': p.top });
      // }
      // if(p.line2){
      // 	p.line2.set({ 'x1': p.left, 'y1': p.top });
      // }
      // if(p.line3){
      // 	p.line3.set({ 'x1': p.left, 'y1': p.top });
      // }
      // if(p.line4){
      // 	p.line4.set({ 'x1': p.left, 'y1': p.top });
  //     // }
  //     canvas.renderAll();
  // });

  function startSimulation() {
      return false;
  }
},{"./Grid":1,"./InteractionController":2,"./Member":3,"./ModeController":4,"./Node":5,"./ResizeController":6}]},{},[7]);
