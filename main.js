/*******************************************************************************
* Zombie Game                                                                  *
* Joseph Navin                                                                 *
* June 2016                                                                    *
* Current work:                                                                *
*     Set objInserter.objects to be a 2d array so it can tell what walls to    *
*     add or remove                                                            *
*******************************************************************************/

/*******************************************************************************
* Constants
*/

var CANVAS_WIDTH = 800;
var CANVAS_HEIGHT = 600;
var FRAME_TIME = 1000/60;
var PLAYER_SIZE = 8;
var PLAYER_SPEED = 4;
var PLAYER_HEALTH = 80;
var MELEE_DAMAGE = 2;
var BULLET_SIZE = 3;
var BULLET_SPEED = 15;
var BULLET_DAMAGE = 8;
var ZOMBIE_SIZE = 8;
var ZOMBIE_SPEED = 3;
var ZOMBIE_HEALTH = 20;
var ZOMBIE_DAMAGE = 8;
var BG_CYCLE_X = 160;
var BG_CYCLE_Y = BG_CYCLE_X*Math.sqrt(3); // Hexagon geometry
var OBS_CYCLE = 160;
var CENTER_X = CANVAS_WIDTH/2;
var CENTER_Y = CANVAS_HEIGHT/2;
var FIRE_RATE = 25;
var SPAWN_RATE = 1/500; // higher number means less spawn
var MAX_ZOMBIES = 60;
var GRID_SIZE = 8;
var WALL_LENGTH = 80;

/*******************************************************************************
* Class Constructors
*/

/*-------- Player Class ------------------------------------------------------*/
function player(){
    //console.log('player constructor called');
    this.name = "player";
    this.team = "A";
    this.code = 1;
    this.health = PLAYER_HEALTH;
    this.damage = MELEE_DAMAGE;
    this.x = CANVAS_WIDTH/2;
    this.y = CANVAS_HEIGHT/2;
    this.dx = 0;
    this.dy = 0;
}

/*-------- Bullet Class ------------------------------------------------------*/
function bullet(x, y){
    //console.log('bullet constructor called');
    this.name = "bullet";
    this.team = "A";
    this.code = 2;
    this.health = 1;
    this.damage = BULLET_DAMAGE;
    this.x = CANVAS_WIDTH/2;
    this.y = CANVAS_HEIGHT/2;
    var xcomp = x - this.x;
    var ycomp = y - this.y;
    this.dx = BULLET_SPEED*xcomp*normalize(xcomp, ycomp);
    this.dy = BULLET_SPEED*ycomp*normalize(xcomp, ycomp);
    this.update = function(){
        this.x += this.dx;
        this.y += this.dy;
    };
    shotCounter = FIRE_RATE;
}

/*-------- Zombie Class ------------------------------------------------------*/
function zombie(){
    //console.log('zombie constructor called');
    this.name = "zombie";
    this.team = "B";
    this.code = 3;
    this.health = ZOMBIE_HEALTH;
    this.damage = ZOMBIE_DAMAGE;
    this.found = false;
    // random distance from edge, then random edge
    var xEdgeDist = Math.random()*CANVAS_WIDTH/2;
    var yEdgeDist = Math.random()*CANVAS_HEIGHT/2;
    this.x = Math.random()>0.5 ? xEdgeDist-CANVAS_WIDTH/4 : xEdgeDist+CANVAS_WIDTH*3/4;
    this.y = Math.random()>0.5 ? yEdgeDist-CANVAS_HEIGHT/4 : yEdgeDist+CANVAS_HEIGHT*3/4;
    this.dx = 0;
    this.dy = 0;
    this.update = function(){
        if(this.x < CANVAS_WIDTH/2+CANVAS_WIDTH/8){
            this.found = true;
        }
        if(this.found){
            var xcomp = CANVAS_WIDTH/2 - this.x;
            var ycomp = CANVAS_HEIGHT/2 - this.y;
            this.dx = ZOMBIE_SPEED*xcomp*normalize(xcomp, ycomp);
            this.dy = ZOMBIE_SPEED*ycomp*normalize(xcomp, ycomp);
        }
        this.x += this.dx + worldMovement.dx;
        this.y += this.dy + worldMovement.dy;
    };
}


/*******************************************************************************
* Functions for math 
*/

