(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
//Performs the cost and force calculation of the truss
var E=require('./EntityController');
var Grid=require('./Grid');

//Calculating the support reactions at the 2 support nodes using moments
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

//Calculates the reaction force at the nodes that the car is on using moments
function calculateWeightDistributionOfCar(){ 
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
			else if ((E.car.left+E.car_length_px/2)<E.floor_nodes[i+1].left && (E.car.left-E.car_length_px/2)>E.floor_nodes[i].left){ //if the car is on the right member but not on top of any nodes (if the tail of the car is ahead of the current node position and the front of the car is behind the right nodes position)
				x=E.floor_nodes[i+1].left-E.car.left;
				rightDistance=E.floor_nodes[i+1].left-E.floor_nodes[i].left;
				E.floor_nodes[i].setForce(0, E.floor_nodes[i].external_force[1]-x*E.car_weight/rightDistance, Grid.canvas);
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
			else if ((E.car.left-E.car_length_px/2)>E.floor_nodes[i-1].left && (E.car.left+E.car_length_px/2)<E.floor_nodes[i].left){ //if the car is on the left member but not on top of any nodes (if the cars tail is ahead of the left nodes position and the cars front is behind the current nodes position)
				x=E.car.left-E.floor_nodes[i-1].left;
				leftDistance=E.floor_nodes[i].left-E.floor_nodes[i-1].left;
				E.floor_nodes[i].setForce(0, E.floor_nodes[i].external_force[1]-x*E.car_weight/leftDistance, Grid.canvas);
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
			else if ((E.car.left+E.car_length_px/2)<E.floor_nodes[i+1].left && (E.car.left-E.car_length_px/2)>E.floor_nodes[i].left){ //if the car is on the right member but not on top of any nodes (if the tail of the car is ahead of the current node position and the front of the car is behind the right nodes position)
				x=E.floor_nodes[i+1].left-E.car.left;
				rightDistance=E.floor_nodes[i+1].left-E.floor_nodes[i].left;
				E.floor_nodes[i].setForce(0, -x*E.car_weight/rightDistance, Grid.canvas);
			}
			else if ((E.car.left-E.car_length_px/2)>E.floor_nodes[i-1].left && (E.car.left+E.car_length_px/2)<E.floor_nodes[i].left){ //if the car is on the left member but not on top of any nodes (if the cars tail is ahead of the left nodes position and the cars front is behind the current nodes position)
				x=E.car.left-E.floor_nodes[i-1].left;
				leftDistance=E.floor_nodes[i].left-E.floor_nodes[i-1].left;
				E.floor_nodes[i].setForce(0, -x*E.car_weight/leftDistance, Grid.canvas);
			}
			else{
				E.floor_nodes[i].setForce(0,0,Grid.canvas);
			}
		}
	}
}

//Creates a matrix of 2N-3 equations based on the method of joints, and solves it
function methodOfJoints(){
	var force_matrix=[]; //each row will represent an Fx and Fy equation for each node
	var solution=[]; //this will represent the external forces in the x and y direction acting on the node

	for(var i=0;i<E.nodes.length;i++){ //iterate through all of the nodes that exist
		var rowX=[]; //will represent the Fx equation for the node
		var rowY=[]; //will represent the Fy equation for the node
		solution.push(-E.nodes[i].external_force[0]); //the external forces in the x direction of the node
		solution.push(-E.nodes[i].external_force[1]); //the external forces in the y direction o fthe noe
		
		for(var j=0;j<E.members.length;j++){ //iterate through all of the members that exist
			E.members[j].calcLength();
			E.members[j].calcUnitVector();

			var connected=false; //check if the member is connected to the node
			for(var k=0;k<E.nodes[i].connected_members.length;k++){ 
				if(E.members[j]===E.nodes[i].connected_members[k]){ //if the member is connected to the node
					if(E.nodes[i].connected_members[k].x1===E.nodes[i].left && E.nodes[i].connected_members[k].y1===E.nodes[i].top){ //if the start of the member is connected to the node
						rowX.push(-E.nodes[i].connected_members[k].unit_vector[0]);
						rowY.push(-E.nodes[i].connected_members[k].unit_vector[1]);
					}
					else{ //if the end of the member is at the node, flip the direction so all forces are tensile
						rowX.push(E.nodes[i].connected_members[k].unit_vector[0]);
						rowY.push(E.nodes[i].connected_members[k].unit_vector[1]);
					}
					connected=true;
				}

			}
			if(!connected){ //if the member is not connected to the node, then its not part of its Force equations
				rowX.push(0);
				rowY.push(0);
			}
		}
		force_matrix.push(rowX);
		force_matrix.push(rowY);
	}

	//eliminating last 3 equation since we have 2N equations and have 2N-3 members, thus we have 3 extra equations 
	force_matrix.pop();
	force_matrix.pop();
	force_matrix.pop();
	solution.pop();
	solution.pop();
	solution.pop();

	var forces=numeric.solve(force_matrix, solution, false); //solving for the forces

	E.designPass=true; //for checking whether a design meets the criteria
	
	//applying the force value to the specified member, as well as checking if its under the constraints
	for(i=0;i<E.members.length;i++){
		E.members[i].setForce(forces[i],E);
		if(forces[i]>0 && forces[i]>E.max_tensile){
			E.designPass=false;
		}
		else if(forces[i]<0 && Math.abs(forces[i])>E.max_compressive){
			E.designPass=false;
		}
	}
}

//Calculates the cost of the bridge
function calculateCost(){
	var bridge_cost=0;
	for(var i=0;i<E.members.length;i++){
		var meter_length=E.members[i].member_length/(Grid.grid_size*Grid.grid_meter);
		bridge_cost+=meter_length*E.member_cost_meter;
	}
	bridge_cost+=E.nodes.length*E.node_cost;
	E.currentDesignCost=Math.round(bridge_cost*100)/100;
	return Math.round(bridge_cost*100)/100;
}

module.exports=function (){
	calculateSupportReactions();
	calculateWeightDistributionOfCar();
	methodOfJoints();
	$('#bridge_cost').text(calculateCost());
};

},{"./EntityController":3,"./Grid":5}],2:[function(require,module,exports){
//The car fabric.js object
var Car = fabric.util.createClass(fabric.Rect, {
    type: 'car',

    initialize: function(options) {
        if (!options) {
            options = {};
        }

        this.callSuper('initialize', options);
        
        this.set({
            //Restricting movement of the car by player to only the x-axis
            lockMovementY: true,
            lockRotation: true,
            lockScalingX: true,
            lockScalingY: true,
            hasControls: false,
            hasBorders: false,
            height: options.height || 50,
            left: options.left ||50,
            fill: "hsla(123, 51%, 64%, 0.65)",
            label: options.label || 'Distributed Load'
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
        ctx.fillText(this.label,  -this.width / 4, -this.height / 3+30); //so the text will position at the center of the car
    }
});

module.exports = Car;
},{}],3:[function(require,module,exports){
var Grid = require('./Grid');
var Node=require('./Node');
var Member=require('./Member');

String.prototype.replaceAll = function(str1, str2, ignore) 
{
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
};

//Keeps track of all the nodes and members in the bridge design
var EntityController = {
	//configurable variables
    car_length: 6, //the length of the car in m
    bridge_length: 15, //the length of the bridge in m
    car_weight: 7.5, //entire weight of the car in kN
    member_cost_meter: 10, //cost of members per meter
    node_cost: 5, //cost of each node
    max_compressive:8,
    max_tensile: 12,

    //dev stuff for calculations
    car: null,
    car_length_px: null,
    supportA: null,
    supportB: null,
    nodes: [],
    members: [],
    floor_nodes: [],

    //color stuff
    erase_fill: '#E43A3A',
    node_fill: '#FFFFFF',

    //for optimizer stuff
    designPass: false,
    currentDesignCost: 10E12,

    exportHash: function(jsonStr) {
        //replace common phrases with specific characters that will not be used and in an order that is particular        
        var hashStr = jsonStr;
        var phrases = {"\"nodes\":":'A', "\"support\":":'B', "\"floor_beam\":":'C', "\"top\":":'D', "\"left\":":'E',
                        "\"members\":":'F', "\"x1\":":'G', "\"x2\":":'H', "\"y1\":":'I', "\"y2\":":'J',
                        "true":'K', "false":'L', "[{":'M', "]}":'N'};
        var numComb = {}; //some number combinations
        var numDec = {}; //number and decimal combinations
        var i, find, re;

        for (i = 10; i < 36; i++) {
            numComb[i]=String.fromCharCode(87+i);
        }

        for (i = 0; i < 10; i++) {
            numDec[(i+'.')] = String.fromCharCode(33+i); 
        }

        for (i in phrases) {
            hashStr = hashStr.replaceAll(i, phrases[i]);     
        }

        //replace the nodeStr part
        nodeStrRep = /"nodestr"(\s|\S)+?(?=A)/g;
        hashStr = hashStr.replace(nodeStrRep, '');

        for (i in numComb) {
            hashStr = hashStr.replace(i, numComb[i]);     
        }

        for (i in numDec) {
            hashStr = hashStr.replace(i, numDec[i]);                 
        }

        return hashStr;
    },
    importHash: function(hashStr) {
        var jsonStr = hashStr;
        var phrases = {"\"nodes\":":'A', "\"support\":":'B', "\"floor_beam\":":'C', "\"top\":":'D', "\"left\":":'E',
                        "\"members\":":'F', "\"x1\":":'G', "\"x2\":":'H', "\"y1\":":'I', "\"y2\":":'J',
                        "true":'K', "false":'L', "[{":'M', "]}":'N'};
        var numComb = {}; //some number combinations
        var numDec = {}; //number and decimal combinations
        var i, find, re;

        for (i = 10; i < 36; i++) {
            numComb[i]=String.fromCharCode(87+i);
        }

        for (i = 0; i < 10; i++) {
            numDec[(i+'.')] = String.fromCharCode(33+i); 
        }

        for (i in numDec) {
            jsonStr = jsonStr.replaceAll(numDec[i], i);                 
        }
        
        for (i in numComb) {
            jsonStr = jsonStr.replaceAll(numComb[i], i);     
        }

        for (i in phrases) {
            jsonStr = jsonStr.replaceAll(phrases[i], i);     
        }

        this.import(JSON.parse(jsonStr));
    },

    //export
    export: function() {
        var exportObj = {};
        var impProp = ['nodes', 'members'];
        var nodeStr = "";
        //added extra info to quickly get important information
        for (var j in this.nodes) {
            if (!this.nodes[j].floor_beam)
                nodeStr += "("+(Math.round((this.nodes[j].left-this.supportA.left)*100)/100)+", "+(Math.round((this.nodes[j].top-this.supportA.top)*100)/100)+"), ";
        }
        exportObj.nodestr = nodeStr;

        //do rounding on x's and y's
        for (var i in impProp) {
            exportObj[impProp[i]] = this[impProp[i]];
            if (impProp[i] == "nodes")
                for (var o in this[impProp[i]]) {
                    exportObj[impProp[i]][o].left = Math.round(exportObj[impProp[i]][o].left*100)/100;
                    exportObj[impProp[i]][o].top = Math.round(exportObj[impProp[i]][o].top*100)/100;
                }
            if (impProp[i] == "members")
                for (j in this[impProp[i]]) {
                    exportObj[impProp[i]][j].x1 = Math.round(exportObj[impProp[i]][j].x1*100)/100;
                    exportObj[impProp[i]][j].x2 = Math.round(exportObj[impProp[i]][j].x2*100)/100;
                    exportObj[impProp[i]][j].y1 = Math.round(exportObj[impProp[i]][j].y1*100)/100;
                    exportObj[impProp[i]][j].y2 = Math.round(exportObj[impProp[i]][j].y2*100)/100;
                }                
        }
        return exportObj;
    },
    //recreate everything on the canvas from the entity controller
    import: function(jsonObj) {
        //reset everything
        this.clearAllNodes();
        //create initial nodes
        for (var i in jsonObj.nodes) {
            if(jsonObj.nodes[i].floor_beam) {
            }
            node = new Node();
            node.copyProp(jsonObj.nodes[i]);
            this.addNode(node);
            //draw everyone as they come
            Grid.canvas.add(node);
            if(node.support) { 
                if (i < 1) {
                    this.supportA = node;
                    this.floor_nodes.push(node);
                } else {
                    this.supportB = node;
                    //push later in to floor_nodes;
                }
            }
            if(node.floor_beam && !node.support) {
                this.floor_nodes.push(node);
            }
        }
        this.floor_nodes.push(this.supportB);

        for (var o in jsonObj.members) {
            member = new Member();
            member.copyProp(jsonObj.members[o]);
            
            //find start node
            for (var j in this.nodes) {
                if (member.isStartNode(this.nodes[j])) {
                    member.start_node=this.nodes[j];
                    this.nodes[j].connected_members.push(member);
                }
            }
            //find end node
            for (var k in this.nodes) {
                if (member.isEndNode(this.nodes[k])) {
                    member.end_node=this.nodes[k];
                    this.nodes[k].connected_members.push(member);
                }       
            }
            member.stroke='hsla(65, 100%, 60%, 1)';
            Grid.canvas.add(member);
            //push
            this.addMember(member);
        }

        for (var l in this.nodes) {
            Grid.canvas.bringToFront(this.nodes[l]); 
        }
        Grid.canvas.renderAll();

    },
    //A reset function  
    clearAllNodes: function() {
        this.nodes=[];
        this.members=[];
        this.floor_nodes=[];
        this.car = this.supportA = this.supportB = null;
        Grid.canvas.clear().renderAll();
        Grid.createGrid();
        this.num_nodes = 0;
        this.num_members = 0;
    },
    createFloorNodes: function(num_floor_beams) {
        //delete everything else if this function is called since it will be a mess otherwise
        this.clearAllNodes();
        var canvasHeight = $('#canvas-wrapper').height();
        var canvasWidth = $('#canvas-wrapper').width();
        //Adding inital support nodes
        var supportA=new Node({
          support: true,
          floor_beam: true,
          left: canvasWidth/8,
          top: canvasHeight/3,
          stroke: '#F41313',
          lockMovementY: true,
          lockMovementX: true
        });
        var supportB=new Node({
          support: true,
          floor_beam: true,
          left: canvasWidth*7/8,
          top: canvasHeight/3,
          stroke: '#F41313',
          lockMovementY: true,
          lockMovementX: true
        });
        this.supportA=supportA;
        this.supportB=supportB;

        EntityController.floor_nodes.push(supportA);
        EntityController.addNode(supportA);
        EntityController.addNode(supportB);
        Grid.canvas.add(supportA);
        Grid.canvas.add(supportB);

        //adding  evenly distributed floor beam nodes
        for (var i=0;i<num_floor_beams;i++){
            var spacing=(supportB.left-supportA.left)/(num_floor_beams+1);
            var new_floor_node=new Node({
                floor_beam: true,
                left: supportA.left+(i+1)*spacing,
                top: canvasHeight/3,
                stroke: '#000000',
                lockMovementY: true
            });
            EntityController.addNode(new_floor_node);
            EntityController.floor_nodes.push(new_floor_node);
            Grid.canvas.add(new_floor_node);
        }
        EntityController.floor_nodes.push(supportB);
        Grid.canvas.renderAll();
    },
    addNode: function(node) {
        this.num_nodes += 1;
        this.nodes.push(node);
    },
    addMember: function(member) {
        this.num_members += 1;
        this.members.push(member);
    },
    removeNode: function(node) {
        this.num_nodes -= 1;
        for (var i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i] === node) {
                this.nodes.splice(i, 1);
                break;
            }
        }
    },
    removeMember: function(member) {
        this.num_members -= 1;
        for (var i = 0; i < this.members.length; i++) {
            if (this.members[i] === member) {
                this.members.splice(i, 1);
                break;
            }
        }
    },
    isValid: function() {
        if (this.members.length === 2 * this.nodes.length - 3) {
            return true;
        }
        return false;
    },
    calcCarLengthPx: function() {
        this.car_length_px = this.car_length * Grid.grid_size * Grid.grid_meter;
    }
};

module.exports = EntityController;
},{"./Grid":5,"./Member":8,"./Node":10}],4:[function(require,module,exports){
//The pink forceline fabric.js object that shows the reation forces at a node 
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
//the grid singleton. Contains all properties about the grid as well as methods to create and resize the grid
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

module.exports = Grid;
},{}],6:[function(require,module,exports){
//Handles monitoring changes from the input text fields and applying them to the appropriate controller
//Also handles import and export events when the buttons are pressed

var EntityController=require('./EntityController');
var Grid=require('./Grid');
var Optimizer=require('./Optimizer');

var InputController=function(){

	$('#bridge-length-input').change(function() {
	    var new_bridge_length = parseInt($(this).val());
	    if (!isNaN(new_bridge_length)) { //to make sure the input is valid (is an integer)
	       EntityController.bridge_length=new_bridge_length;
	    }
	});

	$('#car-weight-input').change(function() {
	    var new_car_weight = parseInt($(this).val());
	    if (!isNaN(new_car_weight)) { //to make sure the input is valid (is an integer)
	       EntityController.car_weight=new_car_weight;
	    }
	});

	$('#car-length-input').change(function() {
	    var new_car_length = parseInt($(this).val());
	    if (!isNaN(new_car_length)) { //to make sure the input is valid (is an integer)
	       EntityController.car_length=new_car_length;
	    }
	});

	$('#max-compressive-input').change(function() {
	    var max = parseInt($(this).val());
	    if (!isNaN(max)) { //to make sure the input is valid (is an integer)
	       EntityController.max_compressive=max;
	    }
	});

	$('#max-tensile-input').change(function() {
	    var max = parseInt($(this).val());
	    if (!isNaN(max)) { //to make sure the input is valid (is an integer)
	       EntityController.max_tensile=max;
	    }
	});

	$('#num-floor-input').change(function() {
	    var num_floor_nodes = parseInt($(this).val());
	    if (!isNaN(num_floor_nodes) && num_floor_nodes < 10) { //to make sure the input is valid (is an integer and less than 10)
	       EntityController.createFloorNodes(num_floor_nodes);
	    }
	});

	$('#optimizer_var_input').change(function() {
	    var variance = parseInt($(this).val());
	    if (!isNaN(variance) && variance!==0) { //to make sure the input is valid (is an integer and non-zero)
	      	Optimizer.variation=variance;
	    }
	});

	$('#optimizer_dur_input').change(function() {
	    var duration = parseInt($(this).val());
	    if (!isNaN(duration) && duration >1) { //to make sure the input is valid (is an integer and greater than 1)
	       Optimizer.duration=duration;
	    }
	});

	//Monitors for changes in the grid spacing input field and re-creates the grid if a change is detected
	$('#grid-size-input').change(function() {
	    var new_grid_size = parseInt($('#grid-size-input').val());
	    if (!isNaN(new_grid_size) && new_grid_size > Grid.min_grid_size) { //makes sure the new grid size is an integer and greater than the minimum grid size
	        Grid.grid_size = new_grid_size;
	        Grid.createGrid(); //recreates the grid with the new specified grid size
	    }
	});

	$('#exportBtn').click(function() {
		jsonStr = JSON.stringify(EntityController.export()); //export the entity controller as a string
		$('#export-cont').val(jsonStr); //paste the string in the export field
		$('#uniqueHash').val(EntityController.exportHash(jsonStr)); //hash the output and paste it in the hash input field
		return false;
	});

	$('#importBtn').click(function() {
		jsonStr = $('#export-cont').val(); //stores the value of the import text field
		if (jsonStr.length > 0) { //makes sure its not empty
			if (jsonStr.charAt(1) == 'A') { //if the input is a hash
				EntityController.importHash(jsonStr);
			} else { //if the input is not hashed
				jsonObj = JSON.parse(jsonStr);
				EntityController.import(jsonObj);
			}
		}
		return false;
	});

	//selects all of the text on click of the export and hash input fields
	$('#export-cont').click(function () {
		this.select();
	});
	$('#uniqueHash').click(function() {
		this.select();
	});
};

module.exports=InputController;
},{"./EntityController":3,"./Grid":5,"./Optimizer":11}],7:[function(require,module,exports){
//Handles canvas interaction from the user, including movemnet of nodes, car, and erasing

var Node = require('./Node');
var Member = require('./Member');
var Car = require('./Car');
var Grid = require('./Grid');
var EntityController = require('./EntityController');
var Calculate = require('./Calculate');
var Optimizer=require('./Optimizer');

module.exports = function(canvas, ModeController) {

    //Handles movement of new nodes and new members
    canvas.on('mouse:move', function(event) {
        //if in 'add-node' mode
        if (ModeController.mode === 'add_node' && !ModeController.simulation) {
            ModeController.new_node.set({ //set the new node to follow the cursor
                'left': event.e.x,
                'top': event.e.pageY - $('#canvas-wrapper').offset().top
            });
            canvas.renderAll();
        }
        //if in 'add-member' mode and the start of the member has been placed already
        else if (ModeController.mode === 'add_member' && (ModeController.new_member.start_node && !ModeController.new_member.end_node) && !ModeController.simulation) {
            ModeController.new_member.set({ //set the end of the member to follow the cursor
                'x2': event.e.x,
                'y2': event.e.pageY - $('#canvas-wrapper').offset().top
            });
            canvas.renderAll();
        }
    });

    //Handles placements of new nodes
    canvas.on('mouse:up', function(event) {
        if (ModeController.show_node_coords) {
            ModeController.updateNodeDistance();
        }
        if (ModeController.mode === 'add_node' && !ModeController.simulation) {
            canvas.remove(ModeController.new_node); //for some reason have to remove and re-add node to avoid weird glitcheness
            canvas.add(ModeController.new_node);
            canvas.bringToFront(ModeController.new_node); //bringing the new node to the front of the canvas
            EntityController.addNode(ModeController.new_node);
            ModeController.new_node = new Node(); //create a new node, while leaving the old one in the canvas
            canvas.add(ModeController.new_node); //adding the new node to the canvas
        } else if (ModeController.mode === 'add_member' && !ModeController.simulation) {
            if (event.target && event.target.type === 'node') { //if a node has been clicked on
                if (!ModeController.new_member.start_node) { //if the member's start has not been determined yet
                    ModeController.new_member.set({ //position the start of the member to be at the center of the node
                        x1: event.target.left,
                        y1: event.target.top,
                        x2: event.target.left,
                        y2: event.target.top
                    });
                    ModeController.new_member.start_node = event.target;
                    event.target.connected_members.push(ModeController.new_member);
                    canvas.renderAll();
                } else if (ModeController.new_member.start_node && !ModeController.new_member.end_node && event.target != ModeController.new_member.start_node) { //if the new member already has a starting node and the end has not been determined yet
                    ModeController.new_member.set({ //place the end of the node at the center of the selected node
                        x2: event.target.left,
                        y2: event.target.top
                    });
                    ModeController.new_member.end_node = event.target;
                    event.target.connected_members.push(ModeController.new_member);

                    canvas.remove(ModeController.new_member); //re-add the member to avoid weird glitchiness
                    canvas.add(ModeController.new_member);
                    canvas.sendToBack(ModeController.new_member);
                    EntityController.addMember(ModeController.new_member);
                    ModeController.new_member = new Member(); //create a new member while leaving the old one in the canvas
                    if(event.e.shiftKey) {
                        ModeController.new_member.set({ //position the start of the member to be at the center of the node
                            x1: event.target.left,
                            y1: event.target.top,
                            x2: event.target.left,
                            y2: event.target.top
                        });
                        ModeController.new_member.start_node = event.target;
                        event.target.connected_members.push(ModeController.new_member);
                    }
                    canvas.add(ModeController.new_member);
                }
            }
        } 
        //erasing a node as well as all of its connected members
        else if (ModeController.mode === 'erase' && !ModeController.simulation && event.target && event.target.type==='node') { //if not in simulation mode and clicked on a node
            var nodeToRemove = event.target;
            if (!nodeToRemove.support && !nodeToRemove.floor_beam) { //if a regular node, allow deletion
                var membersToRemove = [];
                var i, j;
                //iterate and remove from canvas all of the node's connected members
                for (i = 0; i < nodeToRemove.connected_members.length; i++) { //iterate through all of the node's connected members
                    if (nodeToRemove.connected_members[i].start_node === nodeToRemove) { //if the connected members start node is the node to remove
                        for (j = 0; j < nodeToRemove.connected_members[i].end_node.connected_members.length; j++) { //go to the end node of the member and delete the member from there
                            if (nodeToRemove.connected_members[i].end_node.connected_members[j] === nodeToRemove.connected_members[i]) {
                                nodeToRemove.connected_members[i].end_node.connected_members.splice(j, 1);
                                break;
                            }
                        }
                    } else { //if the connected members end node is the node to remove
                        for (j = 0; j < nodeToRemove.connected_members[i].start_node.connected_members.length; j++) { //go to the start node of the member and delete the member from there
                            if (nodeToRemove.connected_members[i].start_node.connected_members[j] === nodeToRemove.connected_members[i]) {
                                nodeToRemove.connected_members[i].start_node.connected_members.splice(j, 1);
                                break;
                            }
                        }
                    }
                    canvas.remove(nodeToRemove.connected_members[i]); //remove the connected member from the canvas
                    membersToRemove.push(nodeToRemove.connected_members[i]);
                }
                canvas.remove(nodeToRemove); //remove the selected node from the canvas

                for(i=0;i<EntityController.nodes.length;i++){ //removing the node from the enity controller
                    if(EntityController.nodes[i]===nodeToRemove){
                        EntityController.nodes.splice(i,1);
                        break;
                    }
                }
                for(i=0;i<EntityController.members.length;i++){ //removing the members from the entity controller
                    for(j=0;j<membersToRemove.length;j++){
                        if(membersToRemove[j]===EntityController.members[i]){
                            EntityController.members.splice(i,1);
                            // membersToRemove.splice(j,1);
                        }
                    }
                }
            }
        }
    });
    
    //changes the color of an object to red when hovered over during erase mode
    canvas.on('mouse:over', function(e) {
        if (ModeController.mode === 'erase' && !ModeController.simulation && e.target && e.target.type==='node') {
            e.target.setFill(EntityController.erase_fill);
            canvas.renderAll();
        }
    });

    //sets the color back
    canvas.on('mouse:out', function(e) {
        if (ModeController.mode === 'erase' && !ModeController.simulation && e.target.type==='node') {
            e.target.setFill(EntityController.node_fill);
            canvas.renderAll();
        }
    });

    canvas.on('object:moving', function(event) {
        if (event.target.type == 'node') { //if a node is moving
            var node = event.target;
            if(node.floor_beam && ModeController.show_node_coords) {
                    ModeController.updateNodeDistance();
            }
            //only allow node to have a separation distance of 3m between its neighbour
            if (ModeController.max_spacing && node.floor_beam && !node.support) {
                //find out the index of the node in the floor_nodes array
                var index;
                for (index in EntityController.floor_nodes) {
                    if (EntityController.floor_nodes[index].left == node.left) {
                        break;
                    }
                }
                var left, right, gridMeter;
                gridMeter = (EntityController.supportB.left-EntityController.supportA.left)/15;
                left = (node.left - EntityController.floor_nodes[index-1].left)/gridMeter;
                right = (EntityController.floor_nodes[+index+1].left - node.left)/gridMeter;
                if (left > 3) {
                    node.left = EntityController.floor_nodes[+index-1].left+3*gridMeter;
                } else if (right > 3) {
                    node.left = EntityController.floor_nodes[+index+1].left-3*gridMeter;
                }
            }
            node.moveMembers(canvas);
            if (ModeController.simulation) {
                Calculate();
            }
        } else if (event.target.type == 'car') {
            Calculate();
        }
    });

    //hotkeys are created here
    var keyListener = document.getElementById('canvas-wrapper');
    keyListener.tabIndex = 1000; //required to get the canvas wrapper register events with keys
    $(keyListener).keydown(function(event) {
        // console.log('key pressed was: '+event.which); // for debug
        switch (event.which) {
            case 27: //escape key
                ModeController.move_mode();
                break;
            case 46: //delete key
                ModeController.erase_mode();
                break;
            case 77: //'m' key
                ModeController.add_member_mode();
                break;
            case 78: //'n' key
                ModeController.add_node_mode();
                break;
        }
    });

    $('#optimize-button').on('click', function() {
        if(ModeController.simulation){
            Optimizer.optimize();
        }
    });

    $('#simulation-button').on('click', function() {
        ModeController.simulation_mode();
        if (ModeController.simulation) {
            $('#simulation-button').html('Stop Simulation');
            $("#add-node-button").attr("disabled", true);
            $("#add-member-button").attr("disabled", true);
            $("#eraser-button").attr("disabled", true);
             $("#optimize-button").attr("disabled", false);
        } else {
            $('#simulation-button').html('Start Simulation');
            $("#add-node-button").attr("disabled", false);
            $("#add-member-button").attr("disabled", false);
            $("#eraser-button").attr("disabled", false);
            $("#optimize-button").attr("disabled", true);
        }

        return false;
    });
};
},{"./Calculate":1,"./Car":2,"./EntityController":3,"./Grid":5,"./Member":8,"./Node":10,"./Optimizer":11}],8:[function(require,module,exports){
//member fabric.js object that represents the individual members of the truss
var Member = fabric.util.createClass(fabric.Line, {
    type: 'member',

    initialize: function(options) {
        if (!options) {
            options = {};
        }

        this.callSuper('initialize', options);

        this.set({
            fill: 'blue',
            stroke: 'hsla(243, 0%,50%, 1)',
            strokeWidth: 10,
            strokeLineJoin : "round",
            selectable: false, //settings this to false would disable the eraser from getting rid of it
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
        retObj = {};
        var impAttr = ['x1', 'x2', 'y1', 'y2'];
        for (var i in impAttr) {
            retObj[impAttr[i]] = this[impAttr[i]];
        }
        return retObj;
    },

    _render: function(ctx) {
        this.callSuper('_render', ctx);
        if (this.force !== null) {
            // ctx.fillRect(-10, -8, 80, 28); //shows a white rectangle behind the force
            ctx.font = '20px Arial';
            ctx.fillStyle = 'hsla(53, 100%, 24%, 1)'; //color of the font
            ctx.fillText(this.label, 0,20);
        }
    }
});

//calculates the length of the member in pixels for cost calculations
Member.prototype.calcLength=function(){
    this.member_length=Math.sqrt((this.x2-this.x1)*(this.x2-this.x1)+(this.y2-this.y1)*(this.y2-this.y1));
};

//calculates the unit vector of the member (length needs to be calculated first, so calcLength() should be called before hand)
Member.prototype.calcUnitVector=function(){
    this.unit_vector[0]=(this.x2-this.x1)/this.member_length;
    this.unit_vector[1]=(this.y2-this.y1)/this.member_length;
};

//for the import functionality, takes in a json singleton representing a member, and applies its properties to the current member
Member.prototype.copyProp=function(memberObj) {
    var impAttr = ['x1', 'x2', 'y1', 'y2'];
    for (var i in impAttr) {
        this[impAttr[i]] = memberObj[impAttr[i]];
    }
    this.width = Math.abs(this.x1-this.x2);
    this.height = Math.abs(this.y1-this.y2);
    this.left = Math.min(this.x1,this.x2)+this.width/2;
    this.top = Math.min(this.y1, this.y2)+this.height/2;
    this.member_length = Math.sqrt(this.width*this.width+this.height*this.height);
};

//checks if a node is the start node of the member
Member.prototype.isStartNode=function(nodeObj) {
    if (Math.round(nodeObj.left*100)/100 == Math.round(this.x1*100)/100 && Math.round(nodeObj.top*100)/100 == Math.round(this.y1*100)/100)
        return true;
    return false;
};

//checks if a node is the end node of the member
Member.prototype.isEndNode=function(nodeObj) {
    if (Math.round(nodeObj.left*100)/100 == Math.round(this.x2*100)/100 && Math.round(nodeObj.top*100)/100 == Math.round(this.y2*100)/100)
        return true;
    return false;
};

module.exports=Member;

//sets the force of the member as well as sets the proper color based on if its under compression or tension, as well as how close it is to its maximum tension or compression
Member.prototype.setForce=function(x,EntityController){
    this.force=x;
    var percentMax;
    if(x<0){ //if the force is compressive
        percentMax=-x*100/EntityController.max_compressive;
        if(percentMax>100){ //if the force exceeded compressive tensile force
            this.stroke='hsla(65, 100%, 60%, 1)';
        }
        else{
            this.stroke='hsla(360, '+(percentMax*0.8+20)+'%,50%, 1)';
        }
    }
    else if(x>0){ //if the force is tensile
        percentMax=x*100/EntityController.max_tensile;
        if(percentMax>100){ //if the force exceeded maximum tensile force
            this.stroke='hsla(65, 100%, 60%, 1)';
        }
        else{
            this.stroke='hsla(243, '+(percentMax*0.8+20)+'%,50%, 1)';
        }
    }
    else{
        this.stroke='hsla(243, 0%,50%, 1)';
    }
    this.label=Math.round(x*100)/100 || '';
};


},{}],9:[function(require,module,exports){
//Sets the current mode based on what button the user presses, as well as holds the context for the current node and member
//TODO: Set cursors based on what mode is selected
var Node=require('./Node');
var Member=require('./Member');
var EntityController = require('./EntityController.js');
var Calculate=require('./Calculate');
var Car=require('./Car');
var Grid=require('./Grid');

var ModeController={
	canvas: null,
	mode: 'move',
	simulation: false,
	new_node:null,
	new_member: null,
	show_node_coords: false,
	max_spacing:false,

	enableMaxSpacing:function() { //max spacing that doesnt let any of the floor nodes get farther than 3m
		this.max_spacing = !this.max_spacing;
		if (this.max_spacing) {
			$('#max-spacing-button').text("Disable Max Spacing");
		} else {
			$('#max-spacing-button').text('Enable Max Spacing');
		}
	},
	//positions the car to the exact middle of the bridge
	carToMiddle:function() {
		var gridMeter = (EntityController.supportB.left-EntityController.supportA.left)/15;
		EntityController.car.left=gridMeter*7.5+EntityController.car_length_px/2.4;
		Calculate();
		Grid.canvas.renderAll();
	},
	//shows the coordinates of all the nodes
	showNodeCoords:function() {
		this.show_node_coords = !this.show_node_coords;
		for (var i in EntityController.nodes) {
			EntityController.nodes[i].showCoords = this.show_node_coords;
		}
		if (this.show_node_coords) {
			this.updateNodeDistance();
		} else {
			$('#floorNodeDist').text('');
		}
		Grid.canvas.renderAll();
	},
	//updates the distance between each of the floor nodes
	updateNodeDistance: function() {
		var gridMeter = (EntityController.supportB.left-EntityController.supportA.left)/15;
		var text = "• ";
		for (var i in EntityController.floor_nodes) {
			if (i > 0) {
					text += (Math.round(((EntityController.floor_nodes[i].left-EntityController.floor_nodes[i-1].left)/gridMeter)*100)/100) + ' • ';
			}
		}
		$('#floorNodeDist').text(text);
	},
	setButtonStates:function() {
		var modeId={
			'move':'move-button', 
			'erase':'eraser-button', 
			'add_member':'add-member-button', 
			'add_node':'add-node-button',
		};
		for (var i in modeId) {
			if (this.mode == i) {
				//add active class
				$('#'+modeId[i]).addClass('active');
				//remove active class from others
				for (var j in modeId) {
					if (j != i) {
						$('#'+modeId[j]).removeClass('active');
					}
				}
			}
		}
		//set simulation button as active
		if (this.simulation) {
			$('#simulation-button').addClass('active');
			$('#middle-position-button').removeClass('disabled');
		} else {
			$('#simulation-button').removeClass('active');
			$('#middle-position-button').addClass('disabled');
		}
		//set node coord display button
		if (this.show_node_coords) {
			$('#show-coords-button').addClass('active');
		} else {
			$('#show-coords-button').removeClass('active');
		}

		if (this.max_spacing) {
			$('#max-spacing-button').addClass('active');
		} else {
			$('#max-spacing-button').removeClass('active');
		}
	},
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
			ModeController.canvas.remove(ModeController.new_member); //removing the unset member from the canvas
			if(ModeController.new_member.start_node){
				for(var i=0;i<ModeController.new_member.start_node.connected_members.length;i++){ //deleting the uncreated member from its start node
					if(ModeController.new_member===ModeController.new_member.start_node.connected_members[i]){
						ModeController.new_member.start_node.connected_members.splice(i,1);
						break;
					}
				}
			}			
			ModeController.new_member=null;
		}
	},
	//activates erase mode
	erase_mode:function(){
		this.mode='erase';
		this.clearNode();
		this.clearMember();
		this.setButtonStates();
	},
	//activates erase mode
	move_mode:function(){
		this.mode='move';
		this.clearNode();
		this.clearMember();
		this.setButtonStates();
	},
	//activates simulation mode
	simulation_mode:function(){
		this.simulation=!this.simulation;
		if(this.simulation){
			if (!EntityController.isValid()) { //if the bridge design is not valid
            	alert('The bridge design is not valid and does not satisfy the M=2N-3 condition' +
                'You have ' + EntityController.nodes.length + ' nodes and ' + EntityController.members.length + ' members');
                this.simulation=false;
	        } else if (!EntityController.car) { //if the car object doesnt exist yet
	            var car = new Car({
	                width: EntityController.car_length * Grid.grid_meter * Grid.grid_size,
	                top: Grid.canvas.getHeight() / 3 - 40
	            });

	            EntityController.car = car;
	            Grid.canvas.add(car);
	            Calculate();
	        } else { //if the car object already exists
	        	Grid.canvas.add(EntityController.car);
	            Calculate();
	        }
		}
		else{ //if exiting simulation mode
			Grid.canvas.remove(EntityController.car);
			for(var i=0;i<EntityController.members.length;i++){ //setting all the labels to 0
				EntityController.members[i].setForce(0);
			}
			for(var j=0;j<EntityController.floor_nodes.length;j++){
				EntityController.floor_nodes[j].setForce(0,0,Grid.canvas);
			}
		}
		Grid.canvas.renderAll();
		this.mode='move';
		this.clearNode();
		this.clearMember();
		this.setButtonStates();
	},
	//activates add member mode
	add_member_mode:function(){
		this.clearNode(); //gets rid of any existing unplaced nodes

		if(this.mode!=='add_member'){ //if not already in add-member mode
			this.mode='add_member';
			this.new_member=new Member();
			this.canvas.add(this.new_member); //adds the new member to the canvas
		}
		this.setButtonStates();
	},
	//actiavates add node mode
	add_node_mode:function(){
		this.clearMember(); //gets rid of any existing unplaced members

		if(this.mode!=='add_node'){ //if not already in add node mode
			this.mode='add_node';
			this.new_node=new Node();
			this.canvas.add(this.new_node); //adds the new node to the canvas
		}
		this.setButtonStates();
	}
};

//event handles for setting the different modes based on the buttons the user presses
$('#eraser-button').on('click',function () {
	ModeController.erase_mode();
});
$('#move-button').on('click',function () {
	ModeController.move_mode();
});
$('#add-member-button').on('click',function() {
	ModeController.add_member_mode();
});
$('#add-node-button').on('click',function() {
	ModeController.add_node_mode();
});
$('#show-coords-button').on('click',function() {
	ModeController.showNodeCoords();
});
$('#middle-position-button').on('click', function() {
	ModeController.carToMiddle();
});
$('#max-spacing-button').on('click', function() {
	ModeController.enableMaxSpacing();
});

module.exports=ModeController;

},{"./Calculate":1,"./Car":2,"./EntityController.js":3,"./Grid":5,"./Member":8,"./Node":10}],10:[function(require,module,exports){
var ForceLine=require('./ForceLine'); //node deligates forceline

var Node = fabric.util.createClass(fabric.Circle, {
    type: 'node',

    initialize: function(options) {
        if (!options) {
            options = {};
        }

        this.callSuper('initialize', options);

        //settings default values of the most important properties
        this.set({
            showCoords: false,
            left: options.left || -100,
            top: options.top || -100,
            strokeWidth: options.strokeWidth || 5,
            radius: options.radius || 12,
            fill: options.fill || '#FFFFFF',
            stroke: options.stroke || '#666',
            selectable: options.selectable || true,
            hasControls: false,
            hasBorders: false,
            support: options.support || false, //if the node is a support (and thus is a floor beam as well)
            floor_beam: options.floor_beam || false, //if the node is a floor beam
            external_force: [0,0], //the reaction forces acting on the floor beam
            connected_members: [] //the members that are connected to the floor beam
        });
    },
    
    toObject: function() {
        return {
            support: this.get('support'),
            floor_beam: this.get('floor_beam'),
            left: this.get('left'),
            top: this.get('top'),
        };
    },

    _render: function(ctx) {
        this.callSuper('_render', ctx);
        var yOff; //for positioning the coordinates of the node properly so its visible
        if (this.floor_beam) {
            yOff = -30;
        } else {
            yOff = 12;
        }
        if (this.showCoords) {
            // ctx.fillRect(-10, yOff, 150, 22); //will show a white rectangle background around the coordinates of the node
            ctx.font = '20px Arial';
            ctx.fillStyle = 'hsla(87, 100%, 24%, 1)'; //color of the font
            ctx.fillText('('+Math.round(this.left*100)/100+', ' +Math.round(this.top*100)/100+')', 12,yOff+18);
        }
    }
});

//for the import, takes in a json singleton representing a node and applies it to the current node object
Node.prototype.copyProp=function(nodeObj) {
    this.top = nodeObj.top;
    this.left = nodeObj.left;
    this.support = nodeObj.support;
    this.floor_beam = nodeObj.floor_beam;
    if (this.floor_beam) {
        this.lockMovementY = true;
    } else {
        this.lockMovementY = false;
    }
    if (this.support) {
        this.stroke = '#F41313';
        this.lockMovementX=true;
    } else if (this.floor_beam) {
        this.stroke = '#000000';
        this.lockMovementX=false;
    } //else default
};

module.exports=Node;

var E=require('./EntityController'); //since the entity controller is only required for the prototypes

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
        //Re-adding the members to avoing weird glitchiness (if canvas object available)
        if(canvas){
            canvas.remove(this.connected_members[i]);
            canvas.add(this.connected_members[i]);
            canvas.sendToBack(this.connected_members[i]); //sending the connected members to the back of the canvas
        }
    }
};

