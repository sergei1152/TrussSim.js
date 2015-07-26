// var E=require('./EntityController');

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
            stroke: 'hsla(243, 0%,50%, 1)',
            strokeWidth: 10,
            strokeLineJoin : "round",
            selectable: false, //settings this to false would disable the eraser from getting rid of it
            hasControls: false,
            hasBorders: false,
            x1: options.x1 || -100,
            y1: options.y1 || -100,
            x2: options.x2 || -100,
            y2: options.y2 || -100,
            label: options.label || '',
            max_tensile: 12,
            max_compressive: 8,
            force:null,
            member_length: null,
            unit_vector: [],
            start_node: null, //what node the member is connected to at it's start
            end_node: null //what node the member is connected to at it's end
        });
    },

    toObject: function() {
        retObj = {};
        var impAttr = ['x1', 'x2', 'y1', 'y2', 'member_length', 'width', 'height', 'left', 'top'];
        for (var i in impAttr) {
            retObj[impAttr[i]] = this[impAttr[i]];
        }
        retObj.start_node = null;
        retObj.end_node = null;
        return fabric.util.object.extend(this.callSuper('toObject'), retObj
        // {
            // start_node: null,
            // end_node: null,

            // x1: this.get('x1'),
            // x2: this.get('x2'),
            // y1: this.get('y1'),
            // y2: this.get('y2'),
            // member_length: this.get('member_length')
            // force: this.get('force'),
            // start_node: this.get('start_node'),
            // end_node: this.get('end_node'),
            // label: this.get('label')
        // }
        );
    },

    _render: function(ctx) {
        this.callSuper('_render', ctx);
        ctx.font = '20px Arial';
        ctx.fillStyle = 'hsla(53, 100%, 24%, 1)'; //color of the font
        ctx.fillText(this.label, 0,20);
    }
});

Member.prototype.calcLength=function(){
    this.member_length=Math.sqrt((this.x2-this.x1)*(this.x2-this.x1)+(this.y2-this.y1)*(this.y2-this.y1));
};

Member.prototype.calcUnitVector=function(){
    this.unit_vector[0]=(this.x2-this.x1)/this.member_length;
    this.unit_vector[1]=(this.y2-this.y1)/this.member_length;
};

Member.prototype.copyProp=function(memberObj) {
    var impAttr = ['x1', 'x2', 'y1', 'y2', 'member_length', 'width', 'height', 'left', 'top'];
    for (var i in impAttr) {
        this[impAttr[i]] = memberObj[impAttr[i]];
    }
    // this.x1=memberObj.x1;
    // this.y1=memberObj.y1;
    // this.x2=memberObj.x2;
    // this.y2=memberObj.y2;
    // this.member_length=memberObj.member_length;
    // this.width=memberObj.width;
    // this.height=memberObj.height;
    // this.left=memberObj.left;
    // this.top=memberObj.top;
};

Member.prototype.isStartNode=function(nodeObj) {
    if (Math.round(nodeObj.left) == Math.round(this.x1) && Math.round(nodeObj.top) == Math.round(this.y1))
        return true;
    return false;
};

Member.prototype.isEndNode=function(nodeObj) {
    if (Math.round(nodeObj.left) == Math.round(this.x2) && Math.round(nodeObj.top) == Math.round(this.y2))
        return true;
    return false;
};

module.exports=Member;

Member.prototype.setForce=function(x){
    this.force=x;
    var percentMax;
    if(x<0){ //if the force is compressive
        percentMax=-x*100/this.max_compressive;
        if(percentMax>100){ //if the force exceeded compressive tensile force
            this.stroke='hsla(65, 100%, 60%, 1)';
        }
        else{
            this.stroke='hsla(360, '+(percentMax*0.3+70)+'%,50%, 1)';
        }
    }
    else if(x>0){ //if the force is tensile
        percentMax=x*100/this.max_tensile;
        if(percentMax>100){ //if the force exceeded maximum tensile force
            this.stroke='hsla(65, 100%, 60%, 1)';
        }
        else{
            this.stroke='hsla(243, '+(percentMax*0.3+70)+'%,50%, 1)';
        }
    }
    else{
        this.stroke='hsla(243, 0%,50%, 1)';
    }
    this.label=Math.round(x*100)/100;
};

