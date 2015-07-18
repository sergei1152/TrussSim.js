  var ModeController = require('./ModeController');
  var InteractionController = require('./InteractionController');
  var Grid = require('./Grid');
  var ResizeController = require('./ResizeController');
  var EntityController=require('./EntityController');
  var Node=require('./Node');
  var canvas = new fabric.Canvas('truss-canvas', {
      selection: true
  });
   //So that all fabric objects have an origin along the center
  fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';
  
  ModeController.canvas = canvas;
  Grid.canvas = canvas;
  ResizeController.canvas = canvas;
  ResizeController.grid = Grid;
  ResizeController.resizeCanvas(); //creates the grid as well, and recreates it upon a window resize 


  InteractionController(canvas, ModeController);

  //Adding inital support nodes
  var supportA=new Node();
  var supportB=new Node();
  supportA.set({
    support: true,
    left: canvas.getWidth()/8,
    top:canvas.getHeight()/2,
    stroke: '#000',
    lockMovementY: true
  });
  supportB.set({
    support: true,
    left: canvas.getWidth()*7/8,
    top:canvas.getHeight()/2,
    stroke: '#000',
    lockMovementY: true
  });
  EntityController.supportA=supportA;
  EntityController.supportB=supportB;
  canvas.add(supportA);
  canvas.add(supportB);

