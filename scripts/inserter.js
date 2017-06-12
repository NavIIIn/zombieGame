/*******************************************************************************
 * Obstacle Inserter Object
 *   - add(direction): adds a row of walls in that direction
 *   - getLines: gets lines from all obstacles
 *   - adjust: moves all obstacles x to the right and y down
 *   - collidesAll: returns array of fn operated on objs where collisions occur
 */
define(['./constants', './obstacleFactory', './obstacleMap'], function(Constants, ObstacleFactory, ObstacleMap){
    var obsMap2 = new ObstacleMap();
    
    return {
        addLeft: function(){
            obsMap2.addLeft();
        },
        addRight: function(){
            obsMap2.addRight();
        },
        addTop: function(){
            obsMap2.addTop();
        },
        addBottom: function(){
            obsMap2.addBottom();
        },
        getObstacles: function(){
            return obsMap2.getObstacles();
        },
        getCorners: function(){
            return obsMap2.getCorners();
        },
        getEdges: function(){
            return obsMap2.getEdges();
        },
        getLines: function(){
            return obsMap2.getLines();
        },
        adjust: function(x, y){
            obsMap2.adjust(x, y);
        },
        collidesAll: function(objs, size, fn){
            return objs.map(function(cur, i, arr){
                if(obsMap2.collides(cur, size))
                    return fn(cur);
                else
                    return cur;
            });
        },
        getCollisionDirection: function(obj, size){
            return obsMap2.getCollisionDirection(obj, size);
        }
    };
});
