//Handles Resizing of the canvas
module.exports=function ResizeController(canvas){
	this.canvas=canvas;
	//Resizes the canvas to the window's full width
  $(window).on('resize',function(){
  	this.resizeCanvas();
  });

  this.resizeCanvas=function(){
  	this.canvas.setHeight($(window).height()-120);
    this.canvas.setWidth($(window).width()-2);
    this.canvas.renderAll();
  };

  this.resizeCanvas();
};