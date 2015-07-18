var E=require('./EntityController');
var Grid=require('./Grid');

function calculateSupportReactions(){
	Grid.calcGridMeter();
	E.car.width=E.car_length*Grid.grid_size*Grid.grid_meter; //recalculating the car width for the canvas
	var car_length_px=E.car_length*Grid.grid_size*Grid.grid_meter; //converting the car length from meters to pixels
	var bridge_length_px=E.bridge_length*Grid.grid_size*Grid.grid_meter; //converting bridge length in meters to pixels

	 //if the car is just starting to enter the bridge
	if(E.supportA.left-E.car.left<car_length_px/2 && E.supportA.left-E.car.left>-car_length_px/2){
		var exposed_car_length_px=E.car.left+car_length_px/2-E.supportA.left; //how much of the car length is inside the bridge
		var actual_weight=(E.car_weight/car_length_px)*exposed_car_length_px;
		var distance_a_centroid_px=exposed_car_length_px/2;
		E.supportA.external_force[1]=(actual_weight*(bridge_length_px-distance_a_centroid_px))/(bridge_length_px);
		E.supportB.external_force[1]=(actual_weight*(distance_a_centroid_px))/(bridge_length_px);
		console.log('Support Reaction A:'+E.supportA.external_force[1]);
		console.log('Support Reaction B:'+E.supportB.external_force[1]);
	}
	else if( E.supportA.left-E.car.left<=-150 && E.supportB.left-E.car.left>=150){

	}

}
module.exports=function (){
	calculateSupportReactions();
};
