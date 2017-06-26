/*******************************************************************************
 * Game Object
 *  - arrow...: respond to key clicks
 *  - mouseClick: fire bullet
 *  - update/render: update and render the game using specialized objects
 *  - reset: start game over
 */
define(['./keyMap', './obstacleMap', './world', './player',
        './bulletList', './zombieList', './updater', './renderer'],
       function(KeyMap, ObstacleMap, World, Player,
                BulletList, ZombieList, Updater, Renderer){
    var objs;
    return {
        arrowDown: function(e){
            objs.keyMap.arrowDown(e);
        },
        arrowUp: function(e){
            objs.keyMap.arrowUp(e);
        },
        mouseClick: function(e){
            var canvas = document.getElementById('gameStage');
            var mouseX = e.pageX - canvas.getBoundingClientRect().left;
            var mouseY = e.pageY - canvas.getBoundingClientRect().top;
            objs.bullets.add(mouseX, mouseY);
        },
        update: function(){
            return Updater(objs);
        },
        render: function(){
            Renderer(objs);
        },
        reset: function(){
            objs = {
                keyMap: new KeyMap(),
                player: new Player(),
                bullets: new BulletList(),
                zombies: new ZombieList(),
                worldMovement: new World(),
                obsMap: new ObstacleMap()
            };
        }
    };
});
