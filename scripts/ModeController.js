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
