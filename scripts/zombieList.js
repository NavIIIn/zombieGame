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
            var z = this.arr[i];
            // agent
            if(this.arr[i].path.length < 2)
                this.arr[i].path = ZombieAgent.getPath(z, inserter.getCorners(), inserter.getLines());
            ZombieAgent.setDirection(this.arr[i]);
            this.arr[i].adjustWorld(worldMovement.dx, worldMovement.dy);
            this.arr[i].move();
            if(this.arr[i].dead())
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
