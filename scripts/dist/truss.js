(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var E=require('./EntityController');
var Grid=require('./Grid');

function calculateSupportReactions(){
	Grid.calcGridMeter(E);
	E.calcCarLengthPx();
	E.car.width=E.car_length_px; //recalculating the car width for the canvas
	var bridge_length_px=E.bridge_length*Grid.grid_size*Grid.grid_meter; //converting bridge length in meters to pixels
	var actual_weight;
	var distance_a_centroid_px;

	 //if the car is just starting to enter the bridge
	if(E.supportA.left-E.car.left<E.car_length_px/2 && E.supportA.left-E.car.left>-E.car_length_px/2){
		var exposed_car_length_px=E.car.left+E.car_length_px/2-E.supportA.left; //how much of the car length is inside the bridge
		actual_weight=(E.car_weight/E.car_length_px)*exposed_car_length_px;
		distance_a_centroid_px=exposed_car_length_px/2;
	}
	//if the car is completely within the bridge (between A & B completely)
	else if( E.supportA.left-E.car.left<=-E.car_length_px/2 && E.supportB.left-E.car.left>=E.car_length_px/2){
		actual_weight=E.car_weight;
		distance_a_centroid_px=E.car.left-E.supportA.left;
	}
	//if the car is leaving the bridge
	else if(E.supportB.left-E.car.left<E.car_length_px/2 && E.supportB.left-E.car.left>-E.car_length_px/2){
		var remaining_car_length_px=E.car_length_px-(E.car.left+E.car_length_px/2-E.supportB.left); //how much of the car length is remaining within the bridge
		actual_weight=(E.car_weight/E.car_length_px)*remaining_car_length_px;
		distance_a_centroid_px=E.supportB.left-remaining_car_length_px/2-E.supportA.left;
	}

	//calculate support reactions, and otherwise 0 if the car is completely out of the bridge and not touching the supports
	E.supportA.setForce(0,(actual_weight*(bridge_length_px-distance_a_centroid_px))/(bridge_length_px) || 0,Grid.canvas);
	E.supportB.setForce(0,(actual_weight*(distance_a_centroid_px))/(bridge_length_px) || 0,Grid.canvas);
}

function calculateWeightDistributionOfCar(){ //TODO: Add case for when no nodes touched
	var x, x1, x2, leftDistance, rightDistance;
	for (var i=0;i<E.floor_nodes.length;i++){
		if(!E.floor_nodes[i-1]){ //if left support node
			if(E.floor_nodes[i].isCarOn() && !E.floor_nodes[i+1].isCarOn()){ //if the car is only on the current node
				x=E.car.left+E.car_length_px/2-E.floor_nodes[i].left; //portion of car on the right member (position of tail of car minus position of current node)
				rightDistance=E.floor_nodes[i+1].left-E.floor_nodes[i].left;
				E.floor_nodes[i].setForce(0,E.floor_nodes[i].external_force[1]-(rightDistance-x/2)*E.car_weight*x/(rightDistance*E.car_length_px),Grid.canvas);
			}
			else if(E.floor_nodes[i].isCarOn() && E.floor_nodes[i+1].isCarOn()){ //if the car is on the current and right node
				x=E.floor_nodes[i+1].left-E.floor_nodes[i].left; //portion of the car on the right member (position of right node minus position of current node)
				E.floor_nodes[i].setForce(0,E.floor_nodes[i].external_force[1]-x*E.car_weight/(2*E.car_length_px),Grid.canvas);
			}
			else if(!E.floor_nodes[i].isCarOn() && E.floor_nodes[i+1].isCarOn()){ //if the car is only on the right node
				x=E.floor_nodes[i+1].left-(E.car.left-E.car_length_px/2); //portion of the car on the right member(position of right node minus position of tail of car)
				rightDistance=E.floor_nodes[i+1].left-E.floor_nodes[i].left;
				E.floor_nodes[i].setForce(0,E.floor_nodes[i].external_force[1]-x*x*E.car_weight/(2*E.car_length_px*rightDistance),Grid.canvas);
			}
		}
		else if(!E.floor_nodes[i+1]){ //if right support node
			if(E.floor_nodes[i-1].isCarOn() && !E.floor_nodes[i].isCarOn()){ //if the car is only on the left member
				x=E.car.left+E.car_length_px/2-E.floor_nodes[i-1].left;
				leftDistance=E.floor_nodes[i].left-E.floor_nodes[i-1].left; //distance from the current node to the left node
				E.floor_nodes[i].setForce(0,E.floor_nodes[i].external_force[1]-x*x*E.car_weight/(2*E.car_length_px*leftDistance),Grid.canvas);
			}
			else if(E.floor_nodes[i-1].isCarOn() && E.floor_nodes[i].isCarOn()){ //if the car is both on the left node and the current node
				x=E.floor_nodes[i].left-E.floor_nodes[i-1].left;
				E.floor_nodes[i].setForce(0,E.floor_nodes[i].external_force[1]-x*E.car_weight/(2*E.car_length_px),Grid.canvas);
			}
			else if(!E.floor_nodes[i-1].isCarOn() && E.floor_nodes[i].isCarOn()){ //if the car is only on the support node
				x=E.floor_nodes[i].left-(E.car.left-E.car_length_px/2);
				distanceLeft=E.floor_nodes[i].left-E.floor_nodes[i-1].left;
				E.floor_nodes[i].setForce(0,E.floor_nodes[i].external_force[1]-((distanceLeft-x/2)*x*E.car_weight)/(distanceLeft*E.car_length_px),Grid.canvas);
			}
		}
		else if(E.floor_nodes[i-1] && E.floor_nodes[i+1]){ //if a regular floor node
			if(E.floor_nodes[i-1].isCarOn() && !E.floor_nodes[i].isCarOn() && !E.floor_nodes[i+1].isCarOn()){ //if the car is only on the left member
				x=E.car.left+E.car_length_px/2 -E.floor_nodes[i-1].left; //the portion of the car on the left member (the positon of the front of the car minus the position of the previous node)
				leftDistance=E.floor_nodes[i].left-E.floor_nodes[i-1].left; //distance from the current node to the left node
				E.floor_nodes[i].setForce(0,-(x*x*E.car_weight/(2*E.car_length_px*leftDistance)),Grid.canvas);
			}
			else if(E.floor_nodes[i-1].isCarOn() && E.floor_nodes[i].isCarOn() && !E.floor_nodes[i+1].isCarOn()){ //if the car is both on the left node and the current node
				x1=E.floor_nodes[i].left-E.floor_nodes[i-1].left; //the portion of the car on the left member (the harizontal distance between the current node and the left node)
				x2=E.car.left+E.car_length_px/2-E.floor_nodes[i].left; //the portion of the car on the right member (the position of the front of the car minus the position of the current node)
				rightDistance=E.floor_nodes[i+1].left-E.floor_nodes[i].left; //the distance from the right node to the current node
				E.floor_nodes[i].setForce(0,-(x1/2*(E.car_weight/E.car_length_px)+(rightDistance-x2/2)*(E.car_weight*x2/E.car_length_px)/rightDistance),Grid.canvas);
			}
			else if(!E.floor_nodes[i-1].isCarOn() && E.floor_nodes[i].isCarOn() && !E.floor_nodes[i+1].isCarOn()){ //if the car is only on the current node
				leftDistance=E.floor_nodes[i].left-E.floor_nodes[i-1].left;
				rightDistance=E.floor_nodes[i+1].left-E.floor_nodes[i].left;
				x1=E.floor_nodes[i].left-(E.car.left-E.car_length_px/2); //the portion of the car on the left member (the position of the current node minus the position of the tail of the car)
				x2=(E.car.left+E.car_length_px/2)-E.floor_nodes[i].left; //the portion of the car on the right member (the position of the front of the car minus the position of the current node)
				E.floor_nodes[i].setForce(0,-(((leftDistance-x1/2)*x1/leftDistance+(rightDistance-x2/2)*x2/rightDistance)*E.car_weight/E.car_length_px),Grid.canvas);
			}
			else if(!E.floor_nodes[i-1].isCarOn() && E.floor_nodes[i].isCarOn() && E.floor_nodes[i+1].isCarOn()){ //if the car is on the current and right node
				leftDistance=E.floor_nodes[i].left-E.floor_nodes[i-1].left;
				x1=E.floor_nodes[i].left-(E.car.left-E.car_length_px/2); //the portion of the car on the left member (the position of the current node minus the position of the tail of the car)
				x2=E.floor_nodes[i+1].left-E.floor_nodes[i].left; //the portion of the car on the right member (the position of the right node minus the position of the left node)
				E.floor_nodes[i].setForce(0,-((leftDistance-x1/2)*E.car_weight*x1/(E.car_length_px*leftDistance)+(x2/2*E.car_weight)/E.car_length_px),Grid.canvas);
			}
			else if(!E.floor_nodes[i-1].isCarOn() && !E.floor_nodes[i].isCarOn() && E.floor_nodes[i+1].isCarOn()){ //if the car is only on the right node
				x=E.floor_nodes[i+1].left-(E.car.left-E.car_length_px/2); //portion of car on right member (position of right node minus position of tail of car)
				rightDistance=E.floor_nodes[i+1].left-E.floor_nodes[i].left;
				E.floor_nodes[i].setForce(0,-(x*x*E.car_weight/(2*E.car_length_px*rightDistance)),Grid.canvas);
			}
			else if(E.floor_nodes[i-1].isCarOn() && E.floor_nodes[i].isCarOn() && E.floor_nodes[i+1].isCarOn()){ //if the car is on all three nodes
				x1=E.floor_nodes[i].left-E.floor_nodes[i-1].left; //portion of car on left member (position of current node minus position of left member)
				x2=E.floor_nodes[i+1].left-E.floor_nodes[i].left; //portion of car on right member (position of right node minus position of current node)
				E.floor_nodes[i].setForce(0,-((x1/2+x2/2)*E.car_weight/E.car_length_px),Grid.canvas);
			}
			else{
				E.floor_nodes[i].setForce(0,0,Grid.canvas);
			}
		}
	}
}

function methodOfJoints(){
	var force_matrix=[];
	var solution=[];
	for(var i=0;i<E.nodes.length;i++){
		var rowX=[];
		var rowY=[];
		solution.push(-E.nodes[i].external_force[0]);
		solution.push(-E.nodes[i].external_force[1]);
		for(var j=0;j<E.members.length;j++){
			E.members[j].calcLength();
			E.members[j].calcUnitVector();
			var connected=false;
			for(var k=0;k<E.nodes[i].connected_members.length;k++){ //check if the node has any of the conencted members
				if(E.members[j]===E.nodes[i].connected_members[k]){
					if(E.nodes[i].connected_members[k].x1===E.nodes[i].left && E.nodes[i].connected_members[k].y1===E.nodes[i].top){
						rowX.push(E.nodes[i].connected_members[k].unit_vector[0]);
						rowY.push(E.nodes[i].connected_members[k].unit_vector[1]);
					}
					else{ //flip the direction so all forces are tensile
						rowX.push(-E.nodes[i].connected_members[k].unit_vector[0]);
						rowY.push(-E.nodes[i].connected_members[k].unit_vector[1]);
					}
					connected=true;
				}

			}
			if(!connected){
				rowX.push(0);
				rowY.push(0);
			}
		}
		force_matrix.push(rowX);
		force_matrix.push(rowY);

	}

	force_matrix.pop();
		force_matrix.pop();

	force_matrix.pop();
	solution.pop();
	solution.pop();
	solution.pop();
	var forces=numeric.solve(force_matrix, solution, false);

	for(i=0;i<E.members.length;i++){
		E.members[i].setForce(forces[i]);
	}

	// var force_inverse=(1.0/numeric.det)force_matrix);

	// console.log(numeric.prettyPrint(force_inverse));
	// console.log(numeric.prettyPrint(solution));
	// force_matrix=math.matrix(force_matrix);


	// console.log('Members:'+ E.members.length);
	// console.log('Solutions:'+solution.length);
	// console.log('Forces: '+forces.length);
	// var inverse=numeric.inv(force_matrix
	// console.log(numeric.prettyPrint(force_matrix));

	// console.log(numeric.prettyPrint(numeric.solve(force_matrix, solution, false)));
	// console.log(numeric.prettyPrint(solution));

	// var forces=numeric.ccsLUPSolve(force_matrix, solution);
	// console.log('forces:');
	// console.log(numeric.prettyPrint(forces));
	// console.log(forces.length);
	
}


module.exports=function (){
	calculateSupportReactions();
	calculateWeightDistributionOfCar();
	methodOfJoints();
};

},{"./EntityController":3,"./Grid":5}],2:[function(require,module,exports){
var Car = fabric.util.createClass(fabric.Rect, {

    type: 'car',

    initialize: function(options) {
        if (!options) {
            options = {};
        }

        this.callSuper('initialize', options);
        this.set('label', options.label || '');
        
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
},{}],3:[function(require,module,exports){
var Grid=require('./Grid');

//Keeps track of all the nodes and members in the bridge design
var EntityController={
	car: null,
	car_length: 6,
	car_length_px: null,
	car_weight: 7.5,
	supportA: null,
	supportB: null,
	bridge_length: 15,
	nodes: [],
	members:[],
	floor_nodes: [],
	addNode:function(node){
		this.num_nodes+=1;
		this.nodes.push(node);
	},
	addMember:function(member){
		this.num_members+=1;
		this.members.push(member);
	},
	removeNode:function(node){
		this.num_nodes-=1;
		for (var i=0; i< this.nodes.length; i++){
			if (this.nodes[i]===node){
				this.nodes.splice(i,1);
				break;
			}
		}
	},
	removeMember:function(member){
		this.num_members-=1;
		for (var i=0; i< this.members.length; i++){
			if (this.members[i]===member){
				this.members.splice(i,1);
				break;
			}
		}
	},
	isValid: function(){
		if(this.members.length===2*this.nodes.length-3){
			return true;
		}
		return false;
	},
	calcCarLengthPx: function(){
		this.car_length_px=this.car_length*Grid.grid_size*Grid.grid_meter;
	}
};

module.exports=EntityController;
},{"./Grid":5}],4:[function(require,module,exports){
var ForceLine = fabric.util.createClass(fabric.Line, {
    type: 'forceline',

    initialize: function(options) {
        if (!options) {
            options = {};
        }

        this.callSuper('initialize', options);

        //settings default values of the most important properties
        this.set({
            fill: 'blue',
            stroke: '#FF0096',
            strokeWidth: 3,
            strokeLineJoin : "round",
            selectable: false,
            hasControls: false,
            hasBorders: false,
            label: options.label || '',
            x1: options.x1 || -100,
            y1: options.y1 || -100,
            x2: options.x2 || -100,
            y2: options.y2 || -100,
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
        ctx.fillStyle = '#FF0096'; //color of the font
        ctx.fillText(this.label, -this.width / 4+10, -this.height / 2+30);
    }
});

module.exports=ForceLine;
},{}],5:[function(require,module,exports){
var Grid = {
    canvas: null,
    grid_size: 50,
    min_grid_size:14,
    grid_meter: 1, //number of grid squares per meter
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
    },
    calcGridMeter: function(EntityController){
        if(EntityController.supportA && EntityController.supportB){
            this.grid_meter=(EntityController.supportB.left-EntityController.supportA.left)/(this.grid_size*EntityController.bridge_length);
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
},{}],6:[function(require,module,exports){
var Node=require('./Node');
var Member=require('./Member');
var Car=require('./Car');
var Grid=require('./Grid');
var EntityController=require('./EntityController');
var Calculate=require('./Calculate');

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
            EntityController.addNode(ModeController.new_node); 
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
                    EntityController.addMember(ModeController.new_member);
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
        else if(event.target.type=='car'){ 
            Calculate();
        }
    });

    $('#simulation-button').on('click', function(){
      if(!EntityController.isValid()){ //if the bridge design is not valid
        alert('The bridge design is not valid and does not satisfy the M=2N-3 conditionn'+
            'You have '+EntityController.nodes.length+' nodes and '+EntityController.members.length+' members');
      }
      else if(!EntityController.car){
        var car = new Car({
          width: EntityController.car_length*Grid.grid_meter*Grid.grid_size,
          height: Grid.grid_size,
          left: 50,
          top: canvas.getHeight()/2-40,
          label: 'Truck',
          length: EntityController.car_length,
          weight: EntityController.car_weight
      });
      EntityController.car=car;
      canvas.add(car);
      }
      Calculate();
      return false;
    });
};
},{"./Calculate":1,"./Car":2,"./EntityController":3,"./Grid":5,"./Member":7,"./Node":9}],7:[function(require,module,exports){
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
            stroke: 'grey',
            strokeWidth: 10,
            strokeLineJoin : "round",
            selectable: true, //settings this to false would disable the eraser from getting rid of it
            hasControls: false,
            hasBorders: false,
            x1: options.x1 || -100,
            y1: options.y1 || -100,
            x2: options.x2 || -100,
            y2: options.y2 || -100,
            label: options.label || '',
            force:null,
            member_length: null,
            unit_vector: [],
            start_node: null, //what node the member is connected to at it's start
            end_node: null //what node the member is connected to at it's end
        });
    },

    toObject: function() {
        return fabric.util.object.extend(this.callSuper('toObject'), {
            force: this.get('force'),
            start_node: this.get('start_node'),
            end_node: this.get('end_node'),
            label: this.get('label')
        });
    },

    _render: function(ctx) {
        this.callSuper('_render', ctx);
        ctx.font = '20px Arial';
        ctx.fillStyle = '#FF0096'; //color of the font
        ctx.fillText(this.label, -this.width / 4+10, -this.height / 2+30);
    }
});

Member.prototype.calcLength=function(){
    this.member_length=Math.sqrt((this.x2-this.x1)*(this.x2-this.x1)+(this.y2-this.y1)*(this.y2-this.y1));
};

Member.prototype.calcUnitVector=function(){
    this.unit_vector[0]=(this.x2-this.x1)/this.member_length;
    this.unit_vector[1]=(this.y2-this.y1)/this.member_length;
};

Member.prototype.setForce=function(x){
    this.force=x;
    this.label=Math.round(x*100)/100;

};

module.exports=Member;
},{}],8:[function(require,module,exports){
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

},{"./Member":7,"./Node":9}],9:[function(require,module,exports){
var E=require('./EntityController');
var ForceLine=require('./ForceLine');

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
            floor_beam: options.floor_beam || false,
            external_force: [0,0],
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

Node.prototype.setForce=function(x,y,canvas){

    this.external_force[0]=x || 0;
    this.external_force[1]=y || 0;
    roundedX=Math.round(x*100)/100;
    roundedY=Math.round(y*100)/100;
    if(this.forceLine){ //if a force line already exists
        this.forceLine.set({
            x1: this.left,
            y1: this.top,
            label: roundedY,
            x2: this.left,
            y2: this.top-y*200/E.car_weight
        });
    }
    else{ //if the forceline doesnt yet exist
        this.forceLine=new ForceLine({
            x1: this.left,
            y1: this.top,
            label: roundedY,
            x2: this.left,
            y2: this.top-y*200/E.car_weight
        });
        canvas.add(this.forceLine);
    }
};

Node.prototype.isCarOn=function(){
    if(E.car){
        if(this.left>=E.car.left-E.car_length_px/2 && this.left<=E.car.left+E.car_length_px/2){
            return true;
        }
    }
    return false;
};

module.exports=Node;
},{"./EntityController":3,"./ForceLine":4}],10:[function(require,module,exports){
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
},{}],11:[function(require,module,exports){
  var ModeController = require('./ModeController');
  var InteractionController = require('./InteractionController');
  var Grid = require('./Grid');
  var ResizeController = require('./ResizeController');
  var EntityController=require('./EntityController');
  var Node=require('./Node');
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

  //Adding inital support nodes
  var supportA=new Node({
    support: true,
    floor_beam: true,
    left: canvas.getWidth()/8,
    top:canvas.getHeight()/2,
    stroke: '#F41313',
    lockMovementY: true
  });
  var supportB=new Node({
    support: true,
    floor_beam: true,
    left: canvas.getWidth()*7/8,
    top:canvas.getHeight()/2,
    stroke: '#F41313',
    lockMovementY: true
  });
  
  EntityController.supportA=supportA;
  EntityController.supportB=supportB;
  EntityController.floor_nodes.push(supportA);
  EntityController.addNode(supportA);
  EntityController.addNode(supportB);
  canvas.add(supportA);
  canvas.add(supportB);

  //adding  evenly distributed floor beam nodes
  var num_floor_beams=4;
  for (var i=0;i<num_floor_beams;i++){
    var spacing=(supportB.left-supportA.left)/(num_floor_beams+1);
    var new_floor_node=new Node({
      floor_beam: true,
      left: supportA.left+(i+1)*spacing,
      top:canvas.getHeight()/2,
      stroke: '#000000',
      lockMovementY: true
    });
    EntityController.addNode(new_floor_node);
    EntityController.floor_nodes.push(new_floor_node);
    canvas.add(new_floor_node);
  }
  EntityController.floor_nodes.push(supportB);



},{"./EntityController":3,"./Grid":5,"./InteractionController":6,"./ModeController":8,"./Node":9,"./ResizeController":10}]},{},[11]);
