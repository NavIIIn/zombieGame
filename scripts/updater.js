/*******************************************************************************
 * Updater
 *  - arrow...: respond to key clicks
 *  - mouseClick: fire bullet
 *  - update/render: update and render the game using specialized objects
 */
define(['./constants', './mathStuff', './hash', './zombie'], function(Constants, Maths, Hash, Zombie){
    var gameTimer = 0;
    var zombieHash = Hash;
    var killed = 0;
    function updateZombie(z, worldMovement){
        // move
        if(z.x < Constants.canvasWidth/2+Constants.canvasWidth/8){
            z.found = true;
        }
        if(z.found){
            var xcomp = Constants.canvasWidth/2 - z.x;
            var ycomp = Constants.canvasHeight/2 - z.y;
            z.dx = Constants.zombieSpeed*xcomp*Maths.normalize(xcomp, ycomp);
            z.dy = Constants.zombieSpeed*ycomp*Maths.normalize(xcomp, ycomp);
        }
        z.x += z.dx + worldMovement.dx;
        z.y += z.dy + worldMovement.dy;
    }
    function player(p){
        zombieHash.collideAll([p], function(p, arr){
            var rad = Constants.zombieSize + Constants.bulletSize;
            arr.forEach(function(z, index, arr){
                if(Maths.withinRadius(z.x, z.y, p.x, p.y, rad)){
                    z.health -= p.damage;
                    p.health -= z.damage;
                }
            });
        });
        return p;
    }
    function world(worldMovement, keyMap){
        var raw_x = (keyMap[1]?1:0) + (keyMap[3]?-1:0);
        var raw_y = (keyMap[0]?1:0) + (keyMap[2]?-1:0);
        worldMovement.dx = Constants.playerSpeed*raw_x*Maths.normalize(raw_x, raw_y);
        worldMovement.dy = Constants.playerSpeed*raw_y*Maths.normalize(raw_x, raw_y);
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
    function obstacles(obstaclemovement, objinserter, keyMap){
        var raw_x = (keyMap[1]?1:0) + (keyMap[3]?-1:0);
        var raw_y = (keyMap[0]?1:0) + (keyMap[2]?-1:0);
        obstaclemovement.dx = Constants.playerSpeed*raw_x*Maths.normalize(raw_x, raw_y);
        obstaclemovement.dy = Constants.playerSpeed*raw_y*Maths.normalize(raw_x, raw_y);
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
    function zombies(z, worldMovement){
        killed = 0;
        zombieHash.addAll(z);
        if(Math.random() < Math.log(gameTimer)*Constants.spawnRate && z.length < Constants.maxZombies)
            z.push(new Zombie());
        z.forEach(function(v,i,arr){
            updateZombie(v, worldMovement);
            if(v.health <= 0)
                killed++;
        });
        return z.filter(function(v){
            return v.health > 0 && v.x > -Constants.canvasWidth && v.x < 2*Constants.canvasWidth
                && v.y > -Constants.canvasHeight && v.y <2* Constants.canvasWidth;
        });
    }
    function bullets(b){
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
        return b.filter(function(v){ // clear out extra bullets
            return v.health > 0 &&
                v.x > 0 && v.x < Constants.canvasWidth &&
                v.y > 0 && v.y < Constants.canvasWidth;
        });
    }
    return function(objs){
        document.getElementById("score").innerHTML = "Score: " + objs.score;
        document.getElementById("health").innerHTML = "Health: " + objs.player.health;
        objs.zombies = zombies(objs.zombies, objs.worldMovement);
        objs.bullets = bullets(objs.bullets);
        objs.player = player(objs.player);
        world(objs.worldMovement, objs.keyMap);
        obstacles(objs.obstacleMovement, objs.objInserter, objs.keyMap);
        gameTimer++;
        objs.shotCounter--;
        objs.score += killed;

        if(objs.player.health <= 0)
            return false;
        else
            return true;
    };
});
