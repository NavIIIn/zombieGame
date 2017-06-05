/*******************************************************************************
 * Bullet Constructor
 */
define(['./constants', './mathStuff'], function(Constants, Maths){
    return function(x, y){
        this.health = 1;
        this.damage = Constants.bulletDamage;
        this.x      = Constants.canvasWidth/2;
        this.y      = Constants.canvasHeight/2;
        var xcomp   = x - this.x;
        var ycomp   = y - this.y;
        this.dx     = Constants.bulletSpeed*xcomp*Maths.normalize(xcomp, ycomp);
        this.dy     = Constants.bulletSpeed*ycomp*Maths.normalize(xcomp, ycomp);
    }
});
