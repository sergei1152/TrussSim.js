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
            external_forces: [],
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

module.exports=Node;