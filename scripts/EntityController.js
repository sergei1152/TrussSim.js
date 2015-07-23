var Grid = require('./Grid');

//Keeps track of all the nodes and members in the bridge design
var EntityController = {
	//configurable variables
    car_length: 6, //the length of the car in m
    bridge_length: 15, //the length of the bridge in m
    car_weight: 7.5, //entire weight of the car in kN
    member_cost_meter: 10, //cost of members per meter
    node_cost: 5, //cost of each node
    max_compressive:8,
    max_tensile: 12,

    //dev stuff for calculations
    car: null,
    car_length_px: null,
    supportA: null,
    supportB: null,
    nodes: [],
    members: [],
    floor_nodes: [],

    addNode: function(node) {
        this.num_nodes += 1;
        this.nodes.push(node);
    },
    addMember: function(member) {
        this.num_members += 1;
        this.members.push(member);
    },
    removeNode: function(node) {
        this.num_nodes -= 1;
        for (var i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i] === node) {
                this.nodes.splice(i, 1);
                break;
            }
        }
    },
    removeMember: function(member) {
        this.num_members -= 1;
        for (var i = 0; i < this.members.length; i++) {
            if (this.members[i] === member) {
                this.members.splice(i, 1);
                break;
            }
        }
    },
    isValid: function() {
        if (this.members.length === 2 * this.nodes.length - 3) {
            return true;
        }
        return false;
    },
    calcCarLengthPx: function() {
        this.car_length_px = this.car_length * Grid.grid_size * Grid.grid_meter;
    }
};

module.exports = EntityController;