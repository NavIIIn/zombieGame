/*******************************************************************************
 * Live Point Object
 *   - hit: deals damage to point from other
 *   - dead: returns whether health is below 0
 *   - inSquare: returns whether point is within dimensions
 *   - move: calculates movement for one frame
 */
define(['./constants', './point'], function(Constants, Point){
    function LivePoint(x, y, health, damage, dx, dy){
        Point.call(this, x, y);
        this.health = health;
        this.damage = damage;
        this.dx = dx;
        this.dy = dy;
    }
    LivePoint.prototype = Object.create(Point.prototype);
    LivePoint.prototype.hit = function(other){
        this.health -= other.damage;
    };
    LivePoint.prototype.dead = function(){
        return this.health <= 0;
    };
    LivePoint.prototype.inSquare = function(xmin, xmax, ymin, ymax){
        return this.x > xmin && this.x < xmax
            && this.y > ymin && this.y < ymax;
    };
    LivePoint.prototype.move = function(){
        this.adjust(this.dx, this.dy);
    };
    return LivePoint;
});
