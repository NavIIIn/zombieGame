/*******************************************************************************
 * Theta* Search
 */
define(['./geometry', './point', './priorityQueue'], function(Geometry, Point, PriorityQueue){
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
