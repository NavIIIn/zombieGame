/*******************************************************************************
 * BulletList Object
 *   - add: adds new bullet to list
 *   - move: calculates movement for each bullet
 *   - remove: removes hit and offscreen bullets
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
        for(let b of this.arr){
            b.move();
            b.adjustWorld(world.dx, world.dy);
        }
    };
    BulletList.prototype.remove = function(obsMap){
        this.arr = this.arr.filter(function(v){
            return !v.dead() && v.inBounds() &&
                obsMap.lineOfSight(v, v.firePosition);
        });
    };
    BulletList.prototype[Symbol.iterator] = function* (){
        for(let b of this.arr)
            yield b;
    };
    return BulletList;
});
