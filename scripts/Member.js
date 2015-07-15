function Member(left, top, canv) {
    this.line = new fabric.Line([left, top, left, top], {
        fill: 'red',
        stroke: 'blue',
        strokeWidth: 5,
        selectable: false,
        hasControls: false,
        hasBorders: false
    });
    this.line.force = null; //positive inficates tensile, negative indicates compressive
    this.line.start_node = null;
    this.line.end_node = null;

    this.placed_start = false; //whether the member's start position has been placed on a node
    this.placed_end = false; //whether a member's end position has been placed on a node

    if (canv) {
        Member.canvas = canv;
        Member.canvas.add(this.line);
        Member.canvas.sendToBack(this.line);
    }
    return this;
}

fabric.Line.prototype.moveNodes=function() {
	if(this.start_node && this.end_node){
		console.log(this.get('x1'));
		// this.start_node.set({left: this.x1, top: this.y1});
		// this.end_node.set({left: this.x2, top: this.y2});


		// this.start_node.moveMembers();
		// this.end_node.moveMembers();
	}
};

module.exports = Member;