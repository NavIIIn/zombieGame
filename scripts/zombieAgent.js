/*******************************************************************************
 * Zombie Agent
 */
define(['./constants', './mathStuff', './point', './theta'], function(Constants, Maths, Point, Theta){
    var px = Constants.canvasWidth/2;
    var py = Constants.canvasHeight/2;
    
    function getDirection(zx, zy, tx, ty){
        // get the direction from (zx, xy) to (tx, ty)
        var xcomp = tx-zx;
        var ycomp = ty-zy;
        return {
            dx: Constants.zombieSpeed*xcomp*Maths.normalize(xcomp, ycomp),
            dy: Constants.zombieSpeed*ycomp*Maths.normalize(xcomp, ycomp)
        };
    }
    return {
        getPath: function(z, corners, lines){
            return Theta(new Point(z.x, z.y), new Point(px, py), corners, lines);
        },
        setDirection: function(z){
            if(z.path.length <= 1)
                z.path.push({x:px, y:py});
            var next_x = z.path[0].x;
            var next_y = z.path[0].y;
            if(Maths.withinRadius(z.x, z.y, next_x, next_y, 4)
               && z.path.length > 1)
            {
                z.path = z.path.splice(1);
                next_x = z.path[0].x;
                next_y = z.path[0].y;
            }
            var direction = getDirection(z.x, z.y, next_x, next_y);
            z.dx = direction.dx;
            z.dy = direction.dy;
        }
    };
}); 
