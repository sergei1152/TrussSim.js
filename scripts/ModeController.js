var Node=require('./Node');
//Controlls the current mode
var ModeController={
	canvas: null,
	mode: 'move',
	new_node:null,

	clearNode:function(){
		if(ModeController.new_node){
			ModeController.canvas.remove(ModeController.new_node.circle);
			ModeController.new_node=null;
		}
	}
};

$('#eraser-button').on('click',function(){
	ModeController.mode='erase';
	ModeController.clearNode();
});

$('#move-button').on('click',function(){
	ModeController.mode='move';
	ModeController.clearNode();
});

$('#add-member-button').on('click',function(){
	ModeController.mode='add_member';
	ModeController.clearNode();
});

$('#add-node-button').on('click',function(){
	if(ModeController.mode!=='add_node'){ //if not already in add node mode
		ModeController.new_node=new Node(100,100, ModeController.canvas);
		ModeController.mode='add_node';
	}
});

module.exports=ModeController;