// checks if the line drawn from p1 to q1 intersects with line drawn frm p2 to
// q2
function doIntersect(p1,q1,p2,q2){
    //console.log('doIntercect called');
    function orientation(p, q, r){
        var o = (q.y-p.y)*(r.x-q.x) - (q.x-p.x)*(r.y-q.y);
        if(o == 0) return 0;
        return (o>0) ? 1 : 2;
    }
    function onSegment(p, q, r){
        return q.x <= Math.max(p.x, r.x) && q.x > Math.min(p.x, r.x) &&
            q.y <= Math.max(p.y, r.y) && q.y > Math.min(p.y, r.y);
    }
    var o1 = orientation(p1,q1,p2);
    var o2 = orientation(p1,q1,q2);
    var o3 = orientation(p2,q2,p1);
    var o4 = orientation(p2,q2,q1);

    return (o1 != o2 && o3 != o4) ||
        (o1 == 0 && onSegment(p1, p2, q1)) ||
        (o2 == 0 && onSegment(p1, q2, q1)) ||
        (o3 == 0 && onSegment(p2, p1, q2)) ||
        (o4 == 0 && onSegment(p2, q1, q2));
}

// Helper with math for movement components
function normalize(x, y){
    //console.log('normalize called');
    return y == 0 ? 1 : Math.abs(Math.sqrt(1/(Math.pow(x/y,2)+1))/y);
}

// checks to see if an object is within a gridspace of corner in the positive
// direction
function withinGrid(corner, obj){
    return obj - corner > 0 && obj - corner < WALL_LENGTH*2;
}

/*-------- Obstacle Classes---------------------------------------------------*/

function point(x, y){
    ////console.log('point constructor called');
    this.x = x;
    this.y = y;
    this.copy = function(){
        return new point(this.x, this.y);
    }
}
function line(p, q){
    //console.log('line constructor called');
    this.p = p;
    this.q = q;
    this.print = function(){
        console.log('p : ( '+this.p.x+', '+this.p.y+' )');
        console.log('q : ( '+this.q.x+', '+this.q.y+' )');
    }
    this.copy = function(){
        return new line(this.p.copy(), this.q.copy());
    }
}

function obstacle(lines, corners){
    //console.log('obstacle constructor called');
    this.corners = corners; // edges that can be walked around
    this.lines = lines;
    this.adjust = function(x, y){
        for(i = 0; i < lines.length; i++){
            this.lines[i].p.x += x;
            this.lines[i].p.y += y;
            this.lines[i].q.x += x;
            this.lines[i].q.y += y;
        }
        for(i = 0; i < corners.length; i++){
            corners[i].x += x;
            corners[i].y += y;
        }
        return this;
    }
    this.copy = function(){
        var newLines = [];
        var newCorners = [];
                this.lines.forEach(function(v, i, arr){
            newLines.push(v.copy());
        });
        this.corners.forEach(function(v, i, arr){
            newCorners.push(v.copy());
        });
        return new obstacle(newLines, newCorners);
    }
}

var middle = new point(WALL_LENGTH, WALL_LENGTH);
var topEdge = new point(WALL_LENGTH, 0);
var bottomEdge = new point(WALL_LENGTH, WALL_LENGTH*2);
var leftEdge = new point(0, WALL_LENGTH);
var rightEdge = new point(WALL_LENGTH*2, WALL_LENGTH);
var topMid = new point(WALL_LENGTH, WALL_LENGTH/2);
var bottomMid = new point(WALL_LENGTH, WALL_LENGTH*3/2);
var leftMid = new point(WALL_LENGTH/2, WALL_LENGTH);
var rightMid = new point(WALL_LENGTH*3/2, WALL_LENGTH);

// lines spanning 2 wall lengths
var lineV2 = new line(topEdge, bottomEdge);
var lineH2 = new line(leftEdge, rightEdge);
//  lines spanning 1 wall length
var lineV1a = new line(topEdge, middle);
var lineV1b = new line(middle, bottomEdge);
var lineH1a = new line(leftEdge, middle);
var lineH1b = new line(middle, rightEdge);
// lines spanning half a wall length
var lineV12a = new line(topEdge, topMid);
var lineV12b = new line(topMid, middle);
var lineV12c = new line(middle, bottomMid);
var lineV12d = new line(bottomMid, bottomEdge);
var lineH12a = new line(leftEdge, leftMid);
var lineH12b = new line(leftMid, middle);
var lineH12c = new line(middle, rightMid);
var lineH12d = new line(rightMid, rightEdge);
// lines spanning 3/2 a wall length
var lineV32a = new line(topEdge, bottomMid);
var lineV32b = new line(topMid, bottomEdge);
var lineH32a = new line(leftEdge, rightMid);
var lineH32b = new line(leftMid, rightEdge);

