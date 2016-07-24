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

/*-------- Zombie Class ------------------------------------------------------*/
function hash(){
    this.values = [];
    this.addGrid = function(x,y,o){
        if(typeof this.values[x] == 'undefined'){
            this.values[x] = [];
            this.values[x][y] = [o];
        }
        else if(typeof this.values[x][y] == 'undefined')
            this.values[x][y] = [o];
        else{
            this.values[x][y].push(o);
        }
    }   
    this.add = function(o){
        var x = div(o.x);
        var y = div(o.y);
        this.addGrid(x, y, o);
        this.addGrid(x-1, y, o);
        this.addGrid(x+1, y, o);
        this.addGrid(x, y-1, o);
        this.addGrid(x, y+1, o);
    }
    this.addAll = function(arr){
        this.values = [];
        if(arr.length > 0)
            for(var i = 0; i < arr.length; i++)
                this.add(arr[i]);
    }
    this.collidesWith = function(o){
        var x = div(o.x);
        var y = div(o.y);
        if(typeof this.values[x] != 'undefined' && typeof this.values[x][y] != 'undefined')
            return this.values[x][y].slice();
        else
            return [];
    }
    this.collideAll = function(arr, fun){
        if(arr.length > 0)
            for(var i = 0; i < arr.length; i++)
                fun(arr[i], this.collidesWith(arr[i]));
    }
    this.test = function(){
        function print(o, arr){
            console.log(o);
            console.log(arr);
        }
        this.addAll([
            {x: 16, y: 16},
            {x:300, y: 300},
            {x: 15, y:15}
        ]);
        this.collideAll([
            {x: 12, y: 12}
        ], print);
    }
}
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
    var objs = {
        keyMap: [false, false, false, false],
        player: new player(),
        bullets: [],
        zombies: [],
        worldMovement: {x:0, y:0, dx:0, dy:0},
        objInserter: new Inserter(obs),
        obstacleMovement: {x:0, y:0, dx:0, dy:0},
        shotCounter: 0,
        score: 0
    }
    this.test = 0;
    this.updater = new updater();
    this.renderer = new renderer();
    var g = this; // so next functions aren't confused by 'this'
    this.arrowDown = function(e){
        switch(e.keyCode){
        case 87: case 38: objs.keyMap[0] = true; break; //w and up
        case 65: case 37: objs.keyMap[1] = true; break; //a and left
        case 83: case 40: objs.keyMap[2] = true; break; //s and down
        case 68: case 39: objs.keyMap[3] = true; break; //d and right
        }
    };
    this.arrowUp = function(e){
        switch(e.keyCode){
        case 87: case 38: objs.keyMap[0] = false; break; //w and up
        case 65: case 37: objs.keyMap[1] = false; break; //a and left
        case 83: case 40: objs.keyMap[2] = false; break; //s and down
        case 68: case 39: objs.keyMap[3] = false; break; //d and right
        }
    };
    this.mouseClick = function(e){
        if(objs.shotCounter < 1){
            mouseX = e.pageX - g.renderer.canvas.getBoundingClientRect().left;
            mouseY = e.pageY - g.renderer.canvas.getBoundingClientRect().top;
            objs.bullets.push(new bullet(mouseX, mouseY));
        }
    };
    this.update = function(){
        return this.updater.update(objs);
    };
    this.render = function(){
        this.renderer.render(objs);
    };
}

function renderer(){
    this.canvas = document.getElementById('gameStage');
    this.ctx = this.canvas.getContext("2d");
    this.bg = new Image();
    var r = this;
    this.bg.src = "resources/hex_bg.png";
    this.player = function(p){
        this.ctx.beginPath();
        this.ctx.arc(p.x,p.y,constants.playerSize,0,2*Math.PI);
        this.ctx.fill();
    }
    this.bullets = function(b){
        b.forEach(function(v, i, arr){
            r.ctx.beginPath();
            r.ctx.arc(v.x,v.y,constants.bulletSize,0,2*Math.PI);
            r.ctx.fill();
        });
    }
    this.zombies = function(z){
        z.forEach(function(v, i, arr){
            r.ctx.beginPath();
            r.ctx.arc(v.x,v.y,constants.zombieSize,0,2*Math.PI);
            r.ctx.fillStyle = '#105F10';
            r.ctx.fill();
            r.ctx.fillStyle = '#000000';
        });
    }
    this.world = function(worldMovement){
        this.ctx.beginPath();
        this.ctx.drawImage(this.bg,worldMovement.x,worldMovement.y);
        this.ctx.closePath();
    }
    this.obstacles = function(obstaclemovement, objinserter){
        objinserter.getLines().forEach(function(v, i, arr){
            r.ctx.beginPath();
            r.ctx.moveTo(v.p.x, v.p.y);
            r.ctx.lineTo(v.q.x, v.q.y);
            r.ctx.stroke();
        });
    }
    this.render = function(objs){
        this.ctx.clearRect(0,0,constants.canvasWidth,constants.canvasHeight);
        this.world(objs.worldMovement);
        this.zombies(objs.zombies);
        this.bullets(objs.bullets);
        this.player(objs.player);
        this.obstacles(objs.obstacleMovement, objs.objInserter)
    }
}

