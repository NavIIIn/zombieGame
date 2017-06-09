/*******************************************************************************
 * Theta* Search
 */
define(['./mathStuff', './point', './priorityQueue'], function(Maths, Point, PriorityQueue){
    return function (start, goal, nodes, lines){
        var open_p = new PriorityQueue();
        var closed;
        
        // weighted heuristic
        function h(s, g){
            return g + 1.2*Point.distance(s, goal);
        }
        function los(a, b){
            return !lines.some(function(l){
                return Maths.intersects(a, b, l.p, l.q);
            });
        }
        function neighbor(s){
            var a = {x:s.x, y:s.y};
            return nodes.filter(function(b){return los(a, b) && !Point.isNear(a,b);});
        }
        function setVertex(s){
            if(!los(s, s.p)){
                var nghbr = neighbor(s);
                var pNghbr = neighbor(s.p);
                var mutualNghbrs = nghbr.filter(function(a){
                    return pNghbr.includes(a) && closed.includes(a);
                });
                var parent = mutualNghbrs.reduce(function(a, b){
                    if (a.g + Point.distance(s, a) < b.g + Point.distance(s, b))
                        return a;
                    else
                        return b;
                });
                s.p = parent;
                s.g = parent.g + Point.distance(s, parent);
            }
        }
        function computeCost(a, b){
            if(a.p.g + Point.distance(a.p, b) < b.g){
                b.p = a.p;
                b.g = a.p.g + Point.distance(a.p, b);
            }
        }
        function updateVertex(a, b){
            var oldg = b.g;
            computeCost(a, b);
            if( b.g < oldg ){
                if(open_p.includes(b))
                    open_p.remove(b);
                open_p.push(b, h(b, b.g));
            }
        }
        function path(start, end){
            var p_nodes = [];
            while(!Point.isNear(start, end)){
                p_nodes.unshift({x:end.x, y:end.y});
                end = end.p;
            }
            return p_nodes;
        }
        function main(start, goal){
            closed = [];
            var cur;
            var nghbrs = [];
            start.g = 0;
            start.p = start;
            open_p.push(start, h(start, 0));
            while(!open_p.empty()){
                cur = open_p.pop();
                setVertex(cur);
                if(Point.isNear(cur, goal)){
                    return path(start, cur);
                }
                closed.push(cur);
                nghbrs = neighbor(cur);
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
