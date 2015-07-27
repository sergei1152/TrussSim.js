var Grid = require('./Grid');
var Node=require('./Node');
var Member=require('./Member');

String.prototype.replaceAll = function(str1, str2, ignore) 
{
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
};

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

    //color stuff
    erase_fill: '#E43A3A',
    node_fill: '#FFFFFF',

    //for optimizer stuff
    designPass: false,
    currentDesignCost: 10E12,

    exportHash: function(jsonStr) {
        //replace common phrases with specific characters that will not be used and in an order that is particular        
        var hashStr = jsonStr;
        var phrases = {"\"nodes\":":'A', "\"support\":":'B', "\"floor_beam\":":'C', "\"top\":":'D', "\"left\":":'E',
                        "\"members\":":'F', "\"x1\":":'G', "\"x2\":":'H', "\"y1\":":'I', "\"y2\":":'J',
                        "true":'K', "false":'L', "[{":'M', "]}":'N'};
        var numComb = {}; //some number combinations
        var numDec = {}; //number and decimal combinations
        var i, find, re;

        for (i = 10; i < 36; i++) {
            numComb[i]=String.fromCharCode(87+i);
        }

        for (i = 0; i < 10; i++) {
            numDec[(i+'.')] = String.fromCharCode(33+i); 
        }

        for (i in phrases) {
            hashStr = hashStr.replaceAll(i, phrases[i]);     
        }

        //replace the nodeStr part
        nodeStrRep = /"nodestr"(\s|\S)+?(?=A)/g;
        hashStr = hashStr.replace(nodeStrRep, '');

        for (i in numComb) {
            hashStr = hashStr.replace(i, numComb[i]);     
        }

        for (i in numDec) {
            hashStr = hashStr.replace(i, numDec[i]);                 
        }

        return hashStr;
    },
    importHash: function(hashStr) {
        var jsonStr = hashStr;
        var phrases = {"\"nodes\":":'A', "\"support\":":'B', "\"floor_beam\":":'C', "\"top\":":'D', "\"left\":":'E',
                        "\"members\":":'F', "\"x1\":":'G', "\"x2\":":'H', "\"y1\":":'I', "\"y2\":":'J',
                        "true":'K', "false":'L', "[{":'M', "]}":'N'};
        var numComb = {}; //some number combinations
        var numDec = {}; //number and decimal combinations
        var i, find, re;

        for (i = 10; i < 36; i++) {
            numComb[i]=String.fromCharCode(87+i);
        }

        for (i = 0; i < 10; i++) {
            numDec[(i+'.')] = String.fromCharCode(33+i); 
        }

        for (i in numDec) {
            jsonStr = jsonStr.replaceAll(numDec[i], i);                 
        }
        
        for (i in numComb) {
            jsonStr = jsonStr.replaceAll(numComb[i], i);     
        }

        for (i in phrases) {
            jsonStr = jsonStr.replaceAll(phrases[i], i);     
        }

        this.import(JSON.parse(jsonStr));
    },

    //export
    export: function() {
        var exportObj = {};
        var impProp = ['nodes', 'members'];
        var nodeStr = "";
        //added extra info to quickly get important information
        for (var j in this.nodes) {
            if (!this.nodes[j].floor_beam)
                nodeStr += "("+(Math.round((this.nodes[j].left-this.supportA.left)*100)/100)+", "+(Math.round((this.nodes[j].top-this.supportA.top)*100)/100)+"), ";
        }
        exportObj.nodestr = nodeStr;

        //do rounding on x's and y's
        for (var i in impProp) {
            exportObj[impProp[i]] = this[impProp[i]];
            if (impProp[i] == "nodes")
                for (var o in this[impProp[i]]) {
                    exportObj[impProp[i]][o].left = Math.round(exportObj[impProp[i]][o].left*100)/100;
                    exportObj[impProp[i]][o].top = Math.round(exportObj[impProp[i]][o].top*100)/100;
                }
            if (impProp[i] == "members")
                for (j in this[impProp[i]]) {
                    exportObj[impProp[i]][j].x1 = Math.round(exportObj[impProp[i]][j].x1*100)/100;
                    exportObj[impProp[i]][j].x2 = Math.round(exportObj[impProp[i]][j].x2*100)/100;
                    exportObj[impProp[i]][j].y1 = Math.round(exportObj[impProp[i]][j].y1*100)/100;
                    exportObj[impProp[i]][j].y2 = Math.round(exportObj[impProp[i]][j].y2*100)/100;
                }                
        }
        return exportObj;
    },
    //recreate everything on the canvas from the entity controller
    import: function(jsonObj) {
        //reset everything
        this.clearAllNodes();
        //create initial nodes
        for (var i in jsonObj.nodes) {
            if(jsonObj.nodes[i].floor_beam) {
            }
            node = new Node();
            node.copyProp(jsonObj.nodes[i]);
            this.addNode(node);
            //draw everyone as they come
            Grid.canvas.add(node);
            if(node.support) { 
                if (i < 1) {
                    this.supportA = node;
                    this.floor_nodes.push(node);
                } else {
                    this.supportB = node;
                    //push later in to floor_nodes;
                }
            }
            if(node.floor_beam && !node.support) {
                this.floor_nodes.push(node);
            }
        }
        this.floor_nodes.push(this.supportB);

        for (var o in jsonObj.members) {
            member = new Member();
            member.copyProp(jsonObj.members[o]);
            
            //find start node
            for (var j in this.nodes) {
                if (member.isStartNode(this.nodes[j])) {
                    member.start_node=this.nodes[j];
                    this.nodes[j].connected_members.push(member);
                }
            }
            //find end node
            for (var k in this.nodes) {
                if (member.isEndNode(this.nodes[k])) {
                    member.end_node=this.nodes[k];
                    this.nodes[k].connected_members.push(member);
                }       
            }
            member.stroke='hsla(65, 100%, 60%, 1)';
            Grid.canvas.add(member);
            //push
            this.addMember(member);
        }

        for (var l in this.nodes) {
            Grid.canvas.bringToFront(this.nodes[l]); 
        }
        Grid.canvas.renderAll();

    },
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
          lockMovementY: true,
          lockMovementX: true
        });
        var supportB=new Node({
          support: true,
          floor_beam: true,
          left: canvasWidth*7/8,
          top: canvasHeight/3,
          stroke: '#F41313',
          lockMovementY: true,
          lockMovementX: true
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