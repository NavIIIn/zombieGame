/*******************************************************************************
 * Node Constructor
 */
define(['./constants', './point', './Geometry'], function(Constants, Point, Geometry){
    function Node(pt){
        Point.call(this, pt.x, pt.y);
    }
    Node.prototype = Object.create(Point.prototype);
    Node.prototype.getNeighbors = function(){
        return this.neighbors;
    };
});
