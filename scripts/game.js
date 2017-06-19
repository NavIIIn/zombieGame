/*******************************************************************************
 * Game Object
 *  - arrow...: respond to key clicks
 *  - mouseClick: fire bullet
 *  - update/render: update and render the game using specialized objects
 */
define(['./keyMap', './obstacleMap', './world', './player', './bulletList', './zombieList', './updater', './renderer'], function(KeyMap, ObstacleMap, World, Player, BulletList, ZombieList, Updater, Renderer){
    var objs = {
        keyMap: new KeyMap(),
        player: new Player(),
        bullets: new BulletList(),
        zombies: new ZombieList(), //[],
        worldMovement: new World(),
        obsMap: new ObstacleMap(),
        shotCounter: 0,
        score: 0
    };
    return {
        arrowDown: function(e){
            objs.keyMap.arrowDown(e);
        },
        arrowUp: function(e){
            objs.keyMap.arrowUp(e);
        },
        mouseClick: function(e){
            var canvas = document.getElementById('gameStage');
            if(objs.shotCounter < 1){
                var mouseX = e.pageX - canvas.getBoundingClientRect().left;
                var mouseY = e.pageY - canvas.getBoundingClientRect().top;
                objs.bullets.add(mouseX, mouseY);
                //objs.shotCounter = 15;
            }
        },
        update: function(){
            return Updater(objs);
        },
        render: function(){
            Renderer(objs);
        },
    };
});
