function Member(left,top,canvas){
	this.line=new fabric.Line([left,top,left,top], {
       fill: 'red',
       stroke: 'blue',
       strokeWidth: 5,
       selectable: false
    });
    this.line.force=0;

	this.placed_start=false; //whether the member's start position has been placed on a node
	this.placed_end=false; //whether a member's end position has been placed on a node
	
	canvas.add(this.line);
	canvas.sendBackwards(this.line);
	return this;
}

module.exports=Member;