//set the reaction force of the node
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

//checks if the car is on the node
Node.prototype.isCarOn=function(){
    if(E.car){
        if(this.left>=E.car.left-E.car_length_px/2 && this.left<=E.car.left+E.car_length_px/2){
            return true;
        }
    }
    return false;
};


},{"./EntityController":3,"./ForceLine":4}],11:[function(require,module,exports){
/*An optimizer function that works by randomly placing all non-floor nodes of a current design a certain radius r defined by the
variation property. It iterates for a certain duration, and saves the design that has the lowest cost*/

var EntityController=require('./EntityController');
var Calculate=require('./Calculate');
var Grid=require('./Grid');

var Optimizer={
	variation: 100,
	duration: 10,
	min_cost: 10E12,
	optimal_positions: [],
	iteration_number: 0,

	optimize: function(){ 
		//reseting parameters
		this.iteration_number=0;
		this.optimal_positions=[];
		var non_floor_nodes=[],starting_positions=[],i,position;

		for(i=0;i<EntityController.nodes.length;i++){ //creating an array of the nodes that can be varied (ie non-floor nodes)
			if(!EntityController.nodes[i].floor_beam){
				non_floor_nodes.push(EntityController.nodes[i]);
			}
		}
		for(i=0;i<non_floor_nodes.length;i++){ //saving the starting positions of the floor nodes
				position=[non_floor_nodes[i].left,non_floor_nodes[i].top];
				starting_positions.push(position);
		}

		if(EntityController.designPass){
			this.min_cost=EntityController.currentDesignCost;
			for(i=0;i<non_floor_nodes.length;i++){ //saving the optimal positions of the starting nodes
				position=[non_floor_nodes[i].left,non_floor_nodes[i].top];
				this.optimal_positions.push(position);
			}
		}
		else{
			this.min_cost=10E12;
		}
		
		var startTime=Date.now();

		while(Date.now()-startTime<this.duration*1000){ //while the time elapsed is less than the duration
			//randomizing position of all floor nodes around a radius specified by the variation property
			for(i=0;i<non_floor_nodes.length;i++){
				if(Math.round(Math.random())===1){
					non_floor_nodes[i].left=starting_positions[i][0]+this.variation*Math.random();
					if(Math.round(Math.random())===1){
						non_floor_nodes[i].top=starting_positions[i][1]+this.variation*Math.random();
					}
					else{
						non_floor_nodes[i].top=starting_positions[i][1]-this.variation*Math.random();
					}
				}
				else{
					non_floor_nodes[i].left=starting_positions[i][0]-this.variation*Math.random();
					if(Math.round(Math.random())===1){
						non_floor_nodes[i].top=starting_positions[i][1]+this.variation*Math.random();
					}
					else{
						non_floor_nodes[i].top=starting_positions[i][1]-this.variation*Math.random();
					}
				}
				non_floor_nodes[i].moveMembers(null); //null so that the changes dont display on the canvas
			}
				
			Calculate();

			//if the design passes and is lower than the cost of the current design, save its node positions
			if(EntityController.designPass && EntityController.currentDesignCost<this.min_cost){ 
				this.optimal_positions=[];
				this.min_cost=EntityController.currentDesignCost;
				for(i=0;i<non_floor_nodes.length;i++){ //saving the optimal positions of the starting nodes
					position=[non_floor_nodes[i].left,non_floor_nodes[i].top];
					this.optimal_positions.push(position);
				}
			}
			this.iteration_number++;
		}
		if(this.optimal_positions.length===0){ //if no cheaper designs were found and the initial design before the optimizer started failed
			console.log('No solutions found after '+this.iteration_number+" iterations");
			alert('No solutions found after '+this.iteration_number+" iterations");
		}
		else{
			for(i=0;i<non_floor_nodes.length;i++){ //saving the optimal positions of the starting nodes
				non_floor_nodes[i].set({
					left: this.optimal_positions[i][0],
					top: this.optimal_positions[i][1]
				});
				Grid.canvas.remove(non_floor_nodes[i]);
				Grid.canvas.add(non_floor_nodes[i]);
				non_floor_nodes[i].moveMembers(Grid.canvas);
				Grid.canvas.renderAll();
			}
			console.log('Best Solution found costs $'+this.min_cost+" after running "+this.iteration_number+" iterations");
			alert('Best Solution found costs $'+this.min_cost+" after running "+this.iteration_number+" iterations");
			Calculate();
			Grid.canvas.renderAll();
		}
	}
};

module.exports=Optimizer;
},{"./Calculate":1,"./EntityController":3,"./Grid":5}],12:[function(require,module,exports){
//Handles the inital resizing of the canvas as well as the resizing of the canvas when the window is resized
var ResizeController={
	canvas: null,
	grid: null,
	initial:true,
	resize_grid: true, //whether the grid should be regenerated after a resize event

	//resizes canvas based on current and future window dimensions, as well as resizes the grid
	resizeCanvas: function(){
		if(ResizeController.canvas){
			ResizeController.canvas.setHeight($(window).height()-230);
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
},{}],13:[function(require,module,exports){
  var ModeController = require('./ModeController');
  var InteractionController = require('./InteractionController');
  var Grid = require('./Grid');
  var ResizeController = require('./ResizeController');
  var Node=require('./Node');
  var EntityController=require('./EntityController');
  var InputController=require('./InputController');
  var canvas = new fabric.Canvas('truss-canvas', {
      selection: false
  });

   //So that all fabric objects have an origin along the center
  fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';
  
  //initialization
  ModeController.canvas = canvas;
  Grid.canvas = canvas;
  ResizeController.canvas = canvas;
  ResizeController.grid = Grid;
  ResizeController.resizeCanvas(); //creates the grid as well, and recreates it upon a window resize 

  InteractionController(canvas, ModeController);
  InputController();

  var num_floor_beams=4;

  EntityController.createFloorNodes(num_floor_beams);

  ModeController.move_mode();
},{"./EntityController":3,"./Grid":5,"./InputController":6,"./InteractionController":7,"./ModeController":9,"./Node":10,"./ResizeController":12}]},{},[13]);
