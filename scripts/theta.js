/*******************************************************************************
 * Theta* Search
 */
define(['./geometry', './point', './priorityQueue'], function(Geometry, Point, PriorityQueue){
    return function (start, goal, nodes, lines){
        var open_p = new PriorityQueue();
        var closed;
        
        // weighted heuristic
        function h(s, g){
            return g + 1.2*s.distance(goal);
        }
        function los(a, b){
            return !lines.some(function(l){
                return Geometry.intersects(a, b, l.p, l.q);
            });
        }
        function neighbor(s){
            var a = new Point(s.x, s.y);
            return nodes.filter(function(b){return los(a, b) && !a.isNear(b);});
        }
        function setVertex(s){
            if(!los(s, s.p)){
                var nghbr = neighbor(s);
                var pNghbr = neighbor(s.p);
                var mutualNghbrs = nghbr.filter(function(a){
                    //return pNghbr.some(function(v){return a.isNear(v);}) &&
                        //closed.some(function(v){return a.isNear(v);});
                    return pNghbr.includes(a) && closed.includes(a);
                });
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
        function computeCost(a, b){
            if(a.p.g + b.distance(a.p) < b.g){
                b.p = a.p;
                b.g = a.p.g + b.distance(a.p);
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
            while(!start.isNear(end)){
                p_nodes.unshift(new Point(end.x, end.y));
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
            start.p.p = start;
            open_p.push(start, h(start, 0));
            while(!open_p.empty()){
                cur = open_p.pop();
                setVertex(cur);
                if(cur.isNear(goal)){
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
