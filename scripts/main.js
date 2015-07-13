  var createGrid=require('./createGrid');
  var grid_size = 15; //pixels per square

  var canvas = new fabric.Canvas('truss-canvas', { 
    selection: true 
  });

  //Resizes the canvas to the window's full width
  window.addEventListener('resize', resizeCanvas, false);

  function resizeCanvas() {
    canvas.setHeight($(window).height()-120);
    canvas.setWidth(window.innerWidth-2);
    canvas.renderAll();
  }

  // resize on init
  resizeCanvas();

  createGrid(canvas,grid_size);

  fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';

  function makeCircle(left, top, line1, line2, line3, line4) {
    var c = new fabric.Circle({
      left: left,
      top: top,
      strokeWidth: 5,
      radius: 12,
      fill: '#fff',
      stroke: '#666',
      selectable: true
    });
    c.hasControls = c.hasBorders = false;

    c.line1 = line1;
    c.line2 = line2;
    c.line3 = line3;
    c.line4 = line4;

    return c;
  }

  function makeLine(coords) {
    return new fabric.Line(coords, {
      fill: 'red',
      stroke: 'red',
      strokeWidth: 5,
      selectable: true
    });
  }

  var line = makeLine([ 250, 125, 250, 175 ]),
      line2 = makeLine([ 250, 175, 250, 250 ]),
      line3 = makeLine([ 250, 250, 300, 350]),
      line4 = makeLine([ 250, 250, 200, 350]),
      line5 = makeLine([ 250, 175, 175, 225 ]),
      line6 = makeLine([ 250, 175, 325, 225 ]);

  canvas.add(line, line2, line3, line4, line5, line6);

  canvas.add(
    makeCircle(line.get('x1'), line.get('y1'), null, line),
    makeCircle(line.get('x2'), line.get('y2'), line, line2, line5, line6),
    makeCircle(line2.get('x2'), line2.get('y2'), line2, line3, line4),
    makeCircle(line3.get('x2'), line3.get('y2'), line3),
    makeCircle(line4.get('x2'), line4.get('y2'), line4),
    makeCircle(line5.get('x2'), line5.get('y2'), line5),
    makeCircle(line6.get('x2'), line6.get('y2'), line6)
  );

  canvas.on('object:moving', function(e) {
    var p = e.target;
    if(p.line1){
    	p.line1.set({ 'x2': p.left, 'y2': p.top });
    }
    if(p.line2){
    	p.line2.set({ 'x1': p.left, 'y1': p.top });
    }
    if(p.line3){
    	p.line3.set({ 'x1': p.left, 'y1': p.top });
    }
    if(p.line4){
    	p.line4.set({ 'x1': p.left, 'y1': p.top });
    }
    canvas.renderAll();
  });

  function startSimulation(){
    return false;
  }