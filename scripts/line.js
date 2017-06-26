/*******************************************************************************
 * Line Object
 *   - p/q: endpoints
 *   - intersects: returns whether path from a to b intersects line
 *   - adjust: moves line on screen in given direction
 *   - collides: returns true if pt is within size distance of line
 *   - getCollisionDirection: returns array of booleans associated with
 *       collison direction
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
        var inLine = inY && inX;
        
        var lr = this.p.x > pt.x && this.q.x > pt.x
            || this.p.x < pt.x && this.q.x < pt.x;
        var tb = this.p.y > pt.y && this.q.y > pt.y
            || this.q.y < pt.y && this.q.y < pt.y;
        var onCorner = lr && tb;

        return inLine && !onCorner;
    };
    Line.prototype.getCollisionDirection = function(pt, size){
        var dir = {right: false, left: false, top: false, bottom: false };
        if(this.collides(pt, size)){
            dir.right  = this.p.x > pt.x && this.q.x > pt.x;
            dir.left   = this.p.x < pt.x && this.q.x < pt.x;
            dir.top    = this.p.y < pt.y && this.q.y < pt.y;
            dir.bottom = this.p.y > pt.y && this.q.y > pt.y;
        }
        return dir;
    };
    return Line;
});
