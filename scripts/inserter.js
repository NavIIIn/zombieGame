/*******************************************************************************
 * Obstacle Inserter Object
 *   - add(direction): adds a row of walls in that direction
 *   - getLines: gets lines from all obstacles
 *   - adjust: moves all obstacles x to the right and y down
 */
define(['./constants'], function(Constants){
    function point(x, y){
        this.x = x;
        this.y = y;
        this.copy = function(){
            return new point(this.x, this.y);
        }
    }
    function line(p, q){
        this.p = p;
        this.q = q;
        this.print = function(){
            console.log('p : ( '+this.p.x+', '+this.p.y+' )');
            console.log('q : ( '+this.q.x+', '+this.q.y+' )');
        }
        this.copy = function(){
            return new line(this.p.copy(), this.q.copy());
        }
    }

    function obstacle(lines, corners){
        this.corners = corners; // edges that can be walked around
        this.lines = lines;
        this.x = 0;
        this.y = 0;
        this.adjust = function(x, y){
            for(var i = 0; i < lines.length; i++){
                this.lines[i].p.x += x;
                this.lines[i].p.y += y;
                this.lines[i].q.x += x;
                this.lines[i].q.y += y;
            }
            for(i = 0; i < corners.length; i++){
                corners[i].x += x;
                corners[i].y += y;
            }
            this.x +=x;
            this.y +=y;
            return this;
        }
        this.copy = function(){
            var newLines = [];
            var newCorners = [];
            this.lines.forEach(function(v, i, arr){
                newLines.push(v.copy());
            });
            this.corners.forEach(function(v, i, arr){
                newCorners.push(v.copy());
            });
            return new obstacle(newLines, newCorners);
        }
    }

    // returns a list of potential obstacles
    function getObstacles(){
        var wallLength = Constants.gridSize/2;

        var middle = new point(wallLength, wallLength);
        var topEdge = new point(wallLength, 0);
        var bottomEdge = new point(wallLength, wallLength*2);
        var leftEdge = new point(0, wallLength);
        var rightEdge = new point(wallLength*2, wallLength);
        var topMid = new point(wallLength, wallLength/2);
        var bottomMid = new point(wallLength, wallLength*3/2);
        var leftMid = new point(wallLength/2, wallLength);
        var rightMid = new point(wallLength*3/2, wallLength);

        // lines spanning 2 wall lengths
        var lineV2 = new line(topEdge, bottomEdge);
        var lineH2 = new line(leftEdge, rightEdge);
        //  lines spanning 1 wall length
        var lineV1a = new line(topEdge, middle);
        var lineV1b = new line(middle, bottomEdge);
        var lineH1a = new line(leftEdge, middle);
        var lineH1b = new line(middle, rightEdge);
        // lines spanning half a wall length
        var lineV12a = new line(topEdge, topMid);
        var lineV12b = new line(topMid, middle);
        var lineV12c = new line(middle, bottomMid);
        var lineV12d = new line(bottomMid, bottomEdge);
        var lineH12a = new line(leftEdge, leftMid);
        var lineH12b = new line(leftMid, middle);
        var lineH12c = new line(middle, rightMid);
        var lineH12d = new line(rightMid, rightEdge);
        // lines spanning 3/2 a wall length
        var lineV32a = new line(topEdge, bottomMid);
        var lineV32b = new line(topMid, bottomEdge);
        var lineH32a = new line(leftEdge, rightMid);
        var lineH32b = new line(leftMid, rightEdge);

        // used for reference do not alter
        return [
            new obstacle([lineV32a],[topEdge, bottomMid]),
            new obstacle([lineV32b],[topMid, bottomEdge]),
            new obstacle([lineH32a],[leftEdge, rightMid]),
            new obstacle([lineH32b],[leftMid, rightEdge]),
            new obstacle([lineV1a, lineH12b, lineH12c], [topEdge, leftMid, rightMid]),
            new obstacle([lineV1b, lineH12b, lineH12c], [bottomEdge, leftMid, rightMid]),
            new obstacle([lineH1a, lineV12b, lineV12c], [leftEdge, topMid, bottomMid]),
            new obstacle([lineH1b, lineV12b, lineV12c], [rightEdge, topMid, bottomMid])
        ];

    }
    var obs = getObstacles();

    function getRandomObs(){
        var rand = Math.floor(Math.random()*obs.length);
        return obs[rand].copy();
    }

    var obsMap = [];
    for(var i = 0; i < Constants.canvasHeight + Constants.gridSize; i+=Constants.gridSize){
        var newWall = [];
        for(var j = 0; j < Constants.canvasWidth + Constants.gridSize; j+=Constants.gridSize){
            newWall.push(getRandomObs().adjust(j, i));
        }
        obsMap.push(newWall);
    }

    return {
        addLeft: function(){
            var adjX = obsMap[0][0].x - Constants.gridSize;
            var adjY = obsMap[0][0].y;
            for(var i = 0; i < obsMap.length; i++){
                obsMap[i].unshift(getRandomObs().adjust(adjX, adjY));
                obsMap[i].pop();
                adjY += Constants.gridSize;
            }
        },
        addRight: function(){
            var xlen = obsMap[0].length;
            var adjX = obsMap[0][xlen-1].x + Constants.gridSize;
            var adjY = obsMap[0][xlen-1].y;
            for(var i = 0; i < obsMap.length; i++){
                obsMap[i].push(getRandomObs().adjust(adjX, adjY));
                obsMap[i].shift();
                adjY += Constants.gridSize;
            }
        },
        addTop: function(){
            var adjX = obsMap[0][0].x;
            var adjY = obsMap[0][0].y - Constants.gridSize;
            var newWall = [];
            for(var i = 0; i < obsMap[0].length; i++){
                newWall.push(getRandomObs().adjust(adjX, adjY));
                adjX += Constants.gridSize;
            }
            obsMap.unshift(newWall);
            obsMap.pop();
        },
        addBottom: function(){
            var ylen = obsMap.length;
            var adjX = obsMap[ylen-1][0].x;
            var adjY = obsMap[ylen-1][0].y + Constants.gridSize;
            var newWall = [];
            for(var i = 0; i < obsMap[0].length; i++){
                newWall.push(getRandomObs().adjust(adjX, adjY));
                adjX += Constants.gridSize;
            }
            obsMap.push(newWall);
            obsMap.shift();
        },
        getLines: function(){
            var lines = [];
            obsMap.forEach(function(row, j, m){
                row.forEach(function(v, i, r){
                    lines = lines.concat(v.lines.slice());
                });
            });
            return lines;
        },
        adjust: function(x, y){
            obsMap.forEach(function(row, j, m){
                row.forEach(function(v, i, r){
                    v.adjust(x, y);
                });
            });
        }
    };
});
