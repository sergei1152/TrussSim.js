//Controlls the current mode
var mode='move'; //starts up as the defualt node

$('#eraser-button').on('click',function(){
	mode='erase';
});

$('#move-button').on('click',function(){
	mode='move';
});

$('#add-member-button').on('click',function(){
	mode='add_member';
});

$('#add-node-button').on('click',function(){
	mode='add_node';
});

module.exports.mode=mode;
