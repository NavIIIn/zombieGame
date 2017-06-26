/*******************************************************************************
 * Player Object
 */
define(['./constants', './livePoint'], function(Constants, LivePoint){
    function Player(){
        LivePoint.call(this, Constants.canvasWidth/2, Constants.canvasHeight/2,
                   Constants.playerHealth, Constants.meleeDamage, 0, 0);
        this.size = Constants.playerSize;
    }
    Player.prototype = Object.create(LivePoint.prototype);
    return Player;
});
