  var ModeController = require('./ModeController');
  var Node = require('./Node');
  var Grid = require('./Grid');
  var ResizeController = require('./ResizeController');

  var canvas = new fabric.Canvas('truss-canvas', {
      selection: true
  });

  ModeController.canvas = canvas;
  Grid.canvas = canvas;
  ResizeController.canvas = canvas;
  ResizeController.grid = Grid;
  ResizeController.resizeCanvas(); //creates the grid as well, and recreates it upon a window resize 

  fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';

  canvas.on('mouse:move', function(event) {
      if (ModeController.mode === 'add_node') {
          ModeController.new_node.circle.set({
              'left': event.e.x,
              'top': event.e.y - 105
          });
          canvas.renderAll();
      }
  });

  canvas.on('mouse:up', function(event) {
      if (ModeController.mode === 'add_node') {
          //for some reason have to remove and re-add node to avoid weird glitcheness
          canvas.remove(ModeController.new_node.circle);
          canvas.add(ModeController.new_node.circle);
          ModeController.new_node = new Node(event.e.x, event.e.y - 105, canvas);
      }
  });

  $('#redraw').on('click', function() {
      canvas.renderAll();
      canvas.calcOffset();
      console.log('redraw');
  });
  var previous_fill;
  var hover_fill = 'red';
  canvas.on('mouse:over', function(e) {
      if (ModeController.mode === 'erase') {
          previous_fill = e.target.getFill();
          e.target.setFill(hover_fill);
          canvas.renderAll();
      }
  });

  canvas.on('mouse:out', function(e) {
      if (ModeController.mode === 'erase') {
          e.target.setFill(previous_fill);
          canvas.renderAll();
      }
  });
  var node = new Node(50, 50, canvas);
  node.addMember(5, 6, 8, 11);

   // function makeCircle(left, top, line1, line2, line3, line4) {
   //   var c = new fabric.Circle({
   //     left: left,
   //     top: top,
   //     strokeWidth: 5,
   //     radius: 12,
   //     fill: '#fff',
   //     stroke: '#666',
   //     selectable: true
   //   });
   //   c.hasControls = c.hasBorders = false;

   //   c.line1 = line1;
   //   c.line2 = line2;
   //   c.line3 = line3;
   //   c.line4 = line4;

   //   return c;
   // }

   // function makeLine(coords) {
   //   return new fabric.Line(coords, {
   //     fill: 'red',
   //     stroke: 'blue',
   //     strokeWidth: 5,
   //     selectable: false
   //   });
   // }

   // var line = makeLine([ 250, 125, 250, 175 ]),
   //     line2 = makeLine([ 250, 175, 250, 250 ]),
   //     line3 = makeLine([ 250, 250, 300, 350]),
   //     line4 = makeLine([ 250, 250, 200, 350]),
   //     line5 = makeLine([ 250, 175, 175, 225 ]),
   //     line6 = makeLine([ 250, 175, 325, 225 ]);

   // canvas.add(line, line2, line3, line4, line5, line6);
   // canvas.add(Node(5,5));
   // canvas.add(
   //   makeCircle(line.get('x1'), line.get('y1'), null, line),
   //   makeCircle(line.get('x2'), line.get('y2'), line, line2, line5, line6),
   //   makeCircle(line2.get('x2'), line2.get('y2'), line2, line3, line4),
   //   makeCircle(line3.get('x2'), line3.get('y2'), line3),
   //   makeCircle(line4.get('x2'), line4.get('y2'), line4),
   //   makeCircle(line5.get('x2'), line5.get('y2'), line5),
   //   makeCircle(line6.get('x2'), line6.get('y2'), line6)
   // );
  canvas.on('object:moving', function(e) {
      var target = e.target;

      if (target.type === 'circle') {
          for (var i = 0; i < target.connected_members.length; i++) {
              target.connected_members[i].set({
                  'x1': target.left,
                  'y1': target.top
              });
          }
      }
      // if(p.line1){
      // 	p.line1.set({ 'x2': p.left, 'y2': p.top });
      // }
      // if(p.line2){
      // 	p.line2.set({ 'x1': p.left, 'y1': p.top });
      // }
      // if(p.line3){
      // 	p.line3.set({ 'x1': p.left, 'y1': p.top });
      // }
      // if(p.line4){
      // 	p.line4.set({ 'x1': p.left, 'y1': p.top });
      // }
      canvas.renderAll();
  });

  function startSimulation() {
      return false;
  }