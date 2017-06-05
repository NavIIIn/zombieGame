/*******************************************************************************
 * Theta* Search
 */
define(['./mathStuff'], function(Maths){
    return function (start, goal, nodes, lines){
        var open;
        var closed;
        
        function dist(a, b){
            return Math.sqrt(Math.pow(a.x-b.x, 2) + Math.pow(a.y-b.y, 2));
        }
        function h(s, g){
            return g + 1.2*dist(s, goal);
        }
        function insert(arr, s){
            var ind = Math.round(h(s, s.g));
            if (arr[ind] == null)
                arr[ind] = [s];
            else
                arr[ind].push(s);
        }
        function pop(arr){
            return arr.shift().shift();
        }
        function remove(arr, a){
            return arr.filter(function(b){return !equals(a,b)});
        }
        function inArr(arr, a){
            return arr.some(function(s){return equals(a,s);});
        }
        function inOpen(arr, a){
            return arr.some(function(subArr){
                return inArr(subArr, a);
            });
        }
        function equals(a, b){
            return dist(a, b) < 4;
        }
        function los(a, b){
            return !lines.some(function(l){
                return Maths.intersects(a, b, l.p, l.q);
            });
        }
        function neighbor(s){
            var a = {x:s.x, y:s.y};
            return nodes.filter(function(b){return los(a, b) && !equals(a,b);});
        }
        function setVertex(s){
            if(!los(s, s.p)){
                var nghbr = neighbor(s);
                var pNghbr = neighbor(s.p);
                var mutualNghbrs = nghbr.filter(function(a){
                    return inArr(pNghbr, a) && inArr(closed, a);
                });
                var parent = mutualNghbrs.reduce(function(a, b){
                    if (a.g + dist(s, a) < b.g + dist(s, b))
                        return a;
                    else
                        return b;
                });
                s.p = parent;
                s.g = parent.g + dist(s, parent);
            }
        }
        function computeCost(a, b){
            if(a.p.g + dist(a.p, b) < b.g){
                b.p = a.p;
                b.g = a.p.g + dist(a.p, b);
            }
        }
        function updateVertex(a, b){
            var oldg = b.g;
            computeCost(a, b);
            if( b.g < oldg ){
                if( inOpen(open, b) )
                    remove(open, b);
                insert(open, b);
            }
        }
        function path(start, end){
            var p_nodes = [];
            while(!equals(start, end)){
                p_nodes.unshift({x:end.x, y:end.y});
                end = end.p;
            }
            return p_nodes;
        }
        function empty(arr){
            return arr.every(function(v){return v == [] || v == undefined || v == null;});
        }
        function shiftOpen(arr){
            var ind = arr.findIndex(function(v) {return v != undefined && v!= null && v.length > 0});
            var res = arr[ind].shift();
            return res;
        }
        function main(start, goal){
            open = [];
            closed = [];
            var cur;
            var nghbrs = [];
            start.g = 0;
            start.p = start;
            start.g = 0;
            start.p = start;
            open[Math.round(h(start, 0))] = [{x: start.x, y: start.y, p: start, g: 0}];
            while(!empty(open)){
                cur = shiftOpen(open);
                setVertex(cur);
                if(equals(cur, goal)){
                    return path(start, cur);
                }
                closed.push(cur);
                nghbrs = neighbor(cur);
                for(var i = nghbrs.length; i--; ){
                    if(!inArr(closed, nghbrs[i])){
                        if(!inOpen(open, nghbrs[i])){
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
