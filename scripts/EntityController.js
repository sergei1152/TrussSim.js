var Grid = require('./Grid');
var Node=require('./Node');
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

    //A reset function  
    clearAllNodes: function() {
        this.nodes=[];
        this.members=[];
        this.floor_nodes=[];
        this.car = this.supportA = this.supportB = null;
        Grid.canvas.clear().renderAll();
        Grid.createGrid();
        this.num_nodes = 0;
        this.num_members = 0;
    },
    createFloorNodes: function(num_floor_beams) {
        //delete everything else if this function is called since it will be a mess otherwise
        this.clearAllNodes();
        var canvasHeight = $('#canvas-wrapper').height();
        var canvasWidth = $('#canvas-wrapper').width();
        //Adding inital support nodes
        var supportA=new Node({
          support: true,
          floor_beam: true,
          left: canvasWidth/8,
          top: canvasHeight/3,
          stroke: '#F41313',
          lockMovementY: true
        });
        var supportB=new Node({
          support: true,
          floor_beam: true,
          left: canvasWidth*7/8,
          top: canvasHeight/3,
          stroke: '#F41313',
          lockMovementY: true
        });

        this.supportA=supportA;
        this.supportB=supportB;

        EntityController.floor_nodes.push(supportA);
        EntityController.addNode(supportA);
        EntityController.addNode(supportB);
        Grid.canvas.add(supportA);
        Grid.canvas.add(supportB);

        //adding  evenly distributed floor beam nodes
        for (var i=0;i<num_floor_beams;i++){
            var spacing=(supportB.left-supportA.left)/(num_floor_beams+1);
            var new_floor_node=new Node({
                floor_beam: true,
                left: supportA.left+(i+1)*spacing,
                top: canvasHeight/3,
                stroke: '#000000',
                lockMovementY: true
            });
            EntityController.addNode(new_floor_node);
            EntityController.floor_nodes.push(new_floor_node);
            Grid.canvas.add(new_floor_node);
        }
        EntityController.floor_nodes.push(supportB);
        Grid.canvas.renderAll();
    },
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