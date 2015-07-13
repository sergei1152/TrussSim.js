var Node=require('./Node');
//Controlls the current mode
var ModeController={
	canvas: null,
	mode: 'move',
	new_node:null
};

$('#eraser-button').on('click',function(){
	ModeController.mode='erase';
});

$('#move-button').on('click',function(){
	ModeController.mode='move';
});

$('#add-member-button').on('click',function(){
	ModeController.mode='add_member';
});

$('#add-node-button').on('click',function(){
	ModeController.mode='add_node';
	ModeController.new_node=new Node(-100,-100, ModeController.canvas);
	ModeController.canvas.add(ModeController.new_node.circle);
});

module.exports=ModeController;
