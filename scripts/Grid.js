//the grid singleton. Contains all properties about the grid as well as methods to create and resize the grid
var Grid = {
    canvas: null,
    grid_size: 50,
    min_grid_size:14,
    grid_meter: 1, //number of grid squares per meter
    lines: [], //to keep track of the lines created so they can be removed

    //Removes the current Grid
    removeGrid: function() {
        for (var i = 0; i < Grid.lines.length; i++) {
            Grid.canvas.remove(Grid.lines[i]);
        }
    },

    //Removes the current grid and recreates it based on the grid size
    createGrid: function() {
        Grid.removeGrid();
        var line;
        //create the harizontal lines of the grid
        for (i = 0; i < this.canvas.width; i += this.grid_size) {
            line = new fabric.Line([i, 0, i, this.canvas.height * 2], {
                stroke: '#ccc',
                selectable: false
            });
            Grid.lines.push(line);
            Grid.canvas.add(line);
            Grid.canvas.sendToBack(line);
        }

        //create the vertical lines of the grid
        for (i = 0; i < Grid.canvas.height; i += Grid.grid_size) {
            line = new fabric.Line([0, i, Grid.canvas.width * 2, i], {
                stroke: '#ccc',
                selectable: false
            });
            Grid.lines.push(line);
            Grid.canvas.add(line);
            Grid.canvas.sendToBack(line);
        }
    },
    calcGridMeter: function(EntityController){ 
        if(EntityController.supportA && EntityController.supportB){
            this.grid_meter=(EntityController.supportB.left-EntityController.supportA.left)/(this.grid_size*EntityController.bridge_length);
        }
    }
};

module.exports = Grid;