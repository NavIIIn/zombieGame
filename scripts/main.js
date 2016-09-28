/*******************************************************************************
 *                          _   __            _                                 *
 * Zombie Game             / | / /___ __   __(_)___                             *
 * Joseph Navin           /  |/ / __ `/ | / / / __ \                            *
 * July 2016             / /|  / /_/ /| |/ / / / / /                            *
 *                      /_/ |_/\__,_/ |___/_/_/ /_/                             *
 *                                                                              *
 *******************************************************************************/

'use strict';

requirejs.config({
    baseUrl: 'scripts'
});
requirejs(['constants', 'game'], function(Constants, Game){
    function Main(){
        // Interface variables
        var gameLoop;
        var gameObj = Game;

        // respond to events
        document.getElementById("doc").onkeydown = gameObj.arrowDown;
        document.getElementById("doc").onkeyup = gameObj.arrowUp;
        document.getElementById("doc").onclick = gameObj.mouseClick;

        // primary game loop
        function mainloop(){
            if(!gameObj.update()){
                clearInterval(gameLoop);
                Main();
            }
            gameObj.render();
        }

        // run game
        document.getElementById("start").onclick = function(){
            clearInterval(gameLoop);
            gameLoop = setInterval(mainloop, Constants.frameTime);
        }
    }
    Main();
});

