/*******************************************************************************
 * Zombie Constructor
 */
define(['./constants', './livePoint', './geometry'], function(Constants, LivePoint, Geometry){
    var cWidth = Constants.canvasWidth; // shorter name
    var cHeight = Constants.canvasHeight;
    var xEdgeDist = Math.random()*cWidth/2; // random distance
    var yEdgeDist = Math.random()*cHeight/2;

    function Zombie(){
        LivePoint.call(this,
                       Geometry.flipCoin() ? xEdgeDist-cWidth/4 : xEdgeDist+cWidth*3/4,
                       Geometry.flipCoin() ? yEdgeDist-cHeight/4 : yEdgeDist+cHeight*3/4,
                       Constants.zombieHealth, Constants.zombieDamage, 0, 0);
        this.found    = false;
        this.path     = [];
        this.counter  = 20;
    }
    Zombie.prototype = Object.create(LivePoint.prototype);
    Zombie.prototype.inBounds = function(){
        return this.inSquare(-cWidth, 2*cWidth, -cHeight, 2*cHeight);
    };
    Zombie.prototype.getBorders = function(){
        return {top: this.y-Constants.zombieSize,
                bottom: this.y+Constants.zombieSize,
                left: this.x-Constants.zombieSize,
                right: this.x+Constants.zombieSize};
    };
    Zombie.prototype.adjustWorld = function(dx, dy){
        this.x += dx;
        this.y += dy;
        for(var i = this.path.length; i--; ){
            this.path[i].x += dx;
            this.path[i].y += dy;
        }
    };
    return Zombie;
});
