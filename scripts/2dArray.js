/*******************************************************************************
 * 2D Array
 */
define(['./constants', './geometry'], function(Constants, Geometry){
    function Arr2d(width, height){
        this.width = width;
        this.height = height;
        this.arr = [];
        for(var i = width; i--;)
            this.arr.push([]);
    }
    Arr2d.prototype.fill = function(generator){
        for(var i = 0; i < this.width; i++)
            for(var j = 0; j < this.height; j++)
                this.arr[i].push(generator.next().value);
    };
    Arr2d.prototype.getCornerTL = function(){
        return this.arr[0][0];
    };
    Arr2d.prototype.getCornerTR = function(){
        return this.arr[this.width-1][0];
    };
    Arr2d.prototype.getCornerBL = function(){
        return this.arr[0][this.height-1];
    };
    Arr2d.prototype.getCornerBR = function(){
        return this.arr[this.width-1][this.height-1];
    };
    Arr2d.prototype.addLeft = function(generator){
        var newWall = [];
        for(let item of generator)
            newWall.push(item);
        this.arr.unshift(newWall);
        this.arr.pop();
    };
    Arr2d.prototype.addRight = function(generator){
        var newWall = [];
        for(let item of generator)
            newWall.push(item);
        this.arr.push(newWall);
        this.arr.shift();
    };
    Arr2d.prototype.addTop = function(generator){
        for(let column of this.arr){
            column.unshift(generator.next().value);
            column.pop();
        }
    };
    Arr2d.prototype.addBottom = function(generator){
        for(let column of this.arr){
            column.push(generator.next().value);
            column.shift();
        }
    };
    Arr2d.prototype.getItems = function(){
        return this.arr.reduce(function(arr, cur){
            return arr.concat(cur);
        }, []);
    };
    Arr2d.prototype.get = function(i, j){
        return this.arr[i][j];
    };
    Arr2d.prototype[Symbol.iterator] = function* (){
        for(var i = 0; i < this.width; i++)
            for(var j = 0; j < this.height; j++)
                yield this.arr[i][j];
    };
    return Arr2d;
});
