/*******************************************************************************
 * Line object
 */
define(['./constants', './geometry', './point'], function(Constants, Geometry, Point){
    function _line(p, q){
        this.p = p;
        this.q = q;
    }
    function _copy(ln){
        return new _line(Point.copy(ln.p), Point.copy(ln.q));
    }
    function _intersects(l, a, b){
        return Geometry.intersects(a, b, l.p, l.q);
    }
    _line.prototype.adjust = function(dx, dy){
        this.p.adjust(dx, dy);
        this.q.adjust(dx, dy);
    }
    return {
        Line: function(p,q){return new _line(p,q);},
        copy: _copy,
        intersects: _intersects
    };
});
