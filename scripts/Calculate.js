var E=require('./EntityController');
var Grid=require('./Grid');

function calculateSupportReactions(){
	Grid.calcGridMeter(E);
	E.calcCarLengthPx();
	E.car.width=E.car_length_px; //recalculating the car width for the canvas
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
	//if the car is leaving the bridge
	else if(E.supportB.left-E.car.left<E.car_length_px/2 && E.supportB.left-E.car.left>-E.car_length_px/2){
		var remaining_car_length_px=E.car_length_px-(E.car.left+E.car_length_px/2-E.supportB.left); //how much of the car length is remaining within the bridge
		actual_weight=(E.car_weight/E.car_length_px)*remaining_car_length_px;
		distance_a_centroid_px=E.supportB.left-remaining_car_length_px/2-E.supportA.left;
	}

	//calculate support reactions, and otherwise 0 if the car is completely out of the bridge and not touching the supports
	E.supportA.setForce(0,(actual_weight*(bridge_length_px-distance_a_centroid_px))/(bridge_length_px) || 0,Grid.canvas);
	E.supportB.setForce(0,(actual_weight*(distance_a_centroid_px))/(bridge_length_px) || 0,Grid.canvas);
}

function calculateWeightDistributionOfCar(){ //TODO: Add case for when no nodes touched
	var x, x1, x2, leftDistance, rightDistance;
	for (var i=0;i<E.floor_nodes.length;i++){
		if(!E.floor_nodes[i-1]){ //if left support node
			if(E.floor_nodes[i].isCarOn() && !E.floor_nodes[i+1].isCarOn()){ //if the car is only on the current node
				x=E.car.left+E.car_length_px/2-E.floor_nodes[i].left; //portion of car on the right member (position of tail of car minus position of current node)
				rightDistance=E.floor_nodes[i+1].left-E.floor_nodes[i].left;
				E.floor_nodes[i].setForce(0,E.floor_nodes[i].external_force[1]-(rightDistance-x/2)*E.car_weight*x/(rightDistance*E.car_length_px),Grid.canvas);
			}
			else if(E.floor_nodes[i].isCarOn() && E.floor_nodes[i+1].isCarOn()){ //if the car is on the current and right node
				x=E.floor_nodes[i+1].left-E.floor_nodes[i].left; //portion of the car on the right member (position of right node minus position of current node)
				E.floor_nodes[i].setForce(0,E.floor_nodes[i].external_force[1]-x*E.car_weight/(2*E.car_length_px),Grid.canvas);
			}
			else if(!E.floor_nodes[i].isCarOn() && E.floor_nodes[i+1].isCarOn()){ //if the car is only on the right node
				x=E.floor_nodes[i+1].left-(E.car.left-E.car_length_px/2); //portion of the car on the right member(position of right node minus position of tail of car)
				rightDistance=E.floor_nodes[i+1].left-E.floor_nodes[i].left;
				E.floor_nodes[i].setForce(0,E.floor_nodes[i].external_force[1]-x*x*E.car_weight/(2*E.car_length_px*rightDistance),Grid.canvas);
			}
			else if ((E.car.left+E.car_length_px/2)<E.floor_nodes[i+1].left && (E.car.left-E.car_length_px/2)>E.floor_nodes[i].left){ //if the car is on the right member but not on top of any nodes (if the tail of the car is ahead of the current node position and the front of the car is behind the right nodes position)
				x=E.floor_nodes[i+1].left-E.car.left;
				rightDistance=E.floor_nodes[i+1].left-E.floor_nodes[i].left;
				E.floor_nodes[i].setForce(0, E.floor_nodes[i].external_force[1]-x*E.car_weight/rightDistance, Grid.canvas);
			}
		}
		else if(!E.floor_nodes[i+1]){ //if right support node
			if(E.floor_nodes[i-1].isCarOn() && !E.floor_nodes[i].isCarOn()){ //if the car is only on the left member
				x=E.car.left+E.car_length_px/2-E.floor_nodes[i-1].left;
				leftDistance=E.floor_nodes[i].left-E.floor_nodes[i-1].left; //distance from the current node to the left node
				E.floor_nodes[i].setForce(0,E.floor_nodes[i].external_force[1]-x*x*E.car_weight/(2*E.car_length_px*leftDistance),Grid.canvas);
			}
			else if(E.floor_nodes[i-1].isCarOn() && E.floor_nodes[i].isCarOn()){ //if the car is both on the left node and the current node
				x=E.floor_nodes[i].left-E.floor_nodes[i-1].left;
				E.floor_nodes[i].setForce(0,E.floor_nodes[i].external_force[1]-x*E.car_weight/(2*E.car_length_px),Grid.canvas);
			}
			else if(!E.floor_nodes[i-1].isCarOn() && E.floor_nodes[i].isCarOn()){ //if the car is only on the support node
				x=E.floor_nodes[i].left-(E.car.left-E.car_length_px/2);
				distanceLeft=E.floor_nodes[i].left-E.floor_nodes[i-1].left;
				E.floor_nodes[i].setForce(0,E.floor_nodes[i].external_force[1]-((distanceLeft-x/2)*x*E.car_weight)/(distanceLeft*E.car_length_px),Grid.canvas);
			}
			else if ((E.car.left-E.car_length_px/2)>E.floor_nodes[i-1].left && (E.car.left+E.car_length_px/2)<E.floor_nodes[i].left){ //if the car is on the left member but not on top of any nodes (if the cars tail is ahead of the left nodes position and the cars front is behind the current nodes position)
				x=E.car.left-E.floor_nodes[i-1].left;
				leftDistance=E.floor_nodes[i].left-E.floor_nodes[i-1].left;
				console.log(x*E.car_weight/leftDistance);
				E.floor_nodes[i].setForce(0, E.floor_nodes[i].external_force[1]-x*E.car_weight/leftDistance, Grid.canvas);
			}
		}
		else if(E.floor_nodes[i-1] && E.floor_nodes[i+1]){ //if a regular floor node
			if(E.floor_nodes[i-1].isCarOn() && !E.floor_nodes[i].isCarOn() && !E.floor_nodes[i+1].isCarOn()){ //if the car is only on the left member
				x=E.car.left+E.car_length_px/2 -E.floor_nodes[i-1].left; //the portion of the car on the left member (the positon of the front of the car minus the position of the previous node)
				leftDistance=E.floor_nodes[i].left-E.floor_nodes[i-1].left; //distance from the current node to the left node
				E.floor_nodes[i].setForce(0,-(x*x*E.car_weight/(2*E.car_length_px*leftDistance)),Grid.canvas);
			}
			else if(E.floor_nodes[i-1].isCarOn() && E.floor_nodes[i].isCarOn() && !E.floor_nodes[i+1].isCarOn()){ //if the car is both on the left node and the current node
				x1=E.floor_nodes[i].left-E.floor_nodes[i-1].left; //the portion of the car on the left member (the harizontal distance between the current node and the left node)
				x2=E.car.left+E.car_length_px/2-E.floor_nodes[i].left; //the portion of the car on the right member (the position of the front of the car minus the position of the current node)
				rightDistance=E.floor_nodes[i+1].left-E.floor_nodes[i].left; //the distance from the right node to the current node
				E.floor_nodes[i].setForce(0,-(x1/2*(E.car_weight/E.car_length_px)+(rightDistance-x2/2)*(E.car_weight*x2/E.car_length_px)/rightDistance),Grid.canvas);
			}
			else if(!E.floor_nodes[i-1].isCarOn() && E.floor_nodes[i].isCarOn() && !E.floor_nodes[i+1].isCarOn()){ //if the car is only on the current node
				leftDistance=E.floor_nodes[i].left-E.floor_nodes[i-1].left;
				rightDistance=E.floor_nodes[i+1].left-E.floor_nodes[i].left;
				x1=E.floor_nodes[i].left-(E.car.left-E.car_length_px/2); //the portion of the car on the left member (the position of the current node minus the position of the tail of the car)
				x2=(E.car.left+E.car_length_px/2)-E.floor_nodes[i].left; //the portion of the car on the right member (the position of the front of the car minus the position of the current node)
				E.floor_nodes[i].setForce(0,-(((leftDistance-x1/2)*x1/leftDistance+(rightDistance-x2/2)*x2/rightDistance)*E.car_weight/E.car_length_px),Grid.canvas);
			}
			else if(!E.floor_nodes[i-1].isCarOn() && E.floor_nodes[i].isCarOn() && E.floor_nodes[i+1].isCarOn()){ //if the car is on the current and right node
				leftDistance=E.floor_nodes[i].left-E.floor_nodes[i-1].left;
				x1=E.floor_nodes[i].left-(E.car.left-E.car_length_px/2); //the portion of the car on the left member (the position of the current node minus the position of the tail of the car)
				x2=E.floor_nodes[i+1].left-E.floor_nodes[i].left; //the portion of the car on the right member (the position of the right node minus the position of the left node)
				E.floor_nodes[i].setForce(0,-((leftDistance-x1/2)*E.car_weight*x1/(E.car_length_px*leftDistance)+(x2/2*E.car_weight)/E.car_length_px),Grid.canvas);
			}
			else if(!E.floor_nodes[i-1].isCarOn() && !E.floor_nodes[i].isCarOn() && E.floor_nodes[i+1].isCarOn()){ //if the car is only on the right node
				x=E.floor_nodes[i+1].left-(E.car.left-E.car_length_px/2); //portion of car on right member (position of right node minus position of tail of car)
				rightDistance=E.floor_nodes[i+1].left-E.floor_nodes[i].left;
				E.floor_nodes[i].setForce(0,-(x*x*E.car_weight/(2*E.car_length_px*rightDistance)),Grid.canvas);
			}
			else if(E.floor_nodes[i-1].isCarOn() && E.floor_nodes[i].isCarOn() && E.floor_nodes[i+1].isCarOn()){ //if the car is on all three nodes
				x1=E.floor_nodes[i].left-E.floor_nodes[i-1].left; //portion of car on left member (position of current node minus position of left member)
				x2=E.floor_nodes[i+1].left-E.floor_nodes[i].left; //portion of car on right member (position of right node minus position of current node)
				E.floor_nodes[i].setForce(0,-((x1/2+x2/2)*E.car_weight/E.car_length_px),Grid.canvas);
			}
			else if ((E.car.left+E.car_length_px/2)<E.floor_nodes[i+1].left && (E.car.left-E.car_length_px/2)>E.floor_nodes[i].left){ //if the car is on the right member but not on top of any nodes (if the tail of the car is ahead of the current node position and the front of the car is behind the right nodes position)
				x=E.floor_nodes[i+1].left-E.car.left;
				rightDistance=E.floor_nodes[i+1].left-E.floor_nodes[i].left;
				E.floor_nodes[i].setForce(0, -x*E.car_weight/rightDistance, Grid.canvas);
			}
			else if ((E.car.left-E.car_length_px/2)>E.floor_nodes[i-1].left && (E.car.left+E.car_length_px/2)<E.floor_nodes[i].left){ //if the car is on the left member but not on top of any nodes (if the cars tail is ahead of the left nodes position and the cars front is behind the current nodes position)
				x=E.car.left-E.floor_nodes[i-1].left;
				leftDistance=E.floor_nodes[i].left-E.floor_nodes[i-1].left;
				E.floor_nodes[i].setForce(0, -x*E.car_weight/leftDistance, Grid.canvas);
			}
			else{
				E.floor_nodes[i].setForce(0,0,Grid.canvas);
			}
		}
	}
}

