var Member = fabric.util.createClass(fabric.Line, {
    type: 'member',

    initialize: function(options) {
        if (!options) {
            options = {};
        }

        this.callSuper('initialize', options);

        //settings default values of the most important properties
        this.set({
            fill: 'blue',
            stroke: 'grey',
            strokeWidth: 10,
            strokeLineJoin : "round",
            selectable: true, //settings this to false would disable the eraser from getting rid of it
            hasControls: false,
            hasBorders: false,
            x1: options.x1 || -100,
            y1: options.y1 || -100,
            x2: options.x2 || -100,
            y2: options.y2 || -100,
            force: null,
            length: null,
            unit_vector: null,
            start_node: null, //what node the member is connected to at it's start
            end_node: null //what node the member is connected to at it's end
        });
    },

    toObject: function() {
        return fabric.util.object.extend(this.callSuper('toObject'), {
            force: this.get('force'),
            start_node: this.get('start_node'),
            end_node: this.get('end_node')
        });
    },

    _render: function(ctx) {
        this.callSuper('_render', ctx);
    }
});

Member.prototype.calcLength(){
    this.length=Math.sqrt((this.x2-this.x1)*(this.x2-this.x1)+(this.y2-this.y1)*(this.y2-this.y1));
};
Member.prototype.calcUnitVector(){
    this.unit_vector[0]=(this.x2-this.x1)/this.length;
    this.unit_vector[1]=(this.y2-this.y1)/this.length;
}

module.exports=Member;