//The pink forceline fabric.js object that shows the reation forces at a node 
var ForceLine = fabric.util.createClass(fabric.Line, {
    type: 'forceline',

    initialize: function(options) {
        if (!options) {
            options = {};
        }

        this.callSuper('initialize', options);

        //settings default values of the most important properties
        this.set({
            fill: 'blue',
            stroke: '#FF0096',
            strokeWidth: 3,
            strokeLineJoin : "round",
            selectable: false,
            hasControls: false,
            hasBorders: false,
            label: options.label || '',
            x1: options.x1 || -100,
            y1: options.y1 || -100,
            x2: options.x2 || -100,
            y2: options.y2 || -100,
        });
    },

    toObject: function() {
        return fabric.util.object.extend(this.callSuper('toObject'), {
            label: this.get('label')
        });
    },

    _render: function(ctx) {
        this.callSuper('_render', ctx);
        ctx.font = '20px Arial';
        ctx.fillStyle = '#FF0096'; //color of the font
        ctx.fillText(this.label, -this.width / 4+10, -this.height / 2+30);
    }
});

module.exports=ForceLine;