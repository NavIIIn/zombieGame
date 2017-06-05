/*******************************************************************************
 * Functions for math 
 *   - flipCoin: 50% chance of returning true
 *   - normalize: Helper with math for movement components
 *   - distance: returns distance between p1 and p2
 *   - withinRadius:
 *       Returns whether two circles overlap with centers at (x, y) with
 *       combined radius r
 *   - div: Helper for hash value, estimates relative location
 *   - intersects: checks if the line drawn from p1 to q1 intersects with line
 *       drawn from the others
 */
define(['./constants'], function(constants){
    return {
        flipCoin: function(){
            return Math.random()>0.5;
        },
        normalize: function(x, y){
            return y == 0 ? 1 : Math.abs(Math.sqrt(1/(Math.pow(x/y,2)+1))/y);
        },
        distance: function(x1, y1, x2, y2){
            return Math.sqrt(Math.pow(x1-x2,2)+Math.pow(y1-y2,2));
        },
        withinRadius: function(x1, y1, x2, y2, r){
            return Math.sqrt(Math.pow(x1-x2,2)+Math.pow(y1-y2,2)) < r;
        },
        div: function(n){
            return Math.round(n/(constants.zombieSize + constants.bulletSize)/2);
        },
        intersects: function(p1, q1, p2, q2){
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
    }
});
