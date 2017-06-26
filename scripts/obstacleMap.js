/*******************************************************************************
 * Obstacle Map
 */
define(['./constants', './geometry', './obstacleFactory', './2dArray'], function(Constants, Geometry, ObstacleFactory, Arr2d){
    var gridSize = Constants.gridSize;
    var obsFactory = new ObstacleFactory();
    function ObstacleMap(){
        this.x = 0;
        this.y = 0;
        var width = Math.ceil(Constants.canvasWidth/gridSize) + 1;
        var height = Math.ceil(Constants.canvasHeight/gridSize) + 1;
        var gen = obsFactory.get2dGenerator(0, 0, gridSize, gridSize, width, height);
        this.arr = new Arr2d(width, height);
        this.arr.fill(gen);
        this.removeAllDuplicateCorners();
    }
    ObstacleMap.prototype.addLeft = function(){
        var adjX = this.arr.get(0,0).x - gridSize;
        var adjY = this.arr.get(0,0).y;
        var obsGen = obsFactory.getGenerator(adjX, adjY, 0, gridSize, this.arr.height);
        this.arr.addLeft(obsGen);
        for(var i = this.arr.height; i--;)
            this.removeAdjacentDuplicates(0, i);
    };
    ObstacleMap.prototype.addRight = function(){
        var startObs = this.arr.get(this.arr.width-1, 0);
        var adjX = startObs.x + gridSize;
        var adjY = startObs.y;
        var obsGen = obsFactory.getGenerator(adjX, adjY, 0, gridSize, this.arr.height);
        this.arr.addRight(obsGen);
        for(var i = this.arr.height; i--;)
            this.removeAdjacentDuplicates(this.arr.width-1, i);
    };
    ObstacleMap.prototype.addTop = function(){
        var adjX = this.arr.get(0,0).x;
        var adjY = this.arr.get(0,0).y - gridSize;
        var obsGen = obsFactory.getGenerator(adjX, adjY, gridSize, 0, this.arr.width);
        this.arr.addTop(obsGen);
        for(var i = this.arr.width; i--;)
            this.removeAdjacentDuplicates(i, 0);
    };
    ObstacleMap.prototype.addBottom = function(){
        var startObs = this.arr.get(0, this.arr.height-1);
        var adjX = startObs.x;
        var adjY = startObs.y + gridSize;
        var obsGen = obsFactory.getGenerator(adjX, adjY, gridSize, 0, this.arr.width);
        this.arr.addBottom(obsGen);
        for(var i = this.arr.width; i--;)
            this.removeAdjacentDuplicates(i, this.arr.height-1);
    };
    ObstacleMap.prototype.addWall = function(){
        if(this.x > 0){
            this.x -= Constants.gridSize;
            this.addLeft();
        }
        else if(this.x <= -Constants.gridSize){
            this.x += Constants.gridSize;
            this.addRight();
        }
        else if(this.y > 0){
            this.y -= Constants.gridSize;
            this.addTop();
        }
        else if(this.y <= -Constants.gridSize){
            this.y += Constants.gridSize;
            this.addBottom();
        }
    };
    ObstacleMap.prototype.getObstacles = function(){
        return this.arr.getItems();
    };
    ObstacleMap.prototype.getLines = function(){
        return this.getObstacles().reduce(function(acc, cur){
            return acc.concat(cur.lines.slice());
        }, []);
    };
    ObstacleMap.prototype.getEdges = function(){
        return this.getObstacles().reduce(function(acc, cur){
            return acc.concat(cur.edges);
        }, []);
    };
    ObstacleMap.prototype.getCorners = function(){
        return this.getObstacles().reduce(function(acc, cur){
            return acc.concat(cur.getCorners());
        }, []);
    };
    ObstacleMap.prototype.removeAdjacentDuplicates = function(i, j){
        var obs = this.arr.get(i, j);
        if(i > 0)
            obs.removeDuplicateEdges(this.arr.get(i-1, j));
        if(i < this.arr.width-1)
            obs.removeDuplicateEdges(this.arr.get(i+1, j));
        if(j > 0)
            obs.removeDuplicateEdges(this.arr.get(i, j-1));
        if(j < this.arr.height-1)
            obs.removeDuplicateEdges(this.arr.get(i, j+1));
    };
    ObstacleMap.prototype.removeAllDuplicateCorners = function(){
        for(i = 0; i < this.arr.width; i++)
            for(j = 0; j < this.arr.height; j++)
                this.removeAdjacentDuplicates(i, j);
    };
    ObstacleMap.prototype.adjust = function(dx, dy){
        this.x += dx;
        this.y += dy;
        for(let obs of this.arr)
            obs.adjust(dx, dy);
    };
    ObstacleMap.prototype.findNearestObstacle = function(obj){
        var gridX = Math.floor((obj.x-this.arr.get(0,0).x)/gridSize);
        var gridY = Math.floor((obj.y-this.arr.get(0,0).y)/gridSize);
        if(gridX >= 0 && gridY >= 0 &&
          gridX < this.arr.width && gridY < this.arr.height)
            return this.arr.get(gridX, gridY);
        else
            return this.arr.get(0,0);
    };
    ObstacleMap.prototype.getCollisionDirection = function(obj, size){
        var obs = this.findNearestObstacle(obj);
        return obs.getCollisionDirection(obj, size);
    };
    ObstacleMap.prototype.lineOfSight = function(p1, p2){
        return !this.getLines().some(function(v){
            return v.intersects(p1, p2);
        });
    };
    return ObstacleMap;
});
