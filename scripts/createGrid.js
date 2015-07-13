module.exports=function createGrid(canvas,grid_size){
	//create the harizontal lines of the grid
  for(i=0;i<canvas.width;i+=grid_size){
    canvas.add(new fabric.Line([i,0,i,canvas.height*2],{ 
      stroke: '#ccc', 
      selectable: false
    }));
  }

  //create the vertical lines of the grid
  for(i=0;i<canvas.height;i+=grid_size){
    canvas.add(new fabric.Line([0,i,canvas.width*2,i],{ 
      stroke: '#ccc', 
      selectable: false
    }));
  }
};