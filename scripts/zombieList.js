/*******************************************************************************
 * ZombieList Object
 */
define(['./constants', './spacialHash', './zombie', './theta', './point', './nodeList'], function(Constants, SpacialHash, Zombie, Theta, Point, NodeList){
    function ZombieList(){
        this.arr = [];
        this.hash = new SpacialHash();
        this.timer = 0;
    }
    ZombieList.prototype.getRandomSpeed = function(){
        var speed = Math.random()*Math.log(this.timer/100);
        console.log(speed);
        if(speed < 1)
            speed = 1;
        if(speed > Constants.zombieSpeed)
            speed = Constants.zombieSpeed;
        return speed;
    }
    ZombieList.prototype.add = function(){
        if(Math.random() < Math.log(this.timer)*Constants.spawnRate &&
           this.arr.length < Constants.maxZombies)
            this.arr.push(new Zombie(this.getRandomSpeed()));
        this.timer++;
    };
    ZombieList.prototype.getPath = function(zombie, nodes){
        return Theta(new Point(zombie.x, zombie.y),
                     new Point(Constants.canvasWidth/2, Constants.canvasHeight/2),
                     nodes);
    };
    ZombieList.prototype.update = function(worldMovement, obsMap){
        var killed = 0;
        var nodes = new NodeList(obsMap);
        for(var i = this.arr.length; i--;){
            var cur = this.arr[i];
            if(cur.path.length < 4 && cur.counter > 20){
                cur.path = this.getPath(cur, nodes);
                cur.counter = 0;
            }
            cur.counter++;
            cur.setDirection(cur);
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
        if(this.timer % Constants.hashRefresh == 0)
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
