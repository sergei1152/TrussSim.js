var EntityController=require('./EntityController');
var Calculate=require('./Calculate');
var Grid=require('./Grid');
var Optimizer={
	variation: 100,
	duration: 60,
	min_cost: 10E12,
	optimal_positions: [],
	iteration_number: 0,

	optimize: function(){ 
		//reseting parameters
		this.iteration_number=0;
		this.optimal_positions=[];
		this.min_cost=10E12;

		var non_floor_nodes=[];
		var starting_positions=[];
		var i;
		var position;
		for(i=0;i<EntityController.nodes.length;i++){ //creating an array of the nodes that can be varied
			if(!EntityController.nodes[i].floor_beam){
				non_floor_nodes.push(EntityController.nodes[i]);
			}
		}
		for(i=0;i<non_floor_nodes.length;i++){ //saving the starting positions of the floor nodes
				 position=[non_floor_nodes[i].left,non_floor_nodes[i].top];
				starting_positions.push(position);
		}

		var startTime=Date.now();
		while(Date.now()-startTime<this.duration*1000){ //while the time elapsed is less than the duration
			for(i=0;i<non_floor_nodes.length;i++){
				//randomizing position of all floor nodes
				if(Math.round(Math.random)===1){
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
				non_floor_nodes[i].moveMembers(null);
			}
				
			Calculate();
			if(EntityController.designPass && EntityController.currentDesignCost<this.min_cost){ //if the design passes
				this.optimal_positions=[];
				this.min_cost=EntityController.currentDesignCost;
				for(i=0;i<non_floor_nodes.length;i++){ //saving the optimal positions of the starting nodes
					position=[non_floor_nodes[i].left,non_floor_nodes[i].top];
					this.optimal_positions.push(position);
				}
			}
			this.iteration_number++;
		}
		if(this.optimal_positions.length===0){
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
			Calculate();
			console.log('Best Solution found costs $'+this.min_cost+" after running "+this.iteration_number+" iterations");
			alert('Best Solution found costs $'+this.min_cost+" after running "+this.iteration_number+" iterations");
		}
	}
};

module.exports=Optimizer;