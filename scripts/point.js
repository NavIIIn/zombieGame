/*******************************************************************************
 * Point object
 */
define(['./constants', './geometry'], function(Constants, Geometry){
    function _point(x, y){
        this.x = x;
        this.y = y;
    }
    function _copy(pt){
        return new _point(pt.x, pt.y);
    }
    function _distance(a, b){
        return Geometry.distance(a.x, a.y, b.x, b.y);
    }
    function _isNear(a, b, rad){
        if(rad)
            return _distance(a, b) < rad;
        else
            return _distance(a, b) < Constants.nearVal;
    }
    function _equals(a, b){
        return a.x == b.x && a.y == b.y;
    }
    _point.prototype.adjust = function(dx, dy){
        this.x += dx;
        this.y += dy;
    }
    // possibly move to some wall object
    function _lineOfSight(a, b, walls){
            return !walls.some(function(w){
                return Geometry.intersects(a, b, w.p, w.q);
            });
    }
    return {
        Point: function(x,y){return new _point(x,y);},
        copy: _copy,
        distance: _distance,
        isNear: _isNear,
        equals: _equals
    };
});
