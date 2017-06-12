/*******************************************************************************
 * Line object
 */
define(['./constants', './geometry'], function(Constants, Geometry){
    function Line(p, q){
        this.p = p;
        this.q = q;
    }
    Line.prototype.copy = function(){
        return new Line(this.p.copy(), this.q.copy());
    };
    Line.prototype.intersects = function(a, b){
        return Geometry.intersects(a, b, this.p, this.q);
    };
    Line.prototype.adjust = function(dx, dy){
        this.p.adjust(dx, dy);
        this.q.adjust(dx, dy);
    };
    Line.prototype.collides = function(pt, size){
        var inX = pt.x > this.p.x - size && pt.x < this.q.x + size
            || pt.x > this.q.x - size && pt.x < this.p.x + size;
        var inY = pt.y > this.p.y - size && pt.y < this.q.y + size 
            || pt.y > this.q.y - size && pt.y < this.p.y + size;
            
        return inY && inX;
    };
    return Line;
});
