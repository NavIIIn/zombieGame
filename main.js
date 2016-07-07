/*******************************************************************************
*                          _   __            _                                 *
* Zombie Game             / | / /___ __   __(_)___                             *
* Joseph Navin           /  |/ / __ `/ | / / / __ \                            *
* July 2016             / /|  / /_/ /| |/ / / / / /                            *
*                      /_/ |_/\__,_/ |___/_/_/ /_/                             *
*                                                                              *
*******************************************************************************/

/*******************************************************************************
* Constants
*/

var constants = {
    canvasWidth   :  800,
    canvasHeight  :  600,
    frameTime     :  1000/60,
    gridSize      :  160,
    hexGrid       :  160*Math.sqrt(3),
    playerSize    :  8,
    playerSpeed   :  4,
    playerHealth  :  80,
    fireRate      :  25,
    meleeDamage   :  2,
    bulletSize    :  3,
    bulletSpeed   :  15,
    bulletDamage  :  8,
    zombieSize    :  8,
    zombieSpeed   :  3,
    zombieHealth  :  20,
    zombieDamage  :  8,
    spawnRate     :  1/500,
    maxZombies    :  60
}

/*******************************************************************************
* Class Constructors
*/

/*-------- Player Class ------------------------------------------------------*/
function player(){
    this.code   = 1;
    this.health = constants.playerHealth;
    this.damage = constants.meleeDamage;
    this.x      = constants.canvasWidth/2;
    this.y      = constants.canvasHeight/2;
    this.dx     = 0;
    this.dy     = 0;
}

/*-------- Bullet Class ------------------------------------------------------*/
function bullet(x, y){
    this.code   = 2;
    this.health = 1;
    this.damage = constants.bulletDamage;
    this.x      = constants.canvasWidth/2;
    this.y      = constants.canvasHeight/2;
    var xcomp   = x - this.x;
    var ycomp   = y - this.y;
    this.dx     = constants.bulletSpeed*xcomp*normalize(xcomp, ycomp);
    this.dy     = constants.bulletSpeed*ycomp*normalize(xcomp, ycomp);
}

function bulletAggregate(){
    this.bullets = [];
    this.shotCounter = 0;
    this.add = function(x, y){
        this.bullets.push(new bullet(x, y));
    }
}

/*-------- Zombie Class ------------------------------------------------------*/
function zombie(){
    var cWidth    = constants.canvasWidth; // shorter name
    var cHeight   = constants.canvasHeight;
    var xEdgeDist = Math.random()*cWidth/2; // random distance
    var yEdgeDist = Math.random()*cHeight/2;

    this.code     = 3;
    this.health   = constants.zombieHealth;
    this.damage   = constants.zombieDamage;
    this.found    = false;

    this.x  = flipCoin() ? xEdgeDist-cWidth/4 : xEdgeDist+cWidth*3/4;
    this.y  = flipCoin() ? yEdgeDist-cHeight/4 : yEdgeDist+cHeight*3/4;
    this.dx = 0;
    this.dy = 0;

    this.update = function(){
        if(this.x < cWidth/2+cWidth/8){
            this.found = true;
        }
        if(this.found){
            var xcomp = cWidth/2 - this.x;
            var ycomp = cHeight/2 - this.y;
            this.dx = constants.zombieSpeed*xcomp*normalize(xcomp, ycomp);
            this.dy = constants.zombieSpeed*ycomp*normalize(xcomp, ycomp);
        }
        this.x += this.dx + worldMovement.dx;
        this.y += this.dy + worldMovement.dy;
    };
}

function zombieAggregate(){
    this.array = [];
    this.hash = []; // stores by approximate loaction
    this.add = function(){

    }
}

/*******************************************************************************
* Functions for math 
*/

