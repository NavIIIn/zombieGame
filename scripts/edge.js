/*******************************************************************************
 * Edge Object
 */
define(['./constants', './point', './line', './obstacle'], function(Constants, Point, Line, Obstacle){
    function Edge(pt, dir){
        Point.call(this, pt.x, pt.y, dir);
        this.dir = dir;
        var moveAmt = Constants.nearVal;
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
