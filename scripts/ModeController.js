//Sets the current mode based on what button the user presses, as well as holds the context for the current node and member
//TODO: Set cursors based on what mode is selected
var Node=require('./Node');
var Member=require('./Member');
var EntityController = require('./EntityController.js');
var Calculate=require('./Calculate');
var Car=require('./Car');
var Grid=require('./Grid');
//Controls the current mode
var ModeController={
	canvas: null,
	mode: 'move',
	simulation: false,
	new_node:null,
	new_member: null,
	show_node_coords: false,

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
	updateNodeDistance: function() {
		var gridMeter = (EntityController.supportB.left-EntityController.supportA.left)/15;
		var text = "";
		for (var i in EntityController.floor_nodes) {
			if (i > 0) {
					text += (Math.round(((EntityController.floor_nodes[i].left-EntityController.floor_nodes[i-1].left)/gridMeter)*100)/100) + ', ';
			}
		}
		
		$('#floorNodeDist').text(text);
	},
	setButtonStates:function() {
		var modeId={
			'move':'move-button', 
			'erase':'eraser-button', 
			'add_member':'add-member-button', 
			'add_node':'add-node-button'
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
		} else {
			$('#simulation-button').removeClass('active');
		}
		//set node coord display button
		if (this.show_node_coords) {
			$('#show-coords-button').addClass('active');
		} else {
			$('#show-coords-button').removeClass('active');
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
	erase_mode:function(){
		this.mode='erase';
		this.clearNode();
		this.clearMember();
		this.setButtonStates();
	},
	move_mode:function(){
		this.mode='move';
		this.clearNode();
		this.clearMember();
		this.setButtonStates();
	},
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
	                height: Grid.grid_size,
	                left: 50,
	                top: Grid.canvas.getHeight() / 3 - 40,
	                label: 'Distributed Load',
	                length: EntityController.car_length,
	                weight: EntityController.car_weight
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
	add_member_mode:function(){
		this.clearNode(); //gets rid of any existing unplaced nodes

		if(this.mode!=='add_member'){ //if not already in add-member mode
			this.mode='add_member';
			this.new_member=new Member();
			this.canvas.add(this.new_member); //adds the new member to the canvas
		}
		this.setButtonStates();
	},
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

module.exports=ModeController;