function updater(){
    var gameTimer = 0;
    var zombieHash = new hash();
    var killed = 0;
    function updateZombie(z, worldMovement){
        // move
        if(z.x < constants.canvasWidth/2+constants.canvasWidth/8){
            z.found = true;
        }
        if(z.found){
            var xcomp = constants.canvasWidth/2 - z.x;
            var ycomp = constants.canvasHeight/2 - z.y;
            z.dx = constants.zombieSpeed*xcomp*normalize(xcomp, ycomp);
            z.dy = constants.zombieSpeed*ycomp*normalize(xcomp, ycomp);
        }
        z.x += z.dx + worldMovement.dx;
        z.y += z.dy + worldMovement.dy;

        if(z.health <= 0)
            score++;
    }
    this.player = function(p){
        zombieHash.collideAll([p], function(p, arr){
            var rad = constants.zombieSize + constants.bulletSize;
            arr.forEach(function(z, index, arr){
                if(withinRadius(z.x, z.y, p.x, p.y, rad)){
                    z.health -= p.damage;
                    p.health -= z.damage;
                }
            });
        });
        return p;
    };
    this.world = function(worldMovement, keyMap){
        var raw_x = (keyMap[1]?1:0) + (keyMap[3]?-1:0);
        var raw_y = (keyMap[0]?1:0) + (keyMap[2]?-1:0);
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

    };
    this.obstacles = function(obstaclemovement, objinserter, keyMap){
        var raw_x = (keyMap[1]?1:0) + (keyMap[3]?-1:0);
        var raw_y = (keyMap[0]?1:0) + (keyMap[2]?-1:0);
        obstaclemovement.dx = constants.playerspeed*raw_x*normalize(raw_x, raw_y);
        obstaclemovement.dy = constants.playerspeed*raw_y*normalize(raw_x, raw_y);
        obstaclemovement.x += obstaclemovement.dx;
        obstaclemovement.y += obstaclemovement.dy;
        if (obstaclemovement.x > 0){
            obstaclemovement.x -= constants.gridsize;
            objinserter.addnewwall('l');
        }
        if (obstaclemovement.x < -constants.gridsize){
            obstaclemovement.x += constants.gridsize;
            objinserter.addnewwall('r');
        }
        if (obstaclemovement.y > 0){
            obstaclemovement.y -= constants.gridsize;
            objinserter.addnewwall('t');
        }
        if (obstaclemovement.y < -constants.gridsize){
            obstaclemovement.y += constants.gridsize;
            objinserter.addnewwall('b');
        }

        objinserter.adjust(obstaclemovement.dx, obstaclemovement.dy);
        
    }
    this.zombies = function(z, worldMovement){
        killed = 0;
        zombieHash.addAll(z);
        if(Math.random() < Math.log(gameTimer)*constants.spawnRate && z.length < constants.maxZombies)
            z.push(new zombie());
        z.forEach(function(v,i,arr){
            updateZombie(v, worldMovement);
            if(v.health <= 0)
                killed++;
        });
        return z.filter(function(v){
            return v.health > 0 && v.x > -constants.canvasWidth && v.x < 2*constants.canvasWidth
                && v.y > -constants.canvasHeight && v.y <2* constants.canvasWidth;
        });
    };
    this.bullets = function(b){
        zombieHash.collideAll(b, function(b, arr){
            var rad = constants.zombieSize + constants.bulletSize;
            arr.forEach(function(z, index, arr){
                if(withinRadius(z.x, z.y, b.x, b.y, rad)){
                    z.health -= b.damage;
                    b.health -= z.damage;
                }
            });
        });
        b.forEach(function(v, i, arr){
            v.x += v.dx;
            v.y += v.dy;
        });
        return b.filter(function(v){ // clear out extra bullets
            return v.health > 0 &&
                   v.x > 0 && v.x < constants.canvasWidth &&
                   v.y > 0 && v.y < constants.canvasWidth;
        });
    };
    this.update = function(objs){
        document.getElementById("score").innerHTML = "Score: " + objs.score;
        document.getElementById("health").innerHTML = "Health: " + objs.player.health;
        objs.zombies = this.zombies(objs.zombies, objs.worldMovement);
        objs.bullets = this.bullets(objs.bullets);
        objs.player = this.player(objs.player);
        this.world(objs.worldMovement, objs.keyMap);
        this.obstacles(objs.obstacleMovement, objs.objInserter, objs.keyMap);
        gameTimer++;
        objs.shotCounter--;
        objs.score += killed;

        if(objs.player.health <= 0)
            return false;
        else
            return true;
    };
}

/*******************************************************************************
* Main Function
*/

function Main(){
    // Interface variables
    var gameLoop;
    var gameObj = new game();

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
        gameLoop = setInterval(mainloop, constants.frameTime);
    }
}
