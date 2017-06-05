/*******************************************************************************
 * Player Constructor
 */
define(['./constants'], function(Constants){
    return function(){
        this.health = Constants.playerHealth;
        this.damage = Constants.meleeDamage;
        this.x      = Constants.canvasWidth/2;
        this.y      = Constants.canvasHeight/2;
        this.dx     = 0;
        this.dy     = 0;
    }
});
