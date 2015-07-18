var Member = fabric.util.createClass(fabric.Line, {
    type: 'member',

    initialize: function(options) {
        if (!options) {
            options = {};
        }

        this.callSuper('initialize', options);

        //settings default values of the most important properties
        this.set({
            fill: 'red',
            stroke: 'red',
            strokeWidth: 5,
            strokeLineJoin : "round",
            selectable: false,
            hasControls: false,
            hasBorders: false,
            x1: options.x1 || -100,
            y1: options.y1 || -100,
            x2: options.x2 || -100,
            y2: options.y2 || -100,
            force: null,
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

module.exports=Member;