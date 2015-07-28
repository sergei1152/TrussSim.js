  var ModeController = require('./ModeController');
  var InteractionController = require('./InteractionController');
  var Grid = require('./Grid');
  var ResizeController = require('./ResizeController');
  var Node=require('./Node');
  var EntityController=require('./EntityController');
  var InputController=require('./InputController');
  var canvas = new fabric.Canvas('truss-canvas', {
      selection: false
  });

   //So that all fabric objects have an origin along the center
  fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';
  
  //initialization
  ModeController.canvas = canvas;
  Grid.canvas = canvas;
  ResizeController.canvas = canvas;
  ResizeController.grid = Grid;
  ResizeController.resizeCanvas(); //creates the grid as well, and recreates it upon a window resize 

  InteractionController(canvas, ModeController);
  InputController();

  var num_floor_beams=4;

  EntityController.createFloorNodes(num_floor_beams);

  ModeController.move_mode();