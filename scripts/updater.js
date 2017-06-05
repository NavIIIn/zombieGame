/*******************************************************************************
 * Updater
 *  - arrow...: respond to key clicks
 *  - mouseClick: fire bullet
 *  - update/render: update and render the game using specialized objects
 */
define(['./constants', './mathStuff', './hash', './zombie', './zombieAgent'], function(Constants, Maths, Hash, Zombie, ZombieAgent){
    var gameTimer = 0;
    var zombieHash = Hash;
    var killed = 0;
    function updateZombie(z, worldMovement, obsArr, lines, zombies){
        var px = Constants.canvasWidth/2;
        var py = Constants.canvasHeight/2;
        if(z.path.length < 2)
            z.path = ZombieAgent.getPath(z, obsArr, lines);
        ZombieAgent.setDirection(z);
        z.x += z.dx + worldMovement.dx;
        z.y += z.dy + worldMovement.dy;
        for(i = z.path.length; i--; ){
            z.path[i].x += worldMovement.dx;
            z.path[i].y += worldMovement.dy;
        }
    }
    function player(p, inserter){
        zombieHash.collideAll([p], function(p, arr){
            var rad = Constants.zombieSize + Constants.bulletSize;
            arr.forEach(function(z, index, arr){
                if(Maths.withinRadius(z.x, z.y, p.x, p.y, rad)){
                    z.health -= p.damage;
                    p.health -= z.damage;
                }
            });
            p = inserter.collidesAll([p], Constants.playerSize, function(pl){
                return pl;
            })[0];
        });
        return p;
    }
    function world(worldMovement, keyMap, dir){
        var raw_x = (keyMap[1]?1:0) + (keyMap[3]?-1:0);
        var raw_y = (keyMap[0]?1:0) + (keyMap[2]?-1:0);
        worldMovement.dx = Constants.playerSpeed*raw_x*Maths.normalize(raw_x, raw_y);
        worldMovement.dy = Constants.playerSpeed*raw_y*Maths.normalize(raw_x, raw_y);
        // adjust for wall collisions
        if(dir.right && worldMovement.dx < 0)
            worldMovement.dx = 0;
        if(dir.left && worldMovement.dx > 0)
            worldMovement.dx = 0;
        if(dir.top && worldMovement.dy > 0)
            worldMovement.dy = 0;
        if(dir.bottom && worldMovement.dy < 0)
            worldMovement.dy = 0;
        worldMovement.x += worldMovement.dx;
        worldMovement.y += worldMovement.dy;
        if (worldMovement.x > 0)
            worldMovement.x -= Constants.gridSize;
        if (worldMovement.x < -Constants.gridSize)
            worldMovement.x += Constants.gridSize;
        if (worldMovement.y > 0)
            worldMovement.y -= Constants.hexGrid;
        if (worldMovement.y < -Constants.hexGrid)
            worldMovement.y += Constants.hexGrid;

    }
    function obstacles(obstaclemovement, objinserter, keyMap, dir){
        var raw_x = (keyMap[1]?1:0) + (keyMap[3]?-1:0);
        var raw_y = (keyMap[0]?1:0) + (keyMap[2]?-1:0);
        obstaclemovement.dx = Constants.playerSpeed*raw_x*Maths.normalize(raw_x, raw_y);
        obstaclemovement.dy = Constants.playerSpeed*raw_y*Maths.normalize(raw_x, raw_y);
        // adjust for wall collisions
        if(dir.right && obstaclemovement.dx < 0)
            obstaclemovement.dx = 0;
        if(dir.left && obstaclemovement.dx > 0)
            obstaclemovement.dx = 0;
        if(dir.top && obstaclemovement.dy > 0)
            obstaclemovement.dy = 0;
        if(dir.bottom && obstaclemovement.dy < 0)
            obstaclemovement.dy = 0;
        obstaclemovement.x += obstaclemovement.dx;
        obstaclemovement.y += obstaclemovement.dy;
        if (obstaclemovement.x > 0){
            obstaclemovement.x -= Constants.gridSize;
            objinserter.addLeft();
        }
        else if (obstaclemovement.x <= -Constants.gridSize){
            obstaclemovement.x += Constants.gridSize;
            objinserter.addRight();
        }
        else if (obstaclemovement.y > 0){
            obstaclemovement.y -= Constants.gridSize;
            objinserter.addTop();
        }
        else if (obstaclemovement.y <= -Constants.gridSize){
            obstaclemovement.y += Constants.gridSize;
            objinserter.addBottom();
        }

        objinserter.adjust(obstaclemovement.dx, obstaclemovement.dy);
    }
    function zombies(z, worldMovement, inserter){
        killed = 0;
        zombieHash.addAll(z);
        var obsArr = inserter.getObstacles();
        if(Math.random() < Math.log(gameTimer)*Constants.spawnRate && z.length < Constants.maxZombies)
            z.push(new Zombie());
        z.forEach(function(v,i,arr){
            updateZombie(v, worldMovement, obsArr, inserter.getLines(), z);
            if(v.health <= 0)
                killed++;
        });
        return z.filter(function(v){
            return v.health > 0 && v.x > -Constants.canvasWidth && v.x < 2*Constants.canvasWidth
                && v.y > -Constants.canvasHeight && v.y <2* Constants.canvasWidth;
        });
    }
    function bullets(b, inserter){
        zombieHash.collideAll(b, function(b, arr){
            var rad = Constants.zombieSize + Constants.bulletSize;
            arr.forEach(function(z, index, arr){
                if(Maths.withinRadius(z.x, z.y, b.x, b.y, rad)){
                    z.health -= b.damage;
                    b.health -= z.damage;
                }
            });
        });
        b.forEach(function(v, i, arr){
            v.x += v.dx;
            v.y += v.dy;
        });
        b = inserter.collidesAll(b, Constants.bulletSize, function(blt){
            blt.health = 0;
            return blt;
        });
        return b.filter(function(v){ // clear out extra bullets
            return v.health > 0 &&
                v.x > 0 && v.x < Constants.canvasWidth &&
                v.y > 0 && v.y < Constants.canvasWidth;
        });
    }
    return function(objs){
        document.getElementById("score").innerHTML = "Score: " + objs.score;
        document.getElementById("health").innerHTML = "Health: " + objs.player.health;
        objs.zombies = zombies(objs.zombies, objs.worldMovement, objs.objInserter);
        objs.bullets = bullets(objs.bullets, objs.objInserter);
        objs.player = player(objs.player, objs.objInserter);
        var wallDir = objs.objInserter.getCollisionDirection(objs.player, Constants.playerSize);
        world(objs.worldMovement, objs.keyMap, wallDir);
        obstacles(objs.obstacleMovement, objs.objInserter, objs.keyMap, wallDir);
        wallFlag = false;
        gameTimer++;
        objs.shotCounter--;
        objs.score += killed;

        if(objs.player.health <= 0)
            return false;
        else
            return true;
    };
});
