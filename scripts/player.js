/*******************************************************************************
 * Player Constructor
 */
define(['./constants', './livePoint'], function(Constants, LivePoint){
    function Player(){
        LivePoint.call(this, Constants.canvasWidth/2, Constants.canvasHeight/2,
                   Constants.playerHealth, Constants.meleeDamage, 0, 0);
        this.size = Constants.playerSize;
    }
    Player.prototype = Object.create(LivePoint.prototype);
    Player.prototype.getCollisionDirection = function(obsMap){
        var obs = obsMap.findNearestObstacle(this);
        return {
            right: obs.lines.some(function(cur){
                return cur.collides(obj, this.size) &&
                    cur.p.x > obj.x && cur.q.x > obj.x &&
                    !corner(cur, obj);
            }),
            left: obs.lines.some(function(cur){
                return cur.collides(obj, this.size) &&
                    cur.p.x < obj.x && cur.q.x < obj.x &&
                    !corner(cur, obj);
            }),
            top: obs.lines.some(function(cur){
                return cur.collides(obj, this.size) &&
                    cur.p.y < obj.y && cur.q.y < obj.y &&
                    !corner(cur, obj);
            }),
            bottom: obs.lines.some(function(cur){
                return cur.collides(obj, this.size) &&
                    cur.p.y > obj.y && cur.q.y > obj.y &&
                    !corner(cur, obj);
            })
        };
    };
    return Player;
});
