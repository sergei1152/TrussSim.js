//The car fabric.js object
var Car = fabric.util.createClass(fabric.Rect, {
    type: 'car',

    initialize: function(options) {
        if (!options) {
            options = {};
        }

        this.callSuper('initialize', options);
        
        this.set({
            //Restricting movement of the car by player to only the x-axis
            lockMovementY: true,
            lockRotation: true,
            lockScalingX: true,
            lockScalingY: true,
            hasControls: false,
            hasBorders: false,
            height: options.height || 50,
            left: options.left ||50,
            fill: "hsla(123, 51%, 64%, 0.65)",
            label: options.label || 'Distributed Load'
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
        ctx.fillText(this.label,  -this.width / 4, -this.height / 3+30); //so the text will position at the center of the car
    }
});

module.exports = Car;