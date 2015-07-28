//Performs the cost and force calculation of the truss
var E=require('./EntityController');
var Grid=require('./Grid');

//Calculating the support reactions at the 2 support nodes using moments
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

//Calculates the reaction force at the nodes that the car is on using moments
function calculateWeightDistributionOfCar(){ 
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

//Creates a matrix of 2N-3 equations based on the method of joints, and solves it
function methodOfJoints(){
	var force_matrix=[]; //each row will represent an Fx and Fy equation for each node
	var solution=[]; //this will represent the external forces in the x and y direction acting on the node

	for(var i=0;i<E.nodes.length;i++){ //iterate through all of the nodes that exist
		var rowX=[]; //will represent the Fx equation for the node
		var rowY=[]; //will represent the Fy equation for the node
		solution.push(-E.nodes[i].external_force[0]); //the external forces in the x direction of the node
		solution.push(-E.nodes[i].external_force[1]); //the external forces in the y direction o fthe noe
		
		for(var j=0;j<E.members.length;j++){ //iterate through all of the members that exist
			E.members[j].calcLength();
			E.members[j].calcUnitVector();

			var connected=false; //check if the member is connected to the node
			for(var k=0;k<E.nodes[i].connected_members.length;k++){ 
				if(E.members[j]===E.nodes[i].connected_members[k]){ //if the member is connected to the node
					if(E.nodes[i].connected_members[k].x1===E.nodes[i].left && E.nodes[i].connected_members[k].y1===E.nodes[i].top){ //if the start of the member is connected to the node
						rowX.push(-E.nodes[i].connected_members[k].unit_vector[0]);
						rowY.push(-E.nodes[i].connected_members[k].unit_vector[1]);
					}
					else{ //if the end of the member is at the node, flip the direction so all forces are tensile
						rowX.push(E.nodes[i].connected_members[k].unit_vector[0]);
						rowY.push(E.nodes[i].connected_members[k].unit_vector[1]);
					}
					connected=true;
				}

			}
			if(!connected){ //if the member is not connected to the node, then its not part of its Force equations
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

	E.designPass=true; //for checking whether a design meets the criteria
	
	//applying the force value to the specified member, as well as checking if its under the constraints
	for(i=0;i<E.members.length;i++){
		E.members[i].setForce(forces[i],E);
		if(forces[i]>0 && forces[i]>E.max_tensile){
			E.designPass=false;
		}
		else if(forces[i]<0 && Math.abs(forces[i])>E.max_compressive){
			E.designPass=false;
		}
	}
}

//Calculates the cost of the bridge
function calculateCost(){
	var bridge_cost=0;
	for(var i=0;i<E.members.length;i++){
		var meter_length=E.members[i].member_length/(Grid.grid_size*Grid.grid_meter);
		bridge_cost+=meter_length*E.member_cost_meter;
	}
	bridge_cost+=E.nodes.length*E.node_cost;
	E.currentDesignCost=Math.round(bridge_cost*100)/100;
	return Math.round(bridge_cost*100)/100;
}

module.exports=function (){
	calculateSupportReactions();
	calculateWeightDistributionOfCar();
	methodOfJoints();
	$('#bridge_cost').text(calculateCost());
};
