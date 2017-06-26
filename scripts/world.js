/*******************************************************************************
 * World Movement
 */
define(['./constants', './geometry'], function(Constants, Geometry){
    function World(){
        this.x = 0;
        this.y = 0;
        this.dx = 0;
        this.dy = 0;
    };
    World.prototype.move = function(keyMap, obsMap, player){
        var dir = obsMap.getCollisionDirection(player, Constants.playerSize);
        var raw_x = keyMap.getHorizontalDir();
        var raw_y = keyMap.getVerticalDir();
        this.dx = Geometry.normalizeX(raw_x, raw_y, Constants.playerSpeed);
        this.dy = Geometry.normalizeY(raw_x, raw_y, Constants.playerSpeed);
        if((dir.right && this.dx < 0) || (dir.left && this.dx > 0))
            this.dx = 0;
        if((dir.top && this.dy > 0) || (dir.bottom && this.dy < 0))
            this.dy = 0;
        this.x += this.dx;
        this.y += this.dy;
        if(this.x > 0)
            this.x -= Constants.gridSize;
        if(this.x < -Constants.gridSize)
            this.x += Constants.gridSize;
        if(this.y > 0)
            this.y -= Constants.hexGrid;
        if(this.y < -Constants.hexGrid)
            this.y += Constants.hexGrid;
    };
    return World;
});
