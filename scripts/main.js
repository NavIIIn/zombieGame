/*******************************************************************************
 *                          _   __            _                                 *
 * Zombie Game             / | / /___ __   __(_)___                             *
 * Joseph Navin           /  |/ / __ `/ | / / / __ \                            *
 * July 2016             / /|  / /_/ /| |/ / / / / /                            *
 *                      /_/ |_/\__,_/ |___/_/_/ /_/                             *
 *                                                                              *
 ********************************************************************************
 * Code Structure:                                                              *
 *   Main: starts game loop, checks keys pressed, updates, and renders          *
 *     Contains a game object                                                   *
 *   Game Object: defines update and render functions, contains all objects     *
 *   Objects: KeyMap keeps track of buttons pressed                             *
 *            Player is a LivePoint keeping track of the player                 *
 *              LivePoint is a point with health, damage, and movement          *
 *            Bullets contains and updates bullet objects                       *
 *              Bullets are LivePoints that project outward from player         *
 *            Zombies contains and updates zombie objects                       *
 *              Zombies are livePoints that follow player and attack on impact  *
 *            WorldMovement keeps track of backround movement for sidescrolling *
 *            obsMap contains and updates obstacle objects                      *
 *              Obstacles are a collection of lines, and points representing    *
 *              walls and edges used to walk around walls                       *
 *   Helpers: Geometry calculates math stuff                                    *
 *            Constants keeps track of constant values                          *
 *            2dArray makes an easier interface for array arrays                *
 *            SpacialHash is an efficient way of storing zombies for collisions *
 *            PriorityQueue is an easier interface for prioritizing data        *
 *            Theta uses a lazy theta algorithm to calculate paths for zombies  *
 *            NodeList contains and calculates possible path nodes for zombies  *
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
        gameObj.reset();

        // respond to events
        document.getElementById("doc").onkeydown = gameObj.arrowDown;
        document.getElementById("doc").onkeyup = gameObj.arrowUp;
        document.getElementById("doc").onclick = gameObj.mouseClick;

        // primary game loop
        function mainloop(){
            if(!gameObj.update()){
                clearInterval(gameLoop);
            }
            gameObj.render();
        }

        // run game
        document.getElementById("start").onclick = function(){
            clearInterval(gameLoop);
            gameObj.reset();
            gameLoop = setInterval(mainloop, Constants.frameTime);
        }
    }
    Main();
});

