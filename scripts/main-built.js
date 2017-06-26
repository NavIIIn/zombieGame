/*******************************************************************************
* Constants
*/
define('constants',{
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
    maxZombies    :  40,
    wallWidth     :  4,
    nearVal       :  4,
    hashRefresh   :  10
});

/*******************************************************************************
 * KeyMap Object
 */
define('keyMap',[], function(){
    function KeyMap(){
        this.arr = [false, false, false, false];
    }
    KeyMap.prototype.arrowDown = function(e){
        switch(e.keyCode){
        case 87: case 38: this.arr[0] = true; break; //w and up
        case 65: case 37: this.arr[1] = true; break; //a and left
        case 83: case 40: this.arr[2] = true; break; //s and down
        case 68: case 39: this.arr[3] = true; break; //d and right
        }
    };
    KeyMap.prototype.arrowUp = function(e){
        switch(e.keyCode){
        case 87: case 38: this.arr[0] = false; break; //w and up
        case 65: case 37: this.arr[1] = false; break; //a and left
        case 83: case 40: this.arr[2] = false; break; //s and down
        case 68: case 39: this.arr[3] = false; break; //d and right
        }
    };
    KeyMap.prototype.getHorizontalDir = function(){
        // returns 1 for left, -1 for right, 0 for no movement
        return (this.arr[1]?1:0) + (this.arr[3]?-1:0);
    }
    KeyMap.prototype.getVerticalDir = function(){
        // returns 1 for up, -1 for down, 0 for no movement
        return (this.arr[0]?1:0) + (this.arr[2]?-1:0);
    }
    return KeyMap;
});

/*******************************************************************************
 * Geometry Tools
 *   - flipCoin: 50% chance of returning true
 *   - normalize: Helper with math for movement components
 *   - distance: returns distance between p1 and p2
 */