// used for reference do not alter
var obs = [
    new obstacle([lineV32a],[topEdge, bottomMid]),
    new obstacle([lineV32b],[topMid, bottomEdge]),
    new obstacle([lineH32a],[leftEdge, rightMid]),
    new obstacle([lineH32b],[leftMid, rightEdge]),
    new obstacle([lineV1a, lineH12b, lineH12c], [topEdge, leftMid, rightMid]),
    new obstacle([lineV1b, lineH12b, lineH12c], [bottomEdge, leftMid, rightMid]),
    new obstacle([lineH1a, lineV12b, lineV12c], [leftEdge, topMid, bottomMid]),
    new obstacle([lineH1b, lineV12b, lineV12c], [rightEdge, topMid, bottomMid])
];

function Inserter(obsList){
    //console.log('Inserter called');
    this.types = obsList;
    this.objects = [];
    this.gridNumber = CANVAS_WIDTH*CANVAS_HEIGHT/Math.pow(2*WALL_LENGTH, 2) - 1;
    this.addNew = function(x, y){
        var rand = Math.floor(Math.random()*(this.types.length));
        var obj = this.types[rand].copy();
        this.objects.push(obj.adjust(x, y));
    }
    this.addNewWall = function(wall){
        // wall (l, r, t, b) indicates which wall
        if(wall == 'l'){
            for(var i=0; i<CANVAS_HEIGHT; i+=2*WALL_LENGTH)
                this.addNew(-2*WALL_LENGTH, i);
        }
        else if(wall == 'r'){
            for(var i=0; i<CANVAS_HEIGHT; i+= 2*WALL_LENGTH)
                this.addNew(CANVAS_WIDTH, i);
        }
        else if(wall == 't'){
            for(var i=0; i<CANVAS_WIDTH; i += 2*WALL_LENGTH)
                this.addNew(i, -2*WALL_LENGTH);
        }
        else if(wall == 'b'){
            for(var i=0; i<CANVAS_WIDTH; i += 2*WALL_LENGTH)
                this.addNew(i, CANVAS_HEIGHT);

        }
        else {console.log('incorrect input in addNewWall');}

        while(this.objects.length > this.gridNumber){
            this.objects.shift();
        }
    }
    this.getLines = function(){
        var lines = [];
        this.objects.forEach(function(v, i, arr){
            lines = lines.concat(v.lines.slice());
        });
        return lines;
    }
    this.test = function(){
        this.addNewWall('t');
        this.addNewWall('b');
        this.addNewWall('l');
        this.addNewWall('r');
    }
    this.adjust = function(x, y){
        objects.forEach(function(v, i, arr){
            v.adjust(x, y);
        });
    }
    this.full = function(){
        return this.objects.length > this.gridNumber;
    }
    // initialize
    for(var i = 0; i < CANVAS_HEIGHT; i += 2*WALL_LENGTH){
        for(var j = 0; j < CANVAS_WIDTH; j+= 2*WALL_LENGTH){
            if(!withinGrid(i, CENTER_Y) ||
               !withinGrid(j, CENTER_X))
                this.addNew(j,i);
        }
    }
}

// Factory for map array
function mapFactory(){
    //console.log('mapFactory called');
    var m = [];
    for(i=0;i<CANVAS_WIDTH;i++){
        var a = [];
        for(j=0;j<CANVAS_HEIGHT;j++){
            a.push(0);
        }
        m.push(a);
    }
    return m;
}


/*******************************************************************************
* Main Function
*/

