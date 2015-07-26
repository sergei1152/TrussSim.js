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
	},
	move_mode:function(){
		this.mode='move';
		this.clearNode();
		this.clearMember();
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
	},
	add_member_mode:function(){
		this.clearNode(); //gets rid of any existing unplaced nodes

		if(this.mode!=='add_member'){ //if not already in add-member mode
			this.mode='add_member';
			this.new_member=new Member();
			this.canvas.add(this.new_member); //adds the new member to the canvas
		}
	},
	add_node_mode:function(){
		this.clearMember(); //gets rid of any existing unplaced members

		if(this.mode!=='add_node'){ //if not already in add node mode
			this.mode='add_node';
			this.new_node=new Node();
			this.canvas.add(this.new_node); //adds the new node to the canvas
		}
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

module.exports=ModeController;