define('geometry',[], function(){
    function _flipCoin(){
        return Math.random()>0.5;
    }
    function _normalize(x, y){
        if(x==0 && y==0)
            return 0;
        else
            return Math.sqrt(1/(Math.pow(x,2)+Math.pow(y,2)));
    }
    function _normalizeX(x, y, speed){
        return speed*x*_normalize(x, y);
    }
    function _normalizeY(x, y, speed){
        return speed*y*_normalize(x, y);
    }
    function _distance(x1, y1, x2, y2){
        return Math.sqrt(Math.pow(x1-x2,2)+Math.pow(y1-y2,2));
    }
    function _intersects(p1, q1, p2, q2){
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
    return {
        flipCoin: _flipCoin,
        normalizeX: _normalizeX,
        normalizeY: _normalizeY,
        distance: _distance,
        intersects: _intersects
    };
});

/*******************************************************************************
 * Point object
 */
define('point',['./constants', './geometry'], function(Constants, Geometry){
    function Point(x, y){
        this.x = x;
        this.y = y;
    }
    Point.prototype.copy = function(){
        return new Point(this.x, this.y);
    };
    Point.prototype.distance = function(other){
        return Geometry.distance(this.x, this.y,
                                 other.x, other.y);
    };
    Point.prototype.isNear = function(other, rad){
        if(rad)
            return this.distance(other) < rad;
        else
            return this.distance(other) < Constants.nearVal;
    };
    Point.prototype.equals = function(other){
        return this.x == other.x && this.y == other.y;
    };
    Point.prototype.adjust = function(dx, dy){
        this.x += dx;
        this.y += dy;
    };
    return Point;
});

/*******************************************************************************
 * Line object
 */
define('line',['./constants', './geometry'], function(Constants, Geometry){
    function Line(p, q){
        this.p = p;
        this.q = q;
    }
    Line.prototype.copy = function(){
        return new Line(this.p.copy(), this.q.copy());
    };
    Line.prototype.intersects = function(a, b){
        return Geometry.intersects(a, b, this.p, this.q);
    };
    Line.prototype.adjust = function(dx, dy){
        this.p.adjust(dx, dy);
        this.q.adjust(dx, dy);
    };
    Line.prototype.collides = function(pt, size){
        var inX = pt.x > this.p.x - size && pt.x < this.q.x + size
            || pt.x > this.q.x - size && pt.x < this.p.x + size;
        var inY = pt.y > this.p.y - size && pt.y < this.q.y + size 
            || pt.y > this.q.y - size && pt.y < this.p.y + size;
        var inLine = inY && inX;
        
        var lr = this.p.x > pt.x && this.q.x > pt.x
            || this.p.x < pt.x && this.q.x < pt.x;
        var tb = this.p.y > pt.y && this.q.y > pt.y
            || this.q.y < pt.y && this.q.y < pt.y;
        var onCorner = lr && tb;

        return inLine && !onCorner;
    };
    Line.prototype.getCollisionDirection = function(pt, size){
        var dir = {right: false, left: false, top: false, bottom: false };
        if(this.collides(pt, size)){
            dir.right  = this.p.x > pt.x && this.q.x > pt.x;
            dir.left   = this.p.x < pt.x && this.q.x < pt.x;
            dir.top    = this.p.y < pt.y && this.q.y < pt.y;
            dir.bottom = this.p.y > pt.y && this.q.y > pt.y;
        }
        return dir;
    };
    return Line;
});

/*******************************************************************************
 * Obstacle Object
 */
define('obstacle',[], function(){
    function Obstacle(lines, edges){
        this.edges = edges;
        this.lines = lines;
        this.x = 0;
        this.y = 0;
    }
    Obstacle.prototype.getCorners = function(){
        return this.edges.reduce(function(acc, cur){
            return acc.concat(cur.corners);
        }, []);
    };
    Obstacle.prototype.adjust = function(dx, dy){
            for(var i = 0; i < this.lines.length; i++)
                this.lines[i].adjust(dx,dy);
            for(i = 0; i < this.edges.length; i++)
                this.edges[i].adjust(dx,dy);
            this.x += dx;
            this.y += dy;
            return this;
    };
    Obstacle.prototype.copy = function(){
        var newLines = [];
        var newEdges = [];
        this.lines.forEach(function(v, i, arr){
            newLines.push(v.copy());
        });
        this.edges.forEach(function(v, i, arr){
            newEdges.push(v.copy());
        });
        return new Obstacle(newLines, newEdges);
    };
    Obstacle.prototype.removeDuplicateEdges = function(other){
        var dupIndexA;
        var dupIndexB;
        var foundDup = false;
        this.edges.forEach(function(edgeA, indexA, arrA){
            other.edges.forEach(function(edgeB, indexB, arrB){
                if(edgeA.isNear(edgeB)){
                    dupIndexA = indexA;
                    dupIndexB = indexB;
                    foundDup = true;
                }
            });
        });
        if(foundDup){
            this.edges.splice(dupIndexA, 1);
            other.edges.splice(dupIndexB, 1);
        }
    };
    Obstacle.prototype.collides = function(obj, size){
        return this.lines.reduce(function(acc, cur){
            return acc || cur.collides(obj, size);
        }, false);
    };
    Obstacle.prototype.getCollisionDirection = function(pt, size){
        return {
            right: this.lines.some(function(cur){
                return cur.getCollisionDirection(pt, size).right;
            }),
            left: this.lines.some(function(cur){
                return cur.getCollisionDirection(pt, size).left;
            }),
            top: this.lines.some(function(cur){
                return cur.getCollisionDirection(pt, size).top;
            }),
            bottom: this.lines.some(function(cur){
                return cur.getCollisionDirection(pt, size).bottom;
            })
        };
    };
    return Obstacle;
});

/*******************************************************************************
 * Edge Object
 */
define('edge',['./constants', './point', './line', './obstacle'], function(Constants, Point, Line, Obstacle){
    function Edge(pt, dir){
        Point.call(this, pt.x, pt.y, dir);
        this.dir = dir;
        var moveAmt = Constants.zombieSize;
        if(dir == 'up'){
            this.corners = [new Point(pt.x+moveAmt, pt.y-moveAmt),
                            new Point(pt.x-moveAmt, pt.y-moveAmt)];
        }
        else if(dir == 'down'){
            this.corners = [new Point(pt.x+moveAmt, pt.y+moveAmt),
                            new Point(pt.x-moveAmt, pt.y+moveAmt)];
        }
        else if(dir == 'left'){
            this.corners = [new Point(pt.x-moveAmt, pt.y+moveAmt),
                            new Point(pt.x-moveAmt, pt.y-moveAmt)];
        }
        else if(dir == 'right'){
            this.corners = [new Point(pt.x+moveAmt, pt.y+moveAmt),
                            new Point(pt.x+moveAmt, pt.y-moveAmt)];
        }
        else
            console.log('invalid direction');
    }
    Edge.prototype = Object.create(Point.prototype);
    Edge.prototype.copy = function(){
        return new Edge(this, this.dir);
    };
    Edge.prototype.adjust = function(dx, dy){
        this.x += dx;
        this.y += dy;
        for(var i = this.corners.length; i--;)
            this.corners[i].adjust(dx, dy);
    };
    return Edge;
});

/*******************************************************************************
 * Obstacle Factory
 */
define('obstacleFactory',['./constants', './point', './line', './edge', './obstacle'], function(Constants, Point, Line, Edge, Obstacle){
    // returns a list of potential obstacles
    function getObstacles(){
        var wallLength = Constants.gridSize/2;

        var middle = new Point(wallLength, wallLength);
        var topEdge = new Point(wallLength, 0);
        var bottomEdge = new Point(wallLength, wallLength*2);
        var leftEdge = new Point(0, wallLength);
        var rightEdge = new Point(wallLength*2, wallLength);
        var topMid = new Point(wallLength, wallLength/2);
        var bottomMid = new Point(wallLength, wallLength*3/2);
        var leftMid = new Point(wallLength/2, wallLength);
        var rightMid = new Point(wallLength*3/2, wallLength);

        // corners
        var tl = new Point(0, 0);
        var tr = new Point(wallLength*2, 0);
        var bl = new Point(0, wallLength*2);
        var br = new Point(wallLength*2, wallLength*2);

        // lines spanning 2 wall lengths
        var lineV2 = new Line(topEdge, bottomEdge);
        var lineH2 = new Line(leftEdge, rightEdge);
        //  lines spanning 1 wall length
        var lineV1a = new Line(topEdge, middle);
        var lineV1b = new Line(middle, bottomEdge);
        var lineH1a = new Line(leftEdge, middle);
        var lineH1b = new Line(middle, rightEdge);
        // lines spanning half a wall length
        var lineV12a = new Line(topEdge, topMid);
        var lineV12b = new Line(topMid, middle);
        var lineV12c = new Line(middle, bottomMid);
        var lineV12d = new Line(bottomMid, bottomEdge);
        var lineH12a = new Line(leftEdge, leftMid);
        var lineH12b = new Line(leftMid, middle);
        var lineH12c = new Line(middle, rightMid);
        var lineH12d = new Line(rightMid, rightEdge);
        // lines spanning 3/2 a wall length
        var lineV32a = new Line(topEdge, bottomMid);
        var lineV32b = new Line(topMid, bottomEdge);
        var lineH32a = new Line(leftEdge, rightMid);
        var lineH32b = new Line(leftMid, rightEdge);

        var c_a = [new Edge(topEdge, 'up'),
                   new Edge(bottomMid, 'down')];
        var c_b = [new Edge(topMid, 'up'),
                   new Edge(bottomEdge, 'down')];
        var c_c = [new Edge(leftEdge, 'left'),
                   new Edge(rightMid, 'right')];
        var c_d = [new Edge(leftMid, 'left'),
                   new Edge(rightEdge, 'right')];
        var c_e = [new Edge(topEdge, 'up'),
                   new Edge(leftMid, 'left'),
                   new Edge(rightMid, 'right')];
        var c_f = [new Edge(bottomEdge, 'down'),
                   new Edge(leftMid, 'left'),
                   new Edge(rightMid, 'right')];
        var c_g = [new Edge(leftEdge, 'left'),
                   new Edge(topMid, 'up'),
                   new Edge(bottomMid, 'down')];
        var c_h = [new Edge(rightEdge, 'right'),
                   new Edge(topMid, 'up'),
                   new Edge(bottomMid, 'down')];

        allCorners = [tl, tr, bl, br];

        return [
            new Obstacle([lineV32a], [new Edge(topEdge, 'up'),
                                      new Edge(bottomMid, 'down')]),
            new Obstacle([lineV32b], [new Edge(topMid, 'up'),
                                      new Edge(bottomEdge, 'down')]),
            new Obstacle([lineH32a], [new Edge(leftEdge, 'left'),
                                      new Edge(rightMid, 'right')]),
            new Obstacle([lineH32b], [new Edge(leftMid, 'left'),
                                      new Edge(rightEdge, 'right')]),
            new Obstacle([lineV1a, lineH12b, lineH12c], [new Edge(topEdge, 'up'),
                                                         new Edge(leftMid, 'left'),
                                                         new Edge(rightMid, 'right')]),
            new Obstacle([lineV1b, lineH12b, lineH12c], [new Edge(bottomEdge, 'down'),
                                                         new Edge(leftMid, 'left'),
                                                         new Edge(rightMid, 'right')]),
            new Obstacle([lineH1a, lineV12b, lineV12c], [new Edge(leftEdge, 'left'),
                                                         new Edge(topMid, 'up'),
                                                         new Edge(bottomMid, 'down')]),
            new Obstacle([lineH1b, lineV12b, lineV12c], [new Edge(rightEdge, 'right'),
                                                         new Edge(topMid, 'up'),
                                                         new Edge(bottomMid, 'down')])
        ];
    }

    function ObstacleFactory(){
        this.obs = getObstacles();
    }
    ObstacleFactory.prototype.getRandomObs = function(x, y){
        var rand = Math.floor(Math.random()*this.obs.length);
        return this.obs[rand].copy().adjust(x, y);
    };
    ObstacleFactory.prototype.getGenerator = function* (x0, y0, x_int, y_int, size){
        for(var i = 0; i < size; i++)
            yield this.getRandomObs(x0+x_int*i, y0+y_int*i);
    };
    ObstacleFactory.prototype.get2dGenerator = function* (x0, y0, x_int, y_int, width, height){
        for(var i = 0; i < width; i++)
            for(var j = 0; j < height; j++)
                yield this.getRandomObs(x0+x_int*i, y0+y_int*j);
    };
    return ObstacleFactory;
});

/*******************************************************************************
 * 2D Array
 */
define('2dArray',['./constants', './geometry'], function(Constants, Geometry){
    function Arr2d(width, height){
        this.width = width;
        this.height = height;
        this.arr = [];
        for(var i = width; i--;)
            this.arr.push([]);
    }
    Arr2d.prototype.fill = function(generator){
        for(var i = 0; i < this.width; i++)
            for(var j = 0; j < this.height; j++)
                this.arr[i].push(generator.next().value);
    };
    Arr2d.prototype.getCornerTL = function(){
        return this.arr[0][0];
    };
    Arr2d.prototype.getCornerTR = function(){
        return this.arr[this.width-1][0];
    };
    Arr2d.prototype.getCornerBL = function(){
        return this.arr[0][this.height-1];
    };
    Arr2d.prototype.getCornerBR = function(){
        return this.arr[this.width-1][this.height-1];
    };
    Arr2d.prototype.addLeft = function(generator){
        var newWall = [];
        for(let item of generator)
            newWall.push(item);
        this.arr.unshift(newWall);
        this.arr.pop();
    };
    Arr2d.prototype.addRight = function(generator){
        var newWall = [];
        for(let item of generator)
            newWall.push(item);
        this.arr.push(newWall);
        this.arr.shift();
    };
    Arr2d.prototype.addTop = function(generator){
        for(let column of this.arr){
            column.unshift(generator.next().value);
            column.pop();
        }
    };
    Arr2d.prototype.addBottom = function(generator){
        for(let column of this.arr){
            column.push(generator.next().value);
            column.shift();
        }
    };
    Arr2d.prototype.getItems = function(){
        return this.arr.reduce(function(arr, cur){
            return arr.concat(cur);
        }, []);
    };
    Arr2d.prototype.get = function(i, j){
        return this.arr[i][j];
    };
    Arr2d.prototype[Symbol.iterator] = function* (){
        for(var i = 0; i < this.width; i++)
            for(var j = 0; j < this.height; j++)
                yield this.arr[i][j];
    };
    return Arr2d;
});

/*******************************************************************************
 * Obstacle Map
 */
define('obstacleMap',['./constants', './geometry', './obstacleFactory', './2dArray'], function(Constants, Geometry, ObstacleFactory, Arr2d){
    var gridSize = Constants.gridSize;
    var obsFactory = new ObstacleFactory();
    function ObstacleMap(){
        this.x = 0;
        this.y = 0;
        var width = Math.ceil(Constants.canvasWidth/gridSize) + 1;
        var height = Math.ceil(Constants.canvasHeight/gridSize) + 1;
        var gen = obsFactory.get2dGenerator(0, 0, gridSize, gridSize, width, height);
        this.arr = new Arr2d(width, height);
        this.arr.fill(gen);
        this.removeAllDuplicateCorners();
    }
    ObstacleMap.prototype.addLeft = function(){
        var adjX = this.arr.get(0,0).x - gridSize;
        var adjY = this.arr.get(0,0).y;
        var obsGen = obsFactory.getGenerator(adjX, adjY, 0, gridSize, this.arr.height);
        this.arr.addLeft(obsGen);
        for(var i = this.arr.height; i--;)
            this.removeAdjacentDuplicates(0, i);
    };
    ObstacleMap.prototype.addRight = function(){
        var startObs = this.arr.get(this.arr.width-1, 0);
        var adjX = startObs.x + gridSize;
        var adjY = startObs.y;
        var obsGen = obsFactory.getGenerator(adjX, adjY, 0, gridSize, this.arr.height);
        this.arr.addRight(obsGen);
        for(var i = this.arr.height; i--;)
            this.removeAdjacentDuplicates(this.arr.width-1, i);
    };
    ObstacleMap.prototype.addTop = function(){
        var adjX = this.arr.get(0,0).x;
        var adjY = this.arr.get(0,0).y - gridSize;
        var obsGen = obsFactory.getGenerator(adjX, adjY, gridSize, 0, this.arr.width);
        this.arr.addTop(obsGen);
        for(var i = this.arr.width; i--;)
            this.removeAdjacentDuplicates(i, 0);
    };
    ObstacleMap.prototype.addBottom = function(){
        var startObs = this.arr.get(0, this.arr.height-1);
        var adjX = startObs.x;
        var adjY = startObs.y + gridSize;
        var obsGen = obsFactory.getGenerator(adjX, adjY, gridSize, 0, this.arr.width);
        this.arr.addBottom(obsGen);
        for(var i = this.arr.width; i--;)
            this.removeAdjacentDuplicates(i, this.arr.height-1);
    };
    ObstacleMap.prototype.addWall = function(){
        if(this.x > 0){
            this.x -= Constants.gridSize;
            this.addLeft();
        }
        else if(this.x <= -Constants.gridSize){
            this.x += Constants.gridSize;
            this.addRight();
        }
        else if(this.y > 0){
            this.y -= Constants.gridSize;
            this.addTop();
        }
        else if(this.y <= -Constants.gridSize){
            this.y += Constants.gridSize;
            this.addBottom();
        }
    };
    ObstacleMap.prototype.getObstacles = function(){
        return this.arr.getItems();
    };
    ObstacleMap.prototype.getLines = function(){
        return this.getObstacles().reduce(function(acc, cur){
            return acc.concat(cur.lines.slice());
        }, []);
    };
    ObstacleMap.prototype.getEdges = function(){
        return this.getObstacles().reduce(function(acc, cur){
            return acc.concat(cur.edges);
        }, []);
    };
    ObstacleMap.prototype.getCorners = function(){
        return this.getObstacles().reduce(function(acc, cur){
            return acc.concat(cur.getCorners());
        }, []);
    };
    ObstacleMap.prototype.removeAdjacentDuplicates = function(i, j){
        var obs = this.arr.get(i, j);
        if(i > 0)
            obs.removeDuplicateEdges(this.arr.get(i-1, j));
        if(i < this.arr.width-1)
            obs.removeDuplicateEdges(this.arr.get(i+1, j));
        if(j > 0)
            obs.removeDuplicateEdges(this.arr.get(i, j-1));
        if(j < this.arr.height-1)
            obs.removeDuplicateEdges(this.arr.get(i, j+1));
    };
    ObstacleMap.prototype.removeAllDuplicateCorners = function(){
        for(i = 0; i < this.arr.width; i++)
            for(j = 0; j < this.arr.height; j++)
                this.removeAdjacentDuplicates(i, j);
    };
    ObstacleMap.prototype.adjust = function(dx, dy){
        for(let obs of this.arr)
            obs.adjust(dx, dy);
    };
    ObstacleMap.prototype.findNearestObstacle = function(obj){
        var gridX = Math.floor((obj.x-this.arr.get(0,0).x)/gridSize);
        var gridY = Math.floor((obj.y-this.arr.get(0,0).y)/gridSize);
        if(gridX >= 0 && gridY >= 0 &&
          gridX < this.arr.width && gridY < this.arr.height)
            return this.arr.get(gridX, gridY);
        else
            return this.arr.get(0,0);
    };
    ObstacleMap.prototype.move = function(worldMovement){
        this.x += worldMovement.dx;
        this.y += worldMovement.dy;
        this.adjust(worldMovement.dx, worldMovement.dy);
    };
    ObstacleMap.prototype.getCollisionDirection = function(obj, size){
        var obs = this.findNearestObstacle(obj);
        return obs.getCollisionDirection(obj, size);
    };
    ObstacleMap.prototype.lineOfSight = function(p1, p2){
        return !this.getLines().some(function(v){
            return v.intersects(p1, p2);
        });
    };
    return ObstacleMap;
});


/*******************************************************************************
 * World Movement
 */
define('world',['./constants', './geometry'], function(Constants, Geometry){
    function World(){
        this.x = 0;
        this.y = 0;
        this.dx = 0;
        this.dy = 0;
    };
    World.prototype.move = function(keyMap, obsMap, player){
        var dir = obsMap.getCollisionDirection(player, Constants.playerSize);
        var raw_x = keyMap.getHorizontalDir();
        var raw_y = keyMap.getVerticalDir();
        this.dx = Geometry.normalizeX(raw_x, raw_y, Constants.playerSpeed);
        this.dy = Geometry.normalizeY(raw_x, raw_y, Constants.playerSpeed);
        if((dir.right && this.dx < 0) || (dir.left && this.dx > 0))
            this.dx = 0;
        if((dir.top && this.dy > 0) || (dir.bottom && this.dy < 0))
            this.dy = 0;
        this.x += this.dx;
        this.y += this.dy;
        if(this.x > 0)
            this.x -= Constants.gridSize;
        if(this.x < -Constants.gridSize)
            this.x += Constants.gridSize;
        if(this.y > 0)
            this.y -= Constants.hexGrid;
        if(this.y < -Constants.hexGrid)
            this.y += Constants.hexGrid;
    };
    return World;
});

/*******************************************************************************
 * Live Point Constructor
 */
define('livePoint',['./constants', './point'], function(Constants, Point){
    function LivePoint(x, y, health, damage, dx, dy){
        Point.call(this, x, y);
        this.health = health;
        this.damage = damage;
        this.dx = dx;
        this.dy = dy;
    }
    LivePoint.prototype = Object.create(Point.prototype);
    LivePoint.prototype.hit = function(other){
        this.health -= other.damage;
    };
    LivePoint.prototype.dead = function(){
        return this.health <= 0;
    };
    LivePoint.prototype.inSquare = function(xmin, xmax, ymin, ymax){
        return this.x > xmin && this.x < xmax
            && this.y > ymin && this.y < ymax;
    };
    LivePoint.prototype.move = function(){
        this.adjust(this.dx, this.dy);
    };
    return LivePoint;
});

/*******************************************************************************
 * Player Constructor
 */
define('player',['./constants', './livePoint'], function(Constants, LivePoint){
    function Player(){
        LivePoint.call(this, Constants.canvasWidth/2, Constants.canvasHeight/2,
                   Constants.playerHealth, Constants.meleeDamage, 0, 0);
        this.size = Constants.playerSize;
    }
    Player.prototype = Object.create(LivePoint.prototype);
    Player.prototype.getCollisionDirection = function(obsMap){
        var obs = obsMap.findNearestObstacle(this);
        return {
            right: obs.lines.some(function(cur){
                return cur.collides(obj, this.size) &&
                    cur.p.x > obj.x && cur.q.x > obj.x &&
                    !corner(cur, obj);
            }),
            left: obs.lines.some(function(cur){
                return cur.collides(obj, this.size) &&
                    cur.p.x < obj.x && cur.q.x < obj.x &&
                    !corner(cur, obj);
            }),
            top: obs.lines.some(function(cur){
                return cur.collides(obj, this.size) &&
                    cur.p.y < obj.y && cur.q.y < obj.y &&
                    !corner(cur, obj);
            }),
            bottom: obs.lines.some(function(cur){
                return cur.collides(obj, this.size) &&
                    cur.p.y > obj.y && cur.q.y > obj.y &&
                    !corner(cur, obj);
            })
        };
    };
    return Player;
});

/*******************************************************************************
 * Geometry Tools
 *   - flipCoin: 50% chance of returning true
 *   - normalize: Helper with math for movement components
 *   - distance: returns distance between p1 and p2
 */
define('Geometry',[], function(){
    function _flipCoin(){
        return Math.random()>0.5;
    }
    function _normalize(x, y){
        if(x==0 && y==0)
            return 0;
        else
            return Math.sqrt(1/(Math.pow(x,2)+Math.pow(y,2)));
    }
    function _normalizeX(x, y, speed){
        return speed*x*_normalize(x, y);
    }
    function _normalizeY(x, y, speed){
        return speed*y*_normalize(x, y);
    }
    function _distance(x1, y1, x2, y2){
        return Math.sqrt(Math.pow(x1-x2,2)+Math.pow(y1-y2,2));
    }
    function _intersects(p1, q1, p2, q2){
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
    return {
        flipCoin: _flipCoin,
        normalizeX: _normalizeX,
        normalizeY: _normalizeY,
        distance: _distance,
        intersects: _intersects
    };
});

/*******************************************************************************
 * Bullet Constructor
 */
define('bullet',['./constants', './point', './livePoint', './Geometry'], function(Constants, Point, LivePoint, Geometry){
    function Bullet(x, y){
        var centerX = Constants.canvasWidth/2;
        var centerY = Constants.canvasHeight/2;
        var xcomp   = x - centerX;
        var ycomp   = y - centerY;
        LivePoint.call(this, centerX, centerY,
                       1, Constants.bulletDamage,
                       Geometry.normalizeX(xcomp, ycomp, Constants.bulletSpeed),
                       Geometry.normalizeY(xcomp, ycomp, Constants.bulletSpeed));
        this.firePosition = new Point(centerX, centerY);
    }
    Bullet.prototype = Object.create(LivePoint.prototype);
    Bullet.prototype.size = Constants.bulletSize;
    Bullet.prototype.inBounds = function(){
        return this.inSquare(0, Constants.canvasWidth, 0, Constants.canvasHeight);
    };
    Bullet.prototype.adjustWorld = function(dx, dy){
        this.x += dx;
        this.y += dy;
        this.firePosition.adjust(dx, dy);
    };
    return Bullet;
});

/*******************************************************************************
 * BulletList Object
 */
define('bulletList',['./bullet'], function(Bullet){
    function BulletList(){
        this.arr = [];
        this.shotCounter = 0;
    }
    BulletList.prototype.add = function(x, y){
        this.arr.push(new Bullet(x,  y));
    };
    BulletList.prototype.move = function(world){
        for(let b of this.arr){
            b.move();
            b.adjustWorld(world.dx, world.dy);
        }
    };
    BulletList.prototype.remove = function(obsMap){
        this.arr = this.arr.filter(function(v){
            return !v.dead() && v.inBounds() &&
                obsMap.lineOfSight(v, v.firePosition);
        });
    };
    BulletList.prototype[Symbol.iterator] = function* (){
        for(let b of this.arr)
            yield b;
    };
    return BulletList;
});

/*******************************************************************************
 * Hash Constructor
 * index represents grid number increasing from left to right
 * last index contains points off the grid
 */
define('spacialHash',['./constants'], function(Constants){
    var gridX = Constants.canvasWidth/4;
    var gridY = Constants.canvasHeight/4;

    function removeDuplicates(result, cur){
        if(!result.includes(cur))
            result.push(cur);
        return result;
    }
    function arrayFactory(len){
        var result = [];
        while(result.length < len)
            result.push([]);
        return result;
    }

    function Table(items){
        this.length = 17;
        this.arr = arrayFactory(this.length);
        if(items) // initial values given
            for(let cur of items)
                this.insert(cur);
    }
    Table.prototype.getIndex = function(x, y){
        var x = Math.floor(x/gridX);
        var y = Math.floor(y/gridY);
        if(x < 0 || x > 3 || y < 0 || y > 3)
            return this.length-1;
        else
            return y*4+x;
    };
    Table.prototype.getIndices = function(pt){
        var borders = pt.getBorders();
        var indices = [this.getIndex(borders.left, borders.top),
                       this.getIndex(borders.left, borders.bottom),
                       this.getIndex(borders.right, borders.top),
                       this.getIndex(borders.right, borders.bottom)];
        return indices.reduce(removeDuplicates, []);
    };
    Table.prototype.insert = function(pt){
        var indices = this.getIndices(pt);
        for(let i of indices)
            this.arr[i].push(pt);
    };
    Table.prototype.getCollidingItem = function(pt, rad){
        return this.arr[this.getIndex(pt.x, pt.y)].find(function(v){
            return v.isNear(pt, rad);
        });
    };
    Table.prototype.getCollidingItems = function(pt, rad){
        return this.arr[this.getIndex(pt.x, pt.y)].filter(function(v){
            return v.isNear(pt, rad);
        });
    };
    Table.prototype[Symbol.iterator] = function* (){
        var seen = [];
        for(let grid of this.arr)
            for(let cur of grid)
                if(!seen.includes(cur)){
                    seen.push(cur);
                    yield cur;
                }
    };
    Table.prototype.getSize = function(){
        var count = 0;
        for(let grid of this.arr)
            count += grid.length;
        return count;
    };
    Table.prototype.filter = function(fn){
        for(let i = this.arr.length; i--;)
            this.arr[i] = this.arr[i].filter(fn);
        //for(let grid of this.arr){
            //grid = grid.filter(fn);
        //}
    };
    Table.prototype.getArray = function(){
        var result = [];
        for(let cur of this)
            result.push(cur);
        return result;
    };
    Table.prototype.update = function(){
        var tmp = this.getArray();
        this.arr = arrayFactory(this.length);
        for(let cur of tmp)
            this.insert(cur);
    };
            
    return Table;
});

/*******************************************************************************
 * Zombie Constructor
 */
define('zombie',['./constants', './livePoint', './geometry'], function(Constants, LivePoint, Geometry){
    var cWidth = Constants.canvasWidth; // shorter name
    var cHeight = Constants.canvasHeight;
    var xEdgeDist = Math.random()*cWidth/2; // random distance
    var yEdgeDist = Math.random()*cHeight/2;

    function Zombie(speed){
        LivePoint.call(this,
                       Geometry.flipCoin() ? xEdgeDist-cWidth/4 : xEdgeDist+cWidth*3/4,
                       Geometry.flipCoin() ? yEdgeDist-cHeight/4 : yEdgeDist+cHeight*3/4,
                       Constants.zombieHealth, Constants.zombieDamage, 0, 0);
        this.speed    = speed;
        this.found    = false;
        this.path     = [];
        this.counter  = 20;
    }
    Zombie.prototype = Object.create(LivePoint.prototype);
    Zombie.prototype.inBounds = function(){
        return this.inSquare(-cWidth, 2*cWidth, -cHeight, 2*cHeight);
    };
    Zombie.prototype.getBorders = function(){
        return {top: this.y-Constants.zombieSize,
                bottom: this.y+Constants.zombieSize,
                left: this.x-Constants.zombieSize,
                right: this.x+Constants.zombieSize};
    };
    Zombie.prototype.adjustWorld = function(dx, dy){
        this.x += dx;
        this.y += dy;
        for(var i = this.path.length; i--; ){
            this.path[i].x += dx;
            this.path[i].y += dy;
        }
    };
    Zombie.prototype.setDirection = function(){
        if(this.path.length <= 1)
            this.path.push({x:cWidth/2, y:cHeight/2});
        if(this.isNear(this.path[0]) && this.path.length > 1)
            this.path = this.path.splice(1);
        var xcomp = this.path[0].x-this.x;
        var ycomp = this.path[0].y-this.y;
        this.dx = Geometry.normalizeX(xcomp, ycomp, this.speed);
        this.dy = Geometry.normalizeY(xcomp, ycomp, this.speed);
    };
    return Zombie;
});

/*******************************************************************************
 * Priority Queue
 */
define('priorityQueue',[], function(){
    function PriorityQueue() {
        this.data = [];
    }
    PriorityQueue.prototype.push = function(element, priority) {
        priority = +priority;
        for (var i = 0; i < this.data.length && this.data[i][1] > priority; i++);
        this.data.splice(i, 0, [element, priority])
    }
    PriorityQueue.prototype.pop = function() {
        return this.data.pop()[0];
    }

    PriorityQueue.prototype.empty = function() {
        return this.data.length == 0;
    }
    PriorityQueue.prototype.includes = function(element) {
        return this.data.some(function(v){return v[0] == element;});
    }
    PriorityQueue.prototype.remove = function(element) {
        this.data = this.data.filter(function(v){
            return v[0] != element;
        });
    }
    return PriorityQueue;
});

/*******************************************************************************
 * Theta* Search
 */
define('theta',['./geometry', './point', './priorityQueue'], function(Geometry, Point, PriorityQueue){
    return function (start, goal, nodes){
        var open_p = new PriorityQueue();
        var closed = [];
        
        // weighted heuristic
        function h(s, g){
            return g + 1.2*s.distance(goal);
        }
        function setVertex(s){
            if(!nodes.lineOfSight(s, s.p)){
                var mutualNghbrs = nodes.getMutualNeighbors(s, s.p, closed);
                var parent = s.p;
                if (mutualNghbrs.length == 0)
                    console.log('no mutual neighbors');
                else if(mutualNghbrs.length == 1)
                    parent = mutualNghbrs[0];
                else{
                    parent = mutualNghbrs.reduce(function(a, b){
                        if (a.g + s.distance(a) < b.g + s.distance(b))
                            return a;
                        else
                            return b;
                    });}
                s.p = parent;
                s.g = parent.g + s.distance(parent);
            }
        }
        function computeCost(pt1, pt2){
            if(pt1.p.g + pt2.distance(pt1.p) < pt2.g){
                pt2.p = pt1.p;
                pt2.g = pt1.p.g + pt2.distance(pt1.p);
            }
        }
        function updateVertex(pt1, pt2){
            var oldg = pt2.g;
            computeCost(pt1, pt2);
            if( pt2.g < oldg ){
                if(open_p.includes(pt2))
                    open_p.remove(pt2);
                open_p.push(pt2, h(pt2, pt2.g));
            }
        }
        function path(start, end){
            var p_nodes = [];
            while(!start.isNear(end)){
                p_nodes.unshift(new Point(end.x, end.y));
                end = end.p;
            }
            return p_nodes;
        }
        function main(start, goal){
            var cur;
            var nghbrs = [];
            start.g = 0;
            start.p = start;
            start.p.p = start;
            open_p.push(start, h(start, 0));
            while(!open_p.empty()){
                cur = open_p.pop();
                setVertex(cur);
                if(cur.isNear(goal)){
                    return path(start, cur);
                }
                closed.push(cur);
                nghbrs = nodes.getNeighbors(cur);
                for(var i = nghbrs.length; i--; ){
                    if(!closed.includes(nghbrs[i])){
                        if(!open_p.includes(nghbrs[i])){
                            nghbrs[i].g = Infinity;
                            nghbrs[i].p = null;
                        }
                        updateVertex(cur, nghbrs[i]);
                    }
                }
            }
            console.log("no path found");
            return [];
        }
        nodes.push(start);
        nodes.push(goal);
        return main(start, goal);
    };
});

/*******************************************************************************
 * NodeList Object
 */
define('nodeList',['./constants', './point', './Geometry'], function(Constants, Point, Geometry){
    function NodeList(obsMap){
        var pts = obsMap.getCorners();
        this.arr = [];
        this.lines = obsMap.getLines();
        for(var i = pts.length; i--;)
            this.arr.push(pts[i].copy());
    }
    NodeList.prototype.lineOfSight = function(pt1, pt2){
        return !this.lines.some(function(v){
            return Geometry.intersects(pt1, pt2, v.p, v.q);
        });
    };
    NodeList.prototype.hasNeighbors = function(pt){
        if(pt.neighbors)
            return true;
        else return false;
    };
    NodeList.prototype.setNeighbors = function(pt){
        var nlist = this;
        pt.neighbors = this.arr.filter(function(v){
            return nlist.lineOfSight(pt, v) && !pt.equals(v);
        });
    };
    NodeList.prototype.getNeighbors = function(pt){
        if(!this.hasNeighbors(pt))
            this.setNeighbors(pt);
        return pt.neighbors;
    };
    NodeList.prototype.getMutualNeighbors = function(pt1, pt2, closed){
        nghbrs1 = this.getNeighbors(pt1);
        nghbrs2 = this.getNeighbors(pt2);
        return nghbrs1.filter(function(v){
            return nghbrs2.includes(v) && closed.includes(v);
        });
    };
    NodeList.prototype.push = function(pt){
        this.arr.push(pt);
    };
    return NodeList;
});

/*******************************************************************************
 * ZombieList Object
 */
define('zombieList',['./constants', './spacialHash', './zombie', './theta', './point', './nodeList'], function(Constants, SpacialHash, Zombie, Theta, Point, NodeList){
    function ZombieList(){
        this.hash = new SpacialHash();
        this.timer = 0;
        this.killed = 0;
    }
    ZombieList.prototype.getRandomSpeed = function(){
        var speed = Math.random()*Math.log(this.timer/100);
        if(speed < 1)
            speed = 1;
        if(speed > Constants.zombieSpeed)
            speed = Constants.zombieSpeed;
        return speed;
    }
    ZombieList.prototype.add = function(){
        if(Math.random() < Math.log(this.timer)*Constants.spawnRate &&
           this.hash.getSize() < Constants.maxZombies)
            this.hash.insert(new Zombie(this.getRandomSpeed()));
        this.timer++;
    };
    ZombieList.prototype.getPath = function(zombie, nodes){
        return Theta(new Point(zombie.x, zombie.y),
                     new Point(Constants.canvasWidth/2, Constants.canvasHeight/2),
                     nodes);
    };
    ZombieList.prototype.update = function(worldMovement, obsMap){
        var nodes = new NodeList(obsMap);
        for(let cur of this.hash){
            if(cur.path.length < 4 && cur.counter > 20){
                cur.path = this.getPath(cur, nodes);
                cur.counter = 0;
            }
            cur.counter++;
            cur.setDirection(cur);
            cur.adjustWorld(worldMovement.dx, worldMovement.dy);
            cur.move();
            if(cur.dead())
                this.killed++;
        }
    };
    ZombieList.prototype.remove = function(){
        this.hash.filter(function(v){
            return !v.dead() && v.inBounds();
        });
    };
    ZombieList.prototype.updateHash = function(){
        if(this.timer % Constants.hashRefresh == 0)
            this.hash.update();
    };
    ZombieList.prototype.collide = function(pt, rad){
        collidingZombies = this.hash.getCollidingItems(pt, rad)
        for(let cur of collidingZombies){
            cur.hit(pt);
            pt.hit(cur);
        }
    };
    ZombieList.prototype[Symbol.iterator] = function* (){
        for(let cur of this.hash)
            yield cur;
    };
    return ZombieList;
});

/*******************************************************************************
 * Updater
 *  - arrow...: respond to key clicks
 *  - mouseClick: fire bullet
 *  - update/render: update and render the game using specialized objects
 */
define('updater',['./constants', './zombie'], function(Constants, Zombie){
    var bulletRange = Constants.zombieSize + Constants.bulletSize;
    function world(worldMovement, obsMap, keyMap, player){
        worldMovement.move(keyMap, obsMap, player);
    }
    function obstacles(obsMap, worldMovement){
        obsMap.move(worldMovement);
        obsMap.addWall();
    }
    function updateZombies(zombies, worldMovement, obsMap, bullets, player){
        zombies.updateHash();
        zombies.add();
        zombies.update(worldMovement, obsMap);
        zombies.remove();
        for(let b of bullets)
            zombies.collide(b, bulletRange);
        zombies.collide(player, bulletRange);
        return zombies;
    }
    function updateBullets(bullets, obsMap, world){
        bullets.move(world);
        bullets.remove(obsMap);
        return bullets;
    }
    return function(objs){
        document.getElementById("score").innerHTML = "Score: " + objs.score;
        document.getElementById("health").innerHTML = "Health: " + objs.player.health;
        updateZombies(objs.zombies, objs.worldMovement, objs.obsMap, objs.bullets, objs.player);
        updateBullets(objs.bullets, objs.obsMap, objs.worldMovement);
        world(objs.worldMovement, objs.obsMap, objs.keyMap, objs.player);
        obstacles(objs.obsMap, objs.worldMovement);
        objs.shotCounter--;
        objs.score = objs.zombies.killed;

        return !objs.player.dead();
    };
});

/*******************************************************************************
 * Renderer Constructor
 */
define('renderer',['./constants'], function(Constants){
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
        ctx.clearRect(0,0,Constants.canvasWidth,Constants.canvasHeight);
        world(objs.worldMovement);
        zombies(objs.zombies);
        bullets(objs.bullets);
        player(objs.player);
        obstacles(objs.obsMap)
    }
});

/*******************************************************************************
 * Game Object
 *  - arrow...: respond to key clicks
 *  - mouseClick: fire bullet
 *  - update/render: update and render the game using specialized objects
 */
define('game',['./keyMap', './obstacleMap', './world', './player', './bulletList', './zombieList', './updater', './renderer'], function(KeyMap, ObstacleMap, World, Player, BulletList, ZombieList, Updater, Renderer){
    var objs = {
        keyMap: new KeyMap(),
        player: new Player(),
        bullets: new BulletList(),
        zombies: new ZombieList(),
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

/*******************************************************************************
 *                          _   __            _                                 *
 * Zombie Game             / | / /___ __   __(_)___                             *
 * Joseph Navin           /  |/ / __ `/ | / / / __ \                            *
 * July 2016             / /|  / /_/ /| |/ / / / / /                            *
 *                      /_/ |_/\__,_/ |___/_/_/ /_/                             *
 *                                                                              *
 *******************************************************************************/



requirejs.config({
    baseUrl: 'scripts'
});
requirejs(['constants', 'game'], function(Constants, Game){
    function Main(){
        // Test
        // outdated Test();
        
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


define("main", function(){});

