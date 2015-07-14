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
