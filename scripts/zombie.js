/*******************************************************************************
 * Zombie Constructor
 */
define(['./constants', './mathStuff'], function(Constants, Maths){
    var cWidth = Constants.canvasWidth; // shorter name
    var cHeight = Constants.canvasHeight;
    var xEdgeDist = Math.random()*cWidth/2; // random distance
    var yEdgeDist = Math.random()*cHeight/2;

    return function(){
        this.health   = Constants.zombieHealth;
        this.damage   = Constants.zombieDamage;
        this.found    = false;

        this.x  = Maths.flipCoin() ? xEdgeDist-cWidth/4 : xEdgeDist+cWidth*3/4;
        this.y  = Maths.flipCoin() ? yEdgeDist-cHeight/4 : yEdgeDist+cHeight*3/4;
        this.dx = 0;
        this.dy = 0;
    }
});