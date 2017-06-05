/*******************************************************************************
 * Zombie Agent
 */
define(['./constants', './mathStuff', './theta'], function(Constants, Maths, Theta){
    var px = Constants.canvasWidth/2;
    var py = Constants.canvasHeight/2;
    function extend(line){
        var extLine = line.copy();
        if(line.p.x == line.q.x){
            if(line.p.y < line.q.y){
                extLine.p.y -= Constants.zombieSize;
                extLine.q.y += Constants.zombieSize;
            }
            else{
                extLine.p.y += Constants.zombieSize;
                extLine.q.y -= Constants.zombieSize;
            }
        }
        else{
            if(line.p.x < line.q.y){
                extLine.p.x -= Constants.zombieSize;
                extLine.q.x += Constants.zombieSize;
            }
            else{
                extLine.p.x += Constants.zombieSize;
                extLine.q.x -= Constants.zombieSize;
            }
        }
        return extLine;
    }
    //function getImpedingWalls(walls, zx, zy){
    //    // return an array of walls that intersect the line from (zx, zy)
    //    // to the player location
    //    var p = {x: zx, y: zy};
    //    var q = {x: Constants.canvasWidth/2, y: Constants.canvasHeight/2};
    //    return walls.filter(function(l){
    //        return Maths.intersects(p, q, l.p, l.q);
    //    });
    //};
    //function getClosestPoint(walls, zx, zy){
    //    // return the point on the edge of a wall closes to (zx, xy)
    //    if(walls.length == 0)
    //        return {x: Constants.canvasWidth/2, y: Constants.canvasHeight/2};

    //    return walls.reduce(function(min, cur){
    //        var extCur = extend(cur);
    //        var minDist = Maths.distance(zx, zy, min.x, min.y);
    //        var pDist = Maths.distance(zx, zy, extCur.p.x, extCur.p.y);
    //        var qDist = Maths.distance(zx, zy, extCur.q.x, extCur.q.y);
    //        var curDist = pDist < qDist ? pDist : qDist;
    //        var curPoint= pDist < qDist ? extCur.p : extCur.q;
    //        return minDist < curDist ? min : curPoint;
    //    }, {x: Infinity, y: Infinity});
    //};

    function getImpedingObs(obs, zx, zy){
        var zLocation = {x: zx, y: zy};
        var pLocation = {x: px, y: py};
        function intersectsLine(line){
            return Maths.intersects(zLocation, pLocation, line.p, line.q);
        };

        return obs.filter(function(obstacle){
            return obstacle.lines.some(intersectsLine);
        });
    };
    function getAllCorners(obs){
        return obs.reduce(function(corners, cur){
            return corners.concat(cur.corners);
        }, []);
    };
    function getClosestPoint(corners, zx, zy){
        if(corners.length == 0)
            return {x: px, y: py};

        return corners.reduce(function(min, cur){
            var minDist = Maths.distance(zx, zy, min.x, min.y);
                // + Maths.distance(min.x, min.y, px, py);
            var curDist = Maths.distance(zx, zy, cur.x, cur.y);
                // + Maths.distance(cur.x, cur.y, px, py);
            
            if(curDist < 8) return min; // prevents getting stuck

            return minDist < curDist ? min : cur;
        }, {x: Infinity, y: Infinity});
    };
    
    function getDirection(zx, zy, tx, ty){
        // get the direction from (zx, xy) to (tx, ty)
        var xcomp = tx-zx;
        var ycomp = ty-zy;
        return {
            dx: Constants.zombieSpeed*xcomp*Maths.normalize(xcomp, ycomp),
            dy: Constants.zombieSpeed*ycomp*Maths.normalize(xcomp, ycomp)
        };
    }
    return {
        old_setDirection: function(z, obs){
            //var impWalls = getImpedingWalls(ins.getLines(), z.x, z.y);
            //var target = getClosestPoint(impWalls, z.x, z.y);
            //var direction = getDirection(z.x, z.y, target.x, target.y);
            var impObs = getImpedingObs(obs, z.x, z.y);
            var target = getClosestPoint(getAllCorners(impObs), z.x, z.y);
            var direction = getDirection(z.x, z.y, target.x, target.y);
            z.dx = direction.dx;
            z.dy = direction.dy;
        },
        getPath: function(z, obs, lines){
            return Theta({x:z.x, y:z.y}, {x:px, y:py}, getAllCorners(obs), lines);
        },
        setDirection: function(z){
            if(z.path.length <= 1)
                z.path.push({x:px, y:py});
            var next_x = z.path[0].x;
            var next_y = z.path[0].y;
            if(Maths.withinRadius(z.x, z.y, next_x, next_y, 4)
               && z.path.length > 1)
            {
                z.path = z.path.splice(1);
                next_x = z.path[0].x;
                next_y = z.path[0].y;
            }
            var direction = getDirection(z.x, z.y, next_x, next_y);
            z.dx = direction.dx;
            z.dy = direction.dy;
        }
    };
}); 
