/*******************************************************************************
 * Obstacle Factory
 */
define(['./constants', './point', './line', './edge', './obstacle'], function(Constants, Point, Line, Edge, Obstacle){
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
