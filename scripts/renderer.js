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
    function bullets(b){
        b.each(function(v, i, arr){
            ctx.beginPath();
            ctx.arc(v.x,v.y,Constants.bulletSize,0,2*Math.PI);
            ctx.fill();
        });
    }
    function zombies(z){
        z.arr.forEach(function(v, i, arr){
            ctx.beginPath();
            ctx.arc(v.x,v.y,Constants.zombieSize,0,2*Math.PI);
            ctx.fillStyle = '#105F10';
            ctx.fill();
            ctx.fillStyle = '#000000';
        });
    }
    function world(worldMovement){
        ctx.beginPath();
        ctx.drawImage(bg,worldMovement.x,worldMovement.y);
        ctx.closePath();
    }
    function obstacles(objinserter){
        objinserter.getLines().forEach(function(v, i, arr){
            ctx.beginPath();
            ctx.lineWidth = Constants.wallWidth;
            ctx.moveTo(v.p.x, v.p.y);
            ctx.lineTo(v.q.x, v.q.y);
            ctx.stroke();
            ctx.lineWidth = 1;
        });
        //objinserter.getEdges().forEach(function(v){
            //ctx.beginPath();
            //ctx.arc(v.x,v.y,3,0,2*Math.PI);
            //ctx.fill();
        //});
        //objinserter.getCorners().forEach(function(v){
            //ctx.beginPath();
            //ctx.arc(v.x,v.y,3,0,2*Math.PI);
            //ctx.fill();
        //});
    }
    return function(objs){
        ctx.clearRect(0,0,Constants.canvasWidth,Constants.canvasHeight);
        world(objs.worldMovement);
        zombies(objs.zombies);
        bullets(objs.bullets);
        player(objs.player);
        obstacles(objs.obsMap)
    }
});
