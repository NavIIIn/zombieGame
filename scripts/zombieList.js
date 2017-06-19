/*******************************************************************************
 * ZombieList Object
 */
define(['./constants', './spacialHash', './zombie', './zombieAgent'], function(Constants, SpacialHash, Zombie, ZombieAgent){
    function ZombieList(){
        this.arr = [];
        this.hash = new SpacialHash();
        this.timer = 0;
    }
    ZombieList.prototype.add = function(){
        if(Math.random() < Math.log(this.timer)*Constants.spawnRate &&
           this.arr.length < Constants.maxZombies)
            this.arr.push(new Zombie());
        this.timer++;
    };
    ZombieList.prototype.update = function(worldMovement, inserter){
        var killed = 0;
        for(var i = this.arr.length; i--;){
            var cur = this.arr[i];
            if(cur.path.length < 4 && cur.counter > 20){
                cur.path = ZombieAgent.getPath(cur, inserter.getCorners(), inserter.getLines());
                cur.counter = 0;
            }
            cur.counter++;
            ZombieAgent.setDirection(cur);
            cur.adjustWorld(worldMovement.dx, worldMovement.dy);
            cur.move();
            if(cur.dead())
                killed++;
        }
        return killed;
    };
    ZombieList.prototype.remove = function(){
        this.arr = this.arr.filter(function(v){
            return !v.dead() && v.inBounds();
        });
    };
    ZombieList.prototype.updateHash = function(){
        this.hash = new SpacialHash(this.arr);
    };
    ZombieList.prototype.collide = function(pt, rad){
        this.hash.getCollidingItems(pt, rad).forEach(function(v){
            v.hit(pt);
            pt.hit(v);
        });
    };
    return ZombieList;
});
