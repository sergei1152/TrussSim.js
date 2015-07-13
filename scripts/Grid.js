var Grid = {
    canvas: null,
    grid_size: 50,
    min_grid_size:15,
    lines: [],

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
        }

        //create the vertical lines of the grid
        for (i = 0; i < Grid.canvas.height; i += Grid.grid_size) {
            line = new fabric.Line([0, i, Grid.canvas.width * 2, i], {
                stroke: '#ccc',
                selectable: false
            });
            Grid.lines.push(line);
            Grid.canvas.add(line);
        }
    },

    //Monitors for changes in the grid spacing input field and re-creates the grid if a change is detected
    monitor: function() {
        $('#grid-size-input').change(function() {
            var new_grid_size = parseInt($('#grid-size-input').val());

            if (!isNaN(new_grid_size) && new_grid_size > Grid.min_grid_size) {
                Grid.grid_size = new_grid_size;
                Grid.createGrid();
            }
        });
    }
};

module.exports = Grid;