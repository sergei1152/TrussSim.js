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
        Node.canvas = canv;
        Node.canvas.add(this.circle);
        Node.canvas.bringToFront(this.circle);
    }
    
    return this;
}

module.exports=Node;