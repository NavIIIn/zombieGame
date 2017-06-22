/*******************************************************************************
 * NodeList Object
 */
define(['./constants', './point', './Geometry'], function(Constants, Point, Geometry){
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
