/*******************************************************************************
 * Obstacle Inserter Object
 *   - add(direction): adds a row of walls in that direction
 *   - getLines: gets lines from all obstacles
 *   - adjust: moves all obstacles x to the right and y down
 *   - collidesAll: returns array of fn operated on objs where collisions occur
 */
define(['./constants', './point', './line'], function(Constants, Point, Line){
    function obstacle(lines, corners){
        this.corners = corners; // edges that can be walked around
        this.lines = lines;
        this.x = 0;
        this.y = 0;
        this.adjust = function(x, y){
            for(var i = 0; i < lines.length; i++)
                this.lines[i].adjust(x,y);
            for(i = 0; i < corners.length; i++)
                corners[i].adjust(x,y);
            this.x +=x;
            this.y +=y;
            return this;
        };
        this.copy = function(){
            var newLines = [];
            var newCorners = [];
            this.lines.forEach(function(v, i, arr){
                newLines.push(Line.copy(v));
            });
            this.corners.forEach(function(v, i, arr){
                newCorners.push(Point.copy(v));
            });
            return new obstacle(newLines, newCorners);
        };
    }
    function adjustCorner(corner, movedir){
        var moveamt = Constants.zombieSize;
        var result = Point.Point(corner.x, corner.y);
        if(movedir.includes('n'))
            result.y -= moveamt;
        if(movedir.includes('s'))
            result.y += moveamt;
        if(movedir.includes('w'))
            result.x -= moveamt;
        if(movedir.includes('e'))
            result.x += moveamt;
        return result;
    }
    function adjustCorners(corners, movedirs){
        var results = [];
        for(i = corners.length; i--; ){
            results.push(adjustCorner(corners[i], movedirs[i]));
        }
        return results;
    }
    // returns a list of potential obstacles
    function getObstacles(){
        var wallLength = Constants.gridSize/2;

        var middle = Point.Point(wallLength, wallLength);
        var topEdge = Point.Point(wallLength, 0);
        var bottomEdge = Point.Point(wallLength, wallLength*2);
        var leftEdge = Point.Point(0, wallLength);
        var rightEdge = Point.Point(wallLength*2, wallLength);
        var topMid = Point.Point(wallLength, wallLength/2);
        var bottomMid = Point.Point(wallLength, wallLength*3/2);
        var leftMid = Point.Point(wallLength/2, wallLength);
        var rightMid = Point.Point(wallLength*3/2, wallLength);

        // corners
        var tl = Point.Point(0, 0);
        var tr = Point.Point(wallLength*2, 0);
        var bl = Point.Point(0, wallLength*2);
        var br = Point.Point(wallLength*2, wallLength*2);

        // lines spanning 2 wall lengths
        var lineV2 = Line.Line(topEdge, bottomEdge);
        var lineH2 = Line.Line(leftEdge, rightEdge);
        //  lines spanning 1 wall length
        var lineV1a = Line.Line(topEdge, middle);
        var lineV1b = Line.Line(middle, bottomEdge);
        var lineH1a = Line.Line(leftEdge, middle);
        var lineH1b = Line.Line(middle, rightEdge);
        // lines spanning half a wall length
        var lineV12a = Line.Line(topEdge, topMid);
        var lineV12b = Line.Line(topMid, middle);
        var lineV12c = Line.Line(middle, bottomMid);
        var lineV12d = Line.Line(bottomMid, bottomEdge);
        var lineH12a = Line.Line(leftEdge, leftMid);
        var lineH12b = Line.Line(leftMid, middle);
        var lineH12c = Line.Line(middle, rightMid);
        var lineH12d = Line.Line(rightMid, rightEdge);
        // lines spanning 3/2 a wall length
        var lineV32a = Line.Line(topEdge, bottomMid);
        var lineV32b = Line.Line(topMid, bottomEdge);
        var lineH32a = Line.Line(leftEdge, rightMid);
        var lineH32b = Line.Line(leftMid, rightEdge);

        var c_a = adjustCorners([topEdge, topEdge, bottomMid, bottomMid], ['nw', 'ne', 'sw', 'se']);
        var c_b = adjustCorners([topMid, topMid, bottomEdge, bottomEdge], ['nw', 'ne', 'sw', 'se']);
        var c_c = adjustCorners([leftEdge, leftEdge, rightMid, rightMid], ['nw', 'sw', 'ne', 'se']);
        var c_d = adjustCorners([leftMid, leftMid, rightEdge, rightEdge], ['nw', 'sw', 'ne', 'se']);
        var c_e = adjustCorners([topEdge, topEdge, leftMid, leftMid, rightMid, rightMid], ['nw', 'ne', 'nw', 'sw', 'ne', 'se']);
        var c_f = adjustCorners([bottomEdge, bottomEdge, leftMid, leftMid, rightMid, rightMid], ['sw', 'se', 'nw', 'sw', 'ne', 'se']);
        var c_g = adjustCorners([leftEdge, leftEdge, topMid, topMid, bottomMid, bottomMid], ['nw', 'sw', 'nw', 'ne', 'sw', 'se']);
        var c_h = adjustCorners([rightEdge, rightEdge, topMid, topMid, bottomMid, bottomMid], ['ne', 'se', 'nw', 'ne', 'sw', 'se']);

        allCorners = [tl, tr, bl, br];

        // used for reference do not alter
        return [
            new obstacle([lineV32a],c_a),
            new obstacle([lineV32b],c_b),
            new obstacle([lineH32a],c_c),
            new obstacle([lineH32b],c_d),
            new obstacle([lineV1a, lineH12b, lineH12c], c_e),
            new obstacle([lineV1b, lineH12b, lineH12c], c_f),
            new obstacle([lineH1a, lineV12b, lineV12c], c_g),
            new obstacle([lineH1b, lineV12b, lineV12c], c_h)
        ];

    }

    function getLastGrid(){
        var lastY = obsMap.length - 1;
        var lastX = obsMap[lastY].length - 1;
        return obsMap[lastY][lastX];
    }

    function collidesLine(obj, ln, size){
        var inX = obj.x > ln.p.x - size && obj.x < ln.q.x + size
            || obj.x > ln.q.x - size && obj.x < ln.p.x + size;
        var inY = obj.y > ln.p.y - size && obj.y < ln.q.y + size 
            || obj.y > ln.q.y - size && obj.y < ln.p.y + size;
            
        return inY && inX;
    }

    function findColGrid(obj){
        var gridX = 0;
        var gridY = 0;

        while(obsMap[gridY] && obj.y > obsMap[gridY][gridX].y)
            gridY++;
        while(obsMap[gridY-1][gridX] && obj.x > obsMap[gridY-1][gridX].x)
            gridX++;
        return {x: gridX - 1, y: gridY - 1};
    }

    function collides(obj, size){
        var lastSpace = getLastGrid();
        var lastX = lastSpace.x + Constants.gridSize;
        var lastY = lastSpace.y + Constants.gridSize;

        // off grid
        if(obj.x < obsMap[0][0].x || obj.y < obsMap[0][0].y ||
           obj.x > lastX || obj.y > lastY)
            return false;

        var grid = findColGrid(obj);

        return obsMap[grid.y][grid.x].lines.reduce(function(total, cur){
            return total || collidesLine(obj, cur, size);
        }, false);
    }

    function corner(ln, obj){
        var lr = ln.p.x > obj.x && ln.q.x > obj.x
            || ln.p.x < obj.x && ln.q.x < obj.x;
        var tb = ln.p.y > obj.y && ln.q.y > obj.y
            || ln.q.y < obj.y && ln.q.y < obj.y;
        return lr && tb;
    }

    function colDir(obj, size){
        var grid = findColGrid(obj);
        return {
            right: obsMap[grid.y][grid.x].lines.some(function(cur){
                return collidesLine(obj, cur, size)
                    && cur.p.x > obj.x && cur.q.x > obj.x
                    && !corner(cur, obj);
            }),
            left: obsMap[grid.y][grid.x].lines.some(function(cur){
                return collidesLine(obj, cur, size)
                    && cur.p.x < obj.x && cur.q.x < obj.x
                    && !corner(cur, obj);
            }),
            top: obsMap[grid.y][grid.x].lines.some(function(cur){
                return collidesLine(obj, cur, size)
                    && cur.p.y < obj.y && cur.q.y < obj.y
                    && !corner(cur, obj);
            }),
            bottom: obsMap[grid.y][grid.x].lines.some(function(cur){
                return collidesLine(obj, cur, size)
                    && cur.p.y > obj.y && cur.q.y > obj.y
                    && !corner(cur, obj);
            })
        };
    }

    var obs = getObstacles();

    function getRandomObs(){
        var rand = Math.floor(Math.random()*obs.length);
        return obs[rand].copy();
    }

    function duplicateCorners(obsA, obsB){
        var dupIndexA;
        var dupIndexB;
        var foundDup = false;
        obsA.corners.forEach(function(cornerA, indexA, arrA){
            obsB.corners.forEach(function(cornerB, indexB, arrB){
                if(Math.abs(cornerA.x - cornerB.x) < 0.01
                   && Math.abs(cornerA.y - cornerB.y) < 0.01){
                    dupIndexA = indexA;
                    dupIndexB = indexB;
                    foundDup = true;
                }
            });
        });
        if(foundDup){
            obsA.corners.splice(dupIndexA, 1);
            obsB.corners.splice(dupIndexB, 1);
        }
    }

    function removeAdjacentDuplicates(obsMap, i, j){
        if(i > 0)
            duplicateCorners(obsMap[i][j], obsMap[i-1][j]);
        if(i < obsMap.length-1)
            duplicateCorners(obsMap[i][j], obsMap[i+1][j]);
        if(j > 0)
            duplicateCorners(obsMap[i][j], obsMap[i][j-1]);
        if(j < obsMap[i].length-1)
            duplicateCorners(obsMap[i][j], obsMap[i][j+1]);
    }

    function removeAllDuplicateCorners(obsMap){
        for(i = 0; i < obsMap.length; i++)
            for(j = 0; j < obsMap[0].length; j++)
                removeAdjacentDuplicates(obsMap, i, j);
    }

    var obsMap = [];
    for(var i = 0; i < Constants.canvasHeight + Constants.gridSize; i+=Constants.gridSize){
        var newWall = [];
        for(var j = 0; j < Constants.canvasWidth + Constants.gridSize; j+=Constants.gridSize){
            newWall.push(getRandomObs().adjust(j, i));
        }
        obsMap.push(newWall);
    }
    
    removeAllDuplicateCorners(obsMap);
    

    return {
        addLeft: function(){
            var adjX = obsMap[0][0].x - Constants.gridSize;
            var adjY = obsMap[0][0].y;
            for(var i = 0; i < obsMap.length; i++){
                obsMap[i].unshift(getRandomObs().adjust(adjX, adjY));
                obsMap[i].pop();
                adjY += Constants.gridSize;
                removeAdjacentDuplicates(obsMap, i, 0);
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
                removeAdjacentDuplicates(obsMap, i, obsMap[0].length-1);
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
            for(var i = 0; i < obsMap[0].length; i++)
                removeAdjacentDuplicates(obsMap, 0, i);
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
            for(var i = 0; i < obsMap[0].length; i++)
                removeAdjacentDuplicates(obsMap, ylen-1, i);
        },
        getObstacles: function(){
            return obsMap.reduce(function(arr, cur){
                    return arr.concat(cur);
                }, []);
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
        },
        collidesAll: function(objs, size, fn){
            size = size+Constants.wallWidth
            return objs.map(function(cur, i, arr){
                if(collides(cur, size))
                    return fn(cur);
                else
                    return cur;
            });
        },
        getCollisionDirection: function(obj, size){
            size = size+Constants.wallWidth
            return colDir(obj, size);
        }
    };
});
