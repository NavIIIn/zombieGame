/*******************************************************************************
 * Bullet Constructor
 */
define(['./constants', './point', './livePoint', './Geometry'], function(Constants, Point, LivePoint, Geometry){
    function Bullet(x, y){
        var centerX = Constants.canvasWidth/2;
        var centerY = Constants.canvasHeight/2;
        var xcomp   = x - centerX;
        var ycomp   = y - centerY;
        LivePoint.call(this, centerX, centerY,
                       1, Constants.bulletDamage,
                       Geometry.normalizeX(xcomp, ycomp, Constants.bulletSpeed),
                       Geometry.normalizeY(xcomp, ycomp, Constants.bulletSpeed));
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
