/*******************************************************************************
 * Hash Constructor
 * index represents grid number increasing from left to right
 * last index contains points off the grid
 */
define(['./constants'], function(Constants){
    var gridX = Constants.canvasWidth/4;
    var gridY = Constants.canvasHeight/4;

    function removeDuplicates(result, cur){
        if(!result.includes(cur))
            result.push(cur);
        return result;
    }

    function Table(items){
        this.arr = [];
        this.length = 17;
        for(var i = this.length; i--;)
            this.arr.push([]);
        if(items) // initial values given
            for(var i = items.length; i--;)
                this.insert(items[i]);
    }
    Table.prototype.getIndex = function(x, y){
        var x = Math.floor(x/gridX);
        var y = Math.floor(y/gridY);
        if(x < 0 || x > 3 || y < 0 || y > 3)
            return this.length-1;
        else
            return y*4+x;
    };
    Table.prototype.getIndices = function(pt){
        var borders = pt.getBorders();
        var indices = [this.getIndex(borders.left, borders.top),
                       this.getIndex(borders.left, borders.bottom),
                       this.getIndex(borders.right, borders.top),
                       this.getIndex(borders.right, borders.bottom)];
        return indices.reduce(removeDuplicates, []);
    };
    Table.prototype.insert = function(pt){
        var indices = this.getIndices(pt);
        for(var i = indices.length; i--;)
            this.arr[indices[i]].push(pt);
    };
    Table.prototype.getCollidingItem = function(pt, rad){
        return this.arr[this.getIndex(pt.x, pt.y)].find(function(v){
            return v.isNear(pt, rad);
        });
    };
    Table.prototype.getCollidingItems = function(pt, rad){
        return this.arr[this.getIndex(pt.x, pt.y)].filter(function(v){
            return v.isNear(pt, rad);
        });
    };
    return Table;
});
