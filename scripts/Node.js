var E=require('./EntityController');
var ForceLine=require('./ForceLine');

var Node = fabric.util.createClass(fabric.Circle, {
    type: 'node',

    initialize: function(options) {
        if (!options) {
            options = {};
        }

        this.callSuper('initialize', options);

        //settings default values of the most important properties
        this.set({
            left: options.left || -100,
            top: options.top || -100,
            strokeWidth: options.strokeWidth || 5,
            radius: options.radius || 12,
            fill: options.fill || '#FFFFFF',
            stroke: options.stroke || '#666',
            selectable: options.selectable || true,
            hasControls: false,
            hasBorders: false,
            support: options.support || false,
            floor_beam: options.floor_beam || false,
            external_force: [0,0],
            connected_members: []
        });
    },

    

    toObject: function() {
        return fabric.util.object.extend(this.callSuper('toObject'), {
            support: this.get('support'),
            external_forces: this.get('external_forces'),
            connected_members: this.get('connected_members')
        });
    },

    _render: function(ctx) {
        this.callSuper('_render', ctx);
    }
});

//Moves the connected members of the node to its position
Node.prototype.moveMembers = function(canvas) {
    for (var i = 0; i < this.connected_members.length; i++) {
        if (this.connected_members[i].start_node == this) { //if the start of the member is connected to the this
            this.connected_members[i].set({
                x1: this.left,
                y1: this.top
            });
        } else if (this.connected_members[i].end_node == this) { //if the end of the member is connected to the this
            this.connected_members[i].set({
                x2: this.left,
                y2: this.top
            });
        }
        //Re-adding the members to avoing weird glitchiness
        canvas.remove(this.connected_members[i]);
        canvas.add(this.connected_members[i]);
        canvas.sendToBack(this.connected_members[i]); //sending the connected members to the back of the canvas
    }
};

Node.prototype.setForce=function(x,y,canvas){

    this.external_force[0]=x || 0;
    this.external_force[1]=y || 0;
    roundedX=Math.round(x*100)/100;
    roundedY=Math.round(y*100)/100;
    if(this.forceLine){ //if a force line already exists
        this.forceLine.set({
            x1: this.left,
            y1: this.top,
            label: roundedY,
            x2: this.left,
            y2: this.top-y*200/E.car_weight
        });
    }
    else{ //if the forceline doesnt yet exist
        this.forceLine=new ForceLine({
            x1: this.left,
            y1: this.top,
            label: roundedY,
            x2: this.left,
            y2: this.top-y*200/E.car_weight
        });
        canvas.add(this.forceLine);
    }
};

Node.prototype.isCarOn=function(){
    if(E.car){
        if(this.left>=E.car.left-E.car_length_px/2 && this.left<=E.car.left+E.car_length_px/2){
            return true;
        }
    }
    return false;
};

module.exports=Node;