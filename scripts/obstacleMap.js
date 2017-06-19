/*******************************************************************************
 * Obstacle Map
 */
define(['./constants', './geometry', './obstacleFactory'], function(Constants, Geometry, ObstacleFactory){
    var gridSize = Constants.gridSize;
    var obsFactory = new ObstacleFactory();
    function ObstacleMap(){
        this.arr = [];
        this.x = 0;
        this.y = 0;
        this.dx = 0;
        this.dy = 0;
        var newWall;
        var totalHeight = Constants.canvasHeight + gridSize;
        var totalWidth = Constants.canvasWidth + gridSize;
        for(var i = 0; i < totalHeight; i+=gridSize){
            newWall = [];
            for(var j = 0; j < totalWidth; j+=gridSize){
                newWall.push(obsFactory.getRandomObs(j, i));
            }
            this.arr.push(newWall);
        }
        this.removeAllDuplicateCorners();
    }
    ObstacleMap.prototype.addLeft = function(){
        var adjX = this.arr[0][0].x - gridSize;
        var adjY = this.arr[0][0].y;
        for(var i = 0; i < this.arr.length; i++){
            this.arr[i].unshift(obsFactory.getRandomObs(adjX, adjY));
            this.arr[i].pop();
            adjY += gridSize;
            this.removeAdjacentDuplicates(i, 0);
        }
    };
    ObstacleMap.prototype.addRight = function(){
        var xlen = this.arr[0].length;
        var adjX = this.arr[0][xlen-1].x + gridSize;
        var adjY = this.arr[0][xlen-1].y;
        for(var i = 0; i < this.arr.length; i++){
            this.arr[i].push(obsFactory.getRandomObs(adjX, adjY));
            this.arr[i].shift();
            adjY += gridSize;
            this.removeAdjacentDuplicates(i, this.arr[0].length-1);
        }
    };
    ObstacleMap.prototype.addTop = function(){
        var adjX = this.arr[0][0].x;
        var adjY = this.arr[0][0].y - gridSize;
        var newWall = [];
        for(var i = 0; i < this.arr[0].length; i++){
            newWall.push(obsFactory.getRandomObs(adjX, adjY));
            adjX += gridSize;
        }
        this.arr.unshift(newWall);
        this.arr.pop();
        for(var i = 0; i < this.arr[0].length; i++)
            this.removeAdjacentDuplicates(0, i);
    };
    ObstacleMap.prototype.addBottom = function(){
        var ylen = this.arr.length;
        var adjX = this.arr[ylen-1][0].x;
        var adjY = this.arr[ylen-1][0].y + gridSize;
        var newWall = [];
        for(var i = 0; i < this.arr[0].length; i++){
            newWall.push(obsFactory.getRandomObs(adjX, adjY));
            adjX += gridSize;
        }
        this.arr.push(newWall);
        this.arr.shift();
        for(var i = 0; i < this.arr[0].length; i++)
            this.removeAdjacentDuplicates(ylen-1, i);
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
        return this.arr.reduce(function(arr, cur){
            return arr.concat(cur);
        }, []);
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
        if(i > 0)
            this.arr[i][j].removeDuplicateEdges(this.arr[i-1][j]);
        if(i < this.arr.length-1)
            this.arr[i][j].removeDuplicateEdges(this.arr[i+1][j]);
        if(j > 0)
            this.arr[i][j].removeDuplicateEdges(this.arr[i][j-1]);
        if(j < this.arr[i].length-1)
            this.arr[i][j].removeDuplicateEdges(this.arr[i][j+1]);
    };
    ObstacleMap.prototype.removeAllDuplicateCorners = function(){
        for(i = 0; i < this.arr.length; i++)
            for(j = 0; j < this.arr[0].length; j++)
                this.removeAdjacentDuplicates(i, j);
    };
    ObstacleMap.prototype.adjust = function(dx, dy){
        this.arr.forEach(function(row, j, m){
            row.forEach(function(v, i, r){
                v.adjust(dx, dy);
            });
        });
    };
    ObstacleMap.prototype.findNearestObstacle = function(obj){
        var gridX = Math.floor((obj.x-this.arr[0][0].x)/gridSize);
        var gridY = Math.floor((obj.y-this.arr[0][0].y)/gridSize);
        if(gridX >= 0 && gridY >= 0 &&
          gridX < this.arr[0].length && gridY < this.arr.length)
            return this.arr[gridY][gridX];
        else
            return this.arr[0][0];
    };
    ObstacleMap.prototype.collides = function(obj, size){
        return this.findNearestObstacle(obj).lines.reduce(function(acc, cur){
            return acc || cur.collides(obj, size);
        }, false);
    };
    ObstacleMap.prototype.move = function(keyMap, player){
        var dir = this.getCollisionDirection(player, Constants.playerSize);
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
        this.adjust(this.dx, this.dy);
    };
    function corner(ln, obj){
        var lr = ln.p.x > obj.x && ln.q.x > obj.x
            || ln.p.x < obj.x && ln.q.x < obj.x;
        var tb = ln.p.y > obj.y && ln.q.y > obj.y
            || ln.q.y < obj.y && ln.q.y < obj.y;
        return lr && tb;
    }
    ObstacleMap.prototype.getCollisionDirection = function(obj, size){
        var obs = this.findNearestObstacle(obj);
        return {
            right: obs.lines.some(function(cur){
                return cur.collides(obj, size) &&
                    cur.p.x > obj.x && cur.q.x > obj.x &&
                    !corner(cur, obj);
            }),
            left: obs.lines.some(function(cur){
                return cur.collides(obj, size) &&
                    cur.p.x < obj.x && cur.q.x < obj.x &&
                    !corner(cur, obj);
            }),
            top: obs.lines.some(function(cur){
                return cur.collides(obj, size) &&
                    cur.p.y < obj.y && cur.q.y < obj.y &&
                    !corner(cur, obj);
            }),
            bottom: obs.lines.some(function(cur){
                return cur.collides(obj, size) &&
                    cur.p.y > obj.y && cur.q.y > obj.y &&
                    !corner(cur, obj);
            })
        };
    };
    ObstacleMap.prototype.lineOfSight = function(p1, p2){
        return !this.getLines().some(function(v){
            return v.intersects(p1, p2);
        });
    };
    return ObstacleMap;
});
