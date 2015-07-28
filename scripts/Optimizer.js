/*An optimizer function that works by randomly placing all non-floor nodes of a current design a certain radius r defined by the
variation property. It iterates for a certain duration, and saves the design that has the lowest cost*/

var EntityController=require('./EntityController');
var Calculate=require('./Calculate');
var Grid=require('./Grid');

var Optimizer={
	variation: 100,
	duration: 10,
	min_cost: 10E12,
	optimal_positions: [],
	iteration_number: 0,

	optimize: function(){ 
		//reseting parameters
		this.iteration_number=0;
		this.optimal_positions=[];
		var non_floor_nodes=[],starting_positions=[],i,position;

		for(i=0;i<EntityController.nodes.length;i++){ //creating an array of the nodes that can be varied (ie non-floor nodes)
			if(!EntityController.nodes[i].floor_beam){
				non_floor_nodes.push(EntityController.nodes[i]);
			}
		}
		for(i=0;i<non_floor_nodes.length;i++){ //saving the starting positions of the floor nodes
				position=[non_floor_nodes[i].left,non_floor_nodes[i].top];
				starting_positions.push(position);
		}

		if(EntityController.designPass){
			this.min_cost=EntityController.currentDesignCost;
			for(i=0;i<non_floor_nodes.length;i++){ //saving the optimal positions of the starting nodes
				position=[non_floor_nodes[i].left,non_floor_nodes[i].top];
				this.optimal_positions.push(position);
			}
		}
		else{
			this.min_cost=10E12;
		}
		
		var startTime=Date.now();

		while(Date.now()-startTime<this.duration*1000){ //while the time elapsed is less than the duration
			//randomizing position of all floor nodes around a radius specified by the variation property
			for(i=0;i<non_floor_nodes.length;i++){
				if(Math.round(Math.random())===1){
					non_floor_nodes[i].left=starting_positions[i][0]+this.variation*Math.random();
					if(Math.round(Math.random())===1){
						non_floor_nodes[i].top=starting_positions[i][1]+this.variation*Math.random();
					}
					else{
						non_floor_nodes[i].top=starting_positions[i][1]-this.variation*Math.random();
					}
				}
				else{
					non_floor_nodes[i].left=starting_positions[i][0]-this.variation*Math.random();
					if(Math.round(Math.random())===1){
						non_floor_nodes[i].top=starting_positions[i][1]+this.variation*Math.random();
					}
					else{
						non_floor_nodes[i].top=starting_positions[i][1]-this.variation*Math.random();
					}
				}
				non_floor_nodes[i].moveMembers(null); //null so that the changes dont display on the canvas
			}
				
			Calculate();

			//if the design passes and is lower than the cost of the current design, save its node positions
			if(EntityController.designPass && EntityController.currentDesignCost<this.min_cost){ 
				this.optimal_positions=[];
				this.min_cost=EntityController.currentDesignCost;
				for(i=0;i<non_floor_nodes.length;i++){ //saving the optimal positions of the starting nodes
					position=[non_floor_nodes[i].left,non_floor_nodes[i].top];
					this.optimal_positions.push(position);
				}
			}
			this.iteration_number++;
		}
		if(this.optimal_positions.length===0){ //if no cheaper designs were found and the initial design before the optimizer started failed
			console.log('No solutions found after '+this.iteration_number+" iterations");
			alert('No solutions found after '+this.iteration_number+" iterations");
		}
		else{
			for(i=0;i<non_floor_nodes.length;i++){ //saving the optimal positions of the starting nodes
				non_floor_nodes[i].set({
					left: this.optimal_positions[i][0],
					top: this.optimal_positions[i][1]
				});
				Grid.canvas.remove(non_floor_nodes[i]);
				Grid.canvas.add(non_floor_nodes[i]);
				non_floor_nodes[i].moveMembers(Grid.canvas);
				Grid.canvas.renderAll();
			}
			console.log('Best Solution found costs $'+this.min_cost+" after running "+this.iteration_number+" iterations");
			alert('Best Solution found costs $'+this.min_cost+" after running "+this.iteration_number+" iterations");
			Calculate();
			Grid.canvas.renderAll();
		}
	}
};

module.exports=Optimizer;