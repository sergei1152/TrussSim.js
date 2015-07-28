//Handles canvas interaction from the user, including movemnet of nodes, car, and erasing

var Node = require('./Node');
var Member = require('./Member');
var Car = require('./Car');
var Grid = require('./Grid');
var EntityController = require('./EntityController');
var Calculate = require('./Calculate');
var Optimizer=require('./Optimizer');

module.exports = function(canvas, ModeController) {

    //Handles movement of new nodes and new members
    canvas.on('mouse:move', function(event) {
        //if in 'add-node' mode
        if (ModeController.mode === 'add_node' && !ModeController.simulation) {
            ModeController.new_node.set({ //set the new node to follow the cursor
                'left': event.e.x,
                'top': event.e.pageY - $('#canvas-wrapper').offset().top
            });
            canvas.renderAll();
        }
        //if in 'add-member' mode and the start of the member has been placed already
        else if (ModeController.mode === 'add_member' && (ModeController.new_member.start_node && !ModeController.new_member.end_node) && !ModeController.simulation) {
            ModeController.new_member.set({ //set the end of the member to follow the cursor
                'x2': event.e.x,
                'y2': event.e.pageY - $('#canvas-wrapper').offset().top
            });
            canvas.renderAll();
        }
    });

    //Handles placements of new nodes
    canvas.on('mouse:up', function(event) {
        if (ModeController.show_node_coords) {
            ModeController.updateNodeDistance();
        }
        if (ModeController.mode === 'add_node' && !ModeController.simulation) {
            canvas.remove(ModeController.new_node); //for some reason have to remove and re-add node to avoid weird glitcheness
            canvas.add(ModeController.new_node);
            canvas.bringToFront(ModeController.new_node); //bringing the new node to the front of the canvas
            EntityController.addNode(ModeController.new_node);
            ModeController.new_node = new Node(); //create a new node, while leaving the old one in the canvas
            canvas.add(ModeController.new_node); //adding the new node to the canvas
        } else if (ModeController.mode === 'add_member' && !ModeController.simulation) {
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
                    if(event.e.shiftKey) {
                        ModeController.new_member.set({ //position the start of the member to be at the center of the node
                            x1: event.target.left,
                            y1: event.target.top,
                            x2: event.target.left,
                            y2: event.target.top
                        });
                        ModeController.new_member.start_node = event.target;
                        event.target.connected_members.push(ModeController.new_member);
                    }
                    canvas.add(ModeController.new_member);
                }
            }
        } 
        //erasing a node as well as all of its connected members
        else if (ModeController.mode === 'erase' && !ModeController.simulation && event.target && event.target.type==='node') { //if not in simulation mode and clicked on a node
            var nodeToRemove = event.target;
            if (!nodeToRemove.support && !nodeToRemove.floor_beam) { //if a regular node, allow deletion
                var membersToRemove = [];
                var i, j;
                //iterate and remove from canvas all of the node's connected members
                for (i = 0; i < nodeToRemove.connected_members.length; i++) { //iterate through all of the node's connected members
                    if (nodeToRemove.connected_members[i].start_node === nodeToRemove) { //if the connected members start node is the node to remove
                        for (j = 0; j < nodeToRemove.connected_members[i].end_node.connected_members.length; j++) { //go to the end node of the member and delete the member from there
                            if (nodeToRemove.connected_members[i].end_node.connected_members[j] === nodeToRemove.connected_members[i]) {
                                nodeToRemove.connected_members[i].end_node.connected_members.splice(j, 1);
                                break;
                            }
                        }
                    } else { //if the connected members end node is the node to remove
                        for (j = 0; j < nodeToRemove.connected_members[i].start_node.connected_members.length; j++) { //go to the start node of the member and delete the member from there
                            if (nodeToRemove.connected_members[i].start_node.connected_members[j] === nodeToRemove.connected_members[i]) {
                                nodeToRemove.connected_members[i].start_node.connected_members.splice(j, 1);
                                break;
                            }
                        }
                    }
                    canvas.remove(nodeToRemove.connected_members[i]); //remove the connected member from the canvas
                    membersToRemove.push(nodeToRemove.connected_members[i]);
                }
                canvas.remove(nodeToRemove); //remove the selected node from the canvas

                for(i=0;i<EntityController.nodes.length;i++){ //removing the node from the enity controller
                    if(EntityController.nodes[i]===nodeToRemove){
                        EntityController.nodes.splice(i,1);
                        break;
                    }
                }
                for(i=0;i<EntityController.members.length;i++){ //removing the members from the entity controller
                    for(j=0;j<membersToRemove.length;j++){
                        if(membersToRemove[j]===EntityController.members[i]){
                            EntityController.members.splice(i,1);
                            // membersToRemove.splice(j,1);
                        }
                    }
                }
            }
        }
    });
    
    //changes the color of an object to red when hovered over during erase mode
    canvas.on('mouse:over', function(e) {
        if (ModeController.mode === 'erase' && !ModeController.simulation && e.target && e.target.type==='node') {
            e.target.setFill(EntityController.erase_fill);
            canvas.renderAll();
        }
    });

    //sets the color back
    canvas.on('mouse:out', function(e) {
        if (ModeController.mode === 'erase' && !ModeController.simulation && e.target.type==='node') {
            e.target.setFill(EntityController.node_fill);
            canvas.renderAll();
        }
    });

    canvas.on('object:moving', function(event) {
        if (event.target.type == 'node') { //if a node is moving
            var node = event.target;
            if(node.floor_beam && ModeController.show_node_coords) {
                    ModeController.updateNodeDistance();
            }
            //only allow node to have a separation distance of 3m between its neighbour
            if (ModeController.max_spacing && node.floor_beam && !node.support) {
                //find out the index of the node in the floor_nodes array
                var index;
                for (index in EntityController.floor_nodes) {
                    if (EntityController.floor_nodes[index].left == node.left) {
                        break;
                    }
                }
                var left, right, gridMeter;
                gridMeter = (EntityController.supportB.left-EntityController.supportA.left)/15;
                left = (node.left - EntityController.floor_nodes[index-1].left)/gridMeter;
                right = (EntityController.floor_nodes[+index+1].left - node.left)/gridMeter;
                if (left > 3) {
                    node.left = EntityController.floor_nodes[+index-1].left+3*gridMeter;
                } else if (right > 3) {
                    node.left = EntityController.floor_nodes[+index+1].left-3*gridMeter;
                }
            }
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
        switch (event.which) {
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

    $('#optimize-button').on('click', function() {
        if(ModeController.simulation){
            Optimizer.optimize();
        }
    });

    $('#simulation-button').on('click', function() {
        ModeController.simulation_mode();
        if (ModeController.simulation) {
            $('#simulation-button').html('Stop Simulation');
            $("#add-node-button").attr("disabled", true);
            $("#add-member-button").attr("disabled", true);
            $("#eraser-button").attr("disabled", true);
             $("#optimize-button").attr("disabled", false);
        } else {
            $('#simulation-button').html('Start Simulation');
            $("#add-node-button").attr("disabled", false);
            $("#add-member-button").attr("disabled", false);
            $("#eraser-button").attr("disabled", false);
            $("#optimize-button").attr("disabled", true);
        }

        return false;
    });
};