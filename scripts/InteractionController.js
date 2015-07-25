var Node = require('./Node');
var Member = require('./Member');
var Car = require('./Car');
var Grid = require('./Grid');
var EntityController = require('./EntityController');
var Calculate = require('./Calculate');

module.exports = function(canvas, ModeController) {

    //Handles movement of new nodes and new members
    canvas.on('mouse:move', function(event) {
        //if in 'add-node' mode
        if (ModeController.mode === 'add_node') {
            ModeController.new_node.set({ //set the new node to follow the cursor
                'left': event.e.x,
                'top': event.e.pageY - $('#canvas-wrapper').offset().top
            });
            canvas.renderAll();
        }
        //if in 'add-member' mode and the start of the member has been placed already
        else if (ModeController.mode === 'add_member' && (ModeController.new_member.start_node && !ModeController.new_member.end_node)) {
            ModeController.new_member.set({ //set the end of the member to follow the cursor
                'x2': event.e.x,
                'y2': event.e.pageY - $('#canvas-wrapper').offset().top
            });
            canvas.renderAll();
        }
    });

    //Handles placements of new nodes
    canvas.on('mouse:up', function(event) {
        if (ModeController.mode === 'add_node') {
            canvas.remove(ModeController.new_node); //for some reason have to remove and re-add node to avoid weird glitcheness
            canvas.add(ModeController.new_node);
            canvas.bringToFront(ModeController.new_node); //bringing the new node to the front of the canvas
            EntityController.addNode(ModeController.new_node);
            ModeController.new_node = new Node(); //create a new node, while leaving the old one in the canvas
            canvas.add(ModeController.new_node); //adding the new node to the canvas
        } else if (ModeController.mode === 'add_member') {
            if (event.target && event.target.type === 'node') { //if a node has been clicked on
                if (!ModeController.new_member.start_node) { //if the member's start has not been determined yet
                    ModeController.new_member.set({ //position the start of the member to be at the center of the node
                        x1: event.target.left,
                        y1: event.target.top,
                        x2: event.target.left,
                        y2: event.target.top
                    });

                    ModeController.new_member.start_node = event.target;
                    event.target.connected_members.push(ModeController.new_member);
                    canvas.renderAll();
                } else if (ModeController.new_member.start_node && !ModeController.new_member.end_node && event.target != ModeController.new_member.start_node) { //if the new member already has a starting node and the end has not been determined yet
                    ModeController.new_member.set({ //place the end of the node at the center of the selected node
                        x2: event.target.left,
                        y2: event.target.top
                    });
                    ModeController.new_member.end_node = event.target;
                    event.target.connected_members.push(ModeController.new_member);

                    canvas.remove(ModeController.new_member); //re-add the member to avoid weird glitchiness
                    canvas.add(ModeController.new_member);
                    canvas.sendToBack(ModeController.new_member);
                    EntityController.addMember(ModeController.new_member);
                    ModeController.new_member = new Member(); //create a new member while leaving the old one in the canvas
                    canvas.add(ModeController.new_member);
                }
            }
        }

    });

    //Handles erasing nodes and members, as well as placing members
    canvas.on('object:selected', function(event) {
        if (ModeController.mode === 'erase') { //TODO: remove all connected members from the nodes as well
            canvas.remove(event.target); //remove the selected node from the canvas
        }


    });

    var previous_fill = 'grey';
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

    canvas.on('object:moving', function(event) {
        if (event.target.type == 'node') { //if a node is moving
            var node = event.target;
            node.moveMembers(canvas);
            if (ModeController.simulation) {
                Calculate();
            }
        } else if (event.target.type == 'car') {
            Calculate();
        }
    });

    //hotkeys are created here
    var keyListener = document.getElementById('canvas-wrapper');
    keyListener.tabIndex = 1000; //required to get the canvas wrapper register events with keys
    $(keyListener).keydown(function(event) {
        // console.log('key pressed was: '+event.which); // for debug
        switch(event.which) {
            case 27: //escape key
                ModeController.move_mode();
                break;
            case 46: //delete key
                ModeController.erase_mode();
                break;
            case 77: //'m' key
                ModeController.add_member_mode();
                break;
            case 78: //'n' key
                ModeController.add_node_mode();
                break;
        }
    }); 


    $('#simulation-button').on('click', function() {
        if (!EntityController.isValid()) { //if the bridge design is not valid
            alert('The bridge design is not valid and does not satisfy the M=2N-3 condition' +
                'You have ' + EntityController.nodes.length + ' nodes and ' + EntityController.members.length + ' members');
        } else if (!EntityController.car) { //if the car object doesnt exist yet
            var car = new Car({
                width: EntityController.car_length * Grid.grid_meter * Grid.grid_size,
                height: Grid.grid_size,
                left: 50,
                top: canvas.getHeight() / 3 - 40,
                label: 'Distributed Load',
                length: EntityController.car_length,
                weight: EntityController.car_weight
            });
            EntityController.car = car;
            canvas.add(car);
            Calculate();
            ModeController.simulation=true;
        } else { //if the car object already exists
            Calculate();
            ModeController.simulation=true;
        }

        return false;
    });
};