var Car = fabric.util.createClass(fabric.Rect, {

    type: 'car',

    initialize: function(options) {
        if (!options) {
            options = {};
        }

        this.callSuper('initialize', options);
        this.set('label', options.label || '');
        
        //Restricting movement of the car by player to only the x-axis
        this.set({
            lockMovementY: true,
            lockRotation: true,
            lockScalingX: true,
            lockScalingY: true,
            hasControls: false,
            fill: "#4500F5"
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
        ctx.fillStyle = '#FFFFFF'; //color of the font
        ctx.fillText(this.label, -this.width / 4, -this.height / 2+30);
    }
});

module.exports = Car;