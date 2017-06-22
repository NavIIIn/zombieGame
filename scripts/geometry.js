/*******************************************************************************
 * Geometry Tools
 *   - flipCoin: 50% chance of returning true
 *   - normalize: Helper with math for movement components
 *   - distance: returns distance between p1 and p2
 */
define([], function(){
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
