/*******************************************************************************
 * Updater
 *  - arrow...: respond to key clicks
 *  - mouseClick: fire bullet
 *  - update/render: update and render the game using specialized objects
 */
define(['./constants', './zombie', './zombieAgent'], function(Constants, Zombie, ZombieAgent){
    var killed = 0;
    function world(worldMovement, obsMap){
        worldMovement.copySpeed(obsMap);
        worldMovement.move();
    }
    function obstacles(obsMap, keyMap, player){
        obsMap.move(keyMap, player);
        obsMap.addWall();
    }
    function zombies(zombies, worldMovement, obsMap, bullets, player){
        zombies.updateHash();
        zombies.add();
        killed = zombies.update(worldMovement, obsMap);
        zombies.remove();
        bullets.arr.forEach(function(v){zombies.collide(v, Constants.zombieSize + Constants.bulletSize)});
        zombies.collide(player, Constants.zombieSize+Constants.playerSize);
        return zombies;
    }
    function bullets(b, obsMap, world){
        b.move(world);
        b.remove(obsMap);
        return b;
    }
    return function(objs){
        document.getElementById("score").innerHTML = "Score: " + objs.score;
        document.getElementById("health").innerHTML = "Health: " + objs.player.health;
        objs.zombies = zombies(objs.zombies, objs.worldMovement, objs.obsMap, objs.bullets, objs.player);
        objs.bullets = bullets(objs.bullets, objs.obsMap, objs.worldMovement);
        world(objs.worldMovement, objs.obsMap);
        obstacles(objs.obsMap, objs.keyMap, objs.player);
        objs.shotCounter--;
        objs.score += killed;

        return !objs.player.dead();
    };
});
