/*******************************************************************************
 * Updater
 *  - arrow...: respond to key clicks
 *  - mouseClick: fire bullet
 *  - update/render: update and render the game using specialized objects
 */
define(['./constants', './zombie'], function(Constants, Zombie){
    var bulletRange = Constants.zombieSize + Constants.bulletSize;
    function world(worldMovement, obsMap, keyMap, player){
        worldMovement.move(keyMap, obsMap, player);
    }
    function obstacles(obsMap, worldMovement){
        obsMap.move(worldMovement);
        obsMap.addWall();
    }
    function updateZombies(zombies, worldMovement, obsMap, bullets, player){
        zombies.updateHash();
        zombies.add();
        zombies.update(worldMovement, obsMap);
        zombies.remove();
        for(let b of bullets)
            zombies.collide(b, bulletRange);
        zombies.collide(player, bulletRange);
        return zombies;
    }
    function updateBullets(bullets, obsMap, world){
        bullets.move(world);
        bullets.remove(obsMap);
        return bullets;
    }
    return function(objs){
        document.getElementById("score").innerHTML = "Score: " + objs.score;
        document.getElementById("health").innerHTML = "Health: " + objs.player.health;
        updateZombies(objs.zombies, objs.worldMovement, objs.obsMap, objs.bullets, objs.player);
        updateBullets(objs.bullets, objs.obsMap, objs.worldMovement);
        world(objs.worldMovement, objs.obsMap, objs.keyMap, objs.player);
        obstacles(objs.obsMap, objs.worldMovement);
        objs.shotCounter--;
        objs.score = objs.zombies.killed;

        return !objs.player.dead();
    };
});
