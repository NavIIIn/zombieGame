/*******************************************************************************
 * Zombie Agent
 */
define(['./constants', './geometry', './point', './theta'], function(Constants, Geometry, Point, Theta){
    var px = Constants.canvasWidth/2;
    var py = Constants.canvasHeight/2;
    
    function getDirection(z, t){
        // get the direction from (zx, xy) to (tx, ty)
        var xcomp = t.x-z.x;
        var ycomp = t.y-z.y;
        return {
            dx: Geometry.normalizeX(xcomp, ycomp, Constants.zombieSpeed),
            dy: Geometry.normalizeY(xcomp, ycomp, Constants.zombieSpeed)
        };
    }
    return {
        getPath: function(z, corners, lines){
            return Theta(new Point(z.x, z.y), new Point(px, py), corners, lines);
        },
        setDirection: function(z){
            if(z.path.length <= 1)
                z.path.push({x:px, y:py});
            if(z.isNear(z.path[0]) && z.path.length > 1)
                z.path = z.path.splice(1);
            var direction = getDirection(z, z.path[0]);
            z.dx = direction.dx;
            z.dy = direction.dy;
        }
    };
}); 