function methodOfJoints(){
	var force_matrix=[];
	var solution=[];
	for(var i=0;i<E.nodes.length;i++){
		var rowX=[];
		var rowY=[];
		solution.push(-E.nodes[i].external_force[0]);
		solution.push(-E.nodes[i].external_force[1]);
		for(var j=0;j<E.members.length;j++){
			E.members[j].calcLength();
			E.members[j].calcUnitVector();
			var connected=false;
			for(var k=0;k<E.nodes[i].connected_members.length;k++){ //check if the node has any of the conencted members
				if(E.members[j]===E.nodes[i].connected_members[k]){
					if(E.nodes[i].connected_members[k].x1===E.nodes[i].left && E.nodes[i].connected_members[k].y1===E.nodes[i].top){
						rowX.push(-E.nodes[i].connected_members[k].unit_vector[0]);
						rowY.push(-E.nodes[i].connected_members[k].unit_vector[1]);
					}
					else{ //flip the direction so all forces are tensile
						rowX.push(E.nodes[i].connected_members[k].unit_vector[0]);
						rowY.push(E.nodes[i].connected_members[k].unit_vector[1]);
					}
					connected=true;
				}

			}
			if(!connected){
				rowX.push(0);
				rowY.push(0);
			}
		}
		force_matrix.push(rowX);
		force_matrix.push(rowY);

	}

	//eliminating last 3 equation since we have 2N equations and have 2N-3 members, thus we have 3 extra equations 
	force_matrix.pop();
	force_matrix.pop();
	force_matrix.pop();
	solution.pop();
	solution.pop();
	solution.pop();

	var forces=numeric.solve(force_matrix, solution, false); //solving for the forces

	//applying the force value to the specified member
	for(i=0;i<E.members.length;i++){
		E.members[i].setForce(forces[i]);
	}
}

function calculateCost(){
	var bridge_cost=0;
	for(var i=0;i<E.members.length;i++){
		var meter_length=E.members[i].member_length/(Grid.grid_size*Grid.grid_meter);
		bridge_cost+=meter_length*E.member_cost_meter;
	}

	bridge_cost+=E.nodes.length*E.node_cost;

	return Math.round(bridge_cost*100)/100;
}

module.exports=function (){
	calculateSupportReactions();
	calculateWeightDistributionOfCar();
	methodOfJoints();
	$('#bridge_cost').text(calculateCost());
};