function Main(){
    //console.log('Main called');
    // Interface variables
    var canvas = document.getElementById('gameStage');
    var ctx = canvas.getContext("2d");
    var keyMap = [false, false, false, false]; // WASD pressed
    var gameMap = mapFactory();
    var objList = []; // All objects
    var bulletArray = [];
    var zombieArray = [];
    var p1 = new player();
    var worldMovement = {x:0, y:0, dx:0, dy:0};
    var shotCounter = 0;
    var gameTimer = 0;
    var score = 0;
    var gameLoop;
    var objInserter = new Inserter(obs);
    var obstacleMovement = {x:0, y:0, dx:0, dy:0};
    //objInserter.test();
    
    // Background image
    var bg = new Image();
    bg.onload = function(){
        ctx.beginPath();
        ctx.drawImage(bg,0,0); // wait for load
        ctx.closePath();
    };
    bg.src = "resources/hex_bg.png";

    // respond to events
    document.getElementById("doc").onkeydown = function(e){
        switch(e.keyCode){
        case 87: case 38: keyMap[0] = true; break; //w and up
        case 65: case 37: keyMap[1] = true; break; //a and left
        case 83: case 40: keyMap[2] = true; break; //s and down
        case 68: case 39: keyMap[3] = true; break; //d and right
        }
    }
    document.getElementById("doc").onkeyup = function(e){
        switch(e.keyCode){
        case 87: case 38: keyMap[0] = false; break; //w and up
        case 65: case 37: keyMap[1] = false; break; //a and left
        case 83: case 40: keyMap[2] = false; break; //s and down
        case 68: case 39: keyMap[3] = false; break; //d and right
        }
    }
    document.getElementById("doc").onclick = function(e){
        if(shotCounter < 1){
            mouseX = e.pageX - canvas.getBoundingClientRect().left;
            mouseY = e.pageY - canvas.getBoundingClientRect().top;
            bulletArray.push(new bullet(mouseX, mouseY));
        }
    }

    // adds  objects to gameMap
    objMap={
        square:function(o, w){
            for(i=o.x-Math.floor(w/2);i<o.x+floor(w/2);i++){
                for(j=o.y-Math.floor(w/2);j<o.y+w/2;j++){
                    gameMap[i][j] = o.code;
                }
            }
        },
        circle:function(o, r){
            for(i=o.x-r;i<o.x+r;i++){
                span = r * Math.asin( Math.cos( (o.x-i)/r ));
                for(j=Math.floor(o.y-span);j<o.y+span;j++){
                    gameMap[i][j] = o.code;
                }
            }
        }
    };
    objMap.circle({x:7,y:10,code:1}, 3);

    // Update
    function update(){
        // Display
        document.getElementById("score").innerHTML = "Score: " + score;
        document.getElementById("health").innerHTML = "Health: " + p1.health;

        // Game objects
        if(Math.random() < Math.log(gameTimer)*SPAWN_RATE && zombieArray.length < MAX_ZOMBIES)
            zombieArray.push(new zombie());

        bulletArray.forEach(function(v, i, arr){
            v.x += v.dx;
            v.y += v.dy;
        });
        
        zombieArray.forEach(function(v, i, arr){
            // move
            if(v.x < CANVAS_WIDTH/2+CANVAS_WIDTH/8){
                v.found = true;
            }
            if(v.found){
                var xcomp = CANVAS_WIDTH/2 - v.x;
                var ycomp = CANVAS_HEIGHT/2 - v.y;
                v.dx = ZOMBIE_SPEED*xcomp*normalize(xcomp, ycomp);
                v.dy = ZOMBIE_SPEED*ycomp*normalize(xcomp, ycomp);
            }
            v.x += v.dx + worldMovement.dx;
            v.y += v.dy + worldMovement.dy;

            // detect collisions
            bulletArray.forEach(function(b, j, arr){
                if(Math.abs(v.x-b.x)<ZOMBIE_SIZE && Math.abs(v.y-b.y)<ZOMBIE_SIZE){
                    v.health -= b.damage;
                    b.health -= v.damage;
                    if(v.health < 1)
                        score++;
                }});
            if(Math.abs(v.x-p1.x)<ZOMBIE_SIZE && Math.abs(v.y-p1.y)<ZOMBIE_SIZE){
                v.health -= p1.damage;
                p1.health -= v.damage;
                if(v.health < 1)
                    score++;
            }
            zombieArray.forEach(function(v2, i2, arr){
                if(Math.abs(v.x-v2.x)<ZOMBIE_SIZE*2 && Math.abs(v2.y-v.y)<ZOMBIE_SIZE*2 && i != i2){
                    // undo movement
                    v.x -= v.dx + worldMovement.dx;
                    v.y -= v.dy + worldMovement.dy;
                }
            });

        });

        // Remove objects
        bulletArray = bulletArray.filter(function(v){ // clear out extra bullets
            return v.health > 0 && v.x > 0 && v.x < CANVAS_WIDTH && v.y > 0 && v.y < CANVAS_WIDTH;
        });

        zombieArray = zombieArray.filter(function(v){
            return v.health > 0 && v.x > -CANVAS_WIDTH && v.x < 2*CANVAS_WIDTH
                && v.y > -CANVAS_HEIGHT && v.y <2* CANVAS_WIDTH;
        });

        if(p1.health < 1){
            zombieArray = [];
            clearInterval(gameLoop);
            Main();
        }
    }

    function render(){
        //console.log('render called');
        // This stuff should be moved to update
        ctx.clearRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
        // Background: detirmines direction, adjusts speed, and loops when at edge of map
        var raw_x = (keyMap[1]?1:0) + (keyMap[3]?-1:0);
        var raw_y = (keyMap[0]?1:0) + (keyMap[2]?-1:0);
        worldMovement.dx = PLAYER_SPEED*raw_x*normalize(raw_x, raw_y);
        worldMovement.dy = PLAYER_SPEED*raw_y*normalize(raw_x, raw_y);
        worldMovement.x += worldMovement.dx;
        worldMovement.y += worldMovement.dy;
        if (worldMovement.x > 0)
            worldMovement.x -= BG_CYCLE_X;
        if (worldMovement.x < -BG_CYCLE_X)
            worldMovement.x += BG_CYCLE_X;
        if (worldMovement.y > 0)
            worldMovement.y -= BG_CYCLE_Y;
        if (worldMovement.y < -BG_CYCLE_Y)
            worldMovement.y += BG_CYCLE_Y;
        ctx.beginPath();
        ctx.drawImage(bg,worldMovement.x,worldMovement.y);

        obstacleMovement.dx = PLAYER_SPEED*raw_x*normalize(raw_x, raw_y);
        obstacleMovement.dy = PLAYER_SPEED*raw_y*normalize(raw_x, raw_y);
        obstacleMovement.x += obstacleMovement.dx;
        obstacleMovement.y += obstacleMovement.dy;
        if (obstacleMovement.x > 0 && !objInserter.full()){
            obstacleMovement.x -= OBS_CYCLE;
            objInserter.addNewWall('l');
            console.log('add wall left');
        }
        if (obstacleMovement.x < -OBS_CYCLE && !objInserter.full()){
            obstacleMovement.x += OBS_CYCLE;
            objInserter.addNewWall('r');
            console.log('add wall right');
        }
        if (obstacleMovement.y > 0 && !objInserter.full()){
            obstacleMovement.y -= OBS_CYCLE;
            objInserter.addNewWall('t');
            console.log('add wall top');
        }
        if (obstacleMovement.y < -OBS_CYCLE && !objInserter.full()){
            obstacleMovement.y += OBS_CYCLE;
            objInserter.addNewWall('b');
            console.log('add wall bottom');
        }
            
        objInserter.objects.forEach(function(v, i, arr){
            v.adjust(obstacleMovement.dx, obstacleMovement.dy);
        });

        // foreground
        zombieArray.forEach(function(v, i, arr){
            ctx.beginPath();
            ctx.arc(v.x,v.y,ZOMBIE_SIZE,0,2*Math.PI);
            ctx.fillStyle = '#105F10';
            ctx.fill();
            ctx.fillStyle = '#000000';
        });
        bulletArray.forEach(function(v, i, arr){
            ctx.beginPath();
            ctx.arc(v.x,v.y,BULLET_SIZE,0,2*Math.PI);
            ctx.fill();
        });
        objInserter.getLines().forEach(function(v, i, arr){
            ctx.beginPath();
            ctx.moveTo(v.p.x, v.p.y);
            ctx.lineTo(v.q.x, v.q.y);
            ctx.stroke();
        });
        ctx.beginPath();
        ctx.arc(p1.x,p1.y,PLAYER_SIZE,0,2*Math.PI);
        ctx.fill();
    }
    
    // primary game loop
    function mainLoop(){
        shotCounter--;
        gameTimer++;

        update();
        render();
    }

    // run game
    document.getElementById("start").onclick = function(){
        clearInterval(gameLoop);
        gameLoop=setInterval(mainLoop, FRAME_TIME);
    }
}
