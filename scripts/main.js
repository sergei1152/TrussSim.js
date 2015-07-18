  var ModeController = require('./ModeController');
  var InteractionController = require('./InteractionController');
  var Grid = require('./Grid');
  var ResizeController = require('./ResizeController');

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

