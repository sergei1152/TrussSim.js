var E=require('./EntityController');
var Grid=require('./Grid');

function calculateSupportReactions(){
	Grid.calcGridMeter();
	E.calcCarLengthPx();
	E.car.width=E.car_length*Grid.grid_size*Grid.grid_meter; //recalculating the car width for the canvas
	var bridge_length_px=E.bridge_length*Grid.grid_size*Grid.grid_meter; //converting bridge length in meters to pixels
	var actual_weight;
	var distance_a_centroid_px;

	 //if the car is just starting to enter the bridge
	if(E.supportA.left-E.car.left<E.car_length_px/2 && E.supportA.left-E.car.left>-E.car_length_px/2){
		var exposed_car_length_px=E.car.left+E.car_length_px/2-E.supportA.left; //how much of the car length is inside the bridge
		actual_weight=(E.car_weight/E.car_length_px)*exposed_car_length_px;
		distance_a_centroid_px=exposed_car_length_px/2;
	}
	//if the car is completely within the bridge (between A & B completely)
	else if( E.supportA.left-E.car.left<=-E.car_length_px/2 && E.supportB.left-E.car.left>=E.car_length_px/2){
		actual_weight=E.car_weight;
		distance_a_centroid_px=E.car.left-E.supportA.left;
	}
	else if(E.supportB.left-E.car.left<E.car_length_px/2 && E.supportB.left-E.car.left>-E.car_length_px/2){
		var remaining_car_length_px=E.car_length_px-(E.car.left+E.car_length_px/2-E.supportB.left); //how much of the car length is remaining within the bridge
		actual_weight=(E.car_weight/E.car_length_px)*remaining_car_length_px;
		distance_a_centroid_px=E.supportB.left-remaining_car_length_px/2-E.supportA.left;
	}

	//calculate support reactions, and otherwise 0 if the car is completely out of the bridge and not touching the supports
	E.supportA.external_force[1]=(actual_weight*(bridge_length_px-distance_a_centroid_px))/(bridge_length_px) || 0;
	E.supportB.external_force[1]=(actual_weight*(distance_a_centroid_px))/(bridge_length_px) || 0;
	console.log(E.supportA.isCarOn());
	// console.log('Support Reaction A:'+E.supportA.external_force[1]);
	// console.log('Support Reaction B:'+E.supportB.external_force[1]);
}

function calculateWeightDistributionOfCar(){
	

}

module.exports=function (){
	calculateSupportReactions();
	calculateWeightDistributionOfCar();
};
