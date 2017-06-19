/*******************************************************************************
 * Updater
 *  - arrow...: respond to key clicks
 *  - mouseClick: fire bullet
 *  - update/render: update and render the game using specialized objects
 */
define(['./constants', './geometry', './hash', './zombie', './zombieAgent'], function(Constants, Geometry, Hash, Zombie, ZombieAgent){
    var gameTimer = 0;
    var zombieHash = Hash;
    var killed = 0;
    function player(p, inserter){
        return p;
    }
    function world(worldMovement, keyMap, dir, obsMap){
        worldMovement.copySpeed(obsMap);
        worldMovement.move();
    }
    function obstacles(obstaclemovement, objinserter, keyMap, dir, player){
        objinserter.move(keyMap, player);
        objinserter.addWall();
    }
    function zombies(zombies, worldMovement, inserter, bullets, player){
        zombies.updateHash();
        zombies.add();
        killed = zombies.update(worldMovement, inserter);
        zombies.remove();
        bullets.arr.forEach(function(v){zombies.collide(v, Constants.zombieSize + Constants.bulletSize)});
        zombies.collide(player, Constants.zombieSize+Constants.playerSize);
        return zombies;
    }
    function bullets(b, inserter, world){
        b.move(world);
        b.remove(inserter);
        return b;
    }
    return function(objs){
        document.getElementById("score").innerHTML = "Score: " + objs.score;
        document.getElementById("health").innerHTML = "Health: " + objs.player.health;
        objs.zombies = zombies(objs.zombies, objs.worldMovement, objs.obsMap, objs.bullets, objs.player);
        objs.bullets = bullets(objs.bullets, objs.obsMap, objs.worldMovement);
        objs.player = player(objs.player, objs.obsMap);
        var wallDir = objs.obsMap.getCollisionDirection(objs.player, Constants.playerSize);
        world(objs.worldMovement, objs.keyMap, wallDir, objs.obsMap);
        obstacles(objs.obstacleMovement, objs.obsMap, objs.keyMap, wallDir, objs.player);
        wallFlag = false;
        gameTimer++;
        objs.shotCounter--;
        objs.score += killed;

        return !objs.player.dead();
    };
});