// 50% chance of returning true
function flipCoin(){
    return Math.random()>0.5;
}
// checks if the line drawn from p1 to q1 intersects with line drawn frm p2 to
// q2
function doIntersect(p1,q1,p2,q2){
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
    return y == 0 ? 1 : Math.abs(Math.sqrt(1/(Math.pow(x/y,2)+1))/y);
}

// checks to see if an object is within a gridspace of corner in the positive
// direction
function withinGrid(corner, obj){
    return obj - corner > 0 && obj - corner < constants.gridSize;
}

function withinRadius(x1, y1, x2, y2, r){
    return Math.sqrt(Math.pow(x1-x2,2)+Math.pow(y1-y2,2)) < r;
}

function div(n){
    return Math.round(n/(constants.zombieSize + constants.bulletSize)/2);
}

/*-------- Obstacle Classes---------------------------------------------------*/

function point(x, y){
    this.x = x;
    this.y = y;
    this.copy = function(){
        return new point(this.x, this.y);
    }
}
function line(p, q){
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

// returns a list of potential obstacles
function getObstacles(){
    var wallLength = constants.gridSize/2;

    var middle = new point(wallLength, wallLength);
    var topEdge = new point(wallLength, 0);
    var bottomEdge = new point(wallLength, wallLength*2);
    var leftEdge = new point(0, wallLength);
    var rightEdge = new point(wallLength*2, wallLength);
    var topMid = new point(wallLength, wallLength/2);
    var bottomMid = new point(wallLength, wallLength*3/2);
    var leftMid = new point(wallLength/2, wallLength);
    var rightMid = new point(wallLength*3/2, wallLength);

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
    return [
        new obstacle([lineV32a],[topEdge, bottomMid]),
        new obstacle([lineV32b],[topMid, bottomEdge]),
        new obstacle([lineH32a],[leftEdge, rightMid]),
        new obstacle([lineH32b],[leftMid, rightEdge]),
        new obstacle([lineV1a, lineH12b, lineH12c], [topEdge, leftMid, rightMid]),
        new obstacle([lineV1b, lineH12b, lineH12c], [bottomEdge, leftMid, rightMid]),
        new obstacle([lineH1a, lineV12b, lineV12c], [leftEdge, topMid, bottomMid]),
        new obstacle([lineH1b, lineV12b, lineV12c], [rightEdge, topMid, bottomMid])
    ];

}
var obs = getObstacles();

function Inserter(obsList){
    //console.log('Inserter called');
    this.types = obsList;
    this.obsMap = [];
    this.addNewWall = function(wall){
        // wall (l, r, t, b) indicates which wall
        var rand;
        var gSize = constants.gridSize;
        if(wall == 'l'){
            for(var i=0; i<this.obsMap.length; i++){
                rand = Math.floor(Math.random()*(this.types.length));
                this.obsMap[i].unshift(this.types[rand].copy().adjust(-gSize, i*gSize));
            }
        }
        else if(wall == 'r'){
            for(var i=0; i<this.obsMap.length; i++){
                rand = Math.floor(Math.random()*(this.types.length));
                this.obsMap[i].push(this.types[rand].copy().adjust(constants.canvasWidth, i*gSize));
            }
        }
        else if(wall == 't'){
            var newWall = [];
            for(var i=0; i<constants.canvasWidth; i += gSize){
                rand = Math.floor(Math.random()*(this.types.length));
                newWall.push(this.types[rand].copy().adjust(i, -gSize));
            }
            this.obsMap.unshift(newWall);
        }
        else if(wall == 'b'){
            var newWall = [];
            for(var i=0; i<constants.canvasWidth; i += gSize){
                rand = Math.floor(Math.random()*(this.types.length));
                newWall.push(this.types[rand].copy().adjust(i, constants.canvasHeight));
            }
            this.obsMap.push(newWall);
        }
        else {console.log('incorrect input in addNewWall');}

    }
    this.getLines = function(){
        var lines = [];
        this.obsMap.forEach(function(row, j, m){
            row.forEach(function(v, i, r){
                lines = lines.concat(v.lines.slice());
            });
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
        this.obsMap.forEach(function(row, j, m){
            row.forEach(function(v, i, r){
                v.adjust(x, y);
            });
        });
    }
    // initialize
    var rand;
    for(var i = 0; i < constants.canvasHeight/constants.gridSize; i++){
        this.obsMap.push([]);
        for(var j = 0; j < constants.canvasWidth/constants.gridSize; j++){
            rand = Math.floor(Math.random()*(this.types.length));
            this.obsMap[i].push(this.types[rand].copy().adjust(j*constants.gridSize, i*constants.gridSize));
        }
    }
}

/*******************************************************************************
* Game object
*     keeps track of all other objects
*/
function game(){
    this.keyMap = [false, false, false, false];
    this.player = new player();
    this.bullets = new bulletAggregate();
    this.score = 0;
    this.updater = new updater();
    this.renderer = new renderer();
    var g = this; // so next functions aren't confused by 'this'
    this.arrowDown = function(e){
        switch(e.keyCode){
        case 87: case 38: g.keyMap[0] = true; break; //w and up
        case 65: case 37: g.keyMap[1] = true; break; //a and left
        case 83: case 40: g.keyMap[2] = true; break; //s and down
        case 68: case 39: g.keyMap[3] = true; break; //d and right
        }
    };
    this.arrowUp = function(e){
        switch(e.keyCode){
        case 87: case 38: g.keyMap[0] = false; break; //w and up
        case 65: case 37: g.keyMap[1] = false; break; //a and left
        case 83: case 40: g.keyMap[2] = false; break; //s and down
        case 68: case 39: g.keyMap[3] = false; break; //d and right
        }
    };
    this.mouseClick = function(e){
        if(g.bullets.shotCounter < 1){
            mouseX = e.pageX - g.renderer.canvas.getBoundingClientRect().left;
            mouseY = e.pageY - g.renderer.canvas.getBoundingClientRect().top;
            g.bullets.add(mouseX, mouseY);
        }
    };
    this.test = function(){
        g.updater.bullets(g.bullets);
        g.renderer.bullets(g.bullets);
    }
}

function renderer(){
    this.canvas = document.getElementById('gameStage');
    this.ctx = this.canvas.getContext("2d");
    this.bg = new Image();
    var r = this;
    this.bg.onload = function(){
        r.ctx.beginPath();
        r.ctx.drawImage(r.bg,0,0); // wait for load
        r.ctx.closePath();
    };
    this.bg.src = "resources/hex_bg.png";
    this.bullets = function(b){
        b.bullets.forEach(function(v, i, arr){
            r.ctx.beginPath();
            r.ctx.arc(v.x,v.y,constants.bulletSize,0,2*Math.PI);
            r.ctx.fill();
        });
    }
}

function updater(){
    this.allObj = [];
    this.bullets = function(b){
        b.bullets.forEach(function(v, i, arr){
            v.x += v.dx;
            v.y += v.dy;
        });
        b.bullets = b.bullets.filter(function(v){ // clear out extra bullets
            return v.health > 0 &&
                   v.x > 0 && v.x < constants.canvasWidth &&
                   v.y > 0 && v.y < constants.canvasWidth;
        });
    }
    this.update = function(z, b){
        var pts = [];
        function addToPts(x,y,v){
            if(typeof pts[x] == 'undefined'){
                pts[x] = [];
                pts[x][y] = [v];
            }
            else if(typeof pts[x][y] == 'undefined')
                pts[x][y] = [v];
            else
                pts[x][y] = pts[x][y].push(v);
        }
        function zombieCollide(i){
            var xDown = div(z[i].x);
            var yDown = div(z[i].y);
            addToPts(xDown, yDown, i);
            addToPts(xDown-1, yDown, i);
            addToPts(xDown, yDown-1, i);
            addToPts(xDown+1, yDown, i);
            addToPts(xDown, yDown+1, i);
        }
        function bulletCollide(i){
            var xDown = div(b[i].x);
            var yDown = div(b[i].y);
            if(typeof pts[xDown] != 'undefined' && typeof pts[xDown][yDown] != 'undefined'){
                pts[xDown][yDown].forEach(function(v, index, arr){
                    var bull = b[i];
                    var zomb = z[v];
                    var rad = constants.zombieSize + constants.bulletSize;
                    if(withinRadius(zomb.x, zomb.y, bull.x, bull.y, rad)){
                        zomb.health -= constants.bulletDamage;
                        bull.health -= constants.zombieDamage;
                        if(bull.health  < 0)
                            b = b.slice(0, i).concat(b.slice(i+1, b.length));
                    }
                });
            }
        }
        if(z.length > 0 && b.length > 0){
            for(var i = 0; i < z.length; i++){
                zombieCollide(i);
            }
            for(var i = 0; i < b.length; i++){
                bulletCollide(i);
            }
        }
    };
}

/*******************************************************************************
* Main Function
*/

function Main(){
    // Interface variables
    var canvas = document.getElementById('gameStage');
    var ctx = canvas.getContext("2d");
    var keyMap = [false, false, false, false]; // WASD pressed
    var objList = []; // All objects
    var zombieArray = [];
    var p1 = new player();
    var worldMovement = {x:0, y:0, dx:0, dy:0};
    var shotCounter = 0;
    var gameTimer = 0;
    var score = 0;
    var gameLoop;
    var objInserter = new Inserter(obs);
    var obstacleMovement = {x:0, y:0, dx:0, dy:0};
    var gameObj = new game();
    //objInserter.test();
    
    // Background image
    var bg = new Image();
    bg.onload = function(){
        //ctx.beginPath();
        //ctx.drawImage(bg,0,0); // wait for load
        //ctx.closePath();
    };
    bg.src = "resources/hex_bg.png";

    // respond to events
    document.getElementById("doc").onkeydown = gameObj.arrowDown;
    document.getElementById("doc").onkeyup = gameObj.arrowUp;
    document.getElementById("doc").onclick = gameObj.mouseClick;

    // Update
    function update(){
        // Display
        document.getElementById("score").innerHTML = "Score: " + score;
        document.getElementById("health").innerHTML = "Health: " + p1.health;

        // Game objects
        if(Math.random() < Math.log(gameTimer)*constants.spawnRate && zombieArray.length < constants.maxZombies)
            zombieArray.push(new zombie());

        gameObj.updater.update(zombieArray, gameObj.bullets.bullets);
        zombieArray.forEach(function(v, i, arr){
            // move
            if(v.x < constants.canvasWidth/2+constants.canvasWidth/8){
                v.found = true;
            }
            if(v.found){
                var xcomp = constants.canvasWidth/2 - v.x;
                var ycomp = constants.canvasHeight/2 - v.y;
                v.dx = constants.zombieSpeed*xcomp*normalize(xcomp, ycomp);
                v.dy = constants.zombieSpeed*ycomp*normalize(xcomp, ycomp);
            }
            v.x += v.dx + worldMovement.dx;
            v.y += v.dy + worldMovement.dy;

            // detect collisions
            //bulletArray.forEach(function(b, j, arr){
            //  if(Math.abs(v.x-b.x)<constants.zombieSize && Math.abs(v.y-b.y)<constants.zombieSize){
            //      v.health -= b.damage;
            //      b.health -= v.damage;
            //      if(v.health < 1)
            //          score++;
            //  }});
            if(Math.abs(v.x-p1.x)<constants.zombieSize && Math.abs(v.y-p1.y)<constants.zombieSize){
                v.health -= p1.damage;
                p1.health -= v.damage;
                if(v.health < 1)
                    score++;
            }
            zombieArray.forEach(function(v2, i2, arr){
                if(Math.abs(v.x-v2.x)<constants.zombieSize*2 && Math.abs(v2.y-v.y)<constants.zombieSize*2 && i != i2){
                    // undo movement
                    v.x -= v.dx + worldMovement.dx;
                    v.y -= v.dy + worldMovement.dy;
                }
            });

        });

        // Remove objects
        zombieArray = zombieArray.filter(function(v){
            return v.health > 0 && v.x > -constants.canvasWidth && v.x < 2*constants.canvasWidth
                && v.y > -constants.canvasHeight && v.y <2* constants.canvasWidth;
        });

        if(p1.health < 1){
            zombieArray = [];
            clearInterval(gameLoop);
            Main();
        }
    }

    function render(){
        // This stuff should be moved to update
        ctx.clearRect(0,0,constants.canvasWidth,constants.canvasHeight);
        // Background: detirmines direction, adjusts speed, and loops when at edge of map
        var raw_x = (gameObj.keyMap[1]?1:0) + (gameObj.keyMap[3]?-1:0);
        var raw_y = (gameObj.keyMap[0]?1:0) + (gameObj.keyMap[2]?-1:0);
        worldMovement.dx = constants.playerSpeed*raw_x*normalize(raw_x, raw_y);
        worldMovement.dy = constants.playerSpeed*raw_y*normalize(raw_x, raw_y);
        worldMovement.x += worldMovement.dx;
        worldMovement.y += worldMovement.dy;
        if (worldMovement.x > 0)
            worldMovement.x -= constants.gridSize;
        if (worldMovement.x < -constants.gridSize)
            worldMovement.x += constants.gridSize;
        if (worldMovement.y > 0)
            worldMovement.y -= constants.hexGrid;
        if (worldMovement.y < -constants.hexGrid)
            worldMovement.y += constants.hexGrid;
        ctx.beginPath();
        ctx.drawImage(bg,worldMovement.x,worldMovement.y);

        obstacleMovement.dx = constants.playerSpeed*raw_x*normalize(raw_x, raw_y);
        obstacleMovement.dy = constants.playerSpeed*raw_y*normalize(raw_x, raw_y);
        obstacleMovement.x += obstacleMovement.dx;
        obstacleMovement.y += obstacleMovement.dy;
        if (obstacleMovement.x > 0){
            obstacleMovement.x -= constants.gridSize;
            objInserter.addNewWall('l');
        }
        if (obstacleMovement.x < -constants.gridSize){
            obstacleMovement.x += constants.gridSize;
            objInserter.addNewWall('r');
        }
        if (obstacleMovement.y > 0){
            obstacleMovement.y -= constants.gridSize;
            objInserter.addNewWall('t');
        }
        if (obstacleMovement.y < -constants.gridSize){
            obstacleMovement.y += constants.gridSize;
            objInserter.addNewWall('b');
        }

        objInserter.adjust(obstacleMovement.dx, obstacleMovement.dy);
        //objInserter.objects.forEach(function(v, i, arr){
        //    v.adjust(obstacleMovement.dx, obstacleMovement.dy);
        //});

        // foreground
        zombieArray.forEach(function(v, i, arr){
            ctx.beginPath();
            ctx.arc(v.x,v.y,constants.zombieSize,0,2*Math.PI);
            ctx.fillStyle = '#105F10';
            ctx.fill();
            ctx.fillStyle = '#000000';
        });
        gameObj.test();
        objInserter.getLines().forEach(function(v, i, arr){
            ctx.beginPath();
            ctx.moveTo(v.p.x, v.p.y);
            ctx.lineTo(v.q.x, v.q.y);
            ctx.stroke();
        });
        ctx.beginPath();
        ctx.arc(p1.x,p1.y,constants.playerSize,0,2*Math.PI);
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
        gameLoop=setInterval(mainLoop, constants.frameTime);
    }
}
