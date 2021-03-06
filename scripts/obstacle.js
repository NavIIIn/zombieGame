/*******************************************************************************
 * Obstacle Object
 *   - getCorners: returns all corners in obstacle
 *   - adjust: moves object in given direction
 *   - copy: copies object
 *   - removeDuplicateEdges: removes edges in common with other obstacle
 *   - collides: returns whether given object is colliding with a line
 *   - getCollisionDirection: returns boolean array of directions a given point
 *       is impacting a line from
 */
define([], function(){
    function Obstacle(lines, edges){
        this.edges = edges;
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
    };
    Obstacle.prototype.collides = function(obj, size){
        return this.lines.reduce(function(acc, cur){
            return acc || cur.collides(obj, size);
        }, false);
    };
    Obstacle.prototype.getCollisionDirection = function(pt, size){
        return {
            right: this.lines.some(function(cur){
                return cur.getCollisionDirection(pt, size).right;
            }),
            left: this.lines.some(function(cur){
                return cur.getCollisionDirection(pt, size).left;
            }),
            top: this.lines.some(function(cur){
                return cur.getCollisionDirection(pt, size).top;
            }),
            bottom: this.lines.some(function(cur){
                return cur.getCollisionDirection(pt, size).bottom;
            })
        };
    };
    return Obstacle;
});
