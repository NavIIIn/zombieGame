/*******************************************************************************
 * Obstacle Object
 */
define([], function(){
    function Obstacle(lines, edges){
        this.edges = edges;
        this.corners = this.getCorners();
        this.lines = lines;
        this.x = 0;
        this.y = 0;
    }
    Obstacle.prototype.getCorners = function(){
        return this.edges.reduce(function(acc, cur){
            return acc.concat(cur.corners);
        }, []);
    };
    Obstacle.prototype.adjust = function(dx, dy){
            for(var i = 0; i < this.lines.length; i++)
                this.lines[i].adjust(dx,dy);
            for(i = 0; i < this.edges.length; i++)
                this.edges[i].adjust(dx,dy);
            this.x += dx;
            this.y += dy;
            return this;
    };
    Obstacle.prototype.copy = function(){
        var newLines = [];
        var newEdges = [];
        this.lines.forEach(function(v, i, arr){
            newLines.push(v.copy());
        });
        this.edges.forEach(function(v, i, arr){
            newEdges.push(v.copy());
        });
        return new Obstacle(newLines, newEdges);
    };
    Obstacle.prototype.removeDuplicateEdges = function(other){
        var dupIndexA;
        var dupIndexB;
        var foundDup = false;
        this.edges.forEach(function(edgeA, indexA, arrA){
            other.edges.forEach(function(edgeB, indexB, arrB){
                if(edgeA.isNear(edgeB)){
                    dupIndexA = indexA;
                    dupIndexB = indexB;
                    foundDup = true;
                }
            });
        });
        if(foundDup){
            this.edges.splice(dupIndexA, 1);
            other.edges.splice(dupIndexB, 1);
        }
        this.corners = this.getCorners();
    };
    Obstacle.prototype.collides = function(obj, size){
        return this.lines.reduce(function(acc, cur){
            return acc || cur.collides(obj, size);
        }, false);
    };
    return Obstacle;
});
