var Grid=require('./Grid');

//Keeps track of all the nodes and members in the bridge design
var EntityController={
	car: null,
	car_length: 6,
	car_length_px: null,
	car_weight: 7.5,
	supportA: null,
	supportB: null,
	bridge_length: 15,
	nodes: [],
	members:[],
	num_nodes:2,
	num_members:0,
	addNode:function(node){
		this.num_nodes+=1;
		this.nodes.push(node);
	},
	addMember:function(member){
		this.num_members+=1;
		this.members.push(member);
	},
	removeNode:function(node){
		this.num_nodes-=1;
		for (var i=0; i< this.nodes.length; i++){
			if (this.nodes[i]===node){
				this.nodes.splice(i,1);
				break;
			}
		}
	},
	removeMember:function(member){
		this.num_members-=1;
		for (var i=0; i< this.members.length; i++){
			if (this.members[i]===member){
				this.members.splice(i,1);
				break;
			}
		}
	},
	isValid: function(){
		if(this.num_members===2*this.num_nodes-3){
			return true;
		}
		return false;
	},
	calcCarLengthPx: function(){
		this.car_length_px=this.car_length*Grid.grid_size*Grid.grid_meter;
	}
};

module.exports=EntityController;