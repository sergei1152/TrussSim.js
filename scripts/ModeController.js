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
		ModeController.canvas.add(ModeController.new_node);
	}
});

module.exports=ModeController;
