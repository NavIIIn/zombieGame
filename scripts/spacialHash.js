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
    function arrayFactory(len){
        var result = [];
        while(result.length < len)
            result.push([]);
        return result;
    }

    function Table(items){
        this.length = 17;
        this.arr = arrayFactory(this.length);
        if(items) // initial values given
            for(let cur of items)
                this.insert(cur);
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
        for(let i of indices)
            this.arr[i].push(pt);
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
    Table.prototype[Symbol.iterator] = function* (){
        var seen = [];
        for(let grid of this.arr)
            for(let cur of grid)
                if(!seen.includes(cur)){
                    seen.push(cur);
                    yield cur;
                }
    };
    Table.prototype.getSize = function(){
        var count = 0;
        for(let grid of this.arr)
            count += grid.length;
        return count;
    };
    Table.prototype.filter = function(fn){
        for(let i = this.arr.length; i--;)
            this.arr[i] = this.arr[i].filter(fn);
        //for(let grid of this.arr){
            //grid = grid.filter(fn);
        //}
    };
    Table.prototype.getArray = function(){
        var result = [];
        for(let cur of this)
            result.push(cur);
        return result;
    };
    Table.prototype.update = function(){
        var tmp = this.getArray();
        this.arr = arrayFactory(this.length);
        for(let cur of tmp)
            this.insert(cur);
    };
            
    return Table;
});
