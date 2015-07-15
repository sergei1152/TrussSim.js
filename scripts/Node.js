function Node(left, top, canv) {
    this.circle = new fabric.Circle({
        left: left,
        top: top,
        strokeWidth: 5,
        radius: 12,
        fill: '#fff',
        stroke: '#666',
        selectable: true
    });

    this.circle.hasControls = this.circle.hasBorders = false;
    this.circle.connected_members = [];

    if (canv) {
        Node.canvas = canv;
        Node.canvas.add(this.circle);
        Node.canvas.bringToFront(this.circle);
    }
    
    return this;
}

fabric.Circle.prototype.moveMembers = function() { //TODO: Figure out how to make this a prototype
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
        Node.canvas.remove(this.connected_members[i]);
        Node.canvas.add(this.connected_members[i]);
        Node.canvas.sendToBack(this.connected_members[i]);
    }
};

module.exports = Node;