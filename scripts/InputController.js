//Handles monitoring changes from the input text fields and applying them to the appropriate controller
//Also handles import and export events when the buttons are pressed

var EntityController=require('./EntityController');
var Grid=require('./Grid');
var Optimizer=require('./Optimizer');

var InputController=function(){

	$('#bridge-length-input').change(function() {
	    var new_bridge_length = parseInt($(this).val());
	    if (!isNaN(new_bridge_length)) { //to make sure the input is valid (is an integer)
	       EntityController.bridge_length=new_bridge_length;
	    }
	});

	$('#car-weight-input').change(function() {
	    var new_car_weight = parseInt($(this).val());
	    if (!isNaN(new_car_weight)) { //to make sure the input is valid (is an integer)
	       EntityController.car_weight=new_car_weight;
	    }
	});

	$('#car-length-input').change(function() {
	    var new_car_length = parseInt($(this).val());
	    if (!isNaN(new_car_length)) { //to make sure the input is valid (is an integer)
	       EntityController.car_length=new_car_length;
	    }
	});

	$('#max-compressive-input').change(function() {
	    var max = parseInt($(this).val());
	    if (!isNaN(max)) { //to make sure the input is valid (is an integer)
	       EntityController.max_compressive=max;
	    }
	});

	$('#max-tensile-input').change(function() {
	    var max = parseInt($(this).val());
	    if (!isNaN(max)) { //to make sure the input is valid (is an integer)
	       EntityController.max_tensile=max;
	    }
	});

	$('#num-floor-input').change(function() {
	    var num_floor_nodes = parseInt($(this).val());
	    if (!isNaN(num_floor_nodes) && num_floor_nodes < 10) { //to make sure the input is valid (is an integer and less than 10)
	       EntityController.createFloorNodes(num_floor_nodes);
	    }
	});

	$('#optimizer_var_input').change(function() {
	    var variance = parseInt($(this).val());
	    if (!isNaN(variance) && variance!==0) { //to make sure the input is valid (is an integer and non-zero)
	      	Optimizer.variation=variance;
	    }
	});

	$('#optimizer_dur_input').change(function() {
	    var duration = parseInt($(this).val());
	    if (!isNaN(duration) && duration >1) { //to make sure the input is valid (is an integer and greater than 1)
	       Optimizer.duration=duration;
	    }
	});

	//Monitors for changes in the grid spacing input field and re-creates the grid if a change is detected
	$('#grid-size-input').change(function() {
	    var new_grid_size = parseInt($('#grid-size-input').val());
	    if (!isNaN(new_grid_size) && new_grid_size > Grid.min_grid_size) { //makes sure the new grid size is an integer and greater than the minimum grid size
	        Grid.grid_size = new_grid_size;
	        Grid.createGrid(); //recreates the grid with the new specified grid size
	    }
	});

	$('#exportBtn').click(function() {
		jsonStr = JSON.stringify(EntityController.export()); //export the entity controller as a string
		$('#export-cont').val(jsonStr); //paste the string in the export field
		$('#uniqueHash').val(EntityController.exportHash(jsonStr)); //hash the output and paste it in the hash input field
		return false;
	});

	$('#importBtn').click(function() {
		jsonStr = $('#export-cont').val(); //stores the value of the import text field
		if (jsonStr.length > 0) { //makes sure its not empty
			if (jsonStr.charAt(1) == 'A') { //if the input is a hash
				EntityController.importHash(jsonStr);
			} else { //if the input is not hashed
				jsonObj = JSON.parse(jsonStr);
				EntityController.import(jsonObj);
			}
		}
		return false;
	});

	//selects all of the text on click of the export and hash input fields
	$('#export-cont').click(function () {
		this.select();
	});
	$('#uniqueHash').click(function() {
		this.select();
	});
};

module.exports=InputController;