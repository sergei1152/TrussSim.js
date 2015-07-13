//Controlls the current mode
var mode='move'; //starts up as the defualt node

$('#eraser-button').on('click',function(){
	mode='erase';
	console.log(mode);
});

$('#move-button').on('click',function(){
	mode='move';
	console.log(mode);
});

$('#add-member-button').on('click',function(){
	mode='add_member';
	console.log(mode);
});

$('#add-node-button').on('click',function(){
	mode='add_node';
	console.log(mode);
});

module.exports.mode=mode;
