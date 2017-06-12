/*******************************************************************************
 * Game Object
 *  - arrow...: respond to key clicks
 *  - mouseClick: fire bullet
 *  - update/render: update and render the game using specialized objects
 */
define(['./inserter', './player', './bullet', './updater', './renderer'], function(Inserter, Player, Bullet, Updater, Renderer){
    var objs = {
        keyMap: [false, false, false, false],
        player: new Player(),
        bullets: [],
        zombies: [],
        worldMovement: {x:0, y:0, dx:0, dy:0},
        objInserter: Inserter,
        obstacleMovement: {x:0, y:0, dx:0, dy:0},
        shotCounter: 0,
        score: 0
    };
    return {
        arrowDown: function(e){
            switch(e.keyCode){
            case 87: case 38: objs.keyMap[0] = true; break; //w and up
            case 65: case 37: objs.keyMap[1] = true; break; //a and left
            case 83: case 40: objs.keyMap[2] = true; break; //s and down
            case 68: case 39: objs.keyMap[3] = true; break; //d and right
            }
        },
        arrowUp: function(e){
            switch(e.keyCode){
            case 87: case 38: objs.keyMap[0] = false; break; //w and up
            case 65: case 37: objs.keyMap[1] = false; break; //a and left
            case 83: case 40: objs.keyMap[2] = false; break; //s and down
            case 68: case 39: objs.keyMap[3] = false; break; //d and right
            }
        },
        mouseClick: function(e){
            var canvas = document.getElementById('gameStage');
            if(objs.shotCounter < 1){
                var mouseX = e.pageX - canvas.getBoundingClientRect().left;
                var mouseY = e.pageY - canvas.getBoundingClientRect().top;
                objs.bullets.push(new Bullet(mouseX, mouseY));
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
