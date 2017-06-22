/*******************************************************************************
 * Point object
 */
define(['./constants', './geometry'], function(Constants, Geometry){
    function Point(x, y){
        this.x = x;
        this.y = y;
    }
    Point.prototype.copy = function(){
        return new Point(this.x, this.y);
    };
    Point.prototype.distance = function(other){
        return Geometry.distance(this.x, this.y,
                                 other.x, other.y);
    };
    Point.prototype.isNear = function(other, rad){
        if(rad)
            return this.distance(other) < rad;
        else
            return this.distance(other) < Constants.nearVal;
    };
    Point.prototype.equals = function(other){
        return this.x == other.x && this.y == other.y;
    };
    Point.prototype.adjust = function(dx, dy){
        this.x += dx;
        this.y += dy;
    };
    return Point;
});
