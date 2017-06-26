/*******************************************************************************
 * Renderer Constructor
 */
define(['./constants'], function(Constants){
    var canvas = document.getElementById('gameStage');
    var ctx = canvas.getContext("2d");
    var bg = new Image();
    bg.src = "resources/hex_bg.png";
    function player(p){
        ctx.beginPath();
        ctx.arc(p.x,p.y,Constants.playerSize,0,2*Math.PI);
        ctx.fill();
    }
    function bullets(bullets){
        for(let b of bullets){
            ctx.beginPath();
            ctx.arc(b.x,b.y,Constants.bulletSize,0,2*Math.PI);
            ctx.fill();
        }
    }
    function zombies(zombies){
        for(let z of zombies){
            ctx.beginPath();
            ctx.arc(z.x,z.y,Constants.zombieSize,0,2*Math.PI);
            ctx.fillStyle = '#105F10';
            ctx.fill();
            ctx.fillStyle = '#000000';
        }
    }
    function world(worldMovement){
        ctx.beginPath();
        ctx.drawImage(bg,worldMovement.x,worldMovement.y);
        ctx.closePath();
    }
    function obstacles(obsMap){
        for(let obs of obsMap.getLines()){
            ctx.beginPath();
            ctx.lineWidth = Constants.wallWidth;
            ctx.moveTo(obs.p.x, obs.p.y);
            ctx.lineTo(obs.q.x, obs.q.y);
            ctx.stroke();
            ctx.lineWidth = 1;
        }
    }
    return function(objs){
        document.getElementById("score").innerHTML = "Score: " + objs.zombies.killed;
        document.getElementById("health").innerHTML = "Health: " + objs.player.health;
        ctx.clearRect(0,0,Constants.canvasWidth,Constants.canvasHeight);
        world(objs.worldMovement);
        zombies(objs.zombies);
        bullets(objs.bullets);
        player(objs.player);
        obstacles(objs.obsMap)
    }
});
