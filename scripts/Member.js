function Member(left,top,canv){
	this.line=new fabric.Line([left,top,left,top], {
       fill: 'red',
       stroke: 'blue',
       strokeWidth: 5,
       selectable: true,
       hasControls: false,
       hasBorders: false
    });
    this.line.force=null; //positive inficates tensile, negative indicates compressive

	this.placed_start=false; //whether the member's start position has been placed on a node
	this.placed_end=false; //whether a member's end position has been placed on a node
	
	if(canv){
		Member.canvas=canv;
		Member.canvas.add(this.line);
		Member.canvas.sendToBack(this.line);
	}
	return this;
}

module.exports=Member;