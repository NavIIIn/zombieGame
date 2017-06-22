
/*******************************************************************************
 * World Movement
 */
define(['./constants', './geometry'], function(Constants, Geometry){
    function World(){
        this.x = 0;
        this.y = 0;
        this.dx = 0;
        this.dy = 0;
        this.copySpeed = function(other){
            this.dx = other.dx;
            this.dy = other.dy;
        };
        this.move = function(){
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
    };
    return World;
});
