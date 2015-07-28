//member fabric.js object that represents the individual members of the truss
var Member = fabric.util.createClass(fabric.Line, {
    type: 'member',

    initialize: function(options) {
        if (!options) {
            options = {};
        }

        this.callSuper('initialize', options);

        this.set({
            fill: 'blue',
            stroke: 'hsla(243, 0%,50%, 1)',
            strokeWidth: 10,
            strokeLineJoin : "round",
            selectable: false, //settings this to false would disable the eraser from getting rid of it
            hasControls: false,
            hasBorders: false,
            x1: options.x1 || -100,
            y1: options.y1 || -100,
            x2: options.x2 || -100,
            y2: options.y2 || -100,
            label: options.label || '',
            force:null,
            member_length: null,
            unit_vector: [],
            start_node: null, //what node the member is connected to at it's start
            end_node: null //what node the member is connected to at it's end
        });
    },

    toObject: function() {
        retObj = {};
        var impAttr = ['x1', 'x2', 'y1', 'y2'];
        for (var i in impAttr) {
            retObj[impAttr[i]] = this[impAttr[i]];
        }
        return retObj;
    },

    _render: function(ctx) {
        this.callSuper('_render', ctx);
        if (this.force !== null) {
            // ctx.fillRect(-10, -8, 80, 28); //shows a white rectangle behind the force
            ctx.font = '20px Arial';
            ctx.fillStyle = 'hsla(53, 100%, 24%, 1)'; //color of the font
            ctx.fillText(this.label, 0,20);
        }
    }
});

//calculates the length of the member in pixels for cost calculations
Member.prototype.calcLength=function(){
    this.member_length=Math.sqrt((this.x2-this.x1)*(this.x2-this.x1)+(this.y2-this.y1)*(this.y2-this.y1));
};

//calculates the unit vector of the member (length needs to be calculated first, so calcLength() should be called before hand)
Member.prototype.calcUnitVector=function(){
    this.unit_vector[0]=(this.x2-this.x1)/this.member_length;
    this.unit_vector[1]=(this.y2-this.y1)/this.member_length;
};

//for the import functionality, takes in a json singleton representing a member, and applies its properties to the current member
Member.prototype.copyProp=function(memberObj) {
    var impAttr = ['x1', 'x2', 'y1', 'y2'];
    for (var i in impAttr) {
        this[impAttr[i]] = memberObj[impAttr[i]];
    }
    this.width = Math.abs(this.x1-this.x2);
    this.height = Math.abs(this.y1-this.y2);
    this.left = Math.min(this.x1,this.x2)+this.width/2;
    this.top = Math.min(this.y1, this.y2)+this.height/2;
    this.member_length = Math.sqrt(this.width*this.width+this.height*this.height);
};

//checks if a node is the start node of the member
Member.prototype.isStartNode=function(nodeObj) {
    if (Math.round(nodeObj.left*100)/100 == Math.round(this.x1*100)/100 && Math.round(nodeObj.top*100)/100 == Math.round(this.y1*100)/100)
        return true;
    return false;
};

//checks if a node is the end node of the member
Member.prototype.isEndNode=function(nodeObj) {
    if (Math.round(nodeObj.left*100)/100 == Math.round(this.x2*100)/100 && Math.round(nodeObj.top*100)/100 == Math.round(this.y2*100)/100)
        return true;
    return false;
};

module.exports=Member;

//sets the force of the member as well as sets the proper color based on if its under compression or tension, as well as how close it is to its maximum tension or compression
Member.prototype.setForce=function(x,EntityController){
    this.force=x;
    var percentMax;
    if(x<0){ //if the force is compressive
        percentMax=-x*100/EntityController.max_compressive;
        if(percentMax>100){ //if the force exceeded compressive tensile force
            this.stroke='hsla(65, 100%, 60%, 1)';
        }
        else{
            this.stroke='hsla(360, '+(percentMax*0.8+20)+'%,50%, 1)';
        }
    }
    else if(x>0){ //if the force is tensile
        percentMax=x*100/EntityController.max_tensile;
        if(percentMax>100){ //if the force exceeded maximum tensile force
            this.stroke='hsla(65, 100%, 60%, 1)';
        }
        else{
            this.stroke='hsla(243, '+(percentMax*0.8+20)+'%,50%, 1)';
        }
    }
    else{
        this.stroke='hsla(243, 0%,50%, 1)';
    }
    this.label=Math.round(x*100)/100 || '';
};

