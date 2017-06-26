/*******************************************************************************
 * Bullet Object
 *   - inBounds: returns whether onscreen
 *   - adjustWorld: adjust bullet location and fire location
 */
define(['./constants', './point', './livePoint', './Geometry'], function(Constants, Point, LivePoint, Geometry){
    function Bullet(x, y){
        var centerX = Constants.canvasWidth/2;
        var centerY = Constants.canvasHeight/2;
        var dx = Geometry.normalizeX(x-centerX, y-centerY, Constants.bulletSpeed);
        var dy = Geometry.normalizeY(x-centerX, y-centerY, Constants.bulletSpeed);
        LivePoint.call(this, centerX, centerY, 1, Constants.bulletDamage, dx, dy);
        this.firePosition = new Point(centerX, centerY);
    }
    Bullet.prototype = Object.create(LivePoint.prototype);
    Bullet.prototype.size = Constants.bulletSize;
    Bullet.prototype.inBounds = function(){
        return this.inSquare(0, Constants.canvasWidth, 0, Constants.canvasHeight);
    };
    Bullet.prototype.adjustWorld = function(dx, dy){
        this.x += dx;
        this.y += dy;
        this.firePosition.adjust(dx, dy);
    };
    return Bullet;
});
