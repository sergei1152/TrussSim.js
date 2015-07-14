var Node=require('./Node');
var Member=require('./Member');

module.exports = function(canvas, ModeController) {

    //Handles movement of new nodes and new members
    canvas.on('mouse:move', function(event) {
        if (ModeController.mode === 'add_node') {
            ModeController.new_node.circle.set({ //set the new node to follow the cursor
                'left': event.e.x,
                'top': event.e.y - 105
            });
            canvas.renderAll();
        }
        //if in add member mode and the start of the new member has already been determined
        else if (ModeController.mode === 'add_member' && (ModeController.new_member.placedStart && !ModeController.new_member.placedEnd)) {
            ModeController.new_member.line.set({ //set the end of the member to follow the cursor
                'x2': event.e.x,
                'y2': event.e.y - 105
            });
            canvas.renderAll();
        }
    });

    //Handles placements of new nodes
    canvas.on('mouse:up', function(event) {
        if (ModeController.mode === 'add_node') {
            //for some reason have to remove and re-add node to avoid weird glitcheness
            canvas.remove(ModeController.new_node.circle);
            canvas.add(ModeController.new_node.circle);
            canvas.bringToFront(ModeController.new_node.circle);
            ModeController.new_node = new Node(event.e.x, event.e.y - 105, canvas); //create a new node, while leaving the old one in the canvas
        }

        else if (ModeController.mode === 'add_member') {
            if (event.target.type === 'circle') {
                if (!ModeController.new_member.placedStart) { //if the member's start has not been determined yet
                    ModeController.new_member.line.set({ //position the start of the member to be at the center of the node
                        x1: event.target.left,
                        y1: event.target.top,
                        x2: event.target.left,
                        y2: event.target.top
                    });
                    ModeController.new_member.line.start_node=event.target;
                    event.target.connected_members.push(ModeController.new_member.line);
                    ModeController.new_member.placedStart = true;
                } else { //if the new member already has a starting node
                    ModeController.new_member.line.set({ //place the end of the node at the center of the selected node
                        x2: event.target.left,
                        y2: event.target.top
                    });
                    ModeController.new_member.line.end_node=event.target;
                    event.target.connected_members.push(ModeController.new_member.line);
                    ModeController.new_member.placedEnd = true;

                    canvas.remove(ModeController.new_member.line); //re-add the member to avoid weird glitchiness
                    canvas.add(ModeController.new_member.line);
                    canvas.sendToBack(ModeController.new_member.line);
                    ModeController.new_member = new Member(-100, -100, canvas); //create a new member while leaving the old one in the canvas
                }
            }
        }

    });

    //Handles erasing nodes and members, as well as placing members
    canvas.on('object:selected', function(event) {
        if (ModeController.mode === 'erase') {
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
        console.log(event.target);
        if(event.target.type=='circle'){ //if a node is moving
            var node=event.target;
            for (var i=0;i<node.connected_members.length;i++){
                if(node.connected_members[i].start_node==node){ //if the start of the member is connected to the node
                    node.connected_members[i].set({x1:node.left,y1: node.top});
                }
                else if(node.connected_members[i].end_node==node){ //if the end of the member is connected to the node
                    node.connected_members[i].set({x2:node.left,y2: node.top});
                }
            }
        }
    });
};