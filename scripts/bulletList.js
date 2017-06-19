/*******************************************************************************
 * BulletList Object
 */
define(['./bullet'], function(Bullet){
    function BulletList(){
        this.arr = [];
        this.shotCounter = 0;
    }
    BulletList.prototype.add = function(x, y){
        this.arr.push(new Bullet(x,  y));
    };
    BulletList.prototype.move = function(world){
        for(var i = this.arr.length; i--;){
            this.arr[i].move();
            this.arr[i].adjustWorld(world.dx, world.dy);
        }
    };
    BulletList.prototype.remove = function(obsMap){
        this.arr = this.arr.filter(function(v){
            return !v.dead() && v.inBounds() &&
                obsMap.lineOfSight(v, v.firePosition);
        });
    };
    BulletList.prototype.each = function(fn){
        this.arr.forEach(fn);
    };
    return BulletList;
});
