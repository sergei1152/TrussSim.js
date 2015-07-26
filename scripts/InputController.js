var EntityController=require('./EntityController');
var Grid=require('./Grid');
var Node=require('./Node');

var InputController=function(){

	$('#bridge-length-input').change(function() {
	    var new_bridge_length = parseInt($(this).val());

	    if (!isNaN(new_bridge_length)) {
	       EntityController.bridge_length=new_bridge_length;
	    }
	});

	$('#car-weight-input').change(function() {
	    var new_car_weight = parseInt($(this).val());
	    if (!isNaN(new_car_weight)) {
	       EntityController.car_weight=new_car_weight;
	    }
	});


	$('#car-length-input').change(function() {
	    var new_car_length = parseInt($(this).val());
	    if (!isNaN(new_car_length)) {
	       EntityController.car_length=new_car_length;
	    }
	});

	$('#max-compressive-input').change(function() {
	    var max = parseInt($(this).val());
	    if (!isNaN(max)) {
	       EntityController.max_compressive=max;
	    }
	});

	$('#max-tensile-input').change(function() {
	    var max = parseInt($(this).val());
	    if (!isNaN(max)) {
	       EntityController.max_tensile=max;
	    }
	});

	$('#num-floor-input').change(function() {
	    var num_floor_nodes = parseInt($(this).val());
	    if (!isNaN(num_floor_nodes) && num_floor_nodes < 10) {
	       EntityController.createFloorNodes(num_floor_nodes);
	    }
	});

	//Monitors for changes in the grid spacing input field and re-creates the grid if a change is detected
	$('#grid-size-input').change(function() {
	    var new_grid_size = parseInt($('#grid-size-input').val());

	    if (!isNaN(new_grid_size) && new_grid_size > Grid.min_grid_size) {
	        Grid.grid_size = new_grid_size;
	        Grid.createGrid();
	    }
	});

	$('#exportBtn').click(function() {
		jsonStr = JSON.stringify(EntityController.export());
		$('#export-cont').val(jsonStr);
		$('#uniqueHash').val(EntityController.exportHash(jsonStr));
		return false;
	});

	$('#importBtn').click(function() {
		jsonStr = $('#export-cont').val();
		if (jsonStr.length > 0) {
			if (jsonStr.charAt(1) == 'A') {
				EntityController.importHash(jsonStr);
			} else {
				jsonObj = JSON.parse(jsonStr);
				EntityController.import(jsonObj);
			}
		}
		return false;
	});

	$('#export-cont').click(function () {
		this.select();
	});
	$('#uniqueHash').click(function() {
		this.select();
	});
};



module.exports=InputController;