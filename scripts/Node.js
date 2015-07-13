function Node(left, top,canv){
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
    this.circle.connected_members=[];

    if(canv){
		Node.canvas=canv;
		Node.canvas.add(this.circle);
	}

    return this;
}
Node.prototype.addMember=function(x1,y1,x2,y2){
	var line=new fabric.Line([this.circle.left,this.circle.top,x1,y1],{
	  fill: 'red',
      stroke: 'red',
      strokeWidth: 5,
      selectable: false
	});

	this.circle.connected_members.push(line);
	Node.canvas.add(line);
};
module.exports=Node